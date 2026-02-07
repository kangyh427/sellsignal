'use client';
// ============================================
// ResponsiveHeader - 반응형 헤더 컴포넌트
// 경로: src/components/ResponsiveHeader.tsx
// ============================================
// 세션6 [A1] 모바일 리디자인:
//   - 헤더 버튼 밀집 해소: 로그인/프리미엄 → ☰ 메뉴로 이동
//   - CTA 우선순위: [+종목] > [🔔] > [☰]
//   - backdrop-filter 통일 (blur 16px)
//   - 드롭다운 외부 클릭 닫기 처리
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
  // [A1] 모바일 헤더 - 간소화 리디자인
  // ──────────────────────────────────────────
  if (isMobile) {
    return (
      <header style={{
        background: 'rgba(10, 10, 15, 0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* 로고 영역 - 컴팩트 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CrestLogo size={36} />
            <div>
              <h1 style={{
                fontSize: '17px',
                fontWeight: '800',
                margin: 0,
                letterSpacing: '2px',
                color: '#fff',
                lineHeight: '1.1',
              }}>CREST</h1>
              <p style={{
                fontSize: '10px',
                color: '#64748b',
                margin: 0,
                letterSpacing: '0.5px',
              }}>매도 타이밍 분석</p>
            </div>
          </div>

          {/* 우측 버튼: +종목(CTA) → 알림 → 메뉴 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* [A1] 종목 추가 - 가장 중요한 CTA */}
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
              <span style={{ fontSize: '16px', lineHeight: '1' }}>+</span> 종목
            </button>

            {/* [A1] 알림 아이콘 */}
            <div style={{
              width: '38px',
              height: '38px',
              background: alerts.length > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <span style={{ fontSize: '18px' }}>🔔</span>
              {alerts.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 5px',
                  borderRadius: '7px',
                  minWidth: '16px',
                  textAlign: 'center',
                  lineHeight: '1.4',
                }}>{alerts.length}</span>
              )}
            </div>

            {/* [A1] 햄버거 메뉴 (로그인/프리미엄 이동) */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                width: '38px',
                height: '38px',
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
            >☰</button>
          </div>
        </div>

        {/* [A1] 드롭다운 메뉴 */}
        {showMobileMenu && (
          <>
            {/* 외부 클릭 오버레이 */}
            <div
              onClick={() => setShowMobileMenu(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 98,
              }}
            />
            <div style={{
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
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 99,
            }}>
              {/* 로그인 버튼 */}
              <button
                onClick={() => setShowMobileMenu(false)}
                style={{
                  padding: '14px 16px',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
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
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
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
          </>
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
        borderBottom: '1px solid rgba(255,255,255,0.08)',
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

          {/* 알림 + 버튼들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {alerts.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                height: '40px',
                background: 'rgba(239,68,68,0.15)',
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
                  height: '40px',
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
                height: '40px',
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
      borderBottom: '1px solid rgba(255,255,255,0.08)',
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
              background: 'rgba(239,68,68,0.15)',
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

        {/* 우측: 버튼들 */}
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
