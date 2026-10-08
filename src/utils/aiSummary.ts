// src/utils/aiSummary.ts

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface GenerateSummaryParams {
  title: string;
  ticker?: string;
  region: 'us' | 'kr';
  actual?: string;
  expected?: string;
  previous?: string;
  newsQuery?: string;
  customNewsContext?: string[];
}

// 메모리 캐싱: 실행 시간 동안 모델 목록을 매번 찌르지 않도록 최근 감지된 최신 모델명 보관 (1시간 유효)
let cachedLatestModel: { name: string; expiresAt: number } | null = null;

/**
 * 실시간 발행된 실제 금융 언론사 기사 헤드라인을 Google News RSS에서 안전하게 수집합니다.
 * 타임아웃 3.5초 안전 가드를 적용하여 네트워크 지연 시에도 서비스가 멈추지 않도록 합니다.
 */
export async function fetchRecentNewsHeadlines(query: string, maxItems: number = 4): Promise<string[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const xml = await res.text();
    const items: string[] = [];
    const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
      let rawTitle = match[1] || '';
      rawTitle = rawTitle
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .trim();

      if (rawTitle && !rawTitle.includes('Google 뉴스') && rawTitle !== query) {
        items.push(rawTitle);
      }
    }
    return items;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[News RSS] Failed to fetch headlines for "${query}":`, err);
    return [];
  }
}

/**
 * 이벤트 특성에 맞는 최적의 금융 뉴스 검색어를 생성합니다.
 */
function buildNewsSearchQuery(params: GenerateSummaryParams): string {
  if (params.newsQuery) return params.newsQuery;
  const { title, ticker } = params;

  if (title.includes('FOMC') && (title.includes('회의록') || title.includes('의사록'))) {
    return '9월 FOMC 회의록';
  }
  if (title.includes('금통위') || (title.includes('기준금리') && title.includes('한국은행'))) {
    return '한국은행 기준금리 결정';
  }
  if (title.includes('기준금리') && (title.includes('연준') || title.includes('FOMC'))) {
    return '미국 연준 기준금리 FOMC';
  }
  if (title.includes('비농업') || title.includes('고용보고서')) {
    return '미국 비농업 고용보고서';
  }
  if (title.includes('소비자물가지수') || title.includes('CPI')) {
    return '미국 소비자물가지수 CPI';
  }
  if (title.includes('삼성전자') && title.includes('실적')) {
    return '삼성전자 3분기 실적';
  }
  if (ticker) {
    const cleanTitle = title.replace(/\(.*?\)/g, '').replace(/실적\s*발표/g, '').trim();
    return `${cleanTitle} 실적`;
  }
  return title.replace(/\(.*?\)/g, '').trim();
}

/**
 * Google API에서 현재 사용 가능한 정식 모델 중 가장 최신 버전의 Flash 모델명을 동적으로 자동 탐색합니다.
 */
async function getLatestFlashModel(apiKey: string): Promise<string> {
  const now = Date.now();
  if (cachedLatestModel && cachedLatestModel.expiresAt > now) {
    return cachedLatestModel.name;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      const models: Array<{ name: string; supportedGenerationMethods?: string[] }> = data?.models || [];

      const flashModels = models
        .filter((m) => {
          const name = m.name.toLowerCase();
          const supportsGenerate = m.supportedGenerationMethods?.includes('generateContent');
          return (
            supportsGenerate &&
            name.includes('flash') &&
            !name.includes('audio') &&
            !name.includes('tts') &&
            !name.includes('image') &&
            !name.includes('preview')
          );
        })
        .map((m) => m.name.replace(/^models\//, ''));

      flashModels.sort((a, b) => {
        const parseVersion = (str: string) => {
          const match = str.match(/gemini-(\d+(\.\d+)?)/);
          return match ? parseFloat(match[1]) : 0;
        };
        return parseVersion(b) - parseVersion(a);
      });

      if (flashModels.length > 0 && flashModels[0]) {
        const bestModel = flashModels[0];
        cachedLatestModel = { name: bestModel, expiresAt: now + 1000 * 60 * 60 };
        return bestModel;
      }
    }
  } catch (err) {
    console.warn('[Gemini API] Failed to fetch latest models dynamically:', err);
  }

  return 'gemini-2.5-flash';
}

/**
 * 실제 발행된 언론 기사 팩트를 수집하여, 초보자 눈높이의 친절하고 정확한 2줄 해설을 생성합니다.
 * 1. 실시간 뉴스 RSS를 통해 해당 이벤트의 실제 보도 헤드라인 수집
 * 2. Gemini AI에 실제 기사 팩트를 주입하여 허위/추측 배제 요약문 생성
 * 3. Gemini 키 부재/실패 시 수집된 기사 원문을 바탕으로 지능형 룰베이스 뉴스 합성기 작동
 */
export async function generateEasyEventSummary(params: GenerateSummaryParams): Promise<string> {
  let newsHeadlines: string[] = params.customNewsContext || [];
  if (newsHeadlines.length === 0) {
    const query = buildNewsSearchQuery(params);
    newsHeadlines = await fetchRecentNewsHeadlines(query, 4);
  }

  if (GEMINI_API_KEY) {
    try {
      const summaryFromGemini = await requestGeminiSummary(params, newsHeadlines);
      if (summaryFromGemini) {
        return sanitizeTerms(summaryFromGemini);
      }
    } catch (err) {
      console.warn('[Gemini API] Request error, falling back to news synthesis:', err);
    }
  }

  return sanitizeTerms(synthesizeNewsFallback(params, newsHeadlines));
}

/**
 * Gemini 모델에 실제 기사 팩트를 전달하여 2줄 요약문 생성 요청
 */
async function requestGeminiSummary(params: GenerateSummaryParams, newsHeadlines: string[]): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  const { title, ticker, region, actual, expected, previous } = params;

  const systemInstruction = `
당신은 'jusik.app(주식앱)'의 수석 금융 에디터이자 친절한 주식 멘토입니다.
초등학생이나 주식 초보자도 단번에 이해할 수 있도록 쉬운 우리말로 설명해야 합니다.

[절대 준수 규칙]
1. '매수'라는 단어는 절대 쓰지 말고 '주식 구매' 또는 '구매'로 쓸 것.
2. '매도'라는 단어는 절대 쓰지 말고 '주식 판매' 또는 '팔기'로 쓸 것.
3. '주가'라는 단어는 절대 쓰지 말고 '주식 가격' 또는 '가격'으로 쓸 것.
4. '시가총액'이라는 단어는 절대 쓰지 말고 '회사 규모' 또는 '회사 몸값'으로 쓸 것.
5. 'FOMO'라는 단어는 절대 쓰지 말고 '나만 빠질까 봐 생기는 조급함'으로 쓸 것.
6. 단위성 의존명사 앞은 순우리말 수관형사(한 가지, 두 가지, 세 가지 등)를 사용할 것.
7. 어려운 금융 용어(컨센서스, 가이던스, YoY, QoQ, 베이시스포인트 등)는 풀어서 설명하거나 초보자가 직관적으로 이해할 수 있는 단어로 바꿀 것.
8. [핵심] 임의로 수치나 시장 반응을 지어내지 말고, 제공된 [실제 언론 보도 팩트]와 공식 수치에만 근거하여 핵심 결과를 명쾌하게 해설할 것.
9. 반드시 한국어로 정중하고 따뜻한 어조(~했어요, ~입니다, ~좋습니다)로 정확히 2줄(줄바꿈 1회)로 요약할 것.
`.trim();

  let newsSection = '';
  if (newsHeadlines.length > 0) {
    newsSection = `
[실제 최신 언론 보도 팩트]
${newsHeadlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}
(위 보도 내용에서 언론들이 공통으로 전하는 핵심 사실과 시장 분위기를 반드시 요약에 반영해주세요)
`.trim();
  }

  const userPrompt = `
다음 이벤트의 발표 결과를 실제 언론 보도 팩트를 기반으로 초보자 눈높이로 딱 2줄 요약해줘:
- 이벤트명: ${title}${ticker ? ` (${ticker})` : ''}
- 지역: ${region === 'kr' ? '국내' : '미국/해외'}
${actual ? `- 실제 발표 결과치: ${actual}` : '- 형태: 비수치형 정책 문서/회의록'}
${expected ? `- 시장 예상치: ${expected}` : ''}
${previous ? `- 이전 발표치: ${previous}` : ''}

${newsSection}

출력 형식:
줄바꿈(\\n)으로 구분된 정확히 2줄의 텍스트만 출력할 것. 불필요한 서두나 따옴표 없이 본문만 출력할 것.
`.trim();

  const targetModel = await getLatestFlashModel(GEMINI_API_KEY);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  if (candidate?.finishReason === 'MAX_TOKENS') return null;

  const parts = candidate?.content?.parts || [];
  const textParts = parts.filter((p: any) => p.text && !p.thought).map((p: any) => p.text);
  const generatedText = (textParts.length > 0 ? textParts.join('') : (parts[0]?.text || '')).trim();

  const isCompletedSentence = /[.!?~'"]\s*$/.test(generatedText);
  if (generatedText && generatedText.length >= 25 && isCompletedSentence) {
    return generatedText;
  }

  return null;
}

/**
 * 언론사 꼬리표 및 노이즈 태그 제거
 */
function cleanMediaHeadline(headline: string): string {
  return headline
    .replace(/\s*[-–—|]\s*[^-–—|]+$/, '') // 맨 뒤 언론사명 제거
    .replace(/^\[[^\]]+\]\s*/, '')          // 앞쪽 [속보], [단독] 등 제거
    .replace(/^【[^】]+】\s*/, '')
    .trim();
}

/**
 * 실제 기사 헤드라인을 기반으로 안전하고 자연스러운 2줄 요약문을 합성합니다.
 */
function synthesizeNewsFallback(params: GenerateSummaryParams, newsHeadlines: string[]): string {
  const { title, actual, expected } = params;

  if (newsHeadlines.length > 0) {
    const topHeadline = cleanMediaHeadline(newsHeadlines[0]);

    const isDocumentOrReport =
      title.includes('회의록') ||
      title.includes('의사록') ||
      title.includes('보고서') ||
      title.includes('성명');

    if (isDocumentOrReport) {
      return `공개된 내용에 따르면, "${topHeadline}" 소식이 주요하게 전해졌어요.\n시장 참가자들의 반응과 향후 지표 발표를 차분히 지켜보며 긴 호흡으로 대응하는 것이 좋습니다.`;
    }

    if (actual) {
      if (expected) {
        return `${title} 결과가 ${actual}(예상: ${expected})로 발표되었으며, "${topHeadline}" 소식이 전해졌어요.\n단기적인 시장 흔들림에 흔들리지 말고 좋은 자산에 분할 적립을 이어가는 것이 좋아요.`;
      }
      return `${title} 발표 결과치가 ${actual}로 집계되었으며, "${topHeadline}" 소식이 보도되었어요.\n경제의 기초 체력을 믿고 긴 호흡으로 차분하게 시장을 지켜볼 때예요.`;
    }

    return `최신 보도에 따르면, "${topHeadline}" 관련 소식이 시장의 주목을 받고 있어요.\n단기적인 분위기에 휩쓸리기보다는 차분하게 흐름을 살피는 것이 좋습니다.`;
  }

  if (actual) {
    if (expected) {
      return `${title} 결과치가 ${actual}로 집계되어 시장 예상치(${expected})를 바탕으로 시장이 반응하고 있어요.\n기업과 경제의 기초 체력을 차분히 살피며 정기적인 분할 적립을 이어가는 것이 좋아요.`;
    }
    return `${title} 발표 결과치가 ${actual}로 공개되었어요.\n시장의 단기 흔들림에 조급해하기보다 기업의 장기 성장 흐름을 차분하게 지켜볼 때예요.`;
  }

  return `${title} 관련 내용이 시장에 전해졌어요.\n시장의 단기 반응에 휩쓸리지 말고 차분하게 흐름을 살펴보세요.`;
}

/**
 * AGENTS.md 규정 용어 정밀 필터링
 */
export function sanitizeTerms(text: string): string {
  return text
    .replace(/매수/g, '주식 구매')
    .replace(/매도/g, '주식 판매')
    .replace(/주가/g, '주식 가격')
    .replace(/시가총액/g, '회사 규모')
    .replace(/FOMO/gi, '나만 빠질까 봐 생기는 조급함')
    .replace(/1가지/g, '한 가지')
    .replace(/2가지/g, '두 가지')
    .replace(/3가지/g, '세 가지')
    .replace(/4가지/g, '네 가지')
    .replace(/5가지/g, '다섯 가지');
}
