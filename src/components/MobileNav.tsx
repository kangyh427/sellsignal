'use client';

import React from 'react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  alertCount,
}) => {
  const navItems = [
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
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '8px 16px',
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      display: 'flex',
      justifyContent: 'space-around',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
    }}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            position: 'relative',
            minWidth: '60px',
          }}
        >
          <span style={{ fontSize: '20px' }}>{item.icon}</span>
          <span style={{
            fontSize: '10px',
            color: activeTab === item.id ? '#60a5fa' : '#64748b',
            fontWeight: activeTab === item.id ? '600' : '400',
          }}>{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '6px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '9px',
              fontWeight: '700',
              padding: '1px 5px',
              borderRadius: '6px',
              minWidth: '16px',
              textAlign: 'center',
            }}>{item.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;
