'use client';
// ============================================
// 반응형 브레이크포인트 훅
// 경로: src/hooks/useResponsive.ts
// ============================================

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/constants';
import type { ResponsiveState } from '@/types';

const useResponsive = (): ResponsiveState => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 390);

  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    h();
    return () => window.removeEventListener('resize', h);
  }, []);

  return {
    width: w,
    isMobile: w < BREAKPOINTS.tablet,
    isTablet: w >= BREAKPOINTS.tablet && w < BREAKPOINTS.desktop,
    isDesktop: w >= BREAKPOINTS.desktop,
  };
};

export default useResponsive;
