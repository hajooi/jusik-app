'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronLeft, 
  ChevronDown, 
  Search, 
  Sparkles, 
  ChevronRight, 
  X,
  Building,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface AdvisoryMotionSimulatorProps {
  currentScene?: 1 | 2 | 3 | 4;
  onSceneChange?: (scene: 1 | 2 | 3 | 4) => void;
}

export default function AdvisoryMotionSimulator({
  currentScene,
  onSceneChange
}: AdvisoryMotionSimulatorProps) {
  const [internalScene, setInternalScene] = useState<1 | 2 | 3 | 4>(1);
  const activeScene = currentScene ?? internalScene;

  // Scene-specific animation steps
  const [scene1Step, setScene1Step] = useState(0); // 0: landing, 1: pulse join btn, 2: survey screen, 3: survey start pulse
  const [scene2Step, setScene2Step] = useState(0); // 0: home, 1: pulse find advisory btn, 2: list scroll, 3: pulse aurora, 4: aurora selected
  const [scene3Step, setScene3Step] = useState(0); // 0: aurora detail, 1: pulse on MP, 2: MP active, 3: pulse invest btn
  const [scene4Step, setScene4Step] = useState(0); // 0: modal DB, 1: pulse confirm, 2: complete 0 krw

  const handleSceneSelect = (s: 1 | 2 | 3 | 4) => {
    setInternalScene(s);
    if (onSceneChange) onSceneChange(s);
  };

  // Scene 1 Auto Loop (Landing & Survey)
  useEffect(() => {
    if (activeScene !== 1) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene1 = () => {
      if (!isMounted) return;
      setScene1Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene1Step(1); // Pulse on [1분 투자로 진짜 자산관리 가입하기]

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene1Step(2); // Show Survey screen (IMG_4314)

          timerId = setTimeout(() => {
            if (!isMounted) return;
            setScene1Step(3); // Pulse on [투자성향 분석 시작하기]

            timerId = setTimeout(() => {
              if (!isMounted) return;
              runScene1();
            }, 2600);
          }, 800);
        }, 600);
      }, 1000);
    };

    runScene1();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 2 Auto Loop (Find Advisory & Select Aurora)
  useEffect(() => {
    if (activeScene !== 2) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene2 = () => {
      if (!isMounted) return;
      setScene2Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene2Step(1); // Pulse on [자문사 찾기] button on home

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene2Step(2); // Show Advisory List & scroll

          timerId = setTimeout(() => {
            if (!isMounted) return;
            setScene2Step(3); // Pulse on Aurora card

            timerId = setTimeout(() => {
              if (!isMounted) return;
              setScene2Step(4); // Aurora selected

              timerId = setTimeout(() => {
                if (!isMounted) return;
                runScene2();
              }, 2500);
            }, 600);
          }, 900);
        }, 600);
      }, 900);
    };

    runScene2();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 3 Auto Loop (Aurora MP Detail: Select MP & Invest)
  useEffect(() => {
    if (activeScene !== 3) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene3 = () => {
      if (!isMounted) return;
      setScene3Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene3Step(1); // Pulse on [오로라x주식부엉 자율형MP]

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene3Step(2); // MP active highlight

          timerId = setTimeout(() => {
            if (!isMounted) return;
            setScene3Step(3); // Pulse on [포트폴리오 투자하기]

            timerId = setTimeout(() => {
              if (!isMounted) return;
              runScene3();
            }, 2600);
          }, 700);
        }, 800);
      }, 700);
    };

    runScene3();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 4 Auto Loop (Connect DB Securities Account & Done)
  useEffect(() => {
    if (activeScene !== 4) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene4 = () => {
      if (!isMounted) return;
      setScene4Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene4Step(1); // Pulse confirm button

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene4Step(2); // Complete screen with 0 KRW MP

          timerId = setTimeout(() => {
            if (!isMounted) return;
            runScene4();
          }, 3200);
        }, 700);
      }, 1000);
    };

    runScene4();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  const sceneTitles = [
    { num: 1, label: '1. 앱가입' },
    { num: 2, label: '2. 자문사' },
    { num: 3, label: '3. 제휴MP' },
    { num: 4, label: '4. 연결완료' }
  ];

  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-surface)]/90 text-[var(--text-primary)] p-4 sm:p-6 space-y-5 shadow-sm backdrop-blur-xl transition-all">
      {/* Centered Glassmorphic 4-Scene Switcher */}
      <div className="flex justify-center">
        <div className="relative grid grid-cols-4 p-1 rounded-2xl bg-[var(--card-hover)] border border-[var(--border-color)] shadow-2xs w-full max-w-[420px] select-none">
          {/* Animated Sliding Pill Surface */}
          <div 
            className="absolute top-1 bottom-1 rounded-xl bg-[var(--accent-orange)] text-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            style={{
              width: 'calc(25% - 2px)',
              transform: `translateX(${(activeScene - 1) * 100}%)`,
            }}
          />

          {sceneTitles.map((st) => (
            <button
              key={st.num}
              type="button"
              onClick={() => handleSceneSelect(st.num as 1 | 2 | 3 | 4)}
              className={`relative z-10 py-2 text-center text-xs sm:text-sm font-extrabold transition-colors duration-200 whitespace-nowrap px-1 ${
                activeScene === st.num ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Titanium iPhone 16 Pro Smartphone Device Frame */}
      <div className="relative mx-auto max-w-[310px] w-full rounded-[2.8rem] p-2.5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-zinc-600/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Screen Bezel Frame */}
        <div className="rounded-[2.4rem] bg-black p-1">
          {/* Dynamic Island Pill */}
          <div className="relative pt-2 pb-1.5 bg-white rounded-t-[2.2rem]">
            <div className="w-24 h-5 bg-black rounded-full mx-auto flex items-center justify-between px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
              <div className="w-2 h-2 rounded-full bg-blue-950/60" />
            </div>
          </div>

          {/* Smartphone Screen Inner */}
          <div className="bg-white text-zinc-900 rounded-b-[2.2rem] overflow-hidden h-[450px] flex flex-col justify-between px-3 pb-3 pt-1 font-sans text-xs relative select-none shadow-inner">
            
            {/* SCENE 1: 앱 첫 화면(IMG_4313) -> 투자성향 분석(IMG_4314) */}
            {activeScene === 1 && (
              <div className="flex flex-col h-full justify-between pt-1">
                {scene1Step < 2 ? (
                  /* Landing Screen (IMG_4313) */
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <div className="text-[11px] text-zinc-500 font-medium">내가 자는 동안에도 돈이 불어나는</div>
                      <h5 className="text-base font-black text-zinc-900 leading-tight">
                        진짜자산관리<br />
                        <span className="text-indigo-600 font-extrabold">DB증권 자문사 서비스</span>
                      </h5>
                    </div>

                    <div className="py-6 flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
                        <UserCheck className="w-10 h-10" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {/* Join CTA Button */}
                      <div className="relative">
                        <div className={`p-3 rounded-2xl bg-indigo-600 text-white flex items-center justify-between shadow-md transition-all ${
                          scene1Step === 1 ? 'scale-[0.98] bg-indigo-700' : ''
                        }`}>
                          <div>
                            <div className="text-[8px] opacity-80">1분 투자로</div>
                            <div className="font-extrabold text-[11px]">진짜 자산관리 가입하기</div>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-80" />
                        </div>

                        {scene1Step === 1 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-5 w-5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                              <span className="relative inline-flex rounded-full h-5 w-5 bg-white/70 border border-indigo-600 shadow-sm" />
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-center text-[9px] text-zinc-400">
                        이미 계정이 있으신가요? <span className="text-indigo-600 font-bold underline">로그인하기</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Survey Screen (IMG_4314) */
                  <div className="space-y-4 pt-1 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-zinc-600">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="font-bold text-[10px]">투자성향 분석</span>
                      </div>

                      <div className="text-center py-6 space-y-1">
                        <h5 className="text-base font-black text-zinc-900">
                          나의 <span className="text-indigo-600">투자성향</span>을<br />
                          알아볼까요?
                        </h5>
                        <p className="text-[9px] text-zinc-400">간단한 문항으로 성향을 분석합니다</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px] text-zinc-500 space-y-1">
                        <div className="font-bold text-rose-500">유의사항</div>
                        <div className="text-[8px] leading-relaxed">
                          - 고객님께 적합한 투자 권유를 위해 투자성향분석이 필요합니다.
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 relative">
                      <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs bg-indigo-600 shadow-md transition-all ${
                        scene1Step === 3 ? 'scale-[0.98] bg-indigo-700' : ''
                      }`}>
                        투자성향 분석 시작하기
                      </div>

                      {scene1Step === 3 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="relative flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-white/70 border border-indigo-600 shadow-sm" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SCENE 2: 자문사 찾기 & 오로라투자자문 선택 */}
            {activeScene === 2 && (
              <div className="flex flex-col h-full justify-between">
                {scene2Step < 2 ? (
                  /* Home find advisory button (1.27.56) */
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <h5 className="text-base font-black text-zinc-900 leading-snug">
                        주식부엉<span className="text-zinc-500 font-medium">님의</span><br />
                        진짜자산관리 시작을 축하합니다.
                      </h5>
                    </div>

                    <div className="relative pt-4">
                      <div className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                        scene2Step === 1 
                          ? 'border-indigo-600 bg-indigo-50/90 shadow-md scale-[0.98]' 
                          : 'border-zinc-200 bg-white shadow-2xs'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-[9px] text-zinc-400 font-medium">자문사 소개로 오셨나요?</div>
                            <div className="font-black text-xs text-zinc-900 flex items-center gap-1">
                              <span>자문사 찾기</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        </div>
                      </div>

                      {scene2Step === 1 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="relative flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-80" />
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-600/70 border border-white shadow-sm" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Advisory List & Select Aurora (1.28.33) */
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1.5 text-zinc-800">
                        <span className="font-extrabold text-sm">투자하기</span>
                        <Search className="w-4 h-4 text-zinc-500" />
                      </div>

                      <div className="grid grid-cols-2 border-b border-zinc-200 text-center text-[11px] font-bold">
                        <div className="py-1 text-zinc-400">포트폴리오</div>
                        <div className="py-1 text-zinc-900 border-b-2 border-zinc-900 font-extrabold">자문사</div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="p-2 rounded-xl border border-zinc-200 bg-white opacity-50">
                          <div className="font-bold text-[10px] text-zinc-800">체슬리투자자문</div>
                        </div>

                        {/* TARGET: 오로라투자자문 */}
                        <div className="relative">
                          <div className={`p-2.5 rounded-xl border-2 transition-all duration-300 ${
                            scene2Step >= 4 
                              ? 'border-indigo-500 bg-indigo-50 shadow-xs' 
                              : 'border-zinc-200 bg-white'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="font-extrabold text-[11px] text-zinc-900 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                                <span>오로라투자자문</span>
                              </div>
                              {scene2Step >= 4 && (
                                <span className="text-[8px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded shrink-0">선택됨</span>
                              )}
                            </div>
                            <div className="text-[9px] text-zinc-500 mt-1">
                              밤 하늘 한줄기 빛과 같은 당신의 투자 동반자
                            </div>
                          </div>

                          {scene2Step === 3 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-80" />
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-500/70 border border-white shadow-sm" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-center text-[10px] font-bold text-indigo-600">
                      자문사 목록에서 [오로라투자자문] 선택
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SCENE 3: 오로라 운용포트폴리오 -> 오로라x주식부엉 자율형MP 선택 & 투자하기 */}
            {activeScene === 3 && (
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Aurora Header Banner */}
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3 text-white">
                    <div className="font-extrabold text-xs">오로라투자자문</div>
                    <div className="text-[9px] text-cyan-300">밤 하늘 한줄기 빛과 같은 당신의 동반자</div>
                  </div>

                  {/* Tabs */}
                  <div className="grid grid-cols-2 border-b border-zinc-200 text-center text-[11px] font-bold mt-2">
                    <div className="py-1.5 text-zinc-400">자문사정보</div>
                    <div className="py-1.5 text-zinc-900 border-b-2 border-zinc-900 font-extrabold">운용포트폴리오</div>
                  </div>

                  {/* Portfolio List */}
                  <div className="space-y-2 pt-2">
                    {/* Dummy MP */}
                    <div className="p-2 rounded-xl border border-zinc-200 bg-white opacity-60 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-[10px] text-zinc-800">오로라화이트</div>
                        <div className="text-[8px] text-zinc-400">글로벌 해외주식(ETF)</div>
                      </div>
                      <span className="text-[9px] text-rose-500 font-bold">1.55%</span>
                    </div>

                    {/* TARGET MP: 오로라x주식부엉 자율형MP (줄바꿈 방지) */}
                    <div className="relative">
                      <div className={`p-2.5 rounded-xl border-2 transition-all duration-300 ${
                        scene3Step >= 2 
                          ? 'border-emerald-500 bg-emerald-50 shadow-xs' 
                          : 'border-zinc-200 bg-white'
                      }`}>
                        <div className="flex items-center justify-between gap-1">
                          <div className="font-extrabold text-[10px] text-zinc-900 truncate whitespace-nowrap">
                            ⭐ 오로라x주식부엉 자율형MP
                          </div>
                          <span className="text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                            수수료 우대
                          </span>
                        </div>
                        <div className="text-[8px] text-zinc-500 mt-1 whitespace-nowrap">
                          수수료 평생 우대 자율 매매 전용 포트폴리오
                        </div>
                      </div>

                      {/* Micro Touch Ring */}
                      {scene3Step === 1 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="relative flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500/70 border border-white shadow-sm" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-2 relative">
                  <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs shadow-md transition-all duration-300 ${
                    scene3Step >= 3 ? 'bg-emerald-600 scale-[0.98]' : 'bg-emerald-500'
                  }`}>
                    포트폴리오 투자하기
                  </div>

                  {scene3Step === 3 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-white/70 border border-emerald-600 shadow-sm" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SCENE 4: 증권사 DB증권 선택 & 0원 연결 완료 (줄바꿈 방지) */}
            {activeScene === 4 && (
              <div className="flex flex-col h-full justify-between">
                {scene4Step < 2 ? (
                  /* Modal Step */
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                      <span className="font-extrabold text-xs text-zinc-900">증권사 선택</span>
                      <X className="w-4 h-4 text-zinc-400" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[9px] text-zinc-500 font-bold">연결 증권사</div>
                      <div className="p-2.5 rounded-xl border-2 border-indigo-500 bg-indigo-50 flex items-center justify-between">
                        <span className="font-extrabold text-[11px] text-indigo-950">DB증권</span>
                        <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[9px] text-zinc-500 font-bold">개설 계좌 등록</div>
                      <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-0.5">
                        <div className="font-bold text-[10px] text-zinc-900 whitespace-nowrap">종합매매 [FA자문사]</div>
                        <div className="font-mono text-[9px] text-zinc-500 whitespace-nowrap">100-12-3456-78 (등록: 0원)</div>
                      </div>
                    </div>

                    <div className="pt-2 relative">
                      <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 ${
                        scene4Step >= 1 ? 'bg-indigo-600 shadow-md scale-[0.98]' : 'bg-indigo-500'
                      }`}>
                        확인
                      </div>

                      {scene4Step === 1 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="relative flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-white/70 border border-indigo-600 shadow-sm" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Completed State */
                  <div className="space-y-3 pt-1">
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-3.5 text-white space-y-1 shadow-sm">
                      <div className="text-[9px] opacity-80">내 자산 현황</div>
                      <div className="text-xl font-black">0원</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                          오로라투자자문
                        </span>
                        <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> 연동 완료
                        </span>
                      </div>
                      <div className="font-extrabold text-[11px] text-zinc-900 whitespace-nowrap truncate">
                        오로라x주식부엉 자율형MP
                      </div>
                      <div className="text-[10px] text-zinc-600 font-bold">
                        0 원
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block whitespace-nowrap">
                        🎉 수수료 평생 우대 연동 성공!
                      </span>
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
