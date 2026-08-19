// js/shapes-loader.js
// Carrega o painel "📐 Formas" dinamicamente a partir de shapes-data.json

(async function loadShapesPanel() {
    const containerId = 'shapes-panel-body';
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('[shapes-loader] Elemento #shapes-panel-body não encontrado.');
        return;
    }

    let data;
    try {
        const res = await fetch('js/shapes-data.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    } catch (err) {
        console.error('[shapes-loader] Falha ao carregar shapes-data.json:', err);
        container.innerHTML = '<p style="color:#e74c3c;padding:8px;font-size:11px;">⚠️ Erro ao carregar formas.</p>';
        return;
    }

    const html = data.categories.map(cat => `
        <div class="shape-category">
            <div class="category-header">${cat.label}</div>
            <div class="shape-grid-compact">
                ${cat.shapes.map(s => `
                <div class="shape-btn-compact" onclick="openShapeModal('${s.key}')" title="${s.title}">
                    <div class="shape-icon-compact">${s.icon}</div>
                </div>`).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    console.log(`[shapes-loader] ${data.categories.length} categorias carregadas.`);
})();
