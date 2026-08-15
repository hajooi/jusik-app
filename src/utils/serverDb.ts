import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

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

export interface CommentRecord {
  id: string;
  targetKey: string; // 'lesson-lv0-1', 'simulate', 'type-all', 'type-GATR'
  nickname: string;
  pin: string;
  content: string;
  investmentType?: string;
  createdAt: string;
  parentId?: string | null; // 대댓글 부모 ID
}

export interface SurveyStatsData {
  totalCount: number;
  typeCounts: Record<string, number>;
}

declare global {
  var __jusik_server_db__: Record<string, ServerUserRecord> | undefined;
  var __jusik_survey_stats__: SurveyStatsData | undefined;
  var __jusik_comments_db__: CommentRecord[] | undefined;
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
const SURVEY_STATS_FILE_PATH = path.join(process.cwd(), '.data', 'survey_stats.json');
const COMMENTS_FILE_PATH = path.join(process.cwd(), '.data', 'comments.json');

/**
 * Dynamically initialize Redis client using environment variables
 */
function getRedisClient(): Redis | null {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_KV_REST_API_URL ||
    process.env.UPSTASH_KV_REST_API_URL ||
    process.env.STORAGE_URL;

  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_KV_REST_API_TOKEN ||
    process.env.UPSTASH_KV_REST_API_TOKEN ||
    process.env.STORAGE_TOKEN;

  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch (e) {
      console.error('Failed to instantiate Upstash Redis client:', e);
    }
  }
  return null;
}

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
 * Async DB fetch (Supports Vercel Storage KV / Redis + local fallback)
 */
export async function getServerDbAsync(): Promise<Record<string, ServerUserRecord>> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const rawData = await redis.get<any>('jusik_server_db');
      let remoteDb: Record<string, ServerUserRecord> | null = null;
      if (typeof rawData === 'string') {
        try { remoteDb = JSON.parse(rawData); } catch (e) {}
      } else if (rawData && typeof rawData === 'object') {
        remoteDb = rawData;
      }

      if (remoteDb && typeof remoteDb === 'object') {
        const merged = { ...DEFAULT_MASTER_USERS, ...remoteDb };
        globalThis.__jusik_server_db__ = merged;
        return merged;
      }
    } catch (e) {
      console.error('Failed to fetch DB from Vercel KV/Redis:', e);
    }
  }
  return getServerDb();
}

/**
 * Async DB save (Supports Vercel Storage KV / Redis + local fallback)
 */
export async function saveServerDbAsync(db: Record<string, ServerUserRecord>): Promise<void> {
  globalThis.__jusik_server_db__ = db;
  saveDbToFile(db);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set('jusik_server_db', db);
    } catch (e) {
      console.error('Failed to save DB to Vercel KV/Redis:', e);
    }
  }
}

/**
 * Synchronous fallback getServerDb
 */
export function getServerDb(): Record<string, ServerUserRecord> {
  if (!globalThis.__jusik_server_db__) {
    globalThis.__jusik_server_db__ = loadDbFromFile();
  }

  const db = globalThis.__jusik_server_db__;
  let hasPurged = false;
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

export function saveServerDb(db: Record<string, ServerUserRecord>) {
  globalThis.__jusik_server_db__ = db;
  saveDbToFile(db);
}

/**
 * Async Survey Stats fetch
 */
export async function getSurveyStatsAsync(): Promise<SurveyStatsData> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const rawData = await redis.get<any>('jusik_survey_stats');
      let remoteStats: SurveyStatsData | null = null;
      if (typeof rawData === 'string') {
        try { remoteStats = JSON.parse(rawData); } catch (e) {}
      } else if (rawData && typeof rawData === 'object') {
        remoteStats = rawData;
      }

      if (remoteStats && typeof remoteStats === 'object') {
        globalThis.__jusik_survey_stats__ = remoteStats;
        return remoteStats;
      }
    } catch (e) {
      console.error('Failed to fetch survey stats from Vercel KV/Redis:', e);
    }
  }
  return getSurveyStats();
}

/**
 * Async Survey Stats record
 */
export async function recordSurveyResultAsync(typeCode: string): Promise<SurveyStatsData> {
  const stats = await getSurveyStatsAsync();
  stats.totalCount = (stats.totalCount || 0) + 1;
  stats.typeCounts[typeCode] = (stats.typeCounts[typeCode] || 0) + 1;

  globalThis.__jusik_survey_stats__ = stats;
  saveDbToFile(stats as any);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set('jusik_survey_stats', stats);
    } catch (e) {
      console.error('Failed to save survey stats to Vercel KV/Redis:', e);
    }
  }

  return stats;
}

export function getSurveyStats(): SurveyStatsData {
  if (!globalThis.__jusik_survey_stats__) {
    try {
      if (fs.existsSync(SURVEY_STATS_FILE_PATH)) {
        const data = fs.readFileSync(SURVEY_STATS_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          globalThis.__jusik_survey_stats__ = {
            totalCount: parsed.totalCount || 0,
            typeCounts: parsed.typeCounts || {}
          };
        }
      }
    } catch (e) {
      console.error('Failed to load survey stats file:', e);
    }
  }

  if (!globalThis.__jusik_survey_stats__) {
    globalThis.__jusik_survey_stats__ = {
      totalCount: 0,
      typeCounts: {}
    };
  }

  return globalThis.__jusik_survey_stats__;
}

export function recordSurveyResult(typeCode: string): SurveyStatsData {
  const stats = getSurveyStats();
  stats.totalCount = (stats.totalCount || 0) + 1;
  stats.typeCounts[typeCode] = (stats.typeCounts[typeCode] || 0) + 1;

  globalThis.__jusik_survey_stats__ = stats;

  try {
    const dir = path.dirname(SURVEY_STATS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SURVEY_STATS_FILE_PATH, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem fallback
  }

  return stats;
}

// ----------------------------------------------------
// COMMENTS DATABASE FUNCTIONS (Persistent Upstash Redis + Local file)
// ----------------------------------------------------

function loadCommentsFromFile(): CommentRecord[] {
  try {
    if (fs.existsSync(COMMENTS_FILE_PATH)) {
      const data = fs.readFileSync(COMMENTS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load comments from file:', e);
  }
  return [];
}

function saveCommentsToFile(comments: CommentRecord[]) {
  try {
    const dir = path.dirname(COMMENTS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COMMENTS_FILE_PATH, JSON.stringify(comments, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem fallback
  }
}

export async function getCommentsAsync(targetKey?: string): Promise<CommentRecord[]> {
  let allComments: CommentRecord[] = [];
  const redis = getRedisClient();
  if (redis) {
    try {
      const rawData = await redis.get<any>('jusik_comments_db');
      if (typeof rawData === 'string') {
        try { allComments = JSON.parse(rawData); } catch (e) {}
      } else if (Array.isArray(rawData)) {
        allComments = rawData;
      }
    } catch (e) {
      console.error('Failed to fetch comments from Redis:', e);
    }
  }

  if (allComments.length === 0) {
    if (!globalThis.__jusik_comments_db__) {
      globalThis.__jusik_comments_db__ = loadCommentsFromFile();
    }
    allComments = globalThis.__jusik_comments_db__ || [];
  } else {
    globalThis.__jusik_comments_db__ = allComments;
  }

  if (targetKey) {
    return allComments.filter((c) => c.targetKey === targetKey);
  }
  return allComments;
}

export async function addCommentAsync(newComment: CommentRecord): Promise<CommentRecord[]> {
  const all = await getCommentsAsync();
  all.push(newComment);
  globalThis.__jusik_comments_db__ = all;
  saveCommentsToFile(all);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set('jusik_comments_db', all);
    } catch (e) {
      console.error('Failed to save comment to Redis:', e);
    }
  }

  return all.filter((c) => c.targetKey === newComment.targetKey);
}

export async function deleteCommentAsync(commentId: string, requesterNickname: string, requesterPin: string): Promise<{ success: boolean; error?: string }> {
  const all = await getCommentsAsync();
  const targetIndex = all.findIndex((c) => c.id === commentId);

  if (targetIndex === -1) {
    return { success: false, error: '댓글을 찾을 수 없습니다.' };
  }

  const targetComment = all[targetIndex];
  const isMasterAdmin = (requesterNickname === '주식부엉' && requesterPin === '418019');
  const isAuthor = (targetComment.nickname === requesterNickname && targetComment.pin === requesterPin);

  if (!isMasterAdmin && !isAuthor) {
    return { success: false, error: '삭제 권한이 없습니다.' };
  }

  // Also remove direct replies if parent is deleted, or simply filter out
  const updated = all.filter((c) => c.id !== commentId && c.parentId !== commentId);
  globalThis.__jusik_comments_db__ = updated;
  saveCommentsToFile(updated);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set('jusik_comments_db', updated);
    } catch (e) {
      console.error('Failed to delete comment from Redis:', e);
    }
  }

  return { success: true };
}

