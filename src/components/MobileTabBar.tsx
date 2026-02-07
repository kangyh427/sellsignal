'use client';

// ============================================
// MobileTabBar — 모바일 상단 인라인 탭 (통합 버전)
// 위치: src/components/MobileTabBar.tsx
//
// 세션 4: MobileNav와 탭 ID/라벨 통일
// - 탭 ID: positions / market / alerts / guide
// - 터치 타겟 44px 최소
// - 스크롤 숨김 + 스냅 개선
// ============================================

import React from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabItem[];
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        padding: '0 16px',
        marginBottom: '14px',
        overflowX: 'auto',
        // 스크롤바 숨김
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        .mobile-tab-bar::-webkit-scrollbar { display: none; }
      `}</style>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '8px 14px',
              minHeight: '40px', // 터치 타겟
              background: isActive
                ? 'rgba(59,130,246,0.2)'
                : 'rgba(255,255,255,0.05)',
              border: isActive
                ? '1px solid rgba(59,130,246,0.4)'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: isActive ? '#60a5fa' : '#94a3b8',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
              flexShrink: 0,
            }}
          >
            {tab.label}
            {(tab.count ?? 0) > 0 && (
              <span
                style={{
                  background: isActive ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  padding: '1px 6px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '700',
                  lineHeight: '1.4',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MobileTabBar;
