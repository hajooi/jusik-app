// src/utils/aiSummary.ts

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface GenerateSummaryParams {
  title: string;
  ticker?: string;
  region: 'us' | 'kr';
  actual: string;
  expected?: string;
  previous?: string;
}

/**
 * Google Gemini REST API를 직접 호출하여 초보자 눈높이의 2줄 해설을 자동 생성합니다.
 * GEMINI_API_KEY가 없을 경우 신뢰성 있는 기본 룰베이스 요약문으로 안전하게 폴백합니다.
 */
export async function generateEasyEventSummary(params: GenerateSummaryParams): Promise<string> {
  const { title, ticker, region, actual, expected, previous } = params;

  if (!GEMINI_API_KEY) {
    return generateFallbackSummary(params);
  }

  const systemInstruction = `
당신은 'jusik.app(주식앱)'의 수석 금융 에디터이자 친절한 주식 멘토입니다.
초등학생이나 주식 초보자도 단번에 이해할 수 있도록 쉬운 우리말로 설명해야 합니다.

[절대 준수 규칙]
1. '매수'라는 단어는 절대 쓰지 말고 '구매' 또는 '주식 구매'로 쓸 것.
2. '매도'라는 단어는 절대 쓰지 말고 '판매' 또는 '팔기'로 쓸 것.
3. 어려운 금융 용어(컨센서스, 가이던스, YoY, QoQ, 베이시스포인트 등)는 풀어서 설명하거나 초보자가 직관적으로 이해할 수 있는 비유/단어로 바꿀 것.
4. 결과치와 예상치를 비교하여 시장에 긍정적인지(호재), 주의해야 하는지 명확히 짚어줄 것.
5. 반드시 한국어로 정중하고 따뜻한 어조(~했어요, ~입니다)로 딱 2줄(줄바꿈 1회)로 요약할 것.
`.trim();

  const userPrompt = `
다음 경제지표 또는 기업 실적 발표 결과를 초보자 눈높이로 2줄 요약해줘:
- 이벤트명: ${title}${ticker ? ` (${ticker})` : ''}
- 지역: ${region === 'kr' ? '국내' : '미국/해외'}
- 실제 발표 결과치: ${actual}
${expected ? `- 시장 예상치: ${expected}` : ''}
${previous ? `- 이전 발표치: ${previous}` : ''}

출력 형식:
줄바꿈(\\n)으로 구분된 2줄의 텍스트만 출력할 것. 불필요한 서두나 따옴표 없이 본문만 출력할 것.
`.trim();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
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
          temperature: 0.4,
          maxOutputTokens: 250,
        },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[Gemini API] Failed: ${response.status} ${response.statusText}`);
      return generateFallbackSummary(params);
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (generatedText && generatedText.length > 10) {
      return sanitizeTerms(generatedText);
    }

    return generateFallbackSummary(params);
  } catch (err) {
    console.warn('[Gemini API] Request error fallback to rule-based:', err);
    return generateFallbackSummary(params);
  }
}

/**
 * AGENTS.md 규정 용어 필터링
 */
function sanitizeTerms(text: string): string {
  return text
    .replace(/매수/g, '구매')
    .replace(/매도/g, '판매')
    .replace(/FOMO/gi, '조급함');
}

/**
 * API 키가 없거나 통신 실패 시 작동하는 안전한 룰베이스 요약 생성기
 */
function generateFallbackSummary(params: GenerateSummaryParams): string {
  const { title, actual, expected } = params;
  if (expected) {
    return `${title} 결과치가 ${actual}로 집계되어 시장 예상치(${expected})를 바탕으로 시장이 반응하고 있어요.\n기업과 경제의 펀더멘털을 차분히 살피며 정기적인 분할 적립을 이어가는 것이 좋아요.`;
  }
  return `${title} 발표 결과치가 ${actual}로 공개되었어요.\n시장의 단기 흔들림에 조급해하기보다 기업의 장기 성장 흐름을 차분하게 지켜볼 때예요.`;
}
