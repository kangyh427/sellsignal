// ============================================
// 앱 UI 상태 스토어 (Zustand)
// 위치: src/stores/useAppStore.ts
//
// 관리 대상:
//   - activeTab: 현재 활성 탭 (모바일 네비게이션)
//   - showAddModal: 종목 추가 모달 표시 여부
//   - editingPosition: 수정 중인 포지션
//   - showUpgradePopup: 프리미엄 업그레이드 팝업
// ============================================

import { create } from 'zustand';
import type { Position } from '../types';

interface AppState {
  // — UI 상태 —
  activeTab: string;
  showAddModal: boolean;
  editingPosition: Position | null;
  showUpgradePopup: boolean;

  // — 액션 —
  setActiveTab: (tab: string) => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  startEditing: (position: Position) => void;
  stopEditing: () => void;
  openUpgradePopup: () => void;
  closeUpgradePopup: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // — 초기값 —
  activeTab: 'positions',
  showAddModal: false,
  editingPosition: null,
  showUpgradePopup: false,

  // — 탭 —
  setActiveTab: (tab) => set({ activeTab: tab }),

  // — 종목 추가 모달 —
  openAddModal: () => set({ showAddModal: true }),
  closeAddModal: () => set({ showAddModal: false }),

  // — 종목 수정 —
  startEditing: (position) => set({ editingPosition: position }),
  stopEditing: () => set({ editingPosition: null }),

  // — 업그레이드 팝업 —
  openUpgradePopup: () => set({ showUpgradePopup: true }),
  closeUpgradePopup: () => set({ showUpgradePopup: false }),
}));
