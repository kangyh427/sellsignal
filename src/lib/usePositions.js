'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

// 데모 데이터 (컴포넌트 외부에 정의)
const DEMO_POSITIONS_RAW = [
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
function dbToApp(dbPosition) {
  return {
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
  };
}

// [수정됨] 앱 형식 → DB 형식 변환 (부분 업데이트 지원)
// isUpdate=true일 경우, 존재하는 필드만 변환
function appToDb(appPosition, isUpdate = false) {
  // 매핑 테이블
  const mapping = {
    name: 'name',
    code: 'code',
    buyPrice: 'buy_price',
    quantity: 'quantity',
    highestPrice: 'highest_price',
    selectedPresets: 'selected_presets',
    presetSettings: 'preset_settings',
  };

  // 부분 업데이트용: 존재하는 필드만 변환
  if (isUpdate) {
    const dbData = {};
    
    Object.keys(appPosition).forEach(key => {
      if (mapping[key] && appPosition[key] !== undefined) {
        const dbKey = mapping[key];
        let value = appPosition[key];

        // 숫자형 필드 변환
        if (['buyPrice', 'quantity', 'highestPrice'].includes(key)) {
          value = Number(value);
        }
        
        dbData[dbKey] = value;
      }
    });
    
    return dbData;
  }

  // 전체 생성용: 기본값 포함
  return {
    name: appPosition.name,
    code: appPosition.code,
    buy_price: Number(appPosition.buyPrice),
    quantity: Number(appPosition.quantity),
    highest_price: Number(appPosition.highestPrice || appPosition.buyPrice),
    selected_presets: appPosition.selectedPresets || ['candle3', 'stopLoss'],
    preset_settings: appPosition.presetSettings || { stopLoss: { value: -5 }, maSignal: { value: 20 } },
  };
}

// 데모 데이터 (앱 형식으로 미리 변환)
const DEMO_POSITIONS = DEMO_POSITIONS_RAW.map(dbToApp);

/**
 * 포지션 데이터 Supabase CRUD Hook
 * - 로그인 사용자: Supabase에서 데이터 로드/저장
 * - 비로그인 사용자: 로컬 상태로 데모 체험 가능
 */
export function usePositions() {
  const { user, loading: authLoading } = useAuth();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 사용자 변경 시 데이터 로드
  useEffect(() => {
    if (authLoading) {
      return;
    }

    // 비로그인 사용자: 데모 데이터
    if (!user) {
      setPositions(DEMO_POSITIONS);
      setLoading(false);
      return;
    }

    // 로그인 사용자: Supabase에서 로드
    let isMounted = true;

    async function loadPositions() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('positions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (fetchError) {
          throw fetchError;
        }

        if (data && data.length > 0) {
          setPositions(data.map(dbToApp));
        } else {
          setPositions([]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('포지션 로드 오류:', err);
        setError(err.message);
        setPositions([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPositions();

    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading]);

  // 포지션 추가
  const addPosition = useCallback(async (newPosition) => {
    // [개선] 비로그인 사용자도 로컬에서 추가 체험 가능
    if (!user) {
      const tempId = `temp-${Date.now()}`;
      const tempData = {
        id: tempId,
        name: newPosition.name,
        code: newPosition.code,
        buyPrice: Number(newPosition.buyPrice),
        quantity: Number(newPosition.quantity),
        highestPrice: Number(newPosition.highestPrice || newPosition.buyPrice),
        selectedPresets: newPosition.selectedPresets || ['candle3', 'stopLoss'],
        presetSettings: newPosition.presetSettings || { stopLoss: { value: -5 }, maSignal: { value: 20 } },
      };
      setPositions(prev => [tempData, ...prev]);
      return tempData;
    }

    try {
      setIsSaving(true);
      setError(null);

      const dbData = {
        ...appToDb(newPosition, false),
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
    // [개선] 비로그인 사용자 로컬 수정 지원
    if (!user) {
      setPositions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return { id, ...updates };
    }

    try {
      setIsSaving(true);
      setError(null);

      // [핵심 수정] 부분 업데이트용 변환 (isUpdate = true)
      const dbData = appToDb(updates, true);

      // 빈 업데이트 방지
      if (Object.keys(dbData).length === 0) {
        console.warn('업데이트할 필드가 없습니다.');
        return null;
      }

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
    // [개선] 비로그인 사용자 로컬 삭제 지원
    if (!user) {
      setPositions(prev => prev.filter(p => p.id !== id));
      return true;
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

  // 최고가 업데이트 (Optimistic UI)
  const updateHighestPrice = useCallback(async (id, newHighestPrice) => {
    // 로컬 상태 즉시 반영 (Optimistic Update)
    setPositions(prev => 
      prev.map(p => p.id === id ? { ...p, highestPrice: newHighestPrice } : p)
    );

    // 비로그인은 로컬만 업데이트
    if (!user) return;

    try {
      const { error } = await supabase
        .from('positions')
        .update({ highest_price: newHighestPrice })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      console.error('최고가 업데이트 오류:', err);
      // 필요 시 롤백 로직 추가 가능
    }
  }, [user]);

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
  };
}

export default usePositions;
