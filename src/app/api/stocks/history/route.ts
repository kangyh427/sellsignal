// ============================================
// 과거 가격 차트 API Route
// 경로: src/app/api/stocks/history/route.ts
// 세션 22A: Yahoo Finance 과거 OHLCV 데이터
// ============================================
//
// 사용법:
//   GET /api/stocks/history?code=005930&days=60&market=KR
//   GET /api/stocks/history?code=AAPL&days=60&market=US
//
// 응답: { candles: CandleData[], code, days, fetchedAt }
// ============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// ── 종목코드 → Yahoo 티커 변환 ──
async function resolveYahooTicker(
  code: string,
  market: string
): Promise<string> {
  if (market === 'US') return code;

  // 한국: Supabase에서 KOSPI/KOSDAQ 확인
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('stocks')
      .select('market')
      .eq('code', code)
      .single();

    if (data) {
      return `${code}${data.market === 'KOSDAQ' ? '.KQ' : '.KS'}`;
    }
  } catch (err) {
    console.error('Supabase lookup error:', err);
  }

  // fallback: KOSPI
  return `${code}.KS`;
}

// ── days → Yahoo range 파라미터 변환 ──
function daysToRange(days: number): string {
  if (days <= 5) return '5d';
  if (days <= 30) return '1mo';
  if (days <= 90) return '3mo';
  if (days <= 180) return '6mo';
  return '1y';
}

// ── GET 핸들러 ──
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const days = Math.min(Number(searchParams.get('days')) || 60, 365);
  const market = searchParams.get('market') || 'KR';

  if (!code) {
    return NextResponse.json(
      { error: 'code parameter required' },
      { status: 400 }
    );
  }

  try {
    // 1. 티커 변환
    const ticker = await resolveYahooTicker(code, market);
    const range = daysToRange(days);

    // 2. Yahoo Finance 호출 (일봉 데이터)
    const url = `${YAHOO_BASE}/${ticker}?interval=1d&range=${range}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // 5분 캐시 (과거 데이터는 자주 안 바뀜)
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`Yahoo history error for ${ticker}: ${res.status}`);
      return NextResponse.json(
        { error: `Yahoo API error: ${res.status}`, candles: [] },
        { status: 502 }
      );
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json(
        { error: 'No data returned', candles: [] },
        { status: 404 }
      );
    }

    // 3. OHLCV 파싱
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];

    if (!quote || timestamps.length === 0) {
      return NextResponse.json(
        { error: 'Empty chart data', candles: [] },
        { status: 404 }
      );
    }

    const candles = timestamps
      .map((ts: number, i: number) => {
        const open = quote.open?.[i];
        const high = quote.high?.[i];
        const low = quote.low?.[i];
        const close = quote.close?.[i];
        const volume = quote.volume?.[i];

        // null 데이터 필터링 (휴장일 등)
        if (open == null || close == null) return null;

        return {
          date: new Date(ts * 1000).toISOString(),
          open: Math.round(open * 100) / 100,
          high: Math.round((high ?? open) * 100) / 100,
          low: Math.round((low ?? open) * 100) / 100,
          close: Math.round(close * 100) / 100,
          volume: volume ?? 0,
        };
      })
      .filter(Boolean)
      .slice(-days); // 요청한 일수만큼만

    return NextResponse.json({
      candles,
      code,
      ticker,
      days,
      actualDays: candles.length,
      fetchedAt: Date.now(),
    });
  } catch (err) {
    console.error('Stock history API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch history', candles: [] },
      { status: 500 }
    );
  }
}
