'use client';

import React from 'react';
import type { Alert } from '../types';

// ============================================
// Props 인터페이스
// ============================================
interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadAlertCount: number;  // 읽지 않은 알림 수
}

// ============================================
// 네비게이션 탭 정의 (데이터 분리)
// ============================================
interface NavItem {
  id: string;
  icon: string;
  label: string;
  hasBadge: boolean;  // 뱃지 표시 여부
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: '🏠', label: '홈', hasBadge: false },
  { id: 'analysis', icon: '📊', label: '분석', hasBadge: false },
  { id: 'alerts', icon: '🔔', label: '알림', hasBadge: true },
  { id: 'settings', icon: '⚙️', label: '설정', hasBadge: false },
];

// ============================================
// 스타일 상수
// ============================================
const STYLES = {
  nav: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(15,23,42,0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
    zIndex: 100,
  },
  button: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    position: 'relative' as const,
    padding: '4px 12px',
    minWidth: '60px',
    // 터치 타겟 최소 44px 확보
    minHeight: '44px',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute' as const,
    top: '2px',
    right: '6px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700' as const,
    padding: '1px 5px',
    borderRadius: '6px',
    minWidth: '16px',
    textAlign: 'center' as const,
  },
};

// ============================================
// MobileNav 컴포넌트
// ============================================
const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  unreadAlertCount,
}) => {
  return (
    <nav
      style={STYLES.nav}
      role="navigation"
      aria-label="하단 메뉴"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const badgeCount = item.hasBadge ? unreadAlertCount : 0;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={STYLES.button}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* 아이콘 */}
            <span style={{ fontSize: '20px' }}>{item.icon}</span>

            {/* 라벨 */}
            <span
              style={{
                fontSize: '10px',
                color: isActive ? '#60a5fa' : '#64748b',
                fontWeight: isActive ? '600' : '400',
                transition: 'color 0.2s ease',
              }}
            >
              {item.label}
            </span>

            {/* 알림 뱃지 */}
            {badgeCount > 0 && (
              <span style={STYLES.badge}>
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
