import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

export function Processing() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-8">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-500 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-8 h-8 text-emerald-600" />
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-semibold text-slate-800">
          Analisando Relatórios
        </h2>
        <p className="text-slate-500 max-w-md mx-auto">
          A IA está processando e cruzando os dados sistêmicos. Isso pode levar alguns instantes dependendo da quantidade de arquivos.
        </p>
      </div>

      <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
    </div>
  );
}
