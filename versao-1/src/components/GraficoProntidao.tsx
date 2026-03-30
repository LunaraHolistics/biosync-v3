import React from 'react';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface GraficoProntidaoProps {
  score: number;
  status: string;
  frequencia_sugerida: string;
  marcadores_fadiga: string[];
  perfil?: string;
  isPrinting?: boolean;
}

export const GraficoProntidao: React.FC<GraficoProntidaoProps> = ({
  score,
  status,
  frequencia_sugerida,
  marcadores_fadiga,
  perfil,
  isPrinting = false
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Determine color and alert message based on score
  let colorClass = 'text-green-500';
  let bgClass = 'bg-green-500';
  let alertMessage = 'Alta Prontidão';
  let Icon = ShieldCheck;

  if (score < 40) {
    colorClass = 'text-red-500';
    bgClass = 'bg-red-500';
    alertMessage = 'Risco de Lesão';
    Icon = AlertTriangle;
  } else if (score < 75) {
    colorClass = 'text-orange-500';
    bgClass = 'bg-orange-500';
    alertMessage = 'Fadiga Moderada';
    Icon = Activity;
  }

  // Calculate SVG circle properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 w-full">
      <div className="flex flex-col md:flex-row items-center gap-8">
        
        {/* Circular Chart */}
        <div className="relative flex flex-col items-center justify-center">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              className="text-slate-100"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="80"
              cy="80"
            />
            <circle
              className={`${colorClass} ${isPrinting ? '' : 'transition-all duration-1000 ease-out'}`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="80"
              cy="80"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Score</span>
          </div>
        </div>

        {/* Info & Markers */}
        <div className="flex-1 w-full">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Índice de Prontidão (Readiness)
              {perfil && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold uppercase tracking-wider">
                  Perfil: {perfil}
                </span>
              )}
            </h3>
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 ${colorClass}`}>
              <Icon size={18} />
              <span className="font-semibold">{status}</span>
            </div>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              {alertMessage} - Frequência Sugerida: <span className="font-bold text-slate-800">{frequencia_sugerida}</span>
            </p>
          </div>

          {marcadores_fadiga && marcadores_fadiga.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Marcadores Encontrados:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {marcadores_fadiga.map((marcador, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${bgClass}`} />
                    <span>{marcador}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
