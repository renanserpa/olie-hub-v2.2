
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase as supabaseInstance } from '../../lib/supabase.ts';
import { UserProfile } from '../../types/index.ts';

interface SupabaseContext {
  supabase: any;
  user: any;
  profile: UserProfile | null;
  isLoading: boolean;
}

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const initializeAuth = async () => {
      // Timeout de segurança para evitar loop infinito de loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de conexão Supabase')), 5000)
      );

      try {
        if (!supabaseInstance) {
          setIsLoading(false);
          return;
        }

        const sessionPromise = supabaseInstance.auth.getSession();
        
        // Corrida entre o carregamento da sessão e o timeout
        const { data } = (await Promise.race([sessionPromise, timeoutPromise])) as any;
        const session = data?.session;
        
        if (session && mounted.current) {
          setUser(session.user);
          const { data: profileData } = await supabaseInstance
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && mounted.current) {
            setProfile(profileData as UserProfile);
          }
        }
      } catch (err) {
        console.warn("OlieHub: Operando em modo offline ou restrito. Detalhes:", err);
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    let authSubscription: any = null;
    if (supabaseInstance) {
      const { data: { subscription } } = supabaseInstance.auth.onAuthStateChange((_event, session) => {
        if (mounted.current) {
          setUser(session?.user || null);
          if (!session) setProfile(null);
        }
      });
      authSubscription = subscription;
    }

    return () => {
      mounted.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6] z-[9999]">
        <div className="relative group">
          <div className="w-16 h-16 border-4 border-olie-500/10 border-t-olie-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-olie-500 font-serif italic font-bold text-xl select-none">O</span>
          </div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 animate-pulse">Sincronizando Workspace...</p>
      </div>
    );
  }

  return (
    <Context.Provider value={{ supabase: supabaseInstance, user, profile, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) throw new Error('useSupabase must be used inside SupabaseProvider');
  return context;
}
