import { updateColors } from './utils/colors.js';
import { getMockData, fetchGeminiData } from './utils/api.js';
import { renderCarousel } from './modules/render.js';
import { initEditorEvents } from './modules/editor.js';
import { initDragAndDropEvents } from './modules/dragDrop.js';
import { downloadCarousel } from './modules/export.js';


// Inicializa Eventos Globales (Context Menu, Drag e etc)
initEditorEvents();
initDragAndDropEvents();

// Template Presets de Cor
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

// Sync de Cores Manual
document.getElementById('brandColor').addEventListener('input', (e) => updateColors(document.getElementById('bgColor').value, e.target.value, document.getElementById('textColor').value));
document.getElementById('bgColor').addEventListener('input', (e) => updateColors(e.target.value, document.getElementById('brandColor').value, document.getElementById('textColor').value));
document.getElementById('textColor').addEventListener('input', (e) => updateColors(document.getElementById('bgColor').value, document.getElementById('brandColor').value, e.target.value));

// Botão Gerar
document.getElementById('btnGenerate').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const themeStr = document.getElementById('themeInput').value.trim();
    const template = document.getElementById('templateSelect').value;
    const btn = document.getElementById('btnGenerate');

    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Gerando...';
    btn.disabled = true;
    window.lucide.createIcons();

    if (!apiKey) {
        const data = getMockData(template, themeStr);
        renderCarousel(data, template);
    } else {
        const aiData = await fetchGeminiData(themeStr, template, apiKey);
        if (aiData) renderCarousel(aiData, template);
        else alert("Erro na geração. Tente outro tema ou verifique a API Key.");
    }

    btn.innerHTML = 'Gerar Carrossel';
    btn.disabled = false;
});

// Botão Baixar
document.getElementById('btnDownload').addEventListener('click', downloadCarousel);