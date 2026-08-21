import { CommentRecord } from './serverDb';
import { CURRICULUM_DATA } from '@/data/curriculum';

interface PageInfo {
  name: string;
  url: string;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jusik.app').replace(/\/$/, '');

// 모든 레슨 목록 평탄화 캐싱
const allLessons = CURRICULUM_DATA.flatMap((level) => level.lessons);

/**
 * targetKey를 읽기 쉬운 페이지 이름과 링크로 변환합니다.
 */
export function getPageInfo(targetKey: string): PageInfo {
  const cleanKey = targetKey.trim().toLowerCase();

  // 1. 강의(Lesson) 체크 (예: lv0-1, lv1-2 등)
  const matchedLesson = allLessons.find(
    (l) => l.id.toLowerCase() === cleanKey || l.id.replace('-', '').toLowerCase() === cleanKey
  );
  if (matchedLesson) {
    return {
      name: `[강의] ${matchedLesson.title}`,
      url: `${SITE_URL}/lesson/${matchedLesson.id}`,
    };
  }

  // 2. 투자 도구(Tools) 체크
  if (cleanKey.includes('type')) {
    return {
      name: '💡 [도구] 주식 투자 성향 테스트 (16가지 유형)',
      url: `${SITE_URL}/tools/type`,
    };
  }

  if (cleanKey.includes('simulate')) {
    return {
      name: '📈 [도구] 포트폴리오 백테스터 & 복리 계산기',
      url: `${SITE_URL}/tools/simulate`,
    };
  }

  if (cleanKey.includes('term') || cleanKey.includes('quiz')) {
    return {
      name: '🧩 [도구] 주식 기초 용어 400제 퀴즈',
      url: `${SITE_URL}/tools/terms`,
    };
  }

  if (cleanKey.includes('class') || cleanKey.includes('detector')) {
    return {
      name: '🔍 [도구] 자본주의 계층 판독기',
      url: `${SITE_URL}/lesson/lv0-1`,
    };
  }

  // 기본값
  return {
    name: `📄 [페이지] ${targetKey}`,
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
  description: string;
  url?: string;
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
        description: payload.description,
        url: payload.url,
        color: 0xf18f01, // jusik.app 시그니처 오렌지 (#F18F01)
        fields: payload.fields || [],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'jusik.app • 주식 초보를 위한 가장 쉬운 설명서',
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
 * HTML 특수문자 이스케이프 (텔레그램 HTML 모드용)
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
    const actionLabel = isReply ? '새 답글(대댓글)' : '새 댓글';

    // 성향 뱃지 또는 라벨
    let badgeText = '';
    if (comment.activeBadge) {
      badgeText = ` [${comment.activeBadge}]`;
    } else if (comment.investmentType) {
      badgeText = ` [${comment.investmentType}]`;
    }

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

    // 1. 텔레그램 메시지 구성
    const safeNick = escapeHtml(comment.nickname + badgeText);
    const safeContent = escapeHtml(comment.content);
    const safePageName = escapeHtml(pageInfo.name);

    const telegramText = [
      `🔔 <b>[jusik.app] ${actionLabel}이 등록되었습니다!</b>`,
      ``,
      `📍 <b>위치:</b> ${safePageName}`,
      `👤 <b>작성자:</b> ${safeNick}`,
      `⏰ <b>일시:</b> ${nowFormatted}`,
      ``,
      `💬 <b>내용:</b>`,
      `<blockquote>${safeContent}</blockquote>`,
      ``,
      `👉 <a href="${pageInfo.url}">게시글 바로가기</a>`,
    ].join('\n');

    // 2. 디스코드 임베드 필드 구성
    const discordPayload = {
      title: `🔔 [jusik.app] ${actionLabel} 등록!`,
      description: `**${pageInfo.name}** 페이지에 새로운 의견이 남겨졌습니다.`,
      url: pageInfo.url,
      fields: [
        {
          name: '👤 작성자',
          value: comment.nickname + badgeText,
          inline: true,
        },
        {
          name: '⏰ 작성 일시',
          value: nowFormatted,
          inline: true,
        },
        {
          name: '💬 댓글 내용',
          value: comment.content.length > 1000 ? comment.content.substring(0, 1000) + '...' : comment.content,
        },
        {
          name: '🔗 바로가기',
          value: `[페이지 열기](${pageInfo.url})`,
        },
      ],
    };

    // 3. 비동기 병렬 발송 (하나가 실패해도 다른 쪽에 영향 없음)
    await Promise.allSettled([
      sendTelegram(telegramText),
      sendDiscord(discordPayload),
    ]);
  } catch (err) {
    // 알림 발송 실패가 사용자 경험에 영향을 주지 않도록 로깅만 수행
    console.error('sendCommentNotification Error:', err);
  }
}
