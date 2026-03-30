import React from 'react';
import { ArrowDownCircle, AlertTriangle, Minus } from 'lucide-react';

interface Props {
  dadosAnteriores: { sistema: string; severidade: string }[];
  dadosAtuais: { sistema: string; severidade: string }[];
}

const converterParaNumero = (severidade: string): number => {
  if (severidade === '+++') return 3;
  if (severidade === '++') return 2;
  if (severidade === '+') return 1;
  return 0;
};

export const GraficoComparativo: React.FC<Props> = ({ dadosAnteriores, dadosAtuais }) => {
  const sistemas = Array.from(new Set([...dadosAnteriores, ...dadosAtuais].map(d => d.sistema)));

  return (
    <div className="space-y-4">
      {sistemas.map(sistema => {
        const anterior = dadosAnteriores.find(d => d.sistema === sistema)?.severidade || 'Normal';
        const atual = dadosAtuais.find(d => d.sistema === sistema)?.severidade || 'Normal';
        
        const valAnterior = converterParaNumero(anterior);
        const valAtual = converterParaNumero(atual);
        
        const melhoria = valAnterior > 0 ? ((valAnterior - valAtual) / valAnterior) * 100 : 0;
        const isMelhora = valAtual < valAnterior;
        const isEstavel = valAtual === valAnterior;

        return (
          <div key={sistema} className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span>{sistema}</span>
              <span className="flex items-center gap-1">
                {isMelhora && <ArrowDownCircle className="text-emerald-500" size={16} />}
                {!isMelhora && !isEstavel && <AlertTriangle className="text-red-500" size={16} />}
                {isMelhora ? `Melhoria de ${melhoria.toFixed(0)}%` : isEstavel ? 'Mantido' : 'Aumento de carga'}
              </span>
            </div>
            <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-slate-400 rounded-full" 
                style={{ width: `${(valAnterior / 3) * 100}%` }}
              />
              <div 
                className={`absolute h-full rounded-full ${isMelhora ? 'bg-emerald-500' : 'bg-red-500'}`} 
                style={{ width: `${(valAtual / 3) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
