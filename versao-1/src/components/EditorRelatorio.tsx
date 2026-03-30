import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Save, FileText, Trash2, Printer, MessageCircle, ArrowUp, ArrowDown, Edit2, FileDown, AlertCircle, Music, Sparkles } from 'lucide-react';
import { buscarProtocolos, ResultadoBusca } from '../services/searchEngine';
import { processarRelatoriosBioressonancia, MOCK_RESULT } from '../services/aiService';
import { SeletorTerapia } from './SeletorTerapia';
import { TerapiaSelector, TerapiaType } from './TerapiaSelector';
import { RelatorioFinalPDF } from './RelatorioFinalPDF';
import { PainelMetas } from './PainelMetas';
import { GraficoProntidao } from './GraficoProntidao';
import { ProtocoloIntervencaoCard } from './ProtocoloIntervencaoCard';
import { enviarRelatorioWhatsApp } from '../utils/whatsapp';
import { GuiaBoasVindas } from './GuiaBoasVindas';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { FREQUENCIAS_SOLFEGGIO } from '../data/frequencias';
import { RelatorioAnalise } from '../types';
import { Cliente } from './SelecaoCliente';

interface TerapiaConfig {
  id: string;
  nome: string;
  descricao_padrao: string;
  objetivo: string;
}

interface TerapiaSelecionada {
  id: string;
  nome: string;
  justificativa: string;
  observacoes: string;
  objetivo: string;
  evidencias: string[];
  descricao_padrao?: string;
  frequencia_sugerida?: string;
}

interface EditorRelatorioProps {
  analiseId: string;
  resultadoAnalise?: RelatorioAnalise | null;
  onSave: (plano: TerapiaSelecionada[]) => void;
  cliente?: Cliente | null;
  files?: File[];
}

export const EditorRelatorio: React.FC<EditorRelatorioProps> = ({ analiseId, resultadoAnalise: initialResultado, onSave, cliente, files }) => {
  const [resultadoAnalise, setResultadoAnalise] = useState<RelatorioAnalise | null>(initialResultado || null);
  const [terapiasSelecionadas, setTerapiasSelecionadas] = useState<TerapiaSelecionada[]>([]);
  const [expandedInfo, setExpandedInfo] = useState<Record<string, boolean>>({});
  const [previousData, setPreviousData] = useState<any[]>([]);
  const [metas, setMetas] = useState<any[]>([]);
  const [sinteseGeral, setSinteseGeral] = useState("");
  const [recomendacoesEditaveis, setRecomendacoesEditaveis] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [terapiaAtiva, setTerapiaAtiva] = useState<TerapiaType>('biomagnetismo');
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<ResultadoBusca[]>([]);
  const [hibrido, setHibrido] = useState(false);
  const [lastAnalyzedKey, setLastAnalyzedKey] = useState<string>('');

  // Check if data changed to enable/disable "Analisar" button
  const currentDataKey = JSON.stringify({
    clienteId: cliente?.id,
    fileCount: files?.length,
    fileNames: files?.map(f => f.name).join(',')
  });

  const canAnalyze = currentDataKey !== lastAnalyzedKey && files && files.length > 0;

  useEffect(() => {
    // Check for existing analysis in Supabase (Cache)
    const checkCache = async () => {
      if (resultadoAnalise) return;

      try {
        const { data, error } = await supabase
          .from('resultados_bioressonancia')
          .select('resultado_json')
          .eq('analise_id', analiseId)
          .maybeSingle();

        if (data?.resultado_json) {
          console.log('Cache hit: Carregando análise do banco de dados.');
          setResultadoAnalise(data.resultado_json);
          setLastAnalyzedKey(currentDataKey);
        }
      } catch (err) {
        console.warn('Erro ao verificar cache:', err);
      }
    };

    checkCache();
  }, [analiseId]);

  const handleAnalisarIA = async () => {
    if (!files || files.length === 0) return;
    
    setAnalyzing(true);
    setFallbackMode(false);
    setError(null);

    try {
      const result = await processarRelatoriosBioressonancia(
        files,
        cliente?.sexo,
        idade
      );

      setResultadoAnalise(result);
      setLastAnalyzedKey(currentDataKey);

      // Save to cache
      await supabase.from('resultados_bioressonancia').upsert({
        analise_id: analiseId,
        resultado_json: result,
        cliente_id: cliente?.id
      });

    } catch (err: any) {
      console.error('Erro na chamada da IA:', err);
      // Fallback Mode
      setFallbackMode(true);
      setResultadoAnalise(MOCK_RESULT);
      setLastAnalyzedKey(currentDataKey);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (termoBusca.length >= 2) {
      const resultados = buscarProtocolos(terapiaAtiva, termoBusca);
      setResultadosBusca(resultados);
    } else {
      setResultadosBusca([]);
    }
  }, [termoBusca, terapiaAtiva]);

  // Use AI results if available, otherwise fallback to mock data
  const [pontosAtencao, setPontosAtencao] = useState<any[]>([]);

  useEffect(() => {
    if (resultadoAnalise) {
      // Convert desequilibrios to pontosAtencao format
      const grouped = resultadoAnalise.desequilibrios_encontrados.reduce((acc: any, curr) => {
        const sistema = curr.categoria;
        if (!acc[sistema]) acc[sistema] = [];
        acc[sistema].push({ nome: curr.item, severidade: curr.severidade });
        return acc;
      }, {});
      
      const newPontos = Object.keys(grouped).map(sistema => ({
        sistema,
        itens: grouped[sistema]
      }));
      setPontosAtencao(newPontos);

      // Set initial recommendations from analysis or defaults
      if (!recomendacoesEditaveis) {
        const suggestions = [
          "Beber 500ml de água logo após a sessão para ancoragem vibracional.",
          "Evitar o uso de telas e luz azul 1 hora antes de dormir.",
          "Praticar respiração consciente (4-7-8) por 5 minutos ao acordar.",
          "Manter os estímulos nos pontos de auriculoterapia 3x ao dia."
        ];
        setRecomendacoesEditaveis(suggestions.join('\n'));
      }

      // Convert plano_terapeutico to terapiasSelecionadas format
      setTerapiasSelecionadas(prev => {
        const updated = [...prev];
        
        resultadoAnalise.plano_terapeutico.forEach(rt => {
          const existingIndex = updated.findIndex(t => t.nome === rt.terapia);
          
          // Lógica de Objetivo Dinâmico
          let dynamicObjetivo = "Harmonização Sistêmica";
          const bioScore = resultadoAnalise.indice_prontidao?.score || 0;
          const temFadiga = (resultadoAnalise.marcadores_fadiga || []).length > 0;
          
          if (bioScore < 60) {
            dynamicObjetivo = "Recuperação Vital e Detox";
          } else if (temFadiga) {
            dynamicObjetivo = "Equilíbrio Adrenal";
          }

          const novasEvidencias = rt.evidencias || resultadoAnalise.desequilibrios_encontrados
            .filter(d => d.severidade === '++' || d.severidade === '+++')
            .map(d => `${d.categoria}: ${d.item} (${d.severidade})`);

          if (existingIndex >= 0) {
            // Update evidences, keep user's justificativa/observacoes, update objective
            updated[existingIndex] = {
              ...updated[existingIndex],
              evidencias: novasEvidencias,
              frequencia_sugerida: rt.frequencia_sugerida,
              objetivo: dynamicObjetivo
            };
          } else {
            updated.push({
              id: Math.random().toString(),
              nome: rt.terapia,
              justificativa: rt.justificativa,
              observacoes: "",
              objetivo: dynamicObjetivo,
              evidencias: novasEvidencias,
              frequencia_sugerida: rt.frequencia_sugerida
            });
          }
        });
        return updated;
      });
    } else {
      // Fallback mock data
      setPontosAtencao([
        { sistema: "Cardiovascular", itens: [{ nome: "Viscosidade", severidade: "++" }] },
        { sistema: "Hepático", itens: [{ nome: "Toxinas", severidade: "+" }] }
      ]);
    }
  }, [resultadoAnalise]);

  useEffect(() => {
    const fetchPrevious = async () => {
      try {
        const { data: current, error: currentError } = await supabase.from('analises').select('cliente_id, created_at').eq('id', analiseId).single();
        if (currentError) {
          console.warn('Erro ao buscar análise atual, usando fallback:', currentError);
          return;
        }
        if (current) {
          const { data: prev, error: prevError } = await supabase
            .from('analises')
            .select('pontos_atencao')
            .eq('cliente_id', current.cliente_id)
            .lt('created_at', current.created_at)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          if (prevError && prevError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.warn('Erro ao buscar análise anterior:', prevError);
          }
          if (prev) setPreviousData(prev.pontos_atencao || []);
        }
      } catch (err) {
        console.error('Erro inesperado ao buscar histórico:', err);
      }
    };
    fetchPrevious();
  }, [analiseId]);

  // Data for PDF
  const paciente = cliente?.nome || "João Silva";
  const telefone = cliente?.whatsapp || "5511999999999";
  const data = new Date().toLocaleDateString();
  const recomendacoes = [
    "Evite correntes de ar após o Cone Hindú.",
    "Pressione os pontos da orelha 3x ao dia."
  ];

  const salvarPlanoTerapeutico = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('planos_terapeuticos')
      .upsert({
        analise_id: analiseId,
        terapias_recomendadas: sortedTerapias.map(t => ({ 
          nome_terapia: t.nome, 
          evidencias: t.evidencias,
          justificativa_editada: t.justificativa, 
          observacoes: t.observacoes,
          frequencia_sugerida: t.frequencia_sugerida
        })),
        sintese_geral: sinteseGeral
      });
    setLoading(false);
    if (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar relatório. Tente novamente.');
    } else {
      alert('Relatório salvo com sucesso!');
      setIsSaved(true);
      onSave(terapiasSelecionadas);
    }
  };

  const gerarEPreservarPDF = async () => {
    if (!pdfRef.current || !resultadoAnalise) {
      alert("Aguarde o carregamento completo da análise antes de gerar o PDF.");
      return;
    }
    
    console.log('Iniciando salvamento e geração de PDF...');
    setLoading(true);
    
    try {
      // 1. Salvar o Plano Terapêutico primeiro
      const { error: savePlanError } = await supabase
        .from('planos_terapeuticos')
        .upsert({
          analise_id: analiseId,
          terapias_recomendadas: sortedTerapias.map(t => ({ 
            nome_terapia: t.nome, 
            evidencias: t.evidencias,
            justificativa_editada: t.justificativa, 
            observacoes: t.observacoes,
            frequencia_sugerida: t.frequencia_sugerida,
            objetivo: t.objetivo
          })),
          sintese_geral: sinteseGeral,
          recomendacoes_personalizadas: recomendacoesEditaveis
        });

      if (savePlanError) throw savePlanError;
      console.log('Plano terapêutico salvo com sucesso.');

      // 2. Aguardar Renderização e garantir que fontes/gráficos carreguem
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Capturar dimensões exatas
      const node = pdfRef.current;
      const width = node.offsetWidth || 794; 
      const height = node.offsetHeight || 1123; 

      // 4. html-to-image
      const imgData = await toPng(node, {
        pixelRatio: 2,
        width: width,
        height: height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const pdf = new jsPDF('p', 'px', [width, height]);
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      
      const pdfBlob = pdf.output('blob');

      // 5. Upload para o Supabase Storage
      const fileName = `${analiseId}_relatorio_final.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('relatorios_finais')
        .upload(fileName, pdfBlob, { upsert: true, contentType: 'application/pdf' });

      if (uploadError) throw uploadError;
      console.log('PDF enviado para o storage.');

      // 6. Obter URL pública e atualizar a tabela analises
      const { data: publicUrlData } = supabase.storage
        .from('relatorios_finais')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('analises')
        .update({ 
          pdf_final_url: publicUrlData.publicUrl,
          status: 'concluida'
        })
        .eq('id', analiseId);

      if (updateError) throw updateError;
      console.log('URL do PDF salva na análise.');

      // 7. Download local
      pdf.save(fileName);
      setPdfUrl(publicUrlData.publicUrl);
      setIsSaved(true);
      
      alert('✅ Relatório confirmado, salvo no sistema e PDF baixado com sucesso!');
      console.log('Processo finalizado com sucesso.');
      
      if (onSave) onSave(terapiasSelecionadas);
    } catch (error) {
      console.error('Erro crítico no processo:', error);
      alert('Erro ao processar e salvar o relatório. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEnviarWhatsApp = () => {
    enviarRelatorioWhatsApp(paciente, telefone, analiseId);
  };

  const getPriority = (evidencias: string[]) => {
    if (evidencias.some(e => e.includes('+++'))) return 2; // Máxima
    if (evidencias.some(e => e.includes('++'))) return 1; // Moderada
    return 0;
  };

  const sortedTerapias = [...terapiasSelecionadas].sort((a, b) => {
    const prioA = getPriority(a.evidencias);
    const prioB = getPriority(b.evidencias);
    if (prioB !== prioA) return prioB - prioA;
    return 0;
  });

  const calcularIdade = (dataNasc?: string) => {
    if (!dataNasc) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const idade = calcularIdade(cliente?.data_nascimento);

  const handleAddTerapia = (nome: string, descricao: string, frequencia?: string) => {
    const evidencias = pontosAtencao.flatMap(s => 
      s.itens.filter(i => i.severidade === '++' || i.severidade === '+++')
             .map(i => `${s.sistema}: ${i.nome} (${i.severidade})`)
    );

    // Lógica de Objetivo Dinâmico para adição manual
    let dynamicObjetivo = "Harmonização Sistêmica";
    const bioScore = resultadoAnalise?.indice_prontidao?.score || 0;
    const temFadiga = (resultadoAnalise?.marcadores_fadiga || []).length > 0;
    
    if (bioScore < 60) {
      dynamicObjetivo = "Recuperação Vital e Detox";
    } else if (temFadiga) {
      dynamicObjetivo = "Equilíbrio Adrenal";
    }

    const novaTerapia: TerapiaSelecionada = {
      id: Math.random().toString(),
      nome,
      justificativa: "", // Start empty to focus on patient, or use a short link
      descricao_padrao: descricao,
      observacoes: "",
      objetivo: dynamicObjetivo,
      evidencias,
      frequencia_sugerida: frequencia
    };
    setTerapiasSelecionadas([...terapiasSelecionadas, novaTerapia]);
  };

  const moveTerapia = (index: number, direction: 'up' | 'down') => {
    const newTerapias = [...terapiasSelecionadas];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newTerapias.length) {
      [newTerapias[index], newTerapias[targetIndex]] = [newTerapias[targetIndex], newTerapias[index]];
      setTerapiasSelecionadas(newTerapias);
    }
  };

  const removeTerapia = (id: string) => {
    setTerapiasSelecionadas(terapiasSelecionadas.filter(t => t.id !== id));
  };

  const updateJustificativa = (id: string, novaJustificativa: string) => {
    setTerapiasSelecionadas(terapiasSelecionadas.map(t => 
      t.id === id ? { ...t, justificativa: novaJustificativa } : t
    ));
  };

  const updateObservacoes = (id: string, novasObservacoes: string) => {
    setTerapiasSelecionadas(terapiasSelecionadas.map(t => 
      t.id === id ? { ...t, observacoes: novasObservacoes } : t
    ));
  };

  return (
    <div className="space-y-6">
      <GuiaBoasVindas />

      {fallbackMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm font-medium">Exibindo dados em modo de segurança/cache (IA indisponível no momento).</p>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-2xl border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {fallbackMode && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 animate-pulse">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">Modo de Segurança Ativado</p>
            <p className="text-xs opacity-80">Exibindo dados em modo de segurança/cache devido a instabilidade na conexão com a IA.</p>
          </div>
        </div>
      )}

      {!resultadoAnalise && (
        <div className="p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">Pronto para Analisar</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Clique no botão abaixo para processar os relatórios com inteligência artificial e gerar o plano terapêutico.
          </p>
          <button
            onClick={handleAnalisarIA}
            disabled={analyzing || !canAnalyze}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analisar com IA
              </>
            )}
          </button>
        </div>
      )}
      
      {resultadoAnalise?.indice_prontidao && (
        <GraficoProntidao
          score={resultadoAnalise.indice_prontidao.score}
          status={resultadoAnalise.indice_prontidao.status}
          frequencia_sugerida={resultadoAnalise.indice_prontidao.frequencia_sugerida}
          marcadores_fadiga={resultadoAnalise.marcadores_fadiga || []}
          perfil={resultadoAnalise.perfil_analise}
        />
      )}

      {resultadoAnalise?.protocolo_intervencao && (
        <ProtocoloIntervencaoCard 
          protocolo={resultadoAnalise.protocolo_intervencao}
          perfil={resultadoAnalise.perfil_analise}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        {/* Editor Panel */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Editor de Plano Terapêutico
          </h2>

          <TerapiaSelector selected={terapiaAtiva} onSelect={setTerapiaAtiva} />

          <div className="flex items-center gap-2 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <input
              type="checkbox"
              id="hibrido"
              checked={hibrido}
              onChange={(e) => setHibrido(e.target.checked)}
              className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="hibrido" className="text-sm font-medium text-indigo-900">Ativar Perfil Híbrido: Gestão & Performance</label>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder={`Buscar em ${terapiaAtiva}...`}
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <AlertCircle className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>

            {resultadosBusca.length > 0 && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200 max-h-60 overflow-y-auto shadow-inner">
                {resultadosBusca.map((res, idx) => (
                  <div key={idx} className="p-3 hover:bg-white transition-colors group">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-800 text-sm">
                          {'ponto1' in res ? `${(res as any).ponto1} - ${(res as any).ponto2}` : 'ponto' in res ? (res as any).ponto : (res as any).nome}
                        </h5>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {'sintomas' in res ? (res as any).sintomas : 'indicacoes' in res ? (res as any).indicacoes : (res as any).beneficios}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleAddTerapia(
                            'ponto1' in res ? `${(res as any).ponto1} - ${(res as any).ponto2}` : 'ponto' in res ? (res as any).ponto : (res as any).nome,
                            'sintomas' in res ? (res as any).sintomas : 'indicacoes' in res ? (res as any).indicacoes : (res as any).beneficios,
                            res.frequenciaRecomendada?.hz.toString()
                          )}
                          className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                          title="Adicionar ao plano"
                        >
                          <Save size={14} />
                        </button>
                        {res.frequenciaRecomendada && (
                          <a
                            href={res.frequenciaRecomendada.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                            title={`Ouvir ${res.frequenciaRecomendada.hz}Hz`}
                          >
                            <Music size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SeletorTerapia onTerapiaSelecionada={handleAddTerapia} />

          <PainelMetas 
            analiseId={analiseId} 
            pontosCriticos={pontosAtencao.flatMap(s => s.itens)} 
            onMetasChange={setMetas}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Síntese Vibracional</label>
            <textarea
              className="w-full p-3 rounded-lg border border-slate-200 text-sm h-24"
              value={sinteseGeral}
              onChange={(e) => setSinteseGeral(e.target.value)}
              placeholder="Digite a síntese vibracional aqui..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Recomendações Personalizadas (Pós-Sessão)</label>
            <textarea
              className="w-full p-3 rounded-lg border border-slate-200 text-sm h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={recomendacoesEditaveis}
              onChange={(e) => setRecomendacoesEditaveis(e.target.value)}
              placeholder="Digite as recomendações, uma por linha..."
            />
            <p className="text-[10px] text-slate-400 italic">Dica: Cada linha será um item na lista do PDF.</p>
          </div>

          <div className="space-y-4">
            {sortedTerapias.map((t, index) => {
              const priority = getPriority(t.evidencias);
              const borderColor = priority === 2 ? 'border-l-red-500' : priority === 1 ? 'border-l-orange-500' : 'border-l-slate-200';
              
              return (
                <div key={t.id} className={`p-4 border border-slate-200 border-l-4 ${borderColor} rounded-xl space-y-3 bg-white shadow-sm`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-lg">{t.nome}</h4>
                        {priority === 2 && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            PRIORIDADE MÁXIMA
                          </span>
                        )}
                        {priority === 1 && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Atenção Moderada
                          </span>
                        )}
                        {t.frequencia_sugerida && FREQUENCIAS_SOLFEGGIO[Number(t.frequencia_sugerida)] && (
                          <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold">
                            {t.frequencia_sugerida}Hz
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setExpandedInfo(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Saiba mais sobre esta terapia"
                      >
                        <AlertCircle size={18} />
                      </button>
                      <button onClick={() => removeTerapia(t.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  {expandedInfo[t.id] && t.descricao_padrao && (
                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100 animate-in fade-in slide-in-from-top-1">
                      <strong className="block mb-1 text-slate-700">Sobre a Terapia:</strong>
                      {t.descricao_padrao}
                    </div>
                  )}

                  <div className="text-sm text-slate-600">
                    <span className="font-semibold block mb-2 text-xs uppercase tracking-tight text-slate-500">Baseado nos Resultados:</span>
                    <div className="flex flex-wrap gap-2">
                      {t.evidencias.map((e, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Justificativa para o Paciente</label>
                      <textarea
                        className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={t.justificativa}
                        onChange={(e) => updateJustificativa(t.id, e.target.value)}
                        placeholder="Ex: Identificado desequilíbrio na fluidez sanguínea..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Observações Adicionais</label>
                      <textarea
                        className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={t.observacoes}
                        onChange={(e) => updateObservacoes(t.id, e.target.value)}
                        placeholder="Recomendações específicas..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            {resultadoAnalise && (
              <button
                onClick={handleAnalisarIA}
                disabled={analyzing || !canAnalyze}
                className="px-6 py-4 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-slate-300 disabled:text-slate-400"
                title={!canAnalyze ? "Os dados não mudaram desde a última análise" : "Re-analisar com IA"}
              >
                <Sparkles className="w-5 h-5" />
                {analyzing ? 'Analisando...' : 'Re-analisar'}
              </button>
            )}

            <button 
              onClick={gerarEPreservarPDF}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Confirmar e Salvar PDF
                </>
              )}
            </button>
            
            {pdfUrl && (
              <a 
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold transition flex items-center gap-2"
              >
                <FileDown className="w-5 h-5" /> Baixar PDF
              </a>
            )}
            
            <button 
              onClick={handleEnviarWhatsApp}
              disabled={!isSaved}
              className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </button>
          </div>
        </div>

      {/* Preview Panel */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Preview do Relatório</h3>
        <div className="space-y-6">
          {terapiasSelecionadas.map(t => (
            <div key={t.id} className="border-b border-slate-200 pb-4">
              <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">{t.nome}</h4>
              <p className="text-slate-700 leading-relaxed mt-1"><span className="font-semibold">Justificativa:</span> {t.justificativa}</p>
              <p className="text-slate-700 leading-relaxed mt-1"><span className="font-semibold">Observações:</span> {t.observacoes}</p>
              <p className="text-slate-700 leading-relaxed mt-1"><span className="font-semibold">Objetivo:</span> {t.objetivo}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hidden PDF Content */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div ref={pdfRef}>
          <RelatorioFinalPDF 
            paciente={paciente}
            data={data}
            idade={idade}
            sexo={cliente?.sexo || 'Não informado'}
            pontosAtencao={pontosAtencao}
            previousData={previousData}
            planoTerapeutico={terapiasSelecionadas}
            recomendacoes={recomendacoesEditaveis.split('\n').filter(r => r.trim() !== '')}
            metas={metas}
            resultadoAnalise={resultadoAnalise}
            hibrido={hibrido}
          />
        </div>
      </div>
    </div>
  </div>
  );
};
