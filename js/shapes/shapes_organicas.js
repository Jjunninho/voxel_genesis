// js/shapes_organicas.js
// Orgânicas
// Shapes: mushroom_2, organicArch

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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

    rock_2: {
        icon: '🪨',
        name: 'Pedreira',
        params: [
            { name: 'count',        label: 'Qtd. Pedras',      default: 6,    min: 2,    max: 15   },
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
	
	coral_colony: {
		icon: '🪸',
		name: 'Coral / Colônia',
		params: [
			{ name: 'count',  label: 'Qtd. Corais', default: 7,  min: 3, max: 15 },
			{ name: 'spread', label: 'Espalhamento', default: 12, min: 5, max: 25 },
			{ name: 'height', label: 'Altura Média', default: 7,  min: 3, max: 14 }
		],
		generate: (params) => {
			const count  = params.count;
			const spread = params.spread;
			const height = params.height;

			const palettes = [
				['#FF6B6B', '#FF8E53', '#FFCDD2'],  // laranja-coral
				['#FF4081', '#F06292', '#FCE4EC'],  // rosa
				['#AB47BC', '#CE93D8', '#F3E5F5'],  // roxo
				['#26C6DA', '#80DEEA', '#E0F7FA'],  // ciano (coral azul)
				['#FFCA28', '#FFE082', '#FFF8E1'],  // amarelo
			];

			for (let n = 0; n < count; n++) {
				const ox      = Math.round((Math.random() - 0.5) * spread);
				const oz      = Math.round((Math.random() - 0.5) * spread);
				const palette = palettes[Math.floor(Math.random() * palettes.length)];
				const h       = Math.floor(height * (0.4 + Math.random() * 0.8));
				const type    = Math.floor(Math.random() * 3); // 0=ramificado, 1=tubular, 2=leque

				if (type === 0) {
					// Ramificado — galhos que se abrem
					const branches = 2 + Math.floor(Math.random() * 4);
					for (let y = 0; y < h; y++) {
						addBlockAt(ox, y + 0.5, oz, palette[0], 'sphere');
					}
					for (let b = 0; b < branches; b++) {
						const angle = (b / branches) * Math.PI * 2;
						const bh    = Math.floor(h * (0.3 + Math.random() * 0.5));
						for (let y = 0; y < bh; y++) {
							const t = y / bh;
							const x = ox + Math.round(Math.cos(angle) * t * 2);
							const z = oz + Math.round(Math.sin(angle) * t * 2);
							addBlockAt(x, Math.floor(h * 0.5) + y + 0.5, z, palette[1], 'sphere');
						}
					}

				} else if (type === 1) {
					// Tubular — coluna fina com boca no topo
					for (let y = 0; y < h; y++) {
						addBlockAt(ox, y + 0.5, oz, palette[0], 'sphere');
					}
					// Boca aberta (anel no topo)
					for (let i = 0; i < 6; i++) {
						const a = (i / 6) * Math.PI * 2;
						addBlockAt(
							ox + Math.round(Math.cos(a)),
							h + 0.5,
							oz + Math.round(Math.sin(a)),
							palette[2], 'sphere'
						);
					}

				} else {
					// Leque — plano vertical em arco
					const fanW = 2 + Math.floor(Math.random() * 3);
					for (let y = 0; y < h; y++) {
						const halfW = Math.floor(fanW * (y / h));
						for (let x = -halfW; x <= halfW; x++) {
							if (Math.abs(x) === halfW || y === h - 1) {
								addBlockAt(ox + x, y + 0.5, oz, palette[0], 'sphere');
							}
						}
					}
					// Preenchimento interno com cor secundária
					for (let y = 1; y < h - 1; y++) {
						const halfW = Math.floor(fanW * (y / h)) - 1;
						for (let x = -halfW; x <= halfW; x++) {
							addBlockAt(ox + x, y + 0.5, oz, palette[1], 'sphere');
						}
					}
				}
			}
		}
	}

});
