const icons =[
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="21"></line></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = (arr, count) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

// Motor de Texto Procedural (Igual, mas adaptado para o novo layout)
function generateCarouselWithAI(theme) {
    const rawTheme = theme.trim() || "Inovação Estratégica";
    const tags =["ALTO IMPACTO", "VISÃO ESTRATÉGICA", "FUTURO DO TRABALHO", "MERCADO EM ALTA", "REVOLUÇÃO", "ALTA PERFORMANCE", "ESCALABILIDADE"];
    const coverTitles =[ `Como a ${rawTheme} está redefinindo o futuro das empresas`, `O impacto silencioso da ${rawTheme} nos negócios`, `Desbloqueando o poder da ${rawTheme} na sua operação`, `Por que investir em ${rawTheme} é sua maior vantagem`, `Dominando a ${rawTheme}: Guia definitivo para líderes` ];
    const featureTitles =["Eficiência Máxima", "Redução de Custos", "Decisões Inteligentes", "Foco no Cliente", "Automação", "Análise Preditiva", "Escalabilidade", "Segurança"];
    const featureDescriptions =["Escale sua operação rapidamente sem perder a qualidade de entrega.", "Otimize processos internos e veja seus custos despencarem.", "Baseie-se em dados precisos e atualizados em tempo real.", "Antecipe necessidades antes mesmo que o cliente perceba.", "Elimine o trabalho manual e permita que sua equipe foque em inovar.", "Preveja cenários mercadológicos usando modelos avançados.", "Expanda seus negócios com uma fundação tecnológica sólida.", "Proteja seus ativos com metodologias de última geração."];
    const processVerbs =["Mapeamento", "Auditoria", "Implementação", "Otimização", "Diagnóstico", "Planejamento"];
    const processNouns =["de Processos", "de Dados", "da Estratégia", "de Resultados", "de KPIs", "da Equipe"];
    const ctaTitles =[`Pronto para dominar a ${rawTheme}?`, "Leve sua empresa ao próximo nível.", "Transforme sua operação ainda este mês.", "Dê o próximo passo para o crescimento."];
    const ctaDescriptions =["Descubra como aplicar essas estratégias conversando com nossa equipe de especialistas.", "Dê o primeiro passo rumo à eficiência extrema e veja seus lucros maximizados hoje.", "Nossos consultores estão preparados para acelerar a sua jornada de transformação."];
    const ctaButtons =["Agendar Consultoria Grátis", "Falar com Especialista", "Baixar Guia Prático", "Iniciar Projeto Agora"];

    const selectedFeatureIndices = getRandomItems(Array.from({length: featureTitles.length}, (_, i) => i), 3);
    const features = selectedFeatureIndices.map(idx => ({ title: featureTitles[idx], description: featureDescriptions[idx] }));

    return {
        slides:[
            { type: "cover", tag: getRandomItem(tags), title: getRandomItem(coverTitles) },
            { type: "feature_list", title: `Os pilares da ${rawTheme}`, features: features },
            { type: "process", title: "A Jornada de Implementação", steps:[ `${getRandomItem(processVerbs)} ${getRandomItem(processNouns)}`, `${getRandomItem(processVerbs)} ${getRandomItem(processNouns)}`, `${getRandomItem(processVerbs)} ${getRandomItem(processNouns)}`, `${getRandomItem(processVerbs)} ${getRandomItem(processNouns)}` ] },
            { type: "cta", title: getRandomItem(ctaTitles), description: getRandomItem(ctaDescriptions), button: getRandomItem(ctaButtons) }
        ]
    };
}

// Renderiza o Carrossel aplicando o Template selecionado
function renderCarousel(jsonData, templateClass) {
    const container = document.getElementById('carouselContainer');
    container.innerHTML = ''; 

    jsonData.slides.forEach(slide => {
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-wrapper';

        const slideDiv = document.createElement('div');
        // Aplica a classe base, a classe do tipo de slide e a classe do TEMPLATE escolhido
        slideDiv.className = `slide ${slide.type} ${templateClass}`;

        switch (slide.type) {
            case 'cover':
                slideDiv.innerHTML = `<div class="tag">${slide.tag}</div><h1>${slide.title}</h1>`;
                break;
            case 'feature_list':
                const shuffledIcons = getRandomItems(icons, 3);
                const featuresHtml = slide.features.map((feature, idx) => `
                    <div class="feature-card">
                        <div class="feature-icon">${shuffledIcons[idx]}</div>
                        <div class="feature-text"><h3>${feature.title}</h3><p>${feature.description}</p></div>
                    </div>`).join('');
                slideDiv.innerHTML = `<h2 class="slide-title">${slide.title}</h2><div class="features-grid">${featuresHtml}</div>`;
                break;
            case 'process':
                const stepsHtml = slide.steps.map((step, idx) => `
                    <div class="process-step"><div class="step-number">0${idx + 1}</div><h3>${step}</h3></div>`).join('');
                slideDiv.innerHTML = `<h2 class="slide-title">${slide.title}</h2><div class="process-grid">${stepsHtml}</div>`;
                break;
            case 'cta':
                slideDiv.innerHTML = `<h2>${slide.title}</h2><p>${slide.description}</p><button class="cta-button">${slide.button}</button>`;
                break;
        }

        wrapper.appendChild(slideDiv);
        container.appendChild(wrapper);
    });

    // Mostra o botão de download após gerar
    document.getElementById('btnDownload').style.display = 'block';
}

// Botão GERAR
document.getElementById('btnGenerate').addEventListener('click', () => {
    const themeInput = document.getElementById('themeInput').value;
    const templateSelect = document.getElementById('templateSelect').value;
    const btn = document.getElementById('btnGenerate');
    const container = document.getElementById('carouselContainer');
    
    btn.innerText = "Pensando...";
    btn.disabled = true;
    document.getElementById('btnDownload').style.display = 'none';
    container.innerHTML = `<div class="empty-state">🧠 Aplicando inteligência procedural para "${themeInput || 'o tema'}"...</div>`;
    
    setTimeout(() => {
        const jsonResult = generateCarouselWithAI(themeInput);
        renderCarousel(jsonResult, templateSelect); // Passa o template escolhido
        
        btn.innerText = "Gerar Novo Carrossel";
        btn.disabled = false;
    }, 1200);
});

// Botão DOWNLOAD
document.getElementById('btnDownload').addEventListener('click', async () => {
    const btn = document.getElementById('btnDownload');
    const originalText = btn.innerText;
    btn.innerText = "Processando Imagens...";
    btn.disabled = true;

    const slides = document.querySelectorAll('.slide');
    
    // Passa por todos os slides gerados
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // TRUQUE: html2canvas as vezes falha com "transform: scale()".
        // Aqui removemos a escala temporariamente para tirar a foto 1080x1350 perfeita.
        const originalTransform = slide.style.transform;
        slide.style.transform = 'none';
        
        // Gera a imagem do canvas atual
        const canvas = await html2canvas(slide, {
            width: 1080,
            height: 1350,
            scale: 1, // Mantém a resolução em 1:1 real
            useCORS: true
        });
        
        // Retorna a escala para caber na tela do usuário
        slide.style.transform = originalTransform;

        // Cria um link invisível e força o download
        const link = document.createElement('a');
        link.download = `Slide_0${i + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Pequena pausa para o navegador não bugar os downloads simultâneos
        await new Promise(r => setTimeout(r, 400));
    }
    
    btn.innerText = originalText;
    btn.disabled = false;
});

// Suporte para "Enter"
document.getElementById('themeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btnGenerate').click();
});