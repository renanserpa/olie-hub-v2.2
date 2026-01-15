
"use client";

import React, { useState, useMemo } from 'react';
import { ConversationList } from '../../components/inbox/conversation-list.tsx';
import { ChatWindow } from '../../components/inbox/chat-window.tsx';
import { ActionPanel } from '../../components/inbox/action-panel.tsx';
import { MainSidebar } from '../../components/layout/main-sidebar.tsx';
import { useChat } from '../../hooks/use-chat.ts';
import { MOCK_PRODUCTS } from '../../lib/constants.ts';
import { OrderService } from '../../services/api.ts';

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  
  // Layout State
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const { conversations = [], messages = [], sendMessage } = useChat(selectedId);

  const activeConv = useMemo(() => 
    (conversations || []).find(c => c.id === selectedId), 
  [selectedId, conversations]);

  // Load orders when conversation is selected
  React.useEffect(() => {
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
    // On desktop, we can auto-open context, or keep it as is. 
    // Let's ensure left stays open and right opens if user wants context.
    if (!isRightOpen && window.innerWidth > 1024) setIsRightOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-[#333333] overflow-hidden font-sans">
      {/* 0. Global Sidebar (Fixed) */}
      <MainSidebar />

      {/* 1. LEFT PANE - Conversation List (Collapsible) */}
      <div 
        className={`shrink-0 bg-white border-r border-[#F2F0EA] transition-all duration-300 ease-in-out overflow-hidden relative ${
          isLeftOpen ? 'w-[350px] opacity-100' : 'w-0 opacity-0 border-none'
        }`}
      >
        {/* Inner container with fixed width prevents content squashing during transition */}
        <div className="w-[350px] h-full absolute top-0 left-0">
           <ConversationList 
              conversations={uiConversations as any} 
              selectedId={selectedId || ''} 
              onSelect={handleSelectConversation} 
           />
        </div>
      </div>

      {/* 2. CENTER PANE - Chat Window (Fluid) */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0 h-full transition-all duration-300">
        {selectedId && activeConv ? (
            <ChatWindow 
              client={{ 
                id: activeConv.customer?.id || activeConv.customer_id, 
                name: activeConv.customer?.full_name || 'Cliente', 
                avatar: (activeConv.customer?.full_name || 'C').charAt(0).toUpperCase(), 
                source: activeConv.customer?.channel_source || 'whatsapp' 
              }} 
              messages={uiMessages as any} 
              onSendMessage={sendMessage} 
              
              // Layout Controls
              isLeftOpen={isLeftOpen}
              onToggleLeft={() => setIsLeftOpen(!isLeftOpen)}
              isRightOpen={isRightOpen}
              onToggleRight={() => setIsRightOpen(!isRightOpen)}
            />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFBF7] relative">
             <div className="absolute top-4 left-4">
                {/* Toggle button even in empty state to recover the list if closed */}
                {!isLeftOpen && (
                  <button onClick={() => setIsLeftOpen(true)} className="p-2 bg-white border border-[#EBE8E0] rounded-xl text-stone-400 hover:text-[#C08A7D]">
                    <span className="font-black text-xs uppercase">Abrir Menu</span>
                  </button>
                )}
             </div>
             <div className="w-24 h-24 bg-[#EBE8E0] rounded-full flex items-center justify-center mb-6 animate-pulse">
                <div className="w-20 h-20 bg-[#FAF9F6] rounded-full" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Selecione uma conversa</p>
          </div>
        )}
      </div>

      {/* 3. RIGHT PANE - Action Panel (Collapsible) */}
      <div 
         className={`shrink-0 bg-white border-l border-[#F2F0EA] transition-all duration-300 ease-in-out overflow-hidden relative ${
          isRightOpen ? 'w-96 opacity-100' : 'w-0 opacity-0 border-none'
         }`}
      >
         <div className="w-96 h-full absolute top-0 right-0">
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
            />
         </div>
      </div>
    </div>
  );
}
