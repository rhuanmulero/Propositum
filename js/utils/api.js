export function getMockData(template, topic, slideCount = 4) {
    const t = topic || "Seu Negócio";
    const isStructureA =['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass', 'layout-saas-3d', 'layout-hex-corp'].includes(template);
    
    // Constrói os itens do meio dinamicamente até bater o limite
    const middleItems =[];
    for(let i=0; i < slideCount - 2; i++) {
        middleItems.push({ 
            type: "features", 
            title: `Pilar Estratégico ${i+1}`, 
            items:[
                { title: `Decisão ${i+1}`, desc: "Gere valor absoluto imediatamente." },
                { title: `Tática ${i+1}`, desc: "Automação orientada aos melhores resultados." }
            ]
        });
    }
    
    if (isStructureA) {
        return {
            image_category: "technology", 
            slides:[
                { type: "cover", tag: "NOVA TENDÊNCIA", title: `O Futuro da ${t} já começou` },
                ...middleItems,
                { type: "cta", title: "Pronto para inovar?", desc: "Nossa equipe está pronta para elevar sua eficiência.", button: "Entre em contato conosco" }
            ]
        };
    } else {
        return {
            image_category: "office", 
            slides:[
                { type: "cover", tag: "URGENTE!", title: `Por que investir em ${t} hoje mesmo` },
                ...middleItems,
                { type: "cta", title: "Sua empresa precisa evoluir.", desc: "Fomos desenhados para entregar exatamente o que você exige.", button: "Clique no link e agende" }
            ]
        };
    }
}

export async function fetchGeminiData(theme, template, apiKey, activeProfile, slideCount, context = '') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    let brandContext = "";
    if (activeProfile && activeProfile.vision) {
        brandContext = `IMPORTANTE: Aja como a marca "${activeProfile.name}". Tom de voz e diretrizes: "${activeProfile.vision}". Crie os textos refletindo essa personalidade.`;
    }

    let extraContext = "";
    if (context && context.trim() !== "") {
        extraContext = `\nCONTEXTO ADICIONAL FORNECIDO PELO USUÁRIO (Siga rigorosamente estas instruções para o conteúdo): "${context}"\n`;
    }

    const isStructureA =['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass', 'layout-saas-3d', 'layout-hex-corp'].includes(template);
    
    const rules = isStructureA ? `
BLOCOS PARA OS SLIDES DO MEIO:
- "features", "process": Propriedades obrigatórias -> "title", "show_image" (booleano), "items" (array com 2 a 4 itens contendo "title" e "desc").
` : `
BLOCOS PARA OS SLIDES DO MEIO:
- "features", "news": Propriedades obrigatórias -> "title", "show_image" (booleano), "items" (array com 2 a 4 itens contendo "title" e "desc").
`;

    const slidesSchema =[];
    slidesSchema.push(`{ "type": "cover", "text_align": "center", "image_mode": "background", "tag": "ESCREVA A TAG", "title": "ESCREVA O TÍTULO" }`);
    for (let i = 0; i < slideCount - 2; i++) {
        slidesSchema.push(`{ "type": "features", "text_align": "left", "image_mode": "split", "card_style": "solid", "title": "ESCREVA O TÍTULO", "show_image": true, "items":[{"title": "Item 1", "desc": "Desc 1"}, {"title": "Item 2", "desc": "Desc 2"}] }`);
    }
    slidesSchema.push(`{ "type": "cta", "text_align": "center", "image_mode": "background", "title": "CHAMADA", "desc": "ARGUMENTO FINAL", "button": "TEXTO BOTÃO" }`);

const prompt = `
Você é um Copywriter e Diretor de Arte Sênior.
Crie um carrossel de EXATAMENTE ${slideCount} SLIDES sobre o tema: "${theme}".

${brandContext}
${extraContext}

REGRA DE DIREÇÃO DE ARTE (OBRIGATÓRIO):
Para CADA slide, escolha:
- "text_align": "left", "center" ou "right"
- "card_style": "solid", "glass", "outline" ou "minimal" (apenas para slides com itens)
- "image_mode": "top", "background", ou "split" (como a imagem principal será exibida)

RETORNE APENAS UM JSON VÁLIDO SEGUINDO ESTE FORMATO DE ESTRUTURA (DEVE TER EXATAMENTE ${slideCount} OBJETOS NA ARRAY 'slides'):
{
  "image_category": "technology",
  "slides": [
    ${slidesSchema.join(',\n    ')}
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

// NOVA FUNÇÃO: REGERAR UM SLIDE INDIVIDUAL
export async function fetchSingleSlide(theme, template, apiKey, activeProfile, slideType) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    let brandContext = activeProfile && activeProfile.vision 
        ? `IMPORTANTE: Aja como a marca "${activeProfile.name}". Tom de voz e diretrizes: "${activeProfile.vision}".` : '';

    const prompt = `
Você é um Copywriter e Diretor de Arte Sênior.
Re-escreva APENAS UM slide (do tipo: "${slideType}") sobre o tema: "${theme}". O slide será injetado no meio de um carrossel em andamento para substituir o antigo.

${brandContext}

RETORNE APENAS UM JSON VÁLIDO REPRESENTANDO ESTE ÚNICO SLIDE, NESTE FORMATO EXATO:
{
  "type": "${slideType}",
  "text_align": "left",
  "image_mode": "split",
  "card_style": "solid",
  "tag": "ESCREVA A TAG (se cover)",
  "title": "ESCREVA O TÍTULO AQUI",
  "desc": "DESCRIÇÃO CURTA (se cta)",
  "button": "TEXTO DO BOTÃO (se cta)",
  "show_image": true,
  "items":[
    { "title": "Exemplo de Tópico", "desc": "Breve explicação sobre esse tópico." },
    { "title": "Exemplo Secundário", "desc": "Sempre crie pelo menos 2 itens se for process, features ou news." }
  ]
}
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
        console.error("Erro na IA (Regerar Slide):", error); 
        return null;
    }
}
