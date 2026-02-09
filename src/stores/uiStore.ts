'use client';
// ============================================
// Zustand UI 스토어
// 경로: src/stores/uiStore.ts
// 세션 33: CRESTApp UI 상태 분리
// ============================================
// 역할: 탭 네비게이션, 모달, 프리미엄 상태, AI 사용량 관리
// CRESTApp에서 6개 useState → 이 스토어 1개로 통합
// ============================================

import { create } from 'zustand';

// ── 탭 타입 ──
export type AppTab = 'positions' | 'market' | 'alerts' | 'guide';

// ── 스토어 타입 정의 ──
interface UIState {
  // ── 네비게이션 ──
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // ── 모달/팝업 ──
  showAddModal: boolean;
  showUpgrade: boolean;
  setShowAddModal: (show: boolean) => void;
  setShowUpgrade: (show: boolean) => void;

  // ── 프리미엄 상태 ──
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;

  // ── 제한값 (프리미엄/무료 구분) ──
  maxFreePositions: number;
  maxFreeAINews: number;

  // ── AI 뉴스 사용량 ──
  aiNewsUsedCount: number;
  incrementAINewsUsed: () => void;
  resetAINewsUsed: () => void;

  // ── 유틸리티 ──
  canAddPosition: (currentCount: number) => boolean;
  canUseAINews: () => boolean;
}

// ── 스토어 생성 ──
const useUIStore = create<UIState>((set, get) => ({
  // ── 초기값 ──
  activeTab: 'positions',
  showAddModal: false,
  showUpgrade: false,
  isPremium: false,
  maxFreePositions: 3,
  maxFreeAINews: 3,
  aiNewsUsedCount: 0,

  // ── 네비게이션 ──
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── 모달/팝업 ──
  setShowAddModal: (show) => set({ showAddModal: show }),
  setShowUpgrade: (show) => set({ showUpgrade: show }),

  // ── 프리미엄 ──
  setIsPremium: (premium) => set({ isPremium: premium }),

  // ── AI 뉴스 ──
  incrementAINewsUsed: () =>
    set((state) => ({ aiNewsUsedCount: state.aiNewsUsedCount + 1 })),
  resetAINewsUsed: () => set({ aiNewsUsedCount: 0 }),

  // ── 유틸리티 ──
  canAddPosition: (currentCount) => {
    const { isPremium, maxFreePositions } = get();
    return isPremium || currentCount < maxFreePositions;
  },

  canUseAINews: () => {
    const { isPremium, aiNewsUsedCount, maxFreeAINews } = get();
    return isPremium || aiNewsUsedCount < maxFreeAINews;
  },
}));

export default useUIStore;
