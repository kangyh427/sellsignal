'use client';

import { useState, useEffect } from 'react';
import type { ResponsiveState } from '../types';

// 반응형 브레이크포인트
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1400
};

// 반응형 훅 - Hydration 문제 완전 해결
export const useResponsive = (): ResponsiveState => {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SSR 단계에서는 데스크톱 기본값 반환
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

// 반응형 스타일 헬퍼
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
