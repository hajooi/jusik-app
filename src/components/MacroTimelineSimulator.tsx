'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Sparkles, 
  AlertTriangle, 
  RotateCcw, 
  Award, 
  Flame, 
  Briefcase, 
  Layers, 
  BarChart3 
} from 'lucide-react';
import SmoothHeight from '@/components/SmoothHeight';

interface Choice {
  text: string;
  deltas: {
    cpi: number;      // 물가
    job: number;      // 고용
    profit: number;   // 기업 실적
    market: number;   // 주식 시장
  };
}

interface EventCard {
  id: number;
  speaker: string;
  role: string;
  avatarType: 'witch' | 'goblin' | 'golem' | 'king';
  dialogue: string;
  choiceA: Choice;
  choiceB: Choice;
}

const AVATAR_MAP = {
  witch: {
    src: '/images/lessons/lv4-1/avatars/witch.jpg',
    alt: '불꽃의 마녀 (물가)',
  },
  goblin: {
    src: '/images/lessons/lv4-1/avatars/goblin.jpg',
    alt: '황금 고블린 (월가)',
  },
  golem: {
    src: '/images/lessons/lv4-1/avatars/golem.jpg',
    alt: '바위 골렘 (노동)',
  },
  king: {
    src: '/images/lessons/lv4-1/avatars/king.jpg',
    alt: '가면의 군주 (권력)',
  },
};

// 20종 거시경제 위기 카드 (자연스러운 2줄 균형 호흡의 대사)
const RAW_EVENT_POOL: EventCard[] = [
  {
    id: 1,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "기름값이 폭등하며 온 세상에 불길이 번지고\n물가 상승률이 9%를 돌파했습니다!",
    choiceA: {
      text: "금리를 크게 올려 불길을 잡는다",
      deltas: { cpi: -20, job: -12, profit: -14, market: -16 }
    },
    choiceB: {
      text: "경기를 위해 금리를 살짝만 올린다",
      deltas: { cpi: +18, job: +8, profit: +6, market: +10 }
    }
  },
  {
    id: 2,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "고금리로 지역은행들의 금고가 바닥났습니다!\n긴급 구제 자금을 시장에 풀어주세요!",
    choiceA: {
      text: "은행에 긴급 자금을 지원한다",
      deltas: { cpi: +14, job: +8, profit: +10, market: +18 }
    },
    choiceB: {
      text: "부실 은행을 스스로 망하게 둔다",
      deltas: { cpi: -10, job: -14, profit: -18, market: -22 }
    }
  },
  {
    id: 3,
    speaker: "바위 골렘",
    role: "노동과 일자리의 거인",
    avatarType: "golem",
    dialogue: "물가가 너무 올라 일꾼들의 어깨가 무너집니다.\n기본 임금을 15% 올려주십시오!",
    choiceA: {
      text: "임금 인상 요구를 지지한다",
      deltas: { cpi: +20, job: +12, profit: -16, market: -8 }
    },
    choiceB: {
      text: "물가 안정을 위해 자제를 요청한다",
      deltas: { cpi: -12, job: -12, profit: +8, market: +6 }
    }
  },
  {
    id: 4,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "선거의 계절이 눈앞으로 다가왔으니\n백성들의 표심을 위해 금리를 인하하라.",
    choiceA: {
      text: "군주의 압박을 거부하고 동결한다",
      deltas: { cpi: -10, job: -8, profit: -6, market: -12 }
    },
    choiceB: {
      text: "군주의 명대로 금리를 내린다",
      deltas: { cpi: +18, job: +12, profit: +14, market: +20 }
    }
  },
  {
    id: 5,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "기술 기업들의 실적이 활활 타오르며\n시장 전체가 뜨겁게 달아오르고 있습니다!",
    choiceA: {
      text: "혁신을 축하하며 금리를 유지한다",
      deltas: { cpi: +6, job: +10, profit: +18, market: +16 }
    },
    choiceB: {
      text: "거품을 경고하며 금리 인상을 시사한다",
      deltas: { cpi: -12, job: -8, profit: -10, market: -20 }
    }
  },
  {
    id: 6,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "안전한 국채 금리가 5%로 치솟으며\n주식 시장의 거대한 자금이 빠져나갑니다!",
    choiceA: {
      text: "국채를 사들여 금리 상승을 누른다",
      deltas: { cpi: +16, job: +8, profit: +10, market: +18 }
    },
    choiceB: {
      text: "시장의 자연스러운 탐욕에 맡긴다",
      deltas: { cpi: -10, job: -10, profit: -12, market: -16 }
    }
  },
  {
    id: 7,
    speaker: "바위 골렘",
    role: "노동과 일자리의 거인",
    avatarType: "golem",
    dialogue: "대기업들이 자동화 구조조정을 내세워\n수많은 일꾼들을 대량 해고하고 있습니다!",
    choiceA: {
      text: "금리를 즉시 내려 고용을 살린다",
      deltas: { cpi: +14, job: +18, profit: +6, market: +14 }
    },
    choiceB: {
      text: "산업 변화로 보고 개입하지 않는다",
      deltas: { cpi: -8, job: -20, profit: +12, market: -6 }
    }
  },
  {
    id: 8,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "새 일자리가 예상보다 2배나 넘쳐납니다.\n고용 시장에 거대한 불이 붙었습니다!",
    choiceA: {
      text: "과열을 식히기 위해 금리를 올린다",
      deltas: { cpi: -14, job: -10, profit: -8, market: -12 }
    },
    choiceB: {
      text: "좋은 신호로 보고 금리를 둔다",
      deltas: { cpi: +16, job: +12, profit: +10, market: +12 }
    }
  },
  {
    id: 9,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "도심의 상가들이 텅텅 비어가고 있다.\n상업용 부동산에 커다란 비상이 걸렸다.",
    choiceA: {
      text: "부동산 구제 자금을 지원한다",
      deltas: { cpi: +12, job: +8, profit: +14, market: +12 }
    },
    choiceB: {
      text: "부실 건물의 손실 처리를 유도한다",
      deltas: { cpi: -12, job: -14, profit: -18, market: -16 }
    }
  },
  {
    id: 10,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "인간들의 조급한 탐욕과 빚투로 인해\n주식 시장에 위험한 광풍이 불고 있습니다!",
    choiceA: {
      text: "투기 과열을 경고하고 돈줄을 죈다",
      deltas: { cpi: -12, job: -6, profit: -8, market: -22 }
    },
    choiceB: {
      text: "시장의 뜨거운 자율 흐름에 맡긴다",
      deltas: { cpi: +14, job: +6, profit: +8, market: +20 }
    }
  },
  {
    id: 11,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "중고차와 가전제품의 불길이 잡히며\n마침내 인플레이션이 꺾이고 있습니다.",
    choiceA: {
      text: "불길이 잡혔으니 금리 인하를 준비한다",
      deltas: { cpi: +10, job: +10, profit: +14, market: +14 }
    },
    choiceB: {
      text: "아직 잔불이 남았으니 긴축을 유지한다",
      deltas: { cpi: -12, job: -8, profit: -10, market: -10 }
    }
  },
  {
    id: 12,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "달러의 위세가 지나치게 강력해져\n제국의 수출 기업들이 울부짖고 있다.",
    choiceA: {
      text: "금리 인하 신호로 달러 가치를 낮춘다",
      deltas: { cpi: +14, job: +10, profit: +16, market: +12 }
    },
    choiceB: {
      text: "강달러가 물가를 낮춰주니 그대로 둔다",
      deltas: { cpi: -12, job: -8, profit: -12, market: -8 }
    }
  },
  {
    id: 13,
    speaker: "바위 골렘",
    role: "노동과 일자리의 거인",
    avatarType: "golem",
    dialogue: "젊은 일꾼들의 취업 문이 닫히며\n일자리가 힘없이 바스라지고 있습니다!",
    choiceA: {
      text: "청년 일자리를 위해 금리를 낮춘다",
      deltas: { cpi: +12, job: +16, profit: +8, market: +12 }
    },
    choiceB: {
      text: "물가 안정이 먼저라며 버틴다",
      deltas: { cpi: -14, job: -16, profit: -8, market: -10 }
    }
  },
  {
    id: 14,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "끝없는 고금리에 가계 빚이 터져 나가며\n대출 연체의 불씨가 번지고 있습니다.",
    choiceA: {
      text: "가계 파산을 막기 위해 금리를 내린다",
      deltas: { cpi: +14, job: +12, profit: +12, market: +14 }
    },
    choiceB: {
      text: "부채 다이어트를 위해 인내한다",
      deltas: { cpi: -14, job: -14, profit: -14, market: -12 }
    }
  },
  {
    id: 15,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "주요 기업들의 실적이 급격히 꺾이며\n주식 시장이 폭락할 위기에 처했습니다!",
    choiceA: {
      text: "실적 방어를 위해 유동성을 푼다",
      deltas: { cpi: +12, job: +8, profit: +16, market: +18 }
    },
    choiceB: {
      text: "약한 기업을 걸러내는 정화로 삼는다",
      deltas: { cpi: -10, job: -14, profit: -16, market: -20 }
    }
  },
  {
    id: 16,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "바다 건너 동맹국들이 금리를 내렸으니\n우리만 버티다간 국제적으로 고립된다.",
    choiceA: {
      text: "글로벌 추세에 맞춰 함께 내린다",
      deltas: { cpi: +16, job: +12, profit: +12, market: +16 }
    },
    choiceB: {
      text: "우리 경제의 튼튼한 체력을 믿고 버틴다",
      deltas: { cpi: -12, job: -8, profit: -8, market: -12 }
    }
  },
  {
    id: 17,
    speaker: "바위 골렘",
    role: "노동과 일자리의 거인",
    avatarType: "golem",
    dialogue: "밥상 물가가 하룻밤 새 두 배로 치솟아\n거리의 서민들이 비명을 지르고 있습니다!",
    choiceA: {
      text: "물가를 잡기 위해 강력히 긴축한다",
      deltas: { cpi: -18, job: -10, profit: -12, market: -16 }
    },
    choiceB: {
      text: "정부에 유통 대책을 맡기고 지켜본다",
      deltas: { cpi: +14, job: +6, profit: +6, market: +8 }
    }
  },
  {
    id: 18,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "장기 금리가 단기 금리 밑으로 추락하며\n역사적인 침체의 경고등이 켜졌습니다!",
    choiceA: {
      text: "침체에 대비해 선제적으로 금리를 내린다",
      deltas: { cpi: +16, job: +14, profit: +12, market: +18 }
    },
    choiceB: {
      text: "과거의 저주일 뿐이라며 동결한다",
      deltas: { cpi: -10, job: -12, profit: -12, market: -10 }
    }
  },
  {
    id: 19,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "기업들이 수십조 원의 자사주를 구매하며\n주식 시장에 엄청난 돈을 풀고 있습니다!",
    choiceA: {
      text: "주주 환원을 환영하며 신뢰를 보낸다",
      deltas: { cpi: +8, job: +6, profit: +14, market: +20 }
    },
    choiceB: {
      text: "미래 투자 대신 겉포장만 올린다며 비판한다",
      deltas: { cpi: -8, job: -4, profit: -6, market: -14 }
    }
  },
  {
    id: 20,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "물가 상승률이 목표치 2%에 안착하며\n거세게 타오르던 불길이 모두 잡혔습니다!",
    choiceA: {
      text: "목표 달성을 선언하고 금리를 정상화한다",
      deltas: { cpi: +4, job: +10, profit: +12, market: +16 }
    },
    choiceB: {
      text: "마녀의 속임수일 수 있으니 긴장을 유지한다",
      deltas: { cpi: -12, job: -8, profit: -8, market: -8 }
    }
  }
];

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function MacroTimelineSimulator() {
  const TOTAL_TURNS = 12;

  // 4대 게이지 상태 (0~100, 초기 50) - 숫자 표시 없이 순수 채움 바로 작동
  const [cpi, setCpi] = useState<number>(50);       // 물가
  const [job, setJob] = useState<number>(50);       // 고용
  const [profit, setProfit] = useState<number>(50); // 기업 실적
  const [market, setMarket] = useState<number>(50); // 주식 시장

  // 직전 결정으로 인한 4대 지표 변동 폭 (Reigns 플로팅 변동 뱃지 연출용)
  const [recentDeltas, setRecentDeltas] = useState<{ cpi: number; job: number; profit: number; market: number } | null>(null);
  const [recentDeltaKey, setRecentDeltaKey] = useState<number>(0);
  const deltaTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [deck, setDeck] = useState<EventCard[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'victory'>('playing');
  const [gameoverReason, setGameoverReason] = useState<{ title: string; desc: string }>({ title: '', desc: '' });

  // 카드 스와이프 인터랙션 상태
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [isSwipingOut, setIsSwipingOut] = useState<'left' | 'right' | null>(null);

  const initGame = () => {
    setCpi(50);
    setJob(50);
    setProfit(50);
    setMarket(50);
    setRecentDeltas(null);
    if (deltaTimerRef.current) {
      clearTimeout(deltaTimerRef.current);
    }
    setCurrentTurn(1);
    setGameState('playing');
    setDragOffset(0);
    setIsSwipingOut(null);
    setDeck(shuffleArray(RAW_EVENT_POOL).slice(0, TOTAL_TURNS));
  };

  useEffect(() => {
    initGame();
  }, []);

  const currentCard = deck[currentTurn - 1] || RAW_EVENT_POOL[0];

  const handleDecision = (choice: 'A' | 'B') => {
    if (gameState !== 'playing' || isSwipingOut) return;

    const selectedChoice = choice === 'A' ? currentCard.choiceA : currentCard.choiceB;
    const { deltas } = selectedChoice;

    // Reigns 시그니처: 선택 즉시 4대 지표 변동 뱃지 팝핑 애니메이션 가동 (약 2.1초 유지)
    setRecentDeltas(deltas);
    setRecentDeltaKey(prev => prev + 1);

    if (deltaTimerRef.current) {
      clearTimeout(deltaTimerRef.current);
    }
    deltaTimerRef.current = setTimeout(() => {
      setRecentDeltas(null);
    }, 2100);

    setIsSwipingOut(choice === 'A' ? 'left' : 'right');

    setTimeout(() => {
      const nextCpi = Math.max(0, Math.min(100, cpi + deltas.cpi));
      const nextJob = Math.max(0, Math.min(100, job + deltas.job));
      const nextProfit = Math.max(0, Math.min(100, profit + deltas.profit));
      const nextMarket = Math.max(0, Math.min(100, market + deltas.market));

      setCpi(nextCpi);
      setJob(nextJob);
      setProfit(nextProfit);
      setMarket(nextMarket);
      setDragOffset(0);
      setIsSwipingOut(null);

      // 패배 판정
      if (nextCpi >= 100) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 물가 폭발! 하이퍼인플레이션으로 의장 즉각 해임",
          desc: "물가를 방치하다 화폐 가치가 휴지조각이 되었습니다. 마트에서 빵 한 덩이를 사려고 돈뭉치를 수레에 싣고 다니는 지경에 이르렀습니다."
        });
        return;
      }
      if (nextCpi <= 0) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 디플레이션 나선 진입! 소비 급랭으로 국가 경제 마비",
          desc: "과도한 긴축으로 물가가 마이너스로 추락했습니다. 아무도 물건을 사지 않고 돈을 쥐고만 있어 기업들이 연쇄 폐업했습니다."
        });
        return;
      }
      if (nextJob <= 0) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 실업률 대폭등! 제2의 대공황 도래로 의장 파면",
          desc: "고금리 이자를 버티지 못한 기업들이 대량 해고를 단행했습니다. 길거리에 수백만 실업자가 넘쳐나며 대공황이 시작되었습니다."
        });
        return;
      }
      if (nextProfit <= 0) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 기업 연쇄 부도 사태! 미국 산업 생태계 전면 붕괴",
          desc: "이자 비용을 감당하지 못한 기업들의 70%가 부도를 신청했습니다. 경제 생산성이 바닥으로 곤두박질쳤습니다."
        });
        return;
      }
      if (nextMarket <= 0) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 블랙 먼데이 대참사! 주식 시장 폭락에 금융 붕괴",
          desc: "투자자들의 패닉 셀로 증시 서킷브레이커가 연일 발동되었습니다. 월스트리트 은행들이 파산하며 시장이 침몰했습니다."
        });
        return;
      }

      // 턴 진행 또는 승리
      if (currentTurn >= TOTAL_TURNS) {
        setGameState('victory');
      } else {
        setCurrentTurn(prev => prev + 1);
      }
    }, 280);
  };

  // 터치/마우스 드래그 핸들러
  const handleTouchStart = (clientX: number) => {
    if (gameState !== 'playing' || isSwipingOut) return;
    setIsDragging(true);
    setDragStartX(clientX);
  };

  const handleTouchMove = (clientX: number) => {
    if (!isDragging || gameState !== 'playing') return;
    const diff = clientX - dragStartX;
    setDragOffset(Math.max(-160, Math.min(160, diff)));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset < -70) {
      handleDecision('A');
    } else if (dragOffset > 70) {
      handleDecision('B');
    } else {
      setDragOffset(0);
    }
  };

  const rotation = dragOffset * 0.08;

  // 좌/우 스와이프 진행도 및 버튼 동적 반응 계산
  const dragProgressA = Math.min(1, Math.max(0, -dragOffset / 50));
  const dragProgressB = Math.min(1, Math.max(0, dragOffset / 50));
  const opacityA = dragOffset < 0 ? 1 : Math.max(0, 0.9 - dragProgressB * 1.8);
  const scaleA = 1 + dragProgressA * 0.05;
  const opacityB = dragOffset > 0 ? 1 : Math.max(0, 0.9 - dragProgressA * 1.8);
  const scaleB = 1 + dragProgressB * 0.05;

  // Reigns 시그니처: 드래그 중인 선택지에 따라 영향을 받을 지표 실시간 암시
  const activeDeltas = dragOffset < -15 
    ? currentCard.choiceA.deltas 
    : dragOffset > 15 
      ? currentCard.choiceB.deltas 
      : null;

  const currentAvatar = AVATAR_MAP[currentCard.avatarType];

  return (
    <div className="w-full my-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--card-surface)]/90 backdrop-blur-md overflow-hidden shadow-2xs select-none">
      {/* ── Top Title Bar ── */}
      <div className="px-4 sm:px-6 pt-5 pb-2 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
              <Building2 className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight truncate">
              거시경제 사령관의 결단
            </h3>
          </div>

          {/* 턴 진행도 & 리셋 */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono font-bold text-[var(--text-primary)] shrink-0 whitespace-nowrap flex items-center gap-1">
              <span className="text-[var(--accent-orange)]">{currentTurn}</span>
              <span className="text-[var(--text-secondary)]">/</span>
              <span>{TOTAL_TURNS}</span>
            </div>
            <button
              type="button"
              onClick={initGame}
              className="p-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shrink-0 cursor-pointer"
              title="새 게임 시작"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 소제목 가이드 */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed pl-1 sm:pl-2 break-keep">
          모든 것을 만족시키는 완벽한 선택은 없습니다. 12번의 위기 속에서 4대 지표의 균형을 지켜내세요.
        </p>
      </div>

      <div className="p-3 sm:p-6 pt-1">
        {/* ── 게임 상태 전환 SmoothHeight 스르륵 애니메이션 ── */}
        <SmoothHeight duration={550}>
          {/* ── PLAYING STATE: Reigns 완전 일체형 롱 카드 (h-[540px] sm:h-[590px]) ── */}
          {gameState === 'playing' && (
            <div className="flex flex-col items-center py-2">
              {/* 카드 본체: 세로로 길어진 비율 & 상단 Reigns 아이콘 게이지 일체형 결합 */}
              <div
                className="relative w-full max-w-[340px] sm:max-w-[380px] h-[540px] sm:h-[590px] rounded-3xl border-2 border-[var(--border-color)] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-transform duration-100 flex flex-col justify-between"
                style={{
                  transform: isSwipingOut
                    ? `translateX(${isSwipingOut === 'left' ? '-150%' : '150%'}) rotate(${isSwipingOut === 'left' ? '-25deg' : '25deg'})`
                    : `translateX(${dragOffset}px) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                onMouseDown={(e) => handleTouchStart(e.clientX)}
                onMouseMove={(e) => handleTouchMove(e.clientX)}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
                onTouchEnd={handleTouchEnd}
              >
                {/* 1. 카드를 100% 꽉 채우는 Reigns 캐릭터 아트 일러스트 */}
                <img
                  src={currentAvatar.src}
                  alt={currentCard.speaker}
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 hover:scale-105"
                />

                {/* 2. 카드 최상단 일체형 헤더: Reigns 4대 아이콘 Liquid Fill 게이지 & 화자 배지 */}
                <div className="relative z-20 pt-3.5 pb-2 px-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex flex-col gap-2 pointer-events-none">
                  {/* 4대 아이콘 게이지 덱 */}
                  <div className="grid grid-cols-4 gap-2 w-full max-w-[320px] mx-auto">
                    <ReignsIconGauge
                      label="물가"
                      value={cpi}
                      icon={Flame}
                      hasImpact={activeDeltas ? activeDeltas.cpi !== 0 : false}
                      delta={recentDeltas?.cpi}
                      deltaKey={recentDeltaKey}
                    />
                    <ReignsIconGauge
                      label="고용"
                      value={job}
                      icon={Briefcase}
                      hasImpact={activeDeltas ? activeDeltas.job !== 0 : false}
                      delta={recentDeltas?.job}
                      deltaKey={recentDeltaKey}
                    />
                    <ReignsIconGauge
                      label="실적"
                      value={profit}
                      icon={Layers}
                      hasImpact={activeDeltas ? activeDeltas.profit !== 0 : false}
                      delta={recentDeltas?.profit}
                      deltaKey={recentDeltaKey}
                    />
                    <ReignsIconGauge
                      label="시장"
                      value={market}
                      icon={BarChart3}
                      hasImpact={activeDeltas ? activeDeltas.market !== 0 : false}
                      delta={recentDeltas?.market}
                      deltaKey={recentDeltaKey}
                    />
                  </div>

                  {/* 화자 이름 배지 & 차수 */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-md">
                      {currentCard.speaker}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[var(--accent-orange)] shadow-md">
                      {currentTurn} / {TOTAL_TURNS}
                    </span>
                  </div>
                </div>

                {/* 3. 카드 하단 다크 오버레이: 2줄 대사 + 선택 버튼 (방향어/화살표 제거) */}
                <div className="relative z-20 pt-16 pb-4 px-3.5 bg-gradient-to-t from-black/95 via-black/85 to-transparent flex flex-col gap-3">
                  {/* 2줄 반반 대사 말풍선 */}
                  <p className="text-xs sm:text-[13px] font-extrabold text-white text-center [text-wrap:balance] break-keep leading-relaxed drop-shadow-md whitespace-pre-line px-1 pointer-events-none">
                    "{currentCard.dialogue}"
                  </p>

                  {/* 스와이프 연동 카드 내부 인라인 버튼 (오른쪽/왼쪽 문구 및 화살표 완전 제거) */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {/* 선택 A 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecision('A');
                      }}
                      style={{
                        opacity: opacityA,
                        transform: `scale(${scaleA})`,
                        pointerEvents: opacityA < 0.2 ? 'none' : 'auto',
                        transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                      }}
                      className={`p-2.5 rounded-2xl backdrop-blur-md border text-left transition-colors flex flex-col justify-between shadow-lg cursor-pointer ${
                        dragOffset < -15
                          ? 'bg-rose-600/90 border-rose-400 text-white shadow-rose-950/50'
                          : 'bg-black/65 border-white/20 hover:border-rose-400/80 hover:bg-black/80 text-white'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold text-rose-300 mb-0.5 tracking-wide">
                        선택 A
                      </div>
                      <div className="text-[11px] sm:text-xs font-bold leading-snug [text-wrap:balance] break-keep line-clamp-2">
                        {currentCard.choiceA.text}
                      </div>
                    </button>

                    {/* 선택 B 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecision('B');
                      }}
                      style={{
                        opacity: opacityB,
                        transform: `scale(${scaleB})`,
                        pointerEvents: opacityB < 0.2 ? 'none' : 'auto',
                        transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                      }}
                      className={`p-2.5 rounded-2xl backdrop-blur-md border text-right transition-colors flex flex-col justify-between items-end shadow-lg cursor-pointer ${
                        dragOffset > 15
                          ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-emerald-950/50'
                          : 'bg-black/65 border-white/20 hover:border-emerald-400/80 hover:bg-black/80 text-white'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold text-emerald-300 mb-0.5 text-right tracking-wide">
                        선택 B
                      </div>
                      <div className="text-[11px] sm:text-xs font-bold leading-snug [text-wrap:balance] break-keep text-right line-clamp-2">
                        {currentCard.choiceB.text}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── VICTORY STATE (12턴 완주) ── */}
          {gameState === 'victory' && (
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500/10 via-[var(--card-surface)] to-emerald-500/5 border border-emerald-500/40 text-center space-y-4 shadow-lg animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-2xs">
                <Award className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  12턴 완주 성공!
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight mt-2">
                  전설의 경제 사령관: 골디락스 마스터
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md mx-auto leading-relaxed pt-1 [text-wrap:balance] break-keep">
                  물가를 잡으면서도 실업률을 방어하고 기업 실적을 지켜냈습니다! 미국 경제를 역사적인 '연착륙'으로 이끈 위대한 사령관으로 기록되었습니다.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={initGame}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  새로운 12턴 임기 도전하기
                </button>
              </div>
            </div>
          )}

          {/* ── GAMEOVER STATE (파면) ── */}
          {gameState === 'gameover' && (
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-500/10 via-[var(--card-surface)] to-rose-500/5 border border-rose-500/40 text-center space-y-4 shadow-lg animate-in fade-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center shadow-2xs">
                <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  제{currentTurn}차 회의에서 사령관 파면
                </span>
                <h4 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-2 [text-wrap:balance] break-keep">
                  {gameoverReason.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md mx-auto leading-relaxed pt-1 [text-wrap:balance] break-keep">
                  {gameoverReason.desc}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/80 border border-rose-500/30 max-w-md mx-auto text-xs text-[var(--text-secondary)] leading-relaxed [text-wrap:balance] break-keep">
                💡 <strong>교훈</strong>: 거시경제는 어느 한쪽만 무리하게 밀어붙이면 다른 게이지가 터져버립니다. 물가와 실업률, 기업 실적의 정밀한 밸런스를 잡아야 합니다.
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={initGame}
                  className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>사령관 다시 도전하기</span>
                </button>
              </div>
            </div>
          )}
        </SmoothHeight>
      </div>
    </div>
  );
}

// Reigns 스타일 원형 링(Circular Progress Ring) 게이지 컴포넌트
function ReignsIconGauge({
  label,
  value,
  icon: Icon,
  hasImpact = false,
  delta,
  deltaKey,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  hasImpact?: boolean;
  delta?: number;
  deltaKey?: number;
}) {
  const isDanger = value <= 20 || value >= 80;
  const clampedValue = Math.max(0, Math.min(100, value));
  const CIRCLE_CIRCUMFERENCE = 125.66; // 2 * Math.PI * 20 (r=20)
  const hasDelta = delta !== undefined && delta !== 0;

  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-none relative">
      {/* 1. Reigns 상단 임팩트 점 or 결정 즉시 튀어오르는 플로팅 델타 변동 뱃지 */}
      <div className="h-4 flex items-center justify-center relative">
        {hasDelta ? (
          <span
            key={`delta-${deltaKey}-${delta}`}
            className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-tight whitespace-nowrap shadow-lg border backdrop-blur-md animate-reigns-delta ${
              delta! > 0
                ? 'bg-emerald-500 text-white border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.85)]'
                : 'bg-rose-500 text-white border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.85)]'
            }`}
          >
            {delta! > 0 ? `▲+${delta}` : `▼${delta}`}
          </span>
        ) : hasImpact ? (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b] animate-ping" />
        ) : (
          <span className="w-1.5 h-1.5 opacity-0" />
        )}
      </div>

      {/* 2. Apple식 정밀 원형 Circular Progress Ring 게이지 */}
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
        {/* SVG 원형 둘레 게이지 링 */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
          {/* 배경 트랙 링 */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="3.2"
            fill="none"
          />
          {/* 실시간 수위 프로그레스 링 */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke={isDanger ? '#F43F5E' : '#F18F01'}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - clampedValue / 100)}
            className="transition-all duration-300"
            style={{
              filter: hasDelta
                ? delta! > 0
                  ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.9))'
                  : 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.9))'
                : isDanger 
                  ? 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.75))' 
                  : 'drop-shadow(0 0 6px rgba(241, 143, 1, 0.65))'
            }}
          />
        </svg>

        {/* 중앙 글래스모픽 코어 (배경 아트와 완벽히 분리되어 아이콘 선명도 100% 확보) */}
        <div
          className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-md ${
            isDanger
              ? 'bg-rose-950/85 border border-rose-500/50 text-rose-300'
              : 'bg-black/75 border border-white/20 text-white'
          }`}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        </div>
      </div>

      {/* 3. 미니멀 지표 라벨 */}
      <span
        className={`text-[10px] font-extrabold tracking-tight drop-shadow-sm ${
          isDanger ? 'text-rose-400' : 'text-white/90'
        }`}
      >
        {label}
      </span>

      {/* Reigns 시그니처 플로팅 델타 뱃지 애니메이션 키프레임 */}
      <style>{`
        @keyframes reignsDeltaFloat {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.75);
          }
          15% {
            opacity: 1;
            transform: translateY(0px) scale(1.08);
          }
          75% {
            opacity: 1;
            transform: translateY(-2px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-8px) scale(0.85);
          }
        }
        .animate-reigns-delta {
          animation: reignsDeltaFloat 2.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
