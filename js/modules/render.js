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

// ==========================================
// PADRÕES DE TEXTURA DE FUNDO (BASE)
// ==========================================
function getBackgroundPatterns(template) {
    let html = '';
    switch(template) {
        case 'layout-tech':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; width: 1080px; height: 1350px; left: 0; top: 0; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; z-index: 1;"></div>`;
            break;
        case 'layout-corp':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; width: 1080px; height: 1350px; left: 0; top: 0; background: repeating-linear-gradient(45deg, rgba(var(--text-rgb), 0.02) 0px, rgba(var(--text-rgb), 0.02) 2px, transparent 2px, transparent 12px); z-index: 1;"></div>`;
            break;
        case 'layout-minimal':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; width: 1080px; height: 1350px; left: 0; top: 0; background-image: radial-gradient(rgba(var(--text-rgb), 0.08) 2px, transparent 2px); background-size: 30px 30px; z-index: 1;"></div>`;
            break;
        case 'layout-neon':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; width: 1080px; height: 1350px; left: 0; top: 0; background-image: linear-gradient(rgba(var(--brand-rgb), 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--brand-rgb), 0.15) 1px, transparent 1px); background-size: 50px 50px; z-index: 1;"></div>`;
            break;
        case 'layout-editorial':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; width: 1080px; height: 1350px; left: 0; top: 0; background: radial-gradient(circle, transparent 60%, rgba(0,0,0,0.15) 150%); z-index: 1;"></div>`;
            html += `<div class="draggable shape-element texture-element" style="position: absolute; top: 40px; left: 40px; width: 1000px; height: 1270px; border: 1px solid rgba(var(--text-rgb), 0.1); z-index: 1;"></div>`;
            break;
        case 'layout-glass':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; top: 100px; left: 100px; width: 500px; height: 500px; background: var(--brand-color); opacity: 0.35; filter: blur(120px); z-index: 1; border-radius: 50%;"></div>`;
            html += `<div class="draggable shape-element texture-element" style="position: absolute; bottom: 100px; right: 100px; width: 400px; height: 400px; background: #ffffff; opacity: 0.15; filter: blur(100px); z-index: 1; border-radius: 50%;"></div>`;
            break;
        case 'layout-bold':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; width: 1080px; height: 1350px; left: 0; top: 0; background-image: radial-gradient(rgba(var(--text-rgb), 0.12) 4px, transparent 4px); background-size: 20px 20px; z-index: 1;"></div>`;
            break;
        case 'layout-saas-3d':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; top: -150px; right: -150px; width: 600px; height: 600px; background: var(--brand-color); opacity: 0.4; filter: blur(150px); z-index: 1; border-radius: 50%;"></div>`;
            html += `<div class="draggable shape-element texture-element" style="position: absolute; bottom: -200px; left: -100px; width: 800px; height: 800px; background: #4f46e5; opacity: 0.3; filter: blur(180px); z-index: 1; border-radius: 50%;"></div>`;
            html += `<div class="draggable shape-element texture-element" style="position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.05) 2px, transparent 2px); background-size: 40px 40px; z-index: 1;"></div>`;
            break;
        case 'layout-hex-corp':
            html += `<div class="draggable shape-element texture-element" style="position: absolute; top: -20%; left: -20%; width: 140%; height: 140%; background: radial-gradient(circle, transparent 20%, rgba(var(--bg-rgb), 0.8) 80%), repeating-radial-gradient(circle at 0% 50%, transparent 0, transparent 40px, rgba(var(--brand-rgb), 0.15) 41px, rgba(var(--brand-rgb), 0.15) 42px); z-index: 1;"></div>`;
            html += `<div class="draggable shape-element texture-element" style="position: absolute; top: 20%; right: -10%; width: 600px; height: 600px; background: var(--brand-color); opacity: 0.2; transform: rotate(30deg); clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); z-index: 1;"></div>`;
            break;
    }
    return html;
}

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
        iconWrap: 'display: none;' 
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
    },
    'layout-saas-3d': {
        card: 'background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.1); border-top: 1px solid rgba(255,255,255,0.3); border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(var(--brand-rgb), 0.2);',
        image: 'border-radius: 24px; box-shadow: 0 10px 30px rgba(var(--brand-rgb), 0.2);',
        title: 'font-family: "Inter", sans-serif; font-weight: 800; letter-spacing: -0.03em;',
        button: 'background: linear-gradient(135deg, var(--brand-color), #4f46e5); color: #fff; border-radius: 100px; font-weight: 700; border: none; box-shadow: 0 10px 25px rgba(var(--brand-rgb), 0.5); text-transform: none;',
        iconWrap: 'width: 55px; height: 55px; background: rgba(var(--brand-rgb), 0.2); border: 1px solid rgba(var(--brand-rgb), 0.5); color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 15px rgba(var(--brand-rgb), 0.5);'
    },
    'layout-hex-corp': {
        card: 'background: #ffffff; color: var(--brand-color); border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); border: none;',
        image: 'border-radius: 16px; border: 4px solid #ffffff; box-shadow: 0 15px 30px rgba(0,0,0,0.2);',
        title: 'font-family: "Inter", sans-serif; font-weight: 900; letter-spacing: -0.04em;',
        button: 'background: var(--brand-color); color: #fff; border-radius: 12px; font-weight: 800; border: none; box-shadow: 0 8px 20px rgba(var(--brand-rgb), 0.4);',
        iconWrap: 'width: 50px; height: 50px; background: var(--bg-color); color: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;'
    }
};

// ====================================================
// MOTOR DE COMPOSIÇÃO - SMART LAYOUTS (GRID/FLEX)
// ====================================================
export function buildUltimateLayout(slide, slideIndex, template, topic) {
    let bgHtml = '';
    let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput')?.value.trim() || 'seusite.com.br';
    
    const imgUrl1 = getDynamicImg(slideIndex, 0, topic);
    const imgUrl2 = getDynamicImg(slideIndex, 1, topic);
    const theme = THEME_RULES[template] || THEME_RULES['layout-tech'];

    const randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const chance = (percent) => Math.random() * 100 < percent;

    // GERADOR DE DECORAÇÕES (Sutis e não intrusivas)
    const generateDecorations = () => {
        let html = '';
        const types =['circle-outline', 'blur-blob', 'dots-grid'];
        // Apenas 1 a 3 enfeites, com opacidade bem baixa para não brigar com o texto
        for(let i=0; i < Math.floor(Math.random() * 3) + 1; i++) {
            const type = randChoice(types);
            const size = Math.floor(Math.random() * 400) + 100;
            const top = Math.floor(Math.random() * 80) + '%';
            const left = Math.floor(Math.random() * 80) + '%';
            const color = randChoice(['var(--brand-color)', 'var(--text-color)']);
            const opacity = (Math.random() * 0.15 + 0.05).toFixed(2);
            
            let style = `position:absolute; top:${top}; left:${left}; width:${size}px; height:${size}px; opacity:${opacity}; z-index:2; pointer-events:none;`;
            
            if(type === 'circle-outline') style += `border: ${Math.floor(Math.random() * 6) + 2}px solid ${color}; border-radius:50%;`;
            if(type === 'blur-blob') style += `background:${color}; border-radius:50%; filter:blur(${Math.floor(Math.random() * 80) + 40}px); opacity:${(opacity * 2).toFixed(2)};`;
            if(type === 'dots-grid') style += `background-image: radial-gradient(${color} 2px, transparent 2px); background-size: 30px 30px;`;
            
            html += `<div class="draggable shape-element" style="${style}"></div>`;
        }
        return html;
    };

    const decorationsHtml = generateDecorations();

    // FUNDO (Sólido, Imagem Full ou Misto)
    const isFullBg = chance(30);
    if (isFullBg) {
        bgHtml = `<img src="${imgUrl1}" class="slide-bg-img editable-img" crossorigin="anonymous" style="opacity: ${Math.random() * 0.4 + 0.1};"><div class="slide-gradient" style="background: linear-gradient(${Math.floor(Math.random()*180)}deg, var(--bg-color) 30%, transparent 100%); z-index:1;"></div>`;
    } else {
        bgHtml = `<div style="position:absolute; inset:0; background: var(--bg-color); z-index:0;"></div>`;
    }

    // ==========================================
    // CAPA (Smart Layouts)
    // ==========================================
    if (slide.type === 'cover') {
        const coverLayouts =['classic-bottom', 'center-card', 'split-vertical', 'image-right'];
        const layout = randChoice(coverLayouts);

        const titleHtml = `<h1 class="draggable text-element" contenteditable="true" style="${theme.title} font-size: clamp(75px, 8vw, 110px); line-height: 1.05; margin-bottom: 25px; word-break: break-word;">${slide.title}</h1>`;
        const tagHtml = `<div class="tag draggable text-element" contenteditable="true" style="padding: 12px 24px; font-weight: bold; margin-bottom: 30px; display: inline-block; ${theme.button}">${slide.tag || 'ALERTA'}</div>`;

        if (layout === 'classic-bottom') {
            contentHtml = `
                <div class="slide-content" style="justify-content: flex-end; align-items: flex-start; text-align: left; padding-bottom: 60px; z-index: 10;">
                    ${tagHtml}
                    ${titleHtml}
                </div>`;
        } 
        else if (layout === 'center-card') {
            contentHtml = `
                <div class="slide-content" style="justify-content: center; align-items: center; text-align: center; z-index: 10;">
                    <div class="draggable shape-element" style="background: rgba(var(--bg-rgb), 0.7); backdrop-filter: blur(20px); padding: 60px; border-radius: 30px; border: 1px solid rgba(var(--text-rgb), 0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.3); width: 100%; max-width: 900px;">
                        ${tagHtml}
                        ${titleHtml}
                    </div>
                </div>`;
        }
        else if (layout === 'split-vertical') {
            bgHtml += `<div style="position: absolute; top:0; left:0; width:100%; height:50%; z-index: 2;"><img src="${isFullBg ? imgUrl2 : imgUrl1}" class="editable-img draggable image-element" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover; ${theme.image} border-bottom-left-radius: 0; border-bottom-right-radius: 0;"></div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: flex-end; align-items: center; text-align: center; padding-bottom: 80px; z-index: 10;">
                    ${tagHtml}
                    ${titleHtml}
                </div>`;
        }
        else if (layout === 'image-right') {
            contentHtml = `
                <div class="slide-content" style="flex-direction: row; align-items: center; justify-content: space-between; gap: 40px; z-index: 10;">
                    <div style="flex: 1.2; text-align: left;">
                        ${tagHtml}
                        ${titleHtml}
                    </div>
                    <div class="draggable shape-element" style="flex: 1; height: 600px; ${theme.image} overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                         <img src="${isFullBg ? imgUrl2 : imgUrl1}" class="editable-img image-element" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                </div>`;
        }
    } 
    
    // ==========================================
    // MIOLO (Smart Layouts)
    // ==========================================
    else if (slide.type === 'features' || slide.type === 'process' || slide.type === 'news') {
        const items = slide.items ||[];
        if (slide.type === 'news' && slide.bullets) slide.bullets.forEach(b => items.push({ title: b, desc: '' }));

        const contentLayouts =['grid-2x2', 'vertical-stack', 'split-horizontal'];
        const layout = randChoice(contentLayouts);

        const mainTitle = `<h2 class="draggable text-element" contenteditable="true" style="${theme.title} font-size: 65px; margin-bottom: 50px; line-height: 1.1; word-break: break-word;">${slide.title}</h2>`;

        const renderCard = (i, idx, extraStyle = '') => `
            <div class="draggable shape-element" style="${theme.card} padding: 35px; display: flex; flex-direction: column; gap: 15px; position: relative; ${extraStyle}">
                <div style="${theme.iconWrap}">
                    ${slide.type === 'process' ? `<span style="font-weight:900; font-size:24px;">${idx + 1}</span>` : getIcon(idx)}
                </div>
                <h3 contenteditable="true" class="text-element" style="${theme.title} font-size: 30px; word-break: break-word;">${i.title}</h3>
                ${i.desc ? `<p contenteditable="true" class="text-element" style="font-size: 24px; opacity: 0.85; line-height: 1.4; word-break: break-word;">${i.desc}</p>` : ''}
            </div>`;

        if (layout === 'grid-2x2') {
            contentHtml = `
                <div class="slide-content" style="justify-content: flex-start; z-index: 10;">
                    <div style="text-align: ${chance(50) ? 'left' : 'center'}; width: 100%;">
                        ${mainTitle}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; width: 100%;">
                        ${items.slice(0, 4).map((i, idx) => renderCard(i, idx)).join('')}
                    </div>
                </div>`;
                
        } else if (layout === 'vertical-stack') {
            contentHtml = `
                <div class="slide-content" style="justify-content: flex-start; z-index: 10;">
                    <div style="text-align: left; width: 100%;">
                        ${mainTitle}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 25px; width: 100%;">
                        ${items.map((i, idx) => renderCard(i, idx, 'flex-direction: row; align-items: center;')).join('')}
                    </div>
                </div>`;
                
        } else if (layout === 'split-horizontal') {
            contentHtml = `
                <div class="slide-content" style="flex-direction: row; gap: 50px; align-items: center; z-index: 10;">
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        ${mainTitle}
                        <div class="draggable shape-element" style="width: 100%; height: 400px; ${theme.image} overflow: hidden; margin-top: 20px;">
                            <img src="${imgUrl1}" class="editable-img image-element" crossorigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    </div>
                    <div style="flex: 1.2; display: flex; flex-direction: column; gap: 25px;">
                        ${items.slice(0, 3).map((i, idx) => renderCard(i, idx)).join('')}
                    </div>
                </div>`;
        }
    }
    
    // ==========================================
    // CHAMADA PRA AÇÃO (Smart Layouts)
    // ==========================================
    else if (slide.type === 'cta') {
        const ctaLayouts =['centered', 'image-top', 'image-left'];
        const layout = randChoice(ctaLayouts);

        const titleHtml = `<h2 class="draggable text-element" contenteditable="true" style="${theme.title} font-size: 80px; margin-bottom: 25px; line-height: 1.1; word-break: break-word;">${slide.title}</h2>`;
        const descHtml = `<p class="desc draggable text-element" contenteditable="true" style="font-size: 32px; margin-bottom: 50px; opacity: 0.8; word-break: break-word;">${slide.desc}</p>`;
        const btnHtml = `<div class="btn-cta draggable shape-element text-element" contenteditable="true" style="${theme.button} padding: 30px 60px; font-size: 34px; display: inline-block;">${slide.button}</div>`;
        const linkHtml = `<p class="website-link draggable text-element" contenteditable="true" style="margin-top: 40px; font-size: 24px; opacity: 0.6; font-weight: 600;">${siteUrl}</p>`;

        if (layout === 'centered') {
            contentHtml = `
                <div class="slide-content" style="align-items: center; justify-content: center; text-align: center; z-index: 10;">
                    <div class="draggable shape-element" style="${theme.card} padding: 80px; width: 100%; max-width: 950px; display: flex; flex-direction: column; align-items: center;">
                        ${titleHtml}${descHtml}${btnHtml}${linkHtml}
                    </div>
                </div>`;
                
        } else if (layout === 'image-top') {
            bgHtml += `
                <div style="position: absolute; top:0; left:0; width:100%; height:45%; z-index: 2;">
                    <img src="${isFullBg ? imgUrl2 : imgUrl1}" class="editable-img draggable image-element" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover; ${theme.image} border-top-left-radius: 0; border-top-right-radius: 0;">
                </div>`;
            contentHtml = `
                <div class="slide-content" style="justify-content: flex-end; align-items: center; text-align: center; padding-bottom: 60px; z-index: 10;">
                    ${titleHtml}${descHtml}${btnHtml}${linkHtml}
                </div>`;
                
        } else if (layout === 'image-left') {
            contentHtml = `
                <div class="slide-content" style="flex-direction: row; gap: 40px; align-items: center; z-index: 10;">
                    <div class="draggable shape-element" style="flex: 1; height: 600px; ${theme.image} overflow: hidden;">
                         <img src="${isFullBg ? imgUrl2 : imgUrl1}" class="editable-img image-element" crossorigin="anonymous" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="flex: 1.2; text-align: left; display: flex; flex-direction: column; align-items: flex-start;">
                        ${titleHtml}${descHtml}${btnHtml}${linkHtml}
                    </div>
                </div>`;
        }
    }

    const patternHtml = getBackgroundPatterns(template);
    
    // Junta as camadas: Fundo -> Textura do Tema -> Decorações Geométricas -> Conteúdo (Grid Flexbox seguro)
    return bgHtml + patternHtml + decorationsHtml + contentHtml;
}

export function renderCarousel(data, template, topic = "tecnologia") {
    const container = document.getElementById('carouselContainer');
    container.innerHTML = '';

    (data.slides ||[]).forEach((slide, index) => {
        const isLast = index === (data.slides.length - 1);
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        
        const slideDiv = document.createElement('div');
        slideDiv.className = `slide ${template} slide-${slide.type}`;

        let slideHTML = buildUltimateLayout(slide, index, template, topic);
        
        const brandName = AppState.activeProfile ? AppState.activeProfile.name : "Sua Marca";
        const logoContent = AppState.customLogoUrl 
            ? `<img src="${AppState.customLogoUrl}" class="custom-logo-img draggable">` 
            : `<span class="default-logo-text draggable text-element" contenteditable="true" style="font-family: 'Montserrat'; font-weight: 900;">${brandName}</span>`;

        let footerHtml = `
            <div class="slide-footer footer-tech" style="position: absolute; bottom: 0; left: 0; width: 100%; z-index: 50; padding: 0 60px 50px 60px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div class="brand-logo-container" style="height: 50px;">${logoContent}</div>
                ${!isLast ? `<div class="swipe-btn draggable text-element" style="background: rgba(var(--bg-rgb), 0.5); backdrop-filter: blur(10px); border: ${template === 'layout-bold' ? '4px solid var(--text-color)' : '1px solid rgba(var(--text-rgb), 0.2)'}; border-radius: ${template === 'layout-bold' || template === 'layout-minimal' || template === 'layout-editorial' ? '0' : '50px'}; padding: 12px 24px; font-size: 16px; font-family: 'Inter'; font-weight: 700;">ARRASTA &gt;</div>` : `<div></div>`}
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
            <button class="btn-slide-control regenerate" data-action="regenerate" title="Regerar Slide"><i data-lucide="refresh-cw"></i></button>
            <button class="btn-slide-control" data-action="duplicate" title="Duplicar Slide"><i data-lucide="copy"></i></button>
            <button class="btn-slide-control" data-action="add" title="Adicionar Slide Vazio"><i data-lucide="plus"></i></button>
            <button class="btn-slide-control delete" data-action="remove" title="Remover Slide"><i data-lucide="trash-2"></i></button>
        `;
        
        wrapper.appendChild(controlsDiv);
        container.appendChild(wrapper);
    });

    window.lucide.createIcons();
    document.getElementById('btnDownload').style.display = 'flex';
    
    AppState.history =[];
    AppState.historyIndex = -1;
    saveState();
}