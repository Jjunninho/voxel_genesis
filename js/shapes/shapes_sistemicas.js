// js/shapes_sistemicas.js
// Sistêmicas
// Shapes: ruins, dungeon, platformSet

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

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
	},

	dungeon: {
		icon: '🗝️',
		name: 'Dungeon (Compacta)',
		params: [
			{ name: 'rooms', label: 'Salas', default: 6, min: 2, max: 9 },
			{ name: 'roomSize', label: 'Tamanho Sala', default: 5, min: 4, max: 8 }
		],
		generate: (p) => {
			const gridSize = Math.ceil(Math.sqrt(p.rooms));
			const spacing = p.roomSize + 1;
			const halfGrid = Math.floor(gridSize / 2);

			let roomIndex = 0;

			for (let gx = -halfGrid; gx <= halfGrid && roomIndex < p.rooms; gx++) {
				for (let gz = -halfGrid; gz <= halfGrid && roomIndex < p.rooms; gz++) {

					const centerX = gx * spacing;
					const centerZ = gz * spacing;
					const hs = Math.floor(p.roomSize / 2);

					// Piso da sala
					for (let x = -hs; x <= hs; x++) {
						for (let z = -hs; z <= hs; z++) {
							addBlockAt(
								centerX + x,
								0.5,
								centerZ + z,
								currentColor,
								'cube'
							);
						}
					}

					roomIndex++;
				}
			}
		}
	},

	platformSet: {
		icon: '🧱',
		name: 'Plataformas',
		params: [
			{ name: 'count', label: 'Quantidade', default: 8, min: 3, max: 20 },
			{ name: 'spread', label: 'Espalhamento', default: 12, min: 6, max: 25 }
		],
		generate: (p) => {
			for (let i = 0; i < p.count; i++) {
				const x = Math.floor(Math.random() * p.spread - p.spread / 2);
				const z = Math.floor(Math.random() * p.spread - p.spread / 2);
				const y = Math.floor(Math.random() * 5) + 1;
				addBlockAt(x, y + 0.5, z, currentColor, 'cube');
			}
		}
	},
	
	// Inicio das novas funções

});
