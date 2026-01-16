
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Clock, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  Filter,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Truck,
  // Fix: Added missing Scissors import used in StatCard
  Scissors
} from 'lucide-react';
import { OrderService } from '../../services/api.ts';
import { OrderDetailDrawer } from '../../components/orders/order-detail-drawer.tsx';
import { Order } from '../../types/index.ts';

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pipeline, setPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [o, p] = await Promise.all([
          OrderService.getList(),
          OrderService.getPipelineSummary()
        ]);
        setOrders(o as any);
        setPipeline(p);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const statusConfig: any = {
    'Produção': { bg: 'bg-olie-500', text: 'text-white', icon: Clock },
    'Aguardando': { bg: 'bg-stone-100', text: 'text-stone-400', icon: AlertCircle },
    'Enviado': { bg: 'bg-blue-500', text: 'text-white', icon: Truck },
    'Finalizado': { bg: 'bg-stone-800', text: 'text-white', icon: CheckCircle2 }
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
             <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-stone-300 tracking-widest">Receita Mensal</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-olie-900">R$ 42.8k</span>
                    <TrendingUp size={10} className="text-emerald-500" />
                  </div>
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-stone-50 p-1.5 rounded-2xl border border-stone-100 flex gap-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-olie-500' : 'text-stone-300'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-olie-500' : 'text-stone-300'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-olie-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar pedido..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-medium focus:ring-4 focus:ring-olie-500/5 outline-none transition-all w-48 focus:w-64 focus:bg-white"
            />
          </div>

          <button className="h-12 px-6 bg-olie-900 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg text-[10px] font-black uppercase tracking-widest">
            <Plus size={16} />
            Novo Pedido
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-10 space-y-10">
        
        {/* KPI Row - Refined */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Aguardando" count={pipeline?.aguardando} icon={<Clock size={16}/>} color="amber" />
          <StatCard label="Produção" count={pipeline?.producao} icon={<Scissors size={16}/>} color="olie" />
          <StatCard label="Logística" count={pipeline?.expedicao} icon={<Truck size={16}/>} color="blue" />
          <StatCard label="Sucesso" count={pipeline?.concluidos} icon={<CheckCircle2 size={16}/>} color="emerald" />
        </div>

        {viewMode === 'list' ? (
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
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="group hover:bg-stone-50/80 transition-all cursor-pointer"
                  >
                    <td className="px-10 py-8">
                       <span className="text-sm font-serif italic font-bold text-olie-700">#{order.id}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center font-serif italic text-stone-400">
                          {order.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-stone-800 text-sm group-hover:text-olie-500 transition-colors">{order.name}</p>
                          <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-0.5">{order.product}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${statusConfig[order.status]?.bg} ${statusConfig[order.status]?.text} shadow-sm`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{order.status}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 font-black text-sm text-stone-800">{order.price}</td>
                    <td className="px-10 py-8 text-[10px] font-bold text-stone-300 uppercase tracking-tighter">{order.date}</td>
                    <td className="px-10 py-8 text-right">
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-200 group-hover:bg-olie-500 group-hover:text-white transition-all transform group-hover:scale-110">
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOrders.map((order) => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-olie-soft hover:shadow-olie-lg hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-6">
                   <span className="text-xl font-serif italic font-bold text-olie-500">#{order.id}</span>
                   <div className={`p-2 rounded-xl ${statusConfig[order.status]?.bg} ${statusConfig[order.status]?.text}`}>
                      <CheckCircle2 size={16} />
                   </div>
                </div>
                <h4 className="text-lg font-bold text-stone-800 mb-1">{order.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-6">{order.product}</p>
                <div className="flex justify-between items-end pt-6 border-t border-stone-50">
                  <div>
                    <p className="text-[9px] font-black uppercase text-stone-300 mb-1">Total</p>
                    <p className="text-xl font-black text-stone-800">{order.price}</p>
                  </div>
                  <button className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-300 group-hover:bg-olie-900 group-hover:text-white transition-all flex items-center justify-center">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OrderDetailDrawer 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </main>
  );
}

function StatCard({ label, count, icon, color }: any) {
  const themes: any = {
    olie: 'text-olie-500 bg-olie-50/50 border-olie-100',
    stone: 'text-stone-400 bg-stone-50 border-stone-100',
    rose: 'text-rose-500 bg-rose-50 border-rose-100',
    emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100'
  };
  return (
    <div className={`p-6 rounded-[2rem] border transition-all hover:shadow-lg bg-white ${themes[color] || themes.stone}`}>
       <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-inherit flex items-center justify-center shadow-sm">
             {icon}
          </div>
          <span className="text-3xl font-black font-serif italic text-stone-900 leading-none">{count}</span>
       </div>
       <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 italic">{label}</p>
    </div>
  );
}
