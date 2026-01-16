
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '../lib/supabase/client.ts';
import { Conversation, Message } from '../types/index.ts';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Initialize Supabase client safely
const supabase = createClient();
const PAGE_SIZE = 20;

export function useChat(selectedConversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for tracking state without triggering re-renders inside effects
  const lastReadId = useRef<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // --- 1. Fetch Conversations ---
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
      if (mounted.current) setError(err.message || "Failed to load conversations");
      console.warn("OlieHub: Erro ao buscar conversas (Check Supabase Connection).");
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // --- 2. Mark as Read Logic ---
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

  // --- 3. Fetch Messages (Initial Load) ---
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId || !supabase) return;
    try {
      // Fetch latest messages (Newest first strategy for pagination)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false }) // Get newest first
        .range(0, PAGE_SIZE - 1);

      if (error) throw error;
      if (mounted.current) {
        // Reverse to display oldest -> newest
        const sortedMessages = (data || []).reverse() as Message[];
        setMessages(sortedMessages);
        setHasMore((data || []).length === PAGE_SIZE);
      }
    } catch (err: any) {
      console.error('Erro ao buscar mensagens:', err.message);
    }
  }, []);

  // --- 3.1 Load More Messages (Infinite Scroll) ---
  const loadMoreMessages = async () => {
    if (!selectedConversationId || !hasMore || isFetchingHistory || !supabase) return;

    setIsFetchingHistory(true);
    try {
      const currentLength = messages.length;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: false })
        .range(currentLength, currentLength + PAGE_SIZE - 1);

      if (error) throw error;

      if (mounted.current && data) {
        const olderMessages = data.reverse() as Message[];
        setMessages(prev => [...olderMessages, ...prev]);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      if (mounted.current) setIsFetchingHistory(false);
    }
  };

  // --- 4. Send Message Action ---
  const sendMessage = async (content: string, type: Message['type'] = 'text') => {
    if (!selectedConversationId || !content?.trim() || !supabase) return;

    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const tempId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      // Optimistic UI Update
      const newMessage: Message = {
        id: tempId,
        conversation_id: selectedConversationId,
        content,
        direction: 'outbound',
        type,
        sender_id: user?.id,
        read: true,
        created_at: now
      };
      
      if (mounted.current) {
        setMessages(prev => [...prev, newMessage]);
        // Update conversation preview optimistically
        setConversations(prev => {
          const updated = prev.map(c => 
            c.id === selectedConversationId 
              ? { ...c, last_message: content, last_message_at: now }
              : c
          );
          return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
        });
      }

      // Persist to DB
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
          last_message_at: now 
        })
        .eq('id', selectedConversationId);

    } catch (err: any) {
      console.error('Erro ao enviar:', err.message);
    }
  };

  // --- 5. Realtime Subscriptions ---
  useEffect(() => {
    fetchConversations();
    
    if (!supabase) return;

    const channel = supabase
      .channel('global-chat-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload: RealtimePostgresChangesPayload<Message>) => {
        if (!payload.new || !mounted.current) return;
        const newMessage = payload.new as Message;
        
        // If the new message belongs to the currently open chat, append it
        if (payload.eventType === 'INSERT' && newMessage.conversation_id === selectedConversationId) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
        
        fetchConversations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        if (mounted.current) fetchConversations();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [selectedConversationId, fetchConversations]);

  // --- 6. Active Conversation Handling ---
  useEffect(() => {
    if (selectedConversationId) {
      // Reset state for new conversation
      setMessages([]);
      setHasMore(false); 
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    } else if (mounted.current) {
      setMessages([]);
    }
  }, [selectedConversationId, fetchMessages, markAsRead]);

  return { 
    conversations, 
    messages, 
    isLoading, 
    error, 
    sendMessage,
    loadMoreMessages, // Export new function
    isFetchingHistory, // Export loading state
    hasMore // Export availability state
  };
}
