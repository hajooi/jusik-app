import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '나의 투자일지 (자산배분 & 리밸런싱 계산기)',
  description: '계좌별 목표 비율과 가용 현금을 입력하면 자산 배분 비중에 맞춰 지금 사야 할 종목과 정확한 구매 수량을 자동으로 계산해 주는 스마트 포트폴리오 리밸런싱 투자일지 도구입니다.',
  keywords: [
    '투자일지',
    '주식 투자일지',
    '자산배분 계산기',
    '리밸런싱 계산기',
    '포트폴리오 리밸런싱',
    '주식 분할구매 계산기',
    '주식 거래일지',
    '포트폴리오 관리',
    '자산 배분 투자',
    '올웨더 포트폴리오',
    '영구 포트폴리오',
    '투자 기록',
    '예수금 관리',
    '비트코인 자산배분',
    '미국주식 자산배분',
    '투자도구',
    'jusik.app',
    '주식부엉',
  ],
  alternates: {
    canonical: 'https://jusik.app/tools/journal',
  },
  openGraph: {
    title: '나의 투자일지 (자산배분 & 리밸런싱 계산기) | jusik.app',
    description: '계좌별 목표 비율을 정하고 가용 현금을 넣으면 이번에 사야 할 종목과 수량을 자동으로 계산해 주는 스마트 투자일지',
    url: 'https://jusik.app/tools/journal',
    siteName: 'jusik.app',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 537,
        alt: 'jusik.app - 나의 투자일지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '나의 투자일지 (자산배분 & 리밸런싱 계산기) | jusik.app',
    description: '계좌별 목표 비율을 정하고 가용 현금을 넣으면 이번에 사야 할 종목과 수량을 자동으로 계산해 주는 스마트 투자일지',
    images: ['/og-image.png'],
  },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  const geoStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://jusik.app/tools/journal#app',
        name: '나의 투자일지 (자산배분 & 리밸런싱 수량 계산기)',
        url: 'https://jusik.app/tools/journal',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        description: '계좌별 목표 비율과 가용 현금을 기반으로 목표 현금을 보존하면서 최적의 주식 구매 수량을 자동 산출하고 거래 내역을 기록하는 스마트 투자일지 웹 애플리케이션',
        featureList: [
          '계좌별 다중 포트폴리오 자산 배분 관리',
          '실시간 국내/해외 주식 및 가상자산 시세 연동',
          '목표 현금 보존 및 리밸런싱 구매 수량 자동 계산',
          '소수점 주식 구매 및 판매 없는 적립식 모으기 지원',
          '자산군 내 다종목 통합 관리 및 수익률 연속 시계열 분석',
          'CSV 데이터 내보내기 및 안전한 암호화 동기화',
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'KRW',
        },
        author: {
          '@type': 'EducationalOrganization',
          name: 'jusik.app (주식부엉)',
          url: 'https://jusik.app',
          sameAs: 'https://youtube.com/@주식부엉',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://jusik.app/tools/journal#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: '투자일지에서 자산 배분 리밸런싱이란 무엇인가요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '자산 배분 리밸런싱은 주식, 채권, 금, 현금 등 각 자산의 목표 비율을 정해두고, 시장 가격 변동으로 비율이 어긋났을 때 정기적으로 부족한 자산을 더 사고 넘치는 자산을 조절하여 원래의 목표 비율을 유지하는 과학적이고 안정적인 투자 방식입니다.',
            },
          },
          {
            '@type': 'Question',
            name: '주식 판매 없이 모으기만 하는 리밸런싱이 가능한가요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '네, jusik.app 나의 투자일지는 판매 없이 모으기만 옵션을 지원합니다. 보유 주식을 팔지 않고, 새로 입금된 월급이나 배당금 현금만으로 목표 비율에 미달한 자산에 집중 배분하여 목표 비중을 맞춰갈 수 있습니다.',
            },
          },
          {
            '@type': 'Question',
            name: '같은 자산군에 여러 종목을 보유한 경우 어떻게 계산되나요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '하나의 자산군(예: 국내 주식) 안에 과거에 산 종목이나 여러 파생 종목이 있더라도 전체 보유 가치를 하나로 합산하여 자산군의 현재 비중을 계산합니다. 추가 구매 시에는 설정해 둔 대표 구매 종목으로 자동 계산되어 관리가 편리합니다.',
            },
          },
          {
            '@type': 'Question',
            name: '개인 투자 기록과 계좌 정보는 안전하게 보관되나요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '네, 모든 계좌 데이터는 기본적으로 사용자의 기기 브라우저(Local Storage)에 안전하게 보관됩니다. 계정 연동 시에도 종목 및 계좌 정보는 암호화되어 안전하게 동기화되며, 언제든지 엑셀 CSV 파일로 내려받을 수 있습니다.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://jusik.app/tools/journal#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '홈',
            item: 'https://jusik.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '투자도구',
            item: 'https://jusik.app/tools',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: '나의 투자일지',
            item: 'https://jusik.app/tools/journal',
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(geoStructuredData) }}
      />
      {children}
    </>
  );
}
