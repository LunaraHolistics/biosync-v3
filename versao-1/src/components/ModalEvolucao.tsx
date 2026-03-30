import React from 'react';
import { ComparativoEvolucao } from './ComparativoEvolucao';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
}

export const ModalEvolucao: React.FC<Props> = ({ isOpen, onClose, clienteId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Evolução do Cliente</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="p-6">
          <ComparativoEvolucao clienteId={clienteId} />
        </div>
      </div>
    </div>
  );
};
