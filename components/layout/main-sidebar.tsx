
"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  MessageCircle, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  Scissors
} from 'lucide-react';
import { useSupabase } from '../providers/supabase-provider.tsx';

const navItems = [
  { name: 'Concierge', path: '/', icon: LayoutDashboard },
  { name: 'Inbox', path: '/inbox', icon: MessageCircle },
  { name: 'Produção', path: '/production', icon: Scissors },
  { name: 'Pedidos', path: '/pedidos', icon: ShoppingBag },
  { name: 'Clientes', path: '/clientes', icon: Users },
];

export const MainSidebar = () => {
  const { supabase } = useSupabase();
  
  const getHashPath = () => {
    if (typeof window === 'undefined') return '/';
    return window.location.hash.replace('#', '') || '/';
  };

  const [activePath, setActivePath] = React.useState(getHashPath());

  React.useEffect(() => {
    const handleHashChange = () => setActivePath(getHashPath());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="w-[100px] bg-[#111111] h-full flex flex-col items-center py-10 z-[100] shrink-0 border-r border-white/5">
      {/* Brand Logo */}
      <div 
        onClick={() => navigateTo('/')}
        className="w-14 h-14 bg-[#C08A7D] rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-10 shadow-xl shadow-[#C08A7D]/20 relative overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-500"
      >
        <span className="relative italic font-serif">O</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-6 w-full items-center px-2 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path || (item.path !== '/' && activePath.startsWith(item.path));
          return (
            <button 
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={`p-4 rounded-2xl transition-all duration-300 group relative flex items-center justify-center w-12 h-12 ${
                isActive 
                  ? 'bg-[#C08A7D] text-white shadow-lg shadow-[#C08A7D]/20 scale-110' 
                  : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              
              <div className="absolute left-[120%] px-4 py-2 bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-[110] shadow-2xl border border-white/5">
                {item.name}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="flex flex-col gap-6 mt-auto pt-6 border-t border-white/5 w-12 items-center">
        <button 
          onClick={() => navigateTo('/settings')} 
          className={`p-2 transition-all duration-300 hover:scale-110 ${activePath === '/settings' ? 'text-[#C08A7D]' : 'text-stone-500 hover:text-stone-300'}`}
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 text-stone-500 hover:text-rose-400 transition-all duration-300 hover:scale-110"
        >
          <LogOut size={20} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};
