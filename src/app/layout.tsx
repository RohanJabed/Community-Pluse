import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CommunityPulse | Community Event & Volunteer Management Platform',
  description: 'A modern platform for community organizations to create impactful civic events, define volunteer requirements, and manage participation with ease and AI assistance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var saved = localStorage.getItem('cp_theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var theme = saved || (prefersDark ? 'dark' : 'light');
              if (theme === 'dark') document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            } catch(e) {}
          })();
        ` }} />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors`}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <Suspense fallback={<div className="h-16 w-full glass-panel" />}>
                <Navbar />
              </Suspense>
              <main className="flex-1">
                <Suspense fallback={<div className="max-w-7xl mx-auto p-8"><div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" /></div>}>
                  {children}
                </Suspense>
              </main>
              <Footer />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
