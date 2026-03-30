import { DadosExtraidos, ResultadoBioressonancia } from '../types';

export const aiService = {
  /**
   * Valida se as chaves necessárias estão presentes e no formato correto no frontend.
   */
  validarConfiguracao() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const appSecret = import.meta.env.VITE_APP_SECRET_KEY;

    if (!appSecret) {
      console.error("ERRO: VITE_APP_SECRET_KEY não encontrada.");
      throw new Error("Chave de segurança do aplicativo ausente. Verifique as configurações de Secrets.");
    }

    if (!apiKey || apiKey === "AIzaSy..." || apiKey === "MY_GEMINI_API_KEY") {
      console.error("ERRO: VITE_GEMINI_API_KEY ausente ou placeholder.");
      throw new Error("API Key do Gemini não configurada. Adicione VITE_GEMINI_API_KEY aos Secrets.");
    }

    if (!apiKey.startsWith("AIza")) {
      console.error("ERRO: Formato de VITE_GEMINI_API_KEY inválido.");
      throw new Error("Formato da API Key do Gemini inválido. Certifique-se de que ela começa com 'AIza'.");
    }

    return { apiKey, appSecret };
  },

  /**
   * Processa o exame de bioressonância usando a API Gemini via backend.
   */
  async processarExame(
    base64Pdf: string, 
    clienteId: string, 
    sexo: string, 
    idade: number, 
    historico?: ResultadoBioressonancia[], 
    feedbackTreino?: string
  ): Promise<DadosExtraidos> {
    
    try {
      // 1. Validar configuração antes de qualquer coisa
      this.validarConfiguracao();

      // 2. Construir contextos adicionais (Histórico e Feedback)
      let historicoContext = '';
      if (historico && historico.length > 0) {
        const historicoSimplificado = historico.map(h => ({
          data: new Date(h.created_at).toLocaleDateString('pt-BR'),
          bioScore: h.dados_extraidos.bioScore,
          desequilibrios: h.dados_extraidos.desequilibrios.map(d => `${d.sistema} (${d.severidade})`)
        }));
        historicoContext = `\nHISTÓRICO DO CLIENTE:\n${JSON.stringify(historicoSimplificado, null, 2)}\nSe houver dados de exames anteriores, inclua uma "Análise Comparativa de Evolução" na sintese_final.`;
      }

      let feedbackContext = '';
      if (feedbackTreino) {
        feedbackContext = `\nFEEDBACK DE TREINO DO USUÁRIO:\n"${feedbackTreino}"\nCorrelacione este feedback com os dados biológicos para refinar as recomendações.`;
      }

      // 3. Definir o Prompt Mestre
      const prompt = `Você é o Assistente de Saúde Integrativa Celso Biffe. Atue como um Engenheiro de Dados e Terapeuta Holístico Sênior.
      Analise este laudo de bioressonância quântica para um cliente do sexo ${sexo} de ${idade} anos.
      
      MÓDULOS OBRIGATÓRIOS (360º):
      1. METABOLISMO: Dificuldade de emagrecimento, tendência a ganho de peso.
      2. ENERGIA: Nível de vitalidade e causa do cansaço.
      3. INFLAMAÇÃO: Nível inflamatório e origem de dores.
      4. SONO: Qualidade e profundidade.
      5. EMOCIONAL: Estresse e padrão emocional.
      6. PERFORMANCE: Impacto hormonal na hipertrofia/catabolismo.
      7. ALERTA DE TREINO: Se fadiga for Alta -> "Regenerativo", se Baixa -> "Alta Performance".
      8. FEEDBACK: Correlacione o feedback do usuário: ${feedbackContext}
      
      REGRAS:
      - Correlacione físico com emocional.
      - Explique a CAUSA RAIZ.
      - Associe frequências Solfeggio (174Hz, 396Hz, 528Hz, 741Hz, 852Hz) conforme os desequilíbrios.${historicoContext}

      RETORNE APENAS UM JSON:
      {
        "bioScore": 0-100,
        "perfil": "string",
        "fadiga": boolean,
        "metabolismo": { "dificuldade_emagrecimento": "string", "tendencia_ganho_peso": "string", "eficiencia_metabolica": "string" },
        "energia": { "nivel_energia": "string", "causa_cansaco": "string" },
        "inflamacao": { "nivel_inflamacao": "string", "origem_dores": "string" },
        "sono": { "qualidade_sono": "string", "profundidade_sono": "string" },
        "emocional": { "nivel_estresse": "string", "padrao_emocional": "string" },
        "performance": { "potencial_hipertrofia": "string", "qualidade_recuperacao": "string", "eficiencia_digestiva": "string", "dica_treino": "string" },
        "sintese_final": "string",
        "feedback_treino": "string",
        "desequilibrios": [{ "sistema": "string", "severidade": "Baixa"|"Média"|"Alta", "descricao": "string" }]
      }`;

      // 4. Chamada ao Backend (Proxy)
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_APP_SECRET_KEY || ""
        },
        body: JSON.stringify({
          prompt: [
            { text: prompt },
            { inlineData: { mimeType: "application/pdf", data: base64Pdf } }
          ],
          model: "gemini-3-flash-preview"
        })
      });

      // 5. Tratamento de Resposta do Servidor
      if (!response.ok) {
        let errorMsg = "Erro na comunicação com o servidor de IA.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          errorMsg = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const text = data.text;
      
      if (!text) throw new Error('A IA não retornou conteúdo válido.');
      
      // Limpeza de Markdown se necessário
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr) as DadosExtraidos;

    } catch (error: any) {
      console.error('Erro no aiService:', error);
      
      // Se for erro de validação (nossa), repassamos para o UI
      if (error.message.includes("ausente") || error.message.includes("inválido")) {
        throw error;
      }

      // Fallback resiliente para não travar o fluxo do terapeuta
      return this.obterMockResiliente();
    }
  },

  /**
   * Retorna um objeto de mock em caso de falha técnica, garantindo que o app continue funcional.
   */
  obterMockResiliente(): DadosExtraidos {
    return {
      bioScore: 60,
      perfil: "Análise em Modo de Segurança",
      fadiga: true,
      metabolismo: {
        dificuldade_emagrecimento: "Dados não processados pela IA",
        tendencia_ganho_peso: "Verificar laudo manualmente",
        eficiencia_metabolica: "Pendente"
      },
      energia: { nivel_energia: "Baixo (Mock)", causa_cansaco: "Falha na conexão com IA" },
      inflamacao: { nivel_inflamacao: "Moderado", origem_dores: "Verificar laudo" },
      sono: { qualidade_sono: "Irregular", profundidade_sono: "Baixa" },
      emocional: { nivel_estresse: "Alto", padrao_emocional: "Pendente" },
      performance: { 
        potencial_hipertrofia: "Médio", 
        qualidade_recuperacao: "Baixa", 
        eficiencia_digestiva: "Média",
        dica_treino: "Treino Regenerativo (Segurança)"
      },
      sintese_final: "Ocorreu um erro técnico ao processar o laudo com a IA. Estes dados são uma estimativa de segurança. Por favor, revise o PDF manualmente.",
      desequilibrios: [
        { sistema: "Geral", severidade: "Média", descricao: "Erro de processamento de IA" }
      ]
    };
  }
};
