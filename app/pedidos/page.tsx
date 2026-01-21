
"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, ChevronRight, Clock, Package, CheckCircle2, 
  AlertCircle, RefreshCcw, CloudOff, Cloud, ShoppingBag, Hammer, ArrowUpRight,
  Loader2
} from 'lucide-react';
import { OrderService } from '../../services/api.ts';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { OrderDetailDrawer } from '../../components/orders/order-detail-drawer.tsx';
import { SmartOrderModal } from '../../components/orders/smart-order-modal.tsx';
import { Order } from '../../types/index.ts';
import { MOCK_PRODUCTS } from '../../lib/constants.ts';

export default function PedidosPage() {
  const queryClient = useQueryClient();
  const { searchTerm } = useSearch();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Hook Reativo: TanStack Query
  const { 
    data: response = { data: [], error: null, isRealData: false }, 
    isLoading, 
    isFetching,
    error 
  } = useQuery({
    queryKey: ['orders'],
    queryFn: () => OrderService.getList(),
  });

  const orders = response.data || [];
  const isRealData = response.isRealData;

  const pipeline = useMemo(() => OrderService.getPipelineSummary(orders), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-stone-50">
       <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-16 h-16 text-olie-500 animate-spin" />
          <p className="font-serif italic text-stone-300 text-lg">Acessando Cloud Olie...</p>
       </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAF9F6] overflow-hidden">
      <header className="h-24 px-12 flex items-center justify-between shrink-0 bg-white border-b border-stone-100 z-50 shadow-sm">
        <div className="flex items-center gap-10">
          <div>
            <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Gestão de Vendas</h1>
            <div className="flex items-center gap-2 mt-2">
               {isRealData ? <Cloud size={12} className="text-emerald-500" /> : <CloudOff size={12} className="text-rose-500" />}
               <span className={`text-[9px] font-black uppercase ${isRealData ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {isRealData ? 'Tiny ERP Conectado' : 'Conexão Offline'}
               </span>
               {isFetching && <span className="text-[8px] text-stone-300 animate-pulse ml-2 italic">Atualizando...</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-olie-500 transition-colors" size={16} />
            <div className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-black uppercase text-stone-400 tracking-widest min-w-64">
              {searchTerm || 'Filtro Global Ativo'}
            </div>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={isFetching}
            className="w-12 h-12 flex items-center justify-center bg-stone-50 border border-stone-100 rounded-2xl text-stone-400 hover:text-olie-500 transition-all"
          >
            <RefreshCcw size={20} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsNewOrderModalOpen(true)}
            className="h-14 px-8 bg-olie-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus size={18} /> Novo Pedido
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-12 space-y-12">
        {response.error && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center justify-between">
             <div className="flex items-center gap-4 text-rose-700">
                <AlertCircle size={24} />
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Inconsistência Detectada</p>
                   <p className="text-sm font-medium">{response.error}</p>
                </div>
             </div>
             <button onClick={handleRefresh} className="px-6 py-2 bg-white rounded-xl text-[9px] font-black uppercase border border-rose-200">Reconectar</button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard label="Aguardando" count={pipeline.aguardando} icon={<Clock size={20}/>} color="amber" />
          <StatCard label="Produção" count={pipeline.producao} icon={<Hammer size={20}/>} color="olie" />
          <StatCard label="Logística" count={pipeline.expedicao} icon={<Package size={20}/>} color="blue" />
          <StatCard label="Sucesso" count={pipeline.concluidos} icon={<CheckCircle2 size={20}/>} color="emerald" />
        </div>

        <div className="bg-white rounded-[3.5rem] border border-stone-100 shadow-olie-soft overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-50 bg-stone-50/20">
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Protocolo</th>
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Cliente</th>
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Status</th>
                <th className="px-10 py-8 text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Total</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)} 
                  className="group hover:bg-stone-50 transition-all cursor-pointer"
                >
                  <td className="px-10 py-8">
                    <span className="text-base font-serif italic font-bold text-olie-900">#{order.id}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center font-serif text-stone-400">{order.name?.charAt(0)}</div>
                      <span className="font-bold text-stone-800 text-sm">{order.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-3 py-1 bg-stone-50 text-stone-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-stone-100">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 font-black text-sm text-stone-800 tracking-tight">{order.price || 'R$ 0,00'}</td>
                  <td className="px-10 py-8 text-right">
                    <ArrowUpRight size={18} className="text-stone-200 group-hover:text-olie-500 transition-all" />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center opacity-30 italic font-serif">
                       <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                       <p className="text-xl">Nenhum pedido encontrado para "{searchTerm}".</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailDrawer order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
      <SmartOrderModal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} clientName="Venda Direta" catalog={MOCK_PRODUCTS} onOrderComplete={() => handleRefresh()} />
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
          <div className="w-14 h-14 rounded-2xl bg-white border border-inherit flex items-center justify-center shadow-sm">{icon}</div>
          <span className="text-4xl font-black font-serif italic text-stone-900 leading-none">{count}</span>
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 italic">{label}</p>
    </div>
  );
}
