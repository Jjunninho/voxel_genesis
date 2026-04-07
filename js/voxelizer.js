// js/voxelizer.js - IMPORTADOR OBJ → VOXELS (VERSÃO SÓLIDA)
// Algoritmo: Even-Odd Rule (Par/Ímpar) para preenchimento volumétrico

const Voxelizer = {
    resolution: 0.3, // Tamanho do voxel (deve coincidir com o grid)

    /**
     * Carrega arquivo OBJ do input e inicia voxelização
     */
    importOBJ: function(file) {
        if (!file) return;
        
        showStatus('⏳ Carregando modelo 3D...', 'info');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loader = new THREE.OBJLoader();
                const object = loader.parse(e.target.result);
                this.processObject(object);
            } catch (error) {
                console.error('Erro ao carregar OBJ:', error);
                showStatus('❌ Erro: Arquivo OBJ inválido', 'error');
            }
        };
        reader.readAsText(file);
    },

    /**
     * Prepara o objeto 3D e executa voxelização
     */
    processObject: function(object) {
        showStatus('🔨 Analisando geometria...', 'info');
        
        // 1. PREPARAÇÃO: Normaliza tamanho e posição
        const bbox = new THREE.Box3().setFromObject(object);
        const size = bbox.getSize(new THREE.Vector3());
        
        // Escala para caber na cena (máx 15 blocos de altura)
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
        
        // Recalcula bounding box após transformações
        const finalBox = new THREE.Box3().setFromObject(object);
        
        // 2. GRID 3D: Gera lista de pontos a testar
        const points = [];
        const step = this.resolution;
        
        for (let x = finalBox.min.x; x <= finalBox.max.x; x += step) {
            for (let z = finalBox.min.z; z <= finalBox.max.z; z += step) {
                for (let y = finalBox.min.y; y <= finalBox.max.y; y += step) {
                    points.push({ x, y, z });
                }
            }
        }
        
        showStatus(`📊 Processando ${points.length} pontos...`, 'info');
        
        // 3. VOXELIZAÇÃO EM LOTES (não trava o navegador)
        this.processBatch(points, object);
    },

    /**
     * Processa pontos em lotes usando requestAnimationFrame
     */
    processBatch: function(points, object) {
        const blockSet = new Set(); // Evita duplicatas (lookup O(1))
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, 1, 0); // Raio aponta para cima
        
        let index = 0;
        const batchSize = 1000; // Processa 1000 pontos por frame
        
        const process = () => {
            const end = Math.min(index + batchSize, points.length);
            
            // Processa lote atual
            for (let i = index; i < end; i++) {
                const { x, y, z } = points[i];
                const point = new THREE.Vector3(x, y, z);
                
                // 🎯 EVEN-ODD RULE (Regra Par/Ímpar)
                // Lança raio do ponto para cima e conta interseções
                raycaster.set(point, direction);
                const intersects = raycaster.intersectObject(object, true);
                
                // Se número ÍMPAR de interseções = ponto está DENTRO do objeto
                if (intersects.length % 2 === 1) {
                    // Cria chave única para evitar duplicatas
                    const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
                    
                    if (!blockSet.has(key)) {
                        blockSet.add(key);
                        
                        // Tenta extrair cor do material
                        let color = '#888888'; // Cor padrão (cinza)
                        if (intersects[0]?.object?.material?.color) {
                            color = '#' + intersects[0].object.material.color.getHexString();
                        }
                        
                        // Adiciona bloco na cena
                        addBlockAt(x, y, z, color, 'cube', this.resolution);
                    }
                }
            }
            
            index = end;
            const progress = Math.round((index / points.length) * 100);
            
            // Continua processamento ou finaliza
            if (index < points.length) {
                showStatus(`🔨 Voxelizando: ${progress}%`, 'info');
                requestAnimationFrame(process);
            } else {
                updateJSON();
                showStatus(`✅ Voxelização concluída! ${blockSet.size} blocos gerados`, 'success');
            }
        };
        
        // Inicia processamento
        process();
    }
};
