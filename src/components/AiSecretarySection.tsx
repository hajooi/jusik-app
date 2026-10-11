'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sliders, 
  ChevronDown
} from 'lucide-react';
import AiSecretarySimulator, { BriefingData } from '@/components/AiSecretarySimulator';
import AiSecretaryWalkthrough from '@/components/AiSecretaryWalkthrough';
import { 
  SELECT_ASSET_GROUPS, 
  getYahooSymbol, 
  getCleanDisplayName 
} from '@/data/simulatorAssets';

const DEFAULT_DATA: BriefingData = {
  dateStr: '2026. 10. 12 (월)',
  market: {
    spx: { price: '5,815.03', change: '+0.77%', isUp: true },
    usdkrw: { price: '1,348.50원', change: '-4.20원', isUp: false },
  },
  stocks: [
    { name: '애플', symbol: 'AAPL', price: '$231.40', change: '+1.24%', isUp: true },
    { name: '엔비디아', symbol: 'NVDA', price: '$138.25', change: '+3.12%', isUp: true },
  ],
  news: [
    '엔비디아, 차세대 블랙웰 칩 대량 양산 돌입 및 데이터센터 수요 지속 강세',
    '애플, 온디바이스 AI 기능 탑재 업데이트 발표 및 교체 수요 증가',
    'S&P 500, 기술주 강세 흐름에 힘입어 5,800선 돌파 마감',
  ],
};

function getDisplayName(val: string): string {
  for (const grp of SELECT_ASSET_GROUPS) {
    for (const opt of grp.options) {
      if (getYahooSymbol(opt.id) === val || opt.id === val) {
        return getCleanDisplayName(opt.label);
      }
    }
  }
  return val;
}

export default function AiSecretarySection() {
  const [sym1, setSym1] = useState('AAPL');
  const [sym2, setSym2] = useState('NVDA');

  const [data, setData] = useState<BriefingData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBriefing = useCallback(async (s1: string, s2: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/market/preview-briefing?stock1=${encodeURIComponent(s1)}&stock2=${encodeURIComponent(s2)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('[fetchBriefing error]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBriefing(sym1, sym2);
  }, [sym1, sym2, fetchBriefing]);

  const promptStock1 = getDisplayName(sym1);
  const promptStock2 = getDisplayName(sym2);

  return (
    <div className="space-y-6">
      {/* ── 1. 글래스모피즘 종목 선택 드롭다운 컨트롤 패널 (시뮬레이터 50개 자산 자동 연동) ── */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[var(--card-surface)]/85 backdrop-blur-xl border border-[var(--border-color)]/90 space-y-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
            <Sliders className="w-4 h-4 stroke-[2.2]" />
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              내 관심 종목 선택
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              종목을 선택하면 텔레그램 메시지와 하단 가이드 프롬프트가 자동 갱신됩니다.
            </p>
          </div>
        </div>

        {/* 2개 종목 드롭다운 선택 영역 (시뮬레이터 50개 자산 그룹별 자동 렌더링) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* 첫 번째 종목 */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">
              첫 번째 종목
            </label>
            <div className="relative">
              <select
                value={sym1}
                onChange={(e) => setSym1(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[var(--card-surface)]/90 hover:bg-[var(--card-hover)] backdrop-blur-md border border-[var(--border-color)]/90 hover:border-[var(--accent-orange)]/50 focus:border-[var(--accent-orange)] focus:shadow-[0_0_14px_rgba(241,143,1,0.2)] text-xs sm:text-sm font-bold text-[var(--text-primary)] transition-all pr-8 cursor-pointer shadow-2xs outline-none"
              >
                {SELECT_ASSET_GROUPS.map((grp) => (
                  <optgroup key={grp.groupLabel} label={grp.groupLabel}>
                    {grp.options.map((opt) => (
                      <option key={opt.id} value={getYahooSymbol(opt.id)}>
                        {opt.label.replace(/^[　\s]*└\s*/, '')}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 두 번째 종목 */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] block">
              두 번째 종목
            </label>
            <div className="relative">
              <select
                value={sym2}
                onChange={(e) => setSym2(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[var(--card-surface)]/90 hover:bg-[var(--card-hover)] backdrop-blur-md border border-[var(--border-color)]/90 hover:border-[var(--accent-orange)]/50 focus:border-[var(--accent-orange)] focus:shadow-[0_0_14px_rgba(241,143,1,0.2)] text-xs sm:text-sm font-bold text-[var(--text-primary)] transition-all pr-8 cursor-pointer shadow-2xs outline-none"
              >
                {SELECT_ASSET_GROUPS.map((grp) => (
                  <optgroup key={grp.groupLabel} label={grp.groupLabel}>
                    {grp.options.map((opt) => (
                      <option key={opt.id} value={getYahooSymbol(opt.id)}>
                        {opt.label.replace(/^[　\s]*└\s*/, '')}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. 현실적인 텔레그램 실시간 목업 (수신 애니메이션 적용) ── */}
      <AiSecretarySimulator
        data={data}
        isLoading={isLoading}
        onRefresh={() => fetchBriefing(sym1, sym2)}
      />

      {/* ── 3. 가이드 + 프롬프트 복사 일체형 워크스루 ── */}
      <AiSecretaryWalkthrough stock1={promptStock1} stock2={promptStock2} />
    </div>
  );
}
