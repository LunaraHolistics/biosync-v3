import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Cliente, Analise, ResultadoBioressonancia, PlanoTerapeutico } from '../types';

export const firebaseService = {
  async getClientes(): Promise<Cliente[]> {
    if (!auth.currentUser) return [];
    const q = query(collection(db, 'clientes'), where('uid', '==', auth.currentUser.uid), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente));
  },

  async getCliente(id: string): Promise<Cliente | null> {
    const docRef = doc(db, 'clientes', id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Cliente : null;
  },

  async addCliente(cliente: Omit<Cliente, 'id' | 'created_at'>): Promise<Cliente> {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const newCliente = {
      ...cliente,
      uid: auth.currentUser.uid,
      created_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'clientes'), newCliente);
    return { id: docRef.id, ...newCliente } as Cliente;
  },

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<void> {
    const docRef = doc(db, 'clientes', id);
    await updateDoc(docRef, cliente);
  },

  async getAnalises(clienteId: string): Promise<Analise[]> {
    if (!auth.currentUser) return [];
    const q = query(collection(db, 'analises'), where('cliente_id', '==', clienteId), where('uid', '==', auth.currentUser.uid), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Analise));
  },

  async addAnalise(analise: Omit<Analise, 'id' | 'created_at'>): Promise<Analise> {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const newAnalise = {
      ...analise,
      uid: auth.currentUser.uid,
      created_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'analises'), newAnalise);
    return { id: docRef.id, ...newAnalise } as Analise;
  },

  async updateAnalise(id: string, analise: Partial<Analise>): Promise<void> {
    const docRef = doc(db, 'analises', id);
    await updateDoc(docRef, analise);
  },

  async addResultado(resultado: Omit<ResultadoBioressonancia, 'id' | 'created_at'>): Promise<ResultadoBioressonancia> {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const newResultado = {
      ...resultado,
      dados_extraidos: JSON.stringify(resultado.dados_extraidos),
      uid: auth.currentUser.uid,
      created_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'resultados_bioressonancia'), newResultado);
    return { id: docRef.id, ...newResultado, dados_extraidos: resultado.dados_extraidos } as ResultadoBioressonancia;
  },

  async getResultado(analiseId: string): Promise<ResultadoBioressonancia | null> {
    if (!auth.currentUser) return null;
    const q = query(collection(db, 'resultados_bioressonancia'), where('analise_id', '==', analiseId), where('uid', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      dados_extraidos: JSON.parse(data.dados_extraidos)
    } as ResultadoBioressonancia;
  },

  async getResultadosPorCliente(clienteId: string): Promise<ResultadoBioressonancia[]> {
    if (!auth.currentUser) return [];
    const q = query(collection(db, 'resultados_bioressonancia'), where('cliente_id', '==', clienteId), where('uid', '==', auth.currentUser.uid), orderBy('created_at', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dados_extraidos: JSON.parse(data.dados_extraidos)
      } as ResultadoBioressonancia;
    });
  },

  async getHistoricoEvolucao(clienteId: string): Promise<ResultadoBioressonancia[]> {
    if (!auth.currentUser) return [];
    const q = query(
      collection(db, 'resultados_bioressonancia'), 
      where('cliente_id', '==', clienteId), 
      where('uid', '==', auth.currentUser.uid), 
      orderBy('created_at', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dados_extraidos: typeof data.dados_extraidos === 'string' ? JSON.parse(data.dados_extraidos) : data.dados_extraidos
      } as ResultadoBioressonancia;
    });
  },

  async addPlano(plano: Omit<PlanoTerapeutico, 'id' | 'created_at'>): Promise<PlanoTerapeutico> {
    if (!auth.currentUser) throw new Error('Not authenticated');
    const newPlano = {
      ...plano,
      sugestoes_terapias: JSON.stringify(plano.sugestoes_terapias),
      uid: auth.currentUser.uid,
      created_at: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'planos_terapeuticos'), newPlano);
    return { id: docRef.id, ...newPlano, sugestoes_terapias: plano.sugestoes_terapias } as PlanoTerapeutico;
  },

  async getPlano(analiseId: string): Promise<PlanoTerapeutico | null> {
    if (!auth.currentUser) return null;
    const q = query(collection(db, 'planos_terapeuticos'), where('analise_id', '==', analiseId), where('uid', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      sugestoes_terapias: JSON.parse(data.sugestoes_terapias)
    } as PlanoTerapeutico;
  }
};
