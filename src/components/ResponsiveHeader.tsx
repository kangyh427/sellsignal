'use client';

import React, { useState } from 'react';
import type { ResponsiveHeaderProps, Alert } from '../types';

// ============================================
// 크레스트 로고 SVG 컴포넌트
// ============================================
const CrestLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="crestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    
    {/* 배경 원 */}
    <circle cx="50" cy="50" r="45" fill="url(#crestGradient)" opacity="0.15" />
    
    {/* 상승 화살표 + C 모양 */}
    <path 
      d="M 70 30 Q 85 30 85 45 Q 85 60 70 60" 
      stroke="url(#crestGradient)" 
      strokeWidth="6" 
      fill="none" 
      strokeLinecap="round"
    />
    <path 
      d="M 30 70 L 50 40 L 70 70" 
      stroke="url(#crestGradient)" 
      strokeWidth="6" 
      fill="none" 
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="40" r="4" fill="#3b82f6" />
  </svg>
);

// ============================================
// 로그인 모달 컴포넌트
// ============================================
const LoginModal = ({ onClose, isMobile }: { onClose: () => void; isMobile: boolean }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 로그인 로직 구현
    alert('로그인 기능은 곧 추가됩니다.');
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '16px' : '20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: isMobile ? '24px' : '32px',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid rgba(139,92,246,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <CrestLogo size={60} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: '16px 0 8px' }}>
            크레스트 로그인
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            주식 매도 타이밍 분석 플랫폼
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '12px',
            }}
          >
            로그인
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="#" style={{ fontSize: '12px', color: '#8b5cf6', textDecoration: 'none' }}>
            비밀번호를 잊으셨나요?
          </a>
          <span style={{ margin: '0 8px', color: '#475569' }}>|</span>
          <a href="#" style={{ fontSize: '12px', color: '#8b5cf6', textDecoration: 'none' }}>
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 헤더 컴포넌트
// ============================================
const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ alerts, isPremium, isMobile, onUpgrade }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const unreadCount = alerts.filter((a: Alert) => !a.read).length;
  
  return (
    <>
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
        {/* 로고 + 타이틀 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '12px' }}>
          <CrestLogo size={isMobile ? 36 : 44} />
          <div>
            <div style={{ 
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              lineHeight: '1.2',
            }}>
              CREST
            </div>
            {!isMobile && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                주식 매도 타이밍 분석 플랫폼
              </div>
            )}
          </div>
          {!isMobile && (
            <span style={{
              fontSize: '10px',
              background: 'rgba(139,92,246,0.2)',
              color: '#a78bfa',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: '600',
              marginLeft: '8px',
            }}>
              v2.0
            </span>
          )}
        </div>
        
        {/* 우측 버튼들 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
          {/* 로그인 버튼 */}
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              padding: isMobile ? '8px 14px' : '10px 18px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <span style={{ fontSize: '14px' }}>👤</span>
            {!isMobile && '로그인'}
          </button>

          {/* 프리미엄 업그레이드 버튼 */}
          {!isPremium && (
            <button
              onClick={onUpgrade}
              style={{
                padding: isMobile ? '8px 12px' : '10px 16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: isMobile ? '11px' : '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              👑 {isMobile ? '프리미엄' : '프리미엄 업그레이드'}
            </button>
          )}
          
          {/* 알림 버튼 */}
          <div style={{ position: 'relative' }}>
            <button style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: isMobile ? '8px 10px' : '10px 12px',
              cursor: 'pointer',
              fontSize: isMobile ? '16px' : '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                padding: '2px 6px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center',
              }}>{unreadCount}</span>
            )}
          </div>
        </div>
      </header>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          isMobile={isMobile} 
        />
      )}
    </>
  );
};

export default ResponsiveHeader;
