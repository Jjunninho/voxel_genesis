// js/shapes_sagrada.js
// Geometria Sagrada
// Shapes: metatrons_cube, flower_of_life, seed_of_life, sri_yantra, vesica_piscis

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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

});
