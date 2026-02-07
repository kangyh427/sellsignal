'use client';

// ============================================
// SidePanel — 우측 사이드바
// 위치: src/components/SidePanel.tsx
//
// 세션 4: 모바일 탭 전환 최적화
// - 탭별 표시/숨김 로직 개선
// - 모바일 여백/패딩 미세 조정
// - 스크롤 성능 개선
// ============================================

import React from 'react';
import type { Alert } from '../types';
import MarketCycleWidget from './MarketCycleWidget';
import AlertCard from './AlertCard';
import SellMethodGuide from './SellMethodGuide';

interface SidePanelProps {
  isMobile: boolean;
  activeTab: string;
  isPremium: boolean;
  alerts: Alert[];
  onDismissAlert: (id: number) => void;
  onClearAllAlerts: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isMobile,
  activeTab,
  isPremium,
  alerts,
  onDismissAlert,
  onClearAllAlerts,
}) => {
  // 모바일에서 관련 탭이 아니면 렌더링 안 함
  if (
    isMobile &&
    activeTab !== 'market' &&
    activeTab !== 'alerts' &&
    activeTab !== 'guide'
  ) {
    return null;
  }

  return (
    <div style={{ 
      padding: isMobile ? '0 16px' : '0',
      // 모바일에서 하단 네비 겹침 방지
      paddingBottom: isMobile ? '16px' : '0',
    }}>
      {/* ── 시장 분석 위젯 ── */}
      <div
        style={{
          display: isMobile && activeTab !== 'market' ? 'none' : 'block',
        }}
      >
        <MarketCycleWidget isPremium={isPremium} />
      </div>

      {/* ── 알림 영역 ── */}
      <div
        style={{
          display: isMobile && activeTab !== 'alerts' ? 'none' : 'block',
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '14px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '12px',
          maxHeight: isMobile ? 'none' : '300px',
          overflow: 'auto',
        }}
      >
        {/* 알림 헤더 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              color: '#fff',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🔔 조건 도달 알림
            {alerts.length > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}
              >
                {alerts.length}
              </span>
            )}
          </h2>
          {alerts.length > 0 && (
            <button
              onClick={onClearAllAlerts}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#94a3b8',
                fontSize: '11px',
                cursor: 'pointer',
                minHeight: '32px', // 터치 타겟
              }}
            >
              모두 지우기
            </button>
          )}
        </div>

        {/* 알림 리스트 */}
        {alerts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: isMobile ? '24px 16px' : '30px 16px',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              현재 도달한 조건이 없습니다
            </div>
          </div>
        ) : (
          alerts.slice(0, isMobile ? 3 : 5).map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={onDismissAlert}
            />
          ))
        )}
        
        {/* 모바일에서 알림 더보기 */}
        {isMobile && alerts.length > 3 && (
          <div
            style={{
              textAlign: 'center',
              padding: '8px',
              fontSize: '12px',
              color: '#60a5fa',
            }}
          >
            +{alerts.length - 3}개 더보기
          </div>
        )}
      </div>

      {/* ── 매도법 가이드 ── */}
      <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />

      {/* ── 면책조항 ── */}
      {(!isMobile || activeTab === 'guide') && (
        <div
          style={{
            padding: isMobile ? '10px 12px' : '14px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            borderLeft: '4px solid #64748b',
          }}
        >
          <p
            style={{
              fontSize: isMobile ? '10px' : '12px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다. 
            제공되는 알람은 투자자문이나 투자권유가 아니며, 모든 투자 판단의 책임은 
            사용자에게 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default SidePanel;
