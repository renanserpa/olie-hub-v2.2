
"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Package, Truck, Calendar, CreditCard, 
  MapPin, ExternalLink, ChevronRight, CheckCircle2,
  Clock, Scissors, Palette, History, Diamond, Loader2
} from 'lucide-react';
import { Order } from '../../types/index.ts';
import { OrderService } from '../../services/api.ts';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ order: initialOrder, isOpen, onClose }) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (isOpen && order && (order as any).source === 'tiny' && (!order.items || order.items.length === 0)) {
        setIsLoading(true);
        try {
          const fullOrder = await OrderService.getById((order as any).tiny_id || order.id);
          if (fullOrder) {
            setOrder(fullOrder);
          }
        } catch (err) {
          console.error("Failed to hydrate Tiny order details:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchDetails();
  }, [isOpen, order?.id]);

  if (!order) return null;

  const timeline = order.timeline || [
    { status: 'Pedido Recebido', date: order.date, description: 'Pedido integrado via WhatsApp Concierge.' },
    { status: 'Pagamento Confirmado', date: 'Hoje, 09:45', description: 'Transação PIX aprovada no valor total.' },
    { status: 'Em Produção', date: 'Hoje, 11:30', description: 'Item enviado para a bancada de Corte e Preparação.' },
  ];

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-stone-900/30 backdrop-blur-md transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      <aside className={`absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          
          <header className="h-24 px-10 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Diamond size={10} className="text-olie-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Certificado de Pedido</span>
              </div>
              <h2 className="text-2xl font-serif italic text-olie-900">Protocolo #{order.id}</h2>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] bg-stone-50 text-stone-400 hover:text-olie-500 hover:bg-white hover:shadow-sm transition-all">
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide pb-32">
            
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-10 bg-stone-50 rounded-[2.5rem]">
                <Loader2 size={20} className="animate-spin text-olie-500" />
                <span className="text-sm font-serif italic text-stone-500">Sincronizando detalhes do ERP...</span>
              </div>
            )}

            {/* Actionable Status */}
            <section className="bg-stone-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-olie-500/20 to-transparent" />
               <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-olie-300">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-1">Status Operacional</p>
                      <p className="text-xl font-serif italic font-bold">{order.status}</p>
                    </div>
                  </div>
                  <button className="h-10 px-5 bg-olie-500 hover:bg-olie-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-olie-500/20">
                    Gerenciar
                  </button>
               </div>
            </section>

            {/* Customer Relationship Info */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 border-b border-stone-100 pb-3">Titular do Pedido</h3>
              <div className="flex items-center gap-6 p-6 bg-stone-50/50 rounded-3xl border border-stone-100 group cursor-pointer hover:bg-white hover:shadow-sm transition-all">
                <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center font-serif italic text-2xl text-olie-500 shadow-sm border border-stone-100">
                  {order.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-serif italic font-bold text-lg text-stone-800 leading-none mb-2">{order.name}</h4>
                  <p className="text-xs text-stone-400 font-medium">{order.customer_email || 'contato@cliente.com.br'}</p>
                  <div className="flex gap-2 mt-3">
                     <span className="px-2 py-0.5 bg-stone-100 text-[8px] font-black uppercase text-stone-400 rounded">{(order as any).source === 'tiny' ? 'Integração Tiny' : 'Mock Data'}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-200 group-hover:text-olie-500 transition-colors" />
              </div>
            </section>

            {/* Detailed Items / The DNA */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 border-b border-stone-100 pb-3">DNA do Produto</h3>
              {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                <div key={idx} className="bg-white border border-stone-100 rounded-[3rem] p-8 shadow-sm space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-olie-50/50 transition-colors" />
                  
                  <div className="flex gap-6 relative z-10">
                    <div className="w-24 h-24 bg-stone-50 rounded-[2rem] overflow-hidden border border-stone-100 shrink-0 shadow-inner">
                      <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-serif italic text-xl text-stone-900 leading-tight mb-2">{item.name}</h4>
                      <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest italic">SKU: {order.product}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-5 bg-stone-50 rounded-[2rem] border border-stone-100/50">
                      <div className="flex items-center gap-2 mb-2 text-stone-400">
                        <Palette size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Couro Principal</span>
                      </div>
                      <p className="text-xs font-bold text-stone-800">{item.configuration?.color || 'Padrão'}</p>
                    </div>
                    <div className="p-5 bg-stone-50 rounded-[2rem] border border-stone-100/50">
                      <div className="flex items-center gap-2 mb-2 text-stone-400">
                        <Scissors size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Metais</span>
                      </div>
                      <p className="text-xs font-bold text-stone-800">{item.configuration?.hardware || 'Dourado'}</p>
                    </div>
                  </div>

                  {item.configuration?.personalization_text && (
                    <div className="p-6 bg-olie-900 text-white rounded-[2rem] flex justify-between items-center shadow-xl shadow-stone-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={14} className="text-olie-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Personalização</span>
                      </div>
                      <p className="font-serif italic text-2xl font-bold tracking-tight">{item.configuration.personalization_text}</p>
                    </div>
                  )}
                </div>
              )) : !isLoading && (
                <div className="text-center py-10 opacity-30 italic text-sm">Itens não carregados.</div>
              )}
            </section>

            {/* Traceability / Log */}
            <section className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 border-b border-stone-100 pb-3">Histórico de Rastro</h3>
              <div className="relative pl-10 space-y-12">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-stone-100" />
                {timeline.map((event, i) => (
                  <div key={i} className="relative flex gap-6">
                    <div className={`absolute -left-[39px] top-1.5 h-6 w-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${i === 0 ? 'bg-olie-500 scale-125' : 'bg-stone-200'}`}>
                       {i === 0 && <Clock size={10} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-2">
                        <h4 className={`text-xs font-black uppercase tracking-widest ${i === 0 ? 'text-olie-900' : 'text-stone-400'}`}>{event.status}</h4>
                        <span className="text-[10px] font-bold text-stone-300">{event.date}</span>
                      </div>
                      <p className="text-[13px] text-stone-600 font-medium leading-relaxed italic font-serif">"{event.description}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          <footer className="p-8 border-t border-stone-100 bg-white grid grid-cols-2 gap-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
             <button className="flex items-center justify-center gap-3 h-14 bg-stone-100 text-stone-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all">
               <Truck size={16} />
               Logística
             </button>
             <button className="flex items-center justify-center gap-3 h-14 bg-olie-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-stone-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
               <ExternalLink size={16} />
               Ver no Tiny
             </button>
          </footer>
        </div>
      </aside>
    </div>
  );
};
