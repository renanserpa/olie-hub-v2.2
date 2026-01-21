
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getSupabase } from '../../lib/supabase.ts';
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
      const client = getSupabase();
      
      if (!client) {
        if (mounted.current) setIsLoading(false);
        return;
      }

      // Timer de segurança de 2.5 segundos
      const safetyTimer = setTimeout(() => {
        if (isLoading && mounted.current) {
          console.warn("[OlieHub] Conexão lenta. Liberando UI.");
          setIsLoading(false);
        }
      }, 2500);

      try {
        const { data: { session } } = await client.auth.getSession();
        
        if (session && mounted.current) {
          setUser(session.user);
          const { data: profileData } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData && mounted.current) {
            setProfile(profileData as UserProfile);
          }
        }
      } catch (err) {
        console.error("Erro na inicialização de autenticação:", err);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted.current) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => { mounted.current = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F6]">
        <div className="w-10 h-10 border-2 border-olie-500/20 border-t-olie-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Context.Provider value={{ supabase: getSupabase(), user, profile, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) return { supabase: null, user: null, profile: null, isLoading: false };
  return context;
}
