// js/utils.js

// --- Funções de Ruído (Perlin/Simplex Simplificado) ---
const permutation = [];
for (let i = 0; i < 256; i++) permutation[i] = i;
for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
}
for (let i = 0; i < 256; i++) permutation[256 + i] = permutation[i];

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t, a, b) { return a + t * (b - a); }
function grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function noise(x, y, seed) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const a = permutation[X + seed] + Y;
    const b = permutation[X + 1 + seed] + Y;
    return lerp(v,
        lerp(u, grad(permutation[a], x, y), grad(permutation[b], x - 1, y)),
        lerp(u, grad(permutation[a + 1], x, y - 1), grad(permutation[b + 1], x - 1, y - 1))
    );
}

// --- Funções de Cor ---

export function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// js/utils.js

// ... (suas funções anteriores noise, hslToRgb, etc) ...

// Nova função: Calcula se a imagem tem variação visual ou é monótona
export function calculateImageVariance(imageData) {
    const data = imageData.data;
    let totalLuminance = 0;
    const numPixels = data.length / 4;
    
    // Otimização: Pula pixels para não pesar a CPU (analisa 1 a cada 10)
    const step = 40; // 10 pixels * 4 canais
    let sampledPixels = 0;

    // 1. Média de luminosidade
    for (let i = 0; i < data.length; i += step) {
        // Luminosidade percebida (R*0.299 + G*0.587 + B*0.114)
        const lum = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
        totalLuminance += lum;
        sampledPixels++;
    }
    const avgLuminance = totalLuminance / sampledPixels;

    // 2. Desvio Padrão (Quanto os pixels fogem da média?)
    let sumSquaredDiff = 0;
    for (let i = 0; i < data.length; i += step) {
        const lum = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
        const diff = lum - avgLuminance;
        sumSquaredDiff += diff * diff;
    }

    // Retorna a raiz da variância (Desvio Padrão)
    return Math.sqrt(sumSquaredDiff / sampledPixels);
}

// js/utils.js

// ... (mantenha o resto do arquivo igual) ...

// --- NOVA FUNÇÃO: Ruído Seamless (Cíclico) 4D ---
// Transforma as coordenadas 2D em um toro (rosquinha) 4D para garantir bordas perfeitas
export function noiseSeamless(x, y, scale, seed) {
    // Normaliza x e y para 0..1 (dentro da área da textura)
    // Se o valor passar de 1, ele pega o resto da divisão para garantir o loop
    const xNorm = x / scale; 
    const yNorm = y / scale;
    
    // Raio do círculo no espaço 4D (quanto maior, mais suave)
    const radius = scale / (2 * Math.PI); 

    // Mapeia X para um círculo
    const s = xNorm * 2 * Math.PI;
    const nx = Math.cos(s) * radius; 
    const ny = Math.sin(s) * radius; 
    
    // Mapeia Y para um segundo círculo
    const t = yNorm * 2 * Math.PI; 
    const nz = Math.cos(t) * radius; 
    const nw = Math.sin(t) * radius; 

    // Como o noise padrão só aceita 2D ou 3D, fazemos um hack:
    // Misturamos as 4 dimensões em 2 chamadas de noise 2D e interpolamos
    // (Esta é uma aproximação rápida para não precisarmos de um Simplex 4D pesado)
    
    // Seed offsets para variar as dimensões
    const n1 = noise(nx + seed, ny, seed);
    const n2 = noise(nz + seed + 100, nw, seed + 100);
    
    // Média simples para manter a coerência
    return (n1 + n2) * 0.5;
}