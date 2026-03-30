import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ResultadoBioressonancia } from '../types';

interface Props {
  resultados: ResultadoBioressonancia[];
  isPrinting?: boolean;
}

const severityToNumber = (sev: string) => {
  if (sev === 'Alta') return 3;
  if (sev === 'Média') return 2;
  if (sev === 'Baixa') return 1;
  return 0;
};

export default function GraficoEvolucao({ resultados, isPrinting = false }: Props) {
  if (!resultados || resultados.length < 2) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-neutral-500 text-sm">São necessárias pelo menos duas análises para gerar o gráfico de evolução.</p>
      </div>
    );
  }

  // Pegar as duas últimas análises para comparar (Anterior e Atual)
  const current = resultados[resultados.length - 1];
  const previous = resultados[resultados.length - 2];

  // Mapear todos os sistemas únicos encontrados nas duas análises
  const sistemasSet = new Set<string>();
  current.dados_extraidos.desequilibrios.forEach(d => sistemasSet.add(d.sistema));
  previous.dados_extraidos.desequilibrios.forEach(d => sistemasSet.add(d.sistema));
  const sistemas = Array.from(sistemasSet);

  const data = sistemas.map(sistema => {
    const currItem = current.dados_extraidos.desequilibrios.find(d => d.sistema === sistema);
    const prevItem = previous.dados_extraidos.desequilibrios.find(d => d.sistema === sistema);
    
    const currAvg = currItem ? severityToNumber(currItem.severidade) : 0;
    const prevAvg = prevItem ? severityToNumber(prevItem.severidade) : 0;
    
    const improvement = prevAvg > 0 ? ((prevAvg - currAvg) / prevAvg) * 100 : 0;

    return {
      sistema: sistema,
      Anterior: prevAvg.toFixed(1),
      Atual: currAvg.toFixed(1),
      melhoria: improvement > 0 ? `${improvement.toFixed(0)}%` : '0%'
    };
  });

  // Se for para PDF, renderizamos com dimensões fixas para evitar o erro do html2canvas
  if (isPrinting) {
    return (
      <div style={{ width: 600, height: 300, margin: '0 auto' }}>
        <BarChart width={600} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="sistema" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
          <YAxis domain={[0, 3]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
          <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend />
          <Bar dataKey="Anterior" fill="#94a3b8" isAnimationActive={false} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Atual" isAnimationActive={false} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={Number(entry.Atual) < Number(entry.Anterior) ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]" style={{ minHeight: '300px', minWidth: '100%' }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis dataKey="sistema" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
          <YAxis domain={[0, 3]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
          <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend />
          <Bar dataKey="Anterior" fill="#94a3b8" />
          <Bar dataKey="Atual">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={Number(entry.Atual) < Number(entry.Anterior) ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
