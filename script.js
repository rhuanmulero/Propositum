let customLogoUrl = null;
let targetImageToReplace = null; 
let cropper = null;

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

function updateColors(bg, brand, text) {
    document.getElementById('bgColor').value = bg;
    document.getElementById('brandColor').value = brand;
    document.getElementById('textColor').value = text;
    
    document.documentElement.style.setProperty('--bg-color', bg);
    document.documentElement.style.setProperty('--bg-rgb', hexToRgb(bg));
    document.documentElement.style.setProperty('--brand-color', brand);
    document.documentElement.style.setProperty('--brand-rgb', hexToRgb(brand));
    document.documentElement.style.setProperty('--text-color', text);
    document.documentElement.style.setProperty('--text-rgb', hexToRgb(text));
}

// Escuta Mudanças de Template
document.getElementById('templateSelect').addEventListener('change', (e) => {
    const val = e.target.value;
    const defaultColors = {
        'layout-tech': { bg: '#081225', brand: '#ea580c', text: '#ffffff' },
        'layout-corp': { bg: '#18181b', brand: '#ea580c', text: '#ffffff' },
        'layout-minimal': { bg: '#ffffff', brand: '#000000', text: '#111111' },
        'layout-neon': { bg: '#09090b', brand: '#ec4899', text: '#ffffff' },
        'layout-editorial': { bg: '#f4f0ec', brand: '#8b4513', text: '#222222' },
        'layout-glass': { bg: '#0f172a', brand: '#3b82f6', text: '#ffffff' },
        'layout-bold': { bg: '#fbbf24', brand: '#000000', text: '#000000' }
    };
    if (defaultColors[val]) {
        updateColors(defaultColors[val].bg, defaultColors[val].brand, defaultColors[val].text);
    }
});

document.getElementById('brandColor').addEventListener('input', (e) => updateColors(document.getElementById('bgColor').value, e.target.value, document.getElementById('textColor').value));
document.getElementById('bgColor').addEventListener('input', (e) => updateColors(e.target.value, document.getElementById('brandColor').value, document.getElementById('textColor').value));
document.getElementById('textColor').addEventListener('input', (e) => updateColors(document.getElementById('bgColor').value, document.getElementById('brandColor').value, e.target.value));

document.getElementById('btnLogoUpload').addEventListener('click', () => document.getElementById('logoInput').click());
document.getElementById('logoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        customLogoUrl = ev.target.result;
        const btn = document.getElementById('btnLogoUpload');
        btn.innerHTML = '<i data-lucide="check" style="color:var(--brand-color);"></i>';
        lucide.createIcons();
        document.querySelectorAll('.brand-logo-container').forEach(container => container.innerHTML = `<img src="${customLogoUrl}" class="custom-logo-img">`);
    };
    reader.readAsDataURL(file);
});


// --- LÓGICA DO MENU DE CONTEXTO PARA IMAGENS ---
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('editable-img')) {
        targetImageToReplace = e.target;
        const toolbar = document.getElementById('imageToolbar');
        toolbar.style.display = 'flex';
        toolbar.style.left = e.clientX + 'px';
        toolbar.style.top = (e.clientY - 40) + 'px'; 
    } 
    else if (!e.target.closest('#imageToolbar')) {
        document.getElementById('imageToolbar').style.display = 'none';
    }
});

document.getElementById('btnToolbarChange').addEventListener('click', () => {
    document.getElementById('slideImageInput').click();
    document.getElementById('imageToolbar').style.display = 'none';
});

document.getElementById('slideImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        document.getElementById('cropModal').style.display = 'flex';
        const cropTarget = document.getElementById('cropTarget');
        cropTarget.src = ev.target.result;
        
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropTarget, {
            viewMode: 1,
            autoCropArea: 1,
            background: false
        });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
});

document.getElementById('btnCancelCrop').addEventListener('click', () => {
    document.getElementById('cropModal').style.display = 'none';
    if(cropper) { cropper.destroy(); cropper = null; }
});

document.getElementById('btnApplyCrop').addEventListener('click', () => {
    if (cropper && targetImageToReplace) {
        const canvas = cropper.getCroppedCanvas({ maxWidth: 1080, maxHeight: 1350 });
        targetImageToReplace.src = canvas.toDataURL('image/jpeg', 0.9);
        document.getElementById('cropModal').style.display = 'none';
        cropper.destroy(); cropper = null;
    }
});

// --- LÓGICA CANVA: ARRASTAR, SOLTAR E ALINHAMENTO COM OUTROS ELEMENTOS ---
let draggedEl = null;
let startX = 0, startY = 0;
let initLeft = 0, initTop = 0;
let isDragging = false;

// Variáveis de escopo para as posições reais na prancheta
let baseLeft = 0, baseRight = 0, baseTop = 0, baseBottom = 0, baseCenterX = 0, baseCenterY = 0;
let currentSlide = null;
let snapTargets =[]; // Irá armazenar todos os eixos X e Y de outros elementos

function initDragSetup(el, e) {
    draggedEl = el;
    currentSlide = draggedEl.closest('.slide');
    
    startX = e.clientX;
    startY = e.clientY;
    initLeft = parseFloat(draggedEl.style.left) || 0;
    initTop = parseFloat(draggedEl.style.top) || 0;
    isDragging = false;

    const oldLeft = draggedEl.style.left;
    const oldTop = draggedEl.style.top;
    draggedEl.style.left = '0px';
    draggedEl.style.top = '0px';

    const scale = 0.4; // A escala aplicada no CSS (.slide)
    const slideRect = currentSlide.getBoundingClientRect();
    const elRect = draggedEl.getBoundingClientRect();

    baseLeft = (elRect.left - slideRect.left) / scale;
    baseTop = (elRect.top - slideRect.top) / scale;
    const elWidth = elRect.width / scale;
    const elHeight = elRect.height / scale;

    baseRight = baseLeft + elWidth;
    baseBottom = baseTop + elHeight;
    baseCenterX = baseLeft + elWidth / 2;
    baseCenterY = baseTop + elHeight / 2;

    draggedEl.style.left = oldLeft;
    draggedEl.style.top = oldTop;

    // Constrói o radar magnético com todos os outros elementos do slide
    snapTargets =[];
    
    // 1. Limites do Slide Inteiro (Bordas e Centro)
    snapTargets.push({
        x:[0, 540, 1080],
        y: [0, 675, 1350]
    });

    // 2. Limites dos outros elementos na tela
    const siblings = currentSlide.querySelectorAll('.draggable');
    siblings.forEach(sibling => {
        if (sibling === draggedEl) return;
        const sRect = sibling.getBoundingClientRect();
        
        // Ignora elementos vazios ou escondidos
        if (sRect.width === 0 || sRect.height === 0) return;
        
        const sLeft = (sRect.left - slideRect.left) / scale;
        const sTop = (sRect.top - slideRect.top) / scale;
        const sWidth = sRect.width / scale;
        const sHeight = sRect.height / scale;

        snapTargets.push({
            x: [sLeft, sLeft + sWidth / 2, sLeft + sWidth],
            y: [sTop, sTop + sHeight / 2, sTop + sHeight]
        });
    });
}

document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;

    if (e.target.closest('#btnToolbarMove')) {
        e.preventDefault();
        const elToMove = targetImageToReplace.closest('.draggable') || targetImageToReplace;
        document.getElementById('imageToolbar').style.display = 'none';
        initDragSetup(elToMove, e);
        return;
    }

    const draggable = e.target.closest('.draggable');
    if (!draggable) return;
    if (draggable.isContentEditable && document.activeElement === draggable) return;
    if (e.target.classList.contains('editable-img')) return; 

    initDragSetup(draggable, e);
});

document.addEventListener('mousemove', (e) => {
    if (!draggedEl) return;
    isDragging = true;
    
    let dx = (e.clientX - startX) / 0.4;
    let dy = (e.clientY - startY) / 0.4;

    let rawLeft = initLeft + dx;
    let rawTop = initTop + dy;

    // Consegue a posição atual exata das bordas de quem está sendo arrastado
    let currentLeft = baseLeft + rawLeft;
    let currentRight = baseRight + rawLeft;
    let currentCenterX = baseCenterX + rawLeft;

    let currentTop = baseTop + rawTop;
    let currentBottom = baseBottom + rawTop;
    let currentCenterY = baseCenterY + rawTop;

    let snappedX = false;
    let snappedY = false;
    let guideX = 0;
    let guideY = 0;
    const snapTolerance = 15; // Quão forte é o "Ímã" 

    let minDiffX = snapTolerance;
    let minDiffY = snapTolerance;

    // Varre todos os outros elementos para ver se bateu com alguma margem
    snapTargets.forEach(target => {
        target.x.forEach(tx => {
            if (Math.abs(currentLeft - tx) < minDiffX) { minDiffX = Math.abs(currentLeft - tx); rawLeft = tx - baseLeft; snappedX = true; guideX = tx; }
            if (Math.abs(currentCenterX - tx) < minDiffX) { minDiffX = Math.abs(currentCenterX - tx); rawLeft = tx - baseCenterX; snappedX = true; guideX = tx; }
            if (Math.abs(currentRight - tx) < minDiffX) { minDiffX = Math.abs(currentRight - tx); rawLeft = tx - baseRight; snappedX = true; guideX = tx; }
        });

        target.y.forEach(ty => {
            if (Math.abs(currentTop - ty) < minDiffY) { minDiffY = Math.abs(currentTop - ty); rawTop = ty - baseTop; snappedY = true; guideY = ty; }
            if (Math.abs(currentCenterY - ty) < minDiffY) { minDiffY = Math.abs(currentCenterY - ty); rawTop = ty - baseCenterY; snappedY = true; guideY = ty; }
            if (Math.abs(currentBottom - ty) < minDiffY) { minDiffY = Math.abs(currentBottom - ty); rawTop = ty - baseBottom; snappedY = true; guideY = ty; }
        });
    });

    draggedEl.style.left = `${rawLeft}px`;
    draggedEl.style.top = `${rawTop}px`;
    draggedEl.style.zIndex = '1000'; 
    
    // Exibe as linhas visuais dinamicamente
    if (currentSlide) {
        const guideV = currentSlide.querySelector('.guide-v');
        const guideH = currentSlide.querySelector('.guide-h');
        
        if(guideV) { 
            guideV.style.display = snappedX ? 'block' : 'none'; 
            guideV.style.left = `${guideX}px`; 
        }
        if(guideH) { 
            guideH.style.display = snappedY ? 'block' : 'none'; 
            guideH.style.top = `${guideY}px`; 
        }
    }

    window.getSelection().removeAllRanges(); 
});

document.addEventListener('mouseup', () => {
    if (draggedEl) {
        if (!isDragging && draggedEl.isContentEditable) draggedEl.focus(); 
        draggedEl.style.zIndex = '';
        draggedEl = null;
        isDragging = false;
    }
    
    document.querySelectorAll('.guide-line').forEach(el => el.style.display = 'none');
    currentSlide = null;
});


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

// --- ESTRUTURA A (Tech, Minimal, Neon, Glass) ---
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

// --- ESTRUTURA B (Corp, Editorial, Bold) ---
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

// --- RENDERIZADOR ---
function renderCarousel(data, template) {
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
        
        const logoContent = customLogoUrl ? `<img src="${customLogoUrl}" class="custom-logo-img draggable">` : `<span class="default-logo-text draggable" contenteditable="true" spellcheck="false">Sua Marca</span>`;

        let footerHtml = '';
        if (isStructureA) {
            footerHtml = `
                <div class="slide-footer footer-tech">
                    <div class="brand-logo-container">${logoContent}</div>
                    ${!isLast ? `<div class="swipe-btn draggable">ARRASTA PARA O LADO &gt;</div>` : `<div></div>`}
                </div>
            `;
        } else {
            footerHtml = `
                <div class="slide-footer footer-corp">
                    ${!isLast ? `<div class="swipe-btn draggable">ARRASTE PARA O LADO &gt;</div>` : ''}
                    <div class="brand-logo-container">${logoContent}</div>
                    ${isLast ? `<div class="source-link draggable" contenteditable="true" spellcheck="false">Fonte da notícia: https://noticia.com.br</div>` : ''}
                </div>
            `;
        }

        // Adiciona as Linhas Guia Invisíveis Dinâmicas (Em toda a tela do slide)
        const guidesHtml = `
            <div class="guide-line guide-v"></div>
            <div class="guide-line guide-h"></div>
        `;

        slideDiv.innerHTML = slideHTML + footerHtml + guidesHtml;
        wrapper.appendChild(slideDiv);
        container.appendChild(wrapper);
    });

    lucide.createIcons();
    document.getElementById('btnDownload').style.display = 'flex';
}

function getMockData(template, topic) {
    const t = topic || "Seu Negócio";
    const isStructureA =['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass'].includes(template);
    
    if (isStructureA) {
        return {
            slides:[
                { type: "cover", tag: "NOVA TENDÊNCIA", title: `O Futuro da ${t} já começou` },
                { type: "features", title: "Decisões baseadas em dados reais.", subtitle: "O sucesso exige ativos estratégicos:", items:[
                    { title: "Tomada de decisão", desc: "Antecipe tendências de mercado." },
                    { title: "Previsão de Demanda", desc: "Saiba o que seu cliente quer." },
                    { title: "Automação", desc: "Deixe tarefas para os algoritmos." }
                ]},
                { type: "process", title: "Qual o processo?", subtitle: "O Passo a Passo ideal:", items:[
                    { title: "Coleta", desc: "Estruturamos dados brutos." },
                    { title: "Modelagem", desc: "Modelos matemáticos." },
                    { title: "Validação", desc: "Machine Learning rápido." },
                    { title: "Entrega", desc: "Precisão operacional." }
                ], footerText: "Garantimos a excelência com base no seu negócio." },
                { type: "cta", title: "Pronto para inovar?", desc: "Nossa equipe está pronta para elevar sua eficiência.", button: "Entre em contato conosco" }
            ]
        };
    } else {
        return {
            slides:[
                { type: "cover", tag: "URGENTE!", title: `Por que investir em ${t} hoje mesmo` },
                { type: "news", newsHeadline: `Mercado acelera mudanças em 2026`, newsSub: "Empresas aceleram a digitalização diante da pressão por eficiência ininterrupta.", title: "Não há espaço para erros.", bullets:[
                    "A competitividade agora depende de decisões ágeis.",
                    "Se você ainda gere processos defasados, está fora do jogo."
                ]},
                { type: "features", title: `Os pilares do sucesso:`, items:[
                    { title: "Automação", desc: "Substituir o trabalho braçal por processos limpos." },
                    { title: "Dados Reais", desc: "A informação não pode esperar em planilhas." },
                    { title: "Integração", desc: "O sistema como base única da empresa." }
                ]},
                { type: "cta", title: "Sua empresa precisa evoluir.", desc: "Fomos desenhados para entregar exatamente o que você exige.", button: "Clique no link e agende" }
            ]
        };
    }
}

async function fetchGeminiData(theme, template, apiKey) {
    const isStructureA =['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass'].includes(template);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const promptTech = `Retorne APENAS JSON. Tema: "${theme}". Estrutura: {"slides":[{"type":"cover","tag":"TAG","title":"Tít"},{"type":"features","title":"Tít","subtitle":"Sub","items":[{"title":"Tít","desc":"Desc"}] // MÁX 3 ITENS},{"type":"process","title":"Tít","subtitle":"Sub","items":[{"title":"P1","desc":"Desc"}],"footerText":"Rodapé"},{"type":"cta","title":"Tít","desc":"Desc","button":"Botão"}]}`;
    const promptCorp = `Retorne APENAS JSON. Tema: "${theme}". Estrutura: {"slides":[{"type":"cover","tag":"TAG","title":"Tít"},{"type":"news","newsHeadline":"Falsa Notícia","newsSub":"Resumo","title":"Tít","bullets":["Ponto 1","Ponto 2"]},{"type":"features","title":"Tít","items":[{"title":"Item","desc":"Desc"}] // MÁX 3 ITENS},{"type":"cta","title":"Tít","desc":"Desc","button":"Botão"}]}`;

    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents:[{ parts:[{ text: isStructureA ? promptTech : promptCorp }] }] }) });
        if (!response.ok) throw new Error("Chave inválida");
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
        console.error(error); return null;
    }
}

document.getElementById('btnGenerate').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const themeStr = document.getElementById('themeInput').value.trim();
    const template = document.getElementById('templateSelect').value;
    const btn = document.getElementById('btnGenerate');

    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Gerando...';
    btn.disabled = true;
    lucide.createIcons();

    if (!apiKey) {
        const data = getMockData(template, themeStr);
        renderCarousel(data, template);
    } else {
        const aiData = await fetchGeminiData(themeStr, template, apiKey);
        if (aiData) renderCarousel(aiData, template);
        else alert("Erro na geração. Tente outro tema ou verifique a API Key.");
    }

    btn.innerHTML = 'Gerar Carrossel';
    btn.disabled = false;
});

document.getElementById('btnDownload').addEventListener('click', async () => {
    const btn = document.getElementById('btnDownload');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Processando';
    btn.disabled = true;
    lucide.createIcons();

    document.getElementById('imageToolbar').style.display = 'none';
    document.querySelectorAll('.guide-line').forEach(el => el.style.display = 'none');
    if (document.activeElement) document.activeElement.blur();
    window.getSelection().removeAllRanges(); 

    const slides = document.querySelectorAll('.slide');
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        const originalTransform = slide.style.transform;
        slide.style.transform = 'none';
        
        const canvas = await html2canvas(slide, { width: 1080, height: 1350, scale: 1, useCORS: true, backgroundColor: null });
        
        slide.style.transform = originalTransform;

        const link = document.createElement('a');
        link.download = `Propositum_Slide_${i + 1}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        await new Promise(r => setTimeout(r, 400));
    }
    
    btn.innerHTML = originalContent;
    btn.disabled = false;
    lucide.createIcons();
});