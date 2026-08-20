'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
  rankPercentile?: number;
  termsQuizBest?: {
    level: number;
    score: number;
    correctCount: number;
    timeSpentSec: number;
    percentile?: number;
    badgeName?: string;
  };
  activeBadge?: 'type_only' | 'terms_percentile' | 'terms_master' | string;
}

interface AuthContextType {
  user: UserAccount | null;
  completedLessons: string[];
  investmentType: string | null;
  typeAnswers: Record<number, number> | null;
  simulatorSettings: any | null;
  isAuthPopoverOpen: boolean;
  isAuthPopoverClosing: boolean;
  openAuthPopover: () => void;
  closeAuthPopover: () => void;
  toggleAuthPopover: () => void;
  login: (nickname: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePin: (newPin: string) => Promise<{ success: boolean; error?: string }>;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'jusik_app_user_account';
const LOCAL_COMPLETED_LESSONS_KEY = 'jusik_app_completed_lessons';
const LOCAL_TYPE_ANSWERS_KEY = 'jusik_type_answers';
const LOCAL_TYPE_CODE_KEY = 'jusik_type_code';
const LOCAL_SIMULATOR_SETTINGS_KEY = 'jusik_custom_simulator_settings';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [investmentType, setInvestmentType] = useState<string | null>(null);
  const [typeAnswers, setTypeAnswers] = useState<Record<number, number> | null>(null);
  const [simulatorSettings, setSimulatorSettings] = useState<any | null>(null);
  const [isAuthPopoverOpen, setIsAuthPopoverOpen] = useState<boolean>(false);
  const [isAuthPopoverClosing, setIsAuthPopoverClosing] = useState<boolean>(false);

  // 디바운스 타이머 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 로드 시 로컬 및 서버 상태 복원
  useEffect(() => {
    try {
      const localCompletedJson = localStorage.getItem(LOCAL_COMPLETED_LESSONS_KEY);
      const initialCompleted: string[] = localCompletedJson ? JSON.parse(localCompletedJson) : [];
      setCompletedLessons(initialCompleted);

      const savedUserJson = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUserJson) {
        const parsedUser: UserAccount = JSON.parse(savedUserJson);
        setUser(parsedUser);

        if (parsedUser.completedLessons && parsedUser.completedLessons.length > 0) {
          const merged = Array.from(new Set([...initialCompleted, ...parsedUser.completedLessons]));
          setCompletedLessons(merged);
        }
        if (parsedUser.investmentType) setInvestmentType(parsedUser.investmentType);
        if (parsedUser.typeAnswers) setTypeAnswers(parsedUser.typeAnswers);
        if (parsedUser.simulatorSettings) setSimulatorSettings(parsedUser.simulatorSettings);

        // 서버 최신 데이터 동기화 및 자동 복구(Auto-Healing)
        const userPin = parsedUser.pin || (parsedUser.nickname === '주식부엉' ? '418019' : '');
        if (parsedUser.nickname && userPin) {
          fetch(`/api/sync?nickname=${encodeURIComponent(parsedUser.nickname)}&pin=${encodeURIComponent(userPin)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.user) {
                const serverUser: UserAccount = {
                  ...data.user,
                  pin: userPin
                };
                setUser(serverUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(serverUser));

                if (data.user.completedLessons) {
                  setCompletedLessons(data.user.completedLessons);
                  localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(data.user.completedLessons));
                }
                if (data.user.investmentType) {
                  setInvestmentType(data.user.investmentType);
                  localStorage.setItem(LOCAL_TYPE_CODE_KEY, data.user.investmentType);
                }
                if (data.user.termsQuizBest) {
                  localStorage.setItem('jusik_terms_quiz_best', JSON.stringify(data.user.termsQuizBest));
                }
                if (data.user.typeAnswers) {
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
                fetch('/api/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'login',
                    nickname: parsedUser.nickname,
                    pin: userPin,
                    completedLessons: parsedUser.completedLessons || initialCompleted,
                    investmentType: parsedUser.investmentType || localStorage.getItem(LOCAL_TYPE_CODE_KEY) || undefined,
                    typeAnswers: parsedUser.typeAnswers || (localStorage.getItem(LOCAL_TYPE_ANSWERS_KEY) ? JSON.parse(localStorage.getItem(LOCAL_TYPE_ANSWERS_KEY)!) : undefined),
                    simulatorSettings: parsedUser.simulatorSettings || undefined,
                    avatarUrl: parsedUser.avatarUrl || undefined,
                    activeBadge: parsedUser.activeBadge || undefined,
                    termsQuizBest: parsedUser.termsQuizBest || undefined,
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

    if (user && user.nickname) {
      const userPin = user.pin || (user.nickname === '주식부엉' ? '418019' : '');
      const updatedUser: UserAccount = {
        ...user,
        pin: userPin,
        completedLessons: newCompletedList,
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
            investmentType,
            typeAnswers,
            simulatorSettings
          })
        }).catch((e) => console.error('Server syncData error:', e));
      }
    }
  };

  // 투자 성향 진단 결과 서버 동기화
  const updateInvestmentType = (typeCode: string, answers: Record<number, number>) => {
    setInvestmentType(typeCode);
    setTypeAnswers(answers);
    localStorage.setItem(LOCAL_TYPE_CODE_KEY, typeCode);
    localStorage.setItem(LOCAL_TYPE_ANSWERS_KEY, JSON.stringify(answers));
    localStorage.setItem('jusik_type_completed', 'true');

    if (user && user.nickname) {
      const userPin = user.pin || (user.nickname === '주식부엉' ? '418019' : '');
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
      const userPin = user.pin || (user.nickname === '주식부엉' ? '418019' : '');
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
              typeAnswers,
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
      const userPin = user.pin || (user.nickname === '주식부엉' ? '418019' : '');
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
            typeAnswers,
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
        activeBadge: user.activeBadge || 'terms_percentile',
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
          typeAnswers,
          simulatorSettings
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

      if (data.user.investmentType && data.user.investmentType !== '미진단') {
        setInvestmentType(data.user.investmentType);
        localStorage.setItem(LOCAL_TYPE_CODE_KEY, data.user.investmentType);
      } else if (investmentType && investmentType !== '미진단') {
        // Keep existing client investmentType if server has none
        localStorage.setItem(LOCAL_TYPE_CODE_KEY, investmentType);
      }

      if (data.user.typeAnswers && Object.keys(data.user.typeAnswers).length > 0) {
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
        completedLessons,
        investmentType,
        typeAnswers,
        simulatorSettings,
        isAuthPopoverOpen,
        isAuthPopoverClosing,
        openAuthPopover,
        closeAuthPopover,
        toggleAuthPopover,
        login,
        logout,
        changePin,
        markLessonCompleted,
        toggleLessonCompleted,
        isLessonCompleted,
        updateInvestmentType,
        updateSimulatorSettings,
        updateAvatar,
        updateTermsQuizResult,
        updateActiveBadge
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
