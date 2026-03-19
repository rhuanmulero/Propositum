import { AppState } from '../state.js';
import { updateSelectionBox, selectElement } from './editor.js';
import { saveState } from './history.js';

let draggedEl = null;
let startX = 0, startY = 0, initLeft = 0, initTop = 0, isDragging = false;
let baseLeft = 0, baseRight = 0, baseTop = 0, baseBottom = 0, baseCx = 0, baseCy = 0;
let sibBounds =[];
let currentSlide = null;

// Guarda posições e z-index de múltiplos elementos
let initialPositions =[];

function initDragSetup(el, e) {
    if (!AppState.selectedElements.includes(el)) {
        selectElement(el, e.shiftKey);
    }

    draggedEl = el; // O elemento clicado serve de âncora para as guias
    currentSlide = draggedEl.closest('.slide');
    
    startX = e.clientX; 
    startY = e.clientY;
    initLeft = parseFloat(draggedEl.style.left) || 0;
    initTop = parseFloat(draggedEl.style.top) || 0;
    isDragging = false;

    // Salva posições iniciais e z-index original de todos selecionados
    initialPositions =[];
    AppState.selectedElements.forEach(selEl => {
        initialPositions.push({
            el: selEl,
            left: parseFloat(selEl.style.left) || 0,
            top: parseFloat(selEl.style.top) || 0,
            zIndex: selEl.style.zIndex || '10'
        });
    });

    const scale = AppState.canvasScale;
    const slideRect = currentSlide.getBoundingClientRect();
    
    // Reseta temporariamente para pegar a posição pura
    const oldLeft = draggedEl.style.left; 
    const oldTop = draggedEl.style.top;
    draggedEl.style.left = '0px'; 
    draggedEl.style.top = '0px';

    const elRect = draggedEl.getBoundingClientRect();
    baseLeft = (elRect.left - slideRect.left) / scale;
    baseTop = (elRect.top - slideRect.top) / scale;
    const elW = elRect.width / scale;
    const elH = elRect.height / scale;

    baseRight = baseLeft + elW; 
    baseBottom = baseTop + elH;
    baseCx = baseLeft + elW / 2; 
    baseCy = baseTop + elH / 2;

    draggedEl.style.left = oldLeft; 
    draggedEl.style.top = oldTop;

    // Calcula os limites dos irmãos (ignorando os que estão selecionados)
    sibBounds =[];
    const siblings = Array.from(currentSlide.querySelectorAll('.draggable, .editable-img')).filter(n => !AppState.selectedElements.includes(n));
    
    siblings.forEach(sib => {
        const sRect = sib.getBoundingClientRect();
        if (sRect.width === 0) return;
        const sl = (sRect.left - slideRect.left) / scale;
        const st = (sRect.top - slideRect.top) / scale;
        const sw = sRect.width / scale; 
        const sh = sRect.height / scale;
        sibBounds.push({ l: sl, r: sl + sw, t: st, b: st + sh, cx: sl + sw/2, cy: st + sh/2 });
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
        
        // Agora pega imagens também!
        const draggable = e.target.closest('.draggable, .editable-img');
        if (!draggable) return;
        if (draggable.isContentEditable && document.activeElement === draggable) return;

        initDragSetup(draggable, e);
    });

    document.addEventListener('mousemove', (e) => {
        if (!draggedEl || initialPositions.length === 0) return;
        isDragging = true;
        
        let dx = (e.clientX - startX) / AppState.canvasScale;
        let dy = (e.clientY - startY) / AppState.canvasScale;
        let rawLeft = initLeft + dx; 
        let rawTop = initTop + dy;

        let curL = baseLeft + rawLeft; let curR = baseRight + rawLeft; let curCx = baseCx + rawLeft;
        let curT = baseTop + rawTop; let curB = baseBottom + rawTop; let curCy = baseCy + rawTop;

        let bestDistX = 15; let snapXVal = rawLeft; let guideX = null;
        let bestDistY = 15; let snapYVal = rawTop; let guideY = null;

        // Eixo Central (540, 675)
        if(Math.abs(curCx - 540) < bestDistX) { bestDistX = Math.abs(curCx - 540); snapXVal = rawLeft + (540 - curCx); guideX = 540; }
        if(Math.abs(curCy - 675) < bestDistY) { bestDistY = Math.abs(curCy - 675); snapYVal = rawTop + (675 - curCy); guideY = 675; }

        // Eixo dos elementos irmãos
        sibBounds.forEach(sib => {
            [ [curL, sib.l],[curL, sib.r],[curCx, sib.cx],[curR, sib.l],[curR, sib.r] ].forEach(pair => {
                let diff = Math.abs(pair[0] - pair[1]);
                if(diff < bestDistX) { bestDistX = diff; snapXVal = rawLeft + (pair[1] - pair[0]); guideX = pair[1]; }
            });
            [[curT, sib.t],[curT, sib.b],[curCy, sib.cy],[curB, sib.t],[curB, sib.b] ].forEach(pair => {
                let diff = Math.abs(pair[0] - pair[1]);
                if(diff < bestDistY) { bestDistY = diff; snapYVal = rawTop + (pair[1] - pair[0]); guideY = pair[1]; }
            });
        });

        // Delta real aplicado após o ímã (snapping)
        let actualDx = snapXVal - initLeft;
        let actualDy = snapYVal - initTop;

        // Move todos juntos baseados no ímã do elemento principal
        initialPositions.forEach(pos => {
            pos.el.style.left = `${pos.left + actualDx}px`;
            pos.el.style.top = `${pos.top + actualDy}px`;
            pos.el.style.zIndex = '10000'; 
        });
        
        updateSelectionBox();

        // Desenha as Guias
        if (currentSlide) {
            const gV = currentSlide.querySelector('.guide-v');
            const gH = currentSlide.querySelector('.guide-h');
            if(gV) { gV.style.display = guideX !== null ? 'block' : 'none'; gV.style.left = `${guideX}px`; }
            if(gH) { gH.style.display = guideY !== null ? 'block' : 'none'; gH.style.top = `${guideY}px`; }
        }
        window.getSelection().removeAllRanges(); 
    });

    document.addEventListener('mouseup', () => {
        if (draggedEl) {
            if (isDragging) saveState(); 
            else if (draggedEl.isContentEditable) draggedEl.focus(); 
            
            // Restaura Z-Index original de todos
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