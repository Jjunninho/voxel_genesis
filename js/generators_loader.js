/**
 * generators_loader.js
 * Renderiza dinamicamente os cards do inventário a partir de generators_data.json
 * 
 * Como usar:
 *   1. Adicione <script src="js/generators_loader.js"></script> no HTML
 *   2. Remova todos os <div class="inventory-slot"> do HTML
 *   3. Remova os <div class="subcat-panel"> hardcoded
 *   4. Mantenha apenas os containers vazios:
 *        <div class="categories-tabs" id="categoriesTabs"></div>
 *        <div class="subcategories-container" id="subcategoriesContainer"></div>
 *        <div class="generators-grid" id="generatorsGrid"></div>
 */

(function () {
    'use strict';

    // ─── Caminho do JSON (ajuste se necessário) ───────────────────────────────
    const JSON_PATH = 'generators_data.json';

    // ─── Quantidade de slots vazios de reserva no final ───────────────────────
    const EMPTY_SLOTS = 6;

    // ─── Estado interno ───────────────────────────────────────────────────────
    let allData      = null;   // dados brutos do JSON
    let activeCategory = 'all';
    let activeSubcat   = null;

    // ─── Inicialização ────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        fetch(JSON_PATH)
            .then(r => {
                if (!r.ok) throw new Error(`Não foi possível carregar ${JSON_PATH}: ${r.status}`);
                return r.json();
            })
            .then(data => {
                allData = data;
                buildCategoryTabs(data.categories);
                buildSubcategoryPanels(data.categories);
                renderGrid('all', null);
                bindSearch();
            })
            .catch(err => {
                console.error('[generators_loader]', err);
                // Mostra aviso na grade para facilitar debug
                const grid = document.getElementById('generatorsGrid');
                if (grid) {
                    grid.innerHTML = `<div style="color:#ff6b6b;padding:16px;grid-column:1/-1">
                        ⚠️ Falha ao carregar generators_data.json<br>
                        <small>${err.message}</small>
                    </div>`;
                }
            });
    });

    // ─── Tabs de categorias ───────────────────────────────────────────────────
    function buildCategoryTabs(categories) {
        const container = document.getElementById('categoriesTabs');
        if (!container) return;

        // Limpa conteúdo existente (caso haja tabs hardcoded)
        container.innerHTML = '';

        // Tab "Todos"
        const totalCount = categories.reduce((s, c) => s + c.items.length, 0);
        container.appendChild(makeTab('all', '🌍 Todos', `${totalCount}+`, true));

        // Uma tab por categoria
        categories.forEach(cat => {
            container.appendChild(makeTab(cat.id, cat.label, cat.items.length));
        });

        container.addEventListener('click', e => {
            const tab = e.target.closest('.category-tab');
            if (!tab) return;
            const catId = tab.dataset.category;

            container.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            activeCategory = catId;
            activeSubcat   = null;
            showSubcatPanel(catId);
            renderGrid(catId, null);
        });
    }

    function makeTab(id, label, count, active = false) {
        const btn = document.createElement('button');
        btn.className = 'category-tab' + (active ? ' active' : '');
        btn.dataset.category = id;
        btn.innerHTML = `<span class="tab-label">${label}</span><span class="tab-count">${count}</span>`;
        return btn;
    }

    // ─── Painéis de subcategorias ─────────────────────────────────────────────
    function buildSubcategoryPanels(categories) {
        const container = document.getElementById('subcategoriesContainer');
        if (!container) return;

        container.innerHTML = '';

        categories.forEach(cat => {
            if (!cat.subcategories || cat.subcategories.length === 0) return;

            const panel = document.createElement('div');
            panel.className = 'subcat-panel hidden';
            panel.dataset.parent = cat.id;

            // Header colapsável
            const header = document.createElement('div');
            header.className = 'subcat-header';
            header.innerHTML = '<span>🔽 FILTRAR POR TIPO</span>';
            header.addEventListener('click', () => toggleSubcatPanel(header));

            // Lista de botões
            const list = document.createElement('div');
            list.className = 'subcat-list';

            // Botão "Tudo" desta categoria
            list.appendChild(makeSubcatBtn(`${cat.id}-all`, '🌍 Tudo', true));

            cat.subcategories.forEach(sub => {
                // Não duplicar o "all" se já vier no JSON
                if (sub.id === `${cat.id}-all`) return;
                list.appendChild(makeSubcatBtn(sub.id, sub.label));
            });

            list.addEventListener('click', e => {
                const btn = e.target.closest('.subcat-filter-btn');
                if (!btn) return;
                list.querySelectorAll('.subcat-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeSubcat = btn.dataset.subcat;
                renderGrid(activeCategory, activeSubcat);
            });

            panel.appendChild(header);
            panel.appendChild(list);
            container.appendChild(panel);
        });
    }

    function makeSubcatBtn(id, label, active = false) {
        const btn = document.createElement('button');
        btn.className = 'subcat-filter-btn' + (active ? ' active' : '');
        btn.dataset.subcat = id;
        // Separa emoji do texto para usar btn-icon se quiser
        btn.textContent = label;
        return btn;
    }

    function showSubcatPanel(catId) {
        const container = document.getElementById('subcategoriesContainer');
        if (!container) return;

        container.querySelectorAll('.subcat-panel').forEach(p => {
            if (p.dataset.parent === catId) {
                p.classList.remove('hidden');
            } else {
                p.classList.add('hidden');
            }
        });
    }

    // ─── Renderização da grade ────────────────────────────────────────────────
    function renderGrid(catId, subcatId, searchTerm = '') {
        const grid = document.getElementById('generatorsGrid');
        if (!grid || !allData) return;

        grid.innerHTML = '';

        const items = getFilteredItems(catId, subcatId, searchTerm);

        if (items.length === 0) {
            grid.innerHTML = `<div style="color:#aab0c8;padding:16px;grid-column:1/-1;text-align:center">
                🔍 Nenhum gerador encontrado
            </div>`;
            return;
        }

        items.forEach(({ item, categoryId }) => {
            grid.appendChild(makeSlot(item, categoryId));
        });

        // Slots vazios de reserva
        if (!searchTerm) {
            for (let i = 0; i < EMPTY_SLOTS; i++) {
                const empty = document.createElement('div');
                empty.className = 'inventory-slot empty';
                grid.appendChild(empty);
            }
        }
    }

    function getFilteredItems(catId, subcatId, searchTerm = '') {
        const results = [];
        const term    = searchTerm.toLowerCase();

        allData.categories.forEach(cat => {
            if (catId !== 'all' && cat.id !== catId) return;

            cat.items.forEach(item => {
                // Filtro de subcategoria
                if (subcatId && subcatId !== `${cat.id}-all` && item.subcat !== subcatId) return;

                // Filtro de busca
                if (term && !item.title.toLowerCase().includes(term) && !item.shape.toLowerCase().includes(term)) return;

                results.push({ item, categoryId: cat.id });
            });
        });

        return results;
    }

    function makeSlot(item, categoryId) {
        const div = document.createElement('div');
        div.className = 'inventory-slot' + (item.fallback ? ' fallback' : '');
        div.dataset.shape    = item.shape;
        div.dataset.category = categoryId;
        div.dataset.subcat   = item.subcat || '';
        div.title            = item.title || item.shape;

        const icon = document.createElement('div');
        icon.className   = 'slot-icon';
        icon.textContent = item.icon || '❓';
        div.appendChild(icon);

        if (item.qty) {
            const qty = document.createElement('div');
            qty.className   = 'slot-qty';
            qty.textContent = item.qty;
            div.appendChild(qty);
        }

        return div;
    }

    // ─── Busca ────────────────────────────────────────────────────────────────
    function bindSearch() {
        const input = document.getElementById('searchGenerators');
        if (!input) return;

        let debounce;
        input.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                const term = input.value.trim();
                renderGrid('all', null, term);
                // Atualiza contagem nas tabs ao buscar
            }, 200);
        });
    }

    // ─── Utilitário: toggle do painel colapsável ──────────────────────────────
    function toggleSubcatPanel(headerEl) {
        const list        = headerEl.nextElementSibling;
        const isCollapsed = list.style.display === 'none' || list.style.display === '';
        list.style.display = isCollapsed ? 'grid' : 'none';
        headerEl.classList.toggle('collapsed', !isCollapsed);
    }

    // Expõe para uso inline (retrocompatibilidade com onclick no HTML)
    window.toggleSubcatPanel = toggleSubcatPanel;

    // ─── API pública (opcional) ───────────────────────────────────────────────
    // Permite recarregar de outro JSON em runtime:
    //   GeneratorsLoader.loadFrom('meu_pack.json')
    window.GeneratorsLoader = {
        reload() {
            fetch(JSON_PATH)
                .then(r => r.json())
                .then(data => {
                    allData = data;
                    buildCategoryTabs(data.categories);
                    buildSubcategoryPanels(data.categories);
                    renderGrid('all', null);
                });
        },
        loadFrom(url) {
            fetch(url)
                .then(r => r.json())
                .then(data => {
                    allData = data;
                    buildCategoryTabs(data.categories);
                    buildSubcategoryPanels(data.categories);
                    renderGrid('all', null);
                });
        }
    };

})();
