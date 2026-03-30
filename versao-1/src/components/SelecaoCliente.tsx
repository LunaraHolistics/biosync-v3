import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, BarChart2, Pencil } from 'lucide-react';
import { useExames } from '../hooks/useExames';
import { ModalEvolucao } from './ModalEvolucao';

export interface Cliente {
  id: string;
  nome: string;
  data_nascimento?: string;
  whatsapp?: string;
  sexo?: 'Masculino' | 'Feminino';
}

interface SelecaoClienteProps {
  onClienteSelecionado: (cliente: Cliente | null) => void;
  clienteSelecionado: Cliente | null;
}

export const SelecaoCliente: React.FC<SelecaoClienteProps> = ({ onClienteSelecionado, clienteSelecionado }) => {
  const [busca, setBusca] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvolucaoOpen, setIsEvolucaoOpen] = useState(false);
  
  const { buscarClientes, cadastrarCliente, atualizarCliente, loading } = useExames();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit states
  const [editNome, setEditNome] = useState('');
  const [editDataNasc, setEditDataNasc] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSexo, setEditSexo] = useState<'Masculino' | 'Feminino'>('Masculino');

  const handleEditClick = () => {
    if (clienteSelecionado) {
      setEditNome(clienteSelecionado.nome);
      setEditDataNasc(clienteSelecionado.data_nascimento || '');
      setEditWhatsapp(clienteSelecionado.whatsapp || '');
      setEditEmail((clienteSelecionado as any).email || '');
      setEditSexo((clienteSelecionado as any).sexo || 'Masculino');
      setIsEditModalOpen(true);
    }
  };

  const handleAtualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelecionado) return;
    
    const dados = { 
      nome: editNome, 
      data_nascimento: editDataNasc, 
      whatsapp: editWhatsapp, 
      email: editEmail, 
      sexo: editSexo 
    };
    
    const data = await atualizarCliente(clienteSelecionado.id, dados);
    
    if (data) {
      onClienteSelecionado(data);
      setIsEditModalOpen(false);
      alert('Dados atualizados com sucesso!');
    } else {
      alert('Erro ao atualizar cliente.');
    }
  };

  // Novo cliente state
  const [novoNome, setNovoNome] = useState('');
  const [novaDataNasc, setNovaDataNasc] = useState('');
  const [novoWhatsapp, setNovoWhatsapp] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoSexo, setNovoSexo] = useState<'Masculino' | 'Feminino'>('Masculino');

  useEffect(() => {
    const fetchClientes = async () => {
      if (busca.length < 2) {
        setClientes([]);
        return;
      }
      const data = await buscarClientes(busca);
      setClientes(data);
    };
    
    const debounce = setTimeout(fetchClientes, 300);
    return () => clearTimeout(debounce);
  }, [busca]);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await cadastrarCliente(novoNome, novaDataNasc, novoWhatsapp, novoEmail, novoSexo);
    
    if (data) {
      onClienteSelecionado(data);
      setIsModalOpen(false);
      setBusca('');
      setNovoNome('');
      setNovaDataNasc('');
      setNovoWhatsapp('');
      setNovoEmail('');
      setNovoSexo('Masculino');
    } else {
      alert('Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
    }
  };

  if (clienteSelecionado) {
    return (
      <>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Cliente Selecionado</p>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{clienteSelecionado.nome}</h3>
              {clienteSelecionado.whatsapp && (
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                  <Phone size={14} /> {clienteSelecionado.whatsapp}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleEditClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2"
            >
              <Pencil size={16} /> Editar
            </button>
            <button 
              onClick={() => setIsEvolucaoOpen(true)}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors px-4 py-2 rounded-lg hover:bg-emerald-50 flex items-center gap-2"
            >
              <BarChart2 size={16} /> Ver Evolução
            </button>
            <button 
              onClick={() => onClienteSelecionado(null)}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
            >
              Trocar Cliente
            </button>
          </div>
        </div>
        <ModalEvolucao 
          isOpen={isEvolucaoOpen}
          onClose={() => setIsEvolucaoOpen(false)}
          clienteId={clienteSelecionado.id}
        />
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Editar Cliente</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={handleAtualizar} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                  <input required type="text" value={editNome} onChange={e => setEditNome(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                  <select value={editSexo} onChange={e => setEditSexo(e.target.value as 'Masculino' | 'Feminino')} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                  <input type="date" value={editDataNasc} onChange={e => setEditDataNasc(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                  <input type="tel" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} placeholder="(11) 99999-9999" className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Cancelar</button>
                  <button type="submit" disabled={loading || !editNome} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50">
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mb-8 relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar cliente por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 text-lg"
        />
      </div>

      {busca.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {clientes.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {clientes.map(cliente => (
                <li 
                  key={cliente.id}
                  onClick={() => {
                    onClienteSelecionado(cliente);
                    setBusca('');
                  }}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{cliente.nome}</p>
                    {cliente.whatsapp && <p className="text-xs text-slate-500">{cliente.whatsapp}</p>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-500">
              Nenhum cliente encontrado.
            </div>
          )}
          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
            >
              <Plus size={18} /> Cadastrar Novo Cliente
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Novo Cliente</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCadastrar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                <input required type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                <select value={novoSexo} onChange={e => setNovoSexo(e.target.value as 'Masculino' | 'Feminino')} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                <input type="date" value={novaDataNasc} onChange={e => setNovaDataNasc(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                <input type="tel" value={novoWhatsapp} onChange={e => setNovoWhatsapp(e.target.value)} placeholder="(11) 99999-9999" className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Cancelar</button>
                <button type="submit" disabled={loading || !novoNome} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
