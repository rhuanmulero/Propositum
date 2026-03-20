import { deselectElement } from './editor.js';
import { AppState } from '../state.js';

export async function downloadCarousel() {
    deselectElement(); 
    document.getElementById('elementToolbar').style.display = 'none';

    const fixStyle = document.createElement('style');
    fixStyle.innerHTML = `
        .slide * { 
            backdrop-filter: none !important; 
            -webkit-backdrop-filter: none !important; 
        }
    `;
    document.head.appendChild(fixStyle);

    const modal = document.getElementById('exportModal');
    const progressBar = document.getElementById('exportProgressBar');
    modal.classList.add('show');
    progressBar.style.width = '5%';

    const canvasPlane = document.getElementById('canvasPlane');
    const originalTransform = canvasPlane.style.transform;
    
    // Reseta o zoom e a posição para o print sair perfeito
    canvasPlane.style.transform = 'translate(0px, 0px) scale(1)';
    
    await new Promise(r => setTimeout(r, 1000));

    // --- MÁGICA 1: Bypass de CORS (Imagens do Unsplash) ---
    const allImages = document.querySelectorAll('.slide img');
    const originalSrcs = new Map();

    for (let img of allImages) {
        if (img.src.startsWith('http')) {
            originalSrcs.set(img, img.src); 
            try {
                const response = await fetch(img.src, { mode: 'cors', cache: 'no-cache' });
                const blob = await response.blob();
                const base64data = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                img.src = base64data; 
            } catch (e) {
                console.warn('Falha ao converter imagem:', e);
            }
        }
    }

    // --- MÁGICA 2: Esconder SVGs complexos que travam a exportação ---
    // A biblioteca html-to-image "congela" silenciosamente quando tenta processar <feTurbulence>
    const svgs = document.querySelectorAll('.slide-texture-canvas');
    svgs.forEach(svg => svg.style.display = 'none');

    progressBar.style.width = '20%';
    const slides = document.querySelectorAll('.slide');

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        try {
            const dataUrl = await window.htmlToImage.toPng(slide, {
                pixelRatio: 3, 
                quality: 1.0,
                width: 1080,
                height: 1350,
                style: { transform: 'none', margin: '0' }
            });
            
            const link = document.createElement('a');
            link.download = `Slide_${i + 1}.png`;
            link.href = dataUrl;
            link.click();
            
        } catch (error) {
            console.error('Erro na renderização do slide:', error);
        }
        
        progressBar.style.width = `${20 + (((i + 1) / slides.length) * 80)}%`;
        await new Promise(r => setTimeout(r, 600));
    }
    
    // Restaura as imagens e texturas originais para a tela
    for (let [img, originalSrc] of originalSrcs.entries()) {
        img.src = originalSrc;
    }
    svgs.forEach(svg => svg.style.display = 'block');

    canvasPlane.style.transform = originalTransform;
    document.head.removeChild(fixStyle); 
    setTimeout(() => modal.classList.remove('show'), 500);
}