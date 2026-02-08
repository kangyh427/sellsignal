'use client';
// ============================================
// Footer - 데스크톱 하단 푸터
// 경로: src/components/Footer.tsx
// ============================================
// 모바일에서는 MobileBottomNav 대신 표시되지 않음

import React from 'react';

const Footer: React.FC = () => (
  <footer
    style={{
      maxWidth: '1600px',
      margin: '40px auto 0',
      padding: '20px 24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      textAlign: 'center',
    }}
  >
    <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
      © 2026 CREST - 매도의 기술. 모든 투자 판단의 책임은 사용자에게 있습니다.
    </p>
  </footer>
);

export default Footer;
