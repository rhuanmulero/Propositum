let customLogoUrl = null;

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '37, 99, 235';
}

document.getElementById('brandColor').addEventListener('input', (e) => {
    const hex = e.target.value;
    const rgb = hexToRgb(hex);
    document.documentElement.style.setProperty('--brand-color', hex);
    document.documentElement.style.setProperty('--brand-rgb', rgb);
});

document.getElementById('btnLogoUpload').addEventListener('click', () => document.getElementById('logoInput').click());
document.getElementById('logoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        customLogoUrl = ev.target.result;
        const btn = document.getElementById('btnLogoUpload');
        btn.innerHTML = '<i data-lucide="check" style="color:var(--brand-color);"></i>';
        btn.style.borderColor = 'var(--brand-color)';
        lucide.createIcons();
        
        document.querySelectorAll('.brand-logo-container').forEach(container => {
            container.innerHTML = `<img src="${customLogoUrl}" class="custom-logo-img">`;
        });
    };
    reader.readAsDataURL(file);
});

const imgBank =[
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1080&auto=format&fit=crop"
];
const getImg = () => imgBank[Math.floor(Math.random() * imgBank.length)];

const svgChart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;
const svgCode = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;

// --- CONSTRUTORES DE CONTEÚDO (Isolados do Rodapé) ---
function buildTechSlide(slide) {
    let bgHtml = ''; let contentHtml = '';
    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg()}" class="slide-bg-img" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `<div class="tag">${slide.tag}</div><h1>${slide.title}</h1>`;
    } else if (slide.type === 'features') {
        const cards = slide.items.map((i, idx) => {
            const opacities = [1, 0.8, 0.6, 0.4];
            return `<div class="feature-card">
                <div class="icon-box" style="background: rgba(var(--brand-rgb), ${opacities[idx%4]});">${idx%2===0?svgChart:svgCode}</div>
                <div class="feature-text"><h3>${i.title}</h3><p>${i.desc}</p></div>
            </div>`;
        }).join('');
        contentHtml = `<img src="${getImg()}" class="top-banner" crossorigin="anonymous"><h2>${slide.title}</h2><p class="sub">${slide.subtitle}</p>${cards}`;
    } else if (slide.type === 'process') {
        const steps = slide.items.map((i, idx) => `<div class="step-card"><div class="step-num">${idx+1}</div><h3>${i.title}</h3><p>${i.desc}</p></div>`).join('');
        contentHtml = `<h2>${slide.title}</h2><p class="sub">${slide.subtitle}</p><div class="grid">${steps}</div>`;
    } else if (slide.type === 'cta') {
        contentHtml = `<img src="${getImg()}" class="slide-bg-img" crossorigin="anonymous"><h2>${slide.title}</h2><p>${slide.desc}</p><button class="btn-cta">${slide.button}</button>`;
    }
    return bgHtml + `<div class="slide-content">${contentHtml}</div>`;
}

function buildCorpSlide(slide) {
    let bgHtml = ''; let contentHtml = '';
    if (slide.type === 'cover') {
        bgHtml = `<img src="${getImg()}" class="slide-bg-img" crossorigin="anonymous"><div class="slide-gradient"></div>`;
        contentHtml = `<div class="tag">${slide.tag}</div><h1>${slide.title}</h1>`;
    } else if (slide.type === 'news') {
        const bullets = slide.bullets.map(b => `<li>${b}</li>`).join('');
        contentHtml = `
            <div class="browser">
                <div class="browser-header"><span>Q Buscar</span><span class="brand">PROPOSITUM</span><span>Entrar</span></div>
                <div class="headline">${slide.newsHeadline}</div>
                <div class="subheadline">${slide.newsSub}</div>
            </div>
            <h2>${slide.title}</h2><ul>${bullets}</ul>
        `;
    } else if (slide.type === 'features') {
        const cards = slide.items.map(i => `<div class="feature-card"><h3>${i.title}:</h3> <p>${i.desc}</p></div>`).join('');
        contentHtml = `<h2>${slide.title}</h2>${cards}`;
    } else if (slide.type === 'cta') {
        contentHtml = `<img src="${getImg()}" class="slide-bg-img" crossorigin="anonymous"><h2>${slide.title}</h2><p>${slide.desc}</p><button class="btn-cta">${slide.button}</button>`;
    }
    return bgHtml + `<div class="slide-content">${contentHtml}</div>`;
}

// --- RENDERIZADOR COM RODAPÉ ISOLADO ---
function renderCarousel(data, template) {
    const container = document.getElementById('carouselContainer');
    container.innerHTML = '';

    data.slides.forEach((slide, index) => {
        const isLast = index === data.slides.length - 1;
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        
        const slideDiv = document.createElement('div');
        let slideClassType = slide.type;
        if(template === 'layout-tech' && slide.type === 'news') slideClassType = 'features';
        if(template === 'layout-corp' && slide.type === 'process') slideClassType = 'features';
        
        slideDiv.className = `slide ${template} slide-${slideClassType}`;

        let slideHTML = template === 'layout-tech' ? buildTechSlide(slide) : buildCorpSlide(slide);
        
        const logoContent = customLogoUrl ? `<img src="${customLogoUrl}" class="custom-logo-img">` : `<span class="default-logo-text">Sua Marca</span>`;

        // Rodapé anexado por fora do conteúdo, guiado por flexbox para nunca sofrer sobreposição
        const footerHtml = `
            <div class="slide-footer">
                <div class="brand-logo-container">${logoContent}</div>
                ${!isLast ? `<div class="swipe-btn">ARRASTE PARA O LADO &gt;</div>` : '<div></div>'}
            </div>
        `;

        slideDiv.innerHTML = slideHTML + footerHtml;
        wrapper.appendChild(slideDiv);
        container.appendChild(wrapper);
    });

    document.getElementById('btnDownload').style.display = 'flex';
}

function getMockData(template, topic) {
    const t = topic || "Seu Negócio";
    if (template === 'layout-tech') {
        return {
            slides:[
                { type: "cover", tag: "TENDÊNCIA", title: `Como a Inovação Está Redefinindo o ${t}` },
                { type: "features", title: "Decisões Estratégicas", subtitle: "Transforme dados em ativos:", items:[
                    { title: "Tomada de Decisão", desc: "Antecipe o mercado." },
                    { title: "Previsão", desc: "Saiba o que o cliente quer." },
                    { title: "Automação", desc: "Deixe a IA trabalhar." }
                ]},
                { type: "process", title: "Qual o processo?", subtitle: "O Passo a Passo:", items:[
                    { title: "Mapeamento", desc: "Análise da sua operação." },
                    { title: "Estratégia", desc: "Definição de metas." },
                    { title: "Execução", desc: "Uso das ferramentas." },
                    { title: "Resultados", desc: "Acompanhamento real." }
                ]},
                { type: "cta", title: "Pronto para inovar?", desc: "Eleve sua operação a um novo patamar.", button: "Agende uma Reunião" }
            ]
        };
    } else {
        return {
            slides:[
                { type: "cover", tag: "URGENTE!", title: `Por que as empresas estão investindo em ${t}` },
                { type: "news", newsHeadline: `Mercado acelera adoção de ${t}`, newsSub: "A digitalização se torna obrigatória diante da pressão por eficiência e produtividade.", title: "Não há espaço para lentidão.", bullets:[
                    "<strong>O Fato:</strong> A competitividade depende de ações rápidas.",
                    "<strong>O Risco:</strong> Empresas atrasadas perderão fatia de mercado."
                ]},
                { type: "features", title: `Pilares Fundamentais:`, items:[
                    { title: "Automação", desc: "Substituir trabalho braçal por processos eficientes." },
                    { title: "Dados", desc: "A informação não pode esperar o fim do mês." },
                    { title: "Integração", desc: "Base única unindo todos os setores." }
                ]},
                { type: "cta", title: "Sua empresa precisa evoluir.", desc: "Nós temos as soluções que o mercado exige hoje.", button: "Fale com nossos especialistas" }
            ]
        };
    }
}

async function fetchGeminiData(theme, template, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const promptTech = `Retorne APENAS JSON. Tema: "${theme}". Estrutura: {"slides":[{"type":"cover","tag":"TAG","title":"Tít"},{"type":"features","title":"Tít","subtitle":"Sub","items":[{"title":"Tít","desc":"Desc"}]},{"type":"process","title":"Tít","subtitle":"Sub","items":[{"title":"P1","desc":"Desc"}]},{"type":"cta","title":"Tít","desc":"Desc","button":"Botão"}]}`;
    const promptCorp = `Retorne APENAS JSON. Tema: "${theme}". Estrutura: {"slides":[{"type":"cover","tag":"TAG","title":"Tít"},{"type":"news","newsHeadline":"Falsa Noticia","newsSub":"Resumo","title":"Tít","bullets":["Ponto 1","Ponto 2"]},{"type":"features","title":"Tít","items":[{"title":"Item","desc":"Desc"}]},{"type":"cta","title":"Tít","desc":"Desc","button":"Botão"}]}`;

    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts:[{ text: template === 'layout-tech' ? promptTech : promptCorp }] }] }) });
        if (!response.ok) throw new Error("Chave inválida");
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
        console.error(error); return null;
    }
}

// --- BOTÃO GERAR ---
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

// --- EXPORTAR HD (1080x1350) ---
document.getElementById('btnDownload').addEventListener('click', async () => {
    const btn = document.getElementById('btnDownload');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Processando';
    btn.disabled = true;
    lucide.createIcons();

    const slides = document.querySelectorAll('.slide');
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        const originalTransform = slide.style.transform;
        slide.style.transform = 'none';
        
        const canvas = await html2canvas(slide, { width: 1080, height: 1350, scale: 1, useCORS: true });
        
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