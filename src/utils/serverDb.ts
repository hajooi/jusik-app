import fs from 'fs';
import path from 'path';

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

const TMP_FILE_PATH = path.join('/tmp', 'jusik_server_db.json');

// 마스터 계정 초기 데이터
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
 * 서버 DB 읽기 (Vercel Serverless 환경 안전 메모리 + /tmp 백업 연동)
 */
export function getServerDb(): Record<string, ServerUserRecord> {
  if (globalThis.__jusik_server_db__) {
    return globalThis.__jusik_server_db__;
  }

  let db: Record<string, ServerUserRecord> = { ...DEFAULT_MASTER_USERS };

  try {
    if (fs.existsSync(TMP_FILE_PATH)) {
      const data = fs.readFileSync(TMP_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      db = { ...db, ...parsed };
    }
  } catch (error) {
    // 안전한 폴백 처리
    db = { ...DEFAULT_MASTER_USERS };
  }

  // 1년 경과 미접속 계정 자동 파기
  const now = Date.now();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  let modified = false;

  Object.keys(db).forEach((nicknameKey) => {
    const user = db[nicknameKey];
    if (user && user.lastActiveAt) {
      const lastActive = new Date(user.lastActiveAt).getTime();
      if (now - lastActive > ONE_YEAR_MS) {
        delete db[nicknameKey];
        modified = true;
      }
    }
  });

  globalThis.__jusik_server_db__ = db;

  if (modified) {
    saveServerDb(db);
  }

  return db;
}

/**
 * 서버 DB 저장 (Vercel EROFS 읽기전용 에러 100% 방지 처리)
 */
export function saveServerDb(db: Record<string, ServerUserRecord>) {
  globalThis.__jusik_server_db__ = db;

  try {
    const jsonStr = JSON.stringify(db, null, 2);
    // Vercel Serverless 환경에서 100% 쓰기 가능한 전용 임시 디렉토리만 사용 (/tmp)
    fs.writeFileSync(TMP_FILE_PATH, jsonStr, 'utf-8');
  } catch (error) {
    // Vercel 서버리스 파일 시스템 제한 에러는 서버 메모리 유지로 조용히 처리
  }
}
