
"use client";

import React from 'react';
import { X, History, CheckCircle2, XCircle, Clock, Calendar, Download } from 'lucide-react';
import { SyncService } from '../../services/api.ts';

export const SyncHistoryModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const logs = SyncService.getLogs();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl flex flex-col h-[600px] overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="p-10 border-b border-stone-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400">
                 <History size={20} />
              </div>
              <div>
                 <h2 className="text-2xl font-serif italic text-olie-900">Histórico Cloud</h2>
                 <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Auditoria de sincronização em tempo real</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={SyncService.exportLogsCSV}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 hover:text-olie-500 transition-all"
                title="Exportar CSV"
              >
                <Download size={18} />
              </button>
              <button onClick={onClose} className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
                <X size={20} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-4 scrollbar-hide">
           {logs.length > 0 ? logs.map((log: any) => (
             <div key={log.id} className="p-6 rounded-3xl border border-stone-50 bg-stone-50/30 flex items-center justify-between group hover:bg-white hover:border-stone-100 transition-all">
                <div className="flex items-center gap-6">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.status === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                      {log.status === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                   </div>
                   <div>
                      <p className="text-xs font-bold text-stone-800">{log.type}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">
                        {log.status === 'success' ? `${log.count} itens sincronizados` : 'Falha na conexão'}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   <p className="text-[8px] font-bold text-stone-200 uppercase">{new Date(log.timestamp).toLocaleDateString()}</p>
                </div>
             </div>
           )) : (
             <div className="h-full flex flex-col items-center justify-center opacity-20 italic font-serif">
                <Clock size={48} strokeWidth={1} className="mb-4" />
                <p>Nenhum log disponível.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
