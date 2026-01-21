
"use client";

import React from 'react';
import { TinyDebugger } from '../../../components/admin/tiny-debugger.tsx';
import { Terminal, ShieldCheck, Bug } from 'lucide-react';

export default function DebugPage() {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide h-full bg-stone-50">
      <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-olie-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Bug size={20} />
           </div>
           <div>
              <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Tiny Debug Lab</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Environment: Sandbox / Diagnostic</span>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-stone-500">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Internal Validation Only</span>
           </div>
        </div>
      </header>

      <div className="p-12 max-w-5xl mx-auto w-full space-y-12 pb-32">
        <section className="space-y-4">
           <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
              <Terminal size={18} className="text-stone-400" />
              <h3 className="text-xl font-serif italic text-stone-800">The Tiny Lab</h3>
           </div>
           <p className="text-xs text-stone-500 font-medium leading-relaxed">
             Este ambiente permite disparar requisições reais para as rotas de API do OlieHub que fazem a ponte com o Tiny ERP. 
             Use para validar se o Token e o ID do Parceiro estão configurados corretamente nas variáveis de ambiente.
           </p>
        </section>

        <TinyDebugger />
      </div>
    </main>
  );
}
