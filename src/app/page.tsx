'use client';
// ============================================
// Next.js App Router 엔트리 포인트
// 경로: src/app/page.tsx
// 세션 54: 빌드 오류 수정 — CRESTMobileApp → CRESTApp
// ============================================

import CRESTApp from '@/components/CRESTApp';

export default function Home() {
  return <CRESTApp />;
}
'use client';
// ============================================
// Next.js App Router 엔트리 포인트
// 경로: src/app/page.tsx
// 세션 54: SSR 비활성화로 prerender 에러 우회
// ============================================

import dynamic from 'next/dynamic';

const CRESTApp = dynamic(() => import('@/components/CRESTApp'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      fontSize: '14px',
    }}>
      로딩 중...
    </div>
  ),
});

export default function Home() {
  return <CRESTApp />;
}
