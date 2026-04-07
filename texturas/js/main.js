// js/main.js - VERSÃO COM IA INTEGRADA, MODULAR E FILE SYSTEM
import { texturePresets } from './presets.js';
import { generateTextureFunction, applyEffect, blendTextures, getColor } from './engine.js';
import { noise, hexToRgb, calculateImageVariance } from './utils.js';
import { generateTextureFromAI, getSuggestedPrompts } from './api.js';
import { renderPixel, shouldValidateSaturation } from './renderModes.js';

// ====================================================================
// 📋 ELEMENTOS DOM
// ====================================================================
const generateBtn = document.getElementById('generateBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const downloadJsonBtn = document.getElementById('downloadJsonBtn');
const copyJsonBtn = document.getElementById('copyJsonBtn');
const randomSeedBtn = document.getElementById('randomSeedBtn');
const canvasContainer = document.getElementById('canvasContainer');
const previewCanvas = document.getElementById('previewCanvas');
const jsonPreview = document.getElementById('jsonPreview');
const fileSize = document.getElementById('fileSize');
const primaryTextureGrid = document.getElementById('primaryTextureGrid');
const secondaryTextureGrid = document.getElementById('secondaryTextureGrid');

// 🤖 Elementos da IA
const aiPromptInput = document.getElementById('aiPromptInput');
const generateAiBtn = document.getElementById('generateAiBtn');
const aiStatus = document.getElementById('aiStatus');
const suggestionsGrid = document.getElementById('suggestionsGrid');

// Inputs
const inputs = {
    seed: document.getElementById('seed'),
    scale: document.getElementById('scale'),
    noiseAmount: document.getElementById('noiseAmount'),
    octaves: document.getElementById('octaves'),
    contrast: document.getElementById('contrast'),
    distortion: document.getElementById('distortion'),
    blendAmount: document.getElementById('blendAmount'),
    blendMode: document.getElementById('blendMode'),
    colorMode: document.getElementById('colorMode'),
    color1: document.getElementById('color1'),
    color2: document.getElementById('color2'),
    color3: document.getElementById('color3'),
    color4: document.getElementById('color4')
};

// Valores display
const displays = {
    scaleValue: document.getElementById('scaleValue'),
    noiseValue: document.getElementById('noiseValue'),
    octavesValue: document.getElementById('octavesValue'),
    contrastValue: document.getElementById('contrastValue'),
    distortionValue: document.getElementById('distortionValue'),
    blendAmountValue: document.getElementById('blendAmountValue')
};

// ====================================================================
// 🎯 ESTADO DA APLICAÇÃO
// ====================================================================
let currentTextures = { primary: 'stone', secondary: 'wood' };
let activeEffects = new Set();
let proceduralRecipe = null;
let currentRenderMode = 'texture';
let tilingEnabled = false;

// ====================================================================
// 🔄 TOGGLE TILING
// ====================================================================
window.toggleTiling = function() {
    tilingEnabled = !tilingEnabled;
    const tilingBtn = document.getElementById('tilingBtn');
    
    if (tilingEnabled) {
        tilingBtn.style.background = 'rgba(255, 215, 0, 0.2)';
        tilingBtn.style.borderColor = '#ffd700';
        tilingBtn.innerHTML = '✅ Tiling ATIVO';
    } else {
        tilingBtn.style.background = '';
        tilingBtn.style.borderColor = '#ffd700';
        tilingBtn.innerHTML = '🔄 Tiling (Repetição Infinita)';
    }
    
    generateTexture();
}

// ====================================================================
// 🎨 MODO DE RENDERIZAÇÃO
// ====================================================================
window.setRenderMode = function(mode) {
    currentRenderMode = mode;
    
    document.querySelectorAll('.render-mode-btn').forEach(btn => {
        if(btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    generateTexture();
}

// ====================================================================
// 🎭 INICIALIZAR TEXTURAS NA UI
// ====================================================================
function initializeTextures() {
    texturePresets.forEach(texture => {
        // Textura primária
        const primaryBtn = document.createElement('button');
        primaryBtn.className = `texture-btn ${texture.id === currentTextures.primary ? 'active' : ''}`;
        primaryBtn.innerHTML = `${texture.emoji}<br><span>${texture.name}</span>`;
        primaryBtn.dataset.texture = texture.id;
        primaryBtn.dataset.type = 'primary';
        primaryBtn.addEventListener('click', handleTextureSelect);
        primaryTextureGrid.appendChild(primaryBtn);

        // Textura secundária
        const secondaryBtn = document.createElement('button');
        secondaryBtn.className = `texture-btn ${texture.id === currentTextures.secondary ? 'active' : ''}`;
        secondaryBtn.innerHTML = `${texture.emoji}<br><span>${texture.name}</span>`;
        secondaryBtn.dataset.texture = texture.id;
        secondaryBtn.dataset.type = 'secondary';
        secondaryBtn.addEventListener('click', handleTextureSelect);
        secondaryTextureGrid.appendChild(secondaryBtn);
    });
}

// ====================================================================
// 🖱️ SELECIONAR TEXTURA
// ====================================================================
function handleTextureSelect(e) {
    const targetBtn = e.target.closest('.texture-btn');
    if (!targetBtn) return;

    const type = targetBtn.dataset.type;
    const textureId = targetBtn.dataset.texture;
    
    document.querySelectorAll(`[data-type="${type}"]`).forEach(btn => {
        btn.classList.remove('active');
    });
    targetBtn.classList.add('active');
    
    currentTextures[type] = textureId;
    
    const preset = texturePresets.find(t => t.id === textureId);
    
    if (preset && type === 'primary') {
        inputs.color1.value = preset.colors[0];
        inputs.color2.value = preset.colors[1];
        inputs.color3.value = preset.colors[2];
        inputs.color4.value = preset.colors[3];
    }

    generateTexture();
}

// ====================================================================
// 📊 LISTENERS DE INPUTS PARA DISPLAY
// ====================================================================
Object.keys(inputs).forEach(key => {
    if (inputs[key].type === 'range' || inputs[key].type === 'number') {
        const displayKey = `${key}Value`;
        if (displays[displayKey]) {
            inputs[key].addEventListener('input', (e) => {
                displays[displayKey].textContent = e.target.value;
            });
            displays[displayKey].textContent = inputs[key].value;
        }
    }
});

// ====================================================================
// 🎲 SEED ALEATÓRIA
// ====================================================================
randomSeedBtn.addEventListener('click', () => {
    const newSeed = Math.floor(Math.random() * 9999999) + 1;
    inputs.seed.value = newSeed;
});

// ====================================================================
// 🎲 RANDOMIZAR COM GUARDIÃO DE QUALIDADE
// ====================================================================
function setRandomValues() {
    inputs.seed.value = Math.floor(Math.random() * 9999999) + 1;
    
    const randomPrimary = texturePresets[Math.floor(Math.random() * texturePresets.length)];
    const randomSecondary = texturePresets[Math.floor(Math.random() * texturePresets.length)];
    currentTextures.primary = randomPrimary.id;
    currentTextures.secondary = randomSecondary.id;
    
    document.querySelectorAll('[data-type="primary"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.texture === randomPrimary.id);
    });
    document.querySelectorAll('[data-type="secondary"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.texture === randomSecondary.id);
    });
    
    inputs.color1.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    inputs.color2.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    inputs.color3.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    inputs.color4.value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    inputs.scale.value = Math.floor(Math.random() * 195) + 5;
    inputs.noiseAmount.value = Math.random().toFixed(2);
    inputs.contrast.value = (Math.random() * 2.9 + 0.1).toFixed(1);
    inputs.distortion.value = Math.random().toFixed(2);
    inputs.blendAmount.value = Math.random().toFixed(2);
    
    Object.keys(inputs).forEach(key => {
        const displayKey = `${key}Value`;
        if (displays[displayKey]) {
            displays[displayKey].textContent = inputs[key].value;
        }
    });
}

randomizeBtn.addEventListener('click', () => {
    let attempts = 0;
    const maxAttempts = 5;
    let variance = 0;
    
    while (variance < 5 && attempts < maxAttempts) {
        attempts++;
        setRandomValues();
        variance = generateTexture();
        
        if (variance < 5) {
            console.log(`🔄 Tentativa ${attempts}: Variância muito baixa (${variance.toFixed(2)})`);
        }
    }
    
    if (variance >= 5) {
        console.log(`✅ Randomização bem-sucedida! Variância: ${variance.toFixed(2)}`);
    } else {
        console.warn(`⚠️ Após ${maxAttempts} tentativas, melhor resultado: ${variance.toFixed(2)}`);
    }
});

// ====================================================================
// 🎨 GERAÇÃO DE TEXTURA PRINCIPAL
// ====================================================================
function generateTexture() {
    const ctx = previewCanvas.getContext('2d');
    const size = 512;
    previewCanvas.width = size;
    previewCanvas.height = size;
    
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    const colors = [
        hexToRgb(inputs.color1.value),
        hexToRgb(inputs.color2.value),
        hexToRgb(inputs.color3.value),
        hexToRgb(inputs.color4.value)
    ];
    
    const params = {
        seed: parseInt(inputs.seed.value),
        scale: parseFloat(inputs.scale.value),
        noiseAmount: parseFloat(inputs.noiseAmount.value),
        octaves: parseInt(inputs.octaves.value),
        contrast: parseFloat(inputs.contrast.value),
        distortion: parseFloat(inputs.distortion.value),
        blendMode: inputs.blendMode.value,
        blendAmount: parseFloat(inputs.blendAmount.value),
        tiling: tilingEnabled
    };
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let value = renderPixel(x, y, size, params, currentTextures, currentRenderMode);
            
            activeEffects.forEach(effect => {
                value = applyEffect(x / size, y / size, value, effect, params);
            });
            
            value = ((value - 0.5) * params.contrast + 0.5);
            value = Math.max(0, Math.min(1, value));
            
            const color = getColor(value, inputs.colorMode.value, colors);
            
            const i = (y * size + x) * 4;
            data[i] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
            data[i + 3] = 255;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const variance = shouldValidateSaturation(currentRenderMode) ? 
        calculateImageVariance(imageData) : 999;
    
    proceduralRecipe = {
        textures: {
            primary: currentTextures.primary,
            secondary: currentTextures.secondary,
            blend: {
                mode: inputs.blendMode.value,
                amount: params.blendAmount
            }
        },
        colors: [
            inputs.color1.value,
            inputs.color2.value,
            inputs.color3.value,
            inputs.color4.value
        ],
        colorMode: inputs.colorMode.value,
        parameters: params,
        effects: Array.from(activeEffects),
        renderMode: currentRenderMode,
        tiling: tilingEnabled
    };
    
    const jsonString = JSON.stringify(proceduralRecipe, null, 2);
    const sizeKB = (new Blob([jsonString]).size / 1024).toFixed(2);
    
    jsonPreview.textContent = jsonString;
    fileSize.textContent = `${sizeKB} KB`;
    canvasContainer.style.display = 'grid';
    
    return variance;
}

generateBtn.addEventListener('click', generateTexture);

// ====================================================================
// 💾 DOWNLOAD PNG
// ====================================================================
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `texture-${Date.now()}.png`;
    link.href = previewCanvas.toDataURL();
    link.click();
});

// ====================================================================
// 📄 DOWNLOAD JSON + SALVAR NO FILE SYSTEM
// ====================================================================
downloadJsonBtn.addEventListener('click', () => {
    if (!proceduralRecipe) return;
    
    // 1. Download do arquivo JSON
    const jsonString = JSON.stringify(proceduralRecipe, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const name = `texture-${currentTextures.primary}-${currentTextures.secondary}`;
    
    link.download = `${name}-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    
    // 2. SALVAR NO FILE SYSTEM LOCAL
    if (window.FileSystemTextures) {
        window.FileSystemTextures.saveTexture(proceduralRecipe, name);
        
        // Feedback visual
        downloadJsonBtn.textContent = '✅ Salvo!';
        downloadJsonBtn.style.background = 'linear-gradient(135deg, #00ff88, #00aaff)';
        setTimeout(() => {
            downloadJsonBtn.textContent = '📄 Baixar JSON';
            downloadJsonBtn.style.background = '';
        }, 2000);
    }
});

// ====================================================================
// 📋 COPIAR JSON
// ====================================================================
copyJsonBtn.addEventListener('click', async () => {
    if (!proceduralRecipe) return;
    
    const jsonString = JSON.stringify(proceduralRecipe, null, 2);
    
    try {
        await navigator.clipboard.writeText(jsonString);
        copyJsonBtn.textContent = '✅ Copiado!';
        setTimeout(() => {
            copyJsonBtn.textContent = '📋 Copiar Receita';
        }, 2000);
    } catch (err) {
        alert('Erro ao copiar. Copie manualmente do preview abaixo.');
    }
});

// ====================================================================
// ✨ EFEITOS ESPECIAIS
// ====================================================================
document.querySelectorAll('.effect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const effect = btn.dataset.effect;
        
        if (activeEffects.has(effect)) {
            activeEffects.delete(effect);
            btn.classList.remove('active');
        } else {
            activeEffects.add(effect);
            btn.classList.add('active');
        }
        
        generateTexture();
    });
});

// ====================================================================
// 🤖 SUGESTÕES DE IA
// ====================================================================
function initializeAISuggestions() {
    const suggestions = getSuggestedPrompts();
    const allSuggestions = Object.values(suggestions).flat();
    
    const randomSuggestions = [];
    for (let i = 0; i < 6; i++) {
        const random = allSuggestions[Math.floor(Math.random() * allSuggestions.length)];
        if (!randomSuggestions.includes(random)) {
            randomSuggestions.push(random);
        }
    }
    
    randomSuggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = suggestion;
        btn.onclick = () => {
            aiPromptInput.value = suggestion;
            aiPromptInput.focus();
        };
        suggestionsGrid.appendChild(btn);
    });
}

// ====================================================================
// 📢 STATUS DA IA
// ====================================================================
function showAIStatus(message, type) {
    aiStatus.textContent = message;
    aiStatus.className = `ai-status ${type}`;
    aiStatus.classList.remove('hidden');
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            aiStatus.classList.add('hidden');
        }, 5000);
    }
}

// ====================================================================
// 🔧 APLICAR RECEITA NA UI (FUNÇÃO UNIFICADA)
// ====================================================================
function applyRecipeToUI(recipe) {
    // Atualiza texturas
    currentTextures.primary = recipe.textures.primary;
    currentTextures.secondary = recipe.textures.secondary;
    
    // Atualiza seleção visual das texturas
    document.querySelectorAll('[data-type="primary"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.texture === recipe.textures.primary);
    });
    document.querySelectorAll('[data-type="secondary"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.texture === recipe.textures.secondary);
    });
    
    // Atualiza cores
    recipe.colors.forEach((color, i) => {
        const input = document.getElementById(`color${i + 1}`);
        if (input) {
            // Converte rgb() para hex se necessário
            if (color.startsWith('rgb')) {
                const matches = color.match(/\d+/g);
                const hex = '#' + matches.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
                input.value = hex;
            } else {
                input.value = color;
            }
        }
    });
    
    // Atualiza parâmetros
    Object.keys(recipe.parameters).forEach(key => {
        if (inputs[key]) {
            inputs[key].value = recipe.parameters[key];
            const displayKey = `${key}Value`;
            if (displays[displayKey]) {
                displays[displayKey].textContent = recipe.parameters[key];
            }
        }
    });
    
    // Atualiza modo de blend
    inputs.blendMode.value = recipe.textures.blend.mode;
    inputs.blendAmount.value = recipe.textures.blend.amount;
    displays.blendAmountValue.textContent = recipe.textures.blend.amount;
    
    // Atualiza modo de cor
    inputs.colorMode.value = recipe.colorMode;
    
    // Atualiza modo de renderização
    if (recipe.renderMode) {
        currentRenderMode = recipe.renderMode;
        document.querySelectorAll('.render-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === currentRenderMode);
        });
    }
    
    // Atualiza tiling
    if (recipe.tiling !== undefined) {
        tilingEnabled = recipe.tiling;
        const tilingBtn = document.getElementById('tilingBtn');
        if (tilingEnabled) {
            tilingBtn.style.background = 'rgba(255, 215, 0, 0.2)';
            tilingBtn.style.borderColor = '#ffd700';
            tilingBtn.innerHTML = '✅ Tiling ATIVO';
        } else {
            tilingBtn.style.background = '';
            tilingBtn.style.borderColor = '#ffd700';
            tilingBtn.innerHTML = '🔄 Tiling (Repetição Infinita)';
        }
    }
    
    // Atualiza efeitos
    activeEffects.clear();
    document.querySelectorAll('.effect-btn').forEach(btn => btn.classList.remove('active'));
    
    if (recipe.effects && Array.isArray(recipe.effects)) {
        recipe.effects.forEach(effect => {
            activeEffects.add(effect);
            const btn = document.querySelector(`[data-effect="${effect}"]`);
            if (btn) btn.classList.add('active');
        });
    }
    
    // Gera e retorna variância
    return generateTexture();
}

// ====================================================================
// 🌉 PONTE: FILE SYSTEM → EDITOR
// ====================================================================
window.loadRecipeFromFS = function(recipe) {
    console.log('📂 Carregando receita do File System...');
    applyRecipeToUI(recipe);
};

// ====================================================================
// 🤖 GERAÇÃO VIA IA
// ====================================================================
generateAiBtn.addEventListener('click', async () => {
    const prompt = aiPromptInput.value;
    
    if (!prompt.trim()) {
        showAIStatus('Por favor, descreva a textura desejada!', 'error');
        return;
    }
    
    generateAiBtn.disabled = true;
    generateAiBtn.textContent = '⏳ Gerando...';
    generateAiBtn.classList.add('loading');
    
    showAIStatus('🧠 IA processando sua descrição...', 'info');
    
    const result = await generateTextureFromAI(
        prompt,
        texturePresets,
        applyRecipeToUI, // Usa a função unificada
        (variance) => variance > 5
    );
    
    generateAiBtn.disabled = false;
    generateAiBtn.textContent = '✨ Gerar com IA';
    generateAiBtn.classList.remove('loading');
    
    if (result.success) {
        showAIStatus(result.message, 'success');
        
        // Atualiza título com stats
        const infoContainer = document.querySelector('.canvas-wrapper h3');
        const cor = result.attempts > 3 ? '#ffaa00' : '#00ff88';
        infoContainer.innerHTML = `
            Visualização via IA 
            <span style="font-size: 11px; color: #aaa; margin-left: 10px; font-weight: normal;">
                (${result.attempts} tentativa${result.attempts > 1 ? 's' : ''} • Variância: <span style="color:${cor}">${result.variance.toFixed(1)}</span>)
            </span>
        `;
    } else {
        showAIStatus(result.message, 'error');
    }
});

// ====================================================================
// 🎨 INICIALIZAÇÃO COM TEXTURA BONITA GARANTIDA
// ====================================================================
function initializeWithBeautifulTexture() {
    let attempts = 0;
    const maxAttempts = 10;
    let variance = 0;
    
    console.log('🎨 Inicializando com textura de qualidade...');
    
    while (variance < 5 && attempts < maxAttempts) {
        attempts++;
        
        const goodPresets = ['stone', 'wood', 'marble', 'clouds', 'metal', 'water', 'nebula'];
        const randomPrimary = goodPresets[Math.floor(Math.random() * goodPresets.length)];
        const randomSecondary = goodPresets[Math.floor(Math.random() * goodPresets.length)];
        
        currentTextures.primary = randomPrimary;
        currentTextures.secondary = randomSecondary;
        
        document.querySelectorAll('[data-type="primary"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.texture === randomPrimary);
        });
        document.querySelectorAll('[data-type="secondary"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.texture === randomSecondary);
        });
        
        inputs.seed.value = Math.floor(Math.random() * 9999999) + 1;
        inputs.scale.value = 40 + Math.random() * 40;
        inputs.noiseAmount.value = (0.2 + Math.random() * 0.3).toFixed(2);
        inputs.contrast.value = (1.3 + Math.random() * 0.8).toFixed(1);
        inputs.distortion.value = (0.1 + Math.random() * 0.3).toFixed(2);
        inputs.blendAmount.value = (0.3 + Math.random() * 0.4).toFixed(2);
        inputs.blendMode.value = ['multiply', 'screen', 'overlay'][Math.floor(Math.random() * 3)];
        
        Object.keys(inputs).forEach(key => {
            const displayKey = `${key}Value`;
            if (displays[displayKey]) {
                displays[displayKey].textContent = inputs[key].value;
            }
        });
        
        variance = generateTexture();
        
        if (variance < 5) {
            console.log(`🔄 Tentativa ${attempts}: Variância ${variance.toFixed(2)} (baixa, tentando novamente...)`);
        }
    }
    
    if (variance >= 5) {
        console.log(`✅ Textura inicial gerada com sucesso na tentativa ${attempts}! Variância: ${variance.toFixed(2)}`);
        
        const infoContainer = document.querySelector('.canvas-wrapper h3');
        const cor = attempts > 5 ? '#ffaa00' : '#00ff88';
        infoContainer.innerHTML = `
            Visualização 
            <span style="font-size: 11px; color: #aaa; margin-left: 10px; font-weight: normal;">
                (Inicial gerada em ${attempts} tentativa${attempts > 1 ? 's' : ''} • Variância: <span style="color:${cor}">${variance.toFixed(1)}</span>)
            </span>
        `;
    } else {
        console.warn(`⚠️ Não foi possível gerar textura ideal em ${maxAttempts} tentativas. Usando a melhor disponível.`);
    }
}

// ====================================================================
// 🚀 INICIALIZAÇÃO
// ====================================================================
initializeTextures();
initializeAISuggestions();
initializeWithBeautifulTexture();
