
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ConversationList } from '../../components/inbox/conversation-list.tsx';
import { ChatWindow } from '../../components/inbox/chat-window.tsx';
import { ActionPanel } from '../../components/inbox/action-panel.tsx';
import { MainSidebar } from '../../components/layout/main-sidebar.tsx';
import { useChat } from '../../hooks/use-chat.ts';
import { MOCK_PRODUCTS } from '../../lib/constants.ts';
import { OrderService } from '../../services/api.ts';
import { SmartOrderModal } from '../../components/orders/smart-order-modal.tsx';

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  
  // Layout State - Initialize with correct panel visibility
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'crm' | 'orders' | 'catalog' | null>(null);

  // Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const { conversations = [], messages = [], sendMessage } = useChat(selectedId);

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
    
    // Smart Responsiveness:
    // Large screens: Auto-open context panel if not already open
    if (window.innerWidth >= 1280 && !isRightOpen) {
        setIsRightOpen(true);
    }
    // Mobile: Close list to focus on chat
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
    <div className="flex h-screen bg-[#FDFBF7] text-[#333333] overflow-hidden font-sans selection:bg-[#C08A7D] selection:text-white">
      {/* 0. Global Sidebar (Fixed Width) */}
      <MainSidebar />

      {/* 
         LAYOUT CONTAINER 
         Uses a flex row to manage the 3 panels.
      */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 
           1. LEFT PANE - Conversation List (w-80 / 320px)
           - Wrapper animates width and opacity.
           - Inner div has fixed width to prevent content squishing.
        */}
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

        {/* 
           2. CENTER PANE - Chat Window 
           - Flex-1 to take remaining space.
           - Minimal styling to blend with Olie theme.
        */}
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
            
            // Panel Controls passed to Header
            isLeftOpen={isLeftOpen}
            onToggleLeft={() => setIsLeftOpen(!isLeftOpen)}
            isRightOpen={isRightOpen}
            onToggleRight={() => setIsRightOpen(!isRightOpen)}
            
            // Actions
            onTriggerAction={handleChatAction}
          />
        </div>

        {/* 
           3. RIGHT PANE - Action/Context Panel (w-96 / 384px)
           - Similar animation logic to Left Pane.
        */}
        <div 
           className={`shrink-0 bg-white border-l border-[#F2F0EA] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden relative z-20 ${
            isRightOpen ? 'w-96 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10 border-none'
           }`}
        >
           <div className="w-96 h-full absolute top-0 left-0">
              <ActionPanel 
                isOpen={true} // Controlled by parent layout container via width
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

      {/* 4. MODALS OVERLAY */}
      <SmartOrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        clientName={activeConv?.customer?.full_name || 'Cliente'}
        catalog={MOCK_PRODUCTS}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}
