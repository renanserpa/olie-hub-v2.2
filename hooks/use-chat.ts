"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '../lib/supabase/client';
import { Conversation, Message } from '../types/index';

const supabase = createClient();

export function useChat(selectedConversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref para evitar loops em updates de mensagens lidas
  const lastReadId = useRef<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, status, sales_stage, assignee_id, last_message, last_message_at, unread_count, customer_id,
          customer:customers (*)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data as unknown as Conversation[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    if (lastReadId.current === id) return;
    try {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', id);
      
      setConversations(prev => prev.map(c => 
        c.id === id ? { ...c, unread_count: 0 } : c
      ));
      lastReadId.current = id;
    } catch (err) {
      console.error('Erro ao marcar como lida');
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as Message[]);
    } catch (err: any) {
      console.error('Erro ao buscar mensagens:', err.message);
    }
  }, []);

  const sendMessage = async (content: string, type: any = 'text') => {
    if (!selectedConversationId || !content.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const tempId = crypto.randomUUID();
      
      // Optimistic Update
      const newMessage: Message = {
        id: tempId,
        conversation_id: selectedConversationId,
        content,
        direction: 'outbound',
        type,
        sender_id: user?.id,
        read: true,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);

      const { error: insertError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: selectedConversationId,
          content,
          direction: 'outbound',
          type,
          sender_id: user?.id || null,
          read: true
        }]);

      if (insertError) throw insertError;

      await supabase
        .from('conversations')
        .update({ 
          last_message: content, 
          last_message_at: new Date().toISOString() 
        })
        .eq('id', selectedConversationId);

    } catch (err: any) {
      console.error('Erro ao enviar:', err.message);
      // Aqui poderíamos remover a mensagem otimista em caso de erro real
    }
  };

  useEffect(() => {
    fetchConversations();
    const channel = supabase
      .channel('realtime-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        if (payload.eventType === 'INSERT' && newMessage.conversation_id === selectedConversationId) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConversationId, fetchConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      setMessages([]); // Limpa buffer para evitar flicker
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages, markAsRead]);

  return { conversations, messages, isLoading, error, sendMessage };
}