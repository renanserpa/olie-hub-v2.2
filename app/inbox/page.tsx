"use client";

import React, { useState, useMemo } from 'react';
import { 
  User, 
  Zap, 
  ShoppingBag, 
  CreditCard, 
  MapPin,
  Clock,
  Package,
  History,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Star,
  Sparkles
} from 'lucide-react';
import { ConversationList } from '../../components/inbox/conversation-list';
import { ChatWindow } from '../../components/inbox/chat-window';
import { SmartOrderModal } from '../../components/orders/smart-order-modal';
import { MainSidebar } from '../../components/layout/main-sidebar';
import { useChat } from '../../hooks/use-chat';
import { 
  CHANNEL_CONFIG, 
  MOCK_PRODUCTS 
} from '../../lib/constants';

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [contextTab, setContextTab] = useState<'crm' | 'orders' | 'actions'>('crm');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (action === 'catalog') setContextTab('actions');
    else if (action === 'order') setIsModalOpen(true);
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FAF9F6] animate-in fade-in duration-1000">
        <div className="relative mb-10">
          <div className="w-24 h-24 rounded-[3rem] bg-[#C08A7D]/5 flex items-center justify-center text-[#C08A7D] animate-pulse border border-[#C08A7D]/10">
            <Zap size={40} strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-center space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C08A7D]">OlieHub V2</p>
          <h2 className="text-sm font-bold text-stone-500 italic">Sincronizando Workspace Artesanal...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-stone-800 overflow-hidden font-sans">
      <MainSidebar />

      <ConversationList 
        conversations={uiConversations as any} 
        selectedId={selectedId || ''} 
        onSelect={setSelectedId} 
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden bg-[#FAF9F6]/20">
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
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="max-w-xl flex flex-col items-center">
              <div className="relative mb-20">
                 <div className="w-64 h-64 rounded-[6rem] bg-white shadow-2xl flex items-center justify-center text-[#C08A7D]/20 border border-[#C08A7D]/5">
                    <MessageCircle size={100} strokeWidth={0.5} />
                 </div>
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-10 py-5 bg-[#333333] rounded-[2rem] shadow-2xl flex items-center gap-5 border border-white/10">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white italic">Hub Ativado</span>
                 </div>
              </div>
              
              <h2 className="text-5xl font-black text-[#333333] tracking-tight mb-6 italic">Atendimento Olie</h2>
              <p className="text-lg font-medium text-stone-400 leading-relaxed mb-16 max-w-md">
                Integração nativa com Tiny ERP e VNDA. Selecione um cliente para iniciar a experiência de luxo.
              </p>
              
              <div className="grid grid-cols-2 gap-8 w-full">
                 <SummaryCard label="Fila de Espera" value={conversations.filter(c => c.status === 'queue').length} unit="Leads" />
                 <SummaryCard label="Atendimentos Ativos" value={conversations.filter(c => c.status === 'assigned').length} unit="Chats" />
              </div>
            </div>
          </div>
        )}

        {/* Context Pane */}
        <div className={`w-[450px] bg-white flex flex-col shrink-0 shadow-2xl border-l border-stone-200 transition-all duration-700 ease-in-out overflow-hidden ${selectedId ? 'translate-x-0' : 'translate-x-full opacity-0'}`}>
          {activeConv && (
            <>
              <div className="flex border-b border-stone-100 bg-white sticky top-0 z-20">
                {[
                  { id: 'crm', label: 'Cliente', icon: User },
                  { id: 'orders', label: 'Pedidos', icon: History },
                  { id: 'actions', label: 'Ações', icon: Zap },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setContextTab(tab.id as any)}
                    className={`flex-1 py-6 flex items-center justify-center gap-3 transition-all border-b-2 uppercase text-[10px] font-black tracking-[0.2em] ${
                      contextTab === tab.id ? 'border-[#C08A7D] text-[#C08A7D]' : 'border-transparent text-stone-300 hover:text-stone-500'
                    }`}
                  >
                    <tab.icon size={16} strokeWidth={3} /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-10 bg-[#FAF9F6]/30 scrollbar-hide space-y-10">
                {contextTab === 'crm' && (
                  <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                    {/* CRM Profile Header */}
                    <div className="text-center mb-12">
                      <div className="w-32 h-32 rounded-[3rem] bg-white border-8 border-stone-50 flex items-center justify-center text-5xl font-black text-[#C08A7D] mx-auto mb-8 shadow-2xl relative ring-1 ring-[#C08A7D]/5 italic">
                        {activeConv.customer.full_name.charAt(0)}
                        <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl ${CHANNEL_CONFIG[activeConv.customer.channel_source].bg} flex items-center justify-center border-4 border-white shadow-xl`}>
                          {React.createElement(CHANNEL_CONFIG[activeConv.customer.channel_source].icon, { size: 18, className: CHANNEL_CONFIG[activeConv.customer.channel_source].color })}
                        </div>
                      </div>
                      <h2 className="text-3xl font-black text-[#333333] tracking-tight italic mb-2">{activeConv.customer.full_name}</h2>
                      <div className="flex items-center justify-center gap-3">
                         <span className="px-4 py-2 bg-white border border-stone-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-500 shadow-sm flex items-center gap-2">
                            <Star size={12} className="text-[#C08A7D]" /> Cliente VIP
                         </span>
                         <span className="px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                            <TrendingUp size={12} className="text-emerald-400" /> Alta Conversão
                         </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">Informações de Retenção</h3>
                      <CRMCard label="Telefone" value={activeConv.customer.phone} icon={<Clock size={16}/>}/>
                      <CRMCard label="Valor Vitalício (LTV)" value={`R$ ${activeConv.customer.ltv.toFixed(2)}`} icon={<ShoppingBag size={16}/>}/>
                      <CRMCard label="Localização" value="São Paulo, Brasil" icon={<MapPin size={16}/>}/>
                    </div>

                    <div className="space-y-5 pt-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Tags Estratégicas</h3>
                        <button className="text-[10px] font-black text-[#C08A7D] uppercase tracking-widest hover:underline">Gerenciar</button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {activeConv.customer.tags.map(tag => (
                          <span key={tag} className="px-5 py-3 bg-white text-stone-600 rounded-2xl text-[11px] font-bold border border-stone-100 shadow-sm flex items-center gap-3 group hover:border-[#C08A7D]/30 transition-all cursor-default">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C08A7D] group-hover:scale-150 transition-transform" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {contextTab === 'actions' && (
                  <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-8">
                    <h3 className="text-[11px] font-black text-stone-300 uppercase tracking-widest mb-6">Central de Operações</h3>
                    <div className="space-y-4">
                      <OperationButton 
                        label="Novo Pedido Artesanal" 
                        icon={<ShoppingBag size={20}/>} 
                        onClick={() => setIsModalOpen(true)}
                        primary
                      />
                      <OperationButton label="Orçamento PDF VNDA" icon={<CreditCard size={20}/>} />
                      <OperationButton label="Cotação Melhor Envio" icon={<Package size={20}/>} />
                      <OperationButton label="Solicitar Feedback AI" icon={<Sparkles size={20}/>} />
                    </div>
                  </div>
                )}

                {contextTab === 'orders' && (
                  <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-6">
                    <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm text-center">
                       <div className="w-24 h-24 rounded-[2.5rem] bg-stone-50 flex items-center justify-center mx-auto mb-8 text-stone-200 border border-stone-100 shadow-inner">
                          <Package size={48} />
                       </div>
                       <p className="text-[11px] font-black text-stone-300 uppercase tracking-[0.3em] mb-4">Sincronizando Histórico</p>
                       <p className="text-xs font-medium text-stone-400">Consultando bases de dados do Tiny ERP e VNDA para {activeConv.customer.full_name}...</p>
                    </div>
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

const SummaryCard = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
  <div className="p-10 bg-white border border-stone-100 rounded-[3.5rem] shadow-sm group hover:shadow-2xl hover:border-[#C08A7D]/20 transition-all cursor-default text-left">
    <p className="text-[11px] font-black text-stone-300 uppercase tracking-[0.25em] mb-3">{label}</p>
    <p className="text-4xl font-black text-[#333333] italic">
      {value} <span className="text-stone-300 text-sm font-bold uppercase tracking-widest ml-2">{unit}</span>
    </p>
  </div>
);

const CRMCard = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
  <div className="p-6 bg-white rounded-[2.8rem] border border-stone-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all border-l-4 hover:border-l-[#C08A7D]">
    <div className="w-14 h-14 rounded-[1.4rem] bg-stone-50 flex items-center justify-center text-[#C08A7D] group-hover:scale-110 transition-transform">
       {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-stone-300 uppercase font-black tracking-widest mb-1">{label}</p>
      <p className="text-[15px] font-black text-[#333333] italic truncate">{value}</p>
    </div>
  </div>
);

const OperationButton = ({ label, icon, onClick, primary }: { label: string, icon: any, onClick?: () => void, primary?: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full font-black py-6 rounded-[2.5rem] transition-all flex items-center justify-between px-10 group active:scale-[0.98] shadow-xl ${
      primary ? 'bg-[#333333] text-white hover:bg-[#111111] shadow-black/10' : 'bg-white border-2 border-stone-100 text-stone-500 hover:border-[#C08A7D]/30 hover:text-[#C08A7D] shadow-sm'
    }`}
  >
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${primary ? 'bg-white/10 group-hover:bg-white/20' : 'bg-stone-50 group-hover:bg-[#C08A7D]/10'}`}>
        {icon}
      </div>
      <span className="text-[11px] uppercase tracking-[0.2em]">{label}</span>
    </div>
    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-[#C08A7D]" />
  </button>
);