import { PERSONALITY_PROFILES } from '@/data/investmentSurvey';
import { ServerUserRecord, SurveyStatsData, TermsQuizLeaderboardEntry } from '@/utils/serverDb';

export interface IntegrityIssue {
  domain: 'survey' | 'user' | 'market' | 'quiz';
  severity: 'critical' | 'warning';
  title: string;
  details: string;
}

/**
 * 1. 투자 성향 진단 통계 무결성 검증
 */
export function checkSurveyStatsIntegrity(stats: SurveyStatsData): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const expectedCodes = Object.keys(PERSONALITY_PROFILES);

  let calculatedTotal = 0;
  expectedCodes.forEach((code) => {
    const count = stats.typeCounts?.[code];
    if (count === undefined || count === null || isNaN(count)) {
      issues.push({
        domain: 'survey',
        severity: 'critical',
        title: '성향 코드 누락 또는 NaN 감지',
        details: `${code} 성향 카운트가 존재하지 않거나 NaN입니다 (값: ${count}).`,
      });
    } else {
      calculatedTotal += count;
      // 기본 시드값 10건 이상 유지 보장
      if (count < 10) {
        issues.push({
          domain: 'survey',
          severity: 'critical',
          title: '성향 카운트 비정상 감소/초기화 의심',
          details: `${code} 카운트가 ${count}회로 기준값(10회) 미만으로 떨어졌습니다.`,
        });
      }
    }
  });

  if (stats.totalCount !== calculatedTotal) {
    issues.push({
      domain: 'survey',
      severity: 'warning',
      title: '성향 총합 불일치',
      details: `통계 totalCount(${stats.totalCount})와 세부 항목 합계(${calculatedTotal})가 일치하지 않습니다.`,
    });
  }

  return issues;
}

/**
 * 2. 회원 계정 및 수강 진도 / 뱃지 무결성 검증
 */
export function checkUsersIntegrity(users: Record<string, ServerUserRecord>): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  Object.values(users).forEach((u) => {
    if (!u.nickname) return;

    // 핀번호 형식 검증
    if (!u.pin || !/^\d{6}$/.test(u.pin)) {
      issues.push({
        domain: 'user',
        severity: 'critical',
        title: '회원 핀번호 포맷 비정상',
        details: `회원 [${u.nickname}]의 핀번호가 6자리 숫자가 아닙니다.`,
      });
    }

    // 퀴즈 1% 뱃지 오염 감지 (15개 미만 정답인데 상위 1% 보유)
    if (u.termsQuizBest) {
      const isCorrupted = (u.termsQuizBest.correctCount || 0) < 15 && u.termsQuizBest.percentile === 1;
      if (isCorrupted) {
        issues.push({
          domain: 'user',
          severity: 'warning',
          title: '퀴즈 상위 1% 뱃지 오염 감지',
          details: `회원 [${u.nickname}]의 정답 수가 ${u.termsQuizBest.correctCount}개인데 상위 1% 뱃지가 부여되어 있습니다.`,
        });
      }
    }

    // 수강 완료 목록 구조 무결성
    // - 배열이 아닌 경우: 명백한 DB 손상
    // - 배열 안에 문자열이 아닌 값이 섞인 경우: 데이터 오염
    // ※ 갯수 증감 비교는 제거 — 사용자가 의도적으로 강의를 취소할 수 있으므로
    //   "줄었다" 자체가 버그 증거가 될 수 없음
    if (!Array.isArray(u.completedLessons)) {
      issues.push({
        domain: 'user',
        severity: 'critical',
        title: '수강 완료 목록 비배열 손상',
        details: `회원 [${u.nickname}]의 completedLessons가 배열이 아닙니다 (타입: ${typeof u.completedLessons}).`,
      });
    } else {
      const invalidEntries = u.completedLessons.filter((id) => typeof id !== 'string' || id.trim() === '');
      if (invalidEntries.length > 0) {
        issues.push({
          domain: 'user',
          severity: 'critical',
          title: '수강 완료 목록 내 비정상 항목 감지',
          details: `회원 [${u.nickname}]의 completedLessons에 유효하지 않은 항목 ${invalidEntries.length}개가 포함되어 있습니다.`,
        });
      }
    }
  });

  return issues;
}

/**
 * 3. 마켓 인사이트 지표 데이터 무결성 검증
 */
export function checkMarketDataIntegrity(snapshot: any): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  if (!snapshot) {
    issues.push({
      domain: 'market',
      severity: 'critical',
      title: '마켓 스냅샷 데이터 완전 부재',
      details: '마켓 데이터 스냅샷이 null이거나 비어있습니다.',
    });
    return issues;
  }

  // 갱신 시각 Stale 검증 (평일 기준 36시간 초과 시)
  if (snapshot.updatedAt) {
    const updatedTime = new Date(snapshot.updatedAt).getTime();
    const now = Date.now();
    const diffHours = (now - updatedTime) / (1000 * 60 * 60);

    const nowKst = new Date(now + 9 * 3600 * 1000);
    const day = nowKst.getUTCDay(); // 0: 일, 1~5: 월~금, 6: 토
    const isWeekend = day === 0 || day === 6;

    // 주말이 아닌 평일인데 36시간 이상 갱신 안 된 경우
    if (!isWeekend && diffHours > 36) {
      issues.push({
        domain: 'market',
        severity: 'warning',
        title: '마켓 데이터 Stale 지연 의심',
        details: `평일인데 마켓 데이터가 ${Math.round(diffHours)}시간 동안 갱신되지 않았습니다 (최종 갱신: ${snapshot.updatedAt}).`,
      });
    }
  }

  // 공포 탐욕 지수 범위 검증
  if (typeof snapshot.fearGreedIndex === 'number') {
    if (snapshot.fearGreedIndex < 0 || snapshot.fearGreedIndex > 100) {
      issues.push({
        domain: 'market',
        severity: 'critical',
        title: '공포탐욕지수 범위 비정상',
        details: `공포탐욕지수가 0~100 범위를 벗어났습니다 (값: ${snapshot.fearGreedIndex}).`,
      });
    }
  }

  return issues;
}

/**
 * 4. 용어 퀴즈 랭킹 데이터 무결성 검증
 */
export function checkQuizLeaderboardIntegrity(entries: TermsQuizLeaderboardEntry[]): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  entries.forEach((e) => {
    if (e.score < 0 || e.score > 15000) {
      issues.push({
        domain: 'quiz',
        severity: 'critical',
        title: '퀴즈 랭킹 비정상 점수 감지',
        details: `[${e.nickname}]의 퀴즈 점수가 범위를 벗어났습니다 (점수: ${e.score}).`,
      });
    }
    if (e.timeSpentSec <= 0 || e.timeSpentSec > 999) {
      issues.push({
        domain: 'quiz',
        severity: 'warning',
        title: '퀴즈 소요 시간 이상치 감지',
        details: `[${e.nickname}]의 소요 시간이 비정상적입니다 (소요시간: ${e.timeSpentSec}초).`,
      });
    }
  });

  return issues;
}
