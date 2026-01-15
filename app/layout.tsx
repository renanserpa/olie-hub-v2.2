"use client";

import React from 'react';
import SupabaseProvider from '../components/providers/supabase-provider.tsx';

/**
 * RootLayout - OlieHub V2 Enterprise
 * Centraliza os provedores. Os estilos são carregados via index.html para compatibilidade ESM.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 antialiased font-sans">
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </div>
  );
}