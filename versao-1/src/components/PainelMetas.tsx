import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Meta {
  id: string;
  item: string;
  meta_definida: string;
  status: 'atingida' | 'atencao';
}

interface Props {
  analiseId: string;
  pontosCriticos: { item: string; severidade: string }[];
  onMetasChange: (metas: Meta[]) => void;
}

export const PainelMetas: React.FC<Props> = ({ analiseId, pontosCriticos, onMetasChange }) => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Filtrar apenas (++) ou (+++)
    const criticos = pontosCriticos.filter(p => p.severidade === '++' || p.severidade === '+++');
    
    // Inicializar metas para itens críticos
    const novasMetas = criticos.map(c => ({
      id: Math.random().toString(),
      item: c.item,
      meta_definida: '',
      status: 'atencao' as const
    }));
    setMetas(novasMetas);
  }, [pontosCriticos]);

  const updateMeta = (id: string, valor: string) => {
    const novasMetas = metas.map(m => m.id === id ? { ...m, meta_definida: valor } : m);
    setMetas(novasMetas);
    onMetasChange(novasMetas);
  };

  const toggleStatus = (id: string) => {
    const novasMetas = metas.map(m => m.id === id ? { ...m, status: m.status === 'atingida' ? 'atencao' as const : 'atingida' as const } : m);
    setMetas(novasMetas);
    onMetasChange(novasMetas);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Caminho de Evolução</h3>
      {metas.map(m => (
        <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-slate-800">{m.item}</span>
            <button 
              onClick={() => toggleStatus(m.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${m.status === 'atingida' ? 'bg-green-700 text-white' : 'bg-amber-600 text-white'}`}
            >
              {m.status === 'atingida' ? <><CheckCircle className="w-3 h-3" /> Atingida</> : <><AlertTriangle className="w-3 h-3" /> Em Atenção</>}
            </button>
          </div>
          <input
            type="text"
            className="w-full p-2 rounded-lg border border-slate-300 text-sm"
            placeholder="Defina a meta de melhoria..."
            value={m.meta_definida}
            onChange={(e) => updateMeta(m.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};
