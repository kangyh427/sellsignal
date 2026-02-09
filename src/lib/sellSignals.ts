// ============================================
// CREST 매도 시그널 계산 엔진 v4
// 경로: src/lib/sellSignals.ts
// 세션 43: 4~6번 매도법 PPT 기반 대폭 강화
//
// [변경 이력]
// v3 (세션 41): 1~3번 매도법 강화
// v4 (세션 43):
//   4. 이동평균선: MACD 독립 시그널 + 다중MA 데드크로스 + 삼산 패턴
//   5. 매물대: 거래량 가중치 + 하단 지지대 이탈 강화
//   6. 추세선: 다중 지지선(1차/2차) + 채널 이탈 + 수평 추세선
//   공통: generateMockPriceData 현재가 앵커링 수정
//         sellPrices에서 maSignal/trendline 수평선 제거
// ============================================

import type { Position, CandleData, SignalLevel, SignalResult, PositionSignals } from '@/types';

// ── 계산 입력 ──
interface SignalInput {
  position: Position;
  candles: CandleData[];
  currentPrice: number;
}

// ── 유틸리티 함수 ──

/** 단순 이동평균 (SMA) */
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

/** 지수 이동평균 (EMA) */
function calcEMA(values: number[], period: number): number[] {
  const ema: number[] = [];
  const k = 2 / (period + 1);
  for (let i = 0; i < values.length; i++) {
    if (i === 0) ema.push(values[0]);
    else ema.push(values[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

/** MACD 계산 결과 */
interface MACDResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

/** MACD 계산 (12, 26, 9) */
function calcMACD(closes: number[]): MACDResult {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calcEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

/** ATR (Average True Range) */
function calcATR(candles: CandleData[], period: number = 14): number {
  if (candles.length < 2) return 0;
  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    trueRanges.push(tr);
  }
  const recentTR = trueRanges.slice(-period);
  return recentTR.reduce((a, b) => a + b, 0) / recentTR.length;
}

/** 수익률 (%) */
function calcReturn(buyPrice: number, currentPrice: number): number {
  if (buyPrice <= 0) return 0;
  return ((currentPrice - buyPrice) / buyPrice) * 100;
}

/** 음봉 판별 */
function isBearishCandle(candle: CandleData): boolean {
  return candle.close < candle.open;
}

/** 레벨 우선순위 */
const LEVEL_PRIORITY: Record<SignalLevel, number> = {
  danger: 4, warning: 3, caution: 2, safe: 1, inactive: 0,
};


// ============================================
// 1. 봉 3개 매도법 v3 (candle3) — 세션 41 완성
// ============================================
function checkCandle3(
  candles: CandleData[],
  returnPct?: number
): SignalResult {
  const id = 'candle3';
  if (candles.length < 3) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: '최소 3일 이상의 데이터가 필요합니다.' };
  }

  const today = candles[candles.length - 1];
  const yesterday = candles[candles.length - 2];
  const todayIsBearish = isBearishCandle(today);

  // 갭하락
  if (today.open < yesterday.low) {
    return {
      presetId: id, level: 'danger', score: 95,
      message: '갭하락 발생! 전량 매도 고려',
      detail: `금일 시가(${today.open.toLocaleString()})가 전일 저가(${yesterday.low.toLocaleString()}) 아래에서 시작했습니다.`,
      triggeredAt: Date.now(),
    };
  }

  // 3일 연속 하락봉
  const last3 = candles.slice(-3);
  const threeConsecDown = last3.every(c => c.close < c.open);
  if (threeConsecDown) {
    const totalDrop = ((last3[2].close - last3[0].open) / last3[0].open * 100).toFixed(1);
    return {
      presetId: id, level: 'danger', score: 85,
      message: `3일 연속 하락봉! (${totalDrop}%)`,
      detail: '추세 전환의 강한 신호입니다.',
      triggeredAt: Date.now(),
    };
  }

  // 양봉 묶음 합산 덮기
  const recent = candles.slice(-5);
  let bullGroupStart = -1;
  let bullGroupEnd = -1;
  for (let i = recent.length - 2; i >= 0; i--) {
    if (recent[i].close > recent[i].open) {
      if (bullGroupEnd === -1) bullGroupEnd = i;
      bullGroupStart = i;
    } else if (bullGroupEnd !== -1) break;
  }

  if (bullGroupStart >= 0 && bullGroupEnd >= bullGroupStart && todayIsBearish) {
    const groupOpen = recent[bullGroupStart].open;
    const groupClose = recent[bullGroupEnd].close;
    const groupBody = groupClose - groupOpen;

    if (groupBody > 0) {
      const todayDrop = groupClose - today.close;
      const coverRatio = todayDrop / groupBody;

      if (coverRatio >= 1.0) {
        const bullCount = bullGroupEnd - bullGroupStart + 1;
        return {
          presetId: id, level: 'danger', score: 85,
          message: `양봉 ${bullCount}개 100% 덮는 음봉! 전량 매도`,
          detail: `최근 ${bullCount}개 양봉을 완전히 덮는 음봉이 발생했습니다.`,
          triggeredAt: Date.now(),
        };
      }
      if (coverRatio >= 0.5) {
        const bullCount = bullGroupEnd - bullGroupStart + 1;
        return {
          presetId: id, level: 'warning', score: 65,
          message: `양봉 ${bullCount}개 ${(coverRatio * 100).toFixed(0)}% 덮는 음봉 — 절반 매도`,
          detail: `최근 ${bullCount}개 양봉의 ${(coverRatio * 100).toFixed(0)}%를 덮는 음봉이 발생했습니다.`,
          triggeredAt: Date.now(),
        };
      }
    }
  }

  // 2일 연속 하락봉
  if (candles.slice(-2).every(c => c.close < c.open)) {
    return { presetId: id, level: 'caution', score: 30, message: '2일 연속 하락봉 — 추이 관찰', detail: '내일 추가 하락 시 매도를 고려하세요.' };
  }

  if (!todayIsBearish) {
    return { presetId: id, level: 'safe', score: 0, message: '양봉 유지 — 상승 기운', detail: '오늘 양봉으로 마감하여 상승 흐름이 유지되고 있습니다.' };
  }

  return { presetId: id, level: 'safe', score: 5, message: '정상 — 특이 패턴 없음', detail: '' };
}


// ============================================
// 2. 손실제한 매도법 v3 (stopLoss) — 세션 41 완성
// ============================================
function checkStopLoss(
  buyPrice: number, currentPrice: number, candles: CandleData[], userThreshold?: number
): SignalResult {
  const id = 'stopLoss';
  if (buyPrice <= 0 || currentPrice <= 0) {
    return { presetId: id, level: 'inactive', score: 0, message: '가격 데이터 없음', detail: '' };
  }

  let threshold: number;
  let thresholdSource: string;

  if (userThreshold !== undefined && userThreshold !== null) {
    threshold = userThreshold;
    thresholdSource = '사용자 설정';
  } else if (candles.length >= 15) {
    const atr = calcATR(candles, 14);
    const atrPct = (atr / buyPrice) * 100;
    if (atrPct < 2) threshold = -3;
    else if (atrPct < 4) threshold = -4;
    else threshold = -5;
    thresholdSource = `ATR 자동(${atrPct.toFixed(1)}%)`;
  } else {
    threshold = -5;
    thresholdSource = '기본값';
  }

  const returnPct = calcReturn(buyPrice, currentPrice);
  const stopPrice = Math.round(buyPrice * (1 + threshold / 100));

  if (returnPct <= threshold) {
    return {
      presetId: id, level: 'danger', score: 90,
      message: `손절 기준 도달! (${returnPct.toFixed(1)}%)`,
      detail: `기준: ${threshold}% (${thresholdSource}), 손절가 ₩${stopPrice.toLocaleString()}`,
      triggeredAt: Date.now(),
    };
  }

  if (returnPct <= threshold * 0.7) {
    return {
      presetId: id, level: 'warning', score: 60,
      message: `손절 근접 (${returnPct.toFixed(1)}%)`,
      detail: `손절가(₩${stopPrice.toLocaleString()})까지 ${(threshold - returnPct).toFixed(1)}%p 남음 (${thresholdSource})`,
      triggeredAt: Date.now(),
    };
  }

  if (returnPct < 0) {
    return {
      presetId: id, level: 'caution', score: 25,
      message: `소폭 손실 (${returnPct.toFixed(1)}%)`,
      detail: `손절가(₩${stopPrice.toLocaleString()})까지 ${(threshold - returnPct).toFixed(1)}%p 남음`,
    };
  }

  return {
    presetId: id, level: 'safe', score: 0,
    message: `수익 중 (+${returnPct.toFixed(1)}%)`,
    detail: '',
  };
}


// ============================================
// 3. 2/3 익절 매도법 v3 (twoThird) — 세션 41 완성
// ============================================
function checkTwoThird(
  buyPrice: number, highestPrice: number | undefined, currentPrice: number
): SignalResult {
  const id = 'twoThird';
  const hp = highestPrice || currentPrice;
  if (hp <= buyPrice) {
    return { presetId: id, level: 'inactive', score: 0, message: '아직 수익 없음', detail: '' };
  }

  const gain = hp - buyPrice;
  const oneThird = gain / 3;
  const twoThirdPrice = hp - oneThird;
  const currentReturnPct = calcReturn(buyPrice, currentPrice);
  const dropFromHigh = ((hp - currentPrice) / hp) * 100;

  // 수익 구간 판별
  const profitTier = currentReturnPct >= 20 ? 'large' : currentReturnPct >= 10 ? 'medium' : 'small';

  if (currentPrice <= buyPrice + gain * (1 / 3)) {
    return {
      presetId: id, level: 'danger', score: 80,
      message: `2/3 익절선 하향 이탈!`,
      detail: `최고가(₩${hp.toLocaleString()}) 대비 -${dropFromHigh.toFixed(1)}% 하락. ${profitTier === 'small' ? '소폭 수익 구간이므로 대응이 급합니다.' : '침착하게 분할 매도하세요.'}`,
      triggeredAt: Date.now(),
    };
  }

  if (currentPrice <= twoThirdPrice * 1.03) {
    const remaining = currentPrice - twoThirdPrice;
    return {
      presetId: id, level: 'warning', score: 55,
      message: `2/3 익절선 근접`,
      detail: `기준가(₩${Math.round(twoThirdPrice).toLocaleString()})까지 ₩${Math.round(remaining).toLocaleString()} 남음`,
      triggeredAt: Date.now(),
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: `수익 유지 중 (+${currentReturnPct.toFixed(1)}%)`,
    detail: `${profitTier === 'small' ? '봉 3개 매도법과 함께 관찰하세요.' : ''}`,
  };
}


// ============================================
// 4. 이동평균선 매도법 v4 (maSignal)
// ============================================
// 세션 43 강화:
//   ① MACD 데드크로스를 독립 시그널로 분리 (보조 메모 → 점수 가산)
//   ② 다중 MA 데드크로스 감지 (10/20일선, 20/60일선)
//   ③ 삼산(머리어깨) 패턴 기초 감지
//   ④ 그물망 차트 하락 전환 (다중 이평선 정배열→역배열)
//   ⑤ PPT: "MACD는 타이밍 늦을 수 있으니 다른 매도법과 병행"
// ============================================
function checkMASignal(
  candles: CandleData[],
  currentPrice: number,
  period: number = 20
): SignalResult {
  const id = 'maSignal';

  if (candles.length < period + 5) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: `${period}일 이동평균선 계산에 충분한 데이터가 필요합니다.` };
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
  const maTrend = maToday - ma3DaysAgo;
  const isMARising = maTrend > 0;
  const isMATurning = isMARising && (maToday - maYesterday) < (maYesterday - ma3DaysAgo) * 0.3;
  const priceBelowMA = priceToday < maToday;
  const priceAboveMA = priceToday > maToday;
  const yesterdayAboveMA = priceYesterday >= maYesterday;
  const deviation = ((priceToday - maToday) / maToday) * 100;

  // ── [v4 신규] MACD 독립 점수 계산 ──
  let macdScore = 0;  // 0~25 범위로 가산
  let macdDetail = '';
  if (candles.length >= 35) {
    const macd = calcMACD(closes);
    const macdToday = macd.macdLine[macd.macdLine.length - 1];
    const macdYesterday = macd.macdLine[macd.macdLine.length - 2];
    const sigToday = macd.signalLine[macd.signalLine.length - 1];
    const sigYesterday = macd.signalLine[macd.signalLine.length - 2];

    // PPT: "MACD선-시그널선 데드크로스 → 매도"
    if (macdYesterday >= sigYesterday && macdToday < sigToday) {
      macdScore = 20;
      macdDetail = '⚡ MACD 데드크로스 발생';
    }
    // PPT: "MACD 0선 하향돌파 → 매도 타이밍 늦어질 수 있음"
    else if (macdYesterday >= 0 && macdToday < 0) {
      macdScore = 15;
      macdDetail = '⚡ MACD 0선 하향돌파 (주의: 늦은 시그널)';
    }
    // 히스토그램 감소 추세 (약한 신호)
    else if (macd.histogram.length >= 3) {
      const h = macd.histogram;
      const h1 = h[h.length - 1], h2 = h[h.length - 2], h3 = h[h.length - 3];
      if (h1 < h2 && h2 < h3 && h1 > 0) {
        macdScore = 5;
        macdDetail = 'MACD 히스토그램 감소 추세';
      }
    }
  }

  // ── [v4 신규] 다중 MA 데드크로스 감지 ──
  let maCrossScore = 0;
  let maCrossDetail = '';
  if (candles.length >= 62) {
    const ma10 = calcMA(closes, 10);
    const ma20 = calcMA(closes, 20);
    const ma60 = calcMA(closes, 60);

    const m10t = ma10[ma10.length - 1], m10y = ma10[ma10.length - 2];
    const m20t = ma20[ma20.length - 1], m20y = ma20[ma20.length - 2];
    const m60t = ma60[ma60.length - 1], m60y = ma60[ma60.length - 2];

    // 20일선이 60일선 하향돌파 (장기 데드크로스)
    if (!isNaN(m20t) && !isNaN(m60t) && m20y >= m60y && m20t < m60t) {
      maCrossScore = 25;
      maCrossDetail = '📉 20/60일선 데드크로스! 중장기 하락 전환';
    }
    // 10일선이 20일선 하향돌파 (단기 데드크로스)
    else if (!isNaN(m10t) && !isNaN(m20t) && m10y >= m20y && m10t < m20t) {
      maCrossScore = 15;
      maCrossDetail = '📉 10/20일선 데드크로스 (단기 하락 전환)';
    }

    // ── [v4 신규] 그물망 차트 하락 전환 ──
    // PPT: "이평선이 여러개 → 정배열에서 역배열로 전환 시 매도"
    // 정배열: 단기 > 중기 > 장기 / 역배열: 장기 > 중기 > 단기
    if (!isNaN(m10t) && !isNaN(m20t) && !isNaN(m60t)) {
      const todayOrder = m10t > m20t && m20t > m60t; // 정배열
      const yesterdayOrder = m10y > m20y && m20y > m60y;
      const todayReverse = m60t > m20t && m20t > m10t; // 역배열

      if (yesterdayOrder && !todayOrder) {
        maCrossScore = Math.max(maCrossScore, 20);
        maCrossDetail += (maCrossDetail ? ' + ' : '') + '🕸 그물망 정배열 붕괴';
      }
      if (todayReverse) {
        maCrossScore = Math.max(maCrossScore, 25);
        maCrossDetail = '🕸 그물망 역배열 진입! 강한 하락 신호';
      }
    }
  }

  // ── [v4 신규] 삼산(머리어깨) 패턴 감지 ──
  let tripleTopScore = 0;
  let tripleTopDetail = '';
  if (candles.length >= 30) {
    const highs = candles.map(c => c.high);
    const peaks = findLocalPeaks(highs, 5);

    if (peaks.length >= 3) {
      const lastThree = peaks.slice(-3);
      const [p1, p2, p3] = lastThree.map(idx => highs[idx]);

      // 머리어깨: 가운데 봉우리가 가장 높고, 세 번째가 첫 번째와 비슷
      const isHeadAndShoulders =
        p2 > p1 * 0.98 && p2 > p3 * 0.98 && // 머리가 가장 높거나 비슷
        Math.abs(p1 - p3) / p1 < 0.05 &&     // 양 어깨 높이 유사 (5% 이내)
        currentPrice < Math.min(p1, p3);       // 현재가가 어깨 아래

      // 삼봉: 세 봉우리가 비슷한 높이인데 하락
      const isTripleTop =
        Math.abs(p1 - p2) / p1 < 0.05 &&
        Math.abs(p2 - p3) / p2 < 0.05 &&
        currentPrice < Math.min(p1, p2, p3) * 0.97;

      if (isHeadAndShoulders) {
        tripleTopScore = 20;
        tripleTopDetail = '🏔 머리어깨(삼산) 패턴 감지! 대세 하락 예고';
      } else if (isTripleTop) {
        tripleTopScore = 15;
        tripleTopDetail = '🏔 삼봉천정형 감지 — 전고점 돌파 실패';
      }
    }
  }

  // ── 종합 점수 산정 ──
  // 기존 그랜빌 법칙 기반 점수 + MACD + MA크로스 + 삼산
  let baseScore = 0;
  let baseLevel: SignalLevel = 'safe';
  let baseMessage = '';
  let baseDetail = '';

  const maInfo = `(${period}일선: ₩${Math.round(maToday).toLocaleString()}, 이격도: ${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%)`;

  // 매도신호 1: MA 전환 + 하향돌파 (가장 강력)
  if ((isMATurning || !isMARising) && priceBelowMA && yesterdayAboveMA) {
    baseScore = 70; baseLevel = 'danger';
    baseMessage = `${period}일선 하향 돌파! 강력 매도`;
    baseDetail = `이평선 횡보/하락 구간에서 하향 돌파 ${maInfo}`;
  }
  // 매도신호 3: MA 하락 중 돌파 실패
  else if (!isMARising && priceBelowMA && !yesterdayAboveMA) {
    baseScore = 50; baseLevel = 'warning';
    baseMessage = `${period}일선 저항 작용 중`;
    baseDetail = `이평선이 하락 추세이며, 돌파 실패 ${maInfo}`;
  }
  // 매도신호 2: MA 하락 중 일시적 상향돌파
  else if (!isMARising && priceAboveMA) {
    baseScore = 40; baseLevel = 'warning';
    baseMessage = '하락 추세 중 기술적 반등';
    baseDetail = `일시적 상향돌파, 매도 관점 접근 ${maInfo}`;
  }
  // 매도신호 4: 과도 이격
  else if (isMARising && deviation > 10) {
    baseScore = 30; baseLevel = 'caution';
    baseMessage = `이격도 과대 (${deviation.toFixed(1)}%)`;
    baseDetail = `과도한 이격은 조정 신호 ${maInfo}`;
  }
  // 안정적 상승
  else if (priceAboveMA && isMARising) {
    baseScore = 5; baseLevel = 'safe';
    baseMessage = `${period}일선 위 안정 상승`;
    baseDetail = maInfo;
  }
  // 관찰
  else {
    baseScore = 15; baseLevel = 'caution';
    baseMessage = `${period}일선 부근 — 방향 관찰`;
    baseDetail = maInfo;
  }

  // ── 종합 (기본 + MACD + MA크로스 + 삼산) ──
  const totalScore = Math.min(100, baseScore + macdScore + maCrossScore + tripleTopScore);
  const additionalDetails = [macdDetail, maCrossDetail, tripleTopDetail].filter(Boolean);

  // 추가 시그널이 기본 레벨보다 심각하면 레벨 상향
  let finalLevel = baseLevel;
  if (totalScore >= 80) finalLevel = 'danger';
  else if (totalScore >= 50) finalLevel = 'warning';
  else if (totalScore >= 25) finalLevel = 'caution';

  return {
    presetId: id,
    level: finalLevel,
    score: totalScore,
    message: additionalDetails.length > 0 && totalScore > baseScore + 10
      ? `${baseMessage} + ${additionalDetails.length}개 보조신호`
      : baseMessage,
    detail: [baseDetail, ...additionalDetails].join(' | '),
    ...(totalScore >= 40 ? { triggeredAt: Date.now() } : {}),
  };
}

/** 로컬 고점 탐색 (삼산 패턴용) */
function findLocalPeaks(values: number[], window: number = 5): number[] {
  const peaks: number[] = [];
  for (let i = window; i < values.length - window; i++) {
    let isPeak = true;
    for (let j = 1; j <= window; j++) {
      if (values[i] <= values[i - j] || values[i] <= values[i + j]) {
        isPeak = false;
        break;
      }
    }
    if (isPeak) peaks.push(i);
  }
  return peaks;
}


// ============================================
// 5. 매물대 매도법 v4 (volumeZone)
// ============================================
// 세션 43 강화:
//   ① 거래량 가중치 적용 (Volume-Weighted Zone)
//   ② 하단 지지대 이탈 감지 강화
//   ③ 이전 저항대 → 지지대 전환 감지
//   ④ PPT: "주가가 하단 매물대의 지지를 깨고 하락할 때 매도"
// ============================================
function checkVolumeZone(
  candles: CandleData[],
  currentPrice: number
): SignalResult {
  const id = 'volumeZone';

  if (candles.length < 20) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: '매물대 분석에는 최소 20일 데이터가 필요합니다.' };
  }

  // ── [v4] 거래량 가중 가격 프로파일 ──
  const zoneCount = 12; // 구간 수 (v3: 10 → v4: 12)
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const rangeP = maxP - minP || 1;
  const zoneSize = rangeP / zoneCount;

  // 거래량 가중치 적용 (v4 핵심)
  const zones: number[] = Array(zoneCount).fill(0);
  candles.forEach(c => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const idx = Math.min(zoneCount - 1, Math.floor((typicalPrice - minP) / zoneSize));
    // 거래량이 있으면 가중치, 없으면 1
    const volumeWeight = (c as any).volume ? Math.log10(Math.max(1, (c as any).volume)) : 1;
    zones[idx] += volumeWeight;
  });

  const maxZone = Math.max(...zones);
  const avgZone = zones.reduce((a, b) => a + b, 0) / zoneCount;

  // 현재가가 위치한 구간
  const currentIdx = Math.min(zoneCount - 1, Math.floor((currentPrice - minP) / zoneSize));

  // ── 상단 저항대 분석 ──
  let resistanceStrength = 0;
  let resistancePrice = 0;
  for (let i = currentIdx + 1; i < zoneCount; i++) {
    if (zones[i] > avgZone * 1.5) {
      resistanceStrength++;
      if (zones[i] === Math.max(...zones.slice(currentIdx + 1))) {
        resistancePrice = minP + (i + 0.5) * zoneSize;
      }
    }
  }

  // ── [v4 강화] 하단 지지대 분석 ──
  let supportStrength = 0;
  let strongestSupportIdx = -1;
  let strongestSupportValue = 0;
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (zones[i] > avgZone * 1.3) {
      supportStrength++;
      if (zones[i] > strongestSupportValue) {
        strongestSupportValue = zones[i];
        strongestSupportIdx = i;
      }
    }
  }
  const strongSupportPrice = strongestSupportIdx >= 0
    ? minP + (strongestSupportIdx + 0.5) * zoneSize
    : 0;

  // ── [v4] 이전 저항대 → 지지대 전환 감지 ──
  // 과거에 저항이었던 곳이 현재가 아래에 있으면 지지대로 전환
  const halfIdx = Math.floor(candles.length / 2);
  const firstHalf = candles.slice(0, halfIdx);
  const firstHalfMax = Math.max(...firstHalf.map(c => c.high));
  const resistTurnedSupport = currentPrice > firstHalfMax && firstHalfMax > minP + zoneSize * 3;

  // ── 판정 ──
  const isInHighDensity = zones[currentIdx] > avgZone * 1.5;
  const isBelowSupport = strongSupportPrice > 0 && currentPrice < strongSupportPrice;

  // [v4] 하단 지지대 이탈 (PPT 핵심: "지지를 깨고 하락할 때 매도")
  if (isBelowSupport && supportStrength >= 2) {
    return {
      presetId: id, level: 'danger', score: 75,
      message: '하단 지지대 이탈!',
      detail: `강한 지지대(₩${Math.round(strongSupportPrice).toLocaleString()}) 아래로 하락했습니다. 추가 하락 가능성이 높습니다.`,
      triggeredAt: Date.now(),
    };
  }

  if (isBelowSupport) {
    return {
      presetId: id, level: 'warning', score: 60,
      message: '지지대 이탈 진행 중',
      detail: `지지대(₩${Math.round(strongSupportPrice).toLocaleString()}) 아래. 이탈 확인 시 매도하세요.`,
      triggeredAt: Date.now(),
    };
  }

  // 상단 매물대 진입 (저항)
  if (isInHighDensity && resistanceStrength > 0) {
    return {
      presetId: id, level: 'warning', score: 55,
      message: '상단 매물대 진입 — 저항 예상',
      detail: `현재가(₩${currentPrice.toLocaleString()})가 거래 밀집 구간에 진입. ${resistancePrice > 0 ? `강한 저항대: ₩${Math.round(resistancePrice).toLocaleString()}` : ''}`,
      triggeredAt: Date.now(),
    };
  }

  if (resistanceStrength > 2) {
    return {
      presetId: id, level: 'caution', score: 35,
      message: '상단 매물대 접근 중',
      detail: `현재가 위에 ${resistanceStrength}개의 강한 매물대. 돌파 실패 시 매도 고려.`,
    };
  }

  // [v4] 이전 저항 → 지지 전환 (긍정적)
  if (resistTurnedSupport && supportStrength > 0) {
    return {
      presetId: id, level: 'safe', score: 5,
      message: '이전 저항대 → 지지대 전환',
      detail: '과거 저항대가 현재가 아래에서 지지대로 작용 중. 안정적입니다.',
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: '주요 매물대 없음',
    detail: '현재가 주변에 강한 저항대가 감지되지 않았습니다.',
  };
}


// ============================================
// 6. 추세선 매도법 v4 (trendline)
// ============================================
// 세션 43 강화:
//   ① 다중 지지선: 최근 저점 기반 1차 지지 + 2번째 저점 기반 2차 지지
//   ② PPT 영상: "최근 지지선 두 번 깼으니까 매도"
//   ③ 채널 이탈 감지 (상단 저항 + 하단 지지)
//   ④ 수평 추세선 (횡보 구간) 감지
//   ⑤ 지지선 기울기 변화 (상승→횡보→하락)
// ============================================
function checkTrendline(
  candles: CandleData[],
  currentPrice: number
): SignalResult {
  const id = 'trendline';

  if (candles.length < 20) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: '' };
  }

  const lows = candles.map(c => c.low);
  const highs = candles.map(c => c.high);
  const n = lows.length;

  // ── 전체 추세선 (선형회귀) ──
  const calcLinReg = (values: number[]) => {
    const len = values.length;
    let sx = 0, sy = 0, sxy = 0, sx2 = 0;
    for (let i = 0; i < len; i++) { sx += i; sy += values[i]; sxy += i * values[i]; sx2 += i * i; }
    const slope = (len * sxy - sx * sy) / (len * sx2 - sx * sx);
    const intercept = (sy - slope * sx) / len;
    return { slope, intercept, getY: (i: number) => slope * i + intercept };
  };

  const fullTrend = calcLinReg(lows);
  const fullTrendValue = fullTrend.getY(n - 1);
  const isUptrend = fullTrend.slope > 0;

  // ── [v4 신규] 다중 지지선 ──
  // 1차 지지선: 최근 절반 데이터 기반
  const recentHalf = lows.slice(Math.floor(n / 2));
  const recentTrend = calcLinReg(recentHalf);
  const recentTrendValue = recentTrend.getY(recentHalf.length - 1);

  // 2차 지지선: 전체 데이터 기반 (위에서 계산한 fullTrend)
  // → 1차가 깨지면 2차까지 확인

  // ── [v4 신규] 수평 추세선 (횡보 구간) ──
  // PPT: "수평추세선을 그어보고, 하단을 뚫고 내려가면 매도"
  const isFlat = Math.abs(fullTrend.slope) < (fullTrendValue * 0.001); // 기울기 거의 0
  const flatMin = Math.min(...lows.slice(-10));
  const flatMax = Math.max(...highs.slice(-10));

  // ── [v4 신규] 채널 감지 ──
  const upperTrend = calcLinReg(highs);
  const upperValue = upperTrend.getY(n - 1);
  const channelWidth = upperValue - fullTrendValue;
  const isInChannel = channelWidth > 0 && fullTrend.slope > 0 && upperTrend.slope > 0;

  // ── [v4 신규] 지지선 기울기 변화 (상승→횡보→하락) ──
  let slopeChange = '';
  if (n >= 40) {
    const firstHalf = calcLinReg(lows.slice(0, Math.floor(n / 2)));
    const secondHalf = calcLinReg(lows.slice(Math.floor(n / 2)));
    if (firstHalf.slope > 0 && secondHalf.slope <= 0) {
      slopeChange = '기울기 전환: 상승→횡보/하락';
    } else if (firstHalf.slope > 0 && secondHalf.slope > 0 && secondHalf.slope < firstHalf.slope * 0.5) {
      slopeChange = '기울기 둔화: 상승 모멘텀 약화';
    }
  }

  // ── 지지선 이탈 횟수 체크 (PPT 핵심: "지지선 두 번 깼으면 매도") ──
  let support1Break = currentPrice < recentTrendValue;
  let support2Break = currentPrice < fullTrendValue;
  let breakCount = (support1Break ? 1 : 0) + (support2Break ? 1 : 0);

  // ── 판정 ──

  // 수평 횡보 구간에서 하단 이탈
  if (isFlat && currentPrice < flatMin) {
    return {
      presetId: id, level: 'danger', score: 80,
      message: '수평 추세선 하단 이탈!',
      detail: `횡보 구간 하단(₩${Math.round(flatMin).toLocaleString()}) 아래로 이탈. ${slopeChange ? `(${slopeChange})` : ''}`,
      triggeredAt: Date.now(),
    };
  }

  // 두 지지선 모두 이탈 (PPT: "최근 지지선 두 번 깼으니까 매도")
  if (breakCount >= 2) {
    return {
      presetId: id, level: 'danger', score: 85,
      message: '다중 지지선 이탈! 강력 매도',
      detail: `1차 지지(₩${Math.round(recentTrendValue).toLocaleString()}) + 2차 지지(₩${Math.round(fullTrendValue).toLocaleString()}) 모두 이탈`,
      triggeredAt: Date.now(),
    };
  }

  // 1차 지지선만 이탈
  if (support1Break && isUptrend) {
    return {
      presetId: id, level: 'warning', score: 65,
      message: '최근 지지선 이탈',
      detail: `1차 지지(₩${Math.round(recentTrendValue).toLocaleString()}) 이탈. 2차 지지(₩${Math.round(fullTrendValue).toLocaleString()}) 관찰 필요. ${slopeChange ? `(${slopeChange})` : ''}`,
      triggeredAt: Date.now(),
    };
  }

  // 하락 추세
  if (!isUptrend && !isFlat) {
    return {
      presetId: id, level: 'warning', score: 55,
      message: '하락 추세 진행 중',
      detail: `저점 연결선이 하락하고 있습니다. ${slopeChange ? `(${slopeChange})` : ''}`,
      triggeredAt: Date.now(),
    };
  }

  // 채널 하단 근접
  if (isInChannel) {
    const distToLower = ((currentPrice - fullTrendValue) / channelWidth) * 100;
    if (distToLower < 10) {
      return {
        presetId: id, level: 'caution', score: 40,
        message: `채널 하단 근접 (${distToLower.toFixed(0)}%)`,
        detail: `상승 채널 하단에 근접. 이탈 시 매도.`,
      };
    }
  }

  // 추세선 근접
  const deviationPct = ((currentPrice - fullTrendValue) / fullTrendValue) * 100;
  if (isUptrend && deviationPct < 2) {
    return {
      presetId: id, level: 'caution', score: 35,
      message: `추세선 근접 (+${deviationPct.toFixed(1)}%)`,
      detail: `상승 추세선에 매우 근접. 이탈 여부 주시. ${slopeChange ? `(${slopeChange})` : ''}`,
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: `추세선 위 안정적 (+${deviationPct.toFixed(1)}%)`,
    detail: `주가가 상승 추세선 위에서 유지되고 있습니다. ${slopeChange ? `(${slopeChange})` : ''}`,
  };
}


// ============================================
// 7. 기업가치 반전 매도법 (fundamental) — placeholder
// ============================================
function checkFundamental(): SignalResult {
  return {
    presetId: 'fundamental',
    level: 'inactive',
    score: 0,
    message: '수동 판정 필요',
    detail: '기업 실적/PER/PBR 데이터는 외부 연동이 필요합니다.',
  };
}


// ============================================
// 8. 경기순환 매도법 (cycle)
// ============================================
function checkCycle(cycleStage?: number): SignalResult {
  const id = 'cycle';
  if (cycleStage === undefined || cycleStage === null) {
    return { presetId: id, level: 'inactive', score: 0, message: '사이클 단계 미설정', detail: '코스톨라니 달걀 위젯에서 단계를 확인하세요.' };
  }
  if (cycleStage >= 3 && cycleStage <= 4) {
    return { presetId: id, level: 'danger', score: 75, message: `경기순환 ${cycleStage}단계 — 매도 구간`, detail: '포지션 축소를 강력히 권장합니다.', triggeredAt: Date.now() };
  }
  if (cycleStage === 5) {
    return { presetId: id, level: 'warning', score: 55, message: `경기순환 ${cycleStage}단계 — 관망`, detail: '', triggeredAt: Date.now() };
  }
  if (cycleStage === 2) {
    return { presetId: id, level: 'caution', score: 25, message: `경기순환 ${cycleStage}단계 — 관망/보유`, detail: '과열 신호를 주시하세요.' };
  }
  return { presetId: id, level: 'safe', score: 5, message: `경기순환 ${cycleStage}단계`, detail: '매도 시점이 아닙니다.' };
}


// ============================================
// 🔥 통합 계산 함수 v4
// ============================================
export function calculateAllSignals(input: SignalInput): PositionSignals {
  const { position, candles, currentPrice } = input;
  const selectedPresets = position.selectedPresets || [];
  const presetSettings = position.presetSettings || {};
  const signals: SignalResult[] = [];
  const returnPct = calcReturn(position.buyPrice, currentPrice);

  selectedPresets.forEach(presetId => {
    let result: SignalResult;
    switch (presetId) {
      case 'candle3':
        result = checkCandle3(candles, returnPct);
        break;
      case 'stopLoss': {
        const threshold = presetSettings.stopLoss?.value;
        result = checkStopLoss(position.buyPrice, currentPrice, candles, threshold);
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
        result = checkCycle(undefined);
        break;
      default:
        result = { presetId, level: 'inactive', score: 0, message: '알 수 없는 프리셋', detail: '' };
    }
    signals.push(result);
  });

  // "모든 매도는 음봉에서" 보정
  const todayCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const isYangbong = todayCandle ? todayCandle.close >= todayCandle.open : false;

  const adjustedSignals = isYangbong
    ? signals.map(s => ({
        ...s,
        score: (s.level === 'danger' || s.level === 'warning') && s.message.indexOf('갭하락') === -1
          ? Math.round(s.score * 0.7)
          : s.score,
      }))
    : signals;

  const maxLevel = adjustedSignals.reduce<SignalLevel>((max, s) => {
    return LEVEL_PRIORITY[s.level] > LEVEL_PRIORITY[max] ? s.level : max;
  }, 'safe');

  const activeCount = adjustedSignals.filter(s =>
    LEVEL_PRIORITY[s.level] >= LEVEL_PRIORITY['caution']
  ).length;

  const totalScore = adjustedSignals.reduce((sum, s) => sum + s.score, 0);

  return {
    positionId: position.id,
    signals: adjustedSignals,
    maxLevel,
    activeCount,
    totalScore,
  };
}

// ── 개별 함수 export ──
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
  calcEMA,
  calcMACD,
  calcATR,
  calcReturn,
  findLocalPeaks,
};
