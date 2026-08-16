import { NextResponse } from 'next/server';
import { getServerDbAsync, saveServerDbAsync, ServerUserRecord } from '@/utils/serverDb';
import { validateNickname } from '@/utils/badWordsFilter';

function computeRankPercentile(db: Record<string, any>, completedLessons?: string[]) {
  const allUsers = Object.values(db);
  const targetCompletedCount = completedLessons ? completedLessons.length : 0;
  if (targetCompletedCount === 0) return null;
  const strictlyHigherUsersCount = allUsers.filter((u) => (u.completedLessons ? u.completedLessons.length : 0) > targetCompletedCount).length;
  const userRank = strictlyHigherUsersCount + 1;
  return Math.max(1, Math.round((userRank / Math.max(1, allUsers.length)) * 100));
}

// GET /api/sync?nickname=...&pin=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname')?.trim();
    const pin = searchParams.get('pin')?.trim();

    if (!nickname || !pin) {
      return NextResponse.json({ success: false, error: '닉네임과 핀번호가 필요합니다.' }, { status: 200 });
    }

    const db = await getServerDbAsync();
    const userRecord = db[nickname] || db[nickname.toLowerCase()];

    if (!userRecord) {
      return NextResponse.json({ success: false, notFound: true, error: '계정을 찾을 수 없습니다.' }, { status: 200 });
    }

    if (userRecord.pin !== pin) {
      return NextResponse.json({ success: false, error: '핀번호가 일치하지 않습니다.' }, { status: 200 });
    }

    userRecord.lastActiveAt = new Date().toISOString();
    db[nickname] = userRecord;
    await saveServerDbAsync(db);

    const rankPercentile = computeRankPercentile(db, userRecord.completedLessons);

    return NextResponse.json({
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
        rankPercentile
      }
    });
  } catch (error) {
    console.error('API GET sync error:', error);
    return NextResponse.json({ success: false, error: '서버 연동 오류가 발생했습니다.' }, { status: 200 });
  }
}

// POST /api/sync
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, nickname, pin, completedLessons, investmentType, typeAnswers, simulatorSettings, avatarUrl } = body;

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

    if (action === 'login') {
      if (existing) {
        if (existing.pin !== pin) {
          return NextResponse.json({ success: false, error: '입력하신 핀번호가 일치하지 않습니다.' }, { status: 200 });
        }

        const mergedCompleted = Array.from(new Set([...(existing.completedLessons || []), ...(completedLessons || [])]));
        existing.completedLessons = mergedCompleted;

        // Protect existing server user data from being overwritten by client defaults during login
        if (!existing.investmentType && investmentType && investmentType !== '미진단') {
          existing.investmentType = investmentType;
        }
        if ((!existing.typeAnswers || Object.keys(existing.typeAnswers).length === 0) && typeAnswers && Object.keys(typeAnswers).length > 0) {
          existing.typeAnswers = typeAnswers;
        }
        if (!existing.simulatorSettings && simulatorSettings) {
          existing.simulatorSettings = simulatorSettings;
        }
        if (!existing.avatarUrl && avatarUrl) {
          existing.avatarUrl = avatarUrl;
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
          investmentType,
          typeAnswers,
          simulatorSettings
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
            rankPercentile
          }
        });
      }
    }

    if (action === 'syncData') {
      if (!existing || existing.pin !== pin) {
        return NextResponse.json({ success: false, error: '인증 실패' }, { status: 200 });
      }

      if (completedLessons !== undefined) existing.completedLessons = completedLessons;
      if (investmentType !== undefined) existing.investmentType = investmentType;
      if (typeAnswers !== undefined) existing.typeAnswers = typeAnswers;
      if (simulatorSettings !== undefined) existing.simulatorSettings = simulatorSettings;
      if (avatarUrl !== undefined) existing.avatarUrl = avatarUrl;
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
