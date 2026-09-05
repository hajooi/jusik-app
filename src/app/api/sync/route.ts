import { NextResponse } from 'next/server';
import { getServerDbAsync, saveServerDbAsync, updateCommentsForUserAsync, ServerUserRecord } from '@/utils/serverDb';
import { validateNickname } from '@/utils/badWordsFilter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ZERO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
};

function computeRankPercentile(db: Record<string, any>, completedLessons?: string[]) {
  const allUsers = Object.values(db);
  const targetCompletedCount = completedLessons ? completedLessons.length : 0;
  if (targetCompletedCount === 0) return null;
  const strictlyHigherUsersCount = allUsers.filter((u) => (u.completedLessons ? u.completedLessons.length : 0) > targetCompletedCount).length;
  const userRank = strictlyHigherUsersCount + 1;
  return Math.max(1, Math.round((userRank / Math.max(1, allUsers.length)) * 100));
}

const isFullSurveyAnswers = (answers?: any): boolean => {
  return !!answers && typeof answers === 'object' && Object.keys(answers).length === 40;
};

// GET /api/sync?nickname=...&pin=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname')?.trim();
    const pin = searchParams.get('pin')?.trim();

    if (!nickname || !pin) {
      return NextResponse.json({ success: false, error: '닉네임과 핀번호가 필요합니다.' }, { status: 200, headers: ZERO_CACHE_HEADERS });
    }

    const db = await getServerDbAsync();
    const userRecord = db[nickname] || db[nickname.toLowerCase()];

    if (!userRecord) {
      return NextResponse.json({ success: false, notFound: true, error: '계정을 찾을 수 없습니다.' }, { status: 200, headers: ZERO_CACHE_HEADERS });
    }

    if (userRecord.pin !== pin) {
      return NextResponse.json({ success: false, error: '핀번호가 일치하지 않습니다.' }, { status: 200, headers: ZERO_CACHE_HEADERS });
    }

    // 만료된 PRO 권한 자동 회수 및 DB 반영
    const effectiveIsPro = !!(userRecord.proExpiresAt ? new Date(userRecord.proExpiresAt).getTime() > Date.now() : userRecord.isPro === true);
    if (userRecord.isPro && !effectiveIsPro) {
      userRecord.isPro = false;
      if (userRecord.activeBadge === 'pro') {
        userRecord.activeBadge = 'investmentType';
      }
    }

    userRecord.lastActiveAt = new Date().toISOString();
    db[nickname] = userRecord;
    await saveServerDbAsync(db);

    const rankPercentile = computeRankPercentile(db, userRecord.completedLessons);

    return NextResponse.json(
      {
        success: true,
        user: {
          nickname: userRecord.nickname,
          avatarUrl: userRecord.avatarUrl,
          createdAt: userRecord.createdAt,
          lastLoginAt: userRecord.lastActiveAt,
          completedLessons: userRecord.completedLessons || [],
          investmentType: userRecord.investmentType,
          typeAnswers: userRecord.typeAnswers,
          simulatorSettings: userRecord.simulatorSettings,
          activeBadge: userRecord.activeBadge,
          termsQuizBest: userRecord.termsQuizBest,
          isPro: effectiveIsPro,
          proExpiresAt: userRecord.proExpiresAt,
          rankPercentile
        }
      },
      { status: 200, headers: ZERO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('API GET sync error:', error);
    return NextResponse.json({ success: false, error: '서버 연동 오류가 발생했습니다.' }, { status: 200, headers: ZERO_CACHE_HEADERS });
  }
}

// POST /api/sync
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, nickname, pin, completedLessons, investmentType, typeAnswers, simulatorSettings, avatarUrl, activeBadge, termsQuizBest } = body;

    const trimmedNickname = nickname?.trim();
    if (!trimmedNickname) {
      return NextResponse.json({ success: false, error: '닉네임을 입력해 주세요.' }, { status: 200 });
    }

    const validation = validateNickname(trimmedNickname);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.message }, { status: 200 });
    }

    const db = await getServerDbAsync();
    const existing = db[trimmedNickname] || db[trimmedNickname.toLowerCase()];

    if (action === 'changePin') {
      const { newPin } = body;
      if (!newPin || !/^\d{6}$/.test(newPin)) {
        return NextResponse.json({ success: false, error: '새 핀번호는 숫자 6자리로 입력해 주세요.' }, { status: 200 });
      }

      if (!existing) {
        return NextResponse.json({ success: false, error: '계정을 찾을 수 없습니다.' }, { status: 200 });
      }

      existing.pin = newPin;
      existing.lastActiveAt = new Date().toISOString();
      db[trimmedNickname] = existing;
      await saveServerDbAsync(db);

      return NextResponse.json({
        success: true,
        message: '핀번호가 성공적으로 변경되었습니다.'
      });
    }

    if (!pin) {
      return NextResponse.json({ success: false, error: '핀번호를 입력해 주세요.' }, { status: 200 });
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ success: false, error: '핀번호는 숫자 6자리로 입력해 주세요.' }, { status: 200 });
    }

    if (action === 'redeemPromoCode') {
      const { code } = body;
      const cleanCode = code?.trim().toUpperCase();
      if (!cleanCode) {
        return NextResponse.json({ success: false, error: '코드를 입력해 주세요.' }, { status: 200 });
      }

      if (!existing || existing.pin !== pin) {
        return NextResponse.json({ success: false, error: '인증 실패' }, { status: 200 });
      }

      // 현재 활성화된 공식 4자리 프로모션 코드 (10월 31일까지 적용)
      const VALID_PROMO_CODES: Record<string, number> = {
        'JU26': 60, // 10월 말까지 공식 프로모션 코드
      };

      if (!VALID_PROMO_CODES[cleanCode]) {
        return NextResponse.json({ 
          success: false, 
          error: '유효하지 않거나 만료된 프로모션 코드입니다.' 
        }, { status: 200 });
      }

      // Calculate October 31st 23:59:59 KST
      const oct31Date = new Date(2026, 9, 31, 23, 59, 59, 999);
      const endOfMonthIso = oct31Date.toISOString();

      existing.isPro = true;
      existing.proExpiresAt = endOfMonthIso;
      existing.lastActiveAt = new Date().toISOString();

      db[trimmedNickname] = existing;
      await saveServerDbAsync(db);

      return NextResponse.json({
        success: true,
        message: 'Pro 코드가 인증되어 10월 말일까지 Pro 권한이 활성화되었습니다!',
        user: {
          nickname: existing.nickname,
          avatarUrl: existing.avatarUrl,
          createdAt: existing.createdAt,
          lastLoginAt: existing.lastActiveAt,
          completedLessons: existing.completedLessons,
          investmentType: existing.investmentType,
          typeAnswers: existing.typeAnswers,
          simulatorSettings: existing.simulatorSettings,
          activeBadge: existing.activeBadge,
          termsQuizBest: existing.termsQuizBest,
          isPro: existing.isPro,
          proExpiresAt: existing.proExpiresAt
        }
      });
    }

    if (action === 'login') {
      if (existing) {
        if (existing.pin !== pin) {
          return NextResponse.json({ success: false, error: '입력하신 핀번호가 일치하지 않습니다.' }, { status: 200 });
        }

        // 1. 수강 완료 목록: 절대 줄어들지 않도록 Union 병합
        const mergedCompleted = Array.from(new Set([...(existing.completedLessons || []), ...(completedLessons || [])]));
        existing.completedLessons = mergedCompleted;

        // 2. 투자 성향 및 40문항 답변 보호: 완전한 데이터가 이미 있으면 미진단/불완전 데이터로 덮어쓰지 않음
        if (!existing.investmentType && investmentType && investmentType !== '미진단') {
          existing.investmentType = investmentType;
        }
        if (typeAnswers && isFullSurveyAnswers(typeAnswers)) {
          if (!existing.typeAnswers || Object.keys(existing.typeAnswers).length < 40) {
            existing.typeAnswers = typeAnswers;
          }
        }

        // 3. 순수 시뮬레이터 설정 보존
        if (simulatorSettings) {
          existing.simulatorSettings = simulatorSettings;
        }

        // 4. 아바타 및 뱃지 보호
        if (!existing.avatarUrl && avatarUrl) {
          existing.avatarUrl = avatarUrl;
        }
        if (activeBadge !== undefined) {
          existing.activeBadge = activeBadge;
        }

        // 5. 퀴즈 최고 기록: 더 높은 점수 또는 기존 기록 안전 보존
        if (termsQuizBest) {
          const prevScore = existing.termsQuizBest?.score || 0;
          const prevTime = existing.termsQuizBest?.timeSpentSec || 999;
          const newScore = termsQuizBest.score || 0;
          const newTime = termsQuizBest.timeSpentSec || 999;
          if (!existing.termsQuizBest || newScore > prevScore || (newScore === prevScore && newTime < prevTime)) {
            existing.termsQuizBest = termsQuizBest;
          }
        }

        // 만료된 PRO 권한 자동 회수 및 DB 반영
        const effectiveIsPro = !!(existing.proExpiresAt ? new Date(existing.proExpiresAt).getTime() > Date.now() : existing.isPro === true);
        if (existing.isPro && !effectiveIsPro) {
          existing.isPro = false;
          if (existing.activeBadge === 'pro') {
            existing.activeBadge = 'investmentType';
          }
        }

        existing.lastActiveAt = new Date().toISOString();

        db[trimmedNickname] = existing;
        await saveServerDbAsync(db);

        const rankPercentile = computeRankPercentile(db, existing.completedLessons);

        return NextResponse.json({
          success: true,
          user: {
            nickname: existing.nickname,
            avatarUrl: existing.avatarUrl,
            createdAt: existing.createdAt,
            lastLoginAt: existing.lastActiveAt,
            completedLessons: existing.completedLessons,
            investmentType: existing.investmentType,
            typeAnswers: existing.typeAnswers,
            simulatorSettings: existing.simulatorSettings,
            activeBadge: existing.activeBadge,
            termsQuizBest: existing.termsQuizBest,
            isPro: effectiveIsPro,
            proExpiresAt: existing.proExpiresAt,
            rankPercentile
          }
        });
      } else {
        const newRecord: ServerUserRecord = {
          nickname: trimmedNickname,
          pin,
          avatarUrl,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          completedLessons: completedLessons || [],
          investmentType: investmentType && investmentType !== '미진단' ? investmentType : undefined,
          typeAnswers: isFullSurveyAnswers(typeAnswers) ? typeAnswers : undefined,
          simulatorSettings: simulatorSettings || undefined,
          activeBadge,
          termsQuizBest
        };
        db[trimmedNickname] = newRecord;
        await saveServerDbAsync(db);

        const rankPercentile = computeRankPercentile(db, newRecord.completedLessons);

        return NextResponse.json({
          success: true,
          user: {
            nickname: newRecord.nickname,
            avatarUrl: newRecord.avatarUrl,
            createdAt: newRecord.createdAt,
            lastLoginAt: newRecord.lastActiveAt,
            completedLessons: newRecord.completedLessons,
            investmentType: newRecord.investmentType,
            typeAnswers: newRecord.typeAnswers,
            simulatorSettings: newRecord.simulatorSettings,
            activeBadge: newRecord.activeBadge,
            termsQuizBest: newRecord.termsQuizBest,
            isPro: newRecord.isPro,
            proExpiresAt: newRecord.proExpiresAt,
            rankPercentile
          }
        });
      }
    }

    if (action === 'syncData') {
      if (!existing || existing.pin !== pin) {
        return NextResponse.json({ success: false, error: '인증 실패' }, { status: 200 });
      }

      // 1. 수강 완료 목록: Union 병합
      if (completedLessons !== undefined && Array.isArray(completedLessons)) {
        existing.completedLessons = Array.from(new Set([...(existing.completedLessons || []), ...completedLessons]));
      }

      // 2. 투자 성향 40문항 답변 보호
      if (typeAnswers !== undefined && isFullSurveyAnswers(typeAnswers)) {
        existing.typeAnswers = typeAnswers;
      }
      if (investmentType !== undefined) {
        if (investmentType !== '미진단' && (!typeAnswers || isFullSurveyAnswers(typeAnswers))) {
          existing.investmentType = investmentType;
        }
      }

      // 3. 순수 시뮬레이터 설정 갱신
      if (simulatorSettings !== undefined) {
        existing.simulatorSettings = simulatorSettings;
      }

      // 4. 아바타 및 뱃지 갱신
      if (avatarUrl !== undefined) {
        existing.avatarUrl = avatarUrl;
        await updateCommentsForUserAsync(trimmedNickname, avatarUrl);
      }
      if (activeBadge !== undefined) {
        existing.activeBadge = activeBadge;
      }

      // 5. 퀴즈 최고 기록 보존 및 최고점 갱신
      if (termsQuizBest !== undefined && termsQuizBest) {
        const prevScore = existing.termsQuizBest?.score || 0;
        const prevTime = existing.termsQuizBest?.timeSpentSec || 999;
        const newScore = termsQuizBest.score || 0;
        const newTime = termsQuizBest.timeSpentSec || 999;
        if (!existing.termsQuizBest || newScore > prevScore || (newScore === prevScore && newTime < prevTime)) {
          existing.termsQuizBest = termsQuizBest;
        }
      }
      // 만료된 PRO 권한 자동 회수 및 DB 반영
      const effectiveIsPro = !!(existing.proExpiresAt ? new Date(existing.proExpiresAt).getTime() > Date.now() : existing.isPro === true);
      if (existing.isPro && !effectiveIsPro) {
        existing.isPro = false;
        if (existing.activeBadge === 'pro') {
          existing.activeBadge = 'investmentType';
        }
      }

      existing.lastActiveAt = new Date().toISOString();

      db[trimmedNickname] = existing;
      await saveServerDbAsync(db);

      const rankPercentile = computeRankPercentile(db, existing.completedLessons);

      return NextResponse.json({
        success: true,
        user: {
          nickname: existing.nickname,
          avatarUrl: existing.avatarUrl,
          createdAt: existing.createdAt,
          lastLoginAt: existing.lastActiveAt,
          completedLessons: existing.completedLessons,
          investmentType: existing.investmentType,
          typeAnswers: existing.typeAnswers,
          simulatorSettings: existing.simulatorSettings,
          activeBadge: existing.activeBadge,
          termsQuizBest: existing.termsQuizBest,
          isPro: effectiveIsPro,
          proExpiresAt: existing.proExpiresAt,
          rankPercentile
        }
      });
    }

    return NextResponse.json({ success: false, error: '유효하지 않은 요청입니다.' }, { status: 200 });
  } catch (error) {
    console.error('API POST sync error:', error);
    return NextResponse.json({ success: false, error: '서버 저장 중 오류가 발생했습니다.' }, { status: 200 });
  }
}
