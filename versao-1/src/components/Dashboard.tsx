import React, { useState, useMemo } from 'react';
import { useExames } from '../hooks/useExames';
import { EditorRelatorio } from './EditorRelatorio';
import { AnalysisLoader } from './AnalysisLoader';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus, Sparkles, AlertCircle, FileDown, Pencil, Check } from 'lucide-react';
import { SelecaoCliente, Cliente } from './SelecaoCliente';
import { PlanoAcao } from './PlanoAcao';
import { ModalPreview } from './ModalPreview';
import { HistoricoCliente } from './HistoricoCliente';
import { calcularBioScore } from '../utils/calculadoraBioScore';

export const Dashboard: React.FC = () => {
  const [view, setView] = useState<'upload' | 'editor'>('upload');
  const [analiseId, setAnaliseId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteNome, setClienteNome] = useState("");
  const [editandoNome, setEditandoNome] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [perfil, setPerfil] = useState('Geral');
  
  const { 
    processarMultiplosExames, 
    uploadEProcessarExame,
    resultadoAnalise, 
    progresso, 
    status, 
    error, 
    loading 
  } = useExames();

  const bioScore = useMemo(() => {
    if (!resultadoAnalise) return 0;
    
    const calcularIdadeLocal = (dataNasc?: string) => {
      if (!dataNasc) return 0;
      const hoje = new Date();
      const nascimento = new Date(dataNasc);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      return idade;
    };

    const idade = calcularIdadeLocal(clienteSelecionado?.data_nascimento);
    const metricas = resultadoAnalise.desequilibrios_encontrados.reduce((acc, d) => {
      acc[d.item] = { valor: 0, status: d.severidade === '+++' ? 'Vermelho' : d.severidade === '++' ? 'Amarelo' : 'Verde' };
      return acc;
    }, {} as any);
    return calcularBioScore(metricas, idade);
  }, [resultadoAnalise, clienteSelecionado]);

  const desequilibriosFiltrados = useMemo(() => {
    if (!resultadoAnalise) return [];
    if (perfil === 'Geral') return resultadoAnalise.desequilibrios_encontrados;
    
    // Simple filter logic based on profile
    return resultadoAnalise.desequilibrios_encontrados.filter(d => {
      if (perfil === 'Academia/Performance') return ['Aminoácidos', 'Água Corporal', 'Força Muscular'].includes(d.categoria);
      return true;
    });
  }, [resultadoAnalise, perfil]);

  React.useEffect(() => {
    if (clienteSelecionado) setClienteNome(clienteSelecionado.nome);
  }, [clienteSelecionado]);

  const processFiles = async (files: File[]) => {
    if (!clienteSelecionado) return;
    setFiles(files);
    setView('editor');
    
    // Se já temos uma análise, não precisamos criar outra imediatamente
    if (analiseId) return;

    // Criar uma análise "vazia" ou apenas com os arquivos para começar
    // Para simplificar, vamos usar o uploadEProcessarExame mas sem o resultado da IA se possível
    // Ou apenas definir um analiseId temporário se estivermos em modo offline
    const res = await uploadEProcessarExame(clienteSelecionado, files[0], null, true);
    if (res) {
      setAnaliseId(res.analiseId);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!clienteSelecionado) {
      alert("Por favor, selecione ou cadastre um cliente primeiro.");
      return;
    }
    await processFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    disabled: !clienteSelecionado || loading
  } as any);

  const handleSavePlano = async (plano: any[]) => {
    console.log('Plano salvo no EditorRelatorio:', plano);
  };

  const calcularIdade = (dataNasc?: string) => {
    if (!dataNasc) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white p-2 rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
              <img src="/favicon.png" alt="BioSync Logo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">BIOSYNC</h1>
              <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Lunara Terapias</p>
            </div>
          </div>
          
          {analiseId && (
            <button onClick={() => setView(view === 'upload' ? 'editor' : 'upload')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors">
              <Plus size={18} /> {view === 'upload' ? 'Voltar ao Editor' : 'Adicionar Mais Documentos'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === 'upload' && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Nova Análise Integrativa</h2>
              <p className="text-lg text-slate-600">Selecione o paciente e faça o upload dos relatórios de bioressonância para gerar o plano terapêutico.</p>
            </div>

            <SelecaoCliente 
              clienteSelecionado={clienteSelecionado} 
              onClienteSelecionado={setClienteSelecionado} 
            />

            {clienteSelecionado && (
              <div className="mt-8">
                <HistoricoCliente clienteId={clienteSelecionado.id} />
              </div>
            )}

            <div 
              {...getRootProps()} 
              className={`p-16 border-2 border-dashed rounded-3xl text-center transition-all duration-300 ${
                !clienteSelecionado 
                  ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed' 
                  : isDragActive 
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' 
                    : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 cursor-pointer shadow-sm hover:shadow-md'
              }`}
            >
              <input {...getInputProps()} />
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-colors ${!clienteSelecionado ? 'bg-slate-200 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
                <Upload size={32} />
              </div>
              <p className="text-xl font-semibold text-slate-700 mb-2">
                {!clienteSelecionado ? 'Selecione um cliente primeiro' : 'Arraste os relatórios PDF aqui'}
              </p>
              <p className="text-slate-500">
                {clienteSelecionado && 'ou clique para selecionar os arquivos do seu computador'}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <AnalysisLoader progress={progresso} status={status} />
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold">Erro no processamento</h4>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {analiseId && !loading && !error && (
          <div className={view === 'upload' ? 'hidden' : 'block mt-8'}>
            <div className="mb-8">
              <EditorRelatorio 
                analiseId={analiseId!} 
                resultadoAnalise={resultadoAnalise} 
                onSave={handleSavePlano} 
                cliente={clienteSelecionado}
                files={files}
              />
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                {editandoNome ? (
                  <input 
                    value={clienteNome} 
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="text-2xl font-bold text-slate-800 border-b border-indigo-500 outline-none"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-slate-800">{clienteNome}</h2>
                )}
                <button onClick={() => setEditandoNome(!editandoNome)} className="text-slate-400 hover:text-indigo-600">
                  {editandoNome ? <Check size={20} /> : <Pencil size={20} />}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full font-bold">
                  <span className="text-sm text-slate-400">BioScore:</span>
                  <span className="text-xl text-emerald-400">{bioScore}</span>
                </div>
                <select 
                  value={perfil} 
                  onChange={(e) => setPerfil(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Geral">Geral</option>
                  <option value="Executivo">Executivo</option>
                  <option value="Academia/Performance">Academia/Performance</option>
                  <option value="Melhor Idade">Melhor Idade</option>
                  <option value="Hipertrofia Feminina">Hipertrofia Feminina</option>
                </select>
                <button 
                  onClick={() => setPreviewOpen(true)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" /> Gerar PDF
                </button>
              </div>
              {resultadoAnalise?.protocolo_intervencao && (
                <PlanoAcao 
                  protocolo={resultadoAnalise.protocolo_intervencao}
                  perfil={perfil}
                  desequilibrios={desequilibriosFiltrados}
                  bioScore={bioScore}
                  planoTerapeutico={resultadoAnalise.plano_terapeutico}
                />
              )}
            </div>
            <ModalPreview 
              isOpen={previewOpen}
              onClose={() => setPreviewOpen(false)}
              clienteNome={clienteNome}
              idade={calcularIdade(clienteSelecionado?.data_nascimento)}
              sexo={clienteSelecionado?.sexo || 'Não informado'}
              resultadoAnalise={resultadoAnalise}
            />
          </div>
        )}
      </main>
    </div>
  );
};
