
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
      <div className="flex flex-row h-screen w-full bg-stone-50 text-stone-800 antialiased font-sans overflow-hidden selection:bg-olie-500/20 selection:text-olie-900">
        {/* Main Sidebar - Fixed Height and Width */}
        <MainSidebar />
        
        {/* Main Application Content */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-olie-500/5 via-transparent to-transparent pointer-events-none" />
          {children}
        </div>
      </div>
    </SupabaseProvider>
  );
}
