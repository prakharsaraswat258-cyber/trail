import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Penga — Unified Lost & Found Feed',
  description: 'AI-powered community lost and found match engine. Every item found. Every report resolved.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${inter.variable}`}>
      <body className="min-h-screen bg-canvas text-text-primary antialiased selection:bg-accent-light selection:text-accent">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
