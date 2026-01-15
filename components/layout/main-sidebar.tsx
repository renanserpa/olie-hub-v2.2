"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  MessageCircle, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useSupabase } from '../providers/supabase-provider';

const navItems = [
  { name: 'Concierge', path: '/', icon: LayoutDashboard },
  { name: 'Atendimento', path: '/inbox', icon: MessageCircle },
  { name: 'Pedidos', path: '/pedidos', icon: ShoppingBag },
  { name: 'Clientes', path: '/clientes', icon: Users },
];

export const MainSidebar = () => {
  const { supabase } = useSupabase();
  const [activePath, setActivePath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handleNav = (e: any) => setActivePath(e.detail.path);
    window.addEventListener('navigate', handleNav);
    return () => window.removeEventListener('navigate', handleNav);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="w-[100px] bg-[#111111] h-screen flex flex-col items-center py-12 z-50 shrink-0">
      {/* Brand Logo */}
      <div 
        onClick={() => navigateTo('/')}
        className="w-16 h-16 bg-[#C08A7D] rounded-[1.8rem] flex items-center justify-center text-white font-black text-3xl mb-20 shadow-2xl shadow-[#C08A7D]/30 relative overflow-hidden group cursor-pointer transform hover:rotate-3 transition-all duration-700"
      >
        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
        <span className="relative italic font-serif">O</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;
          return (
            <button 
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={`p-5 rounded-2xl transition-all group relative flex items-center justify-center ${
                isActive 
                  ? 'bg-[#C08A7D] text-white shadow-xl shadow-[#C08A7D]/20' 
                  : 'text-stone-600 hover:text-stone-300 hover:bg-white/5'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
              
              <div className="absolute left-[120%] px-5 py-3 bg-[#333333] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl border border-white/5 italic">
                {item.name}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="flex flex-col gap-10 mt-auto pt-10 border-t border-white/5 w-12 items-center">
        <button onClick={() => navigateTo('/settings')} className="text-stone-600 hover:text-stone-300 transition-all">
          <Settings size={22} strokeWidth={1.5} />
        </button>
        <button 
          onClick={handleLogout}
          className="text-stone-600 hover:text-rose-400 transition-all"
        >
          <LogOut size={22} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};