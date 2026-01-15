
"use client";

import React, { useState, useMemo } from 'react';
import { 
  User, 
  ClipboardList, 
  Zap, 
  ShoppingBag, 
  CreditCard, 
  MapPin,
  Clock,
  Package,
  History,
  Ghost,
  Loader2,
  Inbox as InboxIcon,
  Sparkles,
  MessageCircle,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ConversationList } from '../../components/inbox/conversation-list';
import { ChatWindow } from '../../components/inbox/chat-window';
import { SmartOrderModal } from '../../components/orders/smart-order-modal';
import { MainSidebar } from '../../components/layout/main-sidebar';
import { useChat } from '../../hooks/use-chat';
import { 
  CHANNEL_CONFIG, 
  SALES_STAGES_CONFIG, 
  MOCK_PRODUCTS 
} from '../../lib/constants';

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [contextTab, setContextTab] = useState<'crm' | 'orders' | 'actions'>('crm');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Supabase Integration via useChat hook
  const { 
    conversations, 
    messages, 
    isLoading, 
    sendMessage 
  } = useChat(selectedId);

  const activeConv = useMemo(() => 
    conversations.find(c => c.id === selectedId), 
  [selectedId, conversations]);

  const uiConversations = useMemo(() => conversations.map(c => ({
    id: c.id,
    name: c.customer.full_name,
    avatar: c.customer.full_name.charAt(0),
    lastMessage: c.last_message || '...',
    time: new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'online',
    source: c.customer.channel_source,
    unreadCount: c.unread_count
  })), [conversations]);

  const uiMessages = useMemo(() => messages.map(m => ({
    id: m.id,
    text: m.content,
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    rawDate: m.created_at,
    isMe: m.direction === 'outbound'
  })), [messages]);

  const handleChatAction = (action: 'catalog' | 'order') => {
    if (action === 'catalog') {
      setContextTab('actions');
    } else if (action === 'order') {
      setIsModalOpen(true);
    }
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-[2.5rem] bg-[#C08A7D]/10 flex items-center justify-center text-[#C08A7D] animate-pulse">
            <Zap size={32} />
          </div>
          <Sparkles size={20} className="absolute -top-1 -right-1 text-[#C08A7D]" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Hub Olie</p>
          <h2 className="text-sm font-bold text-stone-600">Sincronizando Workspace...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-stone-800 overflow-hidden font-sans antialiased">
      <MainSidebar />

      <ConversationList 
        conversations={uiConversations as any} 
        selectedId={selectedId || ''} 
        onSelect={setSelectedId} 
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden bg-[#FAF9F6]/30">
        {selectedId && activeConv ? (
          <ChatWindow 
            client={{
              id: activeConv.customer.id,
              name: activeConv.customer.full_name,
              avatar: activeConv.customer.full_name.charAt(0),
              source: activeConv.customer.channel_source,
            } as any} 
            messages={uiMessages as any} 
            onSendMessage={sendMessage}
            onOpenAction={handleChatAction}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="max-w-md flex flex-col items-center">
              <div className="relative mb-16">
                 <div className="w-48 h-48 rounded-[5rem] bg-white shadow-[0_50px_100px_-20px_rgba(192,138,125,0.2)] flex items-center justify-center text-[#C08A7D] border border-[#C08A7D]/5">
                    <MessageCircle size={84} strokeWidth={1} className="opacity-40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-[5rem] border border-[#C08A7D]/10 animate-[ping_4s_infinite]" />
                 </div>
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-[#333333] rounded-[1.5rem] shadow-2xl flex items-center gap-4 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Hub Olie Conectado</span>
                 </div>
              </div>
              
              <h2 className="text-4xl font-black text-[#333333] tracking-tight mb-4 italic">Seu Workspace Olie</h2>
              <p className="text-base font-medium text-stone-400 leading-relaxed mb-12 max-w-sm">
                Conectado ao Tiny ERP e VNDA. Selecione uma conversa na lista lateral para iniciar o atendimento de luxo.
              </p>
              
              <div className="grid grid-cols-2 gap-6 w-full">
                 <div className="p-8 bg-white border border-stone-100 rounded-[3rem] shadow-sm group hover:shadow-2xl hover:border-[#C08A7D]/20 transition-all cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-300 mb-6 group-hover:bg-[#C08A7D]/10 group-hover:text-[#C08A7D] transition-colors">
                       <ClipboardList size={24} />
                    </div>
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-2 text-left">Fila de Triagem</p>
                    <p className="text-3xl font-black text-[#333333] text-left">
                       {conversations.filter(c => c.status === 'queue').length} <span className="text-stone-300 text-sm font-bold uppercase tracking-widest">Leads</span>
                    </p>
                 </div>
                 <div className="p-8 bg-white border border-stone-100 rounded-[3rem] shadow-sm group hover:shadow-2xl hover:border-[#C08A7D]/20 transition-all cursor-default">
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-300 mb-6 group-hover:bg-[#C08A7D]/10 group-hover:text-[#C08A7D] transition-colors">
                       <Zap size={24} />
                    </div>
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-2 text-left">Atendimentos</p>
                    <p className="text-3xl font-black text-[#C08A7D] text-left">
                       {conversations.filter(c => c.status === 'assigned').length} <span className="text-stone-300 text-sm font-bold uppercase tracking-widest">Ativos</span>
                    </p>
                 </div>
              </div>

              <div className="mt-16 flex items-center gap-4 py-4 px-8 bg-[#FAF9F6] rounded-full text-stone-300 border border-stone-100">
                <ShieldCheck size={16} className="text-stone-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ambiente Seguro & Encriptado</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Pane: Context & Actions */}
        <div className={`w-[400px] bg-white flex flex-col shrink-0 shadow-2xl border-l border-stone-200 transition-all duration-500 overflow-hidden ${selectedId ? 'translate-x-0' : 'translate-x-full opacity-0'}`}>
          {activeConv && (
            <>
              <div className="flex border-b border-stone-100 bg-white sticky top-0 z-20">
                {[
                  { id: 'crm', label: 'CRM', icon: User },
                  { id: 'orders', label: 'Histórico', icon: History },
                  { id: 'actions', label: 'Operação', icon: Zap },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setContextTab(tab.id as any)}
                    className={`flex-1 py-5 flex items-center justify-center gap-2 transition-all border-b-2 uppercase text-[10px] font-black tracking-widest ${
                      contextTab === tab.id ? 'border-[#C08A7D] text-[#C08A7D]' : 'border-transparent text-stone-300 hover:text-stone-500'
                    }`}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-[#FAF9F6]/30 scrollbar-hide">
                {contextTab === 'crm' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-white border-4 border-stone-50 flex items-center justify-center text-4xl font-black text-[#C08A7D] mx-auto mb-6 shadow-xl relative ring-1 ring-[#C08A7D]/5">
                        {activeConv.customer.full_name.charAt(0)}
                        <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl ${CHANNEL_CONFIG[activeConv.customer.channel_source].bg} flex items-center justify-center border-4 border-white shadow-lg`}>
                          {React.createElement(CHANNEL_CONFIG[activeConv.customer.channel_source].icon, { size: 16, className: CHANNEL_CONFIG[activeConv.customer.channel_source].color })}
                        </div>
                      </div>
                      <h2 className="text-2xl font-black text-[#333333] tracking-tight italic">{activeConv.customer.full_name}</h2>
                      <div className="flex items-center justify-center gap-2 mt-3">
                         <span className="px-3 py-1 bg-white border border-stone-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-1 shadow-sm">
                            <MapPin size={10} /> São Paulo, BR
                         </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <InfoCard label="Contato Principal" value={activeConv.customer.phone} icon={<Clock size={12}/>}/>
                      <InfoCard label="Fidelidade (LTV)" value={`R$ ${activeConv.customer.ltv.toFixed(2)}`} icon={<ShoppingBag size={12}/>}/>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Categorias Olie</h3>
                        <button className="text-[10px] font-black text-[#C08A7D] uppercase tracking-widest">Editar</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeConv.customer.tags.map(tag => (
                          <span key={tag} className="px-4 py-2.5 bg-white text-stone-500 rounded-2xl text-[10px] font-black border border-stone-100 shadow-sm flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-[#C08A7D]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {contextTab === 'actions' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                    <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-4">Central de Comandos</h3>
                    <div className="space-y-3">
                      <ActionButton 
                        label="Novo Pedido (Tiny)" 
                        icon={<ShoppingBag size={18}/>} 
                        onClick={() => setIsModalOpen(true)}
                        primary
                      />
                      <ActionButton label="Gerar Orçamento VNDA" icon={<CreditCard size={18}/>} />
                      <ActionButton label="Consultar Frete" icon={<Package size={18}/>} />
                      <ActionButton label="Relatório de Atendimento" icon={<History size={18}/>} />
                    </div>
                  </div>
                )}

                {contextTab === 'orders' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center py-20 duration-700">
                     <div className="w-20 h-20 rounded-[2rem] bg-stone-50 flex items-center justify-center mx-auto mb-6 text-stone-200 border border-stone-100 shadow-inner">
                        <Package size={40} />
                     </div>
                     <p className="text-[11px] font-black text-stone-300 uppercase tracking-[0.2em]">Conectando APIs Externas...</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <SmartOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        clientName={activeConv?.customer.full_name || 'Cliente'}
        catalog={MOCK_PRODUCTS}
        onOrderComplete={(summary) => sendMessage(summary, 'text')}
      />
    </div>
  );
}

const InfoCard = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
  <div className="p-5 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
    <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] flex items-center justify-center text-[#C08A7D] group-hover:scale-110 transition-transform">
       {icon}
    </div>
    <div>
      <p className="text-[9px] text-stone-300 uppercase font-black tracking-[0.1em] mb-0.5">{label}</p>
      <p className="text-sm font-black text-[#333333] italic">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ label, icon, onClick, primary }: { label: string, icon: any, onClick?: () => void, primary?: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full font-black py-5 rounded-[2.5rem] transition-all flex items-center justify-between px-8 group active:scale-[0.98] shadow-lg ${
      primary ? 'bg-[#333333] text-white hover:bg-stone-800 shadow-stone-800/20' : 'bg-white border-2 border-stone-100 text-stone-500 hover:border-[#C08A7D]/30 hover:text-[#C08A7D] shadow-sm'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${primary ? 'bg-white/10' : 'bg-stone-50 group-hover:bg-[#C08A7D]/10'}`}>
        {icon}
      </div>
      <span className="text-xs uppercase tracking-widest">{label}</span>
    </div>
    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
  </button>
);
