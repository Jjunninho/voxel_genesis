// js/shapes_geometria_av.js
// Geometria Avançada
// Shapes: superquadric, implicitSurface, gyroid, sticks_pile,
//         schwartz_p, lemniscate_3d, seifert_surface, torus_knot_surface,
//         voronoi_columns, reaction_diffusion, hyperboloid, oloid,
//         schwartz_d, nodal_surface

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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

	sticks_pile: {
		icon: '🥢',
		name: 'Pilha de Varetas',
		params: [
			{ name: 'count',     label: 'Qtd. Varetas',  default: 50,   min: 20,   max: 150 },
			{ name: 'length',    label: 'Comprimento',   default: 8,    min: 4,    max: 15  },
			{ name: 'thickness', label: 'Espessura',     default: 0.15, min: 0.05, max: 0.4 },
			{ name: 'chaos',     label: 'Espalhamento',  default: 1.5,  min: 0.5,  max: 4   }
		],
		generate: (params) => {
			const count      = params.count;
			const baseLength = params.length;
			const thickness  = params.thickness;
			const spread     = params.chaos;
			const baseColor  = currentColor || '#8B4513';

			for (let i = 0; i < count; i++) {
				let color = baseColor;
				if (Math.random() > 0.5) {
					color = Math.random() > 0.7 ? '#A0522D' : (Math.random() > 0.4 ? '#CD853F' : baseColor);
				}
				const currentLength = baseLength * (0.8 + Math.random() * 0.4);
				const px = (Math.random() - 0.5) * spread;
				const py = Math.random() * spread * 0.8 + (currentLength / 2 * 0.1);
				const pz = (Math.random() - 0.5) * spread;
				addBlockAt(px, py, pz, color, 'cylinder',
					{ x: thickness, y: currentLength, z: thickness },
					{ x: Math.random() * Math.PI * 2, y: Math.random() * Math.PI * 2, z: Math.random() * Math.PI * 2 }
				);
			}
		}
	},

	// ── NOVAS SHAPES ─────────────────────────────────────────────────────────

	schwartz_p: {
		icon: '🫧',
		name: 'Superfície de Schwartz P',
		params: [
			{ name: 'size',      label: 'Tamanho',    default: 8,   min: 4,  max: 14 },
			{ name: 'threshold', label: 'Espessura',  default: 0.4, min: 0.1, max: 1.2 }
		],
		// Superfície mínima periódica de Schwartz P: cos(x)+cos(y)+cos(z) = 0
		// Cria uma estrutura em lattice porosa muito usada em bioengenharia
		generate: (p) => {
			const s = p.size;
			const t = p.threshold;
			const freq = Math.PI / (s * 0.5); // escala a frequência para caber no volume
			for (let x = -s; x <= s; x++) {
				for (let y = -s; y <= s; y++) {
					for (let z = -s; z <= s; z++) {
						const v = Math.cos(x * freq * 3) + Math.cos(y * freq * 3) + Math.cos(z * freq * 3);
						if (Math.abs(v) < t) {
							addBlockAt(x, y + s + 0.5, z, currentColor, 'sphere');
						}
					}
				}
			}
		}
	},

	schwartz_d: {
		icon: '🕸️',
		name: 'Superfície de Schwartz D',
		params: [
			{ name: 'size',      label: 'Tamanho',   default: 8,   min: 4,  max: 14 },
			{ name: 'threshold', label: 'Espessura', default: 0.4, min: 0.1, max: 1.2 }
		],
		// Superfície diamante de Schwartz: sin(x)sin(y)sin(z)+sin(x)cos(y)cos(z)+... = 0
		// Parece uma rede cristalina diamante
		generate: (p) => {
			const s = p.size;
			const t = p.threshold;
			const f = Math.PI / (s * 0.5);
			for (let x = -s; x <= s; x++) {
				for (let y = -s; y <= s; y++) {
					for (let z = -s; z <= s; z++) {
						const fx = x * f * 3, fy = y * f * 3, fz = z * f * 3;
						const v = Math.sin(fx) * Math.sin(fy) * Math.sin(fz)
								+ Math.sin(fx) * Math.cos(fy) * Math.cos(fz)
								+ Math.cos(fx) * Math.sin(fy) * Math.cos(fz)
								+ Math.cos(fx) * Math.cos(fy) * Math.sin(fz);
						if (Math.abs(v) < t) {
							addBlockAt(x, y + s + 0.5, z, currentColor, 'sphere');
						}
					}
				}
			}
		}
	},

	hyperboloid: {
		icon: '🌀',
		name: 'Hiperbolóide',
		params: [
			{ name: 'height',   label: 'Altura',      default: 10, min: 4,  max: 20 },
			{ name: 'waist',    label: 'Cintura',      default: 3,  min: 1,  max: 8  },
			{ name: 'flare',    label: 'Abertura',     default: 4,  min: 1,  max: 10 },
			{ name: 'shell',    label: 'Só Casca',     default: 1,  min: 0,  max: 1  }
		],
		// Hiperbolóide de uma folha: x²/a² + z²/a² - y²/b² = 1
		// A forma elegante de torres de resfriamento e taças de vinho
		generate: (p) => {
			const h   = p.height;
			const a   = p.waist;
			const flr = p.flare;
			const shellOnly = p.shell >= 0.5;
			for (let y = 0; y <= h; y++) {
				const t   = (y - h / 2) / (h / 2); // -1 a 1
				const r   = Math.round(a + flr * t * t); // raio aumenta nas extremidades
				const r2  = r * r;
				const ri2 = shellOnly ? (r - 1) * (r - 1) : -1;
				for (let x = -r - 1; x <= r + 1; x++) {
					for (let z = -r - 1; z <= r + 1; z++) {
						const d2 = x * x + z * z;
						if (d2 <= r2 && d2 > ri2) {
							addBlockAt(x, y + 0.5, z, currentColor, 'cube');
						}
					}
				}
			}
		}
	},

	nodal_surface: {
		icon: '🔬',
		name: 'Superfície Nodal',
		params: [
			{ name: 'size',      label: 'Tamanho',    default: 8,   min: 4,  max: 14 },
			{ name: 'threshold', label: 'Espessura',  default: 0.5, min: 0.1, max: 1.5 },
			{ name: 'freq',      label: 'Frequência', default: 2,   min: 1,  max: 5  }
		],
		// Superfície nodal cúbica: produto de seis planos = x²y² + y²z² + z²x² - c
		// Cria uma estrutura com nós (singularidades) muito curiosa visualmente
		generate: (p) => {
			const s = p.size;
			const t = p.threshold;
			const f = p.freq * Math.PI / s;
			for (let x = -s; x <= s; x++) {
				for (let y = -s; y <= s; y++) {
					for (let z = -s; z <= s; z++) {
						const fx = x * f, fy = y * f, fz = z * f;
						const v = Math.cos(fx) * Math.cos(fy)
								+ Math.cos(fy) * Math.cos(fz)
								+ Math.cos(fz) * Math.cos(fx);
						if (Math.abs(v) < t) {
							addBlockAt(x, y + s + 0.5, z, currentColor, 'cube');
						}
					}
				}
			}
		}
	},

	lemniscate_3d: {
		icon: '♾️',
		name: 'Lemniscata 3D',
		params: [
			{ name: 'scale',  label: 'Escala',    default: 8,  min: 4, max: 15 },
			{ name: 'tube',   label: 'Espessura', default: 2,  min: 1, max: 5  },
			{ name: 'twist',  label: 'Torção',    default: 2,  min: 0, max: 6  }
		],
		// Lemniscata de Bernoulli extrudada em 3D com torção — símbolo do infinito volumétrico
		// Paramétrica: r² = a²·cos(2θ), extrudada em Y com twist
		generate: (p) => {
			const a     = p.scale;
			const tube  = p.tube;
			const twist = p.twist;
			const steps = 360;
			for (let i = 0; i < steps; i++) {
				const theta = (i / steps) * Math.PI * 2;
				const cos2t = Math.cos(2 * theta);
				if (cos2t < 0) continue; // lemniscata só existe onde cos(2θ) >= 0
				const r = a * Math.sqrt(cos2t);
				// ponto na curva base
				const cx = r * Math.cos(theta);
				const cz = r * Math.sin(theta);
				// torção ao longo de Y
				for (let dy = -tube; dy <= tube; dy++) {
					const twistAngle = (dy / tube) * twist;
					const tx = cx * Math.cos(twistAngle) - cz * Math.sin(twistAngle);
					const tz = cx * Math.sin(twistAngle) + cz * Math.cos(twistAngle);
					for (let dr = 0; dr <= tube; dr++) {
						const nx = Math.round(tx + dr * Math.cos(theta + Math.PI / 2));
						const nz = Math.round(tz + dr * Math.sin(theta + Math.PI / 2));
						addBlockAt(nx, dy + tube + 0.5, nz, currentColor, 'sphere');
					}
				}
			}
		}
	},

	voronoi_columns: {
		icon: '🏛️',
		name: 'Colunas Voronoi',
		params: [
			{ name: 'seeds',   label: 'Sementes',    default: 12, min: 4,  max: 30 },
			{ name: 'area',    label: 'Área',        default: 10, min: 6,  max: 20 },
			{ name: 'height',  label: 'Altura Base', default: 8,  min: 2,  max: 20 },
			{ name: 'vary',    label: 'Variação Y',  default: 4,  min: 0,  max: 12 }
		],
		// Diagrama de Voronoi projetado verticalmente — cria colunas orgânicas
		// tipo basalto hexagonal ou órgão de tubos. Cada coluna tem altura variável.
		generate: (p) => {
			const n    = p.seeds;
			const area = p.area;
			const baseH = p.height;
			const vary  = p.vary;

			// Gera sementes aleatórias com seed determinístico (pseudo-random)
			const pts = [];
			for (let i = 0; i < n; i++) {
				// LCG simples para reprodutibilidade
				const sx = ((i * 1664525 + 1013904223) & 0xffffffff) / 0xffffffff;
				const sz = ((i * 22695477 + 1)         & 0xffffffff) / 0xffffffff;
				pts.push({
					x: (sx - 0.5) * area * 2,
					z: (sz - 0.5) * area * 2,
					h: baseH + Math.floor(((i * 6364136223846793005 + 1) % 1000) / 1000 * vary)
				});
			}

			// Para cada coluna XZ, descobre a semente mais próxima e empilha até h
			for (let x = -area; x <= area; x++) {
				for (let z = -area; z <= area; z++) {
					let minDist = Infinity, nearest = null;
					for (const pt of pts) {
						const d = (x - pt.x) ** 2 + (z - pt.z) ** 2;
						if (d < minDist) { minDist = d; nearest = pt; }
					}
					// Borda da célula Voronoi (segunda distância próxima)
					let secondDist = Infinity;
					for (const pt of pts) {
						if (pt === nearest) continue;
						const d = (x - pt.x) ** 2 + (z - pt.z) ** 2;
						if (d < secondDist) secondDist = d;
					}
					const isBorder = (secondDist - minDist) < 2.5;
					const col = isBorder ? '#555555' : currentColor;
					for (let y = 0; y < nearest.h; y++) {
						addBlockAt(x, y + 0.5, z, col, 'cube');
					}
				}
			}
		}
	},

	torus_knot_surface: {
		icon: '🪢',
		name: 'Nó Toroidal Volumétrico',
		params: [
			{ name: 'p',      label: 'Volta P',    default: 3, min: 2, max: 7 },
			{ name: 'q',      label: 'Volta Q',    default: 2, min: 1, max: 6 },
			{ name: 'R',      label: 'Raio Maior', default: 7, min: 4, max: 12 },
			{ name: 'r',      label: 'Raio Tubo',  default: 2, min: 1, max: 5  }
		],
		// Nó toroidal (p,q): curva 3D que se enrola p vezes em torno do eixo
		// e q vezes em torno do tubo do toro. Base de topologia de nós.
		generate: (params) => {
			const P  = Math.round(params.p);
			const Q  = Math.round(params.q);
			const R  = params.R;
			const r  = params.r;
			const steps = 600;
			const placed = new Set();
			for (let i = 0; i < steps; i++) {
				const t  = (i / steps) * Math.PI * 2;
				// Ponto na curva do nó toroidal
				const phi   = Q * t;
				const theta = P * t;
				const cx = (R + r * Math.cos(phi)) * Math.cos(theta);
				const cy = (R + r * Math.cos(phi)) * Math.sin(theta);
				const cz = r * Math.sin(phi);
				// Preenche tubo ao redor da curva
				for (let dx = -r; dx <= r; dx++) {
					for (let dy = -r; dy <= r; dy++) {
						for (let dz = -r; dz <= r; dz++) {
							if (dx*dx + dy*dy + dz*dz > r*r) continue;
							const bx = Math.round(cx + dx);
							const by = Math.round(cy + dy);
							const bz = Math.round(cz + dz);
							const key = `${bx},${by},${bz}`;
							if (placed.has(key)) continue;
							placed.add(key);
							addBlockAt(bx, by + R + r + 1, bz, currentColor, 'sphere');
						}
					}
				}
			}
		}
	},

	seifert_surface: {
		icon: '🌐',
		name: 'Superfície de Seifert',
		params: [
			{ name: 'size',   label: 'Tamanho',    default: 8, min: 4, max: 14 },
			{ name: 'layers', label: 'Camadas',    default: 3, min: 1, max: 6  },
			{ name: 'twist',  label: 'Torção',     default: 2, min: 1, max: 5  }
		],
		// Superfície de Seifert: orientável delimitada por um nó
		// Visualmente parece um disco com "anéis" que se retorcem — topologia fascinante
		generate: (p) => {
			const s     = p.size;
			const L     = p.layers;
			const twist = p.twist;
			const steps = 200;
			const placed = new Set();
			for (let layer = 0; layer < L; layer++) {
				const rBase = s * (layer + 1) / L;
				for (let i = 0; i < steps; i++) {
					const theta = (i / steps) * Math.PI * 2;
					for (let rr = rBase - 1; rr <= rBase + 0.5; rr += 0.5) {
						const twistAngle = twist * theta;
						const x = Math.round(rr * Math.cos(theta));
						const y = Math.round(rr * 0.5 * Math.sin(twistAngle));
						const z = Math.round(rr * Math.sin(theta));
						const key = `${x},${y},${z}`;
						if (placed.has(key)) continue;
						placed.add(key);
						addBlockAt(x, y + s + 0.5, z, currentColor, 'sphere');
					}
				}
			}
		}
	},

	oloid: {
		icon: '🥚',
		name: 'Olóide',
		params: [
			{ name: 'radius', label: 'Raio',     default: 7,  min: 3, max: 14 },
			{ name: 'shell',  label: 'Só Casca', default: 1,  min: 0, max: 1  }
		],
		// Olóide: sólido geométrico único que rola sobre qualquer superfície
		// sem deslizar — formado pela convex hull de dois círculos perpendiculares
		// com distância entre centros = raio. Descoberto por Paul Schatz (1929).
		generate: (p) => {
			const R       = p.radius;
			const shellOnly = p.shell >= 0.5;
			const placed  = new Set();
			const d       = R; // distância entre centros dos dois círculos

			// Círculo 1: no plano XY, centrado em (-d/2, 0, 0)
			// Círculo 2: no plano YZ, centrado em (+d/2, 0, 0)
			// Convex hull aproximada por voxels: para cada ponto,
			// testa se está dentro da envoltória convexa dos dois anéis

			for (let x = -R - d; x <= R + d; x++) {
				for (let y = -R; y <= R; y++) {
					for (let z = -R; z <= R; z++) {
						// Distância aos dois arcos
						// C1: centro (-d/2, 0, 0), plano XY (z=0)
						const d1 = Math.abs(Math.sqrt((x + d/2)**2 + y**2) - R);
						// C2: centro (+d/2, 0, 0), plano YZ (x=0)
						const d2 = Math.abs(Math.sqrt((x - d/2)**2 + z**2) - R);

						const inside  = d1 <= 1.5 && d2 <= 1.5;
						const surface = d1 <= 0.8 || d2 <= 0.8;

						if (shellOnly ? surface : inside) {
							const key = `${x},${y},${z}`;
							if (placed.has(key)) continue;
							placed.add(key);
							addBlockAt(x, y + R + 0.5, z, currentColor, 'sphere');
						}
					}
				}
			}
		}
	},

	reaction_diffusion: {
		icon: '🧫',
		name: 'Reação-Difusão (Turing)',
		params: [
			{ name: 'size',    label: 'Grade',      default: 20, min: 10, max: 30 },
			{ name: 'steps',   label: 'Iterações',  default: 40, min: 10, max: 80 },
			{ name: 'dA',      label: 'Difusão A',  default: 1.0, min: 0.5, max: 1.5 },
			{ name: 'dB',      label: 'Difusão B',  default: 0.5, min: 0.1, max: 0.9 },
			{ name: 'height',  label: 'Altura',     default: 6,  min: 2,  max: 15 }
		],
		// Simulação de Gray-Scott (Reação-Difusão de Turing)
		// Produz padrões orgânicos como manchas, listras, labirintos —
		// os mesmos mecanismos que formam a pelagem de animais.
		// Projetado em 3D com altura proporcional à concentração de B.
		generate: (p) => {
			const N     = Math.round(p.size);
			const iters = Math.round(p.steps);
			const dA    = p.dA;
			const dB    = p.dB;
			const maxH  = p.height;

			// Parâmetros Gray-Scott (preset "coral")
			const f = 0.0545, k = 0.062;
			const dt = 1.0;

			// Inicializa grids A e B
			let A = [], B = [];
			for (let i = 0; i < N; i++) {
				A.push([]); B.push([]);
				for (let j = 0; j < N; j++) {
					A[i].push(1);
					// Semente no centro
					const di = i - N/2, dj = j - N/2;
					B[i].push((di*di + dj*dj < 4) ? 1 : 0);
				}
			}

			// Laplaciano 2D
			function laplacian(grid, i, j) {
				const ip = (i + 1) % N, im = (i - 1 + N) % N;
				const jp = (j + 1) % N, jm = (j - 1 + N) % N;
				return grid[ip][j] + grid[im][j] + grid[i][jp] + grid[i][jm]
					 - 4 * grid[i][j];
			}

			// Itera
			for (let step = 0; step < iters; step++) {
				const nA = A.map(r => [...r]);
				const nB = B.map(r => [...r]);
				for (let i = 0; i < N; i++) {
					for (let j = 0; j < N; j++) {
						const a = A[i][j], b = B[i][j];
						const reaction = a * b * b;
						nA[i][j] = a + dt * (dA * laplacian(A, i, j) - reaction + f * (1 - a));
						nB[i][j] = b + dt * (dB * laplacian(B, i, j) + reaction - (k + f) * b);
						nA[i][j] = Math.max(0, Math.min(1, nA[i][j]));
						nB[i][j] = Math.max(0, Math.min(1, nB[i][j]));
					}
				}
				A = nA; B = nB;
			}

			// Renderiza: concentração B vira altura do bloco
			const half = Math.floor(N / 2);
			for (let i = 0; i < N; i++) {
				for (let j = 0; j < N; j++) {
					const h = Math.round(B[i][j] * maxH);
					if (h <= 0) continue;
					// Cor varia com concentração: frio=baixo, quente=alto
					const t   = B[i][j];
					const r   = Math.round(50  + t * 205);
					const g   = Math.round(180 - t * 150);
					const bl  = Math.round(220 - t * 200);
					const hex = '#' + [r, g, bl].map(v => v.toString(16).padStart(2, '0')).join('');
					for (let y = 0; y < h; y++) {
						addBlockAt(i - half, y + 0.5, j - half, hex, 'cube');
					}
				}
			}
		}
	},

});

// ── DIAGNÓSTICO DE CARREGAMENTO ───────────────────────────────────────────
const _geoAvKeys = [
    'superquadric','implicitSurface','gyroid','sticks_pile',
    'schwartz_p','schwartz_d','hyperboloid','nodal_surface',
    'lemniscate_3d','voronoi_columns','torus_knot_surface',
    'seifert_surface','oloid','reaction_diffusion'
];
const _geoAvOk   = _geoAvKeys.filter(k => !!window.ShapeRegistry[k]);
const _geoAvMiss = _geoAvKeys.filter(k => !window.ShapeRegistry[k]);
console.log(`✅ [shapes_geometria_av] ${_geoAvOk.length}/${_geoAvKeys.length} shapes registradas:`, _geoAvOk);
if (_geoAvMiss.length) console.warn('⚠️ [shapes_geometria_av] NÃO registradas:', _geoAvMiss);
