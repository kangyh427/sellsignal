'use client';
// ============================================
// CRESTApp — 메인 앱 컴포넌트
// 경로: src/components/CRESTApp.tsx
// 세션 64: 전면 리팩토링 (타입 수정 + 중복 fetch 해결 + 코드 정리)
//
// [변경 이력]
// 세션 63: 차트 API 직접 호출 + Mock 파라미터 버그 수정
// 세션 64: 1) generateMockPriceData date:string → Date 변환
//          2) stockPriceMap useEffect 의존성 제거 → 중복 fetch 해결
//          3) 디버그 로그 DEV 플래그로 통합
//          4) 인라인 스타일 정리 + 가독성 개선
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useResponsive from '@/hooks/useResponsive';
import useAuth from '@/hooks/useAuth';
import usePositions from '@/hooks/usePositions';
import useStockPrices from '@/hooks/useStockPrices';
import { SELL_PRESETS, generateMockPriceData, formatCompact } from '@/constants';
import type { Position, Alert, CandleData } from '@/types';

// ── 하위 컴포넌트 ──
import CrestLogo from './CrestLogo';
import ResponsiveHeader from './ResponsiveHeader';
import ResponsiveSummaryCards from './ResponsiveSummaryCards';
import MobileBottomNav from './MobileBottomNav';
import MarketMiniSummary from './MarketMiniSummary';
import MarketCycleWidget from './MarketCycleWidget';
import BuffettIndicatorWidget from './BuffettIndicatorWidget';
import SellMethodGuide from './SellMethodGuide';
import PositionCard from './PositionCard';
import AlertCard from './AlertCard';
import AddStockModal from './AddStockModal';
import UpgradePopup from './UpgradePopup';
import Footer from './Footer';

// ============================================
// 상수 & 설정
// ============================================
const CHART_DAYS = 90;
const IS_DEV = process.env.NODE_ENV === 'development';

/** 프리미엄/무료 사용자 제한 */
const FREE_LIMITS = {
  maxPositions: 3,
  maxAINews: 3,
} as const;

/** 데모 알림 (MVP 단계 — 추후 실제 시그널 엔진으로 대체) */
const DEMO_ALERTS: Alert[] = [
  {
    id: 1,
    stockName: '삼성전자',
    code: '005930',
    preset: SELL_PRESETS.stopLoss,
    message: '손절 기준가(-5%) 근접! 현재 -4.2%',
    currentPrice: 68500,
    targetPrice: 67925,
    timestamp: Date.now() - 300_000,
  },
  {
    id: 2,
    stockName: '한화에어로스페이스',
    code: '012450',
    preset: SELL_PRESETS.twoThird,
    message: '최고점 대비 1/3 하락 근접',
    currentPrice: 365000,
    targetPrice: 369600,
    timestamp: Date.now() - 1_800_000,
  },
];

// ============================================
// 유틸리티 함수
// ============================================

/**
 * generateMockPriceData → CandleData[] 변환 어댑터
 *
 * generateMockPriceData는 date를 string(ISO)으로 반환하지만,
 * CandleData 타입은 date: Date를 요구함 → 변환 필요
 */
function mockToCandleData(
  buyPrice: number,
  currentPrice: number,
  days: number
): CandleData[] {
  const raw = generateMockPriceData(buyPrice, currentPrice, days);
  return raw.map((c) => ({
    date: new Date(c.date),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: c.volume,
  }));
}

/** 개발 환경에서만 로그 출력 */
function devLog(tag: string, ...args: unknown[]) {
  if (IS_DEV) console.log(`[CREST:${tag}]`, ...args);
}

// ============================================
// 메인 컴포넌트
// ============================================
export default function CRESTApp() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();
  const { user, isLoggedIn, isLoading: authLoading, signOut } = useAuth();

  // ── 포지션 & 실시간 가격 ──
  const {
    positions,
    isLoading: positionsLoading,
    addPosition,
    updatePosition,
    deletePosition,
  } = usePositions(user?.id ?? null);

  const {
    prices: stockPriceMap,
    isLoading: pricesLoading,
    error: pricesError,
    lastUpdated: pricesLastUpdated,
  } = useStockPrices(positions);

  // ── UI 상태 ──
  const [activeTab, setActiveTab] = useState('positions');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [aiNewsUsedCount, setAiNewsUsedCount] = useState(0);
  const isPremium = false; // TODO: Supabase subscription 연동

  // ── 차트 데이터 (CRESTApp에서 직접 관리) ──
  const [priceDataMap, setPriceDataMap] = useState<Record<number, CandleData[]>>({});
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const fetchedIdsRef = useRef<Set<number>>(new Set());

  // ★ stockPriceMap을 ref로 보관 → useEffect 의존성에서 제거하여 중복 fetch 방지
  const stockPriceMapRef = useRef(stockPriceMap);
  useEffect(() => {
    stockPriceMapRef.current = stockPriceMap;
  }, [stockPriceMap]);

  // ── 차트 데이터 단건 fetch ──
  const fetchChartData = useCallback(
    async (position: Position): Promise<CandleData[] | null> => {
      try {
        const market = /^\d{6}$/.test(position.code) ? 'KR' : 'US';
        const url = `/api/stocks/history?code=${position.code}&days=${CHART_DAYS}&market=${market}`;
        devLog('chart', `fetch: ${position.name} (${position.code})`);

        const res = await fetch(url);
        if (!res.ok) {
          devLog('chart', `API 에러: ${position.code} → ${res.status}`);
          return null;
        }

        const data = await res.json();
        if (!data.candles || data.candles.length === 0) {
          devLog('chart', `데이터 없음: ${position.code}`);
          return null;
        }

        devLog('chart', `성공: ${position.code} → ${data.candles.length}개 캔들`);
        return data.candles.map((c: any) => ({
          date: new Date(c.date),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume || 0,
        }));
      } catch (err) {
        devLog('chart', `fetch 실패: ${position.code}`, err);
        return null;
      }
    },
    []
  );

  // ── 차트 데이터 일괄 로드 ──
  // ★ 의존성에서 stockPriceMap 제거 → ref로 대체하여 중복 호출 방지
  useEffect(() => {
    if (positions.length === 0) return;

    const newPositions = positions.filter((p) => !fetchedIdsRef.current.has(p.id));
    if (newPositions.length === 0) return;

    setChartLoading(true);
    setChartError(null);

    const loadCharts = async () => {
      const results: Record<number, CandleData[]> = {};

      for (const p of newPositions) {
        const candles = await fetchChartData(p);

        if (candles && candles.length > 0) {
          results[p.id] = candles;
        } else {
          // API 실패 시 Mock 폴백 — ref에서 현재가 참조
          const currentPrice = stockPriceMapRef.current[p.code]?.price || p.buyPrice;
          results[p.id] = mockToCandleData(p.buyPrice, currentPrice, CHART_DAYS);
          devLog('chart', `Mock 폴백: ${p.code}`);
        }

        fetchedIdsRef.current.add(p.id);
      }

      setPriceDataMap((prev) => ({ ...prev, ...results }));
      setChartLoading(false);
    };

    loadCharts();
  }, [positions, fetchChartData]); // ★ stockPriceMap 제거됨

  // ============================================
  // 이벤트 핸들러
  // ============================================
  const handleUpdatePosition = useCallback(
    (updated: Position) => updatePosition(updated),
    [updatePosition]
  );

  const handleDeletePosition = useCallback(
    (id: number) => {
      deletePosition(id);
      fetchedIdsRef.current.delete(id);
      setPriceDataMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [deletePosition]
  );

  const handleAddStock = useCallback(
    async (stock: { name: string; code: string; buyPrice: number; quantity: number }) => {
      await addPosition(stock);
    },
    [addPosition]
  );

  const handleAuthAction = useCallback(() => {
    if (isLoggedIn) {
      signOut();
    } else {
      router.push('/login');
    }
  }, [isLoggedIn, signOut, router]);

  /** 종목 추가 버튼 — 무료 한도 체크 포함 */
  const handleAddButtonClick = useCallback(() => {
    if (!isPremium && positions.length >= FREE_LIMITS.maxPositions) {
      setShowUpgrade(true);
    } else {
      setShowAddModal(true);
    }
  }, [isPremium, positions.length]);

  // ============================================
  // 계산된 값 (파생 상태)
  // ============================================
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0);

  const totalValue = positions.reduce((sum, p) => {
    const realTimePrice = stockPriceMap[p.code]?.price;
    const chartLastClose = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close;
    const currentPrice = realTimePrice || chartLastClose || p.buyPrice;
    return sum + currentPrice * p.quantity;
  }, 0);

  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // ============================================
  // 로딩 화면
  // ============================================
  if (authLoading || positionsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg width={48} height={48} viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#1e293b" />
            <path
              d="M10 28 L16 14 L20 22 L24 12 L30 28"
              stroke="#3b82f6"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="12" r="3" fill="#10b981" />
          </svg>
          <div style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 메인 렌더링
  // ============================================
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      paddingBottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0px))' : '0',
    }}>

      {/* ── 헤더 ── */}
      <ResponsiveHeader
        alerts={alerts}
        isPremium={isPremium}
        isLoggedIn={isLoggedIn}
        onShowUpgrade={() => setShowUpgrade(true)}
        onShowAddModal={handleAddButtonClick}
        onLogin={handleAuthAction}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* ── 메인 콘텐츠 ── */}
      <main style={{
        maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px',
        margin: '0 auto',
        padding: isMobile ? '0' : '24px',
      }}>
        {/* 요약 카드 */}
        <ResponsiveSummaryCards
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* 에러 배너 */}
        {(chartError || pricesError) && (
          <div style={{
            margin: isMobile ? '0 16px 12px' : '0 0 12px',
            padding: '10px 14px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#f59e0b',
          }}>
            <span>⚠️</span>
            <div>
              <div style={{ fontWeight: '600' }}>주가 데이터 조회 지연</div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                {chartError || pricesError} — 임시 데이터로 표시 중
              </div>
            </div>
          </div>
        )}

        {/* 차트 로딩 표시 */}
        {chartLoading && positions.length > 0 && (
          <div style={{
            margin: isMobile ? '0 16px 12px' : '0 0 12px',
            padding: '8px 14px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.12)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#60a5fa',
          }}>
            <span>📊</span>
            <span>차트 데이터 불러오는 중...</span>
          </div>
        )}

        {/* ── 3열 그리드 레이아웃 ── */}
        <div style={
          isMobile
            ? { display: 'flex', flexDirection: 'column' as const, gap: '0' }
            : isTablet
              ? { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px', padding: '0 20px' }
              : { display: 'grid', gridTemplateColumns: isPremium ? '1fr 440px' : '160px 1fr 440px', gap: '20px' }
        }>

          {/* ── 좌측: AdSense 사이드바 (데스크탑 무료 사용자만) ── */}
          {!isMobile && !isTablet && !isPremium && (
            <div style={{ position: 'sticky', top: '80px', alignSelf: 'start' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                borderRadius: '12px',
                padding: '12px 8px',
                border: '1px dashed rgba(255,255,255,0.08)',
                textAlign: 'center',
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', letterSpacing: '1px' }}>
                  AD
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                  📢 Google<br />AdSense<br />(160×600)
                  <div style={{ fontSize: '9px', color: '#475569', marginTop: '8px' }}>
                    PRO 구독 시<br />광고 제거
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 중앙: 보유 종목 리스트 ── */}
          <div style={{
            display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            {/* 모바일 마켓 미니 요약 (탭이 positions일 때만) */}
            {isMobile && activeTab === 'positions' && (
              <MarketMiniSummary onClick={() => setActiveTab('market')} />
            )}

            {/* 섹션 헤더 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}>
              <h2 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#fff',
                margin: 0,
              }}>
                보유 종목 ({positions.length})
              </h2>
              <button
                onClick={handleAddButtonClick}
                style={{
                  padding: '6px 14px',
                  height: '34px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + 추가 {!isPremium && `(${positions.length}/${FREE_LIMITS.maxPositions})`}
              </button>
            </div>

            {/* 로그인 상태 배너 */}
            <div style={{
              background: isLoggedIn ? 'rgba(16,185,129,0.06)' : 'rgba(59,130,246,0.06)',
              border: `1px solid ${isLoggedIn ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)'}`,
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>{isLoggedIn ? '✅' : '💡'}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '12px',
                  color: isLoggedIn ? '#10b981' : '#60a5fa',
                  fontWeight: '600',
                }}>
                  {isLoggedIn ? `로그인 완료 (${user?.email})` : '데모 모드'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {isLoggedIn
                    ? '내 종목이 자동 저장됩니다'
                    : '로그인하면 내 종목을 저장/관리할 수 있습니다'}
                </div>
              </div>
              {!isLoggedIn && (
                <button
                  onClick={() => router.push('/login')}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '6px',
                    color: '#60a5fa',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  로그인
                </button>
              )}
            </div>

            {/* 마지막 갱신 시각 */}
            {pricesLastUpdated && positions.length > 0 && (
              <div style={{
                fontSize: '10px',
                color: '#475569',
                textAlign: 'right',
                marginBottom: '8px',
                paddingRight: '4px',
              }}>
                🟢 마지막 갱신: {new Date(pricesLastUpdated).toLocaleTimeString('ko-KR')}
                {pricesLoading && ' (갱신 중...)'}
              </div>
            )}

            {/* 빈 상태 */}
            {positions.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📈</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                  종목을 추가해 보세요
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  한국·미국 주식을 검색하고 매도 조건을 설정하세요
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  + 첫 종목 추가하기
                </button>
              </div>
            )}

            {/* 포지션 카드 목록 */}
            {positions.map((pos) => (
              <PositionCard
                key={pos.id}
                position={pos}
                priceData={priceDataMap[pos.id]}
                isMobile={isMobile}
                isTablet={isTablet}
                onUpdate={handleUpdatePosition}
                onDelete={handleDeletePosition}
                isPremium={isPremium}
                stockPrice={stockPriceMap[pos.code] || null}
                aiNewsUsedCount={aiNewsUsedCount}
                maxFreeAINews={FREE_LIMITS.maxAINews}
                onUseAINews={() => setAiNewsUsedCount((prev) => prev + 1)}
                onShowUpgrade={() => setShowUpgrade(true)}
              />
            ))}

            {/* 하단 AdSense (무료 사용자, 종목 있을 때) */}
            {!isPremium && positions.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '8px',
                border: '1px dashed rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '10px', color: '#475569', letterSpacing: '1px', marginBottom: '4px' }}>AD</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>📢 AdSense (320×100)</div>
                <div style={{ fontSize: '9px', color: '#475569', marginTop: '4px' }}>PRO 구독 시 광고 제거</div>
              </div>
            )}
          </div>

          {/* ── 우측: 시장 분석 + 알림 + 매도법 가이드 ── */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
            <div style={{ padding: isMobile ? '0 16px' : '0', overflow: 'visible' }}>

              {/* 시장 분석 위젯 */}
              <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
                {/* 모바일 뒤로가기 버튼 */}
                {isMobile && activeTab === 'market' && (
                  <button
                    onClick={() => setActiveTab('positions')}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      marginBottom: '10px',
                      minHeight: '44px',
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))',
                      border: '1px solid rgba(59,130,246,0.15)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(59,130,246,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: '#60a5fa',
                    }}>
                      ←
                    </span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#60a5fa' }}>
                        보유 종목으로 돌아가기
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        포지션 · 차트 · AI분석
                      </div>
                    </div>
                  </button>
                )}

                <MarketCycleWidget isMobile={isMobile} isTablet={isTablet} isPremium={isPremium} />
                <BuffettIndicatorWidget isMobile={isMobile} isPremium={isPremium} />
              </div>

              {/* 알림 섹션 */}
              <div style={{
                display: isMobile && activeTab !== 'alerts' ? 'none' : 'block',
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                borderRadius: '14px',
                padding: isMobile ? '14px' : '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '12px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#fff',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    🔔 조건 도달 알림
                    {alerts.length > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '700',
                      }}>
                        {alerts.length}
                      </span>
                    )}
                  </h3>
                  {alerts.length > 0 && (
                    <button
                      onClick={() => setAlerts([])}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: '#64748b',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      모두 지우기
                    </button>
                  )}
                </div>

                {alerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>현재 도달한 조건이 없습니다</div>
                  </div>
                ) : (
                  alerts.map((a) => (
                    <AlertCard
                      key={a.id}
                      alert={a}
                      onDismiss={(id) => setAlerts((prev) => prev.filter((x) => x.id !== id))}
                    />
                  ))
                )}
              </div>

              {/* 매도법 가이드 */}
              <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />
            </div>
          )}
        </div>
      </main>

      {/* ── 모바일 하단 네비게이션 ── */}
      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={alerts.length}
        />
      )}

      {/* ── 모달 ── */}
      {showAddModal && (
        <AddStockModal
          isMobile={isMobile}
          maxFreePositions={FREE_LIMITS.maxPositions}
          currentPositionCount={positions.length}
          isPremium={isPremium}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddStock}
        />
      )}

      {showUpgrade && (
        <UpgradePopup
          isMobile={isMobile}
          maxFreePositions={FREE_LIMITS.maxPositions}
          maxFreeAINews={FREE_LIMITS.maxAINews}
          onClose={() => setShowUpgrade(false)}
        />
      )}

      {/* ── 푸터 ── */}
      <Footer isMobile={isMobile} />
    </div>
  );
}
