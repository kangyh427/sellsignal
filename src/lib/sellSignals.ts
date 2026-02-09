// ============================================
// CREST 매도 시그널 계산 엔진
// 경로: src/lib/sellSignals.ts
// 세션 24: 8종 매도법 기반 자동 시그널 판정
// ============================================
//
// 사용법:
//   import { calculateAllSignals } from '@/lib/sellSignals';
//   const result = calculateAllSignals({ position, candles, currentPrice });
//
// 반환값: PositionSignals (positionId, signals[], maxLevel, activeCount, totalScore)
// ============================================

import type { Position, CandleData } from '@/types';

// ── 타입 정의 ──

/** 시그널 위험 수준 (4단계 + 비활성) */
export type SignalLevel = 'danger' | 'warning' | 'caution' | 'safe' | 'inactive';

/** 개별 매도 시그널 결과 */
export interface SignalResult {
  presetId: string;
  level: SignalLevel;
  score: number;           // 0~100
  message: string;
  detail: string;
  triggeredAt?: number;
}

/** 포지션별 전체 시그널 결과 */
export interface PositionSignals {
  positionId: number;
  signals: SignalResult[];
  maxLevel: SignalLevel;
  activeCount: number;
  totalScore: number;
}

/** 계산 입력 */
interface SignalInput {
  position: Position;
  candles: CandleData[];
  currentPrice: number;
}

// ── 유틸리티 함수 ──

/** 이동평균 계산 */
function calcMA(closes: number[], period: number): number[] {
  const ma: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      ma.push(NaN);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      ma.push(slice.reduce((a, b) => a + b, 0) / period);
    }
  }
  return ma;
}

/** 수익률 계산 (%) */
function calcReturn(buyPrice: number, currentPrice: number): number {
  if (buyPrice <= 0) return 0;
  return ((currentPrice - buyPrice) / buyPrice) * 100;
}

/** 레벨 우선순위 (높을수록 위험) */
const LEVEL_PRIORITY: Record<SignalLevel, number> = {
  danger: 4,
  warning: 3,
  caution: 2,
  safe: 1,
  inactive: 0,
};

// ============================================
// 1. 봉 3개 매도법 (candle3)
// ============================================
// 규칙:
//   - 3일 연속 하락봉(종가 < 시가) → danger
//   - 최근 양봉의 100% 덮는 음봉 → danger
//   - 최근 양봉의 50% 덮는 음봉 → warning
//   - 갭하락 발생 → danger
// ============================================
function checkCandle3(candles: CandleData[]): SignalResult {
  const id = 'candle3';
  if (candles.length < 3) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: '최소 3일 이상의 데이터가 필요합니다.' };
  }

  const recent = candles.slice(-5); // 최근 5일
  const last3 = candles.slice(-3);

  // ── 갭하락 체크 (최근 2일) ──
  const yesterday = candles[candles.length - 2];
  const today = candles[candles.length - 1];
  if (today.open < yesterday.low) {
    return {
      presetId: id, level: 'danger', score: 95,
      message: '갭하락 발생! 전량 매도 고려',
      detail: `금일 시가(${today.open.toLocaleString()})가 전일 저가(${yesterday.low.toLocaleString()}) 아래에서 시작했습니다.`,
      triggeredAt: Date.now(),
    };
  }

  // ── 3일 연속 하락봉 체크 ──
  const threeConsecDown = last3.every(c => c.close < c.open);
  if (threeConsecDown) {
    const totalDrop = ((last3[2].close - last3[0].open) / last3[0].open * 100).toFixed(1);
    return {
      presetId: id, level: 'danger', score: 85,
      message: `3일 연속 하락봉! (${totalDrop}%)`,
      detail: `3일간 연속 하락봉이 출현했습니다. 추세 전환의 강한 신호입니다.`,
      triggeredAt: Date.now(),
    };
  }

  // ── 양봉 덮기 체크 ──
  // 최근 양봉 찾기
  let lastBullIdx = -1;
  for (let i = recent.length - 2; i >= 0; i--) {
    if (recent[i].close > recent[i].open) { lastBullIdx = i; break; }
  }

  if (lastBullIdx >= 0 && recent.length > lastBullIdx + 1) {
    const bull = recent[lastBullIdx];
    const bear = recent[recent.length - 1]; // 오늘
    const bullBody = bull.close - bull.open;
    const bearDrop = bull.close - bear.close;

    if (bear.close < bear.open && bullBody > 0) {
      const coverRatio = bearDrop / bullBody;

      if (coverRatio >= 1.0) {
        return {
          presetId: id, level: 'danger', score: 80,
          message: '양봉 100% 덮는 음봉! 전량 매도',
          detail: `최근 양봉을 완전히 덮는 음봉이 발생했습니다. 강한 매도 신호입니다.`,
          triggeredAt: Date.now(),
        };
      }
      if (coverRatio >= 0.5) {
        return {
          presetId: id, level: 'warning', score: 60,
          message: '양봉 50% 덮는 음봉 — 절반 매도 고려',
          detail: `최근 양봉의 ${(coverRatio * 100).toFixed(0)}%를 덮는 음봉이 발생했습니다.`,
          triggeredAt: Date.now(),
        };
      }
    }
  }

  // ── 2일 연속 하락봉 (주의) ──
  const last2 = candles.slice(-2);
  if (last2.every(c => c.close < c.open)) {
    return {
      presetId: id, level: 'caution', score: 30,
      message: '2일 연속 하락봉 — 추이 관찰',
      detail: '연속 하락봉이 시작되고 있습니다. 내일 추가 하락 시 매도를 고려하세요.',
    };
  }

  return { presetId: id, level: 'safe', score: 5, message: '정상 — 특이 패턴 없음', detail: '최근 봉 패턴에서 매도 신호가 감지되지 않았습니다.' };
}


// ============================================
// 2. 손실제한 매도법 (stopLoss)
// ============================================
// 규칙:
//   - 매수가 대비 -5% 이하 → danger (즉시 손절)
//   - 매수가 대비 -3% ~ -5% → warning (손절 근접)
//   - 매수가 대비 -1% ~ -3% → caution (주의)
// ============================================
function checkStopLoss(
  buyPrice: number,
  currentPrice: number,
  threshold: number = -5 // 기본 -5%
): SignalResult {
  const id = 'stopLoss';
  if (buyPrice <= 0 || currentPrice <= 0) {
    return { presetId: id, level: 'inactive', score: 0, message: '가격 데이터 없음', detail: '' };
  }

  const returnPct = calcReturn(buyPrice, currentPrice);

  if (returnPct <= threshold) {
    return {
      presetId: id, level: 'danger', score: 95,
      message: `손절 기준 도달! (${returnPct.toFixed(1)}%)`,
      detail: `매수가 ${buyPrice.toLocaleString()}원 대비 ${returnPct.toFixed(1)}% 하락. 기준(${threshold}%)을 초과했습니다. 즉시 매도를 권장합니다.`,
      triggeredAt: Date.now(),
    };
  }

  if (returnPct <= threshold + 2) { // threshold가 -5이면 -3~-5 구간
    return {
      presetId: id, level: 'warning', score: 70,
      message: `손절 기준 근접 (${returnPct.toFixed(1)}%)`,
      detail: `손절 기준(${threshold}%)까지 ${(returnPct - threshold).toFixed(1)}%p 남았습니다. 매도 준비하세요.`,
      triggeredAt: Date.now(),
    };
  }

  if (returnPct < 0) {
    return {
      presetId: id, level: 'caution', score: 25,
      message: `소폭 손실 중 (${returnPct.toFixed(1)}%)`,
      detail: `현재 ${returnPct.toFixed(1)}% 손실 중입니다. 추이를 관찰하세요.`,
    };
  }

  return {
    presetId: id, level: 'safe', score: 0,
    message: returnPct > 0 ? `수익 중 (+${returnPct.toFixed(1)}%)` : '손익분기점',
    detail: '현재 수익 구간이므로 손절 기준에 해당하지 않습니다.',
  };
}


// ============================================
// 3. 2/3 익절 매도법 (twoThird)
// ============================================
// 규칙:
//   - 최고 수익 대비 1/3 하락 → danger (매도!)
//   - 최고 수익 대비 1/4 하락 → warning
//   - 최고 수익 대비 1/5 하락 → caution
// ============================================
function checkTwoThird(
  buyPrice: number,
  highestPrice: number,
  currentPrice: number
): SignalResult {
  const id = 'twoThird';

  if (buyPrice <= 0 || highestPrice <= buyPrice) {
    return { presetId: id, level: 'inactive', score: 0, message: '수익 발생 전', detail: '최고가가 매수가보다 높아야 이 매도법이 작동합니다.' };
  }

  const maxProfit = highestPrice - buyPrice;       // 최대 수익금
  const currentProfit = currentPrice - buyPrice;   // 현재 수익금
  const profitLoss = maxProfit - currentProfit;    // 수익 감소분
  const lossRatio = profitLoss / maxProfit;        // 수익 대비 하락 비율

  const maxReturnPct = calcReturn(buyPrice, highestPrice);
  const currentReturnPct = calcReturn(buyPrice, currentPrice);

  if (lossRatio >= 1 / 3) {
    return {
      presetId: id, level: 'danger', score: 90,
      message: `수익 1/3 하락! 2/3 익절 매도`,
      detail: `최고 수익률 +${maxReturnPct.toFixed(1)}% → 현재 +${currentReturnPct.toFixed(1)}%. 수익의 ${(lossRatio * 100).toFixed(0)}%가 감소했습니다. 남은 수익을 확보하세요.`,
      triggeredAt: Date.now(),
    };
  }

  if (lossRatio >= 1 / 4) {
    return {
      presetId: id, level: 'warning', score: 60,
      message: `수익 1/4 하락 — 매도 준비`,
      detail: `최고 수익 대비 ${(lossRatio * 100).toFixed(0)}% 감소. 1/3 하락 시 매도를 실행하세요.`,
      triggeredAt: Date.now(),
    };
  }

  if (lossRatio >= 1 / 5) {
    return {
      presetId: id, level: 'caution', score: 30,
      message: `수익 줄어드는 중 (${(lossRatio * 100).toFixed(0)}% 감소)`,
      detail: `최고점에서 수익이 줄어들고 있습니다. 추이를 관찰하세요.`,
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: `수익 유지 중 (+${currentReturnPct.toFixed(1)}%)`,
    detail: `최고가 근처에서 수익을 유지하고 있습니다.`,
  };
}


// ============================================
// 4. 이동평균선 매도법 (maSignal)
// ============================================
// 그랜빌 법칙 기반 4가지 매도 신호:
//   1) MA 상승→횡보/하락 전환 + 주가 하향돌파 → danger
//   2) MA 하락 중 주가 일시 상향돌파 → warning
//   3) MA 하락 중 주가 재하락 → warning
//   4) MA 상승 중 주가 과도 이격 후 주춤 → caution
// ============================================
function checkMASignal(
  candles: CandleData[],
  currentPrice: number,
  period: number = 20 // 기본 20일선
): SignalResult {
  const id = 'maSignal';

  if (candles.length < period + 5) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: `${period}일 이동평균선 계산에 충분한 데이터가 없습니다.` };
  }

  const closes = candles.map(c => c.close);
  const maValues = calcMA(closes, period);

  const maToday = maValues[maValues.length - 1];
  const maYesterday = maValues[maValues.length - 2];
  const ma3DaysAgo = maValues[maValues.length - 4];

  if (isNaN(maToday) || isNaN(maYesterday)) {
    return { presetId: id, level: 'inactive', score: 0, message: '계산 불가', detail: '' };
  }

  const priceToday = closes[closes.length - 1];
  const priceYesterday = closes[closes.length - 2];

  // MA 추세 판단
  const maTrend = maToday - ma3DaysAgo; // 양수=상승, 음수=하락
  const isMARising = maTrend > 0;
  const isMATurning = isMARising && (maToday - maYesterday) < (maYesterday - ma3DaysAgo) * 0.3;

  // 주가와 MA 관계
  const priceBelowMA = priceToday < maToday;
  const priceAboveMA = priceToday > maToday;
  const yesterdayAboveMA = priceYesterday >= maYesterday;

  // 이격도 (%)
  const deviation = ((priceToday - maToday) / maToday) * 100;

  // ── 매도신호 1: MA 상승→전환 + 하향돌파 (가장 강력) ──
  if ((isMATurning || !isMARising) && priceBelowMA && yesterdayAboveMA) {
    return {
      presetId: id, level: 'danger', score: 85,
      message: `${period}일선 하향 돌파! 강력 매도`,
      detail: `이동평균선이 횡보/하락 전환하는 구간에서 주가가 ${period}일선을 하향 돌파했습니다. (이격도: ${deviation.toFixed(1)}%)`,
      triggeredAt: Date.now(),
    };
  }

  // ── 매도신호 3: MA 하락 중 주가가 MA 돌파 실패 ──
  if (!isMARising && priceBelowMA && !yesterdayAboveMA) {
    return {
      presetId: id, level: 'warning', score: 65,
      message: `${period}일선 저항 작용 중`,
      detail: `이동평균선이 하락 중이며, 주가가 ${period}일선 위로 올라가지 못하고 있습니다. 이평선이 저항선으로 작용하고 있습니다.`,
      triggeredAt: Date.now(),
    };
  }

  // ── 매도신호 2: MA 하락 중 일시적 상향돌파 ──
  if (!isMARising && priceAboveMA) {
    return {
      presetId: id, level: 'warning', score: 55,
      message: `하락 추세 중 기술적 반등`,
      detail: `${period}일선이 하락 중인데 주가가 일시적으로 위로 올라왔습니다. 매수 자제, 매도 관점으로 접근하세요.`,
      triggeredAt: Date.now(),
    };
  }

  // ── 매도신호 4: 과도 이격 (상승 중이라도) ──
  if (isMARising && deviation > 10) {
    return {
      presetId: id, level: 'caution', score: 40,
      message: `이격도 과대 (${deviation.toFixed(1)}%)`,
      detail: `주가가 ${period}일선보다 ${deviation.toFixed(1)}% 위에 있습니다. 과도한 이격은 조정의 신호일 수 있습니다.`,
    };
  }

  // ── 정상: MA 위에서 안정적 ──
  if (priceAboveMA && isMARising) {
    return {
      presetId: id, level: 'safe', score: 5,
      message: `${period}일선 위 안정적 상승`,
      detail: `주가가 상승하는 ${period}일선 위에서 안정적으로 유지되고 있습니다. (이격도: +${deviation.toFixed(1)}%)`,
    };
  }

  return {
    presetId: id, level: 'caution', score: 20,
    message: `${period}일선 부근 — 방향 관찰`,
    detail: `주가가 이동평균선 근처에 위치합니다. 돌파/이탈 방향을 주시하세요.`,
  };
}


// ============================================
// 5. 매물대 매도법 (volumeZone) — 간소화 버전
// ============================================
// 간소화 로직:
//   - 60일 OHLCV에서 거래량 가중 가격대 분포 산출
//   - 현재가 위에 고밀도 가격대가 있으면 저항 예상
//   - 현재가가 저항대에 접근/도달 시 매도 신호
// ============================================
function checkVolumeZone(
  candles: CandleData[],
  currentPrice: number
): SignalResult {
  const id = 'volumeZone';

  if (candles.length < 20) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: '매물대 분석에는 최소 20일 데이터가 필요합니다.' };
  }

  // 가격 범위를 10개 구간으로 나누어 매물대 분석
  const prices = candles.map(c => (c.high + c.low + c.close) / 3); // 가중평균가
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;

  if (range <= 0) {
    return { presetId: id, level: 'inactive', score: 0, message: '가격 변동 없음', detail: '' };
  }

  const ZONES = 10;
  const zoneSize = range / ZONES;
  const zoneCount = new Array(ZONES).fill(0);

  // 각 구간별 거래 빈도 집계
  prices.forEach(p => {
    const idx = Math.min(Math.floor((p - minPrice) / zoneSize), ZONES - 1);
    zoneCount[idx]++;
  });

  // 현재가 위에 있는 고밀도 구간(매물대) 찾기
  const currentZoneIdx = Math.min(Math.floor((currentPrice - minPrice) / zoneSize), ZONES - 1);
  const avgCount = candles.length / ZONES;

  // 현재가 바로 위 2구간 체크
  let resistanceStrength = 0;
  for (let i = currentZoneIdx + 1; i < Math.min(currentZoneIdx + 3, ZONES); i++) {
    if (zoneCount[i] > avgCount * 1.5) {
      resistanceStrength += zoneCount[i] / avgCount;
    }
  }

  // 현재가가 고밀도 구간 안에 있는지 체크
  const inHighDensity = zoneCount[currentZoneIdx] > avgCount * 1.5;

  if (inHighDensity && resistanceStrength > 0) {
    return {
      presetId: id, level: 'warning', score: 60,
      message: '상단 매물대 진입 — 저항 예상',
      detail: `현재가(${currentPrice.toLocaleString()}원)가 거래 밀집 구간에 진입했습니다. 매물 소화에 어려움이 예상됩니다.`,
      triggeredAt: Date.now(),
    };
  }

  if (resistanceStrength > 2) {
    return {
      presetId: id, level: 'caution', score: 35,
      message: '상단 매물대 접근 중',
      detail: `현재가 위에 강한 매물대가 형성되어 있습니다. 돌파 실패 시 매도를 고려하세요.`,
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: '주요 매물대 없음',
    detail: '현재가 주변에 강한 저항대가 감지되지 않았습니다.',
  };
}


// ============================================
// 6. 추세선 매도법 (trendline) — 간소화 버전
// ============================================
// 간소화 로직:
//   - 최근 60일 저점들을 연결한 상승 추세선 계산
//   - 주가가 추세선 아래로 이탈 시 매도 신호
// ============================================
function checkTrendline(
  candles: CandleData[],
  currentPrice: number
): SignalResult {
  const id = 'trendline';

  if (candles.length < 20) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: '' };
  }

  // 최근 저점들을 찾아 추세선 피팅 (선형 회귀)
  const lows = candles.map(c => c.low);
  const n = lows.length;

  // 선형 회귀: y = slope * x + intercept
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += lows[i];
    sumXY += i * lows[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 추세선 최신 값
  const trendValue = slope * (n - 1) + intercept;
  const trendPrevious = slope * (n - 2) + intercept;

  // 추세가 상승인지 확인
  const isUptrend = slope > 0;

  if (!isUptrend) {
    // 이미 하락 추세
    return {
      presetId: id, level: 'warning', score: 55,
      message: '하락 추세 진행 중',
      detail: `저점 연결 추세선이 하락하고 있습니다. 하락 추세에서의 보유는 위험합니다.`,
      triggeredAt: Date.now(),
    };
  }

  // 상승 추세선 이탈 체크
  const deviationPct = ((currentPrice - trendValue) / trendValue) * 100;

  if (currentPrice < trendValue) {
    return {
      presetId: id, level: 'danger', score: 80,
      message: '상승 추세선 이탈!',
      detail: `주가(${currentPrice.toLocaleString()})가 추세선(${Math.round(trendValue).toLocaleString()}) 아래로 이탈했습니다. (${deviationPct.toFixed(1)}%)`,
      triggeredAt: Date.now(),
    };
  }

  if (deviationPct < 2) {
    return {
      presetId: id, level: 'caution', score: 35,
      message: `추세선 근접 (${deviationPct.toFixed(1)}% 위)`,
      detail: `주가가 상승 추세선에 매우 근접해 있습니다. 이탈 여부를 주시하세요.`,
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: `추세선 위 안정적 (+${deviationPct.toFixed(1)}%)`,
    detail: `주가가 상승 추세선 위에서 안정적으로 유지되고 있습니다.`,
  };
}


// ============================================
// 7. 기업가치 반전 매도법 (fundamental) — 수동 판정
// ============================================
// 외부 데이터(PER/PBR/실적) 필요 → 현재는 placeholder
// 추후 KRX API 또는 외부 서비스 연동 시 자동화
// ============================================
function checkFundamental(): SignalResult {
  return {
    presetId: 'fundamental',
    level: 'inactive',
    score: 0,
    message: '수동 판정 필요',
    detail: '기업 실적/PER/PBR 데이터는 외부 연동이 필요합니다. 분기 실적 발표 시 직접 확인하세요.',
  };
}


// ============================================
// 8. 경기순환 매도법 (cycle) — 수동 판정
// ============================================
// 코스톨라니 달걀 위젯 연동 → 추후 자동화
// 현재는 수동으로 4~5단계 입력 시 경고
// ============================================
function checkCycle(cycleStage?: number): SignalResult {
  const id = 'cycle';

  if (cycleStage === undefined || cycleStage === null) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: '사이클 단계 미설정',
      detail: '코스톨라니 달걀 위젯에서 현재 시장 사이클 단계를 확인하세요.',
    };
  }

  // 코스톨라니 달걀 6단계: 1-2(매수), 3(보유), 4-5(매도), 6(관망)
  if (cycleStage >= 4 && cycleStage <= 5) {
    return {
      presetId: id, level: 'warning', score: 55,
      message: `경기순환 ${cycleStage}단계 — 매도 구간`,
      detail: `코스톨라니 달걀 모형 기준 ${cycleStage}단계(과열/침체 시작)입니다. 시장 전체에 대한 매도 관점을 유지하세요.`,
      triggeredAt: Date.now(),
    };
  }

  if (cycleStage === 6) {
    return {
      presetId: id, level: 'danger', score: 75,
      message: '경기순환 6단계 — 약세장 진입',
      detail: '코스톨라니 달걀 모형 기준 6단계(하락기)입니다. 포지션 축소를 강력히 권장합니다.',
      triggeredAt: Date.now(),
    };
  }

  if (cycleStage === 3) {
    return {
      presetId: id, level: 'caution', score: 25,
      message: '경기순환 3단계 — 고점 주의',
      detail: '경기 확장 후반부입니다. 과열 신호를 주시하세요.',
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: `경기순환 ${cycleStage}단계 — 매수/보유 구간`,
    detail: '현재 시장 사이클 상 매도 시점이 아닙니다.',
  };
}


// ============================================
// 🔥 통합 계산 함수
// ============================================
export function calculateAllSignals(input: SignalInput): PositionSignals {
  const { position, candles, currentPrice } = input;

  const selectedPresets = position.selectedPresets || [];
  const presetSettings = position.presetSettings || {};

  const signals: SignalResult[] = [];

  // 사용자가 선택한 프리셋에 대해서만 계산
  selectedPresets.forEach(presetId => {
    let result: SignalResult;

    switch (presetId) {
      case 'candle3':
        result = checkCandle3(candles);
        break;

      case 'stopLoss': {
        const threshold = presetSettings.stopLoss?.value ?? -5;
        result = checkStopLoss(position.buyPrice, currentPrice, threshold);
        break;
      }

      case 'twoThird':
        result = checkTwoThird(position.buyPrice, position.highestPrice, currentPrice);
        break;

      case 'maSignal': {
        const period = presetSettings.maSignal?.value ?? 20;
        result = checkMASignal(candles, currentPrice, period);
        break;
      }

      case 'volumeZone':
        result = checkVolumeZone(candles, currentPrice);
        break;

      case 'trendline':
        result = checkTrendline(candles, currentPrice);
        break;

      case 'fundamental':
        result = checkFundamental();
        break;

      case 'cycle':
        result = checkCycle(undefined); // 추후 cycleStage 연동
        break;

      default:
        result = { presetId, level: 'inactive', score: 0, message: '알 수 없는 프리셋', detail: '' };
    }

    signals.push(result);
  });

  // 최고 위험 수준 판정
  const maxLevel = signals.reduce<SignalLevel>((max, s) => {
    return LEVEL_PRIORITY[s.level] > LEVEL_PRIORITY[max] ? s.level : max;
  }, 'safe');

  // 활성 시그널 수 (caution 이상)
  const activeCount = signals.filter(s =>
    LEVEL_PRIORITY[s.level] >= LEVEL_PRIORITY['caution']
  ).length;

  // 합산 점수
  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);

  return {
    positionId: position.id,
    signals,
    maxLevel,
    activeCount,
    totalScore,
  };
}

// ── 개별 함수 export (테스트/확장용) ──
export {
  checkCandle3,
  checkStopLoss,
  checkTwoThird,
  checkMASignal,
  checkVolumeZone,
  checkTrendline,
  checkFundamental,
  checkCycle,
  calcMA,
  calcReturn,
};
