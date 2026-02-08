'use client';
// ============================================
// UpgradePopup - PRO 구독 업그레이드 팝업
// 경로: src/components/UpgradePopup.tsx
// 세션 18A: 17f 기반, 기능 비교 테이블 포함
// ============================================

import React from 'react';

interface UpgradePopupProps {
  isMobile: boolean;
  maxFreePositions: number;
  maxFreeAINews: number;
  onClose: () => void;
}

const UpgradePopup: React.FC<UpgradePopupProps> = ({ isMobile, maxFreePositions, maxFreeAINews, onClose }) => (
  <div onClick={(e) => (e.target as HTMLElement) === e.currentTarget && onClose()} style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
    zIndex: 1000, padding: isMobile ? '0' : '40px',
  }}>
    <div style={{
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      borderRadius: isMobile ? '20px 20px 0 0' : '20px',
      padding: isMobile ? '20px 16px calc(20px + env(safe-area-inset-bottom, 0px))' : '32px',
      maxWidth: '460px', width: '100%',
      maxHeight: isMobile ? '90vh' : '85vh', overflowY: 'auto',
      border: '1px solid rgba(139,92,246,0.3)',
      boxShadow: '0 0 60px rgba(139,92,246,0.15)',
    }}>
      {/* 드래그 핸들 */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '42px', marginBottom: '6px' }}>👑</div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>CREST PRO</h2>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>AI가 매일 시장을 분석해드립니다</p>
      </div>

      {/* 가격 */}
      <div style={{
        background: 'rgba(139,92,246,0.1)', borderRadius: '12px',
        padding: '14px', textAlign: 'center', marginBottom: '16px',
        border: '1px solid rgba(139,92,246,0.25)',
      }}>
        <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>
          ₩9,900<span style={{ fontSize: '13px', color: '#64748b', fontWeight: '400' }}>/월</span>
        </div>
        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>🎁 첫 7일 무료 체험</div>
        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>연간 구독 시 ₩99,000 (₩8,250/월, 17% 할인)</div>
      </div>

      {/* PRO 기능 비교 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          PRO 기능 비교
        </div>
        {[
          { feature: '종목 관리', free: `${maxFreePositions}개`, pro: '무제한', icon: '📊' },
          { feature: 'AI 뉴스 분석', free: `월 ${maxFreeAINews}회`, pro: '무제한', icon: '🤖' },
          { feature: 'AI 모닝 브리핑', free: '—', pro: '매일 제공', icon: '🌅' },
          { feature: '외인/기관 수급', free: '—', pro: '매일 분석', icon: '📉' },
          { feature: '실적 서프라이즈', free: '—', pro: 'D-3 사전분석', icon: '📋' },
          { feature: '테마/섹터 동향', free: '—', pro: '매일 업데이트', icon: '🔥' },
          { feature: '카카오톡 알림', free: '—', pro: '매도신호 즉시', icon: '💬' },
          { feature: '매도 이력/통계', free: '—', pro: '전체 기록', icon: '📈' },
          { feature: 'PDF 리포트', free: '—', pro: '주간/월간', icon: '📄' },
          { feature: '시장 분석 상세', free: '간략', pro: '상세 분석', icon: '📏' },
          { feature: '광고', free: '있음', pro: '없음', icon: '🚫' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '28px 1fr 70px 70px',
            alignItems: 'center', gap: '6px',
            padding: '8px 6px', borderRadius: '6px',
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
          }}>
            <span style={{ fontSize: '14px', textAlign: 'center' }}>{item.icon}</span>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500' }}>{item.feature}</span>
            <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>{item.free}</span>
            <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600', textAlign: 'center' }}>{item.pro}</span>
          </div>
        ))}
        <div style={{
          display: 'grid', gridTemplateColumns: '28px 1fr 70px 70px',
          gap: '6px', marginTop: '-1px', padding: '4px 6px 0',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span />
          <span />
          <span style={{ fontSize: '9px', color: '#475569', textAlign: 'center' }}>무료</span>
          <span style={{ fontSize: '9px', color: '#7c3aed', textAlign: 'center' }}>PRO</span>
        </div>
      </div>

      {/* 매도법 가이드 안내 */}
      <div style={{
        padding: '10px 12px', marginBottom: '10px',
        background: 'rgba(16,185,129,0.06)', borderRadius: '8px',
        border: '1px solid rgba(16,185,129,0.15)',
      }}>
        <div style={{ fontSize: '11px', color: '#10b981' }}>
          ✅ 매도법 가이드는 <strong>무료/PRO 모두</strong> 동일하게 제공됩니다
        </div>
      </div>

      {/* 알림 채널 안내 */}
      <div style={{
        padding: '10px 12px', marginBottom: '16px',
        background: 'rgba(59,130,246,0.06)', borderRadius: '8px',
        border: '1px solid rgba(59,130,246,0.12)',
        fontSize: '10px', color: '#60a5fa', lineHeight: '1.5',
      }}>
        💬 카카오톡은 <strong>매도 조건 도달</strong> 시에만 발송<br />
        📊 브리핑·수급·테마·실적은 <strong>사이트에서 열람</strong>
      </div>

      <button onClick={onClose} style={{
        width: '100%', padding: '14px',
        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        border: 'none', borderRadius: '12px', color: '#fff',
        fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '8px',
      }}>🎉 7일 무료로 시작하기</button>
      <button onClick={onClose} style={{
        width: '100%', padding: '10px', background: 'transparent',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
        color: '#64748b', fontSize: '12px', cursor: 'pointer',
      }}>나중에 할게요</button>
    </div>
  </div>
);

export default UpgradePopup;
