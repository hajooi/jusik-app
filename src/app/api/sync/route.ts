import { NextResponse } from 'next/server';
import { getServerDb, saveServerDb, ServerUserRecord } from '@/utils/serverDb';
import { validateNickname } from '@/utils/badWordsFilter';

// GET /api/sync?nickname=...&pin=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname')?.trim();
    const pin = searchParams.get('pin')?.trim();

    if (!nickname || !pin) {
      return NextResponse.json({ success: false, error: '닉네임과 핀번호가 필요합니다.' }, { status: 400 });
    }

    const db = getServerDb();
    const userRecord = db[nickname] || db[nickname.toLowerCase()];

    if (!userRecord) {
      return NextResponse.json({ success: false, error: '계정을 찾을 수 없습니다.' }, { status: 444 });
    }

    if (userRecord.pin !== pin) {
      return NextResponse.json({ success: false, error: '핀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    // 접속 일시 갱신
    userRecord.lastActiveAt = new Date().toISOString();
    db[nickname] = userRecord;
    saveServerDb(db);

    return NextResponse.json({
      success: true,
      user: {
        nickname: userRecord.nickname,
        createdAt: userRecord.createdAt,
        lastLoginAt: userRecord.lastActiveAt,
        completedLessons: userRecord.completedLessons || [],
        investmentType: userRecord.investmentType,
        simulatorSettings: userRecord.simulatorSettings
      }
    });
  } catch (error) {
    console.error('API GET sync error:', error);
    return NextResponse.json({ success: false, error: '서버 연동 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/sync
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, nickname, pin, completedLessons, investmentType, simulatorSettings } = body;

    const trimmedNickname = nickname?.trim();
    if (!trimmedNickname || !pin) {
      return NextResponse.json({ success: false, error: '닉네임과 핀번호를 입력해 주세요.' }, { status: 400 });
    }

    // 닉네임 검증
    const validation = validateNickname(trimmedNickname);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.message }, { status: 400 });
    }

    // PIN 6자리 검증
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ success: false, error: '핀번호는 숫자 6자리로 입력해 주세요.' }, { status: 400 });
    }

    const db = getServerDb();
    const existing = db[trimmedNickname] || db[trimmedNickname.toLowerCase()];

    if (action === 'login') {
      if (existing) {
        if (existing.pin !== pin) {
          return NextResponse.json({ success: false, error: '입력하신 핀번호가 일치하지 않습니다.' }, { status: 401 });
        }

        // 로그인 성공 -> 클라이언트에서 전달된 새로운 수강 완료 내역과 병합
        const mergedCompleted = Array.from(new Set([...(existing.completedLessons || []), ...(completedLessons || [])]));
        existing.completedLessons = mergedCompleted;
        if (investmentType) existing.investmentType = investmentType;
        if (simulatorSettings) existing.simulatorSettings = simulatorSettings;
        existing.lastActiveAt = new Date().toISOString();

        db[trimmedNickname] = existing;
        saveServerDb(db);

        return NextResponse.json({
          success: true,
          user: {
            nickname: existing.nickname,
            createdAt: existing.createdAt,
            lastLoginAt: existing.lastActiveAt,
            completedLessons: existing.completedLessons,
            investmentType: existing.investmentType,
            simulatorSettings: existing.simulatorSettings
          }
        });
      } else {
        // 신규 계정 생성
        const newRecord: ServerUserRecord = {
          nickname: trimmedNickname,
          pin,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          completedLessons: completedLessons || [],
          investmentType,
          simulatorSettings
        };
        db[trimmedNickname] = newRecord;
        saveServerDb(db);

        return NextResponse.json({
          success: true,
          user: {
            nickname: newRecord.nickname,
            createdAt: newRecord.createdAt,
            lastLoginAt: newRecord.lastActiveAt,
            completedLessons: newRecord.completedLessons,
            investmentType: newRecord.investmentType,
            simulatorSettings: newRecord.simulatorSettings
          }
        });
      }
    }

    if (action === 'syncData') {
      if (!existing || existing.pin !== pin) {
        return NextResponse.json({ success: false, error: '인증 실패' }, { status: 401 });
      }

      if (completedLessons) existing.completedLessons = completedLessons;
      if (investmentType) existing.investmentType = investmentType;
      if (simulatorSettings) existing.simulatorSettings = simulatorSettings;
      existing.lastActiveAt = new Date().toISOString();

      db[trimmedNickname] = existing;
      saveServerDb(db);

      return NextResponse.json({
        success: true,
        user: {
          nickname: existing.nickname,
          createdAt: existing.createdAt,
          lastLoginAt: existing.lastActiveAt,
          completedLessons: existing.completedLessons,
          investmentType: existing.investmentType,
          simulatorSettings: existing.simulatorSettings
        }
      });
    }

    return NextResponse.json({ success: false, error: '유효하지 않은 요청입니다.' }, { status: 400 });
  } catch (error) {
    console.error('API POST sync error:', error);
    return NextResponse.json({ success: false, error: '서버 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
