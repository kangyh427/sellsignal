'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

// 데모 데이터 (컴포넌트 외부에 정의 - 재생성 방지)
const DEMO_POSITIONS = [
  { 
    id: 'demo-1', 
    name: '삼성전자', 
    code: '005930', 
    buy_price: 71500, 
    quantity: 100, 
    highest_price: 78200, 
    selected_presets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'], 
    preset_settings: { stopLoss: { value: -5 }, maSignal: { value: 20 } } 
  },
  { 
    id: 'demo-2', 
    name: '현대차', 
    code: '005380', 
    buy_price: 215000, 
    quantity: 20, 
    highest_price: 228000, 
    selected_presets: ['candle3', 'stopLoss', 'maSignal'], 
    preset_settings: { stopLoss: { value: -3 }, maSignal: { value: 20 } } 
  },
  { 
    id: 'demo-3', 
    name: '한화에어로스페이스', 
    code: '012450', 
    buy_price: 285000, 
    quantity: 15, 
    highest_price: 412000, 
    selected_presets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'], 
    preset_settings: { maSignal: { value: 60 } } 
  },
];

// DB 형식 → 앱 형식 변환
const dbToApp = (dbPosition) => ({
  id: dbPosition.id,
  name: dbPosition.name,
  code: dbPosition.code,
  buyPrice: dbPosition.buy_price,
  quantity: dbPosition.quantity,
  highestPrice: dbPosition.highest_price,
  selectedPresets: dbPosition.selected_presets || ['candle3', 'stopLoss'],
  presetSettings: dbPosition.preset_settings || { stopLoss: { value: -5 }, maSignal: { value: 20 } },
  createdAt: dbPosition.created_at,
  updatedAt: dbPosition.updated_at,
});

// 앱 형식 → DB 형식 변환
const appToDb = (appPosition) => ({
  name: appPosition.name,
  code: appPosition.code,
  buy_price: Number(appPosition.buyPrice),
  quantity: Number(appPosition.quantity),
  highest_price: Number(appPosition.highestPrice || appPosition.buyPrice),
  selected_presets: appPosition.selectedPresets || ['candle3', 'stopLoss'],
  preset_settings: appPosition.presetSettings || { stopLoss: { value: -5 }, maSignal: { value: 20 } },
});

/**
 * 포지션 데이터 Supabase CRUD Hook
 * - 로그인 사용자: Supabase에서 데이터 로드/저장
 * - 비로그인 사용자: 데모 데이터 표시 (읽기 전용)
 */
export function usePositions() {
  const { user, loading: authLoading } = useAuth();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 데모 데이터를 앱 형식으로 변환 (메모이제이션)
  const demoPositions = useMemo(() => DEMO_POSITIONS.map(dbToApp), []);

  // 포지션 로드
  const fetchPositions = useCallback(async () => {
    // 이미 초기화되었고 user가 없으면 스킵
    if (initialized && !user) {
      return;
    }

    if (!user) {
      // 비로그인: 데모 데이터 표시
      setPositions(demoPositions);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('positions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setPositions(data.map(dbToApp));
      } else {
        // 신규 사용자: 빈 배열
        setPositions([]);
      }
      setInitialized(true);
    } catch (err) {
      console.error('포지션 로드 오류:', err);
      setError(err.message);
      // 오류 시 데모 데이터 폴백
      setPositions(demoPositions);
    } finally {
      setLoading(false);
    }
  }, [user, demoPositions, initialized]);

  // 포지션 추가
  const addPosition = useCallback(async (newPosition) => {
    if (!user) {
      console.warn('로그인이 필요합니다.');
      return null;
    }

    try {
      setIsSaving(true);
      setError(null);

      const dbData = {
        ...appToDb(newPosition),
        user_id: user.id,
      };

      const { data, error: insertError } = await supabase
        .from('positions')
        .insert([dbData])
        .select()
        .single();

      if (insertError) throw insertError;

      const appData = dbToApp(data);
      setPositions(prev => [appData, ...prev]);
      
      return appData;
    } catch (err) {
      console.error('포지션 추가 오류:', err);
      setError(err.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // 포지션 수정
  const updatePosition = useCallback(async (id, updates) => {
    if (!user) {
      console.warn('로그인이 필요합니다.');
      return null;
    }

    try {
      setIsSaving(true);
      setError(null);

      const dbData = appToDb(updates);

      const { data, error: updateError } = await supabase
        .from('positions')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const appData = dbToApp(data);
      setPositions(prev => prev.map(p => p.id === id ? appData : p));
      
      return appData;
    } catch (err) {
      console.error('포지션 수정 오류:', err);
      setError(err.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // 포지션 삭제
  const deletePosition = useCallback(async (id) => {
    if (!user) {
      console.warn('로그인이 필요합니다.');
      return false;
    }

    try {
      setIsSaving(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPositions(prev => prev.filter(p => p.id !== id));
      
      return true;
    } catch (err) {
      console.error('포지션 삭제 오류:', err);
      setError(err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // 최고가 업데이트 (자동)
  const updateHighestPrice = useCallback(async (id, newHighestPrice) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('positions')
        .update({ highest_price: newHighestPrice })
        .eq('id', id);

      if (updateError) throw updateError;

      setPositions(prev => 
        prev.map(p => p.id === id ? { ...p, highestPrice: newHighestPrice } : p)
      );
    } catch (err) {
      console.error('최고가 업데이트 오류:', err);
    }
  }, [user]);

  // 사용자 변경 시 데이터 리로드
  useEffect(() => {
    if (!authLoading) {
      fetchPositions();
    }
  }, [authLoading, user?.id]); // user?.id로 변경하여 user 객체 전체가 아닌 id만 의존

  return {
    positions,
    loading: loading || authLoading,
    error,
    isSaving,
    isLoggedIn: !!user,
    addPosition,
    updatePosition,
    deletePosition,
    updateHighestPrice,
    refetch: fetchPositions,
  };
}

export default usePositions;
