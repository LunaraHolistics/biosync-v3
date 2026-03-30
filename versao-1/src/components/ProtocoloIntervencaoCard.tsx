import React from 'react';
import { Ear, Magnet, Info, Sparkles, Music, ExternalLink } from 'lucide-react';
import { ProtocoloIntervencao } from '../types';

interface Props {
  protocolo: ProtocoloIntervencao;
  perfil?: string;
}

export const ProtocoloIntervencaoCard: React.FC<Props> = ({ protocolo, perfil }) => {
  if (!protocolo.auriculoterapia && !protocolo.biomagnetismo && !protocolo.reiki) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Info size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Plano de Ação Imediata</h3>
            <p className="text-sm text-slate-500">
              Protocolos sugeridos com base nos marcadores críticos
              {perfil && <span className="ml-1 font-medium text-indigo-600">({perfil})</span>}
            </p>
          </div>
        </div>

        {protocolo.frequencia_recomendada && (
          <a
            href={protocolo.frequencia_recomendada.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm group"
          >
            <Music size={18} className="group-hover:animate-pulse" />
            <span className="font-medium">Ouvir {protocolo.frequencia_recomendada.hz}Hz ({protocolo.frequencia_recomendada.nome})</span>
            <ExternalLink size={14} className="opacity-70" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Frequências Sugeridas */}
        {protocolo.frequencia_recomendada && (
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-2 mb-4">
              <Music className="text-emerald-600" size={20} />
              <h4 className="font-bold text-slate-800">Frequências Sugeridas</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-700">{protocolo.frequencia_recomendada.hz}Hz</span>
                <a
                  href={protocolo.frequencia_recomendada.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                >
                  <Music size={16} />
                </a>
              </div>
              <p className="text-xs text-slate-600">{protocolo.frequencia_recomendada.nome}</p>
            </div>
          </div>
        )}

        {/* Auriculoterapia */}
        {protocolo.auriculoterapia && (
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Ear className="text-emerald-600" size={20} />
              <h4 className="font-bold text-slate-800">Auriculoterapia</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Pontos Sugeridos</span>
                <div className="flex flex-wrap gap-2">
                  {protocolo.auriculoterapia.pontos.map((ponto, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full border border-emerald-200">
                      {ponto}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Justificativa</span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {protocolo.auriculoterapia.justificativa}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Biomagnetismo */}
        {protocolo.biomagnetismo && (
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Magnet className="text-blue-600" size={20} />
              <h4 className="font-bold text-slate-800">Biomagnetismo</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Pares Sugeridos</span>
                <div className="flex flex-col gap-2">
                  {protocolo.biomagnetismo.pares.map((par, idx) => (
                    <span key={idx} className="px-3 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg border border-blue-200">
                      {par}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Justificativa</span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {protocolo.biomagnetismo.justificativa}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reiki Usui */}
        {protocolo.reiki && (
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-amber-600" size={20} />
              <h4 className="font-bold text-slate-800">Reiki Usui</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Posições & Símbolos</span>
                <div className="flex flex-wrap gap-2">
                  {protocolo.reiki.posicoes.map((pos, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full border border-amber-200">
                      {pos}
                    </span>
                  ))}
                  {protocolo.reiki.simbolos.map((sim, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200">
                      {sim}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Justificativa</span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {protocolo.reiki.justificativa}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
