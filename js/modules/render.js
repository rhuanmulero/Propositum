import { AppState } from '../state.js';
import { saveState } from './history.js';

const premiumImageBank = {
    office:["https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1080&auto=format&fit=crop", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1080&auto=format&fit=crop", "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1080&auto=format&fit=crop"],
    technology:["https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1080&auto=format&fit=crop", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1080&auto=format&fit=crop", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080&auto=format&fit=crop"],
    health:["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1080&auto=format&fit=crop", "https://images.unsplash.com/photo-1551076805-e16760c274f7?q=80&w=1080&auto=format&fit=crop"],
    fitness:["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1080&auto=format&fit=crop", "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1080&auto=format&fit=crop"],
    food:["https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1080&auto=format&fit=crop", "https://images.unsplash.com/photo-1414235001250-11241a0a4c29?q=80&w=1080&auto=format&fit=crop"],
    realestate:["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1080&auto=format&fit=crop", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1080&auto=format&fit=crop"]
};

// Pega imagens aleatórias com alto grau de variação
const getDynamicImg = (slideIndex, elementIndex, category) => {
    const safeCategory = premiumImageBank[category] ? category : 'office';
    const imagesArray = premiumImageBank[safeCategory];
    const imgIndex = (slideIndex * 5 + elementIndex + Math.floor(Math.random() * 20)) % imagesArray.length;
    return imagesArray[imgIndex];
};

const getIcon = (idx) => {
    const iconNames =['chevron-right', 'check', 'arrow-up-right', 'zap', 'target', 'compass', 'layers', 'box', 'cpu'];
    return `<i data-lucide="${iconNames[idx % iconNames.length]}" style="width: 28px; height: 28px; color: currentColor;"></i>`;
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ==========================================
// REGRAS DE ESTILO (A PELE DO DESIGN)
// ==========================================
const THEME_RULES = {
    'layout-tech': {
        card: 'background: rgba(var(--brand-rgb), 0.1); border: 1px solid rgba(var(--brand-rgb), 0.3); border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);',
        image: 'border-radius: 24px;',
        title: 'font-weight: 800; letter-spacing: -0.02em;',
        button: 'background: var(--brand-color); color: #fff; border-radius: 50px; font-weight: 800; border: none; box-shadow: 0 10px 30px rgba(var(--brand-rgb), 0.4);',
        iconWrap: 'width: 50px; height: 50px; background: var(--brand-color); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center;'
    },
    'layout-corp': {
        card: 'background: #fff; color: #000; border: 1px solid #e5e5e5; border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.1);',
        image: 'border-radius: 12px;',
        title: 'font-family: "PT Serif", serif; font-weight: 700;',
        button: 'background: transparent; color: var(--text-color); border: 2px solid var(--text-color); border-radius: 8px; font-weight: 700;',
        iconWrap: 'color: var(--brand-color); margin-bottom: 10px; display: inline-block;'
    },
    'layout-minimal': {
        card: 'background: rgba(var(--text-rgb), 0.02); border: 1px solid rgba(var(--text-rgb), 0.1); border-left: 4px solid var(--brand-color); border-radius: 0;',
        image: 'border-radius: 0px;',
        title: 'font-weight: 600; letter-spacing: -0.03em;',
        button: 'background: var(--text-color); color: var(--bg-color); border-radius: 0; border: none; font-weight: 600;',
        iconWrap: 'display: none;' // Minimalista oculta os ícones
    },
    'layout-neon': {
        card: 'background: rgba(0,0,0,0.6); border: 1px solid var(--brand-color); border-radius: 0; box-shadow: 0 0 20px rgba(var(--brand-rgb), 0.3);',
        image: 'border-radius: 0; border: 1px solid var(--brand-color); mix-blend-mode: luminosity;',
        title: 'font-weight: 900; text-shadow: 0 0 10px rgba(var(--brand-rgb), 0.6); color: #fff;',
        button: 'background: transparent; color: var(--brand-color); border: 2px solid var(--brand-color); border-radius: 0; text-transform: uppercase; font-family: monospace; box-shadow: 0 0 15px rgba(var(--brand-rgb), 0.4);',
        iconWrap: 'color: var(--brand-color); filter: drop-shadow(0 0 8px var(--brand-color)); margin-bottom: 15px; display: inline-block;'
    },
    'layout-editorial': {
        card: 'background: transparent; border: none; border-bottom: 1px solid var(--text-color); border-radius: 0; padding-left: 0; padding-right: 0;',
        image: 'border-radius: 0; filter: sepia(30%) contrast(110%); border: 1px solid var(--text-color);',
        title: 'font-family: "PT Serif", serif; font-weight: 700; font-style: italic;',
        button: 'background: var(--text-color); color: var(--bg-color); border-radius: 0; border: none; text-transform: uppercase; letter-spacing: 2px;',
        iconWrap: 'display: none;'
    },
    'layout-glass': {
        card: 'background: rgba(255,255,255,0.05); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.2); border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);',
        image: 'border-radius: 32px;',
        title: 'font-weight: 800;',
        button: 'background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 100px; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.2);',
        iconWrap: 'width: 50px; height: 50px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;'
    },
    'layout-bold': {
        card: 'background: var(--bg-color); color: var(--text-color); border: 4px solid var(--text-color); border-radius: 0; box-shadow: 10px 10px 0 var(--text-color);',
        image: 'border-radius: 0; border: 4px solid var(--text-color); filter: grayscale(100%);',
        title: 'font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 0.9;',
        button: 'background: var(--text-color); color: var(--bg-color); border: 4px solid var(--text-color); border-radius: 0; text-transform: uppercase; font-weight: 900; box-shadow: 8px 8px 0 var(--brand-color);',
        iconWrap: 'width: 50px; height: 50px; background: var(--text-color); color: var(--bg-color); display: flex; align-items: center; justify-content: center; border-radius: 0;'
    }
};

// ==========================================
// O MOTOR ABSOLUTO: ESTRUTURAS RANDÔMICAS + ESTILOS INJETADOS
// ==========================================
function buildUltimateLayout(slide, slideIndex, template, topic) {
    let bgHtml = '';
    let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput')?.value.trim() || 'seusite.com.br';
    
    const imgUrl1 = getDynamicImg(slideIndex, 0, topic);
    const imgUrl2 = getDynamicImg(slideIndex, 1, topic);
    const theme = THEME_RULES[template] || THEME_RULES['layout-tech'];

    // --- CAPA (COVER) ---
    if (slide.type === 'cover') {
        const coverLayouts =['centered-pill', 'magazine-overlap', 'split-horizontal', 'brutalist-block', 'overlay-classic', 'side-image'];
        const layout = pickRandom(coverLayouts);

        const titleHtml = `<h1 class="draggable" contenteditable="true" style="${theme.title} font-size: clamp(70px, 8vw, 110px);">${slide.title}</h1>`;
        const tagHtml = `<div class="tag draggable" contenteditable="true" style="padding: 10px 20px; font-weight: bold; margin-bottom: 25px; display: inline-block; ${theme.button}">${slide.tag || 'ALERTA'}</div>`;

        if (layout === 'centered-pill') {
            bgHtml = `<img src="${imgUrl1}" class="slide-bg-img editable-img" crossorigin="anonymous" style="opacity: 0.2; filter: blur(10px);"><div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="align-items: center; justify-content: center; text-align: center;">
                    <div class="draggable" style="width: 300px; height: 450px; overflow: hidden; margin-bottom: 40px; ${theme.image}">
                        <img src="${imgUrl2}" class="editable-img" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    ${tagHtml}${titleHtml}
                </div>`;
        } 
        else if (layout === 'magazine-overlap') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div style="position: absolute; top: 10%; right: -5%; width: 75%; height: 60%; z-index: 1;">
                    <img src="${imgUrl1}" class="editable-img draggable" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover; ${theme.image} box-shadow: -20px 20px 60px rgba(0,0,0,0.5);">
                </div>
                <div class="slide-content" style="justify-content: flex-end; align-items: flex-start; text-align: left; z-index: 10; padding-right: 150px; padding-bottom: 120px;">
                    ${tagHtml}${titleHtml}
                </div>`;
        }
        else if (layout === 'split-horizontal') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div style="position: absolute; top:0; left:0; width:100%; height:50%; z-index: 1;">
                    <img src="${imgUrl1}" class="editable-img draggable" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover; ${theme.image}">
                    <div style="position:absolute; inset:0; background: linear-gradient(to bottom, transparent, var(--bg-color));"></div>
                </div>
                <div class="slide-content" style="justify-content: flex-end; align-items: center; text-align: center; padding-bottom: 100px; z-index: 10;">
                    ${tagHtml}${titleHtml}
                </div>`;
        }
        else if (layout === 'brutalist-block') {
            bgHtml = `<div style="position:absolute; inset:0; background: var(--brand-color); z-index:1;"></div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: center; align-items: flex-start; z-index: 10; text-align: left;">
                    <div style="background: var(--bg-color); color: var(--text-color); padding: 60px; width: 100%; ${theme.card}">
                        ${tagHtml}
                        ${titleHtml.replace('color: #fff;', 'color: var(--text-color);')}
                    </div>
                </div>`;
        }
        else if (layout === 'side-image') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="flex-direction: row; gap: 40px; align-items: center; justify-content: space-between;">
                    <div style="flex: 1.2; text-align: left;">
                        ${tagHtml}${titleHtml}
                    </div>
                    <div class="draggable" style="flex: 1; height: 60%; ${theme.image} overflow: hidden;">
                         <img src="${imgUrl1}" class="editable-img" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                </div>`;
        }
        else {
            // overlay-classic
            bgHtml = `<img src="${imgUrl1}" class="slide-bg-img editable-img" crossorigin="anonymous" style="opacity: 0.5;"><div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: flex-end; align-items: flex-start; text-align: left; padding-bottom: 100px;">
                    ${tagHtml}${titleHtml}
                </div>`;
        }
    } 
    
    // --- MEIO (FEATURES/PROCESS/NEWS) ---
    else if (slide.type === 'features' || slide.type === 'process' || slide.type === 'news') {
        const contentLayouts =['grid-2x2', 'vertical-stack', 'side-by-side', 'staggered-masonry', 'giant-numbers', 'zigzag'];
        const layout = pickRandom(contentLayouts);

        const items = slide.items ||[];
        if (slide.type === 'news' && slide.bullets) slide.bullets.forEach(b => items.push({ title: b, desc: '' }));

        const mainTitle = `<h2 class="draggable" contenteditable="true" style="${theme.title} font-size: 60px; margin-bottom: 40px; line-height: 1.1;">${slide.title}</h2>`;

        // Renderizador de Card (injeta os estilos do tema)
        const renderCard = (i, idx, extraStyle = '') => `
            <div class="draggable" style="${theme.card} padding: 30px; display: flex; flex-direction: column; gap: 15px; ${extraStyle}">
                <div style="${theme.iconWrap}">
                    ${slide.type === 'process' ? `<span style="font-weight:900; font-size:24px;">${idx + 1}</span>` : getIcon(idx)}
                </div>
                <h3 contenteditable="true" style="${theme.title} font-size: 26px;">${i.title}</h3>
                ${i.desc ? `<p contenteditable="true" style="font-size: 20px; opacity: 0.8; line-height: 1.4;">${i.desc}</p>` : ''}
            </div>`;

        if (layout === 'grid-2x2') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: center;">
                    ${mainTitle}
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; width: 100%;">
                        ${items.slice(0, 4).map((i, idx) => renderCard(i, idx)).join('')}
                    </div>
                </div>`;
                
        } else if (layout === 'vertical-stack') {
            bgHtml = `<img src="${imgUrl1}" class="slide-bg-img editable-img" crossorigin="anonymous" style="opacity: 0.15;"><div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: center;">
                    ${mainTitle}
                    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
                        ${items.map((i, idx) => renderCard(i, idx, 'flex-direction: row; align-items: center;')).join('')}
                    </div>
                </div>`;
                
        } else if (layout === 'side-by-side') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="flex-direction: row; gap: 50px; align-items: center;">
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        ${mainTitle}
                        <div class="draggable" style="width: 100%; height: 400px; ${theme.image} overflow: hidden; margin-top: 20px;">
                            <img src="${imgUrl1}" class="editable-img" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    </div>
                    <div style="flex: 1.2; display: flex; flex-direction: column; gap: 20px;">
                        ${items.slice(0, 3).map((i, idx) => renderCard(i, idx)).join('')}
                    </div>
                </div>`;
                
        } else if (layout === 'staggered-masonry') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: center; text-align: center;">
                    ${mainTitle}
                    <div style="display: flex; gap: 30px; width: 100%; text-align: left;">
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 30px;">
                            ${items.filter((_, idx) => idx % 2 === 0).map((i, idx) => renderCard(i, idx)).join('')}
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 30px; margin-top: 50px;">
                            ${items.filter((_, idx) => idx % 2 !== 0).map((i, idx) => renderCard(i, idx)).join('')}
                        </div>
                    </div>
                </div>`;
                
        } else if (layout === 'giant-numbers') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: center;">
                    ${mainTitle}
                    <div style="display: flex; flex-direction: column; gap: 30px; width: 100%; margin-top: 20px;">
                        ${items.map((i, idx) => `
                            <div class="draggable" style="${theme.card} display: flex; align-items: center; gap: 30px; padding: 30px;">
                                <div style="${theme.title} font-size: 70px; color: transparent; -webkit-text-stroke: 2px var(--brand-color); line-height: 0.8;">0${idx + 1}</div>
                                <div>
                                    <h3 contenteditable="true" style="${theme.title} font-size: 28px; margin-bottom: 8px;">${i.title}</h3>
                                    ${i.desc ? `<p contenteditable="true" style="font-size: 20px; opacity: 0.8;">${i.desc}</p>` : ''}
                                </div>
                            </div>`).join('')}
                    </div>
                </div>`;
                
        } else if (layout === 'zigzag') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: center;">
                    <div style="text-align: center; width: 100%;">${mainTitle}</div>
                    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
                        ${items.map((i, idx) => {
                            const align = idx % 2 === 0 ? 'flex-start' : 'flex-end';
                            return `<div style="align-self: ${align}; width: 85%;">${renderCard(i, idx)}</div>`;
                        }).join('')}
                    </div>
                </div>`;
        }
    } 
    
    // --- FINAL (CTA) ---
    else if (slide.type === 'cta') {
        const ctaLayouts =['massive-button', 'split-bottom', 'floating-box', 'minimal-punch'];
        const layout = pickRandom(ctaLayouts);

        const titleHtml = `<h2 class="draggable" contenteditable="true" style="${theme.title} font-size: 75px; margin-bottom: 25px; line-height: 1.1;">${slide.title}</h2>`;
        const descHtml = `<p class="desc draggable" contenteditable="true" style="font-size: 28px; margin-bottom: 50px; opacity: 0.8;">${slide.desc}</p>`;
        const btnHtml = `<div class="btn-cta draggable" contenteditable="true" style="${theme.button} padding: 25px 60px; font-size: 30px; display: inline-block;">${slide.button}</div>`;
        const linkHtml = `<p class="website-link draggable" contenteditable="true" style="margin-top: 40px; font-size: 20px; opacity: 0.6; font-family: 'Inter'; font-weight: 600;">${siteUrl}</p>`;

        if (layout === 'massive-button') {
            bgHtml = `<img src="${imgUrl1}" class="slide-bg-img editable-img" crossorigin="anonymous" style="opacity: 0.2;"><div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="align-items: center; justify-content: center; text-align: center;">
                    ${titleHtml}${descHtml}
                    <div class="btn-cta draggable" contenteditable="true" style="${theme.button} width: 90%; padding: 40px; font-size: 40px;">${slide.button}</div>
                    ${linkHtml}
                </div>`;
                
        } else if (layout === 'split-bottom') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div style="position: absolute; top:0; left:0; width:100%; height:45%; z-index: 1;">
                    <img src="${imgUrl1}" class="editable-img draggable" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover; ${theme.image} border-top-left-radius: 0; border-top-right-radius: 0;">
                </div>
                <div class="slide-content" style="justify-content: flex-end; align-items: center; text-align: center; padding-bottom: 80px; z-index: 10;">
                    ${titleHtml}${descHtml}${btnHtml}${linkHtml}
                </div>`;
                
        } else if (layout === 'floating-box') {
            bgHtml = `<img src="${imgUrl2}" class="slide-bg-img editable-img" crossorigin="anonymous" style="opacity: 0.6;"><div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="align-items: center; justify-content: center;">
                    <div class="draggable" style="${theme.card} text-align: center; width: 100%; padding: 60px;">
                        ${titleHtml}${descHtml}${btnHtml}${linkHtml}
                    </div>
                </div>`;
                
        } else if (layout === 'minimal-punch') {
            bgHtml = `<div class="slide-gradient"></div>`;
            contentHtml = `
                <div class="slide-content" style="align-items: flex-start; justify-content: center; text-align: left;">
                    <div class="draggable" style="width: 100px; height: 100px; ${theme.card} display: flex; align-items: center; justify-content: center; margin-bottom: 40px; padding: 0;">
                        <i data-lucide="arrow-up-right" style="width: 50px; height: 50px;"></i>
                    </div>
                    ${titleHtml}${descHtml}${btnHtml}${linkHtml}
                </div>`;
        }
    }

    return bgHtml + contentHtml;
}

// ==========================================
// RENDERIZADOR PRINCIPAL
// ==========================================
export function renderCarousel(data, template, topic = "tecnologia") {
    const container = document.getElementById('carouselContainer');
    container.innerHTML = '';

    (data.slides ||[]).forEach((slide, index) => {
        const isLast = index === (data.slides.length - 1);
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        
        const slideDiv = document.createElement('div');
        // Mantém a classe do template para o CSS base funcionar
        slideDiv.className = `slide ${template} slide-${slide.type}`;

        // MÁGICA: GERA A ESTRUTURA COM AS REGRAS DO TEMA
        let slideHTML = buildUltimateLayout(slide, index, template, topic);
        
        const brandName = AppState.activeProfile ? AppState.activeProfile.name : "Sua Marca";
        const logoContent = AppState.customLogoUrl 
            ? `<img src="${AppState.customLogoUrl}" class="custom-logo-img draggable">` 
            : `<span class="default-logo-text draggable" contenteditable="true" style="font-family: 'Montserrat'; font-weight: 900;">${brandName}</span>`;

        // Rodapé Universal Inteligente
        let footerHtml = `
            <div class="slide-footer footer-tech" style="position: absolute; bottom: 0; left: 0; width: 100%; z-index: 50; padding: 0 60px 50px 60px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div class="brand-logo-container" style="height: 50px;">${logoContent}</div>
                ${!isLast ? `<div class="swipe-btn draggable" style="background: rgba(var(--bg-rgb), 0.5); backdrop-filter: blur(10px); border: ${template === 'layout-bold' ? '4px solid var(--text-color)' : '1px solid rgba(var(--text-rgb), 0.2)'}; border-radius: ${template === 'layout-bold' || template === 'layout-minimal' || template === 'layout-editorial' ? '0' : '50px'}; padding: 12px 24px; font-size: 16px; font-family: 'Inter'; font-weight: 700;">ARRASTA &gt;</div>` : `<div></div>`}
            </div>
        `;

        const guidesHtml = `<div class="guide-line guide-v"></div><div class="guide-line guide-h"></div>`;

        const textureHtml = `
            <svg class="slide-texture-canvas" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="position:absolute; inset:0; z-index:9998; pointer-events:none; opacity:0.06; mix-blend-mode:overlay;">
                <filter id="noise${index}"><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/></filter>
                <rect width="100%" height="100%" filter="url(#noise${index})" />
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
    
    // Reseta histórico para Ctrl+Z funcionar
    AppState.history = [];
    AppState.historyIndex = -1;
    saveState();
}
