'use client';
// ============================================
// MobileBottomNav - 모바일 하단 네비게이션
// 경로: src/components/MobileBottomNav.tsx
// ============================================
// 세션6 [A3] 변경사항:
//   - 아이콘/라벨 통일: 📊포지션 / 🔔알림 / 🌐시장 / 📚가이드
//   - 배경 헤더와 통일: rgba(10,10,15,0.98)
//   - 활성 탭: rgba(59,130,246,0.12) + #60a5fa
//   - safe-area-inset-bottom 대응
//   - 터치 타겟 48px 보장
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
  // [A3] 통일된 아이콘/라벨
  const tabs: Array<{ id: MobileTab; icon: string; label: string; badge?: number }> = [
    { id: 'positions', icon: '📊', label: '포지션' },
    { id: 'alerts', icon: '🔔', label: '알림', badge: alertCount },
    { id: 'market', icon: '🌐', label: '시장' },
    { id: 'guide', icon: '📚', label: '가이드' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      // [A3] 헤더와 동일한 배경색
      background: 'rgba(10, 10, 15, 0.98)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '6px 12px',
      // [A3] safe-area 하단 여백
      paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      display: 'flex',
      justifyContent: 'space-around',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 100,
    }}>
      {tabs.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              // [A3] 활성 탭 배경
              background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              cursor: 'pointer',
              position: 'relative',
              minWidth: '60px',
              // [A3] 터치 타겟 48px 보장
              minHeight: '48px',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: '1' }}>{item.icon}</span>
            <span style={{
              fontSize: '11px',
              // [A3] 활성 탭 색상
              color: isActive ? '#60a5fa' : '#64748b',
              fontWeight: isActive ? '700' : '500',
              lineHeight: '1',
            }}>{item.label}</span>

            {/* 알림 배지 */}
            {item.badge && item.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: '1px',
                right: '6px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '9px',
                fontWeight: '700',
                padding: '1px 5px',
                borderRadius: '7px',
                minWidth: '16px',
                textAlign: 'center',
                lineHeight: '1.3',
              }}>{item.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
