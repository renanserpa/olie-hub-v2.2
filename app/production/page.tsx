
"use client";

import React, { useEffect, useReducer, useState, useMemo } from 'react';
import { ProductionService, AIService } from '../../services/api.ts';
import { ProductionStage } from '../../types/index.ts';
import { PRODUCTION_STAGES_CONFIG } from '../../lib/constants.ts';
import { 
  Clock, 
  AlertCircle, 
  MoreVertical, 
  Filter, 
  Search, 
  Maximize2,
  Plus,
  Zap,
  CheckCircle2,
  Hammer,
  X,
  Palette,
  Scissors,
  Image as ImageIcon,
  BrainCircuit,
  Loader2,
  ShieldCheck,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Calendar as CalendarIcon,
  TrendingUp,
  Activity,
  History,
  Timer
} from 'lucide-react';

// --- Reducer Types & Logic ---

interface ProductionItem {
  id: string;
  client: string;
  product: string;
  stage: ProductionStage;
  sku: string;
  date: string;
  rush?: boolean;
  delayed?: boolean;
  efficiency?: number;
  details?: {
    leather: string;
    hardware: string;
    personalization: string;
  }
}

interface BoardState {
  items: ProductionItem[];
  stats: any;
  loading: boolean;
  draggedItemId: string | null;
  hoveredStage: ProductionStage | null;
}

type Action =
  | { type: 'LOAD_DATA'; payload: { items: ProductionItem[]; stats: any } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'DRAG_START'; payload: string }
  | { type: 'DRAG_END' }
  | { type: 'SET_HOVERED_STAGE'; payload: ProductionStage | null }
  | { type: 'MOVE_ITEM'; payload: { itemId: string; newStage: ProductionStage } };

const initialState: BoardState = {
  items: [],
  stats: null,
  loading: true,
  draggedItemId: null,
  hoveredStage: null,
};

function productionReducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, items: action.payload.items, stats: action.payload.stats, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'DRAG_START':
      return { ...state, draggedItemId: action.payload };
    case 'DRAG_END':
      return { ...state, draggedItemId: null, hoveredStage: null };
    case 'SET_HOVERED_STAGE':
      return { ...state, hoveredStage: action.payload };
    case 'MOVE_ITEM':
      const updatedItems = state.items.map((item) => {
        if (item.id === action.payload.itemId) {
          return { ...item, stage: action.payload.newStage };
        }
        return item;
      });
      return { ...state, items: updatedItems, draggedItemId: null, hoveredStage: null };
    default:
      return state;
  }
}

// --- Component ---

export default function ProductionPage() {
  const [state, dispatch] = useReducer(productionReducer, initialState);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ProductionItem | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  
  // AI Tech Tips State
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [isConsultingAI, setIsConsultingAI] = useState(false);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const [items, stats] = await Promise.all([
          ProductionService.getList(),
          ProductionService.getStats()
        ]);
        dispatch({ type: 'LOAD_DATA', payload: { items: items as ProductionItem[], stats } });
      } catch (err) {
        console.error("Erro ao carregar Ateliê:", err);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadBoard();
  }, []);

  // --- KPI Memo ---
  const kpis = useMemo(() => {
    const total = state.items.length;
    const rushCount = state.items.filter(i => i.rush).length;
    const delayedCount = state.items.filter(i => i.delayed).length;
    const prontoCount = state.items.filter(i => i.stage === 'pronto').length;
    return { total, rushCount, delayedCount, prontoCount };
  }, [state.items]);

  const handleConsultAI = async () => {
    if (!selectedItem) return;
    setIsConsultingAI(true);
    setAiTips([]);
    try {
      const response = await AIService.getProductionTips(
        selectedItem.product, 
        selectedItem.details, 
        selectedItem.stage
      );
      setAiTips(response.tips || []);
    } catch (err) {
      console.error("AI Error");
    } finally {
      setIsConsultingAI(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setTimeout(() => {
      dispatch({ type: 'DRAG_START', payload: id });
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, stage: ProductionStage) => {
    e.preventDefault();
    if (state.hoveredStage !== stage) {
      dispatch({ type: 'SET_HOVERED_STAGE', payload: stage });
    }
  };

  const handleDrop = async (e: React.DragEvent, stage: ProductionStage) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      dispatch({ type: 'MOVE_ITEM', payload: { itemId, newStage: stage } });
      try {
        await ProductionService.updateStage(itemId, stage);
      } catch (err) {
        console.error("Falha ao sincronizar estágio");
      }
    }
  };

  const filteredItems = state.items.filter(item => 
    item.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stages: ProductionStage[] = ['corte', 'costura', 'montagem', 'acabamento', 'pronto'];

  if (state.loading) return (
    <div className="flex-1 flex items-center justify-center bg-stone-50">
      <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9F6]">
      {/* Editorial Header */}
      <header className="h-24 px-12 flex items-center justify-between shrink-0 bg-white border-b border-stone-100 z-50 shadow-sm">
        <div className="flex items-center gap-10">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 block mb-1">Módulo Workshop</span>
            <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight leading-none">Produção Ativa</h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 pl-10 border-l border-stone-100">
             <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-stone-300 tracking-widest">Capacidade</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-olie-900">{state.stats?.efficiency}%</span>
                    <TrendingUp size={10} className="text-emerald-500" />
                  </div>
                </div>
                <div className="w-px h-8 bg-stone-100" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-stone-300 tracking-widest">Lead Time</span>
                  <span className="text-lg font-bold text-olie-900">{state.stats?.averageProductionTime}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* View Switcher */}
          <div className="bg-stone-50 p-1.5 rounded-2xl border border-stone-100 flex gap-1">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-olie-500' : 'text-stone-300 hover:text-stone-400'}`}
              title="Visão Kanban"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-olie-500' : 'text-stone-300 hover:text-stone-400'}`}
              title="Visão Lista"
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-olie-500' : 'text-stone-300 hover:text-stone-400'}`}
              title="Calendário de Prazo"
            >
              <CalendarIcon size={18} />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-olie-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar ordem..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-xs font-medium focus:ring-4 focus:ring-olie-500/5 outline-none transition-all w-48 focus:w-64 focus:bg-white"
            />
          </div>
          
          <button className="h-12 px-6 bg-olie-900 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-black/10 text-[10px] font-black uppercase tracking-widest">
            <Plus size={16} />
            Entrada de Lote
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* VIEW 1: KANBAN */}
        {viewMode === 'kanban' && (
          <div className="h-full overflow-x-auto p-10 scrollbar-hide">
            <div className="flex gap-8 h-full min-w-max pb-4">
              {stages.map((stage) => {
                const stageConfig = PRODUCTION_STAGES_CONFIG[stage];
                const stageItems = filteredItems.filter(i => i.stage === stage);
                const isHovered = state.hoveredStage === stage;
                const isBottleneck = stageItems.length >= 4;
                
                return (
                  <div 
                    key={stage} 
                    className={`w-[320px] flex flex-col h-full rounded-[2.5rem] transition-all duration-500 ${
                      isHovered ? 'bg-stone-100/40 scale-[1.01]' : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, stage)}
                    onDrop={(e) => handleDrop(e, stage)}
                  >
                    <div className={`flex items-center justify-between mb-6 p-6 rounded-[2rem] border transition-all duration-300 ${
                      isBottleneck ? 'border-rose-100 bg-rose-50/50' : 'bg-white border-stone-100 shadow-sm'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-lg">{stageConfig.emoji}</div>
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-olie-900 leading-none">{stageConfig.label}</h3>
                          <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest mt-1 block">
                            {isBottleneck ? 'Atenção Gargalo' : 'Capacidade Normal'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-1 bg-stone-50 rounded-lg text-stone-400">{stageItems.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-hide">
                      {stageItems.map(item => (
                        <div 
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragEnd={() => dispatch({ type: 'DRAG_END' })}
                          onClick={() => setSelectedItem(item)}
                          className={`
                            group bg-white p-6 rounded-[2.2rem] border border-stone-100/60 shadow-sm 
                            hover:shadow-olie-lg hover:border-olie-500/20 hover:-translate-y-1
                            transition-all duration-500 cursor-pointer relative overflow-hidden
                            ${item.delayed ? 'ring-2 ring-rose-500/10' : ''}
                            ${state.draggedItemId === item.id ? 'opacity-20 scale-95' : 'opacity-100'}
                          `}
                        >
                          {item.rush && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse" />}
                          
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">{item.id}</span>
                            {item.delayed && <AlertCircle size={14} className="text-rose-400" />}
                          </div>

                          <h4 className="font-serif italic text-lg text-olie-900 leading-tight mb-4 group-hover:text-olie-500 transition-colors">
                            {item.product}
                          </h4>

                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-[10px] font-serif italic text-stone-400">
                                   {item.client.charAt(0)}
                                </div>
                                <p className="text-[10px] font-bold text-stone-700 truncate max-w-[120px]">{item.client}</p>
                             </div>
                             <div className="flex gap-1.5">
                                <Palette size={12} className="text-stone-300" />
                                <Hammer size={12} className="text-stone-300" />
                             </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-stone-50 flex items-center justify-between">
                             <span className="text-[9px] font-black uppercase text-stone-300 flex items-center gap-1.5">
                                <Clock size={12} /> {item.date}
                             </span>
                             <div className="w-10 h-1 bg-stone-50 rounded-full overflow-hidden">
                                <div className="h-full bg-olie-500" style={{ width: `${(stages.indexOf(item.stage) + 1) * 20}%` }} />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: LIST VIEW */}
        {viewMode === 'list' && (
          <div className="h-full overflow-y-auto px-12 py-10 scrollbar-hide animate-in fade-in duration-500">
            <div className="bg-white rounded-[3rem] border border-stone-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-50">
                    <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-widest">Ordem</th>
                    <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-widest">Produto</th>
                    <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-widest">Etapa Atual</th>
                    <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-widest">Eficiência</th>
                    <th className="px-10 py-6 text-[10px] font-black text-stone-300 uppercase tracking-widest">Previsão</th>
                    <th className="px-10 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="group hover:bg-stone-50/50 transition-colors cursor-pointer" onClick={() => setSelectedItem(item)}>
                      <td className="px-10 py-8">
                        <span className="text-sm font-serif italic text-olie-700 font-bold">#{item.id}</span>
                        {item.rush && <span className="ml-3 px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase rounded-md border border-rose-100">Rush</span>}
                      </td>
                      <td className="px-10 py-8">
                        <p className="font-bold text-stone-800 text-sm">{item.product}</p>
                        <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest font-black italic">{item.client}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-olie-500" />
                           <span className="text-[10px] font-black uppercase text-stone-600 tracking-widest">{PRODUCTION_STAGES_CONFIG[item.stage].label}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-black text-stone-500">{item.efficiency}%</span>
                          <div className="w-24 h-1 bg-stone-100 rounded-full overflow-hidden">
                             <div className={`h-full ${item.efficiency && item.efficiency < 85 ? 'bg-orange-400' : 'bg-emerald-400'}`} style={{ width: `${item.efficiency}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-[10px] font-bold text-stone-400 uppercase tracking-widest">{item.date}</td>
                      <td className="px-10 py-8 text-right">
                         <button className="p-3 text-stone-200 group-hover:text-olie-500 transition-all transform group-hover:translate-x-1">
                            <ChevronRight size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: CALENDAR (MOCK) */}
        {viewMode === 'calendar' && (
          <div className="h-full flex flex-col items-center justify-center p-20 animate-in zoom-in-95 duration-500">
             <div className="max-w-md text-center space-y-6">
                <div className="w-24 h-24 bg-olie-50 rounded-[2.5rem] border border-olie-100 flex items-center justify-center text-olie-500 mx-auto shadow-sm">
                   <CalendarIcon size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-serif italic text-olie-900">Agenda de Expedição</h3>
                <p className="text-sm text-stone-400 leading-relaxed font-medium">
                  Integração em andamento para exibir o cronograma visual de finalização de lotes baseado na sua capacidade atual de 92%.
                </p>
                <div className="pt-8 flex justify-center gap-4">
                   <button onClick={() => setViewMode('kanban')} className="px-8 py-3 bg-olie-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">Ver Kanban Atual</button>
                   <button className="px-8 py-3 bg-white border border-stone-100 text-stone-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-stone-50 transition-all">Relatório Semanal</button>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* DETAIL DRAWER */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedItem(null)} />
          <aside className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <header className="h-24 px-8 border-b border-stone-100 flex items-center justify-between shrink-0">
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Ficha Técnica V.3</span>
                  <h2 className="text-2xl font-serif italic text-olie-900">Peça #{selectedItem.id}</h2>
               </div>
               <button onClick={() => setSelectedItem(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-stone-50 text-stone-400 hover:text-olie-500 transition-all">
                 <X size={20} />
               </button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide pb-32">
              <div className="flex gap-8 items-start">
                 <div className="w-32 h-32 bg-stone-50 rounded-[2.5rem] border border-stone-100 flex items-center justify-center text-stone-200 shadow-inner">
                    <ImageIcon size={48} strokeWidth={1} />
                 </div>
                 <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-serif italic text-olie-900 leading-tight">{selectedItem.product}</h3>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest italic">{selectedItem.sku}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-olie-50 rounded-full border border-olie-100">
                       <div className="w-1.5 h-1.5 rounded-full bg-olie-500" />
                       <span className="text-[9px] font-black uppercase text-olie-700">{PRODUCTION_STAGES_CONFIG[selectedItem.stage].label}</span>
                    </div>
                 </div>
              </div>

              {/* Quality Checklist */}
              <section className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-300 border-b border-stone-100 pb-2 flex items-center gap-2">
                   <ShieldCheck size={14} /> Controle de Qualidade
                 </h4>
                 <div className="space-y-3">
                    {PRODUCTION_STAGES_CONFIG[selectedItem.stage].checklist.map((task, i) => (
                       <label key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-all cursor-pointer group">
                          <input type="checkbox" className="w-5 h-5 rounded-lg border-stone-300 text-olie-500 focus:ring-olie-500 transition-all" />
                          <span className="text-xs font-medium text-stone-600 group-hover:text-olie-900">{task}</span>
                       </label>
                    ))}
                 </div>
              </section>

              {/* AI Craftsmanship Tips */}
              <section className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-300 border-b border-stone-100 pb-2 flex-1 flex items-center gap-2">
                      <BrainCircuit size={14} /> Consultoria de Bancada
                    </h4>
                    <button 
                      onClick={handleConsultAI}
                      disabled={isConsultingAI}
                      className="text-[9px] font-black uppercase tracking-widest text-olie-500 hover:text-olie-700 flex items-center gap-1 px-3 py-1 bg-olie-50 rounded-lg ml-4"
                    >
                      {isConsultingAI ? <Loader2 size={12} className="animate-spin" /> : 'Consultar'}
                    </button>
                 </div>
                 
                 {aiTips.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                       {aiTips.map((tip, i) => (
                          <div key={i} className="p-4 bg-stone-900 rounded-2xl flex gap-3 shadow-xl">
                             <div className="w-5 h-5 rounded-full bg-olie-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">!</div>
                             <p className="text-[11px] text-stone-300 italic font-serif leading-relaxed">{tip}</p>
                          </div>
                       ))}
                    </div>
                 ) : !isConsultingAI && (
                    <p className="text-[10px] text-stone-400 italic text-center py-6 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                      Clique em consultar para dicas exclusivas do Mestre Artesão Digital.
                    </p>
                 )}
              </section>

              {/* Specs Grid */}
              <section className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-300 border-b border-stone-100 pb-2 flex items-center gap-2">
                   <Activity size={14} /> DNA da Peça
                 </h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-stone-50 rounded-[2rem] border border-stone-100 space-y-2">
                       <span className="text-[9px] font-black uppercase text-stone-300">Material</span>
                       <p className="text-xs font-bold text-stone-800">{selectedItem.details?.leather || 'Liso Nobre'}</p>
                    </div>
                    <div className="p-5 bg-stone-50 rounded-[2rem] border border-stone-100 space-y-2">
                       <span className="text-[9px] font-black uppercase text-stone-300">Hardware</span>
                       <p className="text-xs font-bold text-stone-800">{selectedItem.details?.hardware || 'Dourado 18k'}</p>
                    </div>
                 </div>
              </section>
            </div>

            <footer className="p-8 border-t border-stone-100 bg-white grid grid-cols-2 gap-4 absolute bottom-0 left-0 w-full shrink-0">
               <button className="flex items-center justify-center gap-2 h-14 bg-stone-100 text-stone-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all">
                 <History size={14} /> Histórico
               </button>
               <button className="flex items-center justify-center gap-2 h-14 bg-olie-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-stone-200 hover:bg-black transition-all">
                 Avançar Fluxo <ChevronRight size={14} />
               </button>
            </footer>
          </aside>
        </div>
      )}

      {/* Footer Status Bar */}
      <footer className="h-14 bg-white border-t border-stone-100 px-12 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Prioritário ({kpis.rushCount})</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Em Atraso ({kpis.delayedCount})</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-stone-300 italic text-[10px] font-medium">
                <Timer size={12} />
                Refresh automático em 30s
             </div>
             <div className="w-px h-4 bg-stone-100" />
             <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase">
                <CheckCircle2 size={12} /> Cloud Connected
             </div>
          </div>
      </footer>
    </main>
  );
}
