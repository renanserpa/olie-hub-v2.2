
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowRight,
  Sparkles,
  Calendar,
  MessageCircle,
  Scissors,
  ChevronRight,
  BrainCircuit,
  Loader2,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle2
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

  // Helper para determinar ícones baseados no texto da atividade
  const getActivityIcon = (text: string, highlight: string) => {
    const content = (text + highlight).toLowerCase();
    if (content.includes('pedido') || content.includes('venda')) return <ShoppingBag size={18} />;
    if (content.includes('aprovou') || content.includes('layout')) return <Star size={18} />;
    if (content.includes('whatsapp') || content.includes('mensagem')) return <MessageCircle size={18} />;
    return <Scissors size={18} />;
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-stone-50">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-olie-500 font-serif italic font-bold">O</div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative h-full bg-stone-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-olie-500/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-200/20 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4" />

      <div className="p-10 md:p-16 max-w-6xl mx-auto w-full space-y-16 relative z-10">
        
        {/* Header Editorial */}
        <header className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col gap-4">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-[#EBE8E0] rounded-full shadow-sm w-fit">
               <Sparkles size={12} className="text-olie-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Ateliê Olie • Gestão de Excelência</span>
             </div>
             <h1 className="text-6xl md:text-7xl font-serif font-medium text-[#1A1A1A] italic leading-[1.1] tracking-tighter">
               Arte em <br />
               <span className="not-italic text-olie-500">movimento.</span>
             </h1>
          </div>

          {/* AI Briefing Section */}
          <div className="bg-white border border-[#F2F0EA] rounded-[3rem] p-8 md:p-10 shadow-olie-soft relative overflow-hidden group">
             <div className="absolute -right-8 -bottom-8 text-olie-500/5 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                <BrainCircuit size={180} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-olie-50 flex items-center justify-center shadow-sm">
                      <Sparkles size={16} className="text-olie-500" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-olie-600">Olie Concierge AI</span>
                      <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">Sincronizado Agora</span>
                   </div>
                </div>
                <div className="max-w-3xl">
                   {loadingBriefing ? (
                      <div className="flex items-center gap-3 py-2">
                         <Loader2 size={16} className="animate-spin text-olie-500" />
                         <span className="text-sm font-serif italic text-stone-400">Interpretando o pulso do ateliê...</span>
                      </div>
                   ) : (
                      <p className="text-xl md:text-2xl text-stone-800 font-serif italic leading-relaxed animate-in fade-in duration-700">
                        {aiBriefing || "O dia floresce no ateliê. Suas peças estão ganhando vida e o atendimento segue o padrão de luxo Olie."}
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
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-olie-50 group-hover:text-olie-500 transition-all duration-500">
                <MessageCircle size={24} strokeWidth={1.5} />
              </div>
              <div className="flex h-3 w-3 relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              </div>
            </div>
            <h3 className="text-5xl font-serif italic text-[#1A1A1A] mb-2 tracking-tighter">{overview?.pendingMessages}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 group-hover:text-olie-500 transition-colors">Conversas Ativas</p>
            <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between text-stone-300 group-hover:text-stone-500 transition-colors">
              <span className="text-[9px] font-black uppercase tracking-widest">Acessar Inbox</span>
              <div className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center group-hover:border-olie-200 transition-all">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          <div onClick={() => navigateTo('/production')} className="bg-white p-10 rounded-[2.5rem] border border-[#F2F0EA] hover:border-olie-500/30 hover:shadow-olie-lg transition-all duration-700 cursor-pointer group">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-olie-50 group-hover:text-olie-500 transition-all duration-500">
                <Scissors size={24} strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-5xl font-serif italic text-[#1A1A1A] mb-2 tracking-tighter">{overview?.productionQueue}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 group-hover:text-olie-500 transition-colors">Ordens em Bancada</p>
            <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between text-stone-300 group-hover:text-stone-500 transition-colors">
              <span className="text-[9px] font-black uppercase tracking-widest">Fluxo de Produção</span>
              <div className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center group-hover:border-olie-200 transition-all">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          <div className="bg-[#1C1917] p-10 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <Calendar size={120} strokeWidth={0.5} />
             </div>
             <div className="relative z-10 h-full flex flex-col justify-between">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mb-6">Próxima Expedição</p>
                 <h3 className="text-4xl font-serif italic text-olie-300 tracking-tight">{overview?.nextShipment}</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-stone-500">
                     <span>Progresso Mensal</span>
                     <span className="text-white">85%</span>
                  </div>
                  <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden border border-white/5">
                     <div className="h-full bg-gradient-to-r from-olie-500 to-olie-300 w-[85%] rounded-full shadow-[0_0_10px_rgba(192,138,125,0.4)]" />
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* Editorial Activity Feed - Enhanced */}
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards pb-24">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-olie-500 animate-pulse" />
                 <h2 className="text-2xl font-serif italic text-[#1A1A1A] tracking-tight">Pulso do Ateliê</h2>
               </div>
               <div className="hidden md:block h-px w-32 bg-[#EBE8E0]" />
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-olie-900 transition-all flex items-center gap-3 px-8 py-3 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-md active:scale-95">
              Histórico de Eventos <ChevronRight size={14} className="text-olie-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {activity.map((item, i) => (
              <div 
                key={i} 
                className="group bg-white p-6 rounded-[2.5rem] border border-[#F2F0EA] hover:border-olie-500/20 hover:shadow-olie-lg hover:-translate-y-1.5 transition-all duration-500 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex items-center gap-8">
                   <div className="w-14 h-14 bg-stone-50 rounded-[1.8rem] flex items-center justify-center text-stone-300 group-hover:bg-olie-50 group-hover:text-olie-500 group-hover:scale-110 transition-all duration-500 shadow-inner border border-transparent group-hover:border-olie-100">
                      {getActivityIcon(item.text, item.highlight)}
                   </div>
                   <div className="flex flex-col gap-1">
                      <p className="text-lg text-stone-600 font-light leading-relaxed">
                        {item.text} <span className="font-serif italic font-medium text-[#1A1A1A] decoration-olie-200 decoration-1 underline-offset-4 group-hover:underline group-hover:text-olie-900 transition-all">{item.highlight}</span>
                      </p>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-stone-300">
                            <Clock size={10} /> {item.time}
                         </div>
                         <div className="w-1 h-1 rounded-full bg-stone-200" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 group-hover:text-olie-500 transition-colors">Sistema Sincronizado</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0">
                      <span className="text-[8px] font-black uppercase text-olie-500 tracking-[0.2em]">Detalhes</span>
                      <ArrowRight size={14} className="text-olie-500" />
                   </div>
                   <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-200 group-hover:bg-olie-900 group-hover:text-white transition-all transform group-hover:rotate-12 shadow-sm">
                      <ChevronRight size={18} />
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State / End of Feed Decor */}
          <div className="flex flex-col items-center justify-center py-10 opacity-20">
             <div className="w-px h-16 bg-gradient-to-b from-olie-500 to-transparent mb-6" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Fim das atividades recentes</p>
          </div>
        </section>

      </div>

      {/* Footer Status Bar - Consistency check */}
      <footer className="h-14 bg-white/50 backdrop-blur-md border-t border-stone-100 px-12 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Node Ativo: Matriz Olie</span>
             </div>
          </div>
          <div className="flex items-center gap-4 text-stone-300 italic text-[10px] font-medium">
             <History size={12} />
             Última atualização: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
      </footer>
    </main>
  );
}
