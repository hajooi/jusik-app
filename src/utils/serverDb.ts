import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from '@/lib/supabase';
import { calculateSurveyResult } from '@/data/investmentSurvey';

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
  activeBadge?: string;
  termsQuizBest?: {
    level?: number;
    score?: number;
    correctCount?: number;
    timeSpentSec?: number;
    percentile?: number;
    badgeName?: string;
  };
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
  activeBadge?: string;
  termsQuiz?: {
    level?: number;
    score?: number;
    correctCount?: number;
    totalQuestions?: number;
    timeSpentSec?: number;
    percentile?: number;
    badgeName?: string;
  };
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
    investmentType: 'GATR',
    typeAnswers: {
      1: 2, 2: 3, 3: 2, 4: 3, 5: 2, 6: 3, 7: 2, 8: 3, 9: 2, 10: 2, // G 60%
      11: 2, 12: 4, 13: 2, 14: 4, 15: 2, 16: 4, 17: 2, 18: 4, 19: 2, 20: 3, // A 73%
      21: 4, 22: 3, 23: 4, 24: 3, 25: 4, 26: 3, 27: 4, 28: 3, 29: 4, 30: 3, // L 38% (T 62%)
      31: 1, 32: 5, 33: 1, 34: 5, 35: 1, 36: 5, 37: 1, 38: 4, 39: 1, 40: 3  // R 93%
    }
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
          const settings = row.simulator_settings || {};
          const isFull = row.type_answers && typeof row.type_answers === 'object' && Object.keys(row.type_answers).length === 40;
          
          let validatedTypeAnswers = isFull ? row.type_answers : undefined;
          let validatedInvestmentType = row.investment_type || undefined;

          // '주식부엉' 계정의 성향 데이터가 오염되었거나 누락된 경우 기본 마스터 GATR 데이터로 즉시 자동 복원
          if (row.nickname === '주식부엉' && (!isFull || !validatedInvestmentType || validatedInvestmentType !== 'GATR')) {
            validatedTypeAnswers = DEFAULT_MASTER_USERS['주식부엉'].typeAnswers;
            validatedInvestmentType = 'GATR';
          }

          db[row.nickname] = {
            nickname: row.nickname,
            pin: row.pin,
            createdAt: row.created_at || new Date().toISOString(),
            lastActiveAt: row.last_active_at || new Date().toISOString(),
            completedLessons: Array.isArray(row.completed_lessons) ? row.completed_lessons : [],
            investmentType: validatedInvestmentType,
            typeAnswers: validatedTypeAnswers,
            simulatorSettings: row.simulator_settings || undefined,
            avatarUrl: row.avatar_url || undefined,
            activeBadge: settings.activeBadge || undefined,
            termsQuizBest: settings.termsQuizBest || undefined,
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
      const rows = Object.values(db).map((u) => {
        const currentSettings = u.simulatorSettings || {};
        const safeSettings = {
          ...currentSettings,
          activeBadge: u.activeBadge || currentSettings.activeBadge || null,
          termsQuizBest: u.termsQuizBest || currentSettings.termsQuizBest || null,
        };

        const isFull = u.typeAnswers && typeof u.typeAnswers === 'object' && Object.keys(u.typeAnswers).length === 40;

        return {
          nickname: u.nickname,
          pin: u.pin,
          created_at: u.createdAt,
          last_active_at: u.lastActiveAt,
          completed_lessons: u.completedLessons || [],
          investment_type: u.investmentType || null,
          type_answers: isFull ? u.typeAnswers : (u.nickname === '주식부엉' ? DEFAULT_MASTER_USERS['주식부엉'].typeAnswers : null),
          simulator_settings: safeSettings,
          avatar_url: u.avatarUrl || null,
        };
      });

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
  let rawComments: CommentRecord[] = [];

  if (isLocalDevMode()) {
    let local = globalThis.__jusik_comments_db__ || loadCommentsFromFile();
    globalThis.__jusik_comments_db__ = local;
    rawComments = local;
  } else {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        let query = supabase.from('comments').select('*').order('created_at', { ascending: true });
        if (targetKey) {
          query = query.eq('target_key', targetKey);
        }
        const { data, error } = await query;
        if (!error && data) {
          rawComments = data.map((row: any) => ({
            id: row.id,
            targetKey: row.target_key,
            nickname: row.nickname,
            pin: row.pin,
            content: row.content,
            avatarUrl: row.avatar_url || undefined,
            investmentType: row.investment_type || undefined,
            typeScores: row.type_scores || undefined,
            activeBadge: row.active_badge || undefined,
            termsQuiz: row.terms_quiz || undefined,
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

    if (rawComments.length === 0) {
      // Fallback to local
      let allComments = globalThis.__jusik_comments_db__ || loadCommentsFromFile();
      globalThis.__jusik_comments_db__ = allComments;
      rawComments = allComments;
    }
  }

  // Filter by targetKey if provided
  const filtered = targetKey ? rawComments.filter((c) => c.targetKey === targetKey) : rawComments;

  // Real-time enrichment: join with latest user profile in server DB
  try {
    const userDb = await getServerDbAsync();
    return filtered.map((c) => {
      const u = userDb[c.nickname] || userDb[c.nickname.toLowerCase()];
      if (u) {
        let typeScores = c.typeScores;
        if (u.typeAnswers && Object.keys(u.typeAnswers).length > 0) {
          try {
            const surveyRes = calculateSurveyResult(u.typeAnswers);
            if (surveyRes?.scores) {
              typeScores = {
                g: surveyRes.scores.GS.G,
                a: surveyRes.scores.AP.A,
                l: surveyRes.scores.LT.L,
                r: surveyRes.scores.RI.R,
              };
            }
          } catch (e) {
            // ignore
          }
        }
        return {
          ...c,
          avatarUrl: (u.avatarUrl !== undefined && u.avatarUrl !== null) ? u.avatarUrl : c.avatarUrl,
          investmentType: (u.investmentType && u.investmentType !== '미진단') ? u.investmentType : c.investmentType,
          typeScores,
          activeBadge: u.activeBadge || c.activeBadge || 'investmentType',
          termsQuiz: u.termsQuizBest || c.termsQuiz,
        };
      }
      return c;
    });
  } catch (e) {
    return filtered;
  }
}

// 유저 프로필 변경 시 해당 유저의 기존 작성 댓글 아바타 일괄 동기화 (로컬 파일 & Supabase DB)
export async function updateCommentsForUserAsync(nickname: string, avatarUrl: string): Promise<void> {
  try {
    // 1. Local / In-memory comments update
    let allComments = globalThis.__jusik_comments_db__ || loadCommentsFromFile();
    let hasChanges = false;
    allComments = allComments.map((c) => {
      if (c.nickname === nickname || c.nickname.toLowerCase() === nickname.toLowerCase()) {
        hasChanges = true;
        return {
          ...c,
          avatarUrl: avatarUrl ? avatarUrl : undefined,
        };
      }
      return c;
    });

    if (hasChanges) {
      globalThis.__jusik_comments_db__ = allComments;
      saveCommentsToFile(allComments);
    }

    // 2. Production Supabase comments update
    if (!isLocalDevMode()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase
          .from('comments')
          .update({ avatar_url: avatarUrl || null })
          .eq('nickname', nickname);
      }
    }
  } catch (err) {
    console.error('Failed to sync avatarUrl to comments:', err);
  }
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

// ----------------------------------------------------
// TERMS QUIZ LEADERBOARD FUNCTIONS
// ----------------------------------------------------

export interface TermsQuizLeaderboardEntry {
  id: string;
  nickname: string;
  level: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSec: number;
  createdAt: string;
  avatarUrl?: string;
  investmentType?: string;
  typeScores?: { g: number; a: number; l: number; r: number };
  percentile?: number;
  activeBadge?: string;
  termsQuizBest?: {
    level?: number;
    score?: number;
    correctCount?: number;
    timeSpentSec?: number;
    percentile?: number;
    badgeName?: string;
  };
}

const QUIZ_FILE_PATH = path.join(process.cwd(), '.data', 'terms_quiz.json');

declare global {
  var __jusik_quiz_db__: TermsQuizLeaderboardEntry[] | undefined;
}

function loadQuizFromFile(): TermsQuizLeaderboardEntry[] {
  try {
    if (fs.existsSync(QUIZ_FILE_PATH)) {
      const data = fs.readFileSync(QUIZ_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load quiz db from file:', e);
  }
  return [];
}

function saveQuizToFile(entries: TermsQuizLeaderboardEntry[]) {
  try {
    const dir = path.dirname(QUIZ_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(QUIZ_FILE_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem fallback
  }
}

export async function getTermsQuizEntriesAsync(level?: number): Promise<TermsQuizLeaderboardEntry[]> {
  // 1. 로컬 개발 모드: 로컬 파일 격리
  if (isLocalDevMode()) {
    let all: TermsQuizLeaderboardEntry[] = [];
    if (!globalThis.__jusik_quiz_db__) {
      globalThis.__jusik_quiz_db__ = loadQuizFromFile();
    }
    all = [...globalThis.__jusik_quiz_db__];

    if (level) {
      all = all.filter((entry) => entry.level === level);
    }

    all.sort((a, b) => {
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      if (a.timeSpentSec !== b.timeSpentSec) return a.timeSpentSec - b.timeSpentSec;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const userDb = getServerDb();
    return all.map((entry) => attachUserMetadata(entry, userDb));
  }

  // 2. 운영 환경: Supabase users DB 기반 영구 리더보드 조회 (로컬 파일 완전 배제)
  try {
    const userDb = await getServerDbAsync();
    let all: TermsQuizLeaderboardEntry[] = [];

    // Collect all quiz entries from Supabase user records only
    const userEntries: TermsQuizLeaderboardEntry[] = [];
    Object.values(userDb).forEach((u) => {
      const settings = u.simulatorSettings as any;
      if (settings && Array.isArray(settings.__quizEntries)) {
        settings.__quizEntries.forEach((entry: TermsQuizLeaderboardEntry) => {
          userEntries.push(entry);
        });
      } else if (u.termsQuizBest) {
        userEntries.push({
          id: `quiz_user_${u.nickname}_${u.termsQuizBest.level || 1}`,
          nickname: u.nickname,
          level: u.termsQuizBest.level || 1,
          score: u.termsQuizBest.score || 0,
          correctCount: u.termsQuizBest.correctCount || 0,
          totalQuestions: 15,
          timeSpentSec: u.termsQuizBest.timeSpentSec || 0,
          createdAt: u.lastActiveAt || u.createdAt,
          avatarUrl: u.avatarUrl,
          investmentType: u.investmentType,
          percentile: u.termsQuizBest.percentile,
          termsQuizBest: u.termsQuizBest,
        });
      }
    });

    // Keep best score per user per level
    const combinedMap = new Map<string, TermsQuizLeaderboardEntry>();
    userEntries.forEach((entry) => {
      const key = `${entry.nickname}_lvl_${entry.level}`;
      const existing = combinedMap.get(key);
      if (!existing) {
        combinedMap.set(key, entry);
      } else {
        const isBetter =
          entry.correctCount > existing.correctCount ||
          (entry.correctCount === existing.correctCount && entry.timeSpentSec < existing.timeSpentSec);
        if (isBetter) {
          combinedMap.set(key, entry);
        }
      }
    });

    all = Array.from(combinedMap.values());

    if (level) {
      all = all.filter((entry) => entry.level === level);
    }

    all.sort((a, b) => {
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      if (a.timeSpentSec !== b.timeSpentSec) return a.timeSpentSec - b.timeSpentSec;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return all.map((entry) => attachUserMetadata(entry, userDb));
  } catch (e) {
    console.error('Failed to get quiz entries from Supabase:', e);
    return [];
  }
}

function attachUserMetadata(entry: TermsQuizLeaderboardEntry, userDb: Record<string, ServerUserRecord>): TermsQuizLeaderboardEntry {
  const u = userDb[entry.nickname] || userDb[entry.nickname.toLowerCase()];
  let effectiveType = entry.investmentType;
  let typeScores = entry.typeScores;
  let activeBadge = entry.activeBadge || 'investmentType';
  let avatarUrl = entry.avatarUrl;
  let termsQuizBest = entry.termsQuizBest;

  if (u) {
    avatarUrl = u.avatarUrl || entry.avatarUrl;
    effectiveType = (u.investmentType && u.investmentType !== '미진단') ? u.investmentType : entry.investmentType;
    activeBadge = u.activeBadge || 'investmentType';
    termsQuizBest = u.termsQuizBest || entry.termsQuizBest;

    if (u.typeAnswers && Object.keys(u.typeAnswers).length > 0) {
      try {
        const surveyRes = calculateSurveyResult(u.typeAnswers);
        if (surveyRes?.scores) {
          typeScores = {
            g: surveyRes.scores.GS.G,
            a: surveyRes.scores.AP.A,
            l: surveyRes.scores.LT.L,
            r: surveyRes.scores.RI.R,
          };
        }
      } catch (e) {}
    }
  }

  if (!typeScores && effectiveType && effectiveType !== '미진단' && effectiveType.length === 4) {
    const code = effectiveType.toUpperCase();
    typeScores = {
      g: code[0] === 'G' ? 70 : 30,
      a: code[1] === 'A' ? 70 : 30,
      l: code[2] === 'L' ? 70 : 30,
      r: code[3] === 'R' ? 70 : 30,
    };
  }

  return {
    ...entry,
    avatarUrl,
    investmentType: effectiveType,
    typeScores,
    activeBadge,
    termsQuizBest,
  };
}

export async function saveTermsQuizEntryAsync(
  entry: Omit<TermsQuizLeaderboardEntry, 'id' | 'createdAt'>
): Promise<{ success: boolean; entry: TermsQuizLeaderboardEntry; percentile: number; rank: number; totalParticipants: number }> {
  const newEntry: TermsQuizLeaderboardEntry = {
    ...entry,
    id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  if (!globalThis.__jusik_quiz_db__) {
    globalThis.__jusik_quiz_db__ = loadQuizFromFile();
  }

  // Keep best score per user per level in memory/file
  const existingIndex = globalThis.__jusik_quiz_db__.findIndex(
    (e) => e.nickname === entry.nickname && e.level === entry.level
  );

  if (existingIndex >= 0) {
    const existing = globalThis.__jusik_quiz_db__[existingIndex];
    const isNewBetter =
      entry.correctCount > existing.correctCount ||
      (entry.correctCount === existing.correctCount && entry.timeSpentSec < existing.timeSpentSec);
    if (isNewBetter) {
      globalThis.__jusik_quiz_db__[existingIndex] = newEntry;
    }
  } else {
    globalThis.__jusik_quiz_db__.push(newEntry);
  }

  saveQuizToFile(globalThis.__jusik_quiz_db__);

  // Calculate rank and percentile for this level first
  const allEntries = await getTermsQuizEntriesAsync(entry.level);
  const totalParticipants = Math.max(1, allEntries.length);
  const userRankIndex = allEntries.findIndex((e) => e.nickname === entry.nickname);
  const rank = userRankIndex >= 0 ? userRankIndex + 1 : totalParticipants;
  // 1위만 상위 1%, 나머지는 산출 공식 적용 (2% ~ 99%)
  const percentile = rank === 1 ? 1 : Math.max(2, Math.min(99, Math.round((rank / totalParticipants) * 100)));

  newEntry.percentile = percentile;

  // 운영 환경: Supabase users 레코드에 영구 저장 (배포 시 초기화 방지)
  if (!isLocalDevMode()) {
    try {
      const userDb = await getServerDbAsync();
      let userRecord = userDb[entry.nickname] || userDb[entry.nickname.toLowerCase()];
      if (!userRecord) {
        userRecord = {
          nickname: entry.nickname,
          pin: '000000',
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          completedLessons: [],
          investmentType: entry.investmentType,
          avatarUrl: entry.avatarUrl,
          simulatorSettings: {},
        };
      }

      const settings = userRecord.simulatorSettings || {};
      const quizList: TermsQuizLeaderboardEntry[] = Array.isArray(settings.__quizEntries) ? settings.__quizEntries : [];
      const idx = quizList.findIndex((q) => q.level === entry.level);
      if (idx >= 0) {
        const prev = quizList[idx];
        if (entry.correctCount > prev.correctCount || (entry.correctCount === prev.correctCount && entry.timeSpentSec < prev.timeSpentSec)) {
          quizList[idx] = newEntry;
        }
      } else {
        quizList.push(newEntry);
      }
      settings.__quizEntries = quizList;

      // Update termsQuizBest if this entry is overall best
      const prevBest = userRecord.termsQuizBest;
      const isOverallBetter = !prevBest || entry.score > (prevBest.score || 0) || (entry.score === prevBest.score && entry.timeSpentSec < (prevBest.timeSpentSec || 999));
      if (isOverallBetter) {
        userRecord.termsQuizBest = {
          level: entry.level,
          score: entry.score,
          correctCount: entry.correctCount,
          timeSpentSec: entry.timeSpentSec,
          percentile,
          badgeName: entry.level === 4 && entry.correctCount >= 14 ? '마스터' : undefined,
        };
      }
      userRecord.lastActiveAt = new Date().toISOString();
      userRecord.simulatorSettings = settings;
      userDb[entry.nickname] = userRecord;
      await saveServerDbAsync(userDb);
    } catch (err) {
      console.error('Failed to persist quiz entry to Supabase:', err);
    }
  }

  return {
    success: true,
    entry: newEntry,
    percentile,
    rank,
    totalParticipants,
  };
}

export async function calculateTermsQuizPercentileAsync(
  level: number,
  correctCount: number,
  timeSpentSec: number
): Promise<{ success: boolean; percentile: number; rank: number; totalParticipants: number }> {
  const levelEntries = await getTermsQuizEntriesAsync(level);

  let rank = 1;
  for (const entry of levelEntries) {
    if (
      entry.correctCount > correctCount ||
      (entry.correctCount === correctCount && entry.timeSpentSec <= timeSpentSec)
    ) {
      rank++;
    } else {
      break;
    }
  }

  const totalParticipants = Math.max(1, levelEntries.length + 1);
  // 1위만 상위 1%, 나머지는 공식 적용
  const percentile = rank === 1 ? 1 : Math.max(2, Math.min(99, Math.round((rank / totalParticipants) * 100)));

  return {
    success: true,
    percentile,
    rank,
    totalParticipants,
  };
}

