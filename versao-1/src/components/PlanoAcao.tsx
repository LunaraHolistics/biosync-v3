import React, { useState, useMemo } from 'react';
import { Ear, Magnet, Sparkles, Music, Activity } from 'lucide-react';
import { ProtocoloIntervencao, Desequilibrio, TerapiaSugerida } from '../types';

interface Props {
  protocolo: ProtocoloIntervencao;
  perfil?: string;
  desequilibrios?: Desequilibrio[];
  bioScore?: number;
  planoTerapeutico?: TerapiaSugerida[];
}

export const PlanoAcao: React.FC<Props> = ({ 
  protocolo, 
  perfil: perfilInicial, 
  desequilibrios = [], 
  bioScore = 100,
  planoTerapeutico = []
}) => {
  const [perfil, setPerfil] = useState(perfilInicial || 'Holistico');

  const frequencia = useMemo(() => {
    const hzStr = protocolo.frequencia_recomendada?.hz.toString() || 
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
  }, [protocolo, planoTerapeutico]);

  // Cores por terapia
  const getTerapiaStyle = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes('biomagnetismo')) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Magnet size={24} />, accent: 'text-blue-600', pill: 'bg-white text-blue-800 border-blue-100' };
    if (n.includes('auriculo')) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <Ear size={24} />, accent: 'text-emerald-600', pill: 'bg-white text-emerald-800 border-emerald-100' };
    if (n.includes('reiki')) return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: <Sparkles size={24} />, accent: 'text-purple-600', pill: 'bg-white text-purple-800 border-purple-100' };
    if (n.includes('radiestesia') || n.includes('radiônica')) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: <Activity size={24} />, accent: 'text-orange-600', pill: 'bg-white text-orange-800 border-orange-100' };
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: <Sparkles size={24} />, accent: 'text-slate-600', pill: 'bg-white text-slate-800 border-slate-100' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <label className="font-semibold text-slate-700">Perfil de Aplicação:</label>
        <select 
          value={perfil} 
          onChange={(e) => setPerfil(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="Holistico">Holístico</option>
          <option value="Performance">Performance</option>
          <option value="Executivo">Executivo</option>
        </select>
      </div>

      {/* Frequência Vibracional de Tratamento */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <Music size={24} />
          </div>
          <h4 className="font-bold text-slate-800 text-lg">Frequência Vibracional de Tratamento</h4>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="bg-white px-6 py-4 rounded-xl border border-amber-300 shadow-sm text-center min-w-[140px]">
            <span className="block text-3xl font-bold text-amber-600">{frequencia.hz.toString().replace(/hz/gi, '')} Hz</span>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Frequência Mestre</span>
          </div>
          <div className="flex-1">
            <h5 className="text-xl font-bold text-amber-900 mb-2">{frequencia.nome}</h5>
            <p className="text-slate-700 leading-relaxed">
              {frequencia.justificativa}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Renderizar Terapias do Plano Terapêutico Dinamicamente */}
        {planoTerapeutico.map((terapia, idx) => {
          const style = getTerapiaStyle(terapia.terapia);
          return (
            <div key={idx} className={`${style.bg} rounded-2xl p-6 border ${style.border} shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 ${style.bg.replace('50', '100')} ${style.text} rounded-lg`}>
                  {style.icon}
                </div>
                <h4 className="font-bold text-slate-800 text-lg">{terapia.terapia}</h4>
              </div>
              <div className="space-y-4">
                {terapia.frequencia_sugerida && (
                  <div className={`px-3 py-1.5 ${style.pill} text-sm font-bold rounded-lg inline-block`}>
                    {terapia.frequencia_sugerida.toString().replace(/hz/gi, '')} Hz
                  </div>
                )}
                <p className="text-sm text-slate-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-white/20">
                  <strong className={`block text-xs uppercase ${style.accent} mb-1`}>Justificativa:</strong>
                  {terapia.justificativa}
                </p>
              </div>
            </div>
          );
        })}

        {/* Fallback para protocolos estruturados se não estiverem no plano_terapeutico */}
        {protocolo.biomagnetismo && !planoTerapeutico.some(t => t.terapia.toLowerCase().includes('biomagnetismo')) && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Magnet size={24} />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Biomagnetismo</h4>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {protocolo.biomagnetismo.pares.map((par, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-white text-blue-800 text-sm font-semibold rounded-lg border border-blue-100 shadow-sm">
                    {par}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-blue-100">
                <strong className="block text-xs uppercase text-blue-600 mb-1">Justificativa:</strong>
                {protocolo.biomagnetismo.justificativa}
              </p>
            </div>
          </div>
        )}

        {protocolo.auriculoterapia && !planoTerapeutico.some(t => t.terapia.toLowerCase().includes('auriculo')) && (
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Ear size={24} />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Auriculoterapia</h4>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {protocolo.auriculoterapia.pontos.map((ponto, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-white text-emerald-800 text-sm font-semibold rounded-full border border-emerald-100 shadow-sm">
                    {ponto}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-emerald-100">
                <strong className="block text-xs uppercase text-emerald-600 mb-1">Justificativa:</strong>
                {protocolo.auriculoterapia.justificativa}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
