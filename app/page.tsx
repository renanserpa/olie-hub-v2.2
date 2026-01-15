"use client";

import React from 'react';
import { 
  MessageCircle, 
  ShoppingBag, 
  Users, 
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Sparkles,
  Search,
  Bell,
  Calendar,
  ChevronRight,
  Target,
  Layers
} from 'lucide-react';
import { MainSidebar } from '../components/layout/main-sidebar';

export default function DashboardPage() {
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-[#333333] overflow-hidden font-sans">
      <MainSidebar />

      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        {/* Floating Glass Header */}
        <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-40 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-[#F2F0EA]">
          <div className="flex items-center gap-10 flex-1">
            <div className="relative w-full max-w-lg group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#C08A7D] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar pedido, cliente ou item do ateliê..." 
                className="w-full bg-white border border-[#F2F0EA] rounded-[2rem] pl-16 pr-6 py-3.5 text-xs font-medium focus:ring-8 focus:ring-[#C08A7D]/5 outline-none transition-all shadow-sm group-hover:border-stone-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex gap-3">
              <button className="w-12 h-12 rounded-2xl bg-white border border-[#F2F0EA] flex items-center justify-center text-stone-400 hover:text-[#C08A7D] hover:shadow-lg transition-all relative group">
                <Bell size={20} />
                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-[#C08A7D] rounded-full ring-2 ring-white" />
              </button>
            </div>
            
            <div className="h-10 w-px bg-stone-200" />
            
            <div className="flex items-center gap-5 cursor-pointer group">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]">Olie Admin</p>
                <div className="flex items-center gap-2 justify-end">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Sincronizado</p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-[1.4rem] bg-white p-1 border border-stone-100 shadow-md group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full rounded-[1rem] object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto w-full space-y-16 pb-24">
          
          {/* Hero Concierge Section */}
          <section className="relative group">
            <div className="olie-card p-16 bg-[#111111] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#C08A7D] rounded-full blur-[160px] opacity-10 -translate-y-1/2 translate-x-1/4 group-hover:opacity-20 transition-opacity duration-1000" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full backdrop-blur-md border border-white/10">
                    <Sparkles size={14} className="text-[#C08A7D]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Inteligência Operacional</span>
                  </div>
                  <h1 className="text-7xl font-black tracking-tighter italic leading-[0.9] text-white">
                    Seu toque,<br />
                    <span className="text-[#C08A7D]">o comando.</span>
                  </h1>
                  <p className="text-stone-400 text-lg max-w-md leading-relaxed font-medium">
                    Hoje a produção artesanal atingiu <span className="text-white font-bold">85% da meta</span>. Há 14 conversas prioritárias aguardando seu refinamento.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => navigateTo('/inbox')}
                      className="px-12 py-5 bg-[#C08A7D] text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-[#C08A7D]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group italic"
                    >
                      Abrir Concierge Inbox <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-2 gap-6">
                   <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-8 rounded-[2.5rem] space-y-4">
                      <Target className="text-[#C08A7D]" size={32} />
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Meta de Vendas</p>
                      <h4 className="text-3xl font-black italic">R$ 45k</h4>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-[#C08A7D] w-[72%]" />
                      </div>
                   </div>
                   <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-8 rounded-[2.5rem] space-y-4 mt-12">
                      <Layers className="text-[#C08A7D]" size={32} />
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Em Produção</p>
                      <h4 className="text-3xl font-black italic">18 Itens</h4>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">+4 Hoje</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Spotlight */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <MetricBlock label="Receita Bruta" value="R$ 12.840" trend="+14.2%" icon={<TrendingUp size={22} />} />
            <MetricBlock label="Inbox Ativa" value="14 Chats" subValue="3 urgentes" icon={<MessageCircle size={22} />} />
            <MetricBlock label="Expedição" value="06 Envios" subValue="Hoje" icon={<ShoppingBag size={22} />} />
            <MetricBlock label="NPS Ateliê" value="4.9/5" trend="+0.2" icon={<Sparkles size={22} />} />
          </section>

          {/* Main Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Activity & Conversations */}
            <div className="lg:col-span-8 space-y-12">
              <div className="flex justify-between items-end border-b border-[#F2F0EA] pb-8">
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter">Atividade Recente</h3>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mt-1 italic">Fluxo em Tempo Real</p>
                </div>
                <button className="px-6 py-2.5 bg-white border border-[#F2F0EA] rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[#C08A7D]/30 transition-all">Ver Histórico</button>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Mariana Oliveira', msg: 'Gostaria de mudar o hardware para prateado.', time: 'agora', type: 'whatsapp', status: 'priority' },
                  { name: 'Clube Conceito', msg: 'O pedido TNY-4421 já foi postado?', time: '14m', type: 'instagram', status: 'standard' },
                  { name: 'Juliana Paes', msg: 'A Lille KTA tem em Rose Gold?', time: '1h', type: 'whatsapp', status: 'standard' },
                ].map((item, i) => (
                  <div key={i} className="olie-card p-8 group flex items-center gap-8 cursor-pointer hover:bg-stone-50/50 border-transparent hover:border-[#F2F0EA]">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-[1.8rem] bg-[#FAF9F6] border border-[#F2F0EA] flex items-center justify-center font-black text-2xl italic text-[#C08A7D] group-hover:bg-[#C08A7D] group-hover:text-white transition-all duration-500">
                        {item.name.charAt(0)}
                      </div>
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${item.status === 'priority' ? 'bg-[#C08A7D] animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-black text-lg italic text-[#333333] tracking-tight">{item.name}</h4>
                        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{item.time}</span>
                      </div>
                      <p className="text-stone-400 text-sm font-medium truncate italic">"{item.msg}"</p>
                    </div>
                    <div className="w-12 h-12 bg-white border border-[#F2F0EA] rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-[#333333] transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Workshop & Actions */}
            <div className="lg:col-span-4 space-y-12">
               <div>
                  <h3 className="text-[11px] font-black text-stone-300 uppercase tracking-[0.5em] italic mb-8">Gestão de Oficina</h3>
                  
                  <div className="olie-card p-10 bg-white border-2 border-[#C08A7D]/10 shadow-xl space-y-8 relative overflow-hidden group">
                     <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <ShoppingBag size={150} />
                     </div>
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#333333] text-white rounded-[1.8rem] flex items-center justify-center shadow-2xl">
                           <Clock size={28} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Coleta Transportadora</p>
                           <p className="text-xl font-black italic">Hoje, 16:30</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="text-[11px] font-black text-[#C08A7D] uppercase tracking-widest">Pacotes Prontos</span>
                           <span className="text-2xl font-black italic">08/10</span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200/20">
                           <div className="h-full bg-[#C08A7D] w-[80%] rounded-full shadow-[0_0_15px_rgba(192,138,125,0.4)]" />
                        </div>
                     </div>
                     <button className="w-full py-4 border border-[#F2F0EA] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-[#C08A7D] hover:border-[#C08A7D]/30 transition-all">Ver Lista de Envio</button>
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-[11px] font-black text-stone-300 uppercase tracking-[0.5em] italic">Atalhos Estratégicos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <QuickLink icon={<Calendar />} label="Agenda" />
                    <QuickLink icon={<Zap />} label="Shortcuts" />
                    <QuickLink icon={<Users />} label="CRM Full" />
                    <QuickLink icon={<Layers />} label="Estoque" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Dynamic System Footer */}
        <footer className="px-12 py-12 mt-auto border-t border-[#F2F0EA] flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
           <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 italic">OlieHub Operating System • Versão 2.4.1</p>
           </div>
           <div className="flex gap-10">
              <StatusItem label="Tiny ERP" status="online" />
              <StatusItem label="Meta API" status="online" />
              <StatusItem label="VNDA Cloud" status="online" />
           </div>
        </footer>
      </main>
    </div>
  );
}

function MetricBlock({ label, value, trend, subValue, icon }: any) {
  return (
    <div className="olie-card p-10 group hover:translate-y-[-4px] transition-all duration-700 olie-card-hover">
      <div className="flex justify-between items-start mb-8">
        <div className="w-14 h-14 rounded-[1.6rem] bg-[#FAF9F6] border border-[#F2F0EA] flex items-center justify-center text-stone-300 group-hover:bg-[#C08A7D] group-hover:text-white group-hover:border-[#C08A7D] transition-all duration-700 shadow-sm">
          {icon}
        </div>
        {trend && (
          <div className="px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="text-[10px] font-black text-emerald-600">{trend}</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mb-2 italic">{label}</p>
      <div className="flex items-baseline gap-3">
        <h4 className="text-4xl font-black text-[#333333] tracking-tighter italic">{value}</h4>
        {subValue && <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{subValue}</span>}
      </div>
    </div>
  );
}

function QuickLink({ icon, label }: any) {
  return (
    <button className="flex flex-col items-center gap-4 p-8 bg-white rounded-[2rem] border border-[#F2F0EA] hover:border-[#C08A7D]/30 hover:shadow-2xl hover:shadow-stone-200/40 transition-all group">
      <div className="text-stone-200 group-hover:text-[#C08A7D] group-hover:scale-110 transition-all duration-500">
        {React.cloneElement(icon, { size: 24, strokeWidth: 1.5 })}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 group-hover:text-[#333333] transition-colors">{label}</span>
    </button>
  );
}

function StatusItem({ label, status }: any) {
  return (
    <div className="flex items-center gap-2 group cursor-help">
       <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-[#333333] transition-colors">{label}</span>
       <div className={`w-1 h-1 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
    </div>
  );
}