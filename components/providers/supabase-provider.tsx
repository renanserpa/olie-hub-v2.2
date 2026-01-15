"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { UserProfile } from '../../types/index';

interface SupabaseContext {
  supabase: any;
  user: any;
  profile: UserProfile | null;
  isLoading: boolean;
}

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (!supabase) throw new Error("Supabase client not initialized");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session && mounted) {
          setUser(session.user);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!profileError && profileData && mounted) {
            setProfile(profileData as UserProfile);
          }
        }
      } catch (err) {
        console.warn("OlieHub: Operando em modo de visualização ou Supabase indisponível.");
      } finally {
        if (mounted) {
          // Pequeno delay para suavizar a transição de carregamento
          setTimeout(() => setIsLoading(false), 500);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        if (!session) setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="relative group">
          <div className="w-24 h-24 border-2 border-[#C08A7D]/5 border-t-[#C08A7D] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#C08A7D] font-black text-2xl italic select-none">O</span>
          </div>
        </div>
        <div className="mt-12 text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400 animate-pulse">Iniciando Concierge Digital</p>
          <div className="w-32 h-0.5 bg-stone-100 mx-auto rounded-full overflow-hidden">
             <div className="w-full h-full bg-[#C08A7D]/30 animate-progress-olie origin-left" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Context.Provider value={{ supabase, user, profile, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) throw new Error('useSupabase must be used inside SupabaseProvider');
  return context;
}