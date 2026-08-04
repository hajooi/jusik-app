export interface ServerUserRecord {
  nickname: string;
  pin: string;
  createdAt: string;
  lastActiveAt: string;
  completedLessons: string[];
  investmentType?: string;
  typeAnswers?: Record<number, number>;
  simulatorSettings?: any;
}

declare global {
  var __jusik_server_db__: Record<string, ServerUserRecord> | undefined;
}

// 기본 마스터 계정 초기 데이터
const DEFAULT_MASTER_USERS: Record<string, ServerUserRecord> = {
  '주식부엉': {
    nickname: '주식부엉',
    pin: '418019',
    createdAt: '2026-08-04T00:00:00.000Z',
    lastActiveAt: new Date().toISOString(),
    completedLessons: ['lv0-1', 'lv0-2']
  }
};

/**
 * 서버 DB 읽기 (100% 파일 시스템 비의존 글로벌 서버 메모리 전용)
 * Vercel Serverless EROFS 에러 원천 차단
 */
export function getServerDb(): Record<string, ServerUserRecord> {
  if (!globalThis.__jusik_server_db__) {
    globalThis.__jusik_server_db__ = { ...DEFAULT_MASTER_USERS };
  }

  const db = globalThis.__jusik_server_db__;

  // 1년 경과 미접속 계정 자동 파기
  const now = Date.now();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

  Object.keys(db).forEach((nicknameKey) => {
    const user = db[nicknameKey];
    if (user && user.lastActiveAt) {
      const lastActive = new Date(user.lastActiveAt).getTime();
      if (now - lastActive > ONE_YEAR_MS) {
        delete db[nicknameKey];
      }
    }
  });

  return db;
}

/**
 * 서버 DB 저장 (파일 쓰기 연산 0건 - 메모리 동기화 전용)
 */
export function saveServerDb(db: Record<string, ServerUserRecord>) {
  globalThis.__jusik_server_db__ = db;
}
