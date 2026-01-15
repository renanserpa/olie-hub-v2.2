"use client";

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, MapPin, Clock, Package, MessageCircle, 
  TrendingUp, Star, Sparkles, Activity, ShieldCheck,
  MousePointer2
} from 'lucide-react';
import { ConversationList } from '../../components/inbox/conversation-list';
import { ChatWindow } from '../../components/inbox/chat-window';
import { SmartOrderModal } from '../../components/orders/smart-order-modal';
import { MainSidebar } from '../../components/layout/main-sidebar';
import { useChat } from '../../hooks/use-chat';
import { MOCK_PRODUCTS } from '../../lib/constants';

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [contextTab, setContextTab] = useState<'crm' | 'actions'>('crm');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { conversations, messages, isLoading, sendMessage } = useChat(selectedId);

  const activeConv = useMemo(() => conversations.find(c => c.id === selectedId), [selectedId, conversations]);

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
    content: m.content,
    direction: m.direction,
    created_at: m.created_at,
    type: m.type
  })), [messages]);

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-[#333333] overflow-hidden font-sans">
      <MainSidebar />
      <ConversationList conversations={uiConversations as any} selectedId={selectedId || ''} onSelect={setSelectedId} />

      <div className="flex-1 flex overflow-hidden relative">
        {selectedId && activeConv ? (
          <div className="flex-1 flex overflow-hidden animate-in fade-in duration-1000">
            <ChatWindow 
              client={{ 
                id: activeConv.customer.id, 
                name: activeConv.customer.full_name, 
                avatar: activeConv.customer.full_name.charAt(0), 
                source: activeConv.customer.channel_source 
              }} 
              messages={uiMessages as any} 
              onSendMessage={sendMessage} 
              onOpenAction={(a) => a === 'order' ? setIsModalOpen(true) : setContextTab('actions')}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-24 text-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] overflow-hidden">
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#C08A7D]/5 rounded-full blur-[180px] translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 max-w-2xl space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="w-72 h-72 rounded-[8rem] bg-white shadow-[0_50px_120px_rgba(192,138,125,0.15)] flex items-center justify-center border border-[#C08A7D]/5 mx-auto relative group">
                <MessageCircle size={120} strokeWidth={0.2} className="text-[#C08A7D]/20 group-hover:scale-110 group-hover:text-[#C08A7D]/40 transition-all duration-1000 ease-out" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-12 py-5 bg-[#333333] rounded-3xl shadow-2xl flex items-center gap-5 border border-white/5 whitespace-nowrap">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white italic">OlieHub Inbox Ativa</span>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-7xl font-black text-[#333333] tracking-tighter italic leading-none">Seu Ateliê Inbox.</h2>
                <p className="text-xl font-medium text-stone-400 leading-relaxed max-w-lg mx-auto">
                  Toda a magia artesanal começa com um toque de atenção. Selecione um atendimento para prosseguir.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-10 w-full pt-10">
                <div className="olie-card p-10 text-left space-y-6">
                  <div className="w-14 h-14 bg-[#FAF9F6] rounded-2xl flex items-center justify-center text-[#C08A7D]"><TrendingUp size={28} /></div>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">Capacidade de Atendimento</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-6xl font-black italic text-[#333333]">{conversations.length}</span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">+12%</span>
                  </div>
                </div>
                <div className="olie-card p-10 text-left space-y-6">
                  <div className="w-14 h-14 bg-[#FAF9F6] rounded-2xl flex items-center justify-center text-yellow-500"><Star size={28} /></div>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">Prioridade Estrita</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-6xl font-black italic text-[#C08A7D]">04</span>
                    <span className="text-xs font-bold text-stone-400">Pendente</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-stone-300 pt-10">
                 <div className="w-12 h-px bg-stone-100" />
                 <span className="text-[9px] font-black uppercase tracking-[0.6em] italic flex items-center gap-3">
                   <MousePointer2 size={12} /> Selecione na lateral
                 </span>
                 <div className="w-12 h-px bg-stone-100" />
              </div>
            </div>
          </div>
        )}

        {/* CRM Context Sidebar - Adjusted Width & Spacing */}
        <aside className={`w-[480px] bg-white border-l border-[#F2F0EA] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-50 ${selectedId ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          {activeConv && (
            <>
              <div className="flex px-14 pt-14 pb-10">
                <div className="flex bg-[#FAF9F6] p-2.5 rounded-[2rem] w-full border border-[#F2F0EA] shadow-inner">
                  {['crm', 'actions'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setContextTab(t as any)} 
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.4rem] transition-all duration-500 ${
                        contextTab === t 
                          ? 'bg-white text-[#C08A7D] shadow-xl shadow-stone-200/40' 
                          : 'text-stone-300 hover:text-stone-400'
                      }`}
                    >
                      {t === 'crm' ? 'Perfil Detalhado' : 'Ações Rápidas'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-14 pb-14 space-y-12 scrollbar-hide">
                {contextTab === 'crm' && (
                  <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-12">
                    <div className="text-center">
                      <div className="w-36 h-36 rounded-[4rem] bg-[#C08A7D] flex items-center justify-center text-6xl font-black text-white mx-auto mb-8 shadow-[0_40px_100px_rgba(192,138,125,0.3)] italic relative group transform hover:scale-105 transition-transform duration-700">
                        {activeConv.customer.full_name.charAt(0)}
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-[#FAF9F6] shadow-2xl">
                          <ShieldCheck size={24} className="text-[#C08A7D]" />
                        </div>
                      </div>
                      <h3 className="text-4xl font-black text-[#333333] italic tracking-tighter mb-4">{activeConv.customer.full_name}</h3>
                      <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-[#C08A7D]/5 rounded-full border border-[#C08A7D]/10">
                         <span className="text-[11px] font-black text-[#C08A7D] uppercase tracking-[0.2em]">LTV Vitalício: R$ {activeConv.customer.ltv.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                       <CRMCard label="Canal de Entrada" value={activeConv.customer.phone} icon={<Clock size={20}/>} />
                       <CRMCard label="Localização Olie" value="São Paulo - SP" icon={<MapPin size={20}/>} />
                       
                       <div className="p-10 bg-[#333333] rounded-[3.5rem] text-white space-y-8 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                             <Package size={140} strokeWidth={1} />
                          </div>
                          <div className="flex justify-between items-start relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Logística de Produção</p>
                            <span className="text-[9px] font-black bg-[#C08A7D]/20 text-[#C08A7D] px-4 py-1.5 rounded-full border border-[#C08A7D]/10 uppercase tracking-widest">Ativo</span>
                          </div>
                          <div className="flex items-center gap-8 relative z-10">
                             <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner"><Package size={32} className="text-[#C08A7D]"/></div>
                             <div className="space-y-1">
                                <p className="text-2xl font-black italic">Bolsa Lille M</p>
                                <p className="text-[13px] font-medium text-stone-400 flex items-center gap-3">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Fase de Costura Final
                                </p>
                             </div>
                          </div>
                          <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                             <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Entrega Prevista: 04 Out</span>
                             <button className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C08A7D] hover:text-white transition-colors">Ver Fluxo</button>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {contextTab === 'actions' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-700">
                    <button 
                      onClick={() => setIsModalOpen(true)} 
                      className="w-full bg-[#C08A7D] text-white py-10 rounded-[3rem] font-black uppercase text-[13px] tracking-[0.3em] hover:bg-[#A67569] transition-all shadow-[0_30px_70px_rgba(192,138,125,0.3)] flex items-center justify-center gap-6 group italic"
                    >
                      <ShoppingBag size={28} className="group-hover:scale-110 transition-transform duration-700"/> Criar Novo Pedido
                    </button>
                    
                    <button className="w-full bg-white border-2 border-[#FAF9F6] text-stone-400 py-10 rounded-[3rem] font-black uppercase text-[13px] tracking-[0.3em] hover:border-[#C08A7D]/20 hover:text-stone-600 transition-all flex items-center justify-center gap-6 group shadow-sm">
                      <Package size={28} className="group-hover:scale-110 transition-transform duration-700"/> Sincronizar ERP Tiny
                    </button>
                    
                    <div className="pt-20">
                       <div className="flex items-center gap-6 mb-12">
                          <p className="text-[11px] font-black text-stone-300 uppercase tracking-[0.5em] italic">Ecossistema Ateliê</p>
                          <div className="flex-1 h-px bg-stone-100" />
                       </div>
                       <div className="grid grid-cols-3 gap-8">
                          {[
                            { name: 'Tiny ERP', url: 'https://tiny.com.br/favicon.ico', status: 'online' },
                            { name: 'Meta API', icon: MessageCircle, status: 'online' },
                            { name: 'VNDA E-com', icon: ShoppingBag, status: 'offline' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-4 group cursor-pointer">
                               <div className="w-20 h-20 rounded-[2.2rem] bg-[#FAF9F6] flex items-center justify-center border border-[#F2F0EA] group-hover:bg-white group-hover:shadow-2xl group-hover:border-[#C08A7D]/10 transition-all duration-500">
                                  {item.url ? <img src={item.url} className="w-8 h-8 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"/> : <item.icon size={28} className="text-stone-200 group-hover:text-[#C08A7D] transition-all duration-700" />}
                               </div>
                               <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${item.status === 'online' ? 'text-emerald-500' : 'text-stone-300 group-hover:text-stone-400'}`}>{item.status}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      <SmartOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        clientName={activeConv?.customer.full_name || 'Cliente'} 
        catalog={MOCK_PRODUCTS} 
        onOrderComplete={(s) => sendMessage(s)} 
      />
    </div>
  );
}

const CRMCard = ({ label, value, icon }: any) => (
  <div className="p-10 bg-white rounded-[3rem] border border-[#F2F0EA] flex items-center gap-8 group hover:border-[#C08A7D]/20 hover:shadow-2xl hover:shadow-stone-200/50 transition-all duration-700">
    <div className="w-16 h-16 rounded-[1.8rem] bg-[#FAF9F6] flex items-center justify-center text-[#C08A7D] group-hover:scale-110 group-hover:bg-[#C08A7D] group-hover:text-white transition-all duration-700 shadow-sm">{icon}</div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em] mb-1">{label}</p>
      <p className="text-lg font-black text-[#333333] italic">{value}</p>
    </div>
  </div>
);