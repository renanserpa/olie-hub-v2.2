
"use client";

import React from 'react';
import { MainSidebar } from '../../components/layout/main-sidebar.tsx';
import { Users, Search, Filter, Star, TrendingUp, Mail, Phone, ChevronRight } from 'lucide-react';

export default function ClientesPage() {
  const clients = [
    { name: 'Ana Carolina', ltv: 2400, orders: 4, tags: ['VIP', 'Lille'] },
    { name: 'Bia Mendonça', ltv: 890, orders: 1, tags: ['Lead'] },
    { name: 'Juliana Paes', ltv: 5200, orders: 12, tags: ['VIP Gold'] },
    { name: 'Mariana Silva', ltv: 420, orders: 2, tags: ['Active'] },
  ];

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-[#333333] overflow-hidden font-sans">
      <MainSidebar />

      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#F2F0EA]">
          <h1 className="text-3xl font-black italic tracking-tighter">Clientes <span className="text-stone-300 text-xl font-medium not-italic ml-2">CRM</span></h1>
          
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-stone-100 overflow-hidden shadow-sm">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-white bg-olie-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm">+84</div>
            </div>
            <div className="h-8 w-px bg-stone-200" />
            <button className="px-6 py-2.5 bg-olie-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-olie-500/20">Novo Lead</button>
          </div>
        </header>

        <div className="p-12 space-y-12 max-w-7xl mx-auto w-full">
          {/* VIP Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="olie-card p-10 bg-stone-800 text-white relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Star size={200} />
               </div>
               <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-4">Média de LTV</p>
               <h2 className="text-5xl font-black italic tracking-tighter">R$ 1.840 <span className="text-lg text-emerald-500 not-italic ml-2">+12%</span></h2>
               <div className="mt-8 flex items-center gap-4 text-xs font-medium text-stone-400 italic">
                  <TrendingUp size={16} className="text-emerald-500" />
                  Crescimento constante na base VIP
               </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-8">
               <div className="olie-card p-10 border-2 border-olie-500/10">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mb-2">Novos este Mês</p>
                  <h3 className="text-4xl font-black italic">+42 Clientes</h3>
                  <div className="mt-6 w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                     <div className="h-full bg-olie-500 w-[65%]" />
                  </div>
               </div>
               <div className="olie-card p-10">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mb-2">Recorrência</p>
                  <h3 className="text-4xl font-black italic">68%</h3>
                  <p className="text-[10px] font-bold text-stone-400 uppercase mt-4 tracking-widest">Lealdade Alta</p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <div className="flex gap-4">
                <button className="px-6 py-2.5 bg-white border border-stone-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-olie-500 transition-all">Todos</button>
                <button className="px-6 py-2.5 bg-white border border-stone-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-olie-500 transition-all text-stone-400">VIPs</button>
                <button className="px-6 py-2.5 bg-white border border-stone-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-olie-500 transition-all text-stone-400">Leads</button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input type="text" placeholder="Filtrar base..." className="bg-white border border-stone-100 rounded-full pl-12 pr-6 py-2.5 text-xs outline-none w-64" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {clients.map((client, i) => (
                <div key={i} className="olie-card p-8 group hover:-translate-y-2 transition-all duration-700 cursor-pointer">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-[2rem] bg-stone-50 flex items-center justify-center font-black text-2xl italic text-olie-500 group-hover:bg-olie-500 group-hover:text-white transition-all duration-700">
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-stone-50 rounded-2xl text-stone-300 hover:text-olie-500 transition-all"><Mail size={16}/></button>
                      <button className="p-3 bg-stone-50 rounded-2xl text-stone-300 hover:text-olie-500 transition-all"><Phone size={16}/></button>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-black italic mb-1">{client.name}</h4>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-6">LTV: R$ {typeof client.ltv === 'number' ? client.ltv.toLocaleString('pt-BR') : client.ltv}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map(t => (
                      <span key={t} className="px-3 py-1 bg-stone-50 rounded-lg text-[9px] font-black text-stone-400 uppercase tracking-widest">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
