import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle, Brain, Target, Heart } from 'lucide-react';
import { GuiaBoasVindas } from './GuiaBoasVindas';

export const PaginaRelatorioPublico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const { data: analise, error } = await supabase.from('analises').select('*, cliente:clientes(*), planos_terapeuticos(*)').eq('id', id).single();
      if (error || !analise) {
        setError("Relatório não encontrado. Verifique o link ou entre em contato com o terapeuta.");
        return;
      }
      setData(analise);
    };
    fetchData();
  }, [id]);

  if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;
  if (!data) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F9F7F2] p-4 md:p-6 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Lunara Terapias</h1>
        <p className="text-navy-700 mt-2">Olá, {data.cliente?.nome || 'Paciente'}. Aqui está o seu mapa de saúde integral.</p>
      </header>

      <GuiaBoasVindas />

      <section className="bg-white p-6 rounded-3xl shadow-sm mb-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900 mb-4"><Brain className="text-indigo-500" /> Síntese Vibracional</h2>
        <p className="text-slate-600 leading-relaxed">{data.sintese_vibracional}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-bold text-navy-900 mb-4">O Seu Plano de Harmonização</h2>
        {data.planos_terapeuticos?.[0]?.terapias_recomendadas?.map((t: any, i: number) => {
          const evidencias = t.evidencias || [];
          const priority = evidencias.some((e: string) => e.includes('+++')) ? 2 : 
                           evidencias.some((e: string) => e.includes('++')) ? 1 : 0;
          
          const borderColor = priority === 2 ? 'border-l-red-500' : 
                             priority === 1 ? 'border-l-orange-500' : 'border-l-indigo-500';

          return (
            <div key={i} className={`bg-white p-5 rounded-2xl mb-4 border-l-4 ${borderColor} shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-navy-900">{t.nome_terapia}</h3>
                {priority === 2 && (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    PRIORIDADE MÁXIMA
                  </span>
                )}
                {priority === 1 && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Atenção Moderada
                  </span>
                )}
              </div>
              
              {evidencias.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {evidencias.map((e: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] border border-red-100">
                      {e}
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-slate-600 text-sm leading-relaxed">{t.justificativa_editada}</p>
              {t.observacoes && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic">Observações: {t.observacoes}</p>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-sm mb-20">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900 mb-4"><Heart className="text-red-500" /> Recomendações</h2>
        <p className="text-slate-600 text-sm">Mantenha-se hidratado, pratique o repouso consciente e observe as mudanças no seu campo vibracional.</p>
      </section>

      <a href="https://wa.me/5511999999999" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center gap-2">
        <MessageCircle /> Dúvidas? Fale com o Terapeuta
      </a>
    </div>
  );
};
