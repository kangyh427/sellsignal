'use client';
// ============================================
// PositionCard - 반응형 포지션 카드 컴포넌트
// 경로: src/components/PositionCard.tsx
// 세션2에서 SellSignalApp.tsx L631-1019 분리
// ============================================
// 모바일 개선사항:
//   [M6]  카드 경계선 대비 강화 (0.12 → 0.20)
//   [M8]  차트 모바일 높이 200px → 240px
//   [M9]  매도법 태그 글자 11px → 13px
//   [M10] 종목명 글자 16px → 18px
//   [M11] 차트 토글 버튼 터치타겟 44px 보장
// ============================================

import React, { useState } from 'react';
import { SELL_PRESETS, PROFIT_STAGES } from '../constants';
import { calculateSellPrices } from '../utils';
import { useResponsive } from '../hooks/useResponsive';
import EnhancedCandleChart from './EnhancedCandleChart';
import EarningsWidget from './EarningsWidget';
import type { Position, CandleData, SellPrices } from '../types';

// ── Props 타입 ──
interface PositionCardProps {
  position: Position;
  priceData: CandleData[] | null;
  onEdit: (position: Position) => void;
  onDelete: (id: number) => void;
  isPremium: boolean;
  onUpgrade: () => void;
  /** AI 뉴스 팝업 열기 콜백 */
  onShowAINews?: (position: Position) => void;
  /** AI 리포트 팝업 열기 콜백 */
  onShowAIReport?: (position: Position) => void;
}

// ── 차트 라인 토글 상태 ──
interface VisibleLines {
  candle3: boolean;
  stopLoss: boolean;
  twoThird: boolean;
  maSignal: boolean;
  volumeZone: boolean;
  trendline: boolean;
  [key: string]: boolean;
}

// ============================================
// 메인 컴포넌트
// ============================================
const PositionCard: React.FC<PositionCardProps> = ({
  position,
  priceData,
  onEdit,
  onDelete,
  isPremium,
  onUpgrade,
  onShowAINews,
  onShowAIReport,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // ── 차트 라인 토글 상태 ──
  const [visibleLines, setVisibleLines] = useState<VisibleLines>({
    candle3: true,
    stopLoss: true,
    twoThird: true,
    maSignal: true,
    volumeZone: true,
    trendline: true,
  });

  // ── 모바일 차트 토글 (기본값: 접힘) ──
  const [showChart, setShowChart] = useState(!isMobile);

  // ── 가격 계산 ──
  const currentPrice = priceData?.[priceData.length - 1]?.close || position.buyPrice;
  const profitRate = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
  const profitAmount = (currentPrice - position.buyPrice) * position.quantity;
  const totalValue = currentPrice * position.quantity;
  const isProfit = profitRate >= 0;
  const sellPrices: SellPrices = calculateSellPrices(position, priceData, position.presetSettings);

  // ── 수익 단계 판별 ──
  const getStage = () => {
    if (profitRate < 0) return { ...PROFIT_STAGES.initial, label: '손실 구간', color: '#ef4444' };
    if (profitRate < 5) return PROFIT_STAGES.initial;
    if (profitRate < 10) return PROFIT_STAGES.profit5;
    return PROFIT_STAGES.profit10;
  };
  const stage = getStage();

  // ── 외부 링크 ──
  const naverStockUrl = `https://finance.naver.com/item/main.naver?code=${position.code}`;
  const naverChartUrl = `https://finance.naver.com/item/fchart.naver?code=${position.code}`;

  // ── [M8] 차트 크기 계산 (모바일 높이 200→240px) ──
  const getChartSize = () => {
    if (isMobile) return { width: Math.min(320, (typeof window !== 'undefined' ? window.innerWidth : 360) - 48), height: 240 };
    if (isTablet) return { width: 240, height: 240 };
    return { width: 270, height: 280 };
  };
  const chartSize = getChartSize();

  // ── 차트에 표시 가능한 프리셋 ID 목록 ──
  const CHART_LINE_PRESETS = ['candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone', 'trendline'];

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(145deg, #2d3a4f 0%, #1a2332 100%)',
          borderRadius: '14px',
          padding: isMobile ? '14px' : '16px',
          marginBottom: '14px',
          // [M6] 카드 경계선 대비 강화
          border: `1px solid rgba(255,255,255,${isMobile ? 0.2 : 0.12})`,
        }}
      >
        {/* ────────────────────────── 헤더 ────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: '12px',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? '8px' : '0',
          }}
        >
          {/* 종목명 + 코드 + 단계 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              flex: isMobile ? '1 1 100%' : 'initial',
            }}
          >
            <a
              href={naverStockUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                // [M10] 종목명 글자 16px → 18px
                fontSize: isMobile ? '18px' : '18px',
                fontWeight: '700',
                color: '#fff',
                textDecoration: 'none',
              }}
            >
              {position.name} ↗
            </a>
            <span
              style={{
                background: 'rgba(59,130,246,0.2)',
                color: '#60a5fa',
                padding: isMobile ? '3px 8px' : '4px 10px',
                borderRadius: '5px',
                // [M9] 매도법 태그 글자 11px → 13px
                fontSize: isMobile ? '13px' : '13px',
                fontWeight: '600',
              }}
            >
              {position.code}
            </span>
            <span
              style={{
                background: stage.color + '20',
                color: stage.color,
                padding: isMobile ? '3px 8px' : '4px 10px',
                borderRadius: '5px',
                fontSize: isMobile ? '13px' : '13px',
                fontWeight: '600',
              }}
            >
              {stage.label}
            </span>
          </div>

          {/* 수정/삭제 버튼 */}
          <div style={{ display: 'flex', gap: '6px', marginLeft: isMobile ? 'auto' : '0' }}>
            <button
              onClick={() => onEdit(position)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '6px',
                padding: isMobile ? '8px 12px' : '8px 14px',
                color: '#94a3b8',
                fontSize: isMobile ? '12px' : '13px',
                cursor: 'pointer',
                // [M11] 최소 터치 타겟 44px
                minHeight: isMobile ? '44px' : '36px',
                minWidth: isMobile ? '44px' : 'auto',
              }}
            >
              수정
            </button>
            <button
              onClick={() => onDelete(position.id)}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: 'none',
                borderRadius: '6px',
                padding: isMobile ? '8px 12px' : '8px 14px',
                color: '#ef4444',
                fontSize: isMobile ? '12px' : '13px',
                cursor: 'pointer',
                minHeight: isMobile ? '44px' : '36px',
                minWidth: isMobile ? '44px' : 'auto',
              }}
            >
              삭제
            </button>
          </div>
        </div>

        {/* ──────────────────── 메인 콘텐츠 (정보 + 차트) ──────────────────── */}
        <div
          style={{
            display: isMobile ? 'flex' : 'grid',
            flexDirection: isMobile ? 'column' : undefined,
            gridTemplateColumns: isMobile ? undefined : isTablet ? '1fr 250px' : '1fr 280px',
            gap: '12px',
            alignItems: 'stretch',
          }}
        >
          {/* ── 좌측: 가격 정보 + 매도 조건 ── */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 가격 정보 4칸 그리드 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              {[
                { label: '매수가', value: '₩' + position.buyPrice.toLocaleString() },
                { label: '현재가', value: '₩' + Math.round(currentPrice).toLocaleString(), color: isProfit ? '#10b981' : '#ef4444' },
                { label: '수량', value: position.quantity + '주' },
                { label: '평가금액', value: '₩' + Math.round(totalValue).toLocaleString() },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    borderRadius: '8px',
                    padding: isMobile ? '12px 10px' : '10px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{item.label}</div>
                  <div
                    style={{
                      fontSize: isMobile ? '16px' : '17px',
                      fontWeight: '700',
                      color: item.color || '#f1f5f9',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* 평가손익 */}
            <div
              style={{
                background: isProfit ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                borderRadius: '10px',
                padding: isMobile ? '14px' : '12px',
                borderLeft: `4px solid ${isProfit ? '#10b981' : '#ef4444'}`,
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>평가손익</div>
                <div
                  style={{
                    fontSize: isMobile ? '20px' : '22px',
                    fontWeight: '700',
                    color: isProfit ? '#10b981' : '#ef4444',
                  }}
                >
                  {isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  fontSize: isMobile ? '22px' : '26px',
                  fontWeight: '800',
                  color: isProfit ? '#10b981' : '#ef4444',
                  background: isProfit ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
                  padding: isMobile ? '8px 12px' : '8px 14px',
                  borderRadius: '10px',
                }}
              >
                {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
              </div>
            </div>

            {/* ──────── 매도 조건별 기준가격 ──────── */}
            <div
              style={{
                background: 'rgba(0,0,0,0.35)',
                borderRadius: '10px',
                padding: isMobile ? '12px' : '12px',
                marginBottom: '10px',
                flex: 1,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: isMobile ? '14px' : '15px', color: '#fff', fontWeight: '600' }}>
                  📊 매도 조건별 기준가격
                </span>
                <button
                  onClick={() => onEdit(position)}
                  style={{
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '4px',
                    padding: isMobile ? '6px 10px' : '4px 10px',
                    color: '#60a5fa',
                    fontSize: isMobile ? '11px' : '12px',
                    cursor: 'pointer',
                    minHeight: '32px',
                  }}
                >
                  ✏️ 조건 변경
                </button>
              </div>

              {/* 주의 문구 */}
              <div
                style={{
                  fontSize: '10px',
                  color: '#f59e0b',
                  marginBottom: '6px',
                  background: 'rgba(245,158,11,0.1)',
                  padding: '5px 8px',
                  borderRadius: '4px',
                }}
              >
                ⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
              </div>

              {/* 프리셋 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(position.selectedPresets || [])
                  .slice(0, isMobile ? 3 : undefined)
                  .map((presetId) => {
                    const preset = SELL_PRESETS[presetId];
                    if (!preset) return null;

                    const hasChartLine = CHART_LINE_PRESETS.includes(presetId);

                    // 가격 텍스트 & 색상 결정
                    let priceText = '-';
                    let priceColor = '#94a3b8';

                    if (presetId === 'stopLoss' && sellPrices.stopLoss) {
                      priceText = '₩' + sellPrices.stopLoss.toLocaleString();
                      priceColor = currentPrice <= sellPrices.stopLoss ? '#ef4444' : '#94a3b8';
                    } else if (presetId === 'twoThird' && sellPrices.twoThird) {
                      priceText = '₩' + sellPrices.twoThird.toLocaleString();
                      priceColor = currentPrice <= sellPrices.twoThird ? '#f59e0b' : '#94a3b8';
                    } else if (presetId === 'maSignal' && sellPrices.maSignal) {
                      priceText = '₩' + sellPrices.maSignal.toLocaleString();
                      priceColor = currentPrice < sellPrices.maSignal ? '#f59e0b' : '#94a3b8';
                    } else if (presetId === 'candle3' && sellPrices.candle3_50) {
                      priceText = '₩' + sellPrices.candle3_50.toLocaleString();
                    } else if (presetId === 'volumeZone' && sellPrices.volumeZone) {
                      priceText = '₩' + sellPrices.volumeZone.toLocaleString();
                      priceColor = currentPrice >= sellPrices.volumeZone ? '#f59e0b' : '#94a3b8';
                    } else if (presetId === 'trendline' && sellPrices.trendline) {
                      priceText = '₩' + sellPrices.trendline.toLocaleString();
                      priceColor = currentPrice <= sellPrices.trendline ? '#ef4444' : '#94a3b8';
                    }

                    return (
                      <div
                        key={presetId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: isMobile ? '10px' : '8px 10px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '6px',
                          borderLeft: `3px solid ${preset.color}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* 데스크탑: 차트 라인 토글 체크박스 */}
                          {hasChartLine && !isMobile ? (
                            <input
                              type="checkbox"
                              checked={visibleLines[presetId] || false}
                              onChange={() =>
                                setVisibleLines((prev) => ({ ...prev, [presetId]: !prev[presetId] }))
                              }
                              style={{ width: '16px', height: '16px', accentColor: preset.color, cursor: 'pointer' }}
                            />
                          ) : (
                            <div style={{ width: isMobile ? '0' : '16px' }} />
                          )}
                          {/* [M9] 매도법 태그 글자 크기 개선 */}
                          <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#e2e8f0' }}>
                            {preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}
                          </span>
                        </div>
                        <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: priceColor }}>
                          {priceText}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* 데스크탑 안내 문구 */}
              {!isMobile && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                  체크박스 선택 시 차트에 가격선 표시
                </div>
              )}
            </div>

            {/* 실적 위젯 */}
            <EarningsWidget
              position={position}
              isPremium={isPremium}
              onShowAINews={() => onShowAINews?.(position)}
              onShowAIReport={() => onShowAIReport?.(position)}
            />
          </div>

          {/* ── 우측(데스크탑) / 하단(모바일): 차트 영역 ── */}
          {isMobile ? (
            <div>
              {/* [M11] 차트 토글 버튼 - 터치 타겟 44px 보장 */}
              <button
                onClick={() => setShowChart(!showChart)}
                style={{
                  width: '100%',
                  padding: '12px',
                  minHeight: '44px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '8px',
                  color: '#60a5fa',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: showChart ? '10px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}
              </button>
              {showChart && (
                <div onClick={() => window.open(naverChartUrl, '_blank')} style={{ cursor: 'pointer' }}>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EnhancedCandleChart
                      data={priceData?.slice(-30) || null}
                      width={chartSize.width}
                      height={chartSize.height}
                      buyPrice={position.buyPrice}
                      sellPrices={sellPrices}
                      visibleLines={visibleLines}
                    />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                    탭하여 네이버 차트 열기
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 데스크탑/태블릿 차트 */
            <div
              onClick={() => window.open(naverChartUrl, '_blank')}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  padding: '4px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EnhancedCandleChart
                  data={priceData?.slice(-40) || null}
                  width={chartSize.width}
                  height={chartSize.height}
                  buyPrice={position.buyPrice}
                  sellPrices={sellPrices}
                  visibleLines={visibleLines}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                클릭 → 네이버 증권 차트
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PositionCard;
