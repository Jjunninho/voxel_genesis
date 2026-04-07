// js/ui.js - VERSÃO UNIFICADA E ROBUSTA

// ==========================================
// 1. SISTEMA DE STATUS E FERRAMENTAS
// ==========================================

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusEl.className = 'status-message';
        }, 5000);
    }
}

// 🆕 FUNÇÃO PARA LIMPAR TODA A CENA
function clearAll() {
    if (blocks.length === 0) {
        showStatus('⚠️ A cena já está vazia!', 'info');
        return;
    }
    
    const confirmClear = confirm(
        `⚠️ ATENÇÃO!\n\nVocê tem ${blocks.length} bloco(s) na cena.\n\n` +
        `Deseja realmente LIMPAR TUDO?\n\n` +
        `Esta ação NÃO pode ser desfeita!`
    );
    
    if (!confirmClear) {
        showStatus('❌ Operação cancelada', 'info');
        return;
    }
    
    // Limpa todos os blocos da cena
    blocks.forEach(block => {
        if (block && block.mesh && block.mesh.parent) {
            block.mesh.parent.remove(block.mesh);
        }
    });
    
    // Esvazia o array
    blocks.length = 0;
    
    // Limpa o histórico de undo/redo
    if (typeof undoStack !== 'undefined') undoStack.length = 0;
    if (typeof redoStack !== 'undefined') redoStack.length = 0;
    
    // Limpa seleção atual
    if (typeof selectedBlock !== 'undefined') {
        selectedBlock = null;
    }
    
    if (typeof selectedBlocks !== 'undefined') {
        selectedBlocks.length = 0;
    }
    
    if (typeof selectionGroup !== 'undefined' && selectionGroup) {
        selectionGroup.children.length = 0;
    }
    
    // Remove o gizmo se estiver ativo
    if (typeof transformControl !== 'undefined' && transformControl) {
        transformControl.detach();
    }
    
    // Atualiza a UI
    updateJSON();
    
    showStatus('🗑️ Cena limpa com sucesso!', 'success');
    console.log('✅ Todos os blocos foram removidos da cena');
}

function setTool(tool) {
    if (tool === 'clearall') {
        clearAll();
        tool = 'add';
    }
    
    // 🆕 GUARDA A FERRAMENTA ANTERIOR ANTES DE MUDAR
    const previousTool = currentTool;
    
    currentTool = tool;
    
    // Atualiza visual dos botões
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    
    // Se o clique veio de um botão de ferramenta na barra superior
    if (event && event.target && event.target.classList.contains('tool-btn')) {
        event.target.classList.add('active');
    } 
    // Se veio do botão do Eyedropper na barra lateral
    else if (tool === 'eyedropper') {
        const eyeBtn = document.getElementById('eyedropperBtn');
        if (eyeBtn) eyeBtn.classList.add('active');
    }

    if (typeof onToolChange === 'function') {
        onToolChange(tool);
    }
	
    // 🔍 Detecta o bloco ativo (pode estar em selectedBlock ou selectedBlocks[0])
    let activeBlock = null;
    if (typeof selectedBlock !== 'undefined' && selectedBlock !== null) {
        activeBlock = selectedBlock;
    } else if (typeof selectedBlocks !== 'undefined' && selectedBlocks.length > 0) {
        activeBlock = selectedBlocks[0]; 
    }
    
    // 🔍 DEBUG: Log para identificar o estado da transição
    console.log('🔍 DEBUG setTool:', {
        tool: tool,
        previousTool: previousTool,
        activeBlock: activeBlock,
        willClone: (tool === 'add' && previousTool === 'select' && activeBlock !== null)
    });
    
// 🔥 CORREÇÃO DEFINITIVA PARA ui.js - Função setTool
// Substitua o bloco de clonagem (linhas ~123-162) por este código:

    // 🆕 LÓGICA DE CLONAGEM DE FORMA PERSONALIZADA (CORREÇÃO FINAL)
    if (tool === 'add' && previousTool === 'select' && activeBlock) {
        currentBrushShape = activeBlock.type || 'cube';
        
        // 1. Captura a escala REAL e CRUA do bloco
        const s = activeBlock.scale;
        const safeScale = {
            x: s.x || 1,
            y: s.y || 1,
            z: s.z || 1
        };

        // 2. Define a escala customizada
        window.customBrushScale = safeScale;
        
        currentBrushSize = Math.max(safeScale.x, safeScale.y, safeScale.z); 
        currentRotation = activeBlock.rotation ? { ...activeBlock.rotation } : {x:0, y:0, z:0};
        currentColor = activeBlock.color || currentColor;
        
        // 3. ⚠️ NÃO CHAMA selectBrush() AQUI! Ele reseta o customBrushScale!
        //    Em vez disso, atualiza a UI manualmente:
        
        currentBrushShape = activeBlock.type || 'cube';
        
        // Atualiza o visual do pincel atual
        if (typeof BRUSH_DEFINITIONS !== 'undefined' && BRUSH_DEFINITIONS[currentBrushShape]) {
            const brushDef = BRUSH_DEFINITIONS[currentBrushShape];
            const iconEl = document.getElementById('currentBrushIcon');
            const nameEl = document.getElementById('currentBrushName');
            const info = document.getElementById('brushInfo');

            if(iconEl) iconEl.textContent = brushDef.icon;
            if(info) info.textContent = `🖌️ Pincel: ${brushDef.name}`;
            
            // Mostra as dimensões clonadas no nome
            if(nameEl) {
                nameEl.textContent = `${brushDef.name} (${safeScale.x.toFixed(1)}x${safeScale.y.toFixed(1)}x${safeScale.z.toFixed(1)})`;
            }
        }
        
        // Marca o botão do pincel como ativo
        document.querySelectorAll('.brush-option').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-brush="${currentBrushShape}"]`);
        if(activeBtn) activeBtn.classList.add('active');
        
        // Atualiza a cor
        updateCurrentColor(currentColor);
        
        // Remove o preview antigo para forçar recriação
        if (typeof removePreview === 'function') {
            removePreview();
        }
        
        // 🎯 LOG DETALHADO
        console.log('✨ PINCEL CLONADO COM SUCESSO:', {
            forma: currentBrushShape,
            escalaReal: safeScale,
            cor: currentColor,
            customBrushScale: window.customBrushScale
        });
        
        showStatus(`✨ Pincel Clonado: ${currentBrushShape.toUpperCase()} [${safeScale.x.toFixed(1)}x${safeScale.y.toFixed(1)}x${safeScale.z.toFixed(1)}]`, 'success');
    }
}
// ==========================================
// 2. GERENCIAMENTO DE ARQUIVOS (JSON)
// ==========================================

function updateJSON() {
    const projectData = {
        textureRecipe: currentTextureParams,
        customColors: typeof customColors !== 'undefined' ? customColors : [],
        blocks: blocks.map(block => ({
            position: block.position,
            color: block.color,
            type: block.type || 'cube',
            scale: block.scale || 1,
            rotation: block.rotation || {x:0, y:0, z:0}
        }))
    };

    try {
        localStorage.setItem('creator3d_autosave', JSON.stringify(projectData));
    } catch (e) {
        console.warn("Autosave falhou (Quota excedida).", e);
    }

    const jsonPreview = document.getElementById('jsonPreview');
    const blockCount = document.getElementById('blockCount');
    
    if(jsonPreview) jsonPreview.textContent = JSON.stringify(projectData, null, 2);
    if(blockCount) blockCount.textContent = `📦 Blocos: ${blocks.length}`;
}

function downloadJSON() {
    const jsonData = {
        textureRecipe: currentTextureParams,
        customColors: typeof customColors !== 'undefined' ? customColors : [],
        blocks: blocks.map(block => ({
            position: block.position,
            color: block.color,
            type: block.type || 'cube',
            scale: block.scale || 1,
            rotation: block.rotation || {x:0, y:0, z:0}
        }))
    };

    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `projeto-creator-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// ========================================================
// 📂 SMART LOADER (Carrega Projetos E Texturas no mesmo botão)
// ========================================================
function loadJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const jsonText = e.target.result;
            const jsonData = JSON.parse(jsonText);
            
            // CASO 1: É um PROJETO COMPLETO (Tem blocos)
            if (jsonData.blocks && Array.isArray(jsonData.blocks)) {
                console.log("📂 Detectado: Arquivo de Projeto");
                loadProjectData(jsonData);
            } 
            
            // CASO 2: É uma TEXTURA ISOLADA ou RECEITA
            else if (jsonData.parameters || jsonData.colors || jsonData.textureRecipe) {
                console.log("🎨 Detectado: Arquivo de Textura");
                
                const confirmImport = confirm("Este arquivo parece ser uma Textura. Deseja importá-la para sua Biblioteca?");
                
                if (confirmImport && typeof FileSystem !== 'undefined') {
                    const folder = FileSystem.getFolderById(FileSystem.currentFolderId);
                    folder.children.push({
                        id: 'file_' + Date.now(),
                        name: file.name.replace('.json', ''),
                        type: 'file',
                        content: jsonData
                    });
                    FileSystem.saveToStorage();
                    FileSystem.render();
                    showStatus('✅ Textura salva na biblioteca!', 'success');
                } else {
                    // Aplica imediatamente
                    applyTexture(jsonData);
                    showStatus('🎨 Textura aplicada!', 'info');
                }
            } 
            else {
                throw new Error('Formato desconhecido.');
            }
            
        } catch (error) {
            console.error(error);
            showStatus(`❌ Erro: ${error.message}`, 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; 
}

// Helper para carregar projeto
function loadProjectData(jsonData) {
    clearScene();
    
    // 1. Coleta TODAS as cores únicas presentes nos blocos do JSON
    if (jsonData.blocks) {
        jsonData.blocks.forEach(b => {
            if (b.color && !customColors.includes(b.color.toLowerCase())) {
                customColors.push(b.color.toLowerCase());
            }
        });
    }

    // Restaura Textura e Cores
    if (jsonData.textureRecipe) {
        applyTexture(jsonData.textureRecipe); // Usa a função helper unificada
        
        // Restaura cores salvas extras se houver
        if (jsonData.customColors && Array.isArray(jsonData.customColors)) {
            jsonData.customColors.forEach(c => {
                if(!customColors.includes(c)) customColors.push(c);
            });
            initColorPalette();
        }
        
        showStatus('🎨 Textura restaurada!', 'success');
    } else {
        currentTextureParams = null;
    }
    
    // Restaura Blocos
    let loadedCount = 0;
    const DEG2RAD = Math.PI / 180;

    jsonData.blocks.forEach(block => {
        if (block.position && block.color) {
            let rotX = 0, rotY = 0, rotZ = 0;
            if (block.rotation) {
                const isDegrees = Math.abs(block.rotation.x) > 7 || Math.abs(block.rotation.y) > 7 || Math.abs(block.rotation.z) > 7;
                rotX = isDegrees ? block.rotation.x * DEG2RAD : block.rotation.x;
                rotY = isDegrees ? block.rotation.y * DEG2RAD : block.rotation.y;
                rotZ = isDegrees ? block.rotation.z * DEG2RAD : block.rotation.z;
            }

            addBlockAt(
                block.position.x, block.position.y, block.position.z,
                block.color,
                block.type || 'cube',
                block.scale || 1,
                { x: rotX, y: rotY, z: rotZ }
            );
            loadedCount++;
        }
    });
    
    updateJSON();
    showStatus(`✅ Projeto carregado! ${loadedCount} blocos.`, 'success');
}

// ==========================================
// 3. SISTEMA DE CORES E TEXTURAS
// ==========================================

function initColorPalette() {
    const paletteContainer = document.getElementById('colorPalette');
    if (!paletteContainer) return;
    
    paletteContainer.innerHTML = ''; 

    const defaults = (typeof DEFAULT_PALETTE !== 'undefined') ? DEFAULT_PALETTE : ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ffffff'];
    const allColors = [...defaults, ...customColors];

    // Remove duplicatas
    const uniqueColors = [...new Set(allColors)];

    uniqueColors.forEach(color => {
        createColorButton(color, paletteContainer);
    });
}

function createColorButton(color, container) {
    const btn = document.createElement('div');
    btn.className = 'color-option';
    btn.style.backgroundColor = color;
    btn.dataset.color = color; 
    
    if (color && currentColor && color.toLowerCase() === currentColor.toLowerCase()) {
        btn.classList.add('active');
    }

    btn.onclick = (e) => {
        e.stopPropagation(); 
        // 🔥 CORREÇÃO 1: Passamos 'true' aqui para forçar a limpeza da textura
        updateCurrentColor(color, true); 
    };

    container.appendChild(btn);
}

function updateCurrentColor(hexColor, resetTexture = false) {
    if(!hexColor) return;
    
    const normalizedColor = hexColor.toLowerCase();
    currentColor = normalizedColor;

    // 🔥 LÓGICA NOVA: Se foi um clique explícito na paleta, mata a textura
    if (resetTexture) {
        currentTextureParams = null;
        console.log("🧼 Textura removida pelo usuário (Modo Cor Sólida)");
        showStatus('🎨 Modo Cor Sólida ativado', 'info');
    }
    
    // 1. Atualiza o texto visual do Hex
    const hexDisplay = document.getElementById('hexDisplay');
    if(hexDisplay) hexDisplay.textContent = normalizedColor.toUpperCase();

    // 2. Sincroniza o Input Color nativo
    const picker = document.getElementById('colorPicker');
    if(picker) picker.value = normalizedColor;

    // 3. Atualiza o destaque visual na paleta
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('active');
        const btnColor = btn.dataset.color ? btn.dataset.color.toLowerCase() : "";
        if (btnColor === normalizedColor) {
            btn.classList.add('active');
        }
    });
    
    // Atualiza preview se existir
    if (typeof previewMesh !== 'undefined' && previewMesh) {
         previewMesh.material.color.set(currentColor);
         // Se removemos a textura, garantimos que o preview mostre isso (se ele suportar material update)
    }

    console.log("🎨 Cor selecionada:", currentColor); 
}

function saveCurrentColor() {
    if (!customColors.includes(currentColor)) {
        customColors.push(currentColor);
        initColorPalette(); // Recria a paleta para garantir ordem
        showStatus(`💾 Cor ${currentColor} salva!`, 'success');
    } else {
        showStatus('⚠️ Cor já existe na paleta', 'info');
    }
}

// ==========================================
// 🔥 FUNÇÃO DE IMPORTAR TEXTURA (CORRIGIDA)
// ==========================================
function importTextureJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let textureData = JSON.parse(e.target.result);
            
            // 🔥 CORREÇÃO: Verifica se é um PROJETO e extrai a textura dele
            if (textureData.textureRecipe) {
                console.log("Detectado arquivo de Projeto. Extraindo receita de textura...");
                textureData = textureData.textureRecipe;
            }

            if (!textureData.colors || !Array.isArray(textureData.colors)) {
                throw new Error("JSON inválido: Não é uma textura válida (falta 'colors').");
            }

            // Aplica a textura usando a função unificada
            applyTexture(textureData);
            
            showStatus(`✅ Textura importada com sucesso!`, 'success');

        } catch (error) {
            console.error(error);
            showStatus(`❌ Erro: ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Função Helper para Aplicar Textura (Usada pelo Import e Pelo Load)
function applyTexture(textureData) {
    currentTextureParams = textureData; // Salva globalmente

    if (textureData.colors) {
        // Adiciona as cores da textura às cores customizadas
        textureData.colors.forEach(rgbString => {
            const hex = rgbToHex(rgbString);
            if (hex && !customColors.includes(hex)) {
                customColors.push(hex);
            }
        });
        
        initColorPalette();
        
        // Seleciona a primeira cor da textura
        if (textureData.colors.length > 0) {
            const firstColor = rgbToHex(textureData.colors[0]);
            updateCurrentColor(firstColor);
            const picker = document.getElementById('colorPicker');
            if(picker) picker.value = firstColor;
        }
    }
}

function rgbToHex(rgbStr) {
    if (!rgbStr) return null;
    if (rgbStr.startsWith('#')) return rgbStr;
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return null;
    const r = parseInt(match[0]);
    const g = parseInt(match[1]);
    const b = parseInt(match[2]);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ==========================================
// 4. MENUS (BRUSH E SHAPES)
// ==========================================

// 🆕 FUNÇÃO QUE ESTAVA FALTANDO: Atualiza o display do tamanho do pincel
function updateBrushSizeUI() {
    const sizeDisplay = document.getElementById('brushSize');
    if (sizeDisplay) {
        sizeDisplay.textContent = `📏 Tamanho: ${currentBrushSize.toFixed(1)}x`;
    }
    
    // Atualiza o preview se estiver visível
    if (typeof previewMesh !== 'undefined' && previewMesh) {
        previewMesh.scale.set(currentBrushSize, currentBrushSize, currentBrushSize);
    }
}

function toggleBrushMenu() {
    const menu = document.getElementById('brushMenu');
    if(menu) menu.classList.toggle('active');
}

function selectBrush(brushType) {
	// 🔥 RESET DE ESCALA CUSTOMIZADA
    // Se o usuário selecionou um pincel novo na mão, paramos de usar a escala do bloco clonado
    window.customBrushScale = null;
    currentBrushShape = brushType;
    
    if (typeof BRUSH_DEFINITIONS !== 'undefined' && BRUSH_DEFINITIONS[brushType]) {
        const brushDef = BRUSH_DEFINITIONS[brushType];
        const iconEl = document.getElementById('currentBrushIcon');
        const nameEl = document.getElementById('currentBrushName');
        const info = document.getElementById('brushInfo');

        if(iconEl) iconEl.textContent = brushDef.icon;
        if(nameEl) nameEl.textContent = brushDef.name;
        if(info) info.textContent = `🖌️ Pincel: ${brushDef.name}`;
    }
    
    document.querySelectorAll('.brush-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-brush="${brushType}"]`);
    if(activeBtn) activeBtn.classList.add('active');
    
    const menu = document.getElementById('brushMenu');
    if(menu) menu.classList.remove('active');
    
    showStatus(`Pincel: ${brushType}`, 'info');
}

document.addEventListener('click', (e) => {
    const brushSelector = document.querySelector('.brush-selector');
    const menu = document.getElementById('brushMenu');
    if (brushSelector && menu && !brushSelector.contains(e.target)) {
        menu.classList.remove('active');
    }
});

function openShapeModal(shapeType) {
    if (typeof ShapeRegistry === 'undefined' || !ShapeRegistry[shapeType]) return;

    const shape = ShapeRegistry[shapeType];
    currentShape = shapeType;
    currentParams = {};

    const modal = document.getElementById('paramsModal');
    if(!modal) return;

    const title = document.getElementById('modalTitle');
    const paramsContainer = document.getElementById('modalParams');

    if(title) title.textContent = `${shape.icon} ${shape.name}`;
    if(paramsContainer) {
        paramsContainer.innerHTML = '';
        shape.params.forEach(param => {
            currentParams[param.name] = param.default;

            const div = document.createElement('div');
            div.className = 'param-input';
            div.innerHTML = `
                <label>${param.label}:</label>
                <input 
                    type="number" 
                    id="param_${param.name}" 
                    value="${param.default}" 
                    min="${param.min}" 
                    max="${param.max}"
                    onchange="updateParam('${param.name}', this.value)"
                />
            `;
            paramsContainer.appendChild(div);
        });
    }

    modal.classList.add('active');
}

function closeShapeModal() {
    const modal = document.getElementById('paramsModal');
    if(modal) modal.classList.remove('active');
    currentShape = null;
    currentParams = {};
}

function updateParam(paramName, value) {
    currentParams[paramName] = parseInt(value);
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('paramsModal');
    if (e.target === modal) {
        closeShapeModal();
    }
});

// ==========================================
// 5. ROTAÇÃO E UNDO
// ==========================================

function rotateBrush(axis, angleDegrees) {
    const radians = angleDegrees * (Math.PI / 180);
    const TWO_PI = Math.PI * 2;

    currentRotation[axis] = (currentRotation[axis] + radians) % TWO_PI;
    
    if (typeof previewMesh !== 'undefined' && previewMesh) {
        previewMesh.rotation[axis] = currentRotation[axis];
    }
    
    const totalDeg = Math.round(currentRotation[axis] * (180/Math.PI));
    showStatus(`🔄 Eixo ${axis.toUpperCase()}: ${totalDeg}°`, 'info');
}

function resetRotation() {
    currentRotation = { x: 0, y: 0, z: 0 };
    if (typeof previewMesh !== 'undefined' && previewMesh) {
        previewMesh.rotation.set(0, 0, 0);
    }
    showStatus('🔄 Rotação resetada', 'info');
}

// ==========================================
// 6. TOGGLE DE SEÇÃO (Interface)
// ==========================================
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const toggleId = sectionId.replace('Section', 'Toggle');
    const toggle = document.getElementById(toggleId);
    
    if (section.classList.contains('expanded')) {
        section.classList.remove('expanded');
        if (toggle) toggle.textContent = '▶';
    } else {
        section.classList.add('expanded');
        if (toggle) toggle.textContent = '▼';
    }
}

// ==========================================
// 7. EXPORTAÇÃO OBJ
// ==========================================
function exportToOBJ() {
    if (blocks.length === 0) {
        showStatus('⚠️ Nada para exportar.', 'error');
        return;
    }

    showStatus('⏳ Gerando OBJ...', 'info');

    const exporter = new THREE.OBJExporter();
    const exportGroup = new THREE.Group();

    blocks.forEach(block => {
        const meshClone = block.mesh.clone();
        meshClone.children = []; // Remove wireframes/helpers
        meshClone.position.copy(block.mesh.position);
        meshClone.rotation.copy(block.mesh.rotation);
        meshClone.scale.copy(block.mesh.scale);
        meshClone.updateMatrix();
        exportGroup.add(meshClone);
    });

    const result = exporter.parse(exportGroup);
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.style.display = 'none';
    link.href = url;
    link.download = `VoxelGenesis_Export_${Date.now()}.obj`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showStatus('✅ Exportação OBJ concluída!', 'success');
}

// ==========================================
// 8. INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initColorPalette();
    // ❌ REMOVIDO: Autosave carrega ANTES da scene existir!
    // Agora é chamado pelo scene.js após init()
});

// 🆕 FUNÇÃO PARA RESTAURAR SESSÃO (chamada após init())
function restoreSession() {
    const saved = localStorage.getItem('creator3d_autosave');
    if (saved) {
        console.log("🔄 Recuperando Autosave...");
        try {
            const data = JSON.parse(saved);
            
            // Verifica se a scene existe antes de carregar
            if (typeof scene === 'undefined' || !scene) {
                console.warn("⚠️ Scene não existe ainda. Autosave cancelado.");
                return;
            }
            
            loadProjectData(data);
            console.log("✅ Autosave restaurado com sucesso!");
        } catch(e) { 
            console.error("❌ Erro ao carregar autosave:", e); 
            // Remove autosave corrompido
            localStorage.removeItem('creator3d_autosave');
        }
    }
}