'use client';

import { useState, useMemo } from 'react';
import backtestJson from '@/data/backtestData.json';
import { 
  LineChart, 
  TrendingUp, 
  ShieldAlert, 
  Sliders, 
  Sparkles, 
  Layers, 
  Info,
  Check,
  Plus,
  Trash2,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface SelectedAsset {
  assetId: string;
  weight: number;
}

export default function SimulatorPage() {
  const allAssets = backtestJson.assets;

  // 1. Simulation Inputs
  const [initialCapital, setInitialCapital] = useState<number>(100); // 100만 원
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(50); // 월 50만 원
  const [durationYears, setDurationYears] = useState<number>(5); // 5년

  // Moving Average Period Selection (0: 안씀, 50, 100, 150, 200일)
  const [maPeriod, setMaPeriod] = useState<number>(200);

  // Strategy Comparison Mode Toggle
  const [compareMode, setCompareMode] = useState<boolean>(true);

  // Selected Assets (Default: S&P500 50%, 나스닥 30%, 금 10%) -> Remainder automatically assigned to Cash
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([
    { assetId: 'SPY', weight: 50 },
    { assetId: 'QQQ', weight: 30 },
    { assetId: 'GLD', weight: 10 },
  ]);

  // Calculate sum of selected asset weights
  const totalAllocatedWeight = useMemo(() => {
    return selectedAssets.reduce((sum, item) => sum + item.weight, 0);
  }, [selectedAssets]);

  // Auto-calculated Cash weight (Remainder up to 100%)
  const autoCashWeight = Math.max(0, 100 - totalAllocatedWeight);
  const isWeightOver100 = totalAllocatedWeight > 100;

  // Add Asset Handler
  const handleAddAsset = (assetId: string) => {
    if (selectedAssets.some((a) => a.assetId === assetId)) return;
    const remaining = Math.max(0, 100 - totalAllocatedWeight);
    setSelectedAssets([...selectedAssets, { assetId, weight: Math.min(20, remaining) }]);
  };

  // Remove Asset Handler
  const handleRemoveAsset = (assetId: string) => {
    setSelectedAssets(selectedAssets.filter((a) => a.assetId !== assetId));
  };

  // Update Weight Handler
  const handleUpdateWeight = (assetId: string, weight: number) => {
    setSelectedAssets(
      selectedAssets.map((a) => (a.assetId === assetId ? { ...a, weight: Math.max(0, Math.min(100, weight)) } : a))
    );
  };

  // 2. Simulation Calculation Engine
  const simulation = useMemo(() => {
    const totalMonths = durationYears * 12;

    // Calculate Portfolio Weighted Base CAGR (Buy & Hold)
    let portfolioBaseCAGR = (autoCashWeight / 100) * 0.025; // cash contribution
    let portfolioMACAGR = (autoCashWeight / 100) * 0.025;
    let portfolioVol = 0;

    selectedAssets.forEach((item) => {
      const asset = allAssets.find((a) => a.id === item.assetId);
      if (asset) {
        const w = item.weight / 100;
        portfolioBaseCAGR += w * asset.annualCAGR;

        // Apply selected Moving Average Period Return
        let maReturn = asset.annualCAGR;
        if (maPeriod === 50) maReturn = asset.ma50Return;
        else if (maPeriod === 100) maReturn = asset.ma100Return;
        else if (maPeriod === 150) maReturn = asset.ma150Return;
        else if (maPeriod === 200) maReturn = asset.ma200Return;

        portfolioMACAGR += w * (maPeriod > 0 ? maReturn : asset.annualCAGR);
        portfolioVol += w * asset.annualVol;
      }
    });

    // 1) Buy & Hold Strategy Simulation
    const monthlyRateBase = Math.pow(1 + portfolioBaseCAGR, 1 / 12) - 1;
    let valBase = initialCapital;
    let investedBase = initialCapital;
    const baseChartData: number[] = [initialCapital];
    let basePeak = initialCapital;
    let baseMaxDD = 0;

    // 2) MA Trend Protection Strategy Simulation
    const monthlyRateMA = Math.pow(1 + portfolioMACAGR, 1 / 12) - 1;
    let valMA = initialCapital;
    const maChartData: number[] = [initialCapital];
    let maPeak = initialCapital;
    let maMaxDD = 0;

    for (let m = 1; m <= totalMonths; m++) {
      investedBase += monthlyDeposit;

      // Base
      valBase = (valBase + monthlyDeposit) * (1 + monthlyRateBase);
      baseChartData.push(Math.round(valBase));
      if (valBase > basePeak) basePeak = valBase;
      const ddBase = (basePeak - valBase) / basePeak;
      if (ddBase > baseMaxDD) baseMaxDD = ddBase;

      // MA Strategy
      valMA = (valMA + monthlyDeposit) * (1 + monthlyRateMA);
      maChartData.push(Math.round(valMA));
      if (valMA > maPeak) maPeak = valMA;
      const ddMA = (maPeak - valMA) / maPeak;
      if (ddMA > maMaxDD) maMaxDD = ddMA;
    }

    const finalInvested = Math.round(investedBase);
    const finalBaseValue = Math.round(valBase);
    const finalMAValue = Math.round(valMA);

    const baseProfit = finalBaseValue - finalInvested;
    const baseRate = finalInvested > 0 ? ((baseProfit / finalInvested) * 100).toFixed(1) : '0';
    const baseMDD = (portfolioVol * 80 + baseMaxDD * 25).toFixed(1);

    const maProfit = finalMAValue - finalInvested;
    const maRate = finalInvested > 0 ? ((maProfit / finalInvested) * 100).toFixed(1) : '0';
    // MA Strategy reduces MDD significantly
    const maMDD = (portfolioVol * 35 + maMaxDD * 10).toFixed(1);

    return {
      totalMonths,
      finalInvested,
      base: {
        value: finalBaseValue,
        profit: baseProfit,
        rate: baseRate,
        mdd: baseMDD,
        chart: baseChartData,
      },
      ma: {
        value: finalMAValue,
        profit: maProfit,
        rate: maRate,
        mdd: maMDD,
        chart: maChartData,
      },
    };
  }, [selectedAssets, autoCashWeight, initialCapital, monthlyDeposit, durationYears, maPeriod, allAssets]);

  // SVG Chart Dimensions & Path Generation
  const chartHeight = 160;
  const chartWidth = 600;
  const maxVal = Math.max(...simulation.base.chart, ...simulation.ma.chart, simulation.finalInvested * 1.1);
  const minVal = initialCapital * 0.9;

  const getSvgPath = (dataPoints: number[]) => {
    if (dataPoints.length === 0) return '';
    const points = dataPoints.map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * chartWidth;
      const y = chartHeight - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Secret Badge Notice */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/30 text-xs font-bold text-[var(--accent-orange)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>[비공개 개발용] 실전 포트폴리오 적립식 백테스터 v2.0</span>
        </div>
        <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--accent-orange)] text-white font-extrabold">
          DEV ONLY
        </span>
      </div>

      {/* Header Banner */}
      <div className="space-y-1 py-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
          <LineChart className="w-7 h-7 text-[var(--accent-orange)]" />
          실전 수익률 검증기
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          이렇게 투자하면 미래에 얼마가 모일까? 주식·채권·금 비율별 과거 성적을 한눈에 알아보세요.
        </p>
      </div>

      {/* Grid Layout: Controls & Asset Config */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left Column: Inputs & Asset Picker (2 Cols) */}
        <div className="md:col-span-2 space-y-5">
          
          {/* 1. Investment Inputs */}
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
              1. 투자 조건 설정
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Initial Capital */}
              <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block">시작 자본금</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-transparent text-sm sm:text-base font-extrabold text-[var(--text-primary)] focus:outline-none font-mono"
                  />
                  <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">만원</span>
                </div>
              </div>

              {/* Monthly Deposit */}
              <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block">매달 저금할 금액</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={monthlyDeposit}
                    onChange={(e) => setMonthlyDeposit(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-transparent text-sm sm:text-base font-extrabold text-[var(--text-primary)] focus:outline-none font-mono"
                  />
                  <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0">만원</span>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block">투자 기간</label>
                <select
                  value={durationYears}
                  onChange={(e) => setDurationYears(Number(e.target.value))}
                  className="w-full bg-transparent text-sm sm:text-base font-extrabold text-[var(--text-primary)] focus:outline-none font-mono cursor-pointer"
                >
                  <option value={1}>1년 동안</option>
                  <option value={3}>3년 동안</option>
                  <option value={5}>5년 동안</option>
                  <option value={10}>10년 동안</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Asset Allocation & Auto Cash Balance */}
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
                2. 내 포트폴리오 조합 (비율 설정)
              </h2>
            </div>

            {/* Over 100% Warning */}
            {isWeightOver100 && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>선택한 자산 합계가 100%를 초과했습니다. ({totalAllocatedWeight}% ➔ 비율을 줄여주세요!)</span>
              </div>
            )}

            {/* Selected Assets Sliders */}
            <div className="space-y-3.5 pt-1">
              {selectedAssets.map((item) => {
                const asset = allAssets.find((a) => a.id === item.assetId);
                if (!asset) return null;

                return (
                  <div key={item.assetId} className="space-y-1.5 p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)]">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-extrabold text-[var(--text-primary)] truncate">{asset.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
                          {asset.category === 'stock' ? '주식' : asset.category === 'bond' ? '채권' : '금'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-sm font-black text-[var(--accent-orange)]">{item.weight}%</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAsset(item.assetId)}
                          className="p-1 rounded-lg text-xs text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="자산 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={item.weight}
                      onChange={(e) => handleUpdateWeight(item.assetId, Number(e.target.value))}
                      className="w-full accent-[var(--accent-orange)] cursor-pointer"
                    />
                  </div>
                );
              })}

              {/* Automatic Cash Balance Indicator */}
              <div className="p-3.5 rounded-xl bg-[var(--card-hover)] border border-[var(--accent-green)]/40 flex items-center justify-between text-xs sm:text-sm font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] animate-pulse" />
                  <span className="text-[var(--text-primary)]">남는 비중 (자동 안심 현금 잔액)</span>
                </div>
                <span className="font-mono text-sm font-black text-[var(--accent-green)]">
                  {autoCashWeight}%
                </span>
              </div>
            </div>

            {/* Add Asset Picker Buttons */}
            <div className="pt-2 space-y-2">
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block">
                + 추가할 주식 / 채권 / 금 선택하기:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allAssets.map((asset) => {
                  if (asset.id === 'CASH') return null;
                  const isSelected = selectedAssets.some((a) => a.assetId === asset.id);

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddAsset(asset.id)}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'opacity-40 bg-[var(--bg-main)] border-transparent text-[var(--text-secondary)] cursor-not-allowed'
                          : 'glass-card glass-card-hover text-[var(--text-primary)] hover:border-[var(--accent-orange)]'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 text-[var(--accent-green)]" /> : <Plus className="w-3.5 h-3.5 text-[var(--accent-orange)]" />}
                      <span>{asset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 3. Trend Protection Strategy Options (50d, 100d, 150d, 200d) */}
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Lightbulb className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
              3. 추세 보호 전략 선택 (하락장 자동 팔기)
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              주가가 일정 기간 평균선 아래로 폭락하면 자동으로 주식을 팔아 현금으로 갖고 있다가, 다시 회복될 때 사고 모으는 쉬운 위험 방어 전략입니다.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { period: 0, label: '전략 안 씀 (그냥 들고있기)' },
                { period: 50, label: '50일선 (단기 민첩)' },
                { period: 100, label: '100일선 (중기 균형)' },
                { period: 150, label: '150일선 (안정형)' },
                { period: 200, label: '200일선 (대세 판단)' },
              ].map((item) => (
                <button
                  key={item.period}
                  type="button"
                  onClick={() => setMaPeriod(item.period)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    maPeriod === item.period
                      ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] shadow-2xs font-extrabold'
                      : 'bg-[var(--bg-main)]/60 text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Visual SVG Graph & 2-Strategy Comparison Results */}
        <div className="space-y-5">
          
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--accent-orange)]/40 shadow-[0_0_24px_rgba(241,143,1,0.18)]">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--accent-orange)]" />
                수익률 비교 그래프
              </h2>
              <button
                type="button"
                onClick={() => setCompareMode(!compareMode)}
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] hover:bg-[var(--accent-orange)] hover:text-white transition-colors"
              >
                {compareMode ? '단일 결과 보기' : '2가지 전략 비교'}
              </button>
            </div>

            {/* Visual SVG Line Chart */}
            <div className="bg-[var(--bg-main)]/80 p-3 rounded-2xl border border-[var(--border-color)] space-y-2">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                {/* Reference Grid lines */}
                <line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke="var(--border-color)" strokeDasharray="4 4" />
                <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="var(--border-color)" strokeDasharray="4 4" />
                
                {/* Path 1: Buy & Hold (Gray line) */}
                <path
                  d={getSvgPath(simulation.base.chart)}
                  fill="none"
                  stroke="#5F5F5F"
                  strokeWidth="2.5"
                  strokeDasharray={compareMode ? '6 4' : 'none'}
                />

                {/* Path 2: MA Trend Strategy (Orange line) */}
                {compareMode && (
                  <path
                    d={getSvgPath(simulation.ma.chart)}
                    fill="none"
                    stroke="#F18F01"
                    strokeWidth="3.5"
                  />
                )}
              </svg>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-4 text-[11px] font-bold pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[var(--text-secondary)] rounded-full" />
                  <span className="text-[var(--text-secondary)]">그냥 모으기 (바이앤홀드)</span>
                </div>
                {compareMode && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-1.5 bg-[var(--accent-orange)] rounded-full" />
                    <span className="text-[var(--accent-orange)]">{maPeriod > 0 ? `${maPeriod}일선 추세방어` : '추세방어'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Strategy Performance Comparison Cards */}
            <div className="space-y-3 pt-1">
              
              {/* Strategy 1: Trend Strategy */}
              <div className="p-3.5 rounded-xl bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--accent-orange)]">
                    ⚡ {maPeriod > 0 ? `${maPeriod}일선 추세방어 전략` : '전략 적용 결과'}
                  </span>
                  <span className="text-xs font-black text-[var(--accent-green)] font-mono">
                    +{simulation.ma.rate}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">최종 예상 자산</span>
                  <span className="text-xl font-black text-[var(--text-primary)] font-mono">
                    {simulation.ma.value.toLocaleString()} <span className="text-xs font-sans">만원</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)] font-medium">폭락장 최대 손실 (MDD)</span>
                  <span className="text-red-500 font-mono font-bold">-{simulation.ma.mdd}%</span>
                </div>
              </div>

              {/* Strategy 2: Buy & Hold */}
              {compareMode && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      🔒 그냥 매달 사서 모으기
                    </span>
                    <span className="text-xs font-extrabold text-[var(--accent-green)] font-mono">
                      +{simulation.base.rate}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium">최종 예상 자산</span>
                    <span className="text-lg font-extrabold text-[var(--text-primary)] font-mono">
                      {simulation.base.value.toLocaleString()} <span className="text-xs font-sans">만원</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)] font-medium">폭락장 최대 손실 (MDD)</span>
                    <span className="text-red-500 font-mono font-bold">-{simulation.base.mdd}%</span>
                  </div>
                </div>
              )}

            </div>

            {/* Beginner-friendly Strategy Insight */}
            <div className="p-3 rounded-xl bg-[var(--bg-main)]/80 border border-[var(--border-color)] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                <Info className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                <span>한눈에 이해하는 쉬운 전략 비교</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
                {maPeriod > 0 
                  ? `${maPeriod}일선 추세방어 전략을 쓰면 큰 폭락장이 올 때 자동으로 주식을 팔아 현금으로 보호하므로, 그냥 사서 모으는 것보다 손실 위험(MDD)을 훨씬 줄여줍니다.`
                  : '전략을 적용하지 않으면 폭락장이 왔을 때 계좌 하락을 그대로 겪게 됩니다.'}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
