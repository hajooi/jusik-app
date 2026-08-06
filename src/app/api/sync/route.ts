import { NextResponse } from 'next/server';
import { getServerDbAsync, saveServerDbAsync, ServerUserRecord } from '@/utils/serverDb';
import { validateNickname } from '@/utils/badWordsFilter';

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

    return NextResponse.json({
      success: true,
      user: {
        nickname: userRecord.nickname,
        createdAt: userRecord.createdAt,
        lastLoginAt: userRecord.lastActiveAt,
        completedLessons: userRecord.completedLessons || [],
        investmentType: userRecord.investmentType,
        typeAnswers: userRecord.typeAnswers,
        simulatorSettings: userRecord.simulatorSettings
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
    const { action, nickname, pin, completedLessons, investmentType, typeAnswers, simulatorSettings } = body;

    const trimmedNickname = nickname?.trim();
    if (!trimmedNickname || !pin) {
      return NextResponse.json({ success: false, error: '닉네임과 핀번호를 입력해 주세요.' }, { status: 200 });
    }

    const validation = validateNickname(trimmedNickname);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.message }, { status: 200 });
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ success: false, error: '핀번호는 숫자 6자리로 입력해 주세요.' }, { status: 200 });
    }

    const db = await getServerDbAsync();
    const existing = db[trimmedNickname] || db[trimmedNickname.toLowerCase()];

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

        existing.lastActiveAt = new Date().toISOString();

        db[trimmedNickname] = existing;
        await saveServerDbAsync(db);

        return NextResponse.json({
          success: true,
          user: {
            nickname: existing.nickname,
            createdAt: existing.createdAt,
            lastLoginAt: existing.lastActiveAt,
            completedLessons: existing.completedLessons,
            investmentType: existing.investmentType,
            typeAnswers: existing.typeAnswers,
            simulatorSettings: existing.simulatorSettings
          }
        });
      } else {
        const newRecord: ServerUserRecord = {
          nickname: trimmedNickname,
          pin,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          completedLessons: completedLessons || [],
          investmentType,
          typeAnswers,
          simulatorSettings
        };
        db[trimmedNickname] = newRecord;
        await saveServerDbAsync(db);

        return NextResponse.json({
          success: true,
          user: {
            nickname: newRecord.nickname,
            createdAt: newRecord.createdAt,
            lastLoginAt: newRecord.lastActiveAt,
            completedLessons: newRecord.completedLessons,
            investmentType: newRecord.investmentType,
            typeAnswers: newRecord.typeAnswers,
            simulatorSettings: newRecord.simulatorSettings
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
      existing.lastActiveAt = new Date().toISOString();

      db[trimmedNickname] = existing;
      await saveServerDbAsync(db);

      return NextResponse.json({
        success: true,
        user: {
          nickname: existing.nickname,
          createdAt: existing.createdAt,
          lastLoginAt: existing.lastActiveAt,
          completedLessons: existing.completedLessons,
          investmentType: existing.investmentType,
          typeAnswers: existing.typeAnswers,
          simulatorSettings: existing.simulatorSettings
        }
      });
    }

    return NextResponse.json({ success: false, error: '유효하지 않은 요청입니다.' }, { status: 200 });
  } catch (error) {
    console.error('API POST sync error:', error);
    return NextResponse.json({ success: false, error: '서버 저장 중 오류가 발생했습니다.' }, { status: 200 });
  }
}
