'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Award, 
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Check
} from 'lucide-react';
import { triggerConfetti } from '@/utils/confetti';

interface TermQuestion {
  id: number;
  keyword: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

const BASIC_TERMS_QUESTIONS: TermQuestion[] = [
  {
    id: 1,
    keyword: "주식",
    question: "거대한 회사의 소유권을 아주 잘게 쪼갠 '소유권 조각'을 무엇이라 부를까요?",
    options: ["채권", "주식", "예금", "보험"],
    answerIndex: 1,
    explanation: "① 채권: 정부나 기업에 돈을 빌려주고 정해진 이자를 받는 차용증서입니다.\n② 주식 (정답): 회사의 소유권을 잘게 쪼갠 지분으로, 1주만 사도 회사의 어엿한 주주(주인)가 됩니다.\n③ 예금: 은행에 돈을 맡기고 정해진 원금과 이자를 안전하게 돌려받는 저축입니다.\n④ 보험: 미래의 사고나 질병 위험에 대비해 보험료를 내고 보장을 받는 금융 상품입니다."
  },
  {
    id: 2,
    keyword: "주가",
    question: "사고 싶은 사람(수요)과 팔고 싶은 사람(공급)의 실시간 힘겨루기로 매 순간 움직이는 주식 1개의 가격은?",
    options: ["공모가", "액면가", "주가", "기준가"],
    answerIndex: 2,
    explanation: "① 공모가: 기업이 주식시장에 처음 상장할 때 투자자에게 주식을 공모하는 초기 발행 가격입니다.\n② 액면가: 주권 표면에 적힌 종이 1장의 초기 법정 액면 금액입니다(실제 시장 거래가와 다름).\n③ 주가 (정답): 매수자와 매도자의 실시간 수요·공급에 의해 시장에서 매초 결정되는 주식 1개의 현재 가격입니다.\n④ 기준가: 펀드나 특정 금융 상품에서 하루 거래의 기준이 되는 1좌당 평가 가격입니다."
  },
  {
    id: 3,
    keyword: "시가총액",
    question: "[현재 주가 × 총 발행 주식 수]로 계산되는 시장이 평가하는 회사의 진짜 전체 몸값은?",
    options: ["자본금", "시가총액", "당기순이익", "매출액"],
    answerIndex: 1,
    explanation: "① 자본금: 주주들이 회사 설립 및 증자 시 실제로 납입한 법정 기본 출자금입니다.\n② 시가총액 (정답): [현재 주가 × 총 발행 주식 수]로 계산되며, 시장이 평가하는 기업 전체의 진짜 몸값(덩치)입니다.\n③ 당기순이익: 회사가 1년 동안 벌어들인 총수익에서 모든 비용과 세금을 뺀 순수 순이익입니다.\n④ 매출액: 제품이나 서비스를 판매하여 벌어들인 총금액(비용 차감 전 전체 외형)입니다."
  },
  {
    id: 4,
    keyword: "배당금",
    question: "회사가 사업으로 번 알짜 이익의 일부를 주주들에게 현금으로 나누어주는 보너스 용돈은?",
    options: ["환급금", "배당금", "퇴직금", "이자"],
    answerIndex: 1,
    explanation: "① 환급금: 세금이나 보험료 등을 더 많이 냈을 때 정산하여 되돌려받는 반환금입니다.\n② 배당금 (정답): 기업이 사업으로 번 이익의 일부를 주주에게 현금으로 환원하는 '월세 같은 현금 보너스'입니다.\n③ 퇴직금: 근로자가 퇴직할 때 근무 기간에 따라 지급받는 퇴직 급여입니다.\n④ 이자: 돈을 빌려주거나 예금에 맡겼을 때 대가로 받는 확정 수익입니다."
  },
  {
    id: 5,
    keyword: "종목코드 (티커)",
    question: "삼성전자(005930), 애플(AAPL)처럼 전 세계 증권 시장에서 각 상장 기업을 정확하게 식별하기 위해 부여된 고유 코드는?",
    options: ["바코드", "종목코드 (티커)", "계좌번호", "고유번호"],
    answerIndex: 1,
    explanation: "① 바코드: 마트 등에서 상품의 유통과 재고 관리를 위해 스캔하는 굵은 막대 기호입니다.\n② 종목코드 / 티커 (정답): 종목 검색 시 가장 정확한 식별 코드입니다. 한국은 '6자리 숫자 또는 숫자·알파벳 조합(삼성전자: 005930)', 미국은 '1~5자리 영문 티커(비자: V, 애플: AAPL, 구글: GOOGL)'를 사용합니다.\n③ 계좌번호: 금융 거래를 위해 개인에게 부여된 은행/증권 계좌 번호입니다.\n④ 고유번호: 주민등록번호, 사업자등록번호 등 일반 식별 번호입니다."
  },
  {
    id: 6,
    keyword: "증권거래소",
    question: "투자자들이 주식을 안전하고 공정하게 사고팔 수 있도록 국가 승인을 받은 공식 시장은?",
    options: ["증권거래소", "금융감독원", "한국은행", "국세청"],
    answerIndex: 0,
    explanation: "① 증권거래소 (정답): 투자자들이 주식을 안전하고 공정하게 사고팔 수 있도록 국가 승인을 받은 공식 장내 시장(한국: KRX 코스피/코스닥, 미국: NYSE/NASDAQ)입니다.\n② 금융감독원: 금융기관을 감독·검사하고 금융 소비자를 보호하는 감독 기구입니다.\n③ 한국은행: 통화 발행과 기준금리 결정 등 국가 통화정책을 총괄하는 중앙은행입니다.\n④ 국세청: 국가의 내국세 부과와 징수를 총괄하는 정부 기관입니다."
  },
  {
    id: 7,
    keyword: "시장 지수",
    question: "S&P 500, 나스닥 100처럼 시장 전체의 전반적인 분위기와 평균 성적을 보여주는 점수표는?",
    options: ["환율", "금리", "시장 지수", "물가상승률"],
    answerIndex: 2,
    explanation: "① 환율: 서로 다른 두 나라 통화 간의 교환 비율(예: 1달러 = 1,400원)입니다.\n② 금리: 돈을 빌리거나 맡길 때 원금에 대해 붙는 이자의 비율입니다.\n③ 시장 지수 (정답): 코스피, S&P 500처럼 시장에 속한 대표 기업들의 주가 흐름을 종합한 전반적인 평균 성적표입니다.\n④ 물가상승률: 소비하는 상품과 서비스의 전반적인 가격 수준이 상승하는 비율(인플레이션)입니다."
  },
  {
    id: 8,
    keyword: "예수금",
    question: "주식을 구매하기 위해 증권사 계좌에 미리 넣어둔 대기 중인 실제 투자금(현금 총알)은?",
    options: ["대출금", "미수금", "예수금", "적금"],
    answerIndex: 2,
    explanation: "① 대출금: 금융기관 등에서 이자를 내기로 약정하고 빌려온 돈입니다.\n② 미수금: 주식을 살 때 결제 대금이 부족하여 증권사에 갚아야 할 외상 대금입니다.\n③ 예수금 (정답): 주식을 구매하기 위해 계좌에 보관 중인 인출 가능한 순수 현금 총알입니다.\n④ 적금: 매월 정해진 금액을 일정 기간 모아 만기에 원금과 이자를 받는 저축입니다."
  },
  {
    id: 9,
    keyword: "호가",
    question: "주문 창을 켰을 때 현재 주가를 중심으로 사고팔기 위해 빽빽하게 줄 서 있는 실시간 가격표 장부는?",
    options: ["호가", "시가", "종가", "상한가"],
    answerIndex: 0,
    explanation: "① 호가 (정답): 투자자들이 주식을 사고팔기 위해 거래소에 제시하고 줄 서 있는 실시간 가격표 장부입니다.\n② 시가: 정규 주식 시장이 시작될 때(오전 9시) 처음으로 체결된 오늘의 시작 가격입니다.\n③ 종가: 정규 주식 시장이 마감될 때(오후 3시 30분) 마지막으로 체결된 오늘의 최종 가격입니다.\n④ 상한가: 하루 동안 주가가 오를 수 있는 국가가 정한 최대 상승 한도 가격(국내 ±30%)입니다."
  },
  {
    id: 10,
    keyword: "ETF",
    question: "수백 개 초우량 기업들을 한 바구니에 골고루 담아낸 주식 종합 선물 세트는?",
    options: ["개별주", "원자재", "ETF", "가상자산"],
    answerIndex: 2,
    explanation: "① 개별주: 삼성전자, 애플 등 단 1개의 특정 기업 주식만을 매수하는 형태입니다.\n② 원자재: 금, 은, 원유, 구리 등 실물 원자재 자산입니다.\n③ ETF (정답): 특정 지수를 추종하도록 수백 개 우량 기업을 한 바구니에 골고루 담아 주식처럼 실시간 매매하는 상장지수펀드입니다.\n④ 가상자산: 비트코인, 이더리움 등 블록체인 기반의 디지털 암호화폐입니다."
  }
];

export default function BasicTermsQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answeredQuestion, setAnsweredQuestion] = useState<TermQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalQuestions = BASIC_TERMS_QUESTIONS.length;
  const currentQ = BASIC_TERMS_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    
    setSelectedOption(idx);
    setIsAnswered(true);
    setAnsweredQuestion(currentQ);

    const isCorrect = idx === currentQ.answerIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setUserAnswers(prev => [...prev, isCorrect]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      triggerConfetti();
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setAnsweredQuestion(null);
    setScore(0);
    setUserAnswers([]);
    setIsCompleted(false);
  };

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  // 1. 완료 결과 화면
  if (isCompleted) {
    const isPerfect = score === totalQuestions;
    return (
      <div className="space-y-6 text-center animate-fadeIn py-2">
        <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shadow-inner">
          {isPerfect ? (
            <Award className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2]" />
          ) : (
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2]" />
          )}
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] font-mono">
            학습 완료
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {isPerfect ? '10대 필수 용어 100점 마스터!' : '필수 용어 퀴즈 완료!'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            {isPerfect 
              ? '주식 시장의 10대 기본 용어를 완벽하게 숙지하셨습니다.' 
              : `총 ${totalQuestions}문제 중 ${score}문제를 맞히셨습니다. 다시 풀며 복습해 보세요.`}
          </p>
        </div>

        {/* 점수 요약 박스 */}
        <div className="p-5 rounded-2xl bg-[var(--bg-main)]/60 border border-[var(--border-color)] max-w-sm mx-auto flex items-center justify-around">
          <div>
            <div className="text-xs text-[var(--text-secondary)] font-medium">맞힌 문제</div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--accent-orange)] font-mono">
              {score} <span className="text-sm text-[var(--text-secondary)] font-normal">/ {totalQuestions}</span>
            </div>
          </div>
          <div className="w-[1px] h-10 bg-[var(--border-color)]" />
          <div>
            <div className="text-xs text-[var(--text-secondary)] font-medium">정답률</div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-mono">
              {Math.round((score / totalQuestions) * 100)}%
            </div>
          </div>
        </div>

        {/* 다시 풀기 버튼 */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleReset}
            className="btn-primary !rounded-full !py-3 !px-6"
          >
            <RotateCcw className="w-4 h-4" />
            다시 풀어보기
          </button>
        </div>
      </div>
    );
  }

  // 2. 퀴즈 진행 화면
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 상단 프로그레스 & 진행률 헤더 (중복 타이틀 제거 및 슬림화) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold font-mono">
          <span className="text-[var(--text-secondary)]">문제 진행도</span>
          <span className="font-black text-[var(--accent-orange)]">
            {currentIndex + 1} <span className="text-[var(--text-secondary)] font-normal">/ {totalQuestions}</span>
          </span>
        </div>

        {/* 프로그레스 바 (No Border: 순수 트랙 색상 적용으로 다크모드 흰색 테두리 결함 방지) */}
        <div className="w-full h-2 bg-black/10 dark:bg-black/35 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent-orange)] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 문제 영역 */}
      <div className="pt-0.5">
        <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] leading-relaxed sm:leading-snug">
          {currentQ.question}
        </h3>
      </div>

      {/* 4지 선다 보기 버튼 (모바일/데스크톱 2분할 통일) */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrectAnswer = idx === currentQ.answerIndex;
          
          let cardStateClass = "";
          let badgeStateClass = "";
          
          if (isAnswered) {
            if (isCorrectAnswer) {
              cardStateClass = "!border-emerald-500 !bg-emerald-500/15 !text-emerald-700 dark:!text-emerald-300 !shadow-[0_0_18px_rgba(16,185,129,0.20)] font-bold";
              badgeStateClass = "!bg-emerald-500 !text-white !border-emerald-500 !shadow-sm";
            } else if (isSelected && !isCorrectAnswer) {
              cardStateClass = "!border-rose-500 !bg-rose-500/15 !text-rose-700 dark:!text-rose-300 !shadow-[0_0_18px_rgba(244,63,94,0.20)] font-bold";
              badgeStateClass = "!bg-rose-500 !text-white !border-rose-500 !shadow-sm";
            } else {
              cardStateClass = "opacity-40 !border-[var(--border-color)]/40 text-[var(--text-secondary)]";
              badgeStateClass = "!bg-[var(--bg-main)]/50 !text-[var(--text-secondary)] !border-[var(--border-color)]/50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className={`choice-card ${cardStateClass} !py-3 !px-2.5 sm:!px-3`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`choice-badge ${badgeStateClass} shrink-0`}>
                  {idx + 1}
                </span>
                <span className="font-bold text-xs sm:text-sm tracking-tight truncate">
                  {option}
                </span>
              </div>
              {isAnswered && isCorrectAnswer && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              {isAnswered && isSelected && !isCorrectAnswer && (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* 정답 해설 및 다음 문제 버튼 (스무스 전이로 레이아웃 시프트 방지 & 스포일러 차단) */}
      <div className={`grid transition-all duration-300 ease-out overflow-hidden ${
        isAnswered ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
      }`}>
        <div className="min-h-0 space-y-3.5 pt-1">
          {answeredQuestion && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)]/90 border border-[var(--border-color)] space-y-2.5 text-xs sm:text-sm shadow-2xs">
              <div className="font-bold flex items-center gap-1.5 text-[var(--accent-orange)] text-sm">
                <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                <span>정답: {answeredQuestion.options[answeredQuestion.answerIndex]}</span>
              </div>
              <p className="text-[var(--text-secondary)] font-medium leading-relaxed whitespace-pre-line text-xs sm:text-[13px]">
                {answeredQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-end pb-0.5">
            <button
              onClick={handleNextQuestion}
              className="btn-primary !rounded-full !py-2.5 !px-5 !text-xs sm:!text-sm"
            >
              <span>{currentIndex + 1 === totalQuestions ? '결과 보기' : '다음 문제'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
