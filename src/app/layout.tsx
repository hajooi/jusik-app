import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'jusik.app',
  description: '주식 초보를 위한 에듀테크/핀테크 플랫폼',
  keywords: ['jusik.app', '주식부엉', '주식 초보', '주식 설명서', '자산배분', '투자 커리큘럼'],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'jusik.app',
    description: '주식 초보를 위한 에듀테크/핀테크 플랫폼',
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
      <body className="min-h-screen flex flex-col antialiased bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors">
        <Navbar />
        <main className="flex-1 pb-28">
          {children}
        </main>
        <BottomNavigation />
      </body>
    </html>
  );
}
