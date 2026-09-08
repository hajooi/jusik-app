'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CURRICULUM_DATA } from '@/data/curriculum';

export interface UserAccount {
  nickname: string;
  pin: string;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
  completedLessons?: string[];
  investmentType?: string;
  typeAnswers?: Record<number, number>;
  simulatorSettings?: any;
  favoriteTools?: string[];
  rankPercentile?: number;
  isPro?: boolean;
  proExpiresAt?: string;
  hasCompletedCourse?: boolean; // 전 강좌 수강 완료 영구 업적 플래그 (우등생 뱃지 해금)
  termsQuizBest?: {
    level: number;
    score: number;
    correctCount: number;
    timeSpentSec: number;
    percentile?: number;
    badgeName?: string;
  };
  activeBadge?: 'type_only' | 'terms_percentile' | 'terms_master' | 'honor_student' | string;
}

interface AuthContextType {
  user: UserAccount | null;
  isPro: boolean;
  proExpiresAt: string | null;
  completedLessons: string[];
  investmentType: string | null;
  typeAnswers: Record<number, number> | null;
  simulatorSettings: any | null;
  favoriteTools: string[];
  isAuthPopoverOpen: boolean;
  isAuthPopoverClosing: boolean;
  openAuthPopover: () => void;
  closeAuthPopover: () => void;
  toggleAuthPopover: () => void;
  login: (nickname: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePin: (newPin: string) => Promise<{ success: boolean; error?: string }>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  markLessonCompleted: (lessonId: string) => void;
  toggleLessonCompleted: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  updateInvestmentType: (typeCode: string, answers: Record<number, number>) => void;
  updateSimulatorSettings: (settings: any) => void;
  updateAvatar: (avatarUrl: string) => void;
  updateTermsQuizResult: (result: {
    level: number;
    score: number;
    correctCount: number;
    timeSpentSec: number;
    percentile?: number;
    badgeName?: string;
  }) => void;
  updateActiveBadge: (badgeMode: string) => void;
  toggleFavoriteTool: (toolId: string) => void;
  isFavoriteTool: (toolId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'jusik_app_user_account';
const LOCAL_COMPLETED_LESSONS_KEY = 'jusik_app_completed_lessons';
const LOCAL_TYPE_ANSWERS_KEY = 'jusik_type_answers';
const LOCAL_TYPE_CODE_KEY = 'jusik_type_code';
const LOCAL_SIMULATOR_SETTINGS_KEY = 'jusik_custom_simulator_settings';
const LOCAL_FAVORITE_TOOLS_KEY = 'jusik_favorite_tools';

// 40문항 완결 검증 헬퍼 (40문항 미만의 임시 데이터가 계정이나 서버 DB를 오염시키는 것을 원천 차단)
const isFullSurveyAnswers = (answers?: Record<number, number> | null): boolean => {
  return !!answers && typeof answers === 'object' && Object.keys(answers).length === 40;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [investmentType, setInvestmentType] = useState<string | null>(null);
  const [typeAnswers, setTypeAnswers] = useState<Record<number, number> | null>(null);
  const [simulatorSettings, setSimulatorSettings] = useState<any | null>(null);
  const [favoriteTools, setFavoriteTools] = useState<string[]>([]);
  const [isAuthPopoverOpen, setIsAuthPopoverOpen] = useState<boolean>(false);
  const [isAuthPopoverClosing, setIsAuthPopoverClosing] = useState<boolean>(false);

  // 디바운스 타이머 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const favDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 로드 시 로컬 및 서버 상태 복원
  useEffect(() => {
    try {
      const localCompletedJson = localStorage.getItem(LOCAL_COMPLETED_LESSONS_KEY);
      const initialCompleted: string[] = localCompletedJson ? JSON.parse(localCompletedJson) : [];
      setCompletedLessons(initialCompleted);

      const localFavJson = localStorage.getItem(LOCAL_FAVORITE_TOOLS_KEY);
      const initialFavorites: string[] = localFavJson ? JSON.parse(localFavJson) : [];
      setFavoriteTools(initialFavorites);

      const savedUserJson = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUserJson) {
        const parsedUser: UserAccount = JSON.parse(savedUserJson);
        setUser(parsedUser);

        if (parsedUser.completedLessons && parsedUser.completedLessons.length > 0) {
          const merged = Array.from(new Set([...initialCompleted, ...parsedUser.completedLessons]));
          setCompletedLessons(merged);
        }
        if (parsedUser.favoriteTools && parsedUser.favoriteTools.length > 0) {
          const mergedFavs = Array.from(new Set([...initialFavorites, ...parsedUser.favoriteTools]));
          setFavoriteTools(mergedFavs);
        }
        if (parsedUser.investmentType) setInvestmentType(parsedUser.investmentType);
        if (parsedUser.typeAnswers && isFullSurveyAnswers(parsedUser.typeAnswers)) {
          setTypeAnswers(parsedUser.typeAnswers);
        }
        if (parsedUser.simulatorSettings) setSimulatorSettings(parsedUser.simulatorSettings);

        // 서버 최신 데이터 동기화 및 자동 복구(Auto-Healing)
        const userPin = parsedUser.pin || '';
        if (parsedUser.nickname && userPin) {
          fetch(`/api/sync?nickname=${encodeURIComponent(parsedUser.nickname)}&pin=${encodeURIComponent(userPin)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.user) {
                const serverUser: UserAccount = {
                  ...data.user,
                  pin: userPin,
                  isPro: data.user.isPro,
                  proExpiresAt: data.user.proExpiresAt,
                  hasCompletedCourse: Boolean(parsedUser.hasCompletedCourse || data.user.hasCompletedCourse),
                };
                setUser(serverUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(serverUser));

                if (data.user.completedLessons) {
                  setCompletedLessons(data.user.completedLessons);
                  localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(data.user.completedLessons));
                }
                if (data.user.favoriteTools) {
                  setFavoriteTools(data.user.favoriteTools);
                  localStorage.setItem(LOCAL_FAVORITE_TOOLS_KEY, JSON.stringify(data.user.favoriteTools));
                }
                if (data.user.investmentType) {
                  setInvestmentType(data.user.investmentType);
                  localStorage.setItem(LOCAL_TYPE_CODE_KEY, data.user.investmentType);
                }
                if (data.user.termsQuizBest) {
                  localStorage.setItem('jusik_terms_quiz_best', JSON.stringify(data.user.termsQuizBest));
                }
                if (data.user.typeAnswers && isFullSurveyAnswers(data.user.typeAnswers)) {
                  setTypeAnswers(data.user.typeAnswers);
                  localStorage.setItem(LOCAL_TYPE_ANSWERS_KEY, JSON.stringify(data.user.typeAnswers));
                  localStorage.setItem('jusik_type_completed', 'true');
                }
                if (data.user.simulatorSettings) {
                  setSimulatorSettings(data.user.simulatorSettings);
                  localStorage.setItem(LOCAL_SIMULATOR_SETTINGS_KEY, JSON.stringify(data.user.simulatorSettings));
                }
              } else if (data.notFound) {
                // [Auto-Healing] 서버 DB에 계정이 누락된 경우, 브라우저 로컬 데이터(핀번호, 성향 등)로 서버에 즉시 자동 복구 등록
                const validAnswers = parsedUser.typeAnswers && isFullSurveyAnswers(parsedUser.typeAnswers)
                  ? parsedUser.typeAnswers
                  : (() => {
                      try {
                        const localAns = localStorage.getItem(LOCAL_TYPE_ANSWERS_KEY);
                        const parsed = localAns ? JSON.parse(localAns) : null;
                        return isFullSurveyAnswers(parsed) ? parsed : undefined;
                      } catch {
                        return undefined;
                      }
                    })();

                fetch('/api/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'login',
                    nickname: parsedUser.nickname,
                    pin: userPin,
                    completedLessons: parsedUser.completedLessons || initialCompleted,
                    investmentType: parsedUser.investmentType || localStorage.getItem(LOCAL_TYPE_CODE_KEY) || undefined,
                    typeAnswers: validAnswers,
                    simulatorSettings: parsedUser.simulatorSettings || undefined,
                    avatarUrl: parsedUser.avatarUrl || undefined,
                    activeBadge: parsedUser.activeBadge || undefined,
                    termsQuizBest: parsedUser.termsQuizBest || undefined,
                    favoriteTools: parsedUser.favoriteTools || initialFavorites,
                  })
                })
                  .then((r) => r.json())
                  .then((healData) => {
                    if (healData.success && healData.user) {
                      console.log('[Auto-Healing] User successfully restored on server:', parsedUser.nickname);
                    }
                  })
                  .catch((err) => console.error('[Auto-Healing] error:', err));
              }
            })
            .catch((err) => console.error('Server sync fetch error:', err));
        }
      }
    } catch (e) {
      console.error('Auth restore error:', e);
      setUser(null);
    }
  }, []);

  const openAuthPopover = () => {
    setIsAuthPopoverClosing(false);
    setIsAuthPopoverOpen(true);
  };

  const closeAuthPopover = () => {
    if (isAuthPopoverClosing || !isAuthPopoverOpen) return;
    setIsAuthPopoverClosing(true);
    setTimeout(() => {
      setIsAuthPopoverOpen(false);
      setIsAuthPopoverClosing(false);
    }, 180);
  };

  const toggleAuthPopover = () => {
    if (isAuthPopoverOpen) {
      closeAuthPopover();
    } else {
      openAuthPopover();
    }
  };

  // 수강 완료 내역 서버 실시간 동기화
  const updateCompletedLessonsState = (newCompletedList: string[]) => {
    setCompletedLessons(newCompletedList);
    localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(newCompletedList));

    // 동적으로 전체 커리큘럼 강의 수 파악 (앞으로 강의가 추가되어도 자동 반영)
    const allLessonIds = CURRICULUM_DATA.flatMap((level) => level.lessons).map((l) => l.id);
    const totalLessonCount = allLessonIds.length;
    const isNowAllDone = totalLessonCount > 0 && allLessonIds.every((id) => newCompletedList.includes(id));

    if (user && user.nickname) {
      const userPin = user.pin || '';
      // 영구 업적 달성형: 한 번 달성되었거나 지금 달성되면 영구 true 유지
      const nextHasCompletedCourse = Boolean(user.hasCompletedCourse || isNowAllDone);

      const updatedUser: UserAccount = {
        ...user,
        pin: userPin,
        completedLessons: newCompletedList,
        hasCompletedCourse: nextHasCompletedCourse,
        lastLoginAt: new Date().toISOString()
      };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      if (userPin) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'syncData',
            nickname: user.nickname,
            pin: userPin,
            completedLessons: newCompletedList,
            hasCompletedCourse: nextHasCompletedCourse,
            investmentType,
            typeAnswers: isFullSurveyAnswers(typeAnswers) ? typeAnswers : undefined,
            simulatorSettings
          })
        }).catch((e) => console.error('Server syncData error:', e));
      }
    }
  };

  // 투자 성향 진단 결과 서버 동기화
  const updateInvestmentType = (typeCode: string, answers: Record<number, number>) => {
    if (!isFullSurveyAnswers(answers)) {
      console.warn('Incomplete survey answers (not 40 questions), skipped updateInvestmentType sync.');
      return;
    }

    setInvestmentType(typeCode);
    setTypeAnswers(answers);
    localStorage.setItem(LOCAL_TYPE_CODE_KEY, typeCode);
    localStorage.setItem(LOCAL_TYPE_ANSWERS_KEY, JSON.stringify(answers));
    localStorage.setItem('jusik_type_completed', 'true');

    if (user && user.nickname) {
      const userPin = user.pin || '';
      const updatedUser: UserAccount = {
        ...user,
        pin: userPin,
        investmentType: typeCode,
        typeAnswers: answers,
        lastLoginAt: new Date().toISOString()
      };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      if (userPin) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'syncData',
            nickname: user.nickname,
            pin: userPin,
            completedLessons,
            investmentType: typeCode,
            typeAnswers: answers,
            simulatorSettings
          })
        }).catch((e) => console.error('Server updateInvestmentType error:', e));
      }
    }
  };

  // 시뮬레이터 커스텀 포트폴리오 세팅 서버 동기화 (500ms 디바운스)
  const updateSimulatorSettings = (settings: any) => {
    setSimulatorSettings(settings);
    localStorage.setItem(LOCAL_SIMULATOR_SETTINGS_KEY, JSON.stringify(settings));

    if (user && user.nickname) {
      const userPin = user.pin || '';
      const updatedUser: UserAccount = {
        ...user,
        pin: userPin,
        simulatorSettings: settings,
        lastLoginAt: new Date().toISOString()
      };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (userPin) {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'syncData',
              nickname: user.nickname,
              pin: userPin,
              completedLessons,
              investmentType,
              typeAnswers: isFullSurveyAnswers(typeAnswers) ? typeAnswers : undefined,
              simulatorSettings: settings
            })
          }).catch((e) => console.error('Server updateSimulatorSettings error:', e));
        }
      }, 500);
    }
  };

  // 프로필 아바타 이미지 서버 동기화
  const updateAvatar = (avatarUrl: string) => {
    if (user && user.nickname) {
      const userPin = user.pin || '';
      const updatedUser: UserAccount = {
        ...user,
        pin: userPin,
        avatarUrl,
        lastLoginAt: new Date().toISOString()
      };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      if (userPin) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'syncData',
            nickname: user.nickname,
            pin: userPin,
            avatarUrl,
            completedLessons,
            investmentType,
            typeAnswers: isFullSurveyAnswers(typeAnswers) ? typeAnswers : undefined,
            simulatorSettings
          })
        }).catch((e) => console.error('Server updateAvatar error:', e));
      }
    }
  };

  // 퀴즈 결과 및 뱃지 업데이트
  const updateTermsQuizResult = (result: {
    level: number;
    score: number;
    correctCount: number;
    timeSpentSec: number;
    percentile?: number;
    badgeName?: string;
  }) => {
    const prevBest = user?.termsQuizBest;
    const isBetter =
      !prevBest ||
      result.score > prevBest.score ||
      (result.score === prevBest.score && result.timeSpentSec < prevBest.timeSpentSec);

    const targetBadgeName =
      result.percentile && result.percentile <= 10
        ? `상위 ${result.percentile}%`
        : result.level === 4 && result.correctCount >= 14
        ? '마스터'
        : `상위 ${result.percentile || 50}%`;

    const newBest = isBetter
      ? { ...result, badgeName: targetBadgeName }
      : prevBest;

    if (user) {
      const updatedUser: UserAccount = {
        ...user,
        termsQuizBest: newBest,
        activeBadge: user.activeBadge,
      };

      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      localStorage.setItem('jusik_terms_quiz_best', JSON.stringify(newBest));

      if (user.pin) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'syncData',
            nickname: user.nickname,
            pin: user.pin,
            termsQuizBest: newBest,
            activeBadge: updatedUser.activeBadge,
          }),
        }).catch(console.error);
      }
    } else {
      // 비로그인(게스트) 상태일 때는 user 계정을 임의로 생성하지 않고 최고 기록만 로컬에 보관
      localStorage.setItem('jusik_terms_quiz_best', JSON.stringify(newBest));
    }
  };

  const updateActiveBadge = (badgeMode: string) => {
    if (user) {
      const updatedUser: UserAccount = {
        ...user,
        activeBadge: badgeMode,
      };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      if (user.pin) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'syncData',
            nickname: user.nickname,
            pin: user.pin,
            activeBadge: badgeMode,
          }),
        }).catch(console.error);
      }
    }
  };

  const markLessonCompleted = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      const nextList = [...completedLessons, lessonId];
      updateCompletedLessonsState(nextList);
    }
  };

  const toggleLessonCompleted = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) {
      const nextList = completedLessons.filter((id) => id !== lessonId);
      updateCompletedLessonsState(nextList);
    } else {
      const nextList = [...completedLessons, lessonId];
      updateCompletedLessonsState(nextList);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  // 즐겨찾기 도구 토글 및 서버/로컬 동기화
  const toggleFavoriteTool = (toolId: string) => {
    setFavoriteTools((prev) => {
      const isAlready = prev.includes(toolId);
      const nextFavorites = isAlready
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId];

      localStorage.setItem(LOCAL_FAVORITE_TOOLS_KEY, JSON.stringify(nextFavorites));

      if (user && user.nickname) {
        const userPin = user.pin || '';
        const updatedUser: UserAccount = {
          ...user,
          pin: userPin,
          favoriteTools: nextFavorites,
          lastLoginAt: new Date().toISOString(),
        };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

        if (favDebounceTimerRef.current) {
          clearTimeout(favDebounceTimerRef.current);
        }

        favDebounceTimerRef.current = setTimeout(() => {
          if (userPin) {
            fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'syncData',
                nickname: user.nickname,
                pin: userPin,
                completedLessons,
                investmentType,
                typeAnswers: isFullSurveyAnswers(typeAnswers) ? typeAnswers : undefined,
                simulatorSettings,
                favoriteTools: nextFavorites,
              }),
            }).catch((e) => console.error('Server syncData favoriteTools error:', e));
          }
        }, 400);
      }

      return nextFavorites;
    });
  };

  const isFavoriteTool = (toolId: string) => {
    return favoriteTools.includes(toolId);
  };

  // 서버 로그인 처리
  const login = async (nickname: string, pin: string) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          nickname,
          pin,
          completedLessons,
          investmentType,
          typeAnswers: isFullSurveyAnswers(typeAnswers) ? typeAnswers : undefined,
          simulatorSettings,
          favoriteTools,
        })
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || '로그인에 실패했습니다.' };
      }

      const serverUser: UserAccount = {
        ...data.user,
        pin
      };

      setUser(serverUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(serverUser));

      const serverCompleted: string[] = data.user.completedLessons || [];
      setCompletedLessons(serverCompleted);
      localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(serverCompleted));

      if (data.user.favoriteTools) {
        const mergedFavs = Array.from(new Set([...favoriteTools, ...data.user.favoriteTools]));
        setFavoriteTools(mergedFavs);
        localStorage.setItem(LOCAL_FAVORITE_TOOLS_KEY, JSON.stringify(mergedFavs));
      }

      if (data.user.investmentType && data.user.investmentType !== '미진단') {
        setInvestmentType(data.user.investmentType);
        localStorage.setItem(LOCAL_TYPE_CODE_KEY, data.user.investmentType);
      } else if (investmentType && investmentType !== '미진단') {
        // Keep existing client investmentType if server has none
        localStorage.setItem(LOCAL_TYPE_CODE_KEY, investmentType);
      }

      if (data.user.typeAnswers && isFullSurveyAnswers(data.user.typeAnswers)) {
        setTypeAnswers(data.user.typeAnswers);
        localStorage.setItem(LOCAL_TYPE_ANSWERS_KEY, JSON.stringify(data.user.typeAnswers));
        localStorage.setItem('jusik_type_completed', 'true');
      } else if (typeAnswers && Object.keys(typeAnswers).length > 0) {
        // Keep existing client typeAnswers if server has none
        localStorage.setItem(LOCAL_TYPE_ANSWERS_KEY, JSON.stringify(typeAnswers));
        localStorage.setItem('jusik_type_completed', 'true');
      }

      if (data.user.simulatorSettings) {
        setSimulatorSettings(data.user.simulatorSettings);
        localStorage.setItem(LOCAL_SIMULATOR_SETTINGS_KEY, JSON.stringify(data.user.simulatorSettings));
      } else if (simulatorSettings) {
        // Keep existing client simulatorSettings if server has none
        localStorage.setItem(LOCAL_SIMULATOR_SETTINGS_KEY, JSON.stringify(simulatorSettings));
      }

      // If client had data that server didn't have, push updated client data back to server
      const finalInvestmentType = data.user.investmentType || investmentType;
      const finalTypeAnswers = data.user.typeAnswers || typeAnswers;
      const finalSimulatorSettings = data.user.simulatorSettings || simulatorSettings;

      if (!data.user.investmentType || !data.user.simulatorSettings || !data.user.typeAnswers) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'syncData',
            nickname,
            pin,
            completedLessons: serverCompleted,
            investmentType: finalInvestmentType,
            typeAnswers: finalTypeAnswers,
            simulatorSettings: finalSimulatorSettings
          })
        }).catch((e) => console.error('Post-login sync error:', e));
      }

      return { success: true };
    } catch (e) {
      console.error('Login API error:', e);
      return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
    }
  };

  const changePin = async (newPin: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !user.nickname) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    if (!newPin || !/^\d{6}$/.test(newPin)) {
      return { success: false, error: '핀번호는 숫자 6자리로 입력해 주세요.' };
    }

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'changePin',
          nickname: user.nickname,
          pin: user.pin,
          newPin
        })
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || '핀번호 변경에 실패했습니다.' };
      }

      // Update local state and localStorage
      const updatedUser = { ...user, pin: newPin };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      localStorage.setItem('jusik_user_pin', newPin);

      return { success: true };
    } catch (e) {
      console.error('changePin error:', e);
      return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
    }
  };

  // Pro Membership Status Evaluation (유효한 proExpiresAt 만료일을 보유하거나 영구 PRO인 경우만 인정, 만료 시 즉시 회수)
  const isPro = !!(
    user &&
    (user.proExpiresAt
      ? new Date(user.proExpiresAt).getTime() > Date.now()
      : user.isPro === true)
  );

  // Pro 만료일 (실제 등록된 만료일 표기)
  const proExpiresAt = user?.proExpiresAt || null;

  const redeemPromoCode = async (code: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!user || !user.nickname) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      return { success: false, error: '유효한 4자리 코드를 입력해 주세요.' };
    }

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redeemPromoCode',
          nickname: user.nickname,
          pin: user.pin,
          code: cleanCode
        })
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || '코드 등록에 실패했습니다.' };
      }

      if (data.user) {
        const updatedUser: UserAccount = {
          ...user,
          ...data.user,
          pin: user.pin
        };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }

      return { success: true, message: data.message || 'Pro 코드가 성공적으로 등록되었습니다!' };
    } catch (e) {
      console.error('redeemPromoCode error:', e);
      return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
    }
  };

  const logout = () => {
    // 1. Wipe all local storage keys
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LOCAL_COMPLETED_LESSONS_KEY);
    localStorage.removeItem(LOCAL_TYPE_CODE_KEY);
    localStorage.removeItem(LOCAL_TYPE_ANSWERS_KEY);
    localStorage.removeItem(LOCAL_SIMULATOR_SETTINGS_KEY);
    localStorage.removeItem('jusik_type_completed');
    localStorage.removeItem('jusik_user_pin');

    // 2. Reset all React auth states cleanly
    setUser(null);
    setCompletedLessons([]);
    setInvestmentType('미진단');
    setTypeAnswers({});
    setSimulatorSettings(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isPro,
        proExpiresAt,
        completedLessons,
        investmentType,
        typeAnswers,
        simulatorSettings,
        favoriteTools,
        isAuthPopoverOpen,
        isAuthPopoverClosing,
        openAuthPopover,
        closeAuthPopover,
        toggleAuthPopover,
        login,
        logout,
        changePin,
        redeemPromoCode,
        markLessonCompleted,
        toggleLessonCompleted,
        isLessonCompleted,
        updateInvestmentType,
        updateSimulatorSettings,
        updateAvatar,
        updateTermsQuizResult,
        updateActiveBadge,
        toggleFavoriteTool,
        isFavoriteTool,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
