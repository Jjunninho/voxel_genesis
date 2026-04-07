// Configuração da API
// js/config.js

// DEPOIS (substitui por isso):
let API_KEY_GROQ = null;

const LOCAL_API_URL = '#';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
window.customBrushScale = null;


// Variáveis globais do Estado (State)
let controls; // Adicione isso nas variáveis globais
let scene, camera, renderer, raycaster, mouse;
let gridHelper, axesHelper;
let blocks = [];
let currentTool = 'add';
let currentColor = '#ff6b6b';
let currentBrushShape = 'cube';
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let isGenerating = false;
let currentShape = null;
let currentParams = {};
let isObjectSelected = false; 
let currentRotation = { x: 0, y: 0, z: 0 }; // CORRIGIDO: Adicionado estado de rotação
let transformControl;


// Sistema de preview e redimensionamento
let previewMesh = null;
let isPreviewMode = false;
let currentBrushSize = 1;
let previewPosition = { x: 0, y: 0, z: 0 };


let selectedBlock = null; // Bloco atualmente selecionado
let selectionOutline = null; // Mesh de outline visual
let clipboardBlock = null; // Para copiar/colar
let transformMode = 'move'; // 'move' | 'rotate' | 'scale'
// NOVO Sistema de preview e redimensionamento
let isDynamicDrawing = false;
let drawStartPos = new THREE.Vector3();
let dynamicScale = 1;
let dynamicRotation = 0;
// NOVO Sistema de preview e redimensionamento 2
// Variáveis para Arraste Livre (Select + Move)
let isDraggingBlock = false;
let dragPlane = new THREE.Plane();
let dragOffset = new THREE.Vector3();
let intersectionPoint = new THREE.Vector3();
let manualGridStep = null; // null = Modo Automático (Adaptativo)

// Mude ou adicione:
let selectedBlocks = []; // Agora é um array!
let selectionBox = { startX: 0, startY: 0 }; // Para guardar onde o clique começou
let isBoxSelecting = false;
// NOVAS VARIÁVEIS PARA O SISTEMA DE CORES
let customColors = []; // Array para guardar cores salvas
let currentTextureParams = null; // Para guardar o JSON importado
let selectionGroup = null; // Grupo temporário para multi-seleção
// ... (outras variáveis)
let undoStack = []; 
let redoStack = []; // <--- ADICIONE ISSO AQUI

// Mapeamento de ícones e nomes para cada forma
const BRUSH_DEFINITIONS = {
    cube: { icon: '⬛', name: 'Cubo' },
    sphere: { icon: '⚪', name: 'Esfera' },
    cylinder: { icon: '🛢️', name: 'Cilindro' },
    cone: { icon: '🔺', name: 'Cone' },
    pyramid: { icon: '🔺', name: 'Pirâmide' },
    prism: { icon: '🔶', name: 'Prisma' },
    torus: { icon: '🍩', name: 'Toro' },
    capsule: { icon: '💊', name: 'Cápsula' },
    tetrahedron: { icon: '▲', name: 'Tetraedro' },
    octahedron: { icon: '◆', name: 'Octaedro' },
    dodecahedron: { icon: '⬟', name: 'Dodecaedro' },
    icosahedron: { icon: '◈', name: 'Icosaedro' },
    ring: { icon: '⭕', name: 'Anel' },
    disc: { icon: '⚫', name: 'Disco' },
    hemisphere: { icon: '🌓', name: 'Hemisfério' },
    box: { icon: '📦', name: 'Caixa' }
};

// Cores padrão (Starter Palette)
const DEFAULT_PALETTE = [
    '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f43', '#5f27cd', 
    '#54a0ff', '#00d2d3', '#1dd1a1', '#2e86de', '#8395a7',
    '#222f3e', '#ffffff'
];

