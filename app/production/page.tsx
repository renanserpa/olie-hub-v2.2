
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Hammer, Scissors, Zap, Sparkles, Package, RefreshCcw, 
  Database, AlertCircle, Search, ChevronRight, Clock, Box,
  ArrowUpRight
} from 'lucide-react';
import { ProductionStage, Order } from '../../types/index.ts';
import { PRODUCTION_STAGES_CONFIG } from '../../lib/constants.ts';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { fetchWithTimeout } from '../../utils/api-check.ts';
import { getStageFromTinyStatus } from '../../utils/tiny-mapping.ts';

export default function ProductionPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { searchTerm } = useSearch();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout('/api/orders/list', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        const rawOrders = Array.isArray(result.data) ? result.data : [];
        const hydratedOrders = rawOrders.map((o: any) => ({
          ...o,
          tiny_status_name: o.status,
          tiny_id_display: o.id
        }));

        setOrders(hydratedOrders);
        setLastSync(new Date().toLocaleTimeString());
      } else {
        setError(result.details || result.error || "Erro ao carregar dados do ERP.");
      }
    } catch (err: any) {
      console.error("Production Load Failure:", err);
      setError(err.message || "Falha na conexão com o gateway local.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupedOrders = useMemo(() => {
    const groups: Record<ProductionStage, Order[]> = {
      corte: [],
      costura: [],
      montagem: [],
      acabamento: [],
      pronto: []
    };

    const filtered = (orders || []).filter(o => 
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(o.id).includes(searchTerm) ||
      o.product?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(order => {
      const stage = getStageFromTinyStatus(order.status);
      groups[stage].push(order);
    });

    return groups;
  }, [orders, searchTerm]);

  const stages: ProductionStage[] = ['corte', 'costura', 'montagem', 'acabamento', 'pronto'];

  if (loading && orders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
           <p className="font-serif italic text-stone-400 text-lg">Sincronizando bancadas com o ERP...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50">
      <header className="h-24 px-12 flex items-center justify-between shrink-0 bg-white border-b border-stone-100 z-50">
        <div className="flex items-center gap-10">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 block mb-1">Workshop Floor</span>
            <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Controle de Produção</h1>
          </div>
          <div className="hidden lg:flex items-center gap-6 pl-10 border-l border-stone-100">
             <div className="flex items-center gap-2">
                <Database size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-stone-600">Tiny Gateway Ativo</span>
             </div>
             {lastSync && (
               <div className="flex items-center gap-2 text-stone-300">
                  <Clock size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Última Atualização: {lastSync}</span>
               </div>
             )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-olie-500 transition-colors" size={16} />
            <div className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-black uppercase text-stone-400 tracking-widest min-w-64">
              {searchTerm || 'Filtro Global Ativo'}
            </div>
          </div>
          <button 
            onClick={loadData} 
            disabled={loading}
            className="h-12 w-12 flex items-center justify-center bg-stone-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-10 scrollbar-hide">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center p-20 text-center">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
                <AlertCircle size={40} />
             </div>
             <h3 className="text-2xl font-serif italic text-olie-900 mb-2">Interface Offline</h3>
             <p className="text-sm text-stone-500 mb-8 max-w-md">O gateway do Tiny ERP não respondeu no tempo esperado. {error}</p>
             <button onClick={loadData} className="olie-button-primary">Reconectar Bancadas</button>
          </div>
        ) : (
          <div className="flex gap-8 h-full min-w-max">
            {stages.map((stage) => {
              const stageConfig = PRODUCTION_STAGES_CONFIG[stage];
              const stageItems = groupedOrders[stage];
              
              return (
                <div key={stage} className="w-[340px] flex flex-col h-full rounded-[2.5rem] bg-stone-100/30 border border-stone-100/60 overflow-hidden shadow-inner">
                  <div className="p-6 flex items-center justify-between border-b border-stone-100 bg-white/50 backdrop-blur-md">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-lg shadow-sm">{stageConfig.emoji}</div>
                        <div>
                           <h3 className="text-[11px] font-black uppercase tracking-widest text-olie-900">{stageConfig.label}</h3>
                           <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{stageItems.length} Peças</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 p-6 scrollbar-hide">
                    {stageItems.length > 0 ? stageItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white p-6 rounded-[2.2rem] border border-stone-100 shadow-olie-soft hover:shadow-olie-lg transition-all group animate-in fade-in slide-in-from-bottom-2 duration-500"
                      >
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest italic">#{item.tiny_id_display || item.id}</span>
                           <div className="px-2.5 py-1 bg-stone-50 rounded-lg border border-stone-100">
                              <span className="text-[8px] font-black uppercase text-stone-400 tracking-widest">Tiny: {item.tiny_status_name}</span>
                           </div>
                        </div>
                        <h4 className="font-serif italic text-lg text-olie-900 mb-3 group-hover:text-olie-500 transition-colors line-clamp-2 leading-tight">{item.product}</h4>
                        <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-stone-800 truncate max-w-[140px]">{item.name}</span>
                              <span className="text-[8px] text-stone-300 font-medium uppercase tracking-widest">Cliente Olie</span>
                           </div>
                           <button className="w-8 h-8 rounded-full bg-stone-50 text-stone-200 group-hover:bg-olie-500 group-hover:text-white transition-all flex items-center justify-center">
                              <ArrowUpRight size={14} />
                           </button>
                        </div>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-30 py-20 border-2 border-dashed border-stone-200 rounded-[2rem]">
                         <Box size={32} className="mb-4 text-stone-300" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em]">Bancada Vazia</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
