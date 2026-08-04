'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserAccount {
  nickname: string;
  pin: string;
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

  // 로드 시 로컬 세션 및 서버 최신 상태 복원
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

        // 서버 최신 데이터 동기화
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
                
                const serverCompleted = data.user.completedLessons || [];
                setCompletedLessons(serverCompleted);
                localStorage.setItem(LOCAL_COMPLETED_LESSONS_KEY, JSON.stringify(serverCompleted));
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

  // 수강 완료 내역 실시간 서버 저장 동기화
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
        // 즉시 서버 DB에 POST 저장
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'syncData',
            nickname: user.nickname,
            pin: userPin,
            completedLessons: newCompletedList
          })
        }).catch((e) => console.error('Server syncData error:', e));
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
          completedLessons
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
