import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: { nome: string; atual: number; anterior: number }[];
  isPrinting?: boolean;
}

export const GraficoProgresso: React.FC<Props> = ({ data, isPrinting = false }) => {
  const chartData = data.map(d => ({
    ...d,
    variacao: d.atual - d.anterior
  }));

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[300px]" style={{ minHeight: '300px', minWidth: '100%' }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="anterior" name="Anterior" fill="#94a3b8" isAnimationActive={!isPrinting} />
          <Bar dataKey="atual" name="Atual" fill="#10b981" isAnimationActive={!isPrinting}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.variacao >= 0 ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
