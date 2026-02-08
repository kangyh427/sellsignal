// ============================================
// Supabase 서버 클라이언트
// 경로: src/lib/supabase/server.ts
// 용도: 서버 컴포넌트, API Route, Server Action에서 사용
// ============================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 서버 환경에서 Supabase 인스턴스 생성
 * - Server Component, Route Handler, Server Action에서 호출
 * - Next.js cookies()를 통해 세션 쿠키 읽기/쓰기
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 setAll 호출 시 에러 무시
            // (미들웨어에서 세션 갱신이 처리됨)
          }
        },
      },
    },
  );
}
