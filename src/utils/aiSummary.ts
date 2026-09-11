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

// 메모리 캐싱: 실행 시간 동안 모델 목록을 매번 찌르지 않도록 최근 감지된 최신 모델명 보관 (1시간 유효)
let cachedLatestModel: { name: string; expiresAt: number } | null = null;

/**
 * Google API에서 현재 사용 가능한 정식 모델 중 가장 최신 버전의 Flash 모델명을 동적으로 자동 탐색합니다.
 * 신규 모델(3.9, 4.0 등) 출시 시 코드 수정 없이도 항상 가장 최신 정규 버전을 자동으로 선택합니다.
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

      // generateContent를 지원하는 flash 정식 모델 필터링
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

      // 버전 번호(숫자)를 기준으로 내림차순 정렬하여 가장 높은 최신 버전 추출
      flashModels.sort((a, b) => {
        const parseVersion = (str: string) => {
          const match = str.match(/gemini-(\d+(\.\d+)?)/);
          return match ? parseFloat(match[1]) : 0;
        };
        return parseVersion(b) - parseVersion(a);
      });

      if (flashModels.length > 0 && flashModels[0]) {
        const bestModel = flashModels[0];
        cachedLatestModel = { name: bestModel, expiresAt: now + 1000 * 60 * 60 }; // 1시간 캐시
        return bestModel;
      }
    }
  } catch (err) {
    console.warn('[Gemini API] Failed to fetch latest models dynamically:', err);
  }

  return 'gemini-3.8-flash'; // 비상 기본값
}

/**
 * Google Gemini REST API를 직접 호출하여 초보자 눈높이의 2줄 해설을 자동 생성합니다.
 * 실시간 최신 Flash 모델을 동적으로 찾아 사용하며, 실패 시 룰베이스 요약문으로 안전하게 폴백합니다.
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
          temperature: 0.4,
          maxOutputTokens: 1000,
        },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[Gemini API] Failed (${targetModel}): ${response.status} ${response.statusText}`);
      return generateFallbackSummary(params);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    
    // MAX_TOKENS 도달로 중간에 잘린 경우 안전하게 폴백
    if (candidate?.finishReason === 'MAX_TOKENS') {
      console.warn('[Gemini API] Generation stopped prematurely due to MAX_TOKENS limit. Falling back to rule-based summary.');
      return generateFallbackSummary(params);
    }

    // Thinking 모델 대응: thought 파트를 제외하고 실제 text 파트만 결합
    const parts = candidate?.content?.parts || [];
    const textParts = parts
      .filter((p: any) => p.text && !p.thought)
      .map((p: any) => p.text);
    const generatedText = (textParts.length > 0 ? textParts.join('') : (parts[0]?.text || '')).trim();

    // 완결된 문장 검증: 25자 이상이며 문장 종결 부호(., !, ?, ")로 끝맺음되어야 함
    const isCompletedSentence = /[.!?~'"]\s*$/.test(generatedText);

    if (generatedText && generatedText.length >= 25 && isCompletedSentence) {
      return sanitizeTerms(generatedText);
    }

    console.warn(`[Gemini API] Incomplete or short output detected ("${generatedText}"). Falling back to rule-based summary.`);
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
