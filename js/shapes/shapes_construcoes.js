// js/shapes_construcoes.js
// Construções
// Shapes: proceduralBuilding, proceduralHouse, temple, vault, lighthouse, windmill, well, gazebo, fountain, ruins

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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
	
	iglu: {
		icon: '🧊',
		name: 'Iglu',
		params: [
			{ name: 'radius',    label: 'Raio',            default: 7,  min: 4, max: 14 },
			{ name: 'thickness', label: 'Espessura Parede', default: 1,  min: 1, max: 3  },
			{ name: 'tunnel',    label: 'Túnel Entrada',   default: 4,  min: 2, max: 7  }
		],
		generate: (params) => {
			const R  = params.radius;
			const th = params.thickness;
			const tl = params.tunnel;

			const iceColor  = '#C8E6F5';
			const iceColor2 = '#A8D4E8';
			const tunnelCol = '#90C4D8';

			// Hemisfério oco
			for (let x = -R; x <= R; x++) {
				for (let z = -R; z <= R; z++) {
					for (let y = 0; y <= R; y++) {
						const d = Math.sqrt(x*x + y*y + z*z);
						if (d <= R && d >= R - th) {
							// Bloco de gelo: alterna cores por "tijolo" pra simular juntas
							const row   = Math.floor(Math.atan2(y, Math.sqrt(x*x+z*z)) * 3);
							const col2  = Math.floor(Math.atan2(x, z) * 4 + row * 0.5);
							const color = (row + col2) % 2 === 0 ? iceColor : iceColor2;
							addBlockAt(x, y + 0.5, z, color, 'cube');
						}
					}
				}
			}

			// Túnel de entrada (lado Z positivo)
			const tw = 2; // meia-largura do túnel
			const th2 = 3; // altura do túnel
			for (let z = R; z <= R + tl; z++) {
				for (let x = -tw; x <= tw; x++) {
					for (let y = 0; y < th2; y++) {
						const isWall = (x === -tw || x === tw || y === th2 - 1);
						if (isWall) addBlockAt(x, y + 0.5, z, tunnelCol, 'cube');
					}
				}
			}

			// Abre a entrada na parede do iglu
			for (let x = -tw + 1; x <= tw - 1; x++) {
				for (let y = 0; y < th2 - 1; y++) {
					// Remove blocos na abertura (coloca blocos de "ar" — simplesmente não adiciona)
					// O iglu já não tem interior, então só precisamos garantir a abertura no túnel
				}
			}
		}
	},

	casebre: {
		icon: '🛖',
		name: 'Casebre',
		params: [
			{ name: 'width',      label: 'Largura',       default: 9,  min: 5, max: 16 },
			{ name: 'depth',      label: 'Profundidade',  default: 7,  min: 5, max: 14 },
			{ name: 'wallH',      label: 'Altura Parede', default: 4,  min: 3, max: 7  },
			{ name: 'roofSlope',  label: 'Inclinação',    default: 1,  min: 1, max: 3  },
			{ name: 'chaos',      label: 'Caos Telhado',  default: 1,  min: 0, max: 3  },
			{ name: 'chimney',    label: 'Chaminé',       default: 1,  min: 0, max: 1  }
		],
		generate: (params) => {
			const W  = params.width;
			const D  = params.depth;
			const wH = params.wallH;
			const slope = params.roofSlope;
			const chaos = params.chaos;
			const hasChimney = params.chimney >= 1;

			const woodColors  = ['#8B6347', '#7A5535', '#9C7355'];
			const roofColor   = '#5C4033';
			const chimneyCol  = '#888888';

			// Paredes (perímetro)
			for (let x = 0; x < W; x++) {
				for (let z = 0; z < D; z++) {
					const isPerimeter = (x === 0 || x === W-1 || z === 0 || z === D-1);
					if (!isPerimeter) continue;

					// Porta: abertura frontal centrada
					const midX = Math.floor(W / 2);
					if (z === 0 && Math.abs(x - midX) <= 1) continue;

					for (let y = 0; y < wH; y++) {
						// Janelas: furos nas paredes laterais
						if ((x === 0 || x === W-1) && y >= 1 && y <= 2
							&& z >= Math.floor(D*0.3) && z <= Math.floor(D*0.6)) continue;

						const color = woodColors[Math.floor(Math.random() * 3)];
						addBlockAt(x - Math.floor(W/2), y + 0.5, z - Math.floor(D/2), color, 'cube');
					}
				}
			}

			// Telhado de duas águas com caos (ruído determinístico)
			const cx = W / 2;
			const seed = W * 7 + D * 3;
			for (let x = 0; x < W; x++) {
				const distX = Math.abs(x - cx);
				const baseH = Math.floor(distX * slope) + wH;
				for (let z = -1; z <= D; z++) { // +1 pra beirais
					// Ruído determinístico por posição
					const noise = chaos > 0
						? Math.floor(((Math.sin(x * 1.7 + z * 2.3 + seed) + 1) / 2) * chaos)
						: 0;
					const roofH = baseH + noise;
					for (let y = wH; y <= roofH; y++) {
						addBlockAt(x - Math.floor(W/2), y + 0.5, z - Math.floor(D/2), roofColor, 'cube');
					}
				}
			}

			// Chaminé
			if (hasChimney) {
				const chX = Math.floor(W * 0.7) - Math.floor(W/2);
				const chZ = Math.floor(D / 2) - Math.floor(D/2);
				const distCh = Math.abs(Math.floor(W * 0.7) - cx);
				const chBase = Math.floor(distCh * slope) + wH;
				for (let y = chBase; y <= chBase + 4; y++) {
					for (let dx = 0; dx <= 1; dx++) {
						for (let dz = 0; dz <= 1; dz++) {
							addBlockAt(chX + dx, y + 0.5, chZ + dz, chimneyCol, 'cube');
						}
					}
				}
			}
		}
	},

	chale: {
		icon: '🏔️',
		name: 'Chalé Suíço',
		params: [
			{ name: 'width',     label: 'Largura',        default: 11, min: 7,  max: 18 },
			{ name: 'depth',     label: 'Profundidade',   default: 8,  min: 5,  max: 14 },
			{ name: 'wallH',     label: 'Altura Andar',   default: 4,  min: 3,  max: 6  },
			{ name: 'roofSlope', label: 'Inclinação',     default: 2,  min: 1,  max: 4  },
			{ name: 'balconies', label: 'Sacadas',        default: 2,  min: 0,  max: 4  },
			{ name: 'ornament',  label: 'Ornamento Beiral',default: 1, min: 0,  max: 1  }
		],
		generate: (params) => {
			const W  = params.width;
			const D  = params.depth;
			const wH = params.wallH;
			const slope  = params.roofSlope;
			const nBal   = params.balconies;
			const ornament = params.ornament >= 1;

			const wallColor    = '#D7CCA0'; // reboco claro
			const woodColor    = '#6B3F1A'; // madeira escura
			const roofColor    = '#3E2208'; // telhado muito escuro
			const balconyColor = '#8B5E2A';

			const ox = -Math.floor(W/2);
			const oz = -Math.floor(D/2);
			const totalH = wH * 2; // térreo + 1° andar

			// Paredes dos dois andares
			for (let y = 0; y < totalH; y++) {
				for (let x = 0; x < W; x++) {
					for (let z = 0; z < D; z++) {
						const isPerimeter = (x === 0 || x === W-1 || z === 0 || z === D-1);
						if (!isPerimeter) continue;

						// Porta no térreo
						const midX = Math.floor(W/2);
						if (z === 0 && Math.abs(x - midX) <= 1 && y < wH - 1) continue;

						// Janelas no 1° andar (y >= wH)
						if (y >= wH && z === 0 && Math.abs(x - midX) <= 1) continue;

						// Cor: madeira no 1° andar, reboco no térreo
						const color = y >= wH ? woodColor : wallColor;
						addBlockAt(x + ox, y + 0.5, z + oz, color, 'cube');
					}
				}
			}

			// Telhado de duas águas, muito inclinado
			const cx = W / 2;
			for (let x = -1; x <= W; x++) { // -1 e +1 pro beiral
				const distX = Math.abs(x - cx);
				const baseH = totalH + Math.floor(distX * slope);
				for (let z = -1; z <= D; z++) {
					for (let y = totalH; y <= baseH; y++) {
						addBlockAt(x + ox, y + 0.5, z + oz, roofColor, 'cube');
					}
					// Ornamento: dentes no beiral (a cada 2 blocos)
					if (ornament && (z === -1 || z === D) && x % 2 === 0) {
						addBlockAt(x + ox, baseH + 1.5, z + oz, woodColor, 'cube');
					}
				}
			}

			// Sacadas no 1° andar (fachada frontal z=0)
			if (nBal > 0) {
				const spacing = Math.floor(W / (nBal + 1));
				for (let b = 0; b < nBal; b++) {
					const bx = spacing * (b + 1) - 1;
					const by = wH; // nível do 1° andar

					// Piso da sacada
					for (let dx = -1; dx <= 1; dx++) {
						for (let dz = -1; dz <= 0; dz++) {
							addBlockAt(bx + dx + ox, by + 0.5, dz + oz, balconyColor, 'cube');
						}
					}
					// Guarda-corpo (frente e lados)
					for (let dx = -1; dx <= 1; dx++) {
						addBlockAt(bx + dx + ox, by + 1.5, -1 + oz, woodColor, 'cube');
					}
					addBlockAt(bx - 1 + ox, by + 1.5, oz,     woodColor, 'cube');
					addBlockAt(bx + 1 + ox, by + 1.5, oz,     woodColor, 'cube');

					// Travessa em X do guarda-corpo
					addBlockAt(bx + ox, by + 1.5, oz, balconyColor, 'cube');
				}
			}
		}
	},
	
	// Inicio das novas funções natureza
	
	// ========================================
	// NATUREZA - TIER 2 (Formato ShapeRegistry Correto)
	// Cole dentro do objeto ShapeRegistry
	// ========================================,

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
	}

});
