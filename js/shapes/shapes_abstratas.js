// js/shapes_abstratas.js
// Abstratas
// Shapes: knot, mobius, klein_bottle, pentagram, mandala, fractal_cube, tessellation

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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

});
