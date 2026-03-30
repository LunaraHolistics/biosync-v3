import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface Props {
  data: any[]; // Expects an array of historico_analises objects
}

export const DashboardEvolucao: React.FC<Props> = ({ data }) => {
  const chartData = data.map(item => ({
    data: new Date(item.data).toLocaleDateString(),
    valor: item.metricas_chave.cardiovascular,
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-lg">
      <h3 className="text-lg font-bold text-white mb-6">Painel de Evolução</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="data" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <ReferenceLine y={0.5} stroke="white" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="valor" stroke="url(#colorValue)" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-100 text-sm">
        ✨ Vitória BioSync: A sua Elasticidade Vascular melhorou 12% desde a última sessão!
      </div>
    </div>
  );
};
