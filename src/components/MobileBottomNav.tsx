'use client';
// ============================================
// MobileBottomNav - 모바일 하단 네비게이션
// 세션1 신규: 2×2 탭네비 제거 후 하단네비로 통합
// ============================================
// 개선사항:
// - 레이블 11px → 13px (M1 해결)
// - 아이콘 22px → 24px (시인성)
// - 터치 영역 48px 보장 (M7 해결)
// - 경계선 대비 강화 (0.12 → 0.15)
// - safe-area-inset-bottom 대응 (노치 대응)
// ============================================

import React from 'react';

export type MobileTab = 'positions' | 'alerts' | 'market' | 'guide';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  alertCount: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  alertCount,
}) => {
  const tabs: Array<{ id: MobileTab; icon: string; label: string; badge?: number }> = [
    { id: 'positions', icon: '📊', label: '포지션' },
    { id: 'alerts', icon: '🔔', label: '알림', badge: alertCount },
    { id: 'market', icon: '🥚', label: '시장' },
    { id: 'guide', icon: '📚', label: '가이드' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(15, 23, 42, 0.98)',
      borderTop: '1px solid rgba(255,255,255,0.15)',
      padding: '6px 8px',
      paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      display: 'flex',
      justifyContent: 'space-around',
      backdropFilter: 'blur(12px)',
      zIndex: 100,
    }}>
      {tabs.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              position: 'relative',
              minWidth: '64px',
              minHeight: '48px',  /* 터치영역 48px 보장 */
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '24px', lineHeight: '1' }}>{item.icon}</span>
            <span style={{
              fontSize: '13px',  /* 11px → 13px 개선 */
              color: isActive ? '#60a5fa' : '#94a3b8',
              fontWeight: isActive ? '600' : '500',
              lineHeight: '1',
            }}>{item.label}</span>

            {/* 알림 배지 */}
            {item.badge && item.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '10px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '8px',
                minWidth: '18px',
                textAlign: 'center',
                lineHeight: '1.2',
              }}>{item.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
