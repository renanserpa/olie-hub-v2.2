
"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Loader2, RefreshCcw, Eye, EyeOff } from 'lucide-react';

export const EnvStatus: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const check = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/env-check');
      setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { check(); }, []);

  return (
    <div className="olie-card p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-emerald-500" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Ambiente de Produção (Vercel)</h4>
        </div>
        <button 
          onClick={check} 
          disabled={loading}
          className="w-10 h-10 flex items-center justify-center bg-stone-50 rounded-xl hover:bg-stone-100 transition-all"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.variables?.map((v: any) => (
          <div key={v.key} className="p-4 bg-stone-50/50 rounded-2xl border border-stone-100 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase text-stone-300 tracking-widest">{v.scope}</span>
              <span className="text-[10px] font-bold text-stone-700 font-mono">{v.key}</span>
            </div>
            <div className="flex items-center gap-3">
              {v.exists ? (
                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded-lg">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-600">DEFINIDO ({v.length} chars)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1 bg-rose-50 rounded-lg">
                  <ShieldAlert size={12} className="text-rose-500" />
                  <span className="text-[9px] font-black text-rose-600">AUSENTE</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
