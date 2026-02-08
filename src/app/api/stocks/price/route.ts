// ============================================
// 주가 조회 API Route
// 경로: src/app/api/stocks/price/route.ts
// 세션 21: Yahoo Finance API 연동
// ============================================
//
// 사용법:
//   GET /api/stocks/price?codes=005930,005380&market=KR
//   GET /api/stocks/price?codes=AAPL,GOOGL&market=US
//
// 한국 주식 티커 변환:
//   KOSPI:  005930 → 005930.KS
//   KOSDAQ: 247540 → 247540.KQ
//
// 미국 주식: 그대로 사용 (AAPL, GOOGL 등)
// ============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── Yahoo Finance API 엔드포인트 ──
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// ── 종목코드 → Yahoo Finance 티커 변환 ──
// stocks 테이블의 market 필드(KOSPI/KOSDAQ)를 활용
async function getYahooTickers(
  codes: string[],
  marketHint?: string
): Promise<Record<string, string>> {
  const tickerMap: Record<string, string> = {};

  if (marketHint === 'US') {
    // 미국 주식: 코드 그대로 사용
    codes.forEach((code) => {
      tickerMap[code] = code;
    });
    return tickerMap;
  }

  // 한국 주식: Supabase에서 market 필드 조회하여 .KS / .KQ 결정
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('stocks')
      .select('code, market')
      .in('code', codes);

    if (!error && data) {
      data.forEach((stock) => {
        const suffix = stock.market === 'KOSDAQ' ? '.KQ' : '.KS';
        tickerMap[stock.code] = `${stock.code}${suffix}`;
      });
    }
  } catch (err) {
    console.error('Supabase market lookup error:', err);
  }

  // DB에서 못 찾은 코드는 기본적으로 KOSPI(.KS) 처리
  codes.forEach((code) => {
    if (!tickerMap[code]) {
      tickerMap[code] = `${code}.KS`;
    }
  });

  return tickerMap;
}

// ── 단일 종목 Yahoo Finance 호출 ──
async function fetchYahooPrice(ticker: string): Promise<{
  price: number;
  change: number;
  changeAmount: number;
  previousClose: number;
  high: number;
  low: number;
  volume: number;
  marketState: string;
} | null> {
  try {
    const url = `${YAHOO_BASE}/${ticker}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // Vercel Edge에서 캐시 제어: 30초 동안 캐시 사용
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.error(`Yahoo API error for ${ticker}: ${res.status}`);
      return null;
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const changeAmount = price - previousClose;
    const change = previousClose > 0 ? (changeAmount / previousClose) * 100 : 0;

    // 당일 고가/저가는 indicators에서 가져오거나 meta에서 추정
    const indicators = result.indicators?.quote?.[0];
    const high = indicators?.high?.[indicators.high.length - 1] ?? meta.regularMarketDayHigh ?? price;
    const low = indicators?.low?.[indicators.low.length - 1] ?? meta.regularMarketDayLow ?? price;
    const volume = indicators?.volume?.[indicators.volume.length - 1] ?? meta.regularMarketVolume ?? 0;

    return {
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changeAmount: Math.round(changeAmount * 100) / 100,
      previousClose,
      high,
      low,
      volume,
      marketState: meta.marketState || 'CLOSED',
    };
  } catch (err) {
    console.error(`Yahoo fetch error for ${ticker}:`, err);
    return null;
  }
}

// ── GET 핸들러 ──
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codesParam = searchParams.get('codes');
  const market = searchParams.get('market') || 'KR'; // 기본: 한국

  if (!codesParam) {
    return NextResponse.json({ error: 'codes parameter required' }, { status: 400 });
  }

  // 쉼표 구분 종목코드 파싱 (최대 20개 제한)
  const codes = codesParam
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (codes.length === 0) {
    return NextResponse.json({ error: 'No valid codes provided' }, { status: 400 });
  }

  try {
    // 1. 종목코드 → Yahoo 티커 변환
    const tickerMap = await getYahooTickers(codes, market);

    // 2. 병렬로 Yahoo Finance 호출 (최대 20개)
    const entries = Object.entries(tickerMap);
    const results = await Promise.allSettled(
      entries.map(async ([code, ticker]) => {
        const data = await fetchYahooPrice(ticker);
        return { code, data };
      })
    );

    // 3. 응답 조합
    const prices: Record<string, any> = {};
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.data) {
        const { code, data } = result.value;
        prices[code] = {
          ...data,
          updatedAt: Date.now(),
        };
      }
    });

    return NextResponse.json({
      prices,
      fetchedAt: Date.now(),
    });
  } catch (err) {
    console.error('Stock price API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch stock prices', prices: {}, fetchedAt: Date.now() },
      { status: 500 }
    );
  }
}
