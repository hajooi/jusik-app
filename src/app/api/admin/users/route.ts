import { NextResponse } from 'next/server';
import { getServerDb } from '@/utils/serverDb';

export const dynamic = 'force-dynamic';

// GET /api/admin/users?nickname=...&pin=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname')?.trim();
    const pin = searchParams.get('pin')?.trim();

    if (nickname !== '주식부엉' || !pin) {
      return NextResponse.json({ success: false, error: '관리자 권한이 없습니다.' }, { status: 403 });
    }

    const db = getServerDb();
    const adminRecord = db['주식부엉'] || db['주식부엉'];

    if (!adminRecord || adminRecord.pin !== pin) {
      return NextResponse.json({ success: false, error: '관리자 인증에 실패했습니다.' }, { status: 403 });
    }

    // Prepare user list excluding pin numbers
    const users = Object.values(db).map((u) => ({
      nickname: u.nickname,
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
      completedLessonsCount: u.completedLessons ? u.completedLessons.length : 0,
      investmentType: u.investmentType || '미진단',
      hasSimulatorSettings: !!u.simulatorSettings
    }));

    // Sort by createdAt descending (newest first)
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users
    });
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
