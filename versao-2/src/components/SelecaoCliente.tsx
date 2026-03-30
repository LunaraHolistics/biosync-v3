import React, { useState, useEffect } from 'react';
import { Cliente } from '../types';
import { firebaseService } from '../services/firebaseService';
import { Search, Plus, User } from 'lucide-react';

interface Props {
  onSelect: (cliente: Cliente) => void;
}

export default function SelecaoCliente({ onSelect }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [novoCliente, setNovoCliente] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    const data = await firebaseService.getClientes();
    setClientes(data);
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.whatsapp.includes(busca)
  );

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-emerald-900">Selecionar Cliente</h2>
        <button 
          onClick={() => setNovoCliente(true)}
          className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-medium hover:bg-emerald-200 transition-colors"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {novoCliente ? (
        <FormNovoCliente onSave={(c) => { setNovoCliente(false); carregarClientes(); onSelect(c); }} onCancel={() => setNovoCliente(false)} />
      ) : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou WhatsApp..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesFiltrados.map(cliente => (
              <div 
                key={cliente.id} 
                onClick={() => onSelect(cliente)}
                className="p-4 border border-neutral-100 rounded-xl hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all flex items-center gap-4 bg-neutral-50 hover:bg-white"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">{cliente.nome}</h3>
                  <p className="text-sm text-neutral-500">{cliente.whatsapp}</p>
                </div>
              </div>
            ))}
            {clientesFiltrados.length === 0 && (
              <div className="col-span-full text-center py-8 text-neutral-500">
                Nenhum cliente encontrado.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function FormNovoCliente({ onSave, onCancel }: { onSave: (c: Cliente) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    whatsapp: '',
    email: '',
    sexo: 'Feminino' as 'Masculino' | 'Feminino'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const novo = await firebaseService.addCliente(formData);
    onSave(novo);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Completo</label>
        <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Data de Nascimento</label>
          <input required type="date" value={formData.data_nascimento} onChange={e => setFormData({...formData, data_nascimento: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Sexo Biológico</label>
          <select value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">WhatsApp</label>
        <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail</label>
        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>
      <div className="flex gap-3 pt-4">
        <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-medium hover:bg-emerald-700">Salvar Cliente</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-neutral-100 text-neutral-700 py-2 rounded-xl font-medium hover:bg-neutral-200">Cancelar</button>
      </div>
    </form>
  );
}
