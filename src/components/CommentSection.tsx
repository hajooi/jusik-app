'use client';

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime } from '@/utils/relativeTime';
import { calculateSurveyResult, PERSONALITY_PROFILES } from '@/data/investmentSurvey';
import { MessageSquare, Send, Trash2, CornerDownRight, LogIn, CheckCircle2, Crown } from 'lucide-react';
import TypePreviewPopover from '@/components/type/TypePreviewPopover';
import TermsQuizPreviewPopover from '@/components/TermsQuizPreviewPopover';

export interface CommentData {
  id: string;
  targetKey: string;
  nickname: string;
  content: string;
  avatarUrl?: string;
  investmentType?: string;
  typeScores?: { g: number; a: number; l: number; r: number };
  activeBadge?: string;
  isPro?: boolean;
  termsQuiz?: {
    level?: number;
    score?: number;
    correctCount?: number;
    totalQuestions?: number;
    timeSpentSec?: number;
    percentile?: number;
    badgeName?: string;
  };
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

  // Type popover target
  const [previewTarget, setPreviewTarget] = useState<{
    id: string;
    code: string;
    authorNickname?: string;
    typeScores?: { g: number; a: number; l: number; r: number };
    anchorRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number };
  } | null>(null);

  // Quiz popover target (floating popover with exact anchorRect)
  const [quizPopoverTarget, setQuizPopoverTarget] = useState<{
    id: string;
    authorNickname?: string;
    termsQuiz?: any;
    anchorRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number };
  } | null>(null);

  // Helper to get avatar source (커스텀 아바타 최우선 즉시 반영)
  const getAvatarSrc = (commentNick: string, avatarUrl?: string) => {
    if (avatarUrl && !avatarUrl.includes('default-avatar') && !avatarUrl.includes('guest.png')) {
      return avatarUrl;
    }
    if (commentNick?.trim() === '주식부엉') return '/icon.png?v=3';
    return '/guest.png?v=3';
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
          activeBadge: user.activeBadge,
          isPro: true,
          termsQuiz: user.termsQuizBest,
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
          activeBadge: user.activeBadge,
          isPro: true,
          termsQuiz: user.termsQuizBest,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
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

              {/* Dynamic Active Badge on Comment Form Header */}
              {user.activeBadge === 'none' ? null : user.activeBadge === 'pro' ? (
                <span 
                  className="animate-pro-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold font-mono text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/50 select-none leading-none"
                  title="내 PRO 회원 뱃지"
                >
                  <Crown className="w-3 h-3 stroke-[2.4] fill-[var(--accent-orange)]/20 animate-pulse" />
                  <span className="tracking-wide">PRO</span>
                </span>
              ) : user.activeBadge === 'terms_percentile' && user.termsQuizBest?.badgeName ? (
                <span 
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono leading-none select-none ${
                    (user.termsQuizBest.percentile && user.termsQuizBest.percentile <= 10) || user.termsQuizBest.badgeName?.includes('마스터')
                      ? 'animate-elite-badge text-emerald-500 bg-emerald-500/10 border border-emerald-500/40'
                      : 'text-[var(--text-secondary)] bg-[var(--bg-main)]/80 border border-[var(--border-color)]'
                  }`}
                >
                  {user.termsQuizBest.badgeName}
                </span>
              ) : (user.activeBadge === 'investmentType' || !user.activeBadge) && user.investmentType && user.investmentType !== '미진단' ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono text-[var(--text-secondary)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] leading-none select-none">
                  {user.investmentType}
                </span>
              ) : null}

              {isMasterAdmin && (
                <span className="inline-flex items-center text-[var(--accent-orange)]" title="관리자">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--accent-orange)] text-[var(--bg-main)]" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-mono">{content.length}/500</span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              maxLength={500}
              placeholder="댓글을 남겨보세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3.5 pr-20 rounded-2xl bg-[var(--bg-main)] text-xs sm:text-sm text-[var(--text-primary)] border border-[var(--border-color)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-orange)] resize-none shadow-inner"
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="absolute right-2.5 bottom-3.5 px-3.5 py-1.5 rounded-full bg-[var(--accent-orange)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? '등록 중...' : '등록'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
            로그인 후 댓글과 질문을 남겨보세요!
          </div>
          <button
            type="button"
            onClick={openAuthPopover}
            className="px-4 py-2 rounded-full bg-[var(--accent-orange)] border border-[rgba(241,143,1,0.5)] hover:brightness-110 hover:shadow-[0_0_16px_rgba(241,143,1,0.3)] active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>로그인 / 계정 만들기</span>
          </button>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-3 pt-2">
        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--text-secondary)]">댓글을 불러오는 중입니다...</div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <p className="text-xs text-[var(--text-secondary)]">아직 작성된 댓글이 없습니다.</p>
            <p className="text-xs font-bold text-[var(--accent-orange)]">첫 번째 댓글의 주인공이 되어보세요!</p>
          </div>
        ) : (
          rootComments.map((root) => {
            const replies = repliesMap[root.id] || [];
            const isCurrentUser = !!(user && user.nickname === root.nickname);
            const canDeleteRoot = isMasterAdmin || isCurrentUser;
            const rootAvatar = getAvatarSrc(
              root.nickname,
              isCurrentUser ? (user.avatarUrl || '') : root.avatarUrl
            );
            const rootActiveBadge = isCurrentUser ? (user.activeBadge || root.activeBadge) : root.activeBadge;
            const rootTermsQuiz = isCurrentUser ? (user.termsQuizBest || root.termsQuiz) : root.termsQuiz;
            const rootInvestmentType = isCurrentUser ? (user.investmentType || root.investmentType) : root.investmentType;

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

                    {/* User Active Badge Selection (One of: PRO / Terms Quiz / Investment Type) */}
                    {rootActiveBadge === 'none' ? null : rootActiveBadge === 'pro' ? (
                      <span 
                        className="animate-pro-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold font-mono text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/50 select-none leading-none"
                        title={`${root.nickname}님의 PRO 회원 뱃지`}
                      >
                        <Crown className="w-3 h-3 stroke-[2.4] fill-[var(--accent-orange)]/20 animate-pulse" />
                        <span className="tracking-wide">PRO</span>
                      </span>
                    ) : rootActiveBadge === 'terms_percentile' && rootTermsQuiz?.badgeName ? (
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setQuizPopoverTarget(
                              quizPopoverTarget?.id === root.id
                                ? null
                                : {
                                    id: root.id,
                                    authorNickname: root.nickname,
                                    termsQuiz: rootTermsQuiz,
                                    anchorRect: {
                                      top: rect.top,
                                      bottom: rect.bottom,
                                      left: rect.left,
                                      right: rect.right,
                                      width: rect.width,
                                      height: rect.height,
                                    },
                                  }
                            );
                          }}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono transition-all leading-none select-none cursor-pointer ${
                            (rootTermsQuiz.percentile && rootTermsQuiz.percentile <= 10) || rootTermsQuiz.badgeName?.includes('마스터')
                              ? 'animate-elite-badge text-emerald-500 bg-emerald-500/10 border border-emerald-500/40 hover:border-emerald-500'
                              : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)] hover:shadow-2xs'
                          }`}
                          title={`${root.nickname}님의 실전 용어 퀴즈 랭킹 보기`}
                        >
                          {rootTermsQuiz.badgeName}
                        </button>
                        {quizPopoverTarget?.id === root.id && (
                          <TermsQuizPreviewPopover
                            authorNickname={quizPopoverTarget.authorNickname}
                            termsQuiz={quizPopoverTarget.termsQuiz}
                            anchorRect={quizPopoverTarget.anchorRect}
                            onClose={() => setQuizPopoverTarget(null)}
                          />
                        )}
                      </div>
                    ) : (rootActiveBadge === 'investmentType' || !rootActiveBadge) && rootInvestmentType && rootInvestmentType !== '미진단' ? (
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setPreviewTarget(
                              previewTarget?.id === root.id
                                ? null
                                : {
                                    id: root.id,
                                    code: rootInvestmentType,
                                    authorNickname: root.nickname,
                                    typeScores: root.typeScores,
                                    anchorRect: {
                                      top: rect.top,
                                      bottom: rect.bottom,
                                      left: rect.left,
                                      right: rect.right,
                                      width: rect.width,
                                      height: rect.height,
                                    },
                                  }
                            );
                          }}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono text-[var(--text-secondary)] hover:text-[var(--accent-orange)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)] hover:shadow-2xs transition-all leading-none select-none cursor-pointer"
                          title={`${root.nickname}님의 ${rootInvestmentType} 성향 미리보기`}
                        >
                          {rootInvestmentType}
                        </button>
                        {previewTarget?.id === root.id && (
                          <TypePreviewPopover
                            typeCode={previewTarget.code}
                            authorNickname={previewTarget.authorNickname}
                            typeScores={previewTarget.typeScores}
                            anchorRect={previewTarget.anchorRect}
                            onClose={() => setPreviewTarget(null)}
                          />
                        )}
                      </div>
                    ) : null}

                    {/* Master Admin Verified Check Indicator */}
                    {root.nickname === '주식부엉' && (
                      <span className="inline-flex items-center text-[var(--accent-orange)]" title="공식 인증 관리자">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--accent-orange)] text-[var(--bg-main)]" />
                      </span>
                    )}

                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {formatRelativeTime(root.createdAt)}
                    </span>
                  </div>

                  {/* Actions: Delete Root */}
                  {canDeleteRoot && (
                    <button
                      type="button"
                      onClick={() => handleDelete(root.id)}
                      className="text-[var(--text-secondary)] hover:text-[var(--accent-crimson)] p-1 transition-colors cursor-pointer"
                      title="댓글 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Root Content */}
                <p className="text-xs sm:text-sm text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed pl-8">
                  {root.content}
                </p>

                {/* Reply Trigger Button */}
                <div className="pl-8 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (replyingToId === root.id) {
                        setReplyingToId(null);
                        setReplyContent('');
                      } else {
                        setReplyingToId(root.id);
                        setReplyContent('');
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors cursor-pointer"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>{replyingToId === root.id ? '답글 취소' : '답글 달기'}</span>
                  </button>
                </div>

                {/* Inline Reply Input Form */}
                {replyingToId === root.id && (
                  <div className="pl-6 sm:pl-8 pt-2 space-y-2">
                    {user ? (
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`${root.nickname}님에게 답글 작성...`}
                          className="flex-1 bg-[var(--bg-main)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2 border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-orange)] resize-none shadow-inner"
                          maxLength={300}
                        />
                        <button
                          type="submit"
                          onClick={() => handleReplySubmit(root.id)}
                          disabled={submitting || !replyContent.trim()}
                          className="self-end px-3.5 py-2 rounded-full bg-[var(--accent-orange)] text-white text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all shrink-0 cursor-pointer"
                        >
                          {submitting ? '등록 중...' : '등록'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] text-xs flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">로그인 후 답글을 작성할 수 있습니다.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            openAuthPopover();
                          }}
                          className="text-[var(--accent-orange)] font-bold hover:underline ml-2 shrink-0 cursor-pointer"
                        >
                          로그인 / 핀 등록
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Nested Replies List */}
                {replies.length > 0 && (
                  <div className="space-y-2 pt-1 pl-6 sm:pl-8 border-l border-[var(--border-color)] ml-3">
                    {replies.map((reply) => {
                      const isCurrentReplyUser = !!(user && user.nickname === reply.nickname);
                      const canDeleteReply = isMasterAdmin || isCurrentReplyUser;
                      const replyAvatar = getAvatarSrc(
                        reply.nickname,
                        isCurrentReplyUser ? (user.avatarUrl || '') : reply.avatarUrl
                      );
                      const replyActiveBadge = isCurrentReplyUser ? (user.activeBadge || reply.activeBadge) : reply.activeBadge;
                      const replyTermsQuiz = isCurrentReplyUser ? (user.termsQuizBest || reply.termsQuiz) : reply.termsQuiz;
                      const replyInvestmentType = isCurrentReplyUser ? (user.investmentType || reply.investmentType) : reply.investmentType;

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

                              {/* User Active Badge Selection on Reply (One of: PRO / Terms Quiz / Investment Type) */}
                              {replyActiveBadge === 'none' ? null : replyActiveBadge === 'pro' ? (
                                <span 
                                  className="animate-pro-badge inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-extrabold font-mono text-[var(--accent-orange)] bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/50 select-none leading-none"
                                  title={`${reply.nickname}님의 PRO 회원 뱃지`}
                                >
                                  <Crown className="w-2.5 h-2.5 stroke-[2.4] fill-[var(--accent-orange)]/20 animate-pulse" />
                                  <span className="tracking-wide">PRO</span>
                                </span>
                              ) : replyActiveBadge === 'terms_percentile' && replyTermsQuiz?.badgeName ? (
                                <div className="relative inline-block">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setQuizPopoverTarget(
                                        quizPopoverTarget?.id === reply.id
                                          ? null
                                          : {
                                              id: reply.id,
                                              authorNickname: reply.nickname,
                                              termsQuiz: replyTermsQuiz,
                                              anchorRect: {
                                                top: rect.top,
                                                bottom: rect.bottom,
                                                left: rect.left,
                                                right: rect.right,
                                                width: rect.width,
                                                height: rect.height,
                                              },
                                            }
                                      );
                                    }}
                                    className={`inline-flex items-center px-1 py-0.2 rounded text-[9.5px] sm:text-[10px] font-bold font-mono transition-all leading-none select-none cursor-pointer ${
                                      (replyTermsQuiz.percentile && replyTermsQuiz.percentile <= 10) || replyTermsQuiz.badgeName?.includes('마스터')
                                        ? 'animate-elite-badge text-emerald-500 bg-emerald-500/10 border border-emerald-500/40 hover:border-emerald-500'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--accent-orange)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)]'
                                    }`}
                                    title={`${reply.nickname}님의 실전 용어 퀴즈 랭킹 보기`}
                                  >
                                    {replyTermsQuiz.badgeName}
                                  </button>
                                  {quizPopoverTarget?.id === reply.id && (
                                    <TermsQuizPreviewPopover
                                      authorNickname={quizPopoverTarget.authorNickname}
                                      termsQuiz={quizPopoverTarget.termsQuiz}
                                      anchorRect={quizPopoverTarget.anchorRect}
                                      onClose={() => setQuizPopoverTarget(null)}
                                    />
                                  )}
                                </div>
                              ) : (replyActiveBadge === 'investmentType' || !replyActiveBadge) && replyInvestmentType && replyInvestmentType !== '미진단' ? (
                                <div className="relative inline-block">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setPreviewTarget(
                                        previewTarget?.id === reply.id
                                          ? null
                                          : {
                                              id: reply.id,
                                              code: replyInvestmentType,
                                              authorNickname: reply.nickname,
                                              typeScores: reply.typeScores,
                                              anchorRect: {
                                                top: rect.top,
                                                bottom: rect.bottom,
                                                left: rect.left,
                                                right: rect.right,
                                                width: rect.width,
                                                height: rect.height,
                                              },
                                            }
                                      );
                                    }}
                                    className="inline-flex items-center px-1 py-0.2 rounded text-[9.5px] sm:text-[10px] font-bold font-mono text-[var(--text-secondary)] hover:text-[var(--accent-orange)] bg-[var(--bg-main)]/80 border border-[var(--border-color)] hover:border-[var(--accent-orange)] transition-all leading-none select-none cursor-pointer"
                                    title={`${reply.nickname}님의 ${replyInvestmentType} 성향 미리보기`}
                                  >
                                    {replyInvestmentType}
                                  </button>
                                  {previewTarget?.id === reply.id && (
                                    <TypePreviewPopover
                                      typeCode={previewTarget.code}
                                      authorNickname={previewTarget.authorNickname}
                                      typeScores={previewTarget.typeScores}
                                      anchorRect={previewTarget.anchorRect}
                                      onClose={() => setPreviewTarget(null)}
                                    />
                                  )}
                                </div>
                              ) : null}

                              {/* Master Admin Verified Check Indicator */}
                              {reply.nickname === '주식부엉' && (
                                <span className="inline-flex items-center text-[var(--accent-orange)]" title="공식 인증 관리자">
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
