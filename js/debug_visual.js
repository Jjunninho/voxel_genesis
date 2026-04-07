// ===============================================
// 🎨 SISTEMA DE DEBUG VISUAL - VOXEL GENESIS IA
// ===============================================
// Arquivo: debug_visual.js
// Uso: Adicione APÓS carregar core.js no HTML
// Ativação: Pressione tecla 'D' durante uso

// 🟢 VARIÁVEIS GLOBAIS DE DEBUG (declaradas aqui)
let debugMode = false;
let debugGridLines = null;
let debugTextSprite = null;
let debugTargetPoint = null;
let debugSnapPoint = null;

// 🎨 FUNÇÃO: Ativar/Desativar Modo Debug
function toggleDebugMode() {
    debugMode = !debugMode;
    
    if (!debugMode) {
        clearDebugVisuals();
    }
    
    if (typeof showStatus === 'function') {
        showStatus(`🐛 Debug Mode: ${debugMode ? 'ON' : 'OFF'}`, 'info');
    } else {
        console.log(`🐛 Debug Mode: ${debugMode ? 'ON' : 'OFF'}`);
    }
    
    updateDebugUI();
}

// 🎨 FUNÇÃO: Atualizar UI de Debug
function updateDebugUI() {
    let debugPanel = document.getElementById('debugPanel');
    
    if (!debugPanel) {
        // Cria o painel de debug se não existir
        debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: #0f0;
            padding: 15px;
            border: 2px solid #0f0;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 0 20px rgba(0,255,0,0.3);
        `;
        document.body.appendChild(debugPanel);
    }
    
    if (debugMode) {
        debugPanel.style.display = 'block';
    } else {
        debugPanel.style.display = 'none';
    }
}

// 🎨 FUNÇÃO: Mostrar Grid Visual
function showDebugGrid() {
    if (!window.THREE || !scene) return;
    
    if (debugGridLines) {
        scene.remove(debugGridLines);
    }
    
    const gridStep = getGridStep(currentBrushSize);
    const size = 20;
    const divisions = Math.floor(size / gridStep);
    
    // Cria grid verde brilhante
    debugGridLines = new THREE.GridHelper(size, divisions, 0x00ff00, 0x00ff00);
    debugGridLines.material.opacity = 0.3;
    debugGridLines.material.transparent = true;
    scene.add(debugGridLines);
}

// 🎨 FUNÇÃO: Mostrar Ponto de Target (antes do snap)
function showDebugTargetPoint(position) {
    if (!debugMode || !window.THREE || !scene) return;
    
    // Remove ponto antigo
    if (debugTargetPoint) scene.remove(debugTargetPoint);
    
    // Esfera VERMELHA = posição calculada (antes do snap)
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: true,
        opacity: 0.8
    });
    debugTargetPoint = new THREE.Mesh(geometry, material);
    debugTargetPoint.position.copy(position);
    scene.add(debugTargetPoint);
}

// 🎨 FUNÇÃO: Mostrar Ponto de Snap (depois do snap)
function showDebugSnapPoint(position) {
    if (!debugMode || !window.THREE || !scene) return;
    
    // Remove ponto antigo
    if (debugSnapPoint) scene.remove(debugSnapPoint);
    
    // Esfera VERDE = posição final (depois do snap)
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8
    });
    debugSnapPoint = new THREE.Mesh(geometry, material);
    debugSnapPoint.position.copy(position);
    scene.add(debugSnapPoint);
}

// 🎨 FUNÇÃO: Atualizar Info de Debug
function updateDebugInfo(info) {
    if (!debugMode) return;
    
    const debugPanel = document.getElementById('debugPanel');
    if (!debugPanel) return;
    
    const html = `
        <div style="margin-bottom: 10px; border-bottom: 1px solid #0f0; padding-bottom: 5px;">
            <strong>🐛 DEBUG MODE</strong>
            <div style="font-size: 10px; color: #888;">Pressione D para desativar</div>
        </div>
        
        <div><strong>📏 Grid Step:</strong> ${info.gridStep.toFixed(3)}</div>
        <div><strong>🖌️ Brush Size:</strong> ${info.brushSize.toFixed(2)}</div>
        <div><strong>📦 Menor Bloco:</strong> ${info.smallestBlock.toFixed(2)}</div>
        
        <div style="margin-top: 10px; border-top: 1px solid #0f0; padding-top: 5px;">
            <div><strong>🎯 Target (antes snap):</strong></div>
            <div style="margin-left: 10px; color: #ff6666;">
                X: ${info.targetX.toFixed(3)}<br>
                Y: ${info.targetY.toFixed(3)}<br>
                Z: ${info.targetZ.toFixed(3)}
            </div>
        </div>
        
        <div style="margin-top: 5px;">
            <div><strong>✅ Snap (depois):</strong></div>
            <div style="margin-left: 10px; color: #66ff66;">
                X: ${info.snapX.toFixed(3)}<br>
                Y: ${info.snapY.toFixed(3)}<br>
                Z: ${info.snapZ.toFixed(3)}
            </div>
        </div>
        
        <div style="margin-top: 10px; padding-top: 5px; border-top: 1px solid #0f0;">
            <strong>📊 Diferença (Gap):</strong>
            <div style="margin-left: 10px; color: ${info.gap > 0.01 ? '#ff6666' : '#66ff66'};">
                ${info.gap.toFixed(4)} unidades
            </div>
        </div>
        
        <div style="margin-top: 10px; font-size: 10px; color: #888;">
            🔴 Vermelho = Target original<br>
            🟢 Verde = Após snap
        </div>
    `;
    
    debugPanel.innerHTML = html;
}

// 🎨 FUNÇÃO: Limpar Visualizações de Debug
function clearDebugVisuals() {
    if (!scene) return;
    
    if (debugGridLines) {
        scene.remove(debugGridLines);
        debugGridLines = null;
    }
    if (debugTargetPoint) {
        scene.remove(debugTargetPoint);
        debugTargetPoint = null;
    }
    if (debugSnapPoint) {
        scene.remove(debugSnapPoint);
        debugSnapPoint = null;
    }
}

// 🔧 FUNÇÃO: Hook para integrar com updatePreview
// Esta função deve ser chamada DENTRO do updatePreview existente
function debugUpdatePreview(targetPos, snapPos, gridStep, brushSize) {
    if (!debugMode) return;
    
    // Mostra posição ANTES do snap
    showDebugTargetPoint(targetPos);
    
    // Mostra posição DEPOIS do snap
    showDebugSnapPoint(snapPos);
    
    // Calcula menor bloco da cena
    let smallestBlock = brushSize;
    if (typeof blocks !== 'undefined' && blocks.length > 0) {
        blocks.forEach(block => {
            const s = (typeof block.scale === 'number') 
                ? block.scale 
                : Math.min(block.scale.x, block.scale.y, block.scale.z);
            if (s < smallestBlock) smallestBlock = s;
        });
    }
    
    // Calcula gap
    const gap = Math.sqrt(
        Math.pow(snapPos.x - targetPos.x, 2) +
        Math.pow(snapPos.y - targetPos.y, 2) +
        Math.pow(snapPos.z - targetPos.z, 2)
    );
    
    // Atualiza info no painel
    updateDebugInfo({
        gridStep: gridStep,
        brushSize: brushSize,
        smallestBlock: smallestBlock,
        targetX: targetPos.x,
        targetY: targetPos.y,
        targetZ: targetPos.z,
        snapX: snapPos.x,
        snapY: snapPos.y,
        snapZ: snapPos.z,
        gap: gap
    });
    
    // Mostra grid
    showDebugGrid();
}

console.log('✅ Debug Visual carregado! Pressione D para ativar.');
