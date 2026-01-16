
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
  
  // Layout State
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'crm' | 'orders' | 'catalog' | null>(null);

  // Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const { 
    conversations = [], 
    messages = [], 
    sendMessage,
    loadMoreMessages,
    hasMore,
    isFetchingHistory
  } = useChat(selectedId);

  const activeConv = useMemo(() => 
    (conversations || []).find(c => c.id === selectedId), 
  [selectedId, conversations]);

  // Load orders when conversation is selected
  useEffect(() => {
    if (activeConv) {
        OrderService.getList().then(data => setRecentOrders(data.slice(0, 3)));
    }
  }, [activeConv]);

  const safeTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '--:--';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const uiConversations = useMemo(() => (conversations || []).map(c => ({
    id: c.id,
    name: c.customer?.full_name || 'Cliente Olie',
    avatar: (c.customer?.full_name || 'O').charAt(0).toUpperCase(),
    lastMessage: c.last_message || '...',
    time: safeTime(c.last_message_at),
    source: c.customer?.channel_source || 'whatsapp',
    unreadCount: c.unread_count || 0
  })), [conversations]);

  const uiMessages = useMemo(() => (messages || []).map(m => ({
    id: m.id,
    content: m.content || '',
    direction: m.direction,
    created_at: m.created_at,
    type: m.type
  })), [messages]);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    
    // Smart Responsiveness
    if (window.innerWidth >= 1280 && !isRightOpen) {
        setIsRightOpen(true);
    }
    if (window.innerWidth < 768) {
        setIsLeftOpen(false);
    }
    
    setRightPanelTab(null);
  };

  const handleChatAction = (action: 'order' | 'catalog') => {
    if (action === 'order') {
      setIsOrderModalOpen(true);
    } else if (action === 'catalog') {
      if (!isRightOpen) setIsRightOpen(true);
      setRightPanelTab('catalog');
    }
  };

  const handleOrderComplete = (summary: string) => {
    if (selectedId) {
      sendMessage(summary);
    }
  };

  return (
    <>
      <div className="flex-1 flex overflow-hidden relative h-full">

        {/* LEFT PANE */}
        <div 
          className={`shrink-0 bg-white border-r border-[#F2F0EA] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden relative z-20 ${
            isLeftOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10 border-none'
          }`}
        >
          <div className="w-80 h-full absolute top-0 right-0">
             <ConversationList 
                conversations={uiConversations as any} 
                selectedId={selectedId || ''} 
                onSelect={handleSelectConversation} 
             />
          </div>
        </div>

        {/* CENTER PANE */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 h-full bg-[#FDFBF7] shadow-xl shadow-stone-200/20">
          <ChatWindow 
            client={selectedId && activeConv ? { 
              id: activeConv.customer?.id || activeConv.customer_id, 
              name: activeConv.customer?.full_name || 'Cliente', 
              avatar: (activeConv.customer?.full_name || 'C').charAt(0).toUpperCase(), 
              source: activeConv.customer?.channel_source || 'whatsapp' 
            } : null} 
            messages={selectedId ? (uiMessages as any) : []} 
            onSendMessage={sendMessage} 
            
            // Layout Props
            isLeftOpen={isLeftOpen}
            onToggleLeft={() => setIsLeftOpen(!isLeftOpen)}
            isRightOpen={isRightOpen}
            onToggleRight={() => setIsRightOpen(!isRightOpen)}
            
            // Infinite Scroll Props
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            isLoadingHistory={isFetchingHistory}

            // Actions
            onTriggerAction={handleChatAction}
          />
        </div>

        {/* RIGHT PANE */}
        <div 
           className={`shrink-0 bg-white border-l border-[#F2F0EA] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden relative z-20 ${
            isRightOpen ? 'w-96 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10 border-none'
           }`}
        >
           <div className="w-96 h-full absolute top-0 left-0">
              <ActionPanel 
                isOpen={true} 
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
                forcedTab={rightPanelTab}
              />
           </div>
        </div>

      </div>

      <SmartOrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        clientName={activeConv?.customer?.full_name || 'Cliente'}
        catalog={MOCK_PRODUCTS}
        onOrderComplete={handleOrderComplete}
      />
    </>
  );
}
