"use client";

import React from 'react';
import './globals.css';
import SupabaseProvider from '../components/providers/supabase-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-stone-50 overflow-x-hidden">
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}