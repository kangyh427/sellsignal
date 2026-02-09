'use client';
// ============================================
// MobileBottomNav v2 - 하단 탭 네비게이션
// 경로: src/components/MobileBottomNav.tsx
// 세션 30: 아이콘 20px, 라벨 11px, 패딩 확대, 터치타겟 보강
// ============================================

import React from 'react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange, alertCount }) => {
  const tabs = [
    { id: 'positions', icon: '📊', label: '포지션' },
    { id: 'market', icon: '🌍', label: '시장' },
    { id: 'alerts', icon: '🔔', label: '알림', badge: alertCount },
    { id: 'guide', icon: '📚', label: '가이드' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      zIndex: 200,
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      // ★ 세션30: 상단 패딩 확대 (8px → safe area 포함)
      padding: '8px 0 max(8px, env(safe-area-inset-bottom, 0px))',
      display: 'flex',
      justifyContent: 'space-around',
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              // ★ 세션30: padding 확대, minHeight 유지 48px
              padding: '6px 4px 4px',
              minHeight: '52px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
          >
            {/* ★ 세션30: 아이콘 18→20px */}
            <span style={{
              fontSize: '20px',
              opacity: isActive ? 1 : 0.5,
              transition: 'opacity 0.2s ease',
            }}>
              {tab.icon}
            </span>
            {/* ★ 세션30: 라벨 10→11px */}
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? '700' : '400',
              color: isActive ? '#60a5fa' : '#64748b',
              transition: 'color 0.2s ease',
            }}>
              {tab.label}
            </span>

            {/* 알림 배지 */}
            {tab.badge != null && tab.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '50%',
                transform: 'translateX(14px)',
                background: '#ef4444',
                color: '#fff',
                fontSize: '9px',
                fontWeight: '700',
                padding: '1px 5px',
                borderRadius: '8px',
                minWidth: '16px',
                textAlign: 'center',
              }}>
                {tab.badge}
              </span>
            )}

            {/* 활성 탭 하단 인디케이터 바 */}
            {isActive && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                width: '20px',
                height: '3px',
                borderRadius: '2px',
                background: '#60a5fa',
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
