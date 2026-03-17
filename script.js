let customLogoUrl = null;
let targetImageToReplace = null; 

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

// Escuta Mudanças de Template para Auto-Ajustar as 3 Cores
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

// Atualizações Manuais de Cor
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

document.getElementById('carouselContainer').addEventListener('click', (e) => {
    if (e.target.classList.contains('editable-img')) {
        targetImageToReplace = e.target;
        document.getElementById('slideImageInput').click();
    }
});

document.getElementById('slideImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        if (targetImageToReplace) {
            targetImageToReplace.src = ev.target.result;
            targetImageToReplace = null;
        }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
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
        bgHtml = `<img src="${getImg()}" class="slide-bg-img editable-img" title="Clique para alterar" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `<div class="tag" contenteditable="true" spellcheck="false">${slide.tag}</div>
                       <h1 contenteditable="true" spellcheck="false">${slide.title}</h1>`;
    } else if (slide.type === 'features') {
        const cards = slide.items.slice(0, 3).map((i, idx) => {
            return `<div class="feature-card">
                <div class="icon-box">${getIcon(idx)}</div>
                <div class="feature-text"><h3 contenteditable="true" spellcheck="false">${i.title}:</h3> <p contenteditable="true" spellcheck="false">${i.desc}</p></div>
            </div>`;
        }).join('');
        contentHtml = `<div class="top-img-container"><img src="${getImg()}" class="top-banner editable-img" title="Clique para alterar" crossorigin="anonymous"></div>
        <h2 contenteditable="true" spellcheck="false">${slide.title}</h2>
        <p class="sub" contenteditable="true" spellcheck="false">${slide.subtitle}</p>${cards}`;
    } else if (slide.type === 'process') {
        const steps = slide.items.map((i, idx) => `<div class="step-card"><div class="step-num">${idx+1}</div><h3 contenteditable="true" spellcheck="false">${i.title}</h3><p contenteditable="true" spellcheck="false">${i.desc}</p></div>`).join('');
        contentHtml = `<h2 contenteditable="true" spellcheck="false">${slide.title}</h2>
        <p class="sub" contenteditable="true" spellcheck="false">${slide.subtitle}</p>
        <div class="grid">${steps}</div>
        ${slide.footerText ? `<p class="process-footer" contenteditable="true" spellcheck="false">${slide.footerText}</p>` : ''}`;
    } else if (slide.type === 'cta') {
        contentHtml = `<div class="top-img-container"><img src="${getImg()}" class="top-banner editable-img" title="Clique para alterar" crossorigin="anonymous"></div>
        <h2 contenteditable="true" spellcheck="false">${slide.title}</h2>
        <p class="desc" contenteditable="true" spellcheck="false">${slide.desc}</p>
        <button class="btn-cta" contenteditable="true" spellcheck="false">${slide.button}</button>
        <p class="website-link" contenteditable="true" spellcheck="false">${siteUrl}</p>`;
    }
    return bgHtml + `<div class="slide-content">${contentHtml}</div>`;
}

// --- ESTRUTURA B (Corp, Editorial, Bold) ---
function buildStructureB(slide) {
    let bgHtml = ''; let contentHtml = '';
    const siteUrl = document.getElementById('websiteInput').value.trim() || 'seusite.com.br';

    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg()}" class="slide-bg-img editable-img" title="Clique para alterar" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `<div class="tag" contenteditable="true" spellcheck="false">${slide.tag}</div>
                       <h1 contenteditable="true" spellcheck="false">${slide.title}</h1>`;
    } else if (slide.type === 'news') {
        const bullets = slide.bullets.map(b => `<li contenteditable="true" spellcheck="false">${b}</li>`).join('');
        contentHtml = `
            <div class="browser">
                <div class="browser-header">
                    <span><i data-lucide="search" style="width:16px;"></i> Buscar</span>
                    <span class="brand" contenteditable="true" spellcheck="false">Valor <span>Dino</span></span>
                    <span><i data-lucide="user" style="width:16px;"></i> Entrar</span>
                </div>
                <div class="headline" contenteditable="true" spellcheck="false">${slide.newsHeadline}</div>
                <div class="subheadline" contenteditable="true" spellcheck="false">${slide.newsSub}</div>
            </div>
            <h2 contenteditable="true" spellcheck="false">${slide.title}</h2><ul class="news-bullets">${bullets}</ul>
        `;
    } else if (slide.type === 'features') {
        const cards = slide.items.slice(0, 3).map(i => `<div class="feature-card"><h3 contenteditable="true" spellcheck="false">${i.title}:</h3> <p contenteditable="true" spellcheck="false">${i.desc}</p></div>`).join('');
        contentHtml = `<h2 contenteditable="true" spellcheck="false">${slide.title}</h2><div class="features-list">${cards}</div>`;
    } else if (slide.type === 'cta') {
        contentHtml = `<div class="top-img-container"><img src="${getImg()}" class="top-banner editable-img" title="Clique para alterar" crossorigin="anonymous"></div>
        <h2 contenteditable="true" spellcheck="false">${slide.title}</h2>
        <p class="desc" contenteditable="true" spellcheck="false">${slide.desc}</p>
        <button class="btn-cta" contenteditable="true" spellcheck="false">${slide.button}</button>
        <p class="website-link" contenteditable="true" spellcheck="false" style="margin-top: 30px; font-size: 26px;">${siteUrl}</p>`;
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
        
        const logoContent = customLogoUrl ? `<img src="${customLogoUrl}" class="custom-logo-img">` : `<span class="default-logo-text" contenteditable="true" spellcheck="false">Sua Marca</span>`;

        let footerHtml = '';
        if (isStructureA) {
            footerHtml = `
                <div class="slide-footer footer-tech">
                    <div class="brand-logo-container">${logoContent}</div>
                    ${!isLast ? `<div class="swipe-btn">ARRASTA PARA O LADO &gt;</div>` : `<div></div>`}
                </div>
            `;
        } else {
            footerHtml = `
                <div class="slide-footer footer-corp">
                    ${!isLast ? `<div class="swipe-btn">ARRASTE PARA O LADO &gt;</div>` : ''}
                    <div class="brand-logo-container">${logoContent}</div>
                    ${isLast ? `<div class="source-link" contenteditable="true" spellcheck="false">Fonte da notícia: https://noticia.com.br</div>` : ''}
                </div>
            `;
        }

        slideDiv.innerHTML = slideHTML + footerHtml;
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
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts:[{ text: isStructureA ? promptTech : promptCorp }] }] }) });
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

    if (document.activeElement) document.activeElement.blur();

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