
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

// Injeção de compatibilidade global
if (typeof window !== 'undefined') {
  (globalThis as any).process = (window as any).process || { env: {} };
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
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPath]);

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
      console.error("Erro na renderização da página:", err);
      return <div className="p-20 text-center font-serif italic text-stone-400">Falha ao carregar o módulo. Verifique as configurações.</div>;
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
  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (err) {
    console.error("Erro fatal ao iniciar React:", err);
  }
}
