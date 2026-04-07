// js/materials.js - VERSÃO INTEGRADA COM TEXTURE GENERATOR

function createProceduralMaterial(baseColor, jsonParams) {
    // 1. Se NÃO tiver JSON (bloco comum), retorna material simples
    if (!jsonParams) {
        return new THREE.MeshPhongMaterial({ 
            color: baseColor,
            shininess: 30 
        });
    }

    // 2. Se TIVER JSON, usa o TextureGenerator
    // Ele vai criar uma textura Canvas idêntica ao software original
    const texture = TextureGenerator.createTexture(jsonParams);

    // Configurações do Material
    const materialConfig = {
        map: texture, // Aplica a textura gerada
        color: 0xffffff, // Branco para não tingir a textura
        shininess: 10
    };

    // Ajustes finos baseados nos efeitos do JSON (Transparência/Luz)
    const effects = jsonParams.effects || [];
    
    // Efeito Cristal/Vidro
    if (effects.includes('crystals')) {
        materialConfig.transparent = true;
        materialConfig.opacity = 0.7;
        materialConfig.shininess = 90;
        materialConfig.side = THREE.DoubleSide;
    }

    // Efeito Glow (Faz o material brilhar no escuro com a textura)
    if (effects.includes('glow')) {
        materialConfig.emissive = 0xffffff;
        materialConfig.emissiveMap = texture; // O brilho segue o desenho da textura
        materialConfig.emissiveIntensity = 0.5;
    }

    return new THREE.MeshPhongMaterial(materialConfig);
}