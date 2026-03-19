import { AppState } from '../state.js';
import { saveState, undo, redo } from './history.js';

let cropperInstance = null;
let isResizing = false;
let resizeDir = '';
let startW = 0, startH = 0, startX = 0, startY = 0, startLeft = 0, startTop = 0;

// Utilitário para converter RGB para HEX (usado no seletor de cor)
function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#ffffff';
    let match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#ffffff';
    return "#" + (1 << 24 | match[1] << 16 | match[2] << 8 | match[3]).toString(16).slice(1);
}

// Garante que todo novo elemento nasça acima dos outros
function getHighestZIndex(slide) {
    let max = 10;
    slide.querySelectorAll('.draggable').forEach(el => {
        let z = parseInt(window.getComputedStyle(el).zIndex);
        if (!isNaN(z) && z > max && z < 9000) max = z;
    });
    return max;
}

export function updateSelectionBox() {
    // Limpa todas as caixas antigas
    document.querySelectorAll('.selection-box').forEach(b => b.remove());
    
    if (!AppState.selectedElements || AppState.selectedElements.length === 0) return;

    const slide = AppState.selectedElements[0].closest('.slide');
    if (!slide) return;

    AppState.selectedElements.forEach(el => {
        const box = document.createElement('div');
        box.className = 'selection-box';
        
        // Só mostra as alças de redimensionamento se apenas UM elemento estiver selecionado
        if (AppState.selectedElements.length === 1) {['tl', 'tr', 'bl', 'br', 'l', 'r', 't', 'b'].forEach(dir => {
                const h = document.createElement('div');
                h.className = `resize-handle ${dir}`;
                h.dataset.dir = dir;
                box.appendChild(h);
            });
        }
        
        slide.appendChild(box);

        const elRect = el.getBoundingClientRect();
        const slideRect = slide.getBoundingClientRect();
        
        box.style.display = 'block';
        box.style.left = ((elRect.left - slideRect.left) / AppState.canvasScale) + 'px';
        box.style.top = ((elRect.top - slideRect.top) / AppState.canvasScale) + 'px';
        box.style.width = (elRect.width / AppState.canvasScale) + 'px';
        box.style.height = (elRect.height / AppState.canvasScale) + 'px';
    });
}

export function selectElement(el, shiftKey = false) {
    if (AppState.currentTool !== 'pointer') return; 

    if (!AppState.selectedElements) AppState.selectedElements =[]; 

    // Lógica do SHIFT + Clique (Multi-seleção)
    if (shiftKey) {
        if (!AppState.selectedElements.includes(el)) {
            AppState.selectedElements.push(el);
        } else {
            AppState.selectedElements = AppState.selectedElements.filter(e => e !== el);
        }
    } else {
        AppState.selectedElements = [el];
    }
    updateSelectionBox();
}

export function deselectElement() {
    AppState.selectedElements =[];
    updateSelectionBox();
}

export function deleteSelectedElement() {
    if (AppState.selectedElements && AppState.selectedElements.length > 0) {
        AppState.selectedElements.forEach(el => el.remove());
        deselectElement();
        const toolbar = document.getElementById('elementToolbar');
        if (toolbar) toolbar.style.display = 'none';
        saveState();
    }
}

function addElementToActiveSlide(htmlStr) {
    document.querySelector('.figma-toolbar .tool-btn[data-tool="pointer"]')?.click();

    let slide = AppState.activeSlide;
    if (!slide) {
        const activeWrap = document.querySelector('.slide-wrapper.active');
        if (activeWrap) {
            slide = activeWrap.querySelector('.slide');
        } else {
            const firstWrap = document.querySelector('.slide-wrapper');
            if (firstWrap) {
                firstWrap.classList.add('active');
                slide = firstWrap.querySelector('.slide');
                AppState.activeSlide = slide;
            }
        }
    }
    if (!slide) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlStr;
    const el = wrapper.firstElementChild;
    
    slide.appendChild(el);
    el.style.left = '400px'; 
    el.style.top = '500px';
    
    // CORREÇÃO: Nasce sempre na frente de todos os elementos daquele slide
    el.style.zIndex = getHighestZIndex(slide) + 1;
    
    selectElement(el, false);
    saveState();
}

function initResize(e, dir) {
    if (AppState.selectedElements.length !== 1) return; // Protege de redimensionar vários ao mesmo tempo
    isResizing = true;
    resizeDir = dir;
    startX = e.clientX;
    startY = e.clientY;
    
    const el = AppState.selectedElements[0];
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

    // --- CONTROLES DOS SLIDES (Duplicar, Novo, Excluir) ---
    document.addEventListener('click', (e) => {
        const controlBtn = e.target.closest('.btn-slide-control');
        if (!controlBtn) return;

        const action = controlBtn.dataset.action;
        const wrapper = controlBtn.closest('.slide-wrapper');
        if (!wrapper) return;

        if (action === 'remove') {
            const allSlides = document.querySelectorAll('.slide-wrapper');
            if (allSlides.length <= 1) {
                alert("Você não pode remover o último slide restante.");
                return;
            }
            wrapper.remove();
            saveState();
        } 
        else if (action === 'duplicate') {
            const clone = wrapper.cloneNode(true);
            const texture = clone.querySelector('.slide-texture-canvas');
            if (texture) {
                const newId = Date.now() + Math.floor(Math.random() * 1000);
                texture.innerHTML = texture.innerHTML.replace(/noise\d+/g, `noise${newId}`).replace(/dots\d+/g, `dots${newId}`);
            }
            clone.classList.remove('active');
            wrapper.parentNode.insertBefore(clone, wrapper.nextSibling);
            if (window.lucide) window.lucide.createIcons({ root: clone });
            saveState();
        }
        else if (action === 'add') {
            const currentSlide = wrapper.querySelector('.slide');
            const templateClass = Array.from(currentSlide.classList).find(c => c.startsWith('layout-')) || 'layout-tech';
            const newWrapper = document.createElement('div');
            newWrapper.className = 'slide-wrapper';
            const slideDiv = document.createElement('div');
            slideDiv.className = `slide ${templateClass} slide-blank`;
            
            const footerEl = currentSlide.querySelector('.slide-footer');
            const footerHtml = footerEl ? footerEl.outerHTML : '';
            const textureEl = currentSlide.querySelector('.slide-texture-canvas');
            let textureHtml = '';
            if (textureEl) {
                const newId = Date.now() + Math.floor(Math.random() * 1000);
                textureHtml = textureEl.outerHTML.replace(/noise\d+/g, `noise${newId}`).replace(/dots\d+/g, `dots${newId}`);
            }
            const guidesHtml = `<div class="guide-line guide-v"></div><div class="guide-line guide-h"></div>`;
            const bgHtml = `<img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop" class="slide-bg-img editable-img" crossorigin="anonymous" style="opacity: 0.1;"><div class="slide-gradient"></div>`;

            slideDiv.innerHTML = `
                ${bgHtml}
                <div class="slide-content" style="z-index: 10; position: relative; align-items: center; justify-content: center; display: flex;">
                    <h2 class="draggable new-element text-element" contenteditable="true" spellcheck="false" style="font-size: 80px; font-weight: 800; text-align: center; width: 100%; z-index: 1000;">Novo Slide</h2>
                </div>
                ${footerHtml}
                ${guidesHtml}
                ${textureHtml}
            `;
            newWrapper.appendChild(slideDiv);
            
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'slide-controls';
            controlsDiv.innerHTML = `
                <button class="btn-slide-control" data-action="duplicate" title="Duplicar Slide"><i data-lucide="copy"></i></button>
                <button class="btn-slide-control" data-action="add" title="Adicionar Slide Vazio"><i data-lucide="plus"></i></button>
                <button class="btn-slide-control delete" data-action="remove" title="Remover Slide"><i data-lucide="trash-2"></i></button>
            `;
            newWrapper.appendChild(controlsDiv);
            wrapper.parentNode.insertBefore(newWrapper, wrapper.nextSibling);
            if (window.lucide) window.lucide.createIcons({ root: newWrapper });
            saveState();
        }
    });

    document.addEventListener('focusout', (e) => {
        if (e.target.isContentEditable) saveState();
    });

    // --- SELEÇÃO DE ELEMENTOS E TOOLBAR ---
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || AppState.currentTool === 'hand' || e.target.closest('.canvas-plane') === null && e.target.closest('.selection-box') === null) {
            return; 
        }

        const handle = e.target.closest('.resize-handle');
        if (handle) {
            initResize(e, handle.dataset.dir);
            return;
        }

        const selectable = e.target.closest('.draggable, .editable-img');
        
        if (selectable) {
            if (!e.target.closest('#btnToolbarMove')) {
                // Passa o e.shiftKey para permitir multi-seleção
                selectElement(selectable, e.shiftKey);
                
                const toolbar = document.getElementById('elementToolbar');
                if (toolbar && AppState.selectedElements.length > 0) {
                    toolbar.style.display = 'flex';
                    
                    // Baseia a posição da toolbar no último elemento selecionado
                    const lastEl = AppState.selectedElements[AppState.selectedElements.length - 1];
                    const rect = lastEl.getBoundingClientRect();
                    
                    let tLeft = rect.left + (rect.width / 2);
                    let tTop = rect.top - 60; 
                    if (tTop < 10) tTop = rect.top + 20;

                    toolbar.style.left = tLeft + 'px';
                    toolbar.style.top = tTop + 'px';

                    // Mostrar/Ocultar botão de recortar imagem
                    const btnChange = document.getElementById('btnToolbarChange');
                    const divChange = document.getElementById('divImageChange');
                    if (lastEl.classList.contains('editable-img') || lastEl.querySelector('.editable-img')) {
                        if (btnChange) btnChange.style.display = 'flex'; 
                        if (divChange) divChange.style.display = 'block';
                        AppState.targetImageToReplace = lastEl.classList.contains('editable-img') ? lastEl : lastEl.querySelector('.editable-img');
                    } else {
                        if (btnChange) btnChange.style.display = 'none'; 
                        if (divChange) divChange.style.display = 'none';
                        AppState.targetImageToReplace = null;
                    }

                    // INTELIGÊNCIA: Lê a fonte e o tamanho do último elemento para jogar no input
                    const fontSelect = document.getElementById('toolbarFont');
                    const fontSizeInput = document.getElementById('toolbarFontSize');
                    const colorPicker = document.getElementById('toolbarColor');
                    
                    const isText = lastEl.isContentEditable || lastEl.tagName.match(/H[1-6]|P|SPAN/);
                    
                    if (isText) {
                        if (fontSelect) fontSelect.style.display = 'block';
                        if (fontSizeInput) {
                            fontSizeInput.style.display = 'block';
                            fontSizeInput.value = parseFloat(window.getComputedStyle(lastEl).fontSize);
                        }
                        if (colorPicker) colorPicker.value = rgbToHex(window.getComputedStyle(lastEl).color);
                    } else {
                        if (fontSelect) fontSelect.style.display = 'none';
                        if (fontSizeInput) fontSizeInput.style.display = 'none';
                        if (colorPicker) colorPicker.value = rgbToHex(window.getComputedStyle(lastEl).backgroundColor);
                    }
                }
            }
        } else {
            if (!e.target.closest('.selection-box') && !e.target.closest('.element-toolbar') && !e.target.closest('.crop-modal-overlay')) {
                deselectElement();
                const toolbar = document.getElementById('elementToolbar');
                if (toolbar) toolbar.style.display = 'none';
            }
        }
        
        const slideWrap = e.target.closest('.slide-wrapper');
        if (slideWrap) {
            document.querySelectorAll('.slide-wrapper').forEach(w => w.classList.remove('active'));
            slideWrap.classList.add('active');
            AppState.activeSlide = slideWrap.querySelector('.slide');
        }
    });

    // --- REDIMENSIONAMENTO DO ELEMENTO ---
    document.addEventListener('mousemove', (e) => {
        if (isResizing && AppState.selectedElements.length === 1) {
            const el = AppState.selectedElements[0];
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
        }
    });

    document.addEventListener('mouseup', () => { 
        if (isResizing) { isResizing = false; saveState(); }
    });
    
    document.addEventListener('input', (e) => {
        if (e.target.isContentEditable && AppState.selectedElements && AppState.selectedElements.includes(e.target)) {
            updateSelectionBox();
        }
    });

    // --- ADICIONAR FORMAS ---
    document.getElementById('btnAddText')?.addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element text-element" contenteditable="true" spellcheck="false" style="font-size: 60px; font-family: 'Montserrat', sans-serif; font-weight: 800; color: var(--text-color); position: absolute; z-index: 1000;">Novo Texto</div>`);
    });
    document.getElementById('btnAddRect')?.addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="width: 300px; height: 300px; background-color: var(--brand-color); border-radius: 20px; position: absolute; z-index: 1000;"></div>`);
    });
    document.getElementById('btnAddCircle')?.addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="width: 300px; height: 300px; background-color: var(--brand-color); border-radius: 50%; position: absolute; z-index: 1000;"></div>`);
    });
    document.getElementById('btnAddCard')?.addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="width: 450px; height: auto; background-color: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 40px; position: absolute; color: var(--text-color); box-shadow: 0 20px 40px rgba(0,0,0,0.15); z-index: 1000;"><h3 contenteditable="true" spellcheck="false" style="font-family: 'Inter', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 15px;">Novo Card</h3><p contenteditable="true" spellcheck="false" style="font-family: 'Inter', sans-serif; font-size: 22px; line-height: 1.5; opacity: 0.85;">Substitua este texto.</p></div>`);
    });
    document.getElementById('btnAddButton')?.addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="padding: 20px 45px; background-color: var(--brand-color); color: #fff; border-radius: 50px; font-family: 'Inter', sans-serif; font-size: 26px; font-weight: 700; text-align: center; position: absolute; box-shadow: 0 10px 30px rgba(var(--brand-rgb), 0.4); z-index: 1000;" contenteditable="true" spellcheck="false">Clique Aqui</div>`);
    });
    document.getElementById('btnAddBadge')?.addEventListener('click', () => {
        addElementToActiveSlide(`<div class="draggable new-element shape-element" style="padding: 12px 24px; background-color: transparent; border: 3px solid var(--brand-color); color: var(--brand-color); border-radius: 50px; font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 800; text-align: center; position: absolute; text-transform: uppercase; letter-spacing: 1px; z-index: 1000;" contenteditable="true" spellcheck="false">NOVA TAG</div>`);
    });
    document.getElementById('btnAddImage')?.addEventListener('click', () => {
        addElementToActiveSlide(`<img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" class="draggable editable-img new-element image-element" crossorigin="anonymous" style="width: 400px; height: 400px; object-fit: cover; border-radius: 20px; position: absolute; z-index: 1000;">`);
    });

    // --- ATALHOS DE TECLADO ---
    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement.tagName.toLowerCase();
        const isEditingText = activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable;

        if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
            if (AppState.selectedElements && AppState.selectedElements.length > 0) deleteSelectedElement();
        }

        if ((e.ctrlKey || e.metaKey) && !isEditingText) {
            if (e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                if (e.shiftKey) redo(); else undo();
            } else if (e.key === 'y' || e.key === 'Y') {
                e.preventDefault(); redo();
            }
        }
    });

    // --- FERRAMENTAS DA TOOLBAR (MULTIPLOS ELEMENTOS) ---
    document.getElementById('btnToolbarCopy')?.addEventListener('click', () => {
        if (AppState.selectedElements.length === 0) return;
        
        const newSelection =[];
        AppState.selectedElements.forEach(el => {
            const clone = el.cloneNode(true);
            const currentLeft = parseFloat(el.style.left) || 400;
            const currentTop = parseFloat(el.style.top) || 500;
            
            clone.style.left = (currentLeft + 30) + 'px';
            clone.style.top = (currentTop + 30) + 'px';
            
            // Nasce sempre em cima
            clone.style.zIndex = getHighestZIndex(el.closest('.slide')) + 1;
            
            el.parentNode.appendChild(clone);
            newSelection.push(clone);
        });
        
        AppState.selectedElements = newSelection;
        updateSelectionBox();
        saveState();
    });

    document.getElementById('toolbarColor')?.addEventListener('input', (e) => {
        if(AppState.selectedElements.length === 0) return;
        AppState.selectedElements.forEach(el => {
            const isText = el.isContentEditable || el.tagName.match(/H[1-6]|P|SPAN/);
            el.style.backgroundImage = 'none'; 
            el.style.webkitTextFillColor = 'initial';
            
            if (isText) el.style.color = e.target.value;
            else el.style.backgroundColor = e.target.value;
        });
        updateSelectionBox();
        saveState();
    });

    document.getElementById('toolbarFont')?.addEventListener('change', (e) => {
        if(AppState.selectedElements.length === 0) return;
        AppState.selectedElements.forEach(el => {
            el.style.fontFamily = e.target.value;
        });
        updateSelectionBox();
        saveState();
    });

    // TAMANHO DA FONTE (Aplica a todos os textos selecionados)
    document.getElementById('toolbarFontSize')?.addEventListener('input', (e) => {
        if(AppState.selectedElements.length === 0) return;
        AppState.selectedElements.forEach(el => {
            const isText = el.isContentEditable || el.tagName.match(/H[1-6]|P|SPAN/);
            if(isText) {
                el.style.fontSize = e.target.value + 'px';
            }
        });
        updateSelectionBox();
        saveState();
    });

    document.getElementById('btnToolbarGradient')?.addEventListener('click', () => {
        if(AppState.selectedElements.length === 0) return;
        const brand = document.getElementById('brandColor').value || '#ea580c';
        const bg = document.getElementById('bgColor').value || '#000000';
        
        AppState.selectedElements.forEach(el => {
            const isText = el.isContentEditable || el.tagName.match(/H[1-6]|P|SPAN/);
            if (isText) {
                el.style.backgroundImage = `linear-gradient(90deg, ${brand}, ${bg})`;
                el.style.webkitBackgroundClip = 'text';
                el.style.webkitTextFillColor = 'transparent';
            } else {
                el.style.backgroundImage = `linear-gradient(135deg, ${brand}, ${bg})`;
            }
        });
        saveState();
    });

    document.getElementById('btnToolbarDelete')?.addEventListener('click', () => deleteSelectedElement());
    
    document.getElementById('btnToolbarLayerUp')?.addEventListener('click', () => {
        if(AppState.selectedElements.length === 0) return;
        AppState.selectedElements.forEach(el => {
            let z = parseInt(window.getComputedStyle(el).zIndex) || 10;
            if (z === 'auto' || isNaN(z)) z = 10;
            el.style.zIndex = z + 1;
        });
        saveState();
    });

    document.getElementById('btnToolbarLayerDown')?.addEventListener('click', () => {
        if(AppState.selectedElements.length === 0) return;
        AppState.selectedElements.forEach(el => {
            let z = parseInt(window.getComputedStyle(el).zIndex) || 10;
            if (z === 'auto' || isNaN(z)) z = 10;
            el.style.zIndex = Math.max(0, z - 1);
        });
        saveState();
    });

    document.getElementById('btnToolbarOpacityDown')?.addEventListener('click', () => {
        if(AppState.selectedElements.length === 0) return;
        AppState.selectedElements.forEach(el => {
            let o = parseFloat(window.getComputedStyle(el).opacity) ?? 1;
            el.style.opacity = Math.max(0, o - 0.1);
        });
        saveState();
    });

    document.getElementById('btnToolbarOpacityUp')?.addEventListener('click', () => {
        if(AppState.selectedElements.length === 0) return;
        AppState.selectedElements.forEach(el => {
            let o = parseFloat(window.getComputedStyle(el).opacity) ?? 1;
            el.style.opacity = Math.min(1, o + 0.1);
        });
        saveState();
    });

    // --- UPLOAD / CROP DE IMAGEM ---
    document.getElementById('btnToolbarChange')?.addEventListener('click', () => {
        document.getElementById('slideImageInput')?.click();
        const toolbar = document.getElementById('elementToolbar');
        if (toolbar) toolbar.style.display = 'none';
    });

    document.getElementById('slideImageInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const modal = document.getElementById('cropModal');
            if (modal) modal.style.display = 'flex';
            
            const cropTarget = document.getElementById('cropTarget');
            if (cropTarget) {
                cropTarget.src = ev.target.result;
                if (cropperInstance) cropperInstance.destroy();
                if (window.Cropper) {
                    cropperInstance = new window.Cropper(cropTarget, { viewMode: 1, autoCropArea: 1, background: false });
                }
            }
        };
        reader.readAsDataURL(file);
        e.target.value = ''; 
    });

    document.getElementById('btnApplyCrop')?.addEventListener('click', () => {
        if (cropperInstance && AppState.targetImageToReplace) {
            const canvas = cropperInstance.getCroppedCanvas({ maxWidth: 1080, maxHeight: 1350 });
            AppState.targetImageToReplace.src = canvas.toDataURL('image/jpeg', 0.9);
            
            const modal = document.getElementById('cropModal');
            if (modal) modal.style.display = 'none';
            
            cropperInstance.destroy(); cropperInstance = null;
            saveState(); 
        }
    });

    document.getElementById('btnCancelCrop')?.addEventListener('click', () => {
        const modal = document.getElementById('cropModal');
        if (modal) modal.style.display = 'none';
        if(cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
    });

    // LOGO GLOBAL UPLOAD
    document.getElementById('btnLogoUpload')?.addEventListener('click', () => document.getElementById('logoInput')?.click());
    
    document.getElementById('logoInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            AppState.customLogoUrl = ev.target.result;
            const btn = document.getElementById('btnLogoUpload');
            if (btn) btn.innerHTML = '<i data-lucide="check" style="color:var(--brand-color);"></i>';
            
            if (window.lucide) window.lucide.createIcons();
            
            document.querySelectorAll('.brand-logo-container').forEach(container => {
                container.innerHTML = `<img src="${AppState.customLogoUrl}" class="custom-logo-img draggable">`;
            });
            saveState();
        };
        reader.readAsDataURL(file);
    });
}