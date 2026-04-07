// js/scene.js - VERSÃO CORRIGIDA E LIMPA

function init() {
    const canvas = document.getElementById('canvas3d');
    const container = canvas.parentElement;

    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    
    // Ajuste da área de sombra
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    
    scene.add(directionalLight);

	// 5. Helpers (Grid & Axes)
	// 🔥 AGORA COM 1000 UNIDADES E 100 DIVISÕES (ESTILO VOXELIZER)
	gridHelper = new THREE.GridHelper(1000, 100, 0x444444, 0x222222);
	scene.add(gridHelper);

	axesHelper = new THREE.AxesHelper(10);
	scene.add(axesHelper);

	// 6. Chão (Shadow Catcher Invisível)
	// Aumentamos o plano de sombra para 1000x1000 para a sombra não "cortar" no meio do quintal
	const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
	const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 }); 
	const floor = new THREE.Mesh(planeGeometry, planeMaterial);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -0.02; // Levemente abaixo para evitar Z-fighting
	floor.receiveShadow = true;
	scene.add(floor);

    // 7. Raycaster & Mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 8. OrbitControls (Câmera)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };

    // ====================================================
    // 🚀 9. TRANSFORM CONTROLS (GIZMO)
    // ====================================================
    
    // Inicializa a variável global transformControl
    transformControl = new THREE.TransformControls(camera, renderer.domElement);
    
    // Resolve conflito com OrbitControls
    transformControl.addEventListener('dragging-changed', function (event) {
        controls.enabled = !event.value;
    });

    // Configurações
    transformControl.setTranslationSnap(0.5); 
    transformControl.setSpace('world');

	// Atualiza visual ao mover
    transformControl.addEventListener('change', function() {
        // Não precisamos atualizar outline manual, o Three.js cuida do mesh agrupado!
    });
    
    // Atualiza JSON ao soltar (MouseUp)
	transformControl.addEventListener('mouseUp', function() {
        // Função auxiliar para atualizar dados de um bloco baseado no seu mesh
        const syncBlockData = (mesh) => {
            const block = blocks.find(b => b.mesh === mesh);
            if (block) {
                // Sincroniza Posição
                block.position.x = mesh.position.x;
                block.position.y = mesh.position.y;
                block.position.z = mesh.position.z;
                
                // 🔥 Sincroniza Rotação
                block.rotation.x = mesh.rotation.x;
                block.rotation.y = mesh.rotation.y;
                block.rotation.z = mesh.rotation.z;

                // 🔥 Sincroniza Escala (O Pulo do Gato!)
                block.scale.x = mesh.scale.x;
                block.scale.y = mesh.scale.y;
                block.scale.z = mesh.scale.z;
            }
        };

        // CASO 1: Movendo Grupo
        if (selectionGroup) {
            selectionGroup.children.forEach(child => {
                // Atualiza a posição global real do filho antes de sincronizar
                // (O Three.js cuida disso visualmente, mas precisamos dos dados brutos)
                // OBS: Para grupos complexos, usar attach/detach é mais seguro, 
                // mas para escala simples isso funciona se o grupo estiver no 0,0,0 relativo.
                // Na nossa implementação atual de dissolve, os dados são atualizados lá.
                // Então aqui focamos no visual imediato.
                syncBlockData(child);
            });
            updateJSON();
            showStatus('📍 Grupo transformado', 'info');
        } 
        // CASO 2: Movendo Bloco Único
        else if (selectedBlock) {
            syncBlockData(selectedBlock.mesh);
            updateJSON(); 
            // Mostra status dependendo do modo
            const mode = transformControl.getMode();
            const msg = mode === 'translate' ? '📍 Posição' : (mode === 'rotate' ? '🔄 Rotação' : '📐 Escala');
            showStatus(`${msg} atualizada`, 'info');
        }
    });

    scene.add(transformControl);

    // 10. Event Listeners Globais
    // IMPORTANTE: Adicionados aqui no final do init principal
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyPress);
	
	// 11. 🔥 RECUPERA O AUTOSAVE (Agora é seguro, pois a cena existe!)
    if (typeof restoreSession === 'function') {
        setTimeout(restoreSession, 100); // Pequeno delay para garantir estabilidade
    }

    // Inicia Loop
    animate();
}


// Loop de Animação
function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

// Resize da Janela
function onWindowResize() {
    const container = document.getElementById('canvas3d').parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Reset Câmera
function resetCamera() {
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    if(typeof showStatus === 'function') showStatus('Câmera resetada', 'info');
}

// Helper para formatar posição (Debug)
function formatPos(pos) {
    return `X:${pos.x.toFixed(1)} Y:${pos.y.toFixed(1)} Z:${pos.z.toFixed(1)}`;
}