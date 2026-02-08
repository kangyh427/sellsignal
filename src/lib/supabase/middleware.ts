// ============================================
// Supabase 미들웨어 유틸
// 경로: src/lib/supabase/middleware.ts
// 용도: 매 요청마다 세션 쿠키 갱신 (토큰 리프레시)
// ============================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 미들웨어에서 Supabase 세션을 갱신
 * - 만료된 JWT를 자동 리프레시
 * - 보호 라우트 접근 제어 (향후 확장)
 */
export async function updateSession(request: NextRequest) {
  // 기본 응답 생성
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 요청 쿠키에 반영
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // 응답 쿠키에 반영
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ⚠️ getUser()를 반드시 호출해야 세션이 갱신됨
  // getSession()만으로는 토큰 검증이 안 됨
  const { data: { user } } = await supabase.auth.getUser();

  // [향후 확장] 비로그인 사용자를 로그인 페이지로 리다이렉트
  // if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/login';
  //   return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}
