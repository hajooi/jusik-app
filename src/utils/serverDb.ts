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

const DB_FILE_PATH = path.join(process.cwd(), '.data', 'users.json');

function loadDbFromFile(): Record<string, ServerUserRecord> {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_MASTER_USERS, ...parsed };
      }
    }
  } catch (e) {
    console.error('Failed to load server db from file:', e);
  }
  return { ...DEFAULT_MASTER_USERS };
}

function saveDbToFile(db: Record<string, ServerUserRecord>) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    // Vercel serverless read-only filesystem fallback
  }
}

/**
 * 서버 DB 읽기 (글로벌 메모리 + 파일 시스템 동기화)
 * 1년 미접속 계정 자동 파기 검증 포함
 */
export function getServerDb(): Record<string, ServerUserRecord> {
  if (!globalThis.__jusik_server_db__) {
    globalThis.__jusik_server_db__ = loadDbFromFile();
  }

  const db = globalThis.__jusik_server_db__;
  let hasPurged = false;

  // 1년 경과 미접속 계정 자동 파기 (1년 파기 정책 유지)
  const now = Date.now();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

  Object.keys(db).forEach((nicknameKey) => {
    const user = db[nicknameKey];
    if (user && user.lastActiveAt) {
      const lastActive = new Date(user.lastActiveAt).getTime();
      if (now - lastActive > ONE_YEAR_MS) {
        delete db[nicknameKey];
        hasPurged = true;
      }
    }
  });

  if (hasPurged) {
    saveDbToFile(db);
  }

  return db;
}

/**
 * 서버 DB 저장 (글로벌 메모리 + 로컬 파일 동시 저장)
 */
export function saveServerDb(db: Record<string, ServerUserRecord>) {
  globalThis.__jusik_server_db__ = db;
  saveDbToFile(db);
}
