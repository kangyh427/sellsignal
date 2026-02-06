'use client';

import React from 'react';

// ============================================
// 모바일 하단 네비게이션 바
// 위치: src/components/MobileNav.tsx
// 
// 원본 디자인: 포지션 / 알림(배지) / 시장 / 가이드
// ============================================

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount?: number;
}

const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  alertCount = 0,
}) => {
  const tabs = [
    { id: 'positions', icon: '📊', label: '포지션' },
    { id: 'alerts', icon: '🔔', label: '알림', badge: alertCount },
    { id: 'market', icon: '🥚', label: '시장' },
    { id: 'guide', icon: '📚', label: '가이드' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 23, 42, 0.98)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '6px 8px',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: isActive ? 'rgba(59,130,246,0.12)' : 'none',
              border: 'none',
              borderRadius: '10px',
              padding: '6px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              position: 'relative',
              minWidth: '60px',
              transition: 'background 0.2s',
            }}
          >
            {/* 아이콘 */}
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>

            {/* 라벨 */}
            <span
              style={{
                fontSize: '10px',
                color: isActive ? '#60a5fa' : '#64748b',
                fontWeight: isActive ? '600' : '400',
                letterSpacing: '-0.2px',
              }}
            >
              {tab.label}
            </span>

            {/* 배지 */}
            {tab.badge != null && tab.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '10px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '1px 5px',
                  borderRadius: '6px',
                  minWidth: '16px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(239,68,68,0.4)',
                }}
              >
                {tab.badge}
              </span>
            )}

            {/* 활성 인디케이터 */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: '-1px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '2px',
                  background: '#3b82f6',
                  borderRadius: '1px',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
