'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronLeft, 
  ChevronDown, 
  Smartphone, 
  CreditCard, 
  Building2
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

  // Scene-specific auto animation progress steps
  const [scene1Step, setScene1Step] = useState(0); // 0: initial, 1: touch start btn, 2: pressed
  const [scene2Step, setScene2Step] = useState(0); // 0: top, 1: scroll down, 2: touch fa, 3: checked, 4: next
  const [scene3Step, setScene3Step] = useState(0); // 0: start, 1: id typed, 2: pw, 3: touch popup, 4: filled branch
  const [scene4Step, setScene4Step] = useState(0); // 0: check pop, 1: card ready

  const handleSceneSelect = (s: 1 | 2 | 3 | 4) => {
    setInternalScene(s);
    if (onSceneChange) onSceneChange(s);
  };

  // Scene 1 Auto Loop (Start & Requirements)
  useEffect(() => {
    if (activeScene !== 1) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene1 = () => {
      if (!isMounted) return;
      setScene1Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene1Step(1); // Touch pulse on [계좌개설 시작]

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene1Step(2); // Button pressed active

          timerId = setTimeout(() => {
            if (!isMounted) return;
            runScene1(); // Loop back
          }, 2400);
        }, 600);
      }, 1000);
    };

    runScene1();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 2 Auto Loop (Account Selection)
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
          setScene2Step(2); // Touch FA account

          timerId = setTimeout(() => {
            if (!isMounted) return;
            setScene2Step(3); // Checked

            timerId = setTimeout(() => {
              if (!isMounted) return;
              setScene2Step(4); // Next active

              timerId = setTimeout(() => {
                if (!isMounted) return;
                runScene2();
              }, 2500);
            }, 600);
          }, 700);
        }, 1100);
      }, 700);
    };

    runScene2();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 3 Auto Loop (Branch & Manager Registration)
  useEffect(() => {
    if (activeScene !== 3) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene3 = () => {
      if (!isMounted) return;
      setScene3Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene3Step(1); // Type ID (jusikapp)

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene3Step(2); // Type PW

          timerId = setTimeout(() => {
            if (!isMounted) return;
            setScene3Step(3); // Touch Register button

            timerId = setTimeout(() => {
              if (!isMounted) return;
              setScene3Step(4); // Fill branch & manager

              timerId = setTimeout(() => {
                if (!isMounted) return;
                runScene3();
              }, 2800);
            }, 700);
          }, 800);
        }, 900);
      }, 700);
    };

    runScene3();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 4 Auto Loop (Completion)
  useEffect(() => {
    if (activeScene !== 4) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene4 = () => {
      if (!isMounted) return;
      setScene4Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene4Step(1); // Card shine & complete state

        timerId = setTimeout(() => {
          if (!isMounted) return;
          runScene4();
        }, 3200);
      }, 600);
    };

    runScene4();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  const sceneTitles = [
    { num: 1, label: '1. 개설 시작' },
    { num: 2, label: '2. 계좌 선택' },
    { num: 3, label: '3. 관리점 입력' },
    { num: 4, label: '4. 개설 완료' }
  ];

  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-surface)]/90 text-[var(--text-primary)] p-4 sm:p-6 space-y-5 shadow-sm backdrop-blur-xl transition-all">
      {/* Centered Glassmorphic 4-Scene Switcher with Sliding Indicator */}
      <div className="flex justify-center">
        <div className="relative grid grid-cols-4 p-1 rounded-2xl bg-[var(--card-hover)] border border-[var(--border-color)] shadow-2xs w-full max-w-[440px] select-none">
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
              className={`relative z-10 py-2 text-center text-xs sm:text-sm font-extrabold transition-colors duration-200 truncate px-1 ${
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
          <div className="bg-white text-zinc-900 rounded-b-[2.2rem] overflow-hidden h-[450px] flex flex-col justify-between px-3.5 pb-4 pt-1 font-sans text-xs relative select-none shadow-inner">
            
            {/* Top Navigation Bar */}
            <div>
              <div className="flex items-center justify-between pb-2.5 text-zinc-700">
                <ChevronLeft className="w-4 h-4" />
                <span className="font-extrabold text-[11px] text-zinc-800">
                  {activeScene === 1 && '비대면 계좌개설'}
                  {activeScene === 2 && '계좌 종류 선택'}
                  {activeScene === 3 && 'ID 및 관리점 등록'}
                  {activeScene === 4 && '계좌개설 완료'}
                </span>
                <div className="w-4" />
              </div>

              {/* SCENE 1: 계좌개설 가이드 & 본인 확인 3가지 준비물 */}
              {activeScene === 1 && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-0.5">
                    <h5 className="text-sm font-extrabold text-zinc-900 leading-tight">
                      본인 확인을 위해<br />
                      아래의 <span className="text-emerald-600">세가지</span>가 필요해요.
                    </h5>
                  </div>

                  {/* 3 Preparation Items */}
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[11px] text-zinc-800">본인명의의 휴대폰</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[11px] text-zinc-800">주민등록증 또는 운전면허증</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[11px] text-zinc-800">본인 명의의 타 금융기관 계좌</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>안심차단 서비스 수집·이용·제공 조회 동의</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 2: 계좌 종류 선택 (FA종합매매계좌) */}
              {activeScene === 2 && (
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <h5 className="text-sm font-extrabold text-zinc-900 leading-tight">
                      고객님의 <span className="text-emerald-600">투자 목적</span>에 맞는<br />
                      계좌를 알려드려요
                    </h5>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      투자하실 상품을 선택해주세요
                    </p>
                  </div>

                  {/* Account Cards Container with Smooth Scroll Animation */}
                  <div className="relative overflow-hidden h-[290px] pt-1 px-0.5">
                    <div 
                      className={`space-y-2 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        scene2Step >= 1 ? '-translate-y-[155px]' : 'translate-y-0'
                      }`}
                    >
                      {/* Item 1: 일반 종합매매계좌 */}
                      <div className="p-2.5 rounded-xl border border-zinc-200 bg-white opacity-70 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[11px] text-zinc-800">1. 종합매매계좌</div>
                          <div className="text-[9px] text-zinc-400">- 거래상품 : 국내주식, 해외주식 등</div>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-zinc-300" />
                      </div>

                      {/* Item 2: RIA 계좌 */}
                      <div className="p-2.5 rounded-xl border border-zinc-200 bg-white opacity-70 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[11px] text-zinc-800">2. RIA계좌</div>
                          <div className="text-[9px] text-zinc-400">- 거래상품 : 국내상장주식 등</div>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-zinc-300" />
                      </div>

                      {/* Scroll Down Cue Banner */}
                      <div className="text-center py-1">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300 animate-bounce">
                          <ChevronDown className="w-3 h-3" />
                          아래로 스크롤
                        </span>
                      </div>

                      {/* FA 자문사 연계 계좌 Group Accordion */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between font-extrabold text-xs text-zinc-900 pb-1.5 px-0.5">
                          <span>FA자문사 연계 계좌</span>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
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
                              <div className="font-bold text-[11px] text-zinc-900 flex items-center gap-1.5">
                                <span>FA종합매매계좌</span>
                                {scene2Step >= 3 && (
                                  <span className="text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded">선택됨</span>
                                )}
                              </div>
                              <div className="text-[9px] text-zinc-500 mt-0.5">- 해외주식, 해외ETP</div>
                            </div>

                            <div className="relative">
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

                        {/* Other dummy account */}
                        <div className="p-2.5 mt-2 rounded-xl border border-zinc-200 bg-white opacity-50 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[11px] text-zinc-700">펀드</div>
                            <div className="text-[9px] text-zinc-400">- 주식형, 채권형 등</div>
                          </div>
                          <div className="w-4 h-4 rounded-full border border-zinc-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 3: 관리점 김주호 / 강남금융센터 입력 */}
              {activeScene === 3 && (
                <div className="space-y-3 pt-1">
                  <div>
                    <h5 className="text-sm font-extrabold text-zinc-900 leading-tight">
                      사용하실 <span className="text-emerald-600">ID와 관리점 정보</span>를<br />
                      입력해주세요
                    </h5>
                  </div>

                  {/* ID Field (jusikapp) */}
                  <div className="space-y-1">
                    <div className="text-[9px] text-zinc-600 font-bold">ID 등록(필수)</div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-zinc-50 text-[10px] text-zinc-800 font-mono font-bold flex items-center min-h-[30px]">
                        {scene3Step >= 1 ? (
                          <span className="text-zinc-900 font-extrabold">jusikapp</span>
                        ) : (
                          <span className="w-1.5 h-3.5 bg-zinc-400 animate-pulse inline-block" />
                        )}
                      </div>
                      <span className="px-2 py-1.5 rounded-lg bg-zinc-200 text-zinc-700 text-[9px] font-bold">중복확인</span>
                    </div>
                    {scene3Step >= 1 && (
                      <div className="text-[8px] text-emerald-600 font-bold">※ 사용 가능한 ID입니다</div>
                    )}
                  </div>

                  {/* Password Mock */}
                  <div className="space-y-1">
                    <div className="text-[9px] text-zinc-600 font-bold">접속비밀번호 입력</div>
                    <div className="px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-zinc-50 text-[10px] text-zinc-500 font-mono tracking-widest min-h-[30px] flex items-center">
                      {scene3Step >= 2 ? '••••••••' : ''}
                    </div>
                  </div>

                  {/* TARGET SECTION: 관리자 / 지점 등록 */}
                  <div className="pt-1 border-t border-zinc-100 space-y-1.5">
                    <div className="font-extrabold text-[10px] text-zinc-900">
                      투자권유대행인, 관리자, 지점 등록
                    </div>

                    <div className="relative px-0.5">
                      {scene3Step < 4 ? (
                        <div className={`w-full py-2 text-center rounded-xl border-2 text-[10px] font-bold transition-all relative ${
                          scene3Step === 3 ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-zinc-50 border-zinc-300 text-zinc-700'
                        }`}>
                          [등록/선택] 버튼 탭
                          {/* Centered touch pulse */}
                          {scene3Step === 3 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500/70 border border-white shadow-sm" />
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/90 shadow-xs space-y-1 text-[10px] transition-all">
                          <div className="flex justify-between items-center text-zinc-700 font-medium">
                            <span>투자권유대행인</span>
                            <span className="font-extrabold text-zinc-900">김주호</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-700 font-medium">
                            <span>관리자</span>
                            <span className="font-extrabold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">김주호</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-700 font-medium">
                            <span>관리지점</span>
                            <span className="font-extrabold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">강남금융센터</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 4: 개설 완료 화면 */}
              {activeScene === 4 && (
                <div className="space-y-4 pt-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center mx-auto text-blue-500 shadow-sm animate-pulse">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-base font-extrabold text-zinc-900">
                      주식부엉님의 계좌가<br />
                      개설되었습니다.
                    </h5>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      로그인 후 이용이 가능합니다.
                    </p>
                  </div>

                  {/* Registered Account Box */}
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-1 text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-700">종합매매 [FA자문사]</span>
                      <span className="font-mono text-zinc-900 font-bold">100-12-3456-78</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-zinc-400 leading-relaxed pt-1">
                    MTS 접속을 위한 간편인증(6자리숫자) 등록 및 해외주식 거래신청이 가능합니다.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Screen Button */}
            <div className="pt-2">
              {activeScene === 1 && (
                <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 ${
                  scene1Step >= 2 ? 'bg-emerald-500 shadow-md scale-[0.98]' : 'bg-emerald-500'
                }`}>
                  계좌개설 시작
                </div>
              )}
              {activeScene === 2 && (
                <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 ${
                  scene2Step >= 4 ? 'bg-emerald-500 shadow-md' : 'bg-zinc-300'
                }`}>
                  다음
                </div>
              )}
              {activeScene === 3 && (
                <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 ${
                  scene3Step >= 4 ? 'bg-emerald-500 shadow-md' : 'bg-zinc-300'
                }`}>
                  다음
                </div>
              )}
              {activeScene === 4 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="py-2 rounded-xl border border-zinc-300 text-center font-bold text-[10px] text-zinc-700 bg-white">
                    해외주식 거래신청
                  </div>
                  <div className="py-2 rounded-xl text-center font-bold text-[10px] text-white bg-emerald-500 shadow-xs">
                    간편인증등록
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
