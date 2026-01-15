import React, { useState, useEffect, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout';
import DashboardPage from './app/page';
import InboxPage from './app/inbox/page';

const App = () => {
  const [currentPath, setCurrentPath] = useState(() => {
    // Garante que o path inicial seja limpo e seguro
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setIsNavigating(false);
    };
    
    const handleCustomNavigate = (e: any) => {
      setIsNavigating(true);
      setCurrentPath(e.detail.path);
      // Simula uma transição suave
      setTimeout(() => setIsNavigating(false), 300);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigate', handleCustomNavigate as EventListener);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleCustomNavigate as EventListener);
    };
  }, []);

  const renderPage = () => {
    // Fallback para rotas não mapeadas redirecionando para Home
    if (currentPath.startsWith('/inbox')) return <InboxPage />;
    return <DashboardPage />;
  };

  return (
    <RootLayout>
      <div className={`transition-opacity duration-500 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
        <Suspense fallback={<LoadingState />}>
          {renderPage()}
        </Suspense>
      </div>
    </RootLayout>
  );
};

const LoadingState = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
    <div className="w-12 h-12 border-2 border-[#C08A7D]/10 border-t-[#C08A7D] rounded-full animate-spin" />
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