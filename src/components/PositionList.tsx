'use client';

import React from 'react';
import type { Position, ChartDataPoint } from '../types';
// 직접 import (순환 참조 방지 — PositionList 자체가 components/ 내부)
import PositionCard from './PositionCard';

// ============================================
// PositionList 컴포넌트
// 위치: src/components/PositionList.tsx
//
// SellSignalApp.tsx 라인 367~474에서 추출
// 포지션 목록 영역 — 시장 미니배너 + 헤더 + 카드 리스트
// ============================================

interface PositionListProps {
  positions: Position[];
  priceDataMap: Record<string | number, ChartDataPoint[]>;
  isMobile: boolean;
  activeTab: string;
  isPremium: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: string | number) => void;
  onUpgrade: () => void;
  onAddStock: () => void;
  onNavigateToMarket: () => void;
}

const PositionList: React.FC<PositionListProps> = ({
  positions,
  priceDataMap,
  isMobile,
  activeTab,
  isPremium,
  onEdit,
  onDelete,
  onUpgrade,
  onAddStock,
  onNavigateToMarket,
}) => {
  return (
    <div
      style={{
        display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
        padding: isMobile ? '0 16px' : '0',
      }}
    >
      {/* 모바일: 시장분석 미니 배너 */}
      {isMobile && activeTab === 'positions' && (
        <div
          onClick={onNavigateToMarket}
          style={{
            background:
              'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🥚</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>
                4단계: 금리고점 (팔 때)
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                매도 관망 권장 · 탭하여 상세보기
              </div>
            </div>
          </div>
          <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
        </div>
      )}

      {/* 포지션 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: '#fff',
            margin: 0,
          }}
        >
          📊 모니터링 중인 종목
        </h2>
        <span style={{ fontSize: isMobile ? '11px' : '13px', color: '#64748b' }}>
          실시간 조건 감시 중
        </span>
      </div>

      {/* 포지션 카드 목록 */}
      {positions.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '16px' }}>
            아직 등록된 종목이 없습니다
          </div>
          <button
            onClick={onAddStock}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            첫 종목 추가하기
          </button>
        </div>
      ) : (
        positions.map((pos) => (
          <PositionCard
            key={pos.id}
            position={pos}
            priceData={priceDataMap[pos.id]}
            onEdit={onEdit}
            onDelete={onDelete}
            isPremium={isPremium}
            onUpgrade={onUpgrade}
          />
        ))
      )}
    </div>
  );
};

export default PositionList;
