import React from 'react';
import { Magnet, Ear, Sparkles } from 'lucide-react';

export type TerapiaType = 'biomagnetismo' | 'auriculo' | 'reiki';

interface TerapiaSelectorProps {
  selected: TerapiaType;
  onSelect: (type: TerapiaType) => void;
}

export const TerapiaSelector: React.FC<TerapiaSelectorProps> = ({ selected, onSelect }) => {
  const options = [
    { id: 'biomagnetismo', label: 'Biomagnetismo', icon: Magnet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'auriculo', label: 'Auriculoterapia', icon: Ear, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'reiki', label: 'Reiki Usui', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
  ] as const;

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selected === opt.id;
        
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
              ${isSelected 
                ? `${opt.bg} ${opt.color} border-current shadow-sm scale-105` 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
            `}
          >
            <Icon size={18} />
            <span className="font-medium">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
