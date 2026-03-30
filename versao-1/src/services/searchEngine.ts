import { ProtocoloBiomagnetismo, PROTOCOLOS_BIOMAGNETISMO } from '../data/biomagnetismo';
import { ProtocoloAuriculo, PROTOCOLOS_AURICULO } from '../data/auriculoterapia';
import { ProtocoloReiki, PROTOCOLOS_REIKI, FREQUENCIAS_SOLFEGGIO, FrequenciaSolfeggio } from '../data/index';

export type ResultadoBusca = (ProtocoloBiomagnetismo | ProtocoloAuriculo | ProtocoloReiki) & {
  pesoRelevancia: number;
  frequenciaRecomendada?: FrequenciaSolfeggio;
};

export function sugerirFrequencia(termo: string): FrequenciaSolfeggio {
  const t = termo.toLowerCase();
  
  // Mapeamento básico de categorias para frequências
  if (t.includes('dor') || t.includes('físico') || t.includes('órgão') || t.includes('sangue')) {
    return FREQUENCIAS_SOLFEGGIO[174]; // Físico
  }
  if (t.includes('medo') || t.includes('ansiedade') || t.includes('emocional') || t.includes('trauma')) {
    return FREQUENCIAS_SOLFEGGIO[396]; // Emocional
  }
  if (t.includes('espiritual') || t.includes('intuição') || t.includes('pineal') || t.includes('consciência')) {
    return FREQUENCIAS_SOLFEGGIO[528]; // Espiritual
  }
  
  return FREQUENCIAS_SOLFEGGIO[528]; // Default
}

export function buscarProtocolos(
  area: 'biomagnetismo' | 'auriculo' | 'reiki',
  termo: string
): ResultadoBusca[] {
  if (!termo) return [];
  
  const termoBusca = termo.toLowerCase().trim();
  let resultados: ResultadoBusca[] = [];
  const frequencia = sugerirFrequencia(termoBusca);

  if (area === 'biomagnetismo') {
    resultados = PROTOCOLOS_BIOMAGNETISMO.reduce((acc: ResultadoBusca[], protocolo) => {
      const sintomas = protocolo.sintomas?.toLowerCase() || '';
      const patogeno = protocolo.patogeno?.toLowerCase() || '';
      const ponto1 = protocolo.ponto1?.toLowerCase() || '';
      const ponto2 = protocolo.ponto2?.toLowerCase() || '';
      
      const matchPatogeno = patogeno.includes(termoBusca);
      const matchPonto = ponto1.includes(termoBusca) || ponto2.includes(termoBusca);
      const matchSintomas = sintomas.includes(termoBusca);

      if (matchPatogeno || matchPonto || matchSintomas) {
        let pesoRelevancia = 0;
        if (matchPatogeno || matchPonto) {
          pesoRelevancia = 2; // Maior peso para patógeno ou pontos
        } else if (matchSintomas) {
          pesoRelevancia = 1; // Menor peso para sintomas
        }
        acc.push({
          ...protocolo,
          pesoRelevancia,
          frequenciaRecomendada: frequencia
        });
      }
      return acc;
    }, []);
  } else if (area === 'auriculo') {
    resultados = Object.entries(PROTOCOLOS_AURICULO).reduce((acc: ResultadoBusca[], [condicao, pontos]) => {
      const matchCondicao = condicao.toLowerCase().includes(termoBusca);
      const matchPontos = pontos.some(p => p.toLowerCase().includes(termoBusca));

      if (matchCondicao || matchPontos) {
        let pesoRelevancia = 0;
        if (matchCondicao) {
          pesoRelevancia = 2;
        } else if (matchPontos) {
          pesoRelevancia = 1;
        }
        acc.push({
          ponto: condicao,
          indicacoes: pontos.join(', '),
          localizacao: 'Orelha',
          pesoRelevancia,
          frequenciaRecomendada: frequencia
        } as ResultadoBusca);
      }
      return acc;
    }, []);
  } else if (area === 'reiki') {
    resultados = PROTOCOLOS_REIKI.reduce((acc: ResultadoBusca[], protocolo) => {
      const nome = protocolo.nome.toLowerCase();
      const beneficios = protocolo.beneficios.toLowerCase();
      const descricao = protocolo.descricao.toLowerCase();
      const indicacoes = protocolo.indicacoes.toLowerCase();
      
      const matchNome = nome.includes(termoBusca);
      const matchIndicacoes = indicacoes.includes(termoBusca);
      const matchBeneficios = beneficios.includes(termoBusca);
      const matchDescricao = descricao.includes(termoBusca);

      if (matchNome || matchIndicacoes || matchBeneficios || matchDescricao) {
        let pesoRelevancia = 0;
        if (matchNome || matchIndicacoes) {
          pesoRelevancia = 2;
        } else if (matchBeneficios || matchDescricao) {
          pesoRelevancia = 1;
        }
        acc.push({
          ...protocolo,
          pesoRelevancia,
          frequenciaRecomendada: frequencia
        });
      }
      return acc;
    }, []);
  }

  // Ordena os resultados pelo peso de relevância (maior primeiro)
  return resultados.sort((a, b) => b.pesoRelevancia - a.pesoRelevancia);
}
