'use client';
// ============================================
// 반응형 훅 - 화면 크기 감지
// ============================================
import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants';

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

export const useResponsive = (): ResponsiveState => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < BREAKPOINTS.tablet,
    isTablet: windowSize.width >= BREAKPOINTS.tablet && windowSize.width < BREAKPOINTS.desktop,
    isDesktop: windowSize.width >= BREAKPOINTS.desktop,
    isWide: windowSize.width >= BREAKPOINTS.wide,
  };
};
