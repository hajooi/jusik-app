import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '투자 성향 진단 | 주식앱',
  description: '손실 위험 감수 성향부터 투자 목표까지! 40문항으로 알아보는 나의 주식 투자 성향과 맞춤형 위험 관리법 진단',
  keywords: [
    '투자 성향 진단',
    '주식 MBTI',
    '투자 스타일',
    '주식 성향 테스트',
    '투자 위험 감수도',
    '포트폴리오 추천',
    'jusik.app',
  ],
  alternates: {
    canonical: 'https://jusik.app/tools/type',
  },
  openGraph: {
    title: '투자 성향 진단 | 주식앱',
    description: '40문항으로 알아보는 나의 주식 투자 성향과 맞춤형 위험 관리법 진단',
    url: 'https://jusik.app/tools/type',
    siteName: '주식앱',
    images: [
      {
        url: 'https://jusik.app/og-image.png',
        width: 1200,
        height: 630,
        alt: '투자 성향 진단 | 주식앱',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '투자 성향 진단 | 주식앱',
    description: '40문항으로 알아보는 나의 주식 투자 성향과 맞춤형 위험 관리법 진단',
    images: ['https://jusik.app/og-image.png'],
  },
};

export default function TypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}



