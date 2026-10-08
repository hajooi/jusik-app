import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '투자 도구',
  description: '투자 성향 진단부터 20년 백테스트 시뮬레이션까지! 초보 투자자를 돕는 맞춤형 주식 투자 도구 모음입니다.',
  keywords: [
    '주식 투자 도구',
    '투자 성향 진단',
    '투자 수익률 시뮬레이터',
    '주식 백테스트',
    'jusik.app',
    '주식부엉',
  ],
  alternates: {
    canonical: 'https://jusik.app/tools',
  },
  openGraph: {
    title: '투자 도구 | 주식앱',
    description: '초보 투자자를 돕는 맞춤형 주식 투자 도구 모음',
    url: 'https://jusik.app/tools',
    siteName: '주식앱',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 537,
        alt: '주식앱 - 투자 도구 모음',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '투자 도구 | 주식앱',
    description: '초보 투자자를 돕는 맞춤형 주식 투자 도구 모음',
    images: ['/og-image.png'],
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const toolsCollectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '주식앱 실전 투자 도구 모음',
    description: '투자 성향 진단부터 20년 백테스트 시뮬레이션까지! 초보 투자자를 돕는 맞춤형 주식 투자 도구 모음입니다.',
    url: 'https://jusik.app/tools',
    hasPart: [
      {
        '@type': 'WebApplication',
        name: '투자 전략 시뮬레이터',
        url: 'https://jusik.app/tools/simulate',
      },
      {
        '@type': 'WebApplication',
        name: '투자 성향 진단',
        url: 'https://jusik.app/tools/type',
      },
      {
        '@type': 'WebApplication',
        name: '주식 용어 퀴즈',
        url: 'https://jusik.app/tools/terms',
      },
      {
        '@type': 'WebApplication',
        name: '마켓 인사이트',
        url: 'https://jusik.app/tools/market',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsCollectionJsonLd) }}
      />
      {children}
    </>
  );
}
