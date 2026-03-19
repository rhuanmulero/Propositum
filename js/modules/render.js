import { AppState } from '../state.js';
import { saveState } from './history.js';

// BANCO DE IMAGENS PREMIUM CURADO (Unsplash Alta Qualidade)
const premiumImageBank = {
    office:[ // Negócios, RH, Marketing, Finanças
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1080&auto=format&fit=crop"
    ],
    technology:[ // T.I, Programação, Sistemas
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080&auto=format&fit=crop"
    ],
    health:[ // Médicos, Clínicas, Odonto
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551076805-e16760c274f7?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584982751601-e403d5203fa1?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1080&auto=format&fit=crop"
    ],
    fitness:[ // Academias, Personal Trainer, Esportes
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1540497077202-7c8a39991c0e?q=80&w=1080&auto=format&fit=crop"
    ],
    food:[ // Restaurantes, Bares, Receitas
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1414235001250-11241a0a4c29?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1490818387583-1b050d56790a?q=80&w=1080&auto=format&fit=crop"
    ],
    realestate:[ // Corretores, Imóveis, Arquitetura
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1080&auto=format&fit=crop"
    ],
    pets:[ // Pet Shop, Veterinário
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1080&auto=format&fit=crop"
    ],
    education:[ // Escolas, Cursos, Professores
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1080&auto=format&fit=crop"
    ]
};

// Seletor Inteligente de Imagens
const getDynamicImg = (slideIndex, elementIndex, category) => {
    // Normaliza a categoria que a IA mandou (ou cai no padrão 'office')
    const safeCategory = premiumImageBank[category] ? category : 'office';
    const imagesArray = premiumImageBank[safeCategory];
    
    // Escolhe uma foto diferente para cada posição do carrossel
    const imgIndex = (slideIndex + elementIndex) % imagesArray.length;
    
    return imagesArray[imgIndex];
};

const getIcon = (idx) => {
    const iconNames =['bar-chart-2', 'users', 'code', 'trending-up', 'check-circle', 'zap', 'shield'];
    return `<i data-lucide="${iconNames[idx % iconNames.length]}" style="width: 32px; height: 32px; color: currentColor;"></i>`;
};

// ==========================================
// ESTRUTURA A: TECH, MINIMAL, NEON, GLASS
// ==========================================
function buildStructureA(slide, slideIndex, topic) {
    let bgHtml = ''; 
    let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput')?.value.trim() || (AppState.activeProfile ? AppState.activeProfile.website : 'seusite.com.br');

    // Helper interno para chamar a imagem da IA facilmente
    const getImg = (elIndex) => getDynamicImg(slideIndex, elIndex, topic);

    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg(1)}" class="slide-bg-img editable-img" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `
            <div class="tag draggable" contenteditable="true" style="z-index:1000;">${slide.tag}</div>
            <h1 class="draggable" contenteditable="true" style="z-index:1000;">${slide.title}</h1>`;
    } 
    else if (slide.type === 'features') {
        const cards = (slide.items ||[]).slice(0, 3).map((i, idx) => `
            <div class="feature-card draggable">
                <div class="icon-box">${getIcon(idx)}</div>
                <div class="feature-text">
                    <h3 contenteditable="true">${i.title}:</h3> 
                    <p contenteditable="true">${i.desc}</p>
                </div>
            </div>`).join('');
        contentHtml = `
            <div class="top-img-container draggable"><img src="${getImg(2)}" class="top-banner editable-img" crossorigin="anonymous"></div>
            <h2 class="draggable" contenteditable="true">${slide.title}</h2>
            <p class="sub draggable" contenteditable="true">${slide.subtitle || ''}</p>
            <div class="features-list">${cards}</div>`;
    } 
    else if (slide.type === 'process') {
        const steps = (slide.items ||[]).slice(0, 4).map((i, idx) => `
            <div class="step-card draggable">
                <div class="step-num">${idx + 1}</div>
                <h3 contenteditable="true">${i.title}</h3>
                <p contenteditable="true">${i.desc}</p>
            </div>`).join('');
        contentHtml = `
            <h2 class="draggable" contenteditable="true" style="margin-bottom: 20px;">${slide.title}</h2>
            <div class="process-container">
                <div class="grid">${steps}</div>
            </div>
            <p class="process-footer draggable" contenteditable="true">${slide.footerText || ''}</p>`;
    } 
    else if (slide.type === 'cta') {
        contentHtml = `
            <div class="top-img-container draggable"><img src="${getImg(3)}" class="top-banner editable-img" crossorigin="anonymous"></div>
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
function buildStructureB(slide, slideIndex, topic) {
    let bgHtml = ''; 
    let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput')?.value.trim() || 'seusite.com.br';

    // Helper interno
    const getImg = (elIndex) => getDynamicImg(slideIndex, elIndex, topic);

    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg(1)}" class="slide-bg-img editable-img" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `
            <div class="tag draggable" contenteditable="true">${slide.tag}</div>
            <h1 class="draggable" contenteditable="true">${slide.title}</h1>`;
    } 
    else if (slide.type === 'news' || slide.type === 'process') { 
        const bullets = (slide.bullets || (slide.items ? slide.items.map(i => i.title) :[])).map(b => `<li class="draggable" contenteditable="true">${b}</li>`).join('');
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
        const cards = (slide.items ||[]).slice(0, 3).map(i => `
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
            <div class="top-img-container draggable"><img src="${getImg(2)}" class="top-banner editable-img" crossorigin="anonymous"></div>
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
export function renderCarousel(data, template, topic = "tecnologia") { // <-- Topic Recebido aqui
    const container = document.getElementById('carouselContainer');
    container.innerHTML = '';

    const isStructureA =['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass'].includes(template);

    data.slides.forEach((slide, index) => {
        const isLast = index === data.slides.length - 1;
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        
        const slideDiv = document.createElement('div');
        slideDiv.className = `slide ${template} slide-${slide.type}`;

        // Passa o index e o tópico para a construção das estruturas
        let slideHTML = isStructureA ? buildStructureA(slide, index, topic) : buildStructureB(slide, index, topic);
        
        // Configuração da Logo
        const brandName = AppState.activeProfile ? AppState.activeProfile.name : "Sua Marca";
        
        const logoContent = AppState.customLogoUrl 
            ? `<img src="${AppState.customLogoUrl}" class="custom-logo-img draggable">` 
            : `<span class="default-logo-text draggable" contenteditable="true">${brandName}</span>`;

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

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'slide-controls';
        controlsDiv.innerHTML = `
            <button class="btn-slide-control" data-action="duplicate" title="Duplicar Slide"><i data-lucide="copy"></i></button>
            <button class="btn-slide-control" data-action="add" title="Adicionar Slide Vazio"><i data-lucide="plus"></i></button>
            <button class="btn-slide-control delete" data-action="remove" title="Remover Slide"><i data-lucide="trash-2"></i></button>
        `;
        
        wrapper.appendChild(controlsDiv);
        container.appendChild(wrapper);
    });

    window.lucide.createIcons();
    document.getElementById('btnDownload').style.display = 'flex';
    
    // Reseta histórico e salva estado inicial
    AppState.history = [];
    AppState.historyIndex = -1;
    saveState();
}
