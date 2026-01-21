
"use client";

import React, { useState } from 'react';
import { Truck, ShoppingBag, Loader2, Code, AlertCircle, CheckCircle2, Terminal, Zap, ShieldCheck } from 'lucide-react';

export const TinyDebugger: React.FC = () => {
  // Connection State
  const [connResult, setConnResult] = useState<any>(null);
  const [isConnLoading, setIsConnLoading] = useState(false);

  // Shipping State
  const [shippingZip, setShippingZip] = useState('01310-930');
  const [shippingValue, setShippingValue] = useState(489.00);
  const [shippingWeight, setShippingWeight] = useState(0.5);
  const [shippingResult, setShippingResult] = useState<any>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  // Order State
  const [orderResult, setOrderResult] = useState<any>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  const testConnection = async () => {
    setIsConnLoading(true);
    setConnResult(null);
    try {
      // Pega o token do localStorage para o teste de ping se disponível
      const localToken = localStorage.getItem('olie_tiny_token');
      const response = await fetch('/api/tiny/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: localToken || '' })
      });
      const data = await response.json();
      setConnResult(data);
    } catch (err: any) {
      setConnResult({ error: err.message });
    } finally {
      setIsConnLoading(false);
    }
  };

  const testShipping = async () => {
    setIsShippingLoading(true);
    setShippingResult(null);
    try {
      const response = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          destinationZip: shippingZip, 
          weight: shippingWeight, 
          value: shippingValue 
        })
      });
      const data = await response.json();
      setShippingResult(data);
    } catch (err: any) {
      setShippingResult({ error: err.message });
    } finally {
      setIsShippingLoading(false);
    }
  };

  const testOrderCreation = async () => {
    setIsOrderLoading(true);
    setOrderResult(null);
    try {
      const localToken = localStorage.getItem('olie_tiny_token');
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: localToken || '',
          items: [
            { product_id: 'SKU-TEST-LAB-001', name: 'Item Teste Lab', quantity: 1, unit_price: 100.00, configuration: { color: 'Teste', hardware: 'Nenhum', personalization_text: 'DEBUG' } }
          ], 
          customer: { name: "Integrador Teste Lab", email: "debug@olie.com.br" } 
        })
      });
      const data = await response.json();
      setOrderResult(data);
    } catch (err: any) {
      setOrderResult({ error: err.message });
    } finally {
      setIsOrderLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Section 0: Connection Ping */}
      <div className="olie-card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-50 pb-4">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-amber-500" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Status da Conexão</h4>
          </div>
          <button 
            onClick={testConnection}
            disabled={isConnLoading}
            className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center gap-2"
          >
            {isConnLoading ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
            Testar Conexão Tiny
          </button>
        </div>

        {connResult && (
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-stone-300">Raw Ping Response</span>
            <pre className="p-4 bg-stone-900 rounded-2xl text-[10px] text-amber-400 font-mono overflow-x-auto h-32 scrollbar-hide">
              {JSON.stringify(connResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Shipping Validator */}
        <div className="olie-card p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-50 pb-4">
            <Truck size={20} className="text-blue-500" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Validador de Frete</h4>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-stone-300">CEP Destino</label>
                <input 
                  value={shippingZip} 
                  onChange={e => setShippingZip(e.target.value)} 
                  className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-xs font-bold" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-stone-300">Peso (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={shippingWeight} 
                  onChange={e => setShippingWeight(parseFloat(e.target.value))} 
                  className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2.5 text-xs font-bold" 
                />
              </div>
            </div>
            
            <button 
              onClick={testShipping}
              disabled={isShippingLoading}
              className="w-full h-12 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {isShippingLoading ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
              Testar Cálculo de Frete
            </button>
          </div>

          {shippingResult && (
            <div className="mt-6 space-y-2">
              <span className="text-[9px] font-black uppercase text-stone-300">Resposta Raw JSON (Frete)</span>
              <pre className="p-4 bg-stone-900 rounded-2xl text-[10px] text-emerald-400 font-mono overflow-x-auto h-48 scrollbar-hide">
                {JSON.stringify(shippingResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Section 2: Order Creation Validator */}
        <div className="olie-card p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-50 pb-4">
            <ShoppingBag size={20} className="text-olie-500" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">Validador de Pedido</h4>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
               <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                 Atenção: Este teste dispara uma requisição real de inclusão de pedido para o proxy <strong>/api/orders/create</strong>.
               </p>
            </div>
            
            <button 
              onClick={testOrderCreation}
              disabled={isOrderLoading}
              className="w-full h-12 bg-olie-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20 flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
            >
              {isOrderLoading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
              Criar Pedido de Teste (Ping)
            </button>
          </div>

          {orderResult && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-stone-300">Resposta Raw JSON (Pedido)</span>
                {orderResult.status === 'success' ? (
                  <span className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Sucesso
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase text-rose-500 flex items-center gap-1">
                    <AlertCircle size={10} /> Erro
                  </span>
                )}
              </div>
              <pre className="p-4 bg-stone-900 rounded-2xl text-[10px] text-olie-300 font-mono overflow-x-auto h-48 scrollbar-hide">
                {JSON.stringify(orderResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
