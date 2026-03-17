// --- SISTEMA DE WHITE LABEL (LOGO) ---
let customLogoBase64 = null;

document.getElementById('btnUploadLogo').addEventListener('click', () => {
    document.getElementById('logoInput').click();
});

document.getElementById('logoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            customLogoBase64 = event.target.result;
            // Mostra miniatura na UI
            const preview = document.getElementById('logoPreview');
            preview.style.display = 'block';
            preview.style.backgroundImage = `url(${customLogoBase64})`;
            // Troca texto do botão
            document.querySelector('#btnUploadLogo span').innerText = 'Logo Ok';
        };
        reader.readAsDataURL(file);
    }
});

// Funções de sorteio
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

// --- MOTOR PROCEDURAL IA ---
function generateCarouselWithAI(theme) {
    const rawTheme = theme.trim() || "Inteligência Estratégica";
    
    // Arrays de Texto Procedural
    const tags =["URGENTE!", "TENDÊNCIA 2026", "ALERTA DE MERCADO", "ESTRATÉGIA"];
    const coverTitles =[
        `Uma em cada 3 empresas brasileiras trocou de sistema para adotar ${rawTheme} em 2026`,
        `O impacto brutal da ${rawTheme} nas empresas que querem sobreviver`,
        `Por que ignorar a ${rawTheme} vai custar o seu negócio neste semestre`,
        `A ascensão silenciosa da ${rawTheme} na gestão corporativa`
    ];

    const featureTitles =["Automação Total", "Dados em Tempo Real", "Integração Nativa", "Análise Preditiva", "Redução de Riscos"];
    const featureDescriptions =[
        "Substitua o trabalho braçal por processos que rodam sozinhos e sem erros.",
        "A informação não pode esperar. Ela precisa estar no seu dashboard em segundos.",
        "Uma base única que une todos os setores, vendas e financeiro da sua empresa.",
        "Antecipe cenários de mercado utilizando algoritmos matemáticos complexos.",
        "Elimine gargalos operacionais que corroem a sua margem de lucro mensal."
    ];

    // Sorteia os cartões
    const selectedFeatures = getRandomItems(
        featureTitles.map((t, i) => ({ title: t, description: featureDescriptions[i] })), 
        3
    );

    return {
        slides:[
            // Slide 1: Capa Impactante
            { 
                type: "cover", 
                tag: getRandomItem(tags), 
                title: getRandomItem(coverTitles) 
            },
            // Slide 2: Notícia (Gera autoridade - Novo Layout)
            {
                type: "news",
                portal: "Valor | Negócios",
                headline: `Gestão inteligente ganha força com ${rawTheme} em 2026`,
                sub: "Empresas aceleram a digitalização diante da pressão por eficiência. Automação e integração de dados se consolidam como base da competitividade.",
                bullets:[
                    "<strong>A notícia confirma:</strong> A competitividade agora depende de velocidade e dados limpos.",
                    "<strong>O Risco real:</strong> Se você ainda usa métodos manuais, está fora do movimento que transforma o país."
                ]
            },
            // Slide 3: Cartões Verdes (Estilo EvoluRP)
            { 
                type: "feature_list", 
                title: `O que define uma operação baseada em ${rawTheme}?`, 
                features: selectedFeatures 
            },
            // Slide 4: CTA e Venda
            { 
                type: "cta", 
                title: "Sua empresa precisa evoluir. Nós temos a tecnologia.", 
                description: `Nosso ecossistema foi desenhado para entregar exatamente o que o mercado exige: implementação perfeita de ${rawTheme}.`, 
                button: "Clique no link da Bio e agende" 
            }
        ]
    };
}

// --- RENDERIZAÇÃO DOM ---
function renderCarousel(jsonData, templateClass) {
    const container = document.getElementById('carouselContainer');
    container.innerHTML = ''; 

    jsonData.slides.forEach((slide, index) => {
        // Lógica do Rodapé: Exibir Logo + Badge (menos no último slide)
        const isLastSlide = index === jsonData.slides.length - 1;
        const logoHtml = customLogoBase64 ? `<img src="${customLogoBase64}" class="brand-logo">` : `<div></div>`;
        const badgeHtml = !isLastSlide ? `<div class="swipe-badge">Arraste para o lado ></div>` : `<div></div>`;
        const footerHtml = `<div class="slide-footer">${badgeHtml}${logoHtml}</div>`;

        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';
        wrapper.style.animationDelay = `${index * 0.1}s`; // Efeito cascata

        const slideDiv = document.createElement('div');
        slideDiv.className = `slide ${slide.type} ${templateClass}`;

        switch (slide.type) {
            case 'cover':
                slideDiv.innerHTML = `<span class="tag">${slide.tag}</span><h1>${slide.title}</h1>`;
                break;
            case 'news':
                const bulletsHtml = slide.bullets.map(b => `<li>${b}</li>`).join('');
                slideDiv.innerHTML = `
                    <div class="news-browser">
                        <div class="news-header"><span>Q Buscar</span><span>${slide.portal}</span><span>Entrar</span></div>
                        <h2 class="news-headline">${slide.headline}</h2>
                        <p class="news-sub">${slide.sub}</p>
                    </div>
                    <h2 class="slide-title" style="font-size: 55px; margin-bottom: 40px; border:none; padding:0;">Em 2026, não há espaço para lentidão.</h2>
                    <ul>${bulletsHtml}</ul>
                `;
                break;
            case 'feature_list':
                const featuresHtml = slide.features.map(f => `
                    <div class="feature-card">
                        <div class="feature-text"><h3>${f.title}</h3><p>${f.description}</p></div>
                    </div>`).join('');
                slideDiv.innerHTML = `<h2 class="slide-title">${slide.title}</h2><div class="features-grid">${featuresHtml}</div>`;
                break;
            case 'cta':
                slideDiv.innerHTML = `<h2>${slide.title}</h2><p>${slide.description}</p><div class="cta-button">${slide.button}</div>`;
                break;
        }

        // Injeta o rodapé
        slideDiv.innerHTML += footerHtml;

        wrapper.appendChild(slideDiv);
        container.appendChild(wrapper);
    });

    document.getElementById('btnDownload').style.display = 'flex';
}

// --- EVENTOS E DOWNLOAD ---
document.getElementById('btnGenerate').addEventListener('click', () => {
    const themeInput = document.getElementById('themeInput').value;
    const templateSelect = document.getElementById('templateSelect').value;
    const btn = document.getElementById('btnGenerate');
    const container = document.getElementById('carouselContainer');
    
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Processando...';
    btn.disabled = true;
    lucide.createIcons();
    
    document.getElementById('btnDownload').style.display = 'none';
    
    // UI Loading State
    container.innerHTML = `<div class="empty-state"><h3>Mapeando dados para "${themeInput || 'seu tema'}"</h3><p>Aplicando design system e marca...</p></div>`;
    
    setTimeout(() => {
        const jsonResult = generateCarouselWithAI(themeInput);
        renderCarousel(jsonResult, templateSelect);
        
        btn.innerHTML = '<i data-lucide="refresh-cw"></i> Refazer';
        btn.disabled = false;
        lucide.createIcons();
    }, 1200);
});

// Download via HTML2Canvas (Corrigido para formato retrato)
document.getElementById('btnDownload').addEventListener('click', async () => {
    const btn = document.getElementById('btnDownload');
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Processando...';
    btn.disabled = true;
    lucide.createIcons();

    const slides = document.querySelectorAll('.slide');
    
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Remove escala temporariamente para captura 4k/HD real
        const originalTransform = slide.style.transform;
        slide.style.transform = 'none';
        
        const canvas = await html2canvas(slide, {
            width: 1080, height: 1350, scale: 1, useCORS: true, backgroundColor: null
        });
        
        slide.style.transform = originalTransform;

        const link = document.createElement('a');
        link.download = `Carousel_Slide_0${i + 1}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        await new Promise(r => setTimeout(r, 300));
    }
    
    btn.innerHTML = '<i data-lucide="download"></i> Baixar HD';
    btn.disabled = false;
    lucide.createIcons();
});

// Suporte ao Enter
document.getElementById('themeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btnGenerate').click();
});