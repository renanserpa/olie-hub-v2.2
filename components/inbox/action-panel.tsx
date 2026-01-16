
"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, User, ShoppingBag, Package, ClipboardCopy, 
  Truck, ChevronRight, ChevronLeft, Star, Clock,
  Eye, Send, CheckCircle2
} from 'lucide-react';
import { Product, Order } from '../../types/index.ts';

interface ActionPanelProps {
  isOpen: boolean; 
  onClose: () => void;
  client: any;
  catalog: Product[];
  recentOrders: Order[];
  forcedTab?: 'crm' | 'orders' | 'catalog' | null;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  onClose, client, catalog, recentOrders, forcedTab
}) => {
  const [activeTab, setActiveTab] = useState<'crm' | 'orders' | 'catalog'>('crm');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Watch for external tab changes
  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
      setCurrentPage(1);
    }
  }, [forcedTab]);

  const handlePix = () => {
    alert("Gerando chave PIX para o pedido atual...");
  };

  const handleFreight = () => {
    alert("Calculando frete via Correios/Melhor Envio...");
  };

  const handleSendProduct = () => {
     alert(`Produto ${quickViewProduct?.name} enviado para o chat.`);
     setQuickViewProduct(null);
  };

  // Pagination Logic
  const totalPages = Math.ceil(catalog.length / ITEMS_PER_PAGE);
  const currentProducts = catalog.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden w-full relative">
      {/* Header Fixo */}
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
            onClick={() => {
              setActiveTab(tab.id as any);
              setCurrentPage(1);
            }}
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
           <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-3 flex-1 content-start">
                  {currentProducts.map(product => (
                     <div key={product.id} className="group cursor-pointer" onClick={() => setQuickViewProduct(product)}>
                        <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF9F6] mb-2 relative">
                           <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                           />
                           
                           {/* Hover Overlay */}
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-800 shadow-xl transform scale-50 group-hover:scale-100 transition-all duration-300">
                                 <Eye size={18} />
                              </div>
                           </div>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-wide text-stone-700 truncate">{product.name}</h4>
                        <p className="text-[10px] text-stone-400">R$ {product.base_price.toFixed(2)}</p>
                     </div>
                  ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#F2F0EA] shrink-0">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-stone-100 text-stone-400 hover:text-[#C08A7D] hover:bg-stone-50 disabled:opacity-30 disabled:hover:text-stone-400 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">
                      Página {currentPage} de {totalPages}
                    </span>

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-stone-100 text-stone-400 hover:text-[#C08A7D] hover:bg-stone-50 disabled:opacity-30 disabled:hover:text-stone-400 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                </div>
              )}
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

      {/* QUICK VIEW MODAL (Fixed Overlay) */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300"
             onClick={() => setQuickViewProduct(null)}
           />
           
           {/* Modal Content */}
           <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <button 
                 onClick={() => setQuickViewProduct(null)}
                 className="absolute top-4 right-4 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-stone-600 z-10 hover:bg-white transition-colors"
              >
                 <X size={16} />
              </button>

              <div className="h-64 bg-stone-100 relative">
                 <img src={quickViewProduct.image_url} className="w-full h-full object-cover" />
                 <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {quickViewProduct.sku_base}
                 </div>
              </div>

              <div className="p-6 space-y-6">
                 <div>
                    <h3 className="text-2xl font-serif italic text-[#1A1A1A] mb-1">{quickViewProduct.name}</h3>
                    <p className="text-stone-400 font-medium text-lg">R$ {quickViewProduct.base_price.toFixed(2)}</p>
                 </div>

                 <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">Cores Disponíveis</p>
                    <div className="flex gap-2">
                       {quickViewProduct.options.colors.map(color => (
                          <div 
                             key={color.value} 
                             className="w-6 h-6 rounded-full border border-stone-200 shadow-sm"
                             style={{ backgroundColor: color.hex }}
                             title={color.label}
                          />
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">Ferragens</p>
                     <div className="flex gap-2">
                        {quickViewProduct.options.hardware.map(hw => (
                           <span key={hw} className="px-2 py-1 bg-stone-50 border border-stone-100 rounded text-[10px] text-stone-500 font-medium">{hw}</span>
                        ))}
                     </div>
                 </div>

                 <button 
                    onClick={handleSendProduct}
                    className="w-full py-4 bg-[#C08A7D] text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest hover:bg-[#A67569] shadow-lg shadow-[#C08A7D]/20 transition-all active:scale-95"
                 >
                    <Send size={14} /> Enviar para Conversa
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
