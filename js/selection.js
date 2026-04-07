// js/selection.js - VERSÃO MULTI-SELECTION (GROUP STRATEGY)

// Adiciona ou Remove um bloco da seleção (Lógica do Ctrl+Click)
function toggleSelection(block) {
    const index = selectedBlocks.indexOf(block);
    
    if (index === -1) {
        // Adiciona
        selectedBlocks.push(block);
        // Visual: Emissivo (Brilho)
        if (block.mesh.material.emissive) {
            block.mesh.material.emissive.setHex(0xaaaa00); 
        }
    } else {
        // Remove
        selectedBlocks.splice(index, 1);
        // Visual: Remove Brilho
        if (block.mesh.material.emissive) {
            block.mesh.material.emissive.setHex(0x000000);
        }
    }
    
    updateGizmoTarget();
}

// Limpa toda a seleção
function deselectAll() {
    // 1. PRIMEIRO: Dissolve o grupo se existir (devolve blocos pra cena)
    dissolveSelectionGroup();

    // 2. Limpa visual
    selectedBlocks.forEach(block => {
        if (block.mesh.material.emissive) {
            block.mesh.material.emissive.setHex(0x000000);
        }
    });
    
    selectedBlocks = [];
    selectedBlock = null; // Limpa referência única herdada

    // 3. Solta o Gizmo
    if (transformControl) {
        transformControl.detach();
    }
}

// Decide onde o Gizmo deve grudar (Bloco único ou Grupo)
function updateGizmoTarget() {
    // 1. Se não tem nada selecionado
    if (selectedBlocks.length === 0) {
        if (transformControl) transformControl.detach();
        return;
    }

    // 2. Se tem APENAS UM bloco
    if (selectedBlocks.length === 1) {
        dissolveSelectionGroup(); // Garante que não tem grupo sobrando
        selectedBlock = selectedBlocks[0]; // Mantém compatibilidade
        transformControl.attach(selectedBlock.mesh);
        showStatus('1 Bloco selecionado', 'info');
        return;
    }

    // 3. Se tem VÁRIOS blocos (Multi-Select)
    if (selectedBlocks.length > 1) {
        createSelectionGroup(); // Cria o "Grupo Fantasma"
        transformControl.attach(selectionGroup);
        showStatus(`${selectedBlocks.length} Blocos agrupados`, 'info');
    }
}

// 🔥 CRIA O GRUPO FANTASMA
function createSelectionGroup() {
    // Se já existe, dissolve primeiro para recalcular centro
    if (selectionGroup) dissolveSelectionGroup();

    selectionGroup = new THREE.Group();
    scene.add(selectionGroup);

    // 1. Calcula o centro da seleção (Média das posições)
    const center = new THREE.Vector3();
    selectedBlocks.forEach(b => center.add(b.mesh.position));
    center.divideScalar(selectedBlocks.length);
    
    // Posiciona o grupo no centro
    selectionGroup.position.copy(center);

    // 2. PULO DO GATO: Transfere os meshes da Cena para o Grupo
    // O método .attach do Three.js mantém a posição visual correta!
    selectedBlocks.forEach(block => {
        selectionGroup.attach(block.mesh);
    });
}

// 🔥 DISSOLVE O GRUPO (Devolve blocos para a cena)
function dissolveSelectionGroup() {
    if (!selectionGroup) return;

    // Devolve cada filho para a Scene preservando transformações
    // Precisamos clonar a lista de children porque ela muda enquanto iteramos
    const children = [...selectionGroup.children];
    
    children.forEach(child => {
        scene.attach(child); // Devolve para scene.add, mantendo world position
        
        // Atualiza os dados lógicos do bloco (JSON) com a nova posição
        const block = blocks.find(b => b.mesh === child);
        if (block) {
            block.position.x = child.position.x;
            block.position.y = child.position.y;
            block.position.z = child.position.z;
            
            // Se houve rotação no grupo, aplica no bloco também
            block.rotation.x = child.rotation.x;
            block.rotation.y = child.rotation.y;
            block.rotation.z = child.rotation.z;
        }
    });

    scene.remove(selectionGroup);
    selectionGroup = null;
    
    updateJSON(); // Salva as novas posições
}