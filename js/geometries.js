// js/geometries.js
// Funções para criar diferentes geometrias primitivas

function createGeometry(type) {
    switch(type) {
        case 'cube':
            return new THREE.BoxGeometry(1, 1, 1);
        
        case 'sphere':
            return new THREE.SphereGeometry(0.5, 16, 16);
        
        case 'cylinder':
            return new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
        
        case 'cone':
            return new THREE.ConeGeometry(0.5, 1, 16);
        
        case 'pyramid':
            // Pirâmide de base quadrada
            return new THREE.ConeGeometry(0.5, 1, 4);
        
        case 'prism':
			return new THREE.CylinderGeometry(0.5, 0.5, 1, 3);
        
        case 'torus':
            return new THREE.TorusGeometry(0.4, 0.15, 12, 24);
        
		case 'capsule':
            // CORREÇÃO: Uso de LatheGeometry para compatibilidade com Three.js r128+
            // THREE.Geometry foi removido, então não podemos mais usar merge() antigo.
            // Desenhamos o perfil 2D e giramos (Lathe).
            
            const points = [];
            const radius = 0.3;
            const height = 0.6; // Altura da parte reta (cilindro)
            const halfHeight = height / 2;
            
            // 1. Topo (meia esfera) - Desenhando de cima para baixo
            // Centro do arco superior é (0, halfHeight)
            for (let i = 0; i <= 8; i++) {
                // Ângulo de 0 (topo) a PI/2 (lateral)
                const angle = (i / 8) * (Math.PI / 2);
                points.push(new THREE.Vector2(
                    Math.sin(angle) * radius,          // X
                    halfHeight + Math.cos(angle) * radius // Y
                ));
            }

            // 2. Baixo (meia esfera)
            // Centro do arco inferior é (0, -halfHeight)
            for (let i = 0; i <= 8; i++) {
                // Ângulo de PI/2 (lateral) a PI (fundo)
                const angle = (Math.PI / 2) + (i / 8) * (Math.PI / 2);
                points.push(new THREE.Vector2(
                    Math.sin(angle) * radius,           // X
                    -halfHeight + Math.cos(angle) * radius // Y
                ));
            }

            // Cria a geometria girando esse perfil em 360 graus (32 segmentos para ficar liso)
            return new THREE.LatheGeometry(points, 32);
        
        case 'tetrahedron':
            return new THREE.TetrahedronGeometry(0.6);
        
        case 'octahedron':
            return new THREE.OctahedronGeometry(0.6);
        
        case 'dodecahedron':
            return new THREE.DodecahedronGeometry(0.5);
        
        case 'icosahedron':
            return new THREE.IcosahedronGeometry(0.5);
        
        case 'ring':
            // Anel fino (toro com tubo pequeno)
            return new THREE.TorusGeometry(0.4, 0.08, 8, 24);
        
        case 'disc':
            // Disco (cilindro achatado)
            return new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
        
        case 'hemisphere':
            // Hemisfério (metade de uma esfera)
            return new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        
        case 'box':
            // Caixa retangular (diferente do cubo)
            return new THREE.BoxGeometry(1.2, 0.6, 0.8);
        
        default:
            return new THREE.BoxGeometry(1, 1, 1);
    }
}

// Função auxiliar para ajustar a posição Y baseada no tipo de geometria
function getYOffset(type) {
    switch(type) {
        case 'cone':
        case 'pyramid':
            return 0.5; // Cone/pirâmide ficam com a base no chão
        case 'disc':
            return 0.05; // Disco fino
        case 'hemisphere':
            return 0; // Hemisfério com base plana no chão
        case 'prism':
            return 0.5; // Prisma deitado
        default:
            return 0.5; // Padrão: centro em 0.5
    }
}