'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ResponsiveState } from '../types';

// ============================================
// 반응형 브레이크포인트
// ============================================
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1400
} as const;

// ============================================
// 반응형 훅 - Hydration 안전 + debounce 성능 최적화
// ============================================
export const useResponsive = (): ResponsiveState => {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 1200,
    height: 800,
  });

  // debounce용 타이머 ref (resize 이벤트 과다 발생 방지)
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // debounce된 resize 핸들러 (150ms)
  // 모바일에서 스크롤/회전 시 resize 이벤트가 수십 번 발생 → 렌더링 부하 방지
  const handleResize = useCallback(() => {
    if (resizeTimer.current) {
      clearTimeout(resizeTimer.current);
    }
    resizeTimer.current = setTimeout(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 150);
  }, []);

  useEffect(() => {
    setMounted(true);

    // 최초 1회는 debounce 없이 즉시 반영
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer.current) {
        clearTimeout(resizeTimer.current);
      }
    };
  }, [handleResize]);

  // SSR 단계에서는 데스크톱 기본값 반환 (Hydration mismatch 방지)
  if (!mounted) {
    return {
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWide: false,
    };
  }

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < BREAKPOINTS.tablet,
    isTablet: windowSize.width >= BREAKPOINTS.tablet && windowSize.width < BREAKPOINTS.desktop,
    isDesktop: windowSize.width >= BREAKPOINTS.desktop,
    isWide: windowSize.width >= BREAKPOINTS.wide,
  };
};

// ============================================
// 반응형 스타일 헬퍼
// ============================================

/**
 * 디바이스별 값 선택 헬퍼
 * 사용법: getResponsiveValue(isMobile, isTablet, '16px', '20px', '24px')
 */
export const getResponsiveValue = <T,>(
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

/**
 * 차트 너비 계산 헬퍼
 * SellSignalApp.tsx 365줄의 인라인 계산을 대체합니다.
 * 기존: Math.min(typeof window !== 'undefined' ? window.innerWidth - 64 : 350, 500)
 * 개선: padding을 고려한 안전한 너비 계산
 *
 * @param screenWidth - useResponsive()의 width 값
 * @param isMobile - useResponsive()의 isMobile 값
 * @param padding - 좌우 패딩 합계 (기본 64px = 좌32 + 우32)
 * @param maxWidth - 데스크탑 최대 너비 (기본 500px)
 */
export const getChartWidth = (
  screenWidth: number,
  isMobile: boolean,
  padding: number = 64,
  maxWidth: number = 500
): number => {
  if (isMobile) {
    return Math.min(screenWidth - padding, maxWidth);
  }
  return maxWidth;
};

/**
 * 차트 높이 계산 헬퍼
 * 모바일에서는 더 낮은 차트, 데스크탑에서는 표준 높이
 */
export const getChartHeight = (
  isMobile: boolean,
  isTablet: boolean,
  mobileHeight: number = 200,
  tabletHeight: number = 250,
  desktopHeight: number = 280
): number => {
  return getResponsiveValue(isMobile, isTablet, mobileHeight, tabletHeight, desktopHeight);
};
