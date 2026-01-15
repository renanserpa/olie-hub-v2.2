import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SupabaseProvider from '../components/providers/supabase-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OlieHub V2 | Operating System',
  description: 'Sistema Unificado Ateliê Olie',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
