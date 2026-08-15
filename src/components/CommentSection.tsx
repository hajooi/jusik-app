'use client';

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime } from '@/utils/relativeTime';
import { calculateSurveyResult } from '@/data/investmentSurvey';
import { MessageSquare, Send, Trash2, CornerDownRight, LogIn, CheckCircle2 } from 'lucide-react';

export interface CommentData {
  id: string;
  targetKey: string;
  nickname: string;
  content: string;
  avatarUrl?: string;
  investmentType?: string;
  typeScores?: { g: number; a: number; l: number; r: number };
  createdAt: string;
  parentId?: string | null;
}

interface CommentSectionProps {
  targetKey: string;
  title?: string;
  subtitle?: string;
  customTabs?: Array<{ key: string; label: string; count?: number }>;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
}

export default function CommentSection({
  targetKey,
  title = '댓글',
  subtitle,
  customTabs,
  activeTabKey,
  onTabChange,
}: CommentSectionProps) {
  const { user, openAuthPopover } = useAuth();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper to get avatar source
  const getAvatarSrc = (commentNick: string, avatarUrl?: string) => {
    if (avatarUrl) return avatarUrl;
    if (commentNick === '주식부엉') return '/logo.png';
    return '/default-avatar.png';
  };

  // Fetch comments for current targetKey
  const fetchComments = async (key: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?targetKey=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error('Failed to load comments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(targetKey);
  }, [targetKey]);

  // Group top-level comments and replies
  const { rootComments, repliesMap } = useMemo(() => {
    const roots: CommentData[] = [];
    const map: Record<string, CommentData[]> = {};

    comments.forEach((c) => {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      } else {
        roots.push(c);
      }
    });

    // Sort newest first
    roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    Object.keys(map).forEach((parentId) => {
      map[parentId].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    return { rootComments: roots, repliesMap: map };
  }, [comments]);

  // Handle new root comment submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthPopover();
      return;
    }
    if (!content.trim() || submitting) return;

    try {
      setSubmitting(true);

      // Compute exact type scores if user completed the survey
      let computedScores: { g: number; a: number; l: number; r: number } | undefined = undefined;
      if (user.typeAnswers && Object.keys(user.typeAnswers).length > 0) {
        const res = calculateSurveyResult(user.typeAnswers);
        computedScores = {
          g: res.scores.GS.G,
          a: res.scores.AP.A,
          l: res.scores.LT.L,
          r: res.scores.RI.R,
        };
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetKey,
          nickname: user.nickname,
          pin: user.pin,
          content: content.trim(),
          avatarUrl: user.avatarUrl,
          investmentType: user.investmentType,
          typeScores: computedScores,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
        setContent('');
      } else {
        alert(data.error || '댓글 등록에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (parentId: string) => {
    if (!user) {
      openAuthPopover();
      return;
    }
    if (!replyContent.trim() || submitting) return;

    try {
      setSubmitting(true);

      // Compute exact type scores if user completed the survey
      let computedScores: { g: number; a: number; l: number; r: number } | undefined = undefined;
      if (user.typeAnswers && Object.keys(user.typeAnswers).length > 0) {
        const res = calculateSurveyResult(user.typeAnswers);
        computedScores = {
          g: res.scores.GS.G,
          a: res.scores.AP.A,
          l: res.scores.LT.L,
          r: res.scores.RI.R,
        };
      }

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetKey,
          parentId,
          nickname: user.nickname,
          pin: user.pin,
          content: replyContent.trim(),
          avatarUrl: user.avatarUrl,
          investmentType: user.investmentType,
          typeScores: computedScores,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
        setReplyContent('');
        setReplyingToId(null);
      } else {
        alert(data.error || '답글 등록에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId: string) => {
    if (!user) return;
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    try {
      setDeletingId(commentId);
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          commentId,
          targetKey,
          nickname: user.nickname,
          pin: user.pin,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        alert(data.error || '댓글 삭제에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const isMasterAdmin = user?.nickname === '주식부엉' && user?.pin === '418019';
  const currentUserAvatar = getAvatarSrc(user?.nickname || '', user?.avatarUrl);

  return (
    <section className="glass-card p-5 sm:p-7 rounded-3xl space-y-5 border border-[var(--border-color)] bg-[var(--card-surface)] transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--accent-orange)]" />
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {title} <span className="text-[var(--accent-orange)] font-mono font-black text-sm">({comments.length})</span>
            </h3>
          </div>
          {subtitle && <p className="text-xs text-[var(--text-secondary)] font-medium">{subtitle}</p>}
        </div>

        {/* Custom Hybrid Tabs (if provided) */}
        {customTabs && customTabs.length > 0 && (
          <div className="flex items-center gap-1.5 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border-color)] self-start sm:self-auto">
            {customTabs.map((tab) => {
              const isActive = activeTabKey === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange?.(tab.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-orange)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Comment Input Box */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <img
                src={currentUserAvatar}
                alt={user.nickname}
                className="w-5 h-5 rounded-full object-cover border border-[var(--border-color)] bg-[var(--bg-main)]"
              />
              <span>{user.nickname}</span>
              {user.investmentType && user.investmentType !== '미진단' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono text-[var(--text-secondary)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] leading-none select-none">
                  {user.investmentType}
                </span>
              )}
              {isMasterAdmin && (
                <span className="inline-flex items-center text-[var(--accent-orange)]" title="공식 인증">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--accent-orange)] text-[var(--bg-main)]" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">{content.length}/500</span>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              maxLength={500}
              placeholder="댓글을 남겨보세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3.5 pr-20 rounded-2xl bg-[var(--bg-main)] text-xs sm:text-sm text-[var(--text-primary)] border border-[var(--border-color)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-orange)] resize-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="absolute right-2.5 bottom-3.5 px-3 py-1.5 rounded-xl bg-[var(--accent-orange)] text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>등록</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            로그인한 후 댓글을 작성할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={openAuthPopover}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent-orange)] text-white text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>로그인하기</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3.5 pt-1">
        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--text-secondary)] animate-pulse">
            댓글을 불러오는 중입니다...
          </div>
        ) : rootComments.length === 0 ? (
          <div className="py-8 text-center space-y-1 bg-[var(--bg-main)]/30 rounded-2xl border border-dashed border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-secondary)] font-medium">첫 번째 댓글을 남겨보세요!</p>
          </div>
        ) : (
          rootComments.map((root) => {
            const replies = repliesMap[root.id] || [];
            const canDeleteRoot = isMasterAdmin || (user && user.nickname === root.nickname);
            const rootAvatar = getAvatarSrc(root.nickname, root.avatarUrl);

            return (
              <div
                key={root.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-main)]/40 border border-[var(--border-color)] space-y-3 transition-all"
              >
                {/* Root Comment Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <img
                      src={rootAvatar}
                      alt={root.nickname}
                      className="w-6 h-6 rounded-full object-cover border border-[var(--border-color)] bg-[var(--card-surface)] shrink-0 shadow-2xs"
                    />
                    <span className="font-bold text-[var(--text-primary)]">{root.nickname}</span>
                    {root.investmentType && root.investmentType !== '미진단' && (
                      <Link
                        href={
                          root.typeScores
                            ? `/tools/type/${root.investmentType}?u=${encodeURIComponent(root.nickname)}&g=${root.typeScores.g}&a=${root.typeScores.a}&l=${root.typeScores.l}&r=${root.typeScores.r}`
                            : `/tools/type/${root.investmentType}`
                        }
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono text-[var(--text-secondary)] hover:text-[var(--accent-orange)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:shadow-2xs transition-all leading-none select-none cursor-pointer"
                        title={`${root.nickname}님의 ${root.investmentType} 성향 상세 결과 보기`}
                      >
                        {root.investmentType}
                      </Link>
                    )}
                    {root.nickname === '주식부엉' && (
                      <span className="inline-flex items-center text-[var(--accent-orange)]" title="공식 인증">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--accent-orange)] text-[var(--bg-main)]" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] shrink-0">
                    <span>{formatRelativeTime(root.createdAt)}</span>
                    {canDeleteRoot && (
                      <button
                        type="button"
                        onClick={() => handleDelete(root.id)}
                        disabled={deletingId === root.id}
                        className="text-[var(--text-secondary)] hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title="댓글 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Root Content */}
                <p className="text-xs sm:text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed pl-8">
                  {root.content}
                </p>

                {/* Reply Button */}
                <div className="flex items-center gap-2 pt-0.5 pl-8">
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        openAuthPopover();
                        return;
                      }
                      setReplyingToId(replyingToId === root.id ? null : root.id);
                      setReplyContent('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>답글 {replies.length > 0 && `(${replies.length})`}</span>
                  </button>
                </div>

                {/* Reply Input Box (Visible when replying) */}
                {replyingToId === root.id && (
                  <div className="pt-2 pl-8 space-y-2">
                    <div className="p-3 rounded-2xl bg-[var(--bg-main)]/80 border border-[var(--accent-orange)]/30 space-y-2">
                      <div className="relative">
                        <textarea
                          rows={2}
                          maxLength={500}
                          placeholder={`@${root.nickname}님에게 답글 작성`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="w-full p-2.5 pr-18 rounded-xl bg-[var(--bg-main)] text-xs text-[var(--text-primary)] border border-[var(--border-color)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-orange)] resize-none shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => handleReplySubmit(root.id)}
                          disabled={!replyContent.trim() || submitting}
                          className="absolute right-2 bottom-2.5 px-2.5 py-1 rounded-lg bg-[var(--accent-orange)] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:opacity-90 disabled:opacity-40 cursor-pointer"
                        >
                          <span>답글 등록</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Replies List */}
                {replies.length > 0 && (
                  <div className="space-y-2 pt-1 pl-6 sm:pl-8 border-l border-[var(--border-color)] ml-3">
                    {replies.map((reply) => {
                      const canDeleteReply = isMasterAdmin || (user && user.nickname === reply.nickname);
                      const replyAvatar = getAvatarSrc(reply.nickname, reply.avatarUrl);

                      return (
                        <div
                          key={reply.id}
                          className="p-2.5 sm:p-3 rounded-xl bg-[var(--card-surface)]/60 border border-[var(--border-color)] space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <img
                                src={replyAvatar}
                                alt={reply.nickname}
                                className="w-5 h-5 rounded-full object-cover border border-[var(--border-color)] bg-[var(--bg-main)] shrink-0"
                              />
                              <span className="font-bold text-[var(--text-primary)]">{reply.nickname}</span>
                              {reply.investmentType && reply.investmentType !== '미진단' && (
                                <Link
                                  href={
                                    reply.typeScores
                                      ? `/tools/type/${reply.investmentType}?u=${encodeURIComponent(reply.nickname)}&g=${reply.typeScores.g}&a=${reply.typeScores.a}&l=${reply.typeScores.l}&r=${reply.typeScores.r}`
                                      : `/tools/type/${reply.investmentType}`
                                  }
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold font-mono text-[var(--text-secondary)] hover:text-[var(--accent-orange)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)]/40 hover:shadow-2xs transition-all leading-none select-none cursor-pointer"
                                  title={`${reply.nickname}님의 ${reply.investmentType} 성향 상세 결과 보기`}
                                >
                                  {reply.investmentType}
                                </Link>
                              )}
                              {reply.nickname === '주식부엉' && (
                                <span className="inline-flex items-center text-[var(--accent-orange)]" title="공식 인증">
                                  <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--accent-orange)] text-[var(--bg-main)]" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] shrink-0">
                              <span>{formatRelativeTime(reply.createdAt)}</span>
                              {canDeleteReply && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(reply.id)}
                                  disabled={deletingId === reply.id}
                                  className="text-[var(--text-secondary)] hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                                  title="답글 삭제"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed pl-6.5">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
