
"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowRight,
  Sparkles,
  Calendar,
  MessageCircle,
  Scissors,
  ChevronRight,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { DashboardService, AIService } from '../services/api.ts';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [aiBriefing, setAiBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ov, ac] = await Promise.all([
          DashboardService.getOverview(),
          DashboardService.getRecentActivity()
        ]);
        setOverview(ov);
        setActivity(ac);
        
        // Gerar briefing via IA após carregar dados básicos
        setLoadingBriefing(true);
        const briefing = await AIService.getDailyBriefing(ov);
        setAiBriefing(briefing);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
        setLoadingBriefing(false);
      }
    };
    loadData();
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-stone-50">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative h-full bg-stone-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-olie-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="p-16 max-w-6xl mx-auto w-full space-y-16 relative z-10">
        
        {/* Header Editorial */}
        <header className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col gap-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-[#EBE8E0] rounded-full shadow-sm w-fit">
               <Sparkles size={12} className="text-olie-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Ateliê Olie • Dashboard Central</span>
             </div>
             <h1 className="text-7xl font-serif font-medium text-[#1A1A1A] italic leading-[1.1]">
               Excelência em <br />
               <span className="not-italic text-olie-500">cada detalhe.</span>
             </h1>
          </div>

          {/* AI Briefing Section */}
          <div className="bg-olie-50/50 border border-olie-100 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
             <div className="absolute -right-8 -bottom-8 text-olie-100 opacity-20 group-hover:scale-110 transition-transform duration-1000">
                <BrainCircuit size={160} />
             </div>
             <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Sparkles size={14} className="text-olie-500" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-olie-600">Briefing do Mestre Olie</span>
                </div>
                <div className="max-w-2xl">
                   {loadingBriefing ? (
                      <div className="flex items-center gap-3 py-2">
                         <Loader2 size={16} className="animate-spin text-olie-500" />
                         <span className="text-sm font-serif italic text-stone-400">Consultando o fluxo do ateliê...</span>
                      </div>
                   ) : (
                      <p className="text-xl md:text-2xl text-stone-800 font-serif italic leading-relaxed animate-in fade-in duration-700">
                        {aiBriefing}
                      </p>
                   )}
                </div>
             </div>
          </div>
        </header>

        {/* Cards de Insight */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 fill-mode-backwards">
          <div onClick={() => navigateTo('/inbox')} className="bg-white p-10 rounded-[2.5rem] border border-[#F2F0EA] hover:border-olie-500/30 hover:shadow-olie-lg transition-all duration-700 cursor-pointer group">
            <div className="flex justify-between items-start mb-8">
              <MessageCircle size={28} strokeWidth={1} className="text-stone-400 group-hover:text-olie-500 transition-colors" />
              <div className="flex h-3 w-3 relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></div>
              </div>
            </div>
            <h3 className="text-5xl font-serif italic text-[#1A1A1A] mb-2">{overview?.pendingMessages}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 group-hover:text-olie-500 transition-colors">Atendimentos</p>
            <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between text-stone-300 group-hover:text-stone-500 transition-colors">
              <span className="text-[9px] font-black uppercase tracking-widest">Abrir Inbox</span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div onClick={() => navigateTo('/production')} className="bg-white p-10 rounded-[2.5rem] border border-[#F2F0EA] hover:border-olie-500/30 hover:shadow-olie-lg transition-all duration-700 cursor-pointer group">
            <div className="flex justify-between items-start mb-8">
              <Scissors size={28} strokeWidth={1} className="text-stone-400 group-hover:text-olie-500 transition-colors" />
            </div>
            <h3 className="text-5xl font-serif italic text-[#1A1A1A] mb-2">{overview?.productionQueue}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 group-hover:text-olie-500 transition-colors">Peças em Produção</p>
            <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between text-stone-300 group-hover:text-stone-500 transition-colors">
              <span className="text-[9px] font-black uppercase tracking-widest">Ver Kanban</span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div className="bg-[#1C1917] p-10 rounded-[2.5rem] text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <Calendar size={120} strokeWidth={0.5} />
             </div>
             <div className="relative z-10 h-full flex flex-col justify-between">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mb-6">Próxima Expedição</p>
                 <h3 className="text-4xl font-serif italic text-olie-300">{overview?.nextShipment}</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-stone-500">
                     <span>Meta Mensal</span>
                     <span>85%</span>
                  </div>
                  <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                     <div className="h-full bg-olie-500 w-[85%]" />
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* Editorial Activity Feed */}
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards pb-20">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
               <h2 className="text-2xl font-serif italic text-[#1A1A1A]">Acontecimentos</h2>
               <div className="h-px w-24 bg-[#EBE8E0]" />
            </div>
            <button className="text-[9px] font-black uppercase tracking-widest text-stone-300 hover:text-olie-500 transition-colors flex items-center gap-2 px-6 py-2 border border-stone-100 rounded-full hover:bg-white">
              Histórico <ChevronRight size={12} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {activity.map((item, i) => (
              <div 
                key={i} 
                className="group bg-white p-6 rounded-3xl border border-[#F2F0EA] hover:border-olie-500/20 hover:shadow-olie-soft hover:-translate-y-1 transition-all duration-500 flex items-center justify-between"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-olie-500 transition-colors">
                      {i % 2 === 0 ? <MessageCircle size={20} /> : <Scissors size={20} />}
                   </div>
                   <p className="text-lg text-stone-600 font-light leading-relaxed">
                     {item.text} <span className="font-serif italic font-medium text-[#1A1A1A] decoration-olie-200 decoration-1 underline-offset-4 group-hover:underline">{item.highlight}</span>
                   </p>
                </div>
                <div className="flex items-center gap-6">
                   <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 bg-stone-50 px-3 py-1.5 rounded-xl group-hover:bg-olie-50 group-hover:text-olie-500 transition-colors">
                     {item.time}
                   </span>
                   <ChevronRight size={16} className="text-stone-100 group-hover:text-olie-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
