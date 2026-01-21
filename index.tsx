
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout.tsx';

// Importação das Páginas (Módulos de Domínio)
import DashboardPage from './app/page.tsx';
import InboxPage from './app/inbox/page.tsx';
import ProductionPage from './app/production/page.tsx';
import PedidosPage from './app/pedidos/page.tsx';
import ClientesPage from './app/clientes/page.tsx';
import SettingsPage from './app/settings/page.tsx';

const STORAGE_KEY = 'olie_last_path';

/**
 * Normalizador de Rotas para o Sistema OlieHub
 */
const getNormalizedPath = () => {
  const hash = window.location.hash.replace('#', '').split('?')[0];
  
  if (!hash || hash === '/' || hash === '') {
    // Tenta recuperar do storage antes de cair no dashboard
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || '/dashboard';
  }
  
  return hash.startsWith('/') ? hash : `/${hash}`;
};

/**
 * App Root & Router
 */
const App = () => {
  const [currentPath, setCurrentPath] = useState(getNormalizedPath());

  useEffect(() => {
    // Garante que o hash da URL reflita a rota normalizada no primeiro carregamento
    const initialPath = getNormalizedPath();
    if (window.location.hash !== `#${initialPath}`) {
      window.location.hash = initialPath;
    }

    const handleHashChange = () => {
      const newPath = getNormalizedPath();
      setCurrentPath(newPath);
      // Persiste a rota para o próximo refresh
      localStorage.setItem(STORAGE_KEY, newPath);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch (currentPath) {
      case '/dashboard': return <DashboardPage />;
      case '/inbox': return <InboxPage />;
      case '/production': return <ProductionPage />;
      case '/pedidos': return <PedidosPage />;
      case '/clientes': return <ClientesPage />;
      case '/settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <RootLayout>
      {renderContent()}
    </RootLayout>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
