import { AppState } from './state.js';
import { updateColors } from './utils/colors.js';
import { getMockData, fetchGeminiData } from './utils/api.js';
import { renderCarousel } from './modules/render.js';
import { initEditorEvents } from './modules/editor.js';
import { initDragAndDropEvents } from './modules/dragDrop.js';
import { downloadCarousel } from './modules/export.js';

// Inicializa Eventos Globales
initEditorEvents();
initDragAndDropEvents();

// ==========================================
// CANVAS ENGINE: INFINITE PAN & ZOOM
// ==========================================
const workspace = document.getElementById('workspace');
const canvasPlane = document.getElementById('canvasPlane');
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let isSpacePressed = false;

document.body.setAttribute('data-tool', AppState.currentTool);

function applyCanvasTransform() {
    canvasPlane.style.transform = `translate(${AppState.canvasX}px, ${AppState.canvasY}px) scale(${AppState.canvasScale})`;
    document.getElementById('zoomLevel').innerText = Math.round(AppState.canvasScale * 100) + '%';
}

// Inicializa o canvas
applyCanvasTransform();

// Gerenciamento de Ferramentas (Pointer vs Hand)
document.querySelectorAll('.figma-toolbar .tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.figma-toolbar .tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.currentTool = btn.dataset.tool;
        document.body.setAttribute('data-tool', AppState.currentTool);
        
        if (AppState.currentTool === 'hand') workspace.style.cursor = 'grab';
        else workspace.style.cursor = 'default';
    });
});

// Tecla Espaço para virar a "Mãozinha" temporariamente (Figma/Photoshop)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && !document.activeElement.isContentEditable) {
        e.preventDefault();
        isSpacePressed = true;
        workspace.style.cursor = 'grab';
    }
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        isSpacePressed = false;
        if (AppState.currentTool !== 'hand') workspace.style.cursor = 'default';
    }
});

// Lógica de PAN (Arrastar o Canvas)
workspace.addEventListener('mousedown', (e) => {
    if (e.button === 1 || isSpacePressed || AppState.currentTool === 'hand') { // Botão do meio ou Hand Tool
        e.preventDefault();
        isPanning = true;
        panStartX = e.clientX - AppState.canvasX;
        panStartY = e.clientY - AppState.canvasY;
        workspace.classList.add('panning');
    }
});

window.addEventListener('mousemove', (e) => {
    if (isPanning) {
        AppState.canvasX = e.clientX - panStartX;
        AppState.canvasY = e.clientY - panStartY;
        applyCanvasTransform();
    }
});

window.addEventListener('mouseup', () => {
    if (isPanning) {
        isPanning = false;
        workspace.classList.remove('panning');
    }
});

// Lógica de ZOOM (Ctrl + Scroll ou Scroll normal na Touchpad)
workspace.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomSensitivity = 0.002;
        const delta = -e.deltaY * zoomSensitivity;
        let newScale = AppState.canvasScale * (1 + delta);
        
        // Limites de zoom (10% a 400%)
        newScale = Math.max(0.1, Math.min(newScale, 4));

        // Magia para dar Zoom em direção ao cursor do mouse
        const rect = workspace.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calcula o deslocamento necessário
        AppState.canvasX = mouseX - (mouseX - AppState.canvasX) * (newScale / AppState.canvasScale);
        AppState.canvasY = mouseY - (mouseY - AppState.canvasY) * (newScale / AppState.canvasScale);
        
        AppState.canvasScale = newScale;
        applyCanvasTransform();
    }
}, { passive: false });

// Botões de Zoom UI
document.getElementById('btnZoomIn').addEventListener('click', () => { AppState.canvasScale = Math.min(4, AppState.canvasScale + 0.1); applyCanvasTransform(); });
document.getElementById('btnZoomOut').addEventListener('click', () => { AppState.canvasScale = Math.max(0.1, AppState.canvasScale - 0.1); applyCanvasTransform(); });


// ==========================================
// RESTANTE DO CÓDIGO (Gerar, Tema, Cores)
// ==========================================
document.getElementById('templateSelect').addEventListener('change', (e) => {
    const val = e.target.value;
    const defaultColors = {
        'layout-tech': { bg: '#081225', brand: '#ea580c', text: '#ffffff' },
        'layout-corp': { bg: '#18181b', brand: '#ea580c', text: '#ffffff' },
        'layout-minimal': { bg: '#ffffff', brand: '#000000', text: '#111111' },
        'layout-neon': { bg: '#09090b', brand: '#ec4899', text: '#ffffff' },
        'layout-editorial': { bg: '#f4f0ec', brand: '#8b4513', text: '#222222' },
        'layout-glass': { bg: '#0f172a', brand: '#3b82f6', text: '#ffffff' },
        'layout-bold': { bg: '#fbbf24', brand: '#000000', text: '#000000' }
    };
    if (defaultColors[val]) {
        updateColors(defaultColors[val].bg, defaultColors[val].brand, defaultColors[val].text);
    }
});

document.getElementById('brandColor').addEventListener('input', (e) => updateColors(document.getElementById('bgColor').value, e.target.value, document.getElementById('textColor').value));
document.getElementById('bgColor').addEventListener('input', (e) => updateColors(e.target.value, document.getElementById('brandColor').value, document.getElementById('textColor').value));
document.getElementById('textColor').addEventListener('input', (e) => updateColors(document.getElementById('bgColor').value, document.getElementById('brandColor').value, e.target.value));

document.getElementById('btnGenerate').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const themeStr = document.getElementById('themeInput').value.trim();
    const template = document.getElementById('templateSelect').value;
    const btn = document.getElementById('btnGenerate');

    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Gerando...';
    btn.disabled = true;
    window.lucide.createIcons();

    try {
        if (!apiKey) {
            const data = getMockData(template, themeStr);
            renderCarousel(data, template);
        } else {
            const aiData = await fetchGeminiData(themeStr, template, apiKey);
            if (aiData) renderCarousel(aiData, template);
            else alert("Erro na geração. Verifique a API Key ou aguarde alguns minutos e tente novamente.");
        }
    } catch (error) {
        console.error("Erro no processo de geração:", error);
        alert("Ocorreu um erro inesperado ao gerar o carrossel.");
    } finally {
        // O finally garante que independente do que acontecer (erro ou sucesso), o botão volta ao normal
        btn.innerHTML = 'Gerar';
        btn.disabled = false;
        window.lucide.createIcons();
    }
});

document.getElementById('btnDownload').addEventListener('click', downloadCarousel);