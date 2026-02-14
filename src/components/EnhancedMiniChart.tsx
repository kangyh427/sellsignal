// ============================================
// EnhancedMiniChart 매물대 함수 교체 가이드
// 경로: src/components/EnhancedMiniChart.tsx
// 세션 61: 매물대(Volume Profile) 정확도 개선
//
// [문제점]
// 기존: 캔들 빈도수 기반 (count++), 10구간
//   → 실제 거래량과 무관한 가짜 매물대
// 개선: 실제 volume 기반, 20구간 (네이버 증권 수준)
//   → 거래량이 실제로 집중된 가격대를 정확히 표시
// ============================================

// ── 찾아서 교체할 함수 ──
// 기존 calcVolumeProfile 함수를 아래로 교체하세요.

// 기존 (삭제):
/*
function calcVolumeProfile(candles: CandleData[], zones = 10) {
  const prices = candles.map(c => (c.high + c.low + c.close) / 3);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const zoneSize = range / zones;
  const profile = Array(zones).fill(0);
  prices.forEach(p => {
    const idx = Math.min(Math.floor((p - minP) / zoneSize), zones - 1);
    profile[idx]++;
  });
  const maxCount = Math.max(...profile);
  return profile.map((count, i) => ({
    priceMin: minP + i * zoneSize,
    priceMax: minP + (i + 1) * zoneSize,
    count,
    strength: count / maxCount,
    isHigh: count > (candles.length / zones) * 1.5,
  }));
}
*/

// 신규 (교체):
function calcVolumeProfile(candles: CandleData[], zones = 20) {
  // ★ 세션 61: 실제 거래량(volume) 기반 매물대 분석
  // 네이버 증권의 매물분석도(20)와 동일한 구간 수

  if (!candles || candles.length === 0) return [];

  // 1. 전체 가격 범위 산출
  let minP = Infinity;
  let maxP = -Infinity;
  candles.forEach(c => {
    if (c.low < minP) minP = c.low;
    if (c.high > maxP) maxP = c.high;
  });

  const range = maxP - minP;
  if (range <= 0) return [];
  const zoneSize = range / zones;

  // 2. 각 구간에 거래량 분배
  // PPT 매물대 원리: 거래량이 집중된 가격대 = 지지/저항선
  const volumeByZone: number[] = new Array(zones).fill(0);
  const candleCountByZone: number[] = new Array(zones).fill(0);

  candles.forEach(c => {
    const vol = c.volume || 1; // volume 없으면 1로 fallback

    // 캔들이 걸쳐있는 모든 구간에 거래량 분배
    // (고가~저가 범위에 걸친 구간에 비례 분배)
    const candleLow = c.low;
    const candleHigh = c.high;
    const candleRange = candleHigh - candleLow || zoneSize * 0.1;

    for (let z = 0; z < zones; z++) {
      const zoneLow = minP + z * zoneSize;
      const zoneHigh = minP + (z + 1) * zoneSize;

      // 캔들과 구간이 겹치는 영역 계산
      const overlapLow = Math.max(candleLow, zoneLow);
      const overlapHigh = Math.min(candleHigh, zoneHigh);

      if (overlapLow < overlapHigh) {
        // 겹치는 비율만큼 거래량 배분
        const overlapRatio = (overlapHigh - overlapLow) / candleRange;
        volumeByZone[z] += vol * overlapRatio;
        candleCountByZone[z]++;
      }
    }
  });

  // 3. 결과 정리
  const maxVol = Math.max(...volumeByZone);
  if (maxVol <= 0) return [];

  // 평균 거래량 (매물대 강약 판단 기준)
  const avgVol = volumeByZone.reduce((s, v) => s + v, 0) / zones;

  return volumeByZone.map((vol, i) => ({
    priceMin: Math.round(minP + i * zoneSize),
    priceMax: Math.round(minP + (i + 1) * zoneSize),
    count: vol,                        // 거래량 (실제 volume 합산)
    strength: vol / maxVol,            // 0~1 강도
    isHigh: vol > avgVol * 1.5,        // 평균의 1.5배 이상 = 강한 매물대
    // ★ 추가: 매물대 가격 라벨용
    midPrice: Math.round(minP + (i + 0.5) * zoneSize),
    volumeFormatted: vol > 1_000_000
      ? `${(vol / 1_000_000).toFixed(1)}m`
      : vol > 1000
      ? `${(vol / 1000).toFixed(0)}k`
      : `${Math.round(vol)}`,
  }));
}
