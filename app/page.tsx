
"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, Sparkles, Calendar, MessageCircle, Scissors, 
  ChevronRight, BrainCircuit, Loader2, ShoppingBag, Star, 
  Clock, History, Zap, ArrowUpRight, Bell, RefreshCcw
} from 'lucide-react';
import { DashboardService, AIService, SyncService } from '../services/api.ts';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>({ pendingMessages: 0, productionQueue: 0, nextShipment: '...' });
  const [activity, setActivity] = useState<any[]>([]);
  const [aiBriefing, setAiBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ov, ac] = await Promise.all([
        DashboardService.getOverview(),
        DashboardService.getRecentActivity()
      ]);
      setOverview(ov);
      setActivity(ac);
      setLoading(false); // Libera a UI principal imediatamente

      // Briefing AI carrega em background para não travar a página
      setLoadingBriefing(true);
      const briefing = await AIService.getDailyBriefing(ov);
      setAiBriefing(briefing);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setLoading(false);
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFullSync = async () => {
    setIsSyncing(true);
    try {
      await SyncService.syncAll();
      await loadData(true);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const getActivityIcon = (text: string, highlight: string) => {
    const content = (text + highlight).toLowerCase();
    if (content.includes('pedido')) return <ShoppingBag size={18} />;
    if (content.includes('whatsapp')) return <MessageCircle size={18} />;
    return <Zap size={18} />;
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
        <p className="font-serif italic text-stone-300">Conectando ao Workspace...</p>
      </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative h-full bg-stone-50">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-olie-500/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      
      <div className="p-10 md:p-16 max-w-6xl mx-auto w-full space-y-16 relative z-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-700">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-[#EBE8E0] rounded-full shadow-sm w-fit">
               <Sparkles size={12} className="text-olie-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Ateliê Olie • Concierge Ativo</span>
             </div>
             <h1 className="text-6xl md:text-7xl font-serif font-medium text-[#1A1A1A] italic leading-[1.1] tracking-tighter">
               Arte em <br />
               <span className="not-italic text-olie-500">movimento.</span>
             </h1>
          </div>

          <button 
            onClick={handleFullSync}
            disabled={isSyncing}
            className={`h-16 px-8 rounded-3xl flex items-center gap-4 transition-all border font-black uppercase text-[10px] tracking-[0.2em] shadow-xl ${
              isSyncing ? 'bg-stone-100 text-stone-400 border-stone-200' : 'bg-white text-stone-800 border-stone-100 hover:border-olie-500/30'
            }`}
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} className="text-olie-500" />}
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
          </button>
        </header>

        <div className="bg-white border border-[#F2F0EA] rounded-[3rem] p-8 md:p-10 shadow-olie-soft relative overflow-hidden group">
             <div className="absolute -right-8 -bottom-8 text-olie-500/5 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                <BrainCircuit size={180} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-olie-50 flex items-center justify-center shadow-sm">
                      <Sparkles size={16} className="text-olie-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-olie-600">Olie Briefing IA</span>
                </div>
                <div className="max-w-3xl min-h-[60px]">
                   {loadingBriefing ? (
                      <div className="flex items-center gap-3 py-2">
                         <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-olie-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-olie-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-olie-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                         </div>
                         <span className="text-sm font-serif italic text-stone-400">Sincronizando com a inteligência do ateliê...</span>
                      </div>
                   ) : (
                      <p className="text-xl md:text-2xl text-stone-800 font-serif italic leading-relaxed animate-in fade-in duration-700">
                        {aiBriefing || "As bancadas aguardam. Suas peças de luxo estão prontas para ganhar vida hoje."}
                      </p>
                   )}
                </div>
             </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div onClick={() => navigateTo('/inbox')} className="bg-white p-10 rounded-[2.5rem] border border-[#F2F0EA] hover:border-olie-500/30 hover:shadow-olie-lg transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-olie-50 group-hover:text-olie-500 transition-all">
                <MessageCircle size={24} strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-5xl font-serif italic text-[#1A1A1A] mb-2 tracking-tighter">{overview?.pendingMessages || 0}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Mensagens Pendentes</p>
          </div>

          <div onClick={() => navigateTo('/production')} className="bg-white p-10 rounded-[2.5rem] border border-[#F2F0EA] hover:border-olie-500/30 hover:shadow-olie-lg transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-olie-50 group-hover:text-olie-500 transition-all">
                <Scissors size={24} strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-5xl font-serif italic text-[#1A1A1A] mb-2 tracking-tighter">{overview?.productionQueue || 0}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Em Produção</p>
          </div>

          <div className="bg-[#1C1917] p-10 rounded-[2.5rem] text-white group shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Calendar size={120} strokeWidth={0.5} />
             </div>
             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mb-6">Próxima Expedição</p>
               <h3 className="text-4xl font-serif italic text-olie-300 tracking-tight">{overview?.nextShipment}</h3>
             </div>
          </div>
        </section>

        <section className="space-y-10 pb-24">
          <div className="flex items-center justify-between px-4">
             <h2 className="text-2xl font-serif italic text-[#1A1A1A] tracking-tight">Pulso Recente</h2>
             <button className="text-[10px] font-black uppercase text-stone-400 hover:text-olie-900 transition-all">Ver Histórico</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {activity.length > 0 ? activity.map((item, i) => (
              <div key={i} className="group bg-white p-6 rounded-[2.5rem] border border-[#F2F0EA] hover:shadow-olie-lg transition-all flex items-center justify-between">
                <div className="flex items-center gap-8">
                   <div className="w-14 h-14 bg-stone-50 rounded-[1.8rem] flex items-center justify-center text-stone-300 group-hover:bg-olie-50 group-hover:text-olie-500 transition-all">
                      {getActivityIcon(item.text, item.highlight)}
                   </div>
                   <div className="flex flex-col gap-1">
                      <p className="text-lg text-stone-600 font-light">
                        {item.text} <span className="font-serif italic font-medium text-[#1A1A1A]">{item.highlight}</span>
                      </p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">{item.time}</span>
                   </div>
                </div>
                <ChevronRight size={18} className="text-stone-200 group-hover:text-olie-500 transition-all" />
              </div>
            )) : (
              <div className="py-20 flex flex-col items-center justify-center opacity-30 italic text-stone-400">
                 <Bell size={48} strokeWidth={1} className="mb-4" />
                 <p className="text-sm">Aguardando atividades do Workspace...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
