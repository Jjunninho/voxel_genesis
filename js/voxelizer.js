// js/voxelizer.js - IMPORTADOR OBJ → VOXELS (VERSÃO SÓLIDA)
// Algoritmo: Even-Odd Rule (Par/Ímpar) para preenchimento volumétrico

const Voxelizer = {
    resolution: 0.3,       // Tamanho do voxel (deve coincidir com o grid)
    _cancelRequested: false, // Flag de cancelamento

    // ─────────────────────────────────────────────────────────
    // HELPERS DO MODAL
    // ─────────────────────────────────────────────────────────
    _showModal: function(fileName) {
        const modal = document.getElementById('objProgressModal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('objModalFileName').textContent = fileName || '—';
            document.getElementById('objModalPhase').textContent = '⏳ Lendo arquivo...';
            document.getElementById('objProgressBar').style.width = '0%';
            document.getElementById('objModalPercent').textContent = '0%';
            document.getElementById('objModalCount').textContent = '0 / 0 pontos';
            document.getElementById('objSafetyWarning').style.display = 'none';
        }
    },

    _hideModal: function() {
        const modal = document.getElementById('objProgressModal');
        if (modal) modal.style.display = 'none';
    },

    _setPhase: function(text) {
        const el = document.getElementById('objModalPhase');
        if (el) el.textContent = text;
    },

    _setProgress: function(current, total) {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        const bar = document.getElementById('objProgressBar');
        const pctEl = document.getElementById('objModalPercent');
        const countEl = document.getElementById('objModalCount');
        if (bar) bar.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';
        if (countEl) countEl.textContent = `${current.toLocaleString('pt-BR')} / ${total.toLocaleString('pt-BR')} pontos`;
    },

    _showSafetyWarning: function(totalPoints) {
        const el = document.getElementById('objSafetyWarning');
        const txt = document.getElementById('objSafetyText');
        if (el && txt) {
            txt.textContent = `Este modelo vai gerar aproximadamente ${totalPoints.toLocaleString('pt-BR')} pontos para testar. O processamento pode ser lento. Aguarde ou cancele.`;
            el.style.display = 'block';
        }
    },

    // ─────────────────────────────────────────────────────────
    // CANCELAMENTO
    // ─────────────────────────────────────────────────────────
    cancelImport: function() {
        this._cancelRequested = true;
        this._setPhase('⛔ Cancelando...');
    },

    // ─────────────────────────────────────────────────────────
    // ETAPA 1: LEITURA DO ARQUIVO
    // ─────────────────────────────────────────────────────────
    importOBJ: function(file) {
        if (!file) return;

        this._cancelRequested = false;
        this._showModal(file.name);
        showStatus('⏳ Carregando modelo 3D...', 'info');

        const reader = new FileReader();
        reader.onload = (e) => {
            if (this._cancelRequested) { this._hideModal(); return; }
            try {
                this._setPhase('🔨 Analisando geometria...');
                const loader = new THREE.OBJLoader();
                const object = loader.parse(e.target.result);
                this.processObject(object);
            } catch (error) {
                console.error('Erro ao carregar OBJ:', error);
                showStatus('❌ Erro: Arquivo OBJ inválido', 'error');
                this._hideModal();
            }
        };
        reader.readAsText(file);
    },

    // ─────────────────────────────────────────────────────────
    // ETAPA 2: PREPARAÇÃO DO OBJETO
    // ─────────────────────────────────────────────────────────
    processObject: function(object) {
        // Normaliza tamanho e posição
        const bbox = new THREE.Box3().setFromObject(object);
        const size = bbox.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 15 / maxDim;
        object.scale.setScalar(scaleFactor);
        object.updateMatrixWorld(true);

        // Força materiais Double-Sided (essencial para raycasting)
        object.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.side = THREE.DoubleSide;
            }
        });

        // Recalcula bounding box após escala
        const finalBox = new THREE.Box3().setFromObject(object);
        const step = this.resolution;

        // Estima total de pontos antes de gerar
        const nx = Math.ceil((finalBox.max.x - finalBox.min.x) / step);
        const ny = Math.ceil((finalBox.max.y - finalBox.min.y) / step);
        const nz = Math.ceil((finalBox.max.z - finalBox.min.z) / step);
        const estimatedTotal = nx * ny * nz;

        // ── Aviso de segurança ──────────────────────────────
        const LIMIT_WARNING = 50000;
        if (estimatedTotal > LIMIT_WARNING) {
            this._showSafetyWarning(estimatedTotal);
        }

        this._setPhase('📐 Gerando grade de pontos...');

        // Gera a grade de forma assíncrona (em lotes) para não congelar
        this._buildGridAsync(finalBox, step, estimatedTotal, object);
    },

    // ─────────────────────────────────────────────────────────
    // ETAPA 3: GERAÇÃO DA GRADE (ASSÍNCRONA)
    // Antes era um loop síncrono — agora roda em batches via rAF
    // ─────────────────────────────────────────────────────────
    _buildGridAsync: function(box, step, estimatedTotal, object) {
        const points = [];
        const self = this;

        // Pré-calcula todos os valores X (os mais externos)
        const xs = [];
        for (let x = box.min.x; x <= box.max.x; x += step) xs.push(x);

        const zs = [];
        for (let z = box.min.z; z <= box.max.z; z += step) zs.push(z);

        let xi = 0; // índice na lista de X
        const BUILD_BATCH = 5; // quantas fatias X por frame

        const buildChunk = () => {
            if (self._cancelRequested) {
                self._hideModal();
                showStatus('⛔ Importação cancelada.', 'info');
                return;
            }

            const xEnd = Math.min(xi + BUILD_BATCH, xs.length);
            for (let i = xi; i < xEnd; i++) {
                const x = xs[i];
                for (let zi = 0; zi < zs.length; zi++) {
                    const z = zs[zi];
                    for (let y = box.min.y; y <= box.max.y; y += step) {
                        points.push({ x, y, z });
                    }
                }
            }
            xi = xEnd;

            // Progresso da fase de grade (usa metade da barra: 0–50%)
            const gridPct = Math.round((xi / xs.length) * 50);
            const bar = document.getElementById('objProgressBar');
            if (bar) bar.style.width = gridPct + '%';
            const pctEl = document.getElementById('objModalPercent');
            if (pctEl) pctEl.textContent = gridPct + '%';
            const countEl = document.getElementById('objModalCount');
            if (countEl) countEl.textContent = `Grade: ${points.length.toLocaleString('pt-BR')} / ~${estimatedTotal.toLocaleString('pt-BR')} pontos`;

            if (xi < xs.length) {
                requestAnimationFrame(buildChunk);
            } else {
                // Grade pronta → inicia voxelização
                self._setPhase(`📊 Voxelizando ${points.length.toLocaleString('pt-BR')} pontos...`);
                self.processBatch(points, object);
            }
        };

        requestAnimationFrame(buildChunk);
    },

    // ─────────────────────────────────────────────────────────
    // ETAPA 4: VOXELIZAÇÃO EM LOTES (ASSÍNCRONA)
    // ─────────────────────────────────────────────────────────
    processBatch: function(points, object) {
        const self = this;
        const blockSet = new Set();
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, 1, 0); // Raio aponta para cima

        let index = 0;
        const batchSize = 1000; // Pontos por frame
        const total = points.length;

        const process = () => {
            if (self._cancelRequested) {
                self._hideModal();
                showStatus('⛔ Importação cancelada.', 'info');
                return;
            }

            const end = Math.min(index + batchSize, total);

            for (let i = index; i < end; i++) {
                const { x, y, z } = points[i];
                const point = new THREE.Vector3(x, y, z);

                // ── EVEN-ODD RULE ───────────────────────────
                raycaster.set(point, direction);
                const intersects = raycaster.intersectObject(object, true);

                if (intersects.length % 2 === 1) {
                    const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
                    if (!blockSet.has(key)) {
                        blockSet.add(key);

                        let color = '#888888';
                        if (intersects[0]?.object?.material?.color) {
                            color = '#' + intersects[0].object.material.color.getHexString();
                        }

                        addBlockAt(x, y, z, color, 'cube', self.resolution);
                    }
                }
            }

            index = end;

            // Progresso da fase de voxelização (usa segunda metade da barra: 50–100%)
            const voxPct = 50 + Math.round((index / total) * 50);
            self._setProgress(index, total);
            const bar = document.getElementById('objProgressBar');
            if (bar) bar.style.width = voxPct + '%';
            self._setPhase(`🔨 Voxelizando: ${voxPct}%`);

            if (index < total) {
                requestAnimationFrame(process);
            } else {
                updateJSON();
                self._hideModal();
                showStatus(`✅ Voxelização concluída! ${blockSet.size} blocos gerados.`, 'success');
            }
        };

        process();
    }
};
