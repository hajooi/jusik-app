// src/utils/telegram.ts
import { MacroIndicatorSummary, MACRO_ASSET_CHARTS, MACRO_SUMMARY_ITEMS } from '@/data/marketCalendar';
import {
  evaluateCreditSpreadSignal,
  evaluateFedRateSignal,
  evaluateCpiSignal,
  evaluateUnemploymentSignal,
  evaluateEpsSignal,
  MacroSignalResult,
} from './macroSignals';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(text: string, replyMarkup?: any): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in environment.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload: Record<string, any> = {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
    return false;
  }
}

function identifyMajorMacroEvent(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes('fomc') || (t.includes('기준금리') && t.includes('미국'))) {
    return '미국 기준금리 (FOMC)';
  }
  if (t.includes('소비자물가') || t.includes('cpi')) {
    return '미국 소비자물가지수 (CPI)';
  }
  if (t.includes('실업률') || t.includes('비농업') || t.includes('nfp')) {
    return '미국 실업률 / 비농업 고용 (NFP)';
  }
  if (t.includes('s&p') && (t.includes('eps') || t.includes('기업 실적') || t.includes('실적'))) {
    return 'S&P 500 기업 실적 (EPS)';
  }
  return null;
}

/**
 * 일일 증시 브리핑 리포트 전송 (화~토 07:15)
 */
export async function sendTelegramDailyReport(
  snapshot: {
    updatedAt: string;
    fearGreedIndex: number;
    fearGreedLabel: string;
    weatherMessage: string;
    indices: Array<{ name: string; value: string; changePercent: string; isPositive: boolean }>;
    auxiliary: Array<{ label: string; value: string; isPositive: boolean }>;
    todayNews?: Array<{ source: string; title: string; url: string }>;
  },
  newlyPublishedEvents?: Array<{
    title: string;
    ticker?: string;
    actual: string;
    expected?: string;
    summary: string;
  }>,
  warningMessage?: string,
  fallbackNotice?: string,
  macroUpdates?: {
    fedRate?: string;
    cpi?: string;
    unemployment?: string;
  },
  macroSummaryItems?: MacroIndicatorSummary[],
  macroCharts?: typeof MACRO_ASSET_CHARTS,
  overlayUpdates?: Array<{
    title: string;
    date: string;
    field: string;
    oldVal?: string;
    newVal: string;
  }>
): Promise<boolean> {
  const getIcon = (isPos: boolean) => (isPos ? "🔺" : "🔻");

  const lines = [
    `🦉 <b>[jusik.app 일일 증시 브리핑]</b>`,
    `📅 ${snapshot.updatedAt}`,
  ];

  // 4대 핵심 거시 경제 지표 발표 여부 감지 및 특별 직접 확인 알림
  const majorMacroList = (newlyPublishedEvents || []).filter((e) => identifyMajorMacroEvent(e.title));
  const hasMacroUpdates = macroUpdates && Object.keys(macroUpdates).length > 0;

  if (majorMacroList.length > 0 || hasMacroUpdates) {
    lines.push(``);
    lines.push(`🚨 <b>[핵심 4대 경제지표 발표 알림 - 직접 확인 필요]</b>`);
    majorMacroList.forEach((item) => {
      const macroName = identifyMajorMacroEvent(item.title);
      lines.push(`• <b>${macroName}</b> 발표 완료: <b>${item.actual}</b>${item.expected ? ` (예상: ${item.expected})` : ''}`);
    });
    if (macroUpdates) {
      if (macroUpdates.fedRate && !majorMacroList.some((m) => m.title.includes('기준금리') || m.title.toLowerCase().includes('fomc'))) {
        lines.push(`• <b>미국 기준금리 (FOMC)</b>: <b>${macroUpdates.fedRate}</b>`);
      }
      if (macroUpdates.cpi && !majorMacroList.some((m) => m.title.includes('소비자물가') || m.title.toLowerCase().includes('cpi'))) {
        lines.push(`• <b>미국 소비자물가지수 (CPI)</b>: <b>${macroUpdates.cpi}</b>`);
      }
      if (macroUpdates.unemployment && !majorMacroList.some((m) => m.title.includes('실업률'))) {
        lines.push(`• <b>미국 실업률</b>: <b>${macroUpdates.unemployment}</b>`);
      }
    }
    lines.push(`👉 <i>주요 경제지표가 발표되었으니 웹사이트(마켓 인사이트)에서 직접 이상 유무와 차트를 꼭 확인해 주세요!</i>`);
    lines.push(`🔗 <a href="https://www.jusik.app/tools/market">jusik.app 마켓 인사이트 바로가기</a>`);
  }

  if (fallbackNotice) {
    lines.push(``);
    lines.push(`ℹ️ <b>[데이터 소스 대체 안내]</b>`);
    lines.push(`<i>${fallbackNotice}</i>`);
  }

  if (warningMessage) {
    lines.push(``);
    lines.push(`⚠️ <b>[데이터 지연/확인 안내]</b>`);
    lines.push(`<i>${warningMessage}</i>`);
  }

  lines.push(``);
  lines.push(`🌡️ <b>공포와 탐욕 지수</b>: ${snapshot.fearGreedIndex}점 (${snapshot.fearGreedLabel})`);
  lines.push(`<i>\"${snapshot.weatherMessage}\"</i>`);
  lines.push(``);
  lines.push(`📊 <b>핵심 주가지수</b>`);

  snapshot.indices.forEach((idx) => {
    lines.push(`• <b>${idx.name}</b>: ${idx.value} (${idx.changePercent}% ${getIcon(idx.isPositive)})`);
  });

  lines.push(``);
  lines.push(`💵 <b>주요 환율 및 원자재</b>`);
  snapshot.auxiliary.forEach((aux) => {
    lines.push(`• <b>${aux.label}</b>: ${aux.value}`);
  });

  // 5대 핵심 경제 지표 및 신호등 (신용스프레드 포함)
  const resolvedItems: MacroIndicatorSummary[] = (macroSummaryItems && macroSummaryItems.length > 0) ? macroSummaryItems : MACRO_SUMMARY_ITEMS;
  const resolvedCharts = macroCharts || MACRO_ASSET_CHARTS;

  if (resolvedItems && resolvedItems.length > 0 && resolvedCharts) {
    const signals: Record<string, MacroSignalResult> = {
      DFEDTARU: evaluateFedRateSignal(resolvedCharts.DFEDTARU?.points ?? []),
      CPI_YOY: evaluateCpiSignal(resolvedCharts.CPI_YOY?.points ?? []),
      UNEMPLOYMENT: evaluateUnemploymentSignal(resolvedCharts.UNEMPLOYMENT?.points ?? []),
      SP500_EPS: evaluateEpsSignal(resolvedCharts.SP500_EPS?.points ?? []),
      CREDIT_SPREAD: evaluateCreditSpreadSignal(resolvedCharts.CREDIT_SPREAD?.points ?? []),
    };

    const emeraldCount = Object.values(signals).filter((s) => s.status === 'emerald').length;
    const orangeCount = Object.values(signals).filter((s) => s.status === 'orange').length;

    lines.push(``);
    lines.push(`🚦 <b>핵심 경제 지표</b> (${emeraldCount}개 안정 · ${orangeCount}개 주의)`);
    resolvedItems.forEach((item) => {
      const sig = signals[item.key];
      const icon = sig?.status === 'emerald' ? '🟢' : '🟠';
      const label = sig?.label ? ` (${icon} ${sig.label})` : '';
      const isEps = item.key === 'SP500_EPS';
      const suffix = isEps ? ' <i>(TTM 확정/추정)</i>' : '';
      lines.push(`• <b>${item.name}</b>: ${item.value}${label}${suffix}`);
    });
  }

  // 주간 공식 캘린더 오버레이 (Forex Factory 최신 예상치/이전치 동기화 알림)
  if (overlayUpdates && overlayUpdates.length > 0) {
    lines.push(``);
    lines.push(`📅 <b>[주간 공식 캘린더 동기화 (Forex Factory 최신 반영)]</b>`);
    overlayUpdates.forEach((item) => {
      const prevText = item.oldVal ? ` (기존: ${item.oldVal})` : '';
      lines.push(`• <b>${item.title}</b> (${item.date}): ${item.field} 최신화 ➔ <b>${item.newVal}</b>${prevText}`);
    });
  }

  // 새로 발표/동기화된 실적 및 경제지표와 AI 요약이 있는 경우
  if (newlyPublishedEvents && newlyPublishedEvents.length > 0) {
    lines.push(``);
    lines.push(`🔔 <b>[새로 발표된 실적/지표 & AI 요약]</b>`);
    newlyPublishedEvents.forEach((item, i) => {
      const tickerLabel = item.ticker ? ` (${item.ticker})` : '';
      lines.push(`${i + 1}. <b>${item.title}${tickerLabel}</b>`);
      lines.push(`• 발표치: <b>${item.actual}</b>${item.expected ? ` (예상: ${item.expected})` : ''}`);
      const safeSummary = item.summary.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      lines.push(`• <i>\"${safeSummary}\"</i>`);
      lines.push(``);
    });
  }

  if (snapshot.todayNews && snapshot.todayNews.length > 0) {
    lines.push(`📰 <b>오늘 장 핵심 뉴스</b>`);
    snapshot.todayNews.slice(0, 5).forEach((item) => {
      // 텔레그램 HTML 안전 이스케이프
      const safeTitle = item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      lines.push(`• [${item.source}] <a href="${item.url}">${safeTitle}</a>`);
    });
  }

  lines.push(``);
  lines.push(`✅ <b>최신 시장 데이터 및 캘린더가 성공적으로 갱신되었습니다.</b>`);

  return sendTelegramMessage(lines.join("\n"));
}

/**
 * 캘린더 발표치 승인 요청 메시지 전송 (인라인 버튼 포함)
 */
export async function sendTelegramApprovalRequest(event: {
  id: string;
  title: string;
  actual: string;
  expected?: string;
  previous?: string;
  note?: string;
}): Promise<boolean> {
  const lines = [
    `🦉 <b>[jusik.app 캘린더 발표치 감지]</b>`,
    ``,
    `새로운 주요 경제지표 결과가 감지되었습니다:`,
    ``,
    `📊 <b>${event.title}</b>`,
    `• <b>발표치</b>: <b>${event.actual}</b>`,
  ];

  if (event.expected) lines.push(`• <b>예상치</b>: ${event.expected}`);
  if (event.previous) lines.push(`• <b>이전치</b>: ${event.previous}`);
  if (event.note) lines.push(`• <i>${event.note}</i>`);

  lines.push(``);
  lines.push(`위 발표치를 <b>jusik.app 증시 캘린더</b>에 즉시 반영할까요?`);

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: `✅ 승인 (${event.actual} 즉시 반영)`, callback_data: `approve:${event.id}:${event.actual}` },
        { text: `❌ 반려 (스킵)`, callback_data: `reject:${event.id}` },
      ],
    ],
  };

  return sendTelegramMessage(lines.join("\n"), replyMarkup);
}

/**
 * 자동화 오류 발생 경고 알림 전송
 */
export async function sendTelegramErrorAlert(jobName: string, errorMsg: string): Promise<boolean> {
  const lines = [
    `🚨 <b>[jusik.app 자동화 오류 경고]</b>`,
    ``,
    `• <b>작업명</b>: ${jobName}`,
    `• <b>발생 시각</b>: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
    `• <b>오류 상세</b>: <code>${errorMsg.slice(0, 300)}</code>`,
    ``,
    `⚠️ <i>기존의 안전한 캐시 데이터로 보호 중이며 서비스를 정상 서빙합니다.</i>`,
  ];

  return sendTelegramMessage(lines.join("\n"));
}
