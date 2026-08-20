import { NextResponse } from 'next/server';
import { getTermsQuizEntriesAsync, saveTermsQuizEntryAsync, calculateTermsQuizPercentileAsync } from '@/utils/serverDb';
import { validateNickname } from '@/utils/badWordsFilter';

// GET /api/terms-leaderboard?level=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const levelStr = searchParams.get('level');
    const level = levelStr ? parseInt(levelStr, 10) : undefined;

    const entries = await getTermsQuizEntriesAsync(level);

    // Limit to top 20 for leaderboard display
    const topEntries = entries.slice(0, 20).map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    return NextResponse.json({
      success: true,
      totalCount: entries.length,
      leaderboard: topEntries,
    });
  } catch (error) {
    console.error('API GET terms-leaderboard error:', error);
    return NextResponse.json({ success: false, error: '리더보드 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/terms-leaderboard
// Body: { isGuest, nickname, level, score, correctCount, totalQuestions, timeSpentSec, avatarUrl, investmentType }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { isGuest, nickname, level, score, correctCount, totalQuestions, timeSpentSec, avatarUrl, investmentType } = body;

    const parsedLevel = Number(level) || 1;
    const parsedScore = Number(score) || 0;
    const parsedCorrectCount = Number(correctCount) || 0;
    const parsedTotalQuestions = Number(totalQuestions) || 15;
    const parsedTimeSpent = Math.max(0.1, Number(timeSpentSec) || 0);

    // Guest Mode: Calculate real percentile & rank without saving to DB
    if (isGuest || !nickname || typeof nickname !== 'string' || !nickname.trim()) {
      const result = await calculateTermsQuizPercentileAsync(
        parsedLevel,
        parsedCorrectCount,
        parsedTimeSpent
      );
      return NextResponse.json({
        success: true,
        isGuest: true,
        rank: result.rank,
        percentile: result.percentile,
        totalParticipants: result.totalParticipants,
      });
    }

    const trimmedNickname = nickname.trim();
    const nicknameValidation = validateNickname(trimmedNickname);
    if (!nicknameValidation.isValid) {
      return NextResponse.json({ success: false, error: nicknameValidation.message || '유효하지 않은 닉네임입니다.' }, { status: 400 });
    }

    const result = await saveTermsQuizEntryAsync({
      nickname: trimmedNickname,
      level: parsedLevel,
      score: parsedScore,
      correctCount: parsedCorrectCount,
      totalQuestions: parsedTotalQuestions,
      timeSpentSec: parsedTimeSpent,
      avatarUrl: avatarUrl || undefined,
      investmentType: investmentType || undefined,
    });

    return NextResponse.json({
      success: true,
      entry: result.entry,
      rank: result.rank,
      percentile: result.percentile,
      totalParticipants: result.totalParticipants,
    });
  } catch (error) {
    console.error('API POST terms-leaderboard error:', error);
    return NextResponse.json({ success: false, error: '퀴즈 결과 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

