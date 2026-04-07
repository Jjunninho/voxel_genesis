// js/shapes.js - VERSÃO CORRIGIDA E COMPLETA

const ShapeRegistry = {
    cube: {
        icon: '⬛',
        name: 'Cubo',
        params: [
            { name: 'size', label: 'Tamanho', default: 5, min: 1, max: 15 }
        ],
        generate: (params) => {
            const size = params.size;
            const half = Math.floor(size / 2);
            for (let x = -half; x <= half; x++) {
                for (let y = 0; y < size; y++) {
                    for (let z = -half; z <= half; z++) {
                        addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                    }
                }
            }
        }
    },
    plane: {
        icon: '⬜',
        name: 'Plano',
        params: [
            { name: 'width', label: 'Largura', default: 8, min: 2, max: 20 },
            { name: 'depth', label: 'Profundidade', default: 8, min: 2, max: 20 }
        ],
        generate: (params) => {
            const hw = Math.floor(params.width / 2);
            const hd = Math.floor(params.depth / 2);
            for (let x = -hw; x <= hw; x++) {
                for (let z = -hd; z <= hd; z++) {
                    addBlockAt(x, 0.5, z, currentColor, 'cube');
                }
            }
        }
    },
    sphere: {
        icon: '⚪',
        name: 'Esfera',
        params: [
            { name: 'radius', label: 'Raio', default: 4, min: 2, max: 10 }
        ],
        generate: (params) => {
            const r = params.radius;
            const rSquared = r * r;
            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    for (let z = -r; z <= r; z++) {
                        const distSquared = x*x + y*y + z*z;
                        if (distSquared <= rSquared) {
                            addBlockAt(x, y + r + 0.5, z, currentColor, 'sphere');
                        }
                    }
                }
            }
        }
    },
    cylinder: {
        icon: '🛢️',
        name: 'Cilindro',
        params: [
            { name: 'radius', label: 'Raio', default: 3, min: 1, max: 8 },
            { name: 'height', label: 'Altura', default: 6, min: 2, max: 15 }
        ],
        generate: (params) => {
            const r = params.radius;
            const h = params.height;
            const rSquared = r * r;
            for (let x = -r; x <= r; x++) {
                for (let z = -r; z <= r; z++) {
                    const distSquared = x*x + z*z;
                    if (distSquared <= rSquared) {
                        for (let y = 0; y < h; y++) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cylinder');
                        }
                    }
                }
            }
        }
    },
    cone: {
        icon: '🔺',
        name: 'Cone',
        params: [
            { name: 'radius', label: 'Raio Base', default: 4, min: 2, max: 10 },
            { name: 'height', label: 'Altura', default: 8, min: 3, max: 15 }
        ],
        generate: (params) => {
            const baseR = params.radius;
            const h = params.height;
            for (let y = 0; y < h; y++) {
                const ratio = 1 - (y / h);
                const currentR = baseR * ratio;
                const rSquared = currentR * currentR;
                for (let x = -baseR; x <= baseR; x++) {
                    for (let z = -baseR; z <= baseR; z++) {
                        const distSquared = x*x + z*z;
                        if (distSquared <= rSquared) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cone');
                        }
                    }
                }
            }
        }
    },
	
    torus: {
        icon: '🍩',
        name: 'Toro',
        params: [
            { name: 'majorRadius', label: 'Raio Maior', default: 5, min: 3, max: 10 },
            { name: 'minorRadius', label: 'Raio Menor', default: 2, min: 1, max: 4 }
        ],
        generate: (params) => {
            const R = params.majorRadius;
            const r = params.minorRadius;
            const maxDist = R + r;
            for (let x = -maxDist; x <= maxDist; x++) {
                for (let y = -r; y <= r; y++) {
                    for (let z = -maxDist; z <= maxDist; z++) {
                        const distFromCenter = Math.sqrt(x*x + z*z);
                        const distFromTube = Math.sqrt((distFromCenter - R)**2 + y*y);
                        if (distFromTube <= r) {
                            addBlockAt(x, y + r + 0.5, z, currentColor, 'torus');
                        }
                    }
                }
            }
        }
    },
	
	// Inicio da Insersão dos sólidos platonicos
	
	tetrahedron: {
        icon: '▲',
        name: 'Tetraedro',
        params: [
            { name: 'radius', label: 'Raio', default: 8, min: 4, max: 15 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const r = params.radius;
            const color = currentColor || '#FF4500';
            
            // O Tetraedro é definido por 4 planos
            // Para voxel art, centralizamos em 0
            const scale = r; 

            for (let i = -r; i <= r; i++) {
                for (let j = -r; j <= r; j++) {
                    for (let k = -r; k <= r; k++) {
                        // Equações dos 4 planos do tetraedro
                        // x + y + z <= r
                        // x - y - z <= r
                        // -x + y - z <= r
                        // -x - y + z <= r
                        
                        const c1 = i + j + k <= scale;
                        const c2 = i - j - k <= scale;
                        const c3 = -i + j - k <= scale;
                        const c4 = -i - j + k <= scale;

                        if (c1 && c2 && c3 && c4) {
                            addBlockAt(x + i, y + j + 0.5, z + k, color, 'pyramid'); // Pyramid combina visualmente
                        }
                    }
                }
            }
        }
    },

    hexahedron: {
        icon: '🧊',
        name: 'Hexaedro (Cubo)',
        params: [
            { name: 'size', label: 'Tamanho da Aresta', default: 8, min: 2, max: 20 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const s = params.size;
            const half = Math.floor(s / 2);
            const color = currentColor || '#4682B4';

            // O cubo é o mais simples: limites em X, Y e Z
            for (let i = -half; i <= half; i++) {
                for (let j = -half; j <= half; j++) {
                    for (let k = -half; k <= half; k++) {
                        addBlockAt(x + i, y + j + 0.5, z + k, color, 'cube');
                    }
                }
            }
        }
    },

    octahedron: {
        icon: '◆',
        name: 'Octaedro',
        params: [
            { name: 'radius', label: 'Raio', default: 8, min: 4, max: 16 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const r = params.radius;
            const color = currentColor || '#32CD32';

            // O Octaedro é definido pela Distância de Manhattan
            // |x| + |y| + |z| <= r
            
            for (let i = -r; i <= r; i++) {
                for (let j = -r; j <= r; j++) {
                    for (let k = -r; k <= r; k++) {
                        
                        const manhattanDist = Math.abs(i) + Math.abs(j) + Math.abs(k);
                        
                        if (manhattanDist <= r) {
                            addBlockAt(x + i, y + j + 0.5, z + k, color, 'octahedron');
                        }
                    }
                }
            }
        }
    },

    dodecahedron: {
        icon: '⬟',
        name: 'Dodecaedro',
        params: [
            { name: 'radius', label: 'Raio', default: 7, min: 4, max: 14 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const r = params.radius;
            const color = currentColor || '#9370DB';
            const phi = 1.61803398875; // Proporção Áurea
            const limit = r * 1.2; // Bounding box um pouco maior

            for (let i = -limit; i <= limit; i++) {
                for (let j = -limit; j <= limit; j++) {
                    for (let k = -limit; k <= limit; k++) {
                        
                        // O Dodecaedro é a interseção de 12 planos baseados em Phi
                        // Definição geométrica simplificada para voxels:
                        
                        // 1. Deve estar dentro de um cubo delimitador (esfera aproximada)
                        // x^2 + y^2 + z^2 < r^2 * 1.3 (Otimização)
                        if (i*i + j*j + k*k > r*r * 1.4) continue;

                        const absX = Math.abs(i);
                        const absY = Math.abs(j);
                        const absZ = Math.abs(k);

                        // As 12 faces do dodecaedro são definidas por:
                        // φ * |x| + |y| <= r * φ^2
                        // φ * |y| + |z| <= r * φ^2
                        // φ * |z| + |x| <= r * φ^2
                        // (Nota: Ajustamos a constante para voxel art ficar preenchido)
                        const scaleFactor = r * (phi * phi) * 0.85; // 0.85 para ajustar visualmente

                        const c1 = phi * absX + absY <= scaleFactor;
                        const c2 = phi * absY + absZ <= scaleFactor;
                        const c3 = phi * absZ + absX <= scaleFactor;
                        
                        // Também limitado pelas faces de um cubo interno maior
                        const c4 = absX <= r;
                        const c5 = absY <= r;
                        const c6 = absZ <= r;

                        if (c1 && c2 && c3) {
                             addBlockAt(x + i, y + j + 0.5, z + k, color, 'dodecahedron');
                        }
                    }
                }
            }
        }
    },

    icosahedron: {
        icon: '◈',
        name: 'Icosaedro',
        params: [
            { name: 'radius', label: 'Raio', default: 7, min: 4, max: 14 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const r = params.radius;
            const color = currentColor || '#00CED1';
            const phi = 1.61803398875;
            const limit = r;

            for (let i = -limit; i <= limit; i++) {
                for (let j = -limit; j <= limit; j++) {
                    for (let k = -limit; k <= limit; k++) {
                        
                        // Otimização esférica
                        if (i*i + j*j + k*k > r*r * 1.2) continue;

                        const absX = Math.abs(i);
                        const absY = Math.abs(j);
                        const absZ = Math.abs(k);

                        // O Icosaedro é a interseção de 20 planos.
                        // As condições principais envolvem a Proporção Áurea:
                        
                        // Fator de escala visual
                        const S = r * 0.85;

                        // Condição 1: Planos do Octaedro (pyramidais)
                        // |x| + |y| + |z| <= r * constante
                        const cOcta = (absX + absY + absZ) <= S * phi * 1.7;

                        // Condição 2: Planos Áureos
                        // |x| + phi * |z| <= S * phi^2
                        // |y| + phi * |x| <= S * phi^2
                        // |z| + phi * |y| <= S * phi^2
                        const limitGolden = S * (phi * phi);
                        
                        const c1 = absX + phi * absZ <= limitGolden;
                        const c2 = absY + phi * absX <= limitGolden;
                        const c3 = absZ + phi * absY <= limitGolden;

                        if (cOcta && c1 && c2 && c3) {
                            addBlockAt(x + i, y + j + 0.5, z + k, color, 'icosahedron');
                        }
                    }
                }
            }
        }
    },	
	// Final da inserção dos sólidos platônicos
    pyramid: {
        icon: '🔺',
        name: 'Pirâmide',
        params: [
            { name: 'baseSize', label: 'Tamanho Base', default: 7, min: 3, max: 15 },
            { name: 'height', label: 'Altura', default: 7, min: 3, max: 15 }
        ],
        generate: (params) => {
            const base = params.baseSize;
            const h = params.height;
            for (let y = 0; y < h; y++) {
                const ratio = 1 - (y / h);
                const currentSize = Math.ceil(base * ratio);
                const half = Math.floor(currentSize / 2);
                for (let x = -half; x <= half; x++) {
                    for (let z = -half; z <= half; z++) {
                        addBlockAt(x, y + 0.5, z, currentColor, 'pyramid');
                    }
                }
            }
        }
    },
    stairs: {
        icon: '🔶',
        name: 'Escada',
        params: [
            { name: 'steps', label: 'Degraus', default: 8, min: 3, max: 15 },
            { name: 'width', label: 'Largura', default: 5, min: 3, max: 10 }
        ],
        generate: (params) => {
            const steps = params.steps;
            const width = params.width;
            const hw = Math.floor(width / 2);
            for (let step = 0; step < steps; step++) {
                for (let x = -hw; x <= hw; x++) {
                    for (let z = 0; z <= step; z++) {
                        for (let y = 0; y <= step; y++) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                        }
                    }
                }
            }
        }
    },
    arch: {
        icon: '🌉',
        name: 'Arco',
        params: [
            { name: 'width', label: 'Largura', default: 7, min: 5, max: 12 },
            { name: 'height', label: 'Altura', default: 6, min: 4, max: 10 },
            { name: 'thickness', label: 'Espessura', default: 2, min: 1, max: 4 }
        ],
        generate: (params) => {
            const w = params.width;
            const h = params.height;
            const t = params.thickness;
            const hw = Math.floor(w / 2);
            const r = hw;
            
            // Pilares
            for (let x = -hw; x <= -hw + t - 1; x++) {
                for (let z = 0; z < t; z++) {
                    for (let y = 0; y < h; y++) {
                        addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                    }
                }
            }
            for (let x = hw - t + 1; x <= hw; x++) {
                for (let z = 0; z < t; z++) {
                    for (let y = 0; y < h; y++) {
                        addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                    }
                }
            }
            
            // Arco superior
            for (let x = -hw; x <= hw; x++) {
                for (let z = 0; z < t; z++) {
                    const distFromCenter = Math.abs(x);
                    const archY = Math.floor(Math.sqrt(Math.max(0, r*r - distFromCenter*distFromCenter)));
                    const y = h - r + archY;
                    if (y >= h - r) {
                        addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                    }
                }
            }
        }
    },
    tower: {
        icon: '🗼',
        name: 'Torre',
        params: [
            { name: 'radius', label: 'Raio', default: 3, min: 2, max: 6 },
            { name: 'height', label: 'Altura', default: 12, min: 5, max: 20 }
        ],
        generate: (params) => {
            const r = params.radius;
            const h = params.height;
            const rSquared = r * r;
            
            // Corpo da torre
            for (let x = -r; x <= r; x++) {
                for (let z = -r; z <= r; z++) {
                    const distSquared = x*x + z*z;
                    if (distSquared <= rSquared) {
                        for (let y = 0; y < h; y++) {
                            // Torre oca
                            if (distSquared >= (r-1)*(r-1) || y === 0) {
                                addBlockAt(x, y + 0.5, z, currentColor, 'cylinder');
                            }
                        }
                    }
                }
            }
            
            // Topo (cone)
            for (let y = 0; y < r; y++) {
                const ratio = 1 - (y / r);
                const currentR = r * ratio;
                const rSquared = currentR * currentR;
                for (let x = -r; x <= r; x++) {
                    for (let z = -r; z <= r; z++) {
                        const distSquared = x*x + z*z;
                        if (distSquared <= rSquared) {
                            addBlockAt(x, h + y + 0.5, z, currentColor, 'cone');
                        }
                    }
                }
            }
        }
    },
    helix: {
        icon: '🌀',
        name: 'Hélice',
        params: [
            { name: 'radius', label: 'Raio', default: 4, min: 2, max: 8 },
            { name: 'height', label: 'Altura', default: 12, min: 5, max: 20 },
            { name: 'turns', label: 'Voltas', default: 3, min: 1, max: 6 }
        ],
        generate: (params) => {
            const r = params.radius;
            const h = params.height;
            const turns = params.turns;
            const steps = h * 10;
            
            for (let i = 0; i < steps; i++) {
                const t = (i / steps) * turns * Math.PI * 2;
                const x = Math.round(r * Math.cos(t));
                const z = Math.round(r * Math.sin(t));
                const y = Math.round((i / steps) * h);
                addBlockAt(x, y + 0.5, z, currentColor, 'sphere');
            }
        }
    },
    wave: {
        icon: '🌊',
        name: 'Onda',
        params: [
            { name: 'length', label: 'Comprimento', default: 12, min: 6, max: 20 },
            { name: 'amplitude', label: 'Amplitude', default: 3, min: 2, max: 6 },
            { name: 'frequency', label: 'Frequência', default: 2, min: 1, max: 4 }
        ],
        generate: (params) => {
            const len = params.length;
            const amp = params.amplitude;
            const freq = params.frequency;
            
            for (let x = 0; x < len; x++) {
                const t = (x / len) * freq * Math.PI * 2;
                const y = Math.round(amp * Math.sin(t) + amp);
                for (let z = -2; z <= 2; z++) {
                    addBlockAt(x - Math.floor(len/2), y + 0.5, z, currentColor, 'sphere');
                }
            }
        }
    },
    
    // ============================================
    // 🆕 FORMAS NOVAS QUE ESTAVAM FALTANDO
    // ============================================
    
    spiralStairs: {
        icon: '🌀',
        name: 'Escada Espiral',
        params: [
            { name: 'steps', label: 'Degraus', default: 16, min: 8, max: 30 },
            { name: 'radius', label: 'Raio', default: 4, min: 3, max: 8 }
        ],
        generate: (params) => {
            const steps = params.steps;
            const radius = params.radius;
            const anglePerStep = (Math.PI * 2) / steps;
            
            for (let i = 0; i < steps; i++) {
                const angle = anglePerStep * i;
                const x = Math.round(radius * Math.cos(angle));
                const z = Math.round(radius * Math.sin(angle));
                const y = i;
                
                // Degrau (2x2 blocos)
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        addBlockAt(x + dx, y + 0.5, z + dz, currentColor, 'cube');
                    }
                }
                
                // Pilar central
                if (i === 0 || Math.abs(x) <= 1 && Math.abs(z) <= 1) {
                    addBlockAt(0, y + 0.5, 0, currentColor, 'cylinder');
                }
            }
        }
    },
    
    dome: {
        icon: '🏟️',
        name: 'Domo',
        params: [
            { name: 'radius', label: 'Raio', default: 6, min: 4, max: 12 }
        ],
        generate: (params) => {
            const r = params.radius;
            const rSquared = r * r;
            
            for (let x = -r; x <= r; x++) {
                for (let z = -r; z <= r; z++) {
                    const distSquared = x*x + z*z;
                    if (distSquared <= rSquared) {
                        // Calcula altura baseada na esfera
                        const y = Math.floor(Math.sqrt(Math.max(0, rSquared - distSquared)));
                        
                        // Apenas a casca superior (oco)
                        const innerR = r - 1;
                        const innerDistSquared = distSquared;
                        const innerY = Math.floor(Math.sqrt(Math.max(0, innerR*innerR - innerDistSquared)));
                        
                        if (y > innerY || distSquared >= (r-1)*(r-1)) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'sphere');
                        }
                    }
                }
            }
        }
    },
    
    tree: {
        icon: '🌲',
        name: 'Árvore',
        params: [
            { name: 'height', label: 'Altura', default: 10, min: 6, max: 20 }
        ],
        generate: (params) => {
            const h = params.height;
            const trunkHeight = Math.floor(h * 0.5);
            const crownHeight = h - trunkHeight;
            
            // Tronco
            for (let y = 0; y < trunkHeight; y++) {
                addBlockAt(0, y + 0.5, 0, '#8B4513', 'cylinder'); // Marrom
            }
            
            // Copa (formato cônico)
            const maxRadius = Math.max(2, Math.floor(crownHeight * 0.6));
            for (let y = 0; y < crownHeight; y++) {
                const ratio = 1 - (y / crownHeight);
                const currentR = Math.ceil(maxRadius * ratio);
                const rSquared = currentR * currentR;
                
                for (let x = -currentR; x <= currentR; x++) {
                    for (let z = -currentR; z <= currentR; z++) {
                        const distSquared = x*x + z*z;
                        if (distSquared <= rSquared) {
                            // Densidade aleatória para parecer mais natural
                            if (Math.random() > 0.3) {
                                addBlockAt(x, trunkHeight + y + 0.5, z, '#228B22', 'sphere'); // Verde
                            }
                        }
                    }
                }
            }
        }
    },
    
    castle: {
        icon: '🏰',
        name: 'Castelo',
        params: [
            { name: 'size', label: 'Tamanho', default: 8, min: 6, max: 15 }
        ],
        generate: (params) => {
            const size = params.size;
            const wallHeight = Math.floor(size * 0.6);
            const towerHeight = Math.floor(size * 0.9);
            const towerRadius = Math.max(2, Math.floor(size * 0.15));
            
            // Paredes externas (oco)
            const half = Math.floor(size / 2);
            for (let y = 0; y < wallHeight; y++) {
                for (let x = -half; x <= half; x++) {
                    for (let z = -half; z <= half; z++) {
                        // Apenas bordas
                        if (x === -half || x === half || z === -half || z === half) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                        }
                    }
                }
            }
            
            // Torres nos 4 cantos
            const corners = [
                [-half, -half],
                [half, -half],
                [-half, half],
                [half, half]
            ];
            
            corners.forEach(([cx, cz]) => {
                const rSquared = towerRadius * towerRadius;
                for (let x = cx - towerRadius; x <= cx + towerRadius; x++) {
                    for (let z = cz - towerRadius; z <= cz + towerRadius; z++) {
                        const distSquared = (x - cx)**2 + (z - cz)**2;
                        if (distSquared <= rSquared) {
                            for (let y = 0; y < towerHeight; y++) {
                                // Torres ocas
                                if (distSquared >= (towerRadius-1)**2 || y === 0) {
                                    addBlockAt(x, y + 0.5, z, currentColor, 'cylinder');
                                }
                            }
                            
                            // Topo cônico
                            for (let y = 0; y < towerRadius; y++) {
                                const ratio = 1 - (y / towerRadius);
                                const currentR = towerRadius * ratio;
                                const coneDistSquared = (x - cx)**2 + (z - cz)**2;
                                if (coneDistSquared <= currentR * currentR) {
                                    addBlockAt(x, towerHeight + y + 0.5, z, currentColor, 'cone');
                                }
                            }
                        }
                    }
                }
            });
            
            // Portão (entrada)
            const gateWidth = Math.max(2, Math.floor(size * 0.2));
            const gateHeight = Math.max(3, Math.floor(wallHeight * 0.6));
            for (let x = -Math.floor(gateWidth/2); x <= Math.floor(gateWidth/2); x++) {
                for (let y = 1; y < gateHeight; y++) {
                    addBlockAt(x, y + 0.5, -half, '#8B4513', 'cube'); // Portão marrom
                }
            }
        }
    },
    
    bridge: {
        icon: '🌉',
        name: 'Ponte',
        params: [
            { name: 'length', label: 'Comprimento', default: 12, min: 6, max: 20 },
            { name: 'width', label: 'Largura', default: 5, min: 3, max: 10 },
            { name: 'archHeight', label: 'Altura do Arco', default: 4, min: 2, max: 8 }
        ],
        generate: (params) => {
            const length = params.length;
            const width = params.width;
            const archHeight = params.archHeight;
            const hw = Math.floor(width / 2);
            const hl = Math.floor(length / 2);
            
            // Base da ponte
            for (let x = -hw; x <= hw; x++) {
                for (let z = -hl; z <= hl; z++) {
                    addBlockAt(x, 0.5, z, currentColor, 'cube');
                }
            }
            
            // Arcos laterais
            for (let z = -hl; z <= hl; z++) {
                const ratio = Math.abs(z) / hl;
                const archY = Math.floor(archHeight * (1 - ratio * ratio));
                for (let y = 1; y <= archY; y++) {
                    for (let x = -hw; x <= hw; x++) {
                        if (x === -hw || x === hw) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                        }
                    }
                }
            }
        }
    },
    
    lShapedStairs: {
        icon: '↩️',
        name: 'Escada em L',
        params: [
            { name: 'stepsPerLeg', label: 'Degraus por Perna', default: 6, min: 3, max: 12 },
            { name: 'width', label: 'Largura', default: 3, min: 2, max: 6 }
        ],
        generate: (params) => {
            const steps = params.stepsPerLeg;
            const width = params.width;
            const hw = Math.floor(width / 2);
            
            // Primeira perna (ao longo do eixo Z)
            for (let step = 0; step < steps; step++) {
                for (let x = -hw; x <= hw; x++) {
                    for (let z = 0; z <= step; z++) {
                        for (let y = 0; y <= step; y++) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                        }
                    }
                }
            }
            
            // Patamar (plataforma de transição)
            for (let x = -hw; x <= hw; x++) {
                for (let z = steps; z <= steps + width; z++) {
                    addBlockAt(x, steps + 0.5, z, currentColor, 'cube');
                }
            }
            
            // Segunda perna (ao longo do eixo X)
            for (let step = 1; step <= steps; step++) {
                for (let z = steps; z <= steps + width; z++) {
                    for (let x = hw; x <= hw + step; x++) {
                        for (let y = 0; y <= steps + step; y++) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                        }
                    }
                }
            }
        }
    },
    
    figurine: {
        icon: '🕴️',
        name: 'Estatueta',
        params: [
            { name: 'height', label: 'Altura', default: 10, min: 6, max: 20 }
        ],
        generate: (params) => {
            const h = params.height;
            const headRadius = Math.max(1, Math.floor(h / 10));
            const bodyHeight = Math.floor(h * 0.5);
            const legHeight = Math.floor(h * 0.3);
            const armSpan = Math.floor(h * 0.4);
            
            // Cabeça (esfera)
            const headY = bodyHeight + legHeight;
            for (let x = -headRadius; x <= headRadius; x++) {
                for (let y = 0; y <= headRadius*2; y++) {
                    for (let z = -headRadius; z <= headRadius; z++) {
                        const dist = Math.sqrt(x*x + (y-headRadius)*(y-headRadius) + z*z);
                        if (dist <= headRadius) {
                            addBlockAt(x, headY + y + 0.5, z, currentColor, 'sphere');
                        }
                    }
                }
            }
            
            // Corpo
            for (let y = 0; y < bodyHeight; y++) {
                for (let x = -1; x <= 1; x++) {
                    for (let z = -1; z <= 1; z++) {
                        if (Math.abs(x) + Math.abs(z) <= 2) {
                            addBlockAt(x, legHeight + y + 0.5, z, currentColor, 'cube');
                        }
                    }
                }
            }
            
            // Pernas
            for (let y = 0; y < legHeight; y++) {
                addBlockAt(-1, y + 0.5, 0, currentColor, 'cube');
                addBlockAt(1, y + 0.5, 0, currentColor, 'cube');
            }
            
            // Braços
            const armHeight = Math.floor(bodyHeight * 0.7) + legHeight;
            for (let x = -armSpan; x <= armSpan; x++) {
                if (Math.abs(x) > 1) {
                    addBlockAt(x, armHeight + 0.5, 0, currentColor, 'cube');
                }
            }
        }
    },
    
	fractalTree: {
		icon: '🌲',
		name: 'Árvore Fractal',
		params: [
			{ name: 'trunkHeight', label: 'Altura Tronco', default: 5, min: 3, max: 10 },
			{ name: 'crownLayers', label: 'Camadas Copa', default: 4, min: 2, max: 7 },
			{ name: 'branchiness', label: 'Ramificação', default: 0.6, min: 0.3, max: 1.0 }
		],
		generate: (params) => {
			const cx = 0, cy = 0, cz = 0;
			const trunkH = params.trunkHeight;
			const layers = params.crownLayers;
			const branch = params.branchiness;
			
			// ============ 1. TRONCO PRINCIPAL ============
			const trunkThickness = 0.4 + branch * 0.3;
			
			addBlockAt(
				cx, cy + trunkH / 2, cz,
				'#5D4037', // Marrom escuro
				'cylinder',
				{ x: trunkThickness, y: trunkH, z: trunkThickness }
			);
			
			// Textura de casca (anéis no tronco)
			const barkRings = Math.floor(trunkH / 1.5);
			for (let i = 0; i < barkRings; i++) {
				const ringY = cy + (i * trunkH) / barkRings;
				addBlockAt(
					cx, ringY, cz,
					'#4E342E',
					'torus',
					{ x: trunkThickness * 1.1, y: 0.1, z: trunkThickness * 1.1 }
				);
			}
			
			// ============ 2. COPA TRIANGULAR (CAMADAS) ============
			const crownStartY = cy + trunkH;
			const layerHeight = 1.5;
			
			for (let layer = 0; layer < layers; layer++) {
				const progress = layer / layers;
				const layerY = crownStartY + layer * layerHeight;
				
				// Raio diminui conforme sobe
				const baseRadius = (3 - progress * 2) * branch;
				const coneHeight = layerHeight * 1.8;
				
				// Cor varia (gradiente do escuro pra claro)
				const greenValue = 100 + layer * 20;
				const leafColor = `rgb(${greenValue * 0.4}, ${greenValue}, ${greenValue * 0.5})`;
				
				// Cone principal da camada
				addBlockAt(
					cx, layerY + coneHeight / 2, cz,
					leafColor,
					'cone',
					{ x: baseRadius, y: coneHeight, z: baseRadius }
				);
				
				// ============ 3. RAMIFICAÇÕES (TRIÂNGULOS LATERAIS) ============
				const branches = 4 + Math.floor(layer * 1.5);
				
				for (let b = 0; b < branches; b++) {
					const angle = (b / branches) * Math.PI * 2 + layer * 0.5;
					const branchDist = baseRadius * (0.6 + Math.random() * 0.3);
					const branchSize = baseRadius * (0.3 + Math.random() * 0.2);
					
					const bx = cx + Math.cos(angle) * branchDist;
					const bz = cz + Math.sin(angle) * branchDist;
					const by = layerY + Math.random() * layerHeight;
					
					// Cone menor (galho)
					addBlockAt(
						bx, by, bz,
						leafColor,
						'cone',
						{ x: branchSize, y: branchSize * 1.5, z: branchSize },
						{ 
							x: (Math.random() - 0.5) * 0.5, 
							y: angle, 
							z: (Math.random() - 0.5) * 0.3 
						}
					);
				}
			}
			
			// ============ 4. TOPO PONTIAGUDO ============
			const topY = crownStartY + layers * layerHeight;
			addBlockAt(
				cx, topY + 0.8, cz,
				'#7CB342',
				'cone',
				{ x: 0.5, y: 1.2, z: 0.5 }
			);
			
			// Estrela/brilho no topo (opcional)
			addBlockAt(
				cx, topY + 1.5, cz,
				'#FFEB3B',
				'sphere',
				0.15
			);
			
			// ============ 5. FOLHAGEM DETALHADA (ESFERAS VERDES) ============
			const foliageDensity = Math.floor(10 * branch);
			
			for (let i = 0; i < foliageDensity; i++) {
				const fLayer = Math.floor(Math.random() * layers);
				const fY = crownStartY + fLayer * layerHeight + Math.random() * layerHeight;
				const fAngle = Math.random() * Math.PI * 2;
				const fDist = Math.random() * (3 - (fLayer / layers) * 2) * branch;
				
				const fx = cx + Math.cos(fAngle) * fDist;
				const fz = cz + Math.sin(fAngle) * fDist;
				
				addBlockAt(
					fx, fY, fz,
					'#4CAF50',
					'sphere',
					0.2 + Math.random() * 0.2
				);
			}
			
			// ============ 6. RAÍZES (BASE DO TRONCO) ============
			const roots = 5;
			for (let i = 0; i < roots; i++) {
				const rootAngle = (i / roots) * Math.PI * 2;
				const rootLength = 1 + Math.random() * 0.5;
				const rootThick = trunkThickness * 0.6;
				
				const rx = cx + Math.cos(rootAngle) * rootLength * 0.5;
				const rz = cz + Math.sin(rootAngle) * rootLength * 0.5;
				
				addBlockAt(
					rx, cy - 0.2, rz,
					'#6D4C41',
					'cylinder',
					{ x: rootThick, y: 0.4, z: rootThick },
					{ x: 0, y: rootAngle, z: Math.PI / 6 }
				);
			}
		}
	},
    
    dnaHelix: {
        icon: '🧬',
        name: 'Hélice de DNA',
        params: [
            { name: 'height', label: 'Altura', default: 15, min: 8, max: 25 },
            { name: 'radius', label: 'Raio', default: 3, min: 2, max: 6 }
        ],
        generate: (params) => {
            const h = params.height;
            const r = params.radius;
            const steps = h * 8;
            
            for (let i = 0; i < steps; i++) {
                const t = (i / steps) * Math.PI * 4; // 2 voltas completas
                const y = Math.round((i / steps) * h);
                
                // Hélice 1
                const x1 = Math.round(r * Math.cos(t));
                const z1 = Math.round(r * Math.sin(t));
                addBlockAt(x1, y + 0.5, z1, '#FF0000', 'sphere'); // Vermelho
                
                // Hélice 2 (180° defasada)
                const x2 = Math.round(r * Math.cos(t + Math.PI));
                const z2 = Math.round(r * Math.sin(t + Math.PI));
                addBlockAt(x2, y + 0.5, z2, '#0000FF', 'sphere'); // Azul
                
                // Conexões (cada 10 passos)
                if (i % 10 === 0) {
                    const steps2 = 5;
                    for (let j = 0; j <= steps2; j++) {
                        const ratio = j / steps2;
                        const cx = Math.round(x1 + (x2 - x1) * ratio);
                        const cz = Math.round(z1 + (z2 - z1) * ratio);
                        addBlockAt(cx, y + 0.5, cz, '#FFFFFF', 'cube'); // Branco
                    }
                }
            }
        }
    },
	
	hollowSphere: {
        icon: '🔮',
        name: 'Esfera Oca',
        params: [
            { name: 'radius', label: 'Raio Externo', default: 6, min: 4, max: 15 },
            { name: 'thickness', label: 'Espessura', default: 1, min: 1, max: 4 }
        ],
        generate: (params) => {
            const cx = 0, cy = 0, cz = 0;
            const r = params.radius;
            const t = params.thickness;
            const color = currentColor || '#FFFFFF';

            // Cálculos dos raios ao quadrado para performance (evita Raiz Quadrada no loop)
            const rOuterSq = r * r;
            
            // Raio interno = Raio - Espessura. 
            // Math.max garante que não fique negativo.
            const rInner = Math.max(0, r - t);
            const rInnerSq = rInner * rInner;

            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    for (let z = -r; z <= r; z++) {
                        
                        const distSq = x*x + y*y + z*z;

                        // Lógica da Casca:
                        // 1. Deve estar DENTRO do raio externo (distSq <= rOuterSq)
                        // 2. Deve estar FORA do raio interno (distSq >= rInnerSq)
                        if (distSq <= rOuterSq && distSq >= rInnerSq) {
                            addBlockAt(
                                cx + x, 
                                cy + r + y + 0.5, // Eleva para ficar acima do chão
                                cz + z, 
                                color, 
                                'sphere', // Usa esferas para acabamento suave (ou mude para 'cube')
                                1 // Escala
                            );
                        }
                    }
                }
            }
        }
    },
	
	hollowCone: {
        icon: '🌪️',
        name: 'Cone Oco',
        params: [
            { name: 'radius', label: 'Raio Base', default: 8, min: 3, max: 15 },
            { name: 'height', label: 'Altura', default: 12, min: 5, max: 25 },
            { name: 'thickness', label: 'Espessura', default: 1, min: 1, max: 3 }
        ],
        generate: (params) => {
            const cx = 0, cy = 0, cz = 0;
            const r = params.radius;
            const h = params.height;
            const t = params.thickness;
            const color = currentColor || '#FFD700';

            for (let y = 0; y < h; y++) {
                // Calcula o raio do cone nessa altura específica (Linear)
                // Na base (y=0) é 100%, no topo (y=h) é 0%
                const ratio = 1 - (y / h);
                
                // Raio Externo atual
                const currentROuter = r * ratio;
                const rOuterSq = currentROuter * currentROuter;

                // Raio Interno atual (Raio externo - Espessura)
                // Math.max(0) impede raio negativo no topo
                const currentRInner = Math.max(0, currentROuter - t);
                const rInnerSq = currentRInner * currentRInner;

                // Otimização: Limita o loop X/Z ao raio atual
                const limit = Math.ceil(currentROuter);

                for (let x = -limit; x <= limit; x++) {
                    for (let z = -limit; z <= limit; z++) {
                        
                        const distSq = x*x + z*z;

                        // Lógica da Casca Cônica:
                        // 1. Deve estar dentro do cone externo
                        // 2. Deve estar fora do cone interno (buraco)
                        if (distSq <= rOuterSq && distSq >= rInnerSq) {
                            addBlockAt(
                                cx + x, 
                                cy + y + 0.5, // Base no chão
                                cz + z, 
                                color, 
                                'cube', // Cubo preenche melhor paredes finas inclinadas
                                1
                            );
                        }
                    }
                }
            }
        }
    },
    
    heart: {
        icon: '❤️',
        name: 'Coração',
        params: [
            { name: 'size', label: 'Tamanho', default: 6, min: 4, max: 12 }
        ],
        generate: (params) => {
            const size = params.size;
            const scale = size / 6;
            
            for (let y = 0; y < size; y++) {
                for (let x = -size; x <= size; x++) {
                    for (let z = -size; z <= size; z++) {
                        const nx = x / scale;
                        const ny = (size - y) / scale;
                        const nz = z / scale;
                        
                        // Equação do coração em 3D
                        const value = Math.pow(nx*nx + (9/4)*(ny*ny) + nz*nz - 1, 3) - nx*nx*nz*nz*nz - (9/80)*(ny*ny)*nz*nz*nz;
                        
                        if (value <= 0) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'sphere');
                        }
                    }
                }
            }
        }
    },
    
	star: {
		icon: '⭐',
		name: 'Estrela',
		params: [
			{ name: 'points', label: 'Pontas', default: 5, min: 3, max: 12 },
			{ name: 'outerRadius', label: 'Raio Externo', default: 3, min: 1, max: 6 },
			{ name: 'depth', label: 'Profundidade', default: 0.8, min: 0.3, max: 2 },
			{ name: 'pointHeight', label: 'Altura Pontas', default: 1.5, min: 0.5, max: 3 }
		],
		generate: (params) => {
			const cx = 0, cy = 0, cz = 0;
			const points = params.points;
			const outerR = params.outerRadius;
			const innerR = outerR * 0.4;
			const depth = params.depth;
			const pointHeight = params.pointHeight;
			const color = currentColor || '#FFD700';
			
			// ============ 1. CRIAR GEOMETRIA DA ESTRELA ============
			const shape = new THREE.Shape();
			
			// Gerar perfil 2D da estrela
			for (let i = 0; i <= points * 2; i++) {
				const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
				const r = i % 2 === 0 ? outerR : innerR;
				const x = r * Math.cos(angle);
				const y = r * Math.sin(angle);
				
				if (i === 0) {
					shape.moveTo(x, y);
				} else {
					shape.lineTo(x, y);
				}
			}
			
			// ============ 2. EXTRUDAR BASE DA ESTRELA ============
			const extrudeSettings = {
				depth: depth,
				bevelEnabled: true,
				bevelThickness: 0.1,
				bevelSize: 0.1,
				bevelSegments: 2
			};
			
			const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			const material = new THREE.MeshStandardMaterial({
				color: color,
				metalness: 0.6,
				roughness: 0.3,
				emissive: color,
				emissiveIntensity: 0.2
			});
			
			const starBase = new THREE.Mesh(geometry, material);
			starBase.rotation.x = Math.PI / 2; // Deitar no plano XZ
			starBase.position.set(cx, cy, cz);
			scene.add(starBase);
			
			// ============ 3. PONTAS CÔNICAS (VOLUME 3D) ============
			for (let i = 0; i < points; i++) {
				const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
				const px = cx + outerR * Math.cos(angle);
				const pz = cz + outerR * Math.sin(angle);
				const py = cy + depth / 2;
				
				// Cone principal da ponta
				addBlockAt(
					px, py + pointHeight / 2, pz,
					color,
					'cone',
					{ x: innerR * 0.6, y: pointHeight, z: innerR * 0.6 },
					{ x: 0, y: -angle - Math.PI / 2, z: 0 }
				);
				
				// Mini-cone invertido na base (conecta melhor)
				addBlockAt(
					px * 0.7, py, pz * 0.7,
					color,
					'cone',
					{ x: innerR * 0.4, y: depth * 0.6, z: innerR * 0.4 },
					{ x: Math.PI, y: -angle - Math.PI / 2, z: 0 }
				);
			}
			
			// ============ 4. CENTRO ELEVADO (NÚCLEO) ============
			addBlockAt(
				cx, cy + depth / 2 + 0.3, cz,
				color,
				'sphere',
				innerR * 0.8
			);
			
			// ============ 5. BRILHO NAS PONTAS ============
			for (let i = 0; i < points; i++) {
				const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
				const px = cx + outerR * Math.cos(angle);
				const pz = cz + outerR * Math.sin(angle);
				const py = cy + depth / 2 + pointHeight;
				
				// Esfera brilhante na ponta
				addBlockAt(
					px, py, pz,
					'#FFFFFF',
					'sphere',
					0.15
				);
			}
			
			// ============ 6. LUZ PRÓPRIA (ESTRELA BRILHA) ============
			const starLight = new THREE.PointLight(color, 2, outerR * 3);
			starLight.position.set(cx, cy + depth / 2, cz);
			scene.add(starLight);
		}
	},
    
    maze: {
        icon: '🧩',
        name: 'Labirinto',
        params: [
            { name: 'size', label: 'Tamanho', default: 10, min: 6, max: 20 },
            { name: 'wallHeight', label: 'Altura das Paredes', default: 3, min: 2, max: 6 }
        ],
        generate: (params) => {
            const size = params.size;
            const wallH = params.wallHeight;
            
            // Grid para o labirinto (0 = caminho, 1 = parede)
            const grid = [];
            for (let i = 0; i < size; i++) {
                grid[i] = [];
                for (let j = 0; j < size; j++) {
                    grid[i][j] = 1; // Começa tudo como parede
                }
            }
            
            // Algoritmo simples de geração (DFS)
            function carve(x, z) {
                grid[x][z] = 0;
                
                const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]];
                dirs.sort(() => Math.random() - 0.5);
                
                for (let [dx, dz] of dirs) {
                    const nx = x + dx;
                    const nz = z + dz;
                    if (nx >= 0 && nx < size && nz >= 0 && nz < size && grid[nx][nz] === 1) {
                        grid[x + dx/2][z + dz/2] = 0;
                        carve(nx, nz);
                    }
                }
            }
            
            carve(1, 1);
            
            // Renderiza o labirinto
            const offset = Math.floor(size / 2);
            for (let x = 0; x < size; x++) {
                for (let z = 0; z < size; z++) {
                    if (grid[x][z] === 1) {
                        for (let y = 0; y < wallH; y++) {
                            addBlockAt(x - offset, y + 0.5, z - offset, currentColor, 'cube');
                        }
                    }
                }
            }
        }
    },
    
    crystal: {
        icon: '💎',
        name: 'Cristal',
        params: [
            { name: 'height', label: 'Altura', default: 8, min: 5, max: 15 },
            { name: 'sides', label: 'Lados', default: 6, min: 4, max: 8 }
        ],
        generate: (params) => {
            const h = params.height;
            const sides = params.sides;
            const baseR = Math.floor(h * 0.4);
            
            // Base (polígono)
            for (let y = 0; y < Math.floor(h * 0.3); y++) {
                const vertices = [];
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 * i) / sides;
                    vertices.push([
                        Math.round(baseR * Math.cos(angle)),
                        Math.round(baseR * Math.sin(angle))
                    ]);
                }
                
                const minX = Math.min(...vertices.map(v => v[0]));
                const maxX = Math.max(...vertices.map(v => v[0]));
                const minZ = Math.min(...vertices.map(v => v[1]));
                const maxZ = Math.max(...vertices.map(v => v[1]));
                
                for (let x = minX; x <= maxX; x++) {
                    for (let z = minZ; z <= maxZ; z++) {
                        if (isPointInPolygon(x, z, vertices)) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                        }
                    }
                }
            }
            
            // Ponta (pirâmide)
            for (let y = Math.floor(h * 0.3); y < h; y++) {
                const ratio = 1 - ((y - Math.floor(h * 0.3)) / (h - Math.floor(h * 0.3)));
                const currentR = Math.ceil(baseR * ratio);
                
                const vertices = [];
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 * i) / sides;
                    vertices.push([
                        Math.round(currentR * Math.cos(angle)),
                        Math.round(currentR * Math.sin(angle))
                    ]);
                }
                
                const minX = Math.min(...vertices.map(v => v[0]));
                const maxX = Math.max(...vertices.map(v => v[0]));
                const minZ = Math.min(...vertices.map(v => v[1]));
                const maxZ = Math.max(...vertices.map(v => v[1]));
                
                for (let x = minX; x <= maxX; x++) {
                    for (let z = minZ; z <= maxZ; z++) {
                        if (isPointInPolygon(x, z, vertices)) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cone');
                        }
                    }
                }
            }
        }
    },
    
    hollowCylinder: {
        icon: '⭕',
        name: 'Cilindro Oco',
        params: [
            { name: 'outerRadius', label: 'Raio Externo', default: 4, min: 3, max: 10 },
            { name: 'thickness', label: 'Espessura', default: 1, min: 1, max: 3 },
            { name: 'height', label: 'Altura', default: 8, min: 3, max: 15 }
        ],
        generate: (params) => {
            const outerR = params.outerRadius;
            const thickness = params.thickness;
            const innerR = outerR - thickness;
            const h = params.height;
            
            const outerSquared = outerR * outerR;
            const innerSquared = innerR * innerR;
            
            for (let x = -outerR; x <= outerR; x++) {
                for (let z = -outerR; z <= outerR; z++) {
                    const distSquared = x*x + z*z;
                    if (distSquared <= outerSquared && distSquared >= innerSquared) {
                        for (let y = 0; y < h; y++) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cylinder');
                        }
                    }
                }
            }
        }
    },
    
    rectangularPrism: {
        icon: '⬜',
        name: 'Paralelepípedo',
        params: [
            { name: 'width', label: 'Largura', default: 8, min: 3, max: 15 },
            { name: 'height', label: 'Altura', default: 5, min: 3, max: 12 },
            { name: 'depth', label: 'Profundidade', default: 4, min: 3, max: 15 }
        ],
        generate: (params) => {
            const w = params.width;
            const h = params.height;
            const d = params.depth;
            
            const hw = Math.floor(w / 2);
            const hd = Math.floor(d / 2);
            
            for (let x = -hw; x <= hw; x++) {
                for (let y = 0; y < h; y++) {
                    for (let z = -hd; z <= hd; z++) {
                        addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                    }
                }
            }
        }
    },
    
	hexagon: {
		icon: '⬢',
		name: 'Prisma Hexagonal',
		params: [
			{ name: 'radius', label: 'Raio', default: 6, min: 2, max: 15 },
			{ name: 'height', label: 'Altura', default: 4, min: 1, max: 10 },
			{ name: 'hollow', label: 'Oco (0-0.9)', default: 0, min: 0, max: 0.9 }
		],
		generate: (params) => {
			const cx = 0, cy = 0, cz = 0;
			const r = params.radius;
			const h = params.height;
			const hollowFactor = params.hollow;
			const color = currentColor || '#00BCD4';

			// Constante matemática para o Hexágono
			// Usaremos orientação "Flat-Topped" (lados planos na esquerda/direita)
			const sqrt3_2 = 0.866025; // Aproximadamente √3 / 2

			// Loop pela Bounding Box (Quadrado que contém o hexágono)
			// Otimização: O limite em Z é r * √3/2, mas usamos r pra garantir
			for (let x = -r; x <= r; x++) {
				for (let z = -r; z <= r; z++) {
					
					// --- MATEMÁTICA DO HEXÁGONO ---
					// A distância do centro (0,0) em um hexágono é:
					// d = max( |x|, |x|/2 + |z|*√3/2 )
					
					const absX = Math.abs(x);
					const absZ = Math.abs(z);
					
					// Calcula a "distância hexagonal"
					const hexDist = Math.max(absX, (absX * 0.5) + (absZ * sqrt3_2));

					// Lógica de Renderização
					// 1. O bloco está DENTRO do hexágono externo?
					if (hexDist <= r + 0.1) { // +0.1 para arredondamento suave nas bordas
						
						// 2. Se for OCO, o bloco está DENTRO do buraco?
						// Se sim, pulamos (continue)
						if (hollowFactor > 0) {
							const innerRadius = r * hollowFactor;
							// Subtraímos 0.5 do raio interno para garantir que a parede tenha espessura mínima
							if (hexDist < innerRadius - 0.5) {
								continue; 
							}
						}

						// Constrói a coluna
						for (let y = 0; y < h; y++) {
							addBlockAt(
								cx + x, 
								cy + y + 0.5, 
								cz + z, 
								color, 
								'cube', // Cubo preenche melhor (estilo Minecraft)
								1
							);
						}
					}
				}
			}
		}
	},    
    spiral2D: {
        icon: '🌀',
        name: 'Espiral 2D',
        params: [
            { name: 'coils', label: 'Voltas', default: 3, min: 1, max: 6 },
            { name: 'radius', label: 'Raio', default: 8, min: 4, max: 15 }
        ],
        generate: (params) => {
            const coils = params.coils;
            const radius = params.radius;
            const steps = 200;
            
            for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * coils * Math.PI * 2;
                const r = (radius * i) / steps;
                const x = Math.round(Math.cos(t) * r);
                const z = Math.round(Math.sin(t) * r);
                addBlockAt(x, 0.5, z, currentColor, 'sphere');
            }
        }
    },
	
    // ============================================
    // FUNÇÕES NOVAS
    // ============================================

    proceduralBuilding: {
        icon: '🏢',
        name: 'Edifício Modular',
        params: [
            { name: 'floors', label: 'Andares', default: 6, min: 2, max: 20 },
            { name: 'width', label: 'Largura', default: 8, min: 4, max: 20 },
            { name: 'depth', label: 'Profundidade', default: 8, min: 4, max: 20 },
            { name: 'floorHeight', label: 'Altura Andar', default: 3, min: 2, max: 5 },
            { name: 'variation', label: 'Variação', default: 0.3, min: 0, max: 1 }
        ],
        generate: (p) => {
            let yOffset = 0;
            for (let f = 0; f < p.floors; f++) {
                const shrink = Math.floor(Math.random() * p.variation * 2);
                const hw = Math.floor((p.width - shrink) / 2);
                const hd = Math.floor((p.depth - shrink) / 2);

                for (let y = 0; y < p.floorHeight; y++) {
                    for (let x = -hw; x <= hw; x++) {
                        for (let z = -hd; z <= hd; z++) {
                            if (x === -hw || x === hw || z === -hd || z === hd) {
                                addBlockAt(x, yOffset + y + 0.5, z, currentColor, 'cube');
                            }
                        }
                    }
                }
                yOffset += p.floorHeight;
            }
        }
        
    },
	
	proceduralHouse: {
		icon: '🏠',
		name: 'Casa Procedural',
		params: [
			{ name: 'width', label: 'Largura', default: 7, min: 5, max: 15 },
			{ name: 'depth', label: 'Profundidade', default: 7, min: 5, max: 15 },
			{ name: 'wallHeight', label: 'Altura Parede', default: 4, min: 3, max: 8 }
		],
		generate: (p) => {
			const hw = Math.floor(p.width / 2);
			const hd = Math.floor(p.depth / 2);

			// Paredes
			for (let y = 0; y < p.wallHeight; y++) {
				for (let x = -hw; x <= hw; x++) {
					for (let z = -hd; z <= hd; z++) {
						if (x === -hw || x === hw || z === -hd || z === hd) {
							addBlockAt(x, y + 0.5, z, currentColor, 'cube');
						}
					}
				}
			}

			// Telhado (pirâmide)
			for (let y = 0; y <= hw; y++) {
				const r = hw - y;
				for (let x = -r; x <= r; x++) {
					for (let z = -r; z <= r; z++) {
						addBlockAt(x, p.wallHeight + y + 0.5, z, currentColor, 'cone');
					}
				}
			}
		}
	},
	
	rock_2: {
		icon: '⛰️',
		name: 'Pedreira',
		params: [
			{ name: 'count', label: 'Qtd. Pedras', default: 15, min: 5, max: 40 },
			{ name: 'spread', label: 'Espalhamento', default: 10, min: 5, max: 20 },
			{ name: 'sizeVariation', label: 'Variação Tamanho', default: 0.7, min: 0.3, max: 1.0 }
		],
		generate: (params) => {
			const count = params.count;
			const spread = params.spread;
			const sizeVar = params.sizeVariation;
			
			// ============ GERAR MÚLTIPLAS PEDRAS ============
			for (let n = 0; n < count; n++) {
				// Posição aleatória no plano XZ
				const cx = (Math.random() - 0.5) * spread;
				const cz = (Math.random() - 0.5) * spread;
				
				// Tamanho variado (pedras maiores e menores misturadas)
				const size = 0.8 + Math.random() * 2.5 * sizeVar;
				const cy = size * 0.4; // Pedras "apoiadas" no chão
				
				// Irregularidade variada
				const irregularity = 0.3 + Math.random() * 0.6;
				
				// Tipo de poliedro aleatório
				const complexity = Math.floor(Math.random() * 4); // 0-3
				const baseFaces = [4, 8, 12, 20][complexity];
				
				// Cor base variada (cinzas diversos)
				const grayValue = 60 + Math.random() * 60;
				const baseColor = `rgb(${grayValue}, ${grayValue}, ${grayValue + 10})`;
				
				// ============ CRIAR GEOMETRIA BASE ============
				let geometry;
				if (baseFaces === 4) {
					geometry = new THREE.TetrahedronGeometry(size, 0);
				} else if (baseFaces === 8) {
					geometry = new THREE.OctahedronGeometry(size, 0);
				} else if (baseFaces === 12) {
					geometry = new THREE.DodecahedronGeometry(size, 0);
				} else {
					geometry = new THREE.IcosahedronGeometry(size, 0);
				}
				
				// ============ DEFORMAR VÉRTICES ============
				const positions = geometry.attributes.position;
				const vertex = new THREE.Vector3();
				
				for (let i = 0; i < positions.count; i++) {
					vertex.fromBufferAttribute(positions, i);
					
					// Ruído aleatório
					const noise = irregularity * size * 0.4;
					vertex.x += (Math.random() - 0.5) * noise;
					vertex.y += (Math.random() - 0.5) * noise;
					vertex.z += (Math.random() - 0.5) * noise;
					
					// Escala anisotrópica (pedras achatadas)
					vertex.x *= 0.8 + Math.random() * 0.4;
					vertex.y *= 0.6 + Math.random() * 0.4; // Mais achatadas
					vertex.z *= 0.8 + Math.random() * 0.4;
					
					positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
				}
				
				positions.needsUpdate = true;
				geometry.computeVertexNormals();
				
				// ============ CRIAR MESH ============
				const material = new THREE.MeshStandardMaterial({
					color: baseColor,
					roughness: 0.85 + Math.random() * 0.1,
					metalness: 0.05 + Math.random() * 0.1,
					flatShading: true
				});
				
				const rock = new THREE.Mesh(geometry, material);
				
				// Rotação aleatória
				rock.rotation.set(
					Math.random() * Math.PI,
					Math.random() * Math.PI,
					Math.random() * Math.PI
				);
				
				rock.position.set(cx, cy, cz);
				scene.add(rock);
				
				// ============ MANCHAS MINERAIS ============
				const spots = Math.floor(Math.random() * 3);
				
				for (let i = 0; i < spots; i++) {
					const spotSize = size * (0.08 + Math.random() * 0.15);
					const angle = Math.random() * Math.PI * 2;
					const radius = size * (0.3 + Math.random() * 0.4);
					const height = (Math.random() - 0.5) * size * 0.5;
					
					const spotBrightness = grayValue + (Math.random() - 0.5) * 50;
					const spotColor = `rgb(${spotBrightness}, ${spotBrightness}, ${spotBrightness + 5})`;
					
					addBlockAt(
						cx + Math.cos(angle) * radius,
						cy + height,
						cz + Math.sin(angle) * radius,
						spotColor,
						'sphere',
						spotSize
					);
				}
			}
			
			// ============ BASE DA PEDREIRA (OPCIONAL) ============
			// Chão de cascalho/terra
			addBlockAt(
				0, -0.2, 0,
				'#4A4A4A',
				'box',
				{ x: spread * 1.2, y: 0.3, z: spread * 1.2 }
			);
		}
	},
	mushroom: {
		icon: '🍄',
		name: 'Cogumelo',
		params: [
			{ name: 'stemHeight', label: 'Altura Tronco', default: 8, min: 4, max: 15 },
			{ name: 'capRadius', label: 'Raio Chapéu', default: 6, min: 4, max: 12 }
		],
		generate: (p) => {
			// Tronco
			for (let y = 0; y < p.stemHeight; y++) {
				addBlockAt(0, y + 0.5, 0, currentColor, 'cylinder');
			}

			// Chapéu
			for (let x = -p.capRadius; x <= p.capRadius; x++) {
				for (let z = -p.capRadius; z <= p.capRadius; z++) {
					const d = x*x + z*z;
					if (d <= p.capRadius*p.capRadius) {
						const y = Math.floor(Math.sqrt(p.capRadius*p.capRadius - d));
						addBlockAt(x, p.stemHeight + y + 0.5, z, currentColor, 'sphere');
					}
				}
			}
		}
	},
	
	superquadric: {
		icon: '🔷',
		name: 'Superquadric',
		params: [
			{ name: 'radius', label: 'Raio', default: 6, min: 4, max: 12 },
			{ name: 'e', label: 'Expoente', default: 2, min: 0.5, max: 4 }
		],
		generate: (p) => {
			const r = p.radius;
			for (let x = -r; x <= r; x++) {
				for (let y = -r; y <= r; y++) {
					for (let z = -r; z <= r; z++) {
						const nx = Math.pow(Math.abs(x/r), p.e);
						const ny = Math.pow(Math.abs(y/r), p.e);
						const nz = Math.pow(Math.abs(z/r), p.e);
						if (nx + ny + nz <= 1) {
							addBlockAt(x, y + r + 0.5, z, currentColor, 'sphere');
						}
					}
				}
			}
		}
	},
	
	ruins: {
		icon: '🏚️',
		name: 'Ruínas',
		params: [
			{ name: 'size', label: 'Tamanho', default: 10, min: 6, max: 20 },
			{ name: 'height', label: 'Altura', default: 6, min: 3, max: 12 },
			{ name: 'decay', label: 'Desgaste', default: 0.4, min: 0, max: 1 }
		],
		generate: (p) => {
			const h = Math.floor(p.size / 2);

			for (let x = -h; x <= h; x++) {
				for (let z = -h; z <= h; z++) {
					if (x === -h || x === h || z === -h || z === h) {
						for (let y = 0; y < p.height; y++) {
							if (Math.random() > p.decay) {
								addBlockAt(x, y + 0.5, z, currentColor, 'cube');
							}
						}
					}
				}
			}
		}
	},
	
	temple: {
		icon: '⛪',
		name: 'Templo',
		params: [
			{ name: 'length', label: 'Comprimento', default: 14, min: 8, max: 30 },
			{ name: 'width', label: 'Largura', default: 8, min: 6, max: 16 },
			{ name: 'height', label: 'Altura', default: 8, min: 5, max: 15 }
		],
		generate: (p) => {
			const hl = Math.floor(p.length / 2);
			const hw = Math.floor(p.width / 2);

			// Piso
			for (let x = -hw; x <= hw; x++) {
				for (let z = -hl; z <= hl; z++) {
					addBlockAt(x, 0.5, z, currentColor, 'cube');
				}
			}

			// Colunas laterais
			for (let z = -hl; z <= hl; z += 3) {
				for (let y = 0; y < p.height; y++) {
					addBlockAt(-hw, y + 0.5, z, currentColor, 'cylinder');
					addBlockAt(hw, y + 0.5, z, currentColor, 'cylinder');
				}
			}
		}
	},
	
	vault: {
		icon: '🏛️',
		name: 'Abóbada',
		params: [
			{ name: 'radius', label: 'Raio', default: 6, min: 4, max: 12 },
			{ name: 'length', label: 'Comprimento', default: 12, min: 6, max: 24 }
		],
		generate: (p) => {
			for (let z = -p.length / 2; z <= p.length / 2; z++) {
				for (let x = -p.radius; x <= p.radius; x++) {
					const y = Math.floor(Math.sqrt(p.radius*p.radius - x*x));
					addBlockAt(x, y + 0.5, z, currentColor, 'cube');
				}
			}
		}
	},

	coral: {
		icon: '🪸',
		name: 'Coral',
		params: [
			{ name: 'branches', label: 'Ramos', default: 12, min: 6, max: 30 },
			{ name: 'height', label: 'Altura', default: 8, min: 4, max: 16 }
		],
		generate: (p) => {
			for (let i = 0; i < p.branches; i++) {
				let x = 0, z = 0;
				const angle = Math.random() * Math.PI * 2;
				for (let y = 0; y < p.height; y++) {
					x += Math.round(Math.cos(angle) * Math.random());
					z += Math.round(Math.sin(angle) * Math.random());
					addBlockAt(x, y + 0.5, z, currentColor, 'sphere');
				}
			}
		}
	},
	
	organicArch: {
		icon: '🏜️',
		name: 'Arco Natural',
		params: [
			{ name: 'width', label: 'Largura', default: 10, min: 6, max: 20 },
			{ name: 'height', label: 'Altura', default: 6, min: 4, max: 12 }
		],
		generate: (p) => {
			const hw = Math.floor(p.width / 2);
			for (let x = -hw; x <= hw; x++) {
				const ratio = Math.abs(x) / hw;
				const yMax = Math.floor(p.height * (1 - ratio * ratio));
				for (let y = yMax; y <= p.height; y++) {
					addBlockAt(x, y + 0.5, 0, currentColor, 'sphere');
				}
			}
		}
	},

	implicitSurface: {
		icon: '∿',
		name: 'Superfície Implícita',
		params: [
			{ name: 'size', label: 'Tamanho', default: 8, min: 5, max: 15 }
		],
		generate: (p) => {
			for (let x = -p.size; x <= p.size; x++) {
				for (let y = -p.size; y <= p.size; y++) {
					for (let z = -p.size; z <= p.size; z++) {
						const v = Math.sin(x) + Math.sin(y) + Math.sin(z);
						if (v > 1.5) {
							addBlockAt(x, y + p.size + 0.5, z, currentColor, 'sphere');
						}
					}
				}
			}
		}
	},
	
	gyroid: {
		icon: '🧠',
		name: 'Gyroid',
		params: [
			{ name: 'size', label: 'Tamanho', default: 8, min: 5, max: 15 }
		],
		generate: (p) => {
			for (let x = -p.size; x <= p.size; x++) {
				for (let y = -p.size; y <= p.size; y++) {
					for (let z = -p.size; z <= p.size; z++) {
						const v =
							Math.sin(x) * Math.cos(y) +
							Math.sin(y) * Math.cos(z) +
							Math.sin(z) * Math.cos(x);
						if (Math.abs(v) < 0.5) {
							addBlockAt(x, y + p.size + 0.5, z, currentColor, 'sphere');
						}
					}
				}
			}
		}
	},
	
	dungeon: {
		icon: '🗝️',
		name: 'Dungeon (Compacta)',
		params: [
			{ name: 'rooms', label: 'Salas', default: 6, min: 2, max: 9 },
			{ name: 'roomSize', label: 'Tamanho Sala', default: 5, min: 4, max: 8 }
		],
		generate: (p) => {
			const gridSize = Math.ceil(Math.sqrt(p.rooms));
			const spacing = p.roomSize + 1;
			const halfGrid = Math.floor(gridSize / 2);

			let roomIndex = 0;

			for (let gx = -halfGrid; gx <= halfGrid && roomIndex < p.rooms; gx++) {
				for (let gz = -halfGrid; gz <= halfGrid && roomIndex < p.rooms; gz++) {

					const centerX = gx * spacing;
					const centerZ = gz * spacing;
					const hs = Math.floor(p.roomSize / 2);

					// Piso da sala
					for (let x = -hs; x <= hs; x++) {
						for (let z = -hs; z <= hs; z++) {
							addBlockAt(
								centerX + x,
								0.5,
								centerZ + z,
								currentColor,
								'cube'
							);
						}
					}

					roomIndex++;
				}
			}
		}
	},
	
	platformSet: {
		icon: '🧱',
		name: 'Plataformas',
		params: [
			{ name: 'count', label: 'Quantidade', default: 8, min: 3, max: 20 },
			{ name: 'spread', label: 'Espalhamento', default: 12, min: 6, max: 25 }
		],
		generate: (p) => {
			for (let i = 0; i < p.count; i++) {
				const x = Math.floor(Math.random() * p.spread - p.spread / 2);
				const z = Math.floor(Math.random() * p.spread - p.spread / 2);
				const y = Math.floor(Math.random() * 5) + 1;
				addBlockAt(x, y + 0.5, z, currentColor, 'cube');
			}
		}
	},
	
	// Inicio das novas funções
	
	    lighthouse: {
        icon: '🏛️',
        name: 'Farol',
        params: [
            { name: 'height', label: 'Altura', default: 18, min: 10, max: 30 },
            { name: 'radius', label: 'Raio', default: 1.2, min: 0.8, max: 2.5 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const height = params.height;
            const radius = params.radius;
            const color = currentColor || '#F5F5F5';

            const baseHeight = Math.floor(height * 0.15);
            const towerHeight = height - baseHeight - 2;

            // Base de pedra
            for (let i = 0; i < baseHeight; i++) {
                addBlockAt(x, y + i, z, '#A9A9A9', 'cylinder', radius + 0.4);
            }

            // Torre principal
            for (let i = 0; i < towerHeight; i++) {
                addBlockAt(x, y + baseHeight + i, z, color, 'cylinder', radius);
            }

            const topY = y + baseHeight + towerHeight;

            // Varanda
            addBlockAt(x, topY, z, '#696969', 'ring', {x: radius + 0.6, y: 0.2, z: radius + 0.6});

            // Câmara da luz
            addBlockAt(x, topY + 0.5, z, '#FFD700', 'sphere', 0.8);

            // Cobertura
            addBlockAt(x, topY + 1.2, z, '#8B0000', 'cone', 1.2);
        }
    },

	windmill: {
		icon: '🏰',
		name: 'Moinho de Vento',
		params: [
			{ name: 'height', label: 'Altura', default: 12, min: 8, max: 20 },
			{ name: 'bladeLength', label: 'Tamanho das Pás', default: 3, min: 2, max: 5 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const height = params.height;
			const bladeLength = params.bladeLength;
			const color = currentColor || '#F5DEB3';

			// SEÇÃO 1: Base da torre (cone invertido)
			const baseWidth = 1.5;
			for (let i = 0; i < 3; i++) {
				const ratio = 1 - (i / 3) * 0.3;
				addBlockAt(x, y + i, z, '#8B4513', 'cylinder', baseWidth * ratio);
			}

			// SEÇÃO 2: Torre principal
			for (let i = 3; i < height; i++) {
				addBlockAt(x, y + i, z, color, 'cylinder', 1.2);
			}

			// SEÇÃO 3: Hub das pás (TOPO DA TORRE)
			const hubY = y + height - 0.5; // ← MUDANÇA: Quase no topo!
			const hubZ = z + 1.5; // Projetado pra frente
			addBlockAt(x, hubY, hubZ, '#654321', 'sphere', 0.5);

			// SEÇÃO 4: Pás do moinho (PLANO VERTICAL X-Y)
			const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

			angles.forEach((angle) => {
				for (let i = 1; i <= bladeLength; i++) {
					const bx = x + Math.cos(angle) * i * 0.8;
					const by = hubY + Math.sin(angle) * i * 0.8;
					const bz = hubZ;
					
					addBlockAt(bx, by, bz, '#D2B48C', 'box', {
						x: 0.3,
						y: 0.8,
						z: 0.1
					});
				}
			});

			// SEÇÃO 5: Telhado cônico (ACIMA das pás)
			addBlockAt(x, y + height + 0.5, z, '#8B0000', 'cone', 1.4);
			
			// SEÇÃO 6: Janela/porta
			addBlockAt(x, y + height * 0.3, z + 1.3, '#654321', 'cube', 0.4);
		}
	},

    well: {
        icon: '🚰',
        name: 'Poço',
        params: [
            { name: 'radius', label: 'Raio', default: 2, min: 1, max: 4 },
            { name: 'depth', label: 'Profundidade', default: 4, min: 2, max: 8 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const radius = params.radius;
            const depth = params.depth;
            const color = currentColor || '#808080';

            // Parede circular
            for (let i = 0; i < depth; i++) {
                addBlockAt(x, y + i, z, color, 'cylinder', radius);
            }

            // Colunas de suporte
            const posts = [
                [-radius + 0.4, -radius + 0.4],
                [ radius - 0.4, -radius + 0.4],
                [-radius + 0.4,  radius - 0.4],
                [ radius - 0.4,  radius - 0.4]
            ];

            posts.forEach(([px, pz]) => {
                for (let i = 0; i < 3; i++) {
                    addBlockAt(x + px, y + depth + i, z + pz, '#8B4513', 'cube', 0.4);
                }
            });

            // Telhado
            addBlockAt(x, y + depth + 3, z, '#A52A2A', 'cone', radius + 0.6);
        }
    },

    gazebo: {
        icon: '⛺',
        name: 'Gazebo',
        params: [
            { name: 'radius', label: 'Raio', default: 4, min: 2, max: 6 },
            { name: 'height', label: 'Altura', default: 4, min: 2, max: 8 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const radius = params.radius;
            const height = params.height;
            const color = currentColor || '#F0F8FF';
            const sides = 8;

            // Piso
            addBlockAt(x, y, z, '#DCDCDC', 'disc', radius);

            // Colunas
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const px = x + Math.cos(angle) * radius;
                const pz = z + Math.sin(angle) * radius;

                for (let h = 0; h < height; h++) {
                    addBlockAt(px, y + h, pz, color, 'cylinder', 0.3);
                }
            }

            // Telhado
            addBlockAt(x, y + height, z, '#8B0000', 'cone', radius + 0.8);
        }
    },

    fountain: {
        icon: '⛲',
        name: 'Fonte',
        params: [
            { name: 'radius', label: 'Raio', default: 3, min: 2, max: 6 },
            { name: 'tiers', label: 'Níveis', default: 3, min: 1, max: 5 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const radius = params.radius;
            const tiers = params.tiers;
            const color = currentColor || '#87CEFA';

            // Bacia principal
            addBlockAt(x, y, z, '#A9A9A9', 'cylinder', radius);

            // Níveis da fonte
            for (let i = 0; i < tiers; i++) {
                addBlockAt(
                    x,
                    y + 0.6 + i * 0.6,
                    z,
                    '#B0C4DE',
                    'disc',
                    radius - i * 0.7
                );
            }

            // Jato de água
            for (let i = 0; i < 4; i++) {
                addBlockAt(x, y + 1.5 + i * 0.4, z, color, 'sphere', 0.3);
            }
        }
    },
	
	// Inicio das novas funções natureza
	
	// ========================================
// NATUREZA - TIER 2 (Formato ShapeRegistry Correto)
// Cole dentro do objeto ShapeRegistry
// ========================================

    cactus: {
        icon: '🌵',
        name: 'Cacto',
        params: [
            { name: 'height', label: 'Altura', default: 8, min: 4, max: 15 },
            { name: 'armCount', label: 'Número de Braços', default: 2, min: 0, max: 4 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const height = params.height;
            const armCount = params.armCount;
            const color = currentColor || '#2E8B57';

            // SEÇÃO 1: Tronco principal
            for (let i = 0; i < height; i++) {
                addBlockAt(x, y + i, z, color, 'cylinder', 0.6);
            }

            // SEÇÃO 2: Braços laterais
            for (let a = 0; a < armCount; a++) {
                const armHeight = Math.floor(height * 0.5);
                const startY = y + Math.floor(height * 0.4);
                const dir = a % 2 === 0 ? 1 : -1;

                for (let i = 0; i < armHeight; i++) {
                    addBlockAt(
                        x + dir * 0.8,
                        startY + i,
                        z,
                        color,
                        'cylinder',
                        0.4
                    );
                }
            }

            // SEÇÃO 3: Topo arredondado
            addBlockAt(x, y + height, z, '#3CB371', 'sphere', 0.6);
        }
    },

    palm: {
        icon: '🌴',
        name: 'Palmeira',
        params: [
            { name: 'height', label: 'Altura', default: 10, min: 6, max: 18 },
            { name: 'leafLength', label: 'Tamanho das Folhas', default: 4, min: 2, max: 6 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const height = params.height;
            const leafLength = params.leafLength;
            const color = currentColor || '#8B4513';

            // SEÇÃO 1: Tronco (com leve curvatura)
            for (let i = 0; i < height; i++) {
                addBlockAt(
                    x + Math.sin(i * 0.3) * 0.1,
                    y + i,
                    z + Math.cos(i * 0.3) * 0.1,
                    color,
                    'cylinder',
                    0.4
                );
            }

            const topY = y + height;

            // SEÇÃO 2: Copa de folhas (5 folhas pendentes)
            const leafAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3];

            leafAngles.forEach(angle => {
                for (let i = 1; i <= leafLength; i++) {
                    addBlockAt(
                        x + Math.cos(angle) * i * 0.6,
                        topY - i * 0.2,
                        z + Math.sin(angle) * i * 0.6,
                        '#228B22',
                        'box',
                        { x: 0.2, y: 0.1, z: 0.6 }
                    );
                }
            });
        }
    },

    flower: {
        icon: '🌸',
        name: 'Flor',
        params: [
            { name: 'stemHeight', label: 'Altura do Caule', default: 5, min: 2, max: 10 },
            { name: 'petalCount', label: 'Número de Pétalas', default: 6, min: 4, max: 10 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const stemHeight = params.stemHeight;
            const petalCount = params.petalCount;
            const color = currentColor || '#FF69B4';

            // SEÇÃO 1: Caule
            for (let i = 0; i < stemHeight; i++) {
                addBlockAt(x, y + i, z, '#2E8B57', 'cylinder', 0.2);
            }

            const topY = y + stemHeight;

            // SEÇÃO 2: Miolo
            addBlockAt(x, topY, z, '#FFD700', 'sphere', 0.3);

            // SEÇÃO 3: Pétalas em círculo
            for (let i = 0; i < petalCount; i++) {
                const angle = (i / petalCount) * Math.PI * 2;
                addBlockAt(
                    x + Math.cos(angle) * 0.6,
                    topY,
                    z + Math.sin(angle) * 0.6,
                    color,
                    'sphere',
                    0.35
                );
            }
        }
    },

	bush: {
		icon: '🦔',
		name: 'Ouriço Geométrico',
		params: [
			{ name: 'subdivisions', label: 'Subdivisões', default: 2, min: 0, max: 3 },
			{ name: 'length', label: 'Comp. Espinho', default: 5, min: 2, max: 10 },
			{ name: 'baseThickness', label: 'Grossura Base', default: 0.5, min: 0.2, max: 1.0 }
		],
		generate: (params) => {
			const cx = 0, cy = 0, cz = 0;
			const coreRadius = 2;
			
			// ============ 1. CRIAR NÚCLEO (ICOSAEDRO) ============
			addBlockAt(cx, cy, cz, '#1a472a', 'icosahedron', coreRadius * 2);
			
			// ============ 2. GEOMETRIA DO ICOSAEDRO ============
			// Criar icosaedro geodésico e pegar centros das faces
			const geometry = new THREE.IcosahedronGeometry(coreRadius, params.subdivisions);
			const faces = [];
			
			// Extrair faces (grupos de 3 vértices)
			const positions = geometry.attributes.position.array;
			for (let i = 0; i < positions.length; i += 9) {
				// Calcular centro da face
				const v1 = { x: positions[i], y: positions[i+1], z: positions[i+2] };
				const v2 = { x: positions[i+3], y: positions[i+4], z: positions[i+5] };
				const v3 = { x: positions[i+6], y: positions[i+7], z: positions[i+8] };
				
				const centerX = (v1.x + v2.x + v3.x) / 3;
				const centerY = (v1.y + v2.y + v3.y) / 3;
				const centerZ = (v1.z + v2.z + v3.z) / 3;
				
				// Normal da face (direção perpendicular)
				const mag = Math.sqrt(centerX*centerX + centerY*centerY + centerZ*centerZ);
				
				faces.push({
					x: centerX,
					y: centerY,
					z: centerZ,
					nx: centerX / mag, // Normal normalizada
					ny: centerY / mag,
					nz: centerZ / mag
				});
			}
			
			// ============ 3. "COLAR" ESPINHOS NAS FACES ============
			faces.forEach((face, idx) => {
				const len = params.length * (0.9 + Math.random() * 0.2);
				const baseThick = params.baseThickness;
				const tipThick = 0.05; // Ponta afiada
				
				// Cor variada
				const spineColor = idx % 3 === 0 ? '#2d5016' : 
								  idx % 3 === 1 ? '#3a6b1e' : '#4a7c2e';
				
				// POSIÇÃO: Base do espinho encosta no centro da face
				// Cone do Three.js tem pivô no centro, então avançamos metade do comprimento
				const dist = len / 2;
				const px = cx + face.x + face.nx * dist;
				const py = cy + face.y + face.ny * dist;
				const pz = cz + face.z + face.nz * dist;
				
				// ROTAÇÃO: Alinhar eixo Y do cone com a normal da face
				const normalVector = new THREE.Vector3(face.nx, face.ny, face.nz);
				const upVector = new THREE.Vector3(0, 1, 0);
				const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, normalVector);
				const euler = new THREE.Euler().setFromQuaternion(quaternion);
				
				addBlockAt(
					px, py, pz,
					spineColor,
					'cone',
					{ x: baseThick, y: len, z: baseThick },
					{ x: euler.x, y: euler.y, z: euler.z }
				);
			});
		}
	},
	
    pinecone: {
        icon: '🌰',
        name: 'Pinha',
        params: [
            { name: 'height', label: 'Altura', default: 6, min: 3, max: 10 },
            { name: 'radius', label: 'Raio', default: 1.5, min: 0.8, max: 3 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const height = params.height;
            const radius = params.radius;
            const color = currentColor || '#8B4513';

            const layers = height * 3;
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));

            // SEÇÃO 1: Escamas em espiral fibonacci
            for (let i = 0; i < layers; i++) {
                const t = i / layers;
                const angle = i * goldenAngle;
                const r = radius * (1 - t);
                const px = x + Math.cos(angle) * r;
                const py = y + t * height;
                const pz = z + Math.sin(angle) * r;

                addBlockAt(
                    px,
                    py,
                    pz,
                    color,
                    'cone',
                    { x: 0.3, y: 0.6, z: 0.3 },
                    { x: Math.PI / 2, y: angle, z: 0 }
                );
            }

            // SEÇÃO 2: Núcleo central
            for (let i = 0; i < height; i++) {
                addBlockAt(x, y + i, z, '#A0522D', 'cylinder', 0.3);
            }
        }
    },

	rock: {
		icon: '🪨',
		name: 'Rocha',
		params: [
			{ name: 'size', label: 'Tamanho', default: 2, min: 0.5, max: 5 },
			{ name: 'irregularity', label: 'Irregularidade', default: 0.5, min: 0.1, max: 1.0 },
			{ name: 'complexity', label: 'Complexidade', default: 1, min: 0, max: 3 }
		],
		generate: (params) => {
			const cx = 0, cy = params.size * 0.5, cz = 0;
			const size = params.size;
			const irregularity = params.irregularity;
			const complexity = params.complexity;
			
			// Cor base da pedra (tons de cinza variados)
			const grayValue = 70 + Math.random() * 50;
			const baseColor = `rgb(${grayValue}, ${grayValue}, ${grayValue + 10})`;
			
			// ============ CRIAR POLIEDRO BASE IRREGULAR ============
			// Número de faces varia com complexidade: 4 a 20 faces
			const baseFaces = [4, 8, 12, 20][complexity];
			
			// Criar geometria base (icosaedro dá boas pedras)
			let geometry;
			if (baseFaces === 4) {
				// Tetraedro (4 faces) - pedra pequena angular
				geometry = new THREE.TetrahedronGeometry(size, 0);
			} else if (baseFaces === 8) {
				// Octaedro (8 faces) - pedra média
				geometry = new THREE.OctahedronGeometry(size, 0);
			} else if (baseFaces === 12) {
				// Dodecaedro (12 faces) - pedra arredondada
				geometry = new THREE.DodecahedronGeometry(size, 0);
			} else {
				// Icosaedro (20 faces) - pedra complexa
				geometry = new THREE.IcosahedronGeometry(size, 0);
			}
			
			// ============ DEFORMAR VÉRTICES (IRREGULARIDADE) ============
			const positions = geometry.attributes.position;
			const vertex = new THREE.Vector3();
			
			for (let i = 0; i < positions.count; i++) {
				vertex.fromBufferAttribute(positions, i);
				
				// Adicionar ruído aleatório a cada vértice
				const noise = irregularity * size * 0.4;
				vertex.x += (Math.random() - 0.5) * noise;
				vertex.y += (Math.random() - 0.5) * noise;
				vertex.z += (Math.random() - 0.5) * noise;
				
				// Aplicar deformação anisotrópica (pedras não são uniformes)
				vertex.x *= 0.8 + Math.random() * 0.4;
				vertex.y *= 0.7 + Math.random() * 0.3; // Pedras são mais achatadas
				vertex.z *= 0.8 + Math.random() * 0.4;
				
				positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
			}
			
			positions.needsUpdate = true;
			geometry.computeVertexNormals(); // Recalcular normais
			
			// ============ CRIAR MESH E ADICIONAR ============
			const material = new THREE.MeshStandardMaterial({
				color: baseColor,
				roughness: 0.9, // Pedras são ásperas
				metalness: 0.1,
				flatShading: true // Faces planas bem definidas (importante!)
			});
			
			const rock = new THREE.Mesh(geometry, material);
			
			// Rotação aleatória para mais naturalidade
			rock.rotation.set(
				Math.random() * Math.PI,
				Math.random() * Math.PI,
				Math.random() * Math.PI
			);
			
			rock.position.set(cx, cy, cz);
			scene.add(rock);
			
			// ============ ADICIONAR VARIAÇÕES DE COR (MANCHAS) ============
			// Pequenas "inclusões minerais" na pedra
			const spots = 2 + Math.floor(Math.random() * 4);
			
			for (let i = 0; i < spots; i++) {
				const spotSize = size * (0.1 + Math.random() * 0.2);
				const angle = Math.random() * Math.PI * 2;
				const radius = size * (0.3 + Math.random() * 0.4);
				const height = (Math.random() - 0.5) * size * 0.5;
				
				// Cor da mancha (mais clara ou mais escura que a base)
				const spotBrightness = grayValue + (Math.random() - 0.5) * 40;
				const spotColor = `rgb(${spotBrightness}, ${spotBrightness}, ${spotBrightness + 5})`;
				
				addBlockAt(
					cx + Math.cos(angle) * radius,
					cy + height,
					cz + Math.sin(angle) * radius,
					spotColor,
					'sphere',
					spotSize
				);
			}
		}
	},

	mushroom_2: {
		icon: '🍄',
		name: 'Cogumelo',
		params: [
			{ name: 'height', label: 'Altura Caule', default: 3, min: 1, max: 6 },
			{ name: 'capRadius', label: 'Raio Chapéu', default: 2, min: 1, max: 4 },
			{ name: 'stemThickness', label: 'Grossura Caule', default: 0.5, min: 0.3, max: 1 },
			{ name: 'spots', label: 'Qtd. Pintas', default: 8, min: 3, max: 15 }
		],
		generate: (params) => {
			const cx = 0, cy = 0, cz = 0;
			const height = params.height;
			const capRadius = params.capRadius;
			const stemThick = params.stemThickness;
			const color = currentColor || '#D32F2F';
			
			// ============ 1. CAULE (Cilindro único) ============
			const stemY = cy + height / 2;
			addBlockAt(
				cx, stemY, cz,
				'#F5F5DC', // Bege claro
				'cylinder',
				{ x: stemThick, y: height, z: stemThick }
			);
			
			// ============ 2. CHAPÉU (Hemisfério low-poly) ============
			const capY = cy + height;
			
			// Criar hemisfério usando IcosahedronGeometry com baixa subdivisão
			// para aquele efeito "imperfeito" facetado
			const hemisphereGeometry = new THREE.IcosahedronGeometry(capRadius, 1);
			
			// Remover vértices da metade inferior para criar hemisfério
			const positions = hemisphereGeometry.attributes.position.array;
			const vertices = [];
			const indices = [];
			
			for (let i = 0; i < positions.length; i += 3) {
				const vx = positions[i];
				const vy = positions[i + 1];
				const vz = positions[i + 2];
				
				// Manter apenas vértices acima do plano Y=0
				if (vy >= -0.2) { // -0.2 para suavizar a base
					vertices.push(vx, vy, vz);
				}
			}
			
			// Adicionar chapéu (podemos usar uma esfera e achatar o Y para simular hemisfério)
			addBlockAt(
				cx, capY + capRadius * 0.4, cz,
				color,
				'sphere',
				{ x: capRadius * 1.1, y: capRadius * 0.7, z: capRadius * 1.1 } // Achatado
			);
			
			// ============ 3. LAMELAS/SAIA (Base do chapéu) ============
			addBlockAt(
				cx, capY - 0.1, cz,
				'#FFF8DC', // Creme
				'cylinder',
				{ x: capRadius * 0.6, y: 0.15, z: capRadius * 0.6 }
			);
			
			// ============ 4. PINTAS BRANCAS (Distribuição orgânica) ============
			const spotCount = params.spots;
			
			// Pintas em anéis concêntricos (mais natural)
			const rings = 3;
			let spotIndex = 0;
			
			for (let ring = 0; ring < rings; ring++) {
				const ringRadius = capRadius * (0.2 + ring * 0.3);
				const spotsInRing = Math.ceil(spotCount / rings);
				const angleOffset = ring * 0.5; // Rotação entre anéis
				
				for (let i = 0; i < spotsInRing && spotIndex < spotCount; i++) {
					const angle = (i / spotsInRing) * Math.PI * 2 + angleOffset;
					const spotRadius = 0.15 + Math.random() * 0.1; // Tamanhos variados
					const heightOffset = Math.sqrt(1 - Math.pow(ringRadius / capRadius, 2)) * capRadius * 0.6;
					
					addBlockAt(
						cx + Math.cos(angle) * ringRadius,
						capY + capRadius * 0.4 + heightOffset - ring * 0.15,
						cz + Math.sin(angle) * ringRadius,
						'#FFFFFF',
						'sphere',
						spotRadius
					);
					spotIndex++;
				}
			}
			
			// Pinta no topo
			addBlockAt(
				cx, 
				capY + capRadius * 0.9, 
				cz,
				'#FFFFFF',
				'sphere',
				0.25
			);
		}
	},

    coral: {
        icon: '🪸',
        name: 'Coral',
        params: [
            { name: 'branches', label: 'Número de Ramos', default: 6, min: 3, max: 10 },
            { name: 'height', label: 'Altura', default: 4, min: 2, max: 8 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const branches = params.branches;
            const height = params.height;
            const color = currentColor || '#FF7F50';

            // SEÇÃO 1: Tronco base
            const baseHeight = height * 0.4;
            for (let i = 0; i < baseHeight; i++) {
                addBlockAt(x, y + i, z, color, 'cylinder', 0.4);
            }

            const baseY = y + baseHeight;

            // SEÇÃO 2: Ramos ramificados
            for (let b = 0; b < branches; b++) {
                const angle = (b / branches) * Math.PI * 2;
                const branchLength = height * 0.6;
                
                for (let i = 1; i <= branchLength; i++) {
                    addBlockAt(
                        x + Math.cos(angle) * i * 0.4,
                        baseY + i * 0.4,
                        z + Math.sin(angle) * i * 0.4,
                        color,
                        'sphere',
                        0.3
                    );
                }
            }
        }
    },

    fallenLog: {
        icon: '🪵',
        name: 'Tronco Caído',
        params: [
            { name: 'length', label: 'Comprimento', default: 6, min: 3, max: 12 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const length = params.length;
            const color = currentColor || '#8B4513';

            // SEÇÃO 1: Corpo do tronco (horizontal)
            for (let i = 0; i < length; i++) {
                addBlockAt(
                    x + i - length/2,
                    y + 0.3,
                    z,
                    color,
                    'cylinder',
                    0.6,
                    { x: 0, y: 0, z: Math.PI / 2 }
                );
            }

            // SEÇÃO 2: Extremidades
            addBlockAt(x - length/2 - 0.3, y + 0.3, z, '#A0522D', 'disc', 0.6);
            addBlockAt(x + length/2 + 0.3, y + 0.3, z, '#A0522D', 'disc', 0.6);
        }
    },

    reed: {
        icon: '🌾',
        name: 'Junco',
        params: [
            { name: 'height', label: 'Altura', default: 5, min: 3, max: 10 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const height = params.height;
            const color = currentColor || '#6B8E23';

            // SEÇÃO 1: Caule fino
            for (let i = 0; i < height; i++) {
                addBlockAt(x, y + i, z, color, 'cylinder', 0.15);
            }

            // SEÇÃO 2: Espiga superior
            addBlockAt(x, y + height, z, '#8B4513', 'cone', 0.3);
        }
    },
	// INICIO DAS NOVAS FUNÇÕES MATEMÁTICAS
	knot: {
		icon: '🎗️',
		name: 'Nó Toroidal',
		params: [
			{ name: 'radius', label: 'Raio Principal', default: 8, min: 5, max: 15 },
			{ name: 'tube', label: 'Espessura do Tubo', default: 2, min: 1, max: 5 },
			{ name: 'turns', label: 'Voltas', default: 3, min: 2, max: 8 },
			{ name: 'resolution', label: 'Resolução', default: 100, min: 50, max: 300 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const R = params.radius;
			const r = params.tube;
			const p = params.turns;
			const q = 2;
			const steps = params.resolution;
			const color = currentColor || '#00FFFF';

			// SEÇÃO 1: Curva do nó paramétrica
			for (let i = 0; i < steps; i++) {
				const t = (i / steps) * Math.PI * 2;
				const xt = (R + r * Math.cos(q * t)) * Math.cos(p * t);
				const yt = (R + r * Math.cos(q * t)) * Math.sin(p * t);
				const zt = r * Math.sin(q * t);
				
				addBlockAt(x + xt, y + yt, z + zt, color, 'sphere', 0.35);
			}

			// SEÇÃO 2: Tubo ao redor da curva (opcional)
			for (let i = 0; i < steps; i += 2) {
				const t = (i / steps) * Math.PI * 2;
				const xt = (R + r * Math.cos(q * t)) * Math.cos(p * t);
				const yt = (R + r * Math.cos(q * t)) * Math.sin(p * t);
				const zt = r * Math.sin(q * t);
				
				// Adiciona pequenas esferas para dar volume
				addBlockAt(x + xt * 1.05, y + yt * 1.05, z + zt, color, 'sphere', 0.25);
				addBlockAt(x + xt * 0.95, y + yt * 0.95, z + zt, color, 'sphere', 0.25);
			}
		}
	},

	mobius: {
		icon: '🌀',
		name: 'Fita de Möbius',
		params: [
			{ name: 'radius', label: 'Raio', default: 6, min: 4, max: 12 },
			{ name: 'width', label: 'Largura', default: 2, min: 1, max: 4 },
			{ name: 'twists', label: 'Torções', default: 1, min: 1, max: 3 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const R = params.radius;
			const W = params.width;
			const twists = params.twists;
			const color = currentColor || '#FF00FF';

			// SEÇÃO 1: Superfície de Möbius
			for (let u = 0; u < 24; u++) {
				for (let v = 0; v < 12; v++) {
					const uRad = (u / 24) * Math.PI * 2;
					const vRad = (v / 12) * 2 - 1; // -1 a 1
					
					const xPos = (R + W * vRad * Math.cos(twists * uRad / 2)) * Math.cos(uRad);
					const yPos = (R + W * vRad * Math.cos(twists * uRad / 2)) * Math.sin(uRad);
					const zPos = W * vRad * Math.sin(twists * uRad / 2);
					
					addBlockAt(x + xPos, y + yPos, z + zPos, color, 'cube', 0.3);
				}
			}

			// SEÇÃO 2: Borda destacada
			for (let u = 0; u < 48; u += 2) {
				const uRad = (u / 48) * Math.PI * 2;
				const xPos = R * Math.cos(uRad);
				const yPos = R * Math.sin(uRad);
				const zPos = 0;
				
				addBlockAt(x + xPos * 1.1, y + yPos * 1.1, z + zPos, '#FFFFFF', 'sphere', 0.4);
			}
		}
	},

	klein_bottle: {
		icon: '🧪',
		name: 'Garrafa de Klein',
		params: [
			{ name: 'scale', label: 'Escala', default: 5, min: 3, max: 10 },
			{ name: 'resolution', label: 'Resolução', default: 20, min: 10, max: 40 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const scale = params.scale;
			const res = params.resolution;
			const color = currentColor || '#00FFFF';

			// SEÇÃO 1: Superfície paramétrica da Garrafa de Klein
			for (let u = 0; u < res; u++) {
				for (let v = 0; v < res; v++) {
					const uRad = (u / res) * Math.PI * 2;
					const vRad = (v / res) * Math.PI * 2;
					
					let xPos, yPos, zPos;
					
					if (uRad < Math.PI) {
						xPos = 6 * Math.cos(uRad) * (1 + Math.sin(uRad)) + 
							   4 * (1 - Math.cos(uRad) / 2) * Math.cos(uRad) * Math.cos(vRad);
						yPos = 16 * Math.sin(uRad) + 
							   4 * (1 - Math.cos(uRad) / 2) * Math.sin(uRad) * Math.cos(vRad);
					} else {
						xPos = 6 * Math.cos(uRad) * (1 + Math.sin(uRad)) + 
							   4 * (1 - Math.cos(uRad) / 2) * Math.cos(vRad + Math.PI);
						yPos = 16 * Math.sin(uRad);
					}
					
					zPos = 4 * (1 - Math.cos(uRad) / 2) * Math.sin(vRad);
					
					// Aplicar escala
					xPos *= scale / 20;
					yPos *= scale / 20;
					zPos *= scale / 20;
					
					addBlockAt(x + xPos, y + yPos, z + zPos, color, 'sphere', 0.4);
				}
			}

			// SEÇÃO 2: Estrutura de suporte (base)
			for (let i = -3; i <= 3; i++) {
				for (let j = -3; j <= 3; j++) {
					addBlockAt(x + i * 0.8, y - 4, z + j * 0.8, '#808080', 'cube', 0.7);
				}
			}
		}
	},

	pentagram: {
		icon: '⭐',
		name: 'Pentagrama 3D',
		params: [
			{ name: 'radius', label: 'Raio', default: 6, min: 3, max: 12 },
			{ name: 'height', label: 'Altura', default: 8, min: 4, max: 16 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const radius = params.radius;
			const height = params.height;
			const color = currentColor || '#FFD700';

			// SEÇÃO 1: Pontas do pentagrama (5 pontos)
			const points = [];
			for (let i = 0; i < 5; i++) {
				const angle = (i * 72 - 90) * Math.PI / 180;
				const px = Math.cos(angle) * radius;
				const pz = Math.sin(angle) * radius;
				points.push({ x: px, z: pz });
				
				// Coluna em cada ponta
				for (let h = 0; h < height; h++) {
					addBlockAt(x + px, y + h, z + pz, color, 'cylinder', 0.4);
				}
				
				// Esfera no topo
				addBlockAt(x + px, y + height, z + pz, '#FFD700', 'sphere', 0.6);
			}

			// SEÇÃO 2: Conexões entre pontas (formando estrela)
			const connections = [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]];
			
			connections.forEach(([start, end]) => {
				const p1 = points[start];
				const p2 = points[end];
				const steps = 15;
				
				for (let t = 0; t <= steps; t++) {
					const ratio = t / steps;
					const px = p1.x + (p2.x - p1.x) * ratio;
					const pz = p1.z + (p2.z - p1.z) * ratio;
					const py = y + height * 0.7;
					
					addBlockAt(x + px, py, z + pz, color, 'cylinder', {
						x: 0.3, y: 0.8, z: 0.3
					});
				}
			});

			// SEÇÃO 3: Base circular
			for (let a = 0; a < 360; a += 15) {
				const angle = a * Math.PI / 180;
				const bx = Math.cos(angle) * (radius * 0.7);
				const bz = Math.sin(angle) * (radius * 0.7);
				
				addBlockAt(x + bx, y, z + bz, '#8B4513', 'cylinder', 0.5);
			}
		}
	},

	mandala: {
		icon: '☸️',
		name: 'Mandala 3D',
		params: [
			{ name: 'radius', label: 'Raio', default: 8, min: 5, max: 15 },
			{ name: 'layers', label: 'Camadas', default: 5, min: 3, max: 8 },
			{ name: 'elements', label: 'Elementos', default: 12, min: 6, max: 24 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const radius = params.radius;
			const layers = params.layers;
			const elements = params.elements;
			const color = currentColor || '#FF00FF';

			// SEÇÃO 1: Camadas concêntricas
			for (let layer = 1; layer <= layers; layer++) {
				const layerRadius = (radius / layers) * layer;
				const layerHeight = layer * 1.5;
				
				for (let i = 0; i < elements * layer; i++) {
					const angle = (i / (elements * layer)) * Math.PI * 2;
					const elementType = i % 3;
					
					const ex = Math.cos(angle) * layerRadius;
					const ez = Math.sin(angle) * layerRadius;
					
					// Alterna entre diferentes formas
					if (elementType === 0) {
						addBlockAt(x + ex, y + layerHeight, z + ez, color, 'sphere', 0.5);
					} else if (elementType === 1) {
						addBlockAt(x + ex, y + layerHeight - 0.5, z + ez, color, 'cylinder', {
							x: 0.4, y: 1.2, z: 0.4
						});
					} else {
						addBlockAt(x + ex, y + layerHeight + 0.5, z + ez, '#00FFFF', 'cone', 0.6);
					}
					
					// Linhas conectando elementos
					if (i % 2 === 0) {
						const nextAngle = ((i + 1) / (elements * layer)) * Math.PI * 2;
						const nex = Math.cos(nextAngle) * layerRadius;
						const nez = Math.sin(nextAngle) * layerRadius;
						
						for (let t = 0; t <= 5; t++) {
							const ratio = t / 5;
							const tx = ex + (nex - ex) * ratio;
							const tz = ez + (nez - ez) * ratio;
							
							addBlockAt(x + tx, y + layerHeight - 0.2, z + tz, '#FFFFFF', 'cube', 0.2);
						}
					}
				}
			}

			// SEÇÃO 2: Centro da mandala
			addBlockAt(x, y + 1, z, '#FFD700', 'sphere', 1.5);
			addBlockAt(x, y + 3, z, '#FFD700', 'cylinder', { x: 1, y: 2, z: 1 });
			addBlockAt(x, y + 5, z, '#FF00FF', 'cone', 1.2);
		}
	},

	fractal_cube: {
		icon: '🧊',
		name: 'Cubo de Menger',
		params: [
			{ name: 'size', label: 'Tamanho', default: 9, min: 3, max: 27 },
			{ name: 'iterations', label: 'Iterações', default: 2, min: 1, max: 3 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const size = params.size;
			const iterations = params.iterations;
			const color = currentColor || '#C0C0C0';

			// Função recursiva para criar fractal
			function createMenger(cx, cy, cz, s, iter) {
				if (iter === 0) {
					// Cubo sólido no nível mais baixo
					const half = s / 2;
					for (let dx = -half; dx <= half; dx += 1) {
						for (let dy = -half; dy <= half; dy += 1) {
							for (let dz = -half; dz <= half; dz += 1) {
								addBlockAt(cx + dx, cy + dy, cz + dz, color, 'cube', 0.95);
							}
						}
					}
				} else {
					const newSize = s / 3;
					// Criar 20 subcubos (removendo o centro e centros das faces)
					for (let dx = -1; dx <= 1; dx++) {
						for (let dy = -1; dy <= 1; dy++) {
							for (let dz = -1; dz <= 1; dz++) {
								// Contar quantas coordenadas são zero
								const zeros = (dx === 0 ? 1 : 0) + 
											 (dy === 0 ? 1 : 0) + 
											 (dz === 0 ? 1 : 0);
								
								// Manter apenas subcubos que não estão no centro nem nos centros das faces
								if (zeros <= 1) {
									createMenger(
										cx + dx * newSize,
										cy + dy * newSize,
										cz + dz * newSize,
										newSize,
										iter - 1
									);
								}
							}
						}
					}
				}
			}

			// SEÇÃO 1: Base do fractal
			createMenger(x, y, z, size, iterations);

			// SEÇÃO 2: Plataforma de suporte
			const platformSize = size + 2;
			for (let px = -platformSize; px <= platformSize; px++) {
				for (let pz = -platformSize; pz <= platformSize; pz++) {
					if (Math.abs(px) <= size && Math.abs(pz) <= size) continue;
					
					addBlockAt(x + px, y - size/2 - 1, z + pz, '#808080', 'cube', 0.9);
				}
			}
		}
	},

	tessellation: {
		icon: '🧩',
		name: 'Tesselação (Lite)',
		params: [
			{ name: 'pattern', label: 'Padrão', default: 1, min: 1, max: 2 },
			{ name: 'size', label: 'Escala Hex', default: 5, min: 3, max: 8 },
			{ name: 'height', label: 'Altura', default: 2, min: 1, max: 5 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const pattern = Math.floor(params.pattern);
			const size = params.size;
			const height = params.height;
			const color = currentColor || '#00FF00';

			const patterns = [
				// Padrão 1: Colmeia Otimizada (Apenas Vértices e Centros de Aresta)
				(i, j) => {
					const radius = size * 0.8;
					const hexWidth = Math.sqrt(3) * radius;
					const hexZSpacing = radius * 1.5;
					
					// Offset para alinhar linhas pares/ímpares
					const xOffset = (Math.abs(j) % 2 === 1) ? (hexWidth / 2) : 0;
					
					const centerX = (i * hexWidth) + xOffset;
					const centerZ = j * hexZSpacing;
					
					// Desenha os 6 cantos (Pilares)
					for (let a = 0; a < 6; a++) {
						const angle1 = a * Math.PI / 3;
						const angle2 = ((a + 1) % 6) * Math.PI / 3;
						
						// Vértices (Cantos)
						const vx1 = centerX + Math.cos(angle1) * radius;
						const vz1 = centerZ + Math.sin(angle1) * radius;
                        
                        // Próximo vértice
						const vx2 = centerX + Math.cos(angle2) * radius;
						const vz2 = centerZ + Math.sin(angle2) * radius;

						// Pilar no vértice
                        for(let h = 0; h < height; h++) {
						    addBlockAt(x + vx1, y + h + 0.5, z + vz1, color, 'cylinder', 0.5);
                        }

                        // Conexão (Barra Horizontal) - REDUZIDA A DENSIDADE
                        // Em vez de desenhar 10 blocos, desenhamos só o necessário baseado no tamanho
                        const dist = Math.sqrt((vx2-vx1)**2 + (vz2-vz1)**2);
                        const steps = Math.max(1, Math.floor(dist / 0.8)); // 1 bloco a cada 0.8 unidades

						for (let t = 1; t < steps; t++) {
							const ratio = t / steps;
							const px = vx1 + (vx2 - vx1) * ratio;
							const pz = vz1 + (vz2 - vz1) * ratio;
							
                            // Desenha apenas no topo e na base para economizar processamento
                            addBlockAt(x + px, y + 0.5, z + pz, color, 'cube', 0.4); // Base
                            if (height > 1) {
                                addBlockAt(x + px, y + height - 0.5, z + pz, color, 'cube', 0.4); // Topo
                            }
						}
					}
				},
				
				// Padrão 2: Grid Triangular Leve
				(i, j) => {
                    const spacing = size * 1.5;
                    const px = i * spacing;
                    const pz = j * spacing;
                    
                    // Pilar central
                    for(let h=0; h<height; h++) {
                        addBlockAt(x + px, y + h + 0.5, z + pz, color, 'cylinder', 0.6);
                    }
                    
                    // Conexões em X e Z
                    if (i < 1) { // Conecta com o da direita
                        for(let k=1; k<spacing; k+=0.8) {
                             addBlockAt(x + px + k, y + height - 0.5, z + pz, color, 'cube', 0.3);
                        }
                    }
                    if (j < 1) { // Conecta com o de baixo
                        for(let k=1; k<spacing; k+=0.8) {
                             addBlockAt(x + px, y + height - 0.5, z + pz + k, color, 'cube', 0.3);
                        }
                    }
				}
			];

			// Grid reduzido (2 em vez de 3 ou 4) para evitar explosão exponencial
			const gridSize = 2; 
			
			for (let i = -gridSize; i <= gridSize; i++) {
				for (let j = -gridSize; j <= gridSize; j++) {
					const selectedPattern = patterns[(pattern - 1) % patterns.length];
					if (selectedPattern) selectedPattern(i, j);
				}
			}
		}
	},
	
// ========================================
// GEOMETRIA SAGRADA - 5 Formas Místicas
// Cole dentro do objeto ShapeRegistry
// ========================================

    metatrons_cube: {
        icon: '🔯',
        name: 'Cubo de Metatron',
        params: [
            { name: 'radius', label: 'Raio', default: 6, min: 4, max: 12 },
            { name: 'showPlatonics', label: 'Mostrar Sólidos', default: 1, min: 0, max: 1 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const radius = params.radius;
            const showPlatonics = params.showPlatonics;
            const color = currentColor || '#FFD700';

            // SEÇÃO 1: 13 Esferas Sagradas
            // 1 esfera central
            addBlockAt(x, y + radius, z, color, 'sphere', 0.8);

            // 6 esferas ao redor (hexágono horizontal)
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const ex = Math.cos(angle) * radius;
                const ez = Math.sin(angle) * radius;
                addBlockAt(x + ex, y + radius, z + ez, color, 'sphere', 0.8);
            }

            // 3 esferas acima (triângulo)
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                const ex = Math.cos(angle) * radius * 0.577; // raio interno
                const ez = Math.sin(angle) * radius * 0.577;
                addBlockAt(x + ex, y + radius + radius * 0.816, z + ez, color, 'sphere', 0.8);
            }

            // 3 esferas abaixo (triângulo invertido)
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                const ex = Math.cos(angle) * radius * 0.577;
                const ez = Math.sin(angle) * radius * 0.577;
                addBlockAt(x + ex, y + radius - radius * 0.816, z + ez, color, 'sphere', 0.8);
            }

            // SEÇÃO 2: Linhas Conectoras (Energia)
            const spherePositions = [
                { x: 0, y: radius, z: 0 }, // Centro
            ];

            // Adicionar posições das 12 esferas externas
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                spherePositions.push({
                    x: Math.cos(angle) * radius,
                    y: radius,
                    z: Math.sin(angle) * radius
                });
            }

            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                spherePositions.push({
                    x: Math.cos(angle) * radius * 0.577,
                    y: radius + radius * 0.816,
                    z: Math.sin(angle) * radius * 0.577
                });
            }

            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                spherePositions.push({
                    x: Math.cos(angle) * radius * 0.577,
                    y: radius - radius * 0.816,
                    z: Math.sin(angle) * radius * 0.577
                });
            }

            // Conectar centro com todas as outras
            for (let i = 1; i < spherePositions.length; i++) {
                const steps = 10;
                for (let t = 0; t <= steps; t++) {
                    const ratio = t / steps;
                    const px = spherePositions[0].x + (spherePositions[i].x - spherePositions[0].x) * ratio;
                    const py = spherePositions[0].y + (spherePositions[i].y - spherePositions[0].y) * ratio;
                    const pz = spherePositions[0].z + (spherePositions[i].z - spherePositions[0].z) * ratio;
                    addBlockAt(x + px, y + py, z + pz, '#00FFFF', 'sphere', 0.15);
                }
            }

            // SEÇÃO 3: Sólidos Platônicos (opcional)
            if (showPlatonics === 1) {
                // Tetraedro (no topo)
                addBlockAt(x, y + radius * 2.5, z, '#FF00FF', 'tetrahedron', 1.2);
                
                // Cubo
                addBlockAt(x + radius * 1.5, y + radius, z, '#00FF00', 'cube', 0.8);
                
                // Octaedro
                addBlockAt(x - radius * 1.5, y + radius, z, '#FF0000', 'octahedron', 1);
                
                // Dodecaedro
                addBlockAt(x, y + radius, z + radius * 1.5, '#FFFF00', 'dodecahedron', 0.9);
                
                // Icosaedro
                addBlockAt(x, y + radius, z - radius * 1.5, '#00FFFF', 'icosahedron', 1);
            }
        }
    },

    flower_of_life: {
        icon: '🌸',
        name: 'Flor da Vida',
        params: [
            { name: 'radius', label: 'Raio dos Círculos', default: 2, min: 1, max: 4 },
            { name: 'rings', label: 'Anéis', default: 2, min: 1, max: 4 },
            { name: 'height', label: 'Altura 3D', default: 3, min: 1, max: 6 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const radius = params.radius;
            const rings = params.rings;
            const height = params.height;
            const color = currentColor || '#9370DB';

            // SEÇÃO 1: Círculo Central
            const centerPositions = [{ x: 0, z: 0 }];

            for (let h = 0; h < height; h++) {
                // Anel do círculo central
                for (let a = 0; a < 360; a += 10) {
                    const angle = a * Math.PI / 180;
                    const cx = Math.cos(angle) * radius;
                    const cz = Math.sin(angle) * radius;
                    addBlockAt(x + cx, y + h, z + cz, color, 'sphere', 0.3);
                }
            }

            // SEÇÃO 2: Anéis de Círculos ao Redor
            for (let ring = 1; ring <= rings; ring++) {
                const circlesInRing = 6 * ring;
                
                for (let i = 0; i < circlesInRing; i++) {
                    // Posição do centro de cada círculo
                    const angle = (i / circlesInRing) * Math.PI * 2;
                    const distance = radius * 2 * ring;
                    
                    // Ajuste para padrão hexagonal perfeito
                    let cx, cz;
                    if (ring === 1) {
                        // Primeiro anel - 6 círculos
                        cx = Math.cos(angle) * radius;
                        cz = Math.sin(angle) * radius;
                    } else {
                        // Anéis externos - padrão mais denso
                        const hexAngle = Math.floor(i / ring) * (Math.PI / 3);
                        const offset = (i % ring) / ring;
                        cx = Math.cos(hexAngle) * radius * ring + Math.cos(hexAngle + Math.PI / 2) * radius * 2 * offset;
                        cz = Math.sin(hexAngle) * radius * ring + Math.sin(hexAngle + Math.PI / 2) * radius * 2 * offset;
                    }

                    centerPositions.push({ x: cx, z: cz });

                    // Desenhar o círculo
                    for (let h = 0; h < height; h++) {
                        for (let a = 0; a < 360; a += 10) {
                            const circleAngle = a * Math.PI / 180;
                            const px = cx + Math.cos(circleAngle) * radius;
                            const pz = cz + Math.sin(circleAngle) * radius;
                            addBlockAt(x + px, y + h, z + pz, color, 'sphere', 0.3);
                        }
                    }
                }
            }

            // SEÇÃO 3: Vesica Piscis nas Interseções (destaque)
            for (let i = 0; i < Math.min(centerPositions.length, 7); i++) {
                const pos = centerPositions[i];
                addBlockAt(x + pos.x, y + height / 2, z + pos.z, '#FFD700', 'sphere', 0.5);
            }
        }
    },

    seed_of_life: {
        icon: '🌼',
        name: 'Semente da Vida',
        params: [
            { name: 'radius', label: 'Raio', default: 3, min: 2, max: 6 },
            { name: 'height', label: 'Altura', default: 4, min: 2, max: 8 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const radius = params.radius;
            const height = params.height;
            const color = currentColor || '#FF1493';

            // SEÇÃO 1: Círculo Central
            for (let h = 0; h < height; h++) {
                for (let a = 0; a < 360; a += 8) {
                    const angle = a * Math.PI / 180;
                    const cx = Math.cos(angle) * radius;
                    const cz = Math.sin(angle) * radius;
                    addBlockAt(x + cx, y + h, z + cz, color, 'sphere', 0.35);
                }
                // Centro brilhante
                addBlockAt(x, y + h, z, '#FFFF00', 'sphere', 0.4);
            }

            // SEÇÃO 2: 6 Círculos ao Redor (Padrão Hexagonal)
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const centerX = Math.cos(angle) * radius;
                const centerZ = Math.sin(angle) * radius;

                for (let h = 0; h < height; h++) {
                    // Círculo completo
                    for (let a = 0; a < 360; a += 8) {
                        const circleAngle = a * Math.PI / 180;
                        const px = centerX + Math.cos(circleAngle) * radius;
                        const pz = centerZ + Math.sin(circleAngle) * radius;
                        addBlockAt(x + px, y + h, z + pz, color, 'sphere', 0.35);
                    }
                    // Centro de cada círculo
                    addBlockAt(x + centerX, y + h, z + centerZ, '#00FFFF', 'sphere', 0.4);
                }
            }

            // SEÇÃO 3: Vesica Piscis (Interseções Sagradas)
            const vesicaColor = '#FFFFFF';
            for (let i = 0; i < 6; i++) {
                const angle1 = (i / 6) * Math.PI * 2;
                const angle2 = ((i + 1) / 6) * Math.PI * 2;
                
                const x1 = Math.cos(angle1) * radius;
                const z1 = Math.sin(angle1) * radius;
                const x2 = Math.cos(angle2) * radius;
                const z2 = Math.sin(angle2) * radius;
                
                // Ponto médio entre dois círculos
                const mx = (x1 + x2) / 2;
                const mz = (z1 + z2) / 2;
                
                for (let h = 0; h < height; h++) {
                    addBlockAt(x + mx, y + h, z + mz, vesicaColor, 'sphere', 0.5);
                }
            }

            // SEÇÃO 4: Conexões energéticas (linhas douradas)
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const centerX = Math.cos(angle) * radius;
                const centerZ = Math.sin(angle) * radius;
                
                // Linha do centro até cada círculo externo
                const steps = 8;
                for (let t = 0; t <= steps; t++) {
                    const ratio = t / steps;
                    const lx = centerX * ratio;
                    const lz = centerZ * ratio;
                    addBlockAt(x + lx, y + height / 2, z + lz, '#FFD700', 'sphere', 0.2);
                }
            }
        }
    },

    sri_yantra: {
        icon: '🕉️',
        name: 'Sri Yantra',
        params: [
            { name: 'size', label: 'Tamanho', default: 8, min: 5, max: 15 },
            { name: 'height', label: 'Altura', default: 5, min: 2, max: 10 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const size = params.size;
            const height = params.height;
            const color = currentColor || '#FF4500';

            // SEÇÃO 1: Bindu (Ponto Central)
            addBlockAt(x, y + height, z, '#FFD700', 'sphere', 0.6);
            
            // Pilar central
            for (let h = 0; h < height; h++) {
                addBlockAt(x, y + h, z, '#FFD700', 'cylinder', 0.3);
            }

            // SEÇÃO 2: 9 Triângulos Entrelaçados
            // 4 triângulos apontando para cima (Shiva - masculino)
            const upTriangles = [
                { radius: size * 0.9, rotation: 0, color: '#FF0000' },
                { radius: size * 0.7, rotation: Math.PI / 9, color: '#FF4500' },
                { radius: size * 0.5, rotation: Math.PI / 6, color: '#FF6347' },
                { radius: size * 0.3, rotation: Math.PI / 4, color: '#FF7F50' }
            ];

            // 5 triângulos apontando para baixo (Shakti - feminino)
            const downTriangles = [
                { radius: size * 0.95, rotation: Math.PI, color: '#00CED1' },
                { radius: size * 0.75, rotation: Math.PI + Math.PI / 10, color: '#20B2AA' },
                { radius: size * 0.6, rotation: Math.PI + Math.PI / 7, color: '#48D1CC' },
                { radius: size * 0.45, rotation: Math.PI + Math.PI / 5, color: '#40E0D0' },
                { radius: size * 0.25, rotation: Math.PI + Math.PI / 3, color: '#7FFFD4' }
            ];

            // Desenhar triângulos para cima
            upTriangles.forEach((tri, idx) => {
                const layerHeight = y + (idx + 1) * (height / 5);
                
                for (let i = 0; i < 3; i++) {
                    const angle = tri.rotation + (i / 3) * Math.PI * 2;
                    const v1 = {
                        x: Math.cos(angle) * tri.radius,
                        z: Math.sin(angle) * tri.radius
                    };
                    const nextAngle = tri.rotation + ((i + 1) / 3) * Math.PI * 2;
                    const v2 = {
                        x: Math.cos(nextAngle) * tri.radius,
                        z: Math.sin(nextAngle) * tri.radius
                    };
                    
                    // Linha entre vértices
                    const steps = 15;
                    for (let t = 0; t <= steps; t++) {
                        const ratio = t / steps;
                        const px = v1.x + (v2.x - v1.x) * ratio;
                        const pz = v1.z + (v2.z - v1.z) * ratio;
                        addBlockAt(x + px, layerHeight, z + pz, tri.color, 'cylinder', 0.25);
                    }
                }
            });

            // Desenhar triângulos para baixo
            downTriangles.forEach((tri, idx) => {
                const layerHeight = y + (idx + 1) * (height / 6);
                
                for (let i = 0; i < 3; i++) {
                    const angle = tri.rotation + (i / 3) * Math.PI * 2;
                    const v1 = {
                        x: Math.cos(angle) * tri.radius,
                        z: Math.sin(angle) * tri.radius
                    };
                    const nextAngle = tri.rotation + ((i + 1) / 3) * Math.PI * 2;
                    const v2 = {
                        x: Math.cos(nextAngle) * tri.radius,
                        z: Math.sin(nextAngle) * tri.radius
                    };
                    
                    // Linha entre vértices
                    const steps = 15;
                    for (let t = 0; t <= steps; t++) {
                        const ratio = t / steps;
                        const px = v1.x + (v2.x - v1.x) * ratio;
                        const pz = v1.z + (v2.z - v1.z) * ratio;
                        addBlockAt(x + px, layerHeight, z + pz, tri.color, 'cylinder', 0.25);
                    }
                }
            });

            // SEÇÃO 3: Círculos Concêntricos (Quadrados)
            const circles = [size * 1.1, size * 1.3, size * 1.5];
            circles.forEach((circleRadius, idx) => {
                for (let a = 0; a < 360; a += 5) {
                    const angle = a * Math.PI / 180;
                    const cx = Math.cos(angle) * circleRadius;
                    const cz = Math.sin(angle) * circleRadius;
                    addBlockAt(x + cx, y + 0.5, z + cz, '#8B4513', 'cube', 0.3);
                }
            });

            // SEÇÃO 4: Lótus Externa (Pétalas)
            const petalCount = 8;
            for (let i = 0; i < petalCount; i++) {
                const angle = (i / petalCount) * Math.PI * 2;
                const petalX = Math.cos(angle) * size * 1.8;
                const petalZ = Math.sin(angle) * size * 1.8;
                
                // Pétala
                for (let p = 0; p < 5; p++) {
                    const petalAngle = angle + (p - 2) * 0.1;
                    const px = Math.cos(petalAngle) * (size * 1.6 + p * 0.3);
                    const pz = Math.sin(petalAngle) * (size * 1.6 + p * 0.3);
                    addBlockAt(x + px, y + 0.3, z + pz, '#FF69B4', 'sphere', 0.4);
                }
            }
        }
    },

    vesica_piscis: {
        icon: '♓',
        name: 'Vesica Piscis',
        params: [
            { name: 'radius', label: 'Raio das Esferas', default: 5, min: 3, max: 10 },
            { name: 'separation', label: 'Separação', default: 0.5, min: 0.3, max: 0.9 }
        ],
        generate: (params) => {
            const x = 0, y = 0, z = 0;
            const radius = params.radius;
            const separation = params.separation;
            const color = currentColor || '#4169E1';

            // SEÇÃO 1: Duas Esferas Intersecionadas
            const offset = radius * separation;

            // Esfera da esquerda
            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    for (let k = -radius; k <= radius; k++) {
                        const dist = Math.sqrt(i*i + j*j + k*k);
                        if (dist <= radius && dist >= radius - 0.5) {
                            addBlockAt(x - offset + i, y + radius + j, z + k, color, 'sphere', 0.3);
                        }
                    }
                }
            }

            // Esfera da direita
            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    for (let k = -radius; k <= radius; k++) {
                        const dist = Math.sqrt(i*i + j*j + k*k);
                        if (dist <= radius && dist >= radius - 0.5) {
                            addBlockAt(x + offset + i, y + radius + j, z + k, color, 'sphere', 0.3);
                        }
                    }
                }
            }

            // SEÇÃO 2: Região de Interseção (Vesica)
            // A forma da "bexiga de peixe" onde as esferas se sobrepõem
            const vesicaColor = '#FFD700';
            
            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    for (let k = -radius; k <= radius; k++) {
                        const dist1 = Math.sqrt((i + offset)*(i + offset) + j*j + k*k);
                        const dist2 = Math.sqrt((i - offset)*(i - offset) + j*j + k*k);
                        
                        // Dentro de ambas as esferas
                        if (dist1 <= radius && dist2 <= radius) {
                            addBlockAt(x + i, y + radius + j, z + k, vesicaColor, 'sphere', 0.4);
                        }
                    }
                }
            }

            // SEÇÃO 3: Centros das Esferas (marcados)
            addBlockAt(x - offset, y + radius, z, '#FF0000', 'sphere', 0.8);
            addBlockAt(x + offset, y + radius, z, '#00FF00', 'sphere', 0.8);

            // SEÇÃO 4: Eixo da Proporção Áurea
            // Linha conectando os centros
            const steps = Math.floor(offset * 2 * 5);
            for (let t = 0; t <= steps; t++) {
                const ratio = t / steps;
                const px = -offset + (offset * 2) * ratio;
                addBlockAt(x + px, y + radius, z, '#FFFFFF', 'cylinder', 0.2);
            }

            // SEÇÃO 5: Geometria Derivada (Triângulo Equilátero)
            // A vesica piscis forma a base de um triângulo equilátero perfeito
            const triHeight = radius * Math.sqrt(3);
            
            // Vértice superior do triângulo
            addBlockAt(x, y + radius + triHeight - offset, z, '#FF00FF', 'sphere', 0.7);
            
            // Linhas do triângulo
            const triSteps = 20;
            for (let t = 0; t <= triSteps; t++) {
                const ratio = t / triSteps;
                
                // Lado esquerdo
                const lx1 = -offset + offset * ratio;
                const ly1 = (triHeight - offset) * ratio;
                addBlockAt(x + lx1, y + radius + ly1, z, '#9370DB', 'sphere', 0.25);
                
                // Lado direito
                const lx2 = offset - offset * ratio;
                const ly2 = (triHeight - offset) * ratio;
                addBlockAt(x + lx2, y + radius + ly2, z, '#9370DB', 'sphere', 0.25);
            }

            // SEÇÃO 6: Círculo Circunscrito
            for (let a = 0; a < 360; a += 5) {
                const angle = a * Math.PI / 180;
                const circleRadius = radius * 1.1;
                const cx = Math.cos(angle) * circleRadius;
                const cz = Math.sin(angle) * circleRadius;
                addBlockAt(x + cx, y + radius, z + cz, '#00FFFF', 'sphere', 0.25);
            }
        }
    },
// NOVAS FUNÇÕES
	sierpinski_pyramid: {
		icon: '🔺',
		name: 'Pirâmide de Sierpinski',
		params: [
			{ name: 'size', label: 'Tamanho Base', default: 16, min: 8, max: 32 },
			{ name: 'iterations', label: 'Iterações', default: 3, min: 1, max: 5 },
			{ name: 'heightScale', label: 'Escala Altura', default: 1.0, min: 0.5, max: 2.0 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const baseSize = params.size;
			const iterations = params.iterations;
			const heightScale = params.heightScale;
			const color = currentColor || '#FFA500';
			
			// Função recursiva para criar pirâmide de Sierpinski
			function sierpinski(cx, cy, cz, size, level, maxLevel) {
				if (level >= maxLevel) {
					// Desenhar tetraedro (pirâmide triangular)
					const height = size * heightScale;
					
					// Base triangular
					const points = [
						{x: cx, y: cy, z: cz + size},
						{x: cx - size * 0.866, y: cy, z: cz - size * 0.5},
						{x: cx + size * 0.866, y: cy, z: cz - size * 0.5}
					];
					
					// Preencher base triangular
					for (let i = 0; i <= size; i++) {
						for (let j = 0; j <= i; j++) {
							const px = cx - size/2 + j;
							const pz = cz - size/2 + i;
							
							// Verificar se está dentro do triângulo
							if (isInTriangle(px, pz, points[0].x, points[0].z, 
											 points[1].x, points[1].z, 
											 points[2].x, points[2].z)) {
								for (let h = 0; h < 1; h++) {
									addBlockAt(px, cy + h, pz, color, 'cube', 0.95);
								}
							}
						}
					}
					
					// Lados triangulares da pirâmide
					const apex = {x: cx, y: cy + height, z: cz};
					
					// Criar cada face lateral
					for (let face = 0; face < 3; face++) {
						const p1 = points[face];
						const p2 = points[(face + 1) % 3];
						
						// Criar superfície triangular
						for (let i = 0; i <= size; i++) {
							for (let j = 0; j <= i; j++) {
								const t1 = j / size;
								const t2 = (i - j) / size;
								const t3 = 1 - t1 - t2;
								
								if (t3 >= 0) {
									const px = p1.x * t1 + p2.x * t2 + apex.x * t3;
									const py = p1.y * t1 + p2.y * t2 + apex.y * t3;
									const pz = p1.z * t1 + p2.z * t2 + apex.z * t3;
									
									addBlockAt(px, py, pz, color, 'cube', 0.95);
								}
							}
						}
					}
				} else {
					// Dividir em 4 pirâmides menores
					const newSize = size / 2;
					const newHeight = newSize * heightScale;
					
					// Pirâmide do topo
					sierpinski(cx, cy + newHeight, cz, newSize, level + 1, maxLevel);
					
					// Três pirâmides da base
					const baseY = cy;
					sierpinski(cx, baseY, cz + newSize, newSize, level + 1, maxLevel);
					sierpinski(cx - newSize * 0.866, baseY, cz - newSize * 0.5, newSize, level + 1, maxLevel);
					sierpinski(cx + newSize * 0.866, baseY, cz - newSize * 0.5, newSize, level + 1, maxLevel);
				}
			}
			
			// Função auxiliar para verificar ponto em triângulo
			function isInTriangle(px, pz, ax, az, bx, bz, cx, cz) {
				const area = 0.5 * (-bz * cx + az * (-bx + cx) + ax * (bz - cz) + bx * cz);
				const s = 1/(2*area) * (az * cx - ax * cz + (cz - az) * px + (ax - cx) * pz);
				const t = 1/(2*area) * (ax * bz - az * bx + (az - bz) * px + (bx - ax) * pz);
				return s >= 0 && t >= 0 && (1 - s - t) >= 0;
			}
			
			// Iniciar a recursão
			sierpinski(x, y, z, baseSize, 0, iterations);
		}
	},

	dragon_curve_3d: {
		icon: '🐉',
		name: 'Curva do Dragão 3D',
		params: [
			{ name: 'iterations', label: 'Iterações', default: 8, min: 4, max: 12 },
			{ name: 'size', label: 'Tamanho', default: 6, min: 3, max: 10 },
			{ name: 'height', label: 'Altura 3D', default: 2, min: 1, max: 4 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const iterations = params.iterations;
			const size = params.size;
			const heightScale = params.height;
			const color = currentColor || '#FF0000';

			// Função recursiva para gerar curva do dragão
			function dragonCurve(depth, startX, startY, endX, endY, sign, points) {
				if (depth === 0) {
					points.push({ x: endX, y: endY });
				} else {
					// Calcular ponto médio rotacionado 45°
					const midX = (startX + endX) / 2 + sign * (startY - endY) / 2;
					const midY = (startY + endY) / 2 + sign * (endX - startX) / 2;
					
					// Recursão
					dragonCurve(depth - 1, startX, startY, midX, midY, 1, points);
					dragonCurve(depth - 1, endX, endY, midX, midY, -1, points);
				}
			}

			// Gerar pontos 2D
			const points = [{ x: 0, y: 0 }];
			dragonCurve(iterations, 0, 0, size, 0, 1, points);

			// SEÇÃO 1: Desenhar curva 3D (otimizado)
			for (let i = 0; i < points.length - 1; i += 2) { // ← Pula pontos (otimização)
				const p1 = points[i];
				const p2 = points[i + 1];
				
				// Altura ondulada
				const zHeight = Math.sin(i * 0.2) * heightScale;
				
				// Interpolar entre pontos (menos steps = mais rápido)
				const steps = 3; // ← Reduzido de 8 para 3
				for (let t = 0; t <= steps; t++) {
					const ratio = t / steps;
					const px = p1.x + (p2.x - p1.x) * ratio;
					const py = p1.y + (p2.y - p1.y) * ratio;
					const pz = zHeight + Math.sin(ratio * Math.PI) * heightScale * 0.3;
					
					// Criar segmento
					addBlockAt(x + px, y + pz, z + py, color, 'sphere', 0.4);
				}
			}

			// SEÇÃO 2: Pontos de destaque (menos pontos)
			for (let i = 0; i < points.length; i += 8) { // ← A cada 8 pontos
				const p = points[i];
				const zHeight = Math.sin(i * 0.2) * heightScale;
				addBlockAt(x + p.x, y + zHeight, z + p.y, '#FFD700', 'sphere', 0.6);
			}

			// SEÇÃO 3: Base simples (otimizada)
			const baseSize = size * 0.8;
			for (let i = -baseSize; i <= baseSize; i += 1.5) { // ← Espaçamento maior
				for (let j = -baseSize; j <= baseSize; j += 1.5) {
					if (Math.random() < 0.3) { // ← Apenas 30% dos blocos
						addBlockAt(x + i, y - heightScale - 1, z + j, '#808080', 'cube', 0.8);
					}
				}
			}
		}
	},

	hilbert_curve: {
		icon: '🔄',
		name: 'Curva de Hilbert 3D',
		params: [
			{ name: 'order', label: 'Ordem', default: 3, min: 1, max: 5 },
			{ name: 'size', label: 'Tamanho', default: 10, min: 5, max: 20 },
			{ name: 'thickness', label: 'Espessura', default: 0.5, min: 0.2, max: 1.0 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const order = params.order;
			const size = params.size;
			const thickness = params.thickness;
			const color = currentColor || '#00FF00';
			
			// Gerar pontos da curva de Hilbert 3D
			function hilbert3D(index, order, x, y, z, size, points) {
				if (order === 0) {
					points.push({
						x: x * size,
						y: y * size,
						z: z * size
					});
					return;
				}
				
				const halfSize = size / 2;
				
				// Mapeamento dos subcubos
				const vertices = [
					[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
					[1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]
				];
				
				const sequence = [
					0, 1, 3, 2, 6, 7, 5, 4
				];
				
				for (let i = 0; i < 8; i++) {
					const vertex = vertices[sequence[i]];
					hilbert3D(
						index + i * Math.pow(8, order - 1),
						order - 1,
						x + vertex[0] * halfSize,
						y + vertex[1] * halfSize,
						z + vertex[2] * halfSize,
						halfSize,
						points
					);
				}
			}
			
			// Gerar todos os pontos
			const points = [];
			hilbert3D(0, order, 0, 0, 0, 1, points);
			
			// Escalar os pontos
			const scaledPoints = points.map(p => ({
				x: p.x * size / Math.pow(2, order),
				y: p.y * size / Math.pow(2, order),
				z: p.z * size / Math.pow(2, order)
			}));
			
			// Desenhar a curva 3D
			for (let i = 0; i < scaledPoints.length - 1; i++) {
				const p1 = scaledPoints[i];
				const p2 = scaledPoints[i + 1];
				
				// Criar segmento
				const steps = 5;
				for (let t = 0; t <= steps; t++) {
					const ratio = t / steps;
					const px = p1.x + (p2.x - p1.x) * ratio;
					const py = p1.y + (p2.y - p1.y) * ratio;
					const pz = p1.z + (p2.z - p1.z) * ratio;
					
					addBlockAt(x + px, y + py, z + pz, color, 'sphere', thickness);
					
					// Criar conectores
					if (t < steps) {
						const nextRatio = (t + 1) / steps;
						const nextPx = p1.x + (p2.x - p1.x) * nextRatio;
						const nextPy = p1.y + (p2.y - p1.y) * nextRatio;
						const nextPz = p1.z + (p2.z - p1.z) * nextRatio;
						
						// Distância entre pontos
						const dx = nextPx - px;
						const dy = nextPy - py;
						const dz = nextPz - pz;
						const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
						
						if (dist > 0.1) {
							addBlockAt(
								x + (px + nextPx) / 2,
								y + (py + nextPy) / 2,
								z + (pz + nextPz) / 2,
								color,
								'cylinder',
								{x: thickness/2, y: dist, z: thickness/2},
								{x: Math.atan2(dz, Math.sqrt(dx*dx + dy*dy)), y: Math.atan2(dy, dx), z: 0}
							);
						}
					}
				}
			}
			
			// Adicionar cubo delimitador
			const cubeSize = size * 1.1;
			const cubeColor = '#444444';
			for (let i = 0; i <= cubeSize; i++) {
				for (let j = 0; j <= cubeSize; j++) {
					for (let k = 0; k <= cubeSize; k++) {
						if (i === 0 || i === cubeSize || j === 0 || j === cubeSize || k === 0 || k === cubeSize) {
							if (Math.random() < 0.05) {
								addBlockAt(
									x + i - cubeSize/2,
									y + j - cubeSize/2,
									z + k - cubeSize/2,
									cubeColor,
									'cube',
									0.4
								);
							}
						}
					}
				}
			}
		}
	},

	julia_set: {
		icon: '🌊',
		name: 'Conjunto de Julia 3D',
		params: [
			{ name: 'real', label: 'Parte Real (c)', default: -0.7, min: -1.0, max: 1.0 },
			{ name: 'imag', label: 'Parte Imaginária (c)', default: 0.27015, min: -1.0, max: 1.0 },
			{ name: 'iterations', label: 'Iterações', default: 50, min: 20, max: 100 },
			{ name: 'scale', label: 'Escala', default: 8, min: 4, max: 16 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const cReal = params.real;
			const cImag = params.imag;
			const maxIter = params.iterations;
			const scale = params.scale;
			const color = currentColor || '#FF00FF';
			
			// Constantes do fractal
			const escapeRadius = 4.0;
			const bailout = 16.0;
			
			// Gerar fractal 2D e extruir para 3D
			const gridSize = 20;
			const step = 2.0 / gridSize;
			
			for (let i = -gridSize; i <= gridSize; i++) {
				for (let j = -gridSize; j <= gridSize; j++) {
					let zReal = i * step;
					let zImag = j * step;
					
					let iteration = 0;
					while (iteration < maxIter) {
						const zReal2 = zReal * zReal;
						const zImag2 = zImag * zImag;
						
						if (zReal2 + zImag2 > bailout) break;
						
						const newZReal = zReal2 - zImag2 + cReal;
						const newZImag = 2 * zReal * zImag + cImag;
						
						zReal = newZReal;
						zImag = newZImag;
						
						iteration++;
					}
					
					// Se o ponto está no conjunto de Julia
					if (iteration < maxIter) {
						// Calcular altura baseada na iteração
						const height = (iteration / maxIter) * scale * 2;
						
						// Criar coluna 3D
						for (let h = 0; h < height; h++) {
							// Interpolar cor baseada na iteração
							const hue = (iteration / maxIter) * 360;
							const saturation = 80 + (h / height) * 20;
							const lightness = 40 + (iteration % 20) * 2;
							
							// Converter HSL para RGB (simplificado)
							const colorIntensity = iteration / maxIter;
							const r = Math.floor(255 * colorIntensity);
							const g = Math.floor(128 * (1 - colorIntensity));
							const b = Math.floor(255 * (0.5 + 0.5 * Math.sin(iteration * 0.1)));
							
							const finalColor = `rgb(${r}, ${g}, ${b})`;
							
							addBlockAt(
								x + zReal * scale,
								y + h - scale,
								z + zImag * scale,
								finalColor,
								'cube',
								0.8
							);
						}
						
						// Adicionar topo com formato especial
						const topHeight = height;
						addBlockAt(
							x + zReal * scale,
							y + topHeight - scale,
							z + zImag * scale,
							color,
							'sphere',
							0.5 + (iteration % 5) * 0.1
						);
					}
				}
			}
			
			// Adicionar base
			const baseSize = scale * 1.5;
			for (let i = -baseSize; i <= baseSize; i += 2) {
				for (let j = -baseSize; j <= baseSize; j += 2) {
					addBlockAt(
						x + i,
						y - scale - 1,
						z + j,
						'#333333',
						'cube',
						1.8
					);
				}
			}
		}
	},

	apollonian_gasket: {
		icon: '⚪',
		name: 'Gasket Apoloniano',
		params: [
			{ name: 'iterations', label: 'Iterações', default: 3, min: 1, max: 5 },
			{ name: 'baseRadius', label: 'Raio Base', default: 8, min: 4, max: 16 },
			{ name: 'thickness', label: 'Espessura', default: 0.5, min: 0.2, max: 1.0 }
		],
		generate: (params) => {
			const x = 0, y = 0, z = 0;
			const maxIterations = params.iterations;
			const baseRadius = params.baseRadius;
			const thickness = params.thickness;
			const color = currentColor || '#00FFFF';
			
			// Representar círculo como {x, y, z, radius}
			const circles = [];
			
			// Círculos externos (três grandes tangentes)
			const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
			
			// Criar círculo central grande
			circles.push({
				x: 0, y: 0, z: 0,
				radius: baseRadius,
				color: colors[0]
			});
			
			// Criar círculos tangentes ao central
			const smallRadius = baseRadius / 2.0;
			for (let i = 0; i < 3; i++) {
				const angle = (i * 120) * Math.PI / 180;
				const circleX = Math.cos(angle) * (baseRadius - smallRadius);
				const circleZ = Math.sin(angle) * (baseRadius - smallRadius);
				
				circles.push({
					x: circleX, y: 0, z: circleZ,
					radius: smallRadius,
					color: colors[(i + 1) % colors.length]
				});
			}
			
			// Função recursiva para adicionar círculos menores
			function addApollonian(existingCircles, depth) {
				if (depth >= maxIterations) return;
				
				const newCircles = [];
				
				for (let i = 0; i < existingCircles.length; i++) {
					for (let j = i + 1; j < existingCircles.length; j++) {
						for (let k = j + 1; k < existingCircles.length; k++) {
							const c1 = existingCircles[i];
							const c2 = existingCircles[j];
							const c3 = existingCircles[k];
							
							// Calcular círculo de Soddy (tangente aos três)
							// Usando fórmula de Descartes para círculos tangentes
							const k1 = 1 / c1.radius;
							const k2 = 1 / c2.radius;
							const k3 = 1 / c3.radius;
							
							// Solução para curvatura do círculo tangente
							const k4 = k1 + k2 + k3 + 2 * Math.sqrt(k1 * k2 + k2 * k3 + k3 * k1);
							const newRadius = 1 / k4;
							
							// Calcular centro usando coordenadas complexas
							const z1 = complex(c1.x, c1.z);
							const z2 = complex(c2.x, c2.z);
							const z3 = complex(c3.x, c3.z);
							
							// Fórmula de Descartes complexa simplificada
							const z4 = complexMult(
								complexAdd(
									complexAdd(
										complexMult(complex(k1), z1),
										complexMult(complex(k2), z2)
									),
									complexMult(complex(k3), z3)
								),
								complex(1/(k1 + k2 + k3), 0)
							);
							
							const newCircle = {
								x: z4.re,
								y: 0,
								z: z4.im,
								radius: newRadius,
								color: colors[depth % colors.length]
							};
							
							// Verificar se o círculo é válido e não muito pequeno
							if (newRadius > thickness * 0.5 && newRadius < baseRadius) {
								newCircles.push(newCircle);
							}
						}
					}
				}
				
				// Adicionar novos círculos
				existingCircles.push(...newCircles);
				
				// Continuar recursão
				addApollonian(existingCircles, depth + 1);
			}
			
			// Funções auxiliares para números complexos
			function complex(re, im) {
				return { re, im };
			}
			
			function complexAdd(a, b) {
				return complex(a.re + b.re, a.im + b.im);
			}
			
			function complexMult(a, b) {
				return complex(
					a.re * b.re - a.im * b.im,
					a.re * b.im + a.im * b.re
				);
			}
			
			// Gerar fractal
			addApollonian(circles, 1);
			
			// Desenhar todos os círculos como esferas 3D
			circles.forEach(circle => {
				// Desenhar anel principal
				const steps = Math.max(8, Math.floor(circle.radius * 2));
				for (let a = 0; a < 360; a += 360/steps) {
					const angle = a * Math.PI / 180;
					const px = circle.x + Math.cos(angle) * circle.radius;
					const pz = circle.z + Math.sin(angle) * circle.radius;
					
					// Criar anel 3D
					for (let h = -thickness; h <= thickness; h += 0.3) {
						addBlockAt(
							x + px,
							y + h,
							z + pz,
							circle.color,
							'sphere',
							thickness * 0.8
						);
					}
				}
				
				// Desenhar esfera central para círculos maiores
				if (circle.radius > baseRadius * 0.3) {
					addBlockAt(
						x + circle.x,
						y,
						z + circle.z,
						circle.color,
						'sphere',
						Math.max(thickness, circle.radius * 0.2)
					);
				}
			});
			
			// Adicionar plano base
			const planeSize = baseRadius * 2.5;
			for (let i = -planeSize; i <= planeSize; i += 2) {
				for (let j = -planeSize; j <= planeSize; j += 2) {
					const dist = Math.sqrt(i*i + j*j);
					const alpha = 1.0 - Math.min(1.0, dist / planeSize);
					
					if (alpha > 0.3) {
						addBlockAt(
							x + i,
							y - thickness - 1,
							z + j,
							'#222222',
							'cube',
							1.8
						);
					}
				}
			}
		}
	},

sticks_pile: {
        icon: '🥢',
        name: 'Pilha de Varetas',
        params: [
            { name: 'count', label: 'Qtd. Varetas', default: 50, min: 20, max: 150 },
            { name: 'length', label: 'Comprimento', default: 8, min: 4, max: 15 },
            { name: 'thickness', label: 'Espessura', default: 0.15, min: 0.05, max: 0.4 },
            { name: 'chaos', label: 'Espalhamento', default: 1.5, min: 0.5, max: 4 }
        ],
        generate: (params) => {
            const cx = 0, cy = 0, cz = 0;
            
            const count = params.count;
            const baseLength = params.length;
            const thickness = params.thickness;
            const spread = params.chaos; // Quão longe do centro elas podem nascer

            const baseColorHex = currentColor || '#8B4513'; // Marrom sela padrão

            for (let i = 0; i < count; i++) {
                // 1. Variação de Cor (para parecer madeira real)
                // Clareia ou escurece ligeiramente a cor base
                let color = baseColorHex;
                if (Math.random() > 0.5) {
                     // Uma forma simples de variar a cor sem bibliotecas complexas:
                     // Se quiser algo mais sofisticado, podemos usar HSL depois.
                     // Por enquanto, alterna entre a cor escolhida e um tom de madeira fixo.
                     color = Math.random() > 0.7 ? '#A0522D' : (Math.random() > 0.4 ? '#CD853F' : baseColorHex);
                }

                // 2. Comprimento Variável (nem todas as varetas são iguais)
                const currentLength = baseLength * (0.8 + Math.random() * 0.4);

                // 3. Posição Central (Deslocada aleatoriamente para criar o "bolo")
                // Elevamos um pouco cy + spread*0.5 para que o centro da pilha não fique enterrado no chão
                const px = cx + (Math.random() - 0.5) * spread;
                const py = cy + Math.random() * spread * 0.8 + (currentLength/2 * 0.1); 
                const pz = cz + (Math.random() - 0.5) * spread;

                // 4. Rotação Caótica (O segredo do jogo de varetas)
                // Rotação completa de 0 a 360 graus (2 * PI radianos) em todos os eixos
                const rotX = Math.random() * Math.PI * 2;
                const rotY = Math.random() * Math.PI * 2;
                const rotZ = Math.random() * Math.PI * 2;

                addBlockAt(
                    px, py, pz,
                    color,
                    'cylinder',
                    { 
                        x: thickness, 
                        y: currentLength, 
                        z: thickness 
                    },
                    { 
                        x: rotX, 
                        y: rotY, 
                        z: rotZ 
                    }
                );
            }
        }
    },
	
}; // 🔥 FECHAMENTO CORRETO DO OBJETO ShapeRegistry
	


// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Função para verificar se um ponto está dentro de um polígono
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

    if (!currentShape || !ShapeRegistry[currentShape]) {
        console.error("Erro: Nenhuma forma válida selecionada.");
        return;
    }

    // 1. CAPTURA AS CONFIGURAÇÕES DO USUÁRIO (OVERRIDE)
    const overrideTypeElement = document.getElementById('masterBlockType');
    const overrideScaleElement = document.getElementById('masterBlockScale');
    
    // Se os elementos não existirem no HTML, usa padrões seguros
    const overrideType = overrideTypeElement ? overrideTypeElement.value : 'default';
    const overrideScale = overrideScaleElement ? parseFloat(overrideScaleElement.value) : 1.0;

    console.log(`🔧 Config: Tipo=${overrideType}, Escala=${overrideScale}`);

    // 2. TÉCNICA DE INTERCEPTAÇÃO (PROXY)
    // Guardamos a função original 'addBlockAt' numa variável segura
    const originalAddBlockAt = window.addBlockAt;

    // Criamos uma função temporária que vai "mentir" para o gerador
    window.addBlockAt = function(x, y, z, color, type, scale, rotation) {
        
        // LÓGICA DE DECISÃO:
        // Se o usuário escolheu "default", usamos o 'type' que a forma pediu.
        // Se escolheu outra coisa (ex: sphere), forçamos 'sphere'.
        const finalType = (overrideType === 'default') ? type : overrideType;
        
        // Multiplicamos a escala original da forma pela escala Mestra
        // (Se a forma pede scale 1 e o mestre pede 0.5, o resultado é 0.5)
        // Tratamos se scale for objeto ou número
        let finalScale;
        if (typeof scale === 'object') {
             finalScale = { 
                 x: scale.x * overrideScale, 
                 y: scale.y * overrideScale, 
                 z: scale.z * overrideScale 
             };
        } else {
             finalScale = (scale || 1) * overrideScale;
        }

        // Chama a função REAL com os dados alterados
        originalAddBlockAt(x, y, z, color, finalType, finalScale, rotation);
    };

    // 3. EXECUÇÃO
    // Limpa a cena mantendo texturas (opcional, pode remover se preferir acumular)
    clearScene(true); 

    try {
        const shape = ShapeRegistry[currentShape];
        // O gerador vai rodar achando que está chamando o addBlockAt normal,
        // mas está chamando nosso interceptador!
        shape.generate(currentParams);
        
        showStatus(`✅ ${shape.name} gerado com sucesso!`, 'success');
    } catch (error) {
        console.error("Erro na geração:", error);
        showStatus("Erro ao gerar forma.", 'error');
    } finally {
        // 4. RESTAURAÇÃO (CRUCIAL!)
        // Devolvemos a função original para o window, senão o editor quebra depois
        window.addBlockAt = originalAddBlockAt;
        console.log("🔄 Função original addBlockAt restaurada.");
    }

    updateJSON();
    closeShapeModal();
    console.groupEnd();
}