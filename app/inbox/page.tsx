
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ConversationList } from '../../components/inbox/conversation-list.tsx';
import { ChatWindow } from '../../components/inbox/chat-window.tsx';
import { ActionPanel } from '../../components/inbox/action-panel.tsx';
import { useChat } from '../../hooks/use-chat.ts';
import { MOCK_PRODUCTS } from '../../lib/constants.ts';
import { OrderService } from '../../services/api.ts';
import { SmartOrderModal } from '../../components/orders/smart-order-modal.tsx';

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  
  // Painéis Colapsáveis - Dimensões Olie: 320px (Esquerda) e 384px (Direita)
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'crm' | 'orders' | 'catalog' | 'ai' | 'studio' | null>(null);

  // Modais e Estados de Apoio
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const { 
    conversations = [], 
    messages = [], 
    sendMessage,
    loadMoreMessages,
    hasMore,
    isFetchingHistory,
    updateConversationStatus,
    transferConversation
  } = useChat(selectedId);

  const activeConv = useMemo(() => 
    (conversations || []).find(c => c.id === selectedId), 
  [selectedId, conversations]);

  // Sincronização de pedidos ao mudar o cliente ativo
  useEffect(() => {
    if (activeConv) {
        // Fix: OrderService.getList returns an object { data, error }, not the array directly.
        OrderService.getList().then(result => {
          if (result.data) {
            setRecentOrders(result.data.slice(0, 3));
          }
        });
    }
  }, [activeConv]);

  // Gerenciamento de Responsividade Automática
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Em telas menores que XL (1280px), fecha o painel direito por padrão
      if (width < 1280) setIsRightOpen(false);
      // Em telas menores que LG (1024px), fecha a lista lateral por padrão
      if (width < 1024) setIsLeftOpen(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Transformação de dados para a UI
  const uiConversations = useMemo(() => (conversations || []).map(c => ({
    id: c.id,
    name: c.customer?.full_name || 'Cliente Olie',
    avatar: (c.customer?.full_name || 'O').charAt(0).toUpperCase(),
    lastMessage: c.last_message || '...',
    time: c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
    source: c.customer?.channel_source || 'whatsapp',
    unreadCount: c.unread_count || 0,
    tags: c.customer?.tags || [],
    status: c.status
  })), [conversations]);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    // Em mobile, fecha a lista ao selecionar para liberar espaço para o chat
    if (window.innerWidth < 768) setIsLeftOpen(false);
  };

  const handleChatAction = (action: 'order' | 'catalog') => {
    if (action === 'order') {
      setIsOrderModalOpen(true);
    } else if (action === 'catalog') {
      setIsRightOpen(true);
      setRightPanelTab('catalog');
    }
  };

  return (
    <>
      <div className="flex-1 flex h-full overflow-hidden bg-white relative">
        {/* Painel Esquerdo: Lista de Atendimentos (w-80) */}
        <aside 
          className={`
            shrink-0 h-full bg-white z-30 relative overflow-hidden
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isLeftOpen ? 'w-80 border-r border-stone-100 shadow-xl' : 'w-0 border-r-0'}
          `}
        >
          <div className="w-80 h-full">
             <ConversationList 
                conversations={uiConversations as any} 
                selectedId={selectedId || ''} 
                onSelect={handleSelectConversation} 
             />
          </div>
        </aside>

        {/* Painel Central: Janela de Chat Primária */}
        <main className="flex-1 min-w-0 flex flex-col h-full bg-stone-50 relative z-10 overflow-hidden">
          <ChatWindow 
            client={selectedId && activeConv ? { 
              id: activeConv.customer?.id || activeConv.customer_id, 
              name: activeConv.customer?.full_name || 'Cliente', 
              avatar: (activeConv.customer?.full_name || 'C').charAt(0).toUpperCase(), 
              source: activeConv.customer?.channel_source || 'whatsapp',
              status: activeConv.status,
              assignee_id: activeConv.assignee_id
            } : null} 
            messages={messages as any} 
            onSendMessage={sendMessage} 
            isLeftOpen={isLeftOpen}
            onToggleLeft={() => setIsLeftOpen(!isLeftOpen)}
            isRightOpen={isRightOpen}
            onToggleRight={() => setIsRightOpen(!isRightOpen)}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            isLoadingHistory={isFetchingHistory}
            onTriggerAction={handleChatAction}
            onUpdateStatus={(status) => selectedId && updateConversationStatus(selectedId, status)}
            onTransfer={(agentId) => selectedId && transferConversation(selectedId, agentId)}
          />
        </main>

        {/* Painel Direito: CRM, Ações e Inteligência (w-96) */}
        <aside 
          className={`
            shrink-0 h-full bg-white z-30 relative overflow-hidden
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isRightOpen ? 'w-96 border-l border-stone-100 shadow-2xl' : 'w-0 border-l-0'}
          `}
        >
           <div className="w-96 h-full">
              <ActionPanel 
                isOpen={isRightOpen} 
                onClose={() => setIsRightOpen(false)}
                client={activeConv?.customer ? {
                    name: activeConv.customer.full_name,
                    email: activeConv.customer.email,
                    avatar: (activeConv.customer.full_name || 'C').charAt(0).toUpperCase(),
                    ltv: activeConv.customer.ltv,
                    tags: activeConv.customer.tags
                } : null}
                catalog={MOCK_PRODUCTS}
                recentOrders={recentOrders}
                messages={messages}
                forcedTab={rightPanelTab}
              />
           </div>
        </aside>

        {/* Overlay para Mobile quando painéis estão abertos */}
        {(isLeftOpen || isRightOpen) && window.innerWidth < 1024 && (
          <div 
            className="absolute inset-0 bg-stone-900/10 backdrop-blur-sm z-20 animate-in fade-in duration-300" 
            onClick={() => { setIsLeftOpen(false); setIsRightOpen(false); }}
          />
        )}
      </div>

      <SmartOrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        clientName={activeConv?.customer?.full_name || 'Cliente'}
        catalog={MOCK_PRODUCTS}
        onOrderComplete={(summary) => selectedId && sendMessage(summary)}
      />
    </>
  );
}
