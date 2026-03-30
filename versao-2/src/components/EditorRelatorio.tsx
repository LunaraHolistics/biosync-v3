import { useState, useRef, useEffect } from 'react';
import { Cliente, Analise, ResultadoBioressonancia, SugestaoTerapia } from '../types';
import { firebaseService } from '../services/firebaseService';
import { gerarPlanoTerapeutico } from '../services/terapiaService';
import RelatorioFinalPDF from './RelatorioFinalPDF';
import GraficoEvolucao from './GraficoEvolucao';
import DashboardEvolucao from './DashboardEvolucao';
import { FileText, Save, ArrowLeft, Activity } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Props {
  cliente: Cliente;
  analise: Analise;
  resultado: ResultadoBioressonancia;
  onBack: () => void;
}

export default function EditorRelatorio({ cliente, analise, resultado, onBack }: Props) {
  const [recomendacoes, setRecomendacoes] = useState(
    `Com base no seu BioScore de ${resultado.dados_extraidos.bioScore}/100, focaremos em ${resultado.dados_extraidos.perfil}.\n\nRecomendações diárias:\n- Hidratação adequada\n- Sono reparador\n- Alimentação anti-inflamatória`
  );
  const [sintese, setSintese] = useState(
    resultado.dados_extraidos.sintese_final || `Análise indica ${resultado.dados_extraidos.fadiga ? 'fadiga adrenal' : 'necessidade de detox'}.`
  );
  const [gerando, setGerando] = useState(false);
  const [resultadosHistorico, setResultadosHistorico] = useState<ResultadoBioressonancia[]>([]);
  const [terapias, setTerapias] = useState<SugestaoTerapia[]>([]);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carregarDados = async () => {
      // Carregar histórico para o gráfico de evolução
      if (cliente.id) {
        const historico = await firebaseService.getHistoricoEvolucao(cliente.id);
        // Garantir que o resultado atual está no histórico se ainda não foi salvo
        const historicoAtualizado = historico.some(h => h.id === resultado.id) 
          ? historico 
          : [...historico, resultado];
        setResultadosHistorico(historicoAtualizado);
      }

      // Gerar plano terapêutico automaticamente baseado nos desequilíbrios
      if (resultado.dados_extraidos.desequilibrios) {
        const planoGerado = gerarPlanoTerapeutico(resultado.dados_extraidos.desequilibrios);
        setTerapias(planoGerado);
      }
    };

    carregarDados();
  }, [cliente.id, resultado]);

  const handleGerarPDF = async () => {
    if (!pdfRef.current) return;
    setGerando(true);

    const element = pdfRef.current;
    const originalStyle = element.getAttribute('style');

    try {
      // 1. Captura do Canvas com html2canvas
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('pdf-content');
          if (!clonedElement) return;

          // Reset de transformações
          clonedElement.style.transform = 'none';
          clonedElement.style.display = 'block';
          clonedElement.style.width = '210mm';
          clonedElement.style.minHeight = '297mm';

          // SOLUÇÃO RADICAL PARA OKLCH: 
          // O html2canvas falha ao tentar parsear qualquer regra CSS que contenha "oklch".
          // Vamos varrer todos os estilos do clone e substituir oklch por um fallback HEX.
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            const style = styleTags[i];
            // Substitui oklch(...) por cinza neutro ou cor aproximada para evitar que o parser quebre
            style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, '#737373');
          }

          // Injeção de CSS de compatibilidade (HEX apenas)
          const compatStyle = clonedDoc.createElement('style');
          compatStyle.innerHTML = `
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .bg-white { background-color: #ffffff !important; }
            .text-emerald-900 { color: #064e3b !important; }
            .text-emerald-600 { color: #059669 !important; }
            .bg-emerald-50 { background-color: #ecfdf5 !important; }
            .bg-emerald-600 { background-color: #059669 !important; }
            .border-emerald-100 { border-color: #d1fae5 !important; }
            .bg-neutral-50 { background-color: #f9fafb !important; }
            .text-neutral-500 { color: #737373 !important; }
            .text-neutral-700 { color: #404040 !important; }
            .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          `;
          clonedDoc.head.appendChild(compatStyle);
        }
      });

      // 2. Conversão para PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.90); // JPEG com 90% de qualidade para reduzir tamanho
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const pdfBlob = pdf.output('blob');

      // 3. Persistência (Firebase Storage + Firestore)
      const storage = getStorage();
      const fileName = `relatorios/${cliente.id}/${analise.id}_${Date.now()}.pdf`;
      const storageRef = ref(storage, fileName);
      
      try {
        await uploadBytes(storageRef, pdfBlob);
        const downloadURL = await getDownloadURL(storageRef);

        // Atualização atômica dos dados
        await Promise.all([
          firebaseService.updateAnalise(analise.id, {
            pdf_final_url: downloadURL,
            status: 'concluida'
          }),
          firebaseService.addPlano({
            analise_id: analise.id,
            cliente_id: cliente.id,
            sugestoes_terapias: terapias,
            sintese_final: sintese,
            recomendacoes_editaveis: recomendacoes,
            pdf_url: downloadURL
          })
        ]);

        // 4. Download e Feedback
        pdf.save(`Relatorio_${cliente.nome.replace(/\s+/g, '_')}.pdf`);
        alert('Relatório gerado, salvo na nuvem e baixado com sucesso!');
        
      } catch (dbError) {
        console.error("Erro ao salvar dados no Firebase:", dbError);
        alert("O PDF foi gerado, mas houve um erro ao salvar na nuvem. O download local foi iniciado.");
        pdf.save(`Relatorio_${cliente.nome.replace(/\s+/g, '_')}_LOCAL.pdf`);
      }

    } catch (error) {
      console.error("Erro crítico na geração do PDF:", error);
      alert("Falha técnica ao gerar o PDF. Tente novamente ou verifique se há imagens bloqueadas por CORS.");
    } finally {
      if (originalStyle) element.setAttribute('style', originalStyle);
      setGerando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Coluna de Edição */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2">
              <ArrowLeft size={18} /> Voltar
            </button>
            <h2 className="text-xl font-semibold text-emerald-900">Editor do Relatório</h2>
          </div>

          <div className="space-y-6">
            {/* Gráfico de Evolução no Editor */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-emerald-600" />
                Evolução do Paciente
              </h3>
              <GraficoEvolucao resultados={resultadosHistorico} />
            </div>

            {/* Dashboard de Evolução do BioScore */}
            {resultadosHistorico.length >= 2 && (
              <DashboardEvolucao resultados={resultadosHistorico} />
            )}

            {/* Terapias Sugeridas */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <h3 className="text-sm font-semibold text-emerald-800 mb-4">Plano Terapêutico Sugerido (Match Local)</h3>
              <div className="space-y-3">
                {terapias.map((t, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-200 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-emerald-900">{t.nome}</span>
                      <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        {t.importancia}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-1"><span className="font-semibold">Por que:</span> {t.descricao}</p>
                    <p className="text-neutral-600 mb-1"><span className="font-semibold">Resultado:</span> {t.resultado_esperado}</p>
                    <p className="text-emerald-600 font-medium text-xs mt-2">Frequência: {t.frequencia}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Síntese Vibracional</label>
              <textarea 
                rows={3}
                value={sintese}
                onChange={e => setSintese(e.target.value)}
                className="w-full p-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Recomendações (Editável)</label>
              <textarea 
                rows={8}
                value={recomendacoes}
                onChange={e => setRecomendacoes(e.target.value)}
                className="w-full p-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            <button 
              onClick={handleGerarPDF}
              disabled={gerando}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {gerando ? 'Gerando PDF...' : <><FileText size={20} /> Gerar e Salvar PDF</>}
            </button>
          </div>
        </div>
      </div>

      {/* Área de Preview do PDF na Direita */}
      <div className="flex-1 bg-gray-100 rounded-2xl p-4 overflow-hidden flex justify-center border border-gray-200">
        <div className="w-full max-w-full overflow-auto flex justify-center bg-gray-200 p-4 rounded-xl shadow-inner">
          {/* O segredo: origin-top e scale reduzem o visual, mas mantêm o tamanho real para o PDF */}
          <div 
            className="origin-top transition-transform duration-300 shadow-2xl"
            style={{ 
              transform: 'scale(0.5)', // Ajuste este valor (0.4 a 0.6) conforme sua tela
              width: '210mm', 
              height: '297mm',
              backgroundColor: 'white'
            }}
          >
            <div id="pdf-content" ref={pdfRef}>
              <RelatorioFinalPDF 
                cliente={cliente} 
                resultado={resultado} 
                sintese={sintese} 
                recomendacoes={recomendacoes}
                resultadosHistorico={resultadosHistorico}
                terapias={terapias}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
