export interface Cliente {
  id: string;
  nome: string;
  data_nascimento: string; // YYYY-MM-DD
  whatsapp: string;
  email: string;
  sexo: 'Masculino' | 'Feminino';
  created_at: string;
}

export interface Analise {
  id: string;
  cliente_id: string;
  status: 'processando' | 'concluida' | 'erro';
  arquivo_url?: string;
  pdf_final_url?: string;
  tipo_cliente?: string;
  feedback_treino?: string;
  sintese_vibracional?: string;
  created_at: string;
}

export interface ResultadoBioressonancia {
  id: string;
  analise_id: string;
  cliente_id?: string;
  categoria_relatorio: string;
  dados_extraidos: DadosExtraidos;
  created_at: string;
}

export interface PlanoTerapeutico {
  id: string;
  analise_id: string;
  cliente_id: string;
  sugestoes_terapias: SugestaoTerapia[];
  sintese_final: string;
  recomendacoes_editaveis: string;
  pdf_url?: string;
  created_at: string;
}

export interface DadosExtraidos {
  bioScore: number;
  perfil: string;
  fadiga: boolean;
  metabolismo: {
    dificuldade_emagrecimento: string;
    tendencia_ganho_peso: string;
    eficiencia_metabolica: string;
  };
  energia: {
    nivel_energia: string;
    causa_cansaco: string;
  };
  inflamacao: {
    nivel_inflamacao: string;
    origem_dores: string;
  };
  sono: {
    qualidade_sono: string;
    profundidade_sono: string;
  };
  emocional: {
    nivel_estresse: string;
    padrao_emocional: string;
  };
  performance: {
    potencial_hipertrofia: string;
    qualidade_recuperacao: string;
    eficiencia_digestiva: string;
    dica_treino: string;
  };
  sintese_final: string;
  feedback_treino?: string;
  desequilibrios: Desequilibrio[];
}

export interface Desequilibrio {
  sistema: string;
  severidade: 'Baixa' | 'Média' | 'Alta';
  descricao: string;
}

export interface SugestaoTerapia {
  tipo: string;
  nome?: string;
  descricao: string; // O Porquê
  resultado_esperado?: string;
  importancia?: string;
  pontos?: string[];
  frequencia?: string;
  protocolo_detalhado?: string;
}

export interface ProtocoloBiomagnetismo {
  ponto1: string;
  ponto2: string;
  patogeno: string;
  sintomas: string[];
}
