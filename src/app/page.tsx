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
