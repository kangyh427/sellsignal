'use client';
// ============================================
// PositionCard - 반응형 포지션 카드 컴포넌트
// 경로: src/components/PositionCard.tsx
// ============================================
// 세션7 [B1~B4] 모바일 리디자인:
//   [B1] 접기/펴기 — 모바일 기본 접힘, 탭→펼침
//   [B2] 가격 정보 컴팩트화 + formatCompact
//   [B3] 매도 조건 아코디언 (기본 접힘 + 컬러 dot)
//   [B4] 모바일 하단 액션 바 (수정/뉴스/삭제)
//   [B5] 차트 축: 세로(주가 7단계) + 가로(날짜 10개)
//   [B7] CrestLogo 헤더 복원
// 기존 유지:
//   [M6]  카드 경계선 대비 강화
//   [M11] 차트 토글 버튼 터치타겟 44px
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
  onShowAINews?: (position: Position) => void;
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

// ── [B2] 금액 축약 (모바일 가독성) ──
const formatCompact = (num: number): string => {
  const abs = Math.abs(num);
  if (abs >= 1e8) return (num / 1e8).toFixed(1) + '억';
  if (abs >= 1e4) return Math.round(num / 1e4) + '만';
  return num.toLocaleString();
};

// ── 차트에 표시 가능한 프리셋 ID 목록 ──
const CHART_LINE_PRESETS = ['candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone', 'trendline'];

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

  // ── [B1] 접기/펴기 상태 (모바일: 기본 접힘) ──
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  // ── [B3] 매도 조건 아코디언 (모바일: 기본 접힘) ──
  const [showPresets, setShowPresets] = useState(!isMobile);

  // ── 차트 토글 (모바일: 기본 접힘) ──
  const [showChart, setShowChart] = useState(!isMobile);

  // ── 차트 라인 토글 상태 ──
  const [visibleLines, setVisibleLines] = useState<VisibleLines>({
    candle3: true,
    stopLoss: true,
    twoThird: true,
    maSignal: true,
    volumeZone: true,
    trendline: true,
  });

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
  const naverNewsUrl = `https://finance.naver.com/item/news.naver?code=${position.code}`;

  // ── 차트 크기 계산 ──
  const getChartSize = () => {
    if (isMobile) return { width: Math.min(320, (typeof window !== 'undefined' ? window.innerWidth : 360) - 56), height: 240 };
    if (isTablet) return { width: 240, height: 240 };
    return { width: 270, height: 280 };
  };
  const chartSize = getChartSize();

  // ── 매도 기준가격 텍스트 + 색상 결정 ──
  const getPresetPriceInfo = (presetId: string) => {
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

    return { priceText, priceColor };
  };

  // ============================================
  // [B1] 접힌 상태 — 요약 바 (모바일 전용)
  // ============================================
  if (isMobile && !isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        style={{
          background: 'linear-gradient(145deg, #2d3a4f 0%, #1a2332 100%)',
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: '10px',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* 요약 바: 종목명 | 수익률 | 현재가 | 화살표 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* 좌측: 종목명 + 단계 뱃지 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {position.name}
            </span>
            <span style={{
              background: stage.color + '20',
              color: stage.color,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {stage.label}
            </span>
          </div>

          {/* 우측: 수익률 + 펼치기 화살표 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '17px',
                fontWeight: '800',
                color: isProfit ? '#10b981' : '#ef4444',
                lineHeight: '1.1',
              }}>
                {isProfit ? '+' : ''}{profitRate.toFixed(1)}%
              </div>
              <div style={{
                fontSize: '11px',
                color: isProfit ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)',
                marginTop: '1px',
              }}>
                {isProfit ? '+' : ''}₩{formatCompact(Math.round(profitAmount))}
              </div>
            </div>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#64748b',
            }}>
              ▼
            </div>
          </div>
        </div>

        {/* 선택된 매도법 미니 태그 */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
          {(position.selectedPresets || []).map((pid: string) => {
            const preset = SELL_PRESETS[pid];
            if (!preset) return null;
            return (
              <span key={pid} style={{
                background: preset.color + '15',
                color: preset.color,
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500',
                borderLeft: `2px solid ${preset.color}`,
              }}>
                {preset.icon} {preset.name.replace(' 매도법', '')}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================
  // [B1~B4] 펼쳐진 상태 (모바일 + 데스크탑)
  // ============================================
  return (
    <div style={{
      background: 'linear-gradient(145deg, #2d3a4f 0%, #1a2332 100%)',
      borderRadius: '14px',
      padding: isMobile ? '14px' : '16px',
      marginBottom: isMobile ? '10px' : '14px',
      border: `1px solid rgba(255,255,255,${isMobile ? 0.15 : 0.12})`,
    }}>
      {/* ────── 헤더 ────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        {/* 종목명 + 코드 + 단계 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          flex: 1,
          minWidth: 0,
        }}>
          <a
            href={naverStockUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: isMobile ? '17px' : '18px',
              fontWeight: '700',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            {position.name} ↗
          </a>
          <span style={{
            background: 'rgba(59,130,246,0.2)',
            color: '#60a5fa',
            padding: '2px 7px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            {position.code}
          </span>
          <span style={{
            background: stage.color + '20',
            color: stage.color,
            padding: '2px 7px',
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            {stage.label}
          </span>
        </div>

        {/* 데스크탑: 수정/삭제 | 모바일: 접기 버튼 */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          {!isMobile && (
            <>
              <button
                onClick={() => onEdit(position)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  color: '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
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
                  padding: '8px 14px',
                  color: '#ef4444',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                삭제
              </button>
            </>
          )}
          {isMobile && (
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              ▲
            </button>
          )}
        </div>
      </div>

      {/* ────── 메인 콘텐츠 (정보 + 차트) ────── */}
      <div style={{
        display: isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : isTablet ? '1fr 250px' : '1fr 280px',
        gap: '12px',
      }}>
        {/* ── 좌측: 가격 정보 + 매도 조건 ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* [B2] 가격 정보 2×2 컴팩트 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px',
            marginBottom: '10px',
          }}>
            {[
              { label: '매수가', value: '₩' + position.buyPrice.toLocaleString() },
              { label: '현재가', value: '₩' + Math.round(currentPrice).toLocaleString(), color: isProfit ? '#10b981' : '#ef4444' },
              { label: '수량', value: position.quantity + '주' },
              { label: '평가금액', value: '₩' + formatCompact(Math.round(totalValue)) },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.35)',
                borderRadius: '8px',
                padding: isMobile ? '8px 10px' : '10px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{item.label}</div>
                <div style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '700',
                  color: item.color || '#f1f5f9',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* 평가손익 컴팩트 */}
          <div style={{
            background: isProfit ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            borderRadius: '10px',
            padding: isMobile ? '10px 12px' : '12px',
            borderLeft: `4px solid ${isProfit ? '#10b981' : '#ef4444'}`,
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>평가손익</div>
              <div style={{
                fontSize: isMobile ? '17px' : '22px',
                fontWeight: '700',
                color: isProfit ? '#10b981' : '#ef4444',
              }}>
                {isProfit ? '+' : ''}₩{formatCompact(Math.round(profitAmount))}
              </div>
            </div>
            <div style={{
              fontSize: isMobile ? '20px' : '26px',
              fontWeight: '800',
              color: isProfit ? '#10b981' : '#ef4444',
              background: isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              padding: isMobile ? '6px 10px' : '8px 14px',
              borderRadius: '10px',
            }}>
              {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
            </div>
          </div>

          {/* ──── [B3] 매도 조건 아코디언 ──── */}
          <div style={{
            background: 'rgba(0,0,0,0.35)',
            borderRadius: '10px',
            marginBottom: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            {/* 아코디언 헤더 */}
            <button
              onClick={() => setShowPresets(!showPresets)}
              style={{
                width: '100%',
                padding: isMobile ? '10px 12px' : '10px 12px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              <span style={{ fontSize: isMobile ? '13px' : '15px', color: '#fff', fontWeight: '600' }}>
                📊 매도 조건 ({(position.selectedPresets || []).length}개)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* 접혀 있을 때 미니 컬러 인디케이터 */}
                {!showPresets && (
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {(position.selectedPresets || []).slice(0, 3).map((pid: string) => (
                      <div key={pid} style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: SELL_PRESETS[pid]?.color || '#666',
                      }} />
                    ))}
                  </div>
                )}
                <span style={{
                  color: '#64748b',
                  fontSize: '12px',
                  transition: 'transform 0.2s ease',
                  transform: showPresets ? 'rotate(180deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}>
                  ▼
                </span>
              </div>
            </button>

            {/* 아코디언 내용 */}
            {showPresets && (
              <div style={{ padding: '0 12px 12px' }}>
                {/* 주의 문구 */}
                <div style={{
                  fontSize: '10px',
                  color: '#f59e0b',
                  marginBottom: '8px',
                  background: 'rgba(245,158,11,0.08)',
                  padding: '5px 8px',
                  borderRadius: '4px',
                }}>
                  ⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
                </div>

                {/* 조건 변경 버튼 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '6px',
                }}>
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

                {/* 프리셋 목록 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {(position.selectedPresets || []).map((presetId: string) => {
                    const preset = SELL_PRESETS[presetId];
                    if (!preset) return null;

                    const hasChartLine = CHART_LINE_PRESETS.includes(presetId);
                    const { priceText, priceColor } = getPresetPriceInfo(presetId);

                    return (
                      <div key={presetId} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: isMobile ? '8px 10px' : '8px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${preset.color}`,
                      }}>
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
                            !isMobile && <div style={{ width: '16px' }} />
                          )}
                          <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#e2e8f0' }}>
                            {preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}
                          </span>
                        </div>
                        <span style={{
                          fontSize: isMobile ? '12px' : '15px',
                          fontWeight: '700',
                          color: priceColor,
                        }}>
                          {priceText}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 데스크탑 차트 안내 */}
                {!isMobile && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                    체크박스 선택 시 차트에 가격선 표시
                  </div>
                )}
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
            {/* 차트 토글 버튼 — 터치 타겟 44px */}
            <button
              onClick={() => setShowChart(!showChart)}
              style={{
                width: '100%',
                padding: '10px',
                minHeight: '44px',
                background: showChart ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '8px',
                color: '#60a5fa',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: showChart ? '8px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background 0.2s ease',
              }}
            >
              📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}
            </button>
            {showChart && (
              <div
                onClick={() => window.open(naverChartUrl, '_blank')}
                style={{ cursor: 'pointer' }}
              >
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <EnhancedCandleChart
                    data={priceData?.slice(-30) || null}
                    width={chartSize.width}
                    height={chartSize.height}
                    buyPrice={position.buyPrice}
                    sellPrices={sellPrices}
                    visibleLines={visibleLines}
                  />
                </div>
                <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '10px', color: '#64748b' }}>
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
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '4px',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
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

      {/* ──── [B4] 모바일 하단 액션 바 ──── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          gap: '6px',
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => onEdit(position)}
            style={{
              flex: 1,
              padding: '10px',
              minHeight: '44px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ✏️ 수정
          </button>
          <button
            onClick={() => window.open(naverNewsUrl, '_blank')}
            style={{
              flex: 1,
              padding: '10px',
              minHeight: '44px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px',
              color: '#10b981',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            📰 뉴스
          </button>
          <button
            onClick={() => onDelete(position.id)}
            style={{
              flex: 1,
              padding: '10px',
              minHeight: '44px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🗑️ 삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default PositionCard;
