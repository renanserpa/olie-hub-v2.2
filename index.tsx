
import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout.tsx';
import DashboardPage from './app/page.tsx';
import InboxPage from './app/inbox/page.tsx';
import PedidosPage from './app/pedidos/page.tsx';
import ClientesPage from './app/clientes/page.tsx';
import SettingsPage from './app/settings/page.tsx';
import ProductionPage from './app/production/page.tsx';

/**
 * OlieHub V2 - Main Application Entry & Hash Router
 * Gerencia a navegação entre os módulos principais sem recarregar a página.
 */
const App = () => {
  // Normaliza o hash para garantir que sempre comece com '/' e seja consistente
  const getNormalizedPath = useCallback(() => {
    if (typeof window === 'undefined') return '/';
    // Remove o '#' inicial
    let hash = window.location.hash.replace(/^#/, '');
    // Se estiver vazio, assume a raiz
    if (!hash) return '/';
    // Garante que o caminho comece com '/' para bater com as condições de renderPage
    return hash.startsWith('/') ? hash : '/' + hash;
  }, []);

  const [currentPath, setCurrentPath] = useState(getNormalizedPath());
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const newPath = getNormalizedPath();
      
      // Se o caminho não mudou (ex: cliques repetidos), ignorar
      if (newPath === currentPath) return;

      // Inicia animação de transição (saída)
      setIsNavigating(true);
      
      // Delay estratégico para sincronizar com a animação de CSS (globals.css)
      const timer = setTimeout(() => {
        setCurrentPath(newPath);
        setIsNavigating(false);
        
        // Garante que o scroll volte ao topo na mudança de página para UX consistente
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 150);

      return () => clearTimeout(timer);
    };

    // Registrar listener para mudanças de hash (navegação nativa do browser)
    window.addEventListener('hashchange', handleHashChange);
    
    // Força um hash inicial se o usuário entrar na URL limpa (ex: oliehub.com)
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '/';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPath, getNormalizedPath]);

  /**
   * Mapeamento de rotas para componentes
   * Utiliza 'startsWith' para permitir futura expansão de rotas aninhadas ou parâmetros
   */
  const renderPage = () => {
    if (currentPath.startsWith('/inbox')) return <InboxPage />;
    if (currentPath.startsWith('/pedidos')) return <PedidosPage />;
    if (currentPath.startsWith('/production')) return <ProductionPage />;
    if (currentPath.startsWith('/clientes')) return <ClientesPage />;
    if (currentPath.startsWith('/settings')) return <SettingsPage />;
    
    // Dashboard como fallback / home (Concierge)
    return <DashboardPage />;
  };

  return (
    <RootLayout>
      <div 
        className={`
          transition-all duration-300 flex-1 flex flex-col h-full w-full min-h-0
          ${isNavigating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
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
  root.render(<App />);
}
