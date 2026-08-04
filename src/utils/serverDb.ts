import fs from 'fs';
import path from 'path';

export interface ServerUserRecord {
  nickname: string;
  pin: string;
  createdAt: string;
  lastActiveAt: string;
  completedLessons: string[];
  investmentType?: string;
  simulatorSettings?: any;
}

// 서버 DB 파일 저장 위치 (/tmp/jusik_server_db.json 또는 프로젝트 데이터 경로)
const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'user_db_store.json');

/**
 * 서버 DB 읽기 (1년 지난 미접속 계정 자동 파기 처리 포함)
 */
export function getServerDb(): Record<string, ServerUserRecord> {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initialDb: Record<string, ServerUserRecord> = {};
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }

    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const db: Record<string, ServerUserRecord> = JSON.parse(data);

    // 1년 경과 미접속 계정 자동 파기 (Auto Purge)
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

    if (modified) {
      saveServerDb(db);
    }

    return db;
  } catch (error) {
    console.error('getServerDb error:', error);
    return {};
  }
}

/**
 * 서버 DB 저장
 */
export function saveServerDb(db: Record<string, ServerUserRecord>) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('saveServerDb error:', error);
  }
}
