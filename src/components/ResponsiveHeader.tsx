'use client'

import React, { useState } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { AlertItem } from '@/types'

interface ResponsiveHeaderProps {
  alerts: AlertItem[]
  isPremium: boolean
  onShowUpgrade: () => void
  onShowAddModal: () => void
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  alerts,
  isPremium,
  onShowUpgrade,
  onShowAddModal
}) => {
  const { isMobile, isTablet } = useResponsive()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
      }}>
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 로고 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'}
              </p>
            </div>
          </div>

          {/* 우측 버튼들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 알림 배지 */}
            {alerts.length > 0 && (
              <div style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                background: 'rgba(239,68,68,0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '18px' }}>🔔</span>
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
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
              }}
            >+</button>

            {/* 햄버거 메뉴 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                width: '36px',
                height: '36px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '18px',
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
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backdropFilter: 'blur(10px)',
          }}>
            {!isPremium && (
              <button
                onClick={() => { onShowUpgrade(); setShowMobileMenu(false) }}
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
                }}
              >👑 프리미엄 업그레이드</button>
            )}
            <button
              onClick={() => { onShowAddModal(); setShowMobileMenu(false) }}
              style={{
                padding: '12px 16px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                color: '#60a5fa',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >+ 종목 추가</button>
          </div>
        )}
      </header>
    )
  }

  // 태블릿 헤더
  if (isTablet) {
    return (
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
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
                background: 'rgba(239,68,68,0.2)',
                borderRadius: '10px',
                animation: 'pulse 2s infinite'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
              </div>
            )}
            {!isPremium && (
              <button
                onClick={onShowUpgrade}
                style={{
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >👑 업그레이드</button>
            )}
            <button
              onClick={onShowAddModal}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >+ 종목 추가</button>
          </div>
        </div>
      </header>
    )
  }

  // 데스크톱 헤더
  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ minWidth: '200px' }}>
          {alerts.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(239,68,68,0.2)',
              borderRadius: '10px',
              animation: 'pulse 2s infinite'
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>📈</div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '200px',
          justifyContent: 'flex-end'
        }}>
          {!isPremium && (
            <button
              onClick={onShowUpgrade}
              style={{
                padding: '12px 18px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >👑 업그레이드</button>
          )}
          <button
            onClick={onShowAddModal}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >+ 종목 추가</button>
        </div>
      </div>
    </header>
  )
}
