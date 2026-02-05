'use client';

import React, { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface ResponsiveHeaderProps {
  alertCount: number;
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  alertCount,
  isPremium,
  onShowUpgrade,
  onShowAddModal,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // 모바일 헤더
  if (isMobile) {
    return (
      <header style={{
        background: 'rgba(15, 23, 42, 0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        width: '100%',
      }}>
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '100%',
        }}>
          {/* 좌측: 알림 */}
          <div style={{ flex: '0 0 auto', minWidth: '60px' }}>
            {alertCount > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                background: 'rgba(239,68,68,0.2)',
                borderRadius: '8px',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444' }}>{alertCount}개</span>
              </div>
            )}
          </div>

          {/* 중앙: 로고 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: '0 1 auto',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              flexShrink: 0,
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: '14px', fontWeight: '700', margin: 0, whiteSpace: 'nowrap' }}>매도의 기술</h1>
              <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'}
              </p>
            </div>
          </div>

          {/* 우측: 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '0 0 auto' }}>
            {!isPremium && (
              <button onClick={onShowUpgrade} style={{
                padding: '6px 10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '600',
                cursor: 'pointer',
              }}>업그레이드</button>
            )}
            <button onClick={onShowAddModal} style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>+</button>
          </div>
        </div>
      </header>
    );
  }

  // 태블릿/데스크톱 헤더
  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: isTablet ? '1200px' : '1600px',
        margin: '0 auto',
        padding: isTablet ? '14px 20px' : '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ minWidth: '150px' }}>
          {alertCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(239,68,68,0.2)',
              borderRadius: '10px',
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{alertCount}개 알림</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>📈</div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '150px', justifyContent: 'flex-end' }}>
          {!isPremium && (
            <button onClick={onShowUpgrade} style={{
              padding: '12px 18px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}>👑 업그레이드</button>
          )}
          <button onClick={onShowAddModal} style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}>+ 종목 추가</button>
        </div>
      </div>
    </header>
  );
};

export default ResponsiveHeader;
