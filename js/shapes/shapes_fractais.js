// js/shapes_fractais.js
// Fractais Avançados
// Shapes: sierpinski_pyramid, dragon_curve_3d, hilbert_curve, julia_set, apollonian_gasket

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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
	}

});
