import { deselectElement } from './editor.js';

export async function downloadCarousel() {
    const btn = document.getElementById('btnDownload');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Processando';
    btn.disabled = true;
    window.lucide.createIcons();

    // Limpeza da UI
    document.getElementById('imageToolbar').style.display = 'none';
    document.querySelectorAll('.guide-line').forEach(el => el.style.display = 'none');
    deselectElement(); 
    if (document.activeElement) document.activeElement.blur();
    window.getSelection().removeAllRanges(); 

    const slides = document.querySelectorAll('.slide');
    
    // Criar um container temporário para isolar o slide durante a captura
    const exportWrapper = document.createElement('div');
    exportWrapper.style.position = 'absolute';
    exportWrapper.style.top = '-9999px';
    exportWrapper.style.left = '-9999px';
    document.body.appendChild(exportWrapper);

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Clona o slide para não modificar o original na tela
        const clone = slide.cloneNode(true);
        
        // Remove estilos que podem causar conflito com o html2canvas
        clone.style.transform = 'none'; 
        clone.style.margin = '0';
        clone.style.left = '0';
        clone.style.top = '0';
        
        exportWrapper.appendChild(clone);
        
        // Renderiza o clone
        const canvas = await window.html2canvas(clone, { 
            width: 1080, 
            height: 1350, 
            scale: 1, 
            useCORS: true, 
            backgroundColor: '#000000' // Ajuste conforme a cor de fundo padrão
        });
        
        // Faz o download
        const link = document.createElement('a');
        link.download = `Propositum_Slide_${i + 1}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        // Remove o clone do container de exportação
        exportWrapper.removeChild(clone);
        
        await new Promise(r => setTimeout(r, 500));
    }
    
    // Limpa o container temporário
    document.body.removeChild(exportWrapper);
    
    btn.innerHTML = originalContent;
    btn.disabled = false;
    window.lucide.createIcons();
}
