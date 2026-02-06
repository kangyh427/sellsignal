'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useResponsive } from '../hooks/useResponsive';

// ============================================
// 타입 정의
// ============================================

/** 알림(Alert) 객체 타입 */
interface Alert {
  id: string;
  type: string;
  message: string;
  positionId?: string;
  [key: string]: unknown;
}

/** ResponsiveHeader 컴포넌트 Props */
interface ResponsiveHeaderProps {
  alerts: Alert[];
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
}

// ============================================
// 스타일 상수 (CSS-in-JS 변수화)
// ============================================

const COLORS = {
  headerBg: 'rgba(15, 23, 42, 0.98)',
  headerBgLight: 'rgba(15, 23, 42, 0.95)',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
  textPrimary: '#fff',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  alertRed: '#ef4444',
  alertBg: 'rgba(239,68,68,0.2)',
  premiumGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  logoGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  dropdownBg: 'rgba(15, 23, 42, 0.98)',
  addBtnBorder: 'rgba(59, 130, 246, 0.3)',
  addBtnBg: 'rgba(59, 130, 246, 0.15)',
} as const;

const SIZES = {
  mobile: {
    logoDim: 40,
    logoRadius: 12,
    logoFont: '20px',
    titleFont: '16px',
    subFont: '11px',
    headerPadding: '12px 16px',
    btnPadding: '12px 16px',
  },
  tablet: {
    logoDim: 44,
    logoRadius: 14,
    logoFont: '24px',
    titleFont: '20px',
    subFont: '12px',
    headerPadding: '14px 20px',
    btnPadding: '10px 14px',
  },
  desktop: {
    logoDim: 48,
    logoRadius: 14,
    logoFont: '24px',
    titleFont: '22px',
    subFont: '13px',
    headerPadding: '16px 24px',
    btnPadding: '12px 20px',
  },
} as const;

// ============================================
// 서브 컴포넌트: 로고 영역
// ============================================

interface LogoSectionProps {
  isPremium: boolean;
  size: typeof SIZES.mobile | typeof SIZES.tablet | typeof SIZES.desktop;
}

const LogoSection: React.FC<LogoSectionProps> = ({ isPremium, size }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    {/* 로고 아이콘 */}
    <div
      style={{
        width: `${size.logoDim}px`,
        height: `${size.logoDim}px`,
        background: COLORS.logoGradient,
        borderRadius: `${size.logoRadius}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size.logoFont,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      📈
    </div>

    {/* 앱 제목 + 부제목 */}
    <div>
      <h1
        style={{
          fontSize: size.titleFont,
          fontWeight: '700',
          margin: 0,
          color: COLORS.textPrimary,
          lineHeight: 1.2,
        }}
      >
        매도의 기술
      </h1>
      <p
        style={{
          fontSize: size.subFont,
          color: COLORS.textSecondary,
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
      </p>
    </div>
  </div>
);

// ============================================
// 서브 컴포넌트: 알림 배지
// ============================================

interface AlertBadgeProps {
  count: number;
  compact?: boolean;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ count, compact = false }) => {
  if (count === 0) return null;

  if (compact) {
    // 모바일용 작은 배지 (숫자만)
    return (
      <span
        style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '18px',
          height: '18px',
          background: COLORS.alertRed,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: '700',
          color: '#fff',
          border: '2px solid #0f172a',
        }}
        aria-label={`${count}개 알림`}
      >
        {count > 9 ? '9+' : count}
      </span>
    );
  }

  // 태블릿/데스크탑용 텍스트 배지
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: COLORS.alertBg,
        borderRadius: '10px',
        animation: 'pulse 2s infinite',
      }}
      role="status"
      aria-label={`${count}개 알림`}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: COLORS.alertRed,
        }}
      />
      <span
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: COLORS.alertRed,
        }}
      >
        {count}개 알림
      </span>
    </div>
  );
};

// ============================================
// 서브 컴포넌트: 액션 버튼들
// ============================================

interface ActionButtonsProps {
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
  fontSize?: string;
  padding?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isPremium,
  onShowUpgrade,
  onShowAddModal,
  fontSize = '14px',
  padding = '12px 18px',
}) => (
  <>
    {!isPremium && (
      <button
        onClick={onShowUpgrade}
        style={{
          padding,
          background: COLORS.premiumGradient,
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          fontSize,
          fontWeight: '600',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
        aria-label="프리미엄 업그레이드"
      >
        👑 업그레이드
      </button>
    )}
    <button
      onClick={onShowAddModal}
      style={{
        padding,
        background: COLORS.primaryGradient,
        border: 'none',
        borderRadius: '10px',
        color: '#fff',
        fontSize,
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
      aria-label="종목 추가"
    >
      + 종목 추가
    </button>
  </>
);

// ============================================
// 메인 컴포넌트: ResponsiveHeader
// ============================================

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  alerts,
  isPremium,
  onShowUpgrade,
  onShowAddModal,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // ------------------------------------------
  // 외부 클릭 시 드롭다운 닫기
  // ------------------------------------------
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        showMobileMenu &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        setShowMobileMenu(false);
      }
    },
    [showMobileMenu]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [handleClickOutside]);

  // 화면 크기 변경 시 드롭다운 닫기
  useEffect(() => {
    if (!isMobile) setShowMobileMenu(false);
  }, [isMobile]);

  // ------------------------------------------
  // 드롭다운 메뉴 토글 (메뉴 열렸을 때 body 스크롤 방지)
  // ------------------------------------------
  const toggleMenu = useCallback(() => {
    setShowMobileMenu((prev) => !prev);
  }, []);

  // 메뉴 열림 시 스크롤 방지
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileMenu]);

  // ==========================================
  // 📱 모바일 헤더
  // ==========================================
  if (isMobile) {
    return (
      <header
        style={{
          background: COLORS.headerBg,
          borderBottom: `1px solid ${COLORS.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        role="banner"
      >
        {/* 상단 바 */}
        <div
          style={{
            padding: SIZES.mobile.headerPadding,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* 로고 */}
          <LogoSection isPremium={isPremium} size={SIZES.mobile} />

          {/* 우측 아이콘 그룹 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 알림 벨 아이콘 (모바일에서는 compact 배지) */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  width: '36px',
                  height: '36px',
                  background: alerts.length > 0 ? COLORS.alertBg : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '10px',
                  color: alerts.length > 0 ? COLORS.alertRed : '#fff',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={`알림 ${alerts.length}개`}
              >
                🔔
              </button>
              <AlertBadge count={alerts.length} compact />
            </div>

            {/* 빠른 종목 추가 버튼 */}
            <button
              onClick={onShowAddModal}
              style={{
                width: '36px',
                height: '36px',
                background: COLORS.primaryGradient,
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="종목 추가"
            >
              +
            </button>

            {/* 햄버거 메뉴 */}
            <button
              ref={hamburgerRef}
              onClick={toggleMenu}
              style={{
                width: '36px',
                height: '36px',
                background: showMobileMenu
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
              aria-label={showMobileMenu ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 (애니메이션) */}
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: COLORS.dropdownBg,
            borderBottom: `1px solid ${COLORS.border}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            // 애니메이션: max-height + opacity 트랜지션
            maxHeight: showMobileMenu ? '300px' : '0px',
            opacity: showMobileMenu ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.2s ease',
            zIndex: 99,
          }}
          aria-hidden={!showMobileMenu}
        >
          <div
            style={{
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* 프리미엄 업그레이드 버튼 */}
            {!isPremium && (
              <button
                onClick={() => {
                  onShowUpgrade();
                  setShowMobileMenu(false);
                }}
                style={{
                  padding: SIZES.mobile.btnPadding,
                  background: COLORS.premiumGradient,
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                👑 프리미엄 업그레이드
              </button>
            )}

            {/* 종목 추가 버튼 */}
            <button
              onClick={() => {
                onShowAddModal();
                setShowMobileMenu(false);
              }}
              style={{
                padding: SIZES.mobile.btnPadding,
                background: COLORS.addBtnBg,
                border: `1px solid ${COLORS.addBtnBorder}`,
                borderRadius: '10px',
                color: '#60a5fa',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              + 종목 추가
            </button>

            {/* 알림 요약 (알림이 있을 때만) */}
            {alerts.length > 0 && (
              <div
                style={{
                  padding: '10px 16px',
                  background: COLORS.alertBg,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: COLORS.alertRed,
                    animation: 'pulse 2s infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    color: COLORS.alertRed,
                    fontWeight: '600',
                  }}
                >
                  {alerts.length}개 매도 조건 도달!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 드롭다운 열림 시 오버레이 (터치 영역 차단) */}
        {showMobileMenu && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 98,
              background: 'rgba(0,0,0,0.3)',
            }}
            onClick={() => setShowMobileMenu(false)}
            aria-hidden="true"
          />
        )}
      </header>
    );
  }

  // ==========================================
  // 📱 태블릿 헤더
  // ==========================================
  if (isTablet) {
    return (
      <header
        style={{
          background: COLORS.headerBgLight,
          borderBottom: `1px solid ${COLORS.borderLight}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        role="banner"
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: SIZES.tablet.headerPadding,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* 로고 */}
          <LogoSection isPremium={isPremium} size={SIZES.tablet} />

          {/* 알림 + 액션 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertBadge count={alerts.length} />

            <ActionButtons
              isPremium={isPremium}
              onShowUpgrade={onShowUpgrade}
              onShowAddModal={onShowAddModal}
              fontSize="13px"
              padding={SIZES.tablet.btnPadding}
            />
          </div>
        </div>
      </header>
    );
  }

  // ==========================================
  // 🖥️ 데스크탑 헤더
  // ==========================================
  return (
    <header
      style={{
        background: COLORS.headerBgLight,
        borderBottom: `1px solid ${COLORS.borderLight}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
      role="banner"
    >
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: SIZES.desktop.headerPadding,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* 좌측: 알림 영역 */}
        <div style={{ minWidth: '200px' }}>
          <AlertBadge count={alerts.length} />
        </div>

        {/* 중앙: 로고 */}
        <LogoSection isPremium={isPremium} size={SIZES.desktop} />

        {/* 우측: 액션 버튼 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '200px',
            justifyContent: 'flex-end',
          }}
        >
          <ActionButtons
            isPremium={isPremium}
            onShowUpgrade={onShowUpgrade}
            onShowAddModal={onShowAddModal}
            fontSize="14px"
            padding={SIZES.desktop.btnPadding}
          />
        </div>
      </div>
    </header>
  );
};

export default ResponsiveHeader;
