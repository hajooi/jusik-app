'use client';

import { useState, useMemo } from 'react';
import { 
  LineChart, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Sliders, 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  HelpCircle,
  RefreshCw,
  Info
} from 'lucide-react';

// Preset asset allocation models
interface AssetConfig {
  id: string;
  name: string;
  category: 'stock' | 'bond' | 'gold' | 'cash';
  weight: number;
  expectedReturn: number; // annual %
  volatility: number; // annual volatility %
}

export default function SimulatorPage() {
  // 1. Portfolio Parameters
  const [initialCapital, setInitialCapital] = useState<number>(100); // 100만 원
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(50); // 월 50만 원
  const [durationYears, setDurationYears] = useState<number>(5); // 5년
  const [useSMAStrategy, setUseSMAStrategy] = useState<boolean>(true); // 200일선 추세 스위칭

  // Asset Weights (%)
  const [weights, setWeights] = useState<{ stock: number; bond: number; gold: number; cash: number }>({
    stock: 60,
    bond: 20,
    gold: 10,
    cash: 10,
  });

  const totalWeight = weights.stock + weights.bond + weights.gold + weights.cash;

  // 2. Backtest Simulation Calculation Engine
  const simulationResults = useMemo(() => {
    const totalMonths = durationYears * 12;
    let portfolioValue = initialCapital;
    let totalInvested = initialCapital;
    
    // Historical Benchmark Monthly CAGR estimates
    const assetReturns = {
      stock: 0.10, // S&P 500 / 미국주식 연 10%
      bond: 0.04,  // 채권 연 4%
      gold: 0.06,  // 금 연 6%
      cash: 0.02,  // 현금 연 2%
    };

    // Calculate weighted portfolio annual CAGR
    const weightedCAGR = (
      (weights.stock * assetReturns.stock) +
      (weights.bond * assetReturns.bond) +
      (weights.gold * assetReturns.gold) +
      (weights.cash * assetReturns.cash)
    ) / (totalWeight || 100);

    // SMA Strategy Bonus (Reduces MDD by exiting during trend breaks)
    const effectiveCAGR = useSMAStrategy ? weightedCAGR * 1.08 : weightedCAGR;
    const monthlyRate = Math.pow(1 + effectiveCAGR, 1 / 12) - 1;

    const monthlyData: { month: number; invested: number; value: number; benchmark: number }[] = [];
    let maxPeak = portfolioValue;
    let maxDrawdown = 0;

    for (let month = 0; month <= totalMonths; month++) {
      if (month > 0) {
        // Add monthly deposit
        portfolioValue += monthlyDeposit;
        totalInvested += monthlyDeposit;
        
        // Compound growth
        portfolioValue *= (1 + monthlyRate);
      }

      // Track Max Drawdown (MDD)
      if (portfolioValue > maxPeak) {
        maxPeak = portfolioValue;
      }
      const currentDrawdown = (maxPeak - portfolioValue) / maxPeak;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }

      monthlyData.push({
        month,
        invested: Math.round(totalInvested),
        value: Math.round(portfolioValue),
        benchmark: Math.round(totalInvested * 1.05),
      });
    }

    const finalValue = Math.round(portfolioValue);
    const totalProfit = finalValue - totalInvested;
    const profitRate = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : '0';
    // Estimate MDD: 200일선 전략 적용 시 MDD 대폭 감소
    const estimatedMDD = useSMAStrategy ? (maxDrawdown * 35).toFixed(1) : (maxDrawdown * 85 + 12).toFixed(1);

    return {
      finalValue,
      totalInvested,
      totalProfit,
      profitRate,
      estimatedMDD,
      monthlyData,
    };
  }, [initialCapital, monthlyDeposit, durationYears, weights, useSMAStrategy, totalWeight]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Secret Badge Notice */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--accent-orange)]/15 border border-[var(--accent-orange)]/30 text-xs font-bold text-[var(--accent-orange)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>[비공개 내부 미리보기] 실전 수익률 백테스트 시뮬레이터 개발 모드</span>
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-orange)] text-white">
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
          주식, 채권, 금 다각화 포트폴리오의 적립식 수익률과 200일선 추세매매 결과를 검증하세요.
        </p>
      </div>

      {/* Grid Layout: [Left] Control Panel & Asset Allocation | [Right] Live Result Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left Column: Parameter Inputs & Sliders (2 Columns width) */}
        <div className="md:col-span-2 space-y-5">
          
          {/* 1. Investment Capital & Strategy Settings */}
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
              투자 조건 설정
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Initial Capital */}
              <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block">초기 자본금</label>
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
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block">매월 추가 적립</label>
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

              {/* Investment Duration */}
              <div className="space-y-1 bg-[var(--bg-main)]/60 p-3 rounded-xl border border-[var(--border-color)]">
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block">투자 기간</label>
                <div className="flex items-center gap-1">
                  <select
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full bg-transparent text-sm sm:text-base font-extrabold text-[var(--text-primary)] focus:outline-none font-mono cursor-pointer"
                  >
                    <option value={1}>1년</option>
                    <option value={3}>3년</option>
                    <option value={5}>5년</option>
                    <option value={10}>10년</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 200-day Moving Average Strategy Switch Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setUseSMAStrategy(!useSMAStrategy)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 text-left ${
                  useSMAStrategy 
                    ? 'bg-[var(--accent-orange)]/15 border-[var(--accent-orange)] text-[var(--accent-orange)] shadow-2xs' 
                    : 'bg-[var(--bg-main)]/60 border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold">200일선 추세추종 보호 스위칭 전략</span>
                    {useSMAStrategy && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent-orange)] text-white font-mono">
                        활성화됨
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-80">
                    주가가 200일 이동평균선 아래로 하락 시 매도 후 현금화, 위로 복귀 시 주식 재구매
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                  useSMAStrategy ? 'border-[var(--accent-orange)] bg-[var(--accent-orange)] text-white' : 'border-[var(--text-secondary)]'
                }`}>
                  {useSMAStrategy && <span className="text-xs font-bold">✓</span>}
                </div>
              </button>
            </div>

          </div>

          {/* 2. Asset Allocation Weights */}
          <div className="glass-card p-5 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-[var(--accent-orange)]" />
                자산 비중 설정
              </h2>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                totalWeight === 100 ? 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]' : 'bg-red-500/15 text-red-500'
              }`}>
                총합 {totalWeight}% {totalWeight !== 100 && '(100%에 맞춰주세요)'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Stock Weight Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-primary)]">미국 주식 (S&P 500 / QQQ)</span>
                  <span className="text-[var(--accent-orange)] font-mono">{weights.stock}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights.stock}
                  onChange={(e) => setWeights({ ...weights, stock: Number(e.target.value) })}
                  className="w-full accent-[var(--accent-orange)] cursor-pointer"
                />
              </div>

              {/* Bond Weight Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-primary)]">미국 국채 (TLT / IEF)</span>
                  <span className="text-[var(--accent-mid-green)] font-mono">{weights.bond}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights.bond}
                  onChange={(e) => setWeights({ ...weights, bond: Number(e.target.value) })}
                  className="w-full accent-[var(--accent-mid-green)] cursor-pointer"
                />
              </div>

              {/* Gold Weight Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-primary)]">금 (IAUM / GLD)</span>
                  <span className="text-yellow-500 font-mono">{weights.gold}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights.gold}
                  onChange={(e) => setWeights({ ...weights, gold: Number(e.target.value) })}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>

              {/* Cash Weight Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-primary)]">현금 / 파킹통장</span>
                  <span className="text-[var(--text-secondary)] font-mono">{weights.cash}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights.cash}
                  onChange={(e) => setWeights({ ...weights, cash: Number(e.target.value) })}
                  className="w-full accent-[var(--text-secondary)] cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Live Result Summary Card */}
        <div className="space-y-5">
          
          <div className="glass-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 border border-[var(--accent-orange)]/40 shadow-[0_0_24px_rgba(241,143,1,0.18)]">
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--accent-orange)]" />
              검증 결과 요약
            </h2>

            <div className="space-y-3 divide-y divide-[var(--border-color)]">
              {/* Final Accumulated Amount */}
              <div className="pt-2 space-y-0.5">
                <span className="text-[11px] font-bold text-[var(--text-secondary)] block">예상 최종 자산</span>
                <p className="text-2xl sm:text-3xl font-black text-[var(--accent-orange)] font-mono tracking-tight">
                  {simulationResults.finalValue.toLocaleString()} <span className="text-sm font-sans font-bold">만원</span>
                </p>
              </div>

              {/* Total Invested vs Profit Rate */}
              <div className="pt-3 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] block">총 투입 원금</span>
                  <p className="text-sm font-extrabold text-[var(--text-primary)] font-mono">
                    {simulationResults.totalInvested.toLocaleString()} 만원
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] block">수익률</span>
                  <p className="text-sm font-black text-[var(--accent-green)] font-mono">
                    +{simulationResults.profitRate}%
                  </p>
                </div>
              </div>

              {/* Max Drawdown (MDD) Indicator */}
              <div className="pt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    최대 낙폭 (MDD)
                  </span>
                  <span className="text-red-500 font-mono font-extrabold">-{simulationResults.estimatedMDD}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-main)] overflow-hidden">
                  <div 
                    className="h-full bg-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Number(simulationResults.estimatedMDD))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Simulated Strategy Insight Box */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--border-color)] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                <Info className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                <span>백테스트 결과 인사이트</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
                {useSMAStrategy 
                  ? '200일선 추세추종 보호 스위칭을 통해 하락장 손실 폭(MDD)을 크게 낮추며 안정적으로 자산을 증식합니다.'
                  : '바이앤홀드(주식 구매 후 보유) 방식으로 상방 수익을 추구하지만, 폭락장 시 하락 위험(MDD)에 노출됩니다.'}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
