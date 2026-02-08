'use client';
// ============================================
// AlertCard - 조건 도달 알림 카드
// 경로: src/components/AlertCard.tsx
// 세션 18A: 17f 시그니처 정확 반영
// ============================================

import React from 'react';
import type { Alert } from '@/types';

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: number) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss }) => (
  <div style={{
    background: 'rgba(239,68,68,0.06)', borderRadius: '10px',
    padding: '12px', marginBottom: '8px',
    borderLeft: `3px solid ${alert.preset?.color || '#ef4444'}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
          {alert.preset?.icon} {alert.stockName}
        </div>
        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>{alert.message}</div>
        <div style={{ fontSize: '10px', color: '#64748b' }}>
          목표가: ₩{alert.targetPrice?.toLocaleString()} | 현재가: ₩{alert.currentPrice?.toLocaleString()}
        </div>
      </div>
      <button onClick={() => onDismiss(alert.id)} style={{
        background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px',
        width: '28px', height: '28px', color: '#64748b', fontSize: '14px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
    </div>
  </div>
);

export default AlertCard;
