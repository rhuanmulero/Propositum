import { AppState } from '../state.js';
import { updateSelectionBox } from './editor.js';
import { saveState } from './history.js';

let draggedEl = null;
let startX = 0, startY = 0, initLeft = 0, initTop = 0, isDragging = false;
let baseLeft = 0, baseRight = 0, baseTop = 0, baseBottom = 0, baseCx = 0, baseCy = 0;
let sibBounds =[], existingGapsX =[], existingGapsY =[];
let currentSlide = null;

function initDragSetup(el, e) {
    draggedEl = el;
    currentSlide = draggedEl.closest('.slide');
    
    startX = e.clientX; startY = e.clientY;
    initLeft = parseFloat(draggedEl.style.left) || 0;
    initTop = parseFloat(draggedEl.style.top) || 0;
    isDragging = false;

    const oldLeft = draggedEl.style.left; const oldTop = draggedEl.style.top;
    draggedEl.style.left = '0px'; draggedEl.style.top = '0px';

    const scale = AppState.canvasScale; // Dinâmico invés do antigo 0.4 fixo
    const slideRect = currentSlide.getBoundingClientRect();
    const elRect = draggedEl.getBoundingClientRect();

    baseLeft = (elRect.left - slideRect.left) / scale;
    baseTop = (elRect.top - slideRect.top) / scale;
    const elW = elRect.width / scale;
    const elH = elRect.height / scale;

    baseRight = baseLeft + elW; baseBottom = baseTop + elH;
    baseCx = baseLeft + elW / 2; baseCy = baseTop + elH / 2;

    draggedEl.style.left = oldLeft; draggedEl.style.top = oldTop;

    sibBounds =[];
    const siblings = Array.from(currentSlide.querySelectorAll('.draggable')).filter(n => n !== draggedEl);
    
    siblings.forEach(sib => {
        const sRect = sib.getBoundingClientRect();
        if (sRect.width === 0) return;
        const sl = (sRect.left - slideRect.left) / scale;
        const st = (sRect.top - slideRect.top) / scale;
        const sw = sRect.width / scale; const sh = sRect.height / scale;
        sibBounds.push({ l: sl, r: sl + sw, t: st, b: st + sh, cx: sl + sw/2, cy: st + sh/2 });
    });

    existingGapsX =[]; existingGapsY =[];
    for(let i = 0; i < sibBounds.length; i++) {
        for(let j = i+1; j < sibBounds.length; j++) {
            if(!(sibBounds[i].b < sibBounds[j].t || sibBounds[i].t > sibBounds[j].b)) {
                let leftNode = sibBounds[i].cx < sibBounds[j].cx ? sibBounds[i] : sibBounds[j];
                let rightNode = sibBounds[i].cx < sibBounds[j].cx ? sibBounds[j] : sibBounds[i];
                existingGapsX.push(rightNode.l - leftNode.r);
            }
            if(!(sibBounds[i].r < sibBounds[j].l || sibBounds[i].l > sibBounds[j].r)) {
                let topNode = sibBounds[i].cy < sibBounds[j].cy ? sibBounds[i] : sibBounds[j];
                let botNode = sibBounds[i].cy < sibBounds[j].cy ? sibBounds[j] : sibBounds[i];
                existingGapsY.push(botNode.t - topNode.b);
            }
        }
    }
}

export function initDragAndDropEvents() {
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || AppState.currentTool !== 'pointer') return; 
        if (e.target.closest('.resize-handle')) return; 

        if (e.target.closest('#btnToolbarMove')) {
            e.preventDefault();
            const elToMove = AppState.selectedElement;
            document.getElementById('elementToolbar').style.display = 'none';
            initDragSetup(elToMove, e);
            return;
        }
        
        const draggable = e.target.closest('.draggable');
        if (!draggable) return;
        if (draggable.isContentEditable && document.activeElement === draggable) return;
        if (e.target.classList.contains('editable-img')) return; 

        initDragSetup(draggable, e);
    });

    document.addEventListener('mousemove', (e) => {
        if (!draggedEl) return;
        isDragging = true;
        
        // Aplica o scale exato para mover perfeitamente com o mouse
        let dx = (e.clientX - startX) / AppState.canvasScale;
        let dy = (e.clientY - startY) / AppState.canvasScale;
        let rawLeft = initLeft + dx; let rawTop = initTop + dy;

        let curL = baseLeft + rawLeft; let curR = baseRight + rawLeft; let curCx = baseCx + rawLeft;
        let curT = baseTop + rawTop; let curB = baseBottom + rawTop; let curCy = baseCy + rawTop;

        let bestDistX = 15; let snapXVal = rawLeft; let guideX = null;
        let bestDistY = 15; let snapYVal = rawTop; let guideY = null;

        if(Math.abs(curCx - 540) < bestDistX) { bestDistX = Math.abs(curCx - 540); snapXVal = rawLeft + (540 - curCx); guideX = 540; }
        if(Math.abs(curCy - 675) < bestDistY) { bestDistY = Math.abs(curCy - 675); snapYVal = rawTop + (675 - curCy); guideY = 675; }

        sibBounds.forEach(sib => {[ [curL, sib.l],[curL, sib.r],[curCx, sib.cx],[curR, sib.l],[curR, sib.r] ].forEach(pair => {
                let diff = Math.abs(pair[0] - pair[1]);
                if(diff < bestDistX) { bestDistX = diff; snapXVal = rawLeft + (pair[1] - pair[0]); guideX = pair[1]; }
            });
            [ [curT, sib.t],[curT, sib.b],[curCy, sib.cy], [curB, sib.t],[curB, sib.b] ].forEach(pair => {
                let diff = Math.abs(pair[0] - pair[1]);
                if(diff < bestDistY) { bestDistY = diff; snapYVal = rawTop + (pair[1] - pair[0]); guideY = pair[1]; }
            });
        });

        draggedEl.style.left = `${snapXVal}px`;
        draggedEl.style.top = `${snapYVal}px`;
        draggedEl.style.zIndex = '1000'; 
        
        updateSelectionBox();

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
            if (isDragging) saveState(); // Salvar histórico ao terminar de arrastar
            if (!isDragging && draggedEl.isContentEditable) draggedEl.focus(); 
            draggedEl.style.zIndex = '';
            draggedEl = null;
            isDragging = false;
        }
        document.querySelectorAll('.guide-line').forEach(el => el.style.display = 'none');
        currentSlide = null;
    });
}