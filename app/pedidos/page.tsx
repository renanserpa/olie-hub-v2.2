
"use client";

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Clock, 
  Package, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { OrderService } from '../../services/api.ts';

export default function PedidosPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [o, p] = await Promise.all([
          OrderService.getList(),
          OrderService.getPipelineSummary()
        ]);
        setOrders(o);
        setPipeline(p);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statusColors: any = {
    'Produção': 'bg-olie-500 text-white shadow-lg shadow-olie-500/20',
    'Aguardando': 'bg-stone-100 text-stone-400 border border-stone-200',
    'Enviado': 'bg-blue-500 text-white shadow-lg shadow-blue-500/20',
    'Finalizado': 'bg-stone-800 text-white shadow-lg shadow-black/20'
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide h-full">
      <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#F2F0EA]">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-black italic tracking-tighter">Pedidos</h1>
          <div className="px-4 py-1.5 bg-olie-500/10 rounded-full border border-olie-500/20">
            <span className="text-[10px] font-black text-olie-700 uppercase tracking-widest">{orders.length} Ativos</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-olie-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Nº Pedido ou Cliente" 
              className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-medium focus:ring-4 focus:ring-olie-500/5 outline-none transition-all w-64 focus:bg-white"
            />
          </div>
          <button className="h-12 w-12 bg-stone-800 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-lg shadow-black/10 hover:scale-105 active:scale-95">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="p-12 space-y-12 max-w-7xl mx-auto w-full">
        {/* Kanban / Pipeline View Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <PipelineCard label="Produção" count={pipeline?.producao} icon={<Clock size={20}/>} color="olie" />
          <PipelineCard label="Expedição" count={pipeline?.expedicao} icon={<Package size={20}/>} color="stone" />
          <PipelineCard label="Aguardando" count={pipeline?.aguardando} icon={<AlertCircle size={20}/>} color="rose" />
          <PipelineCard label="Concluídos" count={pipeline?.concluidos} icon={<CheckCircle2 size={20}/>} color="emerald" />
        </div>

        <div className="olie-card bg-white shadow-xl shadow-stone-200/20 border-stone-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-[0.3em]">Nº Pedido</th>
                  <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-[0.3em]">Cliente</th>
                  <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-[0.3em]">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-[0.3em]">Valor</th>
                  <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-[0.3em]">Data</th>
                  <th className="px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-stone-50/50 transition-all cursor-pointer">
                    <td className="px-10 py-8 font-serif italic font-black text-lg text-olie-700">#{order.id}</td>
                    <td className="px-10 py-8">
                      <p className="font-bold text-stone-800 group-hover:text-olie-500 transition-colors">{order.name}</p>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1 italic">{order.product}</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap inline-block ${statusColors[order.status] || 'bg-stone-100 text-stone-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 font-black text-sm text-stone-700">{order.price}</td>
                    <td className="px-10 py-8 text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{order.date}</td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-3 text-stone-200 group-hover:text-olie-500 transition-all transform group-hover:translate-x-1">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300 italic">Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function PipelineCard({ label, count, icon, color }: any) {
  const colors: any = {
    olie: 'border-olie-100 bg-white text-olie-500 shadow-olie-500/5',
    stone: 'border-stone-100 bg-white text-stone-400 shadow-stone-400/5',
    rose: 'border-rose-100 bg-white text-rose-400 shadow-rose-400/5',
    emerald: 'border-emerald-100 bg-white text-emerald-400 shadow-emerald-400/5'
  };
  return (
    <div className={`p-8 border rounded-[2.5rem] ${colors[color]} shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer hover:-translate-y-1`}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-current group-hover:text-white transition-all duration-500 shadow-sm">
          {icon}
        </div>
        <span className="text-4xl font-black italic tracking-tighter text-stone-800">{count}</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 group-hover:text-stone-800 transition-colors italic">{label}</p>
    </div>
  );
}
