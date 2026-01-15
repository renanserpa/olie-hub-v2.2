
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, Paperclip, PanelLeftClose, PanelLeftOpen, 
  PanelRightClose, PanelRightOpen, CheckCircle2,
  Copy, Truck, Plus, ShoppingBag, Package, Sparkles
} from 'lucide-react';
import { Message, ChannelSource } from '../../types/index.ts';
import { OmnichannelService } from '../../services/api.ts';

interface ChatWindowProps {
  client: { id: string; name: string; avatar: string; source: ChannelSource; } | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  
  // Layout Props
  isLeftOpen: boolean;
  onToggleLeft: () => void;
  isRightOpen: boolean;
  onToggleRight: () => void;
  
  // Action Handlers
  onTriggerAction: (action: 'order' | 'catalog') => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  client, messages, onSendMessage, 
  isLeftOpen, onToggleLeft, isRightOpen, onToggleRight,
  onTriggerAction
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // --- 1. Toast System ---
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // --- 2. Scroll Logic ---
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, client?.id]);

  // --- 3. Click Outside Action Menu ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 4. Handlers ---
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending || !client) return;

    setIsSending(true);
    try {
      const success = await OmnichannelService.sendMessage(client.source, client.id, inputText);
      if (success) {
        onSendMessage(inputText);
        setInputText('');
      }
    } catch (err) {
      console.error("Erro envio");
    } finally {
      setIsSending(false);
    }
  };

  const handleActionClick = (action: 'order' | 'catalog' | 'pix' | 'freight') => {
    setIsActionMenuOpen(false);
    
    switch (action) {
      case 'pix':
        const mockPixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Olie Atelie6008Sao Paulo62070503***6304E2CA";
        navigator.clipboard.writeText(mockPixCode).then(() => {
           showToast("Link Pix copiado para a área de transferência!", 'success');
        });
        break;
      case 'freight':
        showToast("Cotação de frete solicitada (Melhor Envio)", 'info');
        break;
      case 'order':
        onTriggerAction('order');
        break;
      case 'catalog':
        onTriggerAction('catalog');
        break;
    }
  };

  // --- 5. Data Processing (Smart Grouping & Date Separators) ---
  const safeDate = (d: string) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const processedItems = useMemo(() => {
    if (!client) return [];
    
    const items: any[] = [];
    messages.forEach((msg, idx) => {
      if (!msg.created_at) return;
      
      const prevMsg = messages[idx - 1];
      const nextMsg = messages[idx + 1];
      
      const currDate = safeDate(msg.created_at);
      const prevDate = prevMsg && prevMsg.created_at ? safeDate(prevMsg.created_at) : null;
      const nextDate = nextMsg && nextMsg.created_at ? safeDate(nextMsg.created_at) : null;

      // --- DATE SEPARATOR LOGIC ---
      // Insert a separator if it's the first message OR if the day changed from the previous message
      if (!prevDate || currDate.toDateString() !== prevDate.toDateString()) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        let dateLabel = currDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        
        // Smart Labels
        if (currDate.toDateString() === today.toDateString()) {
           dateLabel = 'Hoje';
        } else if (currDate.toDateString() === yesterday.toDateString()) {
           dateLabel = 'Ontem';
        }

        items.push({ type: 'date', label: dateLabel });
      }

      // --- MESSAGE GROUPING LOGIC ---
      const TIME_THRESHOLD_MS = 5 * 60 * 1000; // 5 Minutes
      
      const isSameUserPrev = prevMsg && prevMsg.direction === msg.direction;
      const timeDiffPrev = prevDate ? currDate.getTime() - prevDate.getTime() : Infinity;
      
      // Determine geometry based on neighbors
      const isFirstInGroup = !isSameUserPrev || timeDiffPrev > TIME_THRESHOLD_MS || (!prevDate || currDate.toDateString() !== prevDate.toDateString());

      const isSameUserNext = nextMsg && nextMsg.direction === msg.direction;
      const timeDiffNext = nextDate ? nextDate.getTime() - currDate.getTime() : Infinity;
      
      const isLastInGroup = !isSameUserNext || timeDiffNext > TIME_THRESHOLD_MS || (nextDate && currDate.toDateString() !== nextDate.toDateString());

      items.push({ 
        ...msg,
        type: 'message',
        isMe: msg.direction === 'outbound',
        isFirstInGroup, 
        isLastInGroup 
      });
    });
    return items;
  }, [messages, client]);

  // --- 6. EMPTY STATE ---
  if (!client) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFBF7] relative h-full overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-[#FDFBF7] to-[#FDFBF7] z-0" />
         
         <div className="absolute top-4 left-4 z-50">
            {!isLeftOpen && (
              <button onClick={onToggleLeft} className="p-2 bg-white border border-[#EBE8E0] rounded-xl text-stone-400 hover:text-[#C08A7D] shadow-sm transition-all hover:scale-105">
                <PanelLeftOpen size={20} />
              </button>
            )}
         </div>
         
         <div className="relative group cursor-default z-10 text-center">
            <div className="absolute inset-0 bg-[#C08A7D]/20 blur-3xl rounded-full scale-150 animate-pulse opacity-40" />
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FAF9F6] to-[#F2F0EA] rounded-[2rem] border border-[#EBE8E0] flex items-center justify-center mb-8 relative shadow-xl shadow-[#C08A7D]/10 group-hover:-translate-y-2 transition-transform duration-500">
                <Sparkles size={32} className="text-[#C08A7D] animate-[spin_10s_linear_infinite]" strokeWidth={1} />
            </div>
            
            <h2 className="font-serif italic text-4xl text-[#1A1A1A] mb-3">Bem-vindo ao Inbox</h2>
            <p className="text-[10px] font-black font-sans text-stone-400 uppercase tracking-[0.2em] mb-8">Selecione uma conversa para iniciar</p>
         
            <div className="grid grid-cols-1 gap-4 max-w-xs w-64 mx-auto opacity-30 pointer-events-none select-none">
                <div className="h-2.5 w-full bg-[#EBE8E0] rounded-full" />
                <div className="h-2.5 w-2/3 bg-[#EBE8E0] rounded-full mx-auto" />
                <div className="h-2.5 w-3/4 bg-[#EBE8E0] rounded-full mx-auto" />
            </div>
         </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#FDFBF7]">
      {/* Texture Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
      
      {/* HEADER */}
      <header className="h-16 px-6 border-b border-[#F2F0EA] flex justify-between items-center bg-white/80 backdrop-blur-md z-40 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button 
             onClick={onToggleLeft}
             className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 hover:text-[#C08A7D] transition-colors"
             title={isLeftOpen ? "Fechar Lista" : "Abrir Lista"}
          >
             {isLeftOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>

          <div 
            onClick={onToggleRight}
            className="flex items-center gap-3 pl-4 border-l border-stone-100 cursor-pointer group select-none py-1"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C08A7D] flex items-center justify-center font-serif text-white italic text-base shadow-md shadow-[#C08A7D]/20 group-hover:scale-105 transition-transform">
              {client.avatar}
            </div>
            <div className="flex flex-col">
              <h2 className="font-serif font-bold text-[#333333] text-base tracking-tight leading-none group-hover:text-[#C08A7D] transition-colors">
                {client.name}
              </h2>
              <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-0.5">{client.source}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
              onClick={onToggleRight}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                 isRightOpen 
                   ? 'bg-[#333333] text-white shadow-lg shadow-black/10' 
                   : 'text-stone-400 hover:text-[#C08A7D] hover:bg-stone-50'
              }`}
              title={isRightOpen ? "Fechar Detalhes" : "Ver Detalhes"}
           >
              {isRightOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
           </button>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-0.5 scrollbar-hide flex flex-col z-10 relative">
        {processedItems.map((item, idx) => {
          
          // --- RENDER DATE SEPARATOR (STICKY) ---
          if (item.type === 'date') return (
            <div key={`date-${idx}`} className="flex justify-center py-6 sticky top-0 z-30 pointer-events-none">
              <span className="px-4 py-1.5 bg-[#FDFBF7]/90 backdrop-blur-md border border-[#EBE8E0] rounded-full text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] shadow-sm select-none">
                {item.label}
              </span>
            </div>
          );

          // --- RENDER MESSAGE BUBBLE ---
          const isMe = item.isMe;
          
          // Adaptive Geometry: Smart Border Radius
          let radiusClass = '';
          if (isMe) {
            // My messages
            radiusClass = `rounded-l-[1.4rem] ${item.isFirstInGroup ? 'rounded-tr-[1.4rem]' : 'rounded-tr-[2px]'} ${item.isLastInGroup ? 'rounded-br-[1.4rem]' : 'rounded-br-[2px]'}`;
          } else {
            // Their messages
            radiusClass = `rounded-r-[1.4rem] ${item.isFirstInGroup ? 'rounded-tl-[1.4rem]' : 'rounded-tl-[2px]'} ${item.isLastInGroup ? 'rounded-bl-[1.4rem]' : 'rounded-bl-[2px]'}`;
          }

          const marginClass = item.isFirstInGroup ? 'mt-4' : 'mt-[2px]';

          return (
            <div key={item.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${marginClass} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                
                <div className={`px-5 py-3 text-[14px] font-medium leading-relaxed shadow-sm relative transition-all hover:shadow-md ${
                  isMe 
                    ? 'bg-gradient-to-br from-olie-500 to-olie-700 text-white ' + radiusClass 
                    : 'bg-white text-stone-700 border border-[#F2F0EA] ' + radiusClass
                }`}>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>

                {/* Metadata: Only on the last message of the group */}
                {item.isLastInGroup && (
                  <span className={`text-[9px] font-bold text-stone-300 uppercase mt-1 px-1 flex items-center gap-1.5 ${isMe ? 'justify-end' : 'items-start'}`}>
                    {safeDate(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    {isMe && <CheckCircle2 size={10} className="text-[#C08A7D]" />}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER & ACTION MENU */}
      <div className="px-6 py-4 bg-white border-t border-[#F2F0EA] z-40 shrink-0 relative">
        
        {/* ACTION MENU POPUP */}
        {isActionMenuOpen && (
          <div ref={actionMenuRef} className="absolute bottom-20 left-6 w-56 bg-white rounded-2xl shadow-2xl border border-[#F2F0EA] overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
             <div className="p-1.5 space-y-0.5">
                <button onClick={() => handleActionClick('order')} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#FAF9F6] rounded-xl transition-colors text-stone-600 hover:text-[#C08A7D] group">
                   <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-[#C08A7D] group-hover:text-white transition-all"><ShoppingBag size={14} /></div>
                   <span className="text-[11px] font-black uppercase tracking-wide">Novo Pedido</span>
                </button>
                <button onClick={() => handleActionClick('catalog')} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#FAF9F6] rounded-xl transition-colors text-stone-600 hover:text-[#C08A7D] group">
                   <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-[#C08A7D] group-hover:text-white transition-all"><Package size={14} /></div>
                   <span className="text-[11px] font-black uppercase tracking-wide">Abrir Catálogo</span>
                </button>
                <div className="h-px bg-stone-100 my-1" />
                <button onClick={() => handleActionClick('pix')} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#FAF9F6] rounded-xl transition-colors text-stone-600 hover:text-[#C08A7D] group">
                   <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-[#C08A7D] group-hover:text-white transition-all"><Copy size={14} /></div>
                   <span className="text-[11px] font-black uppercase tracking-wide">Gerar Pix</span>
                </button>
                <button onClick={() => handleActionClick('freight')} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#FAF9F6] rounded-xl transition-colors text-stone-600 hover:text-[#C08A7D] group">
                   <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-[#C08A7D] group-hover:text-white transition-all"><Truck size={14} /></div>
                   <span className="text-[11px] font-black uppercase tracking-wide">Consultar Frete</span>
                </button>
             </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-[#FAF9F6] border border-[#F2F0EA] rounded-[1.5rem] p-1.5 pr-2 focus-within:ring-2 focus-within:ring-[#C08A7D]/10 focus-within:border-[#C08A7D]/30 transition-all shadow-inner">
           
           <button 
              type="button" 
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isActionMenuOpen ? 'bg-[#333333] text-white rotate-45 shadow-lg' : 'bg-white border border-[#EBE8E0] text-stone-400 hover:text-[#C08A7D] hover:border-[#C08A7D]/30'}`}
              title="Ações Rápidas"
           >
              <Plus size={18} />
           </button>

           <input 
              value={inputText} 
              onChange={e => setInputText(e.target.value)} 
              placeholder="Escreva sua mensagem..." 
              className="flex-1 bg-transparent outline-none text-stone-700 placeholder:text-stone-300 h-full py-2.5 text-sm font-medium" 
           />
           
           <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-[#C08A7D] hover:bg-white transition-all">
              <Paperclip size={18} />
           </button>
           
           <button 
              type="submit" 
              disabled={!inputText.trim() || isSending} 
              className="w-9 h-9 bg-[#C08A7D] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#A67569] disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 active:scale-95"
           >
              <Send size={16} className="ml-0.5" />
           </button>
        </form>
      </div>

      {/* TOAST NOTIFICATIONS CONTAINER */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-max pointer-events-none">
         {toasts.map(toast => (
            <div key={toast.id} className="bg-[#333333] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto border border-white/10">
               <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'} shadow-[0_0_8px_rgba(52,211,153,0.5)]`} />
               <span className="text-xs font-bold tracking-wide">{toast.message}</span>
            </div>
         ))}
      </div>
    </div>
  );
};
