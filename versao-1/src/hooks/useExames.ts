import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { processarRelatoriosBioressonancia } from '../services/aiService';
import { RelatorioAnalise } from '../types';

export interface ResultadoItem {
  categoria: string;
  item: string;
  valor: string;
  referencia: string;
  severidade: '+' | '++' | '+++';
  impacto: string;
}

export type Terapia = 
  | 'Biomagnetismo' 
  | 'Radiestesia' 
  | 'Apometria' 
  | 'Radiônica' 
  | 'Cartomancia' 
  | 'Reiki' 
  | 'Sistema Ashtariano' 
  | 'Mapas' 
  | 'E.F.T.';

export interface PlanoTerapeutico {
  terapia: Terapia;
  justificativa: string;
}

export const useExames = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultadoAnalise, setResultadoAnalise] = useState<RelatorioAnalise | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [status, setStatus] = useState('');

  const buscarClientes = async (termo: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nome', `%${termo}%`)
        .limit(5);
      
      if (fetchError) throw fetchError;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  const cadastrarCliente = async (nome: string, data_nascimento?: string, whatsapp?: string, email?: string, sexo?: 'Masculino' | 'Feminino') => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('clientes')
        .insert([{ nome, data_nascimento, whatsapp, email, sexo }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const atualizarCliente = async (clienteId: string, dados: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('clientes')
        .update(dados)
        .eq('id', clienteId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadEProcessarExame = async (cliente: any, file: File, analiseId?: string | null, skipLoadingState = false) => {
    if (!skipLoadingState) setLoading(true);
    setError(null);
    const clienteId = cliente.id;

    try {
      // 1. Upload para o Storage
      const sanitizeFileName = (name: string) => {
        return name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/\s+/g, '_') // Substitui espaços por sublinhados
          .replace(/[^a-zA-Z0-9.\-_]/g, '') // Mantém apenas letras, números, pontos, hífens e sublinhados
          .replace(/_+/g, '_') // Evita múltiplos sublinhados
          .replace(/-+/g, '-'); // Evita múltiplos hífens
      };

      const sanitizedName = sanitizeFileName(file.name);
      const fileName = `${clienteId}/${Date.now()}_${sanitizedName}`;
      
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('relatorios-exames')
        .upload(fileName, file, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro detalhado:', uploadError);
        const isError400 = 
          uploadError.message?.includes('400') || 
          (uploadError as any).statusCode === '400' || 
          (uploadError as any).error === 'Bad Request';
          
        if (isError400) {
          throw new Error('Erro 400: Verifique se o bucket "relatorios-exames" existe no Supabase e se as políticas de RLS permitem o upload.');
        }
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Calcular idade para o prompt
      const calcularIdade = (dataNasc?: string) => {
        if (!dataNasc) return undefined;
        const hoje = new Date();
        const nascimento = new Date(dataNasc);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
          idade--;
        }
        return idade;
      };

      // 2. Processar com a IA
      const novoResultado = await processarRelatoriosBioressonancia(
        [file], 
        cliente.sexo, 
        calcularIdade(cliente.data_nascimento)
      );
      console.log('Gemini Result (novoResultado):', novoResultado);

      // 3. Mesclar com resultadoAnalise existente
      setResultadoAnalise(prev => {
        console.log('Previous State (prev):', prev);
        if (!prev) return novoResultado;

        const mergedDesequilibrios = [...prev.desequilibrios_encontrados, ...novoResultado.desequilibrios_encontrados];
        const mergedTerapias = [...prev.plano_terapeutico];

        novoResultado.plano_terapeutico.forEach(novaTerapia => {
          const existente = mergedTerapias.find(t => t.terapia === novaTerapia.terapia);
          if (existente) {
            existente.justificativa += ` | Baseado nos Resultados: ${novaTerapia.justificativa}`;
          } else {
            mergedTerapias.push(novaTerapia);
          }
        });

        const newState: RelatorioAnalise = {
          ...prev,
          ...novoResultado,
          relatorios_analisados: [...new Set([...prev.relatorios_analisados, ...novoResultado.relatorios_analisados])],
          desequilibrios_encontrados: mergedDesequilibrios,
          plano_terapeutico: mergedTerapias,
          // Preservar campos que podem vir de qualquer um dos dois
          indice_prontidao: novoResultado.indice_prontidao || prev.indice_prontidao,
          protocolo_intervencao: novoResultado.protocolo_intervencao || prev.protocolo_intervencao,
          marcadores_fadiga: [...new Set([...(prev.marcadores_fadiga || []), ...(novoResultado.marcadores_fadiga || [])])]
        };
        console.log('Merged State (newState):', newState);
        return newState;
      });

      // 4. Criar ou atualizar registro da análise
      let currentAnaliseId = analiseId;
      if (!currentAnaliseId) {
        const { data: analise, error: dbError } = await supabase
          .from('analises')
          .insert([{ 
            cliente_id: clienteId, 
            status: 'processando',
            arquivo_url: storageData.path,
            tipo_cliente: cliente.sexo || 'Não informado'
          }])
          .select()
          .single();

        if (dbError) throw dbError;
        currentAnaliseId = analise.id;
      }

      return { analiseId: currentAnaliseId, filePath: storageData.path };
      
    } catch (err: any) {
      console.error('Erro no uploadEProcessarExame:', err);
      const errorMessage = err.message || '';
      if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        setError('Erro 400: Verifique se o bucket "relatorios-exames" existe no Supabase e se as políticas de RLS permitem o upload.');
      } else {
        setError(errorMessage);
      }
      return null;
    } finally {
      if (!skipLoadingState) setLoading(false);
    }
  };

  const processarMultiplosExames = async (cliente: any, files: File[], analiseIdAtual?: string | null) => {
    setLoading(true);
    setError(null);
    setProgresso(0);
    let currentAnaliseId = analiseIdAtual;

    for (let i = 0; i < files.length; i++) {
      const progressPercent = Math.round(((i) / files.length) * 100);
      if (progressPercent < 50) {
        setStatus("Processando Relatório de Enzimas... Extraindo biomarcadores hepáticos.");
      } else if (progressPercent < 75) {
        setStatus("Processando Relatório de Metais Pesados... Identificando sobrecarga tóxica.");
      } else {
        setStatus("Unificando evidências e correlacionando terapias integrativas...");
      }

      setProgresso(progressPercent + 10);

      const result = await uploadEProcessarExame(cliente, files[i], currentAnaliseId, true);
      if (result) {
        currentAnaliseId = result.analiseId;
      } else {
        // Se falhou, interrompe o processo para não engolir o erro
        setProgresso(0);
        setLoading(false);
        return null;
      }
      setProgresso(Math.round(((i + 1) / files.length) * 100));
    }
    setProgresso(100);
    setStatus('Concluído');
    setLoading(false);
    return currentAnaliseId;
  };

  const buscarHistorico = async (clienteId: string) => {
    const { data, error: fetchError } = await supabase
      .from('analises')
      .select(`
        *,
        cliente:clientes (*),
        resultados_bioressonancia (*),
        planos_terapeuticos (*)
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return [];
    }
    return data;
  };

  const removerAnalise = async (analiseId: string, filePath: string) => {
    try {
      // O ON DELETE CASCADE no SQL removerá os dados das outras tabelas
      await supabase.from('analises').delete().eq('id', analiseId);
      await supabase.storage.from('relatorios-exames').remove([filePath]);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return { 
    buscarClientes,
    cadastrarCliente,
    atualizarCliente,
    uploadEProcessarExame,
    processarMultiplosExames,
    buscarHistorico, 
    removerAnalise, 
    loading, 
    error,
    resultadoAnalise,
    progresso,
    status
  };
};
