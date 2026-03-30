import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, ArrowUp, ArrowDown } from 'lucide-react';

export const HistoricoCliente: React.FC<{ clienteId: string }> = ({ clienteId }) => {
  const [analises, setAnalises] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('analises').select('*').eq('cliente_id', clienteId).order('created_at', { ascending: false });
        if (error) {
          console.warn('Erro ao buscar histórico:', error);
        }
        setAnalises(data || []);
      } catch (err) {
        console.error('Erro inesperado ao buscar histórico:', err);
        setAnalises([]);
      }
    };
    fetchData();
  }, [clienteId]);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-2));
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-navy-900 mb-6">Histórico do Cliente</h2>
      
      <div className="h-64 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analises}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="created_at" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
            <YAxis />
            <Tooltip labelFormatter={(val) => new Date(val).toLocaleDateString()} />
            <Line type="monotone" dataKey="resistencia_vascular" stroke="#4f46e5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {analises.map(a => (
          <div key={a.id} className={`p-4 rounded-xl border ${selected.includes(a.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 cursor-pointer'}`} onClick={() => toggleSelect(a.id)}>
            <div className="flex justify-between items-center">
              <span>{new Date(a.created_at).toLocaleDateString()}</span>
              <button className="text-indigo-600 flex items-center gap-1 text-sm"><FileText size={16} /> Ver Relatório</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
