'use client';
// ============================================
// useAuth - Supabase 인증 상태 관리 훅
// 경로: src/hooks/useAuth.ts
// 용도: 로그인 상태, 사용자 정보, 로그아웃 기능 제공
// ============================================

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Supabase 인증 상태를 실시간으로 추적하는 커스텀 훅
 * - 초기 로딩 시 현재 세션 확인
 * - onAuthStateChange로 로그인/로그아웃 이벤트 구독
 */
export default function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1) 현재 세션에서 사용자 정보 가져오기
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    getUser();

    // 2) 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      },
    );

    // 3) 클린업
    return () => subscription.unsubscribe();
  }, []);

  /** 로그아웃 */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    signOut,
  };
}
