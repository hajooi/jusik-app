import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '투자 전략 시뮬레이터 | 미국 주식 백테스트',
  description: '20년 미국 주식 실제 주가 데이터를 기반으로 SPY, QQQ, SCHD, 비트코인 등 다양한 종목의 적립식 투자 수익률, CAGR, MDD 및 하락장 방어 전략을 시뮬레이션하세요.',
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
  ],
  alternates: {
    canonical: 'https://jusik.app/tools/simulate',
  },
  openGraph: {
    title: '투자 전략 시뮬레이터 | 미국 주식 백테스트',
    description: '20년 미국 주식 실제 주가 데이터 기반 적립식 투자 수익률, CAGR, MDD 및 하락장 방어 전략 백테스터',
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
    title: '투자 전략 시뮬레이터 | 미국 주식 백테스트',
    description: '20년 미국 주식 실제 주가 데이터 기반 적립식 투자 수익률 및 하락장 방어 백테스터',
    images: ['/og-image.png'],
  },
};

export default function SimulateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
