import { NextResponse } from 'next/server';
import { getServerDbAsync, saveServerDbAsync } from '@/utils/serverDb';
import { withApiGuard } from '@/lib/observability/guard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ZERO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
};

const MAX_JOURNAL_BYTES = 200_000;
const MAX_ACCOUNTS = 20;

// 투자일지 저장소는 계좌 구성/목표 비율/보유 수량만 다룹니다. (증권사 API 키 등 비밀값 저장 금지)
function sanitizeJournal(input: any) {
  if (!input || typeof input !== 'object') return null;
  const accounts = Array.isArray(input.accounts)
    ? input.accounts.slice(0, MAX_ACCOUNTS).map((a: any) => {
        const copy = { ...a };
        delete copy.snapshots;
        return copy;
      })
    : [];
  const logs = Array.isArray(input.logs) ? input.logs.slice(0, 200) : [];
  const out = { accounts, logs };
  if (JSON.stringify(out).length > MAX_JOURNAL_BYTES) return null;
  return out;
}

// POST /api/journal  { action: 'load' | 'save', nickname, pin, journal? }
export const POST = withApiGuard('투자일지 저장/불러오기 (/api/journal)', async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  const nickname = String(body.nickname || '').trim();
  const pin = String(body.pin || '').trim();
  const action = body.action;

  if (!nickname || !pin) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { headers: ZERO_CACHE_HEADERS });
  }

  const db = await getServerDbAsync();
  const record = db[nickname] || db[nickname.toLowerCase()];
  if (!record || record.pin !== pin) {
    return NextResponse.json({ success: false, error: '인증 실패' }, { headers: ZERO_CACHE_HEADERS });
  }

  if (action === 'load') {
    return NextResponse.json({ success: true, journal: record.journal || null }, { headers: ZERO_CACHE_HEADERS });
  }

  if (action === 'save') {
    const clean = sanitizeJournal(body.journal);
    if (!clean) {
      return NextResponse.json({ success: false, error: '저장 가능한 크기를 넘었거나 형식이 올바르지 않습니다.' }, { headers: ZERO_CACHE_HEADERS });
    }
    record.journal = clean;
    db[record.nickname] = record;
    await saveServerDbAsync(db);
    return NextResponse.json({ success: true }, { headers: ZERO_CACHE_HEADERS });
  }

  return NextResponse.json({ success: false, error: '알 수 없는 요청입니다.' }, { headers: ZERO_CACHE_HEADERS });
});
