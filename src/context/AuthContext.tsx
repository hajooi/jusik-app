'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateNickname } from '@/utils/badWordsFilter';

export interface UserAccount {
  nickname: string;
  pin: string;
  createdAt: string;
  lastLoginAt: string;
  completedLessons?: string[]; // 수강 완료한 레슨 ID 목록
  investmentType?: string;      // 투자 성향 진단 결과
  simulatorSettings?: any;     // 시뮬레이터 커스텀 포트폴리오 세팅
}

interface AuthContextType {
  user: UserAccount | null;
  completedLessons: string[];
  isAuthPopoverOpen: boolean;
  openAuthPopover: () => void;
  closeAuthPopover: () => void;
  toggleAuthPopover: () => void;
  login: (nickname: string, pin: string) => { success: boolean; error?: string };
  logout: () => void;
  markLessonCompleted: (lessonId: string) => void;
  toggleLessonCompleted: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'jusik_app_user_account';
const USERS_DB_SIMULATION_KEY = 'jusik_app_users_db';
const LOCAL_COMPLETED_LESSONS_KEY = 'jusik_app_completed_lessons';

// 대표님 공식 마스터 계정 초기 데이터 (시크릿 모드/새 브라우저 접속 시에도 즉시 복원)
const MASTER_ACCOUNTS_SEED: Record<string, UserAccount> = {
  '주식부엉': {
    nickname: '주식부엉',
    pin: '418019',
    createdAt: '2026-08-04T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    completedLessons: ['lv0-1', 'lv0-2', 'lv0-3', 'lv1-1'], // 완강 아카이브 기본 세팅
    investmentType: 'SART'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isAuthPopoverOpen, setIsAuthPopoverOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      // 1. DB 초기화 및 시드 데이터 병합 (시크릿 모드/새 기기 지원)
      const dbJson = localStorage.getItem(USERS_DB_SIMULATION_KEY);
      let usersDb: Record<string, UserAccount> = dbJson ? JSON.parse(dbJson) : {};

      // 마스터 계정 정보가 없거나 비어 있으면 시드 데이터 복원
      Object.keys(MASTER_ACCOUNTS_SEED).forEach((name) => {
        if (!usersDb[name]) {
          usersDb[name] = MASTER_ACCOUNTS_SEED[name];
        }
      });
      localStorage.setItem(USERS_DB_SIMULATION_KEY, JSON.stringify(usersDb));

      // 2. 수강 완료 목록 복원
      const localCompletedJson = localStorage.getItem(LOCAL_COMPLETED_LESSONS_KEY);
      let initialCompleted: string[] = localCompletedJson ? JSON.parse(localCompletedJson) : [];

      // 3. 사용자 로그인 상태 확인 (최초 접속 시 null, 로그인 시 복원)
      const savedUserJson = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUserJson) {
        const parsedUser: UserAccount = JSON.parse(savedUserJson);
        const lastLogin = new Date(parsedUser.lastLoginAt).getTime();
        const now = new Date().getTime();
        const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

        if (now - lastLogin > ONE_YEAR_MS) {
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
          setCompletedLessons(initialCompleted);
        } else {
          parsedUser.lastLoginAt = new Date().toISOString();
          if (parsedUser.completedLessons && parsedUser.completedLessons.length > 0) {
            initialCompleted = Array.from(new Set([...initialCompleted, ...parsedUser.completedLessons]));
          }
          parsedUser.completedLessons = initialCompleted;
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsedUser));
          setUser(parsedUser);
          setCompletedLessons(initialCompleted);
        }
      } else {
        setUser(null);
        setCompletedLessons(initialCompleted);
      }
    } catch (e) {
      console.error('Auth restore error:', e);
      setUser(null);
    }
  }, []);

  const openAuthPopover = () => setIsAuthPopoverOpen(true);
  const closeAuthPopover = () => setIsAuthPopoverOpen(false);
  const toggleAuthPopover = () => setIsAuthPopoverOpen((prev) => !prev);

  const updateCompletedLessonsState = (newCompletedList: string[]) => {
    setCompletedLessons(newCompletedList);
    localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(newCompletedList));

    if (user) {
      const updatedUser: UserAccount = {
        ...user,
        completedLessons: newCompletedList,
        lastLoginAt: new Date().toISOString()
      };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      try {
        const dbJson = localStorage.getItem(USERS_DB_SIMULATION_KEY);
        const usersDb: Record<string, UserAccount> = dbJson ? JSON.parse(dbJson) : {};
        usersDb[user.nickname] = updatedUser;
        localStorage.setItem(USERS_DB_SIMULATION_KEY, JSON.stringify(usersDb));
        
        // 마스터 맵에도 실시간 업데이트
        if (MASTER_ACCOUNTS_SEED[user.nickname]) {
          MASTER_ACCOUNTS_SEED[user.nickname] = updatedUser;
        }
      } catch (e) {
        console.error('DB update error:', e);
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

  const login = (nickname: string, pin: string) => {
    const validation = validateNickname(nickname);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    if (!/^\d{6}$/.test(pin)) {
      return { success: false, error: '핀번호는 숫자 6자리로 입력해 주세요.' };
    }

    const trimmedNickname = nickname.trim();

    try {
      const dbJson = localStorage.getItem(USERS_DB_SIMULATION_KEY);
      let usersDb: Record<string, UserAccount> = dbJson ? JSON.parse(dbJson) : {};

      // 마스터 세드 계정이 DB에 없는 경우(시크릿 모드 등) 시드에서 복원
      if (!usersDb[trimmedNickname] && MASTER_ACCOUNTS_SEED[trimmedNickname]) {
        usersDb[trimmedNickname] = MASTER_ACCOUNTS_SEED[trimmedNickname];
      }

      const existingAccount = usersDb[trimmedNickname] || usersDb[trimmedNickname.toLowerCase()];

      if (existingAccount) {
        if (existingAccount.pin !== pin) {
          return { success: false, error: '입력하신 핀번호가 일치하지 않습니다.' };
        }

        // 로그인 시 해당 계정에 아카이빙된 수강 완료 내역으로 즉시 복원
        const userCompleted = existingAccount.completedLessons || [];
        const mergedCompleted = Array.from(new Set([...completedLessons, ...userCompleted]));
        
        const updatedAccount: UserAccount = {
          ...existingAccount,
          completedLessons: mergedCompleted,
          lastLoginAt: new Date().toISOString()
        };

        usersDb[trimmedNickname] = updatedAccount;
        localStorage.setItem(USERS_DB_SIMULATION_KEY, JSON.stringify(usersDb));
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedAccount));
        localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(mergedCompleted));

        setUser(updatedAccount);
        setCompletedLessons(mergedCompleted);
        return { success: true };
      } else {
        // 신규 계정 생성
        const newAccount: UserAccount = {
          nickname: trimmedNickname,
          pin,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          completedLessons: completedLessons
        };
        usersDb[trimmedNickname] = newAccount;
        localStorage.setItem(USERS_DB_SIMULATION_KEY, JSON.stringify(usersDb));
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newAccount));
        setUser(newAccount);
        return { success: true };
      }
    } catch (e) {
      console.error('Login error:', e);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        completedLessons,
        isAuthPopoverOpen,
        openAuthPopover,
        closeAuthPopover,
        toggleAuthPopover,
        login,
        logout,
        markLessonCompleted,
        toggleLessonCompleted,
        isLessonCompleted
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
