import React from 'react';
import { Dashboard } from './components/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      <Dashboard />
    </div>
  );
}
