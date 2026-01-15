"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageCircle, 
  ShoppingBag, 
  Users, 
  Terminal, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useSupabase } from '../providers/supabase-provider';

const navItems = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Atendimento', href: '/inbox', icon: MessageCircle },
  { name: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
  { name: 'Clientes', href: '/clientes', icon: Users },
];

export const MainSidebar = () => {
  const pathname = usePathname();
  const { profile, supabase } = useSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="w-[88px] bg-[#111111] h-screen flex flex-col items-center py-10 border-r border-white/5 z-50 shrink-0">
      {/* Logo Olie */}
      <div className="w-14 h-14 bg-[#C08A7D] rounded-[1.6rem] flex items-center justify-center text-white font-black text-2xl mb-16 shadow-2xl shadow-[#C08A7D]/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <span className="relative">O</span>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 flex flex-col gap-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`p-4 rounded-2xl transition-all group relative flex items-center justify-center ${
                isActive 
                  ? 'bg-white/5 text-white' 
                  : 'text-stone-600 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute -left-4 w-1 h-8 bg-[#C08A7D] rounded-r-full shadow-[0_0_15px_rgba(192,138,125,0.8)] animate-in slide-in-from-left duration-300" />
              )}

              {/* Tooltip Estilizado */}
              <div className="absolute left-full ml-6 px-4 py-2 bg-[#333333] text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl border border-white/10">
                {item.name}
                {/* Arrow */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#333333] rotate-45" />
              </div>
            </Link>
          );
        })}

        {/* Dev Tools - Role Based */}
        {profile?.role === 'dev' && (
          <Link 
            href="/dev"
            className={`p-4 rounded-2xl transition-all group relative flex items-center justify-center ${
              pathname === '/dev' 
                ? 'bg-purple-900/20 text-purple-400' 
                : 'text-stone-700 hover:text-purple-400 hover:bg-purple-900/10'
            }`}
          >
            <Terminal size={22} />
          </Link>
        )}
      </nav>

      {/* Footer Nav */}
      <div className="flex flex-col gap-8 mt-auto pt-8 border-t border-white/5 w-full items-center">
        <Link href="/settings" className="p-4 text-stone-600 hover:text-white transition-all group relative">
          <Settings size={22} />
        </Link>
        <button 
          onClick={handleLogout}
          className="p-4 text-stone-600 hover:text-rose-500 transition-all group relative"
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
};