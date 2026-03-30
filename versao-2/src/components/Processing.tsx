import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function Processing() {
  return (
    <div className="bg-white p-12 rounded-2xl shadow-sm border border-neutral-200 text-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-20 h-20 mx-auto text-emerald-600 mb-6"
      >
        <Loader2 size={80} />
      </motion.div>
      <h2 className="text-2xl font-semibold text-emerald-900 mb-4">Analisando Laudo...</h2>
      <p className="text-neutral-600 max-w-md mx-auto">
        A inteligência artificial está extraindo os desequilíbrios, calculando o BioScore e cruzando os dados com nossos protocolos integrativos.
      </p>
    </div>
  );
}
