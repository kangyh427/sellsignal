'use client';
// ============================================
// Footer - 데스크톱 하단 푸터
// 경로: src/components/Footer.tsx
// 세션4(아키텍처 정리)에서 SellSignalApp.tsx L972-1173 분리
// ============================================
// 데스크톱에서만 표시 (모바일은 MobileBottomNav 사용)
// 사업자 정보, 면책조항, 서비스 링크 포함
// ============================================

import React from 'react';

// ── 링크 데이터 ──
const SERVICE_LINKS = [
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '프리미엄 안내', href: '/premium' },
];

const SUPPORT_LINKS = [
  { label: '자주 묻는 질문', href: '/faq' },
  { label: '문의하기', href: '/contact' },
];

// ── 링크 리스트 서브 컴포넌트 ──
const FooterLinkGroup: React.FC<{
  title: string;
  links: { label: string; href: string }[];
}> = ({ title, links }) => (
  <div>
    <h4
      style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#94a3b8',
        margin: '0 0 12px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
      }}
    >
      {title}
    </h4>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
      {links.map((item, i) => (
        <li key={i}>
          <a
            href={item.href}
            style={{
              fontSize: '13px',
              color: '#64748b',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#fff')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#64748b')}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

// ============================================
// 메인 컴포넌트
// ============================================
const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '48px 24px 32px',
        marginTop: '40px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ── 상단: 로고 + 링크 ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '40px',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* 로고 & 설명 */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
                }}
              >
                📈
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '2px' }}>
                CREST
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6', maxWidth: '300px' }}>
              Ride the Peak — 수익의 정점을 포착하는 스마트 매도 알림 도구
            </p>
          </div>

          {/* 서비스 링크 */}
          <FooterLinkGroup title="서비스" links={SERVICE_LINKS} />

          {/* 고객지원 링크 */}
          <FooterLinkGroup title="고객지원" links={SUPPORT_LINKS} />
        </div>

        {/* ── 사업자 정보 ── */}
        <div
          style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
          }}
        >
          <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', margin: '0 0 12px' }}>
            사업자 정보
          </h4>
          <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.8' }}>
            <p style={{ margin: '0 0 4px' }}>
              <span style={{ color: '#64748b' }}>상호:</span> 나온 |{' '}
              <span style={{ color: '#64748b', marginLeft: '8px' }}>대표:</span> 강윤혁 |{' '}
              <span style={{ color: '#64748b', marginLeft: '8px' }}>사업자등록번호:</span> 392-23-02153
            </p>
            <p style={{ margin: '0 0 4px' }}>
              <span style={{ color: '#64748b' }}>통신판매업신고:</span> 제2025-세종-0000호 |{' '}
              <span style={{ color: '#64748b', marginLeft: '8px' }}>이메일:</span> support@sellsignal.kr
            </p>
            <p style={{ margin: 0 }}>
              <span style={{ color: '#64748b' }}>주소:</span> 세종특별자치시 마음안1로 155, 301호(고운동, 성진프라자)
            </p>
          </div>
        </div>

        {/* ── 면책조항 ── */}
        <div
          style={{
            padding: '16px',
            background: 'rgba(234,179,8,0.05)',
            border: '1px solid rgba(234,179,8,0.15)',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontSize: '11px', color: '#a3a3a3', margin: 0, lineHeight: '1.7' }}>
            ⚠️ <strong style={{ color: '#eab308' }}>투자 유의사항:</strong> 본 서비스는 사용자가 설정한 조건을 모니터링하는
            유틸리티 도구로, 투자자문업 또는 투자권유에 해당하지 않습니다. 제공되는 정보는 참고용이며, 모든 투자 판단과 그에
            따른 결과의 책임은 투자자 본인에게 있습니다. 주식 투자는 원금 손실의 위험이 있으므로 신중하게 결정하시기 바랍니다.
          </p>
        </div>

        {/* ── 저작권 ── */}
        <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
            © 2025 CREST (sellsignal.kr). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
