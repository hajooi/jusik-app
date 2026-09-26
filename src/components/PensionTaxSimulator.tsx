'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import SmoothHeight from '@/components/SmoothHeight';

export default function PensionTaxSimulator() {
  // 소득 구간: 'low' (5,500만 이하, 16.5%), 'high' (5,500만 초과, 13.2%)
  const [incomeType, setIncomeType] = useState<'low' | 'high'>('low');
  // 월 납입 희망액 (단위: 만 원, 기본값 30만 원)
  const [monthlyAmount, setMonthlyAmount] = useState<number>(30);

  const taxCreditRate = incomeType === 'low' ? 0.165 : 0.132;
  const annualAmount = monthlyAmount * 12; // 연간 납입액 (만 원)

  // 1. 세액공제 대상 금액 계산 (합산 최대 900만 원 한도)
  // 연금저축 최대 600만 + IRP 최대 300만 (합산 900만)
  let pensionSavings = 0; // 연금저축 납입 권장액
  let irpSavings = 0;     // IRP 납입 권장액
  let extraPension = 0;   // 900만 초과분 (연금저축 추가 납입)

  if (annualAmount <= 600) {
    pensionSavings = annualAmount;
    irpSavings = 0;
    extraPension = 0;
  } else if (annualAmount <= 900) {
    pensionSavings = 600;
    irpSavings = annualAmount - 600;
    extraPension = 0;
  } else {
    pensionSavings = 600;
    irpSavings = 300;
    extraPension = annualAmount - 900;
  }

  // 실제 세액공제 혜택을 받는 금액 (최대 900만 원)
  const eligibleDeduction = Math.min(annualAmount, 900);
  // 연말정산 돌려받는 돈 (만 원)
  const refundAmount = Math.round(eligibleDeduction * taxCreditRate * 10) / 10;

  // 2. 20년 복리 과세이연 효과 비교 (연평균 8% 수익률 가정)
  // 연금 계좌: 매년 8% 복리 전액 재투자 후 20년 뒤 5.5% 연금소득세 차감
  // 일반 계좌: 매년 발생 수익의 15.4%를 세금으로 매년 차감 (실질 복리 수익률 8% * (1 - 0.154) = 6.768%)
  const years = 20;
  const rGross = 0.08;
  const rNetGeneral = 0.08 * (1 - 0.154); // 약 6.768%

  // 미래 가치 계산 함수 (매월 납입 FV)
  const calculateFV = (monthly: number, annualRate: number, durationYears: number) => {
    const monthlyRate = annualRate / 12;
    const totalMonths = durationYears * 12;
    return monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  };

  const grossPensionFV = calculateFV(monthlyAmount, rGross, years);
  const totalPrincipal = monthlyAmount * 12 * years;
  const pensionProfit = Math.max(0, grossPensionFV - totalPrincipal);
  // 55세 이후 연금 수령 시 (수익금에 5.5% 저율 과세 적용 가정)
  const netPensionFV = Math.round(grossPensionFV - pensionProfit * 0.055);

  const generalFV = Math.round(calculateFV(monthlyAmount, rNetGeneral, years));
  const compoundGap = Math.max(0, netPensionFV - generalFV);

  return (
    <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] space-y-6 shadow-2xs my-6 select-none">
      {/* Header (구분선 없이 여백과 색조로 정돈) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-orange)]/15 flex items-center justify-center text-[var(--accent-orange)] shrink-0 shadow-2xs">
            <Calculator className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
              연금저축 & IRP 실전 절세 시뮬레이터
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              내 소득과 월 납입액에 따른 연말정산 환급금과 최적의 배분 비율
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls (상하 일체형 통합 패널) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] space-y-4">
        {/* Row 1: 소득 구간 선택 토글 (Apple Native Snappy 캡슐 슬라이더) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
              내 연간 소득 구간
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              소득에 따라 세액공제율(16.5% 또는 13.2%)이 결정됩니다
            </p>
          </div>
          <div className="relative flex items-center p-1 rounded-2xl sm:rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-semibold select-none self-start sm:self-center shrink-0">
            <div
              className="absolute top-1 bottom-1 rounded-xl sm:rounded-full bg-[var(--card-surface)] border border-[var(--border-color)] shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{
                left: incomeType === 'low' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)',
              }}
            />
            <button
              type="button"
              onClick={() => setIncomeType('low')}
              className={`relative z-10 py-1.5 px-3 sm:px-3.5 rounded-xl sm:rounded-full text-center transition-colors duration-200 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${
                incomeType === 'low'
                  ? 'text-[var(--accent-orange)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="whitespace-nowrap">5,500만 원 이하</span>
              <span className="text-[10px] font-mono text-[#10B981] font-bold whitespace-nowrap">16.5%</span>
            </button>
            <button
              type="button"
              onClick={() => setIncomeType('high')}
              className={`relative z-10 py-1.5 px-3 sm:px-3.5 rounded-xl sm:rounded-full text-center transition-colors duration-200 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 ${
                incomeType === 'high'
                  ? 'text-[var(--accent-orange)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="whitespace-nowrap">5,500만 원 초과</span>
              <span className="text-[10px] font-mono text-[var(--accent-orange)] font-bold whitespace-nowrap">13.2%</span>
            </button>
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="w-full h-px bg-[var(--border-color)]/60" />

        {/* Row 2: 월 저축 희망액 슬라이더 & 4분할 대칭 프리셋 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                월 저축 희망액
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                슬라이더를 조절하거나 아래 금액을 선택해 보세요
              </p>
            </div>
            <div className="text-right flex flex-col sm:flex-row sm:items-baseline sm:justify-end shrink-0">
              <span className="text-base sm:text-lg font-extrabold text-[var(--accent-orange)] font-mono whitespace-nowrap">
                {monthlyAmount}만 원
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium sm:ml-1.5 whitespace-nowrap">
                (연 {annualAmount}만 원)
              </span>
            </div>
          </div>

          {/* Slider track (테두리 없는 매끄러운 Apple식 트랙) */}
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(Number(e.target.value))}
            className="w-full h-2.5 bg-[var(--bg-main)] rounded-full appearance-none cursor-pointer accent-[var(--accent-orange)]"
          />

          {/* 4분할 대칭 프리셋 그리드 (데스크톱 1x4, 모바일 2x2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { amount: 30, label: '소액 적립' },
              { amount: 50, label: '연금저축 공제' },
              { amount: 75, label: '합산 최대공제' },
              { amount: 150, label: '연간 총한도' },
            ].map((preset) => {
              const isActive = monthlyAmount === preset.amount;
              return (
                <button
                  key={preset.amount}
                  type="button"
                  onClick={() => setMonthlyAmount(preset.amount)}
                  className={`py-2 px-3 rounded-full text-center flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'border border-[var(--accent-orange)] bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shadow-[0_0_12px_rgba(241,143,1,0.2)] font-extrabold'
                      : 'border border-[var(--border-color)] bg-[var(--card-surface)]/90 text-[var(--text-secondary)] shadow-2xs hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_14px_rgba(241,143,1,0.15)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="text-xs font-extrabold">월 {preset.amount}만 원</span>
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive ? 'text-[var(--accent-orange)]/80 font-bold' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Output Results 3-Tier Grid with SmoothHeight */}
      <SmoothHeight duration={350} easing="cubic-bezier(0.2, 0.8, 0.2, 1)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Card 1: 올해 연말정산 돌려받는 돈 */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#10B981]/10 via-[var(--card-surface)] to-[var(--bg-main)] border border-[#10B981]/30 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#10B981] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                연말정산 환급 예상액
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981]">
                {(taxCreditRate * 100).toFixed(1)}% 적용
              </span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight font-mono">
                +<AnimatedNumber value={refundAmount} decimals={1} duration={250} />
                <span className="text-sm sm:text-base font-extrabold text-[var(--text-secondary)] ml-1">만 원</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium leading-relaxed">
                {annualAmount > 900 ? (
                  <span>공제 한도 900만 원 적용 (초과 {annualAmount - 900}만 원은 언제든 세금 없이 자유롭게 인출 가능)</span>
                ) : (
                  <span>납입 원금 전액 {annualAmount}만 원에 대해 세액공제 적용</span>
                )}
              </p>
            </div>
          </div>

          {/* Card 2: 황금 배분 비율 */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--accent-orange)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
                배분 가이드
              </span>
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">연간 기준</span>
            </div>
            <div className="space-y-2">
              {/* Split Breakdown */}
              <div className="space-y-1.5 text-xs font-extrabold">
                <div className="flex justify-between items-center text-[var(--text-primary)]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-orange)] inline-block" />
                    연금저축
                  </span>
                  <span className="font-mono text-[var(--accent-orange)]">
                    {pensionSavings + extraPension}만 원
                    {extraPension > 0 && <span className="text-[10px] text-[var(--text-secondary)] font-normal"> (초과 {extraPension}만)</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[var(--text-primary)]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
                    IRP
                  </span>
                  <span className="font-mono text-[#10B981]">
                    {irpSavings}만 원
                  </span>
                </div>
              </div>

              {/* Visual Split Bar */}
              <div className="w-full h-3 bg-[var(--card-surface)] rounded-full overflow-hidden flex border border-[var(--border-color)]">
                <div 
                  style={{ width: `${((pensionSavings + extraPension) / annualAmount) * 100}%` }} 
                  className="bg-[var(--accent-orange)] h-full transition-all duration-300"
                  title="연금저축"
                />
                <div 
                  style={{ width: `${(irpSavings / annualAmount) * 100}%` }} 
                  className="bg-[#10B981] h-full transition-all duration-300"
                  title="IRP"
                />
              </div>
            </div>
          </div>

          {/* Card 3: 20년 과세이연 복리 격차 */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-orange)] stroke-[2.2]" />
                20년 뒤 과세이연 격차
              </span>
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">연 8% 가정</span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[var(--accent-orange)] tracking-tight font-mono">
                +<AnimatedNumber value={Math.round(compoundGap)} duration={300} />
                <span className="text-xs sm:text-sm font-extrabold text-[var(--text-secondary)] ml-1">만 원 이득</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium leading-relaxed">
                매년 15.4% 세금을 뗀 일반 계좌 대비, 세금을 유예하고 끝까지 굴렸을 때 얻는 복리 혜택입니다.
              </p>
            </div>
          </div>
        </div>
      </SmoothHeight>

      {/* Critical Note Banner (퇴직금 주의 & 1,500만 수령 팁) */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-main)]/90 border border-[var(--border-color)] flex items-start gap-3 text-xs sm:text-sm leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[var(--text-primary)] font-extrabold">꼭 기억해야 할 두 가지 핵심 수칙:</strong>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1 font-medium list-disc list-inside">
            <li><strong className="text-[var(--text-primary)]">퇴직금 분리:</strong> 퇴직금은 개인 납입 IRP에 절대 섞지 말고 '별도 퇴직금 전용 IRP'로 수령하세요.</li>
            <li><strong className="text-[var(--text-primary)]">55세 이후 연금 수령:</strong> 사적연금 수령액을 연 1,500만 원 이하로 유지해야 3.3%~5.5% 최저 세율이 유지됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
