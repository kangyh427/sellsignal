'use client';

import React, { useState } from 'react';
import useResponsive from '../hooks/useResponsive';

// ============================================
// 반응형 헤더 — 모바일/데스크탑 분리 렌더링
// 위치: src/components/ResponsiveHeader.tsx
// ============================================

interface ResponsiveHeaderProps {
  alerts: Array<{ id: number | string }>;
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  alerts,
  isPremium,
  onShowUpgrade,
  onShowAddModal,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  /* ==============================
   * 모바일 헤더
   * ============================== */
  if (isMobile) {
    return (
      <header
        style={{
          background: 'rgba(15, 23, 42, 0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* 좌측: 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}
            >
              📈
            </div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#fff' }}>
                CREST
              </h1>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '주식 매도 타이밍 관리'}
              </p>
            </div>
          </div>

          {/* 우측: 액션 버튼들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 알림 배지 */}
            {alerts.length > 0 && (
              <div
                style={{
                  position: 'relative',
                  width: '36px',
                  height: '36px',
                  background: 'rgba(239,68,68,0.12)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <span style={{ fontSize: '17px' }}>🔔</span>
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    minWidth: '18px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(239,68,68,0.4)',
                  }}
                >
                  {alerts.length}
                </span>
              </div>
            )}

            {/* 종목 추가 */}
            <button
              onClick={onShowAddModal}
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(59,130,246,0.3)',
              }}
            >
              +
            </button>

            {/* 햄버거 메뉴 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                width: '36px',
                height: '36px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
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

        {/* 모바일 드롭다운 메뉴 */}
        {showMobileMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
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
            {!isPremium && (
              <button
                onClick={() => {
                  onShowUpgrade();
                  setShowMobileMenu(false);
                }}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                }}
              >
                👑 프리미엄 업그레이드
              </button>
            )}
            <button
              onClick={() => {
                onShowAddModal();
                setShowMobileMenu(false);
              }}
              style={{
                padding: '12px 16px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '10px',
                color: '#60a5fa',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              ➕ 종목 추가
            </button>
            <button
              onClick={() => setShowMobileMenu(false)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              ⚙️ 설정
            </button>
          </div>
        )}
      </header>
    );
  }

  /* ==============================
   * 데스크탑/태블릿 헤더
   * ============================== */
  return (
    <header
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: isTablet ? '1200px' : '1600px',
          margin: '0 auto',
          padding: isTablet ? '12px 20px' : '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* 좌측: 로고 + 앱 이름 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
            }}
          >
            📈
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>
              CREST
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              주식 매도 타이밍 관리 플랫폼
            </p>
          </div>
          {isPremium && (
            <span
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#000',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
              }}
            >
              v2.0
            </span>
          )}
        </div>

        {/* 우측: 액션 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* 로그인 버튼 */}
          <button
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            👤 로그인
          </button>

          {/* 프리미엄 업그레이드 */}
          {!isPremium && (
            <button
              onClick={onShowUpgrade}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ✨ 프리미엄 업그레이드
            </button>
          )}

          {/* 알림 */}
          <div
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              background: alerts.length > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: alerts.length > 0
                ? '1px solid rgba(239,68,68,0.2)'
                : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ fontSize: '18px' }}>🔔</span>
            {alerts.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  minWidth: '18px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(239,68,68,0.4)',
                }}
              >
                {alerts.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ResponsiveHeader;
