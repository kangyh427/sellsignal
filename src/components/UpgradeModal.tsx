'use client';

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import type { User } from '../types';

// ============================================
// Props 인터페이스
// ============================================
interface UpgradeModalProps {
  onUpgrade: () => void;   // 업그레이드 확정 콜백
  onClose: () => void;     // 닫기 콜백
}

// ============================================
// 프리미엄 혜택 목록 (데이터 분리)
// ============================================
const PREMIUM_BENEFITS = [
  { icon: '🚫', text: '광고 완전 제거', free: '❌', premium: '✅' },
  { icon: '📊', text: '모니터링 종목 수', free: '5개', premium: '20개' },
  { icon: '🤖', text: 'AI 뉴스 분석', free: '❌', premium: '✅' },
  { icon: '📑', text: 'AI 리포트 분석', free: '❌', premium: '✅' },
  { icon: '💬', text: '카카오톡 알림', free: '❌', premium: '✅' },
  { icon: '📧', text: '이메일 리포트', free: '❌', premium: '✅' },
] as const;

// ============================================
// 스타일 상수
// ============================================
const COLORS = {
  overlay: 'rgba(0,0,0,0.9)',
  cardBg: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
  purple: 'rgba(139,92,246,0.3)',
  purpleShadow: '0 0 60px rgba(139,92,246,0.2)',
  purpleGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  priceBg: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
  text: '#fff',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  accent: '#a78bfa',
  success: '#10b981',
  btnShadow: '0 4px 20px rgba(139,92,246,0.4)',
};

// ============================================
// UpgradeModal 컴포넌트
// ============================================
const UpgradeModal: React.FC<UpgradeModalProps> = ({ onUpgrade, onClose }) => {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: COLORS.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '16px' : '40px',
      }}
      onClick={(e) => {
        // 오버레이 클릭 시 닫기
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: COLORS.cardBg,
          borderRadius: '20px',
          padding: isMobile ? '20px' : '32px',
          maxWidth: '420px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: `1px solid ${COLORS.purple}`,
          boxShadow: COLORS.purpleShadow,
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>👑</div>
          <h2
            style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '700',
              color: COLORS.text,
              margin: '0 0 8px',
            }}
          >
            프리미엄 멤버십
          </h2>
          <p style={{ fontSize: '14px', color: COLORS.textMuted, margin: 0 }}>
            더 강력한 매도 시그널 도구를 경험하세요
          </p>
        </div>

        {/* 가격 섹션 */}
        <div
          style={{
            background: COLORS.priceBg,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '20px',
            border: `1px solid ${COLORS.purple}`,
          }}
        >
          <div style={{ fontSize: '14px', color: COLORS.accent, marginBottom: '4px' }}>
            월 구독료
          </div>
          <div style={{ fontSize: isMobile ? '32px' : '36px', fontWeight: '800', color: COLORS.text }}>
            ₩5,900
            <span style={{ fontSize: '14px', color: COLORS.textMuted, fontWeight: '400' }}>/월</span>
          </div>
          <div style={{ fontSize: '12px', color: COLORS.success, marginTop: '4px' }}>
            🎁 첫 7일 무료 체험
          </div>
        </div>

        {/* 혜택 목록 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text, marginBottom: '12px' }}>
            ✨ 프리미엄 혜택
          </div>
          {PREMIUM_BENEFITS.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                marginBottom: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{item.text}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: COLORS.textDim, minWidth: '32px', textAlign: 'center' }}>
                  {item.free}
                </span>
                <span style={{ fontSize: '12px', color: COLORS.success, minWidth: '32px', textAlign: 'center' }}>
                  {item.premium}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={onUpgrade}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '18px',
            background: COLORS.purpleGradient,
            border: 'none',
            borderRadius: '12px',
            color: COLORS.text,
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '10px',
            boxShadow: COLORS.btnShadow,
          }}
        >
          🎉 7일 무료로 시작하기
        </button>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: COLORS.textDim,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          나중에 할게요
        </button>

        {/* 안내 문구 */}
        <p
          style={{
            fontSize: '11px',
            color: COLORS.textDim,
            textAlign: 'center',
            margin: '16px 0 0',
            lineHeight: '1.5',
          }}
        >
          언제든지 해지 가능 · 자동 결제 · 부가세 포함
        </p>
      </div>
    </div>
  );
};

export default UpgradeModal;
