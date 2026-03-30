export interface FrequenciaSolfeggio {
  hz: number;
  nome: string;
  beneficio: string;
  url: string;
  categoria: 'fisico' | 'emocional' | 'espiritual';
}

export const FREQUENCIAS_SOLFEGGIO: Record<number, FrequenciaSolfeggio> = {
  174: {
    hz: 174,
    nome: "Fundação",
    beneficio: "Redução de dor física e estresse.",
    url: "https://www.youtube.com/watch?v=gwyS151shn0",
    categoria: 'fisico'
  },
  285: {
    hz: 285,
    nome: "Cognição Quântica",
    beneficio: "Cura de tecidos e órgãos, rejuvenescimento celular.",
    url: "https://www.youtube.com/watch?v=W6McF77_I_E",
    categoria: 'fisico'
  },
  396: {
    hz: 396,
    nome: "Liberação de Medo",
    beneficio: "Liberação de culpa, medo e ansiedade.",
    url: "https://www.youtube.com/watch?v=IJUu-xiJPX8",
    categoria: 'emocional'
  },
  417: {
    hz: 417,
    nome: "Facilitação de Mudança",
    beneficio: "Limpeza de experiências traumáticas e facilitação de mudanças positivas.",
    url: "https://www.youtube.com/watch?v=7ftMa2R6JYA",
    categoria: 'emocional'
  },
  528: {
    hz: 528,
    nome: "Milagre / Reparo de DNA",
    beneficio: "Reparação de DNA, transformação e milagres.",
    url: "https://www.youtube.com/watch?v=hdmvMc7TZn0",
    categoria: 'espiritual'
  },
  639: {
    hz: 639,
    nome: "Conexão / Relacionamentos",
    beneficio: "Harmonização de relacionamentos e conexão interpessoal.",
    url: "https://www.youtube.com/watch?v=CLuEyPv27Gg",
    categoria: 'emocional'
  },
  741: {
    hz: 741,
    nome: "Despertar da Intuição",
    beneficio: "Limpeza de toxinas e despertar da intuição.",
    url: "https://www.youtube.com/watch?v=gBIfL2fS-Sg",
    categoria: 'espiritual'
  },
  852: {
    hz: 852,
    nome: "Retorno à Ordem Espiritual",
    beneficio: "Despertar da consciência espiritual e intuição profunda.",
    url: "https://www.youtube.com/watch?v=3h2mJnvRbZ8",
    categoria: 'espiritual'
  },
  963: {
    hz: 963,
    nome: "Frequência de Deus / Ativação Pineal",
    beneficio: "Conexão com a fonte divina e ativação da glândula pineal.",
    url: "https://www.youtube.com/watch?v=v_fV_X_7x7I",
    categoria: 'espiritual'
  }
};
