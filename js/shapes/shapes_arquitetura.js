// js/shapes_arquitetura.js
// Arquitetura
// Shapes: pyramid, stairs, arch, tower, spiralStairs, dome, tree, castle, bridge, lShapedStairs, figurine

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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
	
	egypt_pyramid: {
		icon: '🏺',
		name: 'Pirâmide do Egito',
		params: [
			{ name: 'base',     label: 'Tamanho da Base', default: 21, min: 7,  max: 40 },
			{ name: 'hollow',   label: 'Interior Oco',    default: 1,  min: 0,  max: 1  },
			{ name: 'chamber',  label: 'Câmara Interna',  default: 1,  min: 0,  max: 1  },
			{ name: 'entrance', label: 'Entrada Norte',   default: 1,  min: 0,  max: 1  }
		],
		generate: (params) => {
			const base     = Math.floor(params.base)   || 21;
			const hollow   = params.hollow   >= 0.5;
			const chamber  = params.chamber  >= 0.5;
			const entrance = params.entrance >= 0.5;

			const h = Math.max(4, Math.round(base * 0.636));
			const stoneColor = '#c8a96e';
			const darkStone  = '#a0845a';

			for (let y = 0; y < h; y++) {
				const t = 1 - (y / h);
				const half = Math.floor((base / 2) * t);
				if (half < 0) continue;

				for (let x = -half; x <= half; x++) {
					for (let z = -half; z <= half; z++) {
						const isBorder = hollow
							? (Math.abs(x) >= half - 1 || Math.abs(z) >= half - 1)
							: true;
						if (!isBorder) continue;

						if (entrance && z === -half && Math.abs(x) <= 1 && y <= 3) continue;

						if (chamber && hollow) {
							const chamberY = Math.floor(h * 0.15);
							if (y >= chamberY && y <= chamberY + 3
								&& Math.abs(x) <= 2 && Math.abs(z) <= 2) {
								if (z >= -2 && z <= 2 && Math.abs(x) <= 1) continue;
							}
						}

						const color = y < 2 ? darkStone : stoneColor;
						addBlockAt(x, y + 0.5, z, color, 'cube');
					}
				}
			}

			addBlockAt(0, h + 0.5, 0, '#ffd700', 'cube');
		}
	},

});
