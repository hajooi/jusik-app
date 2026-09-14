import { getSurveyStatsAsync, getServerDbAsync, getTermsQuizEntriesAsync } from '@/utils/serverDb';
import { sendTelegramMessage } from '@/utils/telegram';
import {
  checkSurveyStatsIntegrity,
  checkUsersIntegrity,
  checkQuizLeaderboardIntegrity,
  checkMarketDataIntegrity,
  IntegrityIssue
} from './invariants';

/**
 * 사이트 전역 백그라운드 무결성 자동 감사 (runSiteHealthAudit)
 * 
 * - 침묵 원칙 (Zero Noise): 100% 정상일 때는 관리자에게 어떠한 스팸성 알림도 보내지 않습니다.
 * - 오직 1개라도 무결성 위반이나 이상 징후가 포착되었을 때만 텔레그램으로 직보합니다.
 */
export async function runSiteHealthAudit(marketSnapshot?: any): Promise<{ allPass: boolean; issues: IntegrityIssue[] }> {
  const allIssues: IntegrityIssue[] = [];

  try {
    // 1. 투자 성향 통계 감사
    const surveyStats = await getSurveyStatsAsync();
    allIssues.push(...checkSurveyStatsIntegrity(surveyStats));
  } catch (err: any) {
    allIssues.push({
      domain: 'survey',
      severity: 'critical',
      title: '성향 통계 DB 로드 실패',
      details: err?.message || String(err),
    });
  }

  try {
    // 2. 회원 계정 및 진도 / 뱃지 감사
    const users = await getServerDbAsync();
    allIssues.push(...checkUsersIntegrity(users));
  } catch (err: any) {
    allIssues.push({
      domain: 'user',
      severity: 'critical',
      title: '회원 DB 로드 실패',
      details: err?.message || String(err),
    });
  }

  try {
    // 3. 퀴즈 랭킹 감사
    const leaderboard = await getTermsQuizEntriesAsync();
    allIssues.push(...checkQuizLeaderboardIntegrity(leaderboard));
  } catch (err: any) {
    allIssues.push({
      domain: 'quiz',
      severity: 'warning',
      title: '퀴즈 랭킹 로드 실패',
      details: err?.message || String(err),
    });
  }

  // 4. 마켓 데이터 감사 (파라미터 전달된 경우)
  if (marketSnapshot) {
    allIssues.push(...checkMarketDataIntegrity(marketSnapshot));
  }

  // 🚨 침묵 원칙: 모든 검사가 정상이면 어떠한 메시지도 전송하지 않고 조용히 종료
  if (allIssues.length === 0) {
    return { allPass: true, issues: [] };
  }

  // 🚨 이상 발견 시에만 관리자 텔레그램으로 즉각 직보
  const criticalCount = allIssues.filter((i) => i.severity === 'critical').length;
  const warningCount = allIssues.filter((i) => i.severity === 'warning').length;

  const lines = [
    `🚨 <b>[jusik.app 사이트 무결성 이상 감지]</b>`,
    '',
    `• <b>발생 시각</b>: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
    `• <b>이상 발견 건수</b>: 심각 ${criticalCount}건 / 경고 ${warningCount}건`,
    '',
    '<b>[세부 이상 내역]</b>',
  ];

  allIssues.slice(0, 8).forEach((issue, idx) => {
    const icon = issue.severity === 'critical' ? '🔴' : '🟡';
    lines.push(`${idx + 1}. ${icon} <b>[${issue.domain.toUpperCase()}] ${issue.title}</b>`);
    lines.push(`   ↳ <code>${issue.details}</code>`);
  });

  if (allIssues.length > 8) {
    lines.push(`... 외 ${allIssues.length - 8}건의 추가 이상치가 감지되었습니다.`);
  }

  lines.push('');
  lines.push('⚠️ <i>관리자 점검이 필요합니다. 서비스는 안전 가드로 보호 중입니다.</i>');

  await sendTelegramMessage(lines.join('\n'));

  return { allPass: false, issues: allIssues };
}
