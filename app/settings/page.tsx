
"use client";

import React from 'react';
import { Settings, Shield, Zap, Globe, Bell, CreditCard, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide h-full">
      <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#F2F0EA]">
        <h1 className="text-3xl font-black italic tracking-tighter">Configurações</h1>
      </header>

      <div className="p-12 max-w-5xl mx-auto w-full space-y-16 pb-24">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="space-y-4">
            <SettingsLink icon={<Globe size={18}/>} label="Integrações" active />
            <SettingsLink icon={<Shield size={18}/>} label="Segurança" />
            <SettingsLink icon={<Bell size={18}/>} label="Notificações" />
            <SettingsLink icon={<CreditCard size={18}/>} label="Assinatura" />
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 space-y-12">
            <section className="space-y-8">
              <div>
                 <h3 className="text-xl font-black italic">Ecossistema Olie</h3>
                 <p className="text-xs font-medium text-stone-400 mt-1">Gerencie a conexão do seu ateliê com o mundo digital.</p>
              </div>

              <div className="space-y-4">
                <IntegrationCard 
                  name="Tiny ERP" 
                  desc="Sincronização de estoque e emissão de notas fiscais." 
                  status="Conectado"
                  icon="https://tiny.com.br/favicon.ico"
                />
                <IntegrationCard 
                  name="Meta Business" 
                  desc="Chat unificado Instagram e WhatsApp Cloud API." 
                  status="Conectado"
                  icon={<Zap size={24} className="text-blue-500"/>}
                />
                <IntegrationCard 
                  name="VNDA E-commerce" 
                  desc="Atualização em tempo real da vitrine digital." 
                  status="Pendente"
                  icon={<Globe size={24} className="text-stone-400"/>}
                />
              </div>
            </section>

            <section className="olie-card p-10 bg-[#333333] text-white">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h4 className="text-xl font-black italic tracking-tight">OlieHub Enterprise</h4>
                     <p className="text-xs text-stone-400 mt-1">Plano atualizado para 12 agentes e 5 canais.</p>
                  </div>
                  <button className="px-6 py-3 bg-olie-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Upgrade</button>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-olie-500 w-[82%]" />
               </div>
               <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mt-6">Próxima renovação em 12 de Junho, 2024</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SettingsLink({ icon, label, active }: any) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-white shadow-lg shadow-stone-200/40 text-olie-700 border border-stone-50 font-black' : 'text-stone-400 hover:bg-stone-50 font-medium'}`}>
      {icon}
      <span className="text-[11px] uppercase tracking-widest">{label}</span>
    </button>
  );
}

function IntegrationCard({ name, desc, status, icon }: any) {
  return (
    <div className="olie-card p-8 flex items-center justify-between group hover:border-olie-500/20 transition-all cursor-pointer bg-white">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center overflow-hidden border border-stone-100 group-hover:scale-105 transition-transform duration-500 p-3">
          {typeof icon === 'string' ? <img src={icon} className="w-full h-full object-contain" /> : icon}
        </div>
        <div>
          <h4 className="font-black italic text-lg">{name}</h4>
          <p className="text-[11px] text-stone-400 font-medium">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${status === 'Conectado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-stone-50 text-stone-400 border-stone-100'}`}>
          {status}
        </span>
        <ChevronRight size={18} className="text-stone-200" />
      </div>
    </div>
  );
}
