
"use client";

import React from 'react';
import { AlertCircle, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { z } from 'zod';

interface DataAlertProps {
  error: z.ZodError | string | null;
  context: string;
}

export const DataAlert: React.FC<DataAlertProps> = ({ error, context }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  if (!error) return null;

  const isZod = error instanceof z.ZodError;

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-[2rem] overflow-hidden animate-in slide-in-from-top-2 duration-500 mb-8">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Falha de Integridade: {context}</p>
            <p className="text-sm font-bold text-rose-900 leading-none mt-1">
              {isZod ? `${error.issues.length} campos fora do padrão detectados.` : error}
            </p>
          </div>
        </div>
        
        {isZod && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-[9px] font-black uppercase text-rose-500 border border-rose-100 hover:bg-rose-100 transition-colors"
          >
            <Terminal size={12} />
            {isOpen ? 'Ocultar Debug' : 'Ver Debug'}
            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {isOpen && isZod && (
        <div className="px-6 pb-6 animate-in fade-in duration-300">
          <div className="bg-stone-900 rounded-2xl p-4 font-mono text-[10px] text-rose-300 overflow-x-auto">
            {error.issues.map((issue, i) => (
              <div key={i} className="mb-1">
                <span className="text-stone-500">[{issue.path.join('.')}]</span> {issue.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
