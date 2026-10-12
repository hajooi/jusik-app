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
  BarChart3,
  ArrowLeftRight
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

// 20종 거시경제 위기 카드 (엄격한 현실 거시경제 인과관계 및 간결한 액션 어휘)
const RAW_EVENT_POOL: EventCard[] = [
  {
    id: 1,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "기름값이 폭등하며 온 세상에 불길이 번지고\n물가 상승률이 9%를 돌파했습니다!",
    choiceA: {
      text: "금리 대폭 인상",
      deltas: { cpi: -18, job: -12, profit: -14, market: -16 }
    },
    choiceB: {
      text: "유류세 인하 지원",
      deltas: { cpi: +18, job: +8, profit: +14, market: +8 }
    }
  },
  {
    id: 2,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "고금리로 지역은행들의 금고가 바닥났습니다!\n긴급 구제 자금을 시장에 풀어주세요!",
    choiceA: {
      text: "긴급 구제 자금 투입",
      deltas: { cpi: +14, job: 0, profit: +12, market: +18 }
    },
    choiceB: {
      text: "부실 은행 파산 방임",
      deltas: { cpi: -10, job: 0, profit: -18, market: -22 }
    }
  },
  {
    id: 3,
    speaker: "바위 골렘",
    role: "노동과 일자리의 거인",
    avatarType: "golem",
    dialogue: "물가가 너무 올라 일꾼들의 어깨가 무너집니다.\n기본 임금을 15% 올려주십시오!",
    choiceA: {
      text: "기본 임금 15% 인상",
      deltas: { cpi: +16, job: +18, profit: -18, market: 0 }
    },
    choiceB: {
      text: "임금 동결 권고",
      deltas: { cpi: -12, job: -18, profit: +16, market: 0 }
    }
  },
  {
    id: 4,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "선거의 계절이 눈앞으로 다가왔으니\n백성들의 표심을 위해 금리를 인하하라.",
    choiceA: {
      text: "기준금리 동결 유지",
      deltas: { cpi: -10, job: 0, profit: 0, market: -14 }
    },
    choiceB: {
      text: "깜짝 금리 인하",
      deltas: { cpi: +16, job: 0, profit: 0, market: +18 }
    }
  },
  {
    id: 5,
    speaker: "바위 골렘",
    role: "노동과 일자리의 거인",
    avatarType: "golem",
    dialogue: "대기업들이 자동화 구조조정을 내세워\n수많은 일꾼들을 대량 해고하고 있습니다!",
    choiceA: {
      text: "고용 유지 보조금",
      deltas: { cpi: 0, job: +18, profit: -16, market: -12 }
    },
    choiceB: {
      text: "자동화 혁신 장려",
      deltas: { cpi: 0, job: -20, profit: +20, market: +18 }
    }
  },
  {
    id: 6,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "안전한 국채 금리가 5%로 치솟으며\n주식 시장의 거대한 자금이 빠져나갑니다!",
    choiceA: {
      text: "국채 매입 긴급 개입",
      deltas: { cpi: +16, job: 0, profit: +10, market: +18 }
    },
    choiceB: {
      text: "시장 금리 자율 방임",
      deltas: { cpi: -12, job: 0, profit: -14, market: -18 }
    }
  },
  {
    id: 7,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "새 일자리가 예상보다 2배나 넘쳐납니다.\n고용 시장에 거대한 불이 붙었습니다!",
    choiceA: {
      text: "과열 진정 금리 인상",
      deltas: { cpi: -16, job: -14, profit: -10, market: -12 }
    },
    choiceB: {
      text: "금리 현행 유지",
      deltas: { cpi: +18, job: +14, profit: +12, market: +10 }
    }
  },
  {
    id: 8,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "도심의 상가들이 텅텅 비어가고 있다.\n상업용 부동산에 커다란 비상이 걸렸다.",
    choiceA: {
      text: "부동산 긴급 지원",
      deltas: { cpi: 0, job: +10, profit: +16, market: +12 }
    },
    choiceB: {
      text: "부실 자산 상각 유도",
      deltas: { cpi: 0, job: -14, profit: -18, market: -16 }
    }
  },
  {
    id: 9,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "인간들의 조급한 탐욕과 빚투로 인해\n주식 시장에 위험한 광풍이 불고 있습니다!",
    choiceA: {
      text: "대출 규제 및 긴축",
      deltas: { cpi: -8, job: 0, profit: 0, market: -22 }
    },
    choiceB: {
      text: "시장 자율 방임",
      deltas: { cpi: +14, job: 0, profit: 0, market: +22 }
    }
  },
  {
    id: 10,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "달러의 위세가 지나치게 강력해져\n제국의 수출 기업들이 울부짖고 있다.",
    choiceA: {
      text: "달러 약세 금리 인하",
      deltas: { cpi: +18, job: +8, profit: +18, market: +12 }
    },
    choiceB: {
      text: "강달러 기조 유지",
      deltas: { cpi: -16, job: -10, profit: -18, market: -12 }
    }
  },
  {
    id: 11,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "끝없는 고금리에 가계 빚이 터져 나가며\n대출 연체의 불씨가 번지고 있습니다.",
    choiceA: {
      text: "서민 구제 금리 인하",
      deltas: { cpi: +14, job: +12, profit: 0, market: +10 }
    },
    choiceB: {
      text: "부채 구조조정 감내",
      deltas: { cpi: -14, job: -14, profit: 0, market: -10 }
    }
  },
  {
    id: 12,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "기업들이 수십조 원의 자사주를 사들이며\n주식 시장에 엄청난 돈을 풀고 있습니다!",
    choiceA: {
      text: "주주 환원 지지",
      deltas: { cpi: 0, job: 0, profit: +12, market: +22 }
    },
    choiceB: {
      text: "자사주 매입 규제",
      deltas: { cpi: 0, job: 0, profit: -10, market: -18 }
    }
  },
  {
    id: 13,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "바다 건너 동맹국들이 금리를 내렸으니\n우리만 버티다간 국제적으로 고립된다.",
    choiceA: {
      text: "글로벌 공조 인하",
      deltas: { cpi: +16, job: +10, profit: +12, market: +16 }
    },
    choiceB: {
      text: "독자적 긴축 유지",
      deltas: { cpi: -14, job: -8, profit: -12, market: -16 }
    }
  },
  {
    id: 14,
    speaker: "바위 골렘",
    role: "노동과 일자리의 거인",
    avatarType: "golem",
    dialogue: "밥상 물가가 하룻밤 새 두 배로 치솟아\n거리의 서민들이 비명을 지르고 있습니다!",
    choiceA: {
      text: "수입 관세 철폐",
      deltas: { cpi: -20, job: -14, profit: -10, market: 0 }
    },
    choiceB: {
      text: "국내 농가 보조금",
      deltas: { cpi: +14, job: +14, profit: +12, market: 0 }
    }
  },
  {
    id: 15,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "장기 금리가 단기 금리 밑으로 추락하며\n역사적인 침체의 경고등이 켜졌습니다!",
    choiceA: {
      text: "선제적 금리 인하",
      deltas: { cpi: +14, job: +10, profit: +12, market: +18 }
    },
    choiceB: {
      text: "긴축 기조 지속",
      deltas: { cpi: -14, job: -12, profit: -14, market: -14 }
    }
  },
  {
    id: 16,
    speaker: "바위 골렘",
    role: "노동과 일자리의 거인",
    avatarType: "golem",
    dialogue: "젊은 일꾼들의 취업 문이 닫히며\n일자리가 힘없이 바스라지고 있습니다!",
    choiceA: {
      text: "청년 채용 보조금",
      deltas: { cpi: +8, job: +20, profit: 0, market: 0 }
    },
    choiceB: {
      text: "물가 안정 우선",
      deltas: { cpi: -12, job: -20, profit: 0, market: 0 }
    }
  },
  {
    id: 17,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "중고차와 가전제품의 불길이 잡히며\n마침내 인플레이션이 꺾이고 있습니다.",
    choiceA: {
      text: "금리 인하 준비",
      deltas: { cpi: +12, job: 0, profit: +12, market: +16 }
    },
    choiceB: {
      text: "긴축 기조 유지",
      deltas: { cpi: -16, job: 0, profit: -10, market: -12 }
    }
  },
  {
    id: 18,
    speaker: "황금 고블린",
    role: "월가의 요괴",
    avatarType: "goblin",
    dialogue: "주요 기업들의 실적이 급격히 꺾이며\n주식 시장이 폭락할 위기에 처했습니다!",
    choiceA: {
      text: "법인세 감세 지원",
      deltas: { cpi: +8, job: 0, profit: +20, market: +16 }
    },
    choiceB: {
      text: "부실 기업 퇴출",
      deltas: { cpi: -8, job: 0, profit: -18, market: -18 }
    }
  },
  {
    id: 19,
    speaker: "가면의 군주",
    role: "권력의 심판관",
    avatarType: "king",
    dialogue: "해외 열강들이 관세 장벽을 쌓고 있으니\n우리도 맞서 싸워야 하지 않겠는가.",
    choiceA: {
      text: "맞불 보복 관세",
      deltas: { cpi: +16, job: +14, profit: +12, market: -16 }
    },
    choiceB: {
      text: "대화와 무역 협상",
      deltas: { cpi: -12, job: -12, profit: -14, market: +16 }
    }
  },
  {
    id: 20,
    speaker: "불꽃의 마녀",
    role: "인플레이션의 화마",
    avatarType: "witch",
    dialogue: "물가 상승률이 목표치 2%에 안착하며\n거세게 타오르던 불길이 모두 잡혔습니다!",
    choiceA: {
      text: "금리 정상화 선언",
      deltas: { cpi: +10, job: +12, profit: +14, market: +18 }
    },
    choiceB: {
      text: "긴축 경계 유지",
      deltas: { cpi: -12, job: -6, profit: -8, market: -10 }
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

  // 직전 결정으로 인한 4대 지표 변동 폭 (Reigns 컬러 트랜지션 연출용)
  const [recentDeltas, setRecentDeltas] = useState<{ cpi: number; job: number; profit: number; market: number } | null>(null);
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

    // 1. Reigns 컬러 트랜지션 (게이지가 초록/빨강으로 물들며 스무스 변동)
    setRecentDeltas(deltas);

    if (deltaTimerRef.current) {
      clearTimeout(deltaTimerRef.current);
    }
    deltaTimerRef.current = setTimeout(() => {
      setRecentDeltas(null);
    }, 850);

    // 2. 카드를 지체 없이 시원하게 스와이프 아웃 (280ms)
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

      // 패배 판정 (Reigns 정통 8대 상·하한 양방향 밸런스)
      if (nextCpi >= 100) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 물가 폭발! 하이퍼인플레이션으로 즉각 해임",
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
          title: "특보: 실업률 대폭등! 제2의 대공황 도래로 파면",
          desc: "고금리 이자를 버티지 못한 기업들이 대량 해고를 단행했습니다. 길거리에 수백만 실업자가 넘쳐나며 대공황이 시작되었습니다."
        });
        return;
      }
      if (nextJob >= 100) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 극심한 구인난과 임금 폭등! 공장이 멈추며 경제 올스톱",
          desc: "일할 사람이 바닥나 기업들이 가게와 공장 문을 닫고 있습니다. 사람을 빼앗아 오기 위한 출혈적 임금 인상 경쟁이 불붙어 기업들이 파산 위기에 몰렸고, 경제가 마비되어 해임되었습니다."
        });
        return;
      }
      if (nextProfit <= 0) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 기업 연쇄 부도 사태! 산업 생태계 전면 붕괴",
          desc: "이자 비용을 감당하지 못한 수많은 기업들이 연쇄 도산했습니다. 산업 생태계가 바닥으로 곤두박질쳤습니다."
        });
        return;
      }
      if (nextProfit >= 100) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 탐욕의 독과점 폭리! 극단적 양극화에 성난 대중의 폭동",
          desc: "대기업들은 사상 최대의 흑자 잔치를 벌였지만, 서민들은 치솟은 가격과 낮은 보수에 등골이 휘었습니다. 독과점 폭리와 극단적인 양극화에 분노한 백성들이 거리로 쏟아져 나와 의회에 의해 불신임 탄핵되었습니다."
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
      if (nextMarket >= 100) {
        setGameState('gameover');
        setGameoverReason({
          title: "특보: 자산 버블 대폭발! 빚투 광풍 끝에 사상 최악의 금융위기 발발",
          desc: "너도나도 빚을 내어 주식을 사들이며 시장이 통제 불능의 광기에 빠졌습니다. 실물 경제와 동떨어진 거대한 거품이 결국 터지며 전 세계 금융 시스템이 순식간에 마비되었고, 금융위기를 방치한 책임을 물어 파면되었습니다."
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

  // 지능형 터치 방향 판별 상태 (가로 스와이프 vs 세로 스크롤)
  const [touchDirection, setTouchDirection] = useState<'horizontal' | 'vertical' | null>(null);
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 터치/마우스 드래그 핸들러
  const handleTouchStart = (clientX: number, clientY: number) => {
    if (gameState !== 'playing' || isSwipingOut) return;
    touchStartPos.current = { x: clientX, y: clientY };
    setTouchDirection(null);
    setIsDragging(false);
  };

  const handleTouchMove = (clientX: number, clientY: number) => {
    if (gameState !== 'playing' || isSwipingOut) return;

    const diffX = clientX - touchStartPos.current.x;
    const diffY = clientY - touchStartPos.current.y;

    // 첫 이동에서 방향 판별 (8px 기준)
    if (!touchDirection) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          // 가로 이동 ➔ 카드 스와이프 활성화
          setTouchDirection('horizontal');
          setIsDragging(true);
          setDragStartX(touchStartPos.current.x);
        } else {
          // 세로 이동 ➔ 페이지 스크롤 허용 (카드 고정)
          setTouchDirection('vertical');
          setIsDragging(false);
          return;
        }
      } else {
        return;
      }
    }

    // 가로 스와이프 모드일 때만 카드를 이동
    if (touchDirection === 'horizontal') {
      setDragOffset(Math.max(-160, Math.min(160, diffX)));
    }
  };

  const handleTouchEnd = () => {
    const wasHorizontal = touchDirection === 'horizontal';
    setIsDragging(false);
    setTouchDirection(null);

    if (wasHorizontal) {
      if (dragOffset < -65) {
        handleDecision('A');
      } else if (dragOffset > 65) {
        handleDecision('B');
      } else {
        setDragOffset(0);
      }
    } else {
      setDragOffset(0);
    }
  };

  const rotation = dragOffset * 0.08;

  // Reigns 시그니처: 드래그 중인 선택지에 따라 영향을 받을 지표 실시간 암시 (무영향 delta=0은 제외)
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
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 sm:p-2 rounded-xl bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] shrink-0">
              <Building2 className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight whitespace-nowrap">
              골디락스
            </h3>
          </div>

          {/* 턴 진행도 & 리셋 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2.5 py-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px] sm:text-xs font-mono font-bold text-[var(--text-primary)] shrink-0 whitespace-nowrap flex items-center gap-1">
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
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* 소제목 가이드 */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed pl-0.5 sm:pl-1 break-keep">
          뜨겁지도 차갑지도 않은 최적의 균형을 찾으세요.
        </p>
      </div>

      <div className="p-3 sm:p-6 pt-1">
        {/* ── 게임 상태 전환 SmoothHeight 스르륵 애니메이션 ── */}
        <SmoothHeight duration={550}>
          {/* ── PLAYING STATE: Reigns 정통 고정 게이지 & 틸트 오버랩 카드 ── */}
          {gameState === 'playing' && (
            <div className="flex flex-col items-center py-1">
              {/* 1. 상단 4대 아이콘 게이지 덱 (화면 상단 고정: 카드가 기울어져도 게이지는 안정적 유지) */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-[320px] sm:max-w-[340px] mx-auto mb-3">
                <ReignsIconGauge
                  label="물가"
                  value={cpi}
                  icon={Flame}
                  hasImpact={activeDeltas ? activeDeltas.cpi !== 0 : false}
                  delta={recentDeltas?.cpi}
                />
                <ReignsIconGauge
                  label="고용"
                  value={job}
                  icon={Briefcase}
                  hasImpact={activeDeltas ? activeDeltas.job !== 0 : false}
                  delta={recentDeltas?.job}
                />
                <ReignsIconGauge
                  label="실적"
                  value={profit}
                  icon={Layers}
                  hasImpact={activeDeltas ? activeDeltas.profit !== 0 : false}
                  delta={recentDeltas?.profit}
                />
                <ReignsIconGauge
                  label="시장"
                  value={market}
                  icon={BarChart3}
                  hasImpact={activeDeltas ? activeDeltas.market !== 0 : false}
                  delta={recentDeltas?.market}
                />
              </div>

              {/* 2. 카드 영역 컨테이너 */}
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[480px] sm:h-[510px]">
                {/* ── 앞쪽 카드 본체 (100% 불투명 단일 카드, 터치 스와이프 연동) ── */}
                <div
                  className="absolute inset-0 rounded-3xl border-2 border-[var(--border-color)] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing flex flex-col justify-between touch-pan-y select-none z-20"
                  style={{
                    transform: isSwipingOut
                      ? `translateX(${isSwipingOut === 'left' ? '-150%' : '150%'}) rotate(${isSwipingOut === 'left' ? '-25deg' : '25deg'})`
                      : `translateX(${dragOffset}px) rotate(${rotation}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                  onMouseDown={(e) => handleTouchStart(e.clientX, e.clientY)}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) handleTouchMove(e.clientX, e.clientY);
                  }}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                  onTouchStart={(e) => handleTouchStart(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={(e) => handleTouchMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* 카드를 채우는 Reigns 캐릭터 아트 일러스트 (100% 선명한 불투명) */}
                  <img
                    src={currentAvatar.src}
                    alt={currentCard.speaker}
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  />

                  {/* ★ 스와이프할수록 카드 배경이 서서히 어두워져 선택지 캡슐을 눈부시게 돋보이게 하는 동적 딤 오버레이 */}
                  <div
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-75 z-10"
                    style={{
                      opacity: Math.min(0.58, Math.abs(dragOffset) / 85),
                    }}
                  />

                  {/* 카드 상단 배지 바: 화자 이름 & 차수 (일체형) */}
                  <div className="relative z-20 pt-3 pb-2 px-3.5 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-md">
                      {currentCard.speaker}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[var(--accent-orange)] shadow-md">
                      {currentTurn} / {TOTAL_TURNS}
                    </span>
                  </div>

                  {/* ── ★ 카드 인라인 오버랩: 좌측 드래그 시 ➔ 카드 내 우측에 < 선택지 A 배치 ── */}
                  <div
                    className="absolute top-20 sm:top-24 right-3 sm:right-4 z-30 pointer-events-none flex justify-end transition-opacity duration-150"
                    style={{
                      opacity: Math.min(1, Math.max(0, -dragOffset / 25)),
                      display: dragOffset < -6 ? 'flex' : 'none'
                    }}
                  >
                    <div className="px-4 py-2 rounded-2xl bg-black/90 backdrop-blur-md border-2 border-rose-400 text-rose-100 font-black text-xs sm:text-sm shadow-2xl tracking-tight flex items-center gap-1.5">
                      <span className="text-rose-400 font-extrabold text-sm">&lt;</span>
                      <span>{currentCard.choiceA.text}</span>
                    </div>
                  </div>

                  {/* ── ★ 카드 인라인 오버랩: 우측 드래그 시 ➔ 카드 내 좌측에 선택지 B > 배치 ── */}
                  <div
                    className="absolute top-20 sm:top-24 left-3 sm:left-4 z-30 pointer-events-none flex justify-start transition-opacity duration-150"
                    style={{
                      opacity: Math.min(1, Math.max(0, dragOffset / 25)),
                      display: dragOffset > 6 ? 'flex' : 'none'
                    }}
                  >
                    <div className="px-4 py-2 rounded-2xl bg-black/90 backdrop-blur-md border-2 border-emerald-400 text-emerald-100 font-black text-xs sm:text-sm shadow-2xl tracking-tight flex items-center gap-1.5">
                      <span>{currentCard.choiceB.text}</span>
                      <span className="text-emerald-400 font-extrabold text-sm">&gt;</span>
                    </div>
                  </div>

                  {/* 평소 대기 시 좌우 스와이프 안내 바운스 인디케이터 (‹ ›) */}
                  {!isDragging && dragOffset === 0 && (
                    <>
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 font-mono text-base animate-pulse">
                        ‹
                      </div>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 font-mono text-base animate-pulse">
                        ›
                      </div>
                    </>
                  )}

                  {/* 카드 하단 다크 오버레이: 캐릭터 2줄 대사 말풍선 단독 배치 */}
                  <div className="relative z-20 pt-16 pb-5 px-4 bg-gradient-to-t from-black/95 via-black/85 to-transparent flex flex-col gap-2 pointer-events-none">
                    <p className="text-xs sm:text-[13.5px] font-extrabold text-white text-center [text-wrap:balance] break-keep leading-relaxed drop-shadow-md whitespace-pre-line px-1">
                      "{currentCard.dialogue}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. 카드 최하단 스와이프 안내 가이드 문구 */}
              <div className="mt-3.5 text-center text-xs text-[var(--text-secondary)] font-medium flex items-center justify-center gap-1.5 select-none pointer-events-none">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
                <span>카드를 좌우로 밀어서 선택하세요</span>
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
                  가장 완벽한 경제의 봄
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md mx-auto leading-relaxed pt-1 [text-wrap:balance] break-keep">
                  뜨겁지도 차갑지도 않은 최적의 균형을 찾아냈습니다. 물가와 고용, 실적과 시장의 완벽한 조화로 역사적인 '골디락스(연착륙)'를 이룩했습니다.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={initGame}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  새로운 12턴 도전하기
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
                  제{currentTurn}차 회의에서 임기 종료
                </span>
                <h4 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-2 [text-wrap:balance] break-keep">
                  {gameoverReason.title}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md mx-auto leading-relaxed pt-1 [text-wrap:balance] break-keep">
                  {gameoverReason.desc}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/80 border border-rose-500/30 max-w-md mx-auto text-xs text-[var(--text-secondary)] leading-relaxed [text-wrap:balance] break-keep">
                💡 <strong>교훈</strong>: 경제는 너무 차가워도(0%) 얼어붙고, 너무 뜨거워도(100%) 폭발합니다. 4대 지표의 온도를 골디락스 구간에 머물게 해야 합니다.
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={initGame}
                  className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>다시 도전하기</span>
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
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  hasImpact?: boolean;
  delta?: number;
}) {
  const isDanger = value <= 20 || value >= 80;
  const clampedValue = Math.max(0, Math.min(100, value));
  const CIRCLE_CIRCUMFERENCE = 125.66; // 2 * Math.PI * 20 (r=20)
  const hasDelta = delta !== undefined && delta !== 0;

  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-none relative">
      {/* 1. Reigns 상단 임팩트 점 (드래그 시 영향받는 지표 위에 점등) */}
      <div className="h-2.5 flex items-center justify-center relative">
        {hasImpact ? (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
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
          {/* 실시간 수위 프로그레스 링 (결정 시 초록/빨강으로 물들며 스무스 변동) */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke={
              hasDelta
                ? delta! > 0
                  ? '#10B981'
                  : '#F43F5E'
                : isDanger
                  ? '#F43F5E'
                  : '#F18F01'
            }
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={CIRCLE_CIRCUMFERENCE * (1 - clampedValue / 100)}
            className="transition-all duration-500 ease-out"
            style={{
              filter: hasDelta
                ? delta! > 0
                  ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.95))'
                  : 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.95))'
                : isDanger 
                  ? 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.75))' 
                  : 'drop-shadow(0 0 6px rgba(241, 143, 1, 0.65))'
            }}
          />
        </svg>

        {/* 중앙 글래스모픽 코어 (변동 시 색상 하이라이트) */}
        <div
          className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-500 shadow-md ${
            hasDelta
              ? delta! > 0
                ? 'bg-emerald-950/85 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-rose-950/85 border border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
              : isDanger
                ? 'bg-rose-950/85 border border-rose-500/50 text-rose-300'
                : 'bg-black/75 border border-white/20 text-white'
          }`}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        </div>
      </div>

      {/* 3. 미니멀 지표 라벨 */}
      <span
        className={`text-[10px] font-extrabold tracking-tight drop-shadow-sm transition-colors duration-300 ${
          hasDelta
            ? delta! > 0
              ? 'text-emerald-400'
              : 'text-rose-400'
            : isDanger
              ? 'text-rose-400'
              : 'text-white/90'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
