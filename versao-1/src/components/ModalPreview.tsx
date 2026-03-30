import React from 'react';
import { RelatorioFinalPDF } from './RelatorioFinalPDF';
import { X, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteNome: string;
  idade: number;
  sexo: string;
  resultadoAnalise: any;
  hibrido?: boolean;
}

export const ModalPreview: React.FC<Props> = ({ isOpen, onClose, clienteNome, idade, sexo, resultadoAnalise, hibrido = false }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Prévia do Relatório: {clienteNome}</h2>
          <div className="flex gap-2">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
              <X size={20} />
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Printer size={18} /> Confirmar e Salvar PDF
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8 print:p-0">
          <RelatorioFinalPDF 
            paciente={clienteNome}
            data={new Date().toLocaleDateString()}
            idade={idade}
            sexo={sexo}
            pontosAtencao={[]}
            previousData={[]}
            planoTerapeutico={resultadoAnalise?.plano_terapeutico.map((t: any) => ({
              nome: t.terapia,
              evidencias: t.evidencias,
              justificativa: t.justificativa,
              observacoes: "",
              objetivo: "Objetivo padrão da terapia.",
              frequencia_sugerida: t.frequencia_sugerida
            })) || []}
            recomendacoes={[]}
            metas={[]}
            resultadoAnalise={resultadoAnalise}
            hibrido={hibrido}
          />
        </div>
      </div>
    </div>
  );
};
