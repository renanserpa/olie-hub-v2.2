"use client";

import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { 
  Send, Paperclip, PanelLeftClose, PanelLeftOpen, 
  PanelRightClose, PanelRightOpen, CheckCircle2,
  ChevronDown, MoreHorizontal, Loader2, QrCode,
  ShoppingBag, Package, Truck, Plus, Sparkles,
  Zap, Heart, Stars, BrainCircuit, Bot, UserPlus, 
  ArrowRightLeft, ShieldCheck, UserCircle, Scissors,
  MessageSquareQuote, Needle, Gem, Info, X, Check,
  Clock, BookOpen, Copy
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
  type: 'success' | 'info' | 'error';
  icon?: React.ReactNode;
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const transferMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  const isBotActive = client?.status === 'bot';

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    const icons = {
      success: <Check size={14} />,
      info: <Info size={14} />,
      error: <X size={14} />
    };
    
    setToasts(prev => [...prev, { id, message, type, icon: icons[type] }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); 
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
      showToast("Erro ao gerar sugestão", 'error');
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
    showToast(`Transferido para ${agentId}`, 'success');
  };

  const processedItems = useMemo(() => {
    if (!client) return [];
    
    const items: any[] = [];
    let lastDate: string | null = null;

    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.created_at);
      const dateString = msgDate.toDateString();
      
      if (dateString !== lastDate) {
        let label = msgDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (dateString === today) label = 'Hoje';
        else if (dateString === yesterday) label = 'Ontem';
        
        items.push({ type: 'date', label, id: `date-${msg.id}` });
        lastDate = dateString;
      }

      const prevMsg = messages[idx - 1];
      const nextMsg = messages[idx + 1];
      
      const isMe = msg.direction === 'outbound';
      const isPrevSame = prevMsg && prevMsg.direction === msg.direction;
      const isNextSame = nextMsg && nextMsg.direction === msg.direction;
      
      const timeDiff = prevMsg ? (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) / 1000 / 60 : 0;
      const isTimeGrouped = isPrevSame && timeDiff < 5;

      items.push({ 
        ...msg, 
        type: 'message', 
        isMe, 
        isFirstInGroup: !isTimeGrouped,
        isLastInGroup: !isNextSame || (nextMsg && (new Date(nextMsg.created_at).getTime() - new Date(msg.created_at).getTime()) / 1000 / 60 > 5),
        showAvatar: !isMe && !isTimeGrouped
      });
    });

    return items;
  }, [messages, client]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
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
    if (!isLoadingHistory && (scrollHeight - scrollTop - clientHeight < 400 || messages.length < 10)) {
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
      }
    } catch (err) {
      setInputText(textToSend);
      showToast("Falha ao enviar mensagem", 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAction = (action: 'pix' | 'frete' | 'order' | 'catalog') => {
    setIsActionMenuOpen(false);
    if (action === 'pix') {
      const pixKey = "financeiro@olie.com.br";
      navigator.clipboard.writeText(pixKey).then(() => {
        showToast("Chave Pix copiada e link enviado!", 'success');
      });
      onSendMessage("✨ *Pagamento Pix*\nGeramos um link para você concluir seu pedido.\nChave: `" + pixKey + "`\nValor: R$ 489,00");
    } else if (action === 'frete') {
      showToast("Cotação de frete atualizada e enviada.", 'info');
      onSendMessage("🚚 *Cotação de Frete*\nSua entrega para São Paulo fica em R$ 22,00 (SEDEX) ou R$ 14,00 (PAC). Previsão de 2 dias úteis.");
    } else {
      onTriggerAction(action);
      if (action === 'catalog') {
        showToast("Painel de Catálogo ativado.", 'info');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
      if (transferMenuRef.current && !transferMenuRef.current.contains(event.target as Node)) {
        setIsTransferMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!client) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 relative h-full overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-olie-500/10 rounded-full blur-[120px] animate-pulse" />
         </div>
         <div className="relative z-10 text-center px-8 max-w-lg">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] border border-stone-100 flex items-center justify-center shadow-olie-lg mx-auto mb-10 text-olie-500 font-serif italic text-4xl select-none">O</div>
            <h2 className="font-serif italic text-4xl text-olie-900 mb-6">Inicie a Conversa</h2>
            <p className="text-sm text-stone-400 font-medium leading-relaxed italic">Selecione um cliente à esquerda para acessar o Workspace e iniciar o atendimento artesanal Olie.</p>
         </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full relative transition-all duration-500 ${isBotActive ? 'bg-olie-50/20' : 'bg-stone-50'}`}>
      {/* Header */}
      <header className="h-20 px-6 border-b border-stone-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onToggleLeft} className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 hover:text-olie-500 transition-colors">
             {isLeftOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-stone-100">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-serif text-white italic text-lg shadow-lg ${isBotActive ? 'bg-stone-900' : 'bg-olie-500'}`}>
              {isBotActive ? <Bot size={20} /> : client.avatar}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-olie-900 text-lg tracking-tight leading-none">{client.name}</h2>
                {isBotActive && (
                  <span className="px-2 py-0.5 bg-stone-900 text-white text-[8px] font-black uppercase rounded-lg shadow-sm flex items-center gap-1">
                    <Zap size={8} fill="white" /> Bot Ativo
                  </span>
                )}
              </div>
              <span className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-1 italic">{client.source}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={toggleBotMode}
             className={`flex items-center gap-2 px-4 h-10 rounded-xl transition-all border shadow-sm ${isBotActive ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-200 hover:border-olie-500/30'}`}
           >
              <Bot size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">Assistente IA</span>
           </button>

           <div className="relative">
              <button 
                onClick={() => setIsTransferMenuOpen(!isTransferMenuOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${isTransferMenuOpen ? 'bg-olie-50 text-olie-600 border-olie-200' : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'}`}
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
                        <p className="text-[8px] text-stone-400 font-bold">Vendas e Fechamento</p>
                      </div>
                   </button>
                   <button onClick={() => handleTransfer('Mestre Artesão')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-all group">
                      <div className="w-9 h-9 rounded-xl bg-olie-50 text-olie-500 flex items-center justify-center group-hover:bg-olie-900 group-hover:text-white transition-all"><Scissors size={16}/></div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-stone-800">Mestre Artesão</p>
                        <p className="text-[8px] text-stone-400 font-bold">Produção e Detalhes</p>
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

      {/* Message List */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 md:px-10 py-8 scrollbar-hide flex flex-col z-10 relative scroll-smooth">
        {isLoadingHistory && (
          <div className="flex justify-center py-4">
             <Loader2 size={24} className="animate-spin text-olie-500" />
          </div>
        )}
        
        {processedItems.map((item, idx) => {
          if (item.type === 'date') return (
            <div key={item.id} className="flex justify-center py-8 sticky top-0 z-30 pointer-events-none">
              <span className="px-5 py-2 bg-white/70 backdrop-blur-md border border-stone-100/60 rounded-full text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] shadow-sm pointer-events-auto">
                {item.label}
              </span>
            </div>
          );

          return (
            <div 
              key={item.id} 
              className={`flex w-full ${item.isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 ${item.isFirstInGroup ? 'mt-6' : 'mt-1'}`}
            >
              {!item.isMe && (
                <div className="w-8 shrink-0 flex items-end mb-1">
                  {item.showAvatar && (
                    <div className="w-7 h-7 bg-olie-500 text-white rounded-lg flex items-center justify-center text-[10px] font-serif italic shadow-sm">
                      {client.avatar}
                    </div>
                  )}
                </div>
              )}
              
              <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${item.isMe ? 'items-end' : 'items-start'} group`}>
                <div className={`px-5 py-3 text-[13px] font-medium leading-relaxed shadow-sm transition-all relative ${
                  item.isMe 
                    ? `bg-gradient-to-br from-olie-500 to-olie-700 text-white ${item.isFirstInGroup ? 'rounded-3xl rounded-tr-none' : 'rounded-3xl rounded-tr-md'} ${item.isLastInGroup ? 'rounded-br-none' : 'rounded-br-md'}` 
                    : `bg-white text-stone-700 border border-stone-100 ${item.isFirstInGroup ? 'rounded-3xl rounded-tl-none' : 'rounded-3xl rounded-tl-md'} ${item.isLastInGroup ? 'rounded-bl-none' : 'rounded-bl-md'}`
                }`}>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>
                
                {item.isLastInGroup && (
                  <span className={`text-[8px] font-black text-stone-300 uppercase mt-1.5 px-2 flex items-center gap-1.5 ${item.isMe ? 'justify-end' : ''}`}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    {item.isMe && <CheckCircle2 size={9} className="text-olie-500" />}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="px-6 md:px-8 py-6 bg-white border-t border-stone-100 z-40 shrink-0 relative">
        {isActionMenuOpen && (
          <div ref={actionMenuRef} className="absolute bottom-full mb-4 left-6 md:left-8 bg-white border border-stone-100 rounded-3xl shadow-olie-lg p-2 min-w-[240px] z-50 animate-in slide-in-from-bottom-2 duration-300">
             <div className="px-4 py-2 mb-1 border-b border-stone-50">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">Ações de Atendimento</span>
             </div>
             <button onClick={() => handleQuickAction('pix')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><QrCode size={16} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Gerar Link Pix</span>
             </button>
             <button onClick={() => handleQuickAction('frete')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Truck size={16} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Consultar Frete</span>
             </button>
             <button onClick={() => handleQuickAction('order')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-olie-50 text-olie-500 flex items-center justify-center group-hover:scale-110 transition-transform"><ShoppingBag size={16} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Novo Pedido</span>
             </button>
             <button onClick={() => handleQuickAction('catalog')} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors group border-t border-stone-50 mt-1">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center group-hover:scale-110 transition-transform"><BookOpen size={16} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Abrir Catálogo</span>
             </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-4 bg-stone-50 border border-stone-100 rounded-4xl p-2 pr-3 focus-within:ring-4 focus-within:ring-olie-500/5 focus-within:border-olie-500/20 transition-all shadow-inner">
           <button 
             type="button" 
             onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} 
             className={`w-11 h-11 rounded-3xl flex items-center justify-center transition-all ${isActionMenuOpen ? 'bg-olie-900 text-white rotate-45 shadow-lg' : 'bg-white border border-stone-100 text-stone-400 hover:text-olie-500'}`}
           >
              <Plus size={20} />
           </button>
           <input 
             ref={inputRef} 
             value={inputText} 
             onChange={e => setInputText(e.target.value)} 
             placeholder={isBotActive ? "O assistente digital está cuidando disso..." : "Digite sua mensagem..."} 
             className="flex-1 bg-transparent outline-none text-stone-800 placeholder:text-stone-300 py-3 text-sm font-medium" 
           />
           <button type="button" className="hidden md:flex w-10 h-10 rounded-2xl items-center justify-center text-stone-300 hover:text-olie-500 hover:bg-white transition-all">
              <Paperclip size={20} />
           </button>
           <button 
             type="submit" 
             disabled={!inputText.trim() || isSending} 
             className="w-11 h-11 bg-olie-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-olie-500/20 hover:bg-olie-600 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-30"
           >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
           </button>
        </form>
      </div>

      {/* Toast Layer */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-max pointer-events-none">
         {toasts.map(toast => (
            <div 
              key={toast.id} 
              className="olie-glass-dark px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500 pointer-events-auto border border-white/10 group"
            >
               <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-inner transition-colors ${
                 toast.type === 'success' 
                   ? 'bg-emerald-500/20 text-emerald-400' 
                   : toast.type === 'error'
                     ? 'bg-rose-500/20 text-rose-400'
                     : 'bg-blue-500/20 text-blue-400'
               }`}>
                  {toast.icon}
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 leading-none mb-1">
                    Notificação Olie
                  </span>
                  <span className="text-[11px] font-medium text-white/60 italic font-serif">
                    {toast.message}
                  </span>
               </div>
               <button 
                 onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                 className="ml-4 p-1 text-white/20 hover:text-white/60 transition-colors"
               >
                  <X size={14} />
               </button>
            </div>
         ))}
      </div>
    </div>
  );
};
