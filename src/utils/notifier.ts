import { CommentRecord } from './serverDb';

interface PageInfo {
  name: string;
  url: string;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jusik.app').replace(/\/$/, '');

/**
 * targetKey를 깔끔한 위치명과 정확한 링크로 변환합니다.
 */
export function getPageInfo(targetKey: string): PageInfo {
  const cleanKey = targetKey.trim();
  const lower = cleanKey.toLowerCase();

  // 1. 강의 체크 (lesson-lv0-2 또는 lv0-2)
  if (lower.startsWith('lesson-')) {
    const lessonId = cleanKey.replace(/^lesson-/i, '');
    return {
      name: cleanKey,
      url: `${SITE_URL}/lesson/${lessonId}`,
    };
  }
  if (/^lv\d+-\d+$/i.test(cleanKey)) {
    return {
      name: `lesson-${cleanKey}`,
      url: `${SITE_URL}/lesson/${cleanKey}`,
    };
  }

  // 2. 도구 체크
  if (lower.includes('type')) {
    return {
      name: 'tools-type',
      url: `${SITE_URL}/tools/type`,
    };
  }
  if (lower.includes('simulate')) {
    return {
      name: 'tools-simulate',
      url: `${SITE_URL}/tools/simulate`,
    };
  }
  if (lower.includes('term') || lower.includes('quiz')) {
    return {
      name: 'tools-terms',
      url: `${SITE_URL}/tools/terms`,
    };
  }

  return {
    name: cleanKey,
    url: SITE_URL,
  };
}

/**
 * 텔레그램 메시지 발송
 */
async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Telegram Notification Error:', errText);
  }
}

/**
 * 디스코드 웹훅 발송
 */
async function sendDiscord(payload: {
  title: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

  if (!webhookUrl) return;

  const body = {
    username: 'jusik.app 알리미 🦉',
    avatar_url: 'https://jusik.app/favicon.ico',
    embeds: [
      {
        title: payload.title,
        color: 0xf18f01,
        fields: payload.fields || [],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'jusik.app',
        },
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Discord Notification Error:', errText);
  }
}

/**
 * HTML 특수문자 이스케이프
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 새 댓글 / 답글 등록 시 알림 발송 메인 함수
 */
export async function sendCommentNotification(comment: CommentRecord): Promise<void> {
  try {
    const pageInfo = getPageInfo(comment.targetKey);
    const isReply = !!comment.parentId;
    const actionLabel = isReply ? '새 답글' : '새 댓글';

    const nowFormatted = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const safeNick = escapeHtml(comment.nickname);
    const safeContent = escapeHtml(comment.content);
    const safePageName = escapeHtml(pageInfo.name);

    // 1. 심플한 텔레그램 메시지 구성
    const telegramText = [
      `🔔 <b>[jusik.app] ${actionLabel}</b>`,
      ``,
      `위치: ${safePageName}`,
      `작성자: ${safeNick}`,
      `일시: ${nowFormatted}`,
      ``,
      `💬 <b>내용:</b>`,
      `<blockquote>${safeContent}</blockquote>`,
      ``,
      `👉 <a href="${pageInfo.url}">바로가기</a>`,
    ].join('\n');

    // 2. 디스코드 임베드 필드 구성
    const discordPayload = {
      title: `🔔 [jusik.app] ${actionLabel}`,
      fields: [
        { name: '위치', value: pageInfo.name, inline: true },
        { name: '작성자', value: comment.nickname, inline: true },
        { name: '일시', value: nowFormatted, inline: false },
        {
          name: '내용',
          value: comment.content.length > 1000 ? comment.content.substring(0, 1000) + '...' : comment.content,
        },
        { name: '링크', value: `[바로가기](${pageInfo.url})` },
      ],
    };

    // 3. 비동기 병렬 발송
    await Promise.allSettled([
      sendTelegram(telegramText),
      sendDiscord(discordPayload),
    ]);
  } catch (err) {
    console.error('sendCommentNotification Error:', err);
  }
}
