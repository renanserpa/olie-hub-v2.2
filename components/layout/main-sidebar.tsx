
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
    <aside className="w-[100px] bg-[#111111] h-screen flex flex-col items-center py-12 z-50 shrink-0">
      {/* Brand Logo */}
      <div 
        onClick={() => navigateTo('/')}
        className="w-16 h-16 bg-[#C08A7D] rounded-[1.8rem] flex items-center justify-center text-white font-black text-3xl mb-12 shadow-2xl shadow-[#C08A7D]/30 relative overflow-hidden group cursor-pointer transform hover:rotate-3 transition-all duration-700"
      >
        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
        <span className="relative italic font-serif">O</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-8 overflow-y-auto scrollbar-hide w-full items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path || (item.path !== '/' && activePath.startsWith(item.path));
          return (
            <button 
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={`p-4 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group relative flex items-center justify-center w-14 h-14 ${
                isActive 
                  ? 'bg-[#C08A7D] text-white shadow-xl shadow-[#C08A7D]/20 scale-110 opacity-100' 
                  : 'text-stone-600 hover:text-stone-300 hover:bg-white/5 hover:scale-105 opacity-60 hover:opacity-100'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              
              <div className="absolute left-[120%] px-5 py-3 bg-[#333333] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl border border-white/5 italic">
                {item.name}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="flex flex-col gap-8 mt-auto pt-8 border-t border-white/5 w-12 items-center">
        <button onClick={() => navigateTo('/settings')} className={`transition-all duration-300 hover:scale-110 ${activePath === '/settings' ? 'text-[#C08A7D] scale-110' : 'text-stone-600 hover:text-stone-300 opacity-60 hover:opacity-100'}`}>
          <Settings size={22} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleLogout}
          className="text-stone-600 hover:text-rose-400 transition-all duration-300 hover:scale-110 opacity-60 hover:opacity-100"
        >
          <LogOut size={22} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};
