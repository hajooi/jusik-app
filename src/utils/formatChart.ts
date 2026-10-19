/**
 * jusik.app 전역 차트 공통 포맷터 및 나이스 넘버 눈금 유틸리티
 */

/**
 * 천 단위 쉼표가 들어간 원화 기본 포맷터
 * 예: 1234567 ➔ "1,234,567원"
 */
export const won = (n: number): string => `${Math.round(n).toLocaleString('ko-KR')}원`;

/**
 * 차트 Y축 전용 금융권 표준 단위 축약 포맷터 (토스/트레이딩뷰 스타일)
 * - 1억 이상: 1억 원, 1.5억 원, 12억 원, 100억 원 등 (소수점 1~2자리 정제 및 천 단위 쉼표, '억 원')
 * - 1만 이상: 500만 원, 1,000만 원, 2,500만 원 등 (만 단위 반올림 및 천 단위 쉼표, '만 원')
 * - 1만 미만: 0원, 5,000원, 50만 원 등 ('원')
 */
export const formatChartWon = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 100000000) {
    const eok = abs / 100000000;
    const rounded = Math.round(eok * 10) / 10;
    const formatted = rounded >= 1000 ? Math.round(rounded).toLocaleString('ko-KR') : String(rounded);
    return `${sign}${formatted}억 원`;
  }
  if (abs >= 10000) {
    const man = Math.round(abs / 10000);
    return `${sign}${man.toLocaleString('ko-KR')}만 원`;
  }
  return `${sign}${Math.round(abs).toLocaleString('ko-KR')}원`;
};

/**
 * 금융 차트 Y축 전용 '나이스 넘버(Nice Numbers)' 눈금 값 계산기
 * 사람이 직관적으로 읽기 편한 딱 떨어지는 단위(500만, 1,000만, 2,000만, 5,000만, 1억, 2억 등)로
 * min과 max 사이의 정갈한 눈금 값 배열을 반환합니다.
 */
export function getNiceTicks(minVal: number, maxVal: number, targetTicks = 3): number[] {
  const range = maxVal - minVal;
  if (range <= 0) return [minVal];

  const roughStep = range / targetTicks;

  // 사람이 읽기 편한 친숙한 단위 스텝 후보군 (원 단위)
  const niceSteps = [
    500000,       // 50만
    1000000,      // 100만
    2000000,      // 200만
    3000000,      // 300만
    5000000,      // 500만
    10000000,     // 1,000만
    20000000,     // 2,000만
    25000000,     // 2,500만
    30000000,     // 3,000만
    50000000,     // 5,000만
    75000000,     // 7,500만
    100000000,    // 1억
    150000000,    // 1.5억
    200000000,    // 2억
    250000000,    // 2.5억
    300000000,    // 3억
    500000000,    // 5억
    1000000000,   // 10억
    2000000000,   // 20억
    5000000000,   // 50억
    10000000000,  // 100억
  ];

  let step = niceSteps.find((s) => s >= roughStep);
  if (!step) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    step = Math.ceil(roughStep / magnitude) * magnitude;
  }

  // 눈금 시작점: minVal보다 크거나 같은 첫 step 배수
  const firstTick = Math.ceil(minVal / step) * step;
  const ticks: number[] = [];
  for (let val = firstTick; val <= maxVal; val += step) {
    ticks.push(val);
  }

  // 눈금이 너무 적으면 (1개 이하) 한 단계 작은 step으로 재시도
  if (ticks.length <= 1) {
    const stepIdx = niceSteps.indexOf(step);
    const smallerStep = stepIdx > 0 ? niceSteps[stepIdx - 1] : step / 2;
    const newFirst = Math.ceil(minVal / smallerStep) * smallerStep;
    const newTicks: number[] = [];
    for (let val = newFirst; val <= maxVal; val += smallerStep) {
      newTicks.push(val);
    }
    if (newTicks.length > 0) return newTicks;
    return [minVal, maxVal];
  }

  return ticks;
}
