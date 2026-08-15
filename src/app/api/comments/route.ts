import { NextResponse } from 'next/server';
import { getCommentsAsync, addCommentAsync, deleteCommentAsync, CommentRecord } from '@/utils/serverDb';
import { validateNickname } from '@/utils/badWordsFilter';

// GET /api/comments?targetKey=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetKey = searchParams.get('targetKey')?.trim();

    if (!targetKey) {
      return NextResponse.json({ success: false, error: 'targetKey 파라미터가 필요합니다.' }, { status: 400 });
    }

    const comments = await getCommentsAsync(targetKey);
    // Return sanitized comments (remove pin before sending to client)
    const sanitized = comments.map(({ pin, ...rest }) => rest);

    return NextResponse.json({ success: true, comments: sanitized });
  } catch (error) {
    console.error('API GET comments error:', error);
    return NextResponse.json({ success: false, error: '댓글 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/comments
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, targetKey, nickname, pin, content, investmentType, parentId, commentId, avatarUrl } = body;

    // 1. Delete Action
    if (action === 'delete') {
      if (!commentId || !nickname || !pin) {
        return NextResponse.json({ success: false, error: '삭제 정보가 부족합니다.' }, { status: 400 });
      }

      const result = await deleteCommentAsync(commentId, nickname.trim(), pin.trim());
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error || '댓글 삭제에 실패했습니다.' }, { status: 403 });
      }

      const comments = await getCommentsAsync(targetKey);
      const sanitized = comments.map(({ pin: _, ...rest }) => rest);
      return NextResponse.json({ success: true, comments: sanitized });
    }

    // 2. Create / Reply Action
    const trimmedNick = nickname?.trim();
    const trimmedPin = pin?.trim();
    const trimmedContent = content?.trim();
    const { typeScores } = body;

    if (!trimmedNick || !trimmedPin || !trimmedContent || !targetKey) {
      return NextResponse.json({ success: false, error: '모든 필수 항목을 입력해 주세요.' }, { status: 400 });
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json({ success: false, error: '댓글은 500자 이하로 작성해 주세요.' }, { status: 400 });
    }

    const newComment: CommentRecord = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      targetKey,
      nickname: trimmedNick,
      pin: trimmedPin,
      content: trimmedContent,
      avatarUrl: avatarUrl || undefined,
      investmentType: investmentType || undefined,
      typeScores: typeScores && typeof typeScores === 'object' ? typeScores : undefined,
      createdAt: new Date().toISOString(),
      parentId: parentId || null,
    };

    const updatedComments = await addCommentAsync(newComment);
    const sanitized = updatedComments.map(({ pin: _, ...rest }) => rest);

    return NextResponse.json({ success: true, comments: sanitized });
  } catch (error) {
    console.error('API POST comments error:', error);
    return NextResponse.json({ success: false, error: '댓글 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
