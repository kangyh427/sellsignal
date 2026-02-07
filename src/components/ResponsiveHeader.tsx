'use client';
// ============================================
// ResponsiveHeader - 반응형 헤더 컴포넌트
// 세션1 분리: 모바일/태블릿/데스크톱 헤더
// ============================================
// 개선사항:
// - 모바일 터치타겟 최소 44px (기존 36px → 44px)
// - 모바일 헤더 요소 간격 정리 (밀집 해소)
// - 태블릿/데스크톱 버튼 높이 통일 (44px)
// - 섹션 경계선 대비 강화 (0.08 → 0.15)
// ============================================

import React, { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import CrestLogo from './CrestLogo';

interface ResponsiveHeaderProps {
  alerts: Array<{ id: number; [key: string]: any }>;
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

  // ──────────────────────────────────────────
  // 모바일 헤더
  // ──────────────────────────────────────────
  if (isMobile) {
    return (
      <header style={{
        background: 'rgba(15, 23, 42, 0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* 로고 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CrestLogo size={36} />
            <div>
              <h1 style={{
                fontSize: '16px',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '2px',
                color: '#fff',
              }}>CREST</h1>
              <p style={{
                fontSize: '11px',
                color: '#94a3b8',
                margin: 0,
              }}>
                {isPremium ? '👑 Premium' : 'Ride the Peak'}
              </p>
            </div>
          </div>

          {/* 우측 버튼들 - 터치타겟 44px 보장 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 알림 배지 */}
            {alerts.length > 0 && (
              <div style={{
                position: 'relative',
                width: '44px',
                height: '44px',
                background: 'rgba(239,68,68,0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '20px' }}>🔔</span>
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}>{alerts.length}</span>
              </div>
            )}

            {/* 종목 추가 버튼 */}
            <button
              onClick={onShowAddModal}
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '22px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >+</button>

            {/* 햄버거 메뉴 (프리미엄 업그레이드 + 로그인) */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >☰</button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {showMobileMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backdropFilter: 'blur(10px)',
            zIndex: 99,
          }}>
            {/* 로그인 버튼 */}
            <button
              onClick={() => setShowMobileMenu(false)}
              style={{
                padding: '14px 16px',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '12px',
                color: '#10b981',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
                minHeight: '48px',
              }}
            >👤 로그인</button>

            {!isPremium && (
              <button
                onClick={() => { onShowUpgrade(); setShowMobileMenu(false); }}
                style={{
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minHeight: '48px',
                }}
              >👑 프리미엄 업그레이드</button>
            )}

            <button
              onClick={() => { onShowAddModal(); setShowMobileMenu(false); }}
              style={{
                padding: '14px 16px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                color: '#60a5fa',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
                minHeight: '48px',
              }}
            >+ 종목 추가</button>
          </div>
        )}
      </header>
    );
  }

  // ──────────────────────────────────────────
  // 태블릿 헤더
  // ──────────────────────────────────────────
  if (isTablet) {
    return (
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CrestLogo size={44} />
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '2px',
                color: '#fff',
              }}>CREST</h1>
              <p style={{
                fontSize: '12px',
                color: '#94a3b8',
                margin: 0,
              }}>
                {isPremium ? '👑 Premium' : 'Ride the Peak'}
              </p>
            </div>
          </div>

          {/* 알림 + 버튼들 - 높이 44px 통일 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {alerts.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                height: '44px',
                background: 'rgba(239,68,68,0.2)',
                borderRadius: '10px',
                animation: 'pulse 2s infinite',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
              </div>
            )}
            {!isPremium && (
              <button
                onClick={onShowUpgrade}
                style={{
                  padding: '0 16px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >👑 업그레이드</button>
            )}
            <button
              onClick={onShowAddModal}
              style={{
                padding: '0 18px',
                height: '44px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >+ 종목 추가</button>
          </div>
        </div>
      </header>
    );
  }

  // ──────────────────────────────────────────
  // 데스크톱 헤더
  // ──────────────────────────────────────────
  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* 좌측: 알림 */}
        <div style={{ minWidth: '200px' }}>
          {alerts.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              height: '44px',
              background: 'rgba(239,68,68,0.2)',
              borderRadius: '10px',
              animation: 'pulse 2s infinite',
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
            </div>
          )}
        </div>

        {/* 중앙: 로고 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <CrestLogo size={52} />
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '3px',
              color: '#fff',
            }}>CREST</h1>
            <p style={{
              fontSize: '13px',
              color: '#94a3b8',
              margin: 0,
            }}>
              {isPremium ? '👑 Premium' : 'Ride the Peak'}
            </p>
          </div>
        </div>

        {/* 우측: 버튼들 - 높이 44px 통일 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '200px',
          justifyContent: 'flex-end',
        }}>
          {!isPremium && (
            <button
              onClick={onShowUpgrade}
              style={{
                padding: '0 18px',
                height: '44px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >👑 업그레이드</button>
          )}
          <button
            onClick={onShowAddModal}
            style={{
              padding: '0 20px',
              height: '44px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >+ 종목 추가</button>
        </div>
      </div>
    </header>
  );
};

export default ResponsiveHeader;
