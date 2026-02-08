// ============================================
// Next.js 루트 미들웨어
// 경로: src/middleware.ts
// 용도: 모든 요청에서 Supabase 세션 갱신
// ============================================

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * matcher: 미들웨어를 적용할 경로 패턴
 * - 정적 파일(_next/static, _next/image, favicon)은 제외
 * - 나머지 모든 경로에 세션 갱신 적용
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
