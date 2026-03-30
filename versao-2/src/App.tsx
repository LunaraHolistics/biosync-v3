import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import Dashboard from './components/Dashboard';
import TesteIntegracao from './components/TesteIntegracao';

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Validação de API Key no Frontend (VITE_GEMINI_API_KEY)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isKeyMissing = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "AIzaSy...";
  const isKeyInvalid = apiKey && !apiKey.startsWith("AIza");

  if (isKeyMissing || isKeyInvalid) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-2 border-red-200">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-red-900 mb-2 text-center">Configuração de API Pendente</h1>
          <p className="text-red-700 mb-6 text-center text-sm">
            {isKeyMissing 
              ? "A chave VITE_GEMINI_API_KEY não foi encontrada ou é um placeholder." 
              : "A chave VITE_GEMINI_API_KEY parece ter um formato inválido (deve começar com 'AIza')."}
          </p>
          <div className="bg-red-50 p-4 rounded-xl mb-6 text-xs font-mono text-red-800 break-all">
            <strong>Status:</strong> {isKeyMissing ? "AUSENTE" : "INVÁLIDA"}<br/>
            <strong>Valor:</strong> {apiKey ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` : "Nenhum"}<br/>
            <strong>Origem:</strong> import.meta.env.VITE_GEMINI_API_KEY
          </div>
          <div className="space-y-3">
            <p className="text-xs text-neutral-500 text-center">
              Para corrigir, adicione a variável <strong>VITE_GEMINI_API_KEY</strong> no painel de Secrets do AI Studio e faça um novo deploy.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-emerald-50"><p className="text-emerald-800 font-medium">Carregando...</p></div>;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <img src="/favicon.png" alt="BioSync Logo" className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-emerald-900 mb-2">Lunara BioSync</h1>
          <p className="text-emerald-600 mb-8">Análise de Bioressonância Quântica</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-emerald-900 tracking-tight">Lunara BioSync</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/debug" element={<TesteIntegracao />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
