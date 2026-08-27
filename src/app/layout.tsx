import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNavigation from '@/components/BottomNavigation';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://jusik.app'),
  title: {
    default: '주식앱',
    template: '%s | 주식앱',
  },
  description: '기초부터 차근차근 배우는 단계별 주식 강좌와 실전 투자를 돕는 투자 도구 플랫폼! 주식 초보를 위한 가장 쉬운 설명서',
  keywords: [
    '주식앱',
    'jusik.app',
    '주식 초보',
    '주식 설명서',
    '주식 기초',
    '주식 공부',
    '투자 도구',
    '주식 계산기',
    '미국 주식',
    '주식 모으기',
    '주식부엉',
  ],
  authors: [{ name: 'jusik.app' }],
  creator: 'jusik.app',
  publisher: 'jusik.app',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://jusik.app',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-precomposed.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: '주식앱',
    description: '단계별 주식 강좌와 실전 투자를 돕는 투자 도구 모음 플랫폼',
    url: 'https://jusik.app',
    siteName: '주식앱',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 537,
        alt: '주식앱 - 주식 초보를 위한 가장 쉬운 설명서',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '주식앱',
    description: '단계별 주식 강좌와 실전 투자를 돕는 투자 도구 모음 플랫폼',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'naver-site-verification': '54c4e23bb6d3b18bbcc1924f9f8969f9723e9d63',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '주식앱',
    alternateName: ['jusik.app', '주식 앱'],
    url: 'https://jusik.app',
    description: '주식 초보를 위한 가장 쉬운 설명서',
    inLanguage: 'ko-KR',
  };

  return (
    <html lang="ko">
      <head>
        <meta name="naver-site-verification" content="54c4e23bb6d3b18bbcc1924f9f8969f9723e9d63" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon-precomposed.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="주식앱" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors relative selection:bg-[var(--accent-orange)]/20 selection:text-[var(--accent-orange)]">
        {/* Modern Crisp Mesh Glow Background */}
        <div 
          className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[800px] h-[480px] sm:w-[1100px] sm:h-[550px] pointer-events-none z-0 opacity-60 dark:opacity-40 blur-[60px] sm:blur-[90px]"
          style={{
            background: 'radial-gradient(circle at 50% 30%, var(--glow-color) 0%, var(--glow-color-secondary) 45%, transparent 75%)',
          }}
          aria-hidden="true"
        />
        <div 
          className="fixed bottom-[-60px] right-[-60px] w-[500px] h-[450px] pointer-events-none z-0 opacity-35 dark:opacity-25 blur-[60px]"
          style={{
            background: 'radial-gradient(circle at 70% 70%, var(--glow-color-secondary) 0%, var(--glow-color) 50%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <BottomNavigation />
        </AuthProvider>
      </body>
    </html>
  );
}

