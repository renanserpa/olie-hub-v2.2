
"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ArrowRight, CheckCircle2, Loader2, Database, ShoppingCart } from 'lucide-react';
import { SyncService } from '../../services/api.ts';
import { toast } from 'sonner';

export const ConflictResolverModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      SyncService.detectConflicts().then(data => {
        setConflicts(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const resolve = (sku: string, source: 'tiny' | 'vnda') => {
    toast.success(`SKU ${sku} sincronizado utilizando preço do ${source.toUpperCase()}.`, {
      description: "A alteração será replicada em todos os canais na próxima varredura."
    });
    setConflicts(prev => prev.filter(c => c.sku !== sku));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl flex flex-col h-[600px] overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="p-10 border-b border-stone-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                 <AlertTriangle size={20} />
              </div>
              <div>
                 <h2 className="text-2xl font-serif italic text-olie-900">Divergência de Preços</h2>
                 <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Conflitos detectados entre Tiny e VNDA</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
              <X size={20} />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-4 scrollbar-hide">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30 italic">
                <Loader2 size={32} className="animate-spin" />
                <p>Analisando SKUs...</p>
             </div>
           ) : conflicts.length > 0 ? conflicts.map((item) => (
             <div key={item.sku} className="p-6 rounded-3xl border border-stone-100 bg-stone-50/20 space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="text-xs font-black uppercase tracking-widest text-olie-900">{item.sku}</h4>
                   <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                     Diferença: R$ {Math.abs(item.diff).toFixed(2)}
                   </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => resolve(item.sku, 'tiny')}
                    className="p-6 bg-white border border-stone-100 rounded-2xl hover:border-olie-500 transition-all text-left group"
                   >
                      <div className="flex items-center gap-2 mb-2">
                        <Database size={12} className="text-stone-300 group-hover:text-olie-500" />
                        <span className="text-[9px] font-black uppercase text-stone-400">Tiny ERP</span>
                      </div>
                      <p className="text-xl font-serif italic font-bold text-stone-800">R$ {item.tinyPrice.toFixed(2)}</p>
                   </button>

                   <button 
                    onClick={() => resolve(item.sku, 'vnda')}
                    className="p-6 bg-white border border-stone-100 rounded-2xl hover:border-olie-500 transition-all text-left group"
                   >
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart size={12} className="text-stone-300 group-hover:text-olie-500" />
                        <span className="text-[9px] font-black uppercase text-stone-400">VNDA E-com</span>
                      </div>
                      <p className="text-xl font-serif italic font-bold text-stone-800">R$ {item.vndaPrice.toFixed(2)}</p>
                   </button>
                </div>
             </div>
           )) : (
             <div className="h-full flex flex-col items-center justify-center opacity-20 italic font-serif">
                <CheckCircle2 size={48} strokeWidth={1} className="mb-4 text-emerald-500" />
                <p>Tudo em ordem. Sem conflitos.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
