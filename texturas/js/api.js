// texturas/js/api.js - Gerador de Texturas via IA


let API_KEY_GROQ = localStorage.getItem('groq_api_key') || null; 
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

let isGeneratingAI = false;
// ====================================================================
// 🎨 FUNÇÃO PRINCIPAL: Gera Textura via Prompt Natural
// ====================================================================
export async function generateTextureFromAI(userPrompt, currentPresets, applyRecipeCallback, validateCallback) {
    
    // 🔑 PEDE A CHAVE SE NÃO TIVER
	if (!API_KEY_GROQ) {
		const key = prompt(
			'🔑 Cole sua chave da API Groq:\n\n' +
			'👉 Grátis em: https://console.groq.com/keys\n\n' +
			'(Será salva no navegador para as próximas sessões)'
		);
		if (!key?.trim()) {
			// CORRIGIDO: usa 'message' em vez de 'error'
			return { success: false, message: 'Chave não informada. Operação cancelada.' };
		}
		API_KEY_GROQ = key.trim();
		localStorage.setItem('groq_api_key', API_KEY_GROQ);
	}

	if (!userPrompt.trim()) {
		// CORRIGIDO: usa 'message' em vez de 'error'
		return { success: false, message: 'Por favor, descreva a textura desejada!' };
	}

    if (isGeneratingAI) {
        return { success: false, error: 'Já existe uma geração em andamento!' };
    }

    isGeneratingAI = true;

    try {
        // ====================================================================
        // 📝 PROMPT ENGINEERING PARA TEXTURAS
        // ====================================================================
        const systemPrompt = `Você é um ESPECIALISTA em texturas procedurais e design de materiais.

TEXTURAS DISPONÍVEIS:
${currentPresets.map(p => `- ${p.id}: ${p.name} ${p.emoji}`).join('\n')}

MODOS DE BLEND:
- add (adição)
- multiply (multiplicar cores)
- screen (clarear)
- overlay (contraste alto)
- difference (inversão)
- noise (ruído aleatório)

MODOS DE COR:
- gradient (suave)
- noise (colorido aleatório)
- bands (listras)
- spots (manchas)
- rainbow (arco-íris)

EFEITOS ESPECIAIS:
depth, glow, cracks, waves, cells, crystals, fibers, sparks, vignette

REGRAS DE OURO:
1. Escolha 2 texturas que combinem semanticamente
2. Gere paleta de 4 cores harmônicas em hexadecimal
3. Ajuste parâmetros para realismo (scale, contrast, noiseAmount)
4. Evite saturação: blendAmount moderado (0.3-0.7)
5. Use efeitos com parcimônia (máximo 2-3)

RETORNE APENAS JSON PURO. SEM MARKDOWN. SEM EXPLICAÇÕES.`;

        const userMessage = `DESCRIÇÃO: ${userPrompt}

EXEMPLO DE ESTRUTURA CORRETA:
{
  "textures": {
    "primary": "stone",
    "secondary": "noise",
    "blend": {
      "mode": "multiply",
      "amount": 0.5
    }
  },
  "colors": ["#654321", "#8B7355", "#A0826D", "#C19A6B"],
  "colorMode": "gradient",
  "parameters": {
    "seed": 42857,
    "scale": 35,
    "noiseAmount": 0.4,
    "octaves": 4,
    "contrast": 1.8,
    "distortion": 0.3
  },
  "effects": ["depth", "cracks"],
  "renderMode": "texture",
  "tiling": false
}

Gere uma receita de textura que represente: "${userPrompt}"`;

        // ====================================================================
        // 🌐 CHAMADA À API GROQ (CORRIGIDA)
        // ====================================================================
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 🚨 CORRIGIDO: Agora o nome da variável bate com o lá de cima
                'Authorization': `Bearer ${API_KEY_GROQ}` 
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7, 
                max_tokens: 1500,
                // 🚨 ADICIONADO: A trava mágica que força a IA a cuspir só JSON
                response_format: { type: "json_object" } 
            })
        });
		
	if (!response.ok) {
		const errorText = await response.text();
		
		// 🔑 Se for 401 (chave inválida/expirada), limpa e força nova entrada
		if (response.status === 401) {
			API_KEY_GROQ = null;
			localStorage.removeItem('groq_api_key');
			throw new Error('Chave da API inválida ou expirada. Recarregue a página para inserir uma nova chave.');
		}
		
		throw new Error(`API Error ${response.status}: ${errorText}`);
	}

        const data = await response.json();
        let aiResponse = data.choices[0].message.content.trim();

        // ====================================================================
        // 🧹 LIMPEZA DO JSON (Remove markdown se vier)
        // ====================================================================

        const textureRecipe = JSON.parse(aiResponse);

        // ====================================================================
        // 🛡️ VALIDAÇÃO E GUARDIÃO DE QUALIDADE
        // ====================================================================
        let attempts = 0;
        const maxAttempts = 5;
        let variance = 0;
        let isValid = false;

        while (!isValid && attempts < maxAttempts) {
            attempts++;

            // Aplica a receita (callback que chama generateTexture)
            variance = applyRecipeCallback(textureRecipe);

            // Valida com o Guardião
            if (textureRecipe.renderMode === 'solid') {
                isValid = true; // Sólido sempre aceita
            } else {
                if (variance > 5) {
                    isValid = true;
                } else {
                    // Ajusta automaticamente se saturou
                    textureRecipe.parameters.blendAmount *= 0.8; // Reduz blend
                    textureRecipe.parameters.contrast *= 1.1; // Aumenta contraste
                    textureRecipe.parameters.noiseAmount += 0.1; // Mais ruído
                    console.warn(`🔄 Tentativa ${attempts}: Saturação detectada. Ajustando...`);
                }
            }
        }

        return {
            success: isValid,
            recipe: textureRecipe,
            variance: variance,
            attempts: attempts,
            message: isValid 
                ? `✅ Textura gerada com sucesso (${attempts} tentativa${attempts > 1 ? 's' : ''})!`
                : `⚠️ Textura muito saturada após ${maxAttempts} tentativas. Tente outro prompt.`
        };

    } catch (error) {
        console.error('❌ Erro na geração via IA:', error);
        return {
            success: false,
            error: error.message,
            message: `Erro: ${error.message}`
        };
    } finally {
        isGeneratingAI = false;
    }
}

// ====================================================================
// 🎲 FUNÇÃO AUXILIAR: Gera Seed Aleatória
// ====================================================================
export function generateRandomSeed() {
    return Math.floor(Math.random() * 9999999) + 1;
}

// ====================================================================
// 🎨 FUNÇÃO AUXILIAR: Valida Cores Hexadecimais
// ====================================================================
export function validateHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}

// ====================================================================
// 📋 FUNÇÃO AUXILIAR: Cria Prompt Sugestivo Baseado em Categoria
// ====================================================================
export function getSuggestedPrompts() {
    return {
        "Naturais": [
            "textura de pedra vulcânica porosa",
            "madeira de carvalho envelhecido",
            "areia de praia dourada",
            "mármore branco com veios cinza",
            "lava incandescente"
        ],
        "Tecidos": [
            "couro marrom desgastado",
            "denim azul jeans usado",
            "veludo vermelho luxuoso",
            "linho bege natural",
            "seda iridescente"
        ],
        "Abstratas": [
            "nebulosa espacial roxa e azul",
            "circuitos eletrônicos neon",
            "cristais holográficos",
            "energia plasma verde",
            "ondas sonoras coloridas"
        ],
        "Industriais": [
            "metal oxidado enferrujado",
            "concreto rachado urbano",
            "aço escovado polido",
            "tijolo vermelho antigo",
            "asfalto com marcas de pneu"
        ],
        "Orgânicas": [
            "casca de árvore com musgo",
            "escamas de peixe iridescentes",
            "pele de cobra verde",
            "coral submarino rosa",
            "fungo bioluminescente"
        ]
    };
}
