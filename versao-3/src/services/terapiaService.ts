import { Desequilibrio, SugestaoTerapia } from '../types';

export interface FrequenciaSolfeggio {
  hz: number;
  nome: string;
  beneficio: string;
  url: string;
  categoria: 'fisico' | 'emocional' | 'espiritual';
}

export const FREQUENCIAS_SOLFEGGIO: Record<number, FrequenciaSolfeggio> = {
  174: { hz: 174, nome: "Fundação", beneficio: "Redução de dor física e estresse.", url: "https://www.youtube.com/watch?v=gwyS151shn0", categoria: 'fisico' },
  285: { hz: 285, nome: "Cognição Quântica", beneficio: "Cura de tecidos e órgãos, rejuvenescimento celular.", url: "https://www.youtube.com/watch?v=W6McF77_I_E", categoria: 'fisico' },
  396: { hz: 396, nome: "Liberação de Medo", beneficio: "Liberação de culpa, medo e ansiedade.", url: "https://www.youtube.com/watch?v=IJUu-xiJPX8", categoria: 'emocional' },
  417: { hz: 417, nome: "Facilitação de Mudança", beneficio: "Limpeza de experiências traumáticas e mudanças positivas.", url: "https://www.youtube.com/watch?v=7ftMa2R6JYA", categoria: 'emocional' },
  528: { hz: 528, nome: "Milagre / Reparo de DNA", beneficio: "Reparação de DNA, transformação e milagres.", url: "https://www.youtube.com/watch?v=hdmvMc7TZn0", categoria: 'espiritual' },
  639: { hz: 639, nome: "Conexão / Relacionamentos", beneficio: "Harmonização de relacionamentos e conexão interpessoal.", url: "https://www.youtube.com/watch?v=CLuEyPv27Gg", categoria: 'emocional' },
  741: { hz: 741, nome: "Despertar da Intuição", beneficio: "Limpeza de toxinas e despertar da intuição.", url: "https://www.youtube.com/watch?v=gBIfL2fS-Sg", categoria: 'espiritual' },
  852: { hz: 852, nome: "Retorno à Ordem Espiritual", beneficio: "Despertar da consciência espiritual e intuição profunda.", url: "https://www.youtube.com/watch?v=3h2mJnvRbZ8", categoria: 'espiritual' },
  963: { hz: 963, nome: "Frequência de Deus / Ativação Pineal", beneficio: "Conexão com a fonte divina e ativação da glândula pineal.", url: "https://www.youtube.com/watch?v=v_fV_X_7x7I", categoria: 'espiritual' }
};

const REIKI_PROTOCOLS: Record<string, string> = {
  "abscessos": "Colocar uma gaze ou lenço sobre o local e aplicar Reiki de 15 a 30 minutos, duas vezes ao dia.",
  "acne": "Cabeça 2 e 3, frente e costas 3 e 4.",
  "água": "Aplicar Reiki no recipiente de 10 a 20 minutos.",
  "aids": "Cabeça 2, 3 e 4, frente 1, 2 e 3 e costas 3 e 4.",
  "alcoolismo": "Cabeça 2 e 3, frente 1, 2, 3 e 4 e costas 3.",
  "alergia": "Tratamento completo, duas vezes ao dia.",
  "amígdalas": "Cabeça 4, duas vezes ao dia.",
  "anestesia": "Nunca aplicar Reiki em paciente anestesiado.",
  "angina": "Frente 1 e costas 2, prolongar o tempo.",
  "anorexia": "Tratamento completo.",
  "ansiedade": "Cabeça 1, 2 e 3, frente 2 e 3 e costas 3.",
  "articulações": "De 15 a 30 minutos diretamente sobre a região.",
  "artrite": "Tratamento completo.",
  "asma": "Tratamento completo, tempo adicional na frente 1 e 2.",
  "azia": "Frente 1 e 2.",
  "bexiga": "Frente 4 e costas 4.",
  "bronquite": "Frente 1 e 2, costas 1, 2 e 3.",
  "bulimia": "Cabeça 2 e 3, frente 3 e costas 3.",
  "bursite": "Uma mão no ombro e outra no cotovelo, de 15 a 30 minutos, duas vezes ao dia.",
  "cãibras": "Direto no local por 15 minutos.",
  "calafrios": "Tratamento completo.",
  "câncer": "Cabeça 3 e 4, frente 1 e 3 e costas 3, como complemento à quimioterapia.",
  "cefaleia": "Cabeça 1, 2 e 3, frente 3 e 4.",
  "cérebro": "Cabeça 1, 2 e 3.",
  "cicatriz": "Diretamente no local, de 15 a 30 minutos.",
  "ciúmes": "Cabeça 1, 3 e 4, frente 1 e 3 e costas 3.",
  "cólica": "Uma mão no estômago e outra logo abaixo.",
  "coluna": "Uma mão na base e outra na região cervical, percorrer a coluna com imposições sequenciais de 5 minutos em cada ponto.",
  "coma": "Cabeça 1, 2 e 3, frente 1, 2 e 3 e costas 3.",
  "coração": "Frente 1 e costas 2.",
  "costas": "Frente 4, costas 4 e sobre as dores.",
  "culpa": "Cabeça 1 e 3 e frente 1 e 3.",
  "decepção": "Cabeça 1, 2 e 3 e frente 1 e 3.",
  "desilusão": "Cabeça 1, 2 e 3 e frente 1 e 3.",
  "dentes": "Diretamente sobre o problema.",
  "depressão": "Cabeça 2 e 3, frente 1 e 3 e costas 1, 2 e 3.",
  "desânimo": "Cabeça 2, 3 e 4, frente 1 e 3 e costas 3.",
  "diabetes": "Tratamento completo.",
  "diarreia": "Frente 4 e costas 4.",
  "digestão": "Frente 2, 3 e 4 e costas 3 e 4.",
  "diverticulite": "Frente 3 e 4 e costas 3 e 4.",
  "doenças crônicas": "Tratamento completo diariamente.",
  "dores": "Diretamente sobre a região.",
  "drogas": "Cabeça 2 e 3 e frente 1, 2 e 3.",
  "eczema": "Cabeça 2 e 3, frente 2 e 3, costas 3 e sobre o local.",
  "envelhecimento precoce": "Cabeça 1, 3 e 4 e frente 1.",
  "enxaqueca": "Cabeça 1, 2 e 3 e frente 3 e 4.",
  "esclerose múltipla": "Tratamento completo.",
  "esquizofrenia": "Cabeça 1, 2 e 3, frente 1, 2 e 3 e costas 3.",
  "fadiga": "Cabeça 1, 3 e 4, frente 1 e 3 e costas 3.",
  "febre": "Cabeça 3 e 4 e costas 3.",
  "feridas": "Diretamente no local (usar como gaze).",
  "ferroadas": "Diretamente sobre a região.",
  "fígado": "Frente 2 e 3 e costas 3.",
  "fobias": "Cabeça 1, 2, 3 e 4, frente 1 e 3 e costas 3.",
  "fraturas": "Diretamente no local após engessar.",
  "fumar": "Tratamento completo.",
  "garganta": "Cabeça 4.",
  "glândulas salivares": "Cabeça 4.",
  "glaucoma": "Cabeça 1, 2 e 3.",
  "gota": "Cabeça 2 e 3, frente 2 e 3 e costas 3.",
  "gravidez": "Cabeça 2 e 3, frente 1, 2, 3 e 4 e costas 3 e 4.",
  "gripe": "Tratamento completo.",
  "hemorróidas": "Frente 4 e costas 4.",
  "hepatite": "Tratamento completo.",
  "herpes": "Direto sobre a região afetada.",
  "hipertensão": "Cabeça 2, 3 e 4, frente 2 e 3 e costas 3 e 4.",
  "impaciência": "Cabeça 2 e 3 e frente 1.",
  "impotência": "Cabeça 2 e 3, frente 3 e 4 e costas 3.",
  "indigestão": "Frente 1, 2 e 3.",
  "infecções": "Cabeça 2, frente 2 e 3, costas 3 e aplicação na região afetada.",
  "insônia": "Cabeça 2 e 3.",
  "joanetes": "Diretamente no local.",
  "joelhos": "Diretamente na região.",
  "laringe": "Cabeça 4.",
  "leucemia": "Tratamento completo, duas vezes ao dia.",
  "lúpus": "Tratamento completo, duas vezes ao dia.",
  "mágoa": "Cabeça 4, frente 1 e 3 e costas 3.",
  "alzheimer": "Cabeça 1, 2 e 3.",
  "malária": "Tratamento completo, duas vezes ao dia.",
  "mandíbula": "Direto na área afetada.",
  "memória": "Cabeça 1, 2 e 3.",
  "músculos": "Diretamente sobre a região.",
  "menopausa": "Tratamento completo para equilibrar o sistema endócrino.",
  "nariz": "Diretamente sobre a região.",
  "náusea": "Cabeça 2 e 3, frente 1 e costas 3.",
  "nervosismo": "Cabeça 2 e 3, frente 3 e costas 3.",
  "nervo ciático": "Uma mão no glúteo e a outra percorrendo a perna com 5 minutos por ponto.",
  "neurose": "Cabeça 1, 2 e 3, frente 3 e costas 3.",
  "obesidade": "Cabeça 1, 3 e 4, frente 2 e 3 e costas 3.",
  "olhos": "Cabeça 1, 2 e 3.",
  "ouvidos": "Direto sobre a região, com dedo médio levemente no canal auditivo.",
  "ovários": "Frente 4.",
  "pâncreas": "Cabeça 1, 2 e 3, frente 2 e 3 e costas 3 e 4.",
  "pânico": "Cabeça 1, 2 e 3, frente 1 e 3 e costas 3.",
  "paralisia": "Tratamento completo, duas vezes ao dia.",
  "paralisia facial": "Cabeça 4, maçã do rosto, queixo e atrás das orelhas.",
  "paranoia": "Cabeça 4, frente 1 e 3 e costas 3.",
  "parkinson": "Tratamento completo, duas vezes ao dia.",
  "bipolar": "Cabeça 2 e 3, frente 3 e costas 3.",
  "pneumonia": "Tratamento completo, duas vezes ao dia.",
  "pressão alta": "Cabeça 4 e frente 1.",
  "pressão baixa": "Cabeça 4 e frente 1.",
  "punhos": "Diretamente sobre a região.",
  "raiva": "Cabeça 2, 3 e 4 e frente 1 e 3.",
  "rejeição": "Cabeça 2 e 3, frente 1 e costas 3.",
  "ressaca": "Cabeça 1, 2 e 3, frente 2 e 3 e costas 3.",
  "sangramento": "Direto sobre a região.",
  "sangramento nasal": "Polegar abaixo do nariz, indicador acima e outra mão na base da cabeça.",
  "seios": "Diretamente sobre a região.",
  "down": "Tratamento completo.",
  "sinusite": "Direto sobre a região, duas vezes ao dia.",
  "surdez": "Cabeça 4 e sobre o ouvido.",
  "testículos": "Diretamente sobre a região.",
  "timo": "Frente 1.",
  "tireoide": "Cabeça 4.",
  "tontura": "Cabeça 2 e 3, frente 3 e 4 e costas 3.",
  "tosse": "Cabeça 4, frente 1, 2 e 3 e costas 2 e 3.",
  "tumores": "Cabeça 1, 2 e 3, frente 3, costas 3 e sobre a região afetada.",
  "úlcera": "Direto sobre a região, no mínimo duas vezes ao dia.",
  "útero": "Frente 4 e costas 4.",
  "vesícula": "Frente 2 e 3.",
  "vícios": "Cabeça 2 e 3, frente 1, 2 e 3 e costas 1, 2 e 3.",
  "vômitos": "Cabeça 3, frente 1 e 3 e costas 3.",
  "voz": "Cabeça 4 e frente 1"
};

export function sugerirFrequencia(termo: string): FrequenciaSolfeggio {
  const t = termo.toLowerCase();
  if (t.includes('dor') || t.includes('físico') || t.includes('inflamação')) return FREQUENCIAS_SOLFEGGIO[174];
  if (t.includes('tecido') || t.includes('órgão') || t.includes('celular')) return FREQUENCIAS_SOLFEGGIO[285];
  if (t.includes('medo') || t.includes('ansiedade') || t.includes('culpa')) return FREQUENCIAS_SOLFEGGIO[396];
  if (t.includes('trauma') || t.includes('mudança') || t.includes('limpeza')) return FREQUENCIAS_SOLFEGGIO[417];
  if (t.includes('toxina') || t.includes('vírus') || t.includes('bactéria') || t.includes('hepático') || t.includes('imunológico')) return FREQUENCIAS_SOLFEGGIO[741];
  if (t.includes('espiritual') || t.includes('intuição') || t.includes('consciência')) return FREQUENCIAS_SOLFEGGIO[852];
  if (t.includes('pineal') || t.includes('divino')) return FREQUENCIAS_SOLFEGGIO[963];
  return FREQUENCIAS_SOLFEGGIO[528];
}

export function gerarPlanoTerapeutico(desequilibrios: Desequilibrio[]): SugestaoTerapia[] {
  const terapias: SugestaoTerapia[] = [];

  desequilibrios.forEach(d => {
    const desc = d.descricao.toLowerCase();
    const sistema = d.sistema.toLowerCase();
    const freq = sugerirFrequencia(sistema + ' ' + desc);

    // 1. REIKI (Johnny de Carli)
    const reikiKey = Object.keys(REIKI_PROTOCOLS).find(k => desc.includes(k) || sistema.includes(k));
    if (reikiKey || sistema.includes('nervoso') || desc.includes('emocional')) {
      terapias.push({
        tipo: 'Reiki e Alinhamento Energético',
        nome: 'Reiki e Alinhamento Energético',
        descricao: `Atuação em ${d.descricao} para reequilíbrio energético do sistema ${d.sistema}.`,
        resultado_esperado: 'Harmonização emocional e vitalidade.',
        importancia: d.severidade === 'Alta' ? 'Prioridade Máxima' : 'Manutenção',
        protocolo_detalhado: `Posições: ${REIKI_PROTOCOLS[reikiKey || 'ansiedade'] || "Tratamento completo: Cabeça, Frente e Costas."}`,
        frequencia: `${freq.hz}Hz - ${freq.nome}`
      });
    }

    // 2. BIOMAGNETISMO (Sistêmico)
    let bioPairs = '';
    if (sistema.includes('digestivo') || sistema.includes('hepático') || desc.includes('fígado')) bioPairs = 'Fígado / Pâncreas, Duodeno / Fígado, Cárdia / Adrenal.';
    else if (sistema.includes('imunológico') || sistema.includes('linfático') || desc.includes('infecção')) bioPairs = 'Timo / Baço, Apêndice / Timo, Escápula / Escápula.';
    else if (sistema.includes('cardiovascular') || sistema.includes('circulatório')) bioPairs = 'Pericárdio / Pericárdio, Mediastino / Mediastino, Artéria Axilar / Artéria Axilar.';
    else if (sistema.includes('respiratório')) bioPairs = 'Pulmão / Pulmão, Conduto Auditivo / Rim.';
    else if (sistema.includes('nervoso')) bioPairs = 'Parietal / Parietal, Quiasma / Quiasma, Pineal / Bulbo Raquidiano.';
    else if (sistema.includes('osteomuscular') || desc.includes('coluna')) bioPairs = 'Rins / Rins, Nervo Inguinal / Nervo Inguinal, Quadrado Lombar / Quadrado Lombar.';

    if (bioPairs || sistema.includes('patógeno')) {
      terapias.push({
        tipo: 'Biomagnetismo',
        nome: 'Biomagnetismo',
        descricao: `Regulação do pH sistêmico para o sistema ${d.sistema}.`,
        resultado_esperado: 'Neutralização de patógenos e desinflamação.',
        importancia: d.severidade === 'Alta' ? 'Prioridade Máxima' : 'Manutenção',
        protocolo_detalhado: bioPairs || 'Pares: Consultar Guia de Rastreio Completo.',
        frequencia: `${freq.hz}Hz - ${freq.nome}`
      });
    }

    // 3. AURICULOTERAPIA
    if (sistema.includes('endócrino') || sistema.includes('hormonal') || desc.includes('diabetes') || desc.includes('tireoide')) {
      terapias.push({
        tipo: 'Auriculoterapia Neurofisiológica',
        nome: 'Auriculoterapia Neurofisiológica',
        descricao: `Estímulo de pontos reflexos para regulação hormonal do sistema ${d.sistema}.`,
        resultado_esperado: 'Equilíbrio endócrino e redução de sintomas sistêmicos.',
        importancia: 'Manutenção',
        protocolo_detalhado: 'Pontos: Shen Men, Rim, Simpático, Endócrino e Ponto da Fome.',
        frequencia: `${freq.hz}Hz - ${freq.nome}`
      });
    }
  });

  // Deduplicação final mantendo a maior prioridade
  return terapias.reduce((acc, current) => {
    const x = acc.find(item => item.nome === current.nome);
    if (!x) return acc.concat([current]);
    if (current.importancia === 'Prioridade Máxima' && x.importancia !== 'Prioridade Máxima') {
      x.importancia = 'Prioridade Máxima';
    }
    return acc;
  }, [] as SugestaoTerapia[]);
}