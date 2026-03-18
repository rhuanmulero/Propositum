export const AppState = {
    customLogoUrl: null,
    targetImageToReplace: null,
    selectedElement: null,
    activeSlide: null,
    
    currentTool: 'pointer', 
    canvasScale: 0.35, 
    canvasX: 200,    
    canvasY: 150,

    history:[],
    historyIndex: -1,
    isUndoRedo: false
};