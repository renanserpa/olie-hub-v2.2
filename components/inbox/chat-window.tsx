
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  MoreVertical,
  Zap,
  ShoppingBag,
  ShoppingCart,
  Copy,
  Truck,
  CheckCircle2,
  X,
  Type as TypeIcon,
  ChevronDown,
  Info
} from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  rawDate: string; // ISO string
  isMe: boolean;
}

interface ChatWindowProps {
  client: {
    id: string;
    name: string;
    avatar: string;
    source: string;
  };
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenAction?: (action: 'catalog' | 'order') => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  client, 
  messages, 
  onSendMessage,
  onOpenAction
}) => {
  const [inputText, setInputText] = useState('');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'info' }>({ 
    message: '', 
    visible: false,
    type: 'success'
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Toast System
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleAction = (action: string) => {
    setIsActionsOpen(false);
    
    switch (action) {
      case 'catalog':
        onOpenAction?.('catalog');
        showToast("Catálogo Olie aberto", 'info');
        break;
      case 'order':
        onOpenAction?.('order');
        break;
      case 'pix':
        // Simulação de Copiar Chave PIX
        const pixKey = "00020126330014BR.GOV.BCB.PIX011112345678901";
        navigator.clipboard.writeText(pixKey);
        showToast("Chave PIX copiada para o clipboard!");
        onSendMessage(`Prezada ${client.name.split(' ')[0]}, segue nossa chave PIX para fechamento: \n\n\`${pixKey}\``);
        break;
      case 'freight':
        showToast("Cotação de frete processada!", 'info');
        onSendMessage("📦 Acabei de cotar seu frete: via Melhor Envio ficou em R$ 24,90 (4 dias úteis). Deseja incluir no pedido?");
        break;
    }
  };

  // Processing messages for grouping and separators
  const processedItems = useMemo(() => {
    const items: any[] = [];
    messages.forEach((msg, idx) => {
      const prevMsg = messages[idx - 1];
      const nextMsg = messages[idx + 1];
      
      const currDate = new Date(msg.rawDate);
      const prevDate = prevMsg ? new Date(prevMsg.rawDate) : null;

      // 1. Date Separator Logic
      if (!prevDate || currDate.toDateString() !== prevDate.toDateString()) {
        const dateLabel = currDate.toDateString() === new Date().toDateString() ? 'Hoje' :
                        currDate.toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Ontem' :
                        currDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        items.push({ type: 'date', label: dateLabel });
      }

      // 2. Grouping Logic (Same sender and < 5 mins apart)
      const isSameAsPrevious = prevMsg && prevMsg.isMe === msg.isMe && 
                              (new Date(msg.rawDate).getTime() - new Date(prevMsg.rawDate).getTime()) < 5 * 60 * 1000;
      
      const isSameAsNext = nextMsg && nextMsg.isMe === msg.isMe && 
                          (new Date(nextMsg.rawDate).getTime() - new Date(msg.rawDate).getTime()) < 5 * 60 * 1000;

      items.push({ 
        type: 'message', 
        ...msg, 
        isFirstInGroup: !isSameAsPrevious,
        isLastInGroup: !isSameAsNext,
        isMiddle: isSameAsPrevious && isSameAsNext
      });
    });
    return items;
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6] h-full relative overflow-hidden">
      
      {/* Header Estilo Luxury */}
      <div className="h-20 border-b border-stone-200 px-8 flex justify-between items-center bg-white/95 backdrop-blur-xl shrink-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.2rem] bg-[#C08A7D] flex items-center justify-center font-black text-white text-lg shadow-lg shadow-[#C08A7D]/20">
            {client.avatar}
          </div>
          <div>
            <h2 className="font-black text-[#333333] text-sm tracking-tight">{client.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-stone-400 font-black uppercase tracking-[0.15em]">Atendimento {client.source}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-stone-300 hover:text-[#C08A7D] hover:bg-stone-50 rounded-xl transition-all"><Phone size={18} /></button>
          <button className="p-2.5 text-stone-300 hover:text-[#C08A7D] hover:bg-stone-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Message List Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-0.5 scrollbar-hide bg-[#F4F1EA]/10">
        {processedItems.map((item, idx) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${idx}`} className="flex justify-center py-8">
                <span className="px-5 py-1.5 bg-white border border-stone-100 rounded-full text-[10px] font-black text-stone-300 uppercase tracking-widest shadow-sm">
                  {item.label}
                </span>
              </div>
            );
          }

          const isMe = item.isMe;
          const bubbleClasses = isMe 
            ? `bg-[#C08A7D] text-white ${item.isFirstInGroup ? 'rounded-tr-none' : ''} ${!item.isFirstInGroup ? 'rounded-tr-[1.6rem]' : ''} ${item.isLastInGroup ? 'rounded-br-[1.6rem]' : 'rounded-br-md'}`
            : `bg-white text-stone-800 border border-stone-100 ${item.isFirstInGroup ? 'rounded-tl-none' : ''} ${!item.isFirstInGroup ? 'rounded-tl-[1.6rem]' : ''} ${item.isLastInGroup ? 'rounded-bl-[1.6rem]' : 'rounded-bl-md'}`;

          const marginClass = item.isFirstInGroup ? 'mt-6' : 'mt-1';

          return (
            <div 
              key={item.id} 
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${marginClass} animate-in fade-in slide-in-from-bottom-2 duration-400`}
            >
              <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                
                {!isMe && item.isFirstInGroup && (
                  <span className="text-[10px] font-black text-[#C08A7D] uppercase mb-1.5 ml-3 tracking-widest">
                    {client.name}
                  </span>
                )}

                <div className={`group relative px-5 py-3.5 rounded-[1.6rem] text-[14px] leading-relaxed transition-all duration-200 shadow-sm ${bubbleClasses}`}>
                  <p className="font-medium whitespace-pre-wrap">{item.text}</p>
                  
                  {/* Timestamp discreto no hover */}
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-16' : '-right-16'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span className="text-[9px] font-black text-stone-300 uppercase">{item.timestamp}</span>
                  </div>
                </div>

                {item.isLastInGroup && (
                  <span className={`text-[8px] font-black text-stone-300 uppercase mt-1.5 px-3 tracking-tighter`}>
                    {item.timestamp} {isMe && '• Enviado'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Popover Context Menu */}
      {isActionsOpen && (
        <div className="absolute bottom-28 left-8 w-72 bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 p-2 animate-in fade-in slide-in-from-bottom-8 duration-300 z-[60] origin-bottom-left">
          <div className="px-5 pt-4 pb-3 border-b border-stone-50">
             <p className="text-[9px] font-black text-stone-300 uppercase tracking-[0.2em]">Fluxos de Operação</p>
          </div>
          
          <div className="p-1 space-y-1">
            {[
              { id: 'order', label: 'Lançar Pedido', icon: ShoppingBag, color: 'text-[#333333]', bg: 'hover:bg-stone-50' },
              { id: 'catalog', label: 'Enviar Catálogo', icon: ShoppingCart, color: 'text-[#333333]', bg: 'hover:bg-stone-50' },
              { id: 'pix', label: 'Copiar Chave Pix', icon: Copy, color: 'text-emerald-600', bg: 'hover:bg-emerald-50' },
              { id: 'freight', label: 'Cotação Frete', icon: Truck, color: 'text-blue-600', bg: 'hover:bg-blue-50' },
            ].map(action => (
              <button 
                key={action.id}
                onClick={() => handleAction(action.id)} 
                className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 group transition-all ${action.bg}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform shadow-sm`}>
                  <action.icon size={16} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest ${action.color}`}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar Estilo "Luxury Bubble" */}
      <div className="p-8 bg-white border-t border-stone-100 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          
          <div className="flex items-center gap-1 bg-stone-50 rounded-[2rem] p-1.5 border border-stone-100">
             <button 
              onClick={() => setIsActionsOpen(!isActionsOpen)} 
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${isActionsOpen ? 'bg-[#333333] text-white shadow-xl rotate-45' : 'text-stone-300 hover:text-[#C08A7D] hover:bg-white'}`}
            >
              <Zap size={20} fill={isActionsOpen ? "currentColor" : "none"} />
            </button>
            <div className="w-[1px] h-6 bg-stone-200 mx-1" />
            <button className="w-10 h-10 text-stone-300 hover:text-[#C08A7D] hover:bg-white rounded-2xl transition-all flex items-center justify-center">
              <Paperclip size={20} />
            </button>
          </div>

          <form onSubmit={handleSend} className="flex-1 flex items-center gap-4">
            <div className="flex-1 bg-stone-50 border border-stone-100 rounded-[2rem] px-8 py-4 focus-within:ring-4 focus-within:ring-[#C08A7D]/5 focus-within:bg-white focus-within:border-[#C08A7D]/20 transition-all">
              <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Responder para ${client.name.split(' ')[0]}...`} 
                className="w-full bg-transparent border-none text-[15px] font-medium outline-none placeholder:text-stone-300 text-stone-800" 
              />
            </div>
            <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="w-14 h-14 bg-[#C08A7D] text-white rounded-[1.8rem] flex items-center justify-center hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-[#C08A7D]/30 disabled:opacity-20 disabled:grayscale"
              >
                <Send size={24} className="ml-1" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${toast.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90 pointer-events-none'}`}>
        <div className={`px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border ${
          toast.type === 'success' ? 'bg-[#333333] text-white border-white/10' : 'bg-white text-stone-800 border-stone-100'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
        </div>
      </div>
    </div>
  );
};
