'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  X, 
  HelpCircle
} from 'lucide-react';
import etfData from '@/data/etfFees.json';
import RevealOnScroll from '@/components/common/RevealOnScroll';

interface WeeklyPrice {
  date: string;
  close: number;
}

interface KrEtf {
  id: string;
  code: string;
  name: string;
  category: string;
  subCategory?: string;
  dividendYield: number;
  totalFee: number;
  etcFee: number;
  ter: number;
  tradeFee: number;
  actualFee: number;
  price: number;
  marketCap: number; // 억 원 단위
  return3m: number;
  return1y: number;
  weeklyPrices: WeeklyPrice[];
  isDomestic: boolean;
}

interface UsEtf {
  id: string;
  ticker: string;
  displayTicker: string;
  name: string;
  category: string;
  subCategory?: string;
  dividendYield: number;
  expenseRatio: number;
  dividendSchedule: string;
  price: number;
  aumBillions: number; // $B 단위
  return1m: number;
  return3m: number;
  return1y: number;
  weeklyPrices: WeeklyPrice[];
  isDomestic: boolean;
}

type EtfTab = 'kr' | 'us';
type SortField = 'name' | 'fee' | 'return' | 'yield' | 'price' | 'aum';
type SortOrder = 'asc' | 'desc';

const TABS: Array<{ id: EtfTab; label: string }> = [
  { id: 'kr', label: '국내 ETF' },
  { id: 'us', label: '미국 ETF' },
];

const KR_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'sp500', label: 'S&P 500' },
  { id: 'nasdaq100', label: '나스닥 100' },
  { id: 'schd', label: '미국배당다우존스' },
  { id: 'bonds', label: '미국 30년 국채' },
  { id: 'kospi200', label: '코스피 200' },
];

const US_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'sp500', label: 'S&P 500' },
  { id: 'nasdaq100', label: '나스닥 100' },
  { id: 'schd', label: '배당 성장' },
  { id: 'bonds', label: '미국 채권' },
  { id: 'income', label: '월배당/인컴' },
];

const SUB_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'standard', label: '기본' },
  { id: 'hedged', label: '환헤지 (H)' },
  { id: 'covered_call', label: '커버드콜' },
  { id: 'active', label: '액티브' },
  { id: 'leverage', label: '레버리지' },
];

// 초소형 단독 설명 데이터 (배수 왜곡 없는 정확한 서술)
const MINI_TIPS: Record<string, { title: string; desc: string }> = {
  fee: {
    title: '실부담 비용',
    desc: '표기된 운용보수 뒤에 숨겨진 기타비용과 매매·중개수수료를 모두 합친 진짜 연간 총비용입니다.',
  },
  hedged: {
    title: '환헤지 (H)',
    desc: '환율 변동 위험을 없애고 오직 주식 가격 변동만 추종합니다. (환헤지 파생 비용 발생 가능)',
  },
  covered_call: {
    title: '커버드콜',
    desc: '콜옵션을 판매해 높은 월배당을 주는 대신, 주식 가격 급등 시 상승 폭이 일정 수준으로 제한됩니다.',
  },
  active: {
    title: '액티브',
    desc: '지수를 그대로 복제하지 않고 운용역이 유망 종목을 골라 초과 수익을 추구합니다.',
  },
  leverage: {
    title: '레버리지',
    desc: '기초지수의 일일 변동 폭을 2배, 3배 등 배수로 확대 추종하는 고위험 상품입니다. 지수 상승 시 높은 수익을 내지만, 시장이 횡보하거나 하락할 때 변동성 잠식(음의 복리)으로 인해 원금 손실 위험이 매우 큽니다.',
  },
  tr: {
    title: 'TR (배당 재투자)',
    desc: '배당금을 현금으로 주지 않고 펀드에 자동 재투자하여 과세를 훗날 주식을 팔 때까지 미룹니다.',
  },
};

export default function EtfFeesPage() {
  const [currentTab, setCurrentTab] = useState<EtfTab>('kr');
  const [selectedCategory, setSelectedCategory] = useState<string>('sp500');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('fee');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // 30년 PRO 스타일 팝오버 고유 식별자 상태 (item.id 기반 단독 팝업)
  const [activeTipId, setActiveTipId] = useState<string | null>(null);

  const activeTabIndex = TABS.findIndex((t) => t.id === currentTab);

  // ESC 키로 팝오버 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTipId) {
        setActiveTipId(null);
      }
    };
    if (activeTipId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTipId]);

  const handleTabChange = (tab: EtfTab) => {
    setCurrentTab(tab);
    setSelectedCategory('sp500');
    setSelectedSubCategory('all');
    setActiveTipId(null);
  };

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' || field === 'fee' ? 'asc' : 'desc');
    }
  };

  // 국내 ETF 필터링 & 정렬
  const filteredKrEtfs = useMemo(() => {
    let list = (etfData.krEtfs as KrEtf[]).filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSub = selectedSubCategory === 'all' || item.subCategory === selectedSubCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        item.name.toLowerCase().includes(q) || 
        item.code.includes(q);
      return matchCat && matchSub && matchSearch;
    });

    list.sort((a, b) => {
      let diff = 0;
      if (sortField === 'name') diff = a.name.localeCompare(b.name, 'ko');
      else if (sortField === 'fee') diff = a.actualFee - b.actualFee;
      else if (sortField === 'return') diff = (a.return1y || 0) - (b.return1y || 0);
      else if (sortField === 'price') diff = (a.price || 0) - (b.price || 0);
      else if (sortField === 'yield') diff = (a.dividendYield || 0) - (b.dividendYield || 0);
      else if (sortField === 'aum') diff = (a.marketCap || 0) - (b.marketCap || 0);

      return sortOrder === 'asc' ? diff : -diff;
    });

    return list;
  }, [selectedCategory, selectedSubCategory, searchQuery, sortField, sortOrder]);

  // 미국 ETF 필터링 & 정렬
  const filteredUsEtfs = useMemo(() => {
    let list = (etfData.usEtfs as UsEtf[]).filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSub = selectedSubCategory === 'all' || item.subCategory === selectedSubCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        item.displayTicker.toLowerCase().includes(q) || 
        item.name.toLowerCase().includes(q);
      return matchCat && matchSub && matchSearch;
    });

    list.sort((a, b) => {
      let diff = 0;
      if (sortField === 'name') diff = a.displayTicker.localeCompare(b.displayTicker);
      else if (sortField === 'fee') diff = a.expenseRatio - b.expenseRatio;
      else if (sortField === 'return') diff = (a.return1y || 0) - (b.return1y || 0);
      else if (sortField === 'price') diff = (a.price || 0) - (b.price || 0);
      else if (sortField === 'yield') diff = (a.dividendYield || 0) - (b.dividendYield || 0);
      else if (sortField === 'aum') diff = (a.aumBillions || 0) - (b.aumBillions || 0);

      return sortOrder === 'asc' ? diff : -diff;
    });

    return list;
  }, [selectedCategory, selectedSubCategory, searchQuery, sortField, sortOrder]);

  const currentCategories = currentTab === 'kr' ? KR_CATEGORIES : US_CATEGORIES;
  const availableSubCategories = useMemo(() => {
    if (currentTab === 'us') {
      return SUB_CATEGORIES.filter((sub) => sub.id !== 'hedged');
    }
    return SUB_CATEGORIES;
  }, [currentTab]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
      
      {/* ── Page Hero Header (De-boxed Clean Minimal - tools 통일 규격) ── */}
      <RevealOnScroll delayIndex={1}>
        <div className="py-2 px-1 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            ETF 수수료
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            숨은 비용까지 합산한 ETF 실부담 비용을 한눈에 비교해 보세요.
          </p>
        </div>
      </RevealOnScroll>

      {/* ── Apple HIG 2-Segmented Pill Controller (테두리 오렌지 + 글로우 규격) ── */}
      <RevealOnScroll delayIndex={2}>
        <div className="flex justify-center w-full">
          <div className="relative grid grid-cols-2 p-1 rounded-full bg-[var(--card-surface)]/80 backdrop-blur-md border border-[var(--border-color)]/90 shadow-2xs w-full max-w-[280px] sm:max-w-[300px]">
            {/* Sliding Animated Indicator with Apple snappy bezier (배경 카드 서피스 + 테두리 오렌지 글로우) */}
            <div
              className="absolute top-1 bottom-1 left-1 rounded-full bg-[var(--card-surface)] border border-[rgba(241,143,1,0.6)] shadow-[0_0_12px_rgba(241,143,1,0.22)] transition-transform duration-300 pointer-events-none"
              style={{
                width: 'calc((100% - 8px) / 2)',
                transform: `translateX(calc(${activeTabIndex} * 100%))`,
                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            />

            {TABS.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative z-10 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors text-center cursor-pointer select-none ${
                    isActive ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>

      {/* ── 필터 & 검색 툴바 (no-scrollbar 완벽 적용) ── */}
      <RevealOnScroll delayIndex={3}>
        <div className="space-y-3">
          {/* 1차 카테고리 탭 (지수군별 - no-scrollbar로 모바일 스크롤바 100% 제거) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {currentCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-orange)] text-white shadow-xs font-semibold'
                      : 'bg-[var(--card-surface)]/80 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] border border-[var(--border-color)]/80'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* 2차 하위 유형 탭 + 검색창 (no-scrollbar 적용) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {availableSubCategories.map((sub) => {
                const isActive = selectedSubCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCategory(sub.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--accent-orange)] text-white font-semibold shadow-xs'
                        : 'bg-[var(--card-surface)]/80 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] border border-[var(--border-color)]/70'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* 검색창 (pl-9로 아이콘 겹침 방지) */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
              <input
                type="text"
                placeholder={currentTab === 'kr' ? "종목명 또는 코드 검색..." : "티커 또는 종목명 검색..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-full text-xs bg-[var(--card-surface)]/90 border border-[var(--border-color)]/80 focus:border-[var(--accent-orange)] focus:outline-hidden text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* ── 테이블 컬럼 헤더 바 (수직 1:1 칼정렬) ── */}
      <RevealOnScroll delayIndex={4}>
        <div 
          style={{ zIndex: activeTipId === 'header_fee' ? 45 : undefined }}
          className={`flex items-center justify-between px-3 sm:px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)]/80 border-x border-transparent tracking-tight select-none transition-all ${
            activeTipId === 'header_fee' ? 'relative z-45' : 'relative z-0'
          }`}
        >
          {/* 종목명 컬럼 */}
          <div 
            onClick={() => handleSortClick('name')}
            className={`flex-1 min-w-0 pr-2 flex items-center gap-1 cursor-pointer transition-colors select-none ${
              sortField === 'name' ? 'text-[var(--accent-orange)]' : 'hover:text-[var(--text-primary)]'
            }`}
          >
            <span>종목명</span>
            {sortField === 'name' ? (
              sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0" /> : <ArrowDown className="w-3 h-3 shrink-0" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-30 shrink-0" />
            )}
          </div>
          
          {/* 우측 수치 컬럼들 (모바일: 134px 고정, 데스크톱: 전체 5개 열 1:1 수직 칼정렬) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 text-center whitespace-nowrap">
            {/* 1. 실부담 비용 */}
            <div className="w-16 sm:w-24 relative flex items-center justify-center">
              <div 
                onClick={() => handleSortClick('fee')}
                className={`flex items-center justify-center gap-0.5 cursor-pointer transition-colors whitespace-nowrap select-none ${
                  sortField === 'fee' ? 'text-[var(--accent-orange)]' : 'hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="sm:hidden text-[11px]">실부담</span>
                <span className="hidden sm:inline">실부담 비용</span>
                {sortField === 'fee' ? (
                  sortOrder === 'asc' ? <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> : <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                ) : null}
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTipId(activeTipId === 'header_fee' ? null : 'header_fee');
                }}
                title="실부담 비용 설명 보기"
                className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] cursor-pointer"
              >
                <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70" />
              </button>

              {/* 30년 PRO 스타일 팝오버: animate-popover-expand (왼쪽 위 시작) */}
              {activeTipId === 'header_fee' && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{ transformOrigin: 'top left' }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-32px)] p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl space-y-2 text-left font-sans animate-popover-expand origin-top-left pointer-events-auto select-text"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[var(--accent-orange)] font-extrabold text-xs">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] shrink-0 shadow-[0_0_8px_rgba(241,143,1,0.5)]" />
                      <span className="text-[var(--text-primary)] font-bold">{MINI_TIPS.fee.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveTipId(null); }}
                      className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11.5px] sm:text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                    {MINI_TIPS.fee.desc}
                  </p>
                </div>
              )}
            </div>

            {/* 2. 1년 수익률 */}
            <div 
              onClick={() => handleSortClick('return')}
              className={`w-16 sm:w-20 flex items-center justify-center gap-0.5 cursor-pointer transition-colors whitespace-nowrap select-none ${
                sortField === 'return' ? 'text-[var(--accent-orange)]' : 'hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="sm:hidden text-[11px]">수익률</span>
              <span className="hidden sm:inline">1년 수익률</span>
              {sortField === 'return' ? (
                sortOrder === 'asc' ? <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> : <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              ) : null}
            </div>

            {/* 3. 배당률 (모바일 숨김) */}
            <div 
              onClick={() => handleSortClick('yield')}
              className={`hidden sm:flex sm:w-16 items-center justify-center gap-0.5 cursor-pointer transition-colors whitespace-nowrap select-none ${
                sortField === 'yield' ? 'text-[var(--accent-orange)]' : 'hover:text-[var(--text-primary)]'
              }`}
            >
              <span>배당률</span>
              {sortField === 'yield' ? (
                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0" /> : <ArrowDown className="w-3 h-3 shrink-0" />
              ) : null}
            </div>

            {/* 4. 가격 (모바일 숨김) */}
            <div 
              onClick={() => handleSortClick('price')}
              className={`hidden sm:flex sm:w-20 items-center justify-center gap-0.5 cursor-pointer transition-colors whitespace-nowrap select-none ${
                sortField === 'price' ? 'text-[var(--accent-orange)]' : 'hover:text-[var(--text-primary)]'
              }`}
            >
              <span>가격</span>
              {sortField === 'price' ? (
                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0" /> : <ArrowDown className="w-3 h-3 shrink-0" />
              ) : null}
            </div>

            {/* 5. 순자산 (모바일 숨김) */}
            <div 
              onClick={() => handleSortClick('aum')}
              className={`hidden sm:flex sm:w-16 items-center justify-center gap-0.5 cursor-pointer transition-colors whitespace-nowrap select-none ${
                sortField === 'aum' ? 'text-[var(--accent-orange)]' : 'hover:text-[var(--text-primary)]'
              }`}
            >
              <span>순자산</span>
              {sortField === 'aum' ? (
                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 shrink-0" /> : <ArrowDown className="w-3 h-3 shrink-0" />
              ) : null}
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* ── ETF 리스트 (종목명 1열, 코드 2열 배치로 이름 잘림 방지, 마우스 호버 없는 정적 카드) ── */}
      <RevealOnScroll delayIndex={5}>
        <div className="space-y-1.5">
          {currentTab === 'kr' ? (
            /* 국내 ETF 리스트 */
            filteredKrEtfs.length > 0 ? (
              filteredKrEtfs.map((item, idx) => {
                const isTr = item.name.includes('TR');
                const subKey = item.subCategory && item.subCategory !== 'standard' ? item.subCategory : null;
                const isRowActive = activeTipId ? activeTipId.startsWith(item.id) : false;

                return (
                  <div
                    key={item.id}
                    style={{
                      animation: 'etfRowReveal 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both',
                      animationDelay: `${Math.min(idx * 16, 240)}ms`,
                      zIndex: isRowActive ? 45 : undefined,
                    }}
                    className={`px-3 sm:px-4 py-3 rounded-xl border border-[var(--border-color)]/80 bg-[var(--card-surface)]/80 shadow-2xs transition-all ${
                      isRowActive ? 'relative z-45' : 'relative z-0'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      {/* 좌측 종목 정보: 1열 종목명+뱃지, 2열 단축코드 (두 줄 분리로 긴 종목명 잘림 완전 방지) */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] leading-tight break-words sm:break-keep">
                            {item.name}
                          </span>

                          {/* 특성 뱃지 & ? 클릭 시 팝오버 (고유 ID로 단 1개만 팝업, 좌상단 시작 & 최상위 노출) */}
                          {subKey && MINI_TIPS[subKey] && (() => {
                            const tipId = `${item.id}_${subKey}`;
                            return (
                              <span className="relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--card-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] shrink-0">
                                <span>
                                  {subKey === 'hedged' ? '환헤지' : subKey === 'covered_call' ? '커버드콜' : subKey === 'active' ? '액티브' : '레버리지'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTipId(activeTipId === tipId ? null : tipId);
                                  }}
                                  className="text-[var(--text-secondary)] hover:text-[var(--accent-orange)] cursor-pointer"
                                >
                                  <HelpCircle className="w-2.5 h-2.5 opacity-70" />
                                </button>

                                {/* 30년 PRO 스타일 팝오버 (왼쪽 위 시작) */}
                                {activeTipId === tipId && (
                                  <div 
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ transformOrigin: 'top left' }}
                                    className="absolute top-full left-0 mt-2 z-50 w-64 sm:w-72 max-w-[calc(100vw-48px)] p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl space-y-2 text-left font-sans animate-popover-expand origin-top-left pointer-events-auto select-text"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-[var(--accent-orange)] font-extrabold text-xs">
                                        <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] shrink-0 shadow-[0_0_8px_rgba(241,143,1,0.5)]" />
                                        <span className="text-[var(--text-primary)] font-bold">{MINI_TIPS[subKey].title}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setActiveTipId(null); }}
                                        className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] cursor-pointer transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-[11.5px] sm:text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                                      {MINI_TIPS[subKey].desc}
                                    </p>
                                  </div>
                                )}
                              </span>
                            );
                          })()}

                          {/* TR 뱃지 (고유 ID로 단 1개만 팝업, 좌상단 시작 & 최상위 노출) */}
                          {isTr && (() => {
                            const tipId = `${item.id}_tr`;
                            return (
                              <span className="relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 border border-purple-500/25 text-purple-600 dark:text-purple-400 shrink-0">
                                <span>TR</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTipId(activeTipId === tipId ? null : tipId);
                                  }}
                                  className="text-purple-600 dark:text-purple-400 hover:text-[var(--accent-orange)] cursor-pointer"
                                >
                                  <HelpCircle className="w-2.5 h-2.5 opacity-70" />
                                </button>

                                {/* 30년 PRO 스타일 팝오버 (왼쪽 위 시작) */}
                                {activeTipId === tipId && (
                                  <div 
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ transformOrigin: 'top left' }}
                                    className="absolute top-full left-0 mt-2 z-50 w-64 sm:w-72 max-w-[calc(100vw-48px)] p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl space-y-2 text-left font-sans animate-popover-expand origin-top-left pointer-events-auto select-text"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-[var(--accent-orange)] font-extrabold text-xs">
                                        <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] shrink-0 shadow-[0_0_8px_rgba(241,143,1,0.5)]" />
                                        <span className="text-[var(--text-primary)] font-bold">{MINI_TIPS.tr.title}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setActiveTipId(null); }}
                                        className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] cursor-pointer transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-[11.5px] sm:text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                                      {MINI_TIPS.tr.desc}
                                    </p>
                                  </div>
                                )}
                              </span>
                            );
                          })()}
                        </div>

                        {/* 단축코드 단독 표기 (자산운용사 없이 깔끔) */}
                        <div className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
                          {item.code}
                        </div>
                      </div>

                      {/* 우측 수치 지표 (헤더와 100% 동일한 width와 gap) */}
                      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 text-center whitespace-nowrap">
                        {/* 1. 실부담 비용 */}
                        <div className="w-16 sm:w-24 text-center text-xs font-bold text-[var(--accent-orange)] font-mono tabular-nums">
                          {item.actualFee.toFixed(4)}%
                        </div>

                        {/* 2. 1년 수익률 */}
                        <div className={`w-16 sm:w-20 text-center text-xs font-bold font-mono tabular-nums ${
                          item.return1y > 0
                            ? 'text-emerald-500'
                            : item.return1y < 0
                            ? 'text-rose-500'
                            : 'text-[var(--text-secondary)]'
                        }`}>
                          {item.return1y !== 0 ? `${item.return1y > 0 ? '+' : ''}${item.return1y.toFixed(2)}%` : '-'}
                        </div>

                        {/* 3. 배당률 (모바일 숨김) */}
                        <div className="hidden sm:block sm:w-16 text-center text-xs font-medium text-[var(--text-primary)] font-mono tabular-nums">
                          {item.dividendYield ? `${item.dividendYield.toFixed(2)}%` : '-'}
                        </div>

                        {/* 4. 가격 (모바일 숨김) */}
                        <div className="hidden sm:block sm:w-20 text-center text-xs font-medium text-[var(--text-primary)] font-mono tabular-nums">
                          {item.price ? `${item.price.toLocaleString()}원` : '-'}
                        </div>

                        {/* 5. 순자산 (모바일 숨김) */}
                        <div className="hidden sm:block sm:w-16 text-center text-xs font-medium text-[var(--text-primary)] font-mono tabular-nums">
                          {item.marketCap ? `${(item.marketCap / 10000).toFixed(1)}조원` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-sm text-[var(--text-secondary)] rounded-xl border border-[var(--border-color)]/80 bg-[var(--card-surface)]/60">
                선택하신 조건에 해당하는 ETF가 없습니다.
              </div>
            )
          ) : (
            /* 미국 직투 ETF 리스트 */
            filteredUsEtfs.length > 0 ? (
              filteredUsEtfs.map((item, idx) => {
                const subKey = item.subCategory && item.subCategory !== 'standard' ? item.subCategory : null;
                const isRowActive = activeTipId ? activeTipId.startsWith(item.id) : false;

                return (
                  <div
                    key={item.id}
                    style={{
                      animation: 'etfRowReveal 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both',
                      animationDelay: `${Math.min(idx * 16, 240)}ms`,
                      zIndex: isRowActive ? 45 : undefined,
                    }}
                    className={`px-3 sm:px-4 py-3 rounded-xl border border-[var(--border-color)]/80 bg-[var(--card-surface)]/80 shadow-2xs transition-all ${
                      isRowActive ? 'relative z-45' : 'relative z-0'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      {/* 좌측 미국 종목 정보: 1열 티커 + 뱃지, 2열 종목 풀네임 */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[var(--text-primary)] shrink-0">
                            {item.displayTicker}
                          </span>

                          {/* 특성 뱃지 & ? 클릭 시 팝오버 (고유 ID로 단 1개만 팝업, 좌상단 시작 & 최상위 노출) */}
                          {subKey && MINI_TIPS[subKey] && (() => {
                            const tipId = `${item.id}_${subKey}`;
                            return (
                              <span className="relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--card-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] shrink-0">
                                <span>
                                  {subKey === 'covered_call' ? '커버드콜' : subKey === 'active' ? '액티브' : '레버리지'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTipId(activeTipId === tipId ? null : tipId);
                                  }}
                                  className="text-[var(--text-secondary)] hover:text-[var(--accent-orange)] cursor-pointer"
                                >
                                  <HelpCircle className="w-2.5 h-2.5 opacity-70" />
                                </button>

                                {/* 30년 PRO 스타일 팝오버 (왼쪽 위 시작) */}
                                {activeTipId === tipId && (
                                  <div 
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ transformOrigin: 'top left' }}
                                    className="absolute top-full left-0 mt-2 z-50 w-64 sm:w-72 max-w-[calc(100vw-48px)] p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl space-y-2 text-left font-sans animate-popover-expand origin-top-left pointer-events-auto select-text"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-[var(--accent-orange)] font-extrabold text-xs">
                                        <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)] shrink-0 shadow-[0_0_8px_rgba(241,143,1,0.5)]" />
                                        <span className="text-[var(--text-primary)] font-bold">{MINI_TIPS[subKey].title}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setActiveTipId(null); }}
                                        className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] cursor-pointer transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-[11.5px] sm:text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                                      {MINI_TIPS[subKey].desc}
                                    </p>
                                  </div>
                                )}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                          {item.name}
                        </div>
                      </div>

                      {/* 우측 수치 지표 (헤더와 100% 동일한 width와 gap) */}
                      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 text-center whitespace-nowrap">
                        {/* 1. 실부담 비용 (Expense Ratio) */}
                        <div className="w-16 sm:w-24 text-center text-xs font-bold text-[var(--accent-orange)] font-mono tabular-nums">
                          {item.expenseRatio.toFixed(2)}%
                        </div>

                        {/* 2. 1년 수익률 */}
                        <div className={`w-16 sm:w-20 text-center text-xs font-bold font-mono tabular-nums ${
                          item.return1y > 0
                            ? 'text-emerald-500'
                            : item.return1y < 0
                            ? 'text-rose-500'
                            : 'text-[var(--text-secondary)]'
                        }`}>
                          {item.return1y !== 0 ? `${item.return1y > 0 ? '+' : ''}${item.return1y.toFixed(2)}%` : '-'}
                        </div>

                        {/* 3. 배당률 (모바일 숨김) */}
                        <div className="hidden sm:block sm:w-16 text-center text-xs font-medium text-[var(--text-primary)] font-mono tabular-nums">
                          {item.dividendYield ? `${item.dividendYield.toFixed(2)}%` : '-'}
                        </div>

                        {/* 4. 가격 (모바일 숨김) */}
                        <div className="hidden sm:block sm:w-20 text-center text-xs font-medium text-[var(--text-primary)] font-mono tabular-nums">
                          {item.price ? `$${item.price.toFixed(2)}` : '-'}
                        </div>

                        {/* 5. 순자산 (모바일 숨김) */}
                        <div className="hidden sm:block sm:w-16 text-center text-xs font-medium text-[var(--text-primary)] font-mono tabular-nums">
                          {item.aumBillions ? `$${item.aumBillions}B` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-sm text-[var(--text-secondary)] rounded-xl border border-[var(--border-color)]/80 bg-[var(--card-surface)]/60">
                선택하신 조건에 해당하는 ETF가 없습니다.
              </div>
            )
          )}
        </div>
      </RevealOnScroll>

      {/* ── 하단 공식 공시 기준 & 최근 갱신 알약 캡슐 ── */}
      <RevealOnScroll delayIndex={6}>
        <div className="flex items-center justify-center pt-2 pb-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[var(--border-color)]/70 bg-[var(--card-surface)]/60 backdrop-blur-md text-[11px] sm:text-xs text-[var(--text-secondary)]/90 shadow-2xs font-medium">
            <span>공식 공시 기준 <span className="font-mono tabular-nums font-semibold">{etfData.kofiaBaseDate}</span></span>
            <span className="opacity-30">|</span>
            <span>최근 갱신 <span className="font-mono tabular-nums font-semibold">{etfData.updatedAt.slice(0, 10)}</span></span>
          </div>
        </div>
      </RevealOnScroll>

      {/* ── 바깥 클릭 닫기 투명 레이어 (화면 어두움 0%, 100% 완전 투명) ── */}
      {activeTipId && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default pointer-events-auto"
          onClick={() => setActiveTipId(null)}
        />
      )}

      {/* ── 순차 등장 애니메이션 ── */}
      <style jsx global>{`
        @keyframes etfRowReveal {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
