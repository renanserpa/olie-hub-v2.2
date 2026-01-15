
"use client";

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  X, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  Palette,
  Type
} from 'lucide-react';
// Fix: Import from types/index.ts to use V3 domain types (e.g., options, base_price, image_url)
import { Product, CartItem } from '../../types/index';

interface SmartOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  catalog: Product[];
  onOrderComplete: (summary: string) => void;
}

export const SmartOrderModal: React.FC<SmartOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  clientName, 
  catalog,
  onOrderComplete 
}) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  
  // State para o produto sendo configurado no momento
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);
  const [currentConfig, setCurrentConfig] = useState<CartItem['configuration']>({
    color: '',
    hardware: '',
    personalization_text: ''
  });

  // Fix: Use sku_base from V3 Product type
  const filteredProducts = useMemo(() => 
    catalog.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku_base.toLowerCase().includes(search.toLowerCase())
    ), [search, catalog]);

  // Fix: Use unit_price from V3 CartItem type
  const total = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

  // Fix: Use options and base_price from V3 Product type
  const startConfiguring = (product: Product) => {
    setConfiguringProduct(product);
    setCurrentConfig({
      color: product.options.colors[0]?.value || '',
      hardware: product.options.hardware[0] || '',
      personalization_text: ''
    });
  };

  // Fix: Use base_price from V3 Product type
  const confirmConfig = () => {
    if (!configuringProduct) return;
    
    setCart(prev => [...prev, {
      product_id: configuringProduct.id,
      quantity: 1,
      unit_price: configuringProduct.base_price,
      configuration: { ...currentConfig },
      // Campos extras para a UI do carrinho
      name: configuringProduct.name // Adicionado para exibição
    } as any]);
    
    setConfiguringProduct(null);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalize = async () => {
    if (cart.length === 0) return;
    setStatus('processing');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus('success');
    
    const summary = `✨ *Novo Pedido Olie - ${clientName}*\n\n` +
      cart.map((i: any) => 
        `• *${i.name}*\n  🎨 Cor: ${i.configuration.color}\n  🔨 Metal: ${i.configuration.hardware}${i.configuration.personalization_text ? `\n  ✍️ Personalização: ${i.configuration.personalization_text}` : ''}`
      ).join('\n\n') +
      `\n\n💰 *Total: R$ ${total.toFixed(2)}*\n\n_O pedido já foi enviado para produção em nosso ateliê._`;
    
    setTimeout(() => {
      onOrderComplete(summary);
      onClose();
      setCart([]);
      setStatus('idle');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl flex h-[700px] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Lado Esquerdo: Catálogo e Configuração */}
        <div className="flex-1 flex flex-col border-r border-stone-100 overflow-hidden">
          {configuringProduct ? (
            <div className="flex-1 flex flex-col p-10 animate-in slide-in-from-left-4 duration-500">
              <button onClick={() => setConfiguringProduct(null)} className="text-stone-400 hover:text-[#C08A7D] flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8">
                <X size={14}/> Voltar ao Catálogo
              </button>
              
              <div className="flex gap-10 h-full">
                <div className="w-1/2">
                   {/* Fix: Use image_url from V3 Product type */}
                   <img src={configuringProduct.image_url} className="w-full aspect-square object-cover rounded-[2.5rem] shadow-2xl" />
                </div>
                
                <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-hide">
                  <div>
                    <h2 className="text-3xl font-black text-[#333333] tracking-tight">{configuringProduct.name}</h2>
                    {/* Fix: Use base_price from V3 Product type */}
                    <p className="text-[#C08A7D] font-black text-xl mt-1">R$ {configuringProduct.base_price.toFixed(2)}</p>
                  </div>

                  {/* Seleção de Cores */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      <Palette size={12}/> Escolha a Cor do Couro
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {/* Fix: Use options from V3 Product type */}
                      {configuringProduct.options.colors.map(c => (
                        <button 
                          key={c.value}
                          onClick={() => setCurrentConfig({...currentConfig, color: c.label})}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                            currentConfig.color === c.label ? 'border-[#C08A7D] bg-[#FAF9F6]' : 'border-stone-100 hover:border-stone-200'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full border border-stone-200" style={{ backgroundColor: c.hex }} />
                          <span className="text-xs font-bold text-stone-700">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seleção de Ferragens */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Banho dos Metais</label>
                    <div className="flex gap-3">
                      {/* Fix: Use options from V3 Product type */}
                      {configuringProduct.options.hardware.map(h => (
                        <button 
                          key={h}
                          onClick={() => setCurrentConfig({...currentConfig, hardware: h})}
                          className={`flex-1 py-4 rounded-2xl border-2 font-bold text-xs transition-all ${
                            currentConfig.hardware === h ? 'border-[#333333] bg-[#333333] text-white' : 'border-stone-100 text-stone-500 hover:border-stone-200'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personalização */}
                  {/* Fix: Use options from V3 Product type */}
                  {configuringProduct.options.personalization.allowed && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center justify-between">
                        Personalização ({configuringProduct.options.personalization.type})
                        <span>Máx {configuringProduct.options.personalization.max_chars} chars</span>
                      </label>
                      <input 
                        type="text"
                        maxLength={configuringProduct.options.personalization.max_chars}
                        placeholder="Ex: M.G"
                        className="w-full bg-[#FAF9F6] border-2 border-stone-100 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-widest outline-none focus:border-[#C08A7D] transition-all"
                        value={currentConfig.personalization_text}
                        onChange={(e) => setCurrentConfig({...currentConfig, personalization_text: e.target.value})}
                      />
                    </div>
                  )}

                  <button 
                    onClick={confirmConfig}
                    className="w-full bg-[#C08A7D] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#C08A7D]/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Adicionar ao Pedido
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-stone-50">
                <h2 className="text-3xl font-black text-[#333333] tracking-tight">Catálogo Ateliê Olie</h2>
                <div className="relative mt-6">
                  <Search className="absolute left-5 top-4 text-stone-300" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscar peça por nome ou SKU..."
                    className="w-full bg-[#FAF9F6] border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:ring-4 focus:ring-[#C08A7D]/10 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 pt-4 grid grid-cols-2 gap-6 scrollbar-hide">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => startConfiguring(product)}
                    className="bg-white rounded-[2.5rem] p-4 border border-stone-50 shadow-sm hover:shadow-2xl hover:border-[#C08A7D]/20 transition-all group cursor-pointer"
                  >
                    <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 border border-stone-50">
                      {/* Fix: Use image_url from V3 Product type */}
                      <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="px-2">
                      <h4 className="font-black text-[#333333] text-sm leading-tight">{product.name}</h4>
                      <div className="flex justify-between items-center mt-3">
                        {/* Fix: Use sku_base and base_price from V3 Product type */}
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{product.sku_base}</span>
                        <span className="font-black text-[#C08A7D]">R$ {product.base_price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Carrinho de Produção */}
        <div className="w-[380px] bg-[#FAF9F6] flex flex-col p-10">
          <div className="mb-10">
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-widest">Itens do Pedido</h3>
            <p className="text-xs text-stone-400 mt-1">Configurações para {clientName}</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <ShoppingBag size={60} className="mb-6" />
                <p className="text-xs font-black uppercase tracking-widest">Pedido Vazio</p>
              </div>
            ) : (
              cart.map((item: any, idx) => (
                <div key={idx} className="bg-white p-5 rounded-[2rem] shadow-sm border border-stone-100 group animate-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-black text-xs text-[#333333] truncate">{item.name}</h4>
                      <p className="text-[10px] font-bold text-[#C08A7D] mt-1">{item.configuration.color} • {item.configuration.hardware}</p>
                      {item.configuration.personalization_text && (
                        <p className="text-[9px] font-black text-stone-400 uppercase mt-2 border-t border-stone-50 pt-2 flex items-center gap-1">
                          <Type size={10}/> Personalizado: {item.configuration.personalization_text}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeFromCart(idx)}
                      className="p-2 text-stone-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-10 pt-10 border-t border-stone-200">
            <div className="flex justify-between items-end mb-8">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Valor Total</span>
              <span className="text-3xl font-black text-[#333333]">R$ {total.toFixed(2)}</span>
            </div>

            <button 
              disabled={cart.length === 0 || status !== 'idle'}
              onClick={handleFinalize}
              className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-4 transition-all shadow-xl ${
                status === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                'bg-[#333333] text-white hover:bg-stone-800 shadow-stone-800/20 disabled:opacity-30 disabled:grayscale'
              }`}
            >
              {status === 'idle' && <>Passar Pedido <ChevronRight size={20} /></>}
              {status === 'processing' && <><Loader2 size={24} className="animate-spin" /> Processando...</>}
              {status === 'success' && <><CheckCircle2 size={24} /> Pedido Enviado!</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
