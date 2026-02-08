'use client';
// ============================================
// PositionCard - 보유 종목 포지션 카드
// 경로: src/components/PositionCard.tsx
// ============================================
// 종목명 + 수익률 + 현재가 + 매도 전략 + 차트
// 모바일: 매도전략/차트 접기 토글, 터치타겟 44px+

import React, { useState } from 'react';
import { SELL_PRESETS, PROFIT_STAGES } from '@/constants';
import MiniChart from './MiniChart';
import type { Position, CandleData } from '@/types';

interface PositionCardProps {
  position: Position;
  priceData: CandleData[] | null;
  isMobile: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: number) => void;
}

const PositionCard: React.FC<PositionCardProps> = ({
  position, priceData, isMobile, onEdit, onDelete,
}) => {
  const [showChart, setShowChart] = useState(!isMobile);
  const [showPresets, setShowPresets] = useState(!isMobile);

  // ── 가격 계산 ──
  const cur = priceData?.[priceData.length - 1]?.close || position.buyPrice;
  const profitRate = ((cur - position.buyPrice) / position.buyPrice) * 100;
  const profitAmount = (cur - position.buyPrice) * position.quantity;
  const totalVal = cur * position.quantity;
  const isProfit = profitRate >= 0;

  // ── 수익 단계 ──
  const getStage = () => {
    if (profitRate < 0) return { label: '손실 구간', color: '#ef4444' };
    if (profitRate < 5) return PROFIT_STAGES.initial;
    if (profitRate < 10) return PROFIT_STAGES.profit5;
    return PROFIT_STAGES.profit10;
  };
  const stage = getStage();

  // ── 차트 너비 (모바일 화면에 맞춤) ──
  const chartW = isMobile
    ? Math.min(340, (typeof window !== 'undefined' ? window.innerWidth : 380) - 48)
    : 260;

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))',
        borderRadius: '14px',
        padding: isMobile ? '14px' : '16px',
        marginBottom: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* ── 헤더: 종목명 + 수익률 ── */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '10px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: isMobile ? '17px' : '18px',
                fontWeight: '700', color: '#fff',
              }}
            >
              {position.name}
            </span>
            <span
              style={{
                background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                padding: '2px 7px', borderRadius: '5px',
                fontSize: '12px', fontWeight: '600',
              }}
            >
              {position.code}
            </span>
            <span
              style={{
                background: stage.color + '18', color: stage.color,
                padding: '2px 7px', borderRadius: '5px',
                fontSize: '11px', fontWeight: '600',
              }}
            >
              {stage.label}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
            {position.quantity}주 · 매수가 {position.buyPrice.toLocaleString()}원
          </div>
        </div>

        {/* 수익률 (우측) */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '800',
              color: isProfit ? '#10b981' : '#ef4444',
            }}
          >
            {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
          </div>
          <div
            style={{
              fontSize: '13px', fontWeight: '600',
              color: isProfit ? '#10b981' : '#ef4444',
            }}
          >
            {isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── 현재가 / 평가금액 요약 바 ── */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '10px',
          fontSize: '13px',
        }}
      >
        <div>
          <span style={{ color: '#64748b' }}>현재가 </span>
          <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
            ₩{Math.round(cur).toLocaleString()}
          </span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>평가금액 </span>
          <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
            ₩{Math.round(totalVal).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── 매도 전략 (모바일: 접기/펴기) ── */}
      {isMobile && (
        <button
          onClick={() => setShowPresets(!showPresets)}
          style={{
            width: '100%', padding: '10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            color: '#94a3b8', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer',
            marginBottom: showPresets ? '8px' : '0',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
          }}
        >
          🎯 설정된 매도 전략 ({(position.selectedPresets || []).length}개)
          <span style={{ fontSize: '11px' }}>{showPresets ? '▲' : '▼'}</span>
        </button>
      )}

      {(showPresets || !isMobile) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
          {(position.selectedPresets || []).map((pid) => {
            const preset = SELL_PRESETS[pid];
            if (!preset) return null;
            return (
              <div
                key={pid}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isMobile ? '8px 10px' : '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${preset.color}`,
                }}
              >
                <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#cbd5e1' }}>
                  {preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>
                  모니터링 중
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 차트 (모바일: 접기/펴기) ── */}
      {isMobile && (
        <button
          onClick={() => setShowChart(!showChart)}
          style={{
            width: '100%', padding: '10px', minHeight: '44px',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '8px',
            color: '#60a5fa', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer',
            marginBottom: showChart ? '8px' : '0',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
          }}
        >
          📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}
        </button>
      )}

      {showChart && priceData && (
        <div
          style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px', padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          <MiniChart
            data={priceData.slice(isMobile ? -25 : -35)}
            buyPrice={position.buyPrice}
            width={chartW}
            height={isMobile ? 180 : 220}
          />
        </div>
      )}

      {/* ── 하단 액션 바 ── */}
      <div
        style={{
          display: 'flex', gap: '8px', justifyContent: 'flex-end',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <button
          onClick={() => onEdit?.(position)}
          style={{
            padding: '6px 14px',
            minHeight: isMobile ? '38px' : '32px',
            background: 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: '8px',
            color: '#94a3b8', fontSize: '12px', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ✏️ 수정
        </button>
        <button
          onClick={() => onDelete?.(position.id)}
          style={{
            padding: '6px 14px',
            minHeight: isMobile ? '38px' : '32px',
            background: 'rgba(239,68,68,0.08)',
            border: 'none', borderRadius: '8px',
            color: '#f87171', fontSize: '12px', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🗑 삭제
        </button>
      </div>
    </div>
  );
};

export default PositionCard;
