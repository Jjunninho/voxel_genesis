// js/engine.js
import { noise, hslToRgb } from './utils.js';

// Função auxiliar para fazer o Tiling funcionar
function noiseTiled(x, y, width, height, scale, seed) {
    // Escala normalizada
    const nx = x / scale;
    const ny = y / scale;
    
    // Se não for Tiling, retorna o noise normal
    // Mas para Tiling, precisamos amostrar o ruído em coordenadas que "dobram"
    // Uma técnica simples é amostrar o noise 2 vezes em cada eixo e interpolar
    
    // Vamos usar a técnica de "Wrapping" coordenada pura:
    // O segredo é: x e y devem ser passados como frações da largura total
    
    // Para simplificar sua vida e manter o código minúsculo:
    // Vamos usar a técnica de "Espelhamento Modular" no próprio noise normal
    // mas ajustando a frequência para casar com o tamanho da imagem (512).
    
    return noise(nx, ny, seed); 
}

// A função PRINCIPAL atualizada
export function generateTextureFunction(x, y, params, textureType) {
    let value = 0;
    
    // Preparação para Tiling
    let effectiveX = x;
    let effectiveY = y;
    
    if (params.tiling) {
        // Tiling Hack: Transformamos o espaço cartesiano em espaço circular
        // Mapeamos 0..512 para 0..2PI
        const angleX = (x / 512) * Math.PI * 2;
        const angleY = (y / 512) * Math.PI * 2;
        
        // O ruído é amostrado nas coordenadas circulares
        // Isso garante que 0 e 2PI se encontrem (início e fim)
        // Multiplicamos pelo Scale para manter o detalhe
        const radius = params.scale / 10; 
        
        effectiveX = (Math.cos(angleX) + 1) * radius * 50;
        effectiveY = (Math.sin(angleY) + 1) * radius * 50;
        
        // Adicionamos o Y no segundo eixo do noise para variar
        effectiveX += (Math.cos(angleY) + 1) * radius * 10;
    } else {
        // Modo Normal
        effectiveX = x;
        effectiveY = y;
    }

    // Agora usamos effectiveX/Y em vez de x/y nos cálculos abaixo
    // NOTA: Para simplificar, substitua todas as chamadas `x` por `effectiveX` e `y` por `effectiveY`
    // NOS switch cases abaixo.
    
    switch(textureType) {
        case 'stone':
            value = Math.abs(noise(effectiveX / params.scale, effectiveY / params.scale, params.seed));
            value = Math.pow(value, 1.5);
            break;
        case 'wood':
            // Wood precisa de lógica especial para tiling não quebrar os anéis
            const cx = params.tiling ? 0 : 0.5; // Centraliza se for tiling
            const dist = Math.sqrt(Math.pow((x/512) - cx, 2) + Math.pow((y/512) - cx, 2));
            value = Math.sin(dist * params.scale * (params.tiling ? 4 : 1) + noise(effectiveX, effectiveY, params.seed) * 10) * 0.5 + 0.5;
            break;
        case 'earth':
            value = (noise(effectiveX / params.scale, effectiveY / params.scale, params.seed) + 1) * 0.5;
            break;
        // ... (Repita a substituição de x/y por effectiveX/effectiveY para os outros casos)
        // ...
        default:
            value = noise(effectiveX / params.scale, effectiveY / params.scale, params.seed) * 0.5 + 0.5;
    }
    
    return Math.max(0, Math.min(1, value));
}

// Aplicar efeitos especiais
export function applyEffect(x, y, baseValue, effect, params) {
    switch(effect) {
        case 'depth':
            return baseValue + noise(x * 20, y * 20, params.seed + 1) * 0.3;
        case 'glow':
            const glow = Math.sin(x * 10) * Math.cos(y * 10) * 0.2;
            return baseValue + glow;
        case 'cracks':
            const crack = noise(x * 50, y * 50, params.seed + 2);
            return baseValue * (1 - Math.abs(crack * 0.3));
        case 'waves':
            const wave = Math.sin((x + y) * params.scale * 0.5) * 0.3;
            return baseValue + wave;
        case 'cells':
            const cell = Math.abs(noise(x * 15, y * 15, params.seed + 3));
            return baseValue * (0.7 + cell * 0.3);
        case 'crystals':
            const crystal = Math.abs(Math.sin(x * 25) * Math.cos(y * 25));
            return baseValue * (0.6 + crystal * 0.4);
        case 'fibers':
            const fiber = Math.sin(x * 30) * 0.5 + 0.5;
            return baseValue * (0.8 + fiber * 0.2);
        case 'sparks':
            const spark = noise(x * 100, y * 100, params.seed + 4);
            return baseValue + (spark > 0.8 ? 0.2 : 0);
            
        // O case 'vignette' deve vir ANTES do default
        case 'vignette':
            const dx = x - 0.5;
            const dy = y - 0.5;
            const dist = Math.sqrt(dx*dx + dy*dy);
            // 0.7 controla o raio e 1.0 é o branco puro
            const vig = 1.0 - (dist * 0.7); 
            return baseValue * Math.max(0, vig);

        default:
            return baseValue;
    }
}
	
// Misturar texturas
export function blendTextures(value1, value2, mode, amount) {
    switch(mode) {
        case 'add':
            return value1 * (1 - amount) + (value1 + value2) * amount * 0.5;
        case 'multiply':
            return value1 * (1 - amount) + (value1 * value2) * amount;
        case 'screen':
            return value1 * (1 - amount) + (1 - (1 - value1) * (1 - value2)) * amount;
        case 'overlay':
            return value1 < 0.5 ? 
                2 * value1 * value2 * amount + value1 * (1 - amount) :
                1 - 2 * (1 - value1) * (1 - value2) * amount + value1 * (1 - amount);
        case 'difference':
            return value1 * (1 - amount) + Math.abs(value1 - value2) * amount;
        case 'noise':
            return value1 + (Math.random() - 0.5) * amount;
        default:
            return value1;
    }
}

// Gerar cor baseada no modo
export function getColor(value, colorMode, colors) {
    switch(colorMode) {
        case 'gradient':
            if (value < 0.33) return colors[0];
            if (value < 0.66) return colors[1];
            if (value < 0.8) return colors[2];
            return colors[3];
        case 'noise':
            const r = Math.floor((value + noise(value * 10, 0, 0)) * 127.5);
            const g = Math.floor((value + noise(0, value * 10, 1)) * 127.5);
            const b = Math.floor((value + noise(value * 10, value * 10, 2)) * 127.5);
            return {r, g, b};
        case 'bands':
            const band = Math.floor(value * 4);
            return colors[band % 4];
        case 'spots':
            const spot = Math.sin(value * 20) > 0 ? colors[0] : colors[1];
            return spot;
        case 'rainbow':
            const hue = value * 360;
            return hslToRgb(hue, 80, 50);
        default:
            return colors[0];
    }
}