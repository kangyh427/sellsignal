'use client';

import React from 'react';

// ============================================
// MobileTabBar 컴포넌트
// 위치: src/components/MobileTabBar.tsx
//
// SellSignalApp.tsx 라인 259~317에서 추출
// 모바일 상단 인라인 탭 (포지션/알림/시장분석/가이드)
// ============================================

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
        gap: '8px',
        padding: '0 16px',
        marginBottom: '16px',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '10px 16px',
            background:
              activeTab === tab.id
                ? 'rgba(59,130,246,0.2)'
                : 'rgba(255,255,255,0.05)',
            border:
              activeTab === tab.id
                ? '1px solid rgba(59,130,246,0.4)'
                : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {tab.label}
          {(tab.count ?? 0) > 0 && (
            <span
              style={{
                background: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '11px',
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MobileTabBar;
