// js/shapes_basicas.js
// Básicas
// Shapes: cube, plane

window.ShapeRegistry = window.ShapeRegistry || {};
Object.assign(ShapeRegistry, {

    cube: {
        icon: '⬛',
        name: 'Cubo',
        params: [
            { name: 'size', label: 'Tamanho', default: 5, min: 1, max: 15 }
        ],
        generate: (params) => {
            const size = params.size;
            const half = Math.floor(size / 2);
            for (let x = -half; x <= half; x++) {
                for (let y = 0; y < size; y++) {
                    for (let z = -half; z <= half; z++) {
                        addBlockAt(x, y + 0.5, z, currentColor, 'cube');
                    }
                }
            }
        }
    },

    plane: {
        icon: '⬜',
        name: 'Plano',
        params: [
            { name: 'width', label: 'Largura', default: 8, min: 2, max: 20 },
            { name: 'depth', label: 'Profundidade', default: 8, min: 2, max: 20 }
        ],
        generate: (params) => {
            const hw = Math.floor(params.width / 2);
            const hd = Math.floor(params.depth / 2);
            for (let x = -hw; x <= hw; x++) {
                for (let z = -hd; z <= hd; z++) {
                    addBlockAt(x, 0.5, z, currentColor, 'cube');
                }
            }
        }
    }

});
