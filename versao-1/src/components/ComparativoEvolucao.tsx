import React, { useMemo, useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { calcularBioScore } from '../utils/calculadoraBioScore';
import { buscarHistoricoCompleto } from '../services/supabaseService';

interface ComparativoEvolucaoProps {
  clienteId: string;
}

export const ComparativoEvolucao: React.FC<ComparativoEvolucaoProps> = ({ clienteId }) => {
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarHistoricoCompleto(clienteId).then(data => {
      setHistorico(data);
      setLoading(false);
    });
  }, [clienteId]);

  const { scoreA, scoreB, topVariacoes } = useMemo(() => {
    if (historico.length < 2) return { scoreA: 0, scoreB: 0, topVariacoes: [] };
    
    const analiseA = historico[historico.length - 1]; // Mais antiga
    const analiseB = historico[0]; // Mais recente

    const markersA = analiseA.resultados_bioressonancia.dados_extraidos;
    const markersB = analiseB.resultados_bioressonancia.dados_extraidos;

    const scoreA = calcularBioScore(markersA);
    const scoreB = calcularBioScore(markersB);

    const variacoes = Object.keys(markersA).map(key => ({
      nome: key,
      variacao: ((markersB[key].valor - markersA[key].valor) / markersA[key].valor) * 100,
      melhor: markersB[key].valor < markersA[key].valor
    })).sort((a, b) => Math.abs(b.variacao) - Math.abs(a.variacao)).slice(0, 5);

    return { scoreA, scoreB, topVariacoes: variacoes };
  }, [historico]);

  if (loading) return <div className="p-6 text-white/60">Carregando dados de evolução...</div>;
  if (historico.length < 2) return <div className="p-6 text-white/60">Dados insuficientes para comparação.</div>;

  const dataGauge = [{ value: scoreB }, { value: 100 - scoreB }];

  return (
    <div className="p-6 space-y-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center flex-1">
          <h3 className="text-white/70 mb-4">BioScore de Vitalidade</h3>
          <div className="w-full h-[300px] min-h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <PieChart>
                <Pie data={dataGauge} startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#374151" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-24 text-3xl font-bold text-white">{scoreB}</div>
          </div>
        </div>
        <div className="flex flex-col justify-center flex-1">
          <p className="text-white/60">Evolução: {scoreB - scoreA > 0 ? '+' : ''}{scoreB - scoreA} pontos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topVariacoes.map(item => (
          <div key={item.nome} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
            <span>{item.nome}</span>
            <span className={`flex items-center ${item.melhor ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.variacao.toFixed(1)}%
              {item.melhor ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
