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
  Mic,
  Bell,
  Heart,
  BarChart2,
  MoreHorizontal
} from 'lucide-react';

interface StockTradeMotionSimulatorProps {
  step: 1 | 2 | 3 | 4 | 5;
  scene?: 1 | 2 | 3 | 4;
}

export default function StockTradeMotionSimulator({
  step,
  scene = 1
}: StockTradeMotionSimulatorProps) {
  // Step-specific micro auto-loop animation counters
  const [s1Step, setS1Step] = useState(0);
  const [s2Step, setS2Step] = useState(0);
  const [s3Step, setS3Step] = useState(0);
  const [s4Step, setS4Step] = useState(0);
  const [s5Step, setS5Step] = useState(0);

  // -------------------------------------------------------------
  // STEP 1: 화면 퀵메뉴 설정 (0:15~1:00)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 1) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS1 = () => {
      if (!isMounted) return;
      setS1Step(0);

      if (scene === 1) {
        // Scene 1: Swipe bottom bar tightly -> pulse on Settings gear
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS1Step(1); // swipe left
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS1Step(2); // pulse on [설정]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS1();
            }, 2800);
          }, 800);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: Remove unneeded quick items -> pulse on Save
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS1Step(1); // uncheck items
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS1Step(2); // pulse on [저장]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS1();
            }, 2800);
          }, 800);
        }, 800);
      } else {
        // Scene 3: Settings Menu -> Turn OFF Overseas quick menu toggle (Home -> All Menu -> Settings -> Toggle OFF)
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS1Step(1); // Home: pulse on [메뉴]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS1Step(2); // All Menu: pulse on [설정]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS1Step(3); // Settings: pulse on toggle
              timerId = setTimeout(() => {
                if (!isMounted) return;
                setS1Step(4); // Toggle flips to OFF
                timerId = setTimeout(() => {
                  if (!isMounted) return;
                  runS1();
                }, 3000);
              }, 900);
            }, 1200);
          }, 1200);
        }, 800);
      }
    };

    runS1();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 2: 해외주식 서비스 신청 (1:00~2:00)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 2) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS2 = () => {
      if (!isMounted) return;
      setS2Step(0);

      if (scene === 1) {
        // Scene 1: Home (0~1) -> All Menu Overseas Stock (2) -> Service Application (3) -> Highlight Sub-services (4)
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1); // Home: pulse on [메뉴]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS2Step(2); // All Menu: pulse on [해외주식]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS2Step(3); // pulse on [서비스신청]
              timerId = setTimeout(() => {
                if (!isMounted) return;
                setS2Step(4); // Highlight sub-services
                timerId = setTimeout(() => {
                  if (!isMounted) return;
                  runS2();
                }, 3000);
              }, 900);
            }, 1200);
          }, 1200);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 이용신청 & 통합증거금 확인
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1); // show [거래신청] & [이용중]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS2Step(2); // green check confirmation
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS2();
            }, 2800);
          }, 800);
        }, 800);
      } else {
        // Scene 3: 해외주식 실시간 시세 신청 -> 무료 시세 신청 완료
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1); // show quote application menu
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS2Step(2); // pulse on [신청]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS2Step(3); // success modal
              timerId = setTimeout(() => {
                if (!isMounted) return;
                runS2();
              }, 2800);
            }, 800);
          }, 800);
        }, 800);
      }
    };

    runS2();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 3: 투자금 확인 & 종목 검색 (2:00~2:50)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 3) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS3 = () => {
      if (!isMounted) return;
      setS3Step(0);

      if (scene === 1) {
        // Scene 1: Home screen -> pulse on bottom [보유자산] -> asset screen
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS3Step(1); // pulse on bottom [보유자산]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS3Step(2); // show asset view
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS3();
            }, 2800);
          }, 1000);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 해외주식주문 화면 진입 -> 상단 종목명 [애플 ▾] 터치 펄스
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS3Step(1); // pulse on top-left stock name [애플 ▾]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS3();
          }, 2800);
        }, 800);
      } else {
        // Scene 3: 검색창에 'spym' 타이핑 -> SPYM 선택 펄스
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS3Step(1); // type 'spym'
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS3Step(2); // pulse on SPYM search item
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS3();
            }, 2800);
          }, 900);
        }, 800);
      }
    };

    runS3();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 4: 주식 구매 실습 (수량입력 -> 매수주문 -> 체결확인)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 4) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS4 = () => {
      if (!isMounted) return;
      setS4Step(0);

      if (scene === 1) {
        // Scene 1: 수량 칸 터치 -> 수량입력기 키패드 1주 -> 확인 터치
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1); // open keypad sheet
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS4Step(2); // pulse on [확인]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS4Step(3); // 1주 set
              timerId = setTimeout(() => {
                if (!isMounted) return;
                runS4();
              }, 2600);
            }, 800);
          }, 900);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 빨간 매수 버튼 터치 -> 주문확인 팝업 -> 매수확인 터치 -> 즉시 체결
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1); // pulse on [매수]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS4Step(2); // modal popup
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS4Step(3); // pulse on [매수확인]
              timerId = setTimeout(() => {
                if (!isMounted) return;
                setS4Step(4); // filled
                timerId = setTimeout(() => {
                  if (!isMounted) return;
                  runS4();
                }, 2800);
              }, 800);
            }, 900);
          }, 800);
        }, 800);
      } else {
        // Scene 3: 구매 체결 내역 확인 ([주문체결] 탭 조회)
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1); // highlight 체결 카드
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS4Step(2); // highlight tip box
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS4();
            }, 3000);
          }, 1000);
        }, 800);
      }
    };

    runS4();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 5: 보유 주식 확인 & 주식 팔기(매도)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 5) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS5 = () => {
      if (!isMounted) return;
      setS5Step(0);

      if (scene === 1) {
        // Scene 1: 보유자산현황 진입 -> SPYM 1주 보유 및 평가손익 확인
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS5Step(1); // highlight asset card
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS5();
          }, 2800);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 보유 주식 목록에서 [팔기] 터치
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS5Step(1); // pulse on [팔기]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS5();
          }, 2800);
        }, 800);
      } else if (scene === 3) {
        // Scene 3: 파란색 [매도(팔기)] 터치 -> 판매 완료
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS5Step(1); // pulse on [매도]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS5Step(2); // filled result
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS5();
            }, 2800);
          }, 900);
        }, 800);
      } else {
        // Scene 4: D+2 결제일 및 출금 안내
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS5Step(1); // show D+2 balance
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS5();
          }, 3000);
        }, 800);
      }
    };

    runS5();
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

          {/* Smartphone Screen Inner (450px high-density container) */}
          <div className="bg-white text-zinc-900 rounded-b-[2.2rem] overflow-hidden h-[450px] flex flex-col justify-between px-3 pb-2 pt-1 font-sans text-xs relative select-none shadow-inner">

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: 화면 퀵메뉴 설정 */}
            {/* ------------------------------------------------------------- */}
            {step === 1 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 1-1: Home Screen -> Tight swipe to reveal Settings */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                    <div className="p-3 space-y-2 border-b border-zinc-100">
                      <div className="flex items-center justify-between text-[11px] font-black text-zinc-900">
                        <div className="flex items-center gap-3">
                          <span className="border-b-2 border-zinc-900 pb-0.5">국내</span>
                          <span className="text-zinc-400">해외</span>
                          <span className="text-zinc-400">채권</span>
                          <span className="text-zinc-400">자산</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 font-bold">간편모드</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                        <div className="space-y-0.5">
                          <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스피</div>
                          <div className="text-[12px] font-black text-zinc-900">9,048.16</div>
                          <div className="text-[7.5px] text-blue-500 font-bold">▼ 4.26 (-0.05%)</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스닥</div>
                          <div className="text-[12px] font-black text-zinc-900">950.97</div>
                          <div className="text-[7.5px] text-blue-500 font-bold">▼ 15.62 (-1.62%)</div>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl border border-emerald-400 bg-white flex items-center justify-between text-[8px] text-zinc-400">
                        <span>종목을 검색해 보세요</span>
                        <Search className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    </div>

                    <div className="p-3 space-y-1 text-center">
                      <div className="text-[9px] font-black text-zinc-700">
                        {s1Step >= 1 ? '⚙️ 우측 끝 [설정] 버튼 터치!' : '👉 아래 메뉴를 오른쪽으로 넘겨보세요'}
                      </div>
                      <div className="text-[7.5px] text-zinc-400">
                        자주 쓰는 핵심 메뉴만 남기기 위해 설정으로 이동합니다.
                      </div>
                    </div>

                    {/* Scrollable Bottom Bar */}
                    <div className="bg-[#1e293b] text-white border-t border-zinc-700 overflow-hidden relative">
                      <div 
                        className="flex items-center text-[7.5px] whitespace-nowrap py-1.5 transition-transform duration-700 ease-out"
                        style={{ transform: s1Step >= 1 ? 'translateX(-48px)' : 'translateX(0px)' }}
                      >
                        <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0">
                          <Menu className="w-3.5 h-3.5" /><span className="text-[6.5px]">메뉴</span>
                        </div>
                        <div className="flex flex-col items-center px-2.5 text-emerald-400 font-bold shrink-0"><span>홈</span></div>
                        <div className="flex flex-col items-center px-2.5 text-zinc-300 shrink-0"><span>관심종목</span></div>
                        <div className="flex flex-col items-center px-2.5 text-zinc-300 shrink-0"><span>주식현재가</span></div>
                        <div className="flex flex-col items-center px-2.5 text-zinc-300 shrink-0"><span>주식주문</span></div>
                        <div className="flex flex-col items-center px-2.5 text-zinc-300 shrink-0"><span>주식잔고</span></div>

                        <div className="relative shrink-0 pr-2 pl-1">
                          <div className={`flex flex-col items-center p-1 rounded-lg transition-all ${
                            s1Step >= 1 ? 'bg-[var(--accent-orange)] text-white shadow-xs' : 'text-zinc-400'
                          }`}>
                            <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                            <span className="text-[6.5px] font-black">설정</span>
                          </div>
                          {s1Step === 2 && (
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
                  </div>
                ) : scene === 2 ? (
                  /* 1-2: Quick Menu Edit Screen (Clean Deactivated Category Tabs) */
                  <div className="p-3 space-y-2 bg-white flex flex-col justify-between h-full animate-fadeIn">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-100 font-extrabold text-[11px] text-zinc-900">
                        <div className="flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-zinc-500" />
                          <span>퀵메뉴 설정</span>
                        </div>
                        <span className="text-[8px] text-zinc-400 font-normal">초기화</span>
                      </div>

                      {/* Clean Deactivated Category Tabs */}
                      <div className="grid grid-cols-5 gap-0.5 border-b border-zinc-100 pb-1 text-center text-[7.5px] font-medium text-zinc-400">
                        <span>국내주식</span>
                        <span>해외주식</span>
                        <span>상품/연금</span>
                        <span>뱅킹/대출</span>
                        <span>모바일지점</span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[8px] text-zinc-500 font-bold flex justify-between">
                          <span>선택된 퀵메뉴 (권장 4개)</span>
                          <span className="font-black text-emerald-600">4 / 20</span>
                        </div>

                        <div className="space-y-1 text-[8.5px] font-bold">
                          <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 flex justify-between items-center text-zinc-800">
                            <span>홈</span><span className="text-zinc-300">✕</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 flex justify-between items-center font-black">
                            <span>해외주식주문</span><span className="text-emerald-700">✓</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 flex justify-between items-center font-black">
                            <span>보유자산현황</span><span className="text-emerald-700">✓</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 flex justify-between items-center font-black">
                            <span>실시간환전</span><span className="text-emerald-700">✓</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative pt-1">
                      <div className={`w-full py-2 rounded-xl text-center font-extrabold text-white text-[10px] transition-all duration-300 ${
                        s1Step >= 2 ? 'bg-emerald-600 scale-[0.98]' : 'bg-emerald-500'
                      }`}>
                        {s1Step >= 2 ? '✓ 저장 완료' : '저장'}
                      </div>
                      {s1Step === 1 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="relative flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 1-3: Settings Toggle OFF - Full Journey Simulation (Home -> Menu -> Settings -> Toggle Off) */
                  s1Step <= 1 ? (
                    /* 1-3 Step 0~1: Home Screen with Pulse on Bottom Menu */
                    <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                      <div className="p-3 space-y-2 border-b border-zinc-100">
                        <div className="flex items-center justify-between text-[11px] font-black text-zinc-900">
                          <div className="flex items-center gap-3">
                            <span className="border-b-2 border-zinc-900 pb-0.5">국내</span>
                            <span className="text-zinc-400">해외</span>
                            <span className="text-zinc-400">채권</span>
                            <span className="text-zinc-400">자산</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 font-bold">간편모드</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                          <div className="space-y-0.5">
                            <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스피</div>
                            <div className="text-[12px] font-black text-zinc-900">9,048.16</div>
                            <div className="text-[7.5px] text-blue-500 font-bold">▼ 4.26 (-0.05%)</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스닥</div>
                            <div className="text-[12px] font-black text-zinc-900">950.97</div>
                            <div className="text-[7.5px] text-blue-500 font-bold">▼ 15.62 (-1.62%)</div>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between text-[8px] text-zinc-400">
                          <span>종목을 검색해 보세요</span>
                          <Search className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                      </div>

                      <div className="p-3 space-y-1 text-center">
                        <div className="text-[9px] font-black text-zinc-800">
                          👉 홈 화면 좌측 하단 [메뉴] 터치
                        </div>
                        <div className="text-[7.5px] text-zinc-400">
                          해외전용 퀵메뉴 설정을 끄기 위해 전체 메뉴로 진입합니다.
                        </div>
                      </div>

                      {/* Bottom Bar with Pulse on Menu */}
                      <div className="bg-[#1e293b] text-white border-t border-zinc-700 overflow-hidden relative">
                        <div className="flex items-center text-[7.5px] whitespace-nowrap py-1.5">
                          <div className="relative flex flex-col items-center px-3 text-[var(--accent-orange)] font-black shrink-0">
                            <Menu className="w-3.5 h-3.5" />
                            <span className="text-[6.5px]">메뉴</span>
                            {s1Step === 1 && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <span className="relative flex h-6 w-6">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0"><span>홈</span></div>
                          <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0"><span>해외주식주문</span></div>
                          <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0"><span>보유자산현황</span></div>
                          <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0"><span>실시간환전</span></div>
                        </div>
                      </div>
                    </div>
                  ) : s1Step === 2 ? (
                    /* 1-3 Step 2: All Menu Screen -> Pulse on Bottom Settings Gear */
                    <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                      <div className="border-b border-zinc-100">
                        <div className="px-3 pt-2 pb-1 flex items-center justify-between text-zinc-800">
                          <span className="font-extrabold text-[11px]">전체 메뉴</span>
                          <div className="flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-zinc-500" />
                            <Bell className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-0.5 px-1 pb-1.5 text-center text-[7px] font-bold text-zinc-400 border-b border-zinc-100">
                          <div className="flex flex-col items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" /><span>국내주식</span></div>
                          <div className="flex flex-col items-center gap-0.5"><Globe className="w-3.5 h-3.5" /><span>해외주식</span></div>
                          <div className="flex flex-col items-center gap-0.5"><div className="w-3.5 h-3.5 border border-zinc-300 rounded-xs grid grid-cols-2 gap-0.5 p-0.5" /><span>상품/연금</span></div>
                          <div className="flex flex-col items-center gap-0.5"><DollarSign className="w-3.5 h-3.5" /><span>뱅킹/대출</span></div>
                          <div className="flex flex-col items-center gap-0.5"><Zap className="w-3.5 h-3.5" /><span>모바일지점</span></div>
                        </div>
                      </div>

                      <div className="p-3 space-y-1.5 text-[8px] flex-1 overflow-hidden">
                        <div className="text-zinc-400 font-bold">주요 서비스</div>
                        <div className="space-y-1">
                          <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-700 font-medium flex items-center justify-between">
                            <span>주식현재가 / 차트</span>
                            <ChevronRight className="w-3 h-3 text-zinc-400" />
                          </div>
                          <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-700 font-medium flex items-center justify-between">
                            <span>주식주문 / 잔고</span>
                            <ChevronRight className="w-3 h-3 text-zinc-400" />
                          </div>
                        </div>
                      </div>

                      {/* Guide Guidance Note */}
                      <div className="p-1.5 text-center text-[7.5px] font-bold text-zinc-500 bg-zinc-50 border-t border-zinc-100">
                        전체 메뉴 맨 아래의 [설정 ⚙️]으로 이동합니다
                      </div>

                      {/* Bottom All-Menu Footer with Clean [설정] Button */}
                      <div className="p-2 bg-zinc-900 text-white flex items-center justify-between text-[8px]">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <span className="text-[7.5px]">로그아웃</span>
                          <span>•</span>
                          <span className="text-[7.5px]">고객센터</span>
                        </div>

                        <div className="relative">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white font-bold text-[8px] bg-zinc-800 border border-zinc-700">
                            <Settings className="w-3.5 h-3.5 text-zinc-300" />
                            <span>설정</span>
                          </div>
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-6 w-6">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                              <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 1-3 Step 3~4: Settings Screen -> Toggle OFF */
                    <div className="p-3 space-y-3 flex flex-col justify-between h-full bg-white animate-fadeIn">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 font-extrabold text-[11px] text-zinc-900 border-b border-zinc-100 pb-1">
                          <ChevronLeft className="w-3.5 h-3.5 text-zinc-500" />
                          <span>설정</span>
                        </div>

                        <div className="text-[8px] text-zinc-400 font-bold pt-1">화면</div>

                        <div className="space-y-2 text-[9px]">
                          <div className="relative">
                            <div className={`p-2.5 rounded-xl border-2 transition-all ${
                              s1Step >= 4 
                                ? 'border-zinc-200 bg-zinc-50' 
                                : 'border-[var(--accent-orange)] bg-[var(--accent-orange)]/10 shadow-xs'
                            } flex items-center justify-between`}>
                              <div>
                                <div className="font-black text-zinc-900 text-[9.5px]">해외주식 전용 퀵메뉴 사용</div>
                                <div className="text-[7.5px] text-zinc-500 mt-0.5">해외 진입 시 퀵메뉴 자동 변경 끄기</div>
                              </div>

                              <div className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-all duration-300 ${
                                s1Step >= 4 ? 'bg-zinc-300 justify-start' : 'bg-emerald-500 justify-end'
                              }`}>
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                              </div>
                            </div>

                            {s1Step === 3 && (
                              <div className="absolute right-2 top-2 pointer-events-none">
                                <span className="relative flex h-6 w-6">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-[9px] font-extrabold text-emerald-600 pb-1">
                        {s1Step >= 4 ? '✓ 해외 전용 퀵메뉴 Off 완료! 화면 세팅 끝' : '토글을 눌러 기능을 꺼주세요'}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: 해외주식 서비스 신청 */}
            {/* ------------------------------------------------------------- */}
            {step === 2 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 2-1: Home Screen -> Menu -> All Menu Overseas Stock -> Service Application */
                  s2Step <= 1 ? (
                    /* 2-1 Step 0~1: Home Screen with Pulse on Bottom Menu */
                    <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                      <div className="p-3 space-y-2 border-b border-zinc-100">
                        <div className="flex items-center justify-between text-[11px] font-black text-zinc-900">
                          <div className="flex items-center gap-3">
                            <span className="border-b-2 border-zinc-900 pb-0.5">국내</span>
                            <span className="text-zinc-400">해외</span>
                            <span className="text-zinc-400">채권</span>
                            <span className="text-zinc-400">자산</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 font-bold">간편모드</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                          <div className="space-y-0.5">
                            <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스피</div>
                            <div className="text-[12px] font-black text-zinc-900">9,048.16</div>
                            <div className="text-[7.5px] text-blue-500 font-bold">▼ 4.26 (-0.05%)</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스닥</div>
                            <div className="text-[12px] font-black text-zinc-900">950.97</div>
                            <div className="text-[7.5px] text-blue-500 font-bold">▼ 15.62 (-1.62%)</div>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between text-[8px] text-zinc-400">
                          <span>종목을 검색해 보세요</span>
                          <Search className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                      </div>

                      <div className="p-3 space-y-1 text-center">
                        <div className="text-[9px] font-black text-zinc-800">
                          👉 홈 화면 좌측 하단 [메뉴] 터치
                        </div>
                        <div className="text-[7.5px] text-zinc-400">
                          해외주식 서비스 신청을 위해 전체 메뉴로 들어갑니다.
                        </div>
                      </div>

                      {/* Bottom Bar with Pulse on Menu */}
                      <div className="bg-[#1e293b] text-white border-t border-zinc-700 overflow-hidden relative">
                        <div className="flex items-center text-[7.5px] whitespace-nowrap py-1.5">
                          <div className="relative flex flex-col items-center px-3 text-[var(--accent-orange)] font-black shrink-0">
                            <Menu className="w-3.5 h-3.5" />
                            <span className="text-[6.5px]">메뉴</span>
                            {s2Step === 1 && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <span className="relative flex h-6 w-6">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0"><span>홈</span></div>
                          <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0"><span>해외주식주문</span></div>
                          <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0"><span>보유자산현황</span></div>
                          <div className="flex flex-col items-center px-2.5 text-zinc-400 shrink-0"><span>실시간환전</span></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 2-1 Step 2~4: All Menu -> Overseas Stock -> Service Application */
                    <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                      <div className="border-b border-zinc-100">
                        <div className="px-3 pt-2 pb-1 flex items-center justify-end gap-2 text-zinc-800">
                          <Search className="w-3.5 h-3.5" /><Mic className="w-3.5 h-3.5" /><Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="grid grid-cols-5 gap-0.5 px-1 pb-1.5 text-center text-[7px] font-black border-b border-zinc-100">
                          <div className="flex flex-col items-center gap-0.5 text-zinc-400"><TrendingUp className="w-3.5 h-3.5" /><span>국내주식</span></div>
                          <div className="relative flex flex-col items-center gap-0.5 text-[var(--accent-orange)] font-extrabold">
                            <Globe className="w-3.5 h-3.5" />
                            <span>해외주식</span>
                            {s2Step === 2 && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <span className="relative flex h-6 w-6">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center gap-0.5 text-zinc-400"><div className="w-3.5 h-3.5 border border-zinc-300 rounded-xs grid grid-cols-2 gap-0.5 p-0.5" /><span>상품/연금</span></div>
                          <div className="flex flex-col items-center gap-0.5 text-zinc-400"><DollarSign className="w-3.5 h-3.5" /><span>뱅킹/대출</span></div>
                          <div className="flex flex-col items-center gap-0.5 text-zinc-400"><Zap className="w-3.5 h-3.5" /><span>모바일지점</span></div>
                        </div>
                      </div>

                      <div className="flex flex-1 overflow-hidden">
                        <div className="w-22 bg-zinc-100/90 border-r border-zinc-200 flex flex-col py-1 text-[7.5px] font-bold text-zinc-600 space-y-0.5">
                          <div className="p-1.5 pl-2 text-zinc-600">주식모으기(적립)</div>
                          <div className={`relative p-1.5 border-l-2 transition-all ${
                            s2Step >= 3 
                              ? 'bg-white text-blue-600 font-black border-blue-600' 
                              : 'text-zinc-600 border-transparent'
                          }`}>
                            서비스신청
                            {s2Step === 3 && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <span className="relative flex h-6 w-6">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-1.5 pl-2 text-zinc-600">투자정보</div>
                          <div className="p-1.5 pl-2 text-zinc-600">미국실적발표</div>
                        </div>

                        <div className="flex-1 p-2 space-y-1.5 text-[8px]">
                          <div className="font-extrabold text-zinc-900 border-b border-zinc-100 pb-1">해외서비스신청</div>
                          <div className="space-y-1 pt-0.5">
                            <div className={`p-1.5 rounded-lg border transition-all flex items-center justify-between ${
                              s2Step >= 4 
                                ? 'bg-emerald-50 border-emerald-300 font-black text-emerald-950 shadow-xs' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-800 font-bold'
                            }`}>
                              <span>해외주식거래이용신청</span>
                              <ChevronRight className="w-3 h-3 text-emerald-700" />
                            </div>
                            <div className="p-1.5 text-zinc-600 font-medium">해외주식실시간시세신청</div>
                            <div className="p-1.5 text-zinc-600 font-medium">해외주식공지사항</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5 text-center text-[7.5px] font-bold text-zinc-500 bg-zinc-50 border-t border-zinc-100">
                        {s2Step === 2 ? '상단 [해외주식] 탭을 터치합니다' : '[해외주식] ➔ [서비스신청]으로 이동합니다'}
                      </div>
                    </div>
                  )
                ) : scene === 2 ? (
                  /* 2-2: Overseas Trade Application Status (100-1234-56-78 주식부엉) */
                  <div className="p-3 space-y-2 bg-white flex flex-col justify-between h-full animate-fadeIn">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-100 font-extrabold text-[10.5px] text-zinc-900">
                        <div className="flex items-center gap-1">
                          <ChevronLeft className="w-3.5 h-3.5 text-zinc-500" />
                          <span>해외주식거래이용신청</span>
                        </div>
                        <RotateCw className="w-3 h-3 text-zinc-400" />
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px] flex justify-between font-mono font-bold">
                        <span>100-1234-56-78 주식부엉</span>
                        <span className="text-zinc-400">••••</span>
                      </div>

                      <div className="text-[8px] text-zinc-500 font-bold">해외주식 거래 안내</div>

                      <div className="space-y-1.5 text-[8.5px]">
                        <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                          <span className="font-bold text-zinc-800">해외주식거래 이용신청 여부</span>
                          <span className="text-rose-600 font-black">이용중</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                          <span className="font-bold text-zinc-800">해외주식 통합증거금 이용신청</span>
                          <span className="text-rose-600 font-black">이용중</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                          <span className="font-medium text-zinc-700">해외ETP 위험고지</span>
                          <span className="text-rose-600 font-bold">이용중</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                      <div className="text-[9px] font-black text-emerald-900">✓ 거래 & 통합증거금 신청 확인 완료!</div>
                      <div className="text-[7.5px] text-emerald-700">미신청 상태라면 [신청] 버튼을 눌러주세요.</div>
                    </div>
                  </div>
                ) : (
                  /* 2-3: US Realtime Price 0.0 USD Free Apply */
                  <div className="p-3 space-y-2.5 bg-white flex flex-col justify-between h-full animate-fadeIn">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-100 font-extrabold text-[10.5px] text-zinc-900">
                        <div className="flex items-center gap-1">
                          <ChevronLeft className="w-3.5 h-3.5 text-zinc-500" />
                          <span>해외주식실시간시세신청</span>
                        </div>
                        <RotateCw className="w-3 h-3 text-zinc-400" />
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px] flex justify-between font-mono font-bold">
                        <span>100-1234-56-78 주식부엉</span>
                        <span className="text-zinc-400">••••</span>
                      </div>

                      <div className="p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇺🇸</span>
                            <div>
                              <div className="font-black text-xs text-zinc-900">미국/무료실시간</div>
                              <div className="text-[8px] text-zinc-500 mt-0.5">월사용료 0.0 USD</div>
                            </div>
                          </div>

                          <div className="relative">
                            <div className={`px-3.5 py-1.5 rounded-xl font-black text-[10px] transition-all duration-300 ${
                              s2Step >= 2 ? 'bg-zinc-200 text-zinc-700' : 'bg-emerald-500 text-white shadow-xs'
                            }`}>
                              {s2Step >= 2 ? '이용중' : '신청'}
                            </div>

                            {s2Step === 1 && (
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
                    </div>

                    <div className="text-center text-[9px] font-extrabold text-emerald-600 pb-1">
                      {s2Step >= 2 ? '✓ 평생 무료 실시간 시세 신청 완료!' : '[신청] 버튼을 눌러 무료 시세를 등록합니다'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: 투자금 확인 & 종목 검색 */}
            {/* ------------------------------------------------------------- */}
            {step === 3 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 3-1: Home Screen -> Pulse on [보유자산] -> Asset Overview Screen */
                  s3Step <= 1 ? (
                    /* 3-1 Step 0~1: Home Screen with Pulse on Bottom [보유자산] */
                    <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                      <div className="p-3 space-y-2 border-b border-zinc-100">
                        <div className="flex items-center justify-between text-[11px] font-black text-zinc-900">
                          <div className="flex items-center gap-3">
                            <span className="border-b-2 border-zinc-900 pb-0.5">국내</span>
                            <span className="text-zinc-400">해외</span>
                            <span className="text-zinc-400">채권</span>
                            <span className="text-zinc-400">자산</span>
                          </div>
                          <span className="text-[9px] text-zinc-400 font-bold">간편모드</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                          <div className="space-y-0.5">
                            <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스피</div>
                            <div className="text-[12px] font-black text-zinc-900">9,048.16</div>
                            <div className="text-[7.5px] text-blue-500 font-bold">▼ 4.26 (-0.05%)</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스닥</div>
                            <div className="text-[12px] font-black text-zinc-900">950.97</div>
                            <div className="text-[7.5px] text-blue-500 font-bold">▼ 15.62 (-1.62%)</div>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between text-[8px] text-zinc-400">
                          <span>종목을 검색해 보세요</span>
                          <Search className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                      </div>

                      <div className="p-3 space-y-1 text-center">
                        <div className="text-[9px] font-black text-zinc-800">
                          👉 홈 화면 하단 [보유자산] 터치
                        </div>
                        <div className="text-[7.5px] text-zinc-400">
                          내 계좌의 입금 내역 및 투자 가능 잔고를 확인합니다.
                        </div>
                      </div>

                      {/* Bottom Bar with Pulse on 보유자산 */}
                      <div className="bg-[#1e293b] text-white border-t border-zinc-700 overflow-hidden relative">
                        <div className="flex items-center text-[7.5px] whitespace-nowrap py-1.5 justify-between px-2">
                          <div className="flex flex-col items-center px-1.5 text-zinc-400 shrink-0"><Menu className="w-3.5 h-3.5" /><span className="text-[6.5px]">메뉴</span></div>
                          <div className="flex flex-col items-center px-1.5 text-zinc-400 shrink-0"><span>홈</span></div>
                          <div className="flex flex-col items-center px-1.5 text-zinc-400 shrink-0"><span>해외주식주문</span></div>
                          <div className="relative flex flex-col items-center px-2 text-[var(--accent-orange)] font-black shrink-0">
                            <span>보유자산</span>
                            {s3Step === 1 && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <span className="relative flex h-6 w-6">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center px-1.5 text-zinc-400 shrink-0"><span>실시간환전</span></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 3-1 Step 2: Asset Overview Screen */
                    <div className="flex flex-col justify-between h-full bg-[#f8fafc] animate-fadeIn">
                      <div className="bg-white border-b border-zinc-200">
                        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-zinc-800 font-extrabold text-[11px]">
                          <div className="flex items-center gap-1">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>보유자산현황</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500">
                            <RotateCw className="w-3 h-3" />
                            <BarChart2 className="w-3 h-3" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 text-center text-[9px] font-bold border-t border-zinc-100">
                          <div className="py-1.5 text-zinc-900 border-b-2 border-zinc-900 font-black">상품</div>
                          <div className="py-1.5 text-zinc-400">계좌</div>
                        </div>
                      </div>

                      <div className="p-3 space-y-2 flex-1 overflow-hidden">
                        <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[8.5px] text-zinc-500 font-bold">총자산</span>
                            <span className="text-base font-black text-zinc-900 font-mono">1,000,000 <span className="text-[10px] font-sans font-medium text-zinc-400">원</span></span>
                          </div>
                          <div className="space-y-1 text-[7.5px] text-zinc-600 border-t border-zinc-100 pt-1.5">
                            <div className="flex justify-between">
                              <span>총평가손익 <span className="text-zinc-400">0.00%</span></span>
                              <span className="font-mono font-bold">0 원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>출금가능금액 <span className="text-zinc-400">금일</span></span>
                              <span className="font-mono font-bold text-zinc-900">1,000,000 원</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between text-[8px]">
                            <span className="font-bold text-zinc-700">종합매매 계좌</span>
                            <span className="font-mono text-zinc-400">100-1234-56</span>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-0.5">
                            <div className="text-[8.5px] font-black text-emerald-900">✓ 투자금(예수금) 확인 완료</div>
                            <div className="text-[7px] text-emerald-700">해외주식 주문 시 자동 원화 정산됩니다</div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Bar */}
                      <div className="bg-[#1e293b] text-white border-t border-zinc-700 py-1.5 px-2 flex items-center justify-between text-[7.5px]">
                        <div className="flex flex-col items-center px-1.5 text-zinc-400 font-bold"><Menu className="w-3.5 h-3.5" /><span className="text-[6.5px]">메뉴</span></div>
                        <div className="flex flex-col items-center px-1.5 text-zinc-400 font-bold"><span>홈</span></div>
                        <div className="flex flex-col items-center px-1.5 text-zinc-400 font-bold"><span>해외주식주문</span></div>
                        <div className="flex flex-col items-center px-1.5 text-[var(--accent-orange)] font-bold"><span>보유자산</span></div>
                        <div className="flex flex-col items-center px-1.5 text-zinc-400 font-bold"><span>실시간환전</span></div>
                      </div>
                    </div>
                  )
                ) : scene === 2 ? (
                  /* 3-2: MTS Realistic Overseas Order (Orderbook + Order Pad side-by-side) */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                    {/* Top MTS Header */}
                    <div className="p-2 border-b border-zinc-100 space-y-1">
                      <div className="flex items-center justify-between">
                        {/* Stock Selector Dropdown with Pulse */}
                        <div className="relative">
                          <div className="flex items-center gap-1 font-black text-xs text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded-lg border border-zinc-200 transition-colors">
                            <ChevronLeft className="w-3 h-3 text-zinc-500" />
                            <span>애플</span>
                            <span className="text-[8px] text-zinc-400 font-mono">AAPL</span>
                            <ChevronDown className="w-3 h-3 text-zinc-500" />
                          </div>
                          {s3Step === 1 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[6.5px] px-1 py-0.2 rounded font-bold">무료실시간</span>
                          <Search className="w-3.5 h-3.5 text-zinc-500" />
                          <Heart className="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                      </div>

                      {/* Current Quote Bar */}
                      <div className="flex items-baseline justify-between px-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-rose-600 font-mono">295.61</span>
                          <span className="text-[7.5px] text-rose-600 font-bold font-mono">▲ 1.20 (+0.41%)</span>
                        </div>
                        <span className="text-[7px] text-zinc-400 font-mono">USD 나스닥</span>
                      </div>
                    </div>

                    {/* Order Action Tabs */}
                    <div className="grid grid-cols-4 border-b border-zinc-200 text-center text-[8px] font-bold">
                      <span className="text-rose-600 border-b-2 border-rose-600 py-1 font-black">매수</span>
                      <span className="text-zinc-400 py-1">매도</span>
                      <span className="text-zinc-400 py-1">정정/취소</span>
                      <span className="text-zinc-400 py-1">체결/잔고</span>
                    </div>

                    {/* 2-Column Split Body: Left Orderbook + Right Order Pad */}
                    <div className="flex flex-1 overflow-hidden">
                      {/* Left Column: 6-Tier Orderbook */}
                      <div className="w-[42%] border-r border-zinc-200 flex flex-col justify-between font-mono text-[7px] py-0.5 bg-zinc-50/50">
                        {/* Ask Prices (Blue/매도) */}
                        <div className="bg-blue-50/80 p-1 text-blue-800 flex justify-between items-center border-b border-blue-100/50">
                          <span className="text-[6px] text-blue-500">1,420</span>
                          <span className="font-bold">295.75</span>
                        </div>
                        <div className="bg-blue-50/60 p-1 text-blue-800 flex justify-between items-center border-b border-blue-100/50">
                          <span className="text-[6px] text-blue-500">2,850</span>
                          <span className="font-bold">295.70</span>
                        </div>
                        <div className="bg-blue-50/40 p-1 text-blue-800 flex justify-between items-center border-b border-blue-100/50">
                          <span className="text-[6px] text-blue-500">4,110</span>
                          <span className="font-bold">295.65</span>
                        </div>

                        {/* Bid Prices (Red/매수) */}
                        <div className="bg-rose-50/40 p-1 text-rose-800 flex justify-between items-center border-b border-rose-100/50">
                          <span className="font-bold">295.60</span>
                          <span className="text-[6px] text-rose-500">5,230</span>
                        </div>
                        <div className="bg-rose-50/60 p-1 text-rose-800 flex justify-between items-center border-b border-rose-100/50">
                          <span className="font-bold">295.55</span>
                          <span className="text-[6px] text-rose-500">3,400</span>
                        </div>
                        <div className="bg-rose-50/80 p-1 text-rose-800 flex justify-between items-center">
                          <span className="font-bold">295.50</span>
                          <span className="text-[6px] text-rose-500">1,980</span>
                        </div>
                      </div>

                      {/* Right Column: Order Form / Input Pad */}
                      <div className="flex-1 p-1.5 space-y-1 text-[7.5px] flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            <div className="flex-1 p-0.5 rounded border border-zinc-200 bg-zinc-50 font-black text-center text-zinc-800 text-[7px]">지정가 ▾</div>
                            <div className="flex-1 p-0.5 rounded border border-zinc-100 text-zinc-400 text-center text-[7px]">시장가</div>
                          </div>

                          <div className="p-1 rounded border border-zinc-200 bg-zinc-50 flex justify-between items-center font-bold">
                            <span className="text-zinc-500 text-[6.5px]">수량</span>
                            <span className="font-mono font-black text-zinc-900 text-[8.5px]">1 주</span>
                          </div>

                          <div className="flex gap-0.5">
                            {['10%', '25%', '50%', '최대'].map(p => (
                              <span key={p} className="flex-1 py-0.5 text-center text-[6px] rounded bg-zinc-100 text-zinc-600 font-bold">{p}</span>
                            ))}
                          </div>

                          <div className="p-1 rounded border border-zinc-200 bg-zinc-50 flex justify-between items-center font-mono">
                            <span className="text-zinc-500 text-[6.5px]">가격(USD)</span>
                            <span className="font-black text-zinc-900 text-[8.5px]">295.61</span>
                          </div>
                        </div>

                        {/* Red CTA Buy Button */}
                        <div className="py-1.5 rounded-lg bg-rose-600 text-white font-black text-center text-[8.5px] shadow-xs">
                          현금매수 (USD)
                        </div>
                      </div>
                    </div>

                    {/* Guidance Bar */}
                    <div className="p-1.5 text-center text-[7.5px] font-bold text-zinc-500 bg-zinc-50 border-t border-zinc-100">
                      👉 왼쪽 위 종목 이름 [애플 ▾]을 터치하세요
                    </div>

                    {/* Bottom Navigation Bar */}
                    <div className="bg-[#1e293b] text-white border-t border-zinc-700 py-1.5 px-2 flex items-center justify-between text-[7.5px]">
                      <div className="flex flex-col items-center px-1.5 text-zinc-400 font-bold"><Menu className="w-3.5 h-3.5" /><span className="text-[6.5px]">메뉴</span></div>
                      <div className="flex flex-col items-center px-1.5 text-zinc-400 font-bold"><span>홈</span></div>
                      <div className="flex flex-col items-center px-1.5 text-[var(--accent-orange)] font-bold"><span>해외주식주문</span></div>
                      <div className="flex flex-col items-center px-1.5 text-zinc-400 font-bold"><span>보유자산</span></div>
                      <div className="flex flex-col items-center px-1.5 text-zinc-400 font-bold"><span>실시간환전</span></div>
                    </div>
                  </div>
                ) : (
                  /* 3-3: Search Screen & 'spym' typing */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                    <div className="p-2.5 space-y-1.5 border-b border-zinc-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-extrabold text-[11px]">
                          <X className="w-3.5 h-3.5 text-zinc-600" />
                          <span>종목검색</span>
                        </div>
                        <div className="flex rounded-lg overflow-hidden border border-zinc-200 text-[8px] font-bold">
                          <span className="px-2 py-0.5 text-zinc-400">국내</span>
                          <span className="px-2 py-0.5 bg-emerald-500 text-white font-black">해외</span>
                        </div>
                      </div>

                      <div className="p-1.5 rounded-xl border border-emerald-500 bg-white flex items-center justify-between px-2 text-[9.5px]">
                        <div className="flex items-center gap-1 font-mono font-bold text-zinc-900">
                          <span>{s3Step >= 1 ? 'spym' : ''}</span>
                          <span className="w-0.5 h-3 bg-emerald-500 animate-pulse" />
                        </div>
                        <Search className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    </div>

                    <div className="p-2.5 flex-1 overflow-hidden space-y-1">
                      {s3Step >= 1 ? (
                        <div className="relative animate-fadeIn">
                          <div className="p-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 shadow-xs flex justify-between items-center">
                            <div>
                              <div className="font-black text-xs text-zinc-900">SPYM</div>
                              <div className="text-[7.5px] text-zinc-500 font-medium truncate max-w-[170px]">
                                STATE STREET SPDR PORTFOLIO S&P 500
                              </div>
                              <div className="text-[7px] text-emerald-600 font-bold mt-0.5">미국 | 아멕스 | 소수점가능</div>
                            </div>
                            <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-extrabold">선택</span>
                          </div>

                          {s3Step === 2 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-[8px] text-zinc-400 pt-4">SPYM 검색 중...</div>
                      )}
                    </div>

                    {/* Dark Virtual Keyboard */}
                    <div className="bg-[#24211e] text-white p-1.5 rounded-t-2xl space-y-1 text-[7.5px] font-mono">
                      <div className="flex justify-center gap-1">
                        {['q','w','e','r','t','y','u','i','o','p'].map(k => (
                          <span key={k} className={`w-5 h-6 rounded flex items-center justify-center ${['s','p','y','m'].includes(k) ? 'bg-zinc-600 font-black text-emerald-400' : 'bg-zinc-800'}`}>{k}</span>
                        ))}
                      </div>
                      <div className="flex justify-center gap-1">
                        {['a','s','d','f','g','h','j','k','l'].map(k => (
                          <span key={k} className={`w-5 h-6 rounded flex items-center justify-center ${['s','p','y','m'].includes(k) ? 'bg-zinc-600 font-black text-emerald-400' : 'bg-zinc-800'}`}>{k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: 주식 구매 실습 (SPYM 1주 구매) */}
            {/* ------------------------------------------------------------- */}
            {step === 4 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 4-1: 수량 1주 입력 Keypad Sheet */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                    <div className="p-2.5 space-y-1.5 border-b border-zinc-100">
                      <div className="font-extrabold text-xs text-zinc-900">구매 수량 입력</div>
                      <div className="space-y-1 text-[8px]">
                        <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 flex justify-between">
                          <span className="text-zinc-500">단가</span>
                          <span className="font-mono font-bold">87.5200 USD</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-300 flex justify-between items-center">
                          <span className="text-zinc-700 font-bold">구매 수량</span>
                          <span className="font-mono font-black text-sm text-zinc-900">1 주</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 flex justify-between text-[7.5px]">
                          <span className="text-zinc-400">원화 예상금액</span>
                          <span className="font-mono font-black text-emerald-700">약 120,000 KRW</span>
                        </div>
                      </div>
                    </div>

                    {/* Numeric Keypad */}
                    <div className="p-2 space-y-1">
                      <div className="grid grid-cols-4 gap-1 text-center font-mono font-bold text-xs">
                        <span className="p-1.5 rounded bg-zinc-100 text-emerald-600 font-black">1</span>
                        <span className="p-1.5 rounded bg-zinc-50 text-zinc-700">2</span>
                        <span className="p-1.5 rounded bg-zinc-50 text-zinc-700">3</span>
                        <span className="p-1.5 rounded bg-zinc-100 text-zinc-500 text-[9px]">C</span>
                        <span className="p-1.5 rounded bg-zinc-50 text-zinc-700">4</span>
                        <span className="p-1.5 rounded bg-zinc-50 text-zinc-700">5</span>
                        <span className="p-1.5 rounded bg-zinc-50 text-zinc-700">6</span>
                        <span className="p-1.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-black">최대</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <div className="py-2 rounded-xl border border-zinc-200 text-center font-bold text-zinc-500 text-[9px]">취소</div>
                        <div className="relative">
                          <div className="py-2 rounded-xl bg-emerald-500 text-center font-extrabold text-white text-[9px] shadow-xs">
                            확인
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
                      </div>
                    </div>
                  </div>
                ) : scene === 2 ? (
                  /* 4-2: Buy Confirmation Popup -> Instant Fill */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                    {s4Step < 4 ? (
                      <div className="flex flex-col justify-between h-full p-3 bg-slate-50">
                        <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-lg space-y-2 text-[8.5px]">
                          <div className="font-black text-[11px] text-zinc-900 border-b border-zinc-100 pb-1.5">
                            해외주식 <span className="text-rose-600">구매(매수)</span> 주문확인
                          </div>
                          <div className="text-[7.5px] text-zinc-500 font-bold">
                            SPYM (S&P 500 ETF)
                          </div>

                          <div className="space-y-1 font-mono pt-1 text-zinc-700">
                            <div className="flex justify-between"><span className="text-zinc-400">주문종목</span><span className="font-bold">SPYM</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">주문수량</span><span className="font-black text-zinc-900">1 주</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">주문가격</span><span className="font-bold text-rose-600">87.5200 USD</span></div>
                            <div className="flex justify-between border-t border-zinc-100 pt-1 font-black text-zinc-900">
                              <span>결제방식</span><span className="text-emerald-700 font-bold">원화 자동 정산</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="py-2.5 rounded-xl border border-zinc-200 bg-white text-center font-bold text-zinc-500 text-[9px]">취소</div>
                          <div className="relative">
                            <div className="py-2.5 rounded-xl bg-rose-600 text-center font-black text-white text-[9px] shadow-md">
                              매수확인
                            </div>
                            {s4Step === 3 && (
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
                      /* Filled State */
                      <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                        <div className="p-2 space-y-1 border-b border-zinc-100">
                          <div className="font-extrabold text-[10.5px] text-zinc-900 truncate">SPYM (S&P 500 ETF)</div>
                          <div className="grid grid-cols-4 border-b border-zinc-200 text-center text-[8.5px] font-bold">
                            <span className="text-zinc-400 py-1">매수</span>
                            <span className="text-zinc-400 py-1">매도</span>
                            <span className="text-zinc-400 py-1">정정/취소</span>
                            <span className="text-zinc-900 border-b-2 border-zinc-900 py-1 font-black">주문체결</span>
                          </div>
                        </div>

                        <div className="p-3 flex-1 overflow-hidden space-y-2">
                          <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1 text-[8.5px] font-mono">
                            <div className="flex justify-between font-black text-zinc-900">
                              <span>SPYM 1주</span>
                              <span className="text-rose-600 font-bold">구매 체결완료</span>
                            </div>
                            <div className="flex justify-between text-[7.5px] text-zinc-500">
                              <span>체결단가 87.5200 USD</span>
                              <span>1주 / 전량 체결</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                            <div className="text-[9px] font-black text-emerald-900">🎉 1주 구매 체결이 완료되었습니다!</div>
                            <div className="text-[7.5px] text-emerald-700">달러 환전 없이 원화로 편리하게 구매되었습니다.</div>
                          </div>
                        </div>

                        <div className="bg-[#1e293b] text-white py-1.5 px-3 flex justify-between text-[7.5px]">
                          <span className="text-zinc-400">메뉴</span>
                          <span className="text-zinc-400">홈</span>
                          <span className="text-emerald-400 font-bold">해외주식주문</span>
                          <span className="text-zinc-400">보유자산</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 4-3: 구매 체결 내역 확인 ([주문체결] 탭) */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                    <div className="p-2 space-y-1 border-b border-zinc-100">
                      <div className="grid grid-cols-4 border-b border-zinc-200 text-center text-[8.5px] font-bold">
                        <span className="text-zinc-400 py-1">매수</span>
                        <span className="text-zinc-400 py-1">매도</span>
                        <span className="text-zinc-400 py-1">정정/취소</span>
                        <span className="text-zinc-900 border-b-2 border-zinc-900 py-1 font-black">주문체결</span>
                      </div>
                    </div>

                    <div className="p-3 flex-1 overflow-hidden space-y-2">
                      <div className="text-[8px] font-bold text-zinc-500 flex justify-between">
                        <span>체결 내역 (1건)</span>
                        <span className="text-emerald-600 font-bold">체결 완료</span>
                      </div>

                      <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1 text-[8.5px] font-mono">
                        <div className="flex justify-between font-black text-zinc-900">
                          <span>SPYM (지정가)</span>
                          <span className="text-emerald-700 font-bold">1주 체결 완료</span>
                        </div>
                        <div className="flex justify-between text-[7.5px] text-zinc-500">
                          <span>체결가 87.5200 USD</span>
                          <span>주문 1 / 체결 1</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-0.5">
                        <div className="text-[8.5px] font-black text-blue-900">💡 체결 대기 시 팁</div>
                        <div className="text-[7px] text-blue-700 leading-snug">
                          만약 바로 체결되지 않고 대기 중이라면 [정정/취소] 탭에서 가격을 현재가로 올려 즉시 체결할 수 있습니다.
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5 text-center text-[7.5px] font-bold text-zinc-500 bg-zinc-50 border-t border-zinc-100">
                      👉 [주문체결] 탭에서 정상적으로 구매되었는지 확인합니다
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 5: 보유 주식 확인 & 주식 팔기(매도) */}
            {/* ------------------------------------------------------------- */}
            {step === 5 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 5-1: 보유자산에서 내 주식 확인 */
                  <div className="flex flex-col justify-between h-full bg-[#f8fafc] animate-fadeIn">
                    <div className="bg-white border-b border-zinc-200">
                      <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-zinc-800 font-extrabold text-[11px]">
                        <div className="flex items-center gap-1">
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>보유자산현황</span>
                        </div>
                        <RotateCw className="w-3 h-3 text-zinc-500" />
                      </div>
                    </div>

                    <div className="p-3 space-y-2 flex-1 overflow-hidden">
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-0.5">
                        <div className="text-[7.5px] text-zinc-500 font-bold">총평가금액</div>
                        <div className="text-base font-black text-zinc-900 font-mono">987,572 원</div>
                        <div className="text-[8px] text-rose-500 font-bold">+0.11% (+1,105원)</div>
                      </div>

                      <div className="p-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 space-y-1 text-[9px]">
                        <div className="flex justify-between font-black text-zinc-900">
                          <span>SPYM (S&P 500 ETF)</span>
                          <span>1 주 보유</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                          <span>평가금액 120,450원</span>
                          <span className="text-rose-600 font-bold">+0.41%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5 text-center text-[7.5px] font-bold text-zinc-500 bg-zinc-50 border-t border-zinc-100">
                      👉 하단 [보유자산]에서 내가 산 SPYM 주식을 확인합니다
                    </div>

                    <div className="bg-[#1e293b] text-white py-1.5 px-3 flex justify-between text-[7.5px]">
                      <span className="text-zinc-400">메뉴</span>
                      <span className="text-zinc-400">홈</span>
                      <span className="text-zinc-400">해외주식주문</span>
                      <span className="text-emerald-400 font-bold">보유자산</span>
                    </div>
                  </div>
                ) : scene === 2 ? (
                  /* 5-2: 보유 주식 목록에서 [팔기] 터치 */
                  <div className="flex flex-col justify-between h-full bg-[#f8fafc] animate-fadeIn">
                    <div className="bg-white border-b border-zinc-200">
                      <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-zinc-800 font-extrabold text-[11px]">
                        <span>보유종목 상세</span>
                        <X className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    </div>

                    <div className="p-3 space-y-2 flex-1 overflow-hidden">
                      <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-xs text-zinc-900">SPYM</span>
                          <span className="text-[7.5px] text-zinc-400 font-mono">미국 S&P 500 ETF</span>
                        </div>
                        <div className="flex justify-between text-[8.5px] font-mono">
                          <span className="text-zinc-500">보유수량</span>
                          <span className="font-black text-zinc-900">1 주</span>
                        </div>
                        <div className="flex justify-between text-[8.5px] font-mono">
                          <span className="text-zinc-500">현재가</span>
                          <span className="font-black text-rose-600">87.5400 USD</span>
                        </div>

                        <div className="pt-2 relative">
                          <div className="w-full py-2 rounded-xl bg-blue-600 text-white font-extrabold text-center text-[9px] shadow-xs">
                            팔기 (매도)
                          </div>
                          {s5Step === 1 && (
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

                    <div className="p-1.5 text-center text-[7.5px] font-bold text-zinc-500 bg-zinc-50 border-t border-zinc-100">
                      👉 보유 주식에서 [팔기(매도)]를 터치합니다
                    </div>
                  </div>
                ) : scene === 3 ? (
                  /* 5-3: 판매 수량 입력 후 매도 완료 */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                    {s5Step < 2 ? (
                      <div className="flex flex-col justify-between h-full">
                        <div className="p-2 space-y-1 border-b border-zinc-100">
                          <div className="font-extrabold text-[10.5px] text-zinc-900 truncate">SPYM (S&P 500 ETF)</div>
                          <div className="grid grid-cols-4 border-b border-zinc-200 text-center text-[8.5px] font-bold">
                            <span className="text-zinc-400 py-1">매수</span>
                            <span className="text-blue-600 border-b-2 border-blue-600 py-1 font-black">매도</span>
                            <span className="text-zinc-400 py-1">정정/취소</span>
                            <span className="text-zinc-400 py-1">주문체결</span>
                          </div>
                        </div>

                        <div className="p-3 flex-1 overflow-hidden space-y-2">
                          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 text-[8.5px]">
                            <div className="flex justify-between"><span>주문구분</span><span className="font-bold">지정가</span></div>
                            <div className="flex justify-between"><span>매도수량</span><span className="font-black text-blue-600">1 주</span></div>
                            <div className="flex justify-between"><span>주문가격</span><span className="font-mono font-bold">87.5400 USD</span></div>
                          </div>

                          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[8px] text-blue-800 leading-snug text-center">
                            파란색 매도 버튼을 누르면 즉시 판매 주문이 접수됩니다.
                          </div>
                        </div>

                        <div className="p-3 relative">
                          <div className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs text-center shadow-md">
                            매도 (팔기)
                          </div>
                          {s5Step === 1 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Sell Execution Complete */
                      <div className="flex flex-col justify-between h-full p-4 bg-white animate-fadeIn text-center my-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center mx-auto text-blue-600 shadow-sm mt-4">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>

                        <div className="space-y-1">
                          <h5 className="font-black text-sm text-zinc-900">주식 판매(매도) 체결 완료</h5>
                          <p className="text-[8px] text-zinc-500 leading-snug">
                            1주 판매 대금이 예수금으로 안전하게 복귀되었습니다.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px] font-mono font-bold text-zinc-800">
                          정산 예정 예수금: <span className="text-emerald-600 font-black">1,000,000 원</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 5-4: D+2 결제일 및 출금 안내 */
                  <div className="flex flex-col justify-between h-full p-4 bg-white animate-fadeIn text-center my-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-sm mt-3">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-black text-sm text-zinc-900">D+2 결제일 정산 및 출금</h5>
                      <p className="text-[8px] text-zinc-500 leading-snug">
                        주식을 판 돈은 실제 정산이 이루어지는 이틀 뒤(D+2)에 자유롭게 출금할 수 있습니다.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[9px] font-mono font-bold text-emerald-900">
                      출금 가능 예수금: <span className="text-emerald-700 font-black">1,000,000 원</span>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[8px] text-zinc-600">
                      💡 모바일 OTP 발급 시 즉시 원하시는 계좌로 이체/출금이 가능합니다.
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
