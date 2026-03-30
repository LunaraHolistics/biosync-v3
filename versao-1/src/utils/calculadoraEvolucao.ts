export const calcularBioScore = (metricas: Record<string, number>): number => {
  // Define os marcadores que devem subir e os que devem descer
  const marcadoresSubir = ['Aminoácidos', 'Colágeno', 'Elasticidade Vascular'];
  const marcadoresDescer = ['Resistência Vascular', 'Cristal de Colesterol', 'Stress Adrenal'];

  let pontos = 0;
  let total = Object.keys(metricas).length;

  Object.entries(metricas).forEach(([nome, valor]) => {
    // Lógica simples: faixa normal considerada entre 0.4 e 0.6
    if (valor >= 0.4 && valor <= 0.6) {
      pontos += 1;
    }
  });

  return Math.round((pontos / total) * 100);
};

export const calcularVariacao = (nome: string, valorA: number, valorB: number) => {
  const marcadoresSubir = ['Aminoácidos', 'Colágeno', 'Elasticidade Vascular'];
  const variacao = ((valorB - valorA) / valorA) * 100;
  
  const ehPositivo = marcadoresSubir.includes(nome) 
    ? valorB > valorA 
    : valorB < valorA;

  return {
    variacao: Math.abs(variacao),
    ehPositivo
  };
};
