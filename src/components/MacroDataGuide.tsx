'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Database, 
  CheckCircle2, 
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Percent,
  Users,
  AlertCircle,
  BarChart2
} from 'lucide-react';

export default function MacroDataGuide() {
  return (
    <div className="glass-card p-3.5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xs space-y-5 sm:space-y-6 select-none">
      {/* ── 모듈 헤더 ── */}
      <div className="space-y-1.5 border-b border-[var(--border-color)]/70 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0 shadow-2xs">
            <Database className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2]" />
          </span>
          <h3 className="text-base sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)] break-keep">
            거시경제 발표일에 흔들리지 않기 위한 지표 확인 방법
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium pl-8 sm:pl-9 break-keep">
          FRED와 리서치 기관의 원자료를 직접 확인하는 방법입니다.
        </p>
      </div>

      {/* ── 3단계 스텝 스택 ── */}
      <div className="space-y-4 sm:space-y-5">
        {/* 1단계: 공식 기관의 핵심 원자료 5종 직접 확인하기 */}
        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--card-surface)]/60 backdrop-blur-xl border border-[var(--border-color)]/80 space-y-3.5 sm:space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="p-1 sm:p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-mono font-bold text-xs inline-flex items-center justify-center shrink-0">
              01
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5 sm:gap-2 break-keep">
              <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-orange)] shrink-0" />
              <span>공식 기관의 5대 핵심 원자료 직접 확인하기</span>
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium pl-1 sm:pl-2 break-keep">
            자극적인 뉴스 헤드라인에 흔들리지 않으려면 공인 기관의 숫자를 직접 확인해야 합니다. 시장의 큰 흐름을 결정짓는 5대 지표의 의미와 공식 차트입니다.
          </p>

          {/* 5대 공식 지표 상세 설명 & Glassmorphic 카드 리스트 */}
          <div className="space-y-2.5 sm:space-y-3 pt-1">
            {/* 1. 기준금리 */}
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[var(--border-color)]/80 backdrop-blur-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="p-1 sm:p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                    <Percent className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate">
                    미국 기준금리 (DFEDTARU)
                  </span>
                </div>
                <a
                  href="https://fred.stlouisfed.org/series/DFEDTARU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--accent-orange)]/30 hover:border-transparent backdrop-blur-md shadow-2xs hover:shadow-[0_0_12px_rgba(241,143,1,0.25)] transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>공식 차트</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium leading-relaxed break-keep">
                전 세계 모든 돈의 가격이자 통화 정책의 출발점입니다. 고금리 유지 여부와 인하 시점을 점검합니다.
              </p>
            </div>

            {/* 2. 소비자물가지수 CPI */}
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[var(--border-color)]/80 backdrop-blur-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="p-1 sm:p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate">
                    소비자물가지수 CPI (CPIAUCNS)
                  </span>
                </div>
                <a
                  href="https://fred.stlouisfed.org/series/CPIAUCNS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--accent-orange)]/30 hover:border-transparent backdrop-blur-md shadow-2xs hover:shadow-[0_0_12px_rgba(241,143,1,0.25)] transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>공식 차트</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium leading-relaxed break-keep">
                가계의 장바구니 물가와 인플레이션 압력을 측정합니다. 전년 대비 상승률이 2%대로 안착하는지 확인합니다.
              </p>
            </div>

            {/* 3. 실업률 */}
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[var(--border-color)]/80 backdrop-blur-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="p-1 sm:p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate">
                    미국 공식 실업률 (UNRATE)
                  </span>
                </div>
                <a
                  href="https://fred.stlouisfed.org/series/UNRATE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--accent-orange)]/30 hover:border-transparent backdrop-blur-md shadow-2xs hover:shadow-[0_0_12px_rgba(241,143,1,0.25)] transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>공식 차트</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium leading-relaxed break-keep">
                소비를 지탱하는 실물 일자리의 건강 상태입니다. 실업률이 4% 안팎에서 안정적으로 유지되는지 점검합니다.
              </p>
            </div>

            {/* 4. 하이일드 신용스프레드 */}
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[var(--border-color)]/80 backdrop-blur-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="p-1 sm:p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate">
                    하이일드 신용스프레드 (BAMLH0A0HYM2)
                  </span>
                </div>
                <a
                  href="https://fred.stlouisfed.org/series/BAMLH0A0HYM2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--accent-orange)]/30 hover:border-transparent backdrop-blur-md shadow-2xs hover:shadow-[0_0_12px_rgba(241,143,1,0.25)] transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>공식 차트</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium leading-relaxed break-keep">
                채권 시장이 체감하는 기업 부도 위험입니다. 연준 및 채권 시장의 공인 위험선인 5.0%를 기준으로 자금 시장 긴장 신호를 감지합니다.
              </p>
            </div>

            {/* 5. S&P 500 기업 실적 (Yardeni Research) */}
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[var(--border-color)]/80 backdrop-blur-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="p-1 sm:p-1.5 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                    <BarChart2 className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] truncate">
                    S&P 500 기업 실적 (Yardeni)
                  </span>
                </div>
                <a
                  href="https://yardeni.com/charts/us-stock-market/stock-market-fundamentals/sp-500-earnings-the-economy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-[var(--accent-orange)] bg-[var(--accent-orange)]/10 hover:bg-[var(--accent-orange)] hover:text-white border border-[var(--accent-orange)]/30 hover:border-transparent backdrop-blur-md shadow-2xs hover:shadow-[0_0_12px_rgba(241,143,1,0.25)] transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
                >
                  <span>야데니 차트</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium leading-relaxed break-keep">
                주식 시장의 본질적인 상승 동력인 500대 기업의 이익 성장세(EPS)를 월가 공인 리서치 자료로 종합 점검합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 2단계: jusik.app에서 5대 지표 한눈에 확인하기 */}
        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[var(--accent-orange)]/12 via-[var(--card-surface)]/80 to-[var(--accent-orange)]/6 backdrop-blur-xl border border-[var(--accent-orange)]/35 space-y-3.5 sm:space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="p-1 sm:p-1.5 rounded-lg bg-[var(--accent-orange)] text-white font-mono font-bold text-xs inline-flex items-center justify-center shrink-0 shadow-sm">
              02
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 sm:gap-2 break-keep">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-orange)] shrink-0" />
              <span>jusik.app에서 5대 지표 한눈에 확인하기</span>
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium pl-1 sm:pl-2 break-keep">
            위 5개 사이트를 매번 일일이 찾아다니며 점검하는 것은 번거롭습니다. 그래서 jusik.app에서는 <strong>기준금리, 소비자물가, 실업률, 하이일드 스프레드, S&P 500 기업 실적</strong> 5대 지표의 현재 상태와 핵심 일정을 <strong>한 화면에서 실시간 신호등으로 비교할 수 있도록 모두 모아두었습니다.</strong>
          </p>

          <div className="pt-0.5">
            <Link
              href="/tools/market"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl glass-card border border-[var(--accent-orange)]/40 hover:border-[var(--accent-orange)] hover:shadow-[0_0_20px_rgba(241,143,1,0.25)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer w-full"
            >
              <div className="space-y-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] animate-pulse shrink-0 shadow-[0_0_8px_rgba(241,143,1,0.8)]" />
                  <div className="text-sm sm:text-base font-black text-[var(--text-primary)] group-hover:text-[var(--accent-orange)] transition-colors break-keep">
                    5대 거시경제 지표 한눈에 보기
                  </div>
                </div>
                <div className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium pl-4 break-keep">
                  jusik.app 마켓 인사이트 도구에서 5대 핵심 지표 실시간 신호등 비교
                </div>
              </div>
              <div className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl sm:rounded-full bg-[var(--accent-orange)] text-white font-extrabold text-xs shadow-md group-hover:shadow-[0_0_18px_rgba(241,143,1,0.45)] transition-all duration-200 active:scale-95 shrink-0">
                <span>지금 확인하러 가기</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* 3단계: 소음에 휩쓸리지 않고 정기 적립식 원칙 지키기 */}
        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-emerald-500/[0.04] backdrop-blur-xl border border-emerald-500/25 space-y-2 sm:space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs inline-flex items-center justify-center shrink-0">
              03
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5 sm:gap-2 break-keep">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
              <span>소음에 휩쓸리지 않고 정기 적립식 원칙 지키기</span>
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium pl-1 sm:pl-2 break-keep">
            지표 발표 당일의 단기 급등락에 일희일비하여 충동적으로 <strong>주식을 사거나 팔지 않습니다.</strong> 객관적인 숫자로 경기 체력을 확인했다면, 미국 1등 기업과 지수 ETF를 매달 정해진 날짜에 모아가는 장기 적립식 루틴을 묵묵히 이어갑니다.
          </p>
        </div>
      </div>
    </div>
  );
}
