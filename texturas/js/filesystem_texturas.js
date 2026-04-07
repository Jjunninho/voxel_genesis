// texturas/js/filesystem_texturas.js
import { renderPixel } from './renderModes.js';
import { getColor } from './engine.js';
import { applyEffect } from './engine.js';
import { hexToRgb } from './utils.js';

// Expõe globalmente para o HTML acessar
window.FileSystemTextures = {
    // Estado
    data: {
        root: { id: 'root', name: 'Raiz', type: 'folder', children: [] }
    },
    currentFolderId: 'root',
    selectedItemId: null,

    // Inicialização
    init: function() {
        this.loadFromStorage();
        this.render();
        console.log("📂 File System de Texturas Iniciado");
    },

    // --- Persistência ---
    saveToStorage: function() {
        try {
            localStorage.setItem('texture_fs_data', JSON.stringify(this.data));
        } catch (e) { console.warn("Quota Storage Cheia", e); }
    },

    loadFromStorage: function() {
        const stored = localStorage.getItem('texture_fs_data');
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

    // --- API PÚBLICA PARA O MAIN.JS ---
    
    /**
     * Salva uma receita no sistema de arquivos
     * @param {Object} recipe - O objeto JSON da textura
     * @param {string} filename - Nome sugerido (sem extensão)
     */
    saveTexture: function(recipe, filename) {
        const folder = this.getFolderById(this.currentFolderId);
        
        // Evita duplicatas de nome simples
        let finalName = filename;
        let counter = 1;
        while(folder.children.find(c => c.name === finalName && c.type === 'file')) {
            finalName = `${filename} (${counter++})`;
        }

        const newItem = {
            id: 'tex_' + Date.now(),
            name: finalName,
            type: 'file',
            content: recipe,
            createdAt: new Date().toISOString()
        };

        folder.children.push(newItem);
        this.saveToStorage();
        this.render();
        
        // Feedback visual (opcional)
        const btn = document.querySelector('.fs-container');
        if(btn) {
            btn.style.borderColor = '#00ff88';
            setTimeout(() => btn.style.borderColor = '#444', 500);
        }
    },

    // --- RENDERIZAÇÃO DA UI ---
    render: function() {
        const grid = document.getElementById('fsGrid');
        const breadcrumbs = document.getElementById('fsBreadcrumbs');
        if (!grid) return;

        grid.innerHTML = '';
        
        const folder = this.getFolderById(this.currentFolderId);
        
        // Breadcrumbs
        if (breadcrumbs) {
            let pathName = folder.id === 'root' ? 'Raiz' : folder.name;
            breadcrumbs.textContent = `📁 ${pathName}`;
            breadcrumbs.onclick = () => {
                 if(this.currentFolderId !== 'root') {
                     this.currentFolderId = 'root';
                     this.render();
                 }
            };
        }

        if (!folder.children || folder.children.length === 0) {
            grid.innerHTML = '<div class="fs-empty">Pasta vazia. Salve uma textura ou importe um JSON.</div>';
            return;
        }

        // Ordenar: Pastas primeiro
        const sortedItems = [...folder.children].sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });

        sortedItems.forEach(item => {
            const el = document.createElement('div');
            el.className = `fs-item ${this.selectedItemId === item.id ? 'selected' : ''}`;
            el.onclick = () => this.selectItem(item);
            el.ondblclick = () => this.openItem(item);

            let thumbnailHtml = item.type === 'folder' ? '📁' : `<canvas id="thumb_${item.id}" width="64" height="64"></canvas>`;
            
            el.innerHTML = `
                <div class="fs-thumbnail">${thumbnailHtml}</div>
                <div class="fs-name">${item.name}</div>
            `;
            grid.appendChild(el);

            // Gera miniatura assíncrona
            if (item.type === 'file') {
                setTimeout(() => this.generateThumbnail(item), 0);
            }
        });
    },

    // --- GERADOR DE MINIATURAS ---
    generateThumbnail: function(item) {
        const canvas = document.getElementById(`thumb_${item.id}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const size = 64;
        const recipe = item.content;
        
        // Extrai parâmetros da receita salva
        const params = recipe.parameters;
        const textures = recipe.textures; // {primary, secondary}
        const colors = recipe.colors.map(c => {
             // Converte rgb(r,g,b) string ou hex para objeto {r,g,b}
             if(c.startsWith('#')) return hexToRgb(c);
             const parts = c.match(/\d+/g);
             return {r: parseInt(parts[0]), g: parseInt(parts[1]), b: parseInt(parts[2])};
        });

        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;

        // Renderiza pixel a pixel (versão reduzida do main.js)
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Escala coordenada para simular full size 512
                // Isso mantém a aparência consistente com o preview grande
                const simX = x * (512/size); 
                const simY = y * (512/size);

                let value = renderPixel(simX, simY, 512, params, textures, recipe.renderMode || 'texture');
                
                // Aplica efeitos (simplificado para thumbnail: 1 ou 2 efeitos max para performance)
                if(recipe.effects && recipe.effects.length > 0) {
                     // Só aplica o primeiro efeito para ser rápido
                     value = applyEffect(x/size, y/size, value, recipe.effects[0], params);
                }

                // Contraste
                value = ((value - 0.5) * params.contrast + 0.5);
                value = Math.max(0, Math.min(1, value));

                const color = getColor(value, recipe.colorMode, colors);
                
                const i = (y * size + x) * 4;
                data[i] = color.r;
                data[i + 1] = color.g;
                data[i + 2] = color.b;
                data[i + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    },

    // --- AÇÕES ---
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
    },

    openItem: function(item) {
        if (item.type === 'folder') {
            this.currentFolderId = item.id;
            this.selectedItemId = null;
            this.render();
        } else {
            // CARREGAR TEXTURA NA INTERFACE (Callback para o main.js)
            if (window.loadRecipeFromFS) {
                window.loadRecipeFromFS(item.content);
                alert(`✅ Textura "${item.name}" carregada!`);
            }
        }
    },

    deleteSelected: function() {
        if (!this.selectedItemId) return;
        if (!confirm("Excluir item selecionado?")) return;

        const folder = this.getFolderById(this.currentFolderId);
        const index = folder.children.findIndex(c => c.id === this.selectedItemId);
        if (index > -1) {
            folder.children.splice(index, 1);
            this.selectedItemId = null;
            this.saveToStorage();
            this.render();
        }
    },
    
    importFile: function(event) {
        const files = event.target.files;
        if (!files.length) return;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    // Validação simples
                    if(json.textures && json.parameters) {
                        this.saveTexture(json, file.name.replace('.json', ''));
                    } else {
                        alert('Arquivo inválido: ' + file.name);
                    }
                } catch(err) { console.error(err); }
            };
            reader.readAsText(file);
        });
        event.target.value = ''; // Reset
    }
};

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    FileSystemTextures.init();
});