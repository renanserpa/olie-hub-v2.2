
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
import { ENV } from './lib/env.ts';

/**
 * OlieHub Core Routing System
 * Gerencia a navegação via Hash (#) com foco em UX de luxo e performance.
 */
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

      // Inicia animação de saída
      setIsNavigating(true);
      
      navigationTimer.current = window.setTimeout(() => {
        setCurrentPath(nextPath);
        // Pequeno delay para garantir que o componente montou antes de revelar
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
    // Verificação de Bootstrap: Supabase é essencial para o OlieHub
    const isConfigured = 
      (!!localStorage.getItem('olie_supabase_url') && !!localStorage.getItem('olie_supabase_key')) || 
      (!!ENV.SUPABASE_URL && !!ENV.SUPABASE_ANON_KEY);
      
    const path = normalizePath(window.location.hash);

    if (!isConfigured && path !== '/settings') {
      window.location.hash = '/settings';
      return;
    }

    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      window.location.hash = '/dashboard';
    }
  }, []);

  // Component dispatcher ensures hooks are initialized within the correct React render cycle.
  const renderPage = () => {
    if (currentPath === '/settings') return <SettingsPage />;
    if (currentPath === '/admin/debug') return <DebugPage />;
    if (currentPath === '/inbox' || currentPath.startsWith('/inbox/')) return <InboxPage />;
    if (currentPath === '/pedidos' || currentPath.startsWith('/pedidos/')) return <PedidosPage />;
    if (currentPath === '/production' || currentPath.startsWith('/production/')) return <ProductionPage />;
    if (currentPath === '/clientes' || currentPath.startsWith('/clientes/')) return <ClientesPage />;
    return <DashboardPage />;
  };

  return (
    <RootLayout>
      <div 
        className={`
          flex-1 flex flex-col h-full w-full min-h-0 overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isNavigating 
            ? 'opacity-0 translate-y-4 scale-[0.98] blur-md' 
            : 'opacity-100 translate-y-0 scale-100 blur-0'
          }
        `}
      >
        {renderPage()}
      </div>
    </RootLayout>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
