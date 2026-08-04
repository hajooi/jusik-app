/**
 * 닉네임 필터링 및 검증 유틸리티
 * 1. 한국어 주요 욕설 / 음란어 / 비하 단어 차단
 * 2. 시스템 예약어 (운영자, 관리자, admin 등) 선점 차단
 * 3. 길이 (2자 ~ 12자) 및 허용 문자 (한글, 영문, 숫자) 검증
 */

// 1. 시스템 예약어 (공식 관리자 사칭 방지)
const RESERVED_WORDS = [
  '운영자', '관리자', '어드민', '주식앱', 'jusikapp',
  'admin', 'administrator', 'root', 'system', 'official'
];

// 2. 비속어/음란 단어 목록
const BAD_WORDS_PATTERNS = [
  // 성적/음란 단어
  '야동', '성인', '섹스', '야동', '야사', '포르노', '자위', '보지', '자지', '섹스', '야동',
  '성기', '조건만남', '조건', '원조', '오피', '키스방', '업소',
  // 비속어/욕설
  '씨발', '시발', '씨팔', '시팔', '씨바', '시바', '쌰발', 'ㅅㅂ', 'ㅆㅂ',
  '병신', '븅신', 'ㅂㅅ', 'ㅄ',
  '개새끼', '개새', '새끼', '개색기', '개새키', 'ㄱ새끼', 'ㄱ새키',
  '지랄', 'ㅈㄹ', '존나', '좆나', '좃나', '존만', '좆', '좃',
  '미친년', '미친놈', '미친새끼', '미친',
  '꺼져', '닥쳐', '엠창', '애미', '애비', '느금마', '느금',
  '쓰레기', '틀딱', '한남', '한녀', '틀니', '개같은', '씹'
];

export interface NicknameValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * 닉네임 유효성 검사 함수
 */
export function validateNickname(nickname: string): NicknameValidationResult {
  const trimmed = nickname.trim();

  // 1. 길이 검사 (2자 ~ 12자)
  if (trimmed.length < 2) {
    return { isValid: false, message: '닉네임은 최소 2자 이상이어야 합니다.' };
  }
  if (trimmed.length > 12) {
    return { isValid: false, message: '닉네임은 최대 12자까지 입력 가능합니다.' };
  }

  // 2. 허용 문자 검사 (한글, 영문, 숫자, 공백 허용)
  const allowedPattern = /^[a-zA-Z0-9가-힣\s]+$/;
  if (!allowedPattern.test(trimmed)) {
    return { isValid: false, message: '닉네임은 한글, 영문, 숫자만 사용 가능합니다.' };
  }

  const lowerStr = trimmed.toLowerCase();

  // 3. 예약어 검사
  for (const reserved of RESERVED_WORDS) {
    if (lowerStr.includes(reserved.toLowerCase())) {
      return { isValid: false, message: `'${reserved}'(은)는 시스템 예약어로 사용할 수 없는 닉네임입니다.` };
    }
  }

  // 4. 비속어/음란 단어 검사
  for (const badWord of BAD_WORDS_PATTERNS) {
    if (lowerStr.includes(badWord.toLowerCase())) {
      return { isValid: false, message: '사용할 수 없는 닉네임 단어가 포함되어 있습니다.' };
    }
  }

  return { isValid: true };
}
