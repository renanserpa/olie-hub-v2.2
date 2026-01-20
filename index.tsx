
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout.tsx';
import DashboardPage from './app/page.tsx';
import InboxPage from './app/inbox/page.tsx';
import PedidosPage from './app/pedidos/page.tsx';
import ClientesPage from './app/clientes/page.tsx';
import SettingsPage from './app/settings/page.tsx';
import ProductionPage from './app/production/page.tsx';

/**
 * OlieHub Core Routing - Normalização de Hash robusta
 * Garante paridade entre as rotas configuradas e a URL do navegador.
 */
const normalizePath = (hash: string): string => {
  const clean = hash.replace(/^#/, '').split('?')[0];
  if (!clean || clean === '' || clean === '/') return '/';
  return clean.startsWith('/') ? clean : `/${clean}`;
};

const App = () => {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.hash));
  const [isNavigating, setIsNavigating] = useState(false);

  // Listener para mudanças na navegação
  useEffect(() => {
    const handleHashChange = () => {
      const nextPath = normalizePath(window.location.hash);
      
      if (nextPath === currentPath) return;

      setIsNavigating(true);
      
      // Delay de 200ms para permitir a transição de saída do CSS
      const timer = setTimeout(() => {
        setCurrentPath(nextPath);
        setIsNavigating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);

      return () => clearTimeout(timer);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPath]);

  // Redirecionamentos de segurança e estado inicial
  useEffect(() => {
    const isConfigured = !!localStorage.getItem('olie_supabase_url');
    const path = normalizePath(window.location.hash);

    // Se não houver configuração, força a ida para Settings
    if (!isConfigured && path !== '/settings') {
      window.location.hash = '/settings';
      return;
    }

    // Normaliza a rota raiz caso esteja vazio
    if (window.location.hash === '' || window.location.hash === '#') {
      window.location.hash = '/';
    }
  }, []);

  // Dispatcher de Componentes por Rota
  const PageContent = useMemo(() => {
    const path = currentPath;
    
    if (path === '/settings') return <SettingsPage />;
    if (path === '/inbox' || path.startsWith('/inbox/')) return <InboxPage />;
    if (path === '/pedidos' || path.startsWith('/pedidos/')) return <PedidosPage />;
    if (path === '/production' || path.startsWith('/production/')) return <ProductionPage />;
    if (path === '/clientes' || path.startsWith('/clientes/')) return <ClientesPage />;
    if (path === '/') return <DashboardPage />;
    
    // Fallback editorial para o dashboard
    return <DashboardPage />;
  }, [currentPath]);

  return (
    <RootLayout>
      <div 
        className={`
          flex-1 flex flex-col h-full w-full min-h-0 overflow-hidden
          transition-all duration-300 ease-in-out
          ${isNavigating 
            ? 'opacity-0 translate-y-4 scale-[0.99] pointer-events-none' 
            : 'opacity-100 translate-y-0 scale-100'
          }
        `}
      >
        {PageContent}
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
