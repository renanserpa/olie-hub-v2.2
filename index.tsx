
import React, { useState, useEffect, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './app/globals.css'; // Import Global CSS
import RootLayout from './app/layout.tsx';
import DashboardPage from './app/page.tsx';
import InboxPage from './app/inbox/page.tsx';
import PedidosPage from './app/pedidos/page.tsx';
import ClientesPage from './app/clientes/page.tsx';
import SettingsPage from './app/settings/page.tsx';
import ProductionPage from './app/production/page.tsx';

const App = () => {
  // Função auxiliar para pegar a rota limpa do hash (ex: #/inbox -> /inbox)
  const getPathFromHash = () => {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  };

  const [currentPath, setCurrentPath] = useState(getPathFromHash);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      // Inicia a animação de saída
      setIsNavigating(true);
      
      const newPath = getPathFromHash();

      // Aguarda a transição antes de trocar o componente
      setTimeout(() => {
        setCurrentPath(newPath);
        setIsNavigating(false);
        window.scrollTo(0, 0);
      }, 300);
    };

    // Escuta nativa de mudança de hash (funciona com botões voltar/avançar)
    window.addEventListener('hashchange', handleHashChange);
    
    // Tratamento inicial caso a URL já venha com hash
    if (!window.location.hash) {
       window.location.hash = '/';
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
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
      <div className={`transition-opacity duration-300 h-full ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
        <Suspense fallback={<LoadingState />}>
          {renderPage()}
        </Suspense>
      </div>
    </RootLayout>
  );
};

const LoadingState = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
    <div className="relative">
      <div className="w-16 h-16 border-2 border-olie-300/10 border-t-olie-500 rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-olie-500 font-serif italic font-black text-xl">O</span>
      </div>
    </div>
  </div>
);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
