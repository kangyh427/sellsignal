'use client';
// ============================================
// CREST 반응형 훅
// 경로: src/hooks/useResponsive.ts
// ============================================

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/constants';
import type { ResponsiveState } from '@/types';

/**
 * 화면 너비에 따라 isMobile / isTablet / isDesktop 반환
 * - mobile:  < 768px
 * - tablet:  768px ~ 1024px
 * - desktop: >= 1024px
 */
export const useResponsive = (): ResponsiveState => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
  };
};
