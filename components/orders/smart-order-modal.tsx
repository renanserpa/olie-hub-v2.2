
"use client";

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, X, Trash2, CheckCircle2, 
  Loader2, Palette, AlertCircle
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
      product_id: configuringProduct.id,
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
    try {
      // Pass the client context (Name is mandatory) to the service
      const response = await OrderService.create(cart, { name: clientName });
      
      if (response.status === 'success') {
        setStatus('success');
        
        const summary = `✨ *Novo Pedido Olie - ${clientName}*\n\n` +
          cart.map(i => 
            `• *${i.name}*\n  🎨 Cor: ${i.configuration.color}\n  🔨 Metal: ${i.configuration.hardware}${i.configuration.personalization_text ? `\n  ✍️ Personalização: ${i.configuration.personalization_text}` : ''}`
          ).join('\n\n') +
          `\n\n💰 *Total: R$ ${total.toFixed(2)}*\n\n_ID Tiny: ${response.tiny_id}_`;
        
        setTimeout(() => {
          onOrderComplete(summary);
          onClose();
          setCart([]);
          setStatus('idle');
        }, 1500);
      } else {
        throw new Error("Resposta inesperada do servidor");
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Erro ao criar pedido no ERP");
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl flex h-[700px] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex-1 flex flex-col border-r border-stone-100 overflow-hidden">
          {configuringProduct ? (
            <div className="flex-1 flex flex-col p-10 animate-in slide-in-from-left-4">
              <button onClick={() => setConfiguringProduct(null)} className="text-stone-400 hover:text-[#C08A7D] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-8">
                <X size={14}/> Voltar
              </button>
              <div className="flex gap-10">
                <img src={configuringProduct.image_url} className="w-1/2 aspect-square object-cover rounded-[2.5rem] shadow-xl" />
                <div className="flex-1 space-y-8">
                  <h2 className="text-3xl font-black italic">{configuringProduct.name}</h2>
                  <button onClick={confirmConfig} className="w-full bg-[#C08A7D] text-white font-black py-4 rounded-2xl shadow-lg hover:bg-[#A67569] transition-all">Adicionar ao Carrinho</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-stone-50">
                <h2 className="text-3xl font-black italic">Catálogo Olie</h2>
                <div className="relative mt-4">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar peça por nome ou SKU..." 
                    className="w-full bg-[#FAF9F6] border border-stone-100 rounded-2xl pl-16 pr-6 py-5 outline-none focus:ring-2 focus:ring-[#C08A7D]/20 transition-all" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-2 gap-6 scrollbar-hide">
                {filteredProducts.map(p => (
                  <div key={p.id} onClick={() => startConfiguring(p)} className="p-4 border border-stone-50 rounded-[2.5rem] hover:shadow-xl hover:border-[#C08A7D]/10 transition-all cursor-pointer group bg-white">
                    <img src={p.image_url} className="w-full h-full object-cover rounded-[1.8rem]" />
                    <h4 className="font-black text-sm text-stone-800">{p.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-[350px] bg-[#FAF9F6] p-10 flex flex-col">
          <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] mb-10">Carrinho</h3>
          <div className="mt-8 pt-8 border-t border-stone-200">
            {status === 'error' && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-500">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold">{errorMessage}</span>
              </div>
            )}
            <button 
              disabled={cart.length === 0 || status === 'processing'} 
              onClick={handleFinalize} 
              className="w-full h-16 bg-[#C08A7D] text-white rounded-[1.5rem] font-black uppercase text-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {status === 'processing' ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Sincronizando...
                </div>
              ) : 'Finalizar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
