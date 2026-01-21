
"use client";

import React, { useEffect } from 'react';
import './globals.css';
import SupabaseProvider from '../components/providers/supabase-provider.tsx';
import { MainSidebar } from '../components/layout/main-sidebar.tsx';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  useEffect(() => {
    const body = document.body;
    const olieBodyClasses = [
      'font-sans', 
      'antialiased', 
      'bg-stone-50', 
      'text-stone-800', 
      'h-full', 
      'overflow-hidden'
    ];
    body.classList.add(...olieBodyClasses);
    return () => {
      body.classList.remove(...olieBodyClasses);
    };
  }, []);

  return (
    <SupabaseProvider>
      <Toaster position="top-right" expand={true} richColors closeButton />
      <div className="flex flex-row h-screen w-full bg-stone-50 text-stone-800 antialiased font-sans overflow-hidden selection:bg-olie-500/20 selection:text-olie-900">
        <MainSidebar />
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-olie-500/5 via-transparent to-transparent pointer-events-none" />
          {children}
        </div>
      </div>
    </SupabaseProvider>
  );
}
