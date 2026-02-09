'use client';
// ============================================
// useSwipeToDelete - 좌측 스와이프 삭제 커스텀 훅
// 경로: src/hooks/useSwipeToDelete.ts
// 세션 26B: 모바일 UX 고도화
// 세션 38: API 인터페이스 수정 (PositionCard와 일치)
//   - swipeOffset → offsetX
//   - handleTouchStart/Move/End → handlers 객체로 통합
//   - isDragging 상태 추가 노출
// ============================================

import { useState, useRef, useCallback, useMemo } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface SwipeToDeleteReturn {
  /** 카드 X축 이동 거리 (px, 음수=좌측) */
  offsetX: number;
  /** 삭제 버튼 노출 여부 */
  showDeleteBtn: boolean;
  /** 현재 드래그 중 여부 (transition 제어용) */
  isDragging: boolean;
  /** 터치 이벤트 핸들러 (스프레드용: {...handlers}) */
  handlers: SwipeHandlers;
  /** 스와이프 초기화 (삭제 후 또는 다른 카드 터치 시) */
  resetSwipe: () => void;

  // ── 하위호환용 (기존 코드 지원) ──
  swipeOffset: number;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

/**
 * 모바일 스와이프 삭제 훅
 * - 좌측으로 50px 이상 스와이프 → 삭제 버튼(80px) 노출
 * - 수직/수평 스크롤 감지로 오작동 방지
 * - 0.6 감쇄, 최대 -100px 제한
 * 
 * 사용법:
 *   const swipe = useSwipeToDelete();
 *   <div {...(isMobile ? swipe.handlers : {})}
 *        style={{ transform: `translateX(${swipe.offsetX}px)` }} />
 */
export default function useSwipeToDelete(): SwipeToDeleteReturn {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // 최초 10px 이동 시 수평/수직 판별
    if (isHorizontal.current === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    // 수평 스와이프만 처리
    if (isHorizontal.current) {
      // 수직 스크롤 방지 (수평 스와이프 확정 시)
      e.preventDefault();

      if (showDeleteBtn && dx > 0) {
        // ★ 삭제 버튼 열린 상태에서 우측 스와이프 → 원위치 복귀
        setSwipeOffset(Math.min(-80 + dx * 0.6, 0));
      } else if (dx < 0) {
        // 좌측 스와이프 → 삭제 버튼 노출 방향
        setSwipeOffset(Math.max(dx * 0.6, -100));
      }
    }
  }, [isDragging, showDeleteBtn]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    isHorizontal.current = null;

    if (swipeOffset < -50) {
      // 충분히 좌측 스와이프 → 삭제 버튼 고정 (-80px)
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
    setIsDragging(false);
  }, []);

  // ★ handlers 객체: PositionCard에서 {...swipe.handlers}로 사용
  const handlers = useMemo<SwipeHandlers>(() => ({
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }), [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    // ── 신규 API (PositionCard v2 사용) ──
    offsetX: swipeOffset,
    isDragging,
    showDeleteBtn,
    handlers,
    resetSwipe,

    // ── 하위호환 API ──
    swipeOffset,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
