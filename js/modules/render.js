import { AppState } from '../state.js';

const imgBank =[
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1080&auto=format&fit=crop"
];
const getImg = () => imgBank[Math.floor(Math.random() * imgBank.length)];
const getIcon = (idx) => {
    const iconNames =['bar-chart-2', 'users', 'code', 'trending-up', 'check-circle'];
    return `<i data-lucide="${iconNames[idx % iconNames.length]}" style="width: 32px; height: 32px; color: currentColor;"></i>`;
};

function buildStructureA(slide) {
    let bgHtml = ''; let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput').value.trim() || 'seusite.com.br';

    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg()}" class="slide-bg-img editable-img" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `<div class="tag draggable" contenteditable="true" spellcheck="false">${slide.tag}</div>
                       <h1 class="draggable" contenteditable="true" spellcheck="false">${slide.title}</h1>`;
    } else if (slide.type === 'features') {
        const cards = slide.items.slice(0, 3).map((i, idx) => {
            return `<div class="feature-card draggable">
                <div class="icon-box">${getIcon(idx)}</div>
                <div class="feature-text"><h3 contenteditable="true" spellcheck="false">${i.title}:</h3> <p contenteditable="true" spellcheck="false">${i.desc}</p></div>
            </div>`;
        }).join('');
        contentHtml = `<div class="top-img-container draggable"><img src="${getImg()}" class="top-banner editable-img" crossorigin="anonymous"></div>
        <h2 class="draggable" contenteditable="true" spellcheck="false">${slide.title}</h2>
        <p class="sub draggable" contenteditable="true" spellcheck="false">${slide.subtitle}</p>${cards}`;
    } else if (slide.type === 'process') {
        const steps = slide.items.map((i, idx) => `<div class="step-card draggable"><div class="step-num">${idx+1}</div><h3 contenteditable="true" spellcheck="false">${i.title}</h3><p contenteditable="true" spellcheck="false">${i.desc}</p></div>`).join('');
        contentHtml = `<h2 class="draggable" contenteditable="true" spellcheck="false">${slide.title}</h2>
        <p class="sub draggable" contenteditable="true" spellcheck="false">${slide.subtitle}</p>
        <div class="grid">${steps}</div>
        ${slide.footerText ? `<p class="process-footer draggable" contenteditable="true" spellcheck="false">${slide.footerText}</p>` : ''}`;
    } else if (slide.type === 'cta') {
        contentHtml = `<div class="top-img-container draggable"><img src="${getImg()}" class="top-banner editable-img" crossorigin="anonymous"></div>
        <h2 class="draggable" contenteditable="true" spellcheck="false">${slide.title}</h2>
        <p class="desc draggable" contenteditable="true" spellcheck="false">${slide.desc}</p>
        <button class="btn-cta draggable" contenteditable="true" spellcheck="false">${slide.button}</button>
        <p class="website-link draggable" contenteditable="true" spellcheck="false">${siteUrl}</p>`;
    }
    return bgHtml + `<div class="slide-content">${contentHtml}</div>`;
}

function buildStructureB(slide) {
    let bgHtml = ''; let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput').value.trim() || 'seusite.com.br';

    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg()}" class="slide-bg-img editable-img" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `<div class="tag draggable" contenteditable="true" spellcheck="false">${slide.tag}</div>
                       <h1 class="draggable" contenteditable="true" spellcheck="false">${slide.title}</h1>`;
    } else if (slide.type === 'news') {
        const bullets = slide.bullets.map(b => `<li class="draggable" contenteditable="true" spellcheck="false">${b}</li>`).join('');
        contentHtml = `
            <div class="browser draggable">
                <div class="browser-header">
                    <span><i data-lucide="search" style="width:16px;"></i> Buscar</span>
                    <span class="brand" contenteditable="true" spellcheck="false">Valor <span>Dino</span></span>
                    <span><i data-lucide="user" style="width:16px;"></i> Entrar</span>
                </div>
                <div class="headline" contenteditable="true" spellcheck="false">${slide.newsHeadline}</div>
                <div class="subheadline" contenteditable="true" spellcheck="false">${slide.newsSub}</div>
            </div>
            <h2 class="draggable" contenteditable="true" spellcheck="false">${slide.title}</h2><ul class="news-bullets">${bullets}</ul>
        `;
    } else if (slide.type === 'features') {
        const cards = slide.items.slice(0, 3).map(i => `<div class="feature-card draggable"><h3 contenteditable="true" spellcheck="false">${i.title}:</h3> <p contenteditable="true" spellcheck="false">${i.desc}</p></div>`).join('');
        contentHtml = `<h2 class="draggable" contenteditable="true" spellcheck="false">${slide.title}</h2><div class="features-list">${cards}</div>`;
    } else if (slide.type === 'cta') {
        contentHtml = `<div class="top-img-container draggable"><img src="${getImg()}" class="top-banner editable-img" crossorigin="anonymous"></div>
        <h2 class="draggable" contenteditable="true" spellcheck="false">${slide.title}</h2>
        <p class="desc draggable" contenteditable="true" spellcheck="false">${slide.desc}</p>
        <button class="btn-cta draggable" contenteditable="true" spellcheck="false">${slide.button}</button>
        <p class="website-link draggable" contenteditable="true" spellcheck="false" style="margin-top: 30px; font-size: 26px;">${siteUrl}</p>`;
    }
    return bgHtml + `<div class="slide-content">${contentHtml}</div>`;
}

export function renderCarousel(data, template) {
    const container = document.getElementById('carouselContainer');
    container.innerHTML = '';

    const isStructureA =['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass'].includes(template);

    data.slides.forEach((slide, index) => {
        const isLast = index === data.slides.length - 1;
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        
        const slideDiv = document.createElement('div');
        let slideClassType = slide.type;
        if(isStructureA && slide.type === 'news') slideClassType = 'features';
        if(!isStructureA && slide.type === 'process') slideClassType = 'features';
        
        slideDiv.className = `slide ${template} slide-${slideClassType}`;

        let slideHTML = isStructureA ? buildStructureA(slide) : buildStructureB(slide);
        
        const logoContent = AppState.customLogoUrl ? `<img src="${AppState.customLogoUrl}" class="custom-logo-img draggable">` : `<span class="default-logo-text draggable" contenteditable="true" spellcheck="false">Sua Marca</span>`;

        let footerHtml = isStructureA ? `
            <div class="slide-footer footer-tech">
                <div class="brand-logo-container">${logoContent}</div>
                ${!isLast ? `<div class="swipe-btn draggable">ARRASTA PARA O LADO &gt;</div>` : `<div></div>`}
            </div>
        ` : `
            <div class="slide-footer footer-corp">
                ${!isLast ? `<div class="swipe-btn draggable">ARRASTE PARA O LADO &gt;</div>` : ''}
                <div class="brand-logo-container">${logoContent}</div>
                ${isLast ? `<div class="source-link draggable" contenteditable="true" spellcheck="false">Fonte da notícia: https://noticia.com.br</div>` : ''}
            </div>
        `;

        const guidesHtml = `
            <div class="guide-line guide-v"></div>
            <div class="guide-line guide-h"></div>
        `;

        slideDiv.innerHTML = slideHTML + footerHtml + guidesHtml;
        wrapper.appendChild(slideDiv);
        container.appendChild(wrapper);
    });

    window.lucide.createIcons();
    document.getElementById('btnDownload').style.display = 'flex';
}