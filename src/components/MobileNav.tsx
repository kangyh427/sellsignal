'use client';

// ============================================
// MobileNav — 하단 고정 네비게이션 (통합 버전)
// 위치: src/components/MobileNav.tsx
//
// 세션 4: 탭 라벨 통일 + 디자인 개선
// - 탭 ID: positions / market / alerts / guide
// - MobileTabBar와 동일한 탭 체계 사용
// - iOS safe area 대응
// - 터치 타겟 최소 48px
// ============================================

import React from 'react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

// 탭 정의 — MobileTabBar와 동일한 ID 체계
const NAV_ITEMS = [
  { id: 'positions', label: '포지션', icon: '📊', activeIcon: '📊' },
  { id: 'market',    label: '시장',   icon: '🥚', activeIcon: '🥚' },
  { id: 'alerts',    label: '알림',   icon: '🔔', activeIcon: '🔔' },
  { id: 'guide',     label: '가이드', icon: '📚', activeIcon: '📚' },
];

const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  alertCount,
}) => {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        // 배경: 블러 + 반투명
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        // iOS safe area 대응
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '56px',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '0 8px',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const hasNotification = item.id === 'alerts' && alertCount > 0;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                // 터치 타겟: 최소 48×48
                minWidth: '48px',
                minHeight: '48px',
                padding: '4px 12px',
                // 스타일 초기화
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative',
                // 활성 상태 전환 애니메이션
                transition: 'transform 0.15s ease',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {/* 아이콘 */}
              <span
                style={{
                  fontSize: '20px',
                  lineHeight: 1,
                  position: 'relative',
                  // 활성 탭 강조
                  filter: isActive ? 'none' : 'grayscale(60%) opacity(0.6)',
                  transition: 'filter 0.2s ease',
                }}
              >
                {isActive ? item.activeIcon : item.icon}
                
                {/* 알림 뱃지 */}
                {hasNotification && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '700',
                      minWidth: '16px',
                      height: '16px',
                      lineHeight: '16px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      padding: '0 4px',
                    }}
                  >
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </span>
              
              {/* 라벨 */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#60a5fa' : '#64748b',
                  transition: 'color 0.2s ease',
                  letterSpacing: '-0.02em',
                }}
              >
                {item.label}
              </span>
              
              {/* 활성 탭 인디케이터 점 */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
