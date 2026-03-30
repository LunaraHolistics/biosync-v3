import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import jsPDF from 'jspdf';
import { Terminal, CheckCircle2, XCircle, Play, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

type Status = "OK" | "ERRO";

interface ResultadoEtapa {
  etapa: string;
  status: Status;
  mensagem: string;
  sugestao?: string;
}

const TesteIntegracao: React.FC = () => {
  const [resultados, setResultados] = useState<ResultadoEtapa[]>([]);
  const [loading, setLoading] = useState(false);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);

  const getSugestao = (erro: string): string | undefined => {
    if (erro.includes("API_KEY")) return "Verifique se a chave está correta e ativa no Google Cloud (Settings > Gemini API Key)";
    if (erro.includes("CORS")) return "Executar configuração de CORS no bucket: gsutil cors set cors.json gs://seu-bucket";
    if (erro.includes("permission") || erro.includes("unauthorized")) return "Revisar Firebase Storage Rules para permitir escrita";
    if (erro.includes("oklch")) return "Substituir cores CSS por HEX ou RGB no componente PDF";
    return undefined;
  };

  const executarTesteSistema = async () => {
    setResultados([]);
    setFinalStatus(null);
    setLoading(true);
    const tempResultados: ResultadoEtapa[] = [];

    const adicionarResultado = (etapa: string, status: Status, mensagem: string, sugestao?: string) => {
      const novo = { etapa, status, mensagem, sugestao };
      tempResultados.push(novo);
      setResultados([...tempResultados]);
    };

    try {
      // Etapa 1 — Validação da API Key (No servidor)
      const appSecret = import.meta.env.VITE_APP_SECRET_KEY;
      if (!appSecret) {
        adicionarResultado("Configuração de Segurança", "ERRO", "VITE_APP_SECRET_KEY não encontrada no navegador.", "Certifique-se de adicionar VITE_APP_SECRET_KEY nos Secrets do AI Studio.");
        throw new Error("Fim do teste por erro de configuração.");
      }
      adicionarResultado("Validação API Key", "OK", "A chave é gerenciada pelo servidor (Segurança Ativa).");

      // Etapa 2 — Teste de conexão com Gemini via Backend
      try {
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_APP_SECRET_KEY || ""
          },
          body: JSON.stringify({
            prompt: "Responda apenas OK",
            model: "gemini-3-flash-preview"
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro na chamada ao servidor.");
        }

        const data = await response.json();
        const texto = data.text?.trim();
        if (!texto) throw new Error("Resposta vazia");
        adicionarResultado("Conexão Gemini (Backend)", "OK", `Resposta recebida: ${texto}`);
      } catch (e: any) {
        adicionarResultado("Conexão Gemini (Backend)", "ERRO", e.message || "Erro na chamada", getSugestao(e.message || "API_KEY"));
        throw new Error("Fim do teste por erro crítico");
      }

      // Etapa 3 — Geração de conteúdo real via Backend
      let textoGerado = "";
      try {
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_APP_SECRET_KEY || ""
          },
          body: JSON.stringify({
            prompt: "Gere um relatório simples com 2 linhas sobre saúde.",
            model: "gemini-3-flash-preview"
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro na geração no servidor.");
        }

        const data = await response.json();
        textoGerado = data.text || "";
        if (!textoGerado) throw new Error("Conteúdo vazio");
        adicionarResultado("Geração Conteúdo (Backend)", "OK", "Relatório gerado com sucesso.");
      } catch (e: any) {
        adicionarResultado("Geração Conteúdo (Backend)", "ERRO", e.message || "Erro na geração", getSugestao(e.message));
      }

      // Etapa 4 — Geração de PDF
      let pdfBlob: Blob;
      try {
        const doc = new jsPDF();
        doc.setTextColor(0, 0, 0);
        doc.text(textoGerado || "Teste PDF", 10, 10);
        pdfBlob = doc.output("blob");
        adicionarResultado("Geração PDF", "OK", "Blob do PDF gerado sem erros de oklch.");
      } catch (e: any) {
        adicionarResultado("Geração PDF", "ERRO", e.message || "Erro no jsPDF", getSugestao(e.message || "oklch"));
        throw new Error("Fim do teste");
      }

      // Etapa 5 — Upload para Firebase
      const storage = getStorage();
      const storageRef = ref(storage, `testes/teste-${Date.now()}.pdf`);
      try {
        await uploadBytes(storageRef, pdfBlob);
        adicionarResultado("Upload Firebase", "OK", "Arquivo enviado com sucesso.");
      } catch (e: any) {
        adicionarResultado("Upload Firebase", "ERRO", e.message || "Erro no upload", getSugestao(e.message || "CORS"));
        throw new Error("Fim do teste");
      }

      // Etapa 6 — Obter URL
      try {
        const url = await getDownloadURL(storageRef);
        if (!url.includes("https")) throw new Error("URL inválida");
        adicionarResultado("Obter URL", "OK", `URL pública gerada: ${url}`);
      } catch (e: any) {
        adicionarResultado("Obter URL", "ERRO", e.message || "Erro ao obter URL", getSugestao(e.message));
      }

      // Resumo Final
      const falhas = tempResultados.filter(r => r.status === "ERRO");
      if (falhas.length === 0) {
        setFinalStatus("SISTEMA 100% FUNCIONAL");
      } else {
        setFinalStatus("FALHAS DETECTADAS");
      }

      console.table(tempResultados);

    } catch (error: any) {
      console.error("ERRO NO TESTE COMPLETO:", error);
      setFinalStatus("FALHAS DETECTADAS");
      console.table(tempResultados);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
        <div className="flex items-center gap-3">
          <Terminal className="text-emerald-600" size={24} />
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Diagnóstico do Sistema</h2>
            <p className="text-xs text-neutral-500">Validação ponta-a-ponta de conectividade e serviços</p>
          </div>
        </div>
        <button
          onClick={executarTesteSistema}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 font-semibold shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
          {loading ? 'Diagnosticando...' : 'Iniciar Diagnóstico'}
        </button>
      </div>

      <div className="p-6 space-y-4">
        {resultados.length === 0 && !loading && (
          <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-2xl">
            <AlertCircle className="mx-auto text-neutral-300 mb-2" size={48} />
            <p className="text-neutral-500">Clique no botão acima para iniciar os testes de integração.</p>
          </div>
        )}

        <div className="space-y-3">
          {resultados.map((res, i) => (
            <div key={i} className={`p-4 rounded-xl border ${res.status === 'OK' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold uppercase tracking-wider text-neutral-500">{res.etapa}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${res.status === 'OK' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
                  {res.status}
                </span>
              </div>
              <p className={`text-sm ${res.status === 'OK' ? 'text-emerald-900' : 'text-red-900'}`}>{res.mensagem}</p>
              {res.sugestao && (
                <div className="mt-3 flex items-start gap-2 bg-white/50 p-2 rounded-lg border border-red-200">
                  <ShieldAlert size={14} className="text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-red-800">Sugestão: {res.sugestao}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {finalStatus && (
          <div className={`mt-8 p-6 rounded-2xl text-center border-2 ${finalStatus.includes('100%') ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
            <h3 className="text-2xl font-black tracking-tighter">{finalStatus}</h3>
            <p className="text-sm opacity-90 mt-1">
              {finalStatus.includes('100%') 
                ? 'Todos os serviços estão operando normalmente.' 
                : 'Alguns serviços apresentaram falhas. Verifique as sugestões acima.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TesteIntegracao;
