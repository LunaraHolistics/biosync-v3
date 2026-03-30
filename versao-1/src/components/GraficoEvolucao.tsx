import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  currentData: { sistema: string; itens: { nome: string; severidade: string }[] }[];
  previousData: { sistema: string; itens: { nome: string; severidade: string }[] }[];
  isPrinting?: boolean;
}

const severityToNumber = (sev: string) => {
  if (sev === '+++') return 3;
  if (sev === '++') return 2;
  if (sev === '+') return 1;
  return 0;
};

export const GraficoEvolucao: React.FC<Props> = ({ currentData, previousData, isPrinting = false }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const data = currentData.map(curr => {
    const prev = previousData.find(p => p.sistema === curr.sistema);
    
    // Calcula média de severidade por sistema
    const currAvg = curr.itens.reduce((acc, item) => acc + severityToNumber(item.severidade), 0) / curr.itens.length;
    const prevAvg = prev ? prev.itens.reduce((acc, item) => acc + severityToNumber(item.severidade), 0) / prev.itens.length : 0;
    
    const improvement = prevAvg > 0 ? ((prevAvg - currAvg) / prevAvg) * 100 : 0;

    return {
      sistema: curr.sistema,
      Anterior: prevAvg.toFixed(1),
      Atual: currAvg.toFixed(1),
      melhoria: improvement > 0 ? `${improvement.toFixed(0)}%` : '0%'
    };
  });

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[300px]" style={{ minHeight: '300px', minWidth: '100%' }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sistema" />
          <YAxis domain={[0, 3]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Anterior" fill="#94a3b8" isAnimationActive={!isPrinting} />
          <Bar dataKey="Atual" isAnimationActive={!isPrinting}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={Number(entry.Atual) < Number(entry.Anterior) ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
