'use client'

import { useState, useEffect } from 'react'

// ============================================
// 브레이크포인트 정의
// ============================================
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1400
}

// ============================================
// 반응형 훅 (SSR 안전)
// ============================================
export interface ResponsiveState {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
}

export const useResponsive = (): ResponsiveState => {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // 초기 실행
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // SSR에서는 기본값 반환 (hydration 불일치 방지)
  if (!windowSize) {
    return {
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWide: false,
    }
  }

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < BREAKPOINTS.tablet,
    isTablet: windowSize.width >= BREAKPOINTS.tablet && windowSize.width < BREAKPOINTS.desktop,
    isDesktop: windowSize.width >= BREAKPOINTS.desktop,
    isWide: windowSize.width >= BREAKPOINTS.wide,
  }
}

// ============================================
// 반응형 값 선택 헬퍼
// ============================================
export const getResponsiveValue = <T,>(
  isMobile: boolean,
  isTablet: boolean,
  mobileVal: T,
  tabletVal: T,
  desktopVal: T
): T => {
  if (isMobile) return mobileVal
  if (isTablet) return tabletVal
  return desktopVal
}
