import React, { useState } from 'react';
import { Heart, TrendingUp, Target, Info, X } from 'lucide-react';

export const GuiaBoasVindas: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl shadow-md mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          <Heart className="text-emerald-500" /> ✨ Bem-vindo à sua Jornada de Equilíbrio
        </h2>
        <button onClick={() => setIsOpen(false)} className="text-emerald-600 hover:text-emerald-800">
          <X size={24} />
        </button>
      </div>
      
      <div className="text-emerald-800 space-y-4 leading-relaxed mb-6">
        <p>Este relatório utiliza a tecnologia LUMINA para traduzir a linguagem do seu corpo em um plano de cuidado único. Antes de prosseguir, aqui estão algumas dicas para sua leitura:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 p-4 rounded-2xl border border-emerald-100">
            <Info className="text-emerald-500 mb-2" />
            <p className="font-semibold text-emerald-900">Os Sinais (+)</p>
            <p className="text-sm">Imagine-os como semáforos. Eles indicam onde a sua energia precisa de mais atenção neste momento. Quanto mais sinais (+), maior a prioridade de harmonização naquela área.</p>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl border border-emerald-100">
            <TrendingUp className="text-emerald-500 mb-2" />
            <p className="font-semibold text-emerald-900">Seu Progresso</p>
            <p className="text-sm">No gráfico de evolução, você verá o seu avanço. O nosso objetivo é que, a cada sessão, as barras coloridas fiquem menores e mais equilibradas.</p>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl border border-emerald-100">
            <Target className="text-emerald-500 mb-2" />
            <p className="font-semibold text-emerald-900">Foco no Plano</p>
            <p className="text-sm">As terapias selecionadas abaixo (como Biomagnetismo ou Florais) foram escolhidas especificamente para atuar nos pontos que o seu corpo sinalizou hoje.</p>
          </div>
        </div>

        <p className="font-medium italic">Respire fundo e lembre-se: este é um mapa para a sua melhor versão.</p>
      </div>

      <button 
        onClick={() => setIsOpen(false)}
        className="w-full md:w-auto bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition shadow-sm"
      >
        Entendi, ver meu relatório
      </button>
    </div>
  );
};
