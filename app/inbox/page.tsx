
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
  
  // Painéis Colapsáveis
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'crm' | 'orders' | 'catalog' | 'ai' | 'studio' | null>(null);

  // Modais e Dados de Apoio
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

  // Sincronização de pedidos ao mudar cliente
  useEffect(() => {
    if (activeConv) {
        OrderService.getList().then(data => setRecentOrders(data.slice(0, 3)));
    }
  }, [activeConv]);

  // Responsividade Automática
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1280) setIsRightOpen(false);
      if (width < 1024) setIsLeftOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <aside 
          className={`
            shrink-0 h-full bg-white z-30 relative overflow-hidden
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isLeftOpen ? 'w-[360px] border-r border-stone-100' : 'w-0 border-r-0'}
          `}
        >
          <div className="w-[360px] h-full">
             <ConversationList 
                conversations={uiConversations as any} 
                selectedId={selectedId || ''} 
                onSelect={handleSelectConversation} 
             />
          </div>
        </aside>

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

        <aside 
          className={`
            shrink-0 h-full bg-white z-30 relative overflow-hidden
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isRightOpen ? 'w-[400px] border-l border-stone-100' : 'w-0 border-l-0'}
          `}
        >
           <div className="w-[400px] h-full">
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
