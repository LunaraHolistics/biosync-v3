export interface ProtocoloReiki {
  nome: string;
  posicoes: string[];
  simbolos: string[];
  descricao: string;
  beneficios: string;
  indicacoes: string;
}

export interface SimboloReiki {
  nome: string;
  mantra: string;
  significado: string;
  uso: string;
}

export const PROTOCOLOS_REIKI: ProtocoloReiki[] = [
  {
    nome: "Harmonização Mental",
    posicoes: ["Olhos", "Têmporas", "Occipital"],
    simbolos: ["Cho Ku Rei", "Sei He Ki"],
    descricao: "Foco no equilíbrio dos hemisférios cerebrais e clareza mental.",
    beneficios: "Alivia estresse, sinusite, problemas de visão e traz clareza mental.",
    indicacoes: "Ansiedade, insônia, confusão mental, dores de cabeça."
  },
  {
    nome: "Equilíbrio Emocional",
    posicoes: ["Timo", "Plexo Solar"],
    simbolos: ["Sei He Ki"],
    descricao: "Trabalha o chakra cardíaco e o plexo solar para liberação de emoções represadas.",
    beneficios: "Fortalece o sistema imunológico, libera traumas emocionais e promove o amor próprio.",
    indicacoes: "Tristeza, angústia, baixa autoestima, problemas digestivos de fundo emocional."
  },
  {
    nome: "Vitalidade e Aterramento",
    posicoes: ["Baixo Ventre", "Rins", "Pés"],
    simbolos: ["Cho Ku Rei"],
    descricao: "Foco na energia vital e conexão com a terra.",
    beneficios: "Equilibra a energia vital, ajuda em problemas reprodutivos e traz aterramento.",
    indicacoes: "Cansaço físico, falta de ânimo, insegurança, problemas renais."
  }
];

export const SIMBOLOS_REIKI: SimboloReiki[] = [
  {
    nome: "Cho Ku Rei",
    mantra: "Cho Ku Rei",
    significado: "O Poder do Universo está aqui",
    uso: "Foco de energia, proteção, limpeza de ambientes e potencialização do tratamento."
  },
  {
    nome: "Sei He Ki",
    mantra: "Sei He Ki",
    significado: "Deus e o Homem tornam-se um só",
    uso: "Cura emocional e mental, purificação, equilíbrio e liberação de vícios."
  },
  {
    nome: "Hon Sha Ze Sho Nen",
    mantra: "Hon Sha Ze Sho Nen",
    significado: "Nem passado, nem presente, nem futuro",
    uso: "Cura à distância, conexão com o registro akáshico e cura de traumas passados."
  }
];
