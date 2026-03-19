import { AppState } from '../state.js';
import { updateSelectionBox, selectElement } from './editor.js';
import { saveState } from './history.js';

let draggedEl = null;
let startX = 0, startY = 0;
let isDragging = false;
let currentSlide = null;

// Array para guardar as posições iniciais e z-index de todos os elementos selecionados
let initialPositions =[];

function initDragSetup(el, e) {
    // Se clicou em um elemento que NÃO está na seleção atual, seleciona só ele
    if (!AppState.selectedElements.includes(el)) {
        selectElement(el, e.shiftKey);
    }

    draggedEl = el;
    currentSlide = draggedEl.closest('.slide');
    startX = e.clientX; 
    startY = e.clientY;
    isDragging = false;
    initialPositions =[];

    // Guarda a posição e a camada original de TODOS os elementos selecionados
    AppState.selectedElements.forEach(selEl => {
        initialPositions.push({
            el: selEl,
            left: parseFloat(selEl.style.left) || 0,
            top: parseFloat(selEl.style.top) || 0,
            zIndex: selEl.style.zIndex || '10' // Salva o z-index original!
        });
    });
}

export function initDragAndDropEvents() {
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || AppState.currentTool !== 'pointer') return; 
        if (e.target.closest('.resize-handle')) return; 

        if (e.target.closest('#btnToolbarMove')) {
            e.preventDefault();
            document.getElementById('elementToolbar').style.display = 'none';
            if(AppState.selectedElements.length > 0) {
                initDragSetup(AppState.selectedElements[0], e);
            }
            return;
        }
        
        const draggable = e.target.closest('.draggable');
        if (!draggable) return;
        if (draggable.isContentEditable && document.activeElement === draggable) return;
        if (e.target.classList.contains('editable-img')) return; 

        initDragSetup(draggable, e);
    });

    document.addEventListener('mousemove', (e) => {
        if (!draggedEl || initialPositions.length === 0) return;
        isDragging = true;
        
        let dx = (e.clientX - startX) / AppState.canvasScale;
        let dy = (e.clientY - startY) / AppState.canvasScale;

        // Move TODOS os elementos selecionados juntos
        initialPositions.forEach(pos => {
            pos.el.style.left = `${pos.left + dx}px`;
            pos.el.style.top = `${pos.top + dy}px`;
            pos.el.style.zIndex = '10000'; // Joga pro topo APENAS enquanto arrasta
        });
        
        updateSelectionBox();
        window.getSelection().removeAllRanges(); 
    });

    document.addEventListener('mouseup', () => {
        if (draggedEl) {
            if (isDragging) {
                saveState();
            } else if (draggedEl.isContentEditable) {
                draggedEl.focus(); 
            }
            
            // RESTAURA O Z-INDEX ORIGINAL (Isso corrige o bug de ir pro fundo)
            initialPositions.forEach(pos => {
                pos.el.style.zIndex = pos.zIndex; 
            });

            draggedEl = null;
            isDragging = false;
            initialPositions =[];
        }
        document.querySelectorAll('.guide-line').forEach(el => el.style.display = 'none');
        currentSlide = null;
    });
}