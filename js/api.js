// js/api.js - VERSÃO COM "AUTO-GROUNDING" (Correção de Gravidade)

async function generateFromAI() {
    // 🔑 PEDE A CHAVE SE AINDA NÃO TIVER
    if (!API_KEY_GROQ) {
        const key = prompt(
            '🔑 Cole sua chave da API Groq abaixo:\n\n' +
            '👉 Obtenha gratuitamente em: https://console.groq.com/keys\n\n' +
            '(A chave fica salva só durante esta sessão)'
        );

        if (!key || !key.trim()) {
            showStatus('❌ Chave da API não informada. Operação cancelada.', 'error');
            return;
        }

        API_KEY_GROQ = key.trim();
    }
    const context = document.getElementById('contextInput').value;
    
    if (!context.trim()) {
        showStatus('Por favor, descreva o objeto que deseja criar!', 'error');
        return;
    }

    if (isGenerating) {
        showStatus('Já existe uma geração em andamento. Aguarde!', 'info');
        return;
    }

    isGenerating = true;
    const generateBtn = event.target;
    const originalText = generateBtn.textContent;
    generateBtn.textContent = '⏳ Gerando Alta Resolução...';
    generateBtn.disabled = true;
    
    showStatus('🧠 IA processando geometria complexa...', 'info');

    try {
        // 🔹 PROMPT AJUSTADO: Pede para tentar começar no chão, mas o código garante depois
        const prompt = `Você é um MESTRE ARQUITETO VOXEL especializado em modelagem 3D procedural.

DESCRIÇÃO: ${context}

OBJETIVO: Criar modelo 3D fotorrealista usando geometria voxel avançada.

EXEMPLO DE ESTRUTURA CORRETA:
{
  "voxelSize": 0.5,
  "blocks": [
    {"position": {"x": 0, "y": 0, "z": 0}, "color": "#654321", "type": "cube", "scale": 1},
    {"position": {"x": 0, "y": 1, "z": 0}, "color": "#8B4513", "type": "cylinder", "scale": 0.8}
  ]
}

REGRAS DE OURO:

📐 GEOMETRIA:
1. Use coordenadas decimais (0.5, 0.25) para precisão
2. Centre X e Z em 0. Tente construir Y a partir de 0 (chão).
3. Escala: 0.3 (detalhes) até 2.5 (base)
4. Gere 80-400 blocos (quanto mais complexo, mais blocos)

🎨 DESIGN:
5. Escolha tipos geométricos apropriados (sphere para redondo, cylinder para colunas, etc)
6. Paleta harmônica (3-7 cores que combinem)
7. Estrutura hierárquica: base → corpo → detalhes
8. Blocos devem se tocar/conectar (não flutuar)

🎯 COMPOSIÇÃO:
9. Proporções realistas
10. Simetria quando apropriado
11. Equilíbrio visual
12. Preencha volumes (evite oco)

TIPOS: cube, sphere, cylinder, cone, pyramid, prism, torus, capsule, 
tetrahedron, octahedron, dodecahedron, icosahedron, ring, disc, hemisphere, box

RETORNE APENAS JSON PURO. SEM MARKDOWN. SEM EXPLICAÇÕES.`;

	const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY_GROQ}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // 🚨 MODELO ATUALIZADO
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um motor de renderização JSON estrito. Retorne apenas JSON válido.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5, // 🚨 Um pouquinho mais baixo para o JSON sair mais preciso
                max_tokens: 2048, // 🚨 Reduzido para evitar bloqueio da Groq
                response_format: { type: "json_object" } // 🚨 Força a IA a cuspir apenas JSON (Evita quebras no seu código)
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        showStatus('📦 Construindo malha voxel...', 'info');

        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();

        let jsonText = aiResponse;
        if (jsonText.includes('```')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
        jsonText = jsonText.replace(/,(\s*[\]}])/g, '$1');

        const objectData = JSON.parse(jsonText);

        clearScene();
        
        if (objectData.blocks && Array.isArray(objectData.blocks)) {
            
            // =================================================================
            // 🚜 SISTEMA "AUTO-GROUNDING" (ELEVADOR AUTOMÁTICO)
            // =================================================================
            
            // 1. Encontra o ponto mais baixo (Y Mínimo) de todo o conjunto
            let lowestY = Infinity;

            objectData.blocks.forEach(block => {
                if (block.position) {
                    // Descobre a altura real deste bloco
                    let scaleY = 1;
                    if (block.scale !== undefined) {
                        if (typeof block.scale === 'object') scaleY = block.scale.y || 1;
                        else scaleY = block.scale;
                    } else if (objectData.voxelSize) {
                        scaleY = objectData.voxelSize;
                    }

                    // O "pé" do bloco é: CentroY - (Altura / 2)
                    // (Considerando que as primitivas do Three.js nascem no centro)
                    const blockBottom = block.position.y - (scaleY / 2);
                    
                    if (blockBottom < lowestY) {
                        lowestY = blockBottom;
                    }
                }
            });

            // 2. Calcula quanto precisamos subir para o ponto mais baixo tocar o Y=0
            // Se lowestY for -5, o offset será +5. Se for +2 (voando), offset será -2 (pousar).
            // Adicionamos um pequeno epsilon (0.01) para evitar z-fighting com o grid
            const elevationOffset = -lowestY; // + 0.5 se quiser alinhar ao grid visualmente

            console.log(`📉 Menor Y detectado: ${lowestY}. Aplicando offset de: ${elevationOffset}`);

            // =================================================================

            let processed = 0;

            objectData.blocks.forEach(block => {
                if (block.position && block.color) {
                    
                    let finalScale = 1;
                    if (block.scale !== undefined) {
                        finalScale = block.scale;
                    } else if (objectData.voxelSize) {
                        finalScale = objectData.voxelSize;
                    }

                    addBlockAt(
                        block.position.x,
                        block.position.y + elevationOffset, // 🔥 APLICA A CORREÇÃO DE ALTURA AQUI
                        block.position.z,
                        block.color,
                        block.type || 'cube',
                        finalScale, 
                        block.rotation || {x:0, y:0, z:0}
                    );
                    processed++;
                }
            });
            
            updateJSON();
            showStatus(`✅ Objeto gerado e alinhado ao chão! ${processed} blocos.`, 'success');
        } else {
            throw new Error('Formato JSON inválido ou vazio');
        }

    } catch (error) {
        console.error('Erro ao gerar objeto:', error);
        showStatus(`❌ Erro: ${error.message}. Tente simplificar ou tente novamente.`, 'error');
    } finally {
        isGenerating = false;
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}