// ============================================
// PositionCardHeader 컴포넌트
// 위치: src/components/position/PositionCardHeader.tsx
// ============================================
// 역할: 종목명, 코드, 수익 단계 뱃지, 수정/삭제 버튼
// 원본: PositionCard.tsx renderHeader() (라인 166~260)

'use client';

import React from 'react';
import type { Position } from '../../types';

// ── Props 타입 ──
interface PositionCardHeaderProps {
  position: Position;
  stage: { label: string; color: string };
  naverStockUrl: string;
  isMobile: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: string | number) => void;
}

const PositionCardHeader: React.FC<PositionCardHeaderProps> = ({
  position,
  stage,
  naverStockUrl,
  isMobile,
  onEdit,
  onDelete,
}) => {
  // 종목명: stock 중첩 구조 또는 평탄 구조 둘 다 지원
  const stockName = position.stock?.name || position.name || '종목명 없음';
  const stockCode = position.stock?.code || position.code || '';

  return (
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
      {/* 좌측: 종목 정보 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          flex: isMobile ? '1 1 100%' : 'initial',
        }}
      >
        {/* 종목명 (네이버 증권 링크) */}
        <a
          href={naverStockUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '700',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          {stockName} ↗
        </a>

        {/* 종목코드 뱃지 */}
        <span
          style={{
            background: 'rgba(59,130,246,0.2)',
            color: '#60a5fa',
            padding: isMobile ? '3px 8px' : '4px 10px',
            borderRadius: '5px',
            fontSize: isMobile ? '11px' : '13px',
            fontWeight: '600',
          }}
        >
          {stockCode}
        </span>

        {/* 수익 단계 뱃지 */}
        <span
          style={{
            background: stage.color + '20',
            color: stage.color,
            padding: isMobile ? '3px 8px' : '4px 10px',
            borderRadius: '5px',
            fontSize: isMobile ? '11px' : '13px',
            fontWeight: '600',
          }}
        >
          {stage.label}
        </span>
      </div>

      {/* 우측: 수정/삭제 버튼 */}
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
            minHeight: '36px',
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
            minHeight: '36px',
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default PositionCardHeader;
