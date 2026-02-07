// ============================================
// 포지션 스토어 (Zustand)
// 위치: src/stores/usePositionStore.ts
//
// 관리 대상:
//   - positions: 사용자 보유 종목 리스트
//   - priceDataMap: 종목별 차트 데이터
//   - alerts: 조건 도달 알림
//   - 총계 계산 (derived)
// ============================================

import { create } from 'zustand';
import type { Position, Alert, ChartDataPoint } from '../types';
import { generateMockPriceData } from '../utils';

// ── 데모 포지션 (원본 JSX 2896~2922 기반) ──
const DEMO_POSITIONS: Position[] = [
  {
    id: 1,
    name: '삼성전자',
    code: '005930',
    buyPrice: 71500,
    quantity: 100,
    currentPrice: 71500,
    highestPrice: 78200,
    selectedPresets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'],
    presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } },
  },
  {
    id: 2,
    name: '현대차',
    code: '005380',
    buyPrice: 215000,
    quantity: 20,
    currentPrice: 215000,
    highestPrice: 228000,
    selectedPresets: ['candle3', 'stopLoss', 'maSignal'],
    presetSettings: { stopLoss: { value: -3 }, maSignal: { value: 20 } },
  },
  {
    id: 3,
    name: '한화에어로스페이스',
    code: '012450',
    buyPrice: 285000,
    quantity: 15,
    currentPrice: 285000,
    highestPrice: 412000,
    selectedPresets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'],
    presetSettings: { maSignal: { value: 60 } },
  },
];

const createDemoAlerts = (): Alert[] => [
  {
    id: 1,
    stockName: '삼성전자',
    code: '005930',
    preset: {
      id: 'stopLoss',
      name: '손실제한 매도법',
      icon: '🛡',
      severity: 'critical',
    },
    message: '손절 기준가(-5%) 근접! 현재 -4.2%',
    currentPrice: 68500,
    targetPrice: 67925,
    timestamp: Date.now() - 300000,
  },
  {
    id: 2,
    stockName: '한화에어로스페이스',
    code: '012450',
    preset: {
      id: 'twoThird',
      name: '2/3 익절 매도법',
      icon: '📈',
      severity: 'medium',
    },
    message: '최고점 대비 1/3 하락 근접',
    currentPrice: 365000,
    targetPrice: 369600,
    timestamp: Date.now() - 1800000,
  },
];

// ── 스토어 인터페이스 ──
interface PositionState {
  // — 데이터 —
  positions: Position[];
  priceDataMap: Record<string | number, ChartDataPoint[]>;
  alerts: Alert[];

  // — 계산된 값 (getter) —
  getTotals: () => {
    totalCost: number;
    totalValue: number;
    totalProfit: number;
    totalProfitRate: number;
  };

  // — 액션: 포지션 —
  addPosition: (position: Position) => void;
  editPosition: (position: Position) => void;
  deletePosition: (id: string | number) => void;

  // — 액션: 가격 데이터 —
  initPriceData: () => void;
  tickPriceData: () => void;

  // — 액션: 알림 —
  dismissAlert: (id: number) => void;
  clearAllAlerts: () => void;
}

// ── 스토어 생성 ──
export const usePositionStore = create<PositionState>((set, get) => ({
  // — 초기 데이터 —
  positions: DEMO_POSITIONS,
  priceDataMap: {},
  alerts: createDemoAlerts(),

  // — 총계 계산 —
  getTotals: () => {
    const { positions, priceDataMap } = get();
    const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0);
    const totalValue = positions.reduce((sum, p) => {
      const data = priceDataMap[p.id];
      const price = data?.[data.length - 1]?.close || p.buyPrice;
      return sum + price * p.quantity;
    }, 0);
    const totalProfit = totalValue - totalCost;
    const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    return { totalCost, totalValue, totalProfit, totalProfitRate };
  },

  // — 포지션 CRUD —
  addPosition: (position) =>
    set((state) => ({
      positions: [...state.positions, { ...position, id: Date.now() }],
    })),

  editPosition: (position) =>
    set((state) => ({
      positions: state.positions.map((p) => (p.id === position.id ? position : p)),
    })),

  deletePosition: (id) =>
    set((state) => {
      const updated = { ...state.priceDataMap };
      delete updated[id];
      return {
        positions: state.positions.filter((p) => p.id !== id),
        priceDataMap: updated,
      };
    }),

  // — 가격 데이터 초기화 (새 포지션에 대해) —
  initPriceData: () =>
    set((state) => {
      const newData: Record<string | number, ChartDataPoint[]> = {};
      let hasNew = false;
      state.positions.forEach((pos) => {
        if (!state.priceDataMap[pos.id]) {
          newData[pos.id] = generateMockPriceData(pos.buyPrice, 60);
          hasNew = true;
        }
      });
      if (!hasNew) return state; // 변경 없으면 리렌더 방지
      return { priceDataMap: { ...state.priceDataMap, ...newData } };
    }),

  // — 실시간 가격 틱 (3초 간격 호출) —
  tickPriceData: () =>
    set((state) => {
      const updated = { ...state.priceDataMap };
      Object.keys(updated).forEach((id) => {
        const data = [...updated[id]];
        const last = data[data.length - 1];
        if (!last) return;
        const change = (Math.random() - 0.48) * last.close * 0.008;
        const newClose = Math.max(last.close + change, last.close * 0.95);
        data[data.length - 1] = {
          ...last,
          close: newClose,
          high: Math.max(last.high, newClose),
          low: Math.min(last.low, newClose),
        };
        updated[id] = data;
      });
      return { priceDataMap: updated };
    }),

  // — 알림 —
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  clearAllAlerts: () => set({ alerts: [] }),
}));
