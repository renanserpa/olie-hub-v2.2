
"use client";

import React from 'react';
import SupabaseProvider from '../components/providers/supabase-provider.tsx';
import { MainSidebar } from '../components/layout/main-sidebar.tsx';

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <SupabaseProvider>
      <div className="flex flex-row h-full w-full bg-background text-stone-800 antialiased font-sans overflow-hidden selection:bg-olie-500 selection:text-white">
        {/* Sidebar fixa à esquerda */}
        <MainSidebar />
        
        {/* Container principal que ocupa o resto do espaço */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          {children}
        </div>
      </div>
    </SupabaseProvider>
  );
}
