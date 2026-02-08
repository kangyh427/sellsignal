'use client';
// ============================================
// ResponsiveHeader - 상단 헤더 (로고+PRO+종목추가+로그인)
// 경로: src/components/ResponsiveHeader.tsx
// 세션 18B: 로고/텍스트 크기 확대 (데스크톱 42px/22px, 모바일 34px/17px)
// ============================================

import React from 'react';
import CrestLogo from './CrestLogo';
import type { Alert } from '@/types';

interface ResponsiveHeaderProps {
  alerts: Alert[];
  isPremium: boolean;
  isLoggedIn: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
  onLogin: () => void;
  isMobile: boolean;
  isTablet: boolean;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  alerts, isPremium, isLoggedIn, onShowUpgrade, onShowAddModal, onLogin, isMobile, isTablet,
}) => (
  <header style={{
    position: "sticky", top: 0, zIndex: 100,
    background: "linear-gradient(180deg, rgba(10,10,15,0.97) 0%, rgba(10,10,15,0.92) 100%)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: isMobile ? "10px 16px" : "14px 24px",
  }}>
    <div style={{
      maxWidth: "1600px", margin: "0 auto",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      {/* 로고 영역 — 크기 확대 */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "14px" }}>
        <CrestLogo size={isMobile ? 34 : 42} />
        <div>
          <div style={{
            fontSize: isMobile ? "17px" : "22px",
            fontWeight: "800",
            color: "#fff",
            lineHeight: "1.1",
            letterSpacing: "-0.3px",
          }}>CREST</div>
          <div style={{
            fontSize: isMobile ? "10px" : "12px",
            color: "#64748b",
            letterSpacing: "0.5px",
          }}>매도의 기술</div>
        </div>
      </div>
      {/* 우측 버튼 그룹 */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "10px" }}>
        {!isMobile && (
          <button onClick={onShowAddModal} style={{
            padding: "8px 16px", height: "36px",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            border: "none", borderRadius: "8px", color: "#fff",
            fontSize: "13px", fontWeight: "600", cursor: "pointer",
          }}>+ 종목 추가</button>
        )}
        {!isPremium && (
          <button onClick={onShowUpgrade} style={{
            padding: isMobile ? "6px 10px" : "8px 14px", height: isMobile ? "32px" : "36px",
            background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))",
            border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px",
            color: "#a78bfa", fontSize: isMobile ? "11px" : "13px", fontWeight: "600", cursor: "pointer",
          }}>👑 PRO</button>
        )}
        <button onClick={onLogin} style={{
          padding: isMobile ? "6px 10px" : "8px 14px", height: isMobile ? "32px" : "36px",
          background: isLoggedIn ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${isLoggedIn ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "8px", color: isLoggedIn ? "#10b981" : "#94a3b8",
          fontSize: isMobile ? "11px" : "13px", fontWeight: "600", cursor: "pointer",
        }}>{isLoggedIn ? "✅ 로그인됨" : "로그인"}</button>
      </div>
    </div>
  </header>
);

export default ResponsiveHeader;
