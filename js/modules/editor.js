import { AppState } from '../state.js';

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

        const draggable = e.target.closest('.draggable');
        if (draggable) {
            if (!e.target.closest('#btnToolbarMove')) selectElement(draggable);
        } else {
            if (!e.target.closest('.selection-box') && !e.target.closest('.image-toolbar') && !e.target.closest('.crop-modal-overlay')) {
                deselectElement();
            }
        }
        
        // Slide Ativo
        const slideWrap = e.target.closest('.slide-wrapper');
        if (slideWrap) {
            document.querySelectorAll('.slide-wrapper').forEach(w => w.classList.remove('active'));
            slideWrap.classList.add('active');
            AppState.activeSlide = slideWrap.querySelector('.slide');
        }

        if (e.target.classList.contains('editable-img') && AppState.currentTool === 'pointer') {
            AppState.targetImageToReplace = e.target;
            const toolbar = document.getElementById('imageToolbar');
            toolbar.style.display = 'flex';
            toolbar.style.left = e.clientX + 'px';
            toolbar.style.top = (e.clientY - 40) + 'px'; 
        } else if (!e.target.closest('#imageToolbar')) {
            document.getElementById('imageToolbar').style.display = 'none';
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

    document.addEventListener('mouseup', () => { if (isResizing) isResizing = false; });
    document.addEventListener('input', (e) => {
        if (e.target.isContentEditable && AppState.selectedElement === e.target) updateSelectionBox();
    });

    // Inserir Formas Figma Like
    document.getElementById('btnAddText').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element text-element" contenteditable="true" spellcheck="false" style="font-size: 60px; font-family: 'Montserrat', sans-serif; font-weight: 800; color: var(--text-color); white-space: nowrap; position: absolute;">Novo Texto</div>`);
    });
    document.getElementById('btnAddRect').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="width: 300px; height: 300px; background-color: var(--brand-color); border-radius: 20px; position: absolute;"></div>`);
    });
    document.getElementById('btnAddCircle').addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="width: 300px; height: 300px; background-color: var(--brand-color); border-radius: 50%; position: absolute;"></div>`);
    });
    document.getElementById('btnAddImage').addEventListener('click', () => {
        addElementToActiveSlide(`<img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" class="draggable editable-img new-element image-element" crossorigin="anonymous" style="width: 400px; height: 400px; object-fit: cover; border-radius: 20px; position: absolute;">`);
    });

    // Deletar com DEL ou Backspace
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeTag = document.activeElement.tagName.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable) return;
            if (AppState.selectedElement) deleteSelectedElement();
        }
    });

    // Modal de Imagem original
    document.getElementById('btnToolbarChange').addEventListener('click', () => {
        document.getElementById('slideImageInput').click();
        document.getElementById('imageToolbar').style.display = 'none';
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
        };
        reader.readAsDataURL(file);
    });
}