"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  MessageCircle, 
  ShoppingBag, 
  Users, 
  ArrowRight,
  Activity,
  ShieldCheck,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search
} from 'lucide-react';
import { MainSidebar } from '../components/layout/main-sidebar';

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-[#FAF9F6] text-stone-800 overflow-hidden font-sans">
      <MainSidebar />

      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        {/* Header Superior */}
        <header className="h-20 px-10 flex items-center justify-between bg-white border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-stone-400">Command Center</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sistema Online</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-stone-200 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full space-y-10">
          {/* Welcome Section */}
          <section className="flex justify-between items-end">
            <div>
              <p className="text-[#C08A7D] font-black text-xs uppercase tracking-[0.3em] mb-3">Bem-vinda de volta</p>
              <h2 className="text-5xl font-black text-[#333333] tracking-tight italic">Ateliê Olie Dashboard</h2>
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-white border border-stone-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                 <Clock size={14} /> Log de Atividades
               </button>
            </div>
          </section>

          {/* Key Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard label="Vendas Hoje" value="R$ 2.480,00" icon={<TrendingUp size={20}/>} trend="+12%" />
            <MetricCard label="Conversas Ativas" value="14" icon={<MessageCircle size={20}/>} />
            <MetricCard label="Pedidos Produção" value="08" icon={<ShoppingBag size={20}/>} />
            <MetricCard label="Novos Clientes" value="05" icon={<Users size={20}/>} trend="+3" />
          </section>

          {/* Active Workspaces */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Quick Navigation */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-[11px] font-black text-stone-300 uppercase tracking-[0.2em]">Acesso Rápido</h3>
              <div className="grid grid-cols-2 gap-6">
                <NavCard 
                  title="Omnichannel Inbox" 
                  desc="Gerencie WhatsApp e Instagram" 
                  href="/inbox" 
                  icon={<MessageCircle size={28} />}
                  color="bg-[#C08A7D]"
                />
                <NavCard 
                  title="Gestão de Pedidos" 
                  desc="Sync em tempo real com Tiny" 
                  href="/pedidos" 
                  icon={<ShoppingBag size={28} />}
                  color="bg-[#333333]"
                />
              </div>
              
              {/* System Health Section */}
              <div className="bg-white rounded-[3rem] p-8 border border-stone-100 shadow-sm">
                <h3 className="text-[11px] font-black text-stone-300 uppercase tracking-[0.2em] mb-6">Status das Integrações</h3>
                <div className="space-y-4">
                   <IntegrationRow name="Supabase Cloud" status="online" delay="24ms" />
                   <IntegrationRow name="Tiny ERP API" status="online" delay="142ms" />
                   <IntegrationRow name="Meta Graph API" status="warning" delay="--" />
                   <IntegrationRow name="VNDA Ecommerce" status="online" delay="89ms" />
                </div>
              </div>
            </div>

            {/* Right Column: Mini CRM / Alerts */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-stone-300 uppercase tracking-[0.2em]">Prioridades</h3>
              <div className="bg-[#333333] rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <Zap className="text-[#C08A7D] mb-6" size={32} />
                <h4 className="text-xl font-black italic mb-2">Meta de Produção</h4>
                <p className="text-white/60 text-xs font-medium leading-relaxed mb-8">Você está a 3 pedidos de bater a meta semanal do ateliê. Força!</p>
                <div className="w-full bg-white/10 h-2 rounded-full mb-4 overflow-hidden">
                   <div className="bg-[#C08A7D] h-full w-[75%] rounded-full shadow-[0_0_15px_rgba(192,138,125,0.5)]" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                  <span>12/15 Pedidos</span>
                  <span>75%</span>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-8 border border-stone-100 shadow-sm">
                <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-widest mb-6">Atalhos do Sistema</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 rounded-2xl transition-all group">
                    <span className="text-xs font-bold text-stone-600">Configurações Tiny</span>
                    <ArrowRight size={14} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 rounded-2xl transition-all group">
                    <span className="text-xs font-bold text-stone-600">Catálogo VNDA</span>
                    <ArrowRight size={14} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, icon, trend }: { label: string, value: string, icon: any, trend?: string }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm group hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-[#C08A7D]/10 group-hover:text-[#C08A7D] transition-colors">
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
        )}
      </div>
      <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-[#333333] tracking-tight italic">{value}</p>
    </div>
  );
}

function NavCard({ title, desc, href, icon, color }: { title: string, desc: string, href: string, icon: any, color: string }) {
  return (
    <Link href={href} className="bg-white rounded-[3rem] p-10 border border-stone-100 shadow-sm group hover:shadow-2xl hover:border-[#C08A7D]/20 transition-all flex flex-col items-start">
      <div className={`w-16 h-16 ${color} text-white rounded-[1.8rem] flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-[#333333] tracking-tight mb-2 italic">{title}</h3>
      <p className="text-xs font-medium text-stone-400 mb-8">{desc}</p>
      <div className="mt-auto w-full flex justify-end">
        <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-[#333333] group-hover:text-white transition-all">
          <ArrowRight size={20} />
        </div>
      </div>
    </Link>
  );
}

function IntegrationRow({ name, status, delay }: { name: string, status: 'online' | 'warning' | 'offline', delay: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-stone-50/50 rounded-2xl border border-stone-100 hover:border-[#C08A7D]/20 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
        <span className="text-xs font-bold text-stone-600">{name}</span>
      </div>
      <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{delay}</span>
    </div>
  );
}