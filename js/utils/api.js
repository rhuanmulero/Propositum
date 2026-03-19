export function getMockData(template, topic) {
    const t = topic || "Seu Negócio";
    const isStructureA =['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass'].includes(template);
    
    if (isStructureA) {
        return {
            image_category: "technology", 
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
            image_category: "office", 
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

export async function fetchGeminiData(theme, template, apiKey, activeProfile) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    let brandContext = "";
    if (activeProfile && activeProfile.vision) {
        brandContext = `IMPORTANTE: Aja como a marca "${activeProfile.name}". Tom de voz e diretrizes: "${activeProfile.vision}". Crie os textos refletindo essa personalidade.`;
    }

    const isStructureA =['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass'].includes(template);
    
    const rules = isStructureA ? `
BLOCOS PARA OS SLIDES DO MEIO:
- "features": Propriedades obrigatórias -> "title", "subtitle" (opcional), "show_image" (booleano), "items" (array com 2 a 4 itens contendo "title" e "desc").
- "process": Propriedades obrigatórias -> "title", "footerText", "items" (array com 2 a 4 itens contendo "title" e "desc").
` : `
BLOCOS PARA OS SLIDES DO MEIO:
- "features": Propriedades obrigatórias -> "title", "show_image" (booleano), "items" (array com 2 a 4 itens contendo "title" e "desc").
- "news": Propriedades obrigatórias -> "newsHeadline", "newsSub", "title", "bullets" (array com 2 a 4 strings).
`;

const prompt = `
Você é um Copywriter e Diretor de Arte Sênior.
Crie um carrossel de EXATAMENTE 4 SLIDES sobre o tema: "${theme}".

${brandContext}

REGRA DE DIREÇÃO DE ARTE (OBRIGATÓRIO):
Você deve tomar decisões de layout para que cada carrossel seja visualmente único.
Para CADA slide, escolha:
- "text_align": "left", "center" ou "right"
- "card_style": "solid", "glass", "outline" ou "minimal" (apenas para slides com itens)
- "image_mode": "top", "background", ou "split" (como a imagem principal será exibida)

RETORNE APENAS UM JSON VÁLIDO SEGUINDO ESTE FORMATO EXATO:
{
  "image_category": "technology",
  "slides":[
    {
      "type": "cover",
      "text_align": "center",
      "image_mode": "background",
      "tag": "ESCREVA A TAG AQUI",
      "title": "ESCREVA O TÍTULO DE IMPACTO AQUI"
    },
    {
      "type": "ESCOLHA UM BLOCO AQUI (features, process ou news)",
      "text_align": "left",
      "image_mode": "split",
      "card_style": "solid",
      "title": "ESCREVA O TÍTULO",
      "show_image": true,
      "items":[
        { "title": "Item 1", "desc": "Descrição curta 1" },
        { "title": "Item 2", "desc": "Descrição curta 2" }
      ]
    },
    {
      "type": "ESCOLHA OUTRO BLOCO AQUI",
      "text_align": "center",
      "image_mode": "top",
      "card_style": "glass",
      "title": "ESCREVA O TÍTULO AQUI",
      "show_image": false,
      "items":[
        { "title": "Passo 1", "desc": "Descrição do passo" },
        { "title": "Passo 2", "desc": "Descrição do passo" }
      ]
    },
    {
      "type": "cta",
      "text_align": "center",
      "image_mode": "background",
      "title": "CHAMADA PARA AÇÃO",
      "desc": "ARGUMENTO FINAL",
      "button": "TEXTO DO BOTÃO"
    }
  ]
}

${rules}
`;

    try {
        const response = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                contents: [{ parts:[{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" } 
            }) 
        });
        
        if (!response.ok) throw new Error("Erro na chave de API");
        const data = await response.json();
        let rawJson = data.candidates[0].content.parts[0].text;
        return JSON.parse(rawJson.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
        console.error("Erro na IA:", error); 
        return null;
    }
}