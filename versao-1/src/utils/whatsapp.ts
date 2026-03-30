export const enviarRelatorioWhatsApp = (nome: string, telefone: string, analiseId: string) => {
  // A URL deve apontar para onde o seu app está hospedado (ex: Vercel ou Netlify)
  // Assumindo que o domínio base é o da aplicação atual
  const urlRelatorio = `${window.location.origin}/relatorio/${analiseId}`;
  
  const mensagem = window.encodeURIComponent(
    `Olá, ${nome}! ✨\n\nAqui está o seu Plano de Harmonização Holística personalizado, elaborado com base na sua análise de bioressonância.\n\nVocê pode conferir as recomendações aqui: ${urlRelatorio}\n\nGratidão, Celso Luiz.`
  );

  window.open(`https://api.whatsapp.com/send?phone=${telefone}&text=${mensagem}`, '_blank');
};
