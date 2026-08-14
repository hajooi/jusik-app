/**
 * 한국어 받침(종성) 유무에 따라 조사를 자동으로 알맞게 부착해주는 유틸리티
 */
export function attachJosa(word: string, josaPair: '은/는' | '이/가' | '을/를' | '과/와'): string {
  if (!word) return '';
  const lastChar = word.charCodeAt(word.length - 1);
  // 한글 유니코드 범위: 0xAC00(가) ~ 0xD7A3(힣)
  if (lastChar < 0xAC00 || lastChar > 0xD7A3) {
    // 한글이 아닌 경우 기본 첫 번째 조사 반환
    const defaultJosa = josaPair.split('/')[0];
    return `${word}${defaultJosa}`;
  }

  // 종성(받침) 여부: (lastChar - 0xAC00) % 28 > 0 이면 받침 있음
  const hasJongseong = (lastChar - 0xAC00) % 28 > 0;

  if (josaPair === '은/는') return `${word}${hasJongseong ? '은' : '는'}`;
  if (josaPair === '이/가') return `${word}${hasJongseong ? '이' : '가'}`;
  if (josaPair === '을/를') return `${word}${hasJongseong ? '을' : '를'}`;
  if (josaPair === '과/와') return `${word}${hasJongseong ? '과' : '와'}`;

  return word;
}
