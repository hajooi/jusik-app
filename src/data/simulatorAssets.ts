export interface AssetSelectOption {
  id: string;
  label: string;
}

export interface AssetSelectGroup {
  groupLabel: string;
  options: AssetSelectOption[];
}

export const SELECT_ASSET_GROUPS: AssetSelectGroup[] = [
  {
    groupLabel: '미국 대표 지수 & 레버리지',
    options: [
      { id: 'SPY', label: 'S&P 500 (SPY)' },
      { id: 'SSO', label: '　└ S&P 500 2배 (SSO)' },
      { id: 'UPRO', label: '　└ S&P 500 3배 (UPRO)' },
      { id: 'QQQ', label: '나스닥 100 (QQQ)' },
      { id: 'QLD', label: '　└ 나스닥 100 2배 (QLD)' },
      { id: 'TQQQ', label: '　└ 나스닥 100 3배 (TQQQ)' },
      { id: 'SOXX', label: '필라델피아 반도체 (SOXX)' },
      { id: 'USD', label: '　└ 반도체 2배 (USD)' },
      { id: 'SOXL', label: '　└ 반도체 3배 (SOXL)' },
    ],
  },
  {
    groupLabel: '배당 성장',
    options: [
      { id: 'SCHD', label: '미국배당다우존스 (SCHD)' },
    ],
  },
  {
    groupLabel: '한국 대표 지수',
    options: [
      { id: 'KS200', label: '코스피 200 (KS200)' },
      { id: 'KQ150', label: '코스닥 150 (KQ150)' },
    ],
  },
  {
    groupLabel: '미국 국채',
    options: [
      { id: 'SHY', label: '미국 단기채 (SHY - 1~3년)' },
      { id: 'IEF', label: '미국 중기채 (IEF - 7~10년)' },
      { id: 'TLT', label: '미국 장기채 (TLT - 20년+)' },
    ],
  },
  {
    groupLabel: '금 & 은',
    options: [
      { id: 'GLD', label: '금 (GLD)' },
      { id: 'SLV', label: '은 (SLV)' },
    ],
  },
  {
    groupLabel: '암호화폐',
    options: [
      { id: 'BTC', label: '비트코인 (BTC)' },
      { id: 'ETH', label: '이더리움 (ETH)' },
    ],
  },
  {
    groupLabel: '미국 대표 개별주',
    options: [
      { id: 'NVDA', label: '엔비디아 (NVDA)' },
      { id: 'AAPL', label: '애플 (AAPL)' },
      { id: 'GOOGL', label: '알파벳/구글 (GOOGL)' },
      { id: 'MSFT', label: '마이크로소프트 (MSFT)' },
      { id: 'AMZN', label: '아마존 (AMZN)' },
      { id: 'TSM', label: 'TSMC (TSM)' },
      { id: 'SPCX', label: '스페이스X (SPCX)' },
      { id: 'META', label: '메타 (META)' },
      { id: 'AVGO', label: '브로드컴 (AVGO)' },
      { id: 'TSLA', label: '테슬라 (TSLA)' },
      { id: 'MU', label: '마이크론 테크놀로지 (MU)' },
      { id: 'BRK_B', label: '버크셔 해서웨이 (BRK.B)' },
      { id: 'LLY', label: '일라이 릴리 (LLY)' },
      { id: 'AMD', label: 'AMD (AMD)' },
      { id: 'JPM', label: 'JP모건 체이스 (JPM)' },
      { id: 'WMT', label: '월마트 (WMT)' },
      { id: 'V', label: '비자 (V)' },
      { id: 'ASML', label: 'ASML (ASML)' },
      { id: 'XOM', label: '엑슨모빌 (XOM)' },
      { id: 'JNJ', label: '존슨앤존슨 (JNJ)' },
    ],
  },
  {
    groupLabel: '한국 대표 개별주',
    options: [
      { id: '005930', label: '삼성전자 (005930)' },
      { id: '000660', label: 'SK하이닉스 (000660)' },
      { id: '402340', label: 'SK스퀘어 (402340)' },
      { id: '009150', label: '삼성전기 (009150)' },
      { id: '373220', label: 'LG에너지솔루션 (373220)' },
      { id: '005380', label: '현대차 (005380)' },
      { id: '207940', label: '삼성바이오로직스 (207940)' },
      { id: '105560', label: 'KB금융 (105560)' },
      { id: '032830', label: '삼성생명 (032830)' },
      { id: '028260', label: '삼성물산 (028260)' },
    ],
  },
];

/**
 * 시뮬레이터 에셋 id를 야후 파이낸스 티커 심볼로 변환
 */
export function getYahooSymbol(id: string): string {
  // 한국 주식 (6자리 숫자)
  if (/^\d{6}$/.test(id)) {
    return `${id}.KS`;
  }
  // 특수 매핑
  switch (id) {
    case 'BRK_B':
      return 'BRK-B';
    case 'BTC':
      return 'BTC-USD';
    case 'ETH':
      return 'ETH-USD';
    case 'KS200':
      return '^KS200';
    case 'KQ150':
      return '^KQ11';
    default:
      return id;
  }
}

/**
 * 라벨에서 프롬프트 주입용 깨끗한 한국어 종목명 추출
 * 예: "　└ S&P 500 2배 (SSO)" -> "S&P 500 2배"
 * 예: "엔비디아 (NVDA)" -> "엔비디아"
 * 예: "삼성전자 (005930)" -> "삼성전자"
 * 예: "미국 단기채 (SHY - 1~3년)" -> "미국 단기채"
 */
export function getCleanDisplayName(label: string): string {
  // 들여쓰기 기호 제거
  let clean = label.replace(/^[　\s]*└\s*/, '').trim();
  // 괄호 앞의 텍스트 추출
  const parenIdx = clean.indexOf('(');
  if (parenIdx > 0) {
    clean = clean.substring(0, parenIdx).trim();
  }
  return clean;
}

export interface SecretaryDropdownOption {
  id: string;
  value: string; // 야후 파이낸스 티커 (예: AAPL, 005930.KS)
  label: string; // 화면 표시 라벨 (예: 엔비디아 (NVDA))
  displayName: string; // 프롬프트 주입용 명칭 (예: 엔비디아)
  groupLabel: string; // 카테고리 그룹 (예: 미국 대표 개별주)
}

/**
 * AI 주식 비서 드롭다운용 옵션 전체 목록 생성
 */
export function getSecretaryDropdownOptions(): SecretaryDropdownOption[] {
  const result: SecretaryDropdownOption[] = [];
  for (const group of SELECT_ASSET_GROUPS) {
    for (const opt of group.options) {
      result.push({
        id: opt.id,
        value: getYahooSymbol(opt.id),
        label: opt.label.replace(/^[　\s]*└\s*/, ''), // 들여쓰기 기호 정리
        displayName: getCleanDisplayName(opt.label),
        groupLabel: group.groupLabel,
      });
    }
  }
  return result;
}
