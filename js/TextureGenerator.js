// js/TextureGenerator.js - Versão 3.0 (Universal: Procedural + Pixel Matrix)

const TextureGenerator = {
    cache: {},

    // =========================================================================
    // 🛠️ FERRAMENTAS MATEMÁTICAS (Para o modo Procedural Clássico)
    // =========================================================================
    permutation: (() => {
        const p = [];
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        const pp = [];
        for (let i = 0; i < 256; i++) pp[i] = p[i];
        for (let i = 0; i < 256; i++) pp[256 + i] = p[i];
        return pp;
    })(),

    fade: function(t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    lerp: function(t, a, b) { return a + t * (b - a); },
    
    grad: function(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    },

    noise: function(x, y, seed) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const a = this.permutation[X + seed % 255] + Y;
        const b = this.permutation[X + 1 + seed % 255] + Y;
        
        const aa = this.permutation[a] || 0;
        const ab = this.permutation[a+1] || 0;
        const ba = this.permutation[b] || 0;
        const bb = this.permutation[b+1] || 0;

        return this.lerp(v,
            this.lerp(u, this.grad(aa, x, y), this.grad(ab, x - 1, y)),
            this.lerp(u, this.grad(ba, x, y - 1), this.grad(bb, x - 1, y - 1))
        );
    },

    getPatternValue: function(x, y, params, textureType) {
        let value = 0;
        const seed = params.seed || 1;
        const scale = params.scale || 50;

        switch(textureType) {
            case 'stone':
                value = Math.abs(this.noise(x / scale, y / scale, seed));
                value = Math.pow(value, 1.5);
                break;
            case 'wood':
                const dist = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
                value = Math.sin(dist * scale + this.noise(x, y, seed) * 10) * 0.5 + 0.5;
                break;
            case 'earth':
            case 'clouds':
                value = (this.noise(x / scale, y / scale, seed) + 1) * 0.5;
                if(textureType === 'clouds') value = Math.pow(value, 2);
                break;
            case 'marble':
                const marble = x / scale + this.noise(x / scale * 0.5, y / scale * 0.5, seed) * 4;
                value = Math.abs(Math.sin(marble)) * 0.8 + 0.2;
                break;
            case 'metal':
                value = Math.sin(x * scale) * Math.cos(y * scale) * 0.5 + 0.5;
                value += this.noise(x * 5, y * 5, seed) * 0.2;
                break;
            case 'water':
                value = Math.sin(x * scale + this.noise(x * 2, y * 2, seed) * 3) * Math.cos(y * scale + this.noise(x * 2, y * 2, seed + 1) * 3) * 0.5 + 0.5;
                break;
            case 'lava':
                value = Math.abs(Math.sin(x * scale * 0.3) * Math.cos(y * scale * 0.3)) * 0.8;
                value += this.noise(x * 10, y * 10, seed) * 0.2;
                break;
            case 'grass':
                value = this.noise(x / scale, y / scale, seed) * 0.7 + 0.3;
                value += Math.sin(x * scale * 2) * 0.1;
                break;
            default: // noise
                value = this.noise(x / scale, y / scale, seed) * 0.5 + 0.5;
        }
        return Math.max(0, Math.min(1, value));
    },

    applyEffect: function(x, y, baseValue, effect, params) {
        const seed = params.seed || 1;
        const scale = params.scale || 50;

        switch(effect) {
            case 'depth': return baseValue + this.noise(x * 20, y * 20, seed + 1) * 0.3;
            case 'glow': 
                const glow = Math.sin(x * 10) * Math.cos(y * 10) * 0.2;
                return baseValue + glow;
            case 'cracks':
                const crack = this.noise(x * 50, y * 50, seed + 2);
                return baseValue * (1 - Math.abs(crack * 0.3));
            case 'waves':
                const wave = Math.sin((x + y) * scale * 0.5) * 0.3;
                return baseValue + wave;
            case 'cells':
                const cell = Math.abs(this.noise(x * 15, y * 15, seed + 3));
                return baseValue * (0.7 + cell * 0.3);
            case 'crystals':
                const crystal = Math.abs(Math.sin(x * 25) * Math.cos(y * 25));
                return baseValue * (0.6 + crystal * 0.4);
            default: return baseValue;
        }
    },

    blend: function(v1, v2, mode, amount) {
        amount = parseFloat(amount);
        switch(mode) {
            case 'add': return v1 * (1 - amount) + (v1 + v2) * amount * 0.5;
            case 'multiply': return v1 * (1 - amount) + (v1 * v2) * amount;
            case 'screen': return v1 * (1 - amount) + (1 - (1 - v1) * (1 - v2)) * amount;
            case 'difference': return v1 * (1 - amount) + Math.abs(v1 - v2) * amount;
            default: return v1;
        }
    },

    parseColor: function(rgbString) {
        if (!rgbString) return {r:0, g:0, b:0};
        if (rgbString.startsWith('#')) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgbString);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r:0, g:0, b:0 };
        }
        const match = rgbString.match(/\d+/g);
        if (!match) return {r:0, g:0, b:0};
        return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
    },

    lerpColor: function(c1, c2, t) {
        return {
            r: Math.round(c1.r + (c2.r - c1.r) * t),
            g: Math.round(c1.g + (c2.g - c1.g) * t),
            b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
    },

    getColorFromValue: function(value, mode, colors) {
        if(mode === 'gradient' && colors.length >= 2) {
            value = Math.max(0, Math.min(1, value));
            
            // Lógica para gradiente com múltiplas cores (n-steps)
            const steps = colors.length - 1;
            const stepSize = 1 / steps;
            
            const currentStep = Math.min(Math.floor(value / stepSize), steps - 1);
            const nextStep = currentStep + 1;
            
            const t = (value - (currentStep * stepSize)) / stepSize;
            
            return this.lerpColor(colors[currentStep], colors[nextStep], t);
        }
        return colors[0] || {r:255, g:255, b:255};
    },

    // =========================================================================
    // 🚀 MOTOR DE RENDERIZAÇÃO UNIVERSAL
    // =========================================================================
    createTexture: function(recipe) {
        // Cache para performance
        const cacheKey = JSON.stringify(recipe);
        if (this.cache[cacheKey]) return this.cache[cacheKey];

        const size = 256; 
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // =====================================================================
        // MODO 1: PIXEL MATRIX (Para fotos importadas do Camera Projection)
        // =====================================================================
        if (recipe.type === 'pixel_matrix' && recipe.pixelData) {
            // Desativa suavização para manter o estilo "Voxel/Pixel Art" nítido
            ctx.imageSmoothingEnabled = false;
            
            const matrix = recipe.pixelData;
            const gridHeight = matrix.length;
            const gridWidth = matrix[0].length; // Assume matriz retangular
            
            // Calcula o tamanho de cada "tijolo" da matriz no canvas final
            const scaleX = size / gridWidth;
            const scaleY = size / gridHeight;

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    const color = matrix[y][x];
                    if (color) {
                        ctx.fillStyle = color;
                        // Math.ceil garante que não fiquem linhas brancas entre pixels
                        ctx.fillRect(
                            x * scaleX, 
                            y * scaleY, 
                            Math.ceil(scaleX), 
                            Math.ceil(scaleY)
                        );
                    }
                }
            }

            const texture = new THREE.CanvasTexture(canvas);
            // IMPORTANTE: NearestFilter mantém o visual pixelado/retrô
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            
            this.cache[cacheKey] = texture;
            return texture;
        }

        // =====================================================================
        // MODO 2: PROCEDURAL CLÁSSICO (Perlin Noise, Madeira, Pedra, etc.)
        // =====================================================================
        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;

        const params = recipe.parameters || {};
        const colorsRaw = recipe.colors || ['#ffffff', '#aaaaaa', '#555555', '#000000'];
        const colors = colorsRaw.map(c => this.parseColor(c));
        const primType = recipe.textures?.primary || 'noise';
        const secType = recipe.textures?.secondary || 'stone';
        const effects = recipe.effects || [];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const i = (y * size + x) * 4;
                
                const nx = x / size;
                const ny = y / size;

                const dx = nx + this.noise(x * 0.01, y * 0.01, params.seed) * (params.distortion || 0);
                const dy = ny + this.noise(x * 0.01, y * 0.01, params.seed + 100) * (params.distortion || 0);

                let v1 = this.getPatternValue(dx * size, dy * size, params, primType);
                let v2 = this.getPatternValue(dx * size, dy * size, params, secType);

                let value = this.blend(v1, v2, recipe.textures?.blend?.mode, recipe.textures?.blend?.amount);

                effects.forEach(effect => {
                    value = this.applyEffect(nx, ny, value, effect, params);
                });

                value = ((value - 0.5) * (params.contrast || 1) + 0.5);
                
                const c = this.getColorFromValue(value, recipe.colorMode || 'gradient', colors);

                data[i] = c.r;
                data[i + 1] = c.g;
                data[i + 2] = c.b;
                data[i + 3] = 255; 
            }
        }

        ctx.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // Para procedurais, usamos linear para suavidade, ou nearest para retro
        texture.magFilter = params.pixelArt ? THREE.NearestFilter : THREE.LinearFilter;
        texture.minFilter = params.pixelArt ? THREE.NearestFilter : THREE.LinearMipMapLinearFilter;
        
        this.cache[cacheKey] = texture;
        return texture;
    }
};

// Export para Node.js ou ambientes modulares (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextureGenerator;
}