
"use client";

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, X, Trash2, CheckCircle2, 
  Loader2, Palette, AlertCircle, ShoppingCart
} from 'lucide-react';
import { Product, CartItem } from '../../types/index.ts';
import { OrderService } from '../../services/api.ts';

interface SmartOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  catalog: Product[];
  onOrderComplete: (summary: string) => void;
}

export const SmartOrderModal: React.FC<SmartOrderModalProps> = ({ 
  isOpen, onClose, clientName, catalog, onOrderComplete 
}) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);
  const [currentConfig, setCurrentConfig] = useState<CartItem['configuration']>({
    color: '',
    hardware: '',
    personalization_text: ''
  });

  const filteredProducts = useMemo(() => 
    catalog.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku_base.toLowerCase().includes(search.toLowerCase())
    ), [search, catalog]);

  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0), [cart]);

  const startConfiguring = (product: Product) => {
    setConfiguringProduct(product);
    setCurrentConfig({
      color: product.options.colors[0]?.label || '',
      hardware: product.options.hardware[0] || '',
      personalization_text: ''
    });
  };

  const confirmConfig = () => {
    if (!configuringProduct) return;
    
    const newItem: CartItem = {
      // IMPORTANTE: Enviamos o sku_base para o Tiny reconhecer o produto
      product_id: configuringProduct.sku_base,
      name: configuringProduct.name,
      quantity: 1,
      unit_price: configuringProduct.base_price,
      configuration: { ...currentConfig }
    };
    
    setCart(prev => [...prev, newItem]);
    setConfiguringProduct(null);
  };

  const handleFinalize = async () => {
    if (cart.length === 0 || status === 'processing') return;
    
    setStatus('processing');
    setErrorMessage('');
    
    try {
      const response = await OrderService.create(cart, { name: clientName });
      
      if (response.status === 'success') {
        setStatus('success');
        
        const summary = `✨ *Novo Pedido Olie - ${clientName}*\n\n` +
          cart.map(i => 
            `• *${i.name}*\n  🎨 Cor: ${i.configuration.color}\n  🔨 Metal: ${i.configuration.hardware}${i.configuration.personalization_text ? `\n  ✍️ Personalização: ${i.configuration.personalization_text}` : ''}`
          ).join('\n\n') +
          `\n\n💰 *Total: R$ ${total.toFixed(2)}*\n\n_Sincronizado via OlieHub (Tiny #${response.tiny_id})_`;
        
        setTimeout(() => {
          onOrderComplete(summary);
          onClose();
          setCart([]);
          setStatus('idle');
        }, 1500);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Erro desconhecido ao conectar com Tiny ERP");
      setTimeout(() => setStatus('idle'), 6000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl flex h-[700px] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Lado Esquerdo: Catálogo e Configuração */}
        <div className="flex-1 flex flex-col border-r border-stone-100 overflow-hidden bg-white">
          {configuringProduct ? (
            <div className="flex-1 flex flex-col p-10 animate-in slide-in-from-left-4">
              <button onClick={() => setConfiguringProduct(null)} className="text-stone-400 hover:text-olie-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-8 transition-colors">
                <X size={14}/> Voltar ao Catálogo
              </button>
              
              <div className="flex gap-10">
                <div className="w-1/2">
                   <img src={configuringProduct.image_url} className="w-full aspect-square object-cover rounded-[2.5rem] shadow-xl border border-stone-100" />
                </div>
                
                <div className="flex-1 space-y-8">
                  <div>
                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{configuringProduct.sku_base}</span>
                    <h2 className="text-4xl font-serif italic text-olie-900 mt-1">{configuringProduct.name}</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Opções de Cor</label>
                    <div className="flex flex-wrap gap-2">
                       {configuringProduct.options.colors.map((c: any) => (
                         <button 
                           key={c.value}
                           onClick={() => setCurrentConfig({...currentConfig, color: c.label})}
                           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                             currentConfig.color === c.label ? 'bg-olie-900 text-white border-olie-900 shadow-md' : 'bg-white text-stone-400 border-stone-100'
                           }`}
                         >
                           {c.label}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Banho dos Metais</label>
                    <div className="flex gap-2">
                       {configuringProduct.options.hardware.map((h: string) => (
                         <button 
                           key={h}
                           onClick={() => setCurrentConfig({...currentConfig, hardware: h})}
                           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                             currentConfig.hardware === h ? 'bg-olie-900 text-white border-olie-900 shadow-md' : 'bg-white text-stone-400 border-stone-100'
                           }`}
                         >
                           {h}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Gravação (Iniciais)</label>
                    <input 
                      maxLength={4}
                      placeholder="Ex: ABC"
                      value={currentConfig.personalization_text}
                      onChange={e => setCurrentConfig({...currentConfig, personalization_text: e.target.value.toUpperCase()})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-olie-500/5 transition-all"
                    />
                  </div>

                  <button 
                    onClick={confirmConfig} 
                    className="w-full h-14 bg-olie-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-olie-500/20 hover:bg-olie-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Confirmar e Adicionar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-stone-50 bg-white/50 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-olie-50 flex items-center justify-center text-olie-500">
                      <ShoppingBag size={20} />
                   </div>
                   <h2 className="text-3xl font-serif italic text-olie-900">Catálogo Olie</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar peça por nome ou SKU..." 
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-16 pr-6 py-4 outline-none focus:ring-4 focus:ring-olie-500/5 focus:bg-white transition-all text-sm font-medium" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide">
                {filteredProducts.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => startConfiguring(p)} 
                    className="group bg-white border border-stone-50 rounded-[2.5rem] p-4 hover:shadow-olie-lg hover:border-olie-500/10 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <div className="aspect-square rounded-[1.8rem] overflow-hidden mb-4 border border-stone-50">
                       <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="px-2">
                       <h4 className="font-serif italic font-bold text-stone-800 text-sm group-hover:text-olie-500 transition-colors">{p.name}</h4>
                       <p className="text-[10px] font-black text-stone-300 mt-1 uppercase tracking-widest">{p.sku_base}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Resumo do Pedido */}
        <div className="w-[380px] bg-stone-50 p-10 flex flex-col shrink-0 border-l border-stone-100 shadow-inner">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Carrinho Atual</h3>
             <div className="w-8 h-8 rounded-full bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                <ShoppingCart size={14} className="text-stone-300" />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
            {cart.length > 0 ? cart.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-[2rem] border border-stone-100 shadow-sm animate-in slide-in-from-right-4 duration-300">
                 <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xs font-bold text-stone-800 italic">{item.name}</h4>
                    <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-stone-300 hover:text-rose-500 transition-colors">
                       <Trash2 size={14} />
                    </button>
                 </div>
                 <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-olie-500" />
                       <span className="text-[9px] font-black uppercase text-stone-400 tracking-widest">{item.configuration.color}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                       <span className="text-[9px] font-black uppercase text-stone-400 tracking-widest">{item.configuration.hardware}</span>
                    </div>
                 </div>
                 <p className="text-sm font-black text-olie-900">R$ {item.unit_price.toFixed(2)}</p>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-stone-400 space-y-4">
                 <ShoppingBag size={48} strokeWidth={1} />
                 <p className="text-sm">Carrinho vazio</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-stone-200 space-y-6">
            <div className="flex justify-between items-end">
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total do Pedido</span>
               <span className="text-3xl font-serif italic font-bold text-olie-900">R$ {total.toFixed(2)}</span>
            </div>

            {status === 'error' && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 animate-in shake-in duration-300">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest">Falha na Integração</span>
                   <span className="text-[11px] font-medium leading-relaxed">{errorMessage}</span>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in fade-in duration-500">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Pedido Sincronizado</span>
              </div>
            )}

            <button 
              disabled={cart.length === 0 || status === 'processing' || status === 'success'} 
              onClick={handleFinalize} 
              className={`w-full h-16 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all relative overflow-hidden ${
                status === 'processing' ? 'bg-stone-200 text-stone-500' : 
                status === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                'bg-olie-900 text-white shadow-xl shadow-stone-200/50 hover:bg-black active:scale-[0.98]'
              }`}
            >
              {status === 'processing' ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 size={18} className="animate-spin" />
                  Sincronizando com Tiny...
                </div>
              ) : status === 'success' ? (
                'Pedido Enviado!'
              ) : (
                'Finalizar no ERP'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
