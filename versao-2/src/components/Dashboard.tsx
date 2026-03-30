import { useState } from 'react';
import { Cliente, Analise, ResultadoBioressonancia } from '../types';
import SelecaoCliente from './SelecaoCliente';
import Dropzone from './Dropzone';
import Processing from './Processing';
import EditorRelatorio from './EditorRelatorio';
import { useExames } from '../hooks/useExames';

type ViewState = 'selecao' | 'upload' | 'processando' | 'editor';

export default function Dashboard() {
  const [view, setView] = useState<ViewState>('selecao');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [analiseAtual, setAnaliseAtual] = useState<Analise | null>(null);
  const [resultadoAtual, setResultadoAtual] = useState<ResultadoBioressonancia | null>(null);

  const { processarExame } = useExames();

  const [feedbackTreino, setFeedbackTreino] = useState('');

  const handleClienteSelecionado = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setView('upload');
  };

  const handleUpload = async (file: File) => {
    if (!clienteSelecionado) return;
    setView('processando');
    try {
      const { analise, resultado } = await processarExame(file, clienteSelecionado, feedbackTreino);
      setAnaliseAtual(analise);
      setResultadoAtual(resultado);
      setView('editor');
    } catch (error) {
      console.error('Erro no processamento', error);
      alert('Erro ao processar exame. Tente novamente.');
      setView('upload');
    }
  };

  return (
    <div className="space-y-8">
      {view === 'selecao' && (
        <SelecaoCliente onSelect={handleClienteSelecionado} />
      )}
      
      {view === 'upload' && clienteSelecionado && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-emerald-900">Upload de Exame</h2>
            <button 
              onClick={() => setView('selecao')}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              Trocar Cliente ({clienteSelecionado.nome})
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Feedback de Treino (Opcional)
            </label>
            <textarea
              className="w-full p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Como se sentiu no treino? (Energia, dor, desempenho...)"
              rows={3}
              value={feedbackTreino}
              onChange={(e) => setFeedbackTreino(e.target.value)}
            />
            <p className="mt-2 text-xs text-neutral-500">
              Este feedback ajudará a IA a refinar as recomendações de treino e análise de fadiga.
            </p>
          </div>

          <Dropzone onUpload={handleUpload} />
        </div>
      )}

      {view === 'processando' && (
        <Processing />
      )}

      {view === 'editor' && clienteSelecionado && analiseAtual && resultadoAtual && (
        <EditorRelatorio 
          cliente={clienteSelecionado} 
          analise={analiseAtual} 
          resultado={resultadoAtual} 
          onBack={() => setView('upload')}
        />
      )}
    </div>
  );
}
