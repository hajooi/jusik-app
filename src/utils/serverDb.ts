import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from '@/lib/supabase';

export interface ServerUserRecord {
  nickname: string;
  pin: string;
  createdAt: string;
  lastActiveAt: string;
  completedLessons: string[];
  investmentType?: string;
  typeAnswers?: Record<number, number>;
  simulatorSettings?: any;
  avatarUrl?: string;
}

export interface CommentRecord {
  id: string;
  targetKey: string; // 'lesson-lv0-1', 'simulate', 'type-all', 'type-GATR'
  nickname: string;
  pin: string;
  content: string;
  avatarUrl?: string;
  investmentType?: string;
  typeScores?: { g: number; a: number; l: number; r: number };
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

// 로컬 개발 환경 격리 모드 (npm run dev 실행 시 운영 DB 오염 방지)
// 로컬에서 운영 DB를 직접 테스트하고 싶을 때만 .env.local 에 USE_PROD_DB=true 설정
const isLocalDevMode = (): boolean => {
  return process.env.NODE_ENV === 'development' && process.env.USE_PROD_DB !== 'true';
};

// 기본 마스터 계정 초기 데이터
const DEFAULT_MASTER_USERS: Record<string, ServerUserRecord> = {
  '주식부엉': {
    nickname: '주식부엉',
    pin: '418019',
    createdAt: '2026-08-04T00:00:00.000Z',
    lastActiveAt: new Date().toISOString(),
    completedLessons: ['lv0-1', 'lv0-2', 'lv0-3', 'lv1-1', 'lv1-2', 'lv1-3'],
    investmentType: 'GATR'
  }
};

const DB_FILE_PATH = path.join(process.cwd(), '.data', 'users.json');
const SURVEY_STATS_FILE_PATH = path.join(process.cwd(), '.data', 'survey_stats.json');
const COMMENTS_FILE_PATH = path.join(process.cwd(), '.data', 'comments.json');

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

// ----------------------------------------------------
// USERS DATABASE FUNCTIONS (Supabase on Prod, Local file on Dev)
// ----------------------------------------------------

export async function getServerDbAsync(): Promise<Record<string, ServerUserRecord>> {
  if (isLocalDevMode()) {
    return getServerDb();
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        const db: Record<string, ServerUserRecord> = { ...DEFAULT_MASTER_USERS };
        data.forEach((row: any) => {
          db[row.nickname] = {
            nickname: row.nickname,
            pin: row.pin,
            createdAt: row.created_at || new Date().toISOString(),
            lastActiveAt: row.last_active_at || new Date().toISOString(),
            completedLessons: Array.isArray(row.completed_lessons) ? row.completed_lessons : [],
            investmentType: row.investment_type || undefined,
            typeAnswers: row.type_answers || undefined,
            simulatorSettings: row.simulator_settings || undefined,
            avatarUrl: row.avatar_url || undefined,
          };
        });
        globalThis.__jusik_server_db__ = db;
        return db;
      } else if (error) {
        console.error('Supabase users select error:', error.message);
      }
    } catch (e) {
      console.error('Failed to fetch users from Supabase:', e);
    }
  }
  return getServerDb();
}

export async function saveServerDbAsync(db: Record<string, ServerUserRecord>): Promise<void> {
  globalThis.__jusik_server_db__ = db;
  saveDbToFile(db);

  if (isLocalDevMode()) {
    return;
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const rows = Object.values(db).map((u) => ({
        nickname: u.nickname,
        pin: u.pin,
        created_at: u.createdAt,
        last_active_at: u.lastActiveAt,
        completed_lessons: u.completedLessons || [],
        investment_type: u.investmentType || null,
        type_answers: u.typeAnswers || null,
        simulator_settings: u.simulatorSettings || null,
        avatar_url: u.avatarUrl || null,
      }));

      if (rows.length > 0) {
        const { error } = await supabase.from('users').upsert(rows, { onConflict: 'nickname' });
        if (error) {
          console.error('Supabase users upsert error:', error.message);
        }
      }
    } catch (e) {
      console.error('Failed to save users to Supabase:', e);
    }
  }
}

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

// ----------------------------------------------------
// SURVEY STATS FUNCTIONS (Supabase on Prod, Local file on Dev)
// ----------------------------------------------------

export async function getSurveyStatsAsync(): Promise<SurveyStatsData> {
  if (isLocalDevMode()) {
    return getSurveyStats();
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('survey_stats').select('*');
      if (!error && data) {
        let total = 0;
        const typeCounts: Record<string, number> = {};
        data.forEach((row: any) => {
          const count = Number(row.count) || 0;
          typeCounts[row.type_code] = count;
          total += count;
        });
        const stats: SurveyStatsData = { totalCount: total, typeCounts };
        globalThis.__jusik_survey_stats__ = stats;
        return stats;
      } else if (error) {
        console.error('Supabase survey_stats select error:', error.message);
      }
    } catch (e) {
      console.error('Failed to fetch survey stats from Supabase:', e);
    }
  }
  return getSurveyStats();
}

export async function recordSurveyResultAsync(typeCode: string): Promise<SurveyStatsData> {
  if (isLocalDevMode()) {
    return recordSurveyResult(typeCode);
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('survey_stats')
        .select('count')
        .eq('type_code', typeCode)
        .maybeSingle();

      const newCount = (existing?.count ? Number(existing.count) : 0) + 1;
      const { error } = await supabase.from('survey_stats').upsert({
        type_code: typeCode,
        count: newCount,
      }, { onConflict: 'type_code' });

      if (error) {
        console.error('Supabase survey_stats upsert error:', error.message);
      } else {
        return await getSurveyStatsAsync();
      }
    } catch (e) {
      console.error('Failed to record survey result to Supabase:', e);
    }
  }

  return recordSurveyResult(typeCode);
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
// COMMENTS DATABASE FUNCTIONS (Supabase on Prod, Local file on Dev)
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
  if (isLocalDevMode()) {
    let local = globalThis.__jusik_comments_db__ || loadCommentsFromFile();
    globalThis.__jusik_comments_db__ = local;
    if (targetKey) {
      return local.filter((c) => c.targetKey === targetKey);
    }
    return local;
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let query = supabase.from('comments').select('*').order('created_at', { ascending: true });
      if (targetKey) {
        query = query.eq('target_key', targetKey);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          targetKey: row.target_key,
          nickname: row.nickname,
          pin: row.pin,
          content: row.content,
          avatarUrl: row.avatar_url || undefined,
          investmentType: row.investment_type || undefined,
          typeScores: row.type_scores || undefined,
          createdAt: row.created_at,
          parentId: row.parent_id || null,
        }));
      } else if (error) {
        console.error('Supabase comments select error:', error.message);
      }
    } catch (e) {
      console.error('Failed to fetch comments from Supabase:', e);
    }
  }

  // Fallback to local
  let allComments = globalThis.__jusik_comments_db__ || loadCommentsFromFile();
  globalThis.__jusik_comments_db__ = allComments;
  if (targetKey) {
    return allComments.filter((c) => c.targetKey === targetKey);
  }
  return allComments;
}

export async function addCommentAsync(newComment: CommentRecord): Promise<CommentRecord[]> {
  if (isLocalDevMode()) {
    const all = await getCommentsAsync();
    all.push(newComment);
    globalThis.__jusik_comments_db__ = all;
    saveCommentsToFile(all);
    return all.filter((c) => c.targetKey === newComment.targetKey);
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase.from('comments').insert({
        id: newComment.id,
        target_key: newComment.targetKey,
        nickname: newComment.nickname,
        pin: newComment.pin,
        content: newComment.content,
        avatar_url: newComment.avatarUrl || null,
        investment_type: newComment.investmentType || null,
        type_scores: newComment.typeScores || null,
        created_at: newComment.createdAt,
        parent_id: newComment.parentId || null,
      });

      if (error) {
        console.error('Supabase comments insert error:', error.message);
      } else {
        return await getCommentsAsync(newComment.targetKey);
      }
    } catch (e) {
      console.error('Failed to insert comment to Supabase:', e);
    }
  }

  // Fallback
  const all = await getCommentsAsync();
  all.push(newComment);
  globalThis.__jusik_comments_db__ = all;
  saveCommentsToFile(all);
  return all.filter((c) => c.targetKey === newComment.targetKey);
}

export async function deleteCommentAsync(
  commentId: string,
  requesterNickname: string,
  requesterPin: string
): Promise<{ success: boolean; error?: string }> {
  const isMasterAdmin = (requesterNickname === '주식부엉' && requesterPin === '418019');

  if (isLocalDevMode()) {
    const all = await getCommentsAsync();
    const targetIndex = all.findIndex((c) => c.id === commentId);
    if (targetIndex === -1) {
      return { success: false, error: '댓글을 찾을 수 없습니다.' };
    }

    const targetComment = all[targetIndex];
    const isAuthor = (targetComment.nickname === requesterNickname && targetComment.pin === requesterPin);
    if (!isMasterAdmin && !isAuthor) {
      return { success: false, error: '삭제 권한이 없습니다.' };
    }

    const updated = all.filter((c) => c.id !== commentId && c.parentId !== commentId);
    globalThis.__jusik_comments_db__ = updated;
    saveCommentsToFile(updated);
    return { success: true };
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: targetComment, error: fetchErr } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .maybeSingle();

      if (fetchErr || !targetComment) {
        return { success: false, error: '댓글을 찾을 수 없습니다.' };
      }

      const isAuthor = (targetComment.nickname === requesterNickname && targetComment.pin === requesterPin);
      if (!isMasterAdmin && !isAuthor) {
        return { success: false, error: '삭제 권한이 없습니다.' };
      }

      // Delete target comment and its direct replies
      const { error: deleteErr } = await supabase
        .from('comments')
        .delete()
        .or(`id.eq.${commentId},parent_id.eq.${commentId}`);

      if (deleteErr) {
        console.error('Supabase comment delete error:', deleteErr.message);
        return { success: false, error: '댓글 삭제 중 오류가 발생했습니다.' };
      }

      return { success: true };
    } catch (e) {
      console.error('Failed to delete comment from Supabase:', e);
    }
  }

  // Fallback
  const all = await getCommentsAsync();
  const targetIndex = all.findIndex((c) => c.id === commentId);
  if (targetIndex === -1) {
    return { success: false, error: '댓글을 찾을 수 없습니다.' };
  }

  const targetComment = all[targetIndex];
  const isAuthor = (targetComment.nickname === requesterNickname && targetComment.pin === requesterPin);
  if (!isMasterAdmin && !isAuthor) {
    return { success: false, error: '삭제 권한이 없습니다.' };
  }

  const updated = all.filter((c) => c.id !== commentId && c.parentId !== commentId);
  globalThis.__jusik_comments_db__ = updated;
  saveCommentsToFile(updated);

  return { success: true };
}
