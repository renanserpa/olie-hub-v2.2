
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, Search, ChevronRight, Clock, Package, CheckCircle2, 
  AlertCircle, RefreshCcw, CloudOff, Cloud,
  ShoppingBag, Hammer, ArrowUpRight
} from 'lucide-react';
import { OrderService } from '../../services/api.ts';
import { OrderDetailDrawer } from '../../components/orders/order-detail-drawer.tsx';
import { SmartOrderModal } from '../../components/orders/smart-order-modal.tsx';
import { Order } from '../../types/index.ts';
import { MOCK_PRODUCTS } from '../../lib/constants.ts';
import { supabase } from '../../lib/supabase.ts';

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pipeline, setPipeline] = useState<any>({ aguardando: 0, producao: 0, expedicao: 0, concluidos: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isRealData, setIsRealData] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (orders.length === 0) setLoading(true);
    
    // Safety Net: Timeout forçado para garantir que o loading saia da tela
    const safetyTimeout = setTimeout(() => {
        if (loading) setLoading(false);
    }, 7000);

    try {
      setSyncError(null);
      const [result, p] = await Promise.all([
        OrderService.getList(),
        OrderService.getPipelineSummary()
      ]);
      
      setOrders(Array.isArray(result.data) ? result.data : []);
      setIsRealData(result.isRealData);
      setPipeline(p);
      
      if (result.error) setSyncError(result.error);
    } catch (err) {
      console.warn("PedidosPage: Falha ao carregar dados.", err);
      setSyncError("Não foi possível conectar ao Tiny ERP. Operando em modo offline.");
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    if (supabase) {
      const channel = supabase
        .channel('realtime_orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          loadData(false);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(o.id).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-stone-50">
       <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
          <p className="font-serif italic text-stone-300 text-lg">Sincronizando registros comerciais...</p>
       </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col overflow-hidden h-full bg-[#FAF9F6]">
      <header className="h-24 px-12 flex items-center justify-between shrink-0 bg-white border-b border-stone-100 z-50">
        <div className="flex items-center gap-10">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 block mb-1">Commercial Flow</span>
            <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Gestão de Vendas</h1>
          </div>

          <div className="hidden lg:flex items-center gap-6 pl-10 border-l border-stone-100">
             <div className="flex items-center gap-2">
                {isRealData ? <Cloud size={14} className="text-emerald-500" /> : <CloudOff size={14} className="text-amber-500" />}
                <span className="text-[10px] font-black uppercase text-stone-600">
                  {isRealData ? 'Tiny ERP Conectado' : 'Modo Offline'}
                </span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="w-12 h-12 flex items-center justify-center bg-stone-50 border border-stone-100 rounded-2xl text-stone-400 hover:text-olie-500 transition-all active:scale-95 group shadow-sm"
          >
            <RefreshCcw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-olie-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-medium w-64 outline-none transition-all shadow-inner"
            />
          </div>

          <button 
            onClick={() => setIsNewOrderModalOpen(true)}
            className="h-14 px-8 bg-olie-900 text-white rounded-[1.8rem] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-stone-200/50 text-[10px] font-black uppercase tracking-widest active:scale-[0.98]"
          >
            <Plus size={18} /> Novo Pedido
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-12 space-y-12">
        {syncError && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-4 text-rose-700">
                <AlertCircle size={24} />
                <div className="max-w-xl">
                   <p className="text-[10px] font-black uppercase tracking-widest">Sincronização Restrita</p>
                   <p className="text-sm font-medium">{syncError}</p>
                </div>
             </div>
             <button onClick={() => loadData(true)} className="px-6 py-2 bg-white rounded-xl text-[9px] font-black uppercase border border-rose-200">Reconectar</button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard label="Aguardando" count={pipeline?.aguardando || 0} icon={<Clock size={20}/>} color="amber" />
          <StatCard label="Produção" count={pipeline?.producao || 0} icon={<Hammer size={20}/>} color="olie" />
          <StatCard label="Logística" count={pipeline?.expedicao || 0} icon={<Package size={20}/>} color="blue" />
          <StatCard label="Sucesso" count={pipeline?.concluidos || 0} icon={<CheckCircle2 size={20}/>} color="emerald" />
        </div>

        <div className="bg-white rounded-[3.5rem] border border-stone-100 shadow-olie-soft overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-50 bg-stone-50/20">
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Protocolo</th>
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Cliente & Peça</th>
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Status Ativo</th>
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Investimento</th>
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Sincronia</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)} 
                  className={`group hover:bg-[#FDFBF9] transition-all cursor-pointer animate-in fade-in duration-500`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-10 py-8">
                    <span className="text-base font-serif italic font-bold text-olie-900">#{order.id}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center font-serif italic text-xl text-stone-400 group-hover:bg-olie-50 group-hover:text-olie-500 transition-all border border-stone-100">
                        {order.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-stone-800 text-sm truncate">{order.name}</p>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-0.5 truncate max-w-[200px] italic">{order.product || 'Pedido Custom'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-50 text-stone-500 rounded-full border border-stone-100 group-hover:bg-olie-900 group-hover:text-white transition-all shadow-sm">
                       <span className="text-[9px] font-black uppercase tracking-widest">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 font-black text-sm text-stone-800 tracking-tight">{order.price || 'R$ 0,00'}</td>
                  <td className="px-10 py-8 text-[10px] font-black text-stone-300 uppercase tracking-widest">{order.date || '--/--/--'}</td>
                  <td className="px-10 py-8 text-right">
                    <div className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center text-stone-200 group-hover:text-olie-500 group-hover:border-olie-500/20 group-hover:scale-110 transition-all duration-500">
                       <ArrowUpRight size={18} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center opacity-30 italic font-serif">
                       <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                       <p className="text-xl">Aguardando dados das bancadas...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailDrawer order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
      
      <SmartOrderModal 
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        clientName="Venda Direta"
        catalog={MOCK_PRODUCTS}
        onOrderComplete={() => loadData(true)}
      />
    </main>
  );
}

function StatCard({ label, count, icon, color }: any) {
  const themes: any = { 
    olie: 'text-olie-500 bg-olie-50 border-olie-100', 
    amber: 'text-amber-600 bg-amber-50 border-amber-100', 
    blue: 'text-blue-500 bg-blue-50 border-blue-100', 
    emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100' 
  };
  return (
    <div className={`p-8 rounded-[3rem] border transition-all hover:shadow-olie-lg bg-white group ${themes[color] || ''}`}>
       <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white border border-inherit flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">{icon}</div>
          <span className="text-4xl font-black font-serif italic text-stone-900 leading-none">{count}</span>
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 italic">{label}</p>
    </div>
  );
}
