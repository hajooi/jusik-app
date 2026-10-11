'use client';

import React from 'react';
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  Newspaper, 
  RefreshCw,
  Paperclip,
  Mic
} from 'lucide-react';
import SmoothHeight from '@/components/SmoothHeight';

export interface BriefingData {
  dateStr: string;
  market: {
    spx: { price: string; change: string; isUp: boolean };
    usdkrw: { price: string; change: string; isUp: boolean };
  };
  stocks: Array<{
    name: string;
    symbol: string;
    price: string;
    change: string;
    isUp: boolean;
  }>;
  news: string[];
}

interface Props {
  data: BriefingData;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AiSecretarySimulator({ data, isLoading, onRefresh }: Props) {
  return (
    <div className="select-none">
      {/* 글래스모피즘 가상 스마트폰 텔레그램 메신저 프레임 */}
      <div className="relative mx-auto max-w-xl rounded-3xl overflow-hidden border border-[var(--border-color)]/90 bg-[var(--card-surface)]/80 dark:bg-[#12161c]/85 backdrop-blur-2xl shadow-xl text-slate-100">
        {/* 텔레그램 앱 상단 바 */}
        <div className="px-4 py-3 bg-slate-900/40 dark:bg-black/30 border-b border-[var(--border-color)]/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 봇 아바타 */}
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-2xs shrink-0">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] dark:text-white tracking-tight">
                  AI 주식 비서 (예시)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-mono font-bold">
                  bot
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] dark:text-slate-400 font-medium h-3.5 flex items-center">
                {isLoading ? (
                  <span className="text-sky-500 dark:text-sky-400 flex items-center gap-1 animate-pulse">
                    <span>메시지를 입력하는 중</span>
                    <span className="inline-block animate-bounce">.</span>
                    <span className="inline-block animate-bounce delay-100">.</span>
                    <span className="inline-block animate-bounce delay-200">.</span>
                  </span>
                ) : (
                  <span>bot</span>
                )}
              </p>
            </div>
          </div>

          {/* 새로고침 버튼 */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-surface)]/80 hover:bg-[var(--card-hover)] backdrop-blur-md border border-[var(--border-color)]/90 hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_14px_rgba(241,143,1,0.15)] active:scale-95 text-xs font-bold text-[var(--text-primary)] dark:text-slate-200 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            title="시세 및 뉴스 새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--accent-orange)]' : ''}`} />
            <span className="hidden sm:inline">새로고침</span>
          </button>
        </div>

        {/* 텔레그램 채팅 대화방 영역 */}
        <div className="p-4 sm:p-5 space-y-3.5 min-h-[380px] bg-slate-950/20 dark:bg-black/40 backdrop-blur-sm">
          {/* 날짜 배지 */}
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-[var(--bg-main)]/80 dark:bg-white/10 text-[11px] font-medium text-[var(--text-secondary)] dark:text-slate-300 border border-[var(--border-color)]/60 backdrop-blur-md shadow-2xs">
              {data.dateStr}
            </span>
          </div>

          <SmoothHeight>
            {isLoading ? (
              <div className="p-8 rounded-2xl bg-[var(--card-surface)]/50 border border-[var(--border-color)] flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)] animate-pulse my-4 shadow-2xs">
                <Bot className="w-7 h-7 text-[var(--accent-orange)] animate-bounce" />
                <p className="text-xs font-medium">야후 파이낸스와 구글 뉴스에서 실시간 데이터를 가져오는 중입니다...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 실제 텔레그램 수신 말풍선 (톡! 떠오르는 팝업 수신 애니메이션) */}
                <div className="relative p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)] dark:bg-[#1a2028] border border-[var(--border-color)]/90 text-[var(--text-primary)] dark:text-slate-200 space-y-4 shadow-md max-w-lg transition-all transform animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-300 ease-out">
                  {/* 말풍선 헤더 (구분선 없이 자연스러운 타이포그래피와 여백으로 구성) */}
                  <div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] dark:text-white">
                      [모닝 브리핑 예시] {data.dateStr}
                    </h5>
                  </div>

                  {/* 1. 시장 핵심 거시 지표 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)] dark:text-amber-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>시장 핵심 지표</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[var(--bg-main)]/80 dark:bg-white/5 border border-[var(--border-color)]/70 dark:border-white/5">
                        <span className="text-[10px] text-[var(--text-secondary)] dark:text-slate-400 block font-medium">S&P 500 지수</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <strong className="text-[var(--text-primary)] dark:text-white font-mono text-xs sm:text-sm">{data.market.spx.price}</strong>
                          <span className={`text-[11px] font-bold font-mono ${data.market.spx.isUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {data.market.spx.change}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--bg-main)]/80 dark:bg-white/5 border border-[var(--border-color)]/70 dark:border-white/5">
                        <span className="text-[10px] text-[var(--text-secondary)] dark:text-slate-400 block font-medium">원/달러 환율</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <strong className="text-[var(--text-primary)] dark:text-white font-mono text-xs sm:text-sm">{data.market.usdkrw.price}</strong>
                          <span className={`text-[11px] font-bold font-mono ${data.market.usdkrw.isUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {data.market.usdkrw.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. 내 관심 종목 시황 */}
                  {data.stocks.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)] dark:text-amber-400">
                        <span>내 관심 종목 시황</span>
                      </div>

                      <div className="space-y-2">
                        {data.stocks.map((st, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)]/80 dark:bg-white/5 border border-[var(--border-color)]/70 dark:border-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-4 rounded-full bg-[var(--accent-orange)]" />
                              <div>
                                <span className="text-xs font-extrabold text-[var(--text-primary)] dark:text-white block">
                                  {st.name}
                                </span>
                                <span className="text-[10px] text-[var(--text-secondary)] dark:text-slate-400 font-mono">
                                  {st.symbol}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] dark:text-white font-mono block">
                                {st.price}
                              </span>
                              <span
                                className={`text-[11px] font-extrabold font-mono flex items-center justify-end gap-0.5 ${
                                  st.isUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                                }`}
                              >
                                {st.isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                {st.change}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. 구글 뉴스 RSS 핵심 뉴스 3선 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-orange)] dark:text-amber-400">
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>오늘의 핵심 뉴스 3선</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] dark:text-slate-300">
                      {data.news.map((item, nIdx) => (
                        <li key={nIdx} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--bg-main)]/50 dark:bg-white/[0.03]">
                          <span className="w-4 h-4 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 font-mono">
                            {nIdx + 1}
                          </span>
                          <span className="leading-relaxed flex-1 text-[11px] sm:text-xs text-[var(--text-primary)] dark:text-slate-200 font-medium">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 텔레그램 실제 타임스탬프 & 읽음 표시 */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[var(--text-secondary)] dark:text-slate-400 font-mono pt-1">
                    <span>오전 8:00</span>
                    <span className="text-[var(--accent-orange)] font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            )}
          </SmoothHeight>
        </div>

        {/* 실제 텔레그램 앱의 하단 메시지 입력창 UI 재현 */}
        <div className="px-4 py-3 bg-slate-900/40 dark:bg-black/30 border-t border-[var(--border-color)]/70 backdrop-blur-md flex items-center gap-3">
          <button type="button" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-slate-400 dark:hover:text-white transition-colors cursor-default" title="첨부">
            <Paperclip className="w-4 h-4" />
          </button>
          <div className="flex-1 px-3.5 py-1.5 rounded-full bg-[var(--bg-main)]/60 dark:bg-white/5 border border-[var(--border-color)]/80 text-xs text-[var(--text-secondary)] dark:text-slate-400 font-medium flex items-center justify-between">
            <span>메시지 보내기...</span>
          </div>
          <button type="button" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-slate-400 dark:hover:text-white transition-colors cursor-default" title="음성 메시지">
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
