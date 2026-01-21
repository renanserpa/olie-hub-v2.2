
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Zap, Database, Rocket, ShoppingCart, RefreshCcw, 
  Truck, ShoppingBag, Activity, Box, Key,
  Fingerprint, CheckCircle2, AlertCircle, Loader2,
  List as ListIcon, ShieldCheck, Instagram, Server,
  Cpu, Heart, History, GitMerge, Clock, AlertTriangle
} from 'lucide-react';
import { DatabaseService, IntegrationService, SyncService } from '../../services/api.ts';
import { SyncHistoryModal } from './sync-history-modal.tsx';
import { StatusMapperModal } from './status-mapper-modal.tsx';
import { ConflictResolverModal } from './conflict-resolver-modal.tsx';
import { toast } from 'sonner';

interface IntegrationsTabProps {
  config: any;
  setConfig: (config: any) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ config, setConfig }) => {
  const [health, setHealth] = useState<any>({ db: 'loading', tiny: 'loading', meta: 'loading', vnda: 'loading' });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  
  const [syncStatus, setSyncStatus] = useState<Record<string, { state: 'idle' | 'syncing' | 'success' | 'error', message: string }>>({
    orders: { state: 'idle', message: '' },
    products: { state: 'idle', message: '' },
    customers: { state: 'idle', message: '' }
  });

  const checkAllHealth = async () => {
    setHealth({ db: 'loading', tiny: 'loading', meta: 'loading', vnda: 'loading' });
    const [dbRes, tinyRes, metaRes, vndaRes] = await Promise.all([
      DatabaseService.checkHealth(),
      IntegrationService.checkTinyHealth(),
      IntegrationService.checkMetaHealth(),
      IntegrationService.checkVndaHealth()
    ]);
    setHealth({ db: dbRes.status, tiny: tinyRes.status, meta: metaRes.status, vnda: vndaRes.status });
  };

  const performSync = async (type: 'orders' | 'products' | 'customers') => {
    setSyncStatus(prev => ({ ...prev, [type]: { state: 'syncing', message: 'Sincronizando...' } }));
    try {
      let result;
      if (type === 'orders') result = await SyncService.syncOrders();
      else if (type === 'products') result = await SyncService.syncProducts();
      else result = await SyncService.syncCustomers();

      const label = type === 'orders' ? 'pedidos' : type === 'products' ? 'produtos' : 'contatos';
      setSyncStatus(prev => ({ ...prev, [type]: { state: 'success', message: `${result.count} ${label} OK.` } }));
      
      toast.success(`Sincronização de ${label} concluída`, {
        description: `${result.count} registros atualizados com o Workspace.`
      });
    } catch (err) {
      setSyncStatus(prev => ({ ...prev, [type]: { state: 'error', message: 'Falha.' } }));
      toast.error(`Falha na sincronização de ${type}`);
    } finally {
      setTimeout(() => setSyncStatus(prev => ({ ...prev, [type]: { ...prev[type], state: 'idle' } })), 5000);
    }
  };

  useEffect(() => {
    checkAllHealth();
    
    let interval: any;
    if (autoSyncEnabled) {
      interval = setInterval(async () => {
        const results = await SyncService.syncAll();
        const successCount = results.filter((r: any) => r.status === 'fulfilled' && r.value.status === 'success').length;
        if (successCount > 0) {
          toast.info("Auto-Sincronia concluída", {
            description: "O Workspace foi atualizado silenciosamente em background.",
            icon: <Clock size={14} />
          });
        }
      }, 60000); 
    }
    return () => clearInterval(interval);
  }, [autoSyncEnabled]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif italic text-olie-900 leading-none">Status do Ecossistema</h2>
          <div className="flex items-center gap-6 mt-3">
             <button 
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-olie-500 transition-all"
             >
                <History size={12} /> Ver Logs
             </button>
             <button 
                onClick={() => setIsMapperOpen(true)}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-olie-500 transition-all"
             >
                <GitMerge size={12} /> Workflow
             </button>
             <button 
                onClick={() => setIsConflictOpen(true)}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-all"
             >
                <AlertTriangle size={12} /> Conflitos
             </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
             className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl border transition-all ${
               autoSyncEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-stone-50 text-stone-400 border-stone-100'
             }`}
           >
             <Clock size={12} /> {autoSyncEnabled ? 'Auto-Sync On' : 'Auto-Sync Off'}
           </button>
           <button 
             onClick={checkAllHealth}
             className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-olie-500 hover:text-olie-700 transition-all bg-white px-6 py-3 rounded-2xl border border-stone-100 shadow-sm"
           >
             <Activity size={12} /> Revalidar
           </button>
        </div>
      </header>

      {/* HEALTH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <HealthCard title="Supabase" status={health.db} icon={<Database size={18}/>} />
        <HealthCard title="Tiny ERP" status={health.tiny} icon={<Rocket size={18}/>} />
        <HealthCard title="Meta API" status={health.meta} icon={<Zap size={18}/>} />
        <HealthCard title="VNDA" status={health.vnda} icon={<ShoppingCart size={18}/>} />
      </div>

      {/* SYNC STATION */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
           <RefreshCcw size={18} className="text-stone-300" />
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Estação de Sincronização</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <SyncAction title="Pedidos Tiny" icon={<ShoppingBag size={20}/>} status={syncStatus.orders} onSync={() => performSync('orders')} />
           <SyncAction title="Catálogo Prod." icon={<Box size={20}/>} status={syncStatus.products} onSync={() => performSync('products')} />
           <SyncAction title="Base de Contatos" icon={<Fingerprint size={20}/>} status={syncStatus.customers} onSync={() => performSync('customers')} />
        </div>
      </section>

      {/* CREDENTIALS CONFIG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-stone-100">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Key size={18} className="text-stone-300" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Acesso ao Banco e Meta</h3>
          </div>
          <div className="olie-card p-8 space-y-6">
            <ConfigInput label="Supabase URL" value={config.supabase_url} onChange={(v: string) => setConfig({...config, supabase_url: v})} />
            <ConfigInput label="Meta Access Token" value={config.meta_token} isPassword onChange={(v: string) => setConfig({...config, meta_token: v})} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Server size={18} className="text-stone-300" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Tiny ERP (Gateway v2)</h3>
          </div>
          <div className="olie-card p-8 space-y-6">
            <ConfigInput label="API Token" value={config.tiny_token} isPassword onChange={(v: string) => setConfig({...config, tiny_token: v})} />
            <ConfigInput label="Integrador ID" value={config.tiny_integrator} onChange={(v: string) => setConfig({...config, tiny_integrator: v})} />
          </div>
        </section>
      </div>

      <SyncHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <StatusMapperModal isOpen={isMapperOpen} onClose={() => setIsMapperOpen(false)} />
      <ConflictResolverModal isOpen={isConflictOpen} onClose={() => setIsConflictOpen(false)} />
    </div>
  );
};

function HealthCard({ title, status, icon }: any) {
  const isHealthy = status === 'healthy';
  const isLoading = status === 'loading';
  const isError = status === 'error' || status === 'invalid';

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-olie-soft hover:shadow-olie-lg transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${
        isHealthy ? 'bg-emerald-50 text-emerald-500' : isError ? 'bg-rose-50 text-rose-500' : 'bg-stone-50 text-stone-300 animate-pulse'
      }`}>
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : icon}
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-1">{title}</p>
      <div className="flex items-center gap-2">
         <div className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : isError ? 'bg-rose-500' : 'bg-stone-200'}`} />
         <span className={`text-[11px] font-black uppercase tracking-tight italic ${isHealthy ? 'text-emerald-900' : isError ? 'text-rose-900' : 'text-stone-400'}`}>
           {isLoading ? 'Checking...' : isHealthy ? 'Conectado' : 'Interrompido'}
         </span>
      </div>
    </div>
  );
}

function SyncAction({ title, icon, status, onSync }: any) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-stone-100 shadow-olie-soft group">
       <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-olie-500 transition-colors">
            {icon}
          </div>
          <button 
            onClick={onSync}
            disabled={status.state === 'syncing'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              status.state === 'syncing' ? 'bg-stone-50 text-stone-300 animate-spin' : 'bg-olie-900 text-white hover:scale-110 shadow-lg'
            }`}
          >
            <RefreshCcw size={14} />
          </button>
       </div>
       <h4 className="text-[11px] font-black uppercase tracking-widest text-olie-900 mb-1">{title}</h4>
       <div className="h-5">
         {status.state === 'syncing' ? (
           <span className="text-[9px] font-bold text-olie-500 italic animate-pulse">Sincronizando...</span>
         ) : status.message ? (
           <span className={`text-[9px] font-black uppercase tracking-widest ${status.state === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
             {status.message}
           </span>
         ) : (
           <span className="text-[9px] font-medium text-stone-300 italic">Aguardando comando</span>
         )}
       </div>
    </div>
  );
}

function ConfigInput({ label, value, onChange, isPassword = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300 px-1">{label}</label>
      <input 
        type={isPassword ? 'password' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-olie-500/5 transition-all shadow-inner"
      />
    </div>
  );
}
