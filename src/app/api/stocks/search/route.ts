// ============================================
// 종목 검색 API
// 경로: src/app/api/stocks/search/route.ts
// 세션 19: Supabase stocks 테이블에서 검색
// ============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const country = searchParams.get('country'); // 'KR', 'US', 또는 null(전체)

  // 검색어 없으면 빈 배열
  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createClient();

    // Supabase RPC 함수 호출 (search_stocks)
    const { data, error } = await supabase.rpc('search_stocks', {
      search_query: query,
      search_country: country || null,
      result_limit: 15,
    });

    if (error) {
      // RPC 함수가 없을 경우 fallback: 직접 쿼리
      console.warn('RPC fallback:', error.message);

      const fallbackQuery = supabase
        .from('stocks')
        .select('id, code, name, name_en, market, country')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,name_en.ilike.%${query}%`)
        .limit(15);

      if (country) {
        fallbackQuery.eq('country', country);
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }

      return NextResponse.json({ results: fallbackData || [] });
    }

    return NextResponse.json({ results: data || [] });
  } catch (err) {
    console.error('Stock search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
