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
  Info,
  Sparkles
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
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'info' }>({ 
    message: '', 
    visible: false,
    type: 'success'
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

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
        showToast("Catálogo enviado", 'info');
        break;
      case 'order':
        onOpenAction?.('order');
        break;
      case 'pix':
        const pixKey = "00020126330014BR.GOV.BCB.PIX011112345678901";
        navigator.clipboard.writeText(pixKey);
        showToast("PIX copiado!");
        onSendMessage(`Seguimos com o fechamento. Chave PIX: \n\n\`${pixKey}\``);
        break;
      case 'freight':
        showToast("Cotação processada", 'info');
        onSendMessage("📦 Cotação Melhor Envio: R$ 24,90 (4 dias úteis).");
        break;
    }
  };

  const processedItems = useMemo(() => {
    const items: any[] = [];
    messages.forEach((msg, idx) => {
      const prevMsg = messages[idx - 1];
      const nextMsg = messages[idx + 1];
      const currDate = new Date(msg.rawDate);
      const prevDate = prevMsg ? new Date(prevMsg.rawDate) : null;

      if (!prevDate || currDate.toDateString() !== prevDate.toDateString()) {
        const dateLabel = currDate.toDateString() === new Date().toDateString() ? 'Hoje' :
                        currDate.toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Ontem' :
                        currDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        items.push({ type: 'date', label: dateLabel });
      }

      const isSameAsPrevious = prevMsg && prevMsg.isMe === msg.isMe && 
                              (new Date(msg.rawDate).getTime() - new Date(prevMsg.rawDate).getTime()) < 5 * 60 * 1000;
      
      const isSameAsNext = nextMsg && nextMsg.isMe === msg.isMe && 
                          (new Date(nextMsg.rawDate).getTime() - new Date(msg.rawDate).getTime()) < 5 * 60 * 1000;

      items.push({ 
        type: 'message', 
        ...msg, 
        isFirstInGroup: !isSameAsPrevious,
        isLastInGroup: !isSameAsNext
      });
    });
    return items;
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F6] h-full relative overflow-hidden">
      {/* Header Luxury */}
      <div className="h-24 px-10 border-b border-stone-200 flex justify-between items-center bg-white/95 backdrop-blur-xl shrink-0 z-40 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-[1.4rem] bg-[#C08A7D] flex items-center justify-center font-black text-white text-xl shadow-2xl shadow-[#C08A7D]/30 border-2 border-white">
              {client.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
          </div>
          <div>
            <h2 className="font-black text-[#333333] text-lg tracking-tight italic">{client.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[9px] text-[#C08A7D] font-black uppercase tracking-[0.2em]">{client.source} Business</span>
              <div className="w-1 h-1 rounded-full bg-stone-300" />
              <span className="text-[9px] text-stone-400 font-black uppercase tracking-[0.2em]">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-11 h-11 flex items-center justify-center text-stone-300 hover:text-[#C08A7D] hover:bg-stone-50 rounded-2xl transition-all border border-transparent hover:border-stone-100"><Phone size={20} /></button>
          <button className="w-11 h-11 flex items-center justify-center text-stone-300 hover:text-[#C08A7D] hover:bg-stone-50 rounded-2xl transition-all border border-transparent hover:border-stone-100"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-10 space-y-1 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
        {processedItems.map((item, idx) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${idx}`} className="flex justify-center py-10">
                <span className="px-6 py-2 bg-white/50 backdrop-blur-sm border border-stone-100 rounded-full text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] shadow-sm">
                  {item.label}
                </span>
              </div>
            );
          }

          const isMe = item.isMe;
          return (
            <div 
              key={item.id} 
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${item.isFirstInGroup ? 'mt-8' : 'mt-1'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
            >
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {item.isFirstInGroup && !isMe && (
                   <span className="text-[9px] font-black text-[#C08A7D] uppercase mb-2 ml-4 tracking-widest">{client.name.split(' ')[0]}</span>
                )}
                
                <div className={`group relative px-6 py-4 text-[15px] font-medium leading-relaxed transition-all shadow-sm ${
                  isMe 
                    ? `bg-[#333333] text-white ${item.isFirstInGroup ? 'rounded-[2rem] rounded-tr-none' : 'rounded-[2rem]'} shadow-stone-900/10` 
                    : `bg-white text-stone-800 border border-stone-100 ${item.isFirstInGroup ? 'rounded-[2rem] rounded-tl-none' : 'rounded-[2rem]'}`
                }`}>
                  <p className="whitespace-pre-wrap">{item.text}</p>
                  
                  {/* Hover Timestamp */}
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter`}>
                    {item.timestamp}
                  </div>
                </div>

                {item.isLastInGroup && (
                  <span className="text-[8px] font-black text-stone-300 uppercase mt-2 px-4 tracking-tighter flex items-center gap-1">
                    {item.timestamp} {isMe && <CheckCircle2 size={10} className="text-emerald-500" />}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white px-6 py-4 rounded-[2rem] rounded-tl-none border border-stone-100 flex items-center gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 bg-[#C08A7D] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-[#C08A7D] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-[#C08A7D] rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="px-10 py-10 bg-white border-t border-stone-100 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-5">
          
          <div className="flex items-center gap-1 bg-stone-50 rounded-[2.2rem] p-1.5 border border-stone-100">
             <button 
              onClick={() => setIsActionsOpen(!isActionsOpen)} 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActionsOpen ? 'bg-[#333333] text-white shadow-xl rotate-45' : 'text-stone-300 hover:text-[#C08A7D] hover:bg-white'}`}
            >
              <Zap size={20} fill={isActionsOpen ? "currentColor" : "none"} />
            </button>
            <div className="w-px h-6 bg-stone-200 mx-2" />
            <button className="w-11 h-11 text-stone-300 hover:text-[#C08A7D] hover:bg-white rounded-2xl transition-all flex items-center justify-center">
              <Paperclip size={20} />
            </button>
          </div>

          <form onSubmit={handleSend} className="flex-1 flex items-center gap-5">
            <div className="flex-1 bg-stone-50 border border-stone-100 rounded-[2.2rem] px-8 py-5 focus-within:ring-8 focus-within:ring-[#C08A7D]/5 focus-within:bg-white focus-within:border-[#C08A7D]/20 transition-all">
              <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Responder para ${client.name.split(' ')[0]}...`} 
                className="w-full bg-transparent border-none text-[16px] font-medium outline-none placeholder:text-stone-300 text-stone-800" 
              />
            </div>
            <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="w-16 h-16 bg-[#C08A7D] text-white rounded-[1.8rem] flex items-center justify-center hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-[#C08A7D]/40 disabled:opacity-20 disabled:grayscale group"
              >
                <Send size={28} className="ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>

      {/* Actions Menu Popover */}
      {isActionsOpen && (
        <div className="absolute bottom-32 left-10 w-80 bg-white rounded-[3rem] shadow-2xl border border-stone-100 p-3 animate-in fade-in slide-in-from-bottom-10 duration-500 z-[60] origin-bottom-left">
          <div className="px-6 py-5 border-b border-stone-50 flex items-center justify-between">
             <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Fluxos Operacionais</p>
             <Sparkles size={14} className="text-[#C08A7D]" />
          </div>
          
          <div className="p-2 grid grid-cols-1 gap-1">
            {[
              { id: 'order', label: 'Novo Pedido', icon: ShoppingBag, color: 'text-[#333333]', bg: 'hover:bg-stone-50' },
              { id: 'catalog', label: 'Catálogo Lux', icon: ShoppingCart, color: 'text-[#C08A7D]', bg: 'hover:bg-[#C08A7D]/5' },
              { id: 'pix', label: 'Chave Pix', icon: Copy, color: 'text-emerald-600', bg: 'hover:bg-emerald-50' },
              { id: 'freight', label: 'Frete Melhor Envio', icon: Truck, color: 'text-blue-600', bg: 'hover:bg-blue-50' },
            ].map(action => (
              <button 
                key={action.id}
                onClick={() => handleAction(action.id)} 
                className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 group transition-all ${action.bg}`}
              >
                <div className={`w-11 h-11 rounded-xl bg-white border border-stone-100 flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform shadow-sm`}>
                  <action.icon size={18} />
                </div>
                <span className={`text-[12px] font-black uppercase tracking-widest ${action.color}`}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <div className={`fixed bottom-36 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${toast.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}`}>
        <div className={`px-10 py-5 rounded-full shadow-2xl flex items-center gap-5 border border-white/20 backdrop-blur-xl ${
          toast.type === 'success' ? 'bg-[#333333] text-white' : 'bg-white text-stone-800 border-stone-200'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-[#C08A7D]'
          }`}>
            <CheckCircle2 size={20} className="text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap italic">{toast.message}</span>
        </div>
      </div>
    </div>
  );
};