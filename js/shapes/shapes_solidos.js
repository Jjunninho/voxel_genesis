// js/shapes_solidos.js
// Sólidos
// Shapes: sphere, cylinder, cone, torus, tetrahedron_v2, etc.

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(window.ShapeRegistry, {

    sphere: {
        icon: '⚪',
        name: 'Esfera',
        params: [
            { name: 'radius', label: 'Raio', default: 4, min: 2, max: 10 }
        ],
        generate: (params) => {
            const r = params.radius;
            const rSquared = r * r;
            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    for (let z = -r; z <= r; z++) {
                        const distSquared = x*x + y*y + z*z;
                        if (distSquared <= rSquared) {
                            addBlockAt(x, y + r + 0.5, z, currentColor, 'sphere');
                        }
                    }
                }
            }
        }
    },

    cylinder: {
        icon: '🛢️',
        name: 'Cilindro',
        params: [
            { name: 'radius', label: 'Raio', default: 3, min: 1, max: 8 },
            { name: 'height', label: 'Altura', default: 6, min: 2, max: 15 }
        ],
        generate: (params) => {
            const r = params.radius;
            const h = params.height;
            const rSquared = r * r;
            for (let x = -r; x <= r; x++) {
                for (let z = -r; z <= r; z++) {
                    const distSquared = x*x + z*z;
                    if (distSquared <= rSquared) {
                        for (let y = 0; y < h; y++) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cylinder');
                        }
                    }
                }
            }
        }
    },

    cone: {
        icon: '🔺',
        name: 'Cone',
        params: [
            { name: 'radius', label: 'Raio Base', default: 4, min: 2, max: 10 },
            { name: 'height', label: 'Altura', default: 8, min: 3, max: 15 }
        ],
        generate: (params) => {
            const baseR = params.radius;
            const h = params.height;
            for (let y = 0; y < h; y++) {
                const ratio = 1 - (y / h);
                const currentR = baseR * ratio;
                const rSquared = currentR * currentR;
                for (let x = -baseR; x <= baseR; x++) {
                    for (let z = -baseR; z <= baseR; z++) {
                        const distSquared = x*x + z*z;
                        if (distSquared <= rSquared) {
                            addBlockAt(x, y + 0.5, z, currentColor, 'cone');
                        }
                    }
                }
            }
        }
    },

    torus: {
        icon: '🍩',
        name: 'Toro',
        params: [
            { name: 'majorRadius', label: 'Raio Maior', default: 5, min: 3, max: 10 },
            { name: 'minorRadius', label: 'Raio Menor', default: 2, min: 1, max: 4 }
        ],
        generate: (params) => {
            const R = params.majorRadius;
            const r = params.minorRadius;
            const maxDist = R + r;
            for (let x = -maxDist; x <= maxDist; x++) {
                for (let y = -r; y <= r; y++) {
                    for (let z = -maxDist; z <= maxDist; z++) {
                        const distFromCenter = Math.sqrt(x*x + z*z);
                        const distFromTube = Math.sqrt((distFromCenter - R)**2 + y*y);
                        if (distFromTube <= r) {
                            addBlockAt(x, y + r + 0.5, z, currentColor, 'torus');
                        }
                    }
                }
            }
        }
    },
    
    // ── Sólidos Precisos (v2) ────────────────────────────────────────────────
    
    tetrahedron_v2: {
        icon: '▲',
        name: 'Tetraedro (Preciso)',
        params: [
            { name: 'size',  label: 'Tamanho', default: 6, min: 2, max: 15 },
            { name: 'solid', label: 'Sólido',  default: 1, min: 0, max: 1  }
        ],
        generate(params) {
            const s    = params.size ?? 6;
            const fill = (params.solid ?? 1) >= 0.5;
            const planes = [
                { nx:  1, ny:  1, nz:  1, d: s },
                { nx:  1, ny: -1, nz: -1, d: s },
                { nx: -1, ny:  1, nz: -1, d: s },
                { nx: -1, ny: -1, nz:  1, d: s },
            ];
            for (let x = -s; x <= s; x++) {
                for (let y = -s; y <= s; y++) {
                    for (let z = -s; z <= s; z++) {
                        const inside = planes.every(p => p.nx*x + p.ny*y + p.nz*z <= p.d);
                        if (!inside) continue;
                        if (!fill) {
                            const onSurface = planes.some(p => Math.abs(p.nx*x + p.ny*y + p.nz*z - p.d) <= 1.5);
                            if (!onSurface) continue;
                        }
                        addBlockAt(x, y + s + 0.5, z, currentColor, 'tetrahedron');
                    }
                }
            }
        }
    },

    hexahedron_v2: {
        icon: '🧊',
        name: 'Hexaedro (Preciso)',
        params: [
            { name: 'size',  label: 'Tamanho', default: 4, min: 1, max: 12 },
            { name: 'solid', label: 'Sólido',  default: 1, min: 0, max: 1  }
        ],
        generate(params) {
            const s    = params.size ?? 4;
            const fill = (params.solid ?? 1) >= 0.5;
            for (let x = -s; x <= s; x++) {
                for (let y = -s; y <= s; y++) {
                    for (let z = -s; z <= s; z++) {
                        if (!fill) {
                            const onSurface = Math.abs(x)===s || Math.abs(y)===s || Math.abs(z)===s;
                            if (!onSurface) continue;
                        }
                        addBlockAt(x, y + s + 0.5, z, currentColor, 'cube');
                    }
                }
            }
        }
    },

    octahedron_v2: {
        icon: '◆',
        name: 'Octaedro (Preciso)',
        params: [
            { name: 'size',  label: 'Tamanho', default: 6, min: 2, max: 14 },
            { name: 'solid', label: 'Sólido',  default: 1, min: 0, max: 1  }
        ],
        generate(params) {
            const s    = params.size ?? 6;
            const fill = (params.solid ?? 1) >= 0.5;
            for (let x = -s; x <= s; x++) {
                for (let y = -s; y <= s; y++) {
                    for (let z = -s; z <= s; z++) {
                        const dist = Math.abs(x) + Math.abs(y) + Math.abs(z);
                        if (dist > s) continue;
                        if (!fill && dist < s - 1) continue;
                        addBlockAt(x, y + s + 0.5, z, currentColor, 'octahedron');
                    }
                }
            }
        }
    },

    dodecahedron_v2: {
        icon: '⬟',
        name: 'Dodecaedro (Preciso)',
        params: [
            { name: 'size',  label: 'Tamanho', default: 5, min: 2, max: 12 },
            { name: 'solid', label: 'Sólido',  default: 1, min: 0, max: 1  }
        ],
        generate(params) {
            const s    = params.size ?? 5;
            const fill = (params.solid ?? 1) >= 0.5;
            const phi  = (1 + Math.sqrt(5)) / 2;
            const normals = [
                [0, 1/phi, phi], [0, -1/phi, phi],
                [1/phi, phi, 0], [-1/phi, phi, 0],
                [phi, 0, 1/phi], [phi, 0, -1/phi],
            ];
            const planes = [];
            normals.forEach(([nx, ny, nz]) => {
                const len = Math.hypot(nx, ny, nz);
                const n = [nx/len, ny/len, nz/len];
                planes.push({ n, d:  s });
                planes.push({ n: [-n[0],-n[1],-n[2]], d: s });
            });
            for (let x = -s - 1; x <= s + 1; x++) {
                for (let y = -s - 1; y <= s + 1; y++) {
                    for (let z = -s - 1; z <= s + 1; z++) {
                        const inside = planes.every(p => p.n[0]*x + p.n[1]*y + p.n[2]*z <= p.d);
                        if (!inside) continue;
                        if (!fill) {
                            const onSurface = planes.some(p => Math.abs(p.n[0]*x + p.n[1]*y + p.n[2]*z - p.d) <= 1.2);
                            if (!onSurface) continue;
                        }
                        addBlockAt(x, y + s + 1.5, z, currentColor, 'dodecahedron');
                    }
                }
            }
        }
    },

    icosahedron_v2: {
        icon: '◈',
        name: 'Icosaedro (Preciso)',
        params: [
            { name: 'size',  label: 'Tamanho', default: 5, min: 2, max: 12 },
            { name: 'solid', label: 'Sólido',  default: 1, min: 0, max: 1  }
        ],
        generate(params) {
            const s    = params.size ?? 5;
            const fill = (params.solid ?? 1) >= 0.5;
            const phi  = (1 + Math.sqrt(5)) / 2;
            const len  = Math.hypot(0, 1, phi);
            const rawNormals = [];
            for (const [a, b, c] of [[0,1,phi],[0,1,-phi],[0,-1,phi],[0,-1,-phi]]) {
                rawNormals.push([a,b,c], [b,c,a], [c,a,b]);
            }
            const extra = [];
            for (const sx of [1,-1]) for (const sy of [1,-1]) for (const sz of [1,-1])
                extra.push([sx/len * phi, sy/len * phi, sz/len * phi]);
            const planes = rawNormals.map(([nx,ny,nz]) => {
                const l = Math.hypot(nx,ny,nz);
                return { n: [nx/l, ny/l, nz/l], d: s };
            });

            for (let x = -s - 1; x <= s + 1; x++) {
                for (let y = -s - 1; y <= s + 1; y++) {
                    for (let z = -s - 1; z <= s + 1; z++) {
                        const inside = planes.every(p => p.n[0]*x + p.n[1]*y + p.n[2]*z <= p.d);
                        if (!inside) continue;
                        if (!fill) {
                            const onSurface = planes.some(p => Math.abs(p.n[0]*x + p.n[1]*y + p.n[2]*z - p.d) <= 1.2);
                            if (!onSurface) continue;
                        }
                        addBlockAt(x, y + s + 1.5, z, currentColor, 'icosahedron');
                    }
                }
            }
        }
    }

});