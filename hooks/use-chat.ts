
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '../lib/supabase/client.ts';
import { Conversation, Message, ConvoStatus } from '../types/index.ts';
import { OmnichannelService } from '../services/api.ts';

const PAGE_SIZE = 20;

export function useChat(selectedConversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = useRef(createClient());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!localStorage.getItem('olie_supabase_key')) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.current
        .from('conversations')
        .select(`
          id, status, sales_stage, assignee_id, last_message, last_message_at, unread_count, customer_id,
          customer:customers (*)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      if (mounted.current) setConversations((data || []) as unknown as Conversation[]);
    } catch (err: any) {
      if (mounted.current) setError("Supabase não configurado ou erro de conexão.");
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    
    // Configura realtime apenas se houver chaves
    if (!localStorage.getItem('olie_supabase_key')) return;

    const channel = supabase.current
      .channel('global-chat-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
         fetchConversations();
      })
      .subscribe();

    return () => { supabase.current.removeChannel(channel); };
  }, [selectedConversationId, fetchConversations]);

  const sendMessage = async (content: string) => {
    if (!selectedConversationId || !content?.trim()) return;
    
    // Inserção local para otimismo de UI
    const now = new Date().toISOString();
    const tempMsg: any = { id: Math.random().toString(), content, direction: 'outbound', created_at: now };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await supabase.current.from('messages').insert([{
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
    // Fix: Updated updateConversationStatus to accept id and status parameters
    updateConversationStatus: async (id: string, status: ConvoStatus) => {
      try {
        await supabase.current.from('conversations').update({ status }).eq('id', id);
        fetchConversations();
      } catch (err) {}
    },
    // Fix: Updated transferConversation to accept id and agentId parameters
    transferConversation: async (id: string, agentId: string) => {
      try {
        await supabase.current.from('conversations').update({ assignee_id: agentId }).eq('id', id);
        fetchConversations();
      } catch (err) {}
    }
  };
}
