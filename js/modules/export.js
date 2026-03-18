import { deselectElement } from './editor.js';
import { AppState } from '../state.js';

export async function downloadCarousel() {
    // 1. Limpeza da UI
    document.getElementById('elementToolbar').style.display = 'none';
    document.querySelectorAll('.guide-line').forEach(el => el.style.display = 'none');
    deselectElement(); 
    
    const modal = document.getElementById('exportModal');
    const progressBar = document.getElementById('exportProgressBar');
    const canvasPlane = document.getElementById('canvasPlane');
    
    // Mostra o modal de cortina (estilo Apple)
    modal.classList.add('show');
    progressBar.style.width = '0%';
    
    // 2. TRUQUE DE ESTABILIDADE
    // Salvamos como estava
    const originalTransform = canvasPlane.style.transform;
    
    // Resetamos para o tamanho real (1:1) para a foto sair perfeita
    // Usamos translate(0,0) para garantir que o slide 1 esteja no topo
    canvasPlane.style.transform = 'translate(0px, 0px) scale(1)';
    
    // Espera o navegador renderizar o layout em tamanho real e carregar as fontes
    await new Promise(r => setTimeout(r, 600));

    const slides = document.querySelectorAll('.slide');

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        try {
            // htmlToImage.toPng com tratamento de erros de CSS
            const dataUrl = await window.htmlToImage.toPng(slide, {
                quality: 1.0,
                pixelRatio: 2,
                width: 1080,
                height: 1350,
                // Isso garante que backgrounds complexos e SVGs inline sejam capturados
                cacheBust: true, 
                style: {
                    transform: 'none',
                }
            });
            
            const link = document.createElement('a');
            link.download = `Propositum_Slide_${i + 1}.png`;
            link.href = dataUrl;
            link.click();
            
        } catch (error) {
            console.error('Erro no slide', i + 1, error);
        }
        
        progressBar.style.width = `${((i + 1) / slides.length) * 100}%`;
        await new Promise(r => setTimeout(r, 400));
    }
    
    // 3. Restaura o estado visual do usuário
    canvasPlane.style.transform = originalTransform;
    
    await new Promise(r => setTimeout(r, 500));
    modal.classList.remove('show');
}