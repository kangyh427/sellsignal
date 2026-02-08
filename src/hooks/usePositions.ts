'use client';
// ============================================
// usePositions - 포지션 CRUD 훅
// 경로: src/hooks/usePositions.ts
// 세션 19: Supabase DB 연동 + 비로그인 시 localStorage 폴백
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Position } from '@/types';

// ── 기본 프리셋 (신규 종목 추가 시) ──
const DEFAULT_PRESETS = ['candle3', 'stopLoss'];
const DEFAULT_PRESET_SETTINGS = { stopLoss: { value: -5 } };

// ── 데모 포지션 (비로그인 + localStorage 비어있을 때) ──
const DEMO_POSITIONS: Position[] = [
  {
    id: 1, name: '삼성전자', code: '005930', buyPrice: 71500, quantity: 100,
    highestPrice: 78000, selectedPresets: ['candle3', 'stopLoss', 'maSignal'],
    presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } },
  },
  {
    id: 2, name: '현대차', code: '005380', buyPrice: 50000, quantity: 100,
    highestPrice: 55000, selectedPresets: ['candle3', 'stopLoss', 'twoThird'],
    presetSettings: { stopLoss: { value: -5 } },
  },
  {
    id: 3, name: '한화에어로스페이스', code: '012450', buyPrice: 350000, quantity: 10,
    highestPrice: 380000, selectedPresets: ['twoThird', 'maSignal', 'volumeZone'],
    presetSettings: { maSignal: { value: 20 } },
  },
];

const LOCAL_STORAGE_KEY = 'crest_positions';

// ── localStorage 유틸 ──
function loadLocal(): Position[] | null {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveLocal(positions: Position[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // localStorage 용량 초과 등 무시
  }
}

// ── DB 레코드 → Position 변환 ──
function dbToPosition(row: any): Position {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    buyPrice: Number(row.buy_price),
    quantity: Number(row.quantity),
    highestPrice: Number(row.highest_price || 0),
    selectedPresets: row.selected_presets || DEFAULT_PRESETS,
    presetSettings: row.preset_settings || DEFAULT_PRESET_SETTINGS,
  };
}

// ── Position → DB 레코드 변환 ──
function positionToDb(pos: Omit<Position, 'id'>, userId: string) {
  return {
    user_id: userId,
    name: pos.name,
    code: pos.code,
    buy_price: pos.buyPrice,
    quantity: pos.quantity,
    highest_price: pos.highestPrice || 0,
    selected_presets: pos.selectedPresets || DEFAULT_PRESETS,
    preset_settings: pos.presetSettings || DEFAULT_PRESET_SETTINGS,
  };
}

// ══════════════════════════════════════
// 메인 훅
// ══════════════════════════════════════
export default function usePositions(userId: string | null) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // ── 초기 데이터 로드 ──
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      if (userId) {
        // 로그인 상태: Supabase에서 로드
        const { data, error } = await supabase
          .from('positions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          setPositions(data.map(dbToPosition));
        } else if (!error && (!data || data.length === 0)) {
          // DB에 데이터 없으면 빈 배열 (데모 데이터 안 보여줌)
          setPositions([]);
        } else {
          console.error('Positions load error:', error);
          setPositions([]);
        }
      } else {
        // 비로그인: localStorage → 없으면 데모 데이터
        const local = loadLocal();
        setPositions(local ?? DEMO_POSITIONS);
      }

      setIsLoading(false);
    };

    load();
  }, [userId]);

  // ── 비로그인 시 변경사항 localStorage에 자동 저장 ──
  useEffect(() => {
    if (!userId && !isLoading) {
      saveLocal(positions);
    }
  }, [positions, userId, isLoading]);

  // ── 종목 추가 ──
  const addPosition = useCallback(async (newPos: {
    name: string;
    code: string;
    buyPrice: number;
    quantity: number;
  }): Promise<boolean> => {
    const position: Omit<Position, 'id'> = {
      name: newPos.name,
      code: newPos.code,
      buyPrice: newPos.buyPrice,
      quantity: newPos.quantity,
      highestPrice: newPos.buyPrice, // 초기에는 매수가 = 최고가
      selectedPresets: DEFAULT_PRESETS,
      presetSettings: DEFAULT_PRESET_SETTINGS,
    };

    if (userId) {
      // DB에 저장
      const { data, error } = await supabase
        .from('positions')
        .insert(positionToDb(position, userId))
        .select()
        .single();

      if (error) {
        console.error('Add position error:', error);
        return false;
      }
      setPositions((prev) => [...prev, dbToPosition(data)]);
    } else {
      // localStorage에 저장
      const newId = Date.now(); // 임시 ID
      setPositions((prev) => [...prev, { ...position, id: newId }]);
    }
    return true;
  }, [userId, supabase]);

  // ── 종목 수정 ──
  const updatePosition = useCallback(async (updated: Position): Promise<boolean> => {
    if (userId) {
      const { error } = await supabase
        .from('positions')
        .update({
          name: updated.name,
          code: updated.code,
          buy_price: updated.buyPrice,
          quantity: updated.quantity,
          highest_price: updated.highestPrice,
          selected_presets: updated.selectedPresets,
          preset_settings: updated.presetSettings,
        })
        .eq('id', updated.id)
        .eq('user_id', userId);

      if (error) {
        console.error('Update position error:', error);
        return false;
      }
    }
    setPositions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    return true;
  }, [userId, supabase]);

  // ── 종목 삭제 ──
  const deletePosition = useCallback(async (id: number): Promise<boolean> => {
    if (userId) {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Delete position error:', error);
        return false;
      }
    }
    setPositions((prev) => prev.filter((p) => p.id !== id));
    return true;
  }, [userId, supabase]);

  return {
    positions,
    isLoading,
    addPosition,
    updatePosition,
    deletePosition,
  };
}
