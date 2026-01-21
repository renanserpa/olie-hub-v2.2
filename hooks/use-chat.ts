
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase as globalSupabase } from '../lib/supabase.ts';
import { Conversation, Message, ConvoStatus } from '../types/index.ts';

export function useChat(selectedConversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!globalSupabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await globalSupabase
        .from('conversations')
        .select(`
          id, status, sales_stage, assignee_id, last_message, last_message_at, unread_count, customer_id,
          customer:customers (*)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      if (mounted.current) setConversations((data || []) as unknown as Conversation[]);
    } catch (err: any) {
      if (mounted.current) setError("Erro na conexão com Supabase.");
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    
    if (!globalSupabase) return;

    const channel = globalSupabase
      .channel('global-chat-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
         fetchConversations();
      })
      .subscribe();

    return () => { globalSupabase.removeChannel(channel); };
  }, [selectedConversationId, fetchConversations]);

  const sendMessage = async (content: string) => {
    if (!selectedConversationId || !content?.trim() || !globalSupabase) return;
    
    const now = new Date().toISOString();
    const tempMsg: any = { id: Math.random().toString(), content, direction: 'outbound', created_at: now };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await globalSupabase.from('messages').insert([{
        conversation_id: selectedConversationId,
        content,
        direction: 'outbound',
        read: true
      }]);
    } catch (err) {}
  };

  return { 
    conversations, 
    messages, 
    isLoading, 
    error, 
    sendMessage,
    loadMoreMessages: () => {},
    isFetchingHistory: false,
    hasMore: false,
    updateConversationStatus: async (id: string, status: ConvoStatus) => {
      if (!globalSupabase) return;
      try {
        await globalSupabase.from('conversations').update({ status }).eq('id', id);
        fetchConversations();
      } catch (err) {}
    },
    transferConversation: async (id: string, agentId: string) => {
      if (!globalSupabase) return;
      try {
        await globalSupabase.from('conversations').update({ assignee_id: agentId }).eq('id', id);
        fetchConversations();
      } catch (err) {}
    }
  };
}
