
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupabaseProvider, { useSupabase } from '../components/providers/supabase-provider.tsx';
import { SearchProvider, useSearch } from '../contexts/SearchContext.tsx';
import { MainSidebar } from '../components/layout/main-sidebar.tsx';
import { Toaster, toast } from 'sonner';
import { 
  ChevronRight, Bell, Search, UserCircle, 
  ShoppingBag, Sparkles, Wifi, WifiOff, RefreshCcw 
} from 'lucide-react';
import { DatabaseService, IntegrationService } from '../services/api.ts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache
      gcTime: 1000 * 60 * 30, // 30 minutos de garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ROUTE_LABELS: Record<string, { parent: string, label: string }> = {
  '/dashboard': { parent: 'Concierge', label: 'Overview' },
  '/inbox': { parent: 'Concierge', label: 'Inbox Omnichannel' },
  '/production': { parent: 'Workflow', label: 'Bancadas de Produção' },
  '/pedidos': { parent: 'Vendas', label: 'Gestão de Pedidos' },
  '/clientes': { parent: 'CRM', label: 'Diretório de Clientes' },
  '/settings': { parent: 'Ajustes', label: 'Configurações' },
};

const PageSkeleton = () => (
  <div className="flex-1 p-10 md:p-16 space-y-12 animate-pulse overflow-hidden">
    <div className="space-y-4">
      <div className="h-4 w-48 bg-stone-200/60 rounded-full" />
      <div className="h-16 w-96 bg-stone-200/60 rounded-3xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-48 bg-white border border-stone-100 rounded-[2.5rem]" />
      ))}
    </div>
    <div className="h-96 bg-white border border-stone-100 rounded-[3rem]" />
  </div>
);

const ConnectivityStatus = () => {
  const [status, setStatus] = useState<'healthy' | 'warning' | 'error' | 'checking'>('checking');
  const { supabase } = useSupabase();

  const checkHealth = async () => {
    try {
      const [dbHealth, tinyHealth] = await Promise.all([
        DatabaseService.checkHealth(),
        IntegrationService.checkTinyHealth()
      ]);

      if (dbHealth.status === 'healthy' && tinyHealth.status === 'healthy') {
        setStatus('healthy');
      } else if (dbHealth.status === 'healthy' || tinyHealth.status === 'healthy') {
        setStatus('warning');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    healthy: { color: 'bg-emerald-500', label: 'Gateway Ativo', icon: <Wifi size={10} /> },
    warning: { color: 'bg-amber-500', label: 'Instabilidade', icon: <RefreshCcw size={10} className="animate-spin-slow" /> },
    error: { color: 'bg-rose-500', label: 'Offline', icon: <WifiOff size={10} /> },
    checking: { color: 'bg-stone-300', label: 'Checando...', icon: <RefreshCcw size={10} className="animate-spin" /> },
  }[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-full border border-stone-100 group cursor-help transition-all hover:bg-white" title="Status da infraestrutura Olie Cloud">
      <div className={`w-2 h-2 rounded-full ${config.color} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
      <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 group-hover:text-stone-600 transition-colors">
        {config.label}
      </span>
    </div>
  );
};

function LayoutContent({ children }: { children?: React.ReactNode }) {
  const { user, profile, isLoading: isAuthLoading, supabase } = useSupabase();
  const { searchTerm, setSearchTerm } = useSearch();
  const [currentPath, setCurrentPath] = useState('');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updatePath = () => {
      const hash = window.location.hash.replace('#', '').split('?')[0] || '/dashboard';
      setIsPageTransitioning(true);
      setCurrentPath(hash);
      setTimeout(() => setIsPageTransitioning(false), 400);
    };
    updatePath();
    window.addEventListener('hashchange', updatePath);
    return () => window.removeEventListener('hashchange', updatePath);
  }, []);

  useEffect(() => {
    if (!supabase || !user) return;
    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
        const newOrder = payload.new;
        const notification = {
          id: Date.now(),
          title: 'Novo Pedido!',
          desc: `Pedido #${newOrder.tiny_number || newOrder.id} de ${newOrder.customer_name || 'Cliente'}`,
          icon: <ShoppingBag size={14} className="text-olie-500" />
        };
        setNotifications(prev => [notification, ...prev]);
        toast.success(notification.title, { description: notification.desc, icon: <Sparkles size={16} className="text-olie-500" /> });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, user]);

  const breadcrumb = ROUTE_LABELS[currentPath] || ROUTE_LABELS['/dashboard'];
  const userInitials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || user?.email?.[0].toUpperCase() || 'O';

  return (
    <div className="flex flex-row h-screen w-full bg-stone-50 overflow-hidden selection:bg-olie-500/20 selection:text-olie-900">
      <MainSidebar />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-16 shrink-0 border-b border-stone-100 bg-white/60 backdrop-blur-xl flex items-center justify-between px-10 z-[60]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">{breadcrumb.parent}</span>
              <ChevronRight size={10} className="text-stone-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-olie-500 italic">{breadcrumb.label}</span>
            </div>
            <div className="h-4 w-px bg-stone-100 hidden md:block" />
            <ConnectivityStatus />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busca global..." 
                className="bg-stone-50/50 border border-stone-100 rounded-full pl-9 pr-4 py-1.5 text-[10px] font-medium outline-none focus:ring-2 focus:ring-olie-500/10 transition-all w-48" 
              />
            </div>
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className={`relative text-stone-400 hover:text-olie-500 transition-colors p-1 rounded-lg ${showNotifications ? 'bg-stone-50 text-olie-500' : ''}`}>
                <Bell size={18} strokeWidth={1.5} />
                {notifications.length > 0 && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center"><span className="text-[6px] text-white font-bold">{notifications.length}</span></div>}
              </button>
              {showNotifications && (
                <div className="absolute top-full mt-4 right-0 w-80 bg-white rounded-3xl shadow-olie-lg border border-stone-100 p-2 z-[70] animate-in slide-in-from-top-2 duration-300">
                  <div className="px-4 py-3 mb-1 border-b border-stone-50 flex justify-between items-center"><span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">Notificações</span>{notifications.length > 0 && <button onClick={() => setNotifications([])} className="text-[8px] font-black uppercase text-rose-400 hover:text-rose-600">Limpar</button>}</div>
                  <div className="max-h-64 overflow-y-auto scrollbar-hide">{notifications.length > 0 ? notifications.map(notif => (<div key={notif.id} className="p-4 hover:bg-stone-50 rounded-2xl transition-all flex gap-3 items-start group"><div className="w-8 h-8 rounded-xl bg-olie-50 flex items-center justify-center shrink-0">{notif.icon}</div><div><p className="text-[10px] font-black uppercase text-stone-800">{notif.title}</p><p className="text-[11px] text-stone-400 font-medium italic">{notif.desc}</p></div></div>)) : (<div className="p-8 text-center text-stone-300 italic text-[11px]">Nenhuma atividade recente.</div>)}</div>
                </div>
              )}
            </div>
            <div className="h-6 w-px bg-stone-100" />
            <button className="flex items-center gap-3 group px-2 py-1 rounded-xl hover:bg-stone-50 transition-all">
              <div className="text-right hidden sm:block"><p className="text-[10px] font-black uppercase text-stone-800 leading-none">{profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}</p><p className="text-[8px] font-bold text-olie-500 uppercase tracking-widest mt-1">{profile?.role || 'Membro'}</p></div>
              <div className="w-10 h-10 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-white font-serif italic text-sm shadow-md group-hover:scale-105 transition-all overflow-hidden relative">{profile?.avatar_url ? (<img src={profile.avatar_url} className="w-full h-full object-cover" />) : (<span>{userInitials}</span>)}<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-stone-900 rounded-full" /></div>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-olie-500/5 via-transparent to-transparent pointer-events-none" />
          {(isAuthLoading || isPageTransitioning) ? <PageSkeleton /> : <div className="h-full w-full overflow-hidden animate-in fade-in duration-500">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="h-screen w-full bg-stone-50 overflow-hidden font-sans">
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider>
          <SearchProvider>
            <Toaster position="top-right" expand={true} richColors closeButton />
            <LayoutContent>{children}</LayoutContent>
          </SearchProvider>
        </SupabaseProvider>
      </QueryClientProvider>
    </div>
  );
}
