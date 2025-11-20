import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Soluciona Remodelaciones - Conectamos clientes con profesionales',
  description: 'Plataforma para encontrar y contratar profesionales de remodelación en Colombia',
  keywords: ['remodelación', 'construcción', 'profesionales', 'Colombia', 'servicios'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
