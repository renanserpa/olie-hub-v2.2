"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Database, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function ConnectionDiagnosticPage() {
  // Local State
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [persist, setPersist] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ count: number | null; message: string }>({ count: null, message: '' });

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('olie_debug_url');
    const savedKey = localStorage.getItem('olie_debug_key');
    if (savedUrl) setUrl(savedUrl);
    if (savedKey) setKey(savedKey);
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) return;

    setStatus('loading');
    setResult({ count: null, message: '' });

    // Save to localStorage if requested
    if (persist) {
      localStorage.setItem('olie_debug_url', url);
      localStorage.setItem('olie_debug_key', key);
    } else {
      localStorage.removeItem('olie_debug_url');
      localStorage.removeItem('olie_debug_key');
    }

    try {
      const supabase = createClient(url, key);
      
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      setStatus('success');
      setResult({ 
        count: count, 
        message: 'Conexão estabelecida com sucesso! O banco de dados respondeu corretamente.' 
      });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setResult({ 
        count: null, 
        message: err.message || 'Erro inesperado ao tentar conectar.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 mb-2 border border-purple-500/30">
            <Database size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Supabase Diagnostic</h1>
          <p className="text-slate-400 text-sm">Teste a conectividade do seu client-side</p>
        </div>

        {/* Card Principal */}
        <div className={`p-6 rounded-3xl border transition-all duration-500 bg-slate-900/40 backdrop-blur-sm ${
          status === 'success' ? 'border-emerald-500/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.1)]' :
          status === 'error' ? 'border-red-500/30 shadow-[0_0_40px_-10px_rgba(239,68,68,0.1)]' :
          'border-slate-800 shadow-xl'
        }`}>
          
          {/* Status Overlay para Success/Error */}
          {status !== 'idle' && status !== 'loading' && (
            <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${
              status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className="mt-0.5">
                {status === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              <div>
                <p className="text-sm font-semibold">{status === 'success' ? 'Sistema Online' : 'Falha na Conexão'}</p>
                <p className="text-xs opacity-80 mt-1">{result.message}</p>
                {status === 'success' && result.count !== null && (
                  <p className="text-xs font-bold mt-2 bg-emerald-500/20 inline-block px-2 py-0.5 rounded">
                    Registros na tabela 'profiles': {result.count}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleTestConnection} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5">
                <Server size={10} /> Supabase Project URL
              </label>
              <input 
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxxx.supabase.co"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-600/50 outline-none transition-all placeholder:text-slate-700 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5">
                <Key size={10} /> Anon / Public Key
              </label>
              <textarea 
                required
                rows={3}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1Ni..."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-600/50 outline-none transition-all placeholder:text-slate-700 font-mono resize-none"
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox"
                id="persist"
                checked={persist}
                onChange={(e) => setPersist(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-offset-slate-900"
              />
              <label htmlFor="persist" className="text-xs text-slate-400 select-none flex items-center gap-1.5">
                <Save size={12} /> Salvar localmente (LocalStorage)
              </label>
            </div>

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2 mt-2"
            >
              {status === 'loading' ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <>
                  Testar Conexão
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="https://app.supabase.com" 
            target="_blank" 
            className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase py-2"
          >
            Dashboard Supabase <ExternalLink size={12} />
          </a>
          {status === 'success' && (
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center justify-center gap-2 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase py-2"
            >
              Ir para o App <ShieldCheck size={12} />
            </button>
          )}
        </div>

        <p className="text-center text-slate-700 text-[10px] uppercase tracking-widest">
          OlieHub V2 • Client Diagnostics Mode
        </p>
      </div>
    </div>
  );
}
