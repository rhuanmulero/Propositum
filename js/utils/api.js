export function getMockData(template, topic) {
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

export async function fetchGeminiData(theme, template, apiKey) {
    const isStructureA = ['layout-tech', 'layout-minimal', 'layout-neon', 'layout-glass'].includes(template);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const promptTech = `Retorne APENAS JSON. Tema: "${theme}". Estrutura: {"slides":[{"type":"cover","tag":"TAG","title":"Tít"},{"type":"features","title":"Tít","subtitle":"Sub","items":[{"title":"Tít","desc":"Desc"}]},{"type":"process","title":"Tít","subtitle":"Sub","items":[{"title":"P1","desc":"Desc"}],"footerText":"Rodapé"},{"type":"cta","title":"Tít","desc":"Desc","button":"Botão"}]}`;
    const promptCorp = `Retorne APENAS JSON. Tema: "${theme}". Estrutura: {"slides":[{"type":"cover","tag":"TAG","title":"Tít"},{"type":"news","newsHeadline":"Falsa Notícia","newsSub":"Resumo","title":"Tít","bullets":["Ponto 1","Ponto 2"]},{"type":"features","title":"Tít","items":[{"title":"Item","desc":"Desc"}]},{"type":"cta","title":"Tít","desc":"Desc","button":"Botão"}]}`;

    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts:[{ text: isStructureA ? promptTech : promptCorp }] }] }) });
        if (!response.ok) throw new Error("Chave inválida");
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
        console.error(error); return null;
    }
}