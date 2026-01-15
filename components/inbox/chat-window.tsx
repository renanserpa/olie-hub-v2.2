"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, Paperclip, Phone, MoreVertical, Zap, ShoppingBag, 
  ShoppingCart, CheckCircle2, Truck, ClipboardCheck, Loader2,
  Info
} from 'lucide-react';
import { Message, ChannelSource } from '../../types/index';
import { OmnichannelService } from '../../services/api';

interface ChatWindowProps {
  client: { id: string; name: string; avatar: string; source: ChannelSource; };
  messages: Message[];
  onSendMessage: (text: string) => void;
  onOpenAction?: (action: 'catalog' | 'order') => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  client, messages, onSendMessage, onOpenAction 
}) => {
  const [inputText, setInputText] = useState('');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'info' }>({ 
    message: '', visible: false, type: 'success' 
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      const success = await OmnichannelService.sendMessage(client.source, client.id, inputText);
      if (success) {
        onSendMessage(inputText);
        setInputText('');
      } else {
        showToast("Falha ao enviar mensagem", "info");
      }
    } catch (err) {
      showToast("Erro de conexão", "info");
    } finally {
      setIsSending(false);
    }
  };

  const handleAction = async (action: string) => {
    setIsActionsOpen(false);
    if (action === 'pix') {
      const pixKey = "00020126330014BR.GOV.BCB.PIX011112345678901";
      try {
        await navigator.clipboard.writeText(pixKey);
        showToast("PIX Copiado com Sucesso!", 'success');
        const content = `💎 *Pagamento Exclusivo Ateliê Olie*\n\nSua peça artesanal está reservada! Utilize o PIX Copia e Cola abaixo para garantir seu item:\n\n🔑 \`${pixKey}\`\n\n_Dica: Envie o comprovante aqui mesmo para iniciarmos a produção imediatamente._`;
        setInputText(content); // Preenche para a usuária conferir/enviar
      } catch (e) {
        showToast("Erro ao copiar PIX", "info");
      }
    } else if (action === 'freight') {
      showToast("Consultando fretes para sua região...", 'info');
      setTimeout(() => {
        const content = "📦 *Opções de Frete Olie*\n\n🚚 SEDEX: R$ 24,90 (2-3 dias úteis)\n🐢 PAC: R$ 14,20 (7-9 dias úteis)\n\nQual dessas opções melhor atende sua pressa em ter seu Ateliê Olie?";
        onSendMessage(content);
      }, 1200);
    } else if (action === 'catalog') {
      onOpenAction?.('catalog');
    } else if (action === 'order') {
      onOpenAction?.('order');
    }
  };

  const processedItems = useMemo(() => {
    const items: any[] = [];
    messages.forEach((msg, idx) => {
      const prevMsg = messages[idx - 1];
      const nextMsg = messages[idx + 1];
      const currDate = new Date(msg.created_at);
      const prevDate = prevMsg ? new Date(prevMsg.created_at) : null;

      // Date Separator logic
      if (!prevDate || currDate.toDateString() !== prevDate.toDateString()) {
        const dateLabel = currDate.toDateString() === new Date().toDateString() ? 'Hoje' :
                        currDate.toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Ontem' :
                        currDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        items.push({ type: 'date', label: dateLabel });
      }

      // Grouping logic
      const isSameAsPrev = prevMsg && prevMsg.direction === msg.direction && 
                          (currDate.getTime() - new Date(prevMsg.created_at).getTime()) < 5 * 60 * 1000;
      const isSameAsNext = nextMsg && nextMsg.direction === msg.direction && 
                          (new Date(nextMsg.created_at).getTime() - currDate.getTime()) < 5 * 60 * 1000;

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
    <div className="flex-1 flex flex-col bg-[#FAF9F6] h-full relative overflow-hidden">
      {/* Premium Header */}
      <header className="h-24 px-10 border-b border-stone-100 flex justify-between items-center bg-white z-40 shadow-sm shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer">
            <div className="w-14 h-14 rounded-[1.6rem] bg-[#C08A7D] flex items-center justify-center font-black text-white text-xl shadow-xl border-2 border-white italic transform group-hover:scale-105 transition-all duration-500">
              {client.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
          </div>
          <div>
            <h2 className="font-serif font-black text-[#333333] text-xl tracking-tight italic flex items-center gap-2">
              {client.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[9px] text-[#C08A7D] font-black uppercase tracking-[0.2em]">{client.source}</span>
               <div className="w-1 h-1 rounded-full bg-stone-200" />
               <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">Ativo Agora</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-12 h-12 flex items-center justify-center text-stone-300 hover:text-[#C08A7D] hover:bg-[#FAF9F6] rounded-2xl transition-all"><Phone size={20}/></button>
          <button className="w-12 h-12 flex items-center justify-center text-stone-300 hover:text-[#C08A7D] hover:bg-[#FAF9F6] rounded-2xl transition-all"><MoreVertical size={20}/></button>
        </div>
      </header>

      {/* Message Area with Texture */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-10 space-y-1 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] scrollbar-hide flex flex-col">
        {processedItems.map((item, idx) => {
          if (item.type === 'date') return (
            <div key={`date-${idx}`} className="flex justify-center py-12">
              <span className="px-6 py-2 bg-stone-100/50 backdrop-blur rounded-full text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] border border-stone-200/50">
                {item.label}
              </span>
            </div>
          );

          const isMe = item.isMe;
          // Fluid radius logic for artisanal grouping
          const radiusClass = isMe 
            ? item.isFirstInGroup ? 'rounded-l-[2rem] rounded-tr-[2rem] rounded-br-lg' : item.isLastInGroup ? 'rounded-l-[2rem] rounded-br-[2rem] rounded-tr-lg' : 'rounded-l-[2rem] rounded-r-lg'
            : item.isFirstInGroup ? 'rounded-r-[2rem] rounded-tl-[2rem] rounded-bl-lg' : item.isLastInGroup ? 'rounded-r-[2rem] rounded-bl-[2rem] rounded-tl-lg' : 'rounded-r-[2rem] rounded-l-lg';

          return (
            <div key={item.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${item.isFirstInGroup ? 'mt-8' : 'mt-1'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {item.isFirstInGroup && !isMe && <span className="text-[10px] font-black text-[#C08A7D] uppercase mb-2 ml-4 italic opacity-60 tracking-widest">{client.name}</span>}
                
                <div className={`px-7 py-4 text-[15px] font-medium leading-relaxed shadow-sm transition-all group relative ${
                  isMe 
                    ? 'bg-[#333333] text-white ' + radiusClass 
                    : 'bg-white text-stone-800 border border-stone-100 ' + radiusClass
                }`}>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>

                {item.isLastInGroup && (
                  <span className={`text-[8px] font-black text-stone-300 uppercase mt-2 px-4 flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    {isMe && <CheckCircle2 size={10} className="text-[#C08A7D]" />}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Luxury Footer Input */}
      <div className="px-10 py-10 bg-white border-t border-stone-100 z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-5">
          <div className="flex bg-stone-50 rounded-3xl p-1.5 border border-stone-100 shadow-inner">
            <button 
              onClick={() => setIsActionsOpen(!isActionsOpen)} 
              className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center transition-all ${
                isActionsOpen ? 'bg-[#333333] text-white rotate-45 shadow-xl' : 'text-stone-400 hover:text-[#C08A7D] hover:bg-white'
              }`}
            >
              <Zap size={22}/>
            </button>
            <div className="w-px h-6 bg-stone-200 self-center mx-2" />
            <button className="w-14 h-14 text-stone-400 hover:text-[#C08A7D] hover:bg-white rounded-[1.2rem] flex items-center justify-center transition-all"><Paperclip size={22}/></button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 flex gap-5">
            <div className="flex-1 relative group">
              <input 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                placeholder="Escreva sua resposta artesanal..." 
                className="w-full bg-stone-50 border border-transparent focus:border-stone-100 rounded-[2.2rem] px-10 py-5 outline-none focus:ring-[10px] focus:ring-[#C08A7D]/5 focus:bg-white transition-all font-medium text-stone-800 placeholder:text-stone-300" 
              />
            </div>
            <button 
              type="submit" 
              disabled={!inputText.trim() || isSending} 
              className="w-16 h-16 bg-[#C08A7D] text-white rounded-[1.8rem] flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-[#A67569] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
              {isSending ? <Loader2 size={26} className="animate-spin" /> : <Send size={26} className="ml-1"/>}
            </button>
          </form>
        </div>
      </div>

      {/* Improved Action Popover */}
      {isActionsOpen && (
        <div className="absolute bottom-36 left-10 w-80 bg-white rounded-[3rem] shadow-[0_30px_90px_rgba(0,0,0,0.15)] border border-stone-100 p-3 animate-in fade-in slide-in-from-bottom-6 duration-500 z-[60] backdrop-blur-xl">
          <div className="px-8 py-5 border-b border-stone-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] italic">Assistente de Vendas</p>
            <Zap size={14} className="text-[#C08A7D] animate-pulse" />
          </div>
          <div className="p-2 space-y-2">
            {[
              { id: 'order', label: 'Gerar Pedido ERP', icon: ShoppingBag, color: 'text-[#333333]', bg: 'bg-[#333333]/5' },
              { id: 'catalog', label: 'Enviar Catálogo', icon: ShoppingCart, color: 'text-[#C08A7D]', bg: 'bg-[#C08A7D]/5' },
              { id: 'pix', label: 'Gerar Link PIX', icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { id: 'freight', label: 'Consultar Frete', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map(a => (
              <button 
                key={a.id} 
                onClick={() => handleAction(a.id)} 
                className="w-full text-left p-4 rounded-[1.8rem] flex items-center gap-5 hover:bg-stone-50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl ${a.bg} border border-transparent group-hover:border-stone-100 flex items-center justify-center ${a.color} group-hover:scale-110 transition-all shadow-sm`}>
                  <a.icon size={20}/>
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest ${a.color}`}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fluid Toast Feedback */}
      <div className={`fixed bottom-40 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="px-10 py-5 bg-[#333333] text-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-5 border border-white/10 backdrop-blur-md">
          {toast.type === 'success' ? (
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white"><CheckCircle2 size={18}/></div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#C08A7D] flex items-center justify-center text-white"><Info size={18}/></div>
          )}
          <span className="text-[11px] font-black uppercase tracking-[0.2em] italic whitespace-nowrap">{toast.message}</span>
        </div>
      </div>
    </div>
  );
};