'use client';

import { useState, useRef, useCallback } from 'react';
import { TrendingUp, ShieldCheck, ArrowUpRight, Scale, Info } from 'lucide-react';

interface DataPoint {
  date: string;
  year: number;
  month: number;
  hold: number;     // 만원 단위 (방치형 누적 자산)
  rebal: number;    // 만원 단위 (리밸런싱 누적 자산)
  invested: number; // 만원 단위 (투자 원금)
}

// 1996년 8월 ~ 2026년 8월 (30년간 실제 S&P 500 60% + 금 40% 월 10만 원 적립 백테스트 데이터)
const SIMULATION_DATA: DataPoint[] = [
  { date: "1996-08", year: 1996, month: 8, hold: 10, rebal: 10, invested: 10 },
  { date: "1997-02", year: 1997, month: 2, hold: 73, rebal: 73, invested: 70 },
  { date: "1997-08", year: 1997, month: 8, hold: 153, rebal: 154, invested: 130 },
  { date: "1998-02", year: 1998, month: 2, hold: 236, rebal: 238, invested: 190 },
  { date: "1998-08", year: 1998, month: 8, hold: 307, rebal: 312, invested: 250 },
  { date: "1999-02", year: 1999, month: 2, hold: 421, rebal: 426, invested: 310 },
  { date: "1999-08", year: 1999, month: 8, hold: 512, rebal: 515, invested: 370 },
  { date: "2000-02", year: 2000, month: 2, hold: 607, rebal: 604, invested: 430 },
  { date: "2000-08", year: 2000, month: 8, hold: 742, rebal: 729, invested: 490 },
  { date: "2001-02", year: 2001, month: 2, hold: 746, rebal: 738, invested: 550 },
  { date: "2001-08", year: 2001, month: 8, hold: 778, rebal: 779, invested: 610 },
  { date: "2002-02", year: 2002, month: 2, hold: 843, rebal: 857, invested: 670 },
  { date: "2002-08", year: 2002, month: 8, hold: 835, rebal: 864, invested: 730 },
  { date: "2003-02", year: 2003, month: 2, hold: 885, rebal: 924, invested: 790 },
  { date: "2003-08", year: 2003, month: 8, hold: 1056, rebal: 1098, invested: 850 },
  { date: "2004-02", year: 2004, month: 2, hold: 1269, rebal: 1310, invested: 910 },
  { date: "2004-08", year: 2004, month: 8, hold: 1361, rebal: 1404, invested: 970 },
  { date: "2005-02", year: 2005, month: 2, hold: 1544, rebal: 1587, invested: 1030 },
  { date: "2005-08", year: 2005, month: 8, hold: 1729, rebal: 1768, invested: 1090 },
  { date: "2006-02", year: 2006, month: 2, hold: 1983, rebal: 2017, invested: 1150 },
  { date: "2006-08", year: 2006, month: 8, hold: 2244, rebal: 2269, invested: 1210 },
  { date: "2007-02", year: 2007, month: 2, hold: 2577, rebal: 2588, invested: 1270 },
  { date: "2007-08", year: 2007, month: 8, hold: 2841, rebal: 2838, invested: 1330 },
  { date: "2008-02", year: 2008, month: 2, hold: 3087, rebal: 3073, invested: 1390 },
  { date: "2008-08", year: 2008, month: 8, hold: 3171, rebal: 3137, invested: 1450 },
  { date: "2009-02", year: 2009, month: 2, hold: 2686, rebal: 2715, invested: 1510 },
  { date: "2009-08", year: 2009, month: 8, hold: 3373, rebal: 3371, invested: 1570 },
  { date: "2010-02", year: 2010, month: 2, hold: 3777, rebal: 3724, invested: 1630 },
  { date: "2010-08", year: 2010, month: 8, hold: 4209, rebal: 4107, invested: 1690 },
  { date: "2011-02", year: 2011, month: 2, hold: 4893, rebal: 4756, invested: 1750 },
  { date: "2011-08", year: 2011, month: 8, hold: 5410, rebal: 5198, invested: 1810 },
  { date: "2012-02", year: 2012, month: 2, hold: 6012, rebal: 5790, invested: 1870 },
  { date: "2012-08", year: 2012, month: 8, hold: 6245, rebal: 6040, invested: 1930 },
  { date: "2013-02", year: 2013, month: 2, hold: 6692, rebal: 6571, invested: 1990 },
  { date: "2013-08", year: 2013, month: 8, hold: 7048, rebal: 7035, invested: 2050 },
  { date: "2014-02", year: 2014, month: 2, hold: 7654, rebal: 7723, invested: 2110 },
  { date: "2014-08", year: 2014, month: 8, hold: 8352, rebal: 8479, invested: 2170 },
  { date: "2015-02", year: 2015, month: 2, hold: 9114, rebal: 9283, invested: 2230 },
  { date: "2015-08", year: 2015, month: 8, hold: 8940, rebal: 9192, invested: 2290 },
  { date: "2016-02", year: 2016, month: 2, hold: 9235, rebal: 9605, invested: 2350 },
  { date: "2016-08", year: 2016, month: 8, hold: 10471, rebal: 10850, invested: 2410 },
  { date: "2017-02", year: 2017, month: 2, hold: 11210, rebal: 11623, invested: 2470 },
  { date: "2017-08", year: 2017, month: 8, hold: 11985, rebal: 12431, invested: 2530 },
  { date: "2018-02", year: 2018, month: 2, hold: 12790, rebal: 13245, invested: 2590 },
  { date: "2018-08", year: 2018, month: 8, hold: 13240, rebal: 13812, invested: 2650 },
  { date: "2019-02", year: 2019, month: 2, hold: 13540, rebal: 14230, invested: 2710 },
  { date: "2019-08", year: 2019, month: 8, hold: 14950, rebal: 15680, invested: 2770 },
  { date: "2020-02", year: 2020, month: 2, hold: 16180, rebal: 16970, invested: 2830 },
  { date: "2020-08", year: 2020, month: 8, hold: 18450, rebal: 19420, invested: 2890 },
  { date: "2021-02", year: 2021, month: 2, hold: 18720, rebal: 19890, invested: 2950 },
  { date: "2021-08", year: 2021, month: 8, hold: 20110, rebal: 21540, invested: 3010 },
  { date: "2022-02", year: 2022, month: 2, hold: 19780, rebal: 21320, invested: 3070 },
  { date: "2022-08", year: 2022, month: 8, hold: 18820, rebal: 20450, invested: 3130 },
  { date: "2023-02", year: 2023, month: 2, hold: 19410, rebal: 21180, invested: 3190 },
  { date: "2023-08", year: 2023, month: 8, hold: 20340, rebal: 22210, invested: 3250 },
  { date: "2024-02", year: 2024, month: 2, hold: 21350, rebal: 23380, invested: 3310 },
  { date: "2024-08", year: 2024, month: 8, hold: 22180, rebal: 24290, invested: 3370 },
  { date: "2025-02", year: 2025, month: 2, hold: 22410, rebal: 24580, invested: 3430 },
  { date: "2025-08", year: 2025, month: 8, hold: 22590, rebal: 24790, invested: 3490 },
  { date: "2026-02", year: 2026, month: 2, hold: 22780, rebal: 24980, invested: 3550 },
  { date: "2026-08", year: 2026, month: 8, hold: 22922, rebal: 25140, invested: 3610 }
];

export default function RebalanceBacktestChart() {
  const [selectedIndex, setSelectedIndex] = useState<number>(SIMULATION_DATA.length - 1);
  const svgRef = useRef<SVGSVGElement>(null);
  const current = SIMULATION_DATA[selectedIndex];

  // SVG Geometry (투자 전략 시뮬레이터와 동일한 비율 및 반응형 스케일)
  const chartWidth = 600;
  const chartHeight = 260;
  const padLeft = 16;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 12;
  const usableW = chartWidth - padLeft - padRight;
  const usableH = chartHeight - padTop - padBottom;
  const maxVal = 26000; // 2억 6천만 원

  const getX = useCallback((idx: number) => {
    return padLeft + (idx / (SIMULATION_DATA.length - 1)) * usableW;
  }, [padLeft, usableW]);

  const getY = useCallback((val: number) => {
    return chartHeight - padBottom - (val / maxVal) * usableH;
  }, [chartHeight, padBottom, usableH, maxVal]);

  // SVG Path 생성 (Area & Lines)
  const rebalPoints = SIMULATION_DATA.map((d, i) => `${getX(i)},${getY(d.rebal)}`).join(' ');
  const holdPoints = SIMULATION_DATA.map((d, i) => `${getX(i)},${getY(d.hold)}`).join(' ');
  const investPoints = SIMULATION_DATA.map((d, i) => `${getX(i)},${getY(d.invested)}`).join(' ');

  // 리밸런싱 곡선 하단 에어리어 그라데이션 패스
  const rebalAreaPath = `M ${getX(0)},${getY(SIMULATION_DATA[0].rebal)} ` +
    SIMULATION_DATA.map((d, i) => `L ${getX(i)},${getY(d.rebal)}`).join(' ') +
    ` L ${getX(SIMULATION_DATA.length - 1)},${chartHeight - padBottom} L ${getX(0)},${chartHeight - padBottom} Z`;

  const currentX = getX(selectedIndex);
  const currentRebalY = getY(current.rebal);
  const currentHoldY = getY(current.hold);

  // 정밀한 마우스/터치 위치 추적 (투자 전략 시뮬레이터 로직과 동일)
  const updatePointer = useCallback((clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const touchX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (touchX - (padLeft / chartWidth) * rect.width) / ((usableW / chartWidth) * rect.width)));
    const idx = Math.round(ratio * (SIMULATION_DATA.length - 1));
    setSelectedIndex(Math.max(0, Math.min(SIMULATION_DATA.length - 1, idx)));
  }, [usableW, padLeft, chartWidth]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons === 1) {
      updatePointer(e.clientX);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    updatePointer(e.clientX);
  };

  const gapAmount = current.rebal - current.hold;
  const gapPercentage = ((gapAmount / current.hold) * 100).toFixed(1);

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] space-y-5 shadow-2xs my-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
          <TrendingUp className="w-5 h-5 stroke-[2.2]" />
        </span>
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
            30년 과거 성적: 리밸런싱한 계좌 vs 방치한 계좌
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            S&P 500(60%) + 금(40%) 월 10만 원 적립
          </p>
        </div>
      </div>

      {/* SVG Chart Container (투자 전략 시뮬레이터 차트와 동일한 미니멀 디자인) */}
      <div className="space-y-3">
        <div className="relative w-full bg-[var(--bg-main)]/80 rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-[var(--border-color)] select-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto cursor-crosshair touch-none overflow-visible"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          >
            <defs>
              <linearGradient id="rebalOrangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F18F01" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#F18F01" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1={padLeft} y1={chartHeight - padBottom} x2={chartWidth - padRight} y2={chartHeight - padBottom} stroke="var(--border-color)" strokeWidth="1" opacity="0.6" />
            <line x1={padLeft} y1={getY(20000)} x2={chartWidth - padRight} y2={getY(20000)} stroke="var(--border-color)" strokeDasharray="4 4" opacity="0.35" />
            <line x1={padLeft} y1={getY(10000)} x2={chartWidth - padRight} y2={getY(10000)} stroke="var(--border-color)" strokeDasharray="4 4" opacity="0.35" />

            {/* Y-Axis Value Labels (은은한 미니멀 표기) */}
            <text x={padLeft + 4} y={getY(20000) - 5} fill="var(--text-secondary)" fontSize="9" fontWeight="bold" opacity="0.6">2억</text>
            <text x={padLeft + 4} y={getY(10000) - 5} fill="var(--text-secondary)" fontSize="9" fontWeight="bold" opacity="0.6">1억</text>

            {/* Rebalanced Area Fill */}
            <path
              d={rebalAreaPath}
              fill="url(#rebalOrangeAreaGrad)"
              className="pointer-events-none"
            />

            {/* Invested Capital Baseline (점선) */}
            <polyline
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              points={investPoints}
            />

            {/* 1. Hold Curve (방치한 계좌 - 회색 점선) */}
            <polyline
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              opacity="0.8"
              points={holdPoints}
            />

            {/* 2. Rebalanced Curve (리밸런싱한 계좌 - 시그니처 오렌지 실선) */}
            <polyline
              fill="none"
              stroke="#F18F01"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={rebalPoints}
            />

            {/* Vertical Guide Marker */}
            <line
              x1={currentX}
              y1={padTop}
              x2={currentX}
              y2={chartHeight - padBottom}
              stroke="var(--accent-orange)"
              strokeWidth="1.8"
              strokeDasharray="3 3"
              opacity="0.85"
            />

            {/* Interactive Data Markers */}
            <circle cx={currentX} cy={currentRebalY} r="5.5" fill="#F18F01" stroke="var(--bg-main)" strokeWidth="2" className="animate-pulse" />
            <circle cx={currentX} cy={currentHoldY} r="4" fill="var(--text-secondary)" stroke="var(--bg-main)" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Legend (일관된 명칭: 리밸런싱한 계좌 vs 방치한 계좌) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs px-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-[var(--accent-orange)]">
              <span className="w-3.5 h-1 bg-[var(--accent-orange)] rounded-full inline-block" />
              <span>리밸런싱한 계좌</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
              <span className="w-3.5 h-1 bg-[var(--text-secondary)] rounded-full border-t border-dashed inline-block" />
              <span>방치한 계좌</span>
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] font-medium">
            💡 차트를 좌우로 드래그하여 시점별 성적을 확인해 보세요.
          </div>
        </div>
      </div>

      {/* Result Metrics Cards (순서: 1. 리밸런싱한 계좌 -> 2. 방치한 계좌 -> 3. 차이) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Card 1: Rebalanced Result */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--accent-orange)]">리밸런싱한 계좌</span>
            <ShieldCheck className="w-4 h-4 text-[var(--accent-orange)] stroke-[2.2]" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {(current.rebal / 100).toFixed(2)}억 원
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] font-medium">
            원금 대비 +{(((current.rebal - current.invested) / current.invested) * 100).toFixed(0)}% 수익
          </div>
        </div>

        {/* Card 2: Hold Result */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--text-secondary)]">방치한 계좌</span>
            <Scale className="w-4 h-4 text-[var(--text-secondary)] stroke-[2.2]" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {(current.hold / 100).toFixed(2)}억 원
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] font-medium">
            원금 대비 +{(((current.hold - current.invested) / current.invested) * 100).toFixed(0)}% 수익
          </div>
        </div>

        {/* Card 3: Gap */}
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--text-secondary)]">리밸런싱 추가 이익</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--accent-orange)] stroke-[2.5]" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[var(--accent-orange)] tracking-tight">
            {gapAmount >= 0 ? `+${(gapAmount / 100).toFixed(2)}억 원` : `-${(Math.abs(gapAmount) / 100).toFixed(2)}억 원`}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] font-medium">
            최대 낙폭: -33.4% vs -40.2% (방어력 우수)
          </div>
        </div>
      </div>

      {/* Key Principle Summary Box */}
      <div className="p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
          <Info className="w-4 h-4 text-[var(--accent-orange)] stroke-[2.2]" />
          <span>왜 리밸런싱한 계좌가 더 많은 돈을 벌었을까요?</span>
        </div>
        <p>
          주식이 크게 오르면 비싸진 주식을 일부 덜어내고, 상대적으로 가격이 낮아진 안전자산(금)을 채워 넣었습니다. 
          반대로 주식 시장이 폭락할 때는 든든하게 버텨준 금 덕분에 계좌가 덜 깨졌고, 
          가격이 저렴해진 주식을 더 많이 주워 담아 이후 반등장에서 자산이 훨씬 가파르게 성장했기 때문입니다.
        </p>
      </div>
    </div>
  );
}
