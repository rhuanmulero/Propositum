import { AppState } from '../state.js';
import { saveState, undo, redo } from './history.js';

let cropperInstance = null;
let selectionBox = null;
let isResizing = false;
let resizeDir = '';
let startW = 0, startH = 0, startX = 0, startY = 0, startLeft = 0, startTop = 0;

function createSelectionBox() {
    selectionBox = document.createElement('div');
    selectionBox.className = 'selection-box';
    selectionBox.style.display = 'none';
    
    const handles =['tl', 'tr', 'bl', 'br'];
    handles.forEach(dir => {
        const h = document.createElement('div');
        h.className = `resize-handle ${dir}`;
        h.dataset.dir = dir;
        selectionBox.appendChild(h);
    });
}

export function updateSelectionBox() {
    if (!AppState.selectedElement || !selectionBox) {
        if (selectionBox) selectionBox.style.display = 'none';
        return;
    }
    const el = AppState.selectedElement;
    const slide = el.closest('.slide');
    if (!slide) {
        selectionBox.style.display = 'none';
        return;
    }

    if (selectionBox.parentNode !== slide) slide.appendChild(selectionBox);

    const elRect = el.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    
    // A escala é global no canvasPlane. Então a caixa interna usa tamanho real!
    // Apenas dividimos pelo scale global para converter coordenadas da tela para o canvas.
    const left = (elRect.left - slideRect.left) / AppState.canvasScale;
    const top = (elRect.top - slideRect.top) / AppState.canvasScale;
    const width = elRect.width / AppState.canvasScale;
    const height = elRect.height / AppState.canvasScale;

    selectionBox.style.display = 'block';
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
}

export function selectElement(el) {
    if (AppState.currentTool !== 'pointer') return; // Só seleciona se for seta
    AppState.selectedElement = el;
    updateSelectionBox();
}

export function deselectElement() {
    AppState.selectedElement = null;
    updateSelectionBox();
}

export function deleteSelectedElement() {
    if (AppState.selectedElement) {
        AppState.selectedElement.remove();
        deselectElement();
        document.getElementById('elementToolbar').style.display = 'none';
        saveState();
    }
}

function addElementToActiveSlide(htmlStr) {
    // Muda ferramenta para pointer
    document.querySelector('.figma-toolbar .tool-btn[data-tool="pointer"]').click();

    let slide = AppState.activeSlide;
    if (!slide) {
        const firstWrap = document.querySelector('.slide-wrapper');
        if (firstWrap) {
            firstWrap.classList.add('active');
            slide = firstWrap.querySelector('.slide');
            AppState.activeSlide = slide;
        }
    }
    if (!slide) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlStr;
    const el = wrapper.firstElementChild;
    
    slide.appendChild(el);
    
    // Tamanho real
    el.style.left = '400px'; 
    el.style.top = '500px';
    el.style.zIndex = '100';
    
    selectElement(el);
    saveState();
}

function initResize(e, dir) {
    isResizing = true;
    resizeDir = dir;
    startX = e.clientX;
    startY = e.clientY;
    
    const el = AppState.selectedElement;
    const rect = el.getBoundingClientRect();
    startW = rect.width / AppState.canvasScale;
    startH = rect.height / AppState.canvasScale;
    
    startLeft = parseFloat(el.style.left) || 0;
    startTop = parseFloat(el.style.top) || 0;
    
    if (window.getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
    }
    
    e.preventDefault();
    e.stopPropagation();
}

export function initEditorEvents() {
    createSelectionBox();

    // Salvar estado ao sair de elementos de texto (edição concluída)
    document.addEventListener('focusout', (e) => {
        if (e.target.isContentEditable) {
            saveState();
        }
    });

    document.addEventListener('mousedown', (e) => {
        // Ignora cliques fora de interações
        if (e.button !== 0 || AppState.currentTool === 'hand' || e.target.closest('.canvas-plane') === null && e.target.closest('.selection-box') === null) {
            return; 
        }

        const handle = e.target.closest('.resize-handle');
        if (handle) {
            initResize(e, handle.dataset.dir);
            return;
        }

        // AGORA RECONHECE FUNDOS E ELEMENTOS ARRASTÁVEIS
        const selectable = e.target.closest('.draggable, .editable-img');
        
        if (selectable) {
            if (!e.target.closest('#btnToolbarMove')) {
                selectElement(selectable);
                
                // Mostrar barra de ferramentas flutuante
                const toolbar = document.getElementById('elementToolbar');
                toolbar.style.display = 'flex';
                const rect = selectable.getBoundingClientRect();
                
                // Calcula a posição no centro do elemento
                let tLeft = rect.left + (rect.width / 2);
                let tTop = rect.top - 60; // Fica acima do elemento
                
                // Se a barra for sumir lá pra cima (ex: imagem de fundo), joga ela um pouco pra baixo
                if (tTop < 10) tTop = rect.top + 20;

                toolbar.style.left = tLeft + 'px';
                toolbar.style.top = tTop + 'px';

                // Verifica se é ou contém imagem para mostrar botão de troca
                const btnChange = document.getElementById('btnToolbarChange');
                const divChange = document.getElementById('divImageChange');
                if (selectable.classList.contains('editable-img') || selectable.querySelector('.editable-img')) {
                    btnChange.style.display = 'flex';
                    divChange.style.display = 'block';
                    AppState.targetImageToReplace = selectable.classList.contains('editable-img') ? selectable : selectable.querySelector('.editable-img');
                } else {
                    btnChange.style.display = 'none';
                    divChange.style.display = 'none';
                    AppState.targetImageToReplace = null;
                }
            }
        } else {
            if (!e.target.closest('.selection-box') && !e.target.closest('.element-toolbar') && !e.target.closest('.crop-modal-overlay')) {
                deselectElement();
                document.getElementById('elementToolbar').style.display = 'none';
            }
        }
        
        // Slide Ativo
        const slideWrap = e.target.closest('.slide-wrapper');
        if (slideWrap) {
            document.querySelectorAll('.slide-wrapper').forEach(w => w.classList.remove('active'));
            slideWrap.classList.add('active');
            AppState.activeSlide = slideWrap.querySelector('.slide');
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing && AppState.selectedElement) {
            const el = AppState.selectedElement;
            const dx = (e.clientX - startX) / AppState.canvasScale;
            const dy = (e.clientY - startY) / AppState.canvasScale;

            let newW = startW, newH = startH, newLeft = startLeft, newTop = startTop;

            if (resizeDir.includes('r')) newW = startW + dx;
            if (resizeDir.includes('l')) { newW = startW - dx; newLeft = startLeft + dx; }
            if (resizeDir.includes('b')) newH = startH + dy;
            if (resizeDir.includes('t')) { newH = startH - dy; newTop = startTop + dy; }

            if (newW > 20) { el.style.width = newW + 'px'; el.style.left = newLeft + 'px'; }
            if (newH > 20) { el.style.height = newH + 'px'; el.style.top = newTop + 'px'; }
            
            updateSelectionBox();
            return;
        }
    });

    document.addEventListener('mouseup', () => { 
        if (isResizing) {
            isResizing = false;
            saveState(); 
        }
    });
    
    document.addEventListener('input', (e) => {
        if (e.target.isContentEditable && AppState.selectedElement === e.target) updateSelectionBox();
    });

    // ----- INSERIR FORMAS -----
    document.getElementById('btnAddText').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element text-element" contenteditable="true" spellcheck="false" style="font-size: 60px; font-family: 'Montserrat', sans-serif; font-weight: 800; color: var(--text-color); white-space: nowrap; position: absolute; z-index: 1000;">Novo Texto</div>`);
    });
    document.getElementById('btnAddRect').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="width: 300px; height: 300px; background-color: var(--brand-color); border-radius: 20px; position: absolute; z-index: 1000;"></div>`);
    });
    document.getElementById('btnAddCircle').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="width: 300px; height: 300px; background-color: var(--brand-color); border-radius: 50%; position: absolute; z-index: 1000;"></div>`);
    });
    
    // NOVOS COMPONENTES: Card, Botão, Badge/Tag
    document.getElementById('btnAddCard').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="width: 450px; height: auto; background-color: rgba(255,255,255,0.05); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 40px; position: absolute; color: var(--text-color); box-shadow: 0 20px 40px rgba(0,0,0,0.15); z-index: 1000;">
            <h3 contenteditable="true" spellcheck="false" style="font-family: 'Inter', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 15px; outline: none;">Novo Card</h3>
            <p contenteditable="true" spellcheck="false" style="font-family: 'Inter', sans-serif; font-size: 22px; line-height: 1.5; opacity: 0.85; outline: none;">Substitua este texto com a informação principal do seu carrossel. Você pode redimensionar este bloco usando as pontas.</p>
        </div>`);
    });
    
    document.getElementById('btnAddButton').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="padding: 20px 45px; background-color: var(--brand-color); color: #fff; border-radius: 50px; font-family: 'Inter', sans-serif; font-size: 26px; font-weight: 700; text-align: center; position: absolute; box-shadow: 0 10px 30px rgba(var(--brand-rgb), 0.4); z-index: 1000;" contenteditable="true" spellcheck="false">Clique Aqui</div>`);
    });
    
    document.getElementById('btnAddBadge').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="padding: 12px 24px; background-color: transparent; border: 3px solid var(--brand-color); color: var(--brand-color); border-radius: 50px; font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 800; text-align: center; position: absolute; text-transform: uppercase; letter-spacing: 1px; z-index: 1000;" contenteditable="true" spellcheck="false">NOVA TAG</div>`);
    });

    document.getElementById('btnAddImage').addEventListener('click', () => {
        addElementToActiveSlide(`<img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" class="draggable editable-img new-element image-element" crossorigin="anonymous" style="width: 400px; height: 400px; object-fit: cover; border-radius: 20px; position: absolute; z-index: 1000;">`);
    });
    
    // ----- CONTROLES DE TECLADO -----
    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement.tagName.toLowerCase();
        const isEditingText = activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable;

        // Delete
        if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
            if (AppState.selectedElement) deleteSelectedElement();
        }

        // Ctrl + Z / Ctrl + Y
        if ((e.ctrlKey || e.metaKey) && !isEditingText) {
            if (e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            } else if (e.key === 'y' || e.key === 'Y') {
                e.preventDefault();
                redo();
            }
        }
    });

    // ----- AÇÕES DA TOOLBAR FLUTUANTE -----
    document.getElementById('btnToolbarDelete').addEventListener('click', () => {
        deleteSelectedElement();
    });

    document.getElementById('btnToolbarLayerUp').addEventListener('click', () => {
        if (!AppState.selectedElement) return;
        let z = parseInt(window.getComputedStyle(AppState.selectedElement).zIndex) || 10;
        if (z === 'auto' || isNaN(z)) z = 10;
        AppState.selectedElement.style.zIndex = z + 1;
        saveState();
    });

    document.getElementById('btnToolbarLayerDown').addEventListener('click', () => {
        if (!AppState.selectedElement) return;
        let z = parseInt(window.getComputedStyle(AppState.selectedElement).zIndex) || 10;
        if (z === 'auto' || isNaN(z)) z = 10;
        AppState.selectedElement.style.zIndex = Math.max(0, z - 1);
        saveState();
    });

    document.getElementById('btnToolbarOpacityUp').addEventListener('click', () => {
        if (!AppState.selectedElement) return;
        let o = parseFloat(window.getComputedStyle(AppState.selectedElement).opacity) ?? 1;
        AppState.selectedElement.style.opacity = Math.min(1, o + 0.1);
        saveState();
    });

    document.getElementById('btnToolbarOpacityDown').addEventListener('click', () => {
        if (!AppState.selectedElement) return;
        let o = parseFloat(window.getComputedStyle(AppState.selectedElement).opacity) ?? 1;
        AppState.selectedElement.style.opacity = Math.max(0, o - 0.1);
        saveState();
    });

    // Modal de Imagem original
    document.getElementById('btnToolbarChange').addEventListener('click', () => {
        document.getElementById('slideImageInput').click();
        document.getElementById('elementToolbar').style.display = 'none';
    });

    document.getElementById('slideImageInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('cropModal').style.display = 'flex';
            const cropTarget = document.getElementById('cropTarget');
            cropTarget.src = ev.target.result;
            if (cropperInstance) cropperInstance.destroy();
            cropperInstance = new window.Cropper(cropTarget, { viewMode: 1, autoCropArea: 1, background: false });
        };
        reader.readAsDataURL(file);
        e.target.value = ''; 
    });

    document.getElementById('btnCancelCrop').addEventListener('click', () => {
        document.getElementById('cropModal').style.display = 'none';
        if(cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
    });

    document.getElementById('btnApplyCrop').addEventListener('click', () => {
        if (cropperInstance && AppState.targetImageToReplace) {
            const canvas = cropperInstance.getCroppedCanvas({ maxWidth: 1080, maxHeight: 1350 });
            AppState.targetImageToReplace.src = canvas.toDataURL('image/jpeg', 0.9);
            document.getElementById('cropModal').style.display = 'none';
            cropperInstance.destroy(); cropperInstance = null;
            saveState(); 
        }
    });

    document.getElementById('btnLogoUpload').addEventListener('click', () => document.getElementById('logoInput').click());
    document.getElementById('logoInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            AppState.customLogoUrl = ev.target.result;
            const btn = document.getElementById('btnLogoUpload');
            btn.innerHTML = '<i data-lucide="check" style="color:var(--brand-color);"></i>';
            window.lucide.createIcons();
            document.querySelectorAll('.brand-logo-container').forEach(container => container.innerHTML = `<img src="${AppState.customLogoUrl}" class="custom-logo-img draggable">`);
            saveState();
        };
        reader.readAsDataURL(file);
    });
}
