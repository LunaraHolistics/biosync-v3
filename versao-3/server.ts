import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("=== DIAGNÓSTICO DE AMBIENTE ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  
  const allKeys = Object.keys(process.env);
  console.log("Variáveis disponíveis (nomes):", allKeys.filter(k => !k.startsWith('npm_') && !k.startsWith('NODE_')));

  const getValidKey = () => {
    const keys = [
      { name: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY },
      { name: 'VITE_GEMINI_API_KEY', value: process.env.VITE_GEMINI_API_KEY },
      { name: 'API_KEY', value: process.env.API_KEY }
    ];

    for (const k of keys) {
      let val = k.value?.trim();
      if (val) {
        // Remove aspas extras que o usuário pode ter colado por engano
        val = val.replace(/^["']|["']$/g, '').trim();
        
        // Remove prefixos comuns se o usuário colou a linha inteira do .env
        if (val.toUpperCase().startsWith("GEMINI_API_KEY=")) {
          val = val.substring("GEMINI_API_KEY=".length).trim();
        } else if (val.toUpperCase().startsWith("API_KEY=")) {
          val = val.substring("API_KEY=".length).trim();
        }

        if (val !== "MY_GEMINI_API_KEY" && val !== "AIzaSy..." && val.length > 10) {
          console.log(`Usando chave de: ${k.name}`);
          return val;
        }
      }
    }
    return null;
  };

  const apiKey = getValidKey();
  
  if (!apiKey) {
    console.error("AVISO CRÍTICO: Nenhuma chave de API válida encontrada.");
    console.log("Verifique o painel de Secrets no AI Studio e certifique-se de que a chave começa com 'AIza'.");
  } else {
    const isFormatValid = apiKey.startsWith("AIza");
    console.log("=== VALIDAÇÃO DE CHAVE ===");
    console.log("Comprimento:", apiKey.length);
    console.log("Máscara: " + apiKey.substring(0, 6) + "..." + apiKey.substring(apiKey.length - 6));
    console.log("Formato AIza? ", isFormatValid ? "SIM" : "NÃO");
    
    if (!isFormatValid) {
      console.error("ERRO: A chave encontrada não possui o prefixo 'AIza'. Ela provavelmente não funcionará.");
    }
  }

  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // Teste de inicialização da IA
  if (ai) {
    console.log("Testando conexão com Gemini...");
    ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
    }).then(() => {
      console.log("Teste de conexão Gemini: SUCESSO");
    }).catch((err) => {
      console.error("Teste de conexão Gemini: FALHA");
      console.error("Erro detalhado do teste:", JSON.stringify(err, null, 2));
      if (err.message?.includes("API key not valid")) {
        console.error("A chave fornecida foi REJEITADA pelo Google. Verifique se ela está ativa e sem restrições.");
      }
    });
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Middleware de Autenticação Simples
  const autenticar = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers["x-api-key"];
    const secretKey = process.env.APP_SECRET_KEY;

    if (!secretKey) {
      console.error("ERRO CRÍTICO: APP_SECRET_KEY não definida no painel de Secrets.");
      return res.status(500).json({ error: "Configuração de segurança ausente no servidor. Verifique os Secrets." });
    }

    if (!token) {
      return res.status(401).json({ error: "Não autorizado: Chave de API (x-api-key) ausente no cabeçalho da requisição." });
    }

    if (token !== secretKey) {
      console.warn(`Tentativa de acesso negada. Token recebido: ${String(token).slice(0, 3)}...`);
      return res.status(401).json({ error: "Não autorizado: Chave de API inválida." });
    }

    next();
  };

  // Gemini API Endpoint - Protegido por autenticação
  app.post("/api/ai/generate", autenticar, async (req, res) => {
    const { prompt, model: requestedModel } = req.body;
    
    if (!ai) {
      console.error("Erro: IA não configurada (GEMINI_API_KEY ausente)");
      return res.status(500).json({ error: "IA não configurada: GEMINI_API_KEY ausente no servidor." });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt ausente na requisição." });
    }

    try {
      const modelName = requestedModel || "gemini-3-flash-preview";
      
      // Se o prompt for um array, assumimos que são as partes do conteúdo
      const contents = Array.isArray(prompt) ? { parts: prompt } : prompt;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
      });

      if (!response || !response.text) {
        console.error("Resposta da IA vazia ou inválida:", response);
        return res.status(500).json({ error: "A IA retornou uma resposta vazia." });
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erro Gemini detalhado:", error);
      // Garantir que sempre retornamos JSON
      res.status(500).json({ 
        error: error.message || "Falha ao comunicar com a IA. Verifique a API Key e configurações do projeto." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Servidor iniciado com variáveis carregadas corretamente.");
    console.log(`Servidor BioSync v2 rodando em http://localhost:${PORT}`);
  });
}

startServer();
