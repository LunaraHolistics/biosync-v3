import React from 'react';
import { Cliente, ResultadoBioressonancia, SugestaoTerapia } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GraficoEvolucao from './GraficoEvolucao';
import { Dumbbell, Moon, Zap, Scale, BatteryCharging, Flame, Heart, Info } from 'lucide-react';

interface Props {
  cliente: Cliente;
  resultado: ResultadoBioressonancia;
  sintese: string;
  recomendacoes: string;
  resultadosHistorico?: ResultadoBioressonancia[];
  terapias?: SugestaoTerapia[];
}

const styleReset = {
  backgroundColor: '#ffffff',
  color: '#171717',
  fontFamily: 'sans-serif',
  // Força o reset de variáveis que podem estar em oklch no Tailwind v4
  '--tw-text-opacity': '1',
  '--tw-bg-opacity': '1',
  '--tw-border-opacity': '1',
  '--tw-shadow': 'none',
  '--tw-ring-offset-shadow': 'none',
  '--tw-ring-shadow': 'none',
} as React.CSSProperties;

export default function RelatorioFinalPDF({ cliente, resultado, sintese, recomendacoes, resultadosHistorico = [], terapias = [] }: Props) {
  const { bioScore, desequilibrios, perfil, fadiga, metabolismo, energia, inflamacao, sono, emocional, performance } = resultado.dados_extraidos;

  const dataGrafico = desequilibrios.map(d => ({
    name: d.sistema,
    valor: d.severidade === 'Alta' ? 90 : d.severidade === 'Média' ? 60 : 30,
    fill: d.severidade === 'Alta' ? '#ef4444' : d.severidade === 'Média' ? '#f59e0b' : '#10b981'
  }));

  const sistemasPioraram: string[] = [];
  if (resultadosHistorico.length >= 2) {
    const current = resultadosHistorico[resultadosHistorico.length - 1];
    const previous = resultadosHistorico[resultadosHistorico.length - 2];
    
    const severityToNumber = (sev: string) => {
      if (sev === 'Alta') return 3;
      if (sev === 'Média') return 2;
      if (sev === 'Baixa') return 1;
      return 0;
    };

    current.dados_extraidos.desequilibrios.forEach(currItem => {
      const prevItem = previous.dados_extraidos.desequilibrios.find(d => d.sistema === currItem.sistema);
      if (prevItem) {
        if (severityToNumber(currItem.severidade) > severityToNumber(prevItem.severidade)) {
          sistemasPioraram.push(currItem.sistema);
        }
      }
    });
  }

  return (
    /* O segredo para o preview bonito é o scale(0.6) no container pai na tela, 
       mas aqui no componente PDF mantemos o tamanho real */
    <div className="p-12 bg-white text-[#171717] font-sans" style={{ ...styleReset, width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <header className="flex justify-between items-center border-b-2 border-[#065f46] pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#064e3b] tracking-tight">Lunara BioSync</h1>
          <p className="text-[#047857] font-medium mt-1">Relatório de Bioressonância Quântica - Análise 360º</p>
        </div>
        <img 
          src="/Logo.jpeg" 
          alt="Logo" 
          className="w-24 h-24 object-contain rounded-full" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer"
        />
      </header>

      {/* Dados do Cliente */}
      <section className="mb-8 bg-[#fafafa] p-6 rounded-xl border border-[#e5e5e5]">
        <h2 className="text-lg font-semibold text-[#064e3b] mb-4 uppercase tracking-wider">Dados do Paciente</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="font-medium text-[#737373]">Nome:</span> {cliente.nome}</p>
          <p><span className="font-medium text-[#737373]">Idade:</span> {calcularIdade(cliente.data_nascimento)} anos</p>
          <p><span className="font-medium text-[#737373]">Sexo:</span> {cliente.sexo}</p>
          <p><span className="font-medium text-[#737373]">Data da Análise:</span> {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </section>

      {/* Alertas de Piora */}
      {sistemasPioraram.length > 0 && (
        <div className="mb-8 bg-[#fef2f2] p-4 rounded-xl border border-[#fecaca]">
          <h3 className="text-sm font-semibold text-[#991b1b] uppercase tracking-wider mb-2">Atenção: Sistemas com Piora</h3>
          <ul className="list-disc pl-5 text-[#7f1d1d] text-sm">
            {sistemasPioraram.map(sistema => (
              <li key={sistema}>Atenção: Sistema {sistema} requer cuidado adicional comparado ao período anterior.</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid de BioScore e Síntese */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* BioScore */}
        <div className="bg-[#ecfdf5] p-6 rounded-xl border border-[#d1fae5] flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-[#065f46] uppercase tracking-wider mb-2">BioScore</h3>
          <div className="text-6xl font-bold text-[#059669] mb-2">{bioScore}</div>
          <p className="text-xs text-[#047857] font-medium uppercase">{perfil}</p>
        </div>

        {/* Síntese */}
        <div className="col-span-2 bg-white p-6 rounded-xl border border-[#e5e5e5]">
          <h3 className="text-sm font-semibold text-[#737373] uppercase tracking-wider mb-4">Síntese Vibracional 360º</h3>
          <p className="text-[#262626] text-sm leading-relaxed">{sintese}</p>
          {fadiga && (
            <div className="mt-4 inline-block bg-[#fef3c7] text-[#92400e] text-xs font-bold px-3 py-1 rounded-full uppercase">
              Alerta: Fadiga Adrenal Detectada
            </div>
          )}
        </div>
      </div>

      {/* Módulos 360º - Grid 2x3 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Metabolismo */}
        <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="text-[#059669]" size={20} />
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">Metabolismo</h3>
          </div>
          <div className="space-y-3 text-xs">
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Emagrecimento:</span> {metabolismo?.dificuldade_emagrecimento}</p>
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Tendência Peso:</span> {metabolismo?.tendencia_ganho_peso}</p>
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Eficiência:</span> {metabolismo?.eficiencia_metabolica}</p>
          </div>
        </div>

        {/* Energia */}
        <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-4">
            <BatteryCharging className="text-[#059669]" size={20} />
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">Energia e Vitalidade</h3>
          </div>
          <div className="space-y-3 text-xs">
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Nível:</span> {energia?.nivel_energia}</p>
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Causa Cansaço:</span> {energia?.causa_cansaco}</p>
          </div>
        </div>

        {/* Inflamação */}
        <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="text-[#ef4444]" size={20} />
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">Inflamação e Dor</h3>
          </div>
          <div className="space-y-3 text-xs">
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Nível Inflamatório:</span> {inflamacao?.nivel_inflamacao}</p>
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Origem Dores:</span> {inflamacao?.origem_dores}</p>
          </div>
        </div>

        {/* Sono */}
        <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="text-[#059669]" size={20} />
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">Sono e Reparo</h3>
          </div>
          <div className="space-y-3 text-xs">
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Qualidade:</span> {sono?.qualidade_sono}</p>
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Profundidade:</span> {sono?.profundidade_sono}</p>
          </div>
        </div>

        {/* Emocional */}
        <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="text-[#059669]" size={20} />
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">Equilíbrio Emocional</h3>
          </div>
          <div className="space-y-3 text-xs">
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Estresse:</span> {emocional?.nivel_estresse}</p>
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Padrão:</span> {emocional?.padrao_emocional}</p>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="text-[#059669]" size={20} />
            <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">Performance Esportiva</h3>
          </div>
          <div className="space-y-3 text-xs">
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Ganho Massa:</span> {performance?.potencial_hipertrofia}</p>
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Recuperação:</span> {performance?.qualidade_recuperacao}</p>
            <p><span className="font-bold text-[#64748b] uppercase text-[9px]">Digestão:</span> {performance?.eficiencia_digestiva}</p>
          </div>
        </div>
      </div>

      {/* Dica de Treino */}
      <div className="mb-8 bg-[#f1f5f9] p-5 rounded-xl border-l-4 border-[#0f172a]">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-[#0f172a]" size={18} />
          <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Dica do Terapeuta para o Treino:</p>
        </div>
        <p className="text-sm italic text-[#334155] leading-relaxed">{performance?.dica_treino}</p>
      </div>

      {/* Dica do Terapeuta (Geral) */}
      <div className="mb-8 bg-[#ecfdf5] p-5 rounded-xl border-l-4 border-[#059669]">
        <div className="flex items-center gap-2 mb-2">
          <Info className="text-[#059669]" size={18} />
          <p className="text-xs font-bold text-[#059669] uppercase tracking-wider">Insight Terapêutico Integrativo:</p>
        </div>
        <p className="text-sm text-[#065f46] leading-relaxed">
          A análise 360º sugere uma correlação direta entre o sistema {desequilibrios[0]?.sistema} e o padrão emocional {emocional?.padrao_emocional}. 
          Recomenda-se foco na harmonização energética para otimizar os resultados físicos.
        </p>
      </div>

      {/* Gráfico Atual */}
      <div className="mb-8 bg-white p-6 rounded-xl border border-[#e5e5e5]">
        <h3 className="text-sm font-semibold text-[#737373] uppercase tracking-wider mb-6">Mapeamento de Sistemas Atual</h3>
        <div style={{ width: 600, height: 220, margin: '0 auto' }}>
          <BarChart width={600} height={220} data={dataGrafico} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#737373' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#737373' }} />
            <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {dataGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      {resultadosHistorico.length >= 2 && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-[#e5e5e5]">
          <h3 className="text-sm font-semibold text-[#737373] uppercase tracking-wider mb-6">Evolução do Paciente</h3>
          <GraficoEvolucao resultados={resultadosHistorico} isPrinting={true} />
        </div>
      )}

      {/* Seção de Protocolos Detalhados */}
      {terapias.length > 0 && (
        <section className="bg-white p-6 rounded-xl border border-[#e5e5e5] mb-8">
          <h2 className="text-lg font-semibold text-[#064e3b] mb-4 uppercase tracking-wider">Protocolo de Ativação Sugerido</h2>
          <div className="grid grid-cols-1 gap-4">
            {terapias.map((t, idx) => (
              <div key={idx} className="p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#059669]">
                <div className="flex justify-between">
                  <span className="font-bold text-[#0f172a]">{t.nome}</span>
                  <span className="text-[10px] font-bold uppercase text-[#64748b]">{t.importancia}</span>
                </div>
                <div className="mt-2 text-sm text-[#334155]">
                  <p className="font-semibold text-[#065f46]">Pontos / Pares de Ativação:</p>
                  <p className="italic">{t.protocolo_detalhado || "Consultar guia técnico"}</p>
                </div>
                <p className="mt-2 text-xs text-[#64748b]"><strong>Frequência:</strong> {t.frequencia}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recomendações */}
      <section className="bg-white p-6 rounded-xl border border-[#e5e5e5] mb-8">
        <h2 className="text-lg font-semibold text-[#064e3b] mb-4 uppercase tracking-wider">Plano de Ação Integrativo</h2>
        <div className="text-[#262626] text-sm leading-relaxed whitespace-pre-wrap">
          {recomendacoes}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-8 border-t border-[#e5e5e5] text-center text-[10px] text-[#a3a3a3]">
        <p>Este relatório é uma ferramenta de análise vibracional e não substitui diagnóstico médico.</p>
        <p className="mt-1">Gerado por Lunara BioSync • Celso Biffe - Terapeuta Holístico Integrativo</p>
      </footer>
    </div>
  );
}

function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}
