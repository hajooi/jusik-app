'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Search, 
  Globe, 
  TrendingUp,
  CreditCard,
  Building2,
  Smartphone,
  RotateCw,
  BarChart2,
  Bell,
  Mic
} from 'lucide-react';

interface OverseasBenefitMotionSimulatorProps {
  currentScene?: 1 | 2 | 3 | 4;
  onSceneChange?: (scene: 1 | 2 | 3 | 4) => void;
}

export default function OverseasBenefitMotionSimulator({
  currentScene,
  onSceneChange
}: OverseasBenefitMotionSimulatorProps) {
  const [internalScene, setInternalScene] = useState<1 | 2 | 3 | 4>(1);
  const activeScene = currentScene ?? internalScene;

  // Scene animation states
  const [scene1Step, setScene1Step] = useState(0); // 0: home, 1: pulse menu, 2: full menu, 3: pulse overseas tab
  const [scene2Step, setScene2Step] = useState(0); // 0: overseas menu, 1: pulse [해외주식거래이용신청], 2: selected
  const [scene3Step, setScene3Step] = useState(0); // 0: apply screen, 1: pulse apply card, 2: apply completed
  const [scene4Step, setScene4Step] = useState(0); // 0: google form, 1: pulse submit btn, 2: submitted

  const handleSceneSelect = (s: 1 | 2 | 3 | 4) => {
    setInternalScene(s);
    if (onSceneChange) onSceneChange(s);
  };

  // Scene 1 Auto Loop (Home -> Menu -> Overseas Tab)
  useEffect(() => {
    if (activeScene !== 1) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene1 = () => {
      if (!isMounted) return;
      setScene1Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene1Step(1); // Pulse on bottom Menu

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene1Step(2); // Show Full Menu screen

          timerId = setTimeout(() => {
            if (!isMounted) return;
            setScene1Step(3); // Pulse on Overseas Tab

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

  // Scene 2 Auto Loop (Service Apply -> Overseas Trade Apply)
  useEffect(() => {
    if (activeScene !== 2) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene2 = () => {
      if (!isMounted) return;
      setScene2Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene2Step(1); // Pulse on [해외주식거래이용신청]

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene2Step(2); // Selected state

          timerId = setTimeout(() => {
            if (!isMounted) return;
            runScene2();
          }, 2600);
        }, 700);
      }, 900);
    };

    runScene2();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 3 Auto Loop (Apply Screen -> Complete)
  useEffect(() => {
    if (activeScene !== 3) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene3 = () => {
      if (!isMounted) return;
      setScene3Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene3Step(1); // Pulse on [해외주식거래 이용신청 여부]

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene3Step(2); // Changed to [신청완료]

          timerId = setTimeout(() => {
            if (!isMounted) return;
            runScene3();
          }, 2800);
        }, 700);
      }, 1000);
    };

    runScene3();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  // Scene 4 Auto Loop (Google Form Submission)
  useEffect(() => {
    if (activeScene !== 4) return;
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runScene4 = () => {
      if (!isMounted) return;
      setScene4Step(0);

      timerId = setTimeout(() => {
        if (!isMounted) return;
        setScene4Step(1); // Pulse on [제출] button

        timerId = setTimeout(() => {
          if (!isMounted) return;
          setScene4Step(2); // Submission complete

          timerId = setTimeout(() => {
            if (!isMounted) return;
            runScene4();
          }, 3200);
        }, 700);
      }, 1100);
    };

    runScene4();
    return () => { isMounted = false; clearTimeout(timerId); };
  }, [activeScene]);

  const sceneTitles = [
    { num: 1, label: '1. 해외메뉴' },
    { num: 2, label: '2. 서비스' },
    { num: 3, label: '3. 이용신청' },
    { num: 4, label: '4. 폼제출' }
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
          <div className="bg-white text-zinc-900 rounded-b-[2.2rem] overflow-hidden h-[450px] flex flex-col justify-between px-3 pb-2 pt-1 font-sans text-xs relative select-none shadow-inner">
            
            {/* SCENE 1: 홈 화면 (1.56.25) -> 메뉴 터치 -> 상단 해외주식 (1.56.36) */}
            {activeScene === 1 && (
              <div className="flex flex-col h-full justify-between">
                {scene1Step < 2 ? (
                  /* DB증권 실제 홈 화면 재현 (1.56.25) */
                  <div className="space-y-2 pt-1">
                    {/* Top category tabs */}
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-1 text-zinc-800">
                      <div className="flex gap-2.5 text-[11px] font-extrabold">
                        <span className="text-zinc-900 border-b-2 border-zinc-900 pb-0.5">국내</span>
                        <span className="text-zinc-400">해외</span>
                        <span className="text-zinc-400">채권</span>
                        <span className="text-zinc-400">자산</span>
                      </div>
                      <span className="text-[8px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-bold">간편모드</span>
                    </div>

                    {/* Notice Blue Banner */}
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 space-y-0.5">
                      <div className="font-extrabold text-[9px] truncate">단일종목 레버리지·인버스 상품 안내</div>
                      <div className="text-[7px] text-blue-600 font-bold bg-blue-100/80 inline-block px-1 rounded">투자 유의사항 보기</div>
                    </div>

                    {/* KOSPI / KOSDAQ Widget */}
                    <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px]">
                      <div className="space-y-0.5">
                        <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스피</div>
                        <div className="text-xs font-black text-rose-600">8,476.15</div>
                        <div className="text-[8px] text-rose-500 font-bold">▲ 290.86 (3.55%)</div>
                      </div>
                      <div className="space-y-0.5 border-l border-zinc-200 pl-1.5">
                        <div className="text-[8px] text-zinc-500 font-bold">🇰🇷 코스닥</div>
                        <div className="text-xs font-black text-blue-600">1,074.80</div>
                        <div className="text-[8px] text-blue-500 font-bold">▼ 29.56 (-2.68%)</div>
                      </div>
                    </div>

                    {/* Green Search Bar */}
                    <div className="p-2 rounded-full border-2 border-emerald-500 bg-white text-zinc-400 flex items-center gap-1.5 px-3">
                      <Search className="w-3 h-3 text-zinc-400" />
                      <span className="text-[9px]">종목을 검색해 보세요</span>
                    </div>

                    <div className="pt-2 text-center text-[9px] font-bold text-zinc-500">
                      하단 좌측 <span className="text-indigo-600 font-black">[메뉴]</span>를 터치합니다
                    </div>
                  </div>
                ) : (
                  /* DB증권 전체메뉴 화면 재현 (1.56.36) - No-Wrap & Tight Spacing */
                  <div className="space-y-2 pt-1 flex flex-col justify-between h-full">
                    <div>
                      {/* Top Header Icons */}
                      <div className="flex items-center justify-end gap-2 text-zinc-700 pb-1">
                        <Search className="w-3.5 h-3.5" />
                        <Mic className="w-3.5 h-3.5" />
                        <Bell className="w-3.5 h-3.5" />
                      </div>

                      {/* Green Sprout Banner */}
                      <div className="p-2 rounded-xl bg-emerald-600 text-white text-[9px] font-bold text-center">
                        🌱 간편한 계좌개설, 시작해볼까요?
                      </div>

                      {/* 5 Main Menu Category Tabs (글자 줄바꿈 완벽 방지) */}
                      <div className="grid grid-cols-5 gap-0.5 pt-2 border-b border-zinc-200 pb-2 text-center text-[8px] font-bold">
                        <div className="p-0.5 rounded text-zinc-400 whitespace-nowrap">
                          <TrendingUp className="w-3 h-3 mx-auto mb-0.5 opacity-60" />
                          <span className="tracking-tighter">국내주식</span>
                        </div>

                        {/* TARGET: 해외주식 */}
                        <div className="relative">
                          <div className={`p-0.5 rounded transition-all duration-300 whitespace-nowrap ${
                            scene1Step >= 3 
                              ? 'bg-emerald-50 text-emerald-600 font-extrabold scale-105 border border-emerald-300' 
                              : 'text-zinc-800 font-bold'
                          }`}>
                            <Globe className="w-3 h-3 mx-auto mb-0.5 text-emerald-600" />
                            <span className="tracking-tighter">해외주식</span>
                          </div>

                          {scene1Step === 3 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="relative flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500/70 border border-white shadow-sm" />
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-0.5 rounded text-zinc-400 whitespace-nowrap">
                          <CreditCard className="w-3 h-3 mx-auto mb-0.5 opacity-60" />
                          <span className="tracking-tighter">상품/연금</span>
                        </div>
                        <div className="p-0.5 rounded text-zinc-400 whitespace-nowrap">
                          <Building2 className="w-3 h-3 mx-auto mb-0.5 opacity-60" />
                          <span className="tracking-tighter">뱅킹/대출</span>
                        </div>
                        <div className="p-0.5 rounded text-zinc-400 whitespace-nowrap">
                          <Smartphone className="w-3 h-3 mx-auto mb-0.5 opacity-60" />
                          <span className="tracking-tighter">모바일지점</span>
                        </div>
                      </div>

                      <div className="p-2.5 mt-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px] text-zinc-600">
                        <span className="font-extrabold text-zinc-900">[해외주식]</span> 탭을 선택하여 해외 거래 신청 메뉴로 진입합니다.
                      </div>
                    </div>

                    <div className="text-center text-[9px] font-extrabold text-emerald-600 pb-1">
                      상단 [해외주식] 탭 선택 완료!
                    </div>
                  </div>
                )}

                {/* Bottom Navigation Bar (1.56.25) */}
                {scene1Step < 2 && (
                  <div className="relative border-t border-zinc-200 pt-1 -mx-3 px-1.5 bg-zinc-900 text-white flex items-center justify-between text-[7.5px] whitespace-nowrap">
                    <div className={`flex flex-col items-center p-1 rounded-lg transition-all ${
                      scene1Step === 1 ? 'bg-indigo-600 text-white scale-105' : 'text-zinc-400'
                    }`}>
                      <Menu className="w-3 h-3" />
                      <span className="font-bold text-[7px]">메뉴</span>
                    </div>
                    <span className="text-zinc-400">홈</span>
                    <span className="text-zinc-400">관심</span>
                    <span className="text-zinc-400">현재가</span>
                    <span className="text-zinc-400">주문</span>
                    <span className="text-zinc-400">잔고</span>

                    {scene1Step === 1 && (
                      <div className="absolute left-2 top-0 pointer-events-none">
                        <span className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-80" />
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-600/70 border border-white shadow-sm" />
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SCENE 2: 해외주식 메뉴 (1.56.50) -> 서비스신청 -> 해외주식거래이용신청 */}
            {activeScene === 2 && (
              <div className="flex flex-col h-full justify-between pt-1">
                <div>
                  {/* Category Tabs */}
                  <div className="grid grid-cols-5 gap-0.5 border-b border-zinc-200 pb-1.5 text-center text-[7.5px] font-bold whitespace-nowrap">
                    <span className="text-zinc-400">국내주식</span>
                    <span className="text-emerald-600 font-black border-b-2 border-emerald-600 pb-0.5">해외주식</span>
                    <span className="text-zinc-400">상품/연금</span>
                    <span className="text-zinc-400">뱅킹/대출</span>
                    <span className="text-zinc-400">모바일지점</span>
                  </div>

                  <div className="grid grid-cols-12 gap-1.5 pt-2">
                    {/* Left Sidebar Menu */}
                    <div className="col-span-4 space-y-1 border-r border-zinc-100 pr-1 text-[8.5px] whitespace-nowrap">
                      <div className="p-1 rounded text-zinc-400 font-medium">주식모으기</div>
                      <div className="p-1 rounded bg-emerald-50 text-emerald-700 font-black border border-emerald-200">
                        서비스신청
                      </div>
                      <div className="p-1 rounded text-zinc-400 font-medium">투자정보</div>
                      <div className="p-1 rounded text-zinc-400 font-medium">실적발표</div>
                      <div className="p-1 rounded text-zinc-400 font-medium">배당주</div>
                    </div>

                    {/* Right Submenu List */}
                    <div className="col-span-8 space-y-1.5">
                      <div className="text-[8px] font-black text-zinc-900 pb-0.5 whitespace-nowrap">해외서비스신청</div>
                      
                      {/* TARGET: 해외주식거래이용신청 */}
                      <div className="relative">
                        <div className={`p-2 rounded-xl border-2 transition-all duration-300 ${
                          scene2Step >= 2 
                            ? 'border-emerald-500 bg-emerald-50 shadow-xs' 
                            : 'border-zinc-200 bg-white'
                        }`}>
                          <div className="font-extrabold text-[8.5px] text-zinc-900 flex items-center justify-between whitespace-nowrap">
                            <span className="truncate">해외주식거래이용신청</span>
                            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0 ml-1" />
                          </div>
                        </div>

                        {scene2Step === 1 && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <span className="relative flex h-5 w-5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                              <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500/70 border border-white shadow-sm" />
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-1.5 rounded-lg border border-zinc-100 bg-zinc-50 text-[8px] text-zinc-400 whitespace-nowrap truncate">
                        해외주식실시간시세신청
                      </div>
                      <div className="p-1.5 rounded-lg border border-zinc-100 bg-zinc-50 text-[8px] text-zinc-400 whitespace-nowrap truncate">
                        해외주식공지사항
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] font-bold text-emerald-600">
                  [서비스신청] ➔ [해외주식거래이용신청] 선택
                </div>
              </div>
            )}

            {/* SCENE 3: 해외주식거래이용신청 실제 화면 (1.56.56) */}
            {activeScene === 3 && (
              <div className="flex flex-col h-full justify-between pt-1">
                <div className="space-y-2">
                  {/* Top bar */}
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                    <div className="flex items-center gap-1 font-extrabold text-[10px] text-zinc-900 whitespace-nowrap">
                      <ChevronLeft className="w-3.5 h-3.5 text-zinc-600" />
                      <span>해외주식거래이용신청</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <RotateCw className="w-3 h-3" />
                      <BarChart2 className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Account Selector Dropdown */}
                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px] flex items-center justify-between whitespace-nowrap">
                    <span className="font-mono font-bold text-zinc-800">100-12-3456-78 주식부엉</span>
                    <span className="text-[7px] text-zinc-400 font-mono">••••</span>
                  </div>

                  {/* Section Title */}
                  <div className="space-y-0.5">
                    <div className="font-black text-[10px] text-zinc-900">해외주식 거래 안내</div>
                    <div className="text-[8px] text-zinc-500 leading-snug">
                      해외주식 거래를 위해서는 이용신청을 하셔야 합니다. 해당 계좌는 국내주식도 거래 가능합니다.
                    </div>
                  </div>

                  {/* 4 Cards List */}
                  <div className="space-y-1.5">
                    {/* TARGET CARD 1 */}
                    <div className="relative">
                      <div className={`p-2.5 rounded-xl border-2 transition-all duration-300 ${
                        scene3Step >= 2 
                          ? 'border-emerald-500 bg-emerald-50 shadow-xs' 
                          : 'border-zinc-200 bg-white'
                      }`}>
                        <div className="flex items-center justify-between whitespace-nowrap">
                          <span className="font-extrabold text-[9px] text-zinc-900 truncate">
                            해외주식거래 이용신청 여부
                          </span>

                          <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ml-1 ${
                            scene3Step >= 2 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-zinc-400'
                          }`}>
                            {scene3Step >= 2 ? (
                              <>
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>신청완료</span>
                              </>
                            ) : (
                              <span>미신청 &gt;</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {scene3Step === 1 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="relative flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500/70 border border-white shadow-sm" />
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 rounded-lg border border-zinc-100 bg-zinc-50 text-[8px] text-zinc-400 flex justify-between whitespace-nowrap">
                      <span>해외주식 통합증거금 이용신청</span>
                      <span>미신청 &gt;</span>
                    </div>
                    <div className="p-2 rounded-lg border border-zinc-100 bg-zinc-50 text-[8px] text-zinc-400 flex justify-between whitespace-nowrap">
                      <span>해외ETP 위험고지</span>
                      <span>미신청 &gt;</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-center text-[10px] font-bold text-emerald-600">
                  {scene3Step >= 2 ? '🎉 해외주식 거래 이용신청 완료!' : '해외주식 거래 이용신청 완료'}
                </div>
              </div>
            )}

            {/* SCENE 4: 실제 구글 폼 제휴 계좌 개설 정보 제출 (1.57.23, 1.57.26) */}
            {activeScene === 4 && (
              <div className="flex flex-col h-full justify-between pt-0.5">
                {scene4Step < 2 ? (
                  <div className="space-y-2">
                    {/* Google Form Top Purple Header Stripe */}
                    <div className="rounded-xl overflow-hidden border border-purple-200 bg-white shadow-2xs">
                      <div className="h-1.5 bg-purple-600 w-full" />
                      <div className="p-2 space-y-0.5">
                        <div className="font-extrabold text-[9px] text-zinc-900 leading-tight">
                          [주식부엉 X 오로라투자자문]<br />
                          제휴 계좌 개설 정보 제출
                        </div>
                        <div className="text-[7px] text-zinc-500">
                          수수료 우대 혜택 적용을 위한 계좌 정보를 입력해 주세요.
                        </div>
                      </div>
                    </div>

                    {/* Google Form Input Cards */}
                    <div className="space-y-1.5 text-[8px]">
                      <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-0.5">
                        <div className="text-zinc-600 font-bold">성함 (이름) <span className="text-rose-500">*</span></div>
                        <div className="font-bold text-zinc-900 bg-white p-1 rounded border border-zinc-200">주식부엉</div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-0.5">
                        <div className="text-zinc-600 font-bold">DB증권 계좌번호 <span className="text-rose-500">*</span></div>
                        <div className="font-mono font-bold text-zinc-900 bg-white p-1 rounded border border-zinc-200">100-12-3456-78</div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between whitespace-nowrap">
                        <span className="text-zinc-700 font-bold truncate">개인정보 수집 및 이용 동의 <span className="text-rose-500">*</span></span>
                        <div className="w-3.5 h-3.5 rounded bg-purple-600 text-white flex items-center justify-center shrink-0 ml-1">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 relative">
                      <div className={`w-full py-2 rounded-xl text-center font-bold text-white text-[10px] transition-all duration-300 ${
                        scene4Step >= 1 ? 'bg-purple-700 shadow-md scale-[0.98]' : 'bg-purple-600'
                      }`}>
                        제출
                      </div>

                      {scene4Step === 1 && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <span className="relative flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-white/70 border border-purple-600 shadow-sm" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
                      <Check className="w-7 h-7 stroke-[3]" />
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-extrabold text-xs text-zinc-900">
                        응답이 기록되었습니다.
                      </h5>
                      <p className="text-[8px] text-zinc-500 leading-relaxed">
                        영업일 기준 1~2일 내에<br />
                        평생 우대 수수료 혜택이 세팅됩니다.
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-[8px] font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 inline-block">
                        모든 개설 & 혜택 신청 완료 🎉
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
