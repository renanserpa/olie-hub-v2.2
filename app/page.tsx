
"use client";

import React, { useEffect, useState } from 'react';
import { 
  ArrowRight,
  Sparkles,
  Calendar,
  MessageCircle,
  Scissors,
  Activity,
  ChevronRight
} from 'lucide-react';
import { MainSidebar } from '../components/layout/main-sidebar.tsx';
import { DashboardService } from '../services/api.ts';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ov, ac] = await Promise.all([
          DashboardService.getOverview(),
          DashboardService.getRecentActivity()
        ]);
        setOverview(ov);
        setActivity(ac);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  if (loading) return (
    <div className="flex h-screen bg-[#FDFBF7] items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-[#333333] overflow-hidden font-sans">
      <MainSidebar />

      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-olie-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

        <div className="p-16 max-w-6xl mx-auto w-full space-y-20 relative z-10">
          
          {/* Header Editorial */}
          <header className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white border border-[#EBE8E0] rounded-full shadow-sm">
              <Sparkles size={12} className="text-olie-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Briefing Diário</span>
            </div>
            <h1 className="text-7xl font-serif font-medium text-[#1A1A1A] italic leading-tight">
              Bom dia, <br />
              <span className="not-italic text-olie-500">Equipe Olie.</span>
            </h1>
            <p className="text-xl text-stone-500 font-serif italic max-w-lg leading-relaxed">
              O ateliê amanhece com <strong className="text-stone-800 font-sans not-italic">{overview?.productionQueue} peças</strong> em produção e a expedição programada para <strong className="text-stone-800 font-sans not-italic">{overview?.nextShipment}</strong>.
            </p>
          </header>

          {/* Cards de Insight */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 fill-mode-backwards">
            {/* Inbox Card */}
            <div onClick={() => navigateTo('/inbox')} className="bg-white p-10 rounded-[2rem] border border-[#F2F0EA] hover:border-olie-500/30 hover:shadow-2xl hover:shadow-olie-500/5 transition-all duration-700 cursor-pointer group">
              <div className="flex justify-between items-start mb-8">
                <MessageCircle size={28} strokeWidth={1} className="text-stone-400 group-hover:text-olie-500 transition-colors" />
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <h3 className="text-4xl font-serif italic text-[#1A1A1A] mb-2">{overview?.pendingMessages}</h3>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400 group-hover:text-olie-500 transition-colors">Clientes Aguardando</p>
              <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between text-stone-300 group-hover:text-stone-500 transition-colors">
                <span className="text-[10px] uppercase tracking-widest">Ver Inbox</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Production Card */}
            <div onClick={() => navigateTo('/production')} className="bg-white p-10 rounded-[2rem] border border-[#F2F0EA] hover:border-olie-500/30 hover:shadow-2xl hover:shadow-olie-500/5 transition-all duration-700 cursor-pointer group">
              <div className="flex justify-between items-start mb-8">
                <Scissors size={28} strokeWidth={1} className="text-stone-400 group-hover:text-olie-500 transition-colors" />
              </div>
              <h3 className="text-4xl font-serif italic text-[#1A1A1A] mb-2">Corte</h3>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400 group-hover:text-olie-500 transition-colors">Foco do Dia</p>
              <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between text-stone-300 group-hover:text-stone-500 transition-colors">
                <span className="text-[10px] uppercase tracking-widest">Abrir Kanban</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Revenue/Date Card */}
            <div className="bg-[#1A1A1A] p-10 rounded-[2rem] text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Calendar size={100} strokeWidth={0.5} />
               </div>
               <div className="relative z-10 h-full flex flex-col justify-between">
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-4">Receita Mensal</p>
                   <h3 className="text-4xl font-serif italic">{overview?.revenueMonth}</h3>
                 </div>
                 <div className="flex items-center gap-3 text-stone-400">
                    <div className="h-px w-8 bg-stone-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Meta em 85%</span>
                 </div>
               </div>
            </div>
          </section>

          {/* Editorial Activity Feed */}
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards pb-20">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif italic text-[#1A1A1A] flex items-center gap-3">
                Acontecimentos Recentes
                <div className="h-px w-12 bg-[#EBE8E0]" />
              </h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-olie-500 transition-colors flex items-center gap-1">
                Ver Tudo <ChevronRight size={12} />
              </button>
            </div>
            
            <div className="relative pl-4">
              {/* Timeline Line */}
              <div className="absolute left-[19px] top-2 bottom-6 w-px bg-gradient-to-b from-stone-200 via-stone-100 to-transparent" />
              
              <div className="space-y-6">
                {activity.map((item, i) => (
                  <div 
                    key={i} 
                    className="relative group pl-8 animate-in slide-in-from-bottom-2 fade-in duration-700"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    {/* Timeline Marker */}
                    <div className="absolute left-[15px] top-4 h-2.5 w-2.5 rounded-full border-2 border-[#FDFBF7] bg-stone-300 group-hover:bg-olie-500 group-hover:scale-125 transition-all duration-300 shadow-sm z-10 ring-4 ring-[#FDFBF7]" />
                    
                    {/* Activity Card */}
                    <div className="bg-white p-5 rounded-2xl border border-[#F2F0EA] shadow-sm hover:shadow-lg hover:border-olie-500/20 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-base text-stone-600 font-light leading-relaxed">
                          {item.text} <span className="font-serif italic font-medium text-[#1A1A1A] decoration-olie-200 decoration-1 underline-offset-4 group-hover:underline">{item.highlight}</span>
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 whitespace-nowrap bg-stone-50 px-2 py-1 rounded-lg group-hover:text-olie-500 transition-colors">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
