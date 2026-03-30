import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GraficoEvolucao } from './GraficoEvolucao';
import { GraficoProgresso } from './GraficoProgresso';
import { GraficoProntidao } from './GraficoProntidao';
import { ProtocoloIntervencaoCard } from './ProtocoloIntervencaoCard';
import { RelatorioAnalise } from '../types';
import { DicionarioDeAnalise } from '../data/dicionarioAnalise';

interface Terapia {
  nome: string;
  evidencias?: string[];
  justificativa: string;
  observacoes: string;
  objetivo: string;
  frequencia_sugerida?: string;
}

interface PontoAtencao {
  sistema: string;
  itens: { nome: string; severidade: string }[];
}

interface Meta {
  item: string;
  meta_definida: string;
  status: 'atingida' | 'atencao';
}

interface Props {
  paciente: string;
  data: string;
  idade: number;
  sexo: string;
  pontosAtencao: PontoAtencao[];
  previousData: PontoAtencao[];
  planoTerapeutico: Terapia[];
  recomendacoes: string[];
  metas: Meta[];
  resultadoAnalise?: RelatorioAnalise | null;
  hibrido?: boolean;
  bioScore?: number;
  variacaoBioScore?: number;
  isPrinting?: boolean;
}

export const RelatorioFinalPDF: React.FC<Props> = ({ 
  paciente, 
  data, 
  idade,
  sexo,
  pontosAtencao, 
  previousData,
  planoTerapeutico, 
  recomendacoes,
  metas,
  resultadoAnalise,
  hibrido = false,
  bioScore = 0,
  variacaoBioScore = 0,
  isPrinting = true
}) => {
  const desequilibriosPorCategoria = React.useMemo(() => {
    const desequilibrios = resultadoAnalise?.desequilibrios_encontrados || [];
    return desequilibrios.reduce((acc, d) => {
      const cat = d.categoria || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(d);
      return acc;
    }, {} as Record<string, typeof desequilibrios>);
  }, [resultadoAnalise]);

  const sortedPontosFortes = React.useMemo(() => {
    return Object.keys(DicionarioDeAnalise).filter(cat => !desequilibriosPorCategoria[cat]);
  }, [desequilibriosPorCategoria]);

  const sortedOportunidadesMelhoria = React.useMemo(() => {
    return Object.keys(desequilibriosPorCategoria).sort((a, b) => desequilibriosPorCategoria[b].length - desequilibriosPorCategoria[a].length);
  }, [desequilibriosPorCategoria]);

  const getPriority = (evidencias: string[]) => {
    if (evidencias.some(e => e.includes('+++'))) return 2;
    if (evidencias.some(e => e.includes('++'))) return 1;
    return 0;
  };

  const sortedPlano = React.useMemo(() => {
    return [...planoTerapeutico].sort((a, b) => getPriority(b.evidencias || []) - getPriority(a.evidencias || []));
  }, [planoTerapeutico]);

  const frequenciaInfo = React.useMemo(() => {
    const hzStr = resultadoAnalise?.indice_prontidao?.frequencia_sugerida || 
                  planoTerapeutico.find(t => t.frequencia_sugerida)?.frequencia_sugerida || 
                  "528";
    const hz = parseInt(hzStr);
    
    const dict: Record<number, { nome: string; justificativa: string }> = {
      396: { nome: "Libertação de Medo/Culpa", justificativa: "Indicada para limpeza de bloqueios emocionais e fortalecimento do chakra básico." },
      417: { nome: "Facilitação de Mudanças", justificativa: "Recomendada para dissipar energias estagnadas e situações traumáticas celulares." },
      528: { nome: "Reparo de DNA / Milagres", justificativa: "Frequência mestre para regeneração biológica e harmonização da vitalidade central." },
      639: { nome: "Conexão e Relacionamentos", justificativa: "Focada na harmonização de campos interpessoais e equilíbrio do chakra cardíaco." },
      741: { nome: "Despertar da Intuição", justificativa: "Auxilia na limpeza de toxinas (incluindo eletromagnéticas) e clareza mental." },
      852: { nome: "Retorno à Ordem Espiritual", justificativa: "Utilizada para elevar a percepção sutil e conexão com a intuição profunda." }
    };

    return { hz, ...(dict[hz] || dict[528]) };
  }, [resultadoAnalise, planoTerapeutico]);

  const temFaltaDeAgua = React.useMemo(() => {
    const desequilibrios = resultadoAnalise?.desequilibrios_encontrados || [];
    return desequilibrios.some(d => 
      d.item.toLowerCase().includes('água') || 
      d.item.toLowerCase().includes('agua') ||
      d.categoria.toLowerCase().includes('água') ||
      d.categoria.toLowerCase().includes('agua')
    );
  }, [resultadoAnalise]);

  return (
    <div className="max-w-[210mm] mx-auto p-10 bg-white min-h-[297mm] text-slate-900 font-sans shadow-lg print:shadow-none">
      {/* Cabeçalho */}
      <header className="border-b-2 border-navy-900 pb-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="font-serif text-4xl font-bold text-navy-900 tracking-tight">BIOSYNC</h1>
            <p className="text-navy-700 font-bold tracking-[0.2em] text-[10px] uppercase">Relatório de Avaliação Bioenergética</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">BioScore Geral</div>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-3xl font-black text-navy-900">{bioScore}</span>
                <span className="text-slate-400 font-bold">/100</span>
              </div>
              <div className={`text-[10px] font-bold ${variacaoBioScore >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {variacaoBioScore >= 0 ? '↑' : '↓'} {Math.abs(variacaoBioScore).toFixed(1)}% vs anterior
              </div>
            </div>

            <div className="h-16 w-px bg-slate-200 mx-2" />

            <div className="flex flex-col items-end">
              <img 
                src="/logo.jpeg" 
                alt="Lunara Terapias" 
                className="h-16 w-auto object-contain"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'text-navy-900 font-bold text-xl tracking-tighter text-right';
                    fallback.innerText = 'LUNARA TERAPIAS';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end text-sm">
          <div className="space-y-1">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Identificação do Paciente</p>
            <p className="font-bold text-lg text-navy-900">{paciente}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Data da Sessão</p>
            <p className="font-bold text-navy-900">{data}</p>
          </div>
        </div>
      </header>

      {resultadoAnalise?.indice_prontidao && (
        <div className="mb-8 break-inside-avoid">
          <GraficoProntidao
            score={resultadoAnalise.indice_prontidao.score}
            status={resultadoAnalise.indice_prontidao.status}
            frequencia_sugerida={resultadoAnalise.indice_prontidao.frequencia_sugerida}
            marcadores_fadiga={resultadoAnalise.marcadores_fadiga || []}
            perfil={resultadoAnalise.perfil_analise}
            isPrinting={isPrinting}
          />
        </div>
      )}

      {/* Protocolo de Harmonização Vibracional */}
      <section className="mb-8 break-inside-avoid p-6 bg-amber-50 rounded-2xl border border-amber-200">
        <h2 className="font-serif text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          Protocolo de Harmonização Vibracional
        </h2>
        <div className="flex items-start gap-6">
          <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-sm text-center min-w-[120px]">
            <span className="block text-3xl font-bold text-amber-600">{frequenciaInfo.hz.toString().replace(/hz/gi, '')} Hz</span>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Frequência Sugerida</span>
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-lg mb-1">{frequenciaInfo.nome}</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong className="text-amber-900">Justificativa Técnica:</strong> {frequenciaInfo.justificativa}
            </p>
          </div>
        </div>
      </section>

      {resultadoAnalise?.protocolo_intervencao && (
        <div className="mb-8 break-inside-avoid">
          <ProtocoloIntervencaoCard 
            protocolo={resultadoAnalise.protocolo_intervencao}
            perfil={resultadoAnalise.perfil_analise}
          />
        </div>
      )}

      {/* Reiki e Radiestesia (Se existirem) */}
      {(resultadoAnalise?.protocolo_intervencao?.reiki || resultadoAnalise?.protocolo_intervencao?.radiestesia) && (
        <div className="grid grid-cols-2 gap-6 mb-8 break-inside-avoid">
          {resultadoAnalise.protocolo_intervencao.reiki && (
            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">Reiki Usui</h3>
              <div className="space-y-2">
                <p className="text-xs text-purple-800">
                  <strong className="text-purple-900">Posições:</strong> {resultadoAnalise.protocolo_intervencao.reiki.posicoes.join(', ')}
                </p>
                <p className="text-xs text-purple-800">
                  <strong className="text-purple-900">Símbolos:</strong> {resultadoAnalise.protocolo_intervencao.reiki.simbolos.join(', ')}
                </p>
                <p className="text-xs text-purple-800 italic">
                  {resultadoAnalise.protocolo_intervencao.reiki.justificativa}
                </p>
              </div>
            </div>
          )}
          {resultadoAnalise.protocolo_intervencao.radiestesia && (
            <div className="p-5 bg-orange-50 rounded-2xl border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">Radiestesia & Radiônica</h3>
              <div className="space-y-2">
                <p className="text-xs text-orange-800">
                  <strong className="text-orange-900">Gráficos:</strong> {resultadoAnalise.protocolo_intervencao.radiestesia.graficos.join(', ')}
                </p>
                <p className="text-xs text-orange-800 italic">
                  {resultadoAnalise.protocolo_intervencao.radiestesia.justificativa}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sua Evolução */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="font-serif text-xl font-semibold text-navy-800 mb-4 border-b border-slate-300 pb-2">Sua Evolução</h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2">Item</th>
              <th className="py-2">Anterior</th>
              <th className="py-2">Atual</th>
              <th className="py-2">Variação %</th>
            </tr>
          </thead>
          <tbody>
            {pontosAtencao.map((sistema, idx) => {
              const prev = previousData.find(p => p.sistema === sistema.sistema);
              return sistema.itens.map((item, i) => {
                const prevItem = prev?.itens.find(p => p.nome === item.nome);
                const varPerc = prevItem ? ((prevItem.severidade.length - item.severidade.length) / prevItem.severidade.length) * 100 : 0;
                return (
                  <tr key={`${idx}-${i}`} className="border-b border-slate-100">
                    <td className="py-2">{item.nome}</td>
                    <td className="py-2">{prevItem?.severidade || '-'}</td>
                    <td className="py-2">{item.severidade}</td>
                    <td className={`py-2 ${varPerc > 0 ? 'text-emerald-600' : varPerc < 0 ? 'text-red-600' : ''}`}>
                      {varPerc.toFixed(0)}%
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </section>

      {/* Badges de Sucesso */}
      <section className="mb-8 break-inside-avoid">
        {pontosAtencao.map((sistema, idx) => {
          const prev = previousData.find(p => p.sistema === sistema.sistema);
          if (!prev) return null;
          return sistema.itens.map((item, i) => {
            const prevItem = prev.itens.find(p => p.nome === item.nome);
            if (prevItem && prevItem.severidade !== 'Normal' && item.severidade === 'Normal') {
              return (
                <div key={`${idx}-${i}`} className="mb-2 p-3 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                  Parabéns! Seu sistema {item.nome} atingiu o equilíbrio.
                </div>
              );
            }
            return null;
          });
        })}
      </section>

      {/* Pontos Fortes */}
      <section className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-emerald-800 mb-4 border-b border-emerald-300 pb-2">Seu Patrimônio de Saúde (Pontos Fortes)</h2>
        <p className="text-sm text-emerald-700 mb-4">Estes itens estão em equilíbrio. Manter estes marcadores em ordem é a base para que seu corpo tenha energia e resiliência para lidar com os desafios diários.</p>
        <div className="grid grid-cols-1 gap-4">
          {sortedPontosFortes.map(cat => (
            <div key={cat} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3 className="font-bold text-emerald-900">{cat}</h3>
              <p className="text-sm text-emerald-800">{DicionarioDeAnalise[cat]?.statusNormal || "Sistema em equilíbrio."}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Resumo Técnico */}
      <section className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-navy-800 mb-4 border-b border-slate-300 pb-2">Resumo Técnico: Pontos de Atenção</h2>
        <GraficoEvolucao currentData={pontosAtencao} previousData={previousData} isPrinting={isPrinting} />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {pontosAtencao.map((sistema, idx) => (
            <div key={idx} className="break-inside-avoid p-3 bg-slate-50 rounded border border-slate-200">
              <h3 className="font-bold text-sm text-navy-700 mb-2">{sistema.sistema}</h3>
              <ul className="text-xs space-y-1">
                {sistema.itens.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.nome}</span>
                    <span className="font-mono font-bold text-navy-600">{item.severidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Oportunidades de Melhoria */}
      <section className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-blue-800 mb-4 border-b border-blue-300 pb-2">
          {hibrido ? "Análise Integrada: Avaliação de Prontidão Executiva e Performance Física" : "Oportunidades de Melhoria (Ajuste BioSync)"}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {sortedOportunidadesMelhoria.map(cat => (
            <div key={cat} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900">{cat}</h3>
              <p className="text-sm text-blue-800 mb-2">{DicionarioDeAnalise[cat]?.statusAtencao || "Consulte o terapeuta para mais informações."}</p>
              {DicionarioDeAnalise[cat]?.recomendacaoProfissional && (
                <p className="text-sm text-blue-900 font-semibold mb-2 p-2 bg-blue-100 rounded">
                  {DicionarioDeAnalise[cat]?.recomendacaoProfissional}
                </p>
              )}
              <ul className="text-xs space-y-1 list-disc list-inside">
                {desequilibriosPorCategoria[cat].map((d, i) => (
                  <li key={i}>{d.item} - <span className="font-bold">{d.impacto_holistico}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>


      {/* Plano de Harmonização */}
      <section className="mb-8">
        <h2 className="font-serif text-xl font-semibold text-navy-800 mb-4 border-b border-slate-300 pb-2">Plano de Harmonização</h2>
        <div className="grid grid-cols-2 gap-6">
          {sortedPlano.map((terapia, idx) => {
            const priority = getPriority(terapia.evidencias || []);
            const borderColor = priority === 2 ? 'border-navy-900' : priority === 1 ? 'border-orange-500' : 'border-slate-300';
            
            return (
              <div key={idx} className={`break-inside-avoid border-l-4 ${borderColor} pl-4 py-1 w-full`}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-serif text-lg font-bold text-navy-900">{terapia.nome}</h3>
                  {priority === 2 && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-red-200">
                      PRIORIDADE MÁXIMA
                    </span>
                  )}
                  {priority === 1 && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-orange-200">
                      Atenção Moderada
                    </span>
                  )}
                </div>
                
                {terapia.evidencias && terapia.evidencias.length > 0 && (
                  <div className="text-sm mb-3">
                    <strong className="text-navy-800 block text-xs mb-1">Baseado nos Resultados:</strong>
                    <div className="flex flex-wrap gap-1">
                      {terapia.evidencias.map((e, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm mt-1 mb-2"><strong className="text-navy-800">Justificativa:</strong> {terapia.justificativa}</p>
                {terapia.observacoes && <p className="text-sm mt-1 mb-2"><strong className="text-navy-800">Observações:</strong> {terapia.observacoes}</p>}
                {terapia.frequencia_sugerida && <p className="text-sm mt-1 mb-2"><strong className="text-navy-800">Frequência Sugerida:</strong> {terapia.frequencia_sugerida.toString().replace(/hz/gi, '')} Hz</p>}
                {terapia.objetivo && <p className="text-sm italic text-slate-600 leading-tight"><strong className="text-navy-800 not-italic">Objetivo:</strong> {terapia.objetivo}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ... (rest of the component) ... */}

      {/* Recomendações */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="font-serif text-xl font-semibold text-navy-800 mb-4 border-b border-slate-300 pb-2">Recomendações de Pós-Sessão</h2>
        <ul className="list-disc list-inside text-sm space-y-1 text-slate-700">
          {recomendacoes.map((rec, idx) => <li key={idx}>{rec}</li>)}
        </ul>
      </section>

      {/* Caminho de Evolução */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="font-serif text-xl font-semibold text-navy-800 mb-4 border-b border-slate-300 pb-2">Caminho de Evolução</h2>
        <div className="space-y-2">
          {metas.map((meta, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200 text-sm">
              <span className="font-semibold text-navy-900">{meta.item}</span>
              <span className="text-slate-700">{meta.meta_definida}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.status === 'atingida' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {meta.status === 'atingida' ? '✅ Atingida' : '⚠️ Atenção'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé */}
      <footer className="mt-16 pt-6 border-t border-slate-300 flex flex-col gap-4 print:fixed print:bottom-0 print:left-0 print:right-0 print:px-10 print:pb-6">
        {temFaltaDeAgua && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs italic leading-relaxed">
            <p><strong>Nota Importante:</strong> Para potencializar a frequência de <span className="font-bold">{frequenciaInfo.hz.toString().replace(/hz/gi, '')} Hz</span> recebida hoje, recomendo a ingestão de 500ml de água logo após a sessão. A água atua como o condutor elétrico que ajudará seu corpo a "ancorar" essa nova vibração celular.</p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="text-[9px] text-slate-500 max-w-[60%]">
            <p>Este relatório de bioressonância é uma análise bioenergética complementar e não substitui diagnósticos médicos ou nutricionais.</p>
            <p className="mt-1">Este relatório é de caráter integrativo e não substitui consultas médicas.</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-700 max-w-[150px] text-right">Dúvidas sobre seu relatório? Escaneie para falar com Celso Luiz - Lunara Terapias</p>
            <QRCodeSVG value="https://wa.me/5516997934558" size={48} />
          </div>
        </div>
      </footer>
    </div>
  );
};
