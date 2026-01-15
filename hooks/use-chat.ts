
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '../lib/supabase/client.ts';
import { Conversation, Message } from '../types/index.ts';

// Safe instantiation
let supabase: any;
try {
  supabase = createClient();
} catch (e) {
  console.error("Supabase Client Init Error:", e);
}

export function useChat(selectedConversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastReadId = useRef<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, status, sales_stage, assignee_id, last_message, last_message_at, unread_count, customer_id,
          customer:customers (*)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      if (mounted.current) {
        setConversations((data || []) as unknown as Conversation[]);
      }
    } catch (err: any) {
      setError(err.message);
      console.warn("OlieHub: Erro ao buscar conversas.");
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    if (lastReadId.current === id || !id || !supabase) return;
    try {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', id);
      
      if (mounted.current) {
        setConversations(prev => prev.map(c => 
          c.id === id ? { ...c, unread_count: 0 } : c
        ));
      }
      lastReadId.current = id;
    } catch (err) {
      console.error('Erro ao marcar como lida');
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (mounted.current) {
        setMessages((data || []) as Message[]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar mensagens:', err.message);
    }
  }, []);

  const sendMessage = async (content: string, type: any = 'text') => {
    if (!selectedConversationId || !content?.trim() || !supabase) return;

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const tempId = crypto.randomUUID();
      
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
      
      if (mounted.current) {
        setMessages(prev => [...prev, newMessage]);
      }

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
    }
  };

  useEffect(() => {
    fetchConversations();
    
    if (!supabase) return;

    const channel = supabase
      .channel('realtime-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload: any) => {
        if (!payload.new || !mounted.current) return;
        const newMessage = payload.new as Message;
        if (payload.eventType === 'INSERT' && newMessage.conversation_id === selectedConversationId) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        if (mounted.current) fetchConversations();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [selectedConversationId, fetchConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    } else if (mounted.current) {
      setMessages([]);
    }
  }, [selectedConversationId, fetchMessages, markAsRead]);

  return { conversations, messages, isLoading, error, sendMessage };
}
