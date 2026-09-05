// src/utils/telegram.ts

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7836688476:AAGJOs8nHrvRD-T1XPSIfY1wDSXKADQQS2Q";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7954599592";

export async function sendTelegramMessage(text: string, replyMarkup?: any): Promise<boolean> {
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

/**
 * 일일 증시 브리핑 리포트 전송 (화~토 07:15)
 */
export async function sendTelegramDailyReport(snapshot: {
  updatedAt: string;
  fearGreedIndex: number;
  fearGreedLabel: string;
  weatherMessage: string;
  indices: Array<{ name: string; value: string; changePercent: string; isPositive: boolean }>;
  auxiliary: Array<{ label: string; value: string; isPositive: boolean }>;
  todayNews?: Array<{ source: string; title: string; url: string }>;
}): Promise<boolean> {
  const getIcon = (isPos: boolean) => (isPos ? "🔺" : "🔻");

  const lines = [
    `🦉 <b>[jusik.app 일일 증시 브리핑]</b>`,
    `📅 ${snapshot.updatedAt}`,
    ``,
    `🌡️ <b>공포와 탐욕 지수</b>: ${snapshot.fearGreedIndex}점 (${snapshot.fearGreedLabel})`,
    `<i>\"${snapshot.weatherMessage}\"</i>`,
    ``,
    `📊 <b>핵심 주가지수</b>`,
  ];

  snapshot.indices.forEach((idx) => {
    lines.push(`• <b>${idx.name}</b>: ${idx.value} (${idx.changePercent}% ${getIcon(idx.isPositive)})`);
  });

  lines.push(``);
  lines.push(`💵 <b>주요 환율 및 원자재</b>`);
  snapshot.auxiliary.forEach((aux) => {
    lines.push(`• <b>${aux.label}</b>: ${aux.value}`);
  });

  if (snapshot.todayNews && snapshot.todayNews.length > 0) {
    lines.push(``);
    lines.push(`📰 <b>오늘 장 핵심 뉴스</b>`);
    snapshot.todayNews.slice(0, 5).forEach((item) => {
      // 텔레그램 HTML 안전 이스케이프
      const safeTitle = item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      lines.push(`• [${item.source}] <a href="${item.url}">${safeTitle}</a>`);
    });
  }

  lines.push(``);
  lines.push(`✅ <b>최신 시장 데이터가 성공적으로 갱신되었습니다.</b>`);

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
