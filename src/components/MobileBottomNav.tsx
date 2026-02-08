'use client';
// ============================================
// MobileBottomNav - 하단 탭 네비게이션
// 경로: src/components/MobileBottomNav.tsx
// 세션 18A: 17f 시그니처 정확 반영 (4탭: 포지션/시장/알림/가이드)
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
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '6px 0 calc(6px + env(safe-area-inset-bottom, 0px))',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
          padding: '6px 4px', minHeight: '48px', background: 'transparent', border: 'none',
          cursor: 'pointer', position: 'relative',
        }}>
          <span style={{ fontSize: '18px', opacity: activeTab === tab.id ? 1 : 0.5 }}>{tab.icon}</span>
          <span style={{
            fontSize: '10px', fontWeight: activeTab === tab.id ? '700' : '400',
            color: activeTab === tab.id ? '#60a5fa' : '#64748b',
          }}>{tab.label}</span>
          {tab.badge && tab.badge > 0 && (
            <span style={{
              position: 'absolute', top: '2px', right: '50%', transform: 'translateX(14px)',
              background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: '700',
              padding: '1px 5px', borderRadius: '8px', minWidth: '16px', textAlign: 'center',
            }}>{tab.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
