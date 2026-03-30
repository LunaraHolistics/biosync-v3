import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Terapia {
  id: string;
  nome: string;
  descricao_padrao: string;
}

interface Props {
  onTerapiaSelecionada: (terapia: string, descricao: string) => void;
}

export const SeletorTerapia: React.FC<Props> = ({ onTerapiaSelecionada }) => {
  const [terapias, setTerapias] = useState<Terapia[]>([]);
  const [selecionada, setSelecionada] = useState("");

  useEffect(() => {
    const carregarTerapias = async () => {
      const { data } = await supabase.from('configuracoes_terapias').select('*');
      if (data) setTerapias(data);
    };
    carregarTerapias();
  }, []);

  const handleSelect = (nome: string) => {
    const terapia = terapias.find(t => t.nome === nome);
    if (terapia) {
      setSelecionada(nome);
      onTerapiaSelecionada(terapia.nome, terapia.descricao_padrao);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">Adicionar Terapia ao Plano</label>
      <select 
        value={selecionada}
        onChange={(e) => handleSelect(e.target.value)}
        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">Selecione uma terapia...</option>
        {terapias.map((t) => (
          <option key={t.id} value={t.nome}>{t.nome}</option>
        ))}
      </select>
    </div>
  );
};
