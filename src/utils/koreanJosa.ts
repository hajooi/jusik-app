/**
 * 한국어 받침(종성) 유무에 따라 조사를 자동으로 알맞게 판별/부착해주는 유틸리티
 */

export type JosaPair = '은/는' | '이/가' | '을/를' | '과/와';

// 숫자 끝자리에 따른 종성(받침) 존재 여부 매핑
// 0(영), 1(일), 3(삼), 6(육), 7(칠), 8(팔) -> 받침 있음
// 2(이), 4(사), 5(오), 9(구) -> 받침 없음
const NUM_HAS_JONGSEONG: Record<string, boolean> = {
  '0': true,
  '1': true,
  '2': false,
  '3': true,
  '4': false,
  '5': false,
  '6': true,
  '7': true,
  '8': true,
  '9': false,
};

/**
 * 단어의 마지막 음절 받침 여부에 맞는 조사만 반환 ('은' | '는', '이' | '가' 등)
 */
export function getJosa(word: string, josaPair: JosaPair): string {
  if (!word) return '';
  const trimmed = word.trim();
  if (!trimmed) return '';

  const lastChar = trimmed.charAt(trimmed.length - 1);
  const charCode = lastChar.charCodeAt(0);
  const [withJongseong, withoutJongseong] = josaPair.split('/');

  // 1. 숫자인 경우
  if (lastChar >= '0' && lastChar <= '9') {
    return NUM_HAS_JONGSEONG[lastChar] ? withJongseong : withoutJongseong;
  }

  // 2. 한글 유니코드 범위: 0xAC00(가) ~ 0xD7A3(힣)
  if (charCode >= 0xAC00 && charCode <= 0xD7A3) {
    const hasJongseong = (charCode - 0xAC00) % 28 > 0;
    return hasJongseong ? withJongseong : withoutJongseong;
  }

  // 3. 한글/숫자가 아닌 경우 (영문 등) 기본 첫 번째 조사 반환
  return withJongseong;
}

/**
 * 단어에 적절한 조사를 바로 붙여서 반환
 */
export function attachJosa(word: string, josaPair: JosaPair): string {
  if (!word) return '';
  return `${word}${getJosa(word, josaPair)}`;
}
