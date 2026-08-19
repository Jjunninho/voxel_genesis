// texturas/js/engine.js - v2.0 CORRIGIDO

import { noise, noiseSeamless, hslToRgb } from './utils.js';

// ============================================================
// 🏔️ GERADOR DE PADRÃO BASE POR TIPO DE TEXTURA
// Todos os 16 presets do presets.js têm um case dedicado.
// effectiveX/Y já vêm pré-calculados pelo modo tiling.
// ============================================================
export function generateTextureFunction(x, y, params, textureType) {
    let value = 0;
    const s = params.scale || 50;
    const seed = params.seed || 1;

    // Pré-cálculo do tiling (transforma espaço cartesiano em circular)
    let ex = x, ey = y;
    if (params.tiling) {
        const angleX = (x / 512) * Math.PI * 2;
        const angleY = (y / 512) * Math.PI * 2;
        const radius = s / 10;
        ex = (Math.cos(angleX) + 1) * radius * 50 + (Math.cos(angleY) + 1) * radius * 10;
        ey = (Math.sin(angleY) + 1) * radius * 50;
    }

    switch (textureType) {

        case 'stone':
            value = Math.abs(noise(ex / s, ey / s, seed));
            value = Math.pow(value, 1.5);
            break;

        case 'wood': {
            // Anéis de crescimento com ruído de distorção
            const cx = params.tiling ? 0 : 0.5;
            const dist = Math.sqrt(Math.pow((x / 512) - cx, 2) + Math.pow((y / 512) - cx, 2));
            value = Math.sin(dist * s * (params.tiling ? 4 : 1) + noise(ex, ey, seed) * 10) * 0.5 + 0.5;
            break;
        }

        case 'earth':
        case 'clouds':
            // fBm (Fractional Brownian Motion) — múltiplas oitavas de ruído
            {
                let amp = 1.0, freq = 1.0, total = 0, maxVal = 0;
                const oct = Math.min(params.octaves || 4, 8);
                for (let i = 0; i < oct; i++) {
                    total  += noise(ex / s * freq, ey / s * freq, seed) * amp;
                    maxVal += amp;
                    amp  *= 0.5;
                    freq *= 2.0;
                }
                value = (total / maxVal + 1) * 0.5;
            }
            break;

        case 'marble': {
            // Veias de mármore: seno de noise turbulento
            let turb = 0, amp = 1.0, freq = 1.0, maxV = 0;
            const oct = Math.min(params.octaves || 4, 8);
            for (let i = 0; i < oct; i++) {
                turb  += Math.abs(noise(ex / s * freq, ey / s * freq, seed)) * amp;
                maxV  += amp;
                amp  *= 0.5;
                freq *= 2.0;
            }
            turb /= maxV;
            value = Math.sin((ex / s + turb * 3) * Math.PI) * 0.5 + 0.5;
            break;
        }

        case 'metal': {
            // Gradiente diagonal + noise fino = brushed metal
            const base = (ex / s + ey / s) * 0.5;
            const glint = noise(ex / (s * 0.1), ey / (s * 2), seed) * 0.15;
            value = Math.sin(base * Math.PI * 4) * 0.5 + 0.5 + glint;
            break;
        }

        case 'water': {
            // Ondas concêntricas + noise de distorção = água
            const wdx = ex / 512 - 0.5;
            const wdy = ey / 512 - 0.5;
            const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
            const wNoise = noise(ex / s, ey / s, seed) * 0.3;
            value = Math.sin((wdist + wNoise) * s * 0.3) * 0.5 + 0.5;
            break;
        }

        case 'lava': {
            // Células de Voronoi + calor = lava
            const cellS = Math.max(20, 200 - s);
            const cxl = Math.floor(ex / cellS);
            const cyl = Math.floor(ey / cellS);
            let minD = Infinity;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const px = (cxl + dx + 0.5 + noise(cxl + dx, cyl + dy, seed) * 0.5) * cellS;
                    const py = (cyl + dy + 0.5 + noise(cxl + dx, cyl + dy, seed + 50) * 0.5) * cellS;
                    const d = Math.sqrt((ex - px) ** 2 + (ey - py) ** 2);
                    minD = Math.min(minD, d);
                }
            }
            value = 1 - Math.min(1, minD / (cellS * 0.7));
            // Pulsa: borda das células = mais quente
            value = Math.pow(value, 0.7);
            break;
        }

        case 'grass': {
            // Patches irregulares de cor + noise fino
            const coarse = (noise(ex / s, ey / s, seed) + 1) * 0.5;
            const fine   = noise(ex / (s * 0.15), ey / (s * 0.15), seed + 77) * 0.15;
            value = coarse + fine;
            break;
        }

        case 'sand': {
            // Ondas de areia (ripples) + noise suave
            value = Math.sin(ey / s * Math.PI * 3 + noise(ex / s, ey / s, seed) * 2) * 0.25 + 0.5
                  + noise(ex / (s * 0.2), ey / (s * 0.2), seed + 33) * 0.25;
            break;
        }

        case 'snow': {
            // Quase branco uniforme com micro-ruído
            value = 0.85 + noise(ex / (s * 0.3), ey / (s * 0.3), seed) * 0.15;
            break;
        }

        case 'noise': {
            // Ruído puro multi-oitava
            let nAmp = 1.0, nFreq = 1.0, nTotal = 0, nMax = 0;
            const oct2 = Math.min(params.octaves || 4, 8);
            for (let i = 0; i < oct2; i++) {
                nTotal += noise(ex / s * nFreq, ey / s * nFreq, seed) * nAmp;
                nMax   += nAmp;
                nAmp   *= 0.5;
                nFreq  *= 2.0;
            }
            value = (nTotal / nMax + 1) * 0.5;
            break;
        }

        case 'abstract1':
        case 'abstract2': {
            // Combinação de senos em ângulos diferentes = padrão psicodélico
            const a = Math.sin(ex / s * 1.7 + noise(ex / s, ey / s, seed) * 2) * 0.5 + 0.5;
            const b = Math.cos(ey / s * 1.3 + noise(ey / s, ex / s, seed + 40) * 2) * 0.5 + 0.5;
            value = (a + b) * 0.5;
            break;
        }

        case 'crystal': {
            // Fractal de diamante
            const fc = Math.abs(noise(ex / s, ey / s, seed));
            const fc2 = Math.abs(noise(ex / (s * 0.5) + 1, ey / (s * 0.5), seed + 20));
            value = Math.pow((fc + fc2) * 0.5, 0.6);
            break;
        }

        case 'nebula': {
            // fBm de baixa frequência + manchas de alta frequência
            let nebAmp = 1.0, nebFreq = 0.5, nebTotal = 0, nebMax = 0;
            const oct3 = Math.min(params.octaves || 5, 8);
            for (let i = 0; i < oct3; i++) {
                nebTotal += (noise(ex / s * nebFreq, ey / s * nebFreq, seed) + 1) * 0.5 * nebAmp;
                nebMax   += nebAmp;
                nebAmp   *= 0.45;
                nebFreq  *= 2.2;
            }
            value = nebTotal / nebMax;
            break;
        }

        default:
            value = noise(ex / s, ey / s, seed) * 0.5 + 0.5;
    }

    return Math.max(0, Math.min(1, value));
}

// ============================================================
// ✨ EFEITOS ESPECIAIS
// ============================================================
export function applyEffect(x, y, baseValue, effect, params) {
    const seed = params.seed || 1;
    switch (effect) {
        case 'depth':
            return baseValue + noise(x * 20, y * 20, seed + 1) * 0.3;
        case 'glow': {
            const glow = Math.sin(x * 10) * Math.cos(y * 10) * 0.2;
            return baseValue + glow;
        }
        case 'cracks': {
            const crack = noise(x * 50, y * 50, seed + 2);
            return baseValue * (1 - Math.abs(crack * 0.3));
        }
        case 'waves': {
            const wave = Math.sin((x + y) * (params.scale || 50) * 0.5) * 0.3;
            return baseValue + wave;
        }
        case 'cells': {
            const cell = Math.abs(noise(x * 15, y * 15, seed + 3));
            return baseValue * (0.7 + cell * 0.3);
        }
        case 'crystals': {
            const crystal = Math.abs(Math.sin(x * 25) * Math.cos(y * 25));
            return baseValue * (0.6 + crystal * 0.4);
        }
        case 'fibers': {
            const fiber = Math.sin(x * 30) * 0.5 + 0.5;
            return baseValue * (0.8 + fiber * 0.2);
        }
        case 'sparks': {
            const spark = noise(x * 100, y * 100, seed + 4);
            return baseValue + (spark > 0.8 ? 0.2 : 0);
        }
        case 'vignette': {
            const vdx = x - 0.5, vdy = y - 0.5;
            const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
            return baseValue * Math.max(0, 1.0 - vdist * 0.7);
        }
        default:
            return baseValue;
    }
}

// ============================================================
// 🎛️ BLEND DE TEXTURAS
// ============================================================
export function blendTextures(value1, value2, mode, amount) {
    switch (mode) {
        case 'add':
            return value1 * (1 - amount) + (value1 + value2) * amount * 0.5;
        case 'multiply':
            return value1 * (1 - amount) + (value1 * value2) * amount;
        case 'screen':
            return value1 * (1 - amount) + (1 - (1 - value1) * (1 - value2)) * amount;
        case 'overlay':
            return value1 < 0.5
                ? 2 * value1 * value2 * amount + value1 * (1 - amount)
                : 1 - 2 * (1 - value1) * (1 - value2) * amount + value1 * (1 - amount);
        case 'difference':
            return value1 * (1 - amount) + Math.abs(value1 - value2) * amount;
        case 'noise':
            return value1 + (Math.random() - 0.5) * amount;
        default:
            return value1;
    }
}

// ============================================================
// 🎨 COR — Gradiente com interpolação linear real
// ============================================================
function lerpColor(c1, c2, t) {
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * t),
        g: Math.round(c1.g + (c2.g - c1.g) * t),
        b: Math.round(c1.b + (c2.b - c1.b) * t)
    };
}

export function getColor(value, colorMode, colors) {
    // Garante que temos pelo menos 4 cores (fallback branco/cinza)
    const c = [
        colors[0] || { r: 255, g: 255, b: 255 },
        colors[1] || { r: 170, g: 170, b: 170 },
        colors[2] || { r: 85,  g: 85,  b: 85  },
        colors[3] || { r: 0,   g: 0,   b: 0   }
    ];

    value = Math.max(0, Math.min(1, value));

    switch (colorMode) {
        case 'gradient': {
            // Interpolação linear real entre 4 cores (3 segmentos iguais)
            const steps = c.length - 1;          // 3
            const seg   = 1 / steps;             // 0.333...
            const idx   = Math.min(Math.floor(value / seg), steps - 1);
            const t     = (value - idx * seg) / seg;
            return lerpColor(c[idx], c[idx + 1], t);
        }
        case 'noise': {
            const r = Math.min(255, Math.max(0, Math.floor((value + noise(value * 10, 0, 0)) * 127.5)));
            const g = Math.min(255, Math.max(0, Math.floor((value + noise(0, value * 10, 1)) * 127.5)));
            const b = Math.min(255, Math.max(0, Math.floor((value + noise(value * 10, value * 10, 2)) * 127.5)));
            return { r, g, b };
        }
        case 'bands': {
            const band = Math.floor(value * 4);
            return c[band % 4];
        }
        case 'spots':
            return Math.sin(value * 20) > 0 ? c[0] : c[1];
        case 'rainbow': {
            const hue = value * 360;
            return hslToRgb(hue, 80, 50);
        }
        default:
            return c[0];
    }
}
