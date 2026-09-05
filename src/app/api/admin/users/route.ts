import { NextResponse } from 'next/server';
import { getServerDbAsync } from '@/utils/serverDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/users?nickname=...&pin=...
export async function GET(request: Request) {
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
    const users = Object.values(db)
      .filter((u) => !u.nickname.startsWith('__system_'))
      .map((u) => ({
        nickname: u.nickname,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
        completedLessonsCount: u.completedLessons ? u.completedLessons.length : 0,
        investmentType: u.investmentType || '미진단',
        hasSimulatorSettings: !!u.simulatorSettings,
        isPro: !!(u.proExpiresAt ? new Date(u.proExpiresAt).getTime() > Date.now() : u.isPro === true)
      }));

    // Sort by createdAt descending (newest first)
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
}
