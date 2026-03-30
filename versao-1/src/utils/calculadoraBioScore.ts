export interface Metrica {
  valor: number;
  status: 'Verde' | 'Amarelo' | 'Vermelho';
}

export const calcularBioScore = (metricas: Record<string, Metrica>, idade?: number): number => {
  const items = Object.values(metricas);
  if (items.length === 0) return 0;
  
  let totalPontos = 0;
  items.forEach(item => {
    if (item.status === 'Verde') totalPontos += 100;
    else if (item.status === 'Amarelo') totalPontos += 50;
  });
  
  let score = Math.round(totalPontos / items.length);

  // Ajuste de Vitalidade: Pessoas acima de 60 anos recebem um pequeno bônus de resiliência se o score for bom
  if (idade && idade >= 60 && score >= 70) {
    score = Math.min(100, score + 5);
  }
  
  return score;
};
