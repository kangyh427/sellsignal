'use client';

// ============================================
// PositionList — 포지션 목록 영역
// 위치: src/components/PositionList.tsx
//
// 세션 4: 모바일 레이아웃 미세 조정
// - 미니 배너 터치 타겟 개선
// - 빈 상태 메시지 컴팩트화
// - 카드 간격 최적화
// ============================================

import React from 'react';
import type { Position, ChartDataPoint } from '../types';
import PositionCard from './PositionCard';

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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigateToMarket(); }}
          style={{
            background:
              'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(249,115,22,0.08) 100%)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            minHeight: '48px', // 터치 타겟
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🥚</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>
                4단계: 금리고점 (팔 때)
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                매도 관망 권장 · 탭하여 상세보기
              </div>
            </div>
          </div>
          <span style={{ color: '#64748b', fontSize: '16px' }}>›</span>
        </div>
      )}

      {/* 포지션 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '12px' : '16px',
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? '15px' : '18px',
            fontWeight: '600',
            color: '#fff',
            margin: 0,
          }}
        >
          📊 모니터링 중인 종목
        </h2>
        <span style={{ fontSize: isMobile ? '10px' : '13px', color: '#64748b' }}>
          실시간 조건 감시 중
        </span>
      </div>

      {/* 포지션 카드 목록 */}
      {positions.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: isMobile ? '32px 20px' : '40px 20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📊</div>
          <div style={{ fontSize: isMobile ? '13px' : '15px', color: '#94a3b8', marginBottom: '14px' }}>
            아직 등록된 종목이 없습니다
          </div>
          <button
            onClick={onAddStock}
            style={{
              padding: isMobile ? '10px 20px' : '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px', // 터치 타겟
            }}
          >
            첫 종목 추가하기
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
          {positions.map((pos) => (
            <PositionCard
              key={pos.id}
              position={pos}
              priceData={priceDataMap[pos.id]}
              onEdit={onEdit}
              onDelete={onDelete}
              isPremium={isPremium}
              onUpgrade={onUpgrade}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PositionList;
