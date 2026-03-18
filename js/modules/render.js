import { AppState } from '../state.js';
import { saveState } from './history.js';

const imgBank = [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1080&auto=format&fit=crop"
];

const getImg = () => imgBank[Math.floor(Math.random() * imgBank.length)];

const getIcon = (idx) => {
    const iconNames = ['bar-chart-2', 'users', 'code', 'trending-up', 'check-circle', 'zap', 'shield'];
    return `<i data-lucide="${iconNames[idx % iconNames.length]}" style="width: 32px; height: 32px; color: currentColor;"></i>`;
};

// ==========================================
// ESTRUTURA A: TECH, MINIMAL, NEON, GLASS
// ==========================================
function buildStructureA(slide) {
    let bgHtml = ''; 
    let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput')?.value.trim() || 'seusite.com.br';

    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg()}" class="slide-bg-img editable-img" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `
            <div class="tag draggable" contenteditable="true" style="z-index:1000;">${slide.tag}</div>
            <h1 class="draggable" contenteditable="true" style="z-index:1000;">${slide.title}</h1>`;
    } 
    else if (slide.type === 'features') {
        const cards = (slide.items || []).slice(0, 3).map((i, idx) => `
            <div class="feature-card draggable">
                <div class="icon-box">${getIcon(idx)}</div>
                <div class="feature-text">
                    <h3 contenteditable="true">${i.title}:</h3> 
                    <p contenteditable="true">${i.desc}</p>
                </div>
            </div>`).join('');
        contentHtml = `
            <div class="top-img-container draggable"><img src="${getImg()}" class="top-banner editable-img" crossorigin="anonymous"></div>
            <h2 class="draggable" contenteditable="true">${slide.title}</h2>
            <p class="sub draggable" contenteditable="true">${slide.subtitle || ''}</p>
            <div class="features-list">${cards}</div>`;
    } 
    else if (slide.type === 'process') {
        const steps = (slide.items || []).slice(0, 4).map((i, idx) => `
            <div class="step-card draggable">
                <div class="step-num">${idx + 1}</div>
                <h3 contenteditable="true">${i.title}</h3>
                <p contenteditable="true">${i.desc}</p>
            </div>`).join('');
        // FIX: 'process-container' com padding superior para o número flutuante não ser cortado
        contentHtml = `
            <h2 class="draggable" contenteditable="true" style="margin-bottom: 20px;">${slide.title}</h2>
            <div class="process-container">
                <div class="grid">${steps}</div>
            </div>
            <p class="process-footer draggable" contenteditable="true">${slide.footerText || ''}</p>`;
    } 
    else if (slide.type === 'cta') {
        contentHtml = `
            <div class="top-img-container draggable"><img src="${getImg()}" class="top-banner editable-img" crossorigin="anonymous"></div>
            <h2 class="draggable" contenteditable="true" style="font-style: italic;">${slide.title}</h2>
            <p class="desc draggable" contenteditable="true">${slide.desc}</p>
            <div class="btn-cta draggable" contenteditable="true" style="z-index:1000;">${slide.button}</div>
            <p class="website-link draggable" contenteditable="true">${siteUrl}</p>`;
    }
    return bgHtml + `<div class="slide-content">${contentHtml}</div>`;
}

// ==========================================
// ESTRUTURA B: CORPORATE, NEWS, EDITORIAL, BOLD
// ==========================================
function buildStructureB(slide) {
    let bgHtml = ''; 
    let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput')?.value.trim() || 'seusite.com.br';

    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg()}" class="slide-bg-img editable-img" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `
            <div class="tag draggable" contenteditable="true">${slide.tag}</div>
            <h1 class="draggable" contenteditable="true">${slide.title}</h1>`;
    } 
    else if (slide.type === 'news' || slide.type === 'process') { // News ou Process (News adaptado)
        const bullets = (slide.bullets || (slide.items ? slide.items.map(i => i.title) : [])).map(b => `<li class="draggable" contenteditable="true">${b}</li>`).join('');
        contentHtml = `
            <div class="browser draggable">
                <div class="browser-header">
                    <span><i data-lucide="search" style="width:16px;"></i></span>
                    <span class="brand" contenteditable="true">NEWS <span>HUB</span></span>
                    <span><i data-lucide="user" style="width:16px;"></i></span>
                </div>
                <div class="headline" contenteditable="true">${slide.newsHeadline || slide.title}</div>
                <div class="subheadline" contenteditable="true">${slide.newsSub || 'Últimas atualizações do setor'}</div>
            </div>
            <h2 class="draggable" contenteditable="true">${slide.title}</h2>
            <ul class="news-bullets">${bullets}</ul>`;
    } 
    else if (slide.type === 'features') {
        const cards = (slide.items || []).slice(0, 3).map(i => `
            <div class="feature-card draggable">
                <h3 contenteditable="true">${i.title}:</h3> 
                <p contenteditable="true">${i.desc}</p>
            </div>`).join('');
        contentHtml = `
            <h2 class="draggable" contenteditable="true">${slide.title}</h2>
            <div class="features-list">${cards}</div>`;
    } 
    else if (slide.type === 'cta') {
        contentHtml = `
            <div class="top-img-container draggable"><img src="${getImg()}" class="top-banner editable-img" crossorigin="anonymous"></div>
            <h2 class="draggable" contenteditable="true" style="margin-bottom: 20px;">${slide.title}</h2>
            <p class="desc draggable" contenteditable="true" style="margin-bottom: 40px;">${slide.desc}</p>
            <div class="btn-cta draggable" contenteditable="true">${slide.button}</div>
            <p class="website-link draggable" contenteditable="true" style="margin-top: 30px; font-size: 24px; opacity: 0.6;">${siteUrl}</p>`;
    }
    return bgHtml + `<div class="slide-content">${contentHtml}</div>`;
}

// ==========================================
// RENDERIZADOR PRINCIPAL
// ==========================================
export function renderCarousel(data, template) {
    const container = document.getElementById('carouselContainer');
    container.innerHTML = '';

    const isStructureA = ['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass'].includes(template);

    data.slides.forEach((slide, index) => {
        const isLast = index === data.slides.length - 1;
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        
        const slideDiv = document.createElement('div');
        slideDiv.className = `slide ${template} slide-${slide.type}`;

        // Constrói o conteúdo baseado no template escolhido
        let slideHTML = isStructureA ? buildStructureA(slide) : buildStructureB(slide);
        
        // Configuração da Logo
        const logoContent = AppState.customLogoUrl 
            ? `<img src="${AppState.customLogoUrl}" class="custom-logo-img draggable">` 
            : `<span class="default-logo-text draggable" contenteditable="true">Sua Marca</span>`;

        // Rodapés Premium
        let footerHtml = isStructureA ? `
            <div class="slide-footer footer-tech">
                <div class="brand-logo-container">${logoContent}</div>
                ${!isLast ? `<div class="swipe-btn draggable">ARRASTA PARA O LADO &gt;</div>` : `<div></div>`}
            </div>
        ` : `
            <div class="slide-footer footer-corp">
                ${!isLast ? `<div class="swipe-btn draggable">ARRASTE PARA O LADO &gt;</div>` : ''}
                <div class="brand-logo-container">${logoContent}</div>
                ${isLast ? `<div class="source-link draggable" contenteditable="true">Fonte: Exame, 2024</div>` : ''}
            </div>
        `;

        // Guias de Alinhamento Ocultas
        const guidesHtml = `
            <div class="guide-line guide-v"></div>
            <div class="guide-line guide-h"></div>
        `;

        // CAMADA DE TEXTURA FÍSICA (Resolve o problema do Grain e Dots sumirem no export)
        const textureHtml = `
            <svg class="slide-texture-canvas" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="position:absolute; inset:0; z-index:9998; pointer-events:none; opacity:0.08; mix-blend-mode:overlay;">
                <filter id="noise${index}"><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/></filter>
                <rect width="100%" height="100%" filter="url(#noise${index})" />
                <pattern id="dots${index}" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="white" opacity="0.2" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#dots${index})" />
            </svg>`;

        slideDiv.innerHTML = slideHTML + footerHtml + guidesHtml + textureHtml;
        wrapper.appendChild(slideDiv);
        container.appendChild(wrapper);
    });

    window.lucide.createIcons();
    document.getElementById('btnDownload').style.display = 'flex';
    
    // Reseta histórico e salva estado inicial
    AppState.history = [];
    AppState.historyIndex = -1;
    saveState();
}
