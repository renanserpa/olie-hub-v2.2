
"use client";

import React from 'react';
import { TinyDebugger } from '../../../components/admin/tiny-debugger.tsx';
import { EnvStatus } from '../../../components/admin/env-status.tsx';
import { Terminal, ShieldCheck, Bug, Server } from 'lucide-react';

export default function DebugPage() {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide h-full bg-stone-50">
      <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-olie-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Bug size={20} />
           </div>
           <div>
              <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Diagnostic Lab</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Environment: Production / Secure Mode</span>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-stone-500">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Security Audit Level 3</span>
           </div>
        </div>
      </header>

      <div className="p-12 max-w-5xl mx-auto w-full space-y-12 pb-32">
        <section className="space-y-6">
           <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
              <Server size={18} className="text-stone-400" />
              <h3 className="text-xl font-serif italic text-stone-800">Infraestrutura Cloud</h3>
           </div>
           <EnvStatus />
        </section>

        <section className="space-y-6">
           <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
              <Terminal size={18} className="text-stone-400" />
              <h3 className="text-xl font-serif italic text-stone-800">ERP & Integration Bridge</h3>
           </div>
           <TinyDebugger />
        </section>
      </div>
    </main>
  );
}
