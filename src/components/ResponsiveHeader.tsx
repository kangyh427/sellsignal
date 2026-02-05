'use client';

import React from 'react';
import type { ResponsiveHeaderProps, Alert } from '../types';

// ============================================
// 헤더 컴포넌트
// ============================================

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ alerts, isPremium, isMobile, onUpgrade }) => {
  const unreadCount = alerts.filter((a: Alert) => !a.read).length;
  
  return (
    <header style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      padding: isMobile ? '12px 16px' : '16px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        <div style={{ 
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}>
          매도의 기술
        </div>
        {!isMobile && (
          <span style={{
            fontSize: '11px',
            background: 'rgba(139,92,246,0.2)',
            color: '#a78bfa',
            padding: '3px 8px',
            borderRadius: '4px',
            fontWeight: '600',
          }}>
            v1.0
          </span>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        {!isPremium && (
          <button
            onClick={onUpgrade}
            style={{
              padding: isMobile ? '6px 10px' : '8px 14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
            }}
          >
            {isMobile ? '👑 프리미엄' : '👑 프리미엄 업그레이드'}
          </button>
        )}
        
        <div style={{ position: 'relative' }}>
          <button style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: isMobile ? '6px 8px' : '8px 10px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '18px',
          }}>
            🔔
          </button>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 5px',
              borderRadius: '10px',
              minWidth: '18px',

export default ResponsiveHeader;
