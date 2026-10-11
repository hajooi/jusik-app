'use client';

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink,
  Lightbulb
} from 'lucide-react';

interface Props {
  stock1: string;
  stock2: string;
}

interface StepItem {
  id: string;
  title: string;
  desc: string;
  toolLink?: {
    label: string;
    url: string;
  };
  notice?: string;
  getPrompt: (s1: string, s2: string) => string;
}

const WALKTHROUGH_STEPS: StepItem[] = [
  {
    id: 'step1',
    title: '1단계: 안티그래비티 설치하고 첫 시세 확인하기',
    desc: '구글 안티그래비티는 코딩을 전혀 몰라도 자연어로 대화하며 원하는 프로그램을 만들 수 있는 AI 도구입니다. 공식 사이트에서 내 PC(Mac 또는 Windows)에 맞는 프로그램을 다운로드하여 설치하고 로그인합니다.',
    toolLink: {
      label: '구글 안티그래비티 공식 다운로드',
      url: 'https://antigravity.google',
    },
    notice: '설치 후 새 프로젝트를 열고 아래 프롬프트를 입력하면 AI가 yfinance 라이브러리를 사용해 관심 종목 시세를 즉시 가져옵니다. 화면에 터미널 실행 권한 허용(Allow) 창이 뜨면 승인하고 진행하세요.',
    getPrompt: (s1, s2) => 
`내가 가진 (${s1})와 (${s2})의 가격을 가져와서 아침마다 요약해주는 비서를 만들고 싶어.
복잡한 가입 같은 거 없이, yfinance 라이브러리를 써서 여기서 코드로 바로 실행할 수 있게 만들어줘. 초등학생에게 설명하듯 쉬운 용어로 설명해줘.`
  },
  {
    id: 'step2',
    title: '2단계: 시장 지수, 환율, 한국어 뉴스 추가하기',
    desc: '관심 종목 시세에 더해 미국 대표 지수인 S&P 500과 원/달러 환율, 그리고 구글 뉴스 RSS를 활용한 최신 한국어 뉴스 세 가지를 덧붙여 브리핑을 완성합니다.',
    getPrompt: () => 
`여기에 S&P 500 지수랑 원달러 환율도 함께 수집하도록 추가해줘.
그리고 구글 뉴스 RSS를 사용해서 각 종목과 S&P 500 관련 최신 한국어 뉴스를 세 개씩 요약해서 가져오도록 코드를 수정하고 실행해줘.`
  },
  {
    id: 'step3',
    title: '3단계: 내 스마트폰으로 보내기 (텔레그램 연동)',
    desc: '매일 아침 보고서를 내 스마트폰 텔레그램으로 받도록 연결합니다. 텔레그램 앱에서 @BotFather를 찾아 나만의 봇을 만들고 발급받은 API 토큰을 안티그래비티에 전달합니다.',
    toolLink: {
      label: '텔레그램 공식 다운로드 (모바일 / PC)',
      url: 'https://telegram.org',
    },
    notice: '필수 확인: @BotFather에서 봇을 만든 직후, 반드시 생성된 내 봇 채팅방으로 들어가 /start 메시지를 먼저 한 번 보내야 봇이 내게 메시지를 보낼 수 있습니다.',
    getPrompt: () => 
`이 리포트를 이제 매일 아침 8시에 내 스마트폰 텔레그램으로 전송하고 싶어.
텔레그램 봇으로 메시지를 보내는 코드를 추가해주고, 내가 스마트폰으로 어떻게 진행해야 하는지 가이드해줘.`
  },
  {
    id: 'step4',
    title: '4단계: 깃허브 서버 자동화 & AGENTS.md로 AI 길들이기',
    desc: '내 컴퓨터가 꺼져 있어도 매일 아침 8시에 정기 실행되도록 깃허브 액션(GitHub Actions)으로 자동화하고, AI가 내 작업 규칙을 기억하도록 AGENTS.md 헌법 파일을 만듭니다.',
    toolLink: {
      label: '깃허브 공식 웹사이트',
      url: 'https://github.com',
    },
    notice: 'github.com에서 New repository를 생성(Private 설정)한 후 아래 프롬프트를 입력하면 안티그래비티가 워크플로우 세팅과 프로젝트 규칙 파일을 완성하고, 작업 후 Git 저장 여부를 확인합니다.',
    getPrompt: () => 
`매일 아침 8시에 이 작업이 자동으로 실행되어 텔레그램으로 오도록 GitHub Actions 워크플로우를 만들어줘.
그리고 우리 프로젝트의 AGENTS.md 파일도 만들어줘.
말투는 친근하게 하고, 초등학생도 이해할 수 있게 쉽게 설명할 것.
코드를 수정하거나 작업이 끝나면 항상 Git에 세이브할지 나에게 먼저 물어볼 것`
  }
];

export default function AiSecretaryWalkthrough({ stock1, stock2 }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="space-y-4 select-none">
      {/* 타이틀 및 안내 */}
      <div className="space-y-1">
        <h4 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
          실전 따라하기 가이드 & 프롬프트
        </h4>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          위에서 선택한 관심 종목({stock1}, {stock2})이 지시문에 자동 반영되어 있습니다. 순서대로 복사해 안티그래비티에 입력하세요.
        </p>
      </div>

      {/* 단계별 워크스루 스택 */}
      <div className="space-y-4">
        {WALKTHROUGH_STEPS.map((item, index) => {
          const promptText = item.getPrompt(stock1 || '종목1', stock2 || '종목2');
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[var(--card-surface)]/85 backdrop-blur-xl border border-[var(--border-color)]/90 hover:border-[var(--accent-orange)]/40 transition-all duration-300 shadow-2xs space-y-3.5"
            >
              {/* 스텝 제목 & 복사 버튼 */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] flex items-center justify-center font-mono font-extrabold text-xs shrink-0">
                    {index + 1}
                  </span>
                  <h5 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] tracking-tight truncate">
                    {item.title}
                  </h5>
                </div>

                {/* 원클릭 글래스모피즘 복사 버튼 */}
                <button
                  type="button"
                  onClick={() => handleCopy(promptText, item.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer backdrop-blur-md ${
                    isCopied
                      ? 'bg-emerald-500/90 text-white border border-emerald-400/40 shadow-[0_0_14px_rgba(16,185,129,0.25)]'
                      : 'bg-gradient-to-r from-[var(--accent-orange)] to-amber-500 text-white border border-[var(--accent-orange)]/40 hover:shadow-[0_0_18px_rgba(241,143,1,0.25)] hover:brightness-105'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[2]" />
                      <span>프롬프트 복사</span>
                    </>
                  )}
                </button>
              </div>

              {/* 스텝 설명 */}
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed pl-0.5">
                {item.desc}
              </p>

              {/* 해당 단계에 바로 삽입된 글래스모픽 공식 도구 바로가기 버튼 */}
              {item.toolLink && (
                <div className="pt-0.5">
                  <a
                    href={item.toolLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-surface)]/80 hover:bg-[var(--card-hover)] backdrop-blur-xl border border-[var(--border-color)]/90 hover:border-[var(--accent-orange)]/50 hover:shadow-[0_0_14px_rgba(241,143,1,0.15)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-orange)] transition-all shadow-2xs group"
                  >
                    <span>{item.toolLink.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent-orange)] transition-colors" />
                  </a>
                </div>
              )}

              {/* 주의사항/안내 글래스 박스 */}
              {item.notice && (
                <div className="p-3 rounded-xl bg-[var(--bg-main)]/80 backdrop-blur-md border border-[var(--border-color)]/80 text-xs text-[var(--text-secondary)] font-medium leading-relaxed flex items-start gap-2 shadow-2xs">
                  <Lightbulb className="w-4 h-4 text-[var(--accent-orange)] shrink-0 mt-0.5" />
                  <span className="flex-1">{item.notice}</span>
                </div>
              )}

              {/* 프롬프트 다크 글래스 코드 블록 */}
              <div className="relative rounded-xl overflow-hidden bg-black/35 backdrop-blur-md border border-[var(--border-color)]/60 p-3 sm:p-4 text-slate-100 shadow-inner">
                <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed break-keep font-medium text-slate-100">
                  {promptText}
                </pre>
              </div>

              {/* 1단계 팁 */}
              {index === 0 && (
                <p className="text-[11px] text-[var(--text-secondary)] font-medium pl-1">
                  💡 팁: 다른 관심 종목으로 바꾸고 싶으시다면 프롬프트의 괄호 ({stock1})와 ({stock2}) 자리에 원하는 종목 이름을 직접 적으셔도 됩니다.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
