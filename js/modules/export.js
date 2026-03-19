import { deselectElement } from './editor.js';
import { AppState } from '../state.js';

export async function downloadCarousel() {
    deselectElement(); 
    document.getElementById('elementToolbar').style.display = 'none';

    const modal = document.getElementById('exportModal');
    const progressBar = document.getElementById('exportProgressBar');
    modal.classList.add('show');
    progressBar.style.width = '0%';

    const canvasPlane = document.getElementById('canvasPlane');
    const originalTransform = canvasPlane.style.transform;
    
    // Reseta escala para 1:1 e garante que está no topo antes do print
    canvasPlane.style.transform = 'translate(0px, 0px) scale(1)';
    
    // Espera importante (1.5 segundos) para que o DOM recalcule a resolução nativa e texturas
    await new Promise(r => setTimeout(r, 1500));

    const slides = document.querySelectorAll('.slide');

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        try {
            const dataUrl = await window.htmlToImage.toPng(slide, {
                pixelRatio: 3,
                quality: 1.0,
                width: 1080,
                height: 1350,
                cacheBust: true,
                style: { transform: 'none', margin: '0' }
            });
            
            const link = document.createElement('a');
            link.download = `Slide_${i + 1}.png`;
            link.href = dataUrl;
            link.click();
            
        } catch (error) {
            console.error('Erro na renderização do slide:', error);
        }
        
        progressBar.style.width = `${((i + 1) / slides.length) * 100}%`;
        await new Promise(r => setTimeout(r, 600));
    }
    
    canvasPlane.style.transform = originalTransform;
    setTimeout(() => modal.classList.remove('show'), 500);
}