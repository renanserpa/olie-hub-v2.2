
"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  Scissors,
  ChevronRight,
  Hammer
} from 'lucide-react';
import { useSupabase } from '../providers/supabase-provider.tsx';

const navItems = [
  { name: 'Concierge', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', path: '/inbox', icon: MessageSquare },
  { name: 'Produção', path: '/production', icon: Hammer },
  { name: 'Pedidos', path: '/pedidos', icon: ShoppingBag },
  { name: 'Clientes', path: '/clientes', icon: Users },
];

/**
 * Helper para normalizar o caminho do hash de forma idêntica ao index.tsx
 */
const normalizePath = (hash: string): string => {
  const clean = hash.replace(/^#/, '').split('?')[0];
  if (!clean || clean === '' || clean === '/') return '/dashboard';
  return clean.startsWith('/') ? clean : `/${clean}`;
};

export const MainSidebar = () => {
  const { supabase } = useSupabase();
  const [activePath, setActivePath] = useState(() => normalizePath(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setActivePath(normalizePath(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <aside className="w-20 bg-[#1C1917] h-full flex flex-col items-center py-8 z-[100] shrink-0 border-r border-white/5 shadow-2xl">
      {/* Brand Logo - Olie Signature */}
      <div 
        onClick={() => navigateTo('/dashboard')}
        className="w-12 h-12 bg-olie-500 rounded-2xl flex items-center justify-center text-white font-serif italic text-2xl mb-12 shadow-lg shadow-olie-500/20 cursor-pointer hover:scale-105 transition-all duration-500 group relative"
      >
        <span>O</span>
        <div className="absolute -right-2 -top-1 w-3 h-3 bg-white rounded-full border-2 border-[#1C1917] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Navigation - Bespoke Icons */}
      <nav className="flex-1 flex flex-col gap-6 w-full items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/dashboard' 
            ? activePath === '/dashboard' || activePath === '/'
            : activePath.startsWith(item.path);

          return (
            <button 
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-olie-500 text-white shadow-lg shadow-olie-500/20 scale-110' 
                  : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              
              {/* Tooltip Editorial */}
              <div className="absolute left-[130%] px-4 py-2 bg-[#292524] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-[110] shadow-2xl border border-white/5 flex items-center gap-2 font-sans">
                {item.name}
                <ChevronRight size={10} className="text-olie-500" />
              </div>

              {isActive && (
                <div className="absolute -left-4 w-1 h-6 bg-olie-500 rounded-r-full shadow-lg shadow-olie-500/40" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="flex flex-col gap-6 mt-auto pt-6 border-t border-white/5 w-12 items-center">
        <button 
          onClick={() => navigateTo('/settings')} 
          className={`p-2 transition-all duration-300 hover:scale-110 ${activePath === '/settings' ? 'text-olie-500' : 'text-stone-500 hover:text-stone-300'}`}
          title="Configurações"
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 text-stone-500 hover:text-rose-400 transition-all duration-300 hover:scale-110"
          title="Sair"
        >
          <LogOut size={20} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};
