'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronLeft, 
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
  step: 1 | 2 | 3 | 4 | 5 | 6;
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
  const [s6Step, setS6Step] = useState(0);

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
            setS1Step(2); // pulse on gear
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS1();
            }, 2600);
          }, 800);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 4 items selected -> click Save
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS1Step(1); // pulse on Save
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS1Step(2); // save complete
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS1();
            }, 2600);
          }, 800);
        }, 800);
      } else {
        // Scene 3: Real home -> Menu -> Settings -> Toggle OFF
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS1Step(1); // pulse on menu
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS1Step(2); // all menu -> pulse on settings
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS1Step(3); // settings -> pulse on toggle
              timerId = setTimeout(() => {
                if (!isMounted) return;
                setS1Step(4); // toggle slide OFF
                timerId = setTimeout(() => {
                  if (!isMounted) return;
                  runS1();
                }, 2600);
              }, 700);
            }, 800);
          }, 800);
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
        // Scene 1: Home -> Menu -> Overseas Stock -> Service App
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1); // pulse on Menu
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS2Step(2); // pulse on Overseas Stock
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS2Step(3); // pulse on Service Application
              timerId = setTimeout(() => {
                if (!isMounted) return;
                runS2();
              }, 2600);
            }, 800);
          }, 800);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 해외주식거래이용신청 상세 화면 (100-1234-56-78 주식부엉, 이용중)
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1);
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS2();
          }, 2800);
        }, 800);
      } else {
        // Scene 3: 미국 실시간시세 무료 신청 (0.0 USD -> 신청 터치 -> 이용중)
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS2Step(1); // pulse on [신청]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS2Step(2); // converted to [이용중]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS2();
            }, 2600);
          }, 800);
        }, 800);
      }
    };

    runS2();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 3: 투자금 확인 & 종목 검색 (2:00~2:30)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 3) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS3 = () => {
      if (!isMounted) return;
      setS3Step(0);

      if (scene === 1) {
        // Scene 1: Home -> pulse on 보유자산 -> 100만 원 도넛차트 -> pulse on 해외주식주문
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS3Step(1); // pulse on 보유자산
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS3Step(2); // open asset view (1,000,000 KRW)
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS3Step(3); // pulse on 해외주식주문
              timerId = setTimeout(() => {
                if (!isMounted) return;
                runS3();
              }, 2800);
            }, 1000);
          }, 800);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 해외주식주문 초기화면(애플) -> pulse on 왼쪽 위 종목명
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS3Step(1); // pulse on 종목명
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS3();
          }, 2600);
        }, 800);
      } else {
        // Scene 3: 종목검색 창 -> 'spym' 타이핑 -> SPYM 카드 터치
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS3Step(1); // 'spym' typed
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS3Step(2); // pulse on SPYM card
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS3();
            }, 2600);
          }, 900);
        }, 800);
      }
    };

    runS3();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 4: 주식 구매 실습 (2:30~3:40)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 4) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS4 = () => {
      if (!isMounted) return;
      setS4Step(0);

      if (scene === 1) {
        // Scene 1: 호가창 확인 (위 파란 매도 / 아래 빨간 매수) & 지정가
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1);
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS4();
          }, 2800);
        }, 800);
      } else if (scene === 2) {
        // Scene 2: 수량 필드 터치 -> 수량입력기 키패드 1주 -> 초록 확인 버튼 터치
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
      } else if (scene === 3) {
        // Scene 3: 빨간 매수 버튼 터치 -> 주문확인 팝업 -> 매수확인 터치 -> 즉시 체결
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1); // pulse on [매수]
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS4Step(2); // modal popup (100-1234-56-78 주식부엉)
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS4Step(3); // pulse on [매수확인]
              timerId = setTimeout(() => {
                if (!isMounted) return;
                setS4Step(4); // switched to 주문체결 tab (체결 1주)
                timerId = setTimeout(() => {
                  if (!isMounted) return;
                  runS4();
                }, 2800);
              }, 800);
            }, 900);
          }, 800);
        }, 800);
      } else {
        // Scene 4: [정정/취소 실습] 낮은 가격 대기 주문 -> 정정 버튼 -> 즉시 체결
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS4Step(1); // unfilled queue (87.4800 USD 대기)
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS4Step(2); // pulse on [정정/취소]
            timerId = setTimeout(() => {
              if (!isMounted) return;
              setS4Step(3); // price modified & filled banner
              timerId = setTimeout(() => {
                if (!isMounted) return;
                runS4();
              }, 2800);
            }, 800);
          }, 900);
        }, 800);
      }
    };

    runS4();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 5: 보유자산 확인 & 통합증거금 (3:40~4:10)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 5) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS5 = () => {
      if (!isMounted) return;
      setS5Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setS5Step(1); // touch pulse
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS5Step(2); // detail card active
          timerId = setTimeout(() => {
            if (!isMounted) return;
            runS5();
          }, 2800);
        }, 800);
      }, 800);
    };

    runS5();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [step, scene]);

  // -------------------------------------------------------------
  // STEP 6: 주식 팔기 & 출금 안내 (4:10~4:50)
  // -------------------------------------------------------------
  useEffect(() => {
    if (step !== 6) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runS6 = () => {
      if (!isMounted) return;
      setS6Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setS6Step(1); // pulse on [매도]
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setS6Step(2); // modal popup
          timerId = setTimeout(() => {
            if (!isMounted) return;
            setS6Step(3); // filled result
            timerId = setTimeout(() => {
              if (!isMounted) return;
              runS6();
            }, 2800);
          }, 800);
        }, 900);
      }, 800);
    };

    runS6();
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
                  /* 1-2: Quick Menu Edit Screen (Video Frame Match) */
                  <div className="p-3 space-y-2 bg-white flex flex-col justify-between h-full animate-fadeIn">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-100 font-extrabold text-[11px] text-zinc-900">
                        <div className="flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-zinc-500" />
                          <span>퀵메뉴 설정</span>
                        </div>
                        <span className="text-[8px] text-zinc-400 font-normal">초기화</span>
                      </div>

                      <div className="grid grid-cols-5 gap-0.5 border-b border-zinc-100 pb-1 text-center text-[7.5px] font-bold">
                        <span className="text-zinc-400">국내주식</span>
                        <span className="text-[var(--accent-orange)] border-b border-[var(--accent-orange)] font-black">해외주식</span>
                        <span className="text-zinc-400">상품/연금</span>
                        <span className="text-emerald-600 font-black">뱅킹/대출</span>
                        <span className="text-zinc-400">모바일지점</span>
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
                  /* 1-3: Settings Toggle OFF */
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
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: 해외주식 서비스 신청 */}
            {/* ------------------------------------------------------------- */}
            {step === 2 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 2-1: All Menu -> Overseas Stock -> Service Application (Video Frame Match) */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                    <div className="border-b border-zinc-100">
                      <div className="px-3 pt-2 pb-1 flex items-center justify-end gap-2 text-zinc-800">
                        <Search className="w-3.5 h-3.5" /><Mic className="w-3.5 h-3.5" /><Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="grid grid-cols-5 gap-0.5 px-1 pb-1.5 text-center text-[7px] font-black border-b border-zinc-100">
                        <div className="flex flex-col items-center gap-0.5 text-zinc-600"><TrendingUp className="w-3.5 h-3.5" /><span>국내주식</span></div>
                        <div className="relative flex flex-col items-center gap-0.5 text-emerald-600 font-extrabold">
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
                        <div className="flex flex-col items-center gap-0.5 text-zinc-600"><div className="w-3.5 h-3.5 border border-zinc-500 rounded-xs grid grid-cols-2 gap-0.5 p-0.5" /><span>상품/연금</span></div>
                        <div className="flex flex-col items-center gap-0.5 text-zinc-600"><DollarSign className="w-3.5 h-3.5" /><span>뱅킹/대출</span></div>
                        <div className="flex flex-col items-center gap-0.5 text-zinc-600"><Zap className="w-3.5 h-3.5" /><span>모바일지점</span></div>
                      </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                      <div className="w-22 bg-zinc-100/90 border-r border-zinc-200 flex flex-col py-1 text-[7.5px] font-bold text-zinc-600 space-y-0.5">
                        <div className="p-1.5 pl-2 text-zinc-600">주식모으기(적립)</div>
                        <div className="relative p-1.5 bg-white text-blue-600 font-black border-l-2 border-blue-600">
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
                          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-300 font-black text-emerald-950 flex items-center justify-between">
                            <span>해외주식거래이용신청</span>
                            <ChevronRight className="w-3 h-3 text-emerald-700" />
                          </div>
                          <div className="p-1.5 text-zinc-600 font-medium">해외주식실시간시세신청</div>
                          <div className="p-1.5 text-zinc-600 font-medium">해외주식공지사항</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5 text-center text-[7.5px] font-bold text-zinc-500 bg-zinc-50 border-t border-zinc-100">
                      [해외주식] ➔ [서비스신청]으로 이동합니다
                    </div>
                  </div>
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
                  /* 3-1: Asset Overview (1,000,000 KRW & Teal Donut Chart) */
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
                          <span className="text-base font-black text-zinc-900 font-mono">1,000,000</span>
                        </div>
                        <div className="space-y-1 text-[7.5px] text-zinc-600 border-t border-zinc-100 pt-1.5">
                          <div className="flex justify-between">
                            <span>총평가손익 <span className="text-zinc-400">0.00%</span></span>
                            <span className="font-mono font-bold">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>출금가능금액 <span className="text-zinc-400">금일</span></span>
                            <span className="font-mono font-bold text-zinc-900">1,000,000</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-col items-center justify-center space-y-1">
                        <div className="relative w-24 h-24 rounded-full border-[10px] border-teal-500 flex flex-col items-center justify-center bg-white">
                          <span className="text-[7.5px] text-zinc-400 font-bold">수익률</span>
                          <span className="text-xs font-black text-zinc-900 font-mono">0.00</span>
                          <span className="text-[6.5px] text-teal-600 font-black mt-0.5">예수금 100%</span>
                        </div>
                        <div className="text-[7.5px] text-zinc-400">종합매매 계좌에 100만 원 입금 완료</div>
                      </div>
                    </div>

                    {/* Bottom Bar with Pulse on 해외주식주문 */}
                    <div className="bg-[#1e293b] text-white border-t border-zinc-700 py-1.5 px-2 flex items-center justify-between text-[7.5px]">
                      <div className="flex flex-col items-center px-2 text-zinc-400 font-bold"><Menu className="w-3.5 h-3.5" /><span className="text-[6.5px]">메뉴</span></div>
                      <div className="flex flex-col items-center px-2 text-zinc-300 font-bold"><span>홈</span></div>
                      <div className="relative">
                        <div className="flex flex-col items-center px-2 py-0.5 rounded-lg bg-[var(--accent-orange)] text-white font-bold">
                          <span>해외주식주문</span>
                        </div>
                        {s3Step === 3 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-6 w-6">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                              <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center px-2 text-emerald-400 font-bold"><span>보유자산</span></div>
                      <div className="flex flex-col items-center px-2 text-zinc-300 font-bold"><span>실시간환전</span></div>
                    </div>
                  </div>
                ) : scene === 2 ? (
                  /* 3-2: 해외주식주문 초기화면 -> pulse on top-left stock name */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                    <div className="p-2 space-y-1.5 border-b border-zinc-100">
                      <div className="flex items-center justify-between">
                        <div className="relative">
                          <div className="flex items-center gap-1 font-extrabold text-sm text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-200">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>애플</span>
                            <span className="text-[8px] text-zinc-400">▾</span>
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
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Heart className="w-3.5 h-3.5" /><BarChart2 className="w-3.5 h-3.5" /><MoreHorizontal className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-0.5">
                        <span>미국 나스닥 AAPL</span>
                        <span className="bg-emerald-50 text-emerald-600 px-1 py-0.2 rounded font-bold">무료실시간</span>
                      </div>
                      <div className="text-xl font-black text-blue-600 font-mono">295.6100 <span className="text-[10px] text-zinc-500">USD</span></div>
                    </div>

                    <div className="p-3 text-center space-y-1">
                      <div className="text-[9px] font-black text-zinc-700">👉 왼쪽 위 종목 이름 [애플 ▾]을 터치하세요</div>
                      <div className="text-[7.5px] text-zinc-400">S&P 500 종목인 SPYM을 검색하기 위해 종목검색 창을 엽니다.</div>
                    </div>

                    <div className="bg-[#1e293b] text-white py-1.5 px-3 flex justify-between text-[7.5px]">
                      <span className="text-zinc-400">메뉴</span>
                      <span className="text-zinc-400">홈</span>
                      <span className="text-emerald-400 font-bold">해외주식주문</span>
                      <span className="text-zinc-400">보유자산</span>
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
            {/* STEP 4: 주식 구매 실습 (SPYM) */}
            {/* ------------------------------------------------------------- */}
            {step === 4 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {scene === 1 ? (
                  /* 4-1: SPYM Orderbook (Blue Asks / Red Bids) */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                    <div className="p-2 space-y-1 border-b border-zinc-100">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-[10.5px] text-zinc-900 truncate max-w-[180px]">
                          STATE STREET SPDR PORTFOLI...
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400"><Heart className="w-3 h-3" /><BarChart2 className="w-3 h-3" /></div>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-black text-blue-600 font-mono">87.5200 <span className="text-[8.5px] text-zinc-500">USD</span></span>
                        <span className="text-[7.5px] text-blue-500 font-bold">▼ 0.3700 (-0.42%)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 border-b border-zinc-200 text-center text-[8.5px] font-bold">
                      <span className="text-rose-600 border-b-2 border-rose-600 py-1 font-black">매수</span>
                      <span className="text-zinc-400 py-1">매도</span>
                      <span className="text-zinc-400 py-1">정정/취소</span>
                      <span className="text-zinc-400 py-1">주문체결</span>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                      {/* Orderbook */}
                      <div className="w-24 border-r border-zinc-200 flex flex-col justify-between font-mono text-[7px] py-0.5">
                        <div className="bg-blue-50/80 p-0.5 text-blue-700 flex justify-between"><span>87.5500</span><span>3</span></div>
                        <div className="bg-blue-50/80 p-0.5 text-blue-700 flex justify-between"><span>87.5400</span><span>2,210</span></div>
                        <div className="bg-blue-50/80 p-0.5 text-blue-700 flex justify-between"><span>87.5300</span><span>2,200</span></div>
                        <div className="bg-blue-100 p-0.5 text-blue-900 font-black flex justify-between border border-blue-300"><span>87.5200</span><span>57</span></div>
                        <div className="bg-rose-50/80 p-0.5 text-rose-700 flex justify-between"><span>87.5100</span><span>2,209</span></div>
                        <div className="bg-rose-50/80 p-0.5 text-rose-700 flex justify-between"><span>87.5000</span><span>2,200</span></div>
                      </div>

                      {/* Order Form */}
                      <div className="flex-1 p-2 space-y-1.5 text-[8px]">
                        <div className="flex gap-1">
                          <div className="flex-1 p-1 rounded-lg border border-zinc-200 bg-zinc-50 font-black text-center text-zinc-800">지정가 ▾</div>
                          <div className="flex-1 p-1 rounded-lg border border-zinc-100 text-zinc-400 text-center">시장가</div>
                        </div>

                        <div className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 flex justify-between items-center font-bold">
                          <span className="text-zinc-500">수량</span>
                          <span className="font-mono font-black text-zinc-900 text-[10px]">1 주</span>
                        </div>

                        <div className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 flex justify-between items-center font-mono">
                          <span className="text-zinc-500 text-[7px]">가격(USD)</span>
                          <span className="font-black text-zinc-900">87.5200</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5 text-center text-[7.5px] font-bold text-zinc-500 bg-zinc-50 border-t border-zinc-100">
                      호가창(파란 매도 / 빨간 매수) 확인 및 지정가 설정
                    </div>
                  </div>
                ) : scene === 2 ? (
                  /* 4-2: 수량입력기 Keypad Sheet */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                    <div className="p-2.5 space-y-1.5 border-b border-zinc-100">
                      <div className="font-extrabold text-xs text-zinc-900">수량입력기</div>
                      <div className="space-y-1 text-[8px]">
                        <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 flex justify-between">
                          <span className="text-zinc-500">가격</span>
                          <span className="font-mono font-bold">87.5200 USD</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-300 flex justify-between items-center">
                          <span className="text-zinc-700 font-bold">수량</span>
                          <span className="font-mono font-black text-sm text-zinc-900">1 주</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 flex justify-between text-[7.5px]">
                          <span className="text-zinc-400">환산금액</span>
                          <span className="font-mono font-black text-emerald-700">134,343 KRW</span>
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
                        <span className="p-1.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-black">통합증거금</span>
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
                ) : scene === 3 ? (
                  /* 4-3: Buy Confirmation Popup -> Instant Fill */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn overflow-hidden">
                    {s4Step < 4 ? (
                      <div className="flex flex-col justify-between h-full p-3 bg-slate-50">
                        <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-lg space-y-2 text-[8.5px]">
                          <div className="font-black text-[11px] text-zinc-900 border-b border-zinc-100 pb-1.5">
                            해외주식 <span className="text-rose-600">매수</span> 주문확인
                          </div>
                          <div className="text-[7.5px] text-zinc-500 font-bold">
                            (SPYM) STATE STREET SPDR PORTFOLIO S&P 500
                          </div>

                          <div className="space-y-1 font-mono pt-1 text-zinc-700">
                            <div className="flex justify-between"><span className="text-zinc-400">계좌번호</span><span className="font-bold">100-1234-56-78</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">계좌명</span><span>주식부엉</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">주문구분</span><span className="text-rose-600 font-bold">현금매수</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">주문수량</span><span className="font-black text-zinc-900">1 주</span></div>
                            <div className="flex justify-between"><span className="text-zinc-400">주문가격</span><span className="font-bold text-rose-600">87.5200 USD</span></div>
                            <div className="flex justify-between border-t border-zinc-100 pt-1 font-black text-zinc-900">
                              <span>합계</span><span>87.5200 USD</span>
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
                          <div className="font-extrabold text-[10.5px] text-zinc-900 truncate">STATE STREET SPDR PORTFOLI...</div>
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
                              <span>STATE STREET SPDR (SPYM)</span>
                              <span className="text-rose-600">매수 (체결완료)</span>
                            </div>
                            <div className="flex justify-between text-[7.5px] text-zinc-500">
                              <span>지정가 87.5200 USD</span>
                              <span>주문 1 / 체결 1주</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                            <div className="text-[9px] font-black text-emerald-900">🎉 통합증거금 즉시 구매 체결 완료!</div>
                            <div className="text-[7.5px] text-emerald-700">달러 환전 없이 원화로 즉시 결제되었습니다.</div>
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
                  /* 4-4: 미체결 대기 & 정정 실습 */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
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
                        <span>미체결 주문내역 (1건)</span>
                        <span className="text-rose-500 font-bold">가격 대기중</span>
                      </div>

                      <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1 text-[8.5px] font-mono">
                        <div className="flex justify-between font-black text-zinc-900">
                          <span>SPYM (지정가)</span>
                          <span className="text-rose-600">미체결 1주</span>
                        </div>
                        <div className="flex justify-between text-[7.5px] text-zinc-500">
                          <span>주문가 87.4800 USD</span>
                          <span>현재가 87.5200 USD</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-0.5">
                        <div className="text-[8.5px] font-black text-blue-900">💡 정정 기능 안내</div>
                        <div className="text-[7px] text-blue-700 leading-snug">
                          가격을 높게 정정하더라도 시장의 가장 유리한 가격으로 자동 체결됩니다.
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="w-full py-2 rounded-xl bg-emerald-500 text-white font-extrabold text-[9px] text-center shadow-xs">
                        가격 정정하기 ➔ 즉시 체결
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 5: 보유자산 확인 & 통합증거금 */}
            {/* ------------------------------------------------------------- */}
            {step === 5 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
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
                        <span>SPYM (S&P 500)</span>
                        <span>2 주 보유</span>
                      </div>
                      <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                        <span>평가금액 269,822원</span>
                        <span className="text-rose-600 font-bold">+0.41%</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-[8px] leading-snug text-amber-900">
                      <div className="font-bold flex items-center gap-1">
                        <span>💡</span><span>통합증거금 5% 가계산 정산 안내</span>
                      </div>
                      <p className="text-[7.5px] text-amber-800">
                        환율 변동 대비로 5% 정도 임시 묶어둔 것이며, 이틀 뒤 결제일에 정확한 환율로 정산 후 남은 돈은 자동 환급됩니다.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1e293b] text-white py-1.5 px-3 flex justify-between text-[7.5px]">
                    <span className="text-zinc-400">메뉴</span>
                    <span className="text-zinc-400">홈</span>
                    <span className="text-zinc-400">해외주식주문</span>
                    <span className="text-emerald-400 font-bold">보유자산</span>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 6: 주식 팔기 & 출금 안내 */}
            {/* ------------------------------------------------------------- */}
            {step === 6 && (
              <div className="flex flex-col h-full justify-between -mx-3 -mt-1 -mb-2 bg-slate-50">
                {s6Step < 3 ? (
                  /* Sell Order Form */
                  <div className="flex flex-col justify-between h-full bg-white animate-fadeIn">
                    <div className="p-2 space-y-1 border-b border-zinc-100">
                      <div className="font-extrabold text-[10.5px] text-zinc-900 truncate">STATE STREET SPDR PORTFOLI...</div>
                      <div className="grid grid-cols-4 border-b border-zinc-200 text-center text-[8.5px] font-bold">
                        <span className="text-zinc-400 py-1">매수</span>
                        <span className="text-blue-600 border-b-2 border-blue-600 py-1 font-black">매도</span>
                        <span className="text-zinc-400 py-1">정정/취소</span>
                        <span className="text-zinc-400 py-1">주문체결</span>
                      </div>
                    </div>

                    <div className="p-3 flex-1 overflow-hidden space-y-2">
                      <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 text-[8.5px]">
                        <div className="flex justify-between"><span>주문구분</span><span className="font-bold">지정가</span></div>
                        <div className="flex justify-between"><span>매도수량</span><span className="font-black text-blue-600">2 주</span></div>
                        <div className="flex justify-between"><span>주문가격</span><span className="font-mono font-bold">87.5400 USD</span></div>
                      </div>

                      <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-[8px] text-zinc-500 leading-snug">
                        ※ 주식을 판 돈은 실제 정산이 이루어지는 이틀 뒤(D+2)에 출금 가능합니다.
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs text-center shadow-md">
                        매도 (팔기)
                      </div>
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
                        2주 판매 대금이 예수금으로 안전하게 복귀되었습니다.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px] font-mono font-bold text-zinc-800">
                      출금 가능 예수금: <span className="text-emerald-600 font-black">999,806 원</span>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[8px] text-emerald-800 font-bold">
                      🎉 100만 원 거래 완료로 한도제한계좌 익영업일 자동 해제 대상입니다.
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
