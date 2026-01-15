
import React, { useState } from 'react';
import { ShoppingBag, Box, ExternalLink, RefreshCw, CreditCard } from 'lucide-react';
// Fix: Import Customer from the unified types/index.ts definitions
import { Customer } from '../types/index';
import { Button } from './ui/Button';
import { tinyService } from '../services/integrations/tiny';

interface IntegrationsPanelProps {
  customer: Customer;
  onLog: (log: any) => void;
}

export const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ customer, onLog }) => {
  const [activeTab, setActiveTab] = useState<'tiny' | 'vnda'>('tiny');
  const [isProcessing, setIsProcessing] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearchProduct = async () => {
    setIsProcessing(true);
    const start = Date.now();
    try {
      const results = await tinyService.searchProduct(productSearch);
      setSearchResults(results);
      onLog({
        id: crypto.randomUUID(),
        service: 'TINY',
        method: 'GET',
        endpoint: '/produtos/pesquisa',
        status_code: 200,
        duration_ms: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateOrder = async (product: any) => {
    setIsProcessing(true);
    const start = Date.now();
    try {
        await tinyService.createOrder(customer, [product]);
        onLog({
            id: crypto.randomUUID(),
            service: 'TINY',
            method: 'POST',
            endpoint: '/pedido/incluir',
            status_code: 201,
            duration_ms: Date.now() - start,
            timestamp: new Date().toISOString()
        });
        alert(`Pedido criado para ${product.name}!`);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
        {/* Customer Snapshot */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">{customer.full_name}</h2>
            <div className="mt-2 text-sm text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px]">W</span>
                    {customer.phone}
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">@</span>
                    {customer.email}
                </div>
            </div>
            
            <div className="mt-4 flex gap-2">
                <div className="flex-1 bg-white p-2 rounded border border-slate-200">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">LTV (VNDA)</span>
                    <p className="font-semibold text-slate-800">R$ {customer.ltv.toFixed(2)}</p>
                </div>
                <div className="flex-1 bg-white p-2 rounded border border-slate-200">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Orders</span>
                    <p className="font-semibold text-slate-800">{customer.total_orders}</p>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('tiny')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 ${activeTab === 'tiny' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Box size={16} /> Tiny ERP
            </button>
            <button 
                onClick={() => setActiveTab('vnda')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 ${activeTab === 'vnda' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <ShoppingBag size={16} /> VNDA
            </button>
        </div>

        {/* Action Panel */}
        <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'tiny' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Novo Pedido Rápido</h3>
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text"
                                placeholder="Buscar SKU ou Nome..."
                                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                            <Button size="sm" onClick={handleSearchProduct} isLoading={isProcessing}>
                                <RefreshCw size={16} />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {searchResults.map((prod) => (
                                <div key={prod.sku} className="p-3 border border-slate-200 rounded-md hover:border-blue-300 transition-colors bg-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">{prod.name}</p>
                                            <p className="text-xs text-slate-500">SKU: {prod.sku}</p>
                                        </div>
                                        <span className="font-bold text-slate-900 text-sm">R$ {prod.price.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className={`text-xs px-2 py-1 rounded ${prod.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {prod.stock > 0 ? `${prod.stock} em estoque` : 'Sem estoque'}
                                        </span>
                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            disabled={prod.stock === 0}
                                            onClick={() => handleCreateOrder(prod)}
                                        >
                                            + Pedido
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'vnda' && (
                <div className="space-y-4 text-center py-8">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={32} />
                    </div>
                    <p className="text-slate-600 text-sm">Histórico de compras carregado via VNDA API.</p>
                    <Button variant="secondary" className="w-full justify-center">
                        <ExternalLink size={16} className="mr-2" />
                        Ver Perfil no VNDA
                    </Button>
                    <div className="border-t border-slate-100 pt-4 mt-4 text-left">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Cartões Salvos</h4>
                        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                            <CreditCard size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-700">•••• 4242</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
