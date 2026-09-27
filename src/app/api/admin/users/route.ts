import { NextResponse } from 'next/server';
import { getServerDbAsync, saveServerDbAsync } from '@/utils/serverDb';
import { withApiGuard } from '@/lib/observability/guard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/users?nickname=...&pin=...
export const GET = withApiGuard('관리자 회원 목록 조회 (/api/admin/users)', async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname')?.trim();
    const pin = searchParams.get('pin')?.trim();

    if (nickname !== '주식부엉' || !pin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 없습니다.' },
        {
          status: 403,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    }

    const db = await getServerDbAsync();
    const adminRecord = db['주식부엉'];

    if (!adminRecord || adminRecord.pin !== pin) {
      return NextResponse.json(
        { success: false, error: '관리자 인증에 실패했습니다.' },
        {
          status: 403,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    }

    // Prepare user list excluding pin numbers and system cache records
    const now = Date.now();
    const oct31Iso = new Date(Date.UTC(2026, 9, 31, 14, 59, 59, 999)).toISOString();
    let dbUpdated = false;

    const users = Object.values(db)
      .filter((u) => !u.nickname.startsWith('__system_'))
      .map((u) => {
        const isTestUser = u.nickname === '테스트유저';
        const hadProOriginally = u.isPro === true || !!u.proExpiresAt;

        if (hadProOriginally) {
          if (!isTestUser) {
            if (!u.proPlusExpiresAt || new Date(u.proPlusExpiresAt).getTime() < new Date(oct31Iso).getTime()) {
              u.proPlusExpiresAt = oct31Iso;
              u.isProPlus = true;
              u.proTier = 'pro_plus';
              if (u.activeBadge === 'pro') u.activeBadge = 'pro_plus';
              dbUpdated = true;
            }
          }
          if (!u.proExpiresAt || new Date(u.proExpiresAt).getTime() < new Date(oct31Iso).getTime()) {
            u.proExpiresAt = oct31Iso;
            u.isPro = true;
            dbUpdated = true;
          }
        }

        const isProPlus = !!(u.proPlusExpiresAt && new Date(u.proPlusExpiresAt).getTime() > now);
        const isPro = !!(u.proExpiresAt ? new Date(u.proExpiresAt).getTime() > now : u.isPro === true);
        const proTier: 'free' | 'pro' | 'pro_plus' = isProPlus ? 'pro_plus' : (isPro ? 'pro' : 'free');

        return {
          nickname: u.nickname,
          createdAt: u.createdAt,
          lastActiveAt: u.lastActiveAt,
          completedLessonsCount: u.completedLessons ? u.completedLessons.length : 0,
          investmentType: u.investmentType || '미진단',
          hasSimulatorSettings: !!u.simulatorSettings,
          isPro: isPro || isProPlus,
          isProPlus,
          proTier,
          proExpiresAt: u.proExpiresAt,
          proPlusExpiresAt: u.proPlusExpiresAt,
        };
      });

    if (dbUpdated) {
      await saveServerDbAsync(db);
    }

    // Sort by lastActiveAt descending (most recently active first, fallback to createdAt)
    users.sort((a, b) => {
      const timeA = new Date(a.lastActiveAt || a.createdAt).getTime();
      const timeB = new Date(b.lastActiveAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    return NextResponse.json(
      {
        success: true,
        totalUsers: users.length,
        users,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  }
});
