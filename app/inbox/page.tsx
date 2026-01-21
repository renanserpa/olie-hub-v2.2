
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ConversationList } from '../../components/inbox/conversation-list.tsx';
import { ChatWindow } from '../../components/inbox/chat-window.tsx';
import { ActionPanel } from '../../components/inbox/action-panel.tsx';
import { useChat } from '../../hooks/use-chat.ts';
import { MOCK_PRODUCTS } from '../../lib/constants.ts';
import { OrderService } from '../../services/api.ts';
import { SmartOrderModal } from '../../components/orders/smart-order-modal.tsx';

/**
 * InboxPage - OlieHub V2
 * Implementação do Layout de 3 Painéis com Lógica de Colapso Responsiva
 */
export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  
  // Controle de Estado dos Painéis
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'crm' | 'orders' | 'catalog' | 'ai' | 'studio' | null>(null);

  // Estados de Dados Complementares
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

  /**
   * Gerenciamento de Responsividade Dinâmica
   * Ajusta o estado das sidebars baseado no tamanho da janela
   */
  useEffect(() => {
    const handleInitialLayout = () => {
      const width = window.innerWidth;
      
      // Regras de Layout Inicial
      if (width < 768) {
        // Mobile: Tudo fechado por padrão (espera interação)
        setIsLeftOpen(true);
        setIsRightOpen(false);
      } else if (width < 1280) {
        // Tablet/Laptop Pequeno: Esquerda aberta, Direita fechada
        setIsLeftOpen(true);
        setIsRightOpen(false);
      } else {
        // Desktop: Esquerda aberta, Direita opcional (começa fechada para foco)
        setIsLeftOpen(true);
        setIsRightOpen(false);
      }
    };

    handleInitialLayout();

    const handleResize = () => {
      const width = window.innerWidth;
      // Auto-colapso inteligente ao reduzir a janela
      if (width < 1024 && isLeftOpen && isRightOpen) {
        setIsRightOpen(false); // Fecha o CRM se o espaço ficar apertado
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sincronização de pedidos ao mudar o cliente ativo
  useEffect(() => {
    if (activeConv) {
        OrderService.getList().then(result => {
          if (result.data) {
            setRecentOrders(result.data.slice(0, 3));
          }
        });
    }
  }, [activeConv]);

  /**
   * Seleção de Conversa com Lógica de UX Responsiva
   */
  const handleSelectConversation = useCallback((id: string) => {
    setSelectedId(id);
    
    // Se estiver em mobile ou tablet (< 1024px), fecha a lista para mostrar o chat
    if (window.innerWidth < 1024) {
      setIsLeftOpen(false);
    }
  }, []);

  const handleChatAction = useCallback((action: 'order' | 'catalog') => {
    if (action === 'order') {
      setIsOrderModalOpen(true);
    } else if (action === 'catalog') {
      setIsRightOpen(true);
      setRightPanelTab('catalog');
      
      // Em mobile, fecha a esquerda se abrir o catálogo para evitar clutter
      if (window.innerWidth < 768) {
        setIsLeftOpen(false);
      }
    }
  }, []);

  const toggleLeftSidebar = () => setIsLeftOpen(!isLeftOpen);
  const toggleRightSidebar = () => setIsRightOpen(!isRightOpen);

  // Normalização de Dados para a UI (ConversationList)
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

  return (
    <>
      <div className="flex-1 flex h-full overflow-hidden bg-white relative">
        
        {/* PAINEL ESQUERDO: Lista de Atendimentos */}
        <aside 
          className={`
            shrink-0 h-full bg-white z-40 relative overflow-hidden
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isLeftOpen ? 'w-80 border-r border-stone-100 shadow-xl' : 'w-0 border-r-0 shadow-none'}
            ${window.innerWidth < 1024 && isLeftOpen ? 'absolute inset-y-0 left-0' : ''}
          `}
        >
          <div className="w-80 h-full overflow-hidden">
             <ConversationList 
                conversations={uiConversations as any} 
                selectedId={selectedId || ''} 
                onSelect={handleSelectConversation} 
             />
          </div>
        </aside>

        {/* PAINEL CENTRAL: Janela de Chat */}
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
            onToggleLeft={toggleLeftSidebar}
            isRightOpen={isRightOpen}
            onToggleRight={toggleRightSidebar}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            isLoadingHistory={isFetchingHistory}
            onTriggerAction={handleChatAction}
            onUpdateStatus={(status) => selectedId && updateConversationStatus(selectedId, status)}
            onTransfer={(agentId) => selectedId && transferConversation(selectedId, agentId)}
          />
        </main>

        {/* PAINEL DIREITO: Inteligência e CRM */}
        <aside 
          className={`
            shrink-0 h-full bg-white z-40 relative overflow-hidden
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isRightOpen ? 'w-96 border-l border-stone-100 shadow-2xl' : 'w-0 border-l-0 shadow-none'}
            ${window.innerWidth < 1280 && isRightOpen ? 'absolute inset-y-0 right-0' : ''}
          `}
        >
           <div className="w-96 h-full overflow-hidden">
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

        {/* Overlay Inteligente para Mobile/Tablet */}
        {(isLeftOpen || isRightOpen) && (
          <div 
            className={`
              absolute inset-0 bg-stone-900/10 backdrop-blur-[2px] z-30 
              transition-opacity duration-500
              ${window.innerWidth < 1280 ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
            onClick={() => { 
              if (window.innerWidth < 1024) setIsLeftOpen(false);
              if (window.innerWidth < 1280) setIsRightOpen(false);
            }}
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
