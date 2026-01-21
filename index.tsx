
import './lib/env-polyfill.ts';
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout.tsx';
import DashboardPage from './app/page.tsx';
import InboxPage from './app/inbox/page.tsx';
import PedidosPage from './app/pedidos/page.tsx';
import ClientesPage from './app/clientes/page.tsx';
import SettingsPage from './app/settings/page.tsx';
import ProductionPage from './app/production/page.tsx';
import DebugPage from './app/admin/debug/page.tsx';

// Garantia absoluta de que window.process existe no entry-point
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
}

const normalizePath = (hash: string): string => {
  const clean = hash.replace(/^#/, '').split('?')[0];
  if (!clean || clean === '' || clean === '/') return '/dashboard';
  return clean.startsWith('/') ? clean : `/${clean}`;
};

const App = () => {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.hash));
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const nextPath = normalizePath(window.location.hash);
      if (nextPath === currentPath) return;
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
      setIsNavigating(true);
      navigationTimer.current = window.setTimeout(() => {
        setCurrentPath(nextPath);
        setTimeout(() => setIsNavigating(false), 50);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 250);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
    };
  }, [currentPath]);

  useEffect(() => {
    const env = (window as any).process?.env || {};
    const hasEnvVars = !!env.NEXT_PUBLIC_SUPABASE_URL && !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasLocalStorage = !!localStorage.getItem('olie_supabase_url') && !!localStorage.getItem('olie_supabase_key');
    
    const isConfigured = hasEnvVars || hasLocalStorage;
      
    const path = normalizePath(window.location.hash);
    
    // Se não houver configuração, força ir para settings para que o usuário possa configurar localmente
    if (!isConfigured && path !== '/settings') {
      window.location.hash = '/settings';
    } else if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      window.location.hash = '/dashboard';
    }
  }, []);

  const renderPage = () => {
    try {
      if (currentPath === '/settings') return <SettingsPage />;
      if (currentPath === '/admin/debug') return <DebugPage />;
      if (currentPath === '/inbox' || currentPath.startsWith('/inbox/')) return <InboxPage />;
      if (currentPath === '/pedidos' || currentPath.startsWith('/pedidos/')) return <PedidosPage />;
      if (currentPath === '/production' || currentPath.startsWith('/production/')) return <ProductionPage />;
      if (currentPath === '/clientes' || currentPath.startsWith('/clientes/')) return <ClientesPage />;
      return <DashboardPage />;
    } catch (err) {
      console.error("Erro crítico na renderização da página:", err);
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
           <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">!</div>
           <h2 className="font-serif italic text-2xl text-stone-800">Falha no Carregamento do Módulo</h2>
           <p className="text-sm text-stone-400 max-w-md italic">
             Houve um problema ao carregar este componente. Isso pode ser causado por variáveis de ambiente ausentes ou erro de sintaxe nos hooks.
           </p>
           <button onClick={() => window.location.reload()} className="px-6 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
             Tentar Recarregar
           </button>
        </div>
      );
    }
  };

  return (
    <RootLayout>
      <div className={`flex-1 flex flex-col h-full w-full min-h-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isNavigating ? 'opacity-0 translate-y-4 scale-[0.98] blur-md' : 'opacity-100 translate-y-0 scale-100 blur-0'}`}>
        {renderPage()}
      </div>
    </RootLayout>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
