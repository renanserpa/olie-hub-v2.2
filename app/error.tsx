
"use client";

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home, Diamond } from 'lucide-react';

/**
 * Global Error Boundary - OlieHub V2
 * Estética de Luxo aplicada mesmo em falhas críticas.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro em serviço externo ou console em desenvolvimento
    console.error("Critical OlieHub Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF9F6] p-10">
      <div className="max-w-xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-rose-50 rounded-[3rem] flex items-center justify-center text-rose-500 border border-rose-100 shadow-xl shadow-rose-500/10">
            <AlertCircle size={48} strokeWidth={1.5} />
          </div>
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-white rounded-2xl shadow-lg border border-stone-100 flex items-center justify-center">
            <Diamond size={18} className="text-olie-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-serif italic text-olie-900 tracking-tighter">Ops, houve um <br />descompasso.</h1>
          <p className="text-sm text-stone-400 font-medium leading-relaxed italic max-w-sm mx-auto">
            O fluxo artesanal foi interrompido por um erro técnico imprevisto. <br />
            {error.message || "A sincronização cloud foi perdida temporariamente."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={reset}
            className="w-full sm:w-auto h-16 px-10 bg-olie-900 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-stone-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <RefreshCcw size={16} /> Tentar Novamente
          </button>
          
          <button 
            onClick={() => window.location.hash = '/dashboard'}
            className="w-full sm:w-auto h-16 px-10 bg-white border border-stone-100 text-stone-600 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-3"
          >
            <Home size={16} /> Voltar ao Início
          </button>
        </div>

        <div className="pt-8 border-t border-stone-100">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-200">Ref: Error Boundary • Olie Concierge V2.5</p>
        </div>
      </div>
    </div>
  );
}
