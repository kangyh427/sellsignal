// ============================================
// 버핏지수 API Route
// 경로: src/app/api/buffett-indicator/route.ts
// 세션 40: 실데이터 연동
// ============================================
//
// 사용법:
//   GET /api/buffett-indicator
//
// 응답:
//   {
//     korea: { ratio: 107, label: '고평가', marketCap: 2400, gdp: 2236, indexLevel: 2780 },
//     usa:   { ratio: 188, label: '극단적 고평가', marketCap: 55000, gdp: 29200, indexLevel: 6100 },
//     updatedAt: '2025-02-09T12:00:00Z',
//     source: 'yahoo-finance'
//   }
//
// 데이터 소스:
//   - Yahoo Finance: ^KS11 (KOSPI), ^GSPC (S&P 500)
//   - GDP: IMF/세계은행 공식 발표 기준값 (연 1회 갱신)
//   - 시가총액: 지수 레벨 기반 비례 추정
// ============================================

import { NextResponse } from 'next/server';

// ── Yahoo Finance API ──
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// ── GDP 기준값 (연 1회 업데이트 필요) ──
// 출처: IMF World Economic Outlook, 한국은행
const GDP_DATA = {
  // 한국 GDP (조 원) — 2024년 추정치 (한국은행 발표 기준)
  korea: {
    gdp: 2236,        // 조 원
    year: 2024,
    source: 'IMF/한국은행',
  },
  // 미국 GDP (십억 달러) — 2024년 추정치
  usa: {
    gdp: 29200,       // 십억 달러 (= 29.2조 달러)
    year: 2024,
    source: 'IMF/BEA',
  },
};

// ── 시가총액 추정을 위한 기준점 (스케일링 팩터) ──
// "기준 지수 → 기준 시가총액" 관계를 사용하여 현재 시가총액을 추정
// 이 값들은 분기별로 업데이트하면 정확도가 높아짐
const SCALING_FACTORS = {
  korea: {
    // KOSPI 2,500 기준 → 시가총액 약 2,200조 원 (2024년 말 기준)
    referenceIndex: 2500,
    referenceMarketCap: 2200,   // 조 원
    unit: '조 원',
    lastCalibrated: '2024-12',
  },
  usa: {
    // S&P 500 6,000 기준 → Wilshire 5000 총 시가총액 약 55,000십억 달러
    referenceIndex: 6000,
    referenceMarketCap: 55000,  // 십억 달러
    unit: '십억 달러',
    lastCalibrated: '2024-12',
  },
};

// ── 평가 레벨 판정 ──
function getLabel(ratio: number): string {
  if (ratio < 70) return '저평가';
  if (ratio < 100) return '적정 수준';
  if (ratio < 150) return '고평가';
  return '극단적 고평가';
}

// ── Yahoo Finance 지수 데이터 호출 ──
async function fetchIndexLevel(ticker: string): Promise<number | null> {
  try {
    const url = `${YAHOO_BASE}/${ticker}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // 1시간 캐시 (버핏지수는 자주 변동하지 않음)
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Yahoo API error for ${ticker}: ${res.status}`);
      return null;
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    return result.meta?.regularMarketPrice ?? null;
  } catch (err) {
    console.error(`Yahoo fetch error for ${ticker}:`, err);
    return null;
  }
}

// ── 버핏지수 계산 ──
function calculateBuffettIndicator(
  indexLevel: number,
  scaling: typeof SCALING_FACTORS.korea,
  gdp: number
): { ratio: number; marketCap: number } {
  // 시가총액 = (현재 지수 / 기준 지수) × 기준 시가총액
  const marketCap = Math.round(
    (indexLevel / scaling.referenceIndex) * scaling.referenceMarketCap
  );
  // 버핏지수 = (시가총액 / GDP) × 100
  const ratio = Math.round((marketCap / gdp) * 100);

  return { ratio, marketCap };
}

// ── GET 핸들러 ──
export async function GET() {
  try {
    // 1. Yahoo Finance에서 지수 레벨 조회 (병렬)
    const [kospiLevel, sp500Level] = await Promise.all([
      fetchIndexLevel('%5EKS11'),     // ^KS11 (KOSPI)
      fetchIndexLevel('%5EGSPC'),     // ^GSPC (S&P 500)
    ]);

    // 2. 한국 버핏지수 계산
    let korea;
    if (kospiLevel) {
      const calc = calculateBuffettIndicator(
        kospiLevel,
        SCALING_FACTORS.korea,
        GDP_DATA.korea.gdp
      );
      korea = {
        ratio: calc.ratio,
        label: getLabel(calc.ratio),
        marketCap: calc.marketCap,
        gdp: GDP_DATA.korea.gdp,
        indexLevel: Math.round(kospiLevel),
        gdpYear: GDP_DATA.korea.year,
        source: 'Yahoo Finance + IMF',
      };
    } else {
      // 폴백: 마지막 알려진 값
      korea = {
        ratio: 98,
        label: getLabel(98),
        marketCap: 2200,
        gdp: GDP_DATA.korea.gdp,
        indexLevel: null,
        gdpYear: GDP_DATA.korea.year,
        source: 'fallback',
      };
    }

    // 3. 미국 버핏지수 계산
    let usa;
    if (sp500Level) {
      const calc = calculateBuffettIndicator(
        sp500Level,
        SCALING_FACTORS.usa,
        GDP_DATA.usa.gdp
      );
      usa = {
        ratio: calc.ratio,
        label: getLabel(calc.ratio),
        marketCap: calc.marketCap,
        gdp: GDP_DATA.usa.gdp,
        indexLevel: Math.round(sp500Level),
        gdpYear: GDP_DATA.usa.year,
        source: 'Yahoo Finance + IMF',
      };
    } else {
      // 폴백: 마지막 알려진 값
      usa = {
        ratio: 188,
        label: getLabel(188),
        marketCap: 55000,
        gdp: GDP_DATA.usa.gdp,
        indexLevel: null,
        gdpYear: GDP_DATA.usa.year,
        source: 'fallback',
      };
    }

    return NextResponse.json({
      korea,
      usa,
      updatedAt: new Date().toISOString(),
      gdpNote: `GDP 기준연도: 한국 ${GDP_DATA.korea.year}년, 미국 ${GDP_DATA.usa.year}년 (IMF 추정치)`,
    });
  } catch (err) {
    console.error('Buffett Indicator API error:', err);

    // 완전 실패 시 폴백 데이터 반환
    return NextResponse.json({
      korea: { ratio: 98, label: '적정 수준', marketCap: 2200, gdp: 2236, indexLevel: null, source: 'fallback' },
      usa: { ratio: 188, label: '극단적 고평가', marketCap: 55000, gdp: 29200, indexLevel: null, source: 'fallback' },
      updatedAt: new Date().toISOString(),
      gdpNote: 'API 오류로 폴백 데이터 사용',
    });
  }
}
