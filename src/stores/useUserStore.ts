// ============================================
// 유저 상태 스토어 (Zustand)
// 위치: src/stores/useUserStore.ts
//
// 관리 대상:
//   - user: 사용자 정보 (email, membership)
//   - isPremium: 프리미엄 여부 (derived)
//   - 업그레이드/다운그레이드 액션
// ============================================

import { create } from 'zustand';

interface User {
  email: string;
  membership: 'free' | 'premium';
  name?: string;
}

interface UserState {
  // — 데이터 —
  user: User;

  // — 계산 —
  isPremium: () => boolean;

  // — 액션 —
  upgradeToPremium: () => void;
  downgradeToFree: () => void;
  setUser: (user: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // — 초기 데모 유저 —
  user: {
    email: 'demo@test.com',
    membership: 'free',
  },

  // — 프리미엄 여부 —
  isPremium: () => get().user.membership === 'premium',

  // — 멤버십 변경 —
  upgradeToPremium: () =>
    set((state) => ({
      user: { ...state.user, membership: 'premium' },
    })),

  downgradeToFree: () =>
    set((state) => ({
      user: { ...state.user, membership: 'free' },
    })),

  // — 유저 정보 업데이트 —
  setUser: (partial) =>
    set((state) => ({
      user: { ...state.user, ...partial },
    })),
}));
