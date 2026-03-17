import { deselectElement } from './editor.js';

export async function downloadCarousel() {
    const btn = document.getElementById('btnDownload');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Processando';
    btn.disabled = true;
    window.lucide.createIcons();

    document.getElementById('imageToolbar').style.display = 'none';
    document.querySelectorAll('.guide-line').forEach(el => el.style.display = 'none');
    if (document.activeElement) document.activeElement.blur();
    window.getSelection().removeAllRanges(); 

    // Oculte a bounding box antes de renderizar a imagem:
    deselectElement();

    const slides = document.querySelectorAll('.slide');
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        const originalTransform = slide.style.transform;
        slide.style.transform = 'none';
        
        const canvas = await window.html2canvas(slide, { width: 1080, height: 1350, scale: 1, useCORS: true, backgroundColor: null });
        
        slide.style.transform = originalTransform;

        const link = document.createElement('a');
        link.download = `Propositum_Slide_${i + 1}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        await new Promise(r => setTimeout(r, 400));
    }
    
    btn.innerHTML = originalContent;
    btn.disabled = false;
    window.lucide.createIcons();
}