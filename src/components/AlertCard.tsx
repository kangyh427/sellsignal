'use client';
// ============================================
// AlertCard - 조건 도달 알림 카드
// 경로: src/components/AlertCard.tsx
// ============================================

import React from 'react';
import type { Alert } from '@/types';

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: number) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss }) => (
  <div
    style={{
      background: `rgba(${alert.preset.color === '#ef4444' ? '239,68,68' : '234,179,8'},0.06)`,
      border: `1px solid ${alert.preset.color}30`,
      borderRadius: '10px',
      padding: '12px',
      marginBottom: '8px',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '14px' }}>{alert.preset.icon}</span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: alert.preset.color,
          }}
        >
          {alert.stockName}
        </span>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#475569',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '4px',
          minWidth: '28px',
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </div>
    <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
      {alert.message}
    </div>
    <div
      style={{
        fontSize: '11px',
        color: '#475569',
        marginTop: '4px',
      }}
    >
      현재 ₩{alert.currentPrice.toLocaleString()} → 목표 ₩{alert.targetPrice.toLocaleString()}
    </div>
  </div>
);

export default AlertCard;
