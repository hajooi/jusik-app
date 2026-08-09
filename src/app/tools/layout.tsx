import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '투자 도구 모음 | 성향 진단 & 투자 수익률 시뮬레이터',
  description: '투자 성향 진단부터 20년 백테스트 시뮬레이션까지! 초보 투자자를 돕는 맞춤형 주식 투자 도구 모음입니다.',
  keywords: [
    '주식 투자 도구',
    '투자 성향 진단',
    '투자 수익률 시뮬레이터',
    '주식 백테스트',
    'jusik.app',
  ],
  alternates: {
    canonical: 'https://jusik.app/tools',
  },
  openGraph: {
    title: '투자 도구 모음 | 주식앱',
    description: '초보 투자자를 돕는 맞춤형 주식 투자 도구 모음',
    url: 'https://jusik.app/tools',
    siteName: '주식앱',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '투자 도구 모음 | 주식앱',
    description: '초보 투자자를 돕는 맞춤형 주식 투자 도구 모음',
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
