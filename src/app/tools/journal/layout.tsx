import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '나의 투자일지',
  description: '계좌별 목표 비율을 정하고, 같은 자산군 종목의 보유 수량을 합쳐 이번에 몇 주를 사야 하는지 자동으로 계산해 보세요.',
  alternates: {
    canonical: 'https://jusik.app/tools/journal',
  },
  openGraph: {
    title: '나의 투자일지 | jusik.app',
    description: '계좌별 목표 비율과 구매 수량 자동 계산',
    url: 'https://jusik.app/tools/journal',
    siteName: 'jusik.app',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
