
"use client";

import React, { useState } from 'react';
import { X, GitMerge, ChevronRight, Hammer, Scissors, Zap, Sparkles, Package } from 'lucide-react';
import { SyncService } from '../../services/api.ts';

const OLIE_STAGES = [
  { id: 'corte', label: 'Corte', icon: <Scissors size={14}/> },
  { id: 'costura', label: 'Costura', icon: <Zap size={14}/> },
  { id: 'montagem', label: 'Montagem', icon: <Hammer size={14}/> },
  { id: 'acabamento', label: 'Acabamento', icon: <Sparkles size={14}/> },
  { id: 'pronto', label: 'Pronto', icon: <Package size={14}/> }
];

const TINY_STATUSES = [
  'Aberto', 'Aguardando', 'Aprovado', 'Preparação', 'Produção', 'Faturado', 'Enviado', 'Finalizado'
];

export const StatusMapperModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [mappings, setMappings] = useState(SyncService.getStatusMappings());

  const handleUpdate = (tiny: string, olie: string) => {
    SyncService.updateStatusMapping(tiny, olie);
    setMappings({ ...mappings, [tiny.toLowerCase()]: olie });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl flex flex-col h-[700px] overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="p-10 border-b border-stone-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-olie-50 flex items-center justify-center text-olie-500">
                 <GitMerge size={20} />
              </div>
              <div>
                 <h2 className="text-2xl font-serif italic text-olie-900">Mapeamento de Fluxo</h2>
                 <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Defina como os status do Tiny impactam a produção</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
              <X size={20} />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
           {TINY_STATUSES.map(tiny => (
             <div key={tiny} className="flex items-center gap-6 p-4 rounded-3xl border border-stone-50 bg-stone-50/20 group hover:bg-white transition-all">
                <div className="w-32">
                   <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tiny Status</span>
                   <p className="text-sm font-bold text-stone-800">{tiny}</p>
                </div>
                
                <ChevronRight size={16} className="text-stone-200" />

                <div className="flex-1 grid grid-cols-5 gap-2">
                   {OLIE_STAGES.map(stage => (
                     <button
                        key={stage.id}
                        onClick={() => handleUpdate(tiny, stage.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${
                          mappings[tiny.toLowerCase()] === stage.id 
                            ? 'bg-olie-900 border-olie-900 text-white shadow-md' 
                            : 'bg-white border-stone-100 text-stone-300 hover:border-stone-300'
                        }`}
                     >
                        {stage.icon}
                        <span className="text-[7px] font-black uppercase tracking-widest">{stage.label}</span>
                     </button>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
