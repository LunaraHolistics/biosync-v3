import { supabase } from '../lib/supabase';

export interface AnaliseData {
  nome: string;
  sexo: 'Masculino' | 'Feminino';
  idade: number;
  perfil: string;
  metricas: any;
  planoAcao: any;
}

export const salvarAnaliseCompleta = async (data: AnaliseData) => {
  try {
    const { data: cliente, error: clientError } = await supabase
      .from('clientes')
      .upsert({ 
        nome: data.nome, 
        sexo: data.sexo 
      }, { onConflict: 'nome' })
      .select()
      .single();

    if (clientError) throw clientError;

    const { data: analise, error: analiseError } = await supabase
      .from('analises')
      .insert({
        cliente_id: cliente.id,
        perfil_aplicado: data.perfil,
        data_analise: new Date().toISOString(),
        tipo_cliente: cliente.sexo,
        resumo_dashboard: {
          idade_na_epoca: data.idade,
          total_indicadores: Object.keys(data.metricas).length
        }
      })
      .select()
      .single();

    if (analiseError) throw analiseError;

    const { error: resError } = await supabase
      .from('resultados_bioressonancia')
      .insert({
        analise_id: analise.id,
        categoria_relatorio: data.perfil,
        dados_extraidos: data.metricas
      });

    if (resError) throw resError;

    return { success: true, analiseId: analise.id };
  } catch (error) {
    console.error('Erro ao guardar no BioSync:', error);
    return { success: false, error };
  }
};

export async function salvarHistoricoAnalise(clienteId: string, analise: any) {
  // Mapeamento simplificado dos desequilíbrios para métricas chave
  const metricas_chave = {
    cardiovascular: analise.desequilibrios_encontrados.find((d: any) => d.categoria.includes('Cardiovascular')) ? 0.8 : 0.4,
    gastrointestinal: analise.desequilibrios_encontrados.find((d: any) => d.categoria.includes('Gastro')) ? 0.9 : 0.3,
    stress_adrenal: analise.desequilibrios_encontrados.find((d: any) => d.categoria.includes('Estresse')) ? 1.1 : 0.5,
    aminoacidos: analise.desequilibrios_encontrados.find((d: any) => d.categoria.includes('Aminoácidos')) ? 0.7 : 0.2,
  };

  const { data, error } = await supabase
    .from('historico_analises')
    .insert({
      cliente_id: clienteId,
      data: new Date().toISOString().split('T')[0],
      perfil: analise.perfil_analise || 'Holistico',
      metricas_chave,
      terapias_aplicadas: analise.plano_terapeutico.map((t: any) => t.terapia)
    });

  if (error) throw error;
  return data;
}

export async function buscarHistoricoCompleto(clienteId: string) {
  const { data, error } = await supabase
    .from('analises')
    .select(`
      id,
      data_analise,
      cliente:clientes (
        nome,
        sexo,
        data_nascimento
      ),
      resultados_bioressonancia (
        dados_extraidos
      )
    `)
    .eq('cliente_id', clienteId)
    .order('data_analise', { ascending: false });

  if (error) {
    console.error('Erro na busca de histórico:', error);
    throw error;
  }
  
  console.log('Dados buscados (histórico):', data);
  
  // Garantir que dados_extraidos seja um objeto
  const dadosFormatados = data?.map(analise => ({
    ...analise,
    resultados_bioressonancia: analise.resultados_bioressonancia?.map((res: any) => ({
      ...res,
      dados_extraidos: typeof res.dados_extraidos === 'string' 
        ? JSON.parse(res.dados_extraidos) 
        : res.dados_extraidos
    }))
  }));

  return dadosFormatados;
}

export async function atualizarCliente(clienteId: string, dados: any) {
  const { data, error } = await supabase
    .from('clientes')
    .update(dados)
    .eq('id', clienteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
