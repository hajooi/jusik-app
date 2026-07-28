import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'jusik.app',
  description: '주식 초보를 위한 가장 쉬운 설명서',
  keywords: ['jusik.app', '주식부엉', '주식 초보', '주식 설명서', '자산배분', '투자 커리큘럼'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico', '/icon.png'],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'jusik.app',
    description: '주식 초보를 위한 가장 쉬운 설명서',
    type: 'website',
  },
};

import BottomNavigation from '@/components/BottomNavigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col antialiased bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors relative selection:bg-[var(--accent-orange)]/20 selection:text-[var(--accent-orange)]">
        {/* Modern AI SaaS Radial Mesh Glow Background */}
        <div 
          className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[550px] sm:w-[1200px] sm:h-[650px] pointer-events-none z-0 opacity-85 blur-[100px] sm:blur-[130px]"
          style={{
            background: 'radial-gradient(circle at 50% 30%, var(--glow-color) 0%, var(--glow-color-secondary) 50%, transparent 80%)',
          }}
          aria-hidden="true"
        />
        <div 
          className="fixed bottom-[-50px] right-[-50px] w-[600px] h-[500px] pointer-events-none z-0 opacity-55 blur-[110px]"
          style={{
            background: 'radial-gradient(circle at 75% 75%, var(--glow-color-secondary) 0%, var(--glow-color) 50%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-28">
            {children}
          </main>
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
