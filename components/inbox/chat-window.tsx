
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, Paperclip, PanelLeftClose, PanelLeftOpen, 
  PanelRightClose, PanelRightOpen, CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { Message, ChannelSource } from '../../types/index.ts';
import { OmnichannelService } from '../../services/api.ts';

interface ChatWindowProps {
  client: { id: string; name: string; avatar: string; source: ChannelSource; };
  messages: Message[];
  onSendMessage: (text: string) => void;
  
  // Layout Props
  isLeftOpen: boolean;
  onToggleLeft: () => void;
  isRightOpen: boolean;
  onToggleRight: () => void;
  
  onOpenAction?: (action: 'catalog' | 'order') => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  client, messages, onSendMessage, 
  isLeftOpen, onToggleLeft, isRightOpen, onToggleRight
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

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

  const safeDate = (d: string) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const processedItems = useMemo(() => {
    const items: any[] = [];
    messages.forEach((msg, idx) => {
      if (!msg.created_at) return;
      const prevMsg = messages[idx - 1];
      const nextMsg = messages[idx + 1];
      const currDate = safeDate(msg.created_at);
      const prevDate = prevMsg && prevMsg.created_at ? safeDate(prevMsg.created_at) : null;

      if (!prevDate || currDate.toDateString() !== prevDate.toDateString()) {
        const dateLabel = currDate.toDateString() === new Date().toDateString() ? 'Hoje' :
                        currDate.toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Ontem' :
                        currDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        items.push({ type: 'date', label: dateLabel });
      }

      const isSameAsPrev = prevMsg && prevMsg.direction === msg.direction;
      const isSameAsNext = nextMsg && nextMsg.direction === msg.direction;

      items.push({ 
        ...msg,
        type: 'message',
        isMe: msg.direction === 'outbound',
        isFirstInGroup: !isSameAsPrev, 
        isLastInGroup: !isSameAsNext 
      });
    });
    return items;
  }, [messages]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#FDFBF7]">
      {/* Background Texture Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
      
      {/* 1. Fixed Header (h-16) */}
      <header className="h-16 px-6 border-b border-[#F2F0EA] flex justify-between items-center bg-white/80 backdrop-blur-md z-40 shrink-0 shadow-sm">
        
        <div className="flex items-center gap-4">
          {/* Left Toggle */}
          <button 
             onClick={onToggleLeft}
             className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 hover:text-[#C08A7D] transition-colors"
             title={isLeftOpen ? "Fechar Lista" : "Abrir Lista"}
          >
             {isLeftOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>

          {/* Client Info (Clickable to toggle Right Panel) */}
          <div 
            onClick={onToggleRight}
            className="flex items-center gap-3 pl-2 border-l border-stone-100 cursor-pointer group select-none"
            title="Ver detalhes do cliente"
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
           <button className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 transition-colors">
              <MoreVertical size={18} />
           </button>

           {/* Right Toggle */}
           <button 
              onClick={onToggleRight}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                 isRightOpen 
                   ? 'bg-[#333333] text-white shadow-lg shadow-black/10' 
                   : 'text-stone-400 hover:text-[#C08A7D] hover:bg-stone-50'
              }`}
              title={isRightOpen ? "Fechar Painel" : "Abrir Detalhes"}
           >
              {isRightOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
           </button>
        </div>
      </header>

      {/* 2. Scrollable Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-2 scrollbar-hide flex flex-col z-10">
        {processedItems.map((item, idx) => {
          if (item.type === 'date') return (
            <div key={`date-${idx}`} className="flex justify-center py-6 sticky top-0 z-20">
              <span className="px-3 py-1 bg-[#FDFBF7]/90 backdrop-blur border border-[#EBE8E0] rounded-full text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] shadow-sm">
                {item.label}
              </span>
            </div>
          );

          const isMe = item.isMe;
          const radiusClass = isMe 
            ? 'rounded-l-[1.4rem] rounded-tr-[1.4rem] rounded-br-sm'
            : 'rounded-r-[1.4rem] rounded-tl-[1.4rem] rounded-bl-sm';

          return (
            <div key={item.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                
                <div className={`px-5 py-3 text-[14px] font-medium leading-relaxed shadow-sm relative ${
                  isMe 
                    ? 'bg-[#C08A7D] text-white ' + radiusClass 
                    : 'bg-white text-stone-700 border border-[#F2F0EA] ' + radiusClass
                }`}>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>

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

      {/* 3. Fixed Input Area */}
      <div className="px-6 py-4 bg-white border-t border-[#F2F0EA] z-40 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-[#FAF9F6] border border-[#F2F0EA] rounded-[1.5rem] p-1.5 pr-2 focus-within:ring-2 focus-within:ring-[#C08A7D]/10 focus-within:border-[#C08A7D]/30 transition-all shadow-inner">
           <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-[#C08A7D] hover:bg-white transition-all">
              <Paperclip size={18} />
           </button>
           <input 
              value={inputText} 
              onChange={e => setInputText(e.target.value)} 
              placeholder="Escreva sua mensagem..." 
              className="flex-1 bg-transparent outline-none text-stone-700 placeholder:text-stone-300 h-full py-2.5 text-sm font-medium" 
           />
           <button 
              type="submit" 
              disabled={!inputText.trim() || isSending} 
              className="w-9 h-9 bg-[#C08A7D] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#A67569] disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 active:scale-95"
           >
              <Send size={16} className="ml-0.5" />
           </button>
        </form>
      </div>
    </div>
  );
};
