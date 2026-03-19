import { AppState } from './state.js';
import { updateColors } from './utils/colors.js';
import { getMockData, fetchGeminiData } from './utils/api.js';
import { renderCarousel } from './modules/render.js';
import { initEditorEvents } from './modules/editor.js';
import { initDragAndDropEvents } from './modules/dragDrop.js';
import { downloadCarousel } from './modules/export.js';

const urlParams = new URLSearchParams(window.location.search);
const startupId = urlParams.get('startupId');
const themeParam = urlParams.get('theme'); 

if (themeParam) {
    document.getElementById('themeInput').value = decodeURIComponent(themeParam);
}

if (startupId) {
    const profiles = JSON.parse(localStorage.getItem('propositum_profiles')) ||[];
    const activeProfile = profiles.find(p => p.id === startupId);

    if (activeProfile) {
        // 1. Salva no estado global
        AppState.activeProfile = activeProfile;
        AppState.customLogoUrl = activeProfile.logoBase64 || null;

        // 2. Atualiza a Interface do Editor com os dados dela
        document.getElementById('websiteInput').value = activeProfile.website || '';
        document.getElementById('templateSelect').value = activeProfile.defaultTemplate || 'layout-tech';
        
        // 3. Aplica as Cores Exatas da Marca
        updateColors(
            activeProfile.bgColor || '#000000', 
            activeProfile.brandColor || '#ffffff', 
            activeProfile.textColor || '#ffffff'
        );

        // 4. Marca o botão de logo como OK (se houver logo)
        if (activeProfile.logoBase64) {
            document.getElementById('btnLogoUpload').innerHTML = '<i data-lucide="check" style="color:var(--brand-color);"></i>';
        }
    }
}

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
    const apiKey = localStorage.getItem('propositum_api_key') || '';
    const themeStr = document.getElementById('themeInput').value.trim();
    const template = document.getElementById('templateSelect').value;
    const btn = document.getElementById('btnGenerate');

    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Gerando...';
    btn.disabled = true;
    window.lucide.createIcons();

    try {
        if (!apiKey || themeStr === '') {
            
            const data = getMockData(template, themeStr);
            renderCarousel(data, template, data.image_category || "office");
            
            if(themeStr === '' && apiKey) {
                console.log("Nenhum tema definido. Carrossel gerado com texto de marcação.");
            }

        } else {
            // Só chama a IA de verdade se tiver Tema + API Key
            const aiData = await fetchGeminiData(themeStr, template, apiKey, AppState.activeProfile);
            if (aiData) {
                const category = aiData.image_category || "office";
                renderCarousel(aiData, template, category);
            } else {
                alert("Erro na geração. Verifique a API Key ou aguarde alguns minutos e tente novamente.");
            }
        }
    } catch (error) {
        console.error("Erro no processo de geração:", error);
        alert("Ocorreu um erro inesperado ao gerar o carrossel.");
    } finally {
        btn.innerHTML = 'Gerar IA';
        btn.disabled = false;
        window.lucide.createIcons();
    }
});

document.getElementById('btnDownload').addEventListener('click', downloadCarousel);

// ==========================================
// SISTEMA DE RASCUNHOS (SAVE & LOAD)
// ==========================================

// Variáveis para saber se estamos editando um rascunho existente
const draftIdParam = urlParams.get('draftId');
let currentDraftId = draftIdParam || null;

// Lógica para Salvar Rascunho
document.getElementById('btnSaveDraft').addEventListener('click', async () => {
    if (!AppState.activeProfile) {
        alert("Erro: Nenhuma marca selecionada.");
        return;
    }

    const btn = document.getElementById('btnSaveDraft');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Salvando...';

    // Pega o HTML do container inteiro de slides
    const containerHTML = document.getElementById('carouselContainer').innerHTML;

    // Tenta gerar um thumbnail (foto) do primeiro slide usando a biblioteca html-to-image
    let previewBase64 = null;
    const firstSlide = document.querySelector('.slide');
    if (firstSlide) {
        try {
            // Tira print rápido em qualidade baixa só para a vitrine
            previewBase64 = await window.htmlToImage.toPng(firstSlide, { pixelRatio: 0.2, quality: 0.5 }); 
        } catch (e) {
            console.log("Erro ao gerar capa, salvando sem capa.", e);
        }
    }

    // Tenta pegar o título do H1 do primeiro slide para nomear o rascunho
    const firstH1 = document.querySelector('.slide h1');
    const draftTitle = firstH1 ? firstH1.innerText : 'Carrossel ' + new Date().toLocaleTimeString();

    // Cria o Objeto do Rascunho
    const draftData = {
        id: currentDraftId || 'draft_' + Date.now(),
        entityId: AppState.activeProfile.id,
        title: draftTitle,
        htmlContent: containerHTML,
        previewImg: previewBase64,
        lastEdited: new Date().toISOString(),
        status: "Rascunho"
    };

    // Puxa o banco de rascunhos
    let drafts = JSON.parse(localStorage.getItem('propositum_drafts')) ||[];

    if (currentDraftId) {
        // Atualiza o existente
        const index = drafts.findIndex(d => d.id === currentDraftId);
        if (index > -1) drafts[index] = draftData;
        else drafts.push(draftData);
    } else {
        // Cria um novo
        drafts.push(draftData);
        currentDraftId = draftData.id; // Atualiza o ID atual
        // Atualiza a URL discretamente para o usuário continuar editando
        window.history.replaceState({}, '', `editor.html?startupId=${AppState.activeProfile.id}&draftId=${currentDraftId}`);
    }

    localStorage.setItem('propositum_drafts', JSON.stringify(drafts));

    // Feedback visual
    btn.innerHTML = '<i data-lucide="check"></i> Salvo!';
    setTimeout(() => { btn.innerHTML = originalText; lucide.createIcons(); }, 2000);
});

// Lógica para CARREGAR Rascunho (Quando abre a página)
if (draftIdParam) {
    const drafts = JSON.parse(localStorage.getItem('propositum_drafts')) ||[];
    const loadedDraft = drafts.find(d => d.id === draftIdParam);

    if (loadedDraft) {
        // Injeta o HTML salvo de volta na tela
        document.getElementById('carouselContainer').innerHTML = loadedDraft.htmlContent;
        
        //Força os botões a aparecerem em Rascunhos Antigos
        document.querySelectorAll('.slide-wrapper').forEach(wrapper => {
            if (!wrapper.querySelector('.slide-controls')) {
                const controlsDiv = document.createElement('div');
                controlsDiv.className = 'slide-controls';
                controlsDiv.innerHTML = `
                    <button class="btn-slide-control" data-action="duplicate" title="Duplicar Slide"><i data-lucide="copy"></i></button>
                    <button class="btn-slide-control" data-action="add" title="Adicionar Slide Vazio"><i data-lucide="plus"></i></button>
                    <button class="btn-slide-control delete" data-action="remove" title="Remover Slide"><i data-lucide="trash-2"></i></button>
                `;

                wrapper.appendChild(controlsDiv);
            }
        });
        window.lucide.createIcons(); 
        
        // Ativa o botão de exportar
        document.getElementById('btnDownload').style.display = 'flex';
        
        // Restaura o state history com o HTML ATUALIZADO (com os botões) para o Undo/Redo não quebrar
        AppState.history = [document.getElementById('carouselContainer').innerHTML];
        AppState.historyIndex = 0;
        
        console.log("Rascunho carregado e atualizado com sucesso!");
    }
}

// ==========================================
// AUTO-GERAÇÃO (Quando vem da tela de Pautas)
// ==========================================
if (themeParam && !draftIdParam) {
    // Aguarda meio segundo para a UI estabilizar e dispara a IA automaticamente
    setTimeout(() => {
        const btnGenerate = document.getElementById('btnGenerate');
        if (btnGenerate) btnGenerate.click();
    }, 600);
}