/**
 * 5대 핵심 거시경제 지표 신호등 판정 엔진 (jusik.app Cockpit Signal Engine)
 *
 * [판정 원칙 및 공신력 있는 기준]
 * 1. 신용스프레드: 최근 5년 롤링 데이터 상위 20% (80th 백분위) 이상이거나, 최근 3개월간 +0.30%p 이상 급등(기울기 튐) 시 주황 (자금경색 경계)
 * 2. 미국 기준금리: 연준 공식 중립금리(3.0%) 및 직전 변동 방향 결합. 직전 변동이 인상(+)이거나 고금리 동결 지속 시 주황 (금리 인상 기조 / 고금리 지속)
 * 3. 소비자물가: 연준 2% 목표치 기준 1.0% ~ 3.0% 구간 초록 (안정), 3.0% 초과 또는 1.0% 미만 시 주황 (물가 경계)
 * 4. 미국 실업률: 샴의 법칙(Sahm Rule, 저점 대비 +0.50%p 급증) 발동 또는 자연실업률(4.4%) 초과 시 주황 (고용 냉각)
 * 5. 기업 실적: S&P 500 TTM EPS의 추세선 기울기(전년비 증가율 YoY)가 음수로 꺾이면(실적 침체) 주황 (실적 침체)
 */

export type MacroSignalStatus = 'emerald' | 'orange';

export interface MacroSignalResult {
  status: MacroSignalStatus;
  label: string;
  detail: string;
}

export function evaluateCreditSpreadSignal(
  points: Array<{ date: string; value: number }>
): MacroSignalResult {
  if (!points || points.length === 0) {
    return { status: 'emerald', label: '자금원활', detail: '데이터 수집 중' };
  }

  const current = points[points.length - 1].value;
  const values = points.map((p) => p.value).sort((a, b) => a - b);
  
  // 5년 80th 백분위 (상위 20% 위험선)
  const p80Index = Math.floor(values.length * 0.8);
  const p80 = values[p80Index] ?? 1.37;

  // 최근 60거래일(약 3개월) 변동폭 추적
  const past60 = points[Math.max(0, points.length - 61)]?.value ?? current;
  const change60d = Number((current - past60).toFixed(2));

  if (current >= p80 || change60d >= 0.30) {
    return {
      status: 'orange',
      label: '자금 주의',
      detail: `스프레드 ${current.toFixed(2)}% (기업 대출 위험 증가)`,
    };
  }

  return {
    status: 'emerald',
    label: '자금 안정',
    detail: `스프레드 ${current.toFixed(2)}% (원활한 자금 조달)`,
  };
}

export function evaluateFedRateSignal(
  points: Array<{ date: string; value: number }>
): MacroSignalResult {
  if (!points || points.length < 2) {
    return { status: 'orange', label: '금리 높음', detail: '금리 추이 분석 중' };
  }

  const current = points[points.length - 1].value;

  // 시계열을 뒤에서부터 역순 추적하여 직전 비영(non-zero) 변동 찾기
  let lastDelta = 0;
  for (let i = points.length - 1; i >= 1; i--) {
    const diff = Number((points[i].value - points[i - 1].value).toFixed(2));
    if (diff !== 0) {
      lastDelta = diff;
      break;
    }
  }

  // 1. 직전 변동이 인상(+)이면 무조건 주황 (금리 높음)
  if (lastDelta > 0) {
    return {
      status: 'orange',
      label: '금리 높음',
      detail: `최근 +${lastDelta.toFixed(2)}%p 인상 (${current.toFixed(2)}%)`,
    };
  }

  // 2. 인하(-) 기조이거나 동결인 경우:
  // 연준 공식 중립금리(3.0%) 초과 구간에서 동결 지속 시 고금리 부담 (주황)
  if (current > 3.00 && lastDelta === 0) {
    return {
      status: 'orange',
      label: '금리 높음',
      detail: `중립금리(3%) 초과 동결 지속 (${current.toFixed(2)}%)`,
    };
  }

  // 3. 중립금리 이하이거나 인하 사이클 진행 중 (초록)
  return {
    status: 'emerald',
    label: '금리 낮음',
    detail: `중립금리 이하 또는 인하 안정 구간 (${current.toFixed(2)}%)`,
  };
}

export function evaluateCpiSignal(
  points: Array<{ date: string; value: number }>
): MacroSignalResult {
  if (!points || points.length === 0) {
    return { status: 'orange', label: '물가경계', detail: '물가 분석 중' };
  }

  const current = points[points.length - 1].value;

  if (current > 3.00) {
    return {
      status: 'orange',
      label: '물가 주의',
      detail: `전년비 ${current.toFixed(2)}% (연준 목표 2% 초과)`,
    };
  }

  if (current < 1.00) {
    return {
      status: 'orange',
      label: '물가 급랭',
      detail: `전년비 ${current.toFixed(2)}% (경기 침체/물가 급랭)`,
    };
  }

  return {
    status: 'emerald',
    label: '물가 안정',
    detail: `전년비 ${current.toFixed(2)}% (2%대 안착)`,
  };
}

export function evaluateUnemploymentSignal(
  points: Array<{ date: string; value: number }>
): MacroSignalResult {
  if (!points || points.length === 0) {
    return { status: 'emerald', label: '고용 안정', detail: '고용 지표 분석 중' };
  }

  const current = points[points.length - 1].value;

  // 샴의 법칙(Sahm Rule): 최근 3개월 평균과 직전 12개월 최저치 비교
  const len = points.length;
  const recent3 = points.slice(Math.max(0, len - 3));
  const recent3Avg = recent3.reduce((acc, p) => acc + p.value, 0) / (recent3.length || 1);

  const past12 = points.slice(Math.max(0, len - 12));
  const minPast12 = Math.min(...past12.map((p) => p.value));
  const sahmDiff = Number((recent3Avg - minPast12).toFixed(2));

  // 샴의 법칙 발동 (저점 대비 +0.50%p 이상 급등) OR 자연실업률(4.4%) 초과
  if (sahmDiff >= 0.50 || current > 4.40) {
    return {
      status: 'orange',
      label: '고용 주의',
      detail: `실업률 ${current.toFixed(1)}% (저점 대비 +${sahmDiff.toFixed(2)}%p 상승)`,
    };
  }

  return {
    status: 'emerald',
    label: '고용 안정',
    detail: `실업률 ${current.toFixed(1)}% (역사적 저실업 안정)`,
  };
}

export function evaluateEpsSignal(
  points: Array<{ date: string; value: number }>
): MacroSignalResult {
  if (!points || points.length === 0) {
    return { status: 'emerald', label: '실적 성장', detail: '기업 실적 분석 중' };
  }

  const current = points[points.length - 1].value;
  // 12개월 전 EPS와 비교하여 기울기/증가율(YoY) 판별
  const past12Idx = Math.max(0, points.length - 13);
  const past12Val = points[past12Idx]?.value ?? current;
  const isGrowing = current >= past12Val;

  if (!isGrowing) {
    return {
      status: 'orange',
      label: '실적 둔화',
      detail: `전년비 역성장 (기울기 하향 전환)`,
    };
  }

  return {
    status: 'emerald',
    label: '실적 성장',
    detail: `주당 순이익 우상향 성장 ($${current.toFixed(2)})`,
  };
}
