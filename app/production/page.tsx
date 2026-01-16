
"use client";

import React, { useEffect, useReducer, useRef } from 'react';
import { ProductionService } from '../../services/api.ts';
import { ProductionStage } from '../../types/index.ts';
import { PRODUCTION_STAGES_CONFIG } from '../../lib/constants.ts';
import { Clock, AlertCircle } from 'lucide-react';

// --- Reducer Types & Logic ---

interface ProductionItem {
  id: string;
  client: string;
  product: string;
  stage: ProductionStage;
  sku: string;
  date: string;
  rush?: boolean;
}

interface BoardState {
  items: ProductionItem[];
  loading: boolean;
  draggedItemId: string | null;
}

type Action =
  | { type: 'LOAD_DATA'; payload: ProductionItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'DRAG_START'; payload: string }
  | { type: 'DRAG_END' }
  | { type: 'MOVE_ITEM'; payload: { itemId: string; newStage: ProductionStage } };

const initialState: BoardState = {
  items: [],
  loading: true,
  draggedItemId: null,
};

function productionReducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, items: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'DRAG_START':
      return { ...state, draggedItemId: action.payload };
    case 'DRAG_END':
      return { ...state, draggedItemId: null };
    case 'MOVE_ITEM':
      const updatedItems = state.items.map((item) => {
        if (item.id === action.payload.itemId) {
          return { ...item, stage: action.payload.newStage };
        }
        return item;
      });
      return { ...state, items: updatedItems, draggedItemId: null };
    default:
      return state;
  }
}

// --- Component ---

export default function ProductionPage() {
  const [state, dispatch] = useReducer(productionReducer, initialState);
  const dragItemNode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const data = await ProductionService.getList();
        dispatch({ type: 'LOAD_DATA', payload: data });
      } catch (err) {
        console.error("Erro ao carregar Kanban:", err);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadBoard();
  }, []);

  // --- DnD Handlers ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    // We set the ID in dataTransfer to retrieve it on drop
    e.dataTransfer.setData('text/plain', id);
    // Dispatch state update
    dispatch({ type: 'DRAG_START', payload: id });
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Essential to allow dropping
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent, stage: ProductionStage) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      dispatch({ type: 'MOVE_ITEM', payload: { itemId, newStage: stage } });
    }
  };

  const stages: ProductionStage[] = ['corte', 'costura', 'montagem', 'acabamento', 'pronto'];

  if (state.loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Clean */}
      <header className="h-24 px-12 flex items-center justify-between shrink-0 bg-[#FDFBF7] z-40 border-b border-[#EBE8E0]">
        <div>
          <h1 className="text-3xl font-serif italic text-[#1A1A1A]">Ateliê Digital</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Fluxo de Confecção</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EBE8E0] rounded-full shadow-sm">
              <Clock size={14} className="text-olie-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Prazo Médio: 12 Dias</span>
           </div>
           <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-[#FDFBF7] bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-500">
                  {String.fromCharCode(64+i)}
               </div>
             ))}
             <div className="w-8 h-8 rounded-full border-2 border-[#FDFBF7] bg-olie-500 flex items-center justify-center text-[9px] font-bold text-white">
                +4
             </div>
           </div>
        </div>
      </header>

      {/* Horizontal Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-12">
        <div className="flex gap-10 h-full min-w-max">
          {stages.map((stage) => {
            const stageConfig = PRODUCTION_STAGES_CONFIG[stage];
            const stageItems = state.items.filter(i => i.stage === stage);
            
            // Visual cue for drop target could be added here if needed
            
            return (
              <div 
                key={stage} 
                className="w-[320px] flex flex-col h-full group transition-colors rounded-[2rem] px-2 -mx-2 hover:bg-white/40"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#EBE8E0] px-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl filter drop-shadow-sm grayscale-[0.2]">{stageConfig.emoji}</span>
                    <h3 className="text-lg font-serif italic text-[#1A1A1A]">{stageConfig.label}</h3>
                  </div>
                  <span className="text-[10px] font-black text-stone-400 bg-white px-2.5 py-1 rounded-full border border-[#EBE8E0] shadow-sm">{stageItems.length}</span>
                </div>

                {/* Column Body - Drop Zone */}
                <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-hide pb-10">
                  {stageItems.map(item => {
                     const isDragging = state.draggedItemId === item.id;
                     
                     return (
                      <div 
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragEnd={() => dispatch({ type: 'DRAG_END' })}
                        className={`
                          bg-white p-6 rounded-[1.8rem] border border-transparent shadow-sm 
                          hover:shadow-xl hover:shadow-stone-200/40 hover:scale-[1.02] hover:border-olie-500/10 
                          transition-all duration-300 cursor-grab active:cursor-grabbing relative overflow-hidden group/card
                          ${isDragging ? 'opacity-40 rotate-3 scale-95 grayscale' : 'opacity-100'}
                        `}
                      >
                        {/* Drag Handle Visual Hint */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-stone-100 opacity-0 group-hover/card:opacity-100 transition-opacity" />

                        {item.rush && (
                          <div className="absolute top-4 right-4 flex items-center gap-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">Urgente</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          </div>
                        )}
                        
                        <div className="mb-5 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 block mb-1.5">{item.id}</span>
                          <h4 className="font-serif italic text-xl text-[#1A1A1A] leading-tight pr-4">{item.product}</h4>
                        </div>

                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-8 h-8 rounded-xl bg-[#FDFBF7] border border-[#EBE8E0] flex items-center justify-center text-[10px] font-black text-stone-400 shadow-inner">
                              {item.client.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-stone-500 truncate">{item.client}</span>
                        </div>

                        <div className="pt-4 border-t border-[#FDFBF7] flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">{item.sku.split('-').pop()}</span>
                          <div className="flex items-center gap-1.5 bg-olie-50 px-2.5 py-1 rounded-lg">
                              <Clock size={10} className="text-olie-500" />
                              <span className="text-[9px] font-bold text-olie-700">{item.date}</span>
                          </div>
                        </div>
                      </div>
                     );
                  })}
                  
                  {stageItems.length === 0 && (
                     <div className="h-40 border-2 border-dashed border-[#EBE8E0] rounded-[1.5rem] flex flex-col gap-2 items-center justify-center opacity-50 group-hover:border-olie-200 group-hover:bg-white/20 transition-all">
                        <span className="text-2xl opacity-20 filter grayscale">{stageConfig.emoji}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">Sem itens</span>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
