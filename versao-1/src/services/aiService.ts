import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { RelatorioAnalise } from "../types";
import { sugerirProtocolos } from "./searchService";
import { normalizarMetrica } from "../utils/normalizadorMetricas";

// Inicialização simplificada usando API Key direta (Google AI Studio)
// Não requer Google Cloud Project, Billing ou Vertex AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Dados de fallback em caso de falha na API
export const MOCK_RESULT: RelatorioAnalise = {
  perfil_analise: "Holistico",
  indice_prontidao: {
    score: 80,
    status: "Ideal para Treino",
    frequencia_sugerida: "528 Hz"
  },
  marcadores_fadiga: ["Leve estresse oxidativo"],
  protocolo_intervencao: {
    auriculoterapia: {
      pontos: ["Shenmen", "Rim", "Simpático"],
      justificativa: "Equilíbrio geral do sistema nervoso."
    },
    biomagnetismo: {
      pares: ["Timo - Reto"],
      justificativa: "Fortalecimento do sistema imunológico."
    }
  },
  relatorios_analisados: ["Relatório de Demonstração (Fallback)"],
  desequilibrios_encontrados: [
    { categoria: "Geral", item: "Vitalidade", severidade: "+", impacto_holistico: "Leve baixa energética" }
  ],
  plano_terapeutico: [
    { terapia: "Reiki", evidencias: ["Baixa vitalidade"], justificativa: "Reposição energética", frequencia_sugerida: "528 Hz" },
    { terapia: "Biomagnetismo", evidencias: ["Desequilíbrio de pH"], justificativa: "Neutralização de patógenos", frequencia_sugerida: "741 Hz" }
  ]
};

// Função auxiliar para converter arquivo em base64 usando Web Worker
// Isso evita o bloqueio da thread principal (UI) durante o processamento de PDFs grandes
function convertFileToBase64Worker(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const workerCode = `
      self.onmessage = function(e) {
        try {
          const file = e.data;
          // FileReaderSync é síncrono, mas seguro aqui pois já estamos em uma thread separada (Worker)
          const reader = new FileReaderSync();
          const dataUrl = reader.readAsDataURL(file);
          const base64 = dataUrl.split(',')[1];
          self.postMessage({ success: true, base64 });
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
      if (e.data.success) {
        resolve(e.data.base64);
      } else {
        reject(new Error(e.data.error));
      }
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };

    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };

    worker.postMessage(file);
  });
}

export async function processarRelatoriosBioressonancia(
  files: File[], 
  sexo?: 'Masculino' | 'Feminino', 
  idade?: number
): Promise<RelatorioAnalise> {
  const parts = await Promise.all(
    files.map(async (file) => {
      const base64 = await convertFileToBase64Worker(file);
      return {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      };
    })
  );

  const systemInstruction = `Motor de Análise Bio-Holística LUMINA
[PERFIL E MISSÃO]
Você é o "Cérebro" do sistema LUMINA, um Especialista em Bioressonância Magnética Quântica e Práticas Integrativas. Sua missão é ler dados brutos de relatórios de bioressonância, identificar anomalias funcionais e sugerir um plano terapêutico baseado estritamente na lista de terapias fornecida.

[DADOS DO CLIENTE]
- Sexo: ${sexo || 'Não informado'}
- Idade: ${idade || 'Não informada'}

[DIRETRIZES DE EXTRAÇÃO DE DADOS]
- Identificação de Alvos: Varra o texto/PDF em busca de tabelas. Ignore valores dentro da "Faixa Normal".
- Priorização de Severidade: Extraia e categorize apenas itens com: (+) Pouco anormal, (++) Moderadamente anormal, (+++) Severamente anormal.
- O campo evidencias no JSON deve conter apenas os itens brutos extraídos do PDF (ex: 'Viscosidade do Sangue +++', 'Cristais de Colesterol ++').
- O campo justificativa deve ser uma frase curta ligando esses pontos: 'Identificado desequilíbrio na fluidez sanguínea e acúmulo lipídico'.
- O campo frequencia_sugerida deve conter uma frequência Solfeggio (ex: '528 Hz') baseada no diagnóstico principal daquela terapia.
- IMPORTANTE: Considere o Sexo e Idade do cliente para evitar sugestões clinicamente inadequadas (ex: não sugerir exames de próstata para mulheres).

[ANÁLISE DE PRONTIDÃO E PERFIL]
- Identifique se o exame tem um viés de Performance/Fitness ou Holístico Tradicional baseado nos marcadores.
- Calcule o 'Índice de Prontidão (Readiness Score)' de 0 a 100%. Avalie marcadores de inflamação, fadiga adrenal, estresse oxidativo e vitalidade. Quanto maior a fadiga/inflamação, menor o score.
- Status do Índice:
  - 0 a 39: "Risco de Lesão (Descanso)"
  - 40 a 74: "Recuperação Ativa"
  - 75 a 100: "Ideal para Treino"
- Frequência sugerida para o índice:
  - 0 a 39: "174 Hz"
  - 40 a 74: "417 Hz"
  - 75 a 100: "40 Hz"
- Extraia os marcadores de fadiga encontrados (ex: "Nível de Ácido Lático ++", "Cortisol Alto") que justificam o score.

[PLANO DE AÇÃO IMEDIATA (AURICULOTERAPIA E BIOMAGNETISMO)]
- Analise os marcadores críticos (+++).
- Consulte a PROTOCOLOS_BASE (conhecimento geral de Auriculoterapia e Biomagnetismo).
- Se houver desequilíbrio no Fígado, sugira os pontos de Auriculo: Fígado, Baço e S.N.V.
- Se houver inflamação muscular, sugira o par de Biomagnetismo: Suprarrenais - Suprarrenais.
- Adapte a justificativa ao Perfil:
  - Se for Performance, use termos como 'Recuperação Tecidual' e 'Otimização de ATP'.
  - Se for Holístico, use 'Harmonização Energética' e 'Equilíbrio Vital'.
- Envie um campo referencia_visual (ex: 'orelha_pontos_digestao.png' ou 'biomagnetismo_fadiga.png').`;

  const prompt = `Analise os relatórios de bioressonância em anexo para um cliente do sexo ${sexo || 'não informado'} e idade ${idade || 'não informada'}.
Extraia as anomalias e sugira um plano terapêutico integrativo.
As terapias sugeridas DEVEM ser escolhidas estritamente desta lista: Radiestesia, Biomagnetismo, Apometria, Radiônica, Cartomancia, Reiki, Sistema Ashtariano, Mapas, E.F.T.
Retorne os dados estritamente no formato JSON solicitado.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            perfil_analise: {
              type: SchemaType.STRING,
              enum: ["Performance", "Holistico"],
              description: "Viés do exame (Performance/Fitness ou Holístico Tradicional)",
              format: "enum"
            },
            indice_prontidao: {
              type: SchemaType.OBJECT,
              properties: {
                score: { type: SchemaType.NUMBER, description: "Score de 0 a 100" },
                status: { type: SchemaType.STRING, description: "Status baseado no score" },
                frequencia_sugerida: { type: SchemaType.STRING, description: "Frequência Solfeggio sugerida para o status" }
              },
              required: ["score", "status", "frequencia_sugerida"]
            },
            marcadores_fadiga: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Marcadores de fadiga/inflamação encontrados"
            },
            protocolo_intervencao: {
              type: SchemaType.OBJECT,
              properties: {
                auriculoterapia: {
                  type: SchemaType.OBJECT,
                  properties: {
                    pontos: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    justificativa: { type: SchemaType.STRING },
                    referencia_visual: { type: SchemaType.STRING }
                  },
                  required: ["pontos", "justificativa"]
                },
                biomagnetismo: {
                  type: SchemaType.OBJECT,
                  properties: {
                    pares: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    justificativa: { type: SchemaType.STRING },
                    referencia_visual: { type: SchemaType.STRING }
                  },
                  required: ["pares", "justificativa"]
                }
              }
            },
            relatorios_analisados: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Nomes ou identificadores dos relatórios analisados",
            },
            desequilibrios_encontrados: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  categoria: { type: SchemaType.STRING, description: "Categoria do exame (ex: Função Hepática)" },
                  item: { type: SchemaType.STRING, description: "Item específico analisado" },
                  severidade: {
                    type: SchemaType.STRING,
                    enum: ["+", "++", "+++"],
                    description: "Nível de severidade da anomalia",
                    format: "enum"
                  },
                  impacto_holistico: { type: SchemaType.STRING, description: "Explicação do impacto holístico deste desequilíbrio" },
                },
                required: ["categoria", "item", "severidade", "impacto_holistico"],
              },
            },
            plano_terapeutico: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  terapia: {
                    type: SchemaType.STRING,
                    enum: ["Radiestesia", "Biomagnetismo", "Apometria", "Radiônica", "Cartomancia", "Reiki", "Sistema Ashtariano", "Mapas", "E.F.T."],
                    description: "Terapia sugerida",
                    format: "enum"
                  },
                  evidencias: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "Itens brutos extraídos do PDF que justificam a terapia (ex: 'Viscosidade do Sangue +++')"
                  },
                  justificativa: { type: SchemaType.STRING, description: "Frase curta ligando os pontos das evidências" },
                  frequencia_sugerida: { type: SchemaType.STRING, description: "Frequência Solfeggio sugerida (ex: '528 Hz')" },
                },
                required: ["terapia", "evidencias", "justificativa", "frequencia_sugerida"],
              },
            },
          },
          required: ["relatorios_analisados", "desequilibrios_encontrados", "plano_terapeutico"],
        },
      },
      systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, ...parts] }],
    });

    const response = await result.response;
    const text = response.text();
    if (!text) throw new Error("A IA não retornou nenhuma resposta.");
    
    try {
      // Remove possible markdown formatting like ```json ... ```
      const cleanText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsedData = JSON.parse(cleanText) as RelatorioAnalise;
      
      // Use the searchService to generate or augment the intervention protocol
      if (parsedData.desequilibrios_encontrados && parsedData.desequilibrios_encontrados.length > 0) {
        parsedData.desequilibrios_encontrados = parsedData.desequilibrios_encontrados.map(d => ({
          ...d,
          item: normalizarMetrica(d.item)
        }));

        const protocolos = sugerirProtocolos(parsedData.desequilibrios_encontrados, parsedData.perfil_analise);
        
        // Merge the suggested protocols with the AI's generated ones (if any)
        const aiPontos = parsedData.protocolo_intervencao?.auriculoterapia?.pontos || [];
        const aiPares = parsedData.protocolo_intervencao?.biomagnetismo?.pares || [];
        
        const combinedPontos = Array.from(new Set([...protocolos.auriculoterapia.pontos, ...aiPontos])).slice(0, 8);
        const combinedPares = Array.from(new Set([...protocolos.biomagnetismo.pares, ...aiPares])).slice(0, 8);

        parsedData.protocolo_intervencao = {
          ...parsedData.protocolo_intervencao,
          auriculoterapia: {
            pontos: combinedPontos.length > 0 ? combinedPontos : ['Shenmen', 'Rim', 'Simpático'], // Default points if all else fails
            justificativa: protocolos.auriculoterapia.justificativa || parsedData.protocolo_intervencao?.auriculoterapia?.justificativa || '',
            referencia_visual: parsedData.protocolo_intervencao?.auriculoterapia?.referencia_visual || 'orelha_pontos_digestao.png'
          },
          biomagnetismo: {
            pares: combinedPares.length > 0 ? combinedPares : ['Timo - Reto'], // Default pair if all else fails
            justificativa: protocolos.biomagnetismo.justificativa || parsedData.protocolo_intervencao?.biomagnetismo?.justificativa || '',
            referencia_visual: parsedData.protocolo_intervencao?.biomagnetismo?.referencia_visual || 'biomagnetismo_fadiga.png'
          }
        };
      }

      return parsedData;
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON da IA:", parseError, text);
      throw new Error("Erro ao processar dados da IA. Verifique o formato do PDF.");
    }
  } catch (error: any) {
    console.error("Erro ao processar relatórios:", error);
    
    // Fallback para dados de demonstração em caso de erro na API
    console.log("Usando dados de fallback (Modo de Demonstração)");
    return MOCK_RESULT;
  }
}
