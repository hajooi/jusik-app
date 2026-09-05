import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '마켓 인사이트',
  description: '오늘의 미국 증시 날씨부터 주간 결산 브리핑, 주요 경제 지표 및 실적 발표 증시 캘린더까지 한눈에 확인하세요.',
  keywords: [
    '마켓 인사이트',
    '증시 캘린더',
    '미국 증시 일정',
    '주간 증시 브리핑',
    '미국 주식 실적 발표',
    '경제 지표 발표 일정',
    '주식 날씨',
    'jusik.app',
  ],
  alternates: {
    canonical: 'https://jusik.app/tools/market',
  },
  openGraph: {
    title: '마켓 인사이트 | 주식앱',
    description: '오늘의 미국 증시 날씨부터 주간 결산 브리핑, 주요 경제 지표 및 실적 발표 증시 캘린더까지 한눈에 확인하세요.',
    url: 'https://jusik.app/tools/market',
    siteName: '주식앱',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 537,
        alt: '주식앱 - 마켓 인사이트',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '마켓 인사이트 | 주식앱',
    description: '오늘의 미국 증시 날씨부터 주간 결산 브리핑, 주요 경제 지표 및 실적 발표 증시 캘린더까지 한눈에 확인하세요.',
    images: ['/og-image.png'],
  },
};

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
