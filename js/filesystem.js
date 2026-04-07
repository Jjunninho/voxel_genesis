// js/filesystem.js - VERSÃO FINAL CORRIGIDA

const FileSystem = {
    // IDs fixos para as pastas do sistema
    SYS_FOLDERS: {
        PROJECTS: 'sys_folder_projects',
        TEXTURES: 'sys_folder_textures'
    },

    // Estado do Sistema
    data: {
        root: {
            id: 'root',
            name: 'Raiz',
            type: 'folder',
            children: []
        }
    },
    currentFolderId: 'root',
    selectedItemId: null,

    // Inicialização
    init: function() {
        this.loadFromStorage();
        this.ensureSystemFolders();
        this.render();
    },

    // Garante pastas padrão
    ensureSystemFolders: function() {
        const root = this.data.root;
        if (!root.children.find(c => c.id === this.SYS_FOLDERS.PROJECTS)) {
            root.children.unshift({
                id: this.SYS_FOLDERS.PROJECTS,
                name: '📂 Meus Projetos',
                type: 'folder',
                children: []
            });
        }
        if (!root.children.find(c => c.id === this.SYS_FOLDERS.TEXTURES)) {
            root.children.unshift({
                id: this.SYS_FOLDERS.TEXTURES,
                name: '🎨 Minhas Texturas',
                type: 'folder',
                children: []
            });
        }
        this.saveToStorage();
    },

    saveToStorage: function() {
        try {
            localStorage.setItem('voxel_fs_data', JSON.stringify(this.data));
        } catch (e) {
            console.warn("Quota Storage Cheia", e);
        }
    },

    loadFromStorage: function() {
        const stored = localStorage.getItem('voxel_fs_data');
        if (stored) {
            try {
                this.data = JSON.parse(stored);
            } catch (e) { console.error("Erro FS", e); }
        }
    },

    getFolderById: function(id, current = this.data.root) {
        if (current.id === id) return current;
        if (current.children) {
            for (let child of current.children) {
                if (child.type === 'folder') {
                    const found = this.getFolderById(id, child);
                    if (found) return found;
                }
            }
        }
        return null;
    },

    // --- RENDERIZAÇÃO ---
    render: function() {
        const grid = document.getElementById('fsGrid');
        const breadcrumbs = document.getElementById('fsBreadcrumbs');
        if (!grid) return;

        grid.innerHTML = '';
        
        const folder = this.getFolderById(this.currentFolderId);
        
        // Breadcrumbs
        if (breadcrumbs) {
            let pathName = folder.name;
            if(folder.id === 'root') pathName = 'Raiz';
            else if(folder.id === this.SYS_FOLDERS.PROJECTS) pathName = 'Meus Projetos';
            else if(folder.id === this.SYS_FOLDERS.TEXTURES) pathName = 'Minhas Texturas';

            breadcrumbs.textContent = folder.id === 'root' ? '📁 Raiz' : `📁 ... / ${pathName}`;
            breadcrumbs.onclick = () => {
                 if(this.currentFolderId !== 'root') {
                     this.currentFolderId = 'root';
                     this.render();
                 }
            };
        }

        if (!folder.children || folder.children.length === 0) {
            grid.innerHTML = '<div class="fs-empty">Pasta vazia</div>';
            return;
        }

        const sortedItems = [...folder.children].sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });

        sortedItems.forEach(item => {
            const el = document.createElement('div');
            el.className = `fs-item ${this.selectedItemId === item.id ? 'selected' : ''}`;
            el.onclick = () => this.selectItem(item);
            el.ondblclick = () => this.openItem(item);

            // --- Lógica de Detecção de Tipo (Híbrida) ---
            let isProject = false;
            if (item.type === 'file') {
                if (item.fileType === 'project') isProject = true;
                else if (item.content && item.content.blocks) isProject = true;
            }

            // Ícones
            let thumbnailHtml = '';
            if (item.type === 'folder') {
                if (item.id === this.SYS_FOLDERS.PROJECTS) thumbnailHtml = '🏗️';
                else if (item.id === this.SYS_FOLDERS.TEXTURES) thumbnailHtml = '🎨';
                else thumbnailHtml = '📁';
            } else {
                if (isProject) {
                    thumbnailHtml = '🏰'; // Projeto
                } else {
                    // Canvas para Textura
                    thumbnailHtml = `<canvas id="thumb_${item.id}" width="32" height="32"></canvas>`;
                }
            }

            el.innerHTML = `
                <div class="fs-thumbnail">${thumbnailHtml}</div>
                <div class="fs-name">${item.name}</div>
            `;
            grid.appendChild(el);

            // --- Geração da Miniatura ---
            // Se NÃO for projeto e for arquivo, tentamos desenhar a textura
            if (item.type === 'file' && !isProject && item.content) {
                setTimeout(() => {
                    const canvas = document.getElementById(`thumb_${item.id}`);
                    if (canvas && typeof TextureGenerator !== 'undefined') {
                        try {
                            // Compatibilidade: Pega content ou content.textureRecipe
                            let recipe = item.content.textureRecipe ? item.content.textureRecipe : item.content;
                            
                            // Só desenha se parecer uma textura válida
                            if (recipe.colors || recipe.parameters) {
                                const tex = TextureGenerator.createTexture(recipe); // Usa padrão 256 e o CSS reduz
                                if (tex && tex.image) {
                                    const ctx = canvas.getContext('2d');
                                    ctx.drawImage(tex.image, 0, 0, 32, 32);
                                }
                            }
                        } catch(err) {
                            // Silencioso para não spammar o console
                        }
                    }
                }, 0);
            }
        });
    },

    // --- IMPORTAÇÃO INTELIGENTE ---
    importFile: function(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        let addedProjects = 0;
        let addedTextures = 0;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonContent = JSON.parse(e.target.result);
                    let targetFolderId = this.currentFolderId;
                    let fileType = 'unknown';

                    // Detector
                    if (jsonContent.blocks && Array.isArray(jsonContent.blocks)) {
                        targetFolderId = this.SYS_FOLDERS.PROJECTS;
                        fileType = 'project';
                        addedProjects++;
                    } 
                    else if (jsonContent.parameters || jsonContent.colors || jsonContent.textureRecipe) {
                        targetFolderId = this.SYS_FOLDERS.TEXTURES;
                        fileType = 'texture';
                        addedTextures++;
                    }

                    const targetFolder = this.getFolderById(targetFolderId);
                    if (targetFolder) {
                        targetFolder.children.push({
                            id: 'file_' + Date.now() + Math.random().toString(36).substr(2, 5),
                            name: file.name.replace('.json', ''),
                            type: 'file',
                            fileType: fileType,
                            content: jsonContent
                        });
                        this.saveToStorage();
                        if (this.currentFolderId === targetFolderId || this.currentFolderId === 'root') {
                            this.render();
                        }
                    }
                } catch (err) { console.error(err); }
            };
            reader.readAsText(file);
        });

        setTimeout(() => {
            if (addedProjects > 0 || addedTextures > 0) {
                showStatus(`✅ Importado: ${addedProjects} Projetos, ${addedTextures} Texturas.`, 'success');
            }
        }, 500);
        event.target.value = '';
    },

    createFolder: function() {
        const name = prompt("Nome da pasta:", "Nova Pasta");
        if (!name) return;
        const folder = this.getFolderById(this.currentFolderId);
        folder.children.push({
            id: 'folder_' + Date.now(),
            name: name,
            type: 'folder',
            children: []
        });
        this.saveToStorage();
        this.render();
    },

    selectItem: function(item) {
        this.selectedItemId = item.id;
        this.render(); 

        if (item.type === 'file') {
            // Se for Projeto
            if (item.fileType === 'project' || (item.content && item.content.blocks)) {
                if(confirm(`Carregar projeto "${item.name}"? A cena atual será limpa.`)) {
                    if (typeof loadProjectData === 'function') {
                        loadProjectData(item.content);
                    }
                }
            } 
            // Se for Textura
            else {
                if (typeof applyTexture === 'function') {
                    // Tenta extrair a receita se estiver aninhada
                    let recipe = item.content.textureRecipe ? item.content.textureRecipe : item.content;
                    applyTexture(recipe);
                    showStatus(`🎨 Textura "${item.name}" aplicada!`, 'info');
                }
            }
        }
    },

    openItem: function(item) {
        if (item.type === 'folder') {
            this.currentFolderId = item.id;
            this.selectedItemId = null;
            this.render();
        } else {
            this.selectItem(item);
        }
    },

    deleteSelected: function() {
        if (!this.selectedItemId) return;
        if (this.selectedItemId === this.SYS_FOLDERS.PROJECTS || this.selectedItemId === this.SYS_FOLDERS.TEXTURES) {
            showStatus('⛔ Pastas do sistema não podem ser deletadas.', 'error');
            return;
        }
        if (!confirm("Excluir item selecionado?")) return;

        const folder = this.getFolderById(this.currentFolderId);
        const index = folder.children.findIndex(c => c.id === this.selectedItemId);
        if (index > -1) {
            folder.children.splice(index, 1);
            this.selectedItemId = null;
            this.saveToStorage();
            this.render();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    FileSystem.init();
});