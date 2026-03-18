import { AppState } from '../state.js';
import { deselectElement } from './editor.js';

export function saveState() {
    if (AppState.isUndoRedo) return;
    
    const container = document.getElementById('carouselContainer');
    if (!container) return;

    // Remove a caixa de seleção para não ser salva no HTML
    const selectionBox = document.querySelector('.selection-box');
    if (selectionBox) selectionBox.style.display = 'none';

    const html = container.innerHTML;

    // Se estivermos no meio do histórico e fizermos uma nova ação, apaga o futuro
    if (AppState.historyIndex < AppState.history.length - 1) {
        AppState.history = AppState.history.slice(0, AppState.historyIndex + 1);
    }

    AppState.history.push(html);
    AppState.historyIndex++;

    // Restaura a caixa de seleção se havia algo selecionado
    if (selectionBox && AppState.selectedElement) {
        selectionBox.style.display = 'block';
    }
}

export function undo() {
    if (AppState.historyIndex > 0) {
        AppState.isUndoRedo = true;
        deselectElement();
        document.getElementById('elementToolbar').style.display = 'none';
        
        AppState.historyIndex--;
        document.getElementById('carouselContainer').innerHTML = AppState.history[AppState.historyIndex];
        
        window.lucide.createIcons();
        AppState.isUndoRedo = false;
    }
}

export function redo() {
    if (AppState.historyIndex < AppState.history.length - 1) {
        AppState.isUndoRedo = true;
        deselectElement();
        document.getElementById('elementToolbar').style.display = 'none';
        
        AppState.historyIndex++;
        document.getElementById('carouselContainer').innerHTML = AppState.history[AppState.historyIndex];
        
        window.lucide.createIcons();
        AppState.isUndoRedo = false;
    }
}