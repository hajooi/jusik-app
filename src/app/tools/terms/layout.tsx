import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '주식 용어 퀴즈',
  description: '기초 필수 개념부터 실전 매매, 거시경제, 심화 금융까지! 단계별 실전 주식 용어 퀴즈를 풀고 나의 백분위 랭킹과 명예의 전당 뱃지를 획득해 보세요.',
  keywords: [
    '주식 용어 퀴즈',
    '주식 퀴즈',
    '주식 용어',
    '주식 기초',
    '주식 공부',
    '금융 퀴즈',
    '주식 백분위',
    'jusik.app',
  ],
  alternates: {
    canonical: 'https://jusik.app/tools/terms',
  },
  openGraph: {
    title: '주식 용어 퀴즈 | 주식앱',
    description: '기초 필수 개념부터 실전 매매·거시경제까지! 단계별 주식 용어 퀴즈 풀고 랭킹 확인하기',
    url: 'https://jusik.app/tools/terms',
    siteName: '주식앱',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 537,
        alt: '주식앱 - 주식 용어 퀴즈',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '주식 용어 퀴즈 | 주식앱',
    description: '기초 필수 개념부터 실전 매매·거시경제까지! 단계별 주식 용어 퀴즈 풀고 랭킹 확인하기',
    images: ['/og-image.png'],
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
