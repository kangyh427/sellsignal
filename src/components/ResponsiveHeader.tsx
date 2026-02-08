'use client';
// ============================================
// ResponsiveHeader - 반응형 헤더 컴포넌트
// 경로: src/components/ResponsiveHeader.tsx
// ============================================
// 모바일: 로고 + [+종목] [🔔] [☰메뉴]
// 데스크톱: 로고 + 알림배지 + 업그레이드 + 종목추가

import React, { useState } from 'react';
import CrestLogo from './CrestLogo';

interface ResponsiveHeaderProps {
  alerts: Array<{ id: number; [key: string]: any }>;
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
  isMobile: boolean;
  isTablet: boolean;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  alerts, isPremium, onShowUpgrade, onShowAddModal,
  isMobile, isTablet,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // ── 모바일 헤더 ──
  if (isMobile) {
    return (
      <header
        style={{
          background: 'rgba(10, 10, 15, 0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CrestLogo size={36} />
            <div>
              <div
                style={{
                  fontSize: '17px', fontWeight: '800',
                  letterSpacing: '2px', color: '#fff',
                  lineHeight: '1.1',
                }}
              >
                CREST
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.5px' }}>
                매도 타이밍 분석
              </div>
            </div>
          </div>

          {/* 우측: 종목추가 + 알림 + 메뉴 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 종목 추가 CTA */}
            <button
              onClick={onShowAddModal}
              style={{
                height: '38px',
                padding: '0 14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span> 종목
            </button>

            {/* 알림 */}
            <button
              style={{
                width: '38px', height: '38px',
                background: alerts.length > 0
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '10px',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '18px' }}>🔔</span>
              {alerts.length > 0 && (
                <span
                  style={{
                    position: 'absolute', top: '-3px', right: '-3px',
                    background: '#ef4444', color: '#fff',
                    fontSize: '10px', fontWeight: '700',
                    padding: '1px 5px', borderRadius: '7px',
                    minWidth: '16px', textAlign: 'center',
                    lineHeight: '1.4',
                  }}
                >
                  {alerts.length}
                </span>
              )}
            </button>

            {/* 햄버거 메뉴 */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: '38px', height: '38px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '10px',
                color: '#94a3b8',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ☰
            </button>
          </div>
        </div>

        {/* 드롭다운 메뉴 */}
        {showMenu && (
          <>
            {/* 백드롭 (외부 클릭 닫기) */}
            <div
              onClick={() => setShowMenu(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 98 }}
            />
            <div
              style={{
                position: 'absolute',
                top: '100%', left: 0, right: 0,
                background: 'rgba(15, 23, 42, 0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backdropFilter: 'blur(12px)',
                zIndex: 99,
              }}
            >
              <button
                onClick={() => setShowMenu(false)}
                style={{
                  padding: '14px', minHeight: '48px',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '12px',
                  color: '#10b981', fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                👤 로그인
              </button>
              {!isPremium && (
                <button
                  onClick={() => { onShowUpgrade(); setShowMenu(false); }}
                  style={{
                    padding: '14px', minHeight: '48px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff', fontSize: '14px', fontWeight: '600',
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  👑 프리미엄 업그레이드
                </button>
              )}
            </div>
          </>
        )}
      </header>
    );
  }

  // ── 데스크톱/태블릿 헤더 ──
  return (
    <header
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0, zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: isTablet ? '1200px' : '1600px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <CrestLogo size={44} />
          <div>
            <h1
              style={{
                fontSize: '22px', fontWeight: '800',
                margin: 0, letterSpacing: '3px', color: '#fff',
              }}
            >
              CREST
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              {isPremium ? '👑 Premium' : '주식 매도 타이밍 분석 플랫폼'}
            </p>
          </div>
        </div>

        {/* 우측 액션 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {alerts.length > 0 && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', height: '40px',
                background: 'rgba(239,68,68,0.15)',
                borderRadius: '10px',
              }}
            >
              <span
                style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%', background: '#ef4444',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>
                {alerts.length}개 알림
              </span>
            </div>
          )}
          {!isPremium && (
            <button
              onClick={onShowUpgrade}
              style={{
                padding: '0 16px', height: '40px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                border: 'none', borderRadius: '10px',
                color: '#fff', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              👑 업그레이드
            </button>
          )}
          <button
            onClick={onShowAddModal}
            style={{
              padding: '0 18px', height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none', borderRadius: '10px',
              color: '#fff', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + 종목 추가
          </button>
        </div>
      </div>
    </header>
  );
};

export default ResponsiveHeader;
