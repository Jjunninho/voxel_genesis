// texturas/js/utils.js - v2.0 CORRIGIDO

// ============================================================
// 🎲 PERMUTATION TABLE — seed-safe (usa módulo 256)
// BUG CORRIGIDO: seed era usado como índice direto → overflow
// Agora: seed é usado como XOR/offset dentro do range 0-255
// ============================================================
const permutation = (() => {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates com semente fixa (Math.random ao carregar o módulo)
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    // Duplica para evitar & 255 em todo lugar
    const pp = new Uint8Array(512);
    for (let i = 0; i < 256; i++) pp[i] = pp[256 + i] = p[i];
    return pp;
})();

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t, a, b) { return a + t * (b - a); }
function grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : 0);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * Perlin noise 2D.
 * @param {number} x
 * @param {number} y
 * @param {number} seed  — qualquer inteiro, é reduzido com % 256
 */
export function noise(x, y, seed = 0) {
    // ✅ FIX: seed reduzido para range seguro antes de indexar permutation
    const s = Math.abs(Math.floor(seed)) % 256;
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    // Usa XOR com seed para variar o hash sem sair do range
    const a  = permutation[(X     ^ s) & 255] + Y;
    const b  = permutation[(X + 1 ^ s) & 255] + Y;
    const aa = permutation[a  & 511];
    const ab = permutation[(a + 1) & 511];
    const ba = permutation[b  & 511];
    const bb = permutation[(b + 1) & 511];
	return lerp(v,
        lerp(u, grad(aa, x, y),     grad(ba, x - 1, y)), // Corrigido para ba
        lerp(u, grad(ab, x, y - 1), grad(bb, x - 1, y - 1)) // Corrigido para ab
    );
}

// ============================================================
// 🔁 RUÍDO SEAMLESS (Cíclico) — bordas perfeitas para tiling
// ============================================================
export function noiseSeamless(x, y, scale, seed = 0) {
    const xNorm = x / scale;
    const yNorm = y / scale;
    const radius = scale / (2 * Math.PI);
    const s = xNorm * 2 * Math.PI;
    const t = yNorm * 2 * Math.PI;
    const nx = Math.cos(s) * radius;
    const ny = Math.sin(s) * radius;
    const nz = Math.cos(t) * radius;
    const nw = Math.sin(t) * radius;
    const n1 = noise(nx + seed, ny, seed);
    const n2 = noise(nz + seed + 100, nw, seed + 100);
    return (n1 + n2) * 0.5;
}

// ============================================================
// 🌈 CONVERSÃO DE COR
// ============================================================
export function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 0, g: 0, b: 0 };
}

// ============================================================
// 📊 VARIÂNCIA DE IMAGEM — guardião de qualidade
// ============================================================
export function calculateImageVariance(imageData) {
    const data = imageData.data;
    const step = 40; // analisa 1 pixel a cada 10 (4 canais × 10 = 40)
    let total = 0, count = 0;

    for (let i = 0; i < data.length; i += step) {
        total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        count++;
    }
    const avg = total / count;

    let sumSq = 0;
    for (let i = 0; i < data.length; i += step) {
        const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        sumSq += (lum - avg) ** 2;
    }
    return Math.sqrt(sumSq / count);
}
