/* ══════════════════════════════════════════════════════════════════
   VOXEL FORGE — ENGINE PROCEDURAL
   Gera modelos 3D a partir de 'Receitas' estatísticas (JSON)
   ══════════════════════════════════════════════════════════════════ */

// Configuração Three.js
let scene, camera, renderer, mesh, material;
const camState = { r: 60, th: 0.5, ph: 0.8 };
let isDragging = false, prevMouse = { x: 0, y: 0 };

// Estado do Gerador
let recipes = [];
let currentRecipe = null;
let generatedVoxels = [];
const simplex = new SimplexNoise(); // Biblioteca de ruído importada no HTML

// 1. INICIALIZAÇÃO E THREE.JS ---------------------------------------
function init() {
  const cv = document.getElementById('c3d');
  const vp = document.getElementById('viewport');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08080f);
  
  camera = new THREE.PerspectiveCamera(45, vp.clientWidth / vp.clientHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  renderer.setSize(vp.clientWidth, vp.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Luzes para realçar os voxels
  const amb = new THREE.AmbientLight(0x707080, 0.6);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(20, 40, 30);
  scene.add(dir);
  const rim = new THREE.DirectionalLight(0x4040ff, 0.5);
  rim.position.set(-20, 10, -30);
  scene.add(rim);

  scene.add(new THREE.GridHelper(100, 100, 0x1a1a28, 0x0f0f18));

  // Material (Vertex Colors)
  material = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 30, flatShading: true });

  updateCamera();
  animate();

  // Resize
  new ResizeObserver(() => {
    camera.aspect = vp.clientWidth / vp.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(vp.clientWidth, vp.clientHeight);
  }).observe(vp);

  // Controles de Câmera
  cv.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    camState.th -= dx * 0.01;
    camState.ph = Math.max(0.1, Math.min(Math.PI - 0.1, camState.ph - dy * 0.01));
    prevMouse = { x: e.clientX, y: e.clientY };
    updateCamera();
  });
  cv.addEventListener('wheel', e => {
    camState.r = Math.max(5, Math.min(200, camState.r + e.deltaY * 0.1));
    updateCamera();
  });
}

function updateCamera() {
  camera.position.set(
    camState.r * Math.sin(camState.ph) * Math.sin(camState.th),
    camState.r * Math.cos(camState.ph),
    camState.r * Math.sin(camState.ph) * Math.cos(camState.th)
  );
  camera.lookAt(0, 5, 0);
}

function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }


// 2. LÓGICA DE CARREGAMENTO (JSON) ----------------------------------
window.loadRecipes = function(files) {
  const f = files[0];
  if (!f) return;
  
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const json = JSON.parse(e.target.result);
      if (json._type !== 'voxel_recipe_set') throw new Error('Arquivo não é um Recipe Set válido.');
      
      recipes = json.recipes;
      document.getElementById('recipeInfo').innerText = `📦 ${json.recipes.length} receitas carregadas`;
      
      // Popula Select
      const sel = document.getElementById('recipeSel');
      sel.innerHTML = recipes.map((r, i) => `<option value="${i}">${r.name} (★${r.rating})</option>`).join('');
      
      document.getElementById('classCard').style.display = 'block';
      document.getElementById('genBtn').disabled = false;
      window.selectRecipe();
      
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };
  reader.readAsText(f);
};

window.selectRecipe = function() {
  const idx = document.getElementById('recipeSel').value;
  currentRecipe = recipes[idx];
  console.log('Receita selecionada:', currentRecipe.name);
};


// 3. O CORAÇÃO: GERADOR PROCEDURAL ----------------------------------
window.generate = function() {
  if (!currentRecipe) return;

  const R = currentRecipe;
  const struct = R.structure;
  
  // Parâmetros da UI
  let seedStr = document.getElementById('seedIn').value;
  if(seedStr === 'random') seedStr = Math.random().toString();
  const seed = seedStr.split('').reduce((a,b)=>a+b.charCodeAt(0),0); // Hash simples
  
  const chaos = parseFloat(document.getElementById('chaosLvl').value);
  const colorVar = parseFloat(document.getElementById('colorVar').value) / 100;
  const scaleG = parseFloat(document.getElementById('scaleG').value);

  generatedVoxels = []; // Limpa anterior
  
  // Dimensões originais
  const W = struct.silhouette.w;
  const H = struct.silhouette.h;
  const mask = struct.silhouette.mask;
  const depthData = struct.depthProfile.data;

  // Paleta acumulada para seleção ponderada
  const palette = struct.palette; // [{hex, weight}, ...]
  
  // Loop procedural (X, Y -> Z)
  // Usamos noise 2D para variar a altura
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      
      // Se não existir na silhueta original, ignora
      if (mask[i] === 0) continue; 

      // Altura base (média aprendida)
      let zBase = depthData[i];
      if (zBase <= 0) continue; // Pode acontecer de ter máscara mas profundidade 0

      // Aplica variação orgânica na altura
      // Simplex Noise (x, y) + seed
      const noiseVal = simplex.noise3D(x * 0.1, y * 0.1, seed * 0.01); 
      // Variação permitida pelo modelo + Fator Caos da UI
      const variation = (R.variation.noiseLevel || 0.1) * chaos * 5; 
      
      let finalHeight = Math.max(1, Math.round(zBase + (noiseVal * zBase * variation)));

      // Gera a coluna de voxels
      for (let z = 0; z < finalHeight; z++) {
        // Escolhe cor da paleta
        const baseColorHex = pickColor(palette);
        const color = applyColorVar(baseColorHex, colorVar, z, finalHeight);

        generatedVoxels.push({
          x: (x - W/2) * scaleG,
          y: z * scaleG, // Z no mundo 3D é Y (up)
          z: (y - H/2) * scaleG,
          r: color.r, g: color.g, b: color.b
        });
      }
    }
  }

  rebuildMesh(generatedVoxels, scaleG);
  
  document.getElementById('genStats').innerText = `✅ Gerado: ${generatedVoxels.length} blocos`;
  document.getElementById('expBtn').disabled = false;
};

// Utilitários de Cor e Lógica
function pickColor(palette) {
  // Roleta russa ponderada
  const rand = Math.random();
  let sum = 0;
  for (let c of palette) {
    sum += c.weight;
    if (rand <= sum) return c.hex;
  }
  return palette[palette.length-1].hex;
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function applyColorVar(hex, amount, z, height) {
  const rgb = hexToRgb(hex);
  
  // 1. Variação aleatória (Noise)
  const rnd = (Math.random() - 0.5) * 255 * amount;
  
  // 2. Oclusão simples (mais escuro em baixo)
  const occ = (z / height) * 0.2 + 0.8; // 0.8 a 1.0

  return {
    r: Math.min(255, Math.max(0, (rgb.r + rnd) * occ)),
    g: Math.min(255, Math.max(0, (rgb.g + rnd) * occ)),
    b: Math.min(255, Math.max(0, (rgb.b + rnd) * occ))
  };
}

// 4. RENDERIZAÇÃO ---------------------------------------------------
// Vértices do Cubo (CUBE36) simplificado para reconstrução
const CUBE_F = [
  // Apenas normais para iluminação flat (simplificado)
  [0,0,1], [0,0,-1], [0,1,0], [0,-1,0], [1,0,0], [-1,0,0]
];

function rebuildMesh(voxels, scale) {
  if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); }
  
  const geo = new THREE.BoxGeometry(scale, scale, scale);
  // InstancedMesh é MUITO mais rápido para muitos cubos iguais
  mesh = new THREE.InstancedMesh(geo, material, voxels.length);
  
  const dummy = new THREE.Object3D();
  
  for (let i = 0; i < voxels.length; i++) {
    const v = voxels[i];
    dummy.position.set(v.x, v.y, v.z);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, new THREE.Color(`rgb(${Math.floor(v.r)},${Math.floor(v.g)},${Math.floor(v.b)})`));
  }
  
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);
}

// 5. EXPORTAR -------------------------------------------------------
window.exportOBJ = function() {
  if (!generatedVoxels.length) return;
  const json = JSON.stringify({
    blocks: generatedVoxels.map(v => ({
      position: { x: v.x, y: v.y, z: v.z },
      color: '#' + ((1 << 24) + (Math.floor(v.r) << 16) + (Math.floor(v.g) << 8) + Math.floor(v.b)).toString(16).slice(1),
      type: 'cube',
      scale: { x: 1, y: 1, z: 1 } // Escala normalizada
    })),
    _meta: { generator: 'Voxel Forge v1.0' }
  });
  
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Generated_${Date.now()}.json`;
  a.click();
};

// Evento do Input File
document.getElementById('recipeInput').addEventListener('change', e => window.loadRecipes(e.target.files));

// Init
init();