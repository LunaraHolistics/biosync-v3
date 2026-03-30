export type Severidade = '+' | '++' | '+++';

export interface Desequilibrio {
  categoria: string;
  item: string;
  severidade: Severidade;
  impacto_holistico: string;
}

export interface TerapiaSugerida {
  terapia: string;
  evidencias: string[];
  justificativa: string;
  frequencia_sugerida?: string;
}

export interface ProtocoloIntervencao {
  auriculoterapia?: {
    pontos: string[];
    justificativa: string;
    referencia_visual?: string;
  };
  biomagnetismo?: {
    pares: string[];
    justificativa: string;
    referencia_visual?: string;
  };
  reiki?: {
    posicoes: string[];
    simbolos: string[];
    justificativa: string;
  };
  radiestesia?: {
    graficos: string[];
    justificativa: string;
  };
  frequencia_recomendada?: {
    hz: number;
    nome: string;
    url: string;
  };
}

export interface RelatorioAnalise {
  perfil_analise?: 'Performance' | 'Holistico';
  indice_prontidao?: {
    score: number;
    status: string;
    frequencia_sugerida: string;
  };
  marcadores_fadiga?: string[];
  protocolo_intervencao?: ProtocoloIntervencao;
  relatorios_analisados: string[];
  desequilibrios_encontrados: Desequilibrio[];
  plano_terapeutico: TerapiaSugerida[];
}
