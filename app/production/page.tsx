"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Hammer, 
  Scissors, 
  Zap, 
  Sparkles, 
  Package, 
  RefreshCcw, 
  Database, 
  AlertCircle, 
  Search,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ProductionStage } from '../../types/index.ts';
import { PRODUCTION_STAGES_CONFIG } from '../../lib/constants.ts';

/**
 * OlieHub Production Board - Real-time Edition
 * Mapeia o status do Tiny ERP para o fluxo de trabalho artesanal.
 */

// Mapeador de Status Administrativo -> Etapa de Produção
const mapStatusToStage = (status: string): ProductionStage => {
  const s = String(status || '').toLowerCase();
  
  if (s.includes('aberto') || s.includes('aguardando') || s.includes('pendente')) return 'corte';
  if (s.includes('aprovado') || s.includes('preparação')) return 'costura';
  if (s.includes('produção') || s.includes('producao')) return 'montagem';
  if (s.includes('faturado')) return 'acabamento';
  if (s.includes('enviado') || s.includes('finalizado')) return 'pronto';
  
  return 'corte'; // Fallback
};

export default function ProductionPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders/list', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setOrders(result.data || []);
        setLastSync(new Date().toLocaleTimeString());
      } else {
        setError(result.details || result.error || "Erro ao carregar dados do ERP.");
      }
    } catch (err: any) {
      setError("Falha na conexão com o gateway local.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(o.id).includes(searchTerm)
    );
  }, [orders, searchTerm]);

  const stages: ProductionStage[] = ['corte', 'costura', 'montagem', 'acabamento', 'pronto'];

  if (loading && orders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-6 animate-pulse">
           <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
           <p className="font-serif italic text-stone-400 text-lg">Sincronizando bancadas com o Tiny ERP...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9F6]">
      {/* Editorial Header */}
      <header className="h-24 px-12 flex items-center justify-between shrink-0 bg-white border-b border-stone-100 z-50">
        <div className="flex items-center gap-10">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 block mb-1">Workshop Flow</span>
            <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Produção Artesanal</h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 pl-10 border-l border-stone-100">
             <div className="flex items-center gap-2">
                <Database size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-stone-600">Conexão Tiny Ativa</span>
             </div>
             {lastSync && (
               <div className="flex items-center gap-2 text-stone-300">
                  <Clock size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Sinc: {lastSync}</span>
               </div>
             )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-medium focus:ring-4 focus:ring-olie-500/5 outline-none transition-all w-64 shadow-inner"
            />
          </div>
          
          <button 
            onClick={loadData}
            className="h-12 w-12 flex items-center justify-center bg-stone-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
            title="Sincronizar Agora"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Kanban Grid */}
      <div className="flex-1 overflow-x-auto p-10 scrollbar-hide">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center p-20 text-center">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                <AlertCircle size={40} />
             </div>
             <h3 className="text-2xl font-serif italic text-olie-900 mb-2">O fluxo foi interrompido</h3>
             <p className="text-sm text-stone-400 mb-8 max-w-md">{error}</p>
             <button onClick={loadData} className="olie-button-primary">Tentar Reconexão</button>
          </div>
        ) : (
          <div className="flex gap-8 h-full min-w-max">
            {stages.map((stage) => {
              const stageConfig = PRODUCTION_STAGES_CONFIG[stage];
              const stageItems = filteredOrders.filter(o => mapStatusToStage(o.status) === stage);
              
              return (
                <div 
                  key={stage} 
                  className="w-[340px] flex flex-col h-full rounded-[2.5rem] bg-stone-100/30 border border-stone-100 shadow-inner"
                >
                  {/* Column Header */}
                  <div className="p-6 flex items-center justify-between border-b border-stone-100 bg-white/50 backdrop-blur-md rounded-t-[2.5rem]">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-lg shadow-sm">
                           {stageConfig.emoji}
                        </div>
                        <div>
                           <h3 className="text-[11px] font-black uppercase tracking-widest text-olie-900">{stageConfig.label}</h3>
                           <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">{stageItems.length} Pedidos</span>
                        </div>
                     </div>
                     <div className="w-2 h-2 rounded-full bg-stone-200" />
                  </div>

                  {/* Column Items */}
                  <div className="flex-1 overflow-y-auto space-y-4 p-6 scrollbar-hide">
                    {stageItems.map((item, idx) => (
                      <div 
                        key={item.id}
                        className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-olie-lg hover:-translate-y-1 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest italic">#{item.id}</span>
                           <div className="px-2 py-0.5 bg-olie-50 border border-olie-100 rounded-lg">
                              <span className="text-[8px] font-black uppercase text-olie-500">{item.status}</span>
                           </div>
                        </div>
                        
                        <h4 className="font-serif italic text-lg text-olie-900 mb-2 leading-tight group-hover:text-olie-500 transition-colors line-clamp-2">
                           {item.product}
                        </h4>
                        
                        <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center text-[9px] font-serif italic text-stone-400 group-hover:bg-olie-900 group-hover:text-white transition-all">
                                 {item.name?.charAt(0)}
                              </div>
                              <span className="text-[10px] font-bold text-stone-500 truncate max-w-[140px]">{item.name}</span>
                           </div>
                           <ChevronRight size={14} className="text-stone-200 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                    
                    {stageItems.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 border-2 border-dashed border-stone-200 rounded-[2rem]">
                         <Hammer size={32} className="mb-4 text-stone-300" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Bancada Livre</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Status Bar with Debug Aid */}
      <footer className="h-12 bg-white/80 backdrop-blur-md border-t border-stone-100 px-12 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Ponte ERP: Estável</span>
             </div>
             
             {/* Debug Aid: Inspecione o volume de dados se necessário */}
             <details className="cursor-pointer group">
                <summary className="list-none text-[9px] font-black text-stone-300 uppercase tracking-widest hover:text-olie-500 transition-colors">
                   Telemetria de Dados
                </summary>
                <div className="absolute bottom-16 left-12 bg-stone-900 text-stone-400 p-4 rounded-2xl border border-white/5 text-[10px] font-mono shadow-2xl">
                   <p className="text-emerald-400 mb-1">// Diagnostic Output</p>
                   <p>Orders Array: {orders.length} items</p>
                   <p>Status Mapping: {stages.length} columns</p>
                </div>
             </details>
          </div>
          <div className="flex items-center gap-4 text-stone-300 italic text-[10px] font-medium">
             <Sparkles size={12} className="text-olie-500" />
             Ateliê Olie: Arte e Sincronia
          </div>
      </footer>
    </main>
  );
}