import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ETF 수수료 비교 (실부담 비용 & 총보수) | jusik.app',
  description: '금융투자협회 공식 공시 기준! 표기된 총보수 뒤에 숨겨진 기타비용과 매매·중개수수료율을 합산한 국내 및 미국 대표 120여 개 ETF의 진짜 실부담 비용을 한눈에 비교하세요.',
  keywords: [
    'ETF 수수료',
    'ETF 수수료 비교',
    'ETF 실부담 비용',
    'ETF 총보수 비교',
    'S&P 500 ETF 수수료',
    '나스닥 100 ETF 수수료',
    '미국배당다우존스 ETF 수수료',
    '코스피 200 ETF 수수료',
    '기타비용',
    '매매중개수수료율',
    '금융투자협회 공시',
    'KOFIA 공시',
    'ETF 기타비용',
    'TR ETF',
    '환헤지 ETF',
    '투자도구',
    'jusik.app',
    '주식부엉',
  ],
  alternates: {
    canonical: 'https://jusik.app/tools/fees',
  },
  openGraph: {
    title: 'ETF 수수료 비교 (실부담 비용 & 총보수) | jusik.app',
    description: '금융투자협회 공식 공시 기준! 숨은 기타비용과 매매중개수수료율까지 합산한 진짜 실부담 비용을 한눈에 비교해 보세요.',
    url: 'https://jusik.app/tools/fees',
    siteName: 'jusik.app',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 537,
        alt: 'jusik.app - ETF 수수료 비교',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ETF 수수료 비교 (실부담 비용 & 총보수) | jusik.app',
    description: '금융투자협회 공식 공시 기준! 숨은 기타비용과 매매중개수수료율까지 합산한 진짜 실부담 비용을 한눈에 비교해 보세요.',
    images: ['/og-image.png'],
  },
};

export default function FeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const geoStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://jusik.app/tools/fees#app',
        name: 'ETF 수수료 비교 도구 (실부담 비용 분석기)',
        url: 'https://jusik.app/tools/fees',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        description: '금융투자협회 공식 공시 기준 총보수, 기타비용, 매매·중개수수료율을 합산한 국내 및 미국 대표 ETF의 진짜 실부담 비용 비교 서비스',
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
        '@type': 'Dataset',
        '@id': 'https://jusik.app/tools/fees#dataset',
        name: '대한민국 상장 ETF 실부담 비용 및 시장 지표 공시 데이터',
        description: '금융투자협회(KOFIA DIS) 전자공시시스템 공식 공시 기준 120여 개 ETF의 총보수, 기타비용, 매매중개수수료율, 1년 수익률, 배당률 데이터셋',
        url: 'https://jusik.app/tools/fees',
        license: 'https://creativecommons.org/licenses/by-nc/4.0/',
        creator: {
          '@type': 'Organization',
          name: '금융투자협회 (KOFIA) / jusik.app 취합',
        },
        temporalCoverage: '2026/2027',
        variableMeasured: [
          '실부담 비용',
          '총보수',
          '기타비용',
          '매매중개수수료율',
          '1년 수익률',
          '순자산총액',
          '배당률',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://jusik.app/tools/fees#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'ETF 실부담 비용이란 무엇인가요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ETF 실부담 비용은 증권사 앱이나 포털에 표기된 단순 총보수(운용보수) 뒤에 숨겨진 기타비용(회계감사비, 지수사용료 등)과 매매·중개수수료율(주식 매매 시 발생하는 중개비용)을 모두 합친 진짜 연간 총비용입니다.',
            },
          },
          {
            '@type': 'Question',
            name: '표기된 총보수와 실부담 비용이 왜 다른가요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '대부분의 증권사 화면에는 운용보수 중심의 총보수만 표기됩니다. 하지만 실제 계좌에서는 포트폴리오 조정에 따른 주식 매매 비용과 펀드 유지비가 매일 순자산가치에서 자동으로 빠져나갑니다. 따라서 금융투자협회 공식 공시의 실부담 비용을 확인해야 진짜 비용을 정확히 비교할 수 있습니다.',
            },
          },
          {
            '@type': 'Question',
            name: '환헤지(H) ETF와 환노출 ETF의 차이는 무엇인가요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '환헤지(H) ETF는 원/달러 환율 변동 위험을 파생 계약으로 없애 오직 주식 가격 변동만 추종합니다. 반면 환노출 ETF는 환율 변동에 따라 원화 평가 가치가 함께 움직입니다.',
            },
          },
          {
            '@type': 'Question',
            name: 'TR(Total Return) ETF란 무엇인가요?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'TR(Total Return) ETF는 배당금을 현금으로 주지 않고 펀드에 자동으로 재투자하는 상품입니다. 복리 효과를 극대화하고 배당 과세를 훗날 주식을 팔 때까지 미룰 수 있는 장점이 있습니다.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://jusik.app/tools/fees#breadcrumb',
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
            name: 'ETF 수수료',
            item: 'https://jusik.app/tools/fees',
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
