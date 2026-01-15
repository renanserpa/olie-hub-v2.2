
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client.ts';
import { UserProfile } from '../../types/index.ts';

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
        if (!supabase) return;
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        const session = data?.session;
        
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
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        if (!session) setProfile(null);
      }
    });

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
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
