'use client';
// ============================================
// PositionCard v2.1 - 보유 종목 카드 (서브컴포넌트 분리)
// 경로: src/components/PositionCard.tsx
// 세션 33: 648줄 → ~320줄 (서브컴포넌트 3개 분리)
// 세션 34: 데스크탑 차트 너비 동적 계산 (컨테이너 기반)
// 세션 64: 매물대 매도법 매도가격 수정 (저항→지지, PPT 로직 반영)
// 변경사항:
//   - volumeZone 매도가격: buyPrice*1.1 → 현재가 아래 가장 가까운 지지 매물대
//   - PPT: "하단 매물대의 지지를 깨고 하락할 때 매도"
// ============================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SELL_PRESETS, CHART_LINE_PRESETS, PROFIT_STAGES, formatCompact } from '@/constants';
import EnhancedMiniChart from './EnhancedMiniChart';
import PositionEditModal from './PositionEditModal';
import AINewsSummary from './AINewsSummary';
import SignalSection from './SignalSection';
import useSwipeToDelete from '@/hooks/useSwipeToDelete';
import type { Position, StockPrice, PositionSignals } from '@/types';

// ★ 서브컴포넌트
import CardHeader from './position/CardHeader';
import CardPresets from './position/CardPresets';
import CardActions from './position/CardActions';

interface PositionCardProps {
  position: Position;
  priceData: any[] | undefined;
  isMobile: boolean;
  isTablet: boolean;
  isPremium: boolean;
  onUpdate: (updated: Position) => void;
  onDelete: (id: number) => void;
  stockPrice?: StockPrice | null;
  signals?: PositionSignals | null;
  aiNewsUsedCount?: number;
  maxFreeAINews?: number;
  onUseAINews?: () => void;
  onShowUpgrade?: () => void;
}

const PositionCard = ({
  position, priceData, isMobile, isTablet,
  onUpdate, onDelete, isPremium, stockPrice, signals,
  aiNewsUsedCount = 0, maxFreeAINews = 3, onUseAINews, onShowUpgrade,
}: PositionCardProps) => {
  // ── 상태 ──
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [showChart, setShowChart] = useState(!isMobile);
  const [showPresets, setShowPresets] = useState(!isMobile);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(() => {
    const lines: Record<string, boolean> = {};
    CHART_LINE_PRESETS.forEach((p) => { lines[p] = true; });
    return lines;
  });

  // ★ 스와이프 삭제 훅
  const swipe = useSwipeToDelete();

  // ── 현재가 계산 (실시간 → 차트 → 매수가) ──
  const cur = stockPrice?.price
    || priceData?.[priceData.length - 1]?.close
    || position.buyPrice;

  // ── 수익률 계산 ──
  const profitRate = ((cur - position.buyPrice) / position.buyPrice) * 100;
  const profitAmount = (cur - position.buyPrice) * position.quantity;
  const totalValue = cur * position.quantity;
  const isProfit = profitRate >= 0;

  // ── 수익 단계 ──
  const getStage = () => {
    if (profitRate < 0) return { label: '손실 구간', color: '#ef4444' };
    if (profitRate < 5) return PROFIT_STAGES.initial;
    if (profitRate < 10) return PROFIT_STAGES.profit5;
    return PROFIT_STAGES.profit10;
  };
  const stage = getStage();

  // ── 시그널 border ──
  const getSignalBorder = () => {
    if (!signals) return '1px solid rgba(255,255,255,0.08)';
    switch (signals.maxLevel) {
      case 'danger': return '1px solid rgba(239,68,68,0.25)';
      case 'warning': return '1px solid rgba(245,158,11,0.2)';
      default: return '1px solid rgba(255,255,255,0.08)';
    }
  };

  // ── 매도가 계산 ──
  const sellPrices: Record<string, number> = {};
  (position.selectedPresets || []).forEach((pid) => {
    const setting = position.presetSettings?.[pid]?.value;
    switch (pid) {
      case 'candle3': {
        // ★ 세션60: 봉 3개 매도법 매도가격 계산
        // PPT: "최근 양봉의 50%를 덮는 음봉 발생 시 절반 매도"
        // 연속 양봉은 합쳐서 하나의 양봉으로 가정, 그 몸통의 50% 지점이 매도가격
        if (priceData && priceData.length >= 3) {
          const recent = priceData.slice(-5); // 최근 5일 캔들
          // 최근 연속 양봉 찾기 (뒤에서부터)
          let yangbongStart = -1;
          let yangbongEnd = recent.length - 1;
          for (let i = recent.length - 1; i >= 0; i--) {
            if (recent[i].close >= recent[i].open) {
              yangbongStart = i;
            } else {
              break; // 음봉 만나면 중단
            }
          }
          if (yangbongStart >= 0 && yangbongStart <= yangbongEnd) {
            // 연속 양봉 구간의 시가(시작봉의 open)와 종가(마지막봉의 close)
            const mergedOpen = recent[yangbongStart].open;
            const mergedClose = recent[yangbongEnd].close;
            const bodyMid = Math.round((mergedOpen + mergedClose) / 2);
            sellPrices.candle3 = bodyMid; // 합쳐진 양봉 몸통의 50% 지점
          }
        }
        break;
      }
      case 'stopLoss':
        sellPrices.stopLoss = Math.round(position.buyPrice * (1 + (setting || -5) / 100));
        break;
      case 'twoThird': {
        // ★ 세션60: highestPrice가 현재가보다 낮을 수 있으므로 Math.max 적용
        // PPT: "매수가와 최고가 사이를 3등분, 위에서부터 1/3 하락 지점에서 매도"
        const hp = Math.max(position.highestPrice || 0, cur);
        sellPrices.twoThird = Math.round(hp - (hp - position.buyPrice) / 3);
        break;
      }
      case 'maSignal': {
        if (priceData?.length) {
          const mp = setting || 20;
          const rd = priceData.slice(-mp);
          sellPrices.maSignal = Math.round(rd.reduce((s: number, d: any) => s + d.close, 0) / rd.length);
        }
        break;
      }
      case 'volumeZone': {
        // ★ 세션64: PPT 매물대 매도법 — "하단 지지 매물대를 깨고 하락할 때 매도"
        // 현재가 아래에서 가장 가까운 고거래량 매물대(지지대)의 상단 가격 = 매도 기준가
        // 이 가격을 깨면 지지 이탈 → 매도 시그널
        if (priceData && priceData.length >= 10) {
          // 볼륨 프로파일 계산 (20구간)
          const zones = 20;
          let minP = Infinity, maxP = -Infinity;
          priceData.forEach((c: any) => {
            if (c.low < minP) minP = c.low;
            if (c.high > maxP) maxP = c.high;
          });
          const prRange = maxP - minP;
          if (prRange > 0) {
            const zoneSize = prRange / zones;
            const volByZone: number[] = new Array(zones).fill(0);
            priceData.forEach((c: any) => {
              const vol = c.volume || 1;
              const cRange = (c.high - c.low) || zoneSize * 0.1;
              for (let z = 0; z < zones; z++) {
                const zLow = minP + z * zoneSize;
                const zHigh = minP + (z + 1) * zoneSize;
                const oLow = Math.max(c.low, zLow);
                const oHigh = Math.min(c.high, zHigh);
                if (oLow < oHigh) volByZone[z] += vol * ((oHigh - oLow) / cRange);
              }
            });
            const maxVol = Math.max(...volByZone);
            const avgVol = volByZone.reduce((s, v) => s + v, 0) / zones;
            // 현재가가 위치한 구간
            const curZone = Math.min(Math.floor((cur - minP) / zoneSize), zones - 1);
            // 현재가 아래에서 고거래량 지지 매물대 찾기 (가장 가까운 것)
            let supportPrice = 0;
            for (let z = curZone - 1; z >= 0; z--) {
              if (volByZone[z] > avgVol * 1.2 && volByZone[z] / maxVol > 0.3) {
                // 이 구간의 하단 = 지지선 (이걸 깨면 매도)
                supportPrice = Math.round(minP + z * zoneSize);
                break;
              }
            }
            if (supportPrice > 0) {
              sellPrices.volumeZone = supportPrice;
            } else {
              // 지지 매물대를 찾지 못한 경우 → 매수가를 폴백으로
              sellPrices.volumeZone = position.buyPrice;
            }
          }
        } else {
          // 차트 데이터 없으면 매수가를 폴백
          sellPrices.volumeZone = position.buyPrice;
        }
        break;
      }
      case 'trendline': {
        // ★ 세션64: PPT 추세선 매도법 — "최근 2번째 지지선 이탈 시 매도"
        // 캔들 최저가(low)에서 로컬 저점(양옆보다 낮은 점)을 찾고,
        // 최근 2번째 저점 = 매도 기준가
        if (priceData && priceData.length >= 10) {
          // 로컬 저점 찾기 (양옆 캔들보다 low가 낮은 지점)
          const localLows: { idx: number; price: number }[] = [];
          for (let i = 1; i < priceData.length - 1; i++) {
            const c = priceData[i];
            const prev = priceData[i - 1];
            const next = priceData[i + 1];
            if (c.low <= prev.low && c.low <= next.low) {
              localLows.push({ idx: i, price: c.low });
            }
          }
          if (localLows.length >= 2) {
            // 최근 순으로 정렬 (idx 큰 것 = 최근)
            localLows.sort((a, b) => b.idx - a.idx);
            // 최근 2번째 지지선 = 매도 기준가
            sellPrices.trendline = Math.round(localLows[1].price);
          } else if (localLows.length === 1) {
            // 저점이 1개뿐이면 그것을 사용
            sellPrices.trendline = Math.round(localLows[0].price);
          } else {
            // 저점을 찾지 못하면 전체 기간 최저가
            const allLow = Math.min(...priceData.map((d: any) => d.low));
            sellPrices.trendline = Math.round(allLow);
          }
        } else {
          sellPrices.trendline = Math.round(position.buyPrice * 0.95);
        }
        break;
      }
    }
  });

  // ── 외부 링크 ──
  const naverChartUrl = isMobile
    ? `https://m.stock.naver.com/domestic/stock/${position.code}/chart`
    : `https://finance.naver.com/item/fchart.naver?code=${position.code}`;
  const naverNewsUrl = `https://finance.naver.com/item/news.naver?code=${position.code}`;

  // ── 차트 컨테이너 너비 동적 측정 ──
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = useState(isMobile ? 320 : 380);

  useEffect(() => {
    const measure = () => {
      if (chartContainerRef.current) {
        const containerW = chartContainerRef.current.clientWidth;
        // 패딩(8px*2) 제외한 실제 차트 영역
        setChartW(Math.max(280, containerW - 16));
      } else {
        // fallback
        setChartW(isMobile ? Math.min(window?.innerWidth - 60 || 320, 400) : isTablet ? 300 : 380);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isMobile, isTablet]);

  // ── 핸들러 ──
  const handleCardToggle = () => {
    if (swipe.showDeleteBtn) { swipe.resetSwipe(); return; }
    setIsExpanded(!isExpanded);
  };

  const handleToggleAI = () => {
    if (showAI) { setShowAI(false); return; }
    if (!isPremium && aiNewsUsedCount >= maxFreeAINews) {
      onShowUpgrade?.();
      return;
    }
    if (!isPremium && onUseAINews) onUseAINews();
    setShowAI(true);
  };

  return (
    <>
      {/* ★ 스와이프 래퍼 */}
      <div
        {...(isMobile ? swipe.handlers : {})}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: '14px',
          marginBottom: '10px',
          transform: isMobile ? `translateX(${swipe.offsetX}px)` : undefined,
          transition: swipe.isDragging ? 'none' : 'transform 0.3s ease',
        }}
      >
        {/* 스와이프 삭제 버튼 (배경) */}
        {isMobile && swipe.showDeleteBtn && (
          <div
            onClick={() => { setShowDeleteConfirm(true); swipe.resetSwipe(); }}
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px',
              background: '#ef4444', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: '700',
              fontSize: '13px', cursor: 'pointer', borderRadius: '0 14px 14px 0',
            }}
          >🗑️ 삭제</div>
        )}

        {/* 카드 본체 */}
        <div style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          borderRadius: '14px', border: getSignalBorder(),
          overflow: 'hidden',
        }}>
          {/* ★ CardHeader 서브컴포넌트 */}
          <CardHeader
            position={position}
            currentPrice={cur}
            profitRate={profitRate}
            profitAmount={profitAmount}
            totalValue={totalValue}
            isProfit={isProfit}
            stage={stage}
            signals={signals}
            stockPrice={stockPrice}
            isMobile={isMobile}
            isExpanded={isExpanded}
            onToggle={handleCardToggle}
          />

          {/* ★ 펼친 상태: 시그널 + 프리셋 + 차트 */}
          {isExpanded && (
            <div style={{ padding: isMobile ? '0 14px 14px' : '0 16px 16px' }}>
              {/* 시그널 섹션 */}
              {signals && signals.signals.length > 0 && (
                <SignalSection signals={signals} isMobile={isMobile} />
              )}

              {/* ★ CardPresets 서브컴포넌트 */}
              <CardPresets
                position={position}
                currentPrice={cur}
                sellPrices={sellPrices}
                showPresets={showPresets}
                onTogglePresets={() => setShowPresets(!showPresets)}
                onEditClick={() => setShowEditModal(true)}
                visibleLines={visibleLines}
                onToggleLine={(pid) => setVisibleLines((prev) => ({ ...prev, [pid]: !prev[pid] }))}
                isMobile={isMobile}
              />

              {/* 차트 토글 (모바일) */}
              {isMobile && (
                <button onClick={() => setShowChart(!showChart)} style={{
                  width: '100%', padding: '10px', minHeight: '44px',
                  background: showChart ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px',
                  color: '#60a5fa', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  marginTop: '8px', marginBottom: showChart ? '8px' : '0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}</button>
              )}

              {/* 차트 영역 */}
              {(showChart || !isMobile) && (
                <div
                  onClick={() => window.open(naverChartUrl, '_blank')}
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', marginTop: '8px' }}
                >
                  <div ref={chartContainerRef} style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <EnhancedMiniChart
                      data={priceData?.slice(isMobile ? -30 : isTablet ? -40 : -55) || null}
                      buyPrice={position.buyPrice}
                      width={chartW}
                      height={isMobile ? 200 : isTablet ? 260 : 280}
                      sellPrices={sellPrices}
                      visibleLines={visibleLines}
                      overlays={{
                        ma20: position.selectedPresets.includes('maSignal'),
                        ma60: false,
                        macd: position.selectedPresets.includes('maSignal'),
                        volumeProfile: position.selectedPresets.includes('volumeZone'),
                        trendline: position.selectedPresets.includes('trendline'),
                      }}
                      showMACDPanel={
                        position.selectedPresets.includes('maSignal') && !isMobile
                      }
                    />
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '4px', padding: '6px 0 2px', fontSize: '12px', color: '#64748b',
                  }}>
                    <span>📈</span>
                    <span style={{ textDecoration: 'underline', color: '#60a5fa' }}>네이버 증권 차트 보기</span>
                    <span style={{ fontSize: '10px' }}>→</span>
                  </div>
                </div>
              )}

              {/* AI 뉴스 요약 */}
              {showAI && <AINewsSummary position={position} onClose={() => setShowAI(false)} />}

              {/* ★ CardActions 서브컴포넌트 */}
              <CardActions
                isMobile={isMobile}
                isPremium={isPremium}
                naverNewsUrl={naverNewsUrl}
                aiNewsUsedCount={aiNewsUsedCount}
                maxFreeAINews={maxFreeAINews}
                onEditClick={() => setShowEditModal(true)}
                onToggleAI={handleToggleAI}
              />

              {/* 스와이프 힌트 */}
              {isMobile && (
                <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: '#475569' }}>
                  ← 좌측으로 스와이프하여 삭제
                </div>
              )}
            </div>
          )}
        </div>{/* 카드 본체 div 닫기 */}
      </div>{/* 스와이프 래퍼 div 닫기 */}

      {/* 수정 모달 */}
      {showEditModal && (
        <PositionEditModal
          position={position}
          onSave={onUpdate}
          onClose={() => setShowEditModal(false)}
          onDelete={() => { setShowEditModal(false); setShowDeleteConfirm(true); }}
          isMobile={isMobile}
        />
      )}

      {/* 삭제 확인 팝업 */}
      {showDeleteConfirm && (
        <div
          onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
          }}
        >
          <div style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: '16px', padding: '24px', maxWidth: '340px', width: '90%',
            border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
              종목을 삭제합니다
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
              <strong style={{ color: '#fff' }}>{position.name}</strong>을(를) 삭제하시겠습니까?<br/>이 작업은 되돌릴 수 없습니다.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: '12px', minHeight: '44px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>취소</button>
              <button onClick={() => { onDelete(position.id); setShowDeleteConfirm(false); }} style={{
                flex: 1, padding: '12px', minHeight: '44px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              }}>🗑️ 삭제</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PositionCard;
