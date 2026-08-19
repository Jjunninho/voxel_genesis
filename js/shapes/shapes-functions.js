// js/shapes-functions.js
// Funções auxiliares que antes viviam no final do shapes.js monolítico.
// Deve ser carregado APÓS todos os shapes_*.js e ANTES do shapes-loader.js.

// ============================================
// FUNÇÃO AUXILIAR: ponto dentro de polígono
// ============================================
function isPointInPolygon(x, z, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const [xi, zi] = vertices[i];
        const [xj, zj] = vertices[j];
        const intersect = ((zi > z) !== (zj > z)) &&
            (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// ============================================
// FUNÇÃO MESTRA DE GERAÇÃO (COM INTERCEPTOR)
// ============================================
function generateSelectedShape() {
    console.group("🚀 [MASTER] Iniciando Geração Procedural");

    // ── DIAGNÓSTICO: mostra todas as keys registradas no momento ──────────
    console.log('📋 [DIAG] ShapeRegistry keys:', Object.keys(window.ShapeRegistry || {}));
    console.log('📋 [DIAG] currentShape:', currentShape);
    console.log('📋 [DIAG] currentParams:', currentParams);

    if (!currentShape || !ShapeRegistry[currentShape]) {
        console.error(`❌ [DIAG] Shape "${currentShape}" NÃO encontrada no ShapeRegistry!`);
        console.error('❌ [DIAG] Keys disponíveis:', Object.keys(window.ShapeRegistry || {}).join(', '));
        console.groupEnd();
        return;
    }

    const overrideTypeElement   = document.getElementById('masterBlockType');
    const overrideScaleElement  = document.getElementById('masterBlockScale');
    const overrideObjScaleEl    = document.getElementById('masterObjectScale');

    const overrideType      = overrideTypeElement  ? overrideTypeElement.value              : 'default';
    const overrideVoxelScale = overrideScaleElement ? parseFloat(overrideScaleElement.value)  : 1.0;
    const overrideObjScale   = overrideObjScaleEl   ? parseFloat(overrideObjScaleEl.value)    : 1.0;

    console.log(`🔧 Config: Tipo=${overrideType}, EscalaVoxel=${overrideVoxelScale}, EscalaObjeto=${overrideObjScale}`);

    const originalAddBlockAt = window.addBlockAt;

    // ── Contador de blocos para diagnóstico ──────────────────────────────
    let _blockCount = 0;
    window.addBlockAt = function(x, y, z, color, type, scale, rotation) {
        _blockCount++;
        if (_blockCount === 1) console.log(`🧱 [DIAG] Primeiro bloco: (${x}, ${y}, ${z}) cor=${color} tipo=${type}`);

        const finalType = (overrideType === 'default') ? type : overrideType;
        let finalScale;
        if (typeof scale === 'object') {
            finalScale = { x: scale.x * overrideVoxelScale, y: scale.y * overrideVoxelScale, z: scale.z * overrideVoxelScale };
        } else {
            finalScale = (scale || 1) * overrideVoxelScale;
        }
        const finalX = x * overrideObjScale;
        const finalY = y * overrideObjScale;
        const finalZ = z * overrideObjScale;

        originalAddBlockAt(finalX, finalY, finalZ, color, finalType, finalScale, rotation);
    };

    clearScene(true);

    try {
        const shape = ShapeRegistry[currentShape];
        console.log(`▶️ [DIAG] Chamando generate() de "${currentShape}" com params:`, currentParams);
        shape.generate(currentParams);
        console.log(`✅ [DIAG] generate() concluído — ${_blockCount} blocos colocados`);
        showStatus(`✅ ${shape.name} gerado com sucesso!`, 'success');
    } catch (error) {
        console.error("❌ [DIAG] Erro dentro de generate():", error);
        showStatus("Erro ao gerar forma.", 'error');
    } finally {
        window.addBlockAt = originalAddBlockAt;
        console.log("🔄 Função original addBlockAt restaurada.");
    }

    updateJSON();
    closeShapeModal();
    console.groupEnd();
}
