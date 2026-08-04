'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserAccount {
  nickname: string;
  pin?: string;
  createdAt: string;
  lastLoginAt: string;
  completedLessons?: string[];
  investmentType?: string;
  simulatorSettings?: any;
}

interface AuthContextType {
  user: UserAccount | null;
  completedLessons: string[];
  isAuthPopoverOpen: boolean;
  openAuthPopover: () => void;
  closeAuthPopover: () => void;
  toggleAuthPopover: () => void;
  login: (nickname: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  markLessonCompleted: (lessonId: string) => void;
  toggleLessonCompleted: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'jusik_app_user_account';
const LOCAL_COMPLETED_LESSONS_KEY = 'jusik_app_completed_lessons';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isAuthPopoverOpen, setIsAuthPopoverOpen] = useState<boolean>(false);

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
        if (parsedUser.completedLessons) {
          const merged = Array.from(new Set([...initialCompleted, ...parsedUser.completedLessons]));
          setCompletedLessons(merged);
        }

        // 서버 최신 상태 동기화 시도 (PIN 번호가 남아있는 경우)
        if (parsedUser.nickname && parsedUser.pin) {
          fetch(`/api/sync?nickname=${encodeURIComponent(parsedUser.nickname)}&pin=${encodeURIComponent(parsedUser.pin)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.user) {
                const serverUser: UserAccount = {
                  ...data.user,
                  pin: parsedUser.pin
                };
                setUser(serverUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(serverUser));
                if (data.user.completedLessons) {
                  setCompletedLessons(data.user.completedLessons);
                  localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(data.user.completedLessons));
                }
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

  const openAuthPopover = () => setIsAuthPopoverOpen(true);
  const closeAuthPopover = () => setIsAuthPopoverOpen(false);
  const toggleAuthPopover = () => setIsAuthPopoverOpen((prev) => !prev);

  // 수강 완료 내역 실시간 서버 동기화
  const updateCompletedLessonsState = (newCompletedList: string[]) => {
    setCompletedLessons(newCompletedList);
    localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(newCompletedList));

    if (user && user.nickname && user.pin) {
      const updatedUser: UserAccount = {
        ...user,
        completedLessons: newCompletedList,
        lastLoginAt: new Date().toISOString()
      };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      // 서버 API 실시간 동기화 (POST /api/sync)
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'syncData',
          nickname: user.nickname,
          pin: user.pin,
          completedLessons: newCompletedList
        })
      }).catch((e) => console.error('Server syncData error:', e));
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

  // 비동기 서버 로그인 함수
  const login = async (nickname: string, pin: string) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          nickname,
          pin,
          completedLessons
        })
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || '로그인에 실패했습니다.' };
      }

      const serverUser: UserAccount = {
        ...data.user,
        pin // 로컬 세션 동기화를 위한 PIN 보관
      };

      setUser(serverUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(serverUser));
      
      const serverCompleted: string[] = data.user.completedLessons || [];
      setCompletedLessons(serverCompleted);
      localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(serverCompleted));

      return { success: true };
    } catch (e) {
      console.error('Login API error:', e);
      return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
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
