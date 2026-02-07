// ============================================
// UI 상태 스토어 (Zustand)
// 위치: src/stores/useAppStore.ts
//
// 관리 대상:
//   - activeTab: 모바일 네비게이션 탭
//   - showAddModal: 종목 추가 모달
//   - editingPosition: 수정 중인 포지션
//   - showUpgradePopup: 업그레이드 팝업
//
// ※ UI 전용 상태만 관리 (데이터는 usePositionStore)
// ============================================

import { create } from 'zustand';
import type { Position } from '../types';

interface AppState {
  // — UI 상태 —
  activeTab: string;
  showAddModal: boolean;
  editingPosition: Position | null;
  showUpgradePopup: boolean;

  // — 탭 전환 —
  setActiveTab: (tab: string) => void;

  // — 종목 추가 모달 —
  openAddModal: () => void;
  closeAddModal: () => void;

  // — 종목 수정 —
  startEditing: (position: Position) => void;
  stopEditing: () => void;

  // — 업그레이드 팝업 —
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

  // — 업그레이드 —
  openUpgradePopup: () => set({ showUpgradePopup: true }),
  closeUpgradePopup: () => set({ showUpgradePopup: false }),
}));
