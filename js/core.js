// js/core.js - VERSÃO DEFINITIVA (V9 - Collision & Physics Fix)
// A inicialização da cena (init, animate) está em js/scene.js

// ============================================================
// 1. GERENCIAMENTO DE BLOCOS (CRUD)
// ============================================================

// 🔥 FUNÇÃO CORRIGIDA: addBlockAt
// Cole isso no seu core.js substituindo a função existente

function addBlockAt(x, y, z, color, type = 'cube', scale = 1, rotation = {x:0, y:0, z:0}) {
    const geometry = createGeometry(type);
    
    // 🔥 PRIORIDADE 1: Se existe escala customizada (clonada), ela manda!
    let finalScale = scale;
    if (window.customBrushScale) {
        finalScale = { ...window.customBrushScale };
        // ⚠️ NÃO resetamos aqui para permitir múltiplos cliques
    }

    // Normaliza escala para vetor
    let scaleVec = (typeof finalScale === 'number') 
        ? { x: finalScale, y: finalScale, z: finalScale } 
        : { x: finalScale.x, y: finalScale.y, z: finalScale.z };

    const material = createProceduralMaterial(color, currentTextureParams);
    const mesh = new THREE.Mesh(geometry, material);
	
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, y, z);
    
    mesh.scale.set(scaleVec.x, scaleVec.y, scaleVec.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    
    mesh.updateMatrixWorld(true);
    mesh.geometry.computeBoundingBox();
    
    // Lógica de bordas (evita sobreposição com efeitos especiais)
    const hasSpecialEffect = currentTextureParams && 
                             (currentTextureParams.effects?.includes('crystals') || 
                              currentTextureParams.effects?.includes('glow'));
    
    if (!hasSpecialEffect && ['cube', 'box', 'pyramid', 'prism', 'cylinder'].includes(type)) {
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        mesh.add(line);
    }
    
    scene.add(mesh);
    
    const blockData = { 
        mesh, 
        position: { x, y, z }, 
        color,
        type,
        scale: scaleVec, 
        rotation: { ...rotation }
    };
    
    blocks.push(blockData);

    // Gestão de Histórico
    redoStack = []; 
    undoStack.push(blockData);
    if (undoStack.length > 50) undoStack.shift();

    updateJSON();
}

function removeBlock() {
    const intersects = raycaster.intersectObjects(blocks.map(b => b.mesh));
    
    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const index = blocks.findIndex(b => b.mesh === mesh);
        
        if (index !== -1) {
            scene.remove(mesh);
            blocks.splice(index, 1);
            updateJSON();
            showStatus('Bloco removido', 'info');
        }
    }
}

function removeBlockAt(x, y, z) {
    const index = blocks.findIndex(b => 
        b.position.x === x && b.position.y === y && b.position.z === z
    );
    
    if (index !== -1) {
        scene.remove(blocks[index].mesh);
        blocks.splice(index, 1);
    }
}

function paintBlock() {
    const intersects = raycaster.intersectObjects(blocks.map(b => b.mesh));
    
    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const block = blocks.find(b => b.mesh === mesh);
        
        if (block) {
            block.color = currentColor;
            if (typeof createProceduralMaterial === 'function') {
                const newMaterial = createProceduralMaterial(currentColor, currentTextureParams);
                mesh.material = newMaterial;
            } else {
                mesh.material.color.set(currentColor);
            }
            updateJSON();
            showStatus('🎨 Bloco pintado!', 'success');
        }
    }
}

// js/core.js

function clearScene(keepTexture = false) {
    // Remove todos os meshes da cena do Three.js
    blocks.forEach(block => {
        if (block.mesh) scene.remove(block.mesh);
    });
    
    // Reseta os arrays lógicos
    blocks = [];
    undoStack = [];
    redoStack = [];

    // Desvincula o Gizmo se estiver em uso
    if (typeof transformControl !== 'undefined' && transformControl) {
        transformControl.detach();
    }

    // Limpa o salvamento automático para não restaurar o que foi apagado
    localStorage.removeItem('creator3d_autosave');
    
    // Atualiza a visualização do JSON e status
    updateJSON();
    
    const msg = keepTexture ? '✨ Cena limpa' : '🗑️ Cena resetada';
    if (typeof showStatus === 'function') showStatus(msg, 'info');
}
// ============================================================
// 2. GRID E PRECISÃO (SISTEMA INTELIGENTE)
// ============================================================

function setGridResolution(size) {
    manualGridStep = size === 'auto' ? null : parseFloat(size);
    if (gridHelper) scene.remove(gridHelper);

    const worldSize = 80; // Deve ser igual ao valor do scene.js
    const currentStep = manualGridStep || 1.0;
    const divisions = Math.round(worldSize / currentStep);
    
    gridHelper = new THREE.GridHelper(worldSize, divisions, 0x444444, 0x222222);
    gridHelper.position.y = -0.01; 
    scene.add(gridHelper);
}

function getGridStep(brushSize) {
    const EPSILON = 0.001; 
    let target = brushSize;
    
    // Refina o grid baseado nos blocos existentes
    if (typeof blocks !== 'undefined') {
        blocks.forEach(block => {
            const s = (typeof block.scale === 'number') 
                ? block.scale 
                : Math.min(block.scale.x, block.scale.y, block.scale.z);
            if (s < target) target = s;
        });
    }

    // 🔥 TRAVA DE SEGURANÇA (Evita o "Fantasma" do Grid Manual)
    if (manualGridStep !== null) {
        if (manualGridStep > brushSize) {
            return brushSize / 2; // Ignora manual se for grande demais
        }
        return manualGridStep;
    }
    
    // Lógica Automática (Meio-Passo)
    if (target <= 0.1 + EPSILON) return 0.05;
    if (target <= 0.2 + EPSILON) return 0.1;
    if (target <= 0.5 + EPSILON) return 0.25;
    if (target <= 1.0 + EPSILON) return 0.5;
    
    return 1.0;
}

function snapToGrid(value, step) {
    return Math.round(value / step) * step;
}

// ============================================================
// 3. PREVIEW E COLISÃO (UPDATED)
// ============================================================

// 🔥 FUNÇÃO CORRIGIDA: updatePreview
// Cole isso no seu core.js substituindo a função existente

function updatePreview(event, isDynamic = false) {
    if (isDynamic) return;

    const canvas = document.getElementById('canvas3d');
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const objectsToIntersect = [...blocks.map(b => b.mesh), gridHelper];
    const intersects = raycaster.intersectObjects(objectsToIntersect);
    
    if (intersects.length > 0) {
        const hit = intersects[0];
        const point = hit.point;
        let normal;

        if (hit.object === gridHelper || hit.object.type === 'LineSegments') {
            normal = new THREE.Vector3(0, 1, 0);
        } else {
            if (!hit.face) return; 
            normal = hit.face.normal.clone();
            normal.transformDirection(hit.object.matrixWorld).normalize();
        }

        // 🔥 CORREÇÃO: Usa metade da ESCALA CUSTOMIZADA, não do brushSize
        let halfSize = currentBrushSize / 2;
        if (window.customBrushScale) {
            // Pega a maior dimensão para o offset
            halfSize = Math.max(
                window.customBrushScale.x,
                window.customBrushScale.y,
                window.customBrushScale.z
            ) / 2;
        }
        
        const offset = normal.clone().multiplyScalar(halfSize);
        const targetPos = point.clone().add(offset);

        // Snap
        const gridStep = getGridStep(currentBrushSize);
        previewPosition = {
            x: snapToGrid(targetPos.x, gridStep),
            y: snapToGrid(targetPos.y, gridStep),
            z: snapToGrid(targetPos.z, gridStep)
        };
        
        // Debug Hook
        if (typeof debugUpdatePreview === 'function') {
            debugUpdatePreview(targetPos, new THREE.Vector3(previewPosition.x, previewPosition.y, previewPosition.z), gridStep, currentBrushSize);
        }

        // 🔥 RENDERIZA PREVIEW COM ESCALA CORRETA
        if (!previewMesh || previewMesh.userData.brushType !== currentBrushShape) {
            if (previewMesh) scene.remove(previewMesh);
            const geometry = createGeometry(currentBrushShape);
            const material = new THREE.MeshBasicMaterial({ 
                color: currentColor, 
                transparent: true, opacity: 0.6, wireframe: true 
            });
            previewMesh = new THREE.Mesh(geometry, material);
            previewMesh.userData.brushType = currentBrushShape;
            scene.add(previewMesh);
        }
        
        previewMesh.position.set(previewPosition.x, previewPosition.y, previewPosition.z);
        
        // 🔥 APLICA A ESCALA CLONADA NO PREVIEW!
        if (window.customBrushScale) {
            previewMesh.scale.set(
                window.customBrushScale.x, 
                window.customBrushScale.y, 
                window.customBrushScale.z
            );
        } else {
            previewMesh.scale.set(currentBrushSize, currentBrushSize, currentBrushSize);
        }
        
        previewMesh.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);
        previewMesh.material.color.set(currentColor);
        
        const stepDisplay = document.getElementById('gridStepDisplay');
        if (stepDisplay) stepDisplay.textContent = `🔍 Grid: ${gridStep.toFixed(2)}u`;
        
    } else {
        removePreview();
    }
}

function removePreview() {
    if (previewMesh) {
        scene.remove(previewMesh);
        previewMesh = null;
    }
}

function updateBrushSizeUI() {
    const sizeDisplay = document.getElementById('brushSize');
    if (sizeDisplay) sizeDisplay.textContent = `📏 Tamanho: ${currentBrushSize.toFixed(1)}x`;
}

function onToolChange(tool) {
    if (tool !== 'add') {
        removePreview();
        isObjectSelected = false;
    }
}

// 🔥 BUG SECUNDÁRIO 1 RESOLVIDO: Check Collision Vetorial
function checkCollision(x, y, z, size) {
    // Normaliza size para vetor
    const s = (typeof size === 'number') ? {x:size, y:size, z:size} : size;
    const halfX = s.x / 2;
    const halfY = s.y / 2;
    const halfZ = s.z / 2;

    return blocks.some(block => {
        // Agora verifica Scale como vetor (antes era scale/2 = NaN)
        const bhx = block.scale.x / 2;
        const bhy = block.scale.y / 2;
        const bhz = block.scale.z / 2;
        
        return Math.abs(block.position.x - x) < (halfX + bhx) &&
               Math.abs(block.position.y - y) < (halfY + bhy) &&
               Math.abs(block.position.z - z) < (halfZ + bhz);
    });
}

// ============================================================
// 4. AÇÕES DE EDIÇÃO
// ============================================================

function copySelectedBlock() {
    if (!selectedBlock) return;
    clipboardBlock = {
        type: selectedBlock.type,
        color: selectedBlock.color,
        scale: { ...selectedBlock.scale }, 
        rotation: { ...selectedBlock.rotation }
    };
    showStatus('📋 Bloco copiado!', 'success');
}

function pasteBlock() {
    if (!clipboardBlock) return;
    let x, y, z;
    if (selectedBlock) {
        x = selectedBlock.position.x + 1; y = selectedBlock.position.y; z = selectedBlock.position.z;
    } else if (previewPosition) {
        x = previewPosition.x; y = previewPosition.y; z = previewPosition.z;
    } else {
        x = 0; y = 1; z = 0;
    }
    addBlockAt(x, y, z, clipboardBlock.color, clipboardBlock.type, clipboardBlock.scale, clipboardBlock.rotation);
    showStatus('📋 Bloco colado!', 'success');
}

function scaleSelectedBlock(delta) {
    if (!selectedBlock) return;
    let currentScale = selectedBlock.scale;
    let newScale;
    
    if (typeof currentScale === 'object') {
        newScale = {
            x: Math.max(0.1, currentScale.x + delta),
            y: Math.max(0.1, currentScale.y + delta),
            z: Math.max(0.1, currentScale.z + delta)
        };
        selectedBlock.scale = newScale;
        selectedBlock.mesh.scale.set(newScale.x, newScale.y, newScale.z);
    } else {
        newScale = Math.max(0.1, currentScale + delta);
        selectedBlock.scale = newScale;
        selectedBlock.mesh.scale.set(newScale, newScale, newScale);
    }
    
    // Atualiza Física
    selectedBlock.mesh.updateMatrixWorld(true);
    selectedBlock.mesh.geometry.computeBoundingBox();
    
    if (transformControl && transformControl.object === selectedBlock.mesh) {
        transformControl.detach();
        transformControl.attach(selectedBlock.mesh);
    }
    updateJSON();
    showStatus('📏 Escala atualizada', 'info');
}

function rotateSelectedBlock(axis, angleDeg) {
    if (!selectedBlock) return;
    const angleRad = angleDeg * (Math.PI / 180);
    const TWO_PI = Math.PI * 2;
    
    selectedBlock.rotation[axis] = (selectedBlock.rotation[axis] + angleRad) % TWO_PI;
    selectedBlock.mesh.rotation[axis] = selectedBlock.rotation[axis];
    
    if (transformControl) transformControl.update();
    updateJSON();
}

function undoLastBlock() {
    if (undoStack.length === 0) return;
    const lastBlock = undoStack.pop();
    scene.remove(lastBlock.mesh);
    const index = blocks.indexOf(lastBlock);
    if (index > -1) blocks.splice(index, 1);
    redoStack.push(lastBlock);
    updateJSON();
}

function redoLastAction() {
    if (redoStack.length === 0) return;
    const blockToRestore = redoStack.pop();
    scene.add(blockToRestore.mesh);
    blocks.push(blockToRestore);
    undoStack.push(blockToRestore);
    updateJSON();
}

function deleteSelectedBlock() {
    if (typeof selectedBlocks !== 'undefined' && selectedBlocks.length > 0) {
        if (transformControl) transformControl.detach();
        if (typeof selectionGroup !== 'undefined' && selectionGroup) {
            scene.remove(selectionGroup);
            selectionGroup = null;
        }
        selectedBlocks.forEach(block => {
            scene.remove(block.mesh);
            const index = blocks.indexOf(block);
            if (index > -1) blocks.splice(index, 1);
        });
        selectedBlocks = [];
        selectedBlock = null;
        updateJSON();
        showStatus('🗑️ Blocos deletados!', 'success');
        if (typeof deselectAll === 'function') deselectAll();
    } else if (selectedBlock) {
        if (transformControl) transformControl.detach();
        scene.remove(selectedBlock.mesh);
        const index = blocks.indexOf(selectedBlock);
        if (index > -1) blocks.splice(index, 1);
        selectedBlock = null;
        updateJSON();
        showStatus('🗑️ Bloco deletado!', 'success');
    }
}