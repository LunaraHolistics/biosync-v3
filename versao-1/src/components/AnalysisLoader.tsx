import React from 'react';

interface Props {
  progress: number;
  status: string;
}

export const AnalysisLoader: React.FC<Props> = ({ progress, status }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
      {/* Animação de Scan */}
      <div className="relative w-24 h-24 border-4 border-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 bg-indigo-500 opacity-20 ${progress < 100 ? 'animate-pulse' : ''}`}></div>
        <div 
          className="w-16 h-1 w-full bg-indigo-500 absolute top-0 animate-scan"
          style={{ animationDuration: progress < 50 ? '1s' : '0.5s' }}
        ></div>
        <svg className="w-12 h-12 text-indigo-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800">{status}</h3>
        <p className="text-sm text-slate-500">{progress}% concluído</p>
      </div>

      {/* Barra de Progresso */}
      <div className="w-full max-w-xs bg-slate-200 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
