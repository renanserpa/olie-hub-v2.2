
"use client";

import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { 
  Send, Paperclip, PanelLeftClose, PanelLeftOpen, 
  PanelRightClose, PanelRightOpen, CheckCircle2,
  ChevronDown, MoreHorizontal, Loader2, QrCode,
  ShoppingBag, Package, Truck, Plus, Sparkles,
  Zap, Heart, Stars, BrainCircuit, Bot, UserPlus, 
  ArrowRightLeft, ShieldCheck, UserCircle, Scissors
} from 'lucide-react';
import { Message, ChannelSource, ConvoStatus } from '../../types/index.ts';
import { OmnichannelService, AIService } from '../../services/api.ts';

interface ChatWindowProps {
  client: { 
    id: string; 
    name: string; 
    avatar: string; 
    source: ChannelSource; 
    status: ConvoStatus;
    assignee_id?: string | null;
  } | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLeftOpen: boolean;
  onToggleLeft: () => void;
  isRightOpen: boolean;
  onToggleRight: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingHistory?: boolean;
  onTriggerAction: (action: 'order' | 'catalog') => void;
  onUpdateStatus?: (status: ConvoStatus) => void;
  onTransfer?: (agentId: string) => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  client, messages, onSendMessage, 
  isLeftOpen, onToggleLeft, isRightOpen, onToggleRight,
  onLoadMore, hasMore, isLoadingHistory,
  onTriggerAction, onUpdateStatus, onTransfer
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isTransferMenuOpen, setIsTransferMenuOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const transferMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  const isBotActive = client?.status === 'bot';

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000); 
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleSmartReply = async () => {
    if (!client || messages.length === 0 || isGeneratingReply) return;
    setIsGeneratingReply(true);
    try {
      const suggestion = await AIService.generateSmartReply(messages, client.name);
      setInputText(suggestion);
      showToast("Sugestão da IA aplicada!", 'success');
      inputRef.current?.focus();
    } catch (err) {
      showToast("Erro ao gerar sugestão", 'info');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const toggleBotMode = () => {
    const newStatus = isBotActive ? 'assigned' : 'bot';
    onUpdateStatus?.(newStatus);
    showToast(isBotActive ? "Concierge Humano assumiu." : "Assistente Digital ativado.", 'info');
  };

  const handleTransfer = (agentId: string) => {
    onTransfer?.(agentId);
    setIsTransferMenuOpen(false);
    showToast(`Atendimento transferido para ${agentId}`, 'success');
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    if (scrollTop < 50 && hasMore && !isLoadingHistory && onLoadMore) {
        previousScrollHeightRef.current = scrollHeight;
        onLoadMore();
    }
  };

  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    if (previousScrollHeightRef.current > 0 && container.scrollHeight > previousScrollHeightRef.current) {
        container.scrollTop = (container.scrollHeight - previousScrollHeightRef.current) + container.scrollTop;
        previousScrollHeightRef.current = 0;
    }
  }, [messages]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
    if (!isLoadingHistory && (scrollHeight - scrollTop - clientHeight < 200 || messages.length < 10)) {
      scrollToBottom(messages.length === 0 ? 'auto' : 'smooth');
    }
  }, [messages, client?.id, isLoadingHistory]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending || !client) return;
    setIsSending(true);
    const textToSend = inputText;
    setInputText('');
    try {
      const success = await OmnichannelService.sendMessage(client.source, client.id, textToSend);
      if (success) {
        onSendMessage(textToSend);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (err) {
      setInputText(textToSend);
      showToast("Falha ao enviar mensagem", 'info');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAction = (action: 'pix' | 'frete' | 'order' | 'catalog') => {
    setIsActionMenuOpen(false);
    if (action === 'pix') {
      showToast("Link Pix gerado e enviado!", 'success');
      onSendMessage("✨ *Pagamento Pix*\nGeramos um link para você concluir seu pedido.\nChave: `financeiro@olie.com.br`\nValor: R$ 489,00");
    } else if (action === 'frete') {
      showToast("Frete calculado!", 'success');
      onSendMessage("🚚 *Cotação de Frete*\nSua entrega para São Paulo fica em R$ 22,00 (SEDEX) ou R$ 14,00 (PAC).");
    } else {
      onTriggerAction(action as any);
    }
  };

  const safeDate = (d: string) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const processedItems = useMemo(() => {
    if (!client) return [];
    const items: any[] = [];
    messages.forEach((msg, idx) => {
      const currDate = safeDate(msg.created_at);
      const prevMsg = messages[idx - 1];
      const prevDate = prevMsg ? safeDate(prevMsg.created_at) : null;
      if (!prevDate || currDate.toDateString() !== prevDate.toDateString()) {
        let label = currDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        if (currDate.toDateString() === new Date().toDateString()) label = 'Hoje';
        items.push({ type: 'date', label });
      }
      items.push({ ...msg, type: 'message', isMe: msg.direction === 'outbound' });
    });
    return items;
  }, [messages, client]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
      if (transferMenuRef.current && !transferMenuRef.current.contains(event.target as Node)) {
        setIsTransferMenuOpen(false);
      }
    };
    if (isActionMenuOpen || isTransferMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionMenuOpen, isTransferMenuOpen]);

  if (!client) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 relative h-full overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-stone-50 to-stone-100 z-0" />
         <div className="relative z-10 text-center animate-in fade-in zoom-in-95 duration-1000 px-6 max-w-sm">
            <div className="relative mb-12 group">
              <div className="absolute inset-0 -m-4 border border-olie-500/10 rounded-[3rem] animate-[spin_10s_linear_infinite]" />
              <div className="w-24 h-24 mx-auto bg-white rounded-[2.5rem] border border-stone-200/60 flex items-center justify-center shadow-olie-lg group-hover:-translate-y-2 transition-transform duration-700 relative z-10">
                  <span className="text-olie-500 font-serif italic text-4xl select-none">O</span>
                  <Sparkles size={16} className="absolute -top-1 -right-1 text-olie-300 animate-pulse" />
              </div>
            </div>
            <h2 className="font-serif italic text-3xl text-olie-900 mb-4 tracking-tight leading-tight">O Ateliê Olie aguarda suas histórias.</h2>
            <p className="text-xs text-stone-400 font-medium leading-relaxed mb-10 px-4">Selecione um atendimento para iniciar uma experiênca artesanal.</p>
         </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full relative transition-all duration-500 ${isBotActive ? 'bg-olie-50/20' : 'bg-stone-50'}`}>
      <header className="h-20 px-6 border-b border-stone-200/60 flex justify-between items-center bg-white/80 backdrop-blur-md z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onToggleLeft} className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 hover:text-olie-500 transition-colors">
             {isLeftOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <div onClick={onToggleRight} className="flex items-center gap-3 pl-4 border-l border-stone-200/60 cursor-pointer group py-1">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-serif text-white italic text-lg shadow-lg transition-all duration-500 ${isBotActive ? 'bg-stone-900 scale-105' : 'bg-olie-500 shadow-olie-500/20'}`}>
              {isBotActive ? <Bot size={20} /> : client.avatar}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-olie-900 text-lg tracking-tight leading-none">{client.name}</h2>
                {isBotActive && (
                  <span className="px-2 py-0.5 bg-stone-900 text-white text-[8px] font-black uppercase rounded-lg shadow-sm flex items-center gap-1">
                    <Zap size={8} fill="white" /> Bot Activo
                  </span>
                )}
              </div>
              <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-1 italic">{client.source}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Bot Toggle Switch */}
           <button 
             onClick={toggleBotMode}
             className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all border shadow-sm ${isBotActive ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-200 hover:border-olie-500/30'}`}
             title={isBotActive ? "Desativar Automação" : "Ativar Atendimento Automático"}
           >
              <Bot size={16} className={isBotActive ? "animate-pulse" : ""} />
              <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">Assistente IA</span>
           </button>

           {/* Transfer Menu */}
           <div className="relative">
              <button 
                onClick={() => setIsTransferMenuOpen(!isTransferMenuOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${isTransferMenuOpen ? 'bg-olie-50 text-olie-600 border-olie-200' : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'}`}
                title="Transferir Atendimento"
              >
                <ArrowRightLeft size={18} />
              </button>

              {isTransferMenuOpen && (
                <div ref={transferMenuRef} className="absolute top-full mt-3 right-0 w-64 bg-white rounded-3xl shadow-olie-lg border border-stone-100 p-2 z-[60] animate-in slide-in-from-top-2 duration-300">
                   <div className="px-4 py-2 mb-1 border-b border-stone-50">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">Delegar para:</span>
                   </div>
                   <button onClick={() => handleTransfer('Comercial')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-all group">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all"><ShoppingBag size={16}/></div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-stone-800">Comercial</p>
                        <p className="text-[8px] text-stone-400 font-bold">Fechamento e Vendas</p>
                      </div>
                   </button>
                   <button onClick={() => handleTransfer('Mestre Artesão')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-all group">
                      {/* Fixed: Scissors icon is now imported */}
                      <div className="w-9 h-9 rounded-xl bg-olie-50 text-olie-500 flex items-center justify-center group-hover:bg-olie-900 group-hover:text-white transition-all"><Scissors size={16}/></div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-stone-800">Mestre Artesão</p>
                        <p className="text-[8px] text-stone-400 font-bold">Dúvidas Técnicas / Ateliê</p>
                      </div>
                   </button>
                   <button onClick={() => handleTransfer('Financeiro')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-all group">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all"><ShieldCheck size={16}/></div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-stone-800">Financeiro</p>
                        <p className="text-[8px] text-stone-400 font-bold">Pagamentos e Notas</p>
                      </div>
                   </button>
                </div>
              )}
           </div>

           <div className="w-px h-8 bg-stone-100 mx-2" />

           <button onClick={handleSmartReply} disabled={isGeneratingReply} className="w-10 h-10 flex items-center justify-center bg-olie-50 text-olie-500 rounded-xl hover:bg-olie-100 transition-all border border-olie-200/50 shadow-sm">
              {isGeneratingReply ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={18} />}
           </button>
           <button onClick={onToggleRight} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isRightOpen ? 'bg-olie-900 text-white shadow-lg' : 'text-stone-400 hover:text-olie-500 hover:bg-stone-50'}`}>
              {isRightOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
           </button>
        </div>
      </header>

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-2 scrollbar-hide flex flex-col z-10 relative scroll-smooth">
        {isLoadingHistory && (
          <div className="flex justify-center py-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full shadow-sm border border-stone-200/60">
               <Loader2 size={14} className="animate-spin text-olie-500" />
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Resgatando histórico...</span>
             </div>
          </div>
        )}
        {processedItems.map((item, idx) => {
          if (item.type === 'date') return (
            <div key={`date-${idx}`} className="flex justify-center py-8 sticky top-0 z-30 pointer-events-none">
              <span className="px-5 py-2 bg-stone-50/90 backdrop-blur-md border border-stone-200/60 rounded-full text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] shadow-sm select-none">
                {item.label}
              </span>
            </div>
          );
          const isMe = item.isMe;
          return (
            <div key={item.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} group`}>
                <div className={`px-6 py-3.5 text-sm font-medium leading-relaxed shadow-sm rounded-4xl transition-all ${
                  isMe 
                    ? 'bg-gradient-to-br from-olie-500 to-olie-700 text-white rounded-tr-none shadow-olie-soft' 
                    : 'bg-white text-stone-700 border border-stone-200/60 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>
                <span className={`text-[9px] font-bold text-stone-300 uppercase mt-1.5 px-2 flex items-center gap-1.5 ${isMe ? 'justify-end' : ''}`}>
                  {safeDate(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  {isMe && <CheckCircle2 size={10} className="text-olie-500" />}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="px-6 md:px-8 py-6 bg-white border-t border-stone-200/60 z-40 shrink-0 relative">
        {isActionMenuOpen && (
          <div ref={actionMenuRef} className="absolute bottom-full mb-4 left-6 md:left-8 bg-white border border-stone-200/60 rounded-3xl shadow-olie-lg p-2 min-w-[220px] z-50 animate-in slide-in-from-bottom-2 duration-300">
             <button onClick={() => handleQuickAction('pix')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><QrCode size={16} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Link Pix</span>
             </button>
             <button onClick={() => handleQuickAction('frete')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Truck size={16} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Consultar Frete</span>
             </button>
             <div className="h-px bg-stone-100 my-1 mx-2" />
             <button onClick={() => handleQuickAction('order')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-olie-50 text-olie-500 flex items-center justify-center group-hover:scale-110 transition-transform"><ShoppingBag size={16} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Novo Pedido</span>
             </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-4 bg-stone-50 border border-stone-200/60 rounded-4xl p-2 pr-3 focus-within:ring-4 focus-within:ring-olie-500/5 focus-within:border-olie-500/20 transition-all shadow-inner">
           <button type="button" onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className={`w-11 h-11 rounded-3xl flex items-center justify-center transition-all ${isActionMenuOpen ? 'bg-olie-900 text-white rotate-45 shadow-lg' : 'bg-white border border-stone-200 text-stone-400 hover:text-olie-500'}`}>
              <Plus size={20} />
           </button>
           <input ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)} placeholder={isBotActive ? "O assistente digital está cuidando disso..." : "Digite sua mensagem..."} className="flex-1 bg-transparent outline-none text-stone-800 placeholder:text-stone-300 py-3 text-sm font-medium" />
           <button type="button" className="hidden md:flex w-10 h-10 rounded-2xl items-center justify-center text-stone-300 hover:text-olie-500 hover:bg-white transition-all">
              <Paperclip size={20} />
           </button>
           <button type="submit" disabled={!inputText.trim() || isSending} className="w-11 h-11 bg-olie-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-olie-500/20 hover:bg-olie-600 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-30">
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
           </button>
        </form>
      </div>

      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-max pointer-events-none">
         {toasts.map(toast => (
            <div key={toast.id} className="bg-olie-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto border border-white/10">
               <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'} shadow-[0_0_8px_currentColor]`} />
               <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
            </div>
         ))}
      </div>
    </div>
  );
};
