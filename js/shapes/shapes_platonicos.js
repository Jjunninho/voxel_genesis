// js/shapes_platonicos.js
// Sólidos Platônicos
// Shapes: tetrahedron, hexahedron, octahedron, dodecahedron, icosahedron

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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

});
