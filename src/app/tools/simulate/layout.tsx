import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '투자 전략 시뮬레이터',
  description: '과거 시장 데이터를 기반으로 대표 ETF, 개별 주식, 비트코인 등 다양한 자산의 적립식 투자 수익률, CAGR, MDD 및 하락장 방어 전략을 시뮬레이션하세요.',
  keywords: [
    '주식 백테스트',
    '투자 수익률 시뮬레이터',
    '주식 시뮬레이터',
    '포트폴리오 백테스터',
    '적립식 투자 계산기',
    '미국 주식 백테스트',
    'SPY QQQ SCHD 백테스트',
    '이동평균선 하락장 방어',
    'jusik.app',
    '주식부엉',
  ],
  alternates: {
    canonical: 'https://jusik.app/tools/simulate',
  },
  openGraph: {
    title: '투자 전략 시뮬레이터 | 주식앱',
    description: '과거 시장 데이터 기반 적립식 투자 수익률, CAGR, MDD 및 하락장 방어 전략 백테스터',
    url: 'https://jusik.app/tools/simulate',
    siteName: '주식앱',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 537,
        alt: '주식앱 - 투자 전략 시뮬레이터',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '투자 전략 시뮬레이터 | 주식앱',
    description: '과거 시장 데이터 기반 적립식 투자 수익률 및 하락장 방어 백테스터',
    images: ['/og-image.png'],
  },
};

export default function SimulateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '투자 전략 시뮬레이터',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    description: '과거 시장 데이터를 기반으로 대표 ETF, 개별 주식, 비트코인 등 다양한 자산의 적립식 투자 수익률, CAGR, MDD 및 하락장 방어 전략을 시뮬레이션하는 무료 웹 도구',
    url: 'https://jusik.app/tools/simulate',
    author: {
      '@type': 'EducationalOrganization',
      name: '주식앱 (주식부엉)',
      url: 'https://jusik.app',
      sameAs: 'https://youtube.com/@주식부엉',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      {children}
    </>
  );
}
