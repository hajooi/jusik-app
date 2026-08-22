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
  CreditCard,
  Building,
  UserCheck,
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

  // Scene-specific animation steps
  const [scene1Step, setScene1Step] = useState(0); // 0: initial, 1: pulse on start, 2: clicked
  const [scene2Step, setScene2Step] = useState(0); // 0: top list, 1: scroll down, 2: pulse FA, 3: FA active, 4: next active
  const [scene3Step, setScene3Step] = useState(0); // 0: typing ID, 1: ID done, 2: pw done, 3: manager pulse, 4: manager filled
  const [scene4Step, setScene4Step] = useState(0); // 0: complete reveal

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
        setScene1Step(1); // Pulse touch ring on bottom button

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene1Step(2); // Button clicked state

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

  // Scene 2 Auto Loop (Scroll down & click FA Account)
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
              setScene2Step(4); // Next button active

              timerId = setTimeout(() => {
                if (!isMounted) return;
                runScene2();
              }, 2600);
            }, 600);
          }, 500);
        }, 800);
      }, 700);
    };

    runScene2();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 3 Auto Loop (Type ID, PW, Select Manager)
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
            setScene3Step(3); // Pulse on Manager button

            timerId = setTimeout(() => {
              if (!isMounted) return;
              setScene3Step(4); // Manager selected: 김주호 / 강남금융센터

              timerId = setTimeout(() => {
                if (!isMounted) return;
                runScene3();
              }, 2800);
            }, 600);
          }, 600);
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
        setScene4Step(1);

        timerId = setTimeout(() => {
          if (!isMounted) return;
          runScene4();
        }, 3200);
      }, 500);
    };

    runScene4();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-surface)]/90 text-[var(--text-primary)] p-4 sm:p-6 shadow-sm backdrop-blur-xl transition-all">
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
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between pb-1 border-b border-zinc-100 text-zinc-700">
              <div className="flex items-center gap-1 font-bold text-[11px]">
                {activeScene > 1 && <ChevronLeft className="w-3.5 h-3.5" />}
                <span>
                  {activeScene === 1 && '비대면 계좌개설'}
                  {activeScene === 2 && '계좌 종류 선택'}
                  {activeScene === 3 && 'ID 및 관리점 정보 입력'}
                  {activeScene === 4 && '계좌 개설 완료'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono font-bold">
                {activeScene} / 4
              </span>
            </div>

            {/* SCENE CONTENTS */}
            <div className="flex-1 overflow-hidden py-1">
              {/* SCENE 1: 비대면 계좌개설 시작 & 준비물 안내 화면 */}
              {activeScene === 1 && (
                <div className="space-y-3 pt-1">
                  <div>
                    <h5 className="text-sm font-extrabold text-zinc-900 leading-tight">
                      영업점 방문 없이<br />
                      <span className="text-emerald-600">스마트폰으로 간편하게</span> 개설하세요
                    </h5>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5 text-[10px]">
                      <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>개설 전 준비물</span>
                      </div>
                      <div className="text-[9px] text-zinc-500 pl-5 space-y-0.5">
                        <div>• 주민등록증 또는 운전면허증</div>
                        <div>• 본인 명의 스마트폰</div>
                        <div>• 타 금융기관 본인 계좌</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[9px] text-emerald-800 space-y-0.5">
                      <div className="font-bold">⭐ 주식부엉 제휴 혜택</div>
                      <div>안내에 따라 FA종합매매계좌를 선택하시면 평생 수수료 우대 혜택이 적용됩니다.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 2: 계좌 종류 선택 (맨 아래로 스크롤하여 FA종합매매계좌 선택) */}
              {activeScene === 2 && (
                <div className="relative h-full overflow-hidden">
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

                            {/* Centered Translucent White Touch Ring */}
                            {scene2Step === 2 && (
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
              )}

              {/* SCENE 3: ID 및 관리점 정보 입력 */}
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
                          {/* Centered Translucent White Touch Ring */}
                          {scene3Step === 3 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-6 w-6">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                                <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/90 shadow-xs space-y-1 text-[10px] transition-all">
                          <div className="flex justify-between items-center text-zinc-700 font-medium whitespace-nowrap">
                            <span>투자권유대행인</span>
                            <span className="font-extrabold text-zinc-900">김주호</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-700 font-medium whitespace-nowrap">
                            <span>관리자</span>
                            <span className="font-extrabold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">김주호</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-700 font-medium whitespace-nowrap">
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
                    <div className="flex justify-between items-center whitespace-nowrap">
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
            <div className="pt-2 relative">
              {activeScene === 1 && (
                <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 relative ${
                  scene1Step >= 2 ? 'bg-emerald-500 shadow-md scale-[0.98]' : 'bg-emerald-500'
                }`}>
                  계좌개설 시작
                  {scene1Step === 1 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="relative flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                      </span>
                    </div>
                  )}
                </div>
              )}
              {activeScene === 2 && (
                <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 relative ${
                  scene2Step >= 4 ? 'bg-emerald-500 shadow-md' : 'bg-zinc-300'
                }`}>
                  다음
                  {scene2Step === 4 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="relative flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                      </span>
                    </div>
                  )}
                </div>
              )}
              {activeScene === 3 && (
                <div className={`w-full py-2.5 rounded-xl text-center font-bold text-white text-xs transition-all duration-300 relative ${
                  scene3Step >= 4 ? 'bg-emerald-500 shadow-md' : 'bg-zinc-300'
                }`}>
                  다음
                  {scene3Step === 4 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="relative flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-80" />
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-white/80 backdrop-blur-xs border border-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                      </span>
                    </div>
                  )}
                </div>
              )}
              {activeScene === 4 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="py-2 rounded-xl border border-zinc-300 text-center font-bold text-[10px] text-zinc-700 bg-white whitespace-nowrap">
                    해외주식 거래신청
                  </div>
                  <div className="py-2 rounded-xl text-center font-bold text-[10px] text-white bg-emerald-500 shadow-xs whitespace-nowrap">
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
