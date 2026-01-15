
"use client";

import React, { useState } from 'react';
import { 
  X, User, ShoppingBag, Package, ClipboardCopy, 
  Truck, ChevronRight, Star, Clock 
} from 'lucide-react';
import { Product, Order } from '../../types/index.ts';

interface ActionPanelProps {
  isOpen: boolean; // Kept for API compatibility
  onClose: () => void;
  client: any;
  catalog: Product[];
  recentOrders: Order[];
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  onClose, client, catalog, recentOrders
}) => {
  const [activeTab, setActiveTab] = useState<'crm' | 'orders' | 'catalog'>('crm');

  const handlePix = () => {
    alert("Gerando chave PIX para o pedido atual...");
    // Future integration with OrderService
  };

  const handleFreight = () => {
    alert("Calculando frete via Correios/Melhor Envio...");
    // Future integration with ShippingService
  };

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden w-full">
      {/* Header Fixo (h-16 to match ChatWindow) */}
      <div className="h-16 px-6 border-b border-[#F2F0EA] flex items-center justify-between shrink-0 bg-white z-20">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Contexto</span>
        <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full text-stone-400 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-2 bg-white border-b border-[#F2F0EA] shrink-0">
        {[
          { id: 'crm', icon: User, label: 'CRM' },
          { id: 'orders', icon: ShoppingBag, label: 'Pedidos' },
          { id: 'catalog', icon: Package, label: 'Catálogo' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-[#FAF9F6] text-[#C08A7D]' 
                : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
            }`}
          >
            <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[#FFFFFF]">
        
        {/* CRM TAB */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             
             {/* Profile Card */}
             <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-[#C08A7D] rounded-[1.5rem] flex items-center justify-center text-white text-xl font-serif italic shadow-xl shadow-[#C08A7D]/20 mb-3">
                  {client?.avatar || 'C'}
                </div>
                <h2 className="text-lg font-serif italic text-[#333333]">{client?.name || 'Cliente Olie'}</h2>
                <div className="flex justify-center gap-1 mt-2 flex-wrap">
                   {client?.tags?.map((tag: string) => (
                     <span key={tag} className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[9px] font-black uppercase tracking-wider text-stone-400">{tag}</span>
                   )) || <span className="text-[9px] text-stone-300">Sem etiquetas</span>}
                </div>
             </div>

             <div className="p-4 bg-[#FAF9F6] rounded-2xl space-y-4 border border-[#F2F0EA]">
                <div className="flex items-center gap-3 text-stone-600">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#C08A7D] shadow-sm"><Star size={14}/></div>
                   <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">LTV Total</p>
                      <p className="font-serif italic font-bold">R$ {client?.ltv || '0,00'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-stone-600">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#C08A7D] shadow-sm"><Clock size={14}/></div>
                   <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Desde</p>
                      <p className="font-serif italic font-bold">12 Out, 2023</p>
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 pl-2">Notas</p>
                <textarea 
                  className="w-full h-24 bg-[#FAF9F6] border border-[#F2F0EA] rounded-2xl p-4 text-xs text-stone-600 focus:outline-none focus:border-[#C08A7D]/30 resize-none placeholder:text-stone-300"
                  placeholder="Observações do cliente..."
                />
             </div>
          </div>
        )}

        {/* PEDIDOS TAB */}
        {activeTab === 'orders' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <button className="w-full py-3 border-2 border-dashed border-[#F2F0EA] rounded-2xl text-stone-400 hover:border-[#C08A7D]/30 hover:text-[#C08A7D] hover:bg-[#FAF9F6] transition-all flex items-center justify-center gap-2 group">
                 <ShoppingBag size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Novo Pedido</span>
              </button>

              {recentOrders.map(order => (
                 <div key={order.id} className="p-4 bg-white border border-[#F2F0EA] rounded-2xl hover:shadow-lg transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <span className="font-serif italic font-black text-stone-800">#{order.id}</span>
                       <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                          order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400'
                       }`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-stone-500 mb-2">{order.date}</p>
                    <div className="flex justify-between items-center border-t border-[#F2F0EA] pt-2 mt-2">
                       <span className="font-black text-xs text-[#C08A7D]">{order.price || `R$ ${order.total}`}</span>
                       <ChevronRight size={14} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                 </div>
              ))}
           </div>
        )}

        {/* CATÁLOGO TAB */}
        {activeTab === 'catalog' && (
           <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
              {catalog.map(product => (
                 <div key={product.id} className="group cursor-pointer">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF9F6] mb-2 relative">
                       <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#C08A7D] shadow-md opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                          <ClipboardCopy size={14} />
                       </button>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-wide text-stone-700 truncate">{product.name}</h4>
                    <p className="text-[10px] text-stone-400">R$ {product.base_price.toFixed(2)}</p>
                 </div>
              ))}
           </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-6 border-t border-[#F2F0EA] bg-[#FAF9F6] space-y-3 shrink-0">
         <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handlePix}
              className="py-3 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
            >
               <span className="text-[10px] font-black uppercase tracking-widest">PIX</span>
            </button>
            <button 
              onClick={handleFreight}
              className="py-3 bg-white border border-[#F2F0EA] text-stone-600 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors active:scale-95"
            >
               <Truck size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Frete</span>
            </button>
         </div>
      </div>
    </div>
  );
};
