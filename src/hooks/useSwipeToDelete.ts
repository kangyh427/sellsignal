'use client';
// ============================================
// useSwipeToDelete - 좌측 스와이프 삭제 커스텀 훅
// 경로: src/hooks/useSwipeToDelete.ts
// 세션 26B: 모바일 UX 고도화
// ============================================

import { useState, useRef, useCallback } from 'react';

interface SwipeToDeleteReturn {
  swipeOffset: number;
  showDeleteBtn: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  resetSwipe: () => void;
}

/**
 * 모바일 스와이프 삭제 훅
 * - 좌측으로 50px 이상 스와이프 → 삭제 버튼(80px) 노출
 * - 수직/수평 스크롤 감지로 오작동 방지
 * - 0.6 감쇄, 최대 -100px 제한
 */
export default function useSwipeToDelete(): SwipeToDeleteReturn {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // 최초 10px 이동 시 수평/수직 판별
    if (isHorizontal.current === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    // 수평 스와이프 처리
    if (isHorizontal.current) {
      if (dx < 0) {
        // 좌측 스와이프 → 삭제 버튼 노출 방향
        setSwipeOffset(Math.max(dx * 0.6, -100));
      } else if (showDeleteBtn && dx > 0) {
        // ★ 삭제 버튼 열린 상태에서 우측 스와이프 → 원위치 복귀
        setSwipeOffset(Math.min(-80 + dx * 0.6, 0));
      }
    }
  }, [swiping, showDeleteBtn]);

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);
    isHorizontal.current = null;

    if (swipeOffset < -50) {
      // 충분히 좌측 스와이프 → 삭제 버튼 고정
      setSwipeOffset(-80);
      setShowDeleteBtn(true);
    } else {
      // 부족하거나 우측으로 복귀 → 원위치
      setSwipeOffset(0);
      setShowDeleteBtn(false);
    }
  }, [swipeOffset]);

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0);
    setShowDeleteBtn(false);
  }, []);

  return {
    swipeOffset,
    showDeleteBtn,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipe,
  };
}
