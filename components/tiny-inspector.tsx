"use client";

import React, { useState } from 'react';
import { 
  Terminal, 
  RefreshCcw, 
  Wifi, 
  WifiOff, 
  Code, 
  AlertCircle, 
  Activity, 
  Bug, 
  Timer, 
  Zap, 
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';

/**
 * Tiny Core Inspector V5 - Olie Edition
 * Executa uma validação em cascata para garantir que o gateway local e o ERP remoto
 * estão operando dentro dos parâmetros de latência esperados (3s timeout).
 */
export const TinyInspector: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [output, setOutput] = useState<string>("Aguardando comando para iniciar varredura de integridade.");
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'error'}[]>([]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ msg, type }, ...prev].slice(0, 8));
  };

  const handleDiagnostic = async () => {
    setLoading(true);
    setStatus(null);
    setLogs([]);
    setOutput("Iniciando varredura estruturada...");
    
    // --- ESTÁGIO 1: Validação de Rota Local (Ping) ---
    addLog("Iniciando Estágio 1: Ping na rota local...", 'info');
    
    const pingController = new AbortController();
    const pingTimeoutId = setTimeout(() => pingController.abort(), 3000);

    try {
      const pingRes = await fetch('/api/orders/list?ping=true', { 
        method: 'POST',
        signal: pingController.signal
      });
      clearTimeout(pingTimeoutId);
      
      if (!pingRes.ok) throw new Error(`HTTP ${pingRes.status}`);
      
      const pingData = await pingRes.json();
      addLog("Gateway local respondendo com sucesso.", 'success');
      
    } catch (err: any) {
      clearTimeout(pingTimeoutId);
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout ? "TIMEOUT (3s): Gateway local offline." : `ERRO LOCAL: ${err.message}`;
      addLog(errorMsg, 'error');
      setOutput(`FALHA CRÍTICA NO ESTÁGIO 1:\n${errorMsg}\n\nVerifique se o servidor está rodando.`);
      setLoading(false);
      return;
    }

    // --- ESTÁGIO 2: Handshake com Tiny ERP (Real Data) ---
    addLog("Iniciando Estágio 2: Handshake com Tiny ERP...", 'info');
    setOutput("Estágio 1 OK. Consultando registros reais...");
    
    const apiController = new AbortController();
    const apiTimeoutId = setTimeout(() => apiController.abort(), 3000);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/orders/list', { 
        method: 'POST',
        signal: apiController.signal 
      });
      clearTimeout(apiTimeoutId);
      
      const duration = Date.now() - startTime;
      const data = await response.json();
      
      setStatus(response.status);
      setOutput(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        addLog(`Tiny ERP respondeu em ${duration}ms.`, 'success');
      } else {
        addLog(`Tiny ERP retornou erro: ${data.details || data.error}`, 'error');
      }

    } catch (err: any) {
      clearTimeout(apiTimeoutId);
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout ? "TIMEOUT (3s): Tiny ERP demorou a responder." : `ERRO API: ${err.message}`;
      addLog(errorMsg, 'error');
      setOutput(`FALHA NO ESTÁGIO 2:\n${errorMsg}\n\nVerifique o token no lib/env.ts.`);
      setStatus(isTimeout ? 408 : 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-in fade-in duration-700">
      {/* Terminal Header */}
      <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-olie-500/10 rounded-2xl flex items-center justify-center text-olie-500">
            <Terminal size={20} />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-1">Health Inspector V5</h3>
            <span className="text-[8px] font-medium text-stone-600 italic">Protocolo de Diagnóstico em Duas Etapas</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { setLogs([]); setOutput("Aguardando comando..."); setStatus(null); }}
            className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-stone-600 hover:text-rose-500 transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={handleDiagnostic}
            disabled={loading}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
              loading ? 'bg-stone-800 text-stone-500 cursor-wait' : 'bg-white text-black hover:bg-stone-200'
            }`}
          >
            {loading ? <RefreshCcw size={14} className="animate-spin" /> : <Activity size={14} />}
            {loading ? "Processando..." : "Testar Conectividade"}
          </button>
        </div>
      </div>

      <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Logs and Stats */}
        <div className="lg:col-span-4 space-y-6">
           <div className="p-8 bg-white/5 rounded-4xl border border-white/5 text-center shadow-inner group">
              <div className="flex items-center justify-center gap-2 mb-4">
                 <Timer size={12} className="text-stone-500 group-hover:text-olie-500 transition-colors" />
                 <span className="text-[9px] font-black uppercase text-stone-500 tracking-widest">HTTP Gateway</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                 <span className={`text-6xl font-serif italic ${status === 200 ? 'text-white' : status ? 'text-rose-400' : 'text-stone-800'}`}>
                   {status || '---'}
                 </span>
              </div>
           </div>

           <div className="p-8 bg-white/5 rounded-4xl border border-white/5 h-[300px] flex flex-col">
              <span className="text-[9px] font-black uppercase text-stone-500 tracking-widest mb-6 flex items-center gap-2">
                 <Zap size={12} /> Feed de Diagnóstico
              </span>
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                 {logs.map((log, i) => (
                   <div key={i} className={`text-[10px] font-mono leading-relaxed p-3 rounded-xl border flex items-start gap-3 ${
                     log.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 
                     log.type === 'error' ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' : 
                     'bg-white/5 border-white/5 text-stone-400'
                   } ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
                     {log.type === 'success' ? <CheckCircle2 size={12} className="shrink-0 mt-0.5" /> : 
                      log.type === 'error' ? <XCircle size={12} className="shrink-0 mt-0.5" /> : 
                      <Zap size={12} className="shrink-0 mt-0.5" />}
                     {log.msg}
                   </div>
                 ))}
                 {logs.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-stone-700 italic text-[10px]">
                      Aguardando ativação...
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Code Visualizer */}
        <div className="lg:col-span-8 bg-black/40 rounded-[2.5rem] p-10 border border-white/5 flex flex-col min-h-[500px] shadow-2xl relative group">
           <div className="absolute top-8 right-8 text-stone-800 group-hover:text-white/5 transition-colors">
              <Bug size={80} />
           </div>
           <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4 relative z-10">
              <Code size={16} className="text-stone-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Raw JSON Payload</span>
           </div>
           
           <div className="flex-1 overflow-auto scrollbar-hide font-mono text-[11px] leading-relaxed relative z-10">
              <pre className={`${status === 200 ? 'text-emerald-400/80' : 'text-rose-400/80'} whitespace-pre-wrap`}>
                {output}
              </pre>
           </div>

           <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={14} className="text-stone-700" />
                 <span className="text-[8px] font-black uppercase text-stone-700 tracking-[0.2em]">Olie Identity Protection</span>
              </div>
              <span className="text-[8px] font-mono text-stone-800 uppercase">Latency Target: &lt;3000ms</span>
           </div>
        </div>
      </div>
    </div>
  );
};