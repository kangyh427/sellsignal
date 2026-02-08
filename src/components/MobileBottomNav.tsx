'use client';
// ============================================
// MobileBottomNav - 모바일 하단 탭 네비게이션
// 경로: src/components/MobileBottomNav.tsx
// ============================================
// 4개 탭: 포지션 / 알림 / 시장 / 가이드
// safe-area-inset 대응, 터치 타겟 44px+

import React from 'react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  alertCount,
}) => {
  const tabs = [
    { id: 'positions', icon: '📊', label: '포지션' },
    { id: 'alerts',    icon: '🔔', label: '알림' },
    { id: 'market',    icon: '🌐', label: '시장' },
    { id: 'guide',     icon: '📖', label: '가이드' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.98)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 6px',
        }}
      >
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 0',
                minHeight: '48px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                  filter: active ? 'none' : 'grayscale(0.6) opacity(0.5)',
                }}
              >
                {t.icon}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? '700' : '500',
                  color: active ? '#3b82f6' : '#64748b',
                }}
              >
                {t.label}
              </span>

              {/* 알림 배지 */}
              {t.id === 'alerts' && alertCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: 'calc(50% - 18px)',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '1px 4px',
                    borderRadius: '6px',
                    minWidth: '14px',
                    textAlign: 'center',
                    lineHeight: '1.4',
                  }}
                >
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
