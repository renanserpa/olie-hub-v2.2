"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, User, ShoppingBag, Package, ClipboardCopy, 
  Truck, ChevronRight, Star, Eye, Send, Sparkles, 
  BrainCircuit, MessageSquareQuote, Loader2, ThumbsUp, 
  ThumbsDown, Palette, Image as ImageIcon, ChevronLeft
} from 'lucide-react';
import { Product, Order, Message } from '../../types/index.ts';
import { AIService } from '../../services/api.ts';

interface ActionPanelProps {
  isOpen: boolean; 
  onClose: () => void;
  client: any;
  catalog: Product[];
  recentOrders: Order[];
  messages: Message[];
  forcedTab?: 'crm' | 'orders' | 'catalog' | 'ai' | 'studio' | null;
}

const MATERIAL_CHIPS = [
  { label: 'Couro Croco', prompt: 'Italian Croco Leather texture' },
  { label: 'Liso Nobre', prompt: 'Premium smooth calfskin leather' },
  { label: 'Floater', prompt: 'Pebbled floater leather texture' },
  { label: 'Matelassê', prompt: 'Quilted leather pattern' },
  { label: 'Dourado 18k', prompt: '18k gold polished hardware' },
  { label: 'Prata Nobre', prompt: 'Brushed silver hardware' },
];

const ITEMS_PER_PAGE = 10;

export const ActionPanel: React.FC<ActionPanelProps> = ({
  onClose, client, catalog, recentOrders, messages, forcedTab
}) => {
  const [activeTab, setActiveTab] = useState<'crm' | 'orders' | 'catalog' | 'ai' | 'studio'>('crm');
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Catalog Pagination State
  const [catalogPage, setCatalogPage] = useState(0);
  
  // Visual Studio State
  const [studioPrompt, setStudioPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab as any);
    }
  }, [forcedTab]);

  // Reset pagination when switching to catalog tab
  useEffect(() => {
    if (activeTab === 'catalog') {
      setCatalogPage(0);
    }
  }, [activeTab]);

  const handleRunAI = async () => {
    if (!client || messages.length === 0) return;
    setIsAnalyzing(true);
    try {
      const insight = await AIService.analyzeConversation(messages, client.name);
      setAiInsight(insight);
      if (insight?.suggested_skus?.[0]) {
        setStudioPrompt(`Bolsa ${insight.suggested_skus[0]} com acabamento premium.`);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addChipToPrompt = (chip: string) => {
    setStudioPrompt(prev => prev ? `${prev}, com ${chip.toLowerCase()}` : `Bolsa em ${chip.toLowerCase()}`);
  };

  const handleGeneratePreview = async () => {
    if (!studioPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const img = await AIService.generateProductPreview(studioPrompt);
      setGeneratedImage(img);
    } catch (err) {
      console.error("Preview generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const sentimentColors: any = {
    'Neutro': 'text-stone-400 bg-stone-50',
    'Entusiasmado': 'text-emerald-600 bg-emerald-50',
    'Frustrado': 'text-rose-600 bg-rose-50',
    'Indefinido': 'text-stone-300 bg-stone-50'
  };

  // Pagination Logic
  const totalPages = Math.ceil(catalog.length / ITEMS_PER_PAGE);
  const displayedCatalog = catalog.slice(catalogPage * ITEMS_PER_PAGE, (catalogPage + 1) * ITEMS_PER_PAGE);

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden w-full relative">
      <div className="h-16 px-6 border-b border-[#F2F0EA] flex items-center justify-between shrink-0 bg-white z-20">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Atendimento Premium</span>
        <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full text-stone-400 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex p-2 bg-white border-b border-[#F2F0EA] shrink-0 overflow-x-auto scrollbar-hide">
        {[
          { id: 'ai', icon: BrainCircuit, label: 'Concierge' },
          { id: 'studio', icon: Palette, label: 'Studio' },
          { id: 'crm', icon: User, label: 'CRM' },
          { id: 'orders', icon: ShoppingBag, label: 'Pedidos' },
          { id: 'catalog', icon: Package, label: 'Catálogo' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[65px] py-3 flex flex-col items-center gap-1 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-olie-50 text-olie-600' 
                : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
            }`}
          >
            <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-white">
        
        {/* STUDIO TAB - ENHANCED */}
        {activeTab === 'studio' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
            <div className="p-8 rounded-[2.5rem] bg-stone-900 text-white shadow-xl relative overflow-hidden group border border-white/5">
              <ImageIcon className="absolute -right-4 -top-4 w-20 h-20 opacity-10 rotate-12" />
              <h3 className="text-xl font-serif italic mb-2">Visual Studio</h3>
              <p className="text-[9px] font-medium text-stone-400 uppercase tracking-widest mb-6">Prototipe o desejo do cliente</p>
              
              <div className="space-y-4">
                 <textarea 
                    value={studioPrompt}
                    onChange={e => setStudioPrompt(e.target.value)}
                    placeholder="Descreva a peça ou use os atalhos abaixo..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs outline-none focus:ring-2 focus:ring-olie-500/50 transition-all h-28 resize-none placeholder:text-stone-600"
                 />

                 <div className="flex flex-wrap gap-2">
                    {MATERIAL_CHIPS.map(chip => (
                       <button 
                        key={chip.label}
                        onClick={() => addChipToPrompt(chip.label)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-olie-500 transition-all text-stone-400 hover:text-white"
                       >
                          + {chip.label}
                       </button>
                    ))}
                 </div>

                 <button 
                    onClick={handleGeneratePreview}
                    disabled={isGenerating || !studioPrompt.trim()}
                    className="w-full bg-olie-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-olie-500/20 flex items-center justify-center gap-2 hover:bg-olie-600 transition-all disabled:opacity-50 active:scale-95"
                 >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isGenerating ? "Renderizando..." : "Gerar Visualização"}
                 </button>
              </div>
            </div>

            {generatedImage && (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="aspect-square rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-olie-soft bg-stone-50 group relative">
                  <img src={generatedImage} className="w-full h-full object-cover" alt="AI Generated Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <button className="w-12 h-12 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                        <Eye size={20} />
                     </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-4 bg-stone-50 text-stone-600 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-stone-100 hover:bg-stone-100 transition-all">Baixar</button>
                  <button className="py-4 bg-olie-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                     <Send size={12} /> Enviar Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI CONCIERGE TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
             <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-olie-500 to-olie-700 text-white shadow-olie-lg relative overflow-hidden group">
                <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-10 rotate-12" />
                <h3 className="text-xl font-serif italic mb-2">Olie AI</h3>
                <p className="text-[10px] font-medium text-white/70 mb-8 uppercase tracking-widest">Inteligência de Atendimento</p>
                <button 
                  onClick={handleRunAI}
                  disabled={isAnalyzing}
                  className="w-full bg-white text-olie-700 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-olie-50 transition-all disabled:opacity-50 active:scale-95"
                >
                  {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                  {isAnalyzing ? "Mapeando..." : "Analisar Cliente"}
                </button>
             </div>

             {aiInsight && (
               <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-4">
                       <MessageSquareQuote size={14} className="text-olie-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sumário da Intenção</span>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed italic font-serif">"{aiInsight.summary}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white border border-stone-100 rounded-3xl text-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-2">Sentimento</p>
                       <p className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${sentimentColors[aiInsight.sentiment] || sentimentColors['Indefinido']}`}>
                         {aiInsight.sentiment}
                       </p>
                    </div>
                    <div className="p-5 bg-white border border-stone-100 rounded-3xl text-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-2">Estilo</p>
                       <p className="text-xs font-bold text-olie-600">{aiInsight.style_profile || 'Minimalista'}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-olie-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-olie-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500 mb-4">Recomendação Estratégica</p>
                     <p className="text-sm font-serif italic mb-6 leading-relaxed text-stone-200">{aiInsight.next_step}</p>
                     <button 
                      onClick={() => { setActiveTab('studio'); if(aiInsight.suggested_skus?.[0]) setStudioPrompt(`Bolsa ${aiInsight.suggested_skus[0]} customizada estilo ${aiInsight.style_profile}`); }}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                     >
                       Customizar Sugestão no Studio
                     </button>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* CRM TAB */}
        {activeTab === 'crm' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-center pt-4">
                <div className="w-20 h-20 mx-auto bg-olie-500 rounded-[2rem] flex items-center justify-center text-white text-3xl font-serif italic shadow-olie-lg mb-4">
                  {client?.avatar || 'C'}
                </div>
                <h2 className="text-2xl font-serif italic text-stone-800">{client?.name || 'Cliente Olie'}</h2>
                <div className="flex justify-center gap-1.5 mt-4 flex-wrap px-4">
                   {client?.tags?.map((tag: string) => (
                     <span key={tag} className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-full text-[9px] font-black uppercase tracking-wider text-stone-400">{tag}</span>
                   )) || <span className="text-[9px] text-stone-300 italic">Sem etiquetas de CRM</span>}
                </div>
             </div>
             <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100 flex items-center justify-between group hover:bg-white transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-olie-500 shadow-sm group-hover:bg-olie-500 group-hover:text-white transition-all"><Star size={16}/></div>
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Valor Vitalício (LTV)</p>
                         <p className="text-lg font-serif italic font-bold text-stone-800">R$ {client?.ltv?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</p>
                      </div>
                   </div>
                   <ChevronRight size={18} className="text-stone-200" />
                </div>
             </div>
          </div>
        )}

        {/* PEDIDOS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Histórico de Pedidos</h3>
                <span className="text-[9px] font-bold text-stone-300 bg-stone-50 px-2 py-0.5 rounded-lg">{recentOrders.length} total</span>
             </div>
             <div className="space-y-4">
               {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                 <div key={order.id} className="p-5 bg-white border border-stone-100 rounded-3xl hover:shadow-olie-soft hover:border-olie-500/20 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1 bg-olie-50 rounded-lg border border-olie-100">
                         <span className="text-[10px] font-black text-olie-700">#{order.id}</span>
                      </div>
                      <span className="text-[9px] font-black text-stone-300 uppercase">{order.date}</span>
                    </div>
                    <p className="text-sm font-bold text-stone-800 mb-2 group-hover:text-olie-500 transition-colors">{order.product}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-50">
                      <span className="text-sm font-black text-stone-800">{order.price}</span>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-300 group-hover:text-stone-500 transition-all">
                         Detalhes <ChevronRight size={12} />
                      </div>
                    </div>
                 </div>
               )) : <div className="text-center py-20 opacity-30 italic text-sm">Nenhum pedido registrado</div>}
             </div>
          </div>
        )}

        {/* CATALOG TAB - WITH PAGINATION */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Catálogo Express</h3>
              {totalPages > 1 && (
                <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest bg-stone-50 px-2 py-1 rounded-lg">
                  {catalogPage + 1} / {totalPages}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-4 min-h-[500px]">
              {displayedCatalog.map(product => (
                <div key={product.id} className="p-4 bg-white border border-stone-100 rounded-[2rem] flex gap-4 hover:border-olie-500/20 hover:shadow-olie-soft transition-all group cursor-pointer animate-in fade-in zoom-in-95 duration-300">
                   <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-stone-50">
                      <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-xs font-bold text-stone-800 truncate group-hover:text-olie-500 transition-colors">{product.name}</p>
                      <p className="text-[10px] font-black text-olie-600 mt-1 uppercase">R$ {product.base_price.toFixed(2)}</p>
                   </div>
                   <button 
                    onClick={() => { setActiveTab('studio'); setStudioPrompt(`Prévia da ${product.name} em couro clássico.`); }}
                    className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-300 hover:text-olie-500 hover:bg-olie-50 transition-all self-center flex items-center justify-center"
                   >
                      <Palette size={16} />
                   </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-md py-4">
                <button 
                  disabled={catalogPage === 0}
                  onClick={() => setCatalogPage(p => p - 1)}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-stone-50 border border-stone-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-stone-400 disabled:opacity-30 hover:bg-stone-100 transition-all shadow-sm"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <button 
                  disabled={catalogPage >= totalPages - 1}
                  onClick={() => setCatalogPage(p => p + 1)}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-stone-50 border border-stone-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-stone-400 disabled:opacity-30 hover:bg-stone-100 transition-all shadow-sm"
                >
                  Próximo <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};