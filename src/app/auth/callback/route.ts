// ============================================
// 인증 콜백 라우트
// 경로: src/app/auth/callback/route.ts
// 세션 20: 소셜 로그인(카카오/구글) + 비밀번호 재설정 콜백 대응
// ============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const errorParam = searchParams.get('error');

  // OAuth 에러 파라미터 처리 (사용자가 소셜 로그인 취소한 경우 등)
  if (errorParam) {
    const errorDescription = searchParams.get('error_description') ?? '인증에 실패했습니다.';
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 소셜 로그인 성공 또는 이메일 확인 완료
      // → profiles 테이블은 DB 트리거가 자동 생성
      return NextResponse.redirect(`${origin}${next}`);
    }

    // 코드 교환 실패 (만료된 코드 등)
    console.error('Auth callback error:', error.message);
  }

  // 인증 실패 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
