
export const salvarRelatorioCache = (clienteId: string, relatorio: any) => {
  const cache = JSON.parse(localStorage.getItem('bioSyncCache') || '[]');
  const novoCache = [
    { clienteId, relatorio, timestamp: new Date().toISOString() },
    ...cache.filter((item: any) => item.clienteId !== clienteId)
  ].slice(0, 10);
  localStorage.setItem('bioSyncCache', JSON.stringify(novoCache));
};

export const buscarRelatorioCache = (clienteId: string) => {
  const cache = JSON.parse(localStorage.getItem('bioSyncCache') || '[]');
  return cache.find((item: any) => item.clienteId === clienteId);
};
