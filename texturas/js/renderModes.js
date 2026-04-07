// texturas/js/renderModes.js - Módulo de Modos de Renderização (v2.3 CORRIGIDO)

import { noise } from './utils.js';
import { generateTextureFunction, blendTextures } from './engine.js';

// ====================================================================
// 🎨 REGISTRO DE MODOS DE RENDERIZAÇÃO
// ====================================================================

export const renderModes = {
    
    // ========================================
    // MODOS CLÁSSICOS (Mantidos)
    // ========================================
    texture: (x, y, size, params, currentTextures) => {
        const nx = x / size + noise(x * 0.01, y * 0.01, params.seed) * params.distortion;
        const ny = y / size + noise(x * 0.01, y * 0.01, params.seed + 100) * params.distortion;
        let v1 = generateTextureFunction(nx, ny, params, currentTextures.primary);
        let v2 = generateTextureFunction(nx, ny, params, currentTextures.secondary);
        let value = blendTextures(v1, v2, params.blendMode, params.blendAmount);
        value += (noise(x * 2, y * 2, params.seed + 200) * 2 - 1) * params.noiseAmount;
        return value;
    },

    gradient: (x, y, size, params, currentTextures) => {
        let value = (x / size) * 0.5 + (y / size) * 0.5;
        if (params.distortion > 0) {
            value += noise(x * 0.005, y * 0.005, params.seed) * params.distortion * 0.2;
        }
        return value;
    },

    solid: (x, y, size, params, currentTextures) => {
        return 0.5;
    },

    pixel: (x, y, size, params, currentTextures) => {
        const pixelSize = 16;
        const px = Math.floor(x / pixelSize) * pixelSize;
        const py = Math.floor(y / pixelSize) * pixelSize;
        const npx = px / size + noise(px * 0.01, py * 0.01, params.seed) * params.distortion;
        const npy = py / size + noise(px * 0.01, py * 0.01, params.seed + 100) * params.distortion;
        let v1 = generateTextureFunction(npx, npy, params, currentTextures.primary);
        let v2 = generateTextureFunction(npx, npy, params, currentTextures.secondary);
        return blendTextures(v1, v2, params.blendMode, params.blendAmount);
    },

    // ========================================
    // NOVOS MODOS (v2.3 CORRIGIDOS)
    // ========================================

    // 📺 Scanlines: Linhas CRT horizontais
    scanlines: (x, y, size, params, currentTextures) => {
        // Usa texture base (sem recursão)
        const nx = x / size;
        const ny = y / size;
        let v1 = generateTextureFunction(nx, ny, params, currentTextures.primary);
        let v2 = generateTextureFunction(nx, ny, params, currentTextures.secondary);
        let base = blendTextures(v1, v2, params.blendMode, params.blendAmount);
        
        // Frequência das linhas baseada na escala
        const lineFreq = Math.max(2, params.scale / 10);
        const line = Math.sin(y * lineFreq * Math.PI / size) * 0.5 + 0.5;
        
        // Mistura suave
        return base * (0.7 + line * 0.3);
    },

    // 🎯 Circles: Ondas concêntricas
    circles: (x, y, size, params, currentTextures) => {
        const cx = size / 2;
        const cy = size / 2;
        
        // Distorção opcional
        const dx = x - cx + (noise(x * 0.01, y * 0.01, params.seed) * params.distortion * 30);
        const dy = y - cy + (noise(y * 0.01, x * 0.01, params.seed + 1) * params.distortion * 30);
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        const waveFreq = Math.max(1, params.scale / 20);
        const wave = Math.sin(dist * waveFreq * Math.PI / size) * 0.5 + 0.5;
        
        // Base textura
        const nx = x / size;
        const ny = y / size;
        let v1 = generateTextureFunction(nx, ny, params, currentTextures.primary);
        let v2 = generateTextureFunction(nx, ny, params, currentTextures.secondary);
        let base = blendTextures(v1, v2, params.blendMode, params.blendAmount);
        
        return base * (0.5 + wave * 0.5);
    },

    // ♟️ Checkerboard: Tabuleiro de Xadrez
    checkerboard: (x, y, size, params, currentTextures) => {
        const checkSize = Math.max(8, size / Math.max(2, params.scale / 4));
        
        // Coordenadas com distorção
        const distX = x + noise(x * 0.02, y * 0.02, params.seed) * params.distortion * 30;
        const distY = y + noise(y * 0.02, x * 0.02, params.seed + 100) * params.distortion * 30;
        
        const cx = Math.floor(distX / checkSize);
        const cy = Math.floor(distY / checkSize);
        const check = (cx + cy) % 2 === 0 ? 0.3 : 0.7;
        
        // Base textura
        const nx = x / size;
        const ny = y / size;
        let v1 = generateTextureFunction(nx, ny, params, currentTextures.primary);
        let v2 = generateTextureFunction(nx, ny, params, currentTextures.secondary);
        let base = blendTextures(v1, v2, params.blendMode, params.blendAmount);
        
        return base * check;
    },

    // 🕸️ Voronoi OTIMIZADO: Células orgânicas
    voronoi: (x, y, size, params, currentTextures) => {
        // Tamanho da célula baseado na escala
        const cellSize = Math.max(20, 250 - params.scale);
        
        // Coordenada da célula atual
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        
        let minDist = Infinity;
        
        // ✅ CORRIGIDO: Checa células vizinhas (3x3 = 9 células)
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const neighborX = cellX + dx;
                const neighborY = cellY + dy;
                
                // Posição "aleatória" do ponto central
                const pointX = (neighborX + 0.5 + noise(neighborX, neighborY, params.seed) * 0.4) * cellSize;
                const pointY = (neighborY + 0.5 + noise(neighborX, neighborY, params.seed + 100) * 0.4) * cellSize;
                
                // Distância até este ponto
                const distX = x - pointX;
                const distY = y - pointY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                minDist = Math.min(minDist, dist);
            }
        }
        
        // Normaliza distância
        const pattern = Math.min(1, minDist / (cellSize * 0.7));
        
        // Base textura
        const nx = x / size;
        const ny = y / size;
        let v1 = generateTextureFunction(nx, ny, params, currentTextures.primary);
        let v2 = generateTextureFunction(nx, ny, params, currentTextures.secondary);
        let base = blendTextures(v1, v2, params.blendMode, params.blendAmount);
        
        return base * (0.5 + pattern * 0.5);
    },

    // 🔷 Hexagons CORRIGIDO: Grade hexagonal
    hexagons: (x, y, size, params, currentTextures) => {
        // Distorção
        const distX = x + noise(x * 0.01, y * 0.01, params.seed) * params.distortion * 20;
        const distY = y + noise(y * 0.01, x * 0.01, params.seed) * params.distortion * 20;
        
        // Escala ajustada
        const scale = Math.max(10, params.scale / 2);
        const s = distX * (Math.PI / scale);
        const t = distY * (Math.PI / scale);
        
        // Matemática hexagonal (3 cossenos em 120°)
        const val = Math.cos(s) + 
                    Math.cos(s * -0.5 + t * 0.866) + 
                    Math.cos(s * -0.5 - t * 0.866);
        
        // ✅ CORRIGIDO: Normalização segura
        // val varia de -3 a +3, normalizamos para 0-1
        const pattern = Math.max(0, Math.min(1, (val + 3) / 6));
        
        // Base textura
        const nx = x / size;
        const ny = y / size;
        let v1 = generateTextureFunction(nx, ny, params, currentTextures.primary);
        let v2 = generateTextureFunction(nx, ny, params, currentTextures.secondary);
        let base = blendTextures(v1, v2, params.blendMode, params.blendAmount);
        
        return base * (0.3 + pattern * 0.7);
    },

    // 🌀 Spiral: Espiral logarítmica
    spiral: (x, y, size, params, currentTextures) => {
        const cx = size / 2;
        const cy = size / 2;
        const dx = x - cx;
        const dy = y - cy;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Espiral com frequência baseada na escala
        const spiralFreq = Math.max(1, params.scale / 30);
        const spiralVal = Math.sin((dist * 0.05) + (angle * spiralFreq)) * 0.5 + 0.5;
        
        // Base textura
        const nx = x / size;
        const ny = y / size;
        let v1 = generateTextureFunction(nx, ny, params, currentTextures.primary);
        let v2 = generateTextureFunction(nx, ny, params, currentTextures.secondary);
        let base = blendTextures(v1, v2, params.blendMode, params.blendAmount);
        
        return base * (0.4 + spiralVal * 0.6);
    }
};

// ====================================================================
// 🎯 FUNÇÃO PRINCIPAL
// ====================================================================

export function renderPixel(x, y, size, params, currentTextures, renderMode) {
    const renderFunc = renderModes[renderMode];
    
    if (!renderFunc) {
        console.warn(`⚠️ Modo '${renderMode}' não existe! Usando 'texture' como fallback.`);
        return renderModes.texture(x, y, size, params, currentTextures);
    }
    
    return renderFunc(x, y, size, params, currentTextures);
}

// ====================================================================
// 📋 METADADOS DOS MODOS
// ====================================================================

export const renderModeMetadata = {
    texture: {
        name: 'Textura',
        icon: '🎭',
        description: 'Textura procedural completa',
        validateSaturation: true
    },
    gradient: {
        name: 'Gradiente',
        icon: '🌈',
        description: 'Gradiente suave com distorção',
        validateSaturation: true
    },
    solid: {
        name: 'Sólida',
        icon: '⬛',
        description: 'Cor única para testes',
        validateSaturation: false
    },
    pixel: {
        name: 'Pixel Art',
        icon: '👾',
        description: 'Textura pixelada 16x16',
        validateSaturation: true
    },
    scanlines: {
        name: 'Scanlines',
        icon: '📺',
        description: 'Linhas horizontais estilo CRT',
        validateSaturation: true
    },
    circles: {
        name: 'Círculos',
        icon: '🎯',
        description: 'Ondas concêntricas do centro',
        validateSaturation: true
    },
    checkerboard: {
        name: 'Xadrez',
        icon: '♟️',
        description: 'Tabuleiro com distorção',
        validateSaturation: true
    },
    voronoi: {
        name: 'Voronoi',
        icon: '🕸️',
        description: 'Células orgânicas (Worley Noise)',
        validateSaturation: true
    },
    hexagons: {
        name: 'Hexágonos',
        icon: '🔷',
        description: 'Grade hexagonal matemática',
        validateSaturation: true
    },
    spiral: {
        name: 'Espiral',
        icon: '🌀',
        description: 'Espiral logarítmica do centro',
        validateSaturation: true
    }
};

// ====================================================================
// 🔍 FUNÇÕES AUXILIARES
// ====================================================================

export function getAvailableModes() {
    return Object.keys(renderModes);
}

export function shouldValidateSaturation(mode) {
    return renderModeMetadata[mode]?.validateSaturation ?? true;
}

export function getModeInfo(mode) {
    return renderModeMetadata[mode] || null;
}
