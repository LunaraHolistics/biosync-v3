import { MAPEADOR_SINTOMAS, PROTOCOLOS_AURICULO, PROTOCOLOS_BIOMAGNETISMO, PROTOCOLOS_REIKI, FREQUENCIAS_SOLFEGGIO } from '../data/index';
import { Desequilibrio } from '../types';

export interface ProtocolosSugeridos {
  biomagnetismo: {
    pares: string[];
    justificativa: string;
  };
  auriculoterapia: {
    pontos: string[];
    justificativa: string;
  };
  reiki?: {
    posicoes: string[];
    simbolos: string[];
    justificativa: string;
  };
  frequencia_recomendada?: {
    hz: number;
    nome: string;
    url: string;
  };
}

export function sugerirProtocolos(desequilibrios: Desequilibrio[], perfil: 'Performance' | 'Holistico' = 'Holistico'): ProtocolosSugeridos {
  const paresBiomagnetismo = new Set<string>();
  const pontosAuriculo = new Set<string>();
  const posicoesReiki = new Set<string>();
  const simbolosReiki = new Set<string>();
  
  // Prioritization logic based on severity
  const weightMap: Record<string, number> = {
    '+++': 3, // Red
    '++': 2,  // Yellow
    '+': 1    // Blue/Normal
  };

  let maxSeverity = 0;
  let dominantCategory = '';

  desequilibrios.forEach(desequilibrio => {
    const weight = weightMap[desequilibrio.severidade] || 0;
    if (weight > maxSeverity) {
      maxSeverity = weight;
      dominantCategory = desequilibrio.categoria.toLowerCase();
    }

    if (weight >= 2) {
      // Find keywords mapped to this item, fallback to the item itself
      const keywords = MAPEADOR_SINTOMAS[desequilibrio.item] || [desequilibrio.item];
      
      // Search in Biomagnetism protocols
      PROTOCOLOS_BIOMAGNETISMO.forEach(protocolo => {
        const matches = keywords.some(kw => 
          protocolo.sintomas.toLowerCase().includes(kw.toLowerCase()) ||
          protocolo.patogeno.toLowerCase().includes(kw.toLowerCase())
        );
        if (matches) {
          paresBiomagnetismo.add(`${protocolo.ponto1} - ${protocolo.ponto2}`);
        }
      });

      // Search in Auriculotherapy protocols
      Object.entries(PROTOCOLOS_AURICULO).forEach(([condicao, pontos]) => {
        const matches = keywords.some(kw => condicao.toLowerCase().includes(kw.toLowerCase()));
        if (matches) {
          pontos.forEach(p => pontosAuriculo.add(p));
        }
      });

      // Search in Reiki protocols
      PROTOCOLOS_REIKI.forEach(protocolo => {
        const matches = keywords.some(kw => 
          protocolo.nome.toLowerCase().includes(desequilibrio.item.toLowerCase()) ||
          protocolo.indicacoes.toLowerCase().includes(desequilibrio.item.toLowerCase())
        );
        if (matches) {
          protocolo.posicoes.forEach(p => posicoesReiki.add(p));
          protocolo.simbolos.forEach(s => simbolosReiki.add(s));
        }
      });
    }
  });

  // Frequency suggestion logic
  let suggestedHz = 528; // Default
  if (dominantCategory.includes('muscular') || dominantCategory.includes('ósseo') || dominantCategory.includes('físico')) {
    suggestedHz = 174;
  } else if (dominantCategory.includes('emocional') || dominantCategory.includes('psíquico') || dominantCategory.includes('nervoso')) {
    suggestedHz = 396;
  } else if (dominantCategory.includes('espiritual') || dominantCategory.includes('energético')) {
    suggestedHz = 852;
  }
  const freqInfo = FREQUENCIAS_SOLFEGGIO[suggestedHz];

  const justificativaBio = perfil === 'Performance' 
    ? 'Pares selecionados para otimização de ATP e recuperação tecidual com base nos marcadores críticos.'
    : 'Pares selecionados para harmonização energética e equilíbrio vital com base nos marcadores críticos.';

  const justificativaAuri = perfil === 'Performance'
    ? 'Pontos auriculares focados na regulação metabólica e recuperação sistêmica.'
    : 'Pontos auriculares focados no reequilíbrio energético e modulação do sistema nervoso autônomo.';

  const justificativaReiki = 'Aplicação de Reiki para harmonização dos centros de força e redução do estresse sistêmico.';

  return {
    biomagnetismo: {
      pares: Array.from(paresBiomagnetismo).slice(0, 5),
      justificativa: justificativaBio
    },
    auriculoterapia: {
      pontos: Array.from(pontosAuriculo).slice(0, 5),
      justificativa: justificativaAuri
    },
    reiki: posicoesReiki.size > 0 ? {
      posicoes: Array.from(posicoesReiki).slice(0, 4),
      simbolos: Array.from(simbolosReiki).slice(0, 2),
      justificativa: justificativaReiki
    } : undefined,
    frequencia_recomendada: freqInfo ? {
      hz: freqInfo.hz,
      nome: freqInfo.nome,
      url: freqInfo.url
    } : undefined
  };
}
