'use client';
// ============================================
// usePullToRefresh - 당겨서 새로고침 커스텀 훅
// 경로: src/hooks/usePullToRefresh.ts
// 세션 26B: 모바일 UX 고도화
// ============================================

import { useState, useRef, useCallback } from 'react';

interface PullToRefreshReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  pullDistance: number;
  refreshing: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

/**
 * 모바일 Pull-to-Refresh 훅
 * - 화면 상단(scrollTop <= 0)에서 아래로 당기면 새로고침
 * - 60px 이상 당기면 onRefresh 콜백 실행
 * - 최대 120px까지 제한 (0.5 감쇄)
 */
export default function usePullToRefresh(onRefresh: () => Promise<void>): PullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      setPullDistance(Math.min(dy * 0.5, 120));
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    if (pullDistance >= 60 && !refreshing) {
      setRefreshing(true);
      setPullDistance(50);
      await onRefresh();
      // 최소 600ms 대기 (UX 안정성)
      await new Promise((r) => setTimeout(r, 600));
      setRefreshing(false);
    }
    setPullDistance(0);
    setPulling(false);
  }, [pulling, pullDistance, refreshing, onRefresh]);

  return {
    containerRef,
    pullDistance,
    refreshing,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
