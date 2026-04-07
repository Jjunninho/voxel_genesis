// js/interaction.js - VERSÃO CORRIGIDA (CLONAGEM FUNCIONANDO!)

function onCanvasClick(event) {
    if (isDragging || isDynamicDrawing) return;

    const canvas = document.getElementById('canvas3d');
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (currentTool === 'add') {
        if (previewMesh) {
             // 🔥 CORREÇÃO CRÍTICA: USA A ESCALA CLONADA SE EXISTIR!
             const scaleToUse = window.customBrushScale || currentBrushSize;
             
             console.log('🖱️ CLIQUE! Adicionando bloco com:', {
                 type: currentBrushShape,
                 scale: scaleToUse,
                 isCustomScale: !!window.customBrushScale
             });
             
             addBlockAt(previewPosition.x, previewPosition.y, previewPosition.z, currentColor, currentBrushShape, scaleToUse, currentRotation);
             updateJSON();
        }
    } 
    else if (currentTool === 'remove') {
        removeBlock();
    } 
    else if (currentTool === 'paint') {
        paintBlock();
    }
    else if (currentTool === 'select') {
        const intersects = raycaster.intersectObjects(blocks.map(b => b.mesh));
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const block = blocks.find(b => b.mesh === mesh);
            if (block) {
                if (event.ctrlKey) {
                    if (typeof toggleSelection === 'function') toggleSelection(block);
                } else {
                    if (selectedBlocks.length === 1 && selectedBlocks[0] === block) return;
                    if (typeof deselectAll === 'function') deselectAll();
                    if (typeof toggleSelection === 'function') toggleSelection(block);
                }
            }
        } else {
            if (typeof deselectAll === 'function') deselectAll();
        }
    } 
    else if (currentTool === 'eyedropper') {
        const intersects = raycaster.intersectObjects(blocks.map(b => b.mesh));
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const block = blocks.find(b => b.mesh === mesh);
            if (block && block.color) {
                updateCurrentColor(block.color);
                showStatus(`🎨 Cor capturada: ${block.color.toUpperCase()}`, 'success');
                setTool('add'); 
            }
        } else {
            showStatus('⚠️ Clique em um bloco para capturar a cor', 'info');
        }
    }
} 
	
function onMouseDown(event) {
    if (event.target.id !== 'canvas3d') return;

    if (event.shiftKey && event.button === 0 && currentTool === 'add') {
        const canvas = document.getElementById('canvas3d');
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(gridHelper); 
        
        if (intersects.length > 0) {
            isDynamicDrawing = true;
            drawStartPos.copy(intersects[0].point); 
            showStatus('📏 Arraste para ajustar tamanho...', 'info');
            controls.enabled = false; 
        }
    }
}

function onMouseMove(event) {
    if (event.target.id !== 'canvas3d') return;

    if (isDynamicDrawing) {
        const canvas = document.getElementById('canvas3d');
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(gridHelper);
        
        if (intersects.length > 0) {
            const currentPos = intersects[0].point;
            const deltaX = currentPos.x - drawStartPos.x;
            const deltaZ = currentPos.z - drawStartPos.z;
            const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
            
            dynamicScale = Math.max(0.5, distance);
            dynamicRotation = -Math.atan2(deltaZ, deltaX);
            
            if (previewMesh) {
                previewMesh.position.set(drawStartPos.x, drawStartPos.y + (dynamicScale/2), drawStartPos.z);
                previewMesh.scale.set(dynamicScale, dynamicScale, dynamicScale);
                previewMesh.rotation.set(currentRotation.x, dynamicRotation, currentRotation.z);
            }
        }
        return;
    }

    if (currentTool === 'add' && !isDragging) {
        if (typeof updatePreview === 'function') updatePreview(event);
    }
}

function onMouseUp(event) {
    if (isDynamicDrawing) {
        isDynamicDrawing = false;
        dynamicScale = 1;
        dynamicRotation = 0;
        controls.enabled = true; 
        showStatus('✅ Bloco criado!', 'success');
    }
    isDragging = false;
}

function onKeyPress(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) return;

    const key = event.key.toLowerCase();

    if (event.key === 'Escape') {
        if (typeof removePreview === 'function') removePreview();
        if (typeof deselectBlock === 'function') deselectBlock(); 
        isDynamicDrawing = false;
        controls.enabled = true;
        showStatus('Seleção cancelada', 'info');
        return;
    }
    
    if (event.ctrlKey && key === 'z') {
        event.preventDefault();
        if (typeof undoLastBlock === 'function') undoLastBlock();
        return;
    }
	
    if ((event.ctrlKey && key === 'y') || (event.ctrlKey && event.shiftKey && key === 'z')) {
        event.preventDefault();
        if (typeof redoLastAction === 'function') redoLastAction();
        return;
    }
    
    if (event.ctrlKey && key === 'c') {
        event.preventDefault();
        if (typeof copySelectedBlock === 'function') copySelectedBlock();
        return;
    }
    
    if (event.ctrlKey && key === 'v') {
        event.preventDefault();
        if (typeof pasteBlock === 'function') pasteBlock();
        return;
    }
    
    if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (typeof deleteSelectedBlock === 'function') deleteSelectedBlock();
        return;
    }
    
    if (key === 'r') {
        event.preventDefault();
        if (selectedBlock) rotateSelectedBlock('y', 45);
        else rotateBrush('y', 90);
    }
    if (key === 't') {
        event.preventDefault();
        if (selectedBlock) rotateSelectedBlock('x', 45);
        else rotateBrush('x', 90);
    }
    if (key === 'q') {
        event.preventDefault();
        if (selectedBlock) rotateSelectedBlock('z', 45);
        else rotateBrush('z', 90);
    }

	if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        if (selectedBlock) {
            scaleSelectedBlock(0.1);
        } else {
            const step = currentBrushSize < 1.0 ? 0.1 : 0.5;
            currentBrushSize = Math.round((currentBrushSize + step) * 10) / 10;
            updateBrushSizeUI();
            if(previewMesh) previewMesh.scale.set(currentBrushSize, currentBrushSize, currentBrushSize);
        }
    }
	
	if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        if (selectedBlock) {
            scaleSelectedBlock(-0.1);
        } else {
            const step = currentBrushSize <= 1.0 ? 0.1 : 0.5;
            currentBrushSize = Math.max(0.1, Math.round((currentBrushSize - step) * 10) / 10);
            updateBrushSizeUI();
            if(previewMesh) previewMesh.scale.set(currentBrushSize, currentBrushSize, currentBrushSize);
        }
    }
    
    if (event.key === '0') {
        event.preventDefault();
        if (selectedBlock) {
            selectedBlock.rotation = {x:0, y:0, z:0};
            selectedBlock.mesh.rotation.set(0, 0, 0);
            if (typeof updateSelectionOutline === 'function') updateSelectionOutline();
            updateJSON();
            showStatus('🔄 Rotação resetada', 'info');
        } else {
            resetRotation();
        }
    }
    
    if (key === 'g' || key === 'm') {
        if (transformControl && (selectedBlock || selectedBlocks.length > 0)) {
            transformControl.setMode('translate');
            showStatus('🕹️ Modo: Mover', 'info');
        }
    }
    
    if (key === 'r' && (selectedBlock || selectedBlocks.length > 0)) {
        if (transformControl) {
            if (transformControl.getMode() === 'rotate') {
                transformControl.setMode('translate');
                showStatus('🕹️ Modo: Mover (Reset)', 'info');
            } else {
                transformControl.setMode('rotate');
                showStatus('🔄 Modo: Rotacionar', 'info');
            }
        }
    }

    if (key === 's') {
        if (transformControl && (selectedBlock || selectedBlocks.length > 0)) {
            if (transformControl.getMode() === 'scale') {
                transformControl.setMode('translate');
                showStatus('🕹️ Modo: Mover (Reset)', 'info');
            } else {
                transformControl.setMode('scale');
                showStatus('📏 Modo: Escalar', 'info');
            }
        }
    }
	
    if (key === 'd') {
        event.preventDefault();
        if (typeof toggleDebugMode === 'function') toggleDebugMode();
    }
}
