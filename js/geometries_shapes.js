// js/geometries_shapes.js
// Geometrias procedurais complexas exclusivas do sistema de shapes.
// NÃO são primitivas — cada uma é gerada algoritmicamente.
//
// Arquitetura:
//   createGeometry(type)      → geometrias primitivas (cube, sphere, cone...)
//   ShapeGeometries[type]()   → geometrias complexas (rock, crystal_shard...)
//
// O addBlockAt consulta ShapeGeometries ANTES de createGeometry.
// Para adicionar uma nova geometria especial: basta adicionar uma entrada aqui.

window.ShapeGeometries = window.ShapeGeometries || {};

Object.assign(window.ShapeGeometries, {

    // ─────────────────────────────────────────────────────────────────
    // ROCK — tetraedro orgânico (face da malha + ponta para dentro)
    // Geometria gerada a partir de um icosaedro deformado por ruído contínuo.
    // Cada face vira um tetraedro: base = face original, ponta = interior.
    // Parâmetros injetados via window.__shapeGeoParams (definido pelo shapes_natureza.js)
    // ─────────────────────────────────────────────────────────────────
    rock: function(params) {
        params = params || window.__shapeGeoParams || {};

        // FAST PATH: face real injetada pelo shapes_natureza.js
        // Monta só o tetraedro desta face — sem recalcular a malha inteira
        if (params._face) {
            const { ax,ay,az, bx,by,bz, cx2,cy2,cz2, cx,cy,cz } = params._face;
            const depth  = params.depth  || 1.0;
            const smooth = params.smooth || 0.3;

            const fcx=(ax+bx+cx2)/3, fcy=(ay+by+cy2)/3, fcz=(az+bz+cz2)/3;
            let nx=(by-ay)*(cz2-az)-(bz-az)*(cy2-ay);
            let ny=(bz-az)*(cx2-ax)-(bx-ax)*(cz2-az);
            let nz=(bx-ax)*(cy2-ay)-(by-ay)*(cx2-ax);
            const nl=Math.sqrt(nx*nx+ny*ny+nz*nz);
            if (nl < 0.00001) return new THREE.BoxGeometry(0.1,0.1,0.1);
            nx/=nl; ny/=nl; nz/=nl;
            if (nx*(fcx-cx)+ny*(fcy-cy)+nz*(fcz-cz)<0){nx=-nx;ny=-ny;nz=-nz;}

            const tipRawX=fcx-nx*depth, tipRawY=fcy-ny*depth, tipRawZ=fcz-nz*depth;
            const tipX=tipRawX+(cx-tipRawX)*smooth*0.6;
            const tipY=tipRawY+(cy-tipRawY)*smooth*0.6;
            const tipZ=tipRawZ+(cz-tipRawZ)*smooth*0.6;

            // Vértices em coordenadas relativas ao centro da face
            const ox=fcx, oy=fcy, oz=fcz;
            const verts = new Float32Array([
                ax-ox,ay-oy,az-oz,   bx-ox,by-oy,bz-oz,   cx2-ox,cy2-oy,cz2-oz,
                ax-ox,ay-oy,az-oz,   tipX-ox,tipY-oy,tipZ-oz,  bx-ox,by-oy,bz-oz,
                bx-ox,by-oy,bz-oz,   tipX-ox,tipY-oy,tipZ-oz,  cx2-ox,cy2-oy,cz2-oz,
                cx2-ox,cy2-oy,cz2-oz, tipX-ox,tipY-oy,tipZ-oz, ax-ox,ay-oy,az-oz,
            ]);
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
            geo.computeVertexNormals();
            return geo;
        }

        // SLOW PATH: gerar malha completa (uso standalone)
        const size        = params.size        || 0.5;
        const irregularity= params.irregularity|| 0.12;
        const flatten     = params.flatten     || 0.75;
        const complexity  = params.complexity  || 3;
        const depth       = params.depth       || 0.3;
        const smooth      = params.smooth      || 0.3;
        const noiseFreq   = params.noiseFreq   || 2.0;

        // Fases aleatórias (seed por instância via params ou Math.random)
        const seed   = params._seed || Math.random();
        const phaseX = seed * Math.PI * 2;
        const phaseY = (seed * 1.618) * Math.PI * 2;
        const phaseZ = (seed * 2.718) * Math.PI * 2;
        const scaleX = 0.85 + seed * 0.3;
        const scaleY = flatten * (0.75 + seed * 0.25);
        const scaleZ = 0.85 + ((seed * 7) % 1) * 0.3;

        // 1. Geometria base
        const baseFaces = [4, 8, 12, 20][Math.round(complexity)];
        let geometry;
        if      (baseFaces === 4)  geometry = new THREE.TetrahedronGeometry(size, 0);
        else if (baseFaces === 8)  geometry = new THREE.OctahedronGeometry(size, 0);
        else if (baseFaces === 12) geometry = new THREE.DodecahedronGeometry(size, 0);
        else                       geometry = new THREE.IcosahedronGeometry(size, 0);

        const positions = geometry.attributes.position;
        const vertex    = new THREE.Vector3();
        const amplitude = irregularity * size * 0.5;
        const f         = noiseFreq / size;

        // 2. Deformação por ruído contínuo (seno/cosseno — não rasga a malha)
        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);
            const wX = Math.sin(vertex.y * f + phaseX) * Math.cos(vertex.z * f + phaseZ);
            const wY = Math.sin(vertex.z * f + phaseY) * Math.cos(vertex.x * f + phaseX);
            const wZ = Math.sin(vertex.x * f + phaseZ) * Math.cos(vertex.y * f + phaseY);
            vertex.x = vertex.x * scaleX + wX * amplitude;
            vertex.y = vertex.y * scaleY + wY * amplitude;
            vertex.z = vertex.z * scaleZ + wZ * amplitude;
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        positions.needsUpdate = true;

        // 3. Montar tetraedros por face → BufferGeometry final
        const pos      = geometry.attributes.position;
        const idx      = geometry.index;
        const triCount = idx ? idx.count / 3 : pos.count / 3;

        // Centroide da pedra
        let cx = 0, cy = 0, cz = 0;
        for (let i = 0; i < pos.count; i++) {
            cx += pos.getX(i); cy += pos.getY(i); cz += pos.getZ(i);
        }
        cx /= pos.count; cy /= pos.count; cz /= pos.count;

        const allPositions = [];

        for (let t = 0; t < triCount; t++) {
            const ia = idx ? idx.getX(t*3)   : t*3;
            const ib = idx ? idx.getX(t*3+1) : t*3+1;
            const ic = idx ? idx.getX(t*3+2) : t*3+2;

            const ax = pos.getX(ia), ay = pos.getY(ia), az = pos.getZ(ia);
            const bx = pos.getX(ib), by = pos.getY(ib), bz = pos.getZ(ib);
            const cx2= pos.getX(ic), cy2= pos.getY(ic), cz2= pos.getZ(ic);

            const fcx = (ax+bx+cx2)/3, fcy = (ay+by+cy2)/3, fcz = (az+bz+cz2)/3;

            // Normal da face
            let nx = (by-ay)*(cz2-az) - (bz-az)*(cy2-ay);
            let ny = (bz-az)*(cx2-ax) - (bx-ax)*(cz2-az);
            let nz = (bx-ax)*(cy2-ay) - (by-ay)*(cx2-ax);
            const nl = Math.sqrt(nx*nx + ny*ny + nz*nz);
            if (nl < 0.00001) continue;
            nx/=nl; ny/=nl; nz/=nl;
            if (nx*(fcx-cx) + ny*(fcy-cy) + nz*(fcz-cz) < 0) { nx=-nx; ny=-ny; nz=-nz; }

            // Ponta: recuada para dentro + suavização
            const tipRawX = fcx - nx * depth;
            const tipRawY = fcy - ny * depth;
            const tipRawZ = fcz - nz * depth;
            const tipX = tipRawX + (cx - tipRawX) * smooth * 0.6;
            const tipY = tipRawY + (cy - tipRawY) * smooth * 0.6;
            const tipZ = tipRawZ + (cz - tipRawZ) * smooth * 0.6;

            // 4 triângulos do tetraedro
            allPositions.push(
                ax,ay,az,  bx,by,bz,  cx2,cy2,cz2,   // base
                ax,ay,az,  tipX,tipY,tipZ,  bx,by,bz, // lateral AB
                bx,by,bz,  tipX,tipY,tipZ,  cx2,cy2,cz2, // lateral BC
                cx2,cy2,cz2, tipX,tipY,tipZ, ax,ay,az  // lateral CA
            );
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allPositions), 3));
        geo.computeVertexNormals();
        return geo;
    },
	
	// ─────────────────────────────────────────────────────────────────
	// STAR_SHAPE — estrela extrudada com pontas cônicas
	// Parâmetros injetados via window.__shapeGeoParams
	// ─────────────────────────────────────────────────────────────────
	star_shape: function(params) {
		params = params || window.__shapeGeoParams || {};
		const points      = params.points      || 5;
		const outerR      = params.outerR      || 3;
		const innerR      = outerR * 0.4;
		const depth       = params.depth       || 0.8;

		const shape = new THREE.Shape();
		for (let i = 0; i <= points * 2; i++) {
			const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
			const r = i % 2 === 0 ? outerR : innerR;
			const x = r * Math.cos(angle);
			const y = r * Math.sin(angle);
			if (i === 0) shape.moveTo(x, y);
			else         shape.lineTo(x, y);
		}

		const geo = new THREE.ExtrudeGeometry(shape, {
			depth: depth,
			bevelEnabled: true,
			bevelThickness: 0.1,
			bevelSize: 0.1,
			bevelSegments: 2
		});

		// Deitar no plano XZ (igual à versão anterior)
		geo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
		geo.computeVertexNormals();
		return geo;
	},

    // ─────────────────────────────────────────────────────────────────
    // CRYSTAL_SHARD — fragmento de cristal afiado (futuro uso)
    // Tetraedro esticado verticalmente, para cristais e formações rochosas
    // ─────────────────────────────────────────────────────────────────
    crystal_shard: function(params) {
        params = params || {};
        const h = params.height || 1.2;
        const r = params.radius || 0.25;

        const verts = new Float32Array([
             0,    h,    0,   // topo
             r,    0,    0,   // base frente-direita
            -r,    0,    0,   // base frente-esquerda
             0,    0,    r,   // base trás-direita
             0,    0,   -r,   // base trás-esquerda
        ]);
        const idx = new Uint16Array([
            0,1,2,  0,2,3,  0,3,4,  0,4,1,  // laterais
            1,3,2,  2,3,4,  2,4,1,           // base
        ]);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        geo.setIndex(new THREE.BufferAttribute(idx, 1));
        geo.computeVertexNormals();
        return geo;
    },

});

console.log(`[geometries_shapes] ${Object.keys(window.ShapeGeometries).length} geometrias especiais carregadas.`);
