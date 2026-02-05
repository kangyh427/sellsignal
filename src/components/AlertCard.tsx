'use client';

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { Alert } from '../types';

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: string | number) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss }) => {
  const { isMobile } = useResponsive();
  
  const severityColors: Record<string, { bg: string; label: string }> = {
    critical: { bg: '#ef4444', label: '긴급' },
    high: { bg: '#f97316', label: '높음' },
    medium: { bg: '#eab308', label: '보통' },
    low: { bg: '#3b82f6', label: '참고' },
  };
  
  const severity = severityColors[alert?.preset?.severity || 'medium'] || { bg: '#64748b', label: '알림' };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '방금 전';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return '1일 이상';
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${severity.bg}15 0%, ${severity.bg}08 100%)`,
      border: `1px solid ${severity.bg}30`,
      borderRadius: isMobile ? '10px' : '12px',
      padding: isMobile ? '12px' : '14px',
      marginBottom: '8px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: severity.bg,
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingLeft: '8px',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: isMobile ? '16px' : '18px' }}>{alert?.preset?.icon || '🔔'}</span>
            <span style={{
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '700',
              color: severity.bg,
            }}>{alert?.preset?.name || '알림'}</span>
            <span style={{
              fontSize: '9px',
              fontWeight: '600',
              color: '#fff',
              background: severity.bg,
              padding: '2px 6px',
              borderRadius: '4px',
            }}>{severity.label}</span>
          </div>

          <div style={{
            fontSize: isMobile ? '13px' : '15px',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '4px',
          }}>{alert?.stockName || '종목'}</div>

          <div style={{
            fontSize: isMobile ? '11px' : '13px',
            color: '#e2e8f0',
            lineHeight: '1.4',
            marginBottom: '6px',
          }}>{alert?.message || '설정한 조건에 도달했습니다'}</div>

          {alert?.currentPrice && (
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
              <span>현재가: <strong style={{ color: '#fff' }}>₩{alert.currentPrice.toLocaleString()}</strong></span>
              {alert?.targetPrice && (
                <span>기준가: <strong style={{ color: severity.bg }}>₩{alert.targetPrice.toLocaleString()}</strong></span>
              )}
            </div>
          )}

          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
            {formatTime(alert?.timestamp)}
          </div>
        </div>

        <button onClick={() => onDismiss(alert?.id)} style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '6px',
          padding: isMobile ? '8px 12px' : '8px 14px',
          color: '#fff',
          fontSize: '12px',
          cursor: 'pointer',
          flexShrink: 0,
        }}>확인</button>
      </div>
    </div>
  );
};

export default AlertCard;
