'use client';

import React from 'react';

// ============================================
// UpgradePopup 컴포넌트
// 위치: src/components/UpgradePopup.tsx
//
// SellSignalApp.tsx 라인 711~906에서 추출
// 프리미엄 멤버십 업그레이드 팝업
// ============================================

interface UpgradePopupProps {
  isMobile: boolean;
  onUpgrade: () => void;
  onClose: () => void;
}

// ── 프리미엄 혜택 비교 데이터 ──
const PREMIUM_FEATURES = [
  { icon: '🚫', text: '광고 완전 제거', free: '❌', premium: '✅' },
  { icon: '📊', text: '모니터링 종목 수', free: '5개', premium: '20개' },
  { icon: '🤖', text: 'AI 뉴스 분석', free: '❌', premium: '✅' },
  { icon: '📑', text: 'AI 리포트 분석', free: '❌', premium: '✅' },
  { icon: '💬', text: '카카오톡 알림', free: '❌', premium: '✅' },
  { icon: '📧', text: '이메일 리포트', free: '❌', premium: '✅' },
];

const UpgradePopup: React.FC<UpgradePopupProps> = ({ isMobile, onUpgrade, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '16px' : '40px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: isMobile ? '20px' : '32px',
          maxWidth: '420px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 0 60px rgba(139,92,246,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 아이콘 & 타이틀 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>👑</div>
          <h2
            style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '700',
              color: '#fff',
              margin: '0 0 8px',
            }}
          >
            프리미엄 멤버십
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            더 강력한 매도 시그널 도구를 경험하세요
          </p>
        </div>

        {/* 가격 표시 */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '20px',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>
            월 구독료
          </div>
          <div
            style={{
              fontSize: isMobile ? '32px' : '36px',
              fontWeight: '800',
              color: '#fff',
            }}
          >
            ₩5,900
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>/월</span>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
            🎁 첫 7일 무료 체험
          </div>
        </div>

        {/* 기능 비교 */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '12px',
            }}
          >
            ✨ 프리미엄 혜택
          </div>
          {PREMIUM_FEATURES.map((item, i) => (
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
                <span
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    minWidth: '32px',
                    textAlign: 'center',
                  }}
                >
                  {item.free}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#10b981',
                    minWidth: '32px',
                    textAlign: 'center',
                  }}
                >
                  {item.premium}
                </span>
              </div>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              marginTop: '4px',
              paddingRight: '12px',
            }}
          >
            <span style={{ fontSize: '10px', color: '#64748b' }}>무료</span>
            <span style={{ fontSize: '10px', color: '#10b981' }}>프리미엄</span>
          </div>
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={onUpgrade}
          style={{
            width: '100%',
            padding: isMobile ? '16px' : '18px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '10px',
            boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
          }}
        >
          🎉 7일 무료로 시작하기
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: '#64748b',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          나중에 할게요
        </button>

        {/* 면책 */}
        <p
          style={{
            fontSize: '11px',
            color: '#64748b',
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

export default UpgradePopup;
