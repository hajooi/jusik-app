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
  ShieldCheck
} from 'lucide-react';

interface AccountOpenMotionSimulatorProps {
  currentScene?: 1 | 2 | 3 | 4;
  onSceneChange?: (scene: 1 | 2 | 3 | 4) => void;
}

export default function AccountOpenMotionSimulator({
  currentScene,
  onSceneChange
}: AccountOpenMotionSimulatorProps) {
  const [internalScene, setInternalScene] = useState<1 | 2 | 3 | 4>(1);
  const activeScene = currentScene ?? internalScene;

  // Animation step states
  const [scene1Step, setScene1Step] = useState(0); // 0: initial, 1: pulse on non-face-to-face button, 2: selected
  const [scene2Step, setScene2Step] = useState(0); // 0: top list, 1: scroll down, 2: pulse FA radio, 3: FA active, 4: pulse confirm
  const [scene3Step, setScene3Step] = useState(0); // 0: empty inputs, 1: branch filled, 2: manager filled, 3: pulse confirm
  const [scene4Step, setScene4Step] = useState(0); // 0: loading, 1: success card reveal, 2: pulse next button

  const handleSceneSelect = (s: 1 | 2 | 3 | 4) => {
    setInternalScene(s);
    if (onSceneChange) onSceneChange(s);
  };

  // Scene 1 Auto Loop
  useEffect(() => {
    if (activeScene !== 1) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene1 = () => {
      if (!isMounted) return;
      setScene1Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene1Step(1); // Pulse touch ring

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene1Step(2); // Selected highlight

          timerId = setTimeout(() => {
            if (!isMounted) return;
            runScene1();
          }, 2400);
        }, 500);
      }, 800);
    };

    runScene1();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 2 Auto Loop
  useEffect(() => {
    if (activeScene !== 2) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene2 = () => {
      if (!isMounted) return;
      setScene2Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene2Step(1); // Scroll down

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene2Step(2); // Touch pulse on FA Account

          timerId = setTimeout(() => {
            if (!isMounted) return;
            setScene2Step(3); // FA Account checked

            timerId = setTimeout(() => {
              if (!isMounted) return;
              setScene2Step(4); // Pulse on confirm button

              timerId = setTimeout(() => {
                if (!isMounted) return;
                runScene2();
              }, 2600);
            }, 700);
          }, 500);
        }, 800);
      }, 700);
    };

    runScene2();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 3 Auto Loop
  useEffect(() => {
    if (activeScene !== 3) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene3 = () => {
      if (!isMounted) return;
      setScene3Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene3Step(1); // Typing branch

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene3Step(2); // Typing manager

          timerId = setTimeout(() => {
            if (!isMounted) return;
            setScene3Step(3); // Pulse confirm button

            timerId = setTimeout(() => {
              if (!isMounted) return;
              runScene3();
            }, 2600);
          }, 700);
        }, 700);
      }, 800);
    };

    runScene3();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 4 Auto Loop
  useEffect(() => {
    if (activeScene !== 4) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene4 = () => {
      if (!isMounted) return;
      setScene4Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene4Step(1); // Reveal success card

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene4Step(2); // Pulse on done button

          timerId = setTimeout(() => {
            if (!isMounted) return;
            runScene4();
          }, 3200);
        }, 800);
      }, 600);
    };

    runScene4();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  const sceneTitles = [
    { num: 1, label: '1. 개설시작' },
    { num: 2, label: '2. 계좌선택' },
    { num: 3, label: '3. 관리점' },
    { num: 4, label: '4. 완료' }
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
            
            {/* SCENE 1: 앱 실행 -> 비대면 계좌개설 메뉴 선택 */}
            {activeScene === 1 && (
              <div className="flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                  <span className="font-extrabold text-sm text-zinc-900">DB증권</span>
                  <span className="text-[10px] text-zinc-400 font-medium">로그인 &gt;</span>
                </div>

                {/* Main Hero Card */}
                <div className="space-y-2.5 my-auto">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-3.5 text-white shadow-md">
                    <div className="text-[10px] font-medium opacity-90">처음 오셨나요?</div>
                    <div className="text-sm font-extrabold mt-0.5 leading-snug">
                      영업점 방문 없이<br />간편하게 계좌 개설
                    </div>
                  </div>

                  {/* Target Button: 비대면 계좌개설 */}
                  <div className="relative">
                    <div className={`p-3 rounded-2xl border-2 transition-all duration-300 ${
                      scene1Step >= 1 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[0.98]' 
                        : 'border-zinc-200 bg-zinc-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                            DB
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-zinc-900">비대면 계좌개설</div>
                            <div className="text-[9px] text-zinc-500">신분증 준비 후 3분 만에 완료</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>

                    {/* Micro Touch Ring Pulse */}
                    {scene1Step === 1 && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <span className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500/60 border border-white shadow-sm" />
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/60 text-[9px] text-zinc-400">
                    간편 인증 및 약관 확인 절차
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] font-bold text-emerald-600">
                  {scene1Step >= 2 ? '[비대면 계좌개설] 선택 완료!' : '메뉴에서 [비대면 계좌개설] 터치'}
                </div>
              </div>
            )}

            {/* SCENE 2: 계좌 종류 선택 (맨 아래로 스크롤하여 FA종합매매계좌 선택) */}
            {activeScene === 2 && (
              <div className="flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100 text-zinc-700">
                  <div className="flex items-center gap-1 font-bold text-[11px]">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>개설 계좌 종류 선택</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">2 / 5</span>
                </div>

                {/* Account List Container (Simulated Scroll) */}
                <div className="relative flex-1 overflow-hidden py-1">
                  <div 
                    className="space-y-2 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={{ transform: scene2Step >= 1 ? 'translateY(-130px)' : 'translateY(0px)' }}
                  >
                    {/* Item 1 */}
                    <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-center justify-between opacity-60">
                      <div>
                        <div className="font-bold text-[11px] text-zinc-800">종합매매계좌</div>
                        <div className="text-[9px] text-zinc-500">국내주식, 채권 거래</div>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-zinc-300" />
                    </div>

                    {/* Item 2 */}
                    <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-center justify-between opacity-60">
                      <div>
                        <div className="font-bold text-[11px] text-zinc-800">CMA 계좌</div>
                        <div className="text-[9px] text-zinc-500">수시입출금 및 이자 혜택</div>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-zinc-300" />
                    </div>

                    {/* Item 3 */}
                    <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-center justify-between opacity-60">
                      <div>
                        <div className="font-bold text-[11px] text-zinc-800">연금저축계좌</div>
                        <div className="text-[9px] text-zinc-500">세액공제 및 노후 대비</div>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-zinc-300" />
                    </div>

                    {/* Section Separator */}
                    <div className="pt-2">
                      <div className="text-[10px] font-black text-emerald-600 pb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>FA자문사 연계 계좌 (필수 선택)</span>
                      </div>

                      {/* TARGET CARD: FA종합매매계좌 */}
                      <div className="relative px-0.5">
                        <div 
                          className={`p-2.5 rounded-xl border-2 transition-colors duration-300 ${
                            scene2Step >= 3 
                              ? 'border-emerald-500 bg-emerald-50 shadow-xs' 
                              : 'border-zinc-200 bg-white'
                          } flex items-center justify-between`}
                        >
                          <div>
                            <div className="font-bold text-[11px] text-zinc-900 flex items-center gap-1.5 whitespace-nowrap">
                              <span>FA종합매매계좌</span>
                              {scene2Step >= 3 && (
                                <span className="text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded shrink-0">선택됨</span>
                              )}
                            </div>
                            <div className="text-[9px] text-zinc-500 mt-0.5 whitespace-nowrap">- 해외주식, 해외ETP</div>
                          </div>

                          <div className="relative shrink-0 ml-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                              scene2Step >= 3 
                                ? 'bg-emerald-500 text-white shadow-xs' 
                                : 'border border-zinc-300'
                            }`}>
                              {scene2Step >= 3 && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            {/* Precise Touch Pulse Centered on the Check Circle */}
                            {scene2Step === 2 && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <span className="relative flex h-5 w-5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500/60 border border-white shadow-sm" />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Item 5 */}
                      <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-center justify-between opacity-60 mt-2">
                        <div>
                          <div className="font-bold text-[11px] text-zinc-800">FA CMA계좌</div>
                          <div className="text-[9px] text-zinc-500">수시입출금 자문 계좌</div>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-zinc-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-2 relative">
                  <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 ${
                    scene2Step >= 3 ? 'bg-emerald-600 shadow-md scale-[0.98]' : 'bg-emerald-500'
                  }`}>
                    다음
                  </div>

                  {scene2Step === 4 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600 shadow-sm" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SCENE 3: 관리점 및 관리자 정보 입력 */}
            {activeScene === 3 && (
              <div className="flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100 text-zinc-700">
                  <div className="flex items-center gap-1 font-bold text-[11px]">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>관리점 정보 입력</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">4 / 5</span>
                </div>

                {/* Input Fields Container */}
                <div className="space-y-3 my-auto">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[10px] text-amber-900 leading-snug">
                    <span className="font-bold">⭐ 필수 확인:</span> 정확히 입력하셔야 수수료 우대 혜택이 정상 적용됩니다.
                  </div>

                  {/* Input 1: Branch */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-zinc-600 flex justify-between">
                      <span>관리지점</span>
                      {scene3Step >= 1 && <span className="text-emerald-600 font-extrabold text-[9px]">입력 완료</span>}
                    </div>
                    <div className={`p-2.5 rounded-xl border-2 flex items-center justify-between transition-colors duration-300 ${
                      scene3Step >= 1 ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 bg-white'
                    }`}>
                      <span className={`font-bold text-xs ${scene3Step >= 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        {scene3Step >= 1 ? '강남금융센터' : '관리지점을 검색하세요'}
                      </span>
                      <Search className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                  </div>

                  {/* Input 2: Manager */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-zinc-600 flex justify-between">
                      <span>관리자</span>
                      {scene3Step >= 2 && <span className="text-emerald-600 font-extrabold text-[9px]">입력 완료</span>}
                    </div>
                    <div className={`p-2.5 rounded-xl border-2 flex items-center justify-between transition-colors duration-300 ${
                      scene3Step >= 2 ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 bg-white'
                    }`}>
                      <span className={`font-bold text-xs ${scene3Step >= 2 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        {scene3Step >= 2 ? '김주호' : '관리자 성명을 입력하세요'}
                      </span>
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-2 relative">
                  <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 ${
                    scene3Step >= 2 ? 'bg-emerald-600 shadow-md scale-[0.98]' : 'bg-zinc-300'
                  }`}>
                    다음
                  </div>

                  {scene3Step === 3 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600 shadow-sm" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SCENE 4: 개설 완료 (가상 계좌번호로 완벽 보호 & 줄바꿈 방지) */}
            {activeScene === 4 && (
              <div className="flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100 text-zinc-700">
                  <span className="font-bold text-[11px] text-zinc-900">비대면 계좌개설 완료</span>
                  <span className="text-[10px] text-emerald-600 font-bold">5 / 5 완료</span>
                </div>

                {/* Main Content */}
                <div className="space-y-3 my-auto">
                  <div className="text-center space-y-1">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <div className="font-black text-sm text-zinc-900 pt-1">
                      계좌 개설이 완료되었습니다!
                    </div>
                    <div className="text-[9px] text-zinc-500">
                      신분증 및 본인 확인이 정상 처리되었습니다.
                    </div>
                  </div>

                  {/* Account Summary Card with No-Wrap */}
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between text-[10px] whitespace-nowrap">
                      <span className="text-zinc-500 font-medium">계좌종류</span>
                      <span className="font-extrabold text-zinc-900">종합매매 [FA자문사]</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] whitespace-nowrap">
                      <span className="text-zinc-500 font-medium">계좌번호</span>
                      <span className="font-mono font-black text-emerald-600">100-12-3456-78</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] border-t border-zinc-200/60 pt-1.5 whitespace-nowrap">
                      <span className="text-zinc-500 font-medium">관리지점 / 관리자</span>
                      <span className="font-bold text-zinc-800">강남금융센터 / 김주호</span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-2 relative">
                  <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs bg-emerald-600 shadow-md transition-all duration-300 ${
                    scene4Step >= 2 ? 'scale-[0.98] bg-emerald-700' : ''
                  }`}>
                    다음 단계(우대 연동)로 이동
                  </div>

                  {scene4Step === 2 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600 shadow-sm" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
