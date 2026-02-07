// ============================================
// 반응형 훅 (hooks/useResponsive.ts)
// 위치: src/hooks/useResponsive.ts
// ============================================
// ✅ BREAKPOINTS는 constants/index.ts에서 import (중복 제거)
// ✅ SSR Hydration 안전 처리 (mounted 상태)
// ✅ debounce 150ms 적용
// ✅ cleanup 처리 완비

import { useState, useEffect, useCallback } from 'react';
import { BREAKPOINTS } from '../constants';
import type { ResponsiveState } from '../types';

// ── SSR 안전한 초기값 ──
const getInitialState = (): ResponsiveState => ({
  width: 1200,
  height: 800,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isWide: false,
});

// ── 창 크기로부터 반응형 상태 계산 ──
const calculateState = (width: number, height: number): ResponsiveState => ({
  width,
  height,
  isMobile: width < BREAKPOINTS.tablet,
  isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
  isDesktop: width >= BREAKPOINTS.desktop,
  isWide: width >= BREAKPOINTS.wide,
});

// ── 메인 훅 ──
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(getInitialState);
  const [mounted, setMounted] = useState(false);

  // SSR → CSR 전환 시 실제 윈도우 크기로 업데이트
  useEffect(() => {
    setMounted(true);
    setState(calculateState(window.innerWidth, window.innerHeight));
  }, []);

  // 리사이즈 이벤트 핸들러 (debounce 150ms)
  useEffect(() => {
    if (!mounted) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setState(calculateState(window.innerWidth, window.innerHeight));
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted]);

  return state;
};

// ── 헬퍼 함수: 반응형 값 선택 ──
export const getResponsiveValue = <T>(
  isMobile: boolean,
  isTablet: boolean,
  mobileVal: T,
  tabletVal: T,
  desktopVal: T
): T => {
  if (isMobile) return mobileVal;
  if (isTablet) return tabletVal;
  return desktopVal;
};

// ── 헬퍼: 차트 크기 계산 ──
export const getChartWidth = (screenWidth: number, isMobile: boolean, isTablet: boolean): number => {
  if (isMobile) return Math.min(screenWidth - 32, 400);  // 좌우 패딩 16px * 2
  if (isTablet) return Math.min(screenWidth - 80, 600);
  return Math.min(screenWidth * 0.5, 700);
};

export const getChartHeight = (isMobile: boolean, isTablet: boolean): number => {
  if (isMobile) return 200;
  if (isTablet) return 260;
  return 300;
};
