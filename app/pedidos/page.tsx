
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, Search, ChevronRight, Clock, Package, CheckCircle2, 
  AlertCircle, LayoutGrid, List as ListIcon, Filter,
  ArrowUpRight, TrendingUp, CreditCard, Truck, Scissors,
  RefreshCcw, Database, CloudOff, Cloud
} from 'lucide-react';
import { OrderService } from '../../services/api.ts';
import { OrderDetailDrawer } from '../../components/orders/order-detail-drawer.tsx';
import { Order } from '../../types/index.ts';

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isRealData, setIsRealData] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    try {
      setSyncErrorMessage(null);
      const [result, p] = await Promise.all([
        OrderService.getList(),
        OrderService.getPipelineSummary()
      ]);
      
      // Garantir que orders seja sempre um array
      const dataArray = Array.isArray(result.data) ? result.data : [];
      setOrders(dataArray as any);
      setIsRealData(result.isRealData);
      setPipeline(p);
      
      if (result.error) {
        setSyncErrorMessage(result.error);
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
      setSyncErrorMessage("Erro inesperado ao conectar com o serviço de pedidos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(o.id).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const statusConfig: any = {
    'Produção': { bg: 'bg-olie-500', text: 'text-white', icon: Clock },
    'Aguardando': { bg: 'bg-stone-100', text: 'text-stone-400', icon: AlertCircle },
    'Aprovado': { bg: 'bg-emerald-500', text: 'text-white', icon: CheckCircle2 },
    'Enviado': { bg: 'bg-blue-500', text: 'text-white', icon: Truck },
    'Finalizado': { bg: 'bg-stone-800', text: 'text-white', icon: CheckCircle2 },
    'Pendente': { bg: 'bg-amber-100', text: 'text-amber-600', icon: Clock }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-stone-50">
      <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="flex-1 flex flex-col overflow-hidden h-full bg-[#FAF9F6]">
      <header className="h-24 px-12 flex items-center justify-between bg-white border-b border-stone-100 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-10">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 block mb-1">Commercial Flow</span>
            <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Gestão de Vendas</h1>
          </div>

          <div className="hidden lg:flex items-center gap-6 pl-10 border-l border-stone-100">
             <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-stone-300 tracking-widest">Sincronização</span>
                <div className="flex items-center gap-2">
                   {isRealData ? (
                     <><Cloud size={14} className="text-emerald-500" /><span className="text-[10px] font-bold text-stone-600 uppercase">Tiny ERP Ativo</span></>
                   ) : (
                     <><CloudOff size={14} className="text-amber-500" /><span className="text-[10px] font-bold text-amber-600 uppercase">Modo Offline</span></>
                   )}
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="w-10 h-10 flex items-center justify-center bg-stone-50 border border-stone-100 rounded-xl text-stone-400 hover:text-olie-500 transition-all active:scale-95 group"
          >
            <RefreshCcw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <div className="bg-stone-50 p-1.5 rounded-2xl border border-stone-100 flex gap-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-white shadow-sm text-olie-500' : 'text-stone-300'}`}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl ${viewMode === 'list' ? 'bg-white shadow-sm text-olie-500' : 'text-stone-300'}`}><ListIcon size={18} /></button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
            <input 
              type="text" 
              placeholder="Buscar pedido..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-medium w-48 focus:w-64 transition-all"
            />
          </div>

          <button className="h-12 px-6 bg-olie-900 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg text-[10px] font-black uppercase tracking-widest">
            <Plus size={16} /> Novo Pedido
          </button>
        </div>
      </header>

      {syncErrorMessage && (
        <div className="mx-12 mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4">
           <div className="flex items-center gap-3 text-amber-700">
              <CloudOff size={18} />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest">Falha na Sincronização</span>
                 <span className="text-xs font-medium opacity-80">{syncErrorMessage}</span>
              </div>
           </div>
           <button onClick={() => loadData(true)} className="px-4 py-2 bg-white rounded-xl text-[9px] font-black uppercase border border-amber-200 shadow-sm">Tentar Conexão</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide p-10 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Aguardando" count={pipeline?.aguardando} icon={<Clock size={16}/>} color="amber" />
          <StatCard label="Produção" count={pipeline?.producao} icon={<Scissors size={16}/>} color="olie" />
          <StatCard label="Logística" count={pipeline?.expedicao} icon={<Truck size={16}/>} color="blue" />
          <StatCard label="Sucesso" count={pipeline?.concluidos} icon={<CheckCircle2 size={16}/>} color="emerald" />
        </div>

        <div className="bg-white rounded-[3rem] border border-stone-100 shadow-olie-soft overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-50 bg-stone-50/30">
                <th className="px-10 py-6 text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">ID Pedido</th>
                <th className="px-10 py-6 text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">Cliente & Produto</th>
                <th className="px-10 py-6 text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">Status</th>
                <th className="px-10 py-6 text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">Valor</th>
                <th className="px-10 py-6 text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">Data</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="group hover:bg-stone-50/80 transition-all cursor-pointer">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-serif italic font-bold text-olie-700">#{order.id}</span>
                        {(order as any).source === 'tiny' && <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md"><Database size={10} /><span className="text-[8px] font-black uppercase">ERP</span></div>}
                     </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center font-serif italic text-stone-400">{order.name?.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{order.name}</p>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-0.5 truncate max-w-[200px]">{order.product}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${statusConfig[order.status]?.bg || 'bg-stone-100'} ${statusConfig[order.status]?.text || 'text-stone-400'} shadow-sm`}>
                      <span className="text-[9px] font-black uppercase tracking-widest">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 font-black text-sm text-stone-800">{order.price}</td>
                  <td className="px-10 py-8 text-[10px] font-bold text-stone-300 uppercase">{order.date}</td>
                  <td className="px-10 py-8 text-right"><ArrowUpRight size={18} className="text-stone-200 group-hover:text-olie-500" /></td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-10 py-32 text-center opacity-30 italic font-serif">Nenhum pedido encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailDrawer order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
    </main>
  );
}

function StatCard({ label, count, icon, color }: any) {
  const themes: any = { olie: 'text-olie-500 bg-olie-50/50', amber: 'text-amber-600 bg-amber-50', blue: 'text-blue-500 bg-blue-50', emerald: 'text-emerald-500 bg-emerald-50' };
  return (
    <div className={`p-6 rounded-[2rem] border transition-all hover:shadow-lg bg-white ${themes[color] || ''}`}>
       <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-inherit flex items-center justify-center shadow-sm">{icon}</div>
          <span className="text-3xl font-black font-serif italic text-stone-900 leading-none">{count}</span>
       </div>
       <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 italic">{label}</p>
    </div>
  );
}
