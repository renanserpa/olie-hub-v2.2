
"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../lib/supabase/client';
// Fix: Import from types/index.ts to use V3 domain types (e.g., channel_source, ltv, created_at)
import { Conversation, Message, Customer } from '../types/index';

const supabase = createClient();

export function useChat(selectedConversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca a lista de conversas ativas com dados do cliente (Join)
   * Alinhado com o schema V3 (customers e conversations)
   */
  const fetchConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          status,
          sales_stage,
          assignee_id,
          last_message,
          last_message_at,
          unread_count,
          customer_id,
          customer:customers (
            id,
            full_name,
            email,
            phone,
            avatar_url,
            channel_source,
            tiny_contact_id,
            vnda_id,
            total_orders,
            ltv,
            tags
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data as unknown as Conversation[]);
    } catch (err: any) {
      console.error('Erro ao buscar conversas:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Busca o histórico de mensagens de uma conversa específica
   */
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mapeia para o formato V3
      const formattedMessages: Message[] = data.map(m => ({
        id: m.id,
        conversation_id: m.conversation_id,
        content: m.content,
        type: m.type,
        direction: m.direction,
        sender_id: m.sender_id,
        read: m.read,
        created_at: m.created_at
      }));

      setMessages(formattedMessages);
    } catch (err: any) {
      console.error('Erro ao buscar mensagens:', err.message);
    }
  }, []);

  /**
   * Envia uma nova mensagem (Outbound)
   */
  const sendMessage = async (content: string, type: any = 'text') => {
    if (!selectedConversationId || !content.trim()) return;

    try {
      // Pega o usuário logado para o sender_id
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: selectedConversationId,
          content,
          direction: 'outbound',
          type: type,
          sender_id: user?.id || null,
          read: true
        }]);

      if (error) throw error;

      // Atualiza o estado da conversa (Denormalização para lista rápida)
      await supabase
        .from('conversations')
        .update({ 
          last_message: content, 
          last_message_at: new Date().toISOString() 
        })
        .eq('id', selectedConversationId);

    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err.message);
    }
  };

  /**
   * Setup Realtime Subscription
   */
  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel('oliehub-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as any;
          if (payload.eventType === 'INSERT' && newMessage.conversation_id === selectedConversationId) {
            // Fix: Object literal matches V3 Message type (uses created_at instead of timestamp)
            setMessages(prev => [...prev, {
              id: newMessage.id,
              conversation_id: newMessage.conversation_id,
              content: newMessage.content,
              type: newMessage.type,
              direction: newMessage.direction,
              sender_id: newMessage.sender_id,
              read: newMessage.read,
              created_at: newMessage.created_at
            }]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, fetchConversations]);

  /**
   * Efeito para carregar mensagens quando a seleção muda
   */
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, fetchMessages]);

  return {
    conversations,
    messages,
    isLoading,
    error,
    sendMessage,
    refreshConversations: fetchConversations
  };
}
