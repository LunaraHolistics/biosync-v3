import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ResultadoBioressonancia } from '../types';

interface Props {
  resultados: ResultadoBioressonancia[];
}

const DashboardEvolucao: React.FC<Props> = ({ resultados }) => {
  // Verificação de segurança: Precisa de pelo menos 2 pontos para um gráfico de linha
  if (!resultados || resultados.length < 2) {
    return (
      <div className="w-full p-8 bg-[#fafafa] rounded-2xl border border-[#e5e5e5] flex flex-col items-center justify-center text-center">
        <div className="text-[#059669] mb-2">📊</div>
        <p className="text-[#737373] text-sm font-medium">
          Aguardando o segundo exame para gerar o gráfico de evolução do BioScore.
        </p>
      </div>
    );
  }

  // Ordenação cronológica por data de criação (created_at)
  const data = resultados
    .map(r => ({
      data_exame: new Date(r.created_at).toLocaleDateString('pt-BR'),
      bioScore: r.dados_extraidos.bioScore,
      timestamp: new Date(r.created_at).getTime()
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Cálculo da Melhora Percentual
  const primeiroScore = data[0].bioScore;
  const ultimoScore = data[data.length - 1].bioScore;
  const diferenca = ultimoScore - primeiroScore;
  const percentual = primeiroScore > 0 ? ((diferenca / primeiroScore) * 100).toFixed(1) : "0";
  const evolucaoPositiva = diferenca >= 0;

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-[#e5e5e5] shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#171717]">Histórico de Evolução Vital</h3>
          <p className="text-sm text-[#737373]">Acompanhamento do BioScore por período</p>
        </div>
        
        <div className={`px-4 py-2 rounded-xl border ${evolucaoPositiva ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#fef2f2] border-[#fecaca]'} flex items-center gap-3`}>
          <div className={`text-2xl ${evolucaoPositiva ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
            {evolucaoPositiva ? '📈' : '📉'}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">Variação Total</p>
            <p className={`text-lg font-black ${evolucaoPositiva ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
              {evolucaoPositiva ? '+' : ''}{percentual}%
            </p>
          </div>
        </div>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="data_exame" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#737373' }}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#737373' }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e5e5e5', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '14px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="bioScore" 
              name="BioScore" 
              stroke="#059669" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#059669', strokeWidth: 3, stroke: '#fff' }} 
              activeDot={{ r: 8, strokeWidth: 0 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardEvolucao;
