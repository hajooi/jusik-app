'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronLeft, 
  ChevronDown, 
  Search, 
  ChevronRight, 
  X, 
  Settings, 
  Menu, 
  RotateCw, 
  TrendingUp, 
  Globe, 
  DollarSign, 
  Zap, 
  Calendar, 
  Layers, 
  Sparkles, 
  PieChart, 
  ShieldCheck, 
  Building, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface StockDcaMotionSimulatorProps {
  step: 1 | 2 | 3 | 4;
  scene?: 1 | 2 | 3;
}

export default function StockDcaMotionSimulator({
  step,
  scene = 1
}: StockDcaMotionSimulatorProps) {
  // Step-specific micro auto-loop animation counters
  const [s1Step, setS1Step] = useState(0);
  const [s2Step, setS2Step] = useState(0);
  const [s3Step, setS3Step] = useState(0);
  const [s4Step, setS4Step] = useState(0);

  // -------------------------------------------------------------
  // STEP 1: 메뉴 진입 및 투자 방식 설정
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 1) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS1 = () => {
      if (!isMounted) return;
      setS1Step(0);

      if (scene === 1) {
        // Scene 1: 메뉴 ➔ 해외주식 ➔ [주식 모으기] 펄스 터치
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS1Step(1); // Home: pulse on [메뉴]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS1Step(2); // All Menu: pulse on [해외주식]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS1Step(3); // pulse on [주식 모으기]
              timerId = setTimeout(() => {
                if (!isMounted) return;
                runS1();
              }, 2800);
            }, 900);
          }, 1100);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 주식 모으기 화면 -> 투자 주기 '매월' & 날짜 선택
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS1Step(1); // pulse on '매월'
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS1Step(2); // select monthly date (자유 날짜)
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS1();
            }, 2800);
          }, 1000);
        }, 800);
      } else {
        // Scene 3: [배당금 입금 시 자동매수] 체크 활성화
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS1Step(1); // pulse on checkbox
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS1Step(2); // checkmark appears + badge tooltip
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS1();
            }, 2800);
          }, 900);
        }, 800);
      }
    };

    runS1();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 2: 투자금액 입력 & 종목 검색 (SPYM)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 2) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS2 = () => {
      if (!isMounted) return;
      setS2Step(0);

      if (scene === 1) {
        // Scene 1: 1회 투자금액 칸 터치 -> 100,000원 입력
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1); // focus on amount input
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS2Step(2); // type 100,000
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS2();
            }, 2800);
          }, 900);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: [+ 투자종목추가] 터치 ➔ 검색창 열림
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1); // pulse on [+ 투자종목추가]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS2Step(2); // search screen opens
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS2();
            }, 2800);
          }, 900);
        }, 800);
      } else {
        // Scene 3: 'SPYM' 검색 ➔ SPYM 선택 ➔ 목록에 추가 완료
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1); // type 'SPYM'
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS2Step(2); // pulse on SPYM result
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS2Step(3); // added to stock list
              timerId = setTimeout(() => {
                if (!isMounted) return;
                runS2();
              }, 2800);
            }, 900);
          }, 1000);
        }, 800);
      }
    };

    runS2();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 3: 비율 구성 & 주식 모으기 신청
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 3) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS3 = () => {
      if (!isMounted) return;
      setS3Step(0);

      if (scene === 1) {
        // Scene 1: SPYM 100% 비율 확인
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS3Step(1); // highlight SPYM 100%
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS3();
          }, 2800);
        }, 800);
      } else {
        // Scene 2: [확인] 터치 ➔ [주식 모으기 신청] 완료 모달
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS3Step(1); // pulse on [확인]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS3Step(2); // pulse on [주식 모으기 신청]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS3Step(3); // success check modal
              timerId = setTimeout(() => {
                if (!isMounted) return;
                runS3();
              }, 3000);
            }, 900);
          }, 900);
        }, 800);
      }
    };

    runS3();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 4: 추천 포트폴리오 살펴보기
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 4) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS4 = () => {
      if (!isMounted) return;
      setS4Step(0);

      if (scene === 1) {
        // Scene 1: [추천 포트폴리오] 탭 터치
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1); // pulse on [추천 포트폴리오]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS4Step(2); // portfolio list view opens
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS4();
            }, 2800);
          }, 900);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 추천 포트폴리오 6종 카드 둘러보기 스크롤
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1); // scroll down slightly
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS4Step(2); // highlight portfolio card
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS4();
            }, 2800);
          }, 1000);
        }, 800);
      } else {
        // Scene 3: S&P 500 단독 모으기 vs 추천 포트폴리오 원클릭 추가
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1); // pulse on [포트폴리오 담기]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS4Step(2); // auto filled with ratios
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS4();
            }, 2800);
          }, 900);
        }, 800);
      }
    };

    runS4();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-surface)]/90 text-[var(--text-primary)] p-4 sm:p-6 shadow-sm backdrop-blur-xl transition-all">
      {/* Titanium iPhone 16 Pro Smartphone Device Frame */}
      <div className="relative mx-auto max-w-[310px] w-full rounded-[2.8rem] p-2.5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-zinc-600/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="rounded-[2.4rem] bg-black p-1">
          {/* Dynamic Island */}
          <div className="relative pt-2 pb-1.5 bg-white rounded-t-[2.2rem]">
            <div className="w-24 h-5 bg-black rounded-full mx-auto flex items-center justify-between px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
              <div className="w-2 h-2 rounded-full bg-blue-950/60" />
            </div>
          </div>

          {/* Smartphone Screen Inner (450px container) */}
          <div className="bg-white text-zinc-900 rounded-b-[2.2rem] overflow-hidden h-[450px] flex flex-col justify-between px-3 pb-2 pt-1 font-sans text-xs relative select-none shadow-inner">

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: 메뉴 진입 및 투자 주기 / 배당 재투자 설정 */}
            {/* ------------------------------------------------------------- */}
            {step === 1 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 1-1: 전체 메뉴 ➔ 해외주식 ➔ 주식 모으기 */
                  <div className="flex flex-col h-full bg-white">
                    {/* Top App Header */}
                    <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-white">
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                          <Menu className="w-4 h-4 text-zinc-800" />
                          {s1Step === 1 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-300/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-black text-zinc-900">전체메뉴</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                        <span>주식부엉</span>
                        <Settings className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>

                    {/* Dual Column Menu View */}
                    <div className="flex-1 flex overflow-hidden">
                      {/* Left Category Column */}
                      <div className="w-1/3 bg-zinc-100/80 border-r border-zinc-200/80 text-[10px] font-bold text-zinc-600 flex flex-col py-1">
                        <div className="py-2.5 px-2.5">국내주식</div>
                        <div className={`relative py-2.5 px-2.5 transition-all ${
                          s1Step >= 2 ? 'bg-white text-emerald-600 font-black border-l-2 border-emerald-500' : 'text-zinc-600'
                        }`}>
                          <span>해외주식</span>
                          {s1Step === 2 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="py-2.5 px-2.5">채권/금융</div>
                        <div className="py-2.5 px-2.5">자산관리</div>
                      </div>

                      {/* Right Sub-menu Column */}
                      <div className="flex-1 bg-white p-2.5 space-y-2 text-[10.5px]">
                        <div className="text-[9px] font-bold text-zinc-400 px-1">해외주식 거래/서비스</div>
                        <div className="p-2 rounded-xl text-zinc-600 font-medium">해외주식주문</div>
                        <div className="p-2 rounded-xl text-zinc-600 font-medium">소수점주문</div>
                        <div className={`relative p-2.5 rounded-xl flex items-center justify-between font-extrabold transition-all ${
                          s1Step >= 3
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-400 shadow-xs scale-[1.02]'
                            : 'bg-zinc-50 text-zinc-900'
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            <span>주식 모으기</span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-zinc-400" />
                          {s1Step === 3 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-2 rounded-xl text-zinc-600 font-medium">해외주식 시세신청</div>
                      </div>
                    </div>

                    {/* Footer Tip */}
                    <div className="p-2.5 bg-emerald-50 border-t border-emerald-100 text-center">
                      <p className="text-[9px] font-black text-emerald-800">
                        {s1Step >= 3 ? '👉 [주식 모으기]를 터치하여 진입합니다' : '[해외주식] ➔ [주식 모으기] 메뉴 선택'}
                      </p>
                    </div>
                  </div>
                ) : scene === 2 ? (
                  /* 1-2: 주식 모으기 화면 - 주기 설정 */
                  <div className="flex flex-col h-full bg-white">
                    {/* Sub Header */}
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>주식 모으기 신청</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">100-12-3456-78</span>
                    </div>

                    <div className="flex-1 p-3 space-y-3.5 overflow-y-auto">
                      {/* Section: 투자 방식 */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-extrabold text-zinc-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-500" />
                          <span>투자 주기 설정</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['매일', '매주', '매월'].map((cycle) => (
                            <div
                              key={cycle}
                              className={`py-2 text-center rounded-xl text-[10px] font-extrabold border transition-all ${
                                cycle === '매월'
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                                  : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                              }`}
                            >
                              {cycle}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section: 날짜 선택 */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-extrabold text-zinc-800">
                          투자일자 (원하는 날짜 선택)
                        </div>
                        <div className={`relative p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          s1Step >= 2
                            ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-200/50'
                            : 'bg-zinc-50 border-zinc-200'
                        }`}>
                          <span className="text-[10.5px] font-black text-zinc-900">
                            매월 <span className="text-emerald-600 font-extrabold">25일</span> (자유 지정 가능)
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                          {s1Step === 1 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-[8px] text-zinc-400 leading-tight">
                          * 직장인이라면 월급날 등 편한 날짜를 자유롭게 선택하세요.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 text-center">
                      <div className="text-[9px] font-bold text-zinc-700">
                        직장인이라면 월급날에 맞춰 '매월' 설정을 추천합니다
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 1-3: 배당금 입금 시 자동매수 옵션 */
                  <div className="flex flex-col h-full bg-white">
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>부가 투자 옵션</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">100-12-3456-78</span>
                    </div>

                    <div className="flex-1 p-3 space-y-3">
                      <div className={`relative p-3 rounded-2xl border transition-all ${
                        s1Step >= 1
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                          : 'bg-zinc-50 border-zinc-200'
                      }`}>
                        <div className="flex items-start gap-2.5">
                          <div className={`relative w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            s1Step >= 1 ? 'bg-emerald-500 text-white' : 'border border-zinc-300 bg-white'
                          }`}>
                            {s1Step >= 1 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            {s1Step === 1 && (
                              <div className="absolute -inset-1 pointer-events-none flex items-center justify-center">
                                <span className="relative flex h-6 w-6">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="text-[11px] font-black text-zinc-900 flex items-center gap-1.5">
                              <span>배당금 입금 시 자동매수</span>
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[8px] font-extrabold">
                                추천
                              </span>
                            </div>
                            <p className="text-[9px] text-zinc-500 leading-relaxed">
                              주식에서 나오는 보너스(배당금)가 들어오면 알아서 다시 주식을 사서 복리 효과를 만듭니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-[9.5px] font-black text-amber-800">
                          <Sparkles className="w-3 h-3" />
                          <span>왜 체크해야 하나요?</span>
                        </div>
                        <p className="text-[8.5px] text-amber-700 leading-relaxed font-medium">
                          쉬지 않고 굴러가는 복리의 마법! 들어온 배당금을 방치하지 않고 자동으로 재투자해 자산 성장을 가속화합니다.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 border-t border-emerald-100 text-center">
                      <div className="text-[9px] font-black text-emerald-800">
                        ✓ '배당금 입금 시 자동매수' 체크를 권장합니다
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: 1회 투자금액 입력 & 종목 검색 (SPYM) */}
            {/* ------------------------------------------------------------- */}
            {step === 2 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 2-1: 1회 투자금액 입력 */
                  <div className="flex flex-col h-full bg-white">
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>1회 투자금액 입력</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">100-12-3456-78</span>
                    </div>

                    <div className="flex-1 p-3 space-y-3.5">
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-extrabold text-zinc-800">
                          매월 투자할 금액 (1회 기준)
                        </div>
                        <div className={`relative p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          s2Step >= 1
                            ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-200/50'
                            : 'bg-zinc-50 border-zinc-200'
                        }`}>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[16px] font-black text-zinc-900 font-mono">
                              {s2Step >= 2 ? '100,000' : s2Step === 1 ? '10' : '0'}
                            </span>
                            <span className="text-[11px] font-bold text-zinc-600">원</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 font-bold">1회 기준</span>
                          {s2Step === 1 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-[8.5px] text-zinc-500 leading-tight">
                          * 금액은 정해진 것이 아니며, 본인의 여건에 맞게 자유롭게 설정하시면 됩니다.
                        </p>
                      </div>

                      {/* Quick Amount Buttons */}
                      <div className="grid grid-cols-4 gap-1">
                        {['+5만', '+10만', '+50만', '+100만'].map((btn) => (
                          <div key={btn} className="py-1.5 text-center rounded-lg bg-zinc-100 text-[9px] font-bold text-zinc-600">
                            {btn}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 text-center">
                      <div className="text-[9px] font-bold text-zinc-700">
                        내가 감당할 수 있는 편안한 금액을 입력하세요
                      </div>
                    </div>
                  </div>
                ) : scene === 2 ? (
                  /* 2-2: 투자종목추가 버튼 터치 */
                  <div className="flex flex-col h-full bg-white">
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>투자 종목 구성</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">100-12-3456-78</span>
                    </div>

                    <div className="flex-1 p-3 space-y-3">
                      <div className="text-[10px] font-extrabold text-zinc-800">
                        모아갈 종목을 추가해주세요
                      </div>

                      <div className={`relative p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        s2Step >= 1
                          ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]'
                          : 'border-zinc-300 bg-zinc-50'
                      }`}>
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          +
                        </div>
                        <div className="text-[10.5px] font-black text-emerald-800">
                          투자종목추가
                        </div>
                        <div className="text-[8px] text-zinc-400">
                          원하는 미국 주식/ETF를 검색하여 담기
                        </div>
                        {s2Step === 1 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-8 w-8">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                              <span className="relative inline-flex rounded-full h-8 w-8 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 border-t border-emerald-100 text-center">
                      <div className="text-[9px] font-black text-emerald-800">
                        👉 [+ 투자종목추가]를 눌러 검색창으로 이동합니다
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2-3: SPYM 검색 및 추가 */
                  <div className="flex flex-col h-full bg-white">
                    {/* Search Bar */}
                    <div className="p-2.5 border-b border-zinc-100">
                      <div className="p-2 rounded-xl bg-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-mono font-black text-zinc-900">
                            {s2Step >= 1 ? 'SPYM' : '종목명 또는 심볼 검색'}
                          </span>
                        </div>
                        {s2Step >= 1 && <X className="w-3 h-3 text-zinc-400" />}
                      </div>
                    </div>

                    <div className="flex-1 p-2.5 space-y-2">
                      <div className="text-[9px] font-bold text-zinc-400 px-1">검색 결과 (1)</div>
                      <div className={`relative p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        s2Step >= 2
                          ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                          : 'bg-white border-zinc-200'
                      }`}>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black text-zinc-900">SPYM</span>
                            <span className="text-[8px] px-1 rounded bg-zinc-100 text-zinc-600 font-bold">미국 ETF</span>
                          </div>
                          <div className="text-[8.5px] text-zinc-500 font-medium truncate max-w-[180px]">
                            SPDR Portfolio S&P 500 ETF
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </div>
                        {s2Step === 2 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-6 w-6">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                              <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 border-t border-emerald-100 text-center">
                      <div className="text-[9px] font-black text-emerald-800">
                        {s2Step >= 2 ? '✓ S&P 500 ETF(SPYM) 선택 완료!' : '검색 결과에서 SPYM을 선택하세요'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: 비율 구성 & 주식 모으기 최종 신청 */}
            {/* ------------------------------------------------------------- */}
            {step === 3 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 3-1: 비율 구성 확인 (SPYM 100%) */
                  <div className="flex flex-col h-full bg-white">
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>투자 비율 구성</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">100-12-3456-78</span>
                    </div>

                    <div className="flex-1 p-3 space-y-3">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-zinc-800">선택 종목 (1개)</span>
                        <span className="font-mono font-bold text-emerald-600">합계: 100%</span>
                      </div>

                      {/* SPYM Stock Card */}
                      <div className="p-3 rounded-2xl bg-zinc-50 border border-emerald-400/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[11px] font-black text-zinc-900">SPYM</div>
                            <div className="text-[8px] text-zinc-400">S&P 500 ETF</div>
                          </div>
                          <div className="text-right">
                            <span className="text-[13px] font-black text-emerald-600 font-mono">100</span>
                            <span className="text-[10px] font-bold text-zinc-600">%</span>
                          </div>
                        </div>

                        {/* Ratio Bar */}
                        <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-full rounded-full" />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 text-[8.5px] text-blue-800 leading-relaxed font-medium">
                        💡 여러 종목을 추가한 경우 원하는 비율(예: 50% / 50%)로 조정하여 분산 모으기를 할 수 있습니다.
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-50 border-t border-zinc-100">
                      <div className="relative py-2 rounded-xl bg-zinc-900 text-white text-center text-[10px] font-black">
                        확인
                        {s3Step === 1 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-6 w-6">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                              <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3-2: 주식 모으기 신청 및 완료 모달 */
                  <div className="flex flex-col h-full bg-white relative">
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>신청 내역 확인</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">100-12-3456-78</span>
                    </div>

                    <div className="flex-1 p-3 space-y-2.5">
                      <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-[9.5px]">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">투자자</span>
                          <span className="font-bold text-zinc-900">주식부엉</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">투자 주기</span>
                          <span className="font-bold text-zinc-900">매월 지정일</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">1회 금액</span>
                          <span className="font-bold text-zinc-900">100,000원</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">모으는 종목</span>
                          <span className="font-bold text-emerald-600">SPYM (100%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">배당금 재투자</span>
                          <span className="font-bold text-zinc-900">자동매수 신청</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="p-2.5 bg-white border-t border-zinc-100">
                      <div className={`relative py-2.5 rounded-xl text-center text-[10.5px] font-black text-white transition-all ${
                        s3Step >= 2 ? 'bg-emerald-600 shadow-md scale-[1.02]' : 'bg-emerald-500'
                      }`}>
                        주식 모으기 신청
                        {s3Step === 2 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-6 w-6">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                              <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Success Modal Overlay */}
                    {s3Step >= 3 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn z-20">
                        <div className="bg-white rounded-2xl p-4 w-full text-center space-y-2.5 shadow-2xl border border-zinc-100">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-[12px] font-black text-zinc-900">주식 모으기 신청 완료!</div>
                            <div className="text-[8.5px] text-zinc-500">
                              지정하신 일자에 맞춰 기계적으로 안전하게 구매됩니다.
                            </div>
                          </div>
                          <div className="pt-1">
                            <div className="py-1.5 rounded-xl bg-zinc-900 text-white text-[9.5px] font-black">
                              확인
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: 추천 포트폴리오 살펴보기 */}
            {/* ------------------------------------------------------------- */}
            {step === 4 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 4-1: 추천 포트폴리오 탭 터치 */
                  <div className="flex flex-col h-full bg-white">
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>추천 포트폴리오</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">100-12-3456-78</span>
                    </div>

                    <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-800">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>검증된 투자 조합</span>
                        </div>
                        <p className="text-[8px] text-emerald-700 leading-relaxed font-medium">
                          전문가가 설계한 6가지 테마별 맞춤 조합을 클릭 한 번으로 똑같이 구성할 수 있습니다.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className={`relative p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          s4Step >= 1 ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 border-zinc-200'
                        }`}>
                          <div className="font-extrabold text-[10px]">🇺🇸 미국배당주 투자하기</div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                          {s4Step === 1 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[10px] font-bold text-zinc-700">
                          <span>👑 세계 1등 기업에 투자</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[10px] font-bold text-zinc-700">
                          <span>🏢 월세 대신 월배당 받기</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50 border-t border-emerald-100 text-center">
                      <div className="text-[9px] font-black text-emerald-800">
                        앱 내 [추천 포트폴리오] 탭을 눌러 확인합니다
                      </div>
                    </div>
                  </div>
                ) : scene === 2 ? (
                  /* 4-2: 6종 포트폴리오 카드 상세 둘러보기 */
                  <div className="flex flex-col h-full bg-white">
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>포트폴리오 상세</span>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        올웨더형
                      </span>
                    </div>

                    <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                      <div className="relative p-3 rounded-2xl bg-zinc-900 text-white space-y-2">
                        <div className="text-[11px] font-black">
                          '레이달리오' 따라잡기 (올웨더)
                        </div>
                        <div className="text-[8px] text-zinc-300 leading-relaxed">
                          금, 채권, 주식, 원자재를 섞어 경제 위기에도 내 돈을 굳건히 방어하는 조합
                        </div>
                        <div className="pt-1 flex items-center gap-2 text-[8px] font-mono text-emerald-400">
                          <span>GLD 16.6%</span>
                          <span>IEF 16.6%</span>
                          <span>QQQ 16.6%</span>
                          <span>SPY 16.6%</span>
                        </div>
                        {s4Step === 2 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-6 w-6">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                              <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[8.5px] text-amber-800 leading-relaxed font-medium">
                        💡 타 증권사를 쓰더라도 이 조합 비율을 메모해 직접 종목을 담으면 똑같이 활용할 수 있습니다.
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 text-center">
                      <div className="text-[9px] font-bold text-zinc-700">
                        아래 추천 포트폴리오 상세 박스에서 6종을 모두 확인해보세요
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 4-3: 결론 - S&P 500 하나만 모아도 완벽 */
                  <div className="flex flex-col h-full bg-white">
                    <div className="p-2.5 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-zinc-900">
                        <ChevronLeft className="w-4 h-4 text-zinc-700" />
                        <span>초보자를 위한 정답</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono">100-12-3456-78</span>
                    </div>

                    <div className="flex-1 p-3 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[13px] font-black text-zinc-900">
                          S&P 500 하나면 충분합니다
                        </div>
                        <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[220px]">
                          복잡하게 고민할 필요 없이, 미국 1등부터 500등 기업을 담는 S&P 500(SPYM) 하나만 꾸준히 사 모으는 것이 가장 완벽한 정답입니다.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50 border-t border-amber-100 text-center">
                      <div className="text-[9px] font-black text-amber-900">
                        🏆 S&P 500 모으기로 흔들림 없는 투자를 시작하세요
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
