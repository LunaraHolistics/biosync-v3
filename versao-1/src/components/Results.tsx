import React from 'react';
import { motion } from 'motion/react';
import { RelatorioAnalise, Severidade } from '../types';
import { Activity, HeartPulse, FileText } from 'lucide-react';

interface ResultsProps {
  result: RelatorioAnalise;
}

const severityColors: Record<Severidade, string> = {
  '+': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '++': 'bg-orange-100 text-orange-800 border-orange-200',
  '+++': 'bg-red-100 text-red-800 border-red-200',
};

const severityLabels: Record<Severidade, string> = {
  '+': 'Pouco Anormal',
  '++': 'Moderadamente Anormal',
  '+++': 'Severamente Anormal',
};

export function Results({ result }: ResultsProps) {
  // Group imbalances by category
  const groupedImbalances = result.desequilibrios_encontrados.reduce((acc, curr) => {
    if (!acc[curr.categoria]) {
      acc[curr.categoria] = [];
    }
    acc[curr.categoria].push(curr);
    return acc;
  }, {} as Record<string, typeof result.desequilibrios_encontrados>);

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 space-y-16">
      
      {/* Reports Analyzed */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-medium text-slate-800">Relatórios Analisados</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.relatorios_analisados.map((relatorio, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
              {relatorio}
            </span>
          ))}
        </div>
      </section>

      {/* Imbalances Section */}
      <section>
        <div className="flex items-center space-x-3 mb-8">
          <Activity className="w-6 h-6 text-slate-700" />
          <h2 className="text-2xl font-semibold text-slate-800">Desequilíbrios Encontrados</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(groupedImbalances).map(([categoria, desequilibrios], idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={categoria}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <h3 className="text-lg font-medium text-slate-800 mb-4 border-b border-slate-100 pb-3">
                {categoria}
              </h3>
              
              <div className="space-y-4">
                {desequilibrios.map((desequilibrio, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-slate-800">{desequilibrio.item}</p>
                      <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${severityColors[desequilibrio.severidade]}`}>
                        {severityLabels[desequilibrio.severidade]} ({desequilibrio.severidade})
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">Impacto Holístico:</span> {desequilibrio.impacto_holistico}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Therapeutic Plan Section */}
      <section className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
        <div className="flex items-center space-x-3 mb-8">
          <HeartPulse className="w-8 h-8 text-emerald-600" />
          <h2 className="text-3xl font-semibold text-emerald-900">Plano Terapêutico Integrativo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {result.plano_terapeutico.map((terapia, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.15 }}
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-emerald-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors duration-300" />
              <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300">{terapia.terapia}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {terapia.justificativa}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
