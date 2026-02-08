'use client';
// ============================================
// Footer - 모바일/데스크톱 통합 풋터
// 경로: src/components/Footer.tsx
// 세션 18A: 17f 기반 분리, 고객센터 mailto 포함
// ============================================

import React from 'react';
import CrestLogo from './CrestLogo';

interface FooterProps {
  isMobile: boolean;
}

/** mailto 링크 (공통) */
const MAILTO_HREF =
  'mailto:contact@sellsignal.kr?subject=[CREST] 문의사항&body=안녕하세요.%0A%0A▶ 문의 유형: (버그 신고 / 기능 요청 / 결제 문의 / 기타)%0A▶ 내용:%0A%0A----%0ACREST 매도의 기술';

const Footer: React.FC<FooterProps> = ({ isMobile }) => {
  if (isMobile) {
    return (
      <footer style={{
        padding: '20px 16px calc(80px + env(safe-area-inset-bottom, 0px)) 16px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
          <CrestLogo size={20} />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>CREST</span>
          <span style={{ fontSize: '10px', color: '#64748b' }}>매도의 기술</span>
        </div>
        {/* 고객센터 버튼 */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <a href={MAILTO_HREF} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '8px', padding: '8px 16px', minHeight: '36px',
            color: '#60a5fa', fontSize: '12px', fontWeight: '600',
            textDecoration: 'none', cursor: 'pointer',
          }}>📬 고객센터</a>
          <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>
            contact@sellsignal.kr · 평일 09:00~18:00
          </div>
        </div>
        {/* 사업자 정보 */}
        <div style={{ fontSize: '10px', color: '#475569', textAlign: 'center', lineHeight: '1.7' }}>
          대표: 강윤혁 | 사업자등록번호: 000-00-00000<br />
          통신판매업: 0000-세종-0000<br />
          유사투자자문업 신고번호 000000<br />
          소재지: 세종특별자치시<br />
          이메일: contact@sellsignal.kr
        </div>
        <div style={{ fontSize: '9px', color: '#334155', textAlign: 'center', marginTop: '10px', lineHeight: '1.5' }}>
          ⚠️ CREST는 유사투자자문업(금융위원회 신고)으로 운영되며, 투자 판단의 보조 도구입니다.
          모든 투자 결정은 이용자 본인의 책임하에 이루어져야 하며, 당사는 투자 결과에 대한 법적 책임을 지지 않습니다.
          <br />© 2025 CREST (sellsignal.kr). All rights reserved.
        </div>
      </footer>
    );
  }

  // 데스크톱/태블릿
  return (
    <footer style={{
      maxWidth: '1200px', margin: '40px auto 0', padding: '24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CrestLogo size={24} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>CREST</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>매도의 기술</span>
          </div>
          <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
            대표: 강윤혁 | 사업자등록번호: 000-00-00000<br />
            통신판매업: 0000-세종-0000<br />
            유사투자자문업 신고번호 000000<br />
            소재지: 세종특별자치시<br />
            이메일: contact@sellsignal.kr
          </div>
        </div>
        {/* 고객센터 */}
        <div style={{ minWidth: '160px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>📬 고객센터</div>
          <a href={MAILTO_HREF} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '8px', padding: '8px 14px', minHeight: '36px',
            color: '#60a5fa', fontSize: '12px', fontWeight: '600',
            textDecoration: 'none', cursor: 'pointer',
          }}>📬 고객센터</a>
          <div style={{ fontSize: '10px', color: '#475569', marginTop: '6px' }}>
            contact@sellsignal.kr<br />평일 09:00 ~ 18:00 (주말·공휴일 휴무)
          </div>
        </div>
      </div>
      <div style={{ fontSize: '10px', color: '#334155', lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
        ⚠️ 면책 사항: CREST는 유사투자자문업(금융위원회 신고)으로 운영되며, 투자 판단의 보조 도구입니다.
        모든 투자 결정은 이용자 본인의 책임하에 이루어져야 하며, 당사는 투자 결과에 대한 법적 책임을 지지 않습니다.
        <br />© 2025 CREST (sellsignal.kr). All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
