
"use client";

import React, { useState } from 'react';
import { 
  Settings, Zap, Users, LayoutGrid, Save, RefreshCcw, Bug, Database, Cpu
} from 'lucide-react';
import { IntegrationsTab } from '../../components/settings/integrations-tab.tsx';
import { TinyInspector } from '../../components/tiny-inspector.tsx';

type SettingsTab = 'geral' | 'integracoes' | 'equipe';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('integracoes');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const [config, setConfig] = useState({
    supabase_url: localStorage.getItem('olie_supabase_url') || '',
    supabase_key: localStorage.getItem('olie_supabase_key') || '',
    meta_token: localStorage.getItem('olie_meta_token') || '',
    tiny_token: localStorage.getItem('olie_tiny_token') || '',
    vnda_token: localStorage.getItem('olie_vnda_token') || '',
    tiny_integrator: localStorage.getItem('olie_tiny_integrator') || '10159',
  });

  const handleSave = () => {
    setIsSaving(true);
    Object.entries(config).forEach(([key, value]) => {
      localStorage.setItem(`olie_${key}`, String(value));
    });
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
      window.location.reload(); // Recarrega para aplicar as chaves Supabase/API
    }, 800);
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAF9F6] overflow-hidden">
      <header className="h-24 px-12 flex items-center justify-between shrink-0 bg-white border-b border-stone-100 z-50">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 bg-olie-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Settings size={22} />
           </div>
           <div>
              <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Ajustes do Sistema</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300 mt-1.5 italic">Gestão da Infraestrutura Olie</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           {showSaved && (
             <div className="text-emerald-500 animate-in fade-in slide-in-from-right-4">
                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado com Sucesso</span>
             </div>
           )}
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="h-14 px-10 bg-olie-900 text-white rounded-[1.5rem] flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-stone-200 text-[10px] font-black uppercase tracking-widest active:scale-95"
           >
             {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
             Salvar & Aplicar
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-stone-100 p-10 space-y-3 bg-white/50 shrink-0">
           <TabBtn active={activeTab === 'geral'} onClick={() => setActiveTab('geral')} icon={<LayoutGrid size={18} />} label="Geral" desc="Interface e Tema" />
           <TabBtn active={activeTab === 'integracoes'} onClick={() => setActiveTab('integracoes')} icon={<Zap size={18} />} label="Integrações" desc="ERP & Social APIs" />
           <TabBtn active={activeTab === 'equipe'} onClick={() => setActiveTab('equipe')} icon={<Users size={18} />} label="Equipe" desc="RBAC & Acessos" />

           <div className="pt-12 mt-12 border-t border-stone-100">
              <div className="p-8 bg-stone-900 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
                 <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <Database size={120} />
                 </div>
                 <span className="text-8px font-black uppercase tracking-[0.3em] text-stone-500 mb-2 block">Olie Cloud</span>
                 <p className="text-xs font-serif italic text-stone-300 leading-relaxed mb-4">Sua infraestrutura está protegida por criptografia de ponta a ponta.</p>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-9px font-black uppercase tracking-widest text-emerald-500">Workspace Ativo</span>
                 </div>
              </div>
           </div>
        </aside>

        <section className="flex-1 overflow-y-auto scrollbar-hide p-16 bg-[#FAF9F6]">
          <div className="max-w-4xl mx-auto w-full">
            {activeTab === 'integracoes' ? (
              <div className="space-y-16">
                <IntegrationsTab config={config} setConfig={setConfig} />
                <div className="border-t border-stone-100 pt-16">
                  <div className="flex items-center gap-3 mb-8">
                    <Bug size={18} className="text-rose-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Suíte de Diagnóstico Avançado</h3>
                  </div>
                  <TinyInspector />
                </div>
              </div>
            ) : (
              <div className="olie-card p-20 flex flex-col items-center justify-center text-center italic text-stone-300 space-y-6">
                <Cpu size={48} strokeWidth={1} />
                <p className="text-lg">Módulo em fase de polimento artesanal.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function TabBtn({ active, onClick, icon, label, desc }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-5 rounded-[1.8rem] flex items-center gap-5 transition-all group ${
        active ? 'bg-white shadow-olie-soft border border-stone-100' : 'hover:bg-white/50 text-stone-400'
      }`}
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
        active ? 'bg-olie-900 text-white shadow-lg' : 'bg-stone-50 group-hover:bg-stone-100'
      }`}>
        {icon}
      </div>
      <div className="text-left">
        <p className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-olie-900' : 'text-stone-500'}`}>{label}</p>
        <p className="text-[9px] font-medium text-stone-300 italic">{desc}</p>
      </div>
    </button>
  );
}
