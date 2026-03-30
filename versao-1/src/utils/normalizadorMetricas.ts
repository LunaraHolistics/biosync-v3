export const mapeamentoMetricas: Record<string, string> = {
  'Gordura no Sangue': 'perfil_lipidico',
  'Colesterol': 'perfil_lipidico',
  'Triglicerídeos': 'perfil_lipidico',
  'Ácido Lático': 'fadiga_muscular',
  'Cortisol': 'estresse_adrenal',
  'DHEA': 'estresse_adrenal',
  'Aminoácidos': 'perfil_aminoacidos',
  'Água Corporal': 'hidratacao',
  'Força Muscular': 'performance_fisica',
  'Reumatismo Leve': 'inflamacao_articular'
};

export const normalizarMetrica = (nome: string): string => {
  return mapeamentoMetricas[nome] || nome.toLowerCase().replace(/\s+/g, '_');
};
