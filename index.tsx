
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout.tsx';
import DashboardPage from './app/page.tsx';
import InboxPage from './app/inbox/page.tsx';
import PedidosPage from './app/pedidos/page.tsx';
import ClientesPage from './app/clientes/page.tsx';
import SettingsPage from './app/settings/page.tsx';
import ProductionPage from './app/production/page.tsx';

const App = () => {
  const getPathFromHash = () => {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  };

  const [currentPath, setCurrentPath] = useState(getPathFromHash);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setIsNavigating(true);
      const newPath = getPathFromHash();

      setTimeout(() => {
        setCurrentPath(newPath);
        setIsNavigating(false);
        window.scrollTo(0, 0);
      }, 250);
    };

    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) window.location.hash = '/';

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    if (currentPath.startsWith('/inbox')) return <InboxPage />;
    if (currentPath.startsWith('/pedidos')) return <PedidosPage />;
    if (currentPath.startsWith('/production')) return <ProductionPage />;
    if (currentPath.startsWith('/clientes')) return <ClientesPage />;
    if (currentPath.startsWith('/settings')) return <SettingsPage />;
    return <DashboardPage />;
  };

  return (
    <RootLayout>
      <div className={`transition-all duration-300 flex-1 flex flex-col h-full w-full min-h-0 ${isNavigating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {renderPage()}
      </div>
    </RootLayout>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
