'use client';

import React, { useState, useMemo } from 'react';
import { useResponsive } from '../hooks/useResponsive';
// ✅ 수정 1: PriceData는 이제 types/index.ts에서 ChartDataPoint의 별칭으로 정의됨
import { Position, PriceData } from '../types';
import { SELL_PRESETS, PROFIT_STAGES } from '../constants';
// ✅ 수정 2: import 경로 수정 (../utils → ../utils/calculations)
import { calculateSellPrices } from '../utils/calculations';
// ✅ 수정 3: CandleChart → EnhancedCandleChart (default export)
import EnhancedCandleChart from './EnhancedCandleChart';

interface PositionCardProps {
  position: Position;
  priceData: PriceData[] | null;
  onEdit: (position: Position) => void;
  onDelete: (id: string | number) => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  priceData,
  onEdit,
  onDelete,
  isPremium,
  onUpgrade,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [showChart, setShowChart] = useState(!isMobile);
  const [visibleLines, setVisibleLines] = useState({
    candle3: true,
    stopLoss: true,
    twoThird: true,
    maSignal: true,
  });

  // ✅ 수정 4: position에서 name/code를 안전하게 가져오는 헬퍼
  // 평탄 구조(position.name)와 중첩 구조(position.stock.name) 모두 지원
  const stockName = position.name || position.stock?.name || '종목명 없음';
  const stockCode = position.code || position.stock?.code || '';

  const currentPrice = priceData?.[priceData.length - 1]?.close || position.buyPrice;
  const profitRate = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
  const profitAmount = (currentPrice - position.buyPrice) * position.quantity;
  const totalValue = currentPrice * position.quantity;
  const isProfit = profitRate >= 0;

  const sellPrices = useMemo(() => {
    return calculateSellPrices(position, priceData || [], position.presetSettings || {});
  }, [position, priceData]);

  const getStage = () => {
    if (profitRate < 0) return { ...PROFIT_STAGES.initial, label: '손실 구간', color: '#ef4444' };
    if (profitRate < 5) return PROFIT_STAGES.initial;
    if (profitRate < 10) return PROFIT_STAGES.profit5;
    return PROFIT_STAGES.profit10;
  };
  const stage = getStage();

  // ✅ 수정 5: stockCode 헬퍼 사용
  const naverStockUrl = `https://finance.naver.com/item/main.naver?code=${stockCode}`;
  const naverChartUrl = `https://finance.naver.com/item/fchart.naver?code=${stockCode}`;

  const chartSize = isMobile 
    ? { width: Math.min(280, typeof window !== 'undefined' ? window.innerWidth - 80 : 280), height: 160 }
    : isTablet 
    ? { width: 200, height: 200 }
    : { width: 240, height: 240 };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: isMobile ? '12px' : '14px',
      padding: isMobile ? '12px' : '16px',
      marginBottom: isMobile ? '12px' : '14px',
      border: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          flex: '1 1 auto',
          minWidth: 0,
        }}>
          {/* ✅ stockName 헬퍼 사용 */}
          <a href={naverStockUrl} target="_blank" rel="noopener noreferrer" style={{
            fontSize: isMobile ? '14px' : '18px',
            fontWeight: '700',
            color: '#fff',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>{stockName} ↗</a>
          {/* ✅ stockCode 헬퍼 사용 */}
          <span style={{
            background: 'rgba(59,130,246,0.2)',
            color: '#60a5fa',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: isMobile ? '9px' : '12px',
            fontWeight: '600',
          }}>{stockCode}</span>
          <span style={{
            background: stage.color + '20',
            color: stage.color,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: isMobile ? '9px' : '12px',
            fontWeight: '600',
          }}>{stage.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button onClick={() => onEdit(position)} style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '6px',
            padding: isMobile ? '6px 10px' : '8px 14px',
            color: '#94a3b8',
            fontSize: isMobile ? '11px' : '13px',
            cursor: 'pointer',
          }}>수정</button>
          <button onClick={() => onDelete(position.id)} style={{
            background: 'rgba(239,68,68,0.15)',
            border: 'none',
            borderRadius: '6px',
            padding: isMobile ? '6px 10px' : '8px 14px',
            color: '#ef4444',
            fontSize: isMobile ? '11px' : '13px',
            cursor: 'pointer',
          }}>삭제</button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '12px',
      }}>
        {/* 좌측: 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 가격 정보 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px',
            marginBottom: '10px',
          }}>
            {[
              { label: '매수가', value: `₩${position.buyPrice.toLocaleString()}` },
              { label: '현재가', value: `₩${Math.round(currentPrice).toLocaleString()}`, color: isProfit ? '#10b981' : '#ef4444' },
              { label: '수량', value: `${position.quantity}주` },
              { label: '평가금액', value: `₩${Math.round(totalValue).toLocaleString()}` },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                padding: isMobile ? '8px' : '10px',
              }}>
                <div style={{ fontSize: isMobile ? '9px' : '11px', color: '#64748b', marginBottom: '2px' }}>{item.label}</div>
                <div style={{
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '700',
                  color: item.color || '#e2e8f0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* 평가손익 */}
          <div style={{
            background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            borderRadius: '8px',
            padding: isMobile ? '10px' : '12px',
            borderLeft: '4px solid ' + (isProfit ? '#10b981' : '#ef4444'),
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: isMobile ? '9px' : '11px', color: '#64748b', marginBottom: '2px' }}>평가손익</div>
              <div style={{
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '700',
                color: isProfit ? '#10b981' : '#ef4444',
              }}>{isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}</div>
            </div>
            <div style={{
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '800',
              color: isProfit ? '#10b981' : '#ef4444',
              background: isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              padding: isMobile ? '6px 10px' : '8px 14px',
              borderRadius: '8px',
            }}>{isProfit ? '+' : ''}{profitRate.toFixed(2)}%</div>
          </div>

          {/* 매도 조건 */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            padding: isMobile ? '10px' : '12px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: isMobile ? '11px' : '14px', color: '#fff', fontWeight: '600' }}>
                📊 매도 조건별 기준가격
              </span>
              <button onClick={() => onEdit(position)} style={{
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '4px',
                padding: '4px 8px',
                color: '#60a5fa',
                fontSize: '10px',
                cursor: 'pointer',
              }}>✏️ 변경</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(position.selectedPresets || []).slice(0, isMobile ? 4 : 6).map((presetId) => {
                const preset = SELL_PRESETS[presetId];
                if (!preset) return null;

                let priceText = '-';
                let priceColor = '#94a3b8';

                if (presetId === 'stopLoss' && sellPrices.stopLoss) {
                  priceText = `₩${sellPrices.stopLoss.toLocaleString()}`;
                  priceColor = currentPrice <= sellPrices.stopLoss ? '#ef4444' : '#94a3b8';
                } else if (presetId === 'twoThird' && sellPrices.twoThird) {
                  priceText = `₩${sellPrices.twoThird.toLocaleString()}`;
                  priceColor = currentPrice <= sellPrices.twoThird ? '#f59e0b' : '#94a3b8';
                } else if (presetId === 'maSignal' && sellPrices.maSignal) {
                  priceText = `₩${sellPrices.maSignal.toLocaleString()}`;
                  priceColor = currentPrice < sellPrices.maSignal ? '#f59e0b' : '#94a3b8';
                } else if (presetId === 'candle3' && sellPrices.candle3_50) {
                  priceText = `₩${sellPrices.candle3_50.toLocaleString()}`;
                }

                return (
                  <div key={presetId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '6px 8px' : '8px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '6px',
                    borderLeft: '3px solid ' + preset.color,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span style={{ fontSize: isMobile ? '11px' : '14px' }}>{preset.icon}</span>
                      <span style={{
                        fontSize: isMobile ? '10px' : '13px',
                        color: '#e2e8f0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{isMobile ? preset.name.replace(' 매도법', '') : preset.name}</span>
                    </div>
                    <span style={{
                      fontSize: isMobile ? '11px' : '14px',
                      fontWeight: '700',
                      color: priceColor,
                      flexShrink: 0,
                    }}>{priceText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 우측: 차트 */}
        {/* ✅ 수정: CandleChart → EnhancedCandleChart */}
        {isMobile ? (
          <div>
            <button onClick={() => setShowChart(!showChart)} style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '8px',
              color: '#60a5fa',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: showChart ? '10px' : '0',
            }}>📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}</button>
            {showChart && priceData && (
              <div onClick={() => window.open(naverChartUrl, '_blank')} style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <EnhancedCandleChart
                  data={priceData.slice(-30)}
                  width={chartSize.width}
                  height={chartSize.height}
                  buyPrice={position.buyPrice}
                  sellPrices={sellPrices}
                  visibleLines={visibleLines}
                />
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                  탭하여 네이버 차트 열기
                </div>
              </div>
            )}
          </div>
        ) : (
          priceData && (
            <div onClick={() => window.open(naverChartUrl, '_blank')} style={{
              cursor: 'pointer',
              flexShrink: 0,
            }}>
              <EnhancedCandleChart
                data={priceData.slice(-40)}
                width={chartSize.width}
                height={chartSize.height}
                buyPrice={position.buyPrice}
                sellPrices={sellPrices}
                visibleLines={visibleLines}
              />
              <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                클릭 → 네이버 차트
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PositionCard;
