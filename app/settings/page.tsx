
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Zap, Globe, Database, Key, Save, Trash2, 
  CheckCircle2, AlertCircle, RefreshCcw, Lock, Terminal, Copy,
  DatabaseZap, Table, ShieldAlert, Activity, Wifi, WifiOff,
  Search, Rocket, HardDrive, Info, ShoppingCart, XCircle, Play,
  Cpu, X, ShieldCheck, Box
} from 'lucide-react';
import { DatabaseService, ConnectionResult } from '../../services/api.ts';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    supabase_url: localStorage.getItem('olie_supabase_url') || '',
    supabase_key: localStorage.getItem('olie_supabase_key') || '',
    meta_token: localStorage.getItem('olie_meta_token') || '',
    tiny_token: localStorage.getItem('olie_tiny_token') || '',
    vnda_token: localStorage.getItem('olie_vnda_token') || '',
    tiny_integrator: localStorage.getItem('olie_tiny_integrator') || '10159',
  });

  const [healthStatus, setHealthStatus] = useState<any>({
    db: 'unknown',
    realtime: 'unknown',
    tables: 0,
    latency: 0,
    meta: 'unknown',
    tiny: 'unknown',
    vnda: 'unknown',
    isScanning: false,
    messages: {} as Record<string, string>
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [testingService, setTestingService] = useState<string | null>(null);

  const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const prefix = type === 'error' ? '✖ ' : type === 'success' ? '✔ ' : 'i ';
    setLogs(prev => [`[${time}] ${prefix}${msg}`, ...prev].slice(0, 12));
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    addLog("Iniciando varredura completa de infraestrutura...");
    setHealthStatus(prev => ({ ...prev, isScanning: true }));
    
    const health = await DatabaseService.checkHealth();
    const healthyTables = Object.values(health.tables).filter(v => v).length;

    const messages = { ...healthStatus.messages };
    
    // Diagnóstico individual sequencial para feedback visual
    if (config.tiny_token) await testConnection('tiny', config.tiny_token, true);
    if (config.meta_token) await testConnection('meta', config.meta_token, true);
    if (config.vnda_token) await testConnection('vnda', config.vnda_token, true);

    setHealthStatus(prev => ({
      ...prev,
      db: health.connection ? 'healthy' : 'error',
      realtime: health.realtime ? 'healthy' : 'error',
      tables: healthyTables,
      latency: health.latency,
      isScanning: false
    }));
    
    addLog(`Supabase Cluster: ${health.connection ? 'CONNECTED' : 'FAILED'} (${health.latency}ms)`, health.connection ? 'success' : 'error');
  };

  const testConnection = async (service: string, token: string, silent = false) => {
    const s = String(service);
    const t = String(token);
    
    if (!silent) {
      setTestingService(s);
      addLog(`Handshaking individual: ${s.toUpperCase()}...`);
    }
    
    const result = await DatabaseService.testSingleConnection(s, t);
    
    setHealthStatus((prev: any) => ({ 
      ...prev, 
      [s]: result.status,
      messages: { ...prev.messages, [s]: result.message }
    }));
    
    if (!silent) {
      setTestingService(null);
      addLog(`Resultado ${s.toUpperCase()}: ${result.status.toUpperCase()}`, result.status === 'healthy' ? 'success' : 'error');
      if (result.status === 'healthy') {
          localStorage.setItem(`olie_${s}_token`, t);
      }
    }
    
    return result;
  };

  const handleSave = () => {
    setIsSaving(true);
    addLog("Sincronizando Vault local...");
    Object.entries(config).forEach(([key, value]) => {
      localStorage.setItem(`olie_${key}`, String(value));
    });
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      runDiagnostic();
      setTimeout(() => setShowSaved(false), 3000);
    }, 800);
  };

  return (
    <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide h-full bg-stone-50">
      <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-olie-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Cpu size={20} />
           </div>
           <div>
              <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Enterprise Settings</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${healthStatus.db === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                 <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Node Status: {healthStatus.db === 'healthy' ? 'Operational' : 'Diagnostic Mode'}</span>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={runDiagnostic}
             className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-olie-500 flex items-center gap-2 px-4 py-2 transition-colors"
           >
             <Activity size={14} className={healthStatus.isScanning ? 'animate-pulse text-olie-500' : ''} />
             {healthStatus.isScanning ? 'Escanando Infra...' : 'Run Diagnostics'}
           </button>
           <div className="h-4 w-px bg-stone-100" />
           {showSaved && (
             <div className="flex items-center gap-2 text-emerald-500 animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
             </div>
           )}
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="h-12 px-8 bg-olie-900 text-white rounded-2xl flex items-center gap-3 hover:bg-black transition-all shadow-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
           >
             {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
             Salvar Tudo
           </button>
        </div>
      </header>

      <div className="p-12 max-w-5xl mx-auto w-full space-y-12 pb-32">
        <section className="space-y-8 animate-in fade-in duration-700">
           <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                 <h3 className="text-xl font-serif italic text-stone-800">Health Monitor</h3>
                 <p className="text-xs font-medium text-stone-400 mt-1">Status real das integrações operacionais.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <DiagnosticCard title="Supabase" status={healthStatus.db} icon={<Wifi size={16} />} />
              <DiagnosticCard title="Realtime" status={healthStatus.realtime} icon={<RefreshCcw size={16} />} />
              <DiagnosticCard title="Meta API" status={healthStatus.meta} message={healthStatus.messages.meta} icon={<Zap size={16} />} />
              <DiagnosticCard title="Tiny ERP" status={healthStatus.tiny} message={healthStatus.messages.tiny} icon={<Rocket size={16} />} />
              <DiagnosticCard title="VNDA Store" status={healthStatus.vnda} message={healthStatus.messages.vnda} icon={<ShoppingCart size={16} />} />
           </div>

           <div className="bg-[#1C1917] rounded-3xl p-6 font-mono text-[10px] text-stone-500 shadow-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                 <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-emerald-500" />
                    <span className="font-black uppercase tracking-widest text-emerald-500/80">Olie-OS Infrastructure Terminal</span>
                 </div>
              </div>
              <div className="h-32 overflow-y-auto scrollbar-hide flex flex-col-reverse space-y-reverse space-y-1">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="animate-in slide-in-from-left-2 fade-in">
                    <span className="text-emerald-500/40 mr-2">[{i}]</span>
                    <span>{log}</span>
                  </div>
                )) : (
                  <div className="italic text-stone-700">Aguardando telemetria de rede...</div>
                )}
              </div>
           </div>
        </section>

        <section className="space-y-12 animate-in fade-in duration-700 delay-100">
           <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="text-xl font-serif italic text-stone-800">Cofre de Credenciais</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Database Section */}
              <div className="olie-card p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <Database className="text-emerald-500" size={20} />
                    <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-stone-400">Database Cluster</h4>
                 </div>
                 <div className="space-y-4">
                    <ConfigInput 
                      label="Supabase URL" 
                      value={config.supabase_url} 
                      onChange={(v: string) => setConfig({...config, supabase_url: v})}
                    />
                    <ConfigInput 
                      label="Anon API Key" 
                      value={config.supabase_key} 
                      isPassword
                      onChange={(v: string) => setConfig({...config, supabase_key: v})}
                    />
                 </div>
              </div>

              {/* Tiny ERP Section */}
              <div className="olie-card p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <Box className="text-blue-500" size={20} />
                    <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-stone-400">Tiny ERP Integration</h4>
                 </div>
                 <div className="space-y-4">
                    <ConfigInput 
                      label="Tiny API Token (v2)" 
                      value={config.tiny_token} 
                      isPassword
                      status={healthStatus.tiny}
                      onTest={() => testConnection('tiny', config.tiny_token)}
                      isTesting={testingService === 'tiny'}
                      onChange={(v: string) => setConfig({...config, tiny_token: v})}
                    />
                    <ConfigInput 
                      label="Integrador ID" 
                      value={config.tiny_integrator} 
                      placeholder="10159"
                      onChange={(v: string) => setConfig({...config, tiny_integrator: v})}
                    />
                 </div>
              </div>

              {/* Meta Section */}
              <div className="olie-card p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <Zap className="text-pink-500" size={20} />
                    <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-stone-400">Meta Business Suite</h4>
                 </div>
                 <div className="space-y-4">
                    <ConfigInput 
                      label="System User Token" 
                      value={config.meta_token} 
                      isPassword
                      status={healthStatus.meta}
                      onTest={() => testConnection('meta', config.meta_token)}
                      isTesting={testingService === 'meta'}
                      onChange={(v: string) => setConfig({...config, meta_token: v})}
                    />
                 </div>
              </div>

              {/* VNDA Section */}
              <div className="olie-card p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <ShoppingCart className="text-orange-500" size={20} />
                    <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-stone-400">VNDA E-commerce</h4>
                 </div>
                 <div className="space-y-4">
                    <ConfigInput 
                      label="API Access Token" 
                      value={config.vnda_token} 
                      isPassword
                      status={healthStatus.vnda}
                      onTest={() => testConnection('vnda', config.vnda_token)}
                      isTesting={testingService === 'vnda'}
                      onChange={(v: string) => setConfig({...config, vnda_token: v})}
                    />
                 </div>
              </div>
           </div>
        </section>
      </div>
    </main>
  );
}

function DiagnosticCard({ title, status, icon, message }: any) {
  const getTheme = () => {
    switch(status) {
      case 'healthy': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      case 'invalid': return 'bg-amber-50 border-amber-100 text-amber-600';
      case 'error': return 'bg-rose-50 border-rose-100 text-rose-600';
      default: return 'bg-stone-50 border-stone-100 text-stone-400';
    }
  };

  const getLabel = () => {
    switch(status) {
      case 'healthy': return 'Ativo';
      case 'invalid': return 'Incorreto';
      case 'error': return 'Falha Crítica';
      default: return 'Pendente';
    }
  };

  return (
    <div className={`p-5 rounded-[2rem] border ${getTheme()} flex flex-col gap-3 shadow-sm transition-all duration-500 hover:scale-[1.05] hover:shadow-md bg-white group relative`}>
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
         status === 'healthy' ? 'bg-white' : status === 'error' ? 'bg-rose-100' : 'bg-stone-100'
       }`}>
          {status === 'error' ? <XCircle size={18} /> : icon}
       </div>
       <div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{title}</p>
          <p className="text-xs font-bold truncate tracking-tight">{getLabel()}</p>
       </div>
       
       {message && (
         <div className="absolute top-full mt-2 left-0 w-48 p-3 bg-stone-900 text-white text-[9px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
           {message}
         </div>
       )}
    </div>
  );
}

function ConfigInput({ label, value, onChange, placeholder, isPassword = false, onTest, isTesting, status }: any) {
  const [show, setShow] = useState(!isPassword);
  
  const getStatusBadge = () => {
      if (isTesting) return <div className="animate-spin text-blue-500"><RefreshCcw size={10} /></div>;
      if (status === 'healthy') return <div className="text-emerald-500 flex items-center gap-1 text-[8px] font-black uppercase"><ShieldCheck size={10}/> Ativo</div>;
      if (status === 'invalid') return <div className="text-rose-500 flex items-center gap-1 text-[8px] font-black uppercase"><XCircle size={10}/> Inválido</div>;
      if (status === 'error') return <div className="text-amber-500 flex items-center gap-1 text-[8px] font-black uppercase"><AlertCircle size={10}/> Erro</div>;
      return null;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">{label}</label>
        <div className="flex gap-4 items-center">
          {getStatusBadge()}
          {isPassword && (
            <button type="button" onClick={() => setShow(!show)} className="text-[8px] font-black uppercase text-olie-500 hover:underline">
              {show ? 'Ocultar' : 'Ver'}
            </button>
          )}
        </div>
      </div>
      <div className="relative group">
        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-200 group-focus-within:text-olie-500 transition-colors" size={14} />
        <input 
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Vault Key / Token`}
          className={`w-full bg-stone-50 border rounded-xl pl-12 pr-12 py-3.5 text-xs font-medium focus:bg-white focus:ring-4 focus:ring-olie-500/5 outline-none transition-all ${
              status === 'healthy' ? 'border-emerald-200' : status === 'invalid' ? 'border-rose-200' : 'border-stone-100'
          }`}
        />
        {onTest && (
            <button 
                type="button" 
                onClick={onTest} 
                disabled={isTesting || !value}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-olie-500 transition-colors p-2"
            >
                <Play size={12} fill="currentColor" />
            </button>
        )}
      </div>
    </div>
  );
}
