// js/shapes_natureza.js
// Natureza
// Shapes: cactus, palm, flower, bush, pinecone, mushroom, fallenLog, reed

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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
	
		coral: {
		icon: '🪸',
		name: 'Coral',
		params: [
			{ name: 'branches', label: 'Galhos',   default: 5, min: 2, max: 10 },
			{ name: 'height',   label: 'Altura',   default: 8, min: 4, max: 15 },
			{ name: 'spread',   label: 'Abertura', default: 4, min: 2, max: 8  }
		],
		generate: (params) => {
			const branches = params.branches;
			const height   = params.height;
			const spread   = params.spread;
			const colors   = ['#FF6B6B', '#FF8E53', '#FF4757', '#FF6348', '#FFA502'];

			// Tronco base
			for (let y = 0; y < Math.floor(height * 0.3); y++) {
				addBlockAt(0, y + 0.5, 0, colors[0], 'sphere');
			}

			// Galhos principais
			for (let b = 0; b < branches; b++) {
				const angle  = (b / branches) * Math.PI * 2;
				const color  = colors[b % colors.length];
				const branchH = Math.floor(height * (0.5 + Math.random() * 0.5));
				const tilt   = 0.3 + Math.random() * 0.4;

				for (let y = 0; y < branchH; y++) {
					const t  = y / branchH;
					const r  = spread * t * tilt;
					const wx = Math.sin(angle + t * 1.5) * r * 0.3;
					const wz = Math.cos(angle + t * 1.5) * r * 0.3;
					const x  = Math.round(Math.cos(angle) * r + wx);
					const z  = Math.round(Math.sin(angle) * r + wz);
					const baseY = Math.floor(height * 0.2);
					addBlockAt(x, baseY + y + 0.5, z, color, 'sphere');
				}

				// Galhinhos no topo
				const tipY = Math.floor(height * 0.2) + branchH;
				const tipR = spread * tilt;
				const tipX = Math.round(Math.cos(angle) * tipR);
				const tipZ = Math.round(Math.sin(angle) * tipR);
				for (let s = 0; s < 3; s++) {
					const sa = angle + (s / 3) * Math.PI * 0.8 - 0.4;
					for (let sy = 0; sy < 3; sy++) {
						addBlockAt(
							tipX + Math.round(Math.cos(sa) * sy * 0.7),
							tipY + sy + 0.5,
							tipZ + Math.round(Math.sin(sa) * sy * 0.7),
							'#FFCDD2', 'sphere'
						);
					}
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

    rock: {
        icon: '🪨',
        name: 'Pedreira',
        params: [
            { name: 'count',        label: 'Qtd. Pedras',      default: 1,    min: 2,    max: 15   },
            { name: 'spread',       label: 'Espalhamento',     default: 14,   min: 5,    max: 30   },
            { name: 'sizeMin',      label: 'Tamanho mín.',     default: 1.5,  min: 0.5,  max: 4    },
            { name: 'sizeMax',      label: 'Tamanho máx.',     default: 4.0,  min: 1,    max: 8    },
            { name: 'irregularity', label: 'Irregularidade',   default: 0.12, min: 0.01, max: 0.35 },
            { name: 'depth',        label: 'Prof. das pontas', default: 0.8,  min: 0.1,  max: 4.0  },
            { name: 'smooth',       label: 'Suavização',       default: 0.35, min: 0.0,  max: 1.0  },
        ],
        generate: (params) => {
            const { count, spread, sizeMin, sizeMax, irregularity, depth, smooth } = params;

            for (let n = 0; n < count; n++) {
                const ox = Math.round((Math.random()-0.5) * spread);
                const oz = Math.round((Math.random()-0.5) * spread);
                const size = sizeMin + Math.random() * (sizeMax - sizeMin);
                const flatten = 0.5 + Math.random() * 0.5;
                const complexity = Math.floor(Math.random() * 4);
                const noiseFreq = 1.5 + Math.random() * 3.0;
                const phaseX = Math.random()*Math.PI*2, phaseY = Math.random()*Math.PI*2, phaseZ = Math.random()*Math.PI*2;
                const scaleX = 0.85+Math.random()*0.3, scaleY = flatten*(0.75+Math.random()*0.25), scaleZ = 0.85+Math.random()*0.3;
                const grayBase = 55 + Math.random() * 65;

                const baseFaces = [4,8,12,20][complexity];
                let geometry;
                if      (baseFaces===4)  geometry = new THREE.TetrahedronGeometry(size,0);
                else if (baseFaces===8)  geometry = new THREE.OctahedronGeometry(size,0);
                else if (baseFaces===12) geometry = new THREE.DodecahedronGeometry(size,0);
                else                     geometry = new THREE.IcosahedronGeometry(size,0);

                const positions = geometry.attributes.position;
                const vertex = new THREE.Vector3();
                const amplitude = irregularity * size * 0.5;
                const f = noiseFreq / size;

                for (let i = 0; i < positions.count; i++) {
                    vertex.fromBufferAttribute(positions, i);
                    const wX=Math.sin(vertex.y*f+phaseX)*Math.cos(vertex.z*f+phaseZ);
                    const wY=Math.sin(vertex.z*f+phaseY)*Math.cos(vertex.x*f+phaseX);
                    const wZ=Math.sin(vertex.x*f+phaseZ)*Math.cos(vertex.y*f+phaseY);
                    vertex.x=vertex.x*scaleX+wX*amplitude;
                    vertex.y=vertex.y*scaleY+wY*amplitude;
                    vertex.z=vertex.z*scaleZ+wZ*amplitude;
                    positions.setXYZ(i,vertex.x,vertex.y,vertex.z);
                }
                positions.needsUpdate = true;
                geometry.computeVertexNormals();

                const pos = geometry.attributes.position;
                const idx = geometry.index;
                const triCount = idx ? idx.count/3 : pos.count/3;
                let cx=0,cy=0,cz=0;
                for(let i=0;i<pos.count;i++){cx+=pos.getX(i);cy+=pos.getY(i);cz+=pos.getZ(i);}
                cx/=pos.count; cy/=pos.count; cz/=pos.count;
                const oy = Math.round(size*0.3);

                // Protege contra customBrushScale sobrescrever a escala do tetraedro
                const _savedBrushScale = window.customBrushScale;
                window.customBrushScale = null;

                for(let t=0;t<triCount;t++){
                    const ia=idx?idx.getX(t*3):t*3, ib=idx?idx.getX(t*3+1):t*3+1, ic=idx?idx.getX(t*3+2):t*3+2;
                    const ax=pos.getX(ia),ay=pos.getY(ia),az=pos.getZ(ia);
                    const bx=pos.getX(ib),by=pos.getY(ib),bz=pos.getZ(ib);
                    const cx2=pos.getX(ic),cy2=pos.getY(ic),cz2=pos.getZ(ic);
                    // Centro da face — SEM Math.round para preservar geometria contínua
                    const fcx=(ax+bx+cx2)/3,fcy=(ay+by+cy2)/3,fcz=(az+bz+cz2)/3;
                    const br=Math.max(20,Math.min(230,Math.round(grayBase+(fcy/(size||1))*15+((t*37)%40)-20)));
                    const col=`rgb(${br},${br},${Math.min(255,br+8)})`;

                    // Injetar face real para geometries_shapes.js montar o tetraedro
                    window.__shapeGeoParams = {
                        size, irregularity, flatten: 0.75, complexity,
                        depth, smooth, noiseFreq,
                        _face: { ax,ay,az, bx,by,bz, cx2,cy2,cz2, cx,cy,cz }
                    };

                    // Um bloco por face, posição contínua, tipo 'rock' → tetraedro
                    addBlockAt(
                        ox + fcx,
                        oy + fcy + size * 0.5,
                        oz + fcz,
                        col, 'rock', 1
                    );
                }
                window.__shapeGeoParams = null;
                window.customBrushScale = _savedBrushScale;
			}
		}
	},
	
	ipe: {
		icon: '🌺',
		name: 'Ipê',
		params: [
			{ name: 'trunkH',   label: 'Altura Tronco', default: 6,   min: 3, max: 12 },
			{ name: 'trunkR',   label: 'Raio Tronco',   default: 1,   min: 1, max: 3  },
			{ name: 'crownR',   label: 'Raio Copa',     default: 5,   min: 3, max: 10 },
			{ name: 'density',  label: 'Densidade',     default: 0.7, min: 0.3, max: 1.0 },
			{ name: 'flowering',label: 'Floração (0-1)',default: 0.6, min: 0.0, max: 1.0 }
		],
		generate: (params) => {
			const tH  = params.trunkH;
			const tR  = params.trunkR;
			const cR  = params.crownR;
			const den = params.density;
			const flo = params.flowering;

			const trunkColor  = '#5D3A1A';
			const leafColor   = '#2E7D32';
			const flowerColor = '#E91E63'; // rosa — troque por '#F9A825' pro ipê-amarelo

			// Tronco
			for (let y = 0; y < tH; y++) {
				for (let x = -tR; x <= tR; x++) {
					for (let z = -tR; z <= tR; z++) {
						if (x*x + z*z <= tR*tR)
							addBlockAt(x, y + 0.5, z, trunkColor, 'cube');
					}
				}
			}

			// Copa esférica
			const cy = tH + cR * 0.6;
			for (let x = -cR; x <= cR; x++) {
				for (let z = -cR; z <= cR; z++) {
					for (let y = -cR; y <= cR; y++) {
						const dist = Math.sqrt(x*x + y*y + z*z);
						if (dist > cR) continue;
						if (Math.random() > den) continue;
						// Superfície → flor, interior → folha
						const isFlower = dist > cR * 0.75 && Math.random() < flo;
						const color = isFlower ? flowerColor : leafColor;
						addBlockAt(x, cy + y + 0.5, z, color, 'sphere');
					}
				}
			}
		}
	},

	acacia: {
		icon: '🌳',
		name: 'Acácia',
		params: [
			{ name: 'trunkH',  label: 'Altura Tronco',  default: 7,   min: 4, max: 14 },
			{ name: 'trunkR',  label: 'Raio Tronco',    default: 1,   min: 1, max: 2  },
			{ name: 'crownR',  label: 'Raio Copa',      default: 7,   min: 4, max: 12 },
			{ name: 'thick',   label: 'Espessura Copa', default: 2,   min: 1, max: 5  },
			{ name: 'density', label: 'Densidade',      default: 0.8, min: 0.4, max: 1.0 }
		],
		generate: (params) => {
			const tH  = params.trunkH;
			const tR  = params.trunkR;
			const cR  = params.crownR;
			const th  = params.thick;
			const den = params.density;

			const trunkColor = '#6D4C1E';
			const leafColor  = '#558B2F';
			const leafColor2 = '#33691E';

			// Tronco fino e alto
			for (let y = 0; y < tH; y++) {
				for (let x = -tR; x <= tR; x++) {
					for (let z = -tR; z <= tR; z++) {
						if (x*x + z*z <= tR*tR)
							addBlockAt(x, y + 0.5, z, trunkColor, 'cube');
					}
				}
			}

			// Copa achatada: elipsoide com eixo Y comprimido
			const cy = tH;
			for (let x = -cR; x <= cR; x++) {
				for (let z = -cR; z <= cR; z++) {
					for (let y = -th; y <= th; y++) {
						// Equação elipsoide achatada: x²/cR² + y²/th² + z²/cR² ≤ 1
						const val = (x*x)/(cR*cR) + (y*y)/(th*th) + (z*z)/(cR*cR);
						if (val > 1) continue;
						if (Math.random() > den) continue;
						const color = y >= 0 ? leafColor : leafColor2;
						addBlockAt(x, cy + y + 0.5, z, color, 'sphere');
					}
				}
			}

			// Galhos radiais conectando tronco à copa
			const branches = 5;
			for (let b = 0; b < branches; b++) {
				const angle = (b / branches) * Math.PI * 2;
				const bLen  = Math.floor(cR * 0.6);
				for (let i = 0; i < bLen; i++) {
					const t = i / bLen;
					const bx = Math.round(Math.cos(angle) * i);
					const bz = Math.round(Math.sin(angle) * i);
					const by = tH - 1 + Math.round(t * 1.5);
					addBlockAt(bx, by + 0.5, bz, trunkColor, 'cube');
				}
			}
		}
	},

	araucaria: {
		icon: '🎄',
		name: 'Araucária',
		params: [
			{ name: 'height',  label: 'Altura',          default: 18, min: 8,  max: 30 },
			{ name: 'layers',  label: 'Camadas Galhos',  default: 7,  min: 3,  max: 12 },
			{ name: 'branchL', label: 'Comp. Galho',     default: 6,  min: 3,  max: 10 },
			{ name: 'spacing', label: 'Espaçamento',     default: 2,  min: 1,  max: 4  }
		],
		generate: (params) => {
			const h      = params.height;
			const layers = params.layers;
			const bLen   = params.branchL;
			const space  = params.spacing;

			const trunkColor  = '#4E342E';
			const branchColor = '#33691E';
			const tipColor    = '#558B2F';

			// Tronco central
			for (let y = 0; y < h; y++) {
				addBlockAt(0, y + 0.5, 0, trunkColor, 'cube');
				addBlockAt(1, y + 0.5, 0, trunkColor, 'cube');
				addBlockAt(0, y + 0.5, 1, trunkColor, 'cube');
				addBlockAt(1, y + 0.5, 1, trunkColor, 'cube');
			}

			// Camadas de galhos de baixo pra cima
			for (let l = 0; l < layers; l++) {
				const y     = 2 + l * space;
				if (y >= h) break;
				// Galho fica menor conforme sobe
				const len   = Math.max(2, Math.floor(bLen * (1 - l / layers * 0.6)));
				const nArms = 8; // galhos por camada

				for (let i = 0; i < nArms; i++) {
					const angle = (i / nArms) * Math.PI * 2;
					const dirX  = Math.cos(angle);
					const dirZ  = Math.sin(angle);

					for (let r = 1; r <= len; r++) {
						const bx = Math.round(dirX * r);
						const bz = Math.round(dirZ * r);
						// Galho levemente descendente nas pontas
						const by = y - Math.floor(r * 0.3);
						const color = r >= len - 1 ? tipColor : branchColor;
						addBlockAt(bx, by + 0.5, bz, color, 'cube');

						// Folhagem nas pontas
						if (r >= len - 2) {
							addBlockAt(bx, by + 1.5, bz, tipColor, 'sphere');
						}
					}
				}
			}

			// Ponta cônica no topo
			for (let y = h - 3; y <= h + 1; y++) {
				const r = Math.max(0, h + 1 - y);
				for (let x = -r; x <= r; x++) {
					for (let z = -r; z <= r; z++) {
						if (x*x + z*z <= r*r)
							addBlockAt(x, y + 0.5, z, tipColor, 'sphere');
					}
				}
			}
		}
	},

	baoba: {
		icon: '🌵',
		name: 'Baobá',
		params: [
			{ name: 'height',   label: 'Altura Tronco', default: 8,  min: 5, max: 14 },
			{ name: 'trunkR',   label: 'Raio Tronco',   default: 3,  min: 2, max: 6  },
			{ name: 'branches', label: 'Galhos',        default: 6,  min: 3, max: 10 },
			{ name: 'branchL',  label: 'Comp. Galho',   default: 6,  min: 3, max: 10 }
		],
		generate: (params) => {
			const h   = params.height;
			const tR  = params.trunkR;
			const nB  = params.branches;
			const bL  = params.branchL;

			const trunkColor  = '#795548';
			const trunkColor2 = '#6D4C41';
			const branchColor = '#5D4037';
			const leafColor   = '#558B2F';

			// Tronco grosso — levemente afunilado no topo
			for (let y = 0; y < h; y++) {
				const t    = y / h;
				const r    = Math.max(1, Math.round(tR * (1 - t * 0.3)));
				for (let x = -r; x <= r; x++) {
					for (let z = -r; z <= r; z++) {
						if (x*x + z*z <= r*r) {
							const color = (x + z + y) % 2 === 0 ? trunkColor : trunkColor2;
							addBlockAt(x, y + 0.5, z, color, 'cube');
						}
					}
				}
			}

			// Galhos retorcidos saindo do topo
			for (let b = 0; b < nB; b++) {
				const baseAngle = (b / nB) * Math.PI * 2;
				let cx = 0, cz = 0, cy = h;

				for (let i = 0; i < bL; i++) {
					const t      = i / bL;
					// Torção progressiva + inclinação
					const angle  = baseAngle + Math.sin(t * Math.PI) * 0.8;
					const spread = tR * 0.5 + t * 2.5;
					cx = Math.round(Math.cos(angle) * spread);
					cz = Math.round(Math.sin(angle) * spread);
					cy = h + i;

					addBlockAt(cx,     cy + 0.5, cz,     branchColor, 'cube');
					addBlockAt(cx + 1, cy + 0.5, cz,     branchColor, 'cube');

					// Folhagem esparsa nas pontas
					if (i >= bL - 3) {
						for (let dx = -2; dx <= 2; dx++) {
							for (let dz = -2; dz <= 2; dz++) {
								if (dx*dx + dz*dz <= 4 && Math.random() > 0.4)
									addBlockAt(cx + dx, cy + 1.5, cz + dz, leafColor, 'sphere');
							}
						}
					}
				}
			}
		}
	},
	
	arbusto_mini: {
		icon: '🌿',
		name: 'Arbusto Minimalista',
		params: [
			{ name: 'scale',   label: 'Escala Geral', default: 1.0, min: 0.5, max: 3.0 },
			{ name: 'globes',  label: 'Esferas Copa', default: 5,   min: 2,   max: 9   },
			{ name: 'spread',  label: 'Abertura',     default: 1.0, min: 0.5, max: 2.0 },
			{ name: 'season',  label: 'Estação (0-3)',default: 0,   min: 0,   max: 3   }
		],
		generate: (params) => {
			const s  = params.scale;
			const n  = params.globes;
			const sp = params.spread;
			// Estações: 0=normal, 1=outono, 2=inverno(sem folha), 3=florado
			const season = Math.round(params.season);

			const trunkColor = '#5D4037';
			const leafPalettes = [
				['#2E7D32','#388E3C','#43A047','#66BB6A'], // normal
				['#E65100','#F57C00','#FFA726','#FF8F00'], // outono
				['#78909C','#90A4AE','#B0BEC5','#CFD8DC'], // inverno
				['#E91E63','#F06292','#F48FB1','#FCE4EC'], // florado
			];
			const leaves = leafPalettes[season];

			// Base/tronco rasteiro
			addBlockAt(0, 0, 0, trunkColor, 'cylinder', { x: 0.6*s, y: 0.3*s, z: 0.6*s });

			// Esferas de copa distribuídas em espiral
			for (let i = 0; i < n; i++) {
				const t     = i / n;
				const angle = t * Math.PI * 2 * 1.618; // espiral áurea
				const r     = (i === 0 ? 0 : sp * (0.3 + t * 0.5)) * s;
				const x     = Math.cos(angle) * r;
				const z     = Math.sin(angle) * r;
				const y     = (0.3 + t * 0.3) * s;
				const size  = (0.7 - t * 0.15) * s;
				const color = leaves[i % leaves.length];
				addBlockAt(x, y, z, color, 'sphere', size);
			}
		}
	},

	carvalho_mini: {
		icon: '🌳',
		name: 'Carvalho Minimalista',
		params: [
			{ name: 'scale',    label: 'Escala Geral',  default: 1.0, min: 0.5, max: 3.0 },
			{ name: 'trunkSegs',label: 'Segm. Tronco',  default: 3,   min: 2,   max: 6   },
			{ name: 'crownN',   label: 'Esferas Copa',  default: 5,   min: 3,   max: 9   },
			{ name: 'season',   label: 'Estação (0-3)', default: 0,   min: 0,   max: 3   },
			{ name: 'aged',     label: 'Envelhecido',   default: 0,   min: 0,   max: 1   }
		],
		generate: (params) => {
			const s    = params.scale;
			const segs = params.trunkSegs;
			const n    = params.crownN;
			const aged = params.aged >= 0.5;
			const season = Math.round(params.season);

			const trunkColors = aged
				? ['#3E2723','#4E342E','#5D4037']
				: ['#5D4037','#6D4C41','#795548'];

			const leafPalettes = [
				['#2E7D32','#388E3C','#43A047','#66BB6A','#81C784'],
				['#BF360C','#E64A19','#FF5722','#FF7043','#FF8A65'],
				['#757575','#9E9E9E','#BDBDBD','#E0E0E0','#F5F5F5'],
				['#AD1457','#C2185B','#E91E63','#F06292','#F8BBD0'],
			];
			const leaves = leafPalettes[season];

			// Tronco: cilindros empilhados afunilando
			let y = 0.5 * s;
			for (let i = 0; i < segs; i++) {
				const sc = (1.2 - i * 0.15) * s;
				addBlockAt(0, y, 0, trunkColors[i % trunkColors.length], 'cylinder', sc);
				y += 1.3 * s;
			}

			// Copa: cluster de esferas em posições orgânicas
			const crownY = y;
			const positions = [
				[-0.5, 0,    0  ],
				[ 0.5, 0,    0  ],
				[ 0,   0.7, -0.5],
				[ 0,   0.7,  0.5],
				[ 0,   1.4,  0  ],
				[-0.8, 0.5,  0.5],
				[ 0.8, 0.5, -0.5],
				[ 0,   0.2,  0.8],
				[ 0,   0.2, -0.8],
			];
			const sizes = [1.5, 1.5, 1.3, 1.3, 1.8, 1.1, 1.1, 1.0, 1.0];

			for (let i = 0; i < n && i < positions.length; i++) {
				const [px, py, pz] = positions[i];
				addBlockAt(px*s, crownY + py*s, pz*s, leaves[i % leaves.length], 'sphere', sizes[i]*s);
			}

			// Envelhecido: galhos expostos
			if (aged) {
				const branchColor = '#3E2723';
				addBlockAt(-1.2*s, crownY - 0.2*s, 0,     branchColor, 'cylinder', { x: 0.15*s, y: 1.0*s, z: 0.15*s });
				addBlockAt( 1.2*s, crownY - 0.2*s, 0,     branchColor, 'cylinder', { x: 0.15*s, y: 1.0*s, z: 0.15*s });
				addBlockAt( 0,     crownY - 0.2*s, 1.2*s, branchColor, 'cylinder', { x: 0.15*s, y: 1.0*s, z: 0.15*s });
			}
		}
	},

	macieira_mini: {
		icon: '🍎',
		name: 'Macieira Minimalista',
		params: [
			{ name: 'scale',   label: 'Escala Geral',  default: 1.0, min: 0.5, max: 3.0 },
			{ name: 'fruits',  label: 'Qtd. Frutos',   default: 12,  min: 0,   max: 25  },
			{ name: 'fruitColor', label: 'Fruto (0-3)',default: 0,   min: 0,   max: 3   },
			{ name: 'season',  label: 'Estação (0-3)', default: 0,   min: 0,   max: 3   }
		],
		generate: (params) => {
			const s  = params.scale;
			const nF = params.fruits;
			const season = Math.round(params.season);
			const fruitType = Math.round(params.fruitColor);

			const trunkColor = '#5D4037';
			const leafPalettes = [
				['#2E7D32','#388E3C','#43A047','#66BB6A','#81C784'],
				['#E65100','#F57C00','#FF8F00','#FFA726','#FFB74D'],
				['#78909C','#90A4AE','#B0BEC5','#E0E0E0','#ECEFF1'],
				['#F8BBD0','#F48FB1','#F06292','#EC407A','#E91E63'],
			];
			const fruitPalettes = [
				['#FF1744','#FF5252','#FF6B6B','#FF8A80'],   // maçã vermelha
				['#FFD600','#FFEA00','#FFF176','#FFF9C4'],   // pêra/maçã amarela
				['#6A1B9A','#7B1FA2','#AB47BC','#CE93D8'],   // ameixa
				['#FF6F00','#FF8F00','#FFA000','#FFB300'],   // laranja/damasco
			];
			const leaves = leafPalettes[season];
			const fruits = fruitPalettes[fruitType];

			// Tronco (3 segmentos igual ao JSON original)
			addBlockAt(0, 0.5*s, 0, trunkColor, 'cylinder', 1.2*s);
			addBlockAt(0, 1.8*s, 0, trunkColor, 'cylinder', 1.1*s);
			addBlockAt(0, 3.0*s, 0, trunkColor, 'cylinder', 0.9*s);

			// Copa: posições fiéis ao JSON, escaladas
			const crownPositions = [
				[-0.5, 3.8, 0,    1.5, 0],
				[ 0.5, 3.8, 0,    1.5, 1],
				[ 0,   4.5,-0.5,  1.3, 2],
				[ 0,   4.5, 0.5,  1.3, 3],
				[ 0,   5.2, 0,    1.8, 4],
			];
			for (const [x, y, z, sz, ci] of crownPositions) {
				addBlockAt(x*s, y*s, z*s, leaves[ci % leaves.length], 'sphere', sz*s);
			}

			// Frutos distribuídos na copa via espiral áurea 3D
			if (nF > 0) {
				const crownCY = 4.5 * s;
				const crownR  = 1.5 * s;
				for (let i = 0; i < nF; i++) {
					const phi   = Math.acos(1 - 2*(i+0.5)/nF);
					const theta = Math.PI * (1 + Math.sqrt(5)) * i;
					const fx    = crownR * 0.9 * Math.sin(phi) * Math.cos(theta);
					const fy    = crownCY + crownR * 0.9 * Math.cos(phi);
					const fz    = crownR * 0.9 * Math.sin(phi) * Math.sin(theta);
					const fsize = (0.22 + Math.random() * 0.1) * s;
					addBlockAt(fx, fy, fz, fruits[i % fruits.length], 'sphere', fsize);
				}
			}
		}
	},

	bonsai: {
		icon: '🎋',
		name: 'Bonsai',
		params: [
			{ name: 'scale',  label: 'Escala Geral', default: 1.0, min: 0.5, max: 2.5 },
			{ name: 'style',  label: 'Estilo (0-2)', default: 0,   min: 0,   max: 2   },
			{ name: 'season', label: 'Estação (0-3)',default: 0,   min: 0,   max: 3   }
		],
		generate: (params) => {
			const s      = params.scale;
			const style  = Math.round(params.style);
			const season = Math.round(params.season);

			const trunkColor = '#4E342E';
			const leafPalettes = [
				['#1B5E20','#2E7D32','#388E3C','#43A047'],
				['#E65100','#BF360C','#FF6D00','#FF8F00'],
				['#B0BEC5','#90A4AE','#78909C','#607D8B'],
				['#880E4F','#AD1457','#C2185B','#E91E63'],
			];
			const leaves = leafPalettes[season];

			if (style === 0) {
				// Estilo formal: tronco reto, copa assimétrica
				addBlockAt(0,    0.4*s, 0, trunkColor, 'cylinder', { x:0.4*s, y:0.8*s, z:0.4*s });
				addBlockAt(0,    1.2*s, 0, trunkColor, 'cylinder', { x:0.3*s, y:0.8*s, z:0.3*s });
				addBlockAt(0,    2.0*s, 0, trunkColor, 'cylinder', { x:0.2*s, y:0.6*s, z:0.2*s });
				// Copa: 3 nuvens assimétricas
				addBlockAt(-0.6*s, 2.4*s,  0.2*s, leaves[0], 'sphere', 0.8*s);
				addBlockAt( 0.3*s, 2.8*s, -0.1*s, leaves[1], 'sphere', 0.65*s);
				addBlockAt( 0.1*s, 3.3*s,  0.3*s, leaves[2], 'sphere', 0.5*s);
				// Galho exposto
				addBlockAt(-0.9*s, 1.8*s, 0, trunkColor, 'cylinder', { x:0.6*s, y:0.15*s, z:0.15*s });

			} else if (style === 1) {
				// Estilo inclinado: tronco diagonal
				for (let i = 0; i < 4; i++) {
					const t = i / 3;
					addBlockAt(
						-0.4*t*s, (0.5 + i*0.9)*s, 0,
						trunkColor, 'cylinder',
						{ x:0.25*s, y:1.0*s, z:0.25*s }
					);
				}
				addBlockAt(-0.6*s, 4.0*s,  0.3*s, leaves[0], 'sphere', 0.9*s);
				addBlockAt(-0.2*s, 4.5*s, -0.2*s, leaves[1], 'sphere', 0.7*s);
				addBlockAt(-0.9*s, 3.6*s, -0.4*s, leaves[2], 'sphere', 0.55*s);

			} else {
				// Estilo cascata: copa abaixo do tronco
				addBlockAt(0, 0.5*s, 0, trunkColor, 'cylinder', { x:0.5*s, y:1.0*s, z:0.5*s });
				addBlockAt(0, 1.5*s, 0, trunkColor, 'cylinder', { x:0.35*s,y:0.8*s, z:0.35*s });
				// Galho que cai
				for (let i = 0; i < 4; i++) {
					addBlockAt(0.6*s, (1.8 - i*0.5)*s, i*0.2*s, trunkColor, 'cylinder',
						{ x:0.15*s, y:0.7*s, z:0.15*s });
				}
				addBlockAt( 1.0*s, 1.8*s, 0,     leaves[0], 'sphere', 0.7*s);
				addBlockAt( 1.2*s, 1.0*s, 0.3*s, leaves[1], 'sphere', 0.6*s);
				addBlockAt( 1.1*s, 0.3*s, 0.5*s, leaves[2], 'sphere', 0.5*s);
			}

			// Vaso
			addBlockAt(0, -0.3*s, 0, '#8D6E63', 'cylinder', { x:0.7*s, y:0.4*s, z:0.7*s });
			addBlockAt(0, -0.6*s, 0, '#795548', 'cylinder', { x:0.9*s, y:0.2*s, z:0.9*s });
		}
	},

	cerejeira: {
		icon: '🌸',
		name: 'Cerejeira',
		params: [
			{ name: 'scale',    label: 'Escala Geral',  default: 1.0, min: 0.5, max: 3.0 },
			{ name: 'trunkSegs',label: 'Segm. Tronco',  default: 3,   min: 2,   max: 5   },
			{ name: 'crownN',   label: 'Esferas Copa',  default: 6,   min: 3,   max: 10  },
			{ name: 'bloom',    label: 'Floração (0-1)',default: 0.8, min: 0.0, max: 1.0 }
		],
		generate: (params) => {
			const s    = params.scale;
			const segs = params.trunkSegs;
			const n    = params.crownN;
			const bloom = params.bloom;

			const trunkColor = '#6D4C41';
			const leafColor  = '#C8E6C9';
			const bloomColors = ['#FCE4EC','#F8BBD0','#F48FB1','#F06292','#FFFFFF'];

			// Tronco
			let y = 0.5*s;
			for (let i = 0; i < segs; i++) {
				const sc = (1.2 - i * 0.15) * s;
				addBlockAt(0, y, 0, trunkColor, 'cylinder', sc);
				y += 1.3*s;
			}

			// Copa: esferas em posições espirais ao redor do topo
			const crownY = y;
			for (let i = 0; i < n; i++) {
				const angle = (i / n) * Math.PI * 2 + 0.3;
				const r     = (0.4 + (i % 3) * 0.25) * s;
				const oy    = (i % 3 === 0 ? 0.8 : i % 3 === 1 ? 0.3 : 1.2) * s;
				const sz    = (1.2 + Math.sin(i) * 0.3) * s;
				const px    = Math.cos(angle) * r;
				const pz    = Math.sin(angle) * r;

				// Folhagem base
				addBlockAt(px, crownY + oy, pz, leafColor, 'sphere', sz);

				// Flores na superfície (esferas menores)
				const flowerCount = Math.round(bloom * 4);
				for (let f = 0; f < flowerCount; f++) {
					const fa = angle + f * 0.8;
					const fr = sz * 0.85;
					addBlockAt(
						px + Math.cos(fa) * fr,
						crownY + oy + Math.sin(fa * 0.7) * fr * 0.5,
						pz + Math.sin(fa) * fr,
						bloomColors[f % bloomColors.length],
						'sphere',
						0.2 * s
					);
				}
			}

			// Pétalas caindo (ao redor da base)
			const petalCount = Math.round(bloom * 8);
			for (let i = 0; i < petalCount; i++) {
				const angle = (i / petalCount) * Math.PI * 2;
				const r     = (1.0 + Math.random()) * s;
				const px    = Math.cos(angle) * r;
				const pz    = Math.sin(angle) * r;
				const py    = Math.random() * crownY * 0.4;
				addBlockAt(px, py, pz, bloomColors[i % bloomColors.length], 'sphere', 0.15*s);
			}
		}
	},

});
