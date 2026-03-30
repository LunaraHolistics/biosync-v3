import { useState } from 'react';
import { Cliente, Analise, ResultadoBioressonancia } from '../types';
import { aiService } from '../services/aiService';
import { firebaseService } from '../services/firebaseService';

export function useExames() {
  const [loading, setLoading] = useState(false);

  const processarExame = async (file: File, cliente: Cliente, feedbackTreino?: string): Promise<{ analise: Analise, resultado: ResultadoBioressonancia }> => {
    setLoading(true);
    try {
      // 1. Converter PDF para Base64
      const base64 = await fileToBase64(file);
      
      // 2. Criar Análise no BD
      const novaAnalise = await firebaseService.addAnalise({
        cliente_id: cliente.id,
        status: 'processando',
        feedback_treino: feedbackTreino
      });

      // 3. Chamar IA
      const idade = calcularIdade(cliente.data_nascimento);
      const historico = await firebaseService.getHistoricoEvolucao(cliente.id);
      const dadosExtraidos = await aiService.processarExame(base64.split(',')[1], cliente.id, cliente.sexo, idade, historico, feedbackTreino);
      
      // Garantir que o feedback_treino seja salvo nos dados extraídos também para o relatório
      dadosExtraidos.feedback_treino = feedbackTreino;

      // 4. Salvar Resultado
      const novoResultado = await firebaseService.addResultado({
        analise_id: novaAnalise.id,
        categoria_relatorio: 'Geral',
        dados_extraidos: dadosExtraidos
      });

      // 5. Atualizar Análise
      await firebaseService.updateAnalise(novaAnalise.id, { status: 'concluida' });

      return { analise: { ...novaAnalise, status: 'concluida' }, resultado: novoResultado };
    } catch (error) {
      console.error('Erro no processamento', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { processarExame, loading };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}
