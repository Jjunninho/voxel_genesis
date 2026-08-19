// js/shapes_matematicas.js
// Matemáticas
// Shapes: helix, wave, fractalTree, dnaHelix, heart, star, maze, crystal, hollowCylinder, rectangularPrism, hollowSphere, hollowCone, hexagon, spiral2D

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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
    // ============================================,

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

	heart: {
		icon: '❤️',
		name: 'Coração',
		params: [
			{ name: 'size',  label: 'Tamanho',   default: 8, min: 4, max: 15 },
			{ name: 'depth', label: 'Espessura', default: 4, min: 1, max: 8  }
		],
		generate: (params) => {
			const size  = params.size;
			const depth = params.depth;

			for (let x = -size; x <= size; x++) {
				for (let y = -size; y <= size; y++) {
					// Equação 2D do coração: (x²+y²-1)³ - x²y³ ≤ 0
					// Normalizado para caber no tamanho pedido
					const nx =  x / (size * 0.6);
					const ny =  y / (size * 0.6);
					const val = Math.pow(nx*nx + ny*ny - 1, 3) - nx*nx * ny*ny*ny;

					if (val <= 0) {
						// Extrudado em Z para ter volume
						for (let z = 0; z < depth; z++) {
							addBlockAt(x, y + size + 0.5, z - Math.floor(depth/2), currentColor, 'cube');
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
			{ name: 'points',      label: 'Pontas',        default: 5,   min: 3,   max: 12 },
			{ name: 'outerRadius', label: 'Raio Externo',  default: 3,   min: 1,   max: 8  },
			{ name: 'depth',       label: 'Espessura',     default: 0.8, min: 0.3, max: 3  },
			{ name: 'pointHeight', label: 'Altura Pontas', default: 1.5, min: 0.5, max: 4  }
		],
		generate: (params) => {
			const points      = params.points;
			const outerR      = params.outerRadius;
			const innerR      = outerR * 0.4;
			const depth       = params.depth;
			const pointHeight = params.pointHeight;
			const color       = currentColor || '#FFD700';

			// Injeta params para a geometria especial
			window.__shapeGeoParams = { points, outerR, depth };

			// 1. Corpo principal da estrela (um único bloco com geometria especial)
			addBlockAt(0, depth / 2 + 0.5, 0, color, 'star_shape');

			window.__shapeGeoParams = null;

			// 2. Pontas cônicas em cima (voxels normais — pintáveis)
			for (let i = 0; i < points; i++) {
				const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
				const px = Math.round(Math.cos(angle) * outerR);
				const pz = Math.round(Math.sin(angle) * outerR);
				const py = depth / 2 + 0.5;

				addBlockAt(
					px, py + pointHeight / 2, pz,
					color, 'cone',
					{ x: innerR * 0.6, y: pointHeight, z: innerR * 0.6 },
					{ x: 0, y: -angle - Math.PI / 2, z: 0 }
				);

				// Brilho na ponta
				addBlockAt(px, py + pointHeight, pz, '#FFFFFF', 'sphere', 0.15);
			}

			// 3. Núcleo central elevado
			addBlockAt(0, depth + 0.8, 0, color, 'sphere', innerR * 0.8);
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
			{ name: 'count',  label: 'Fragmentos', default: 7,   min: 1,   max: 15  },
			{ name: 'height', label: 'Altura',     default: 1.2, min: 0.5, max: 3.0 },
			{ name: 'radius', label: 'Largura',    default: 0.3, min: 0.1, max: 0.8 },
			{ name: 'spread', label: 'Abertura',   default: 3,   min: 0,   max: 8   }
		],
		generate: (params) => {
			const count  = params.count;
			const height = params.height;
			const radius = params.radius;
			const spread = params.spread;
			const color  = currentColor || '#88CCFF';

			// Fragmento central sempre no meio
			window.__shapeGeoParams = { height, radius };
			addBlockAt(0, height / 2 + 0.5, 0, color, 'crystal_shard');

			// Fragmentos ao redor em espiral, inclinados e variados
			for (let i = 1; i < count; i++) {
				const angle = (i / (count - 1)) * Math.PI * 2;
				const dist  = spread * (0.3 + (i / count) * 0.7);
				const x     = Math.round(Math.cos(angle) * dist);
				const z     = Math.round(Math.sin(angle) * dist);

				// Variação de tamanho por fragmento
				const h = height * (0.5 + Math.random() * 0.8);
				const r = radius * (0.5 + Math.random() * 0.7);

				window.__shapeGeoParams = { height: h, radius: r };
				addBlockAt(x, h / 2 + 0.5, z, color, 'crystal_shard');
			}

			window.__shapeGeoParams = null;
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

});
