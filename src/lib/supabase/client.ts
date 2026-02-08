// ============================================
// Supabase 브라우저 클라이언트
// 경로: src/lib/supabase/client.ts
// 용도: 클라이언트 컴포넌트('use client')에서 사용
// ============================================

import { createBrowserClient } from '@supabase/ssr';

/**
 * 브라우저(클라이언트) 환경에서 Supabase 인스턴스 생성
 * - 'use client' 컴포넌트에서만 호출
 * - 쿠키 기반 세션 자동 관리
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
