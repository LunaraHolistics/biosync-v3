import { supabase } from '../lib/supabase';
import { processarRelatoriosBioressonancia } from './aiService';
import { salvarAnaliseCompleta, salvarHistoricoAnalise } from './supabaseService';
import { salvarRelatorioCache } from '../utils/cache';

export async function processarEsalvarExame(file: File, clienteId: string) {
  // 1. Upload para o Supabase Storage
  const fileName = `${clienteId}/${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('relatorios-exames')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // 2. Obter URL pública
  const { data: publicUrlData } = supabase.storage
    .from('relatorios-exames')
    .getPublicUrl(fileName);

  // 3. Processar com Gemini
  const resultadoIA = await processarRelatoriosBioressonancia([file]);

  // 4. Salvar na tabela resultados_bioressonancia
  const { data: analise, error: analiseError } = await supabase
    .from('resultados_bioressonancia')
    .insert({
      cliente_id: clienteId,
      arquivo_url: publicUrlData.publicUrl,
      arquivo_caminho: fileName,
      resultado_json: resultadoIA,
    })
    .select()
    .single();

  if (analiseError) throw analiseError;

  // 5. Salvar na tabela analises_clientes (Persistência)
  await salvarAnaliseCompleta({
    nome: 'Cliente', // Need to get the actual name
    sexo: 'Masculino', // Need to get the actual sex
    idade: 0, // Need to get the actual age
    perfil: resultadoIA.perfil_analise,
    metricas: resultadoIA.desequilibrios_encontrados,
    planoAcao: resultadoIA.plano_terapeutico
  });

  // 6. Salvar na tabela historico_analises
  await salvarHistoricoAnalise(clienteId, resultadoIA);

  // 7. Cache Local (PWA)
  salvarRelatorioCache(clienteId, resultadoIA);

  // 7. Atualizar planos_terapeuticos
  const { error: planoError } = await supabase
    .from('planos_terapeuticos')
    .insert({
      analise_id: analise.id,
      sintese_final: "Síntese gerada automaticamente baseada nos desequilíbrios.",
      sugestoes_terapias: resultadoIA.plano_terapeutico,
    });

  if (planoError) throw planoError;

  return analise;
}
