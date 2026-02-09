'use client';
// ============================================
// Zustand 포지션 스토어
// 경로: src/stores/positionStore.ts
// 세션 33: CRESTApp 상태 분리 — 포지션 CRUD + 가격 데이터
// ============================================
// Zustand 선택 이유:
//   - Redux 대비 보일러플레이트 90% 감소
//   - Next.js 14 App Router SSR 완벽 호환
//   - 번들 사이즈 ~1KB (vs Redux Toolkit ~11KB)
//   - selector 기반 리렌더 최적화 내장
// ============================================

import { create } from 'zustand';
import type { Position, Alert, StockPrice, PositionSignals } from '@/types';

// ── 스토어 타입 정의 ──
interface PositionState {
  // ── 데이터 ──
  positions: Position[];
  priceDataMap: Record<number, any[]>;    // positionId → OHLC 차트 데이터
  stockPrices: Record<string, StockPrice>; // code → 실시간 주가
  signalsMap: Record<number, PositionSignals>; // positionId → 시그널 결과
  alerts: Alert[];

  // ── 로딩 상태 ──
  isLoading: boolean;

  // ── 포지션 CRUD 액션 ──
  setPositions: (positions: Position[]) => void;
  addPositionLocal: (position: Position) => void;
  updatePositionLocal: (updated: Position) => void;
  deletePositionLocal: (id: number) => void;

  // ── 가격 데이터 액션 ──
  setPriceData: (id: number, data: any[]) => void;
  setPriceDataMap: (map: Record<number, any[]>) => void;
  updateLastPrice: (id: number, updater: (data: any[]) => any[]) => void;

  // ── 실시간 주가 액션 ──
  setStockPrice: (code: string, price: StockPrice) => void;
  setStockPrices: (prices: Record<string, StockPrice>) => void;

  // ── 시그널 액션 ──
  setSignals: (positionId: number, signals: PositionSignals) => void;

  // ── 알림 액션 ──
  setAlerts: (alerts: Alert[]) => void;
  dismissAlert: (id: number) => void;
  clearAlerts: () => void;

  // ── 로딩 ──
  setLoading: (loading: boolean) => void;

  // ── 계산된 값 (selector 대신 메서드) ──
  getTotalCost: () => number;
  getTotalValue: () => number;
  getTotalProfit: () => number;
  getTotalProfitRate: () => number;
}

// ── 스토어 생성 ──
const usePositionStore = create<PositionState>((set, get) => ({
  // ── 초기값 ──
  positions: [],
  priceDataMap: {},
  stockPrices: {},
  signalsMap: {},
  alerts: [],
  isLoading: true,

  // ── 포지션 CRUD ──
  setPositions: (positions) => set({ positions }),

  addPositionLocal: (position) =>
    set((state) => ({ positions: [...state.positions, position] })),

  updatePositionLocal: (updated) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === updated.id ? updated : p
      ),
    })),

  deletePositionLocal: (id) =>
    set((state) => ({
      positions: state.positions.filter((p) => p.id !== id),
      // 삭제된 포지션의 가격 데이터도 정리
      priceDataMap: Object.fromEntries(
        Object.entries(state.priceDataMap).filter(([k]) => Number(k) !== id)
      ),
    })),

  // ── 가격 데이터 ──
  setPriceData: (id, data) =>
    set((state) => ({
      priceDataMap: { ...state.priceDataMap, [id]: data },
    })),

  setPriceDataMap: (map) => set({ priceDataMap: map }),

  // 실시간 시뮬레이션용: 마지막 캔들 업데이트
  updateLastPrice: (id, updater) =>
    set((state) => {
      const current = state.priceDataMap[id];
      if (!current?.length) return state;
      return {
        priceDataMap: {
          ...state.priceDataMap,
          [id]: updater([...current]),
        },
      };
    }),

  // ── 실시간 주가 ──
  setStockPrice: (code, price) =>
    set((state) => ({
      stockPrices: { ...state.stockPrices, [code]: price },
    })),

  setStockPrices: (prices) => set({ stockPrices: prices }),

  // ── 시그널 ──
  setSignals: (positionId, signals) =>
    set((state) => ({
      signalsMap: { ...state.signalsMap, [positionId]: signals },
    })),

  // ── 알림 ──
  setAlerts: (alerts) => set({ alerts }),
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
  clearAlerts: () => set({ alerts: [] }),

  // ── 로딩 ──
  setLoading: (loading) => set({ isLoading: loading }),

  // ── 계산 메서드 ──
  getTotalCost: () => {
    const { positions } = get();
    return positions.reduce((s, p) => s + p.buyPrice * p.quantity, 0);
  },

  getTotalValue: () => {
    const { positions, priceDataMap, stockPrices } = get();
    return positions.reduce((s, p) => {
      // 우선순위: 실시간 주가 → 차트 종가 → 매수가
      const realPrice = stockPrices[p.code]?.price;
      const chartPrice = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close;
      const price = realPrice || chartPrice || p.buyPrice;
      return s + price * p.quantity;
    }, 0);
  },

  getTotalProfit: () => {
    const store = get();
    return store.getTotalValue() - store.getTotalCost();
  },

  getTotalProfitRate: () => {
    const store = get();
    const cost = store.getTotalCost();
    return cost > 0 ? (store.getTotalProfit() / cost) * 100 : 0;
  },
}));

export default usePositionStore;
