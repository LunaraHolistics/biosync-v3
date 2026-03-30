export const MAPEADOR_SINTOMAS: Record<string, string[]> = {
  // CARDIOVASCULAR
  "Cristal de colesterol": ["Colesterol", "Obstrução coronária", "Circulação", "Ateromas", "Fígado"],
  "Resistência vascular": ["Hipertensão", "Circulação", "Pressão arterial", "Vago"],
  "Viscosidade do sangue": ["Fígado", "Baço", "Circulação", "Triglicerídeos"],
  "Elasticidade vascular": ["Varizes", "Aneurisma", "Circulação"],
  "Demanda de sangue miocárdico": ["Coração", "Isquemia", "Angina"],
  "Volume de perfusão sanguínea miocárdica": ["Coração", "Circulação", "Oxigenação"],
  "Consumo de oxigênio miocárdico": ["Coração", "Fadiga", "Oxigenação"],

  // ENDÓCRINO / HORMONAL
  "Hormona Estimuladora Folícola(FSH)": ["Hormonal", "Disfunção glandular", "Hipófise", "Sistema endócrino"],
  "Glândula Tiróide": ["Tireoide", "Metabolismo", "Hormonal"],
  "Secreção de Insulina": ["Pâncreas", "Glicemia", "Diabetes"],
  "Secreção de Glucagon": ["Pâncreas", "Glicemia", "Metabolismo"],

  // GASTROINTESTINAL
  "Coeficiente de secreção de pepsina": ["Estômago", "Digestão", "Acidez"],
  "Coeficiente de função de peristaltismo gástrico": ["Estômago", "Digestão", "Motilidade"],
  "Coeficiente de função de absorção gástrica": ["Estômago", "Absorção", "Nutrição"],
  "Coeficiente de função de peristaltismo do intestino delgado": ["Intestino Delgado", "Digestão", "Motilidade"],
  "Coeficiente de função de absorção do intestino delgado": ["Intestino Delgado", "Absorção", "Nutrição"],

  // HEPÁTICO / BILIAR
  "Metabolismo da proteína": ["Fígado", "Metabolismo", "Nutrição"],
  "Função de produção de energia": ["Fígado", "Fadiga", "Energia", "ATP"],
  "Função de desintoxicação": ["Fígado", "Toxinas", "Desintoxicação"],
  "Função de secreção de bílis": ["Vesícula Biliar", "Fígado", "Digestão"],

  // RENAL / PULMONAR
  "Índice de urobilinogênio": ["Rim", "Fígado", "Excreção"],
  "Índice de ácido úrico": ["Rim", "Articulações", "Gota"],
  "Capacidade vital": ["Pulmão", "Respiração", "Oxigenação"],
  "Capacidade pulmonar total": ["Pulmão", "Respiração", "Energia"],

  // ÓSSEO / MUSCULAR
  "Grau de hiperplasia cervical": ["Cervical", "Coluna", "Articulações"],
  "Grau de hiperplasia lombar": ["Lombar", "Coluna", "Articulações"],
  "Coeficiente de osteoporose": ["Ossos", "Cálcio", "Desmineralização"],
  "Reumatismo": ["Articulações", "Inflamação", "Dor"],

  // PSICOEMOCIONAL (Baseado nos Níveis de Consciência do relatório)
  "Raiva": ["Ira", "Fígado", "Vesícula", "Emocional"],
  "Orgulho": ["Soberba", "Ego", "Supra-renais", "Emocional"],
  "Aceitação": ["Paz", "Pineal", "Timo"],
  "Amor": ["Coração", "Timo", "Harmonia", "Empatia"],
  "Medo": ["Rim", "Bexiga", "Insegurança", "Pânico"],
  "Tristeza": ["Pulmão", "Intestino Grosso", "Melancolia", "Depressão"],
  "Apatia": ["Fadiga", "Desânimo", "Baço"],
  "Rim-Rim": ["Rim", "Medo", "Vitalidade"],

  // MERIDIANOS (Acupuntura citada no relatório)
  "Meridiano do Coração": ["Coração", "Pericárdio", "Ansiedade"],
  "Meridiano do Intestino Delgado": ["Intestino Delgado", "Absorção", "Digestivo"],
  "Meridiano do Fígado": ["Fígado", "Raiva", "Desintoxicação"],
  "Meridiano do Pulmão": ["Pulmão", "Tristeza", "Respiração"],
  "Meridiano do Rim": ["Rim", "Medo", "Vitalidade"]
};
