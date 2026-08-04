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

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'user_db_store.json');
const TMP_FILE_PATH = path.join('/tmp', 'jusik_server_db.json');

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
 * 서버 DB 읽기 (서버 메모리 + 파일 지속성 연동)
 */
export function getServerDb(): Record<string, ServerUserRecord> {
  if (globalThis.__jusik_server_db__) {
    return globalThis.__jusik_server_db__;
  }

  let db: Record<string, ServerUserRecord> = {};

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      db = JSON.parse(data);
    } else if (fs.existsSync(TMP_FILE_PATH)) {
      const data = fs.readFileSync(TMP_FILE_PATH, 'utf-8');
      db = JSON.parse(data);
    } else {
      db = { ...DEFAULT_MASTER_USERS };
    }
  } catch (error) {
    console.error('getServerDb read error:', error);
    db = { ...DEFAULT_MASTER_USERS };
  }

  // 1년 경과 미접속 계정 자동 파기
  const now = Date.now();
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  let modified = false;

  Object.keys(db).forEach((nicknameKey) => {
    const user = db[nicknameKey];
    const lastActive = new Date(user.lastActiveAt).getTime();
    if (now - lastActive > ONE_YEAR_MS) {
      delete db[nicknameKey];
      modified = true;
    }
  });

  globalThis.__jusik_server_db__ = db;

  if (modified) {
    saveServerDb(db);
  }

  return db;
}

/**
 * 서버 DB 실시간 동기화 저장
 */
export function saveServerDb(db: Record<string, ServerUserRecord>) {
  globalThis.__jusik_server_db__ = db;

  try {
    const jsonStr = JSON.stringify(db, null, 2);
    
    // 1. 프로젝트 파일 저장
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, jsonStr, 'utf-8');

    // 2. /tmp 백업 저장
    fs.writeFileSync(TMP_FILE_PATH, jsonStr, 'utf-8');
  } catch (error) {
    console.error('saveServerDb write error:', error);
  }
}
