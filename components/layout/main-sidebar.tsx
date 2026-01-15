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
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Atendimento', href: '/chat', icon: MessageCircle },
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
    <aside className="w-20 bg-slate-900 h-screen flex flex-col items-center py-8 border-r border-slate-800 z-50">
      {/* Logo */}
      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-12 shadow-lg shadow-purple-500/20">
        O
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 flex flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`p-3 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
              }`}
              title={item.name}
            >
              <Icon size={24} />
              <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Dev Tools - Role Based */}
        {profile?.role === 'dev' && (
          <Link 
            href="/dev"
            className={`p-3 rounded-xl transition-all group relative ${
              pathname === '/dev' 
                ? 'bg-purple-900/30 text-purple-400' 
                : 'text-purple-500/50 hover:text-purple-400 hover:bg-purple-900/20'
            }`}
            title="DevTools"
          >
            <Terminal size={24} />
            <span className="absolute left-full ml-4 px-2 py-1 bg-purple-900 text-purple-100 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Dev Diagnostics
            </span>
          </Link>
        )}
      </nav>

      {/* Footer Nav */}
      <div className="flex flex-col gap-6 mt-auto">
        <Link href="/settings" className="p-3 text-slate-500 hover:text-white transition-colors">
          <Settings size={24} />
        </Link>
        <button 
          onClick={handleLogout}
          className="p-3 text-slate-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={24} />
        </button>
      </div>
    </aside>
  );
};
