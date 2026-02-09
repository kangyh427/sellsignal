// ============================================
// CREST 매도 시그널 계산 엔진 v3
// 경로: src/lib/sellSignals.ts
// 세션 41: PPT/자막 원본 기반 1~3번 매도법 대폭 강화
//   - 봉3개: 양봉 묶음 합산 덮기 + "음봉에서만 매도" 원칙
//   - 손실제한: ATR 기반 동적 손절 + 분산투자 안내
//   - 2/3 익절: 수익 구간별 맞춤 메시지 + 급변 대응 안내
//   - 공통: "모든 매도는 음봉에서" 원칙 적용
//   - MACD 계산 유틸리티 추가 (세션 42 준비)
// ============================================
//
// 사용법:
//   import { calculateAllSignals } from '@/lib/sellSignals';
//   const result = calculateAllSignals({ position, candles, currentPrice });
//
// 반환값: PositionSignals (positionId, signals[], maxLevel, activeCount, totalScore)
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

/** 지수 이동평균 (EMA) — MACD 계산용 */
function calcEMA(values: number[], period: number): number[] {
  const ema: number[] = [];
  const k = 2 / (period + 1);

  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      ema.push(values[0]);
    } else {
      ema.push(values[i] * k + ema[i - 1] * (1 - k));
    }
  }
  return ema;
}

/** MACD 계산 결과 타입 */
interface MACDResult {
  macdLine: number[];     // MACD 선 (EMA12 - EMA26)
  signalLine: number[];   // 시그널 선 (MACD의 EMA9)
  histogram: number[];    // 히스토그램 (MACD - Signal)
}

/** MACD 계산 (12, 26, 9) — 세션 42에서 본격 활용 */
function calcMACD(closes: number[]): MACDResult {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);

  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calcEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);

  return { macdLine, signalLine, histogram };
}

/**
 * ATR (Average True Range) — 종목별 변동폭 측정
 * PPT: "주가 1일 등락폭을 고려해요. 어떤 종목은 1~2% 왔다갔다, 어떤 종목은 3~5% 크게 움직여요"
 */
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

  // 최근 period일 평균
  const recentTR = trueRanges.slice(-period);
  return recentTR.reduce((a, b) => a + b, 0) / recentTR.length;
}

/** 수익률 계산 (%) */
function calcReturn(buyPrice: number, currentPrice: number): number {
  if (buyPrice <= 0) return 0;
  return ((currentPrice - buyPrice) / buyPrice) * 100;
}

/** 오늘이 음봉인지 확인 (PPT: "모든 매도는 음봉에서 하세요") */
function isBearishCandle(candle: CandleData): boolean {
  return candle.close < candle.open;
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
// 1. 봉 3개 매도법 v3 (candle3)
// ============================================
// PPT 원본 기반 개선:
//   - 양봉 2~3개 묶음 합산 → 50%/100% 덮기 판정
//   - "모든 매도는 음봉에서" 원칙 적용
//   - 갭하락(시초가 < 전일 저가) 감지 강화
//   - 수익 구간 인식 → 초기(~5%)에서만 주력 적용
// ============================================
function checkCandle3(
  candles: CandleData[],
  returnPct?: number  // 현재 수익률 (구간별 메시지용)
): SignalResult {
  const id = 'candle3';
  if (candles.length < 3) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: '최소 3일 이상의 데이터가 필요합니다.' };
  }

  const today = candles[candles.length - 1];
  const yesterday = candles[candles.length - 2];
  const todayIsBearish = isBearishCandle(today);

  // ── 갭하락 체크 (가장 강력한 매도 신호) ──
  // PPT: "갭하락 음봉이 나와도 전량 매도"
  if (today.open < yesterday.low) {
    return {
      presetId: id, level: 'danger', score: 95,
      message: '갭하락 발생! 전량 매도 고려',
      detail: `금일 시가(${today.open.toLocaleString()})가 전일 저가(${yesterday.low.toLocaleString()}) 아래에서 시작했습니다. 갭하락은 강한 하락 신호입니다.`,
      triggeredAt: Date.now(),
    };
  }

  // ── 3일 연속 하락봉 체크 ──
  const last3 = candles.slice(-3);
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

  // ── 양봉 묶음 합산 덮기 체크 (PPT 핵심 로직) ──
  // "양봉이 두 개라면 두 개를 하나로 묶어서 50% 뚫고 내려가는 음봉이 발생하면 매도"
  const recent = candles.slice(-5);

  // 최근 연속 양봉 묶음 찾기 (최대 3개까지)
  let bullGroupStart = -1;
  let bullGroupEnd = -1;
  for (let i = recent.length - 2; i >= 0; i--) {
    if (recent[i].close > recent[i].open) {
      // 양봉 발견
      if (bullGroupEnd === -1) bullGroupEnd = i;
      bullGroupStart = i;
    } else if (bullGroupEnd !== -1) {
      break; // 양봉 묶음 끝
    }
  }

  if (bullGroupStart >= 0 && bullGroupEnd >= bullGroupStart && todayIsBearish) {
    // 양봉 묶음의 합산 몸통 계산
    const groupOpen = recent[bullGroupStart].open;   // 첫 양봉의 시가
    const groupClose = recent[bullGroupEnd].close;    // 마지막 양봉의 종가
    const groupBody = groupClose - groupOpen;

    if (groupBody > 0) {
      const todayDrop = groupClose - today.close;
      const coverRatio = todayDrop / groupBody;

      // 100% 이상 덮기 → 전량 매도
      if (coverRatio >= 1.0) {
        const bullCount = bullGroupEnd - bullGroupStart + 1;
        return {
          presetId: id, level: 'danger', score: 85,
          message: `양봉 ${bullCount}개 100% 덮는 음봉! 전량 매도`,
          detail: `최근 ${bullCount}개 양봉(${groupOpen.toLocaleString()}→${groupClose.toLocaleString()})을 완전히 덮는 음봉이 발생했습니다.`,
          triggeredAt: Date.now(),
        };
      }

      // 50% 이상 덮기 → 절반 매도
      if (coverRatio >= 0.5) {
        const bullCount = bullGroupEnd - bullGroupStart + 1;
        return {
          presetId: id, level: 'warning', score: 65,
          message: `양봉 ${bullCount}개 ${(coverRatio * 100).toFixed(0)}% 덮는 음봉 — 절반 매도`,
          detail: `최근 ${bullCount}개 양봉의 ${(coverRatio * 100).toFixed(0)}%를 덮는 음봉이 발생했습니다. 절반 매도를 고려하세요.`,
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

  // ── 오늘이 양봉이면 안전 (PPT: "상승의 시작은 양봉에서") ──
  if (!todayIsBearish) {
    return {
      presetId: id, level: 'safe', score: 0,
      message: '양봉 유지 — 상승 기운',
      detail: '오늘 양봉으로 마감하여 상승 흐름이 유지되고 있습니다.',
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: '정상 — 특이 패턴 없음',
    detail: '최근 봉 패턴에서 매도 신호가 감지되지 않았습니다.',
  };
}


// ============================================
// 2. 손실제한 매도법 v3 (stopLoss)
// ============================================
// PPT 원본 기반 개선:
//   - ATR 기반 동적 손절 기준 (변동폭 고려)
//   - "작게 움직이면 -3~4%, 크게 움직이면 -4~5%"
//   - 분산투자 안내 메시지 (PPT: "최소 5~20종목 분산투자 시 효과적")
//   - "주가의 앞날은 모른다" — 감정 배제 강조
// ============================================
function checkStopLoss(
  buyPrice: number,
  currentPrice: number,
  candles: CandleData[],
  userThreshold?: number  // 사용자 직접 설정값 (있으면 우선)
): SignalResult {
  const id = 'stopLoss';
  if (buyPrice <= 0 || currentPrice <= 0) {
    return { presetId: id, level: 'inactive', score: 0, message: '가격 데이터 없음', detail: '' };
  }

  // ── ATR 기반 동적 손절 기준 계산 ──
  let threshold: number;
  let thresholdSource: string;

  if (userThreshold !== undefined && userThreshold !== null) {
    // 사용자가 직접 설정한 경우 (우선)
    threshold = userThreshold;
    thresholdSource = '사용자 설정';
  } else if (candles.length >= 15) {
    // ATR 기반 자동 계산
    const atr = calcATR(candles, 14);
    const atrPct = (atr / buyPrice) * 100;

    // PPT: "작게 움직이면 -3~4%, 크게 움직이면 -4~5%"
    if (atrPct < 2) {
      threshold = -3;       // 저변동 종목
    } else if (atrPct < 4) {
      threshold = -4;       // 중변동 종목
    } else {
      threshold = -5;       // 고변동 종목
    }
    thresholdSource = `ATR 기반 (일변동 ${atrPct.toFixed(1)}%)`;
  } else {
    threshold = -5;         // 기본값
    thresholdSource = '기본값';
  }

  const returnPct = calcReturn(buyPrice, currentPrice);

  // ── 손절 기준 도달 (danger) ──
  if (returnPct <= threshold) {
    return {
      presetId: id, level: 'danger', score: 95,
      message: `손절 기준 도달! (${returnPct.toFixed(1)}%)`,
      detail: `매수가 ${buyPrice.toLocaleString()}원 대비 ${returnPct.toFixed(1)}% 하락. 손절 기준(${threshold}%, ${thresholdSource})을 초과했습니다.\n⚡ 감정을 배제하고 기계적으로 손절하세요. 주가의 앞날은 모릅니다.`,
      triggeredAt: Date.now(),
    };
  }

  // ── 손절 근접 (warning) — threshold +2%p 이내 ──
  if (returnPct <= threshold + 2) {
    return {
      presetId: id, level: 'warning', score: 70,
      message: `손절 기준 근접 (${returnPct.toFixed(1)}%)`,
      detail: `손절 기준(${threshold}%)까지 ${(returnPct - threshold).toFixed(1)}%p 남았습니다. 조건 자동 매도를 설정해 두세요.`,
      triggeredAt: Date.now(),
    };
  }

  // ── 소폭 손실 (caution) ──
  if (returnPct < 0) {
    return {
      presetId: id, level: 'caution', score: 25,
      message: `소폭 손실 중 (${returnPct.toFixed(1)}%)`,
      detail: `현재 ${returnPct.toFixed(1)}% 손실 중입니다. 손절 기준: ${threshold}% (${thresholdSource})`,
    };
  }

  // ── 수익 중 (safe) ──
  return {
    presetId: id, level: 'safe', score: 0,
    message: returnPct > 0 ? `수익 중 (+${returnPct.toFixed(1)}%)` : '손익분기점',
    detail: `현재 수익 구간이므로 손절 기준에 해당하지 않습니다. 기준: ${threshold}% (${thresholdSource})`,
  };
}


// ============================================
// 3. 2/3 익절 매도법 v3 (twoThird)
// ============================================
// PPT 원본 기반 개선:
//   - 수익 구간별 맞춤 메시지 (5% vs 50% 구간 차이)
//   - "수익이 커질수록 적용하기 쉬워요" 반영
//   - "작은 수익 구간에서는 대응이 급하게 흘러갈 수 있음" 경고
//   - "손실 이전에 작은 수익이라도 누적하는 습관" 강조
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

  // ── 수익 구간 판별 (메시지 차별화용) ──
  const profitTier = maxReturnPct >= 20 ? 'large' : maxReturnPct >= 10 ? 'medium' : 'small';

  // ── 1/3 하락 도달: 매도! (danger) ──
  if (lossRatio >= 1 / 3) {
    // 수익 구간별 맞춤 메시지
    let tierAdvice: string;
    if (profitTier === 'small') {
      // PPT: "5% 정도 작은 수익에서 1/3은 사실 얼마 안되죠, 1~2% 왔다갔다"
      tierAdvice = `작은 수익 구간(최고 +${maxReturnPct.toFixed(1)}%)에서는 대응이 급하게 흘러갈 수 있습니다. 빠른 판단이 필요합니다.`;
    } else if (profitTier === 'medium') {
      tierAdvice = `중간 수익 구간(최고 +${maxReturnPct.toFixed(1)}%)입니다. 남은 수익을 확보하고 눌림목 이후 재진입도 고려하세요.`;
    } else {
      // PPT: "50% 정도 수익구간이면 1/3 갭이 굉장히 커질 수 있죠"
      tierAdvice = `큰 수익 구간(최고 +${maxReturnPct.toFixed(1)}%)입니다. 충분한 수익을 확보할 수 있으니 침착하게 익절하세요.`;
    }

    return {
      presetId: id, level: 'danger', score: 90,
      message: `수익 1/3 하락! 2/3 익절 매도`,
      detail: `최고 수익률 +${maxReturnPct.toFixed(1)}% → 현재 +${currentReturnPct.toFixed(1)}%. 수익의 ${(lossRatio * 100).toFixed(0)}%가 감소했습니다.\n${tierAdvice}`,
      triggeredAt: Date.now(),
    };
  }

  // ── 1/4 하락: 매도 준비 (warning) ──
  if (lossRatio >= 1 / 4) {
    const remainingToTrigger = ((1/3 - lossRatio) * maxProfit).toFixed(0);
    return {
      presetId: id, level: 'warning', score: 60,
      message: `수익 1/4 하락 — 매도 준비`,
      detail: `최고 수익 대비 ${(lossRatio * 100).toFixed(0)}% 감소. 1/3 하락 기준까지 약 ${remainingToTrigger}원 남았습니다. 조건 자동 매도 설정을 권장합니다.`,
      triggeredAt: Date.now(),
    };
  }

  // ── 1/5 하락: 주의 (caution) ──
  if (lossRatio >= 1 / 5) {
    return {
      presetId: id, level: 'caution', score: 30,
      message: `수익 줄어드는 중 (${(lossRatio * 100).toFixed(0)}% 감소)`,
      detail: `최고점에서 수익이 줄어들고 있습니다. 눌림목 조정인지 추세 전환인지 관찰하세요.`,
    };
  }

  // ── 안전 ──
  return {
    presetId: id, level: 'safe', score: 5,
    message: `수익 유지 중 (+${currentReturnPct.toFixed(1)}%)`,
    detail: `최고가 근처에서 수익을 유지하고 있습니다.${profitTier === 'small' ? ' 작은 수익 구간이므로 봉 3개 매도법과 함께 관찰하세요.' : ''}`,
  };
}


// ============================================
// 4. 이동평균선 매도법 (maSignal) — 기존 + MACD 인프라
// ============================================
// 그랜빌 법칙 기반 4가지 매도 신호 (기존 유지)
// + MACD 데드크로스 감지 추가 (세션 42에서 본격 활용)
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

  // MA 추세 판단
  const maTrend = maToday - ma3DaysAgo;
  const isMARising = maTrend > 0;
  const isMATurning = isMARising && (maToday - maYesterday) < (maYesterday - ma3DaysAgo) * 0.3;

  const priceBelowMA = priceToday < maToday;
  const priceAboveMA = priceToday > maToday;
  const yesterdayAboveMA = priceYesterday >= maYesterday;

  const deviation = ((priceToday - maToday) / maToday) * 100;

  // ── MACD 보조 판단 (세션 42에서 본격 활용) ──
  let macdNote = '';
  if (candles.length >= 35) {
    const macd = calcMACD(closes);
    const macdToday = macd.macdLine[macd.macdLine.length - 1];
    const macdYesterday = macd.macdLine[macd.macdLine.length - 2];
    const sigToday = macd.signalLine[macd.signalLine.length - 1];
    const sigYesterday = macd.signalLine[macd.signalLine.length - 2];

    // 데드크로스 감지
    if (macdYesterday >= sigYesterday && macdToday < sigToday) {
      macdNote = ' [MACD 데드크로스 동시 발생!]';
    }
    // 0선 하향돌파 감지
    else if (macdYesterday >= 0 && macdToday < 0) {
      macdNote = ' [MACD 0선 하향돌파!]';
    }
  }

  // ── 매도신호 1: MA 상승→전환 + 하향돌파 ──
  if ((isMATurning || !isMARising) && priceBelowMA && yesterdayAboveMA) {
    return {
      presetId: id, level: 'danger', score: 85,
      message: `${period}일선 하향 돌파! 강력 매도`,
      detail: `이동평균선이 횡보/하락 전환하는 구간에서 주가가 ${period}일선을 하향 돌파했습니다. (이격도: ${deviation.toFixed(1)}%)${macdNote}`,
      triggeredAt: Date.now(),
    };
  }

  // ── 매도신호 3: MA 하락 중 돌파 실패 ──
  if (!isMARising && priceBelowMA && !yesterdayAboveMA) {
    return {
      presetId: id, level: 'warning', score: 65,
      message: `${period}일선 저항 작용 중`,
      detail: `이동평균선이 하락 중이며, 주가가 ${period}일선 위로 올라가지 못하고 있습니다.${macdNote}`,
      triggeredAt: Date.now(),
    };
  }

  // ── 매도신호 2: MA 하락 중 일시적 상향돌파 ──
  if (!isMARising && priceAboveMA) {
    return {
      presetId: id, level: 'warning', score: 55,
      message: `하락 추세 중 기술적 반등`,
      detail: `${period}일선이 하락 중인데 주가가 일시적으로 위로 올라왔습니다. 매수 자제, 매도 관점으로 접근하세요.${macdNote}`,
      triggeredAt: Date.now(),
    };
  }

  // ── 매도신호 4: 과도 이격 ──
  if (isMARising && deviation > 10) {
    return {
      presetId: id, level: 'caution', score: 40,
      message: `이격도 과대 (${deviation.toFixed(1)}%)`,
      detail: `주가가 ${period}일선보다 ${deviation.toFixed(1)}% 위에 있습니다. 과도한 이격은 조정의 신호일 수 있습니다.${macdNote}`,
    };
  }

  // ── 안정적 상승 ──
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
    detail: `주가가 이동평균선 근처에 위치합니다. 돌파/이탈 방향을 주시하세요.${macdNote}`,
  };
}


// ============================================
// 5. 매물대 매도법 (volumeZone) — 기존 유지
// ============================================
function checkVolumeZone(
  candles: CandleData[],
  currentPrice: number
): SignalResult {
  const id = 'volumeZone';

  if (candles.length < 20) {
    return { presetId: id, level: 'inactive', score: 0, message: '데이터 부족', detail: '매물대 분석에는 최소 20일 데이터가 필요합니다.' };
  }

  const prices = candles.map(c => (c.high + c.low + c.close) / 3);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;

  if (range <= 0) {
    return { presetId: id, level: 'inactive', score: 0, message: '가격 변동 없음', detail: '' };
  }

  const ZONES = 10;
  const zoneSize = range / ZONES;
  const zoneCount = new Array(ZONES).fill(0);

  prices.forEach(p => {
    const idx = Math.min(Math.floor((p - minPrice) / zoneSize), ZONES - 1);
    zoneCount[idx]++;
  });

  const currentZoneIdx = Math.min(Math.floor((currentPrice - minPrice) / zoneSize), ZONES - 1);
  const avgCount = candles.length / ZONES;

  // 현재가 위 저항대 체크
  let resistanceStrength = 0;
  for (let i = currentZoneIdx + 1; i < Math.min(currentZoneIdx + 3, ZONES); i++) {
    if (zoneCount[i] > avgCount * 1.5) {
      resistanceStrength += zoneCount[i] / avgCount;
    }
  }

  // 현재가 아래 지지대 이탈 체크 (PPT 추가: "하단 매물대 지지를 깨고 하락할 때 매도")
  let supportStrength = 0;
  for (let i = currentZoneIdx - 1; i >= Math.max(currentZoneIdx - 2, 0); i--) {
    if (zoneCount[i] > avgCount * 1.5) {
      supportStrength += zoneCount[i] / avgCount;
    }
  }

  const inHighDensity = zoneCount[currentZoneIdx] > avgCount * 1.5;

  // 상단 매물대 저항
  if (inHighDensity && resistanceStrength > 0) {
    return {
      presetId: id, level: 'warning', score: 60,
      message: '상단 매물대 진입 — 저항 예상',
      detail: `현재가(${currentPrice.toLocaleString()}원)가 거래 밀집 구간에 진입했습니다. 매물 소화에 어려움이 예상됩니다.`,
      triggeredAt: Date.now(),
    };
  }

  // 하단 지지대 이탈 (새 로직)
  if (currentZoneIdx > 0 && supportStrength > 2 && zoneCount[currentZoneIdx] < avgCount) {
    return {
      presetId: id, level: 'warning', score: 55,
      message: '하단 매물대 이탈 가능성',
      detail: `현재가 아래 강한 지지대가 있었으나, 현재 가격이 지지대 밖으로 나가고 있습니다. 이탈 확인 시 매도하세요.`,
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
// 6. 추세선 매도법 (trendline) — 기존 유지
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
  const n = lows.length;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += lows[i]; sumXY += i * lows[i]; sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trendValue = slope * (n - 1) + intercept;
  const isUptrend = slope > 0;

  if (!isUptrend) {
    return {
      presetId: id, level: 'warning', score: 55,
      message: '하락 추세 진행 중',
      detail: `저점 연결 추세선이 하락하고 있습니다. 하락 추세에서의 보유는 위험합니다.`,
      triggeredAt: Date.now(),
    };
  }

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
// 7. 기업가치 반전 매도법 (fundamental) — placeholder 유지
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
// 8. 경기순환 매도법 (cycle)
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

  if (cycleStage >= 3 && cycleStage <= 4) {
    return {
      presetId: id, level: 'danger', score: 75,
      message: `경기순환 ${cycleStage}단계 — 매도 구간`,
      detail: `코스톨라니 달걀 모형 기준 ${cycleStage}단계(과열/조정)입니다. 포지션 축소를 강력히 권장합니다.`,
      triggeredAt: Date.now(),
    };
  }

  if (cycleStage === 5) {
    return {
      presetId: id, level: 'warning', score: 55,
      message: `경기순환 ${cycleStage}단계 — 관망 구간`,
      detail: `코스톨라니 달걀 모형 기준 ${cycleStage}단계(동행 하락)입니다.`,
      triggeredAt: Date.now(),
    };
  }

  if (cycleStage === 2) {
    return {
      presetId: id, level: 'caution', score: 25,
      message: `경기순환 ${cycleStage}단계 — 관망/보유`,
      detail: '경기 확장 동행 구간입니다. 보유 유지하되 과열 신호를 주시하세요.',
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: `경기순환 ${cycleStage}단계 — 매수/보유 구간`,
    detail: '현재 시장 사이클 상 매도 시점이 아닙니다.',
  };
}


// ============================================
// 🔥 통합 계산 함수 v3
// ============================================
// 변경점:
//   - checkStopLoss에 candles 전달 (ATR 계산용)
//   - checkCandle3에 수익률 전달 (구간별 메시지용)
//   - "음봉에서만 매도" 총점 보정 (양봉이면 총점 30% 감소)
// ============================================
export function calculateAllSignals(input: SignalInput): PositionSignals {
  const { position, candles, currentPrice } = input;

  const selectedPresets = position.selectedPresets || [];
  const presetSettings = position.presetSettings || {};

  const signals: SignalResult[] = [];
  const returnPct = calcReturn(position.buyPrice, currentPrice);

  // 사용자가 선택한 프리셋에 대해서만 계산
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
        result = checkCycle(undefined); // 추후 cycleStage 연동
        break;

      default:
        result = { presetId, level: 'inactive', score: 0, message: '알 수 없는 프리셋', detail: '' };
    }

    signals.push(result);
  });

  // ── "모든 매도는 음봉에서" 보정 ──
  // PPT: 양봉이면 상승 기운 → 매도 긴급도 하향
  const todayCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const isToday양봉 = todayCandle ? todayCandle.close >= todayCandle.open : false;

  const adjustedSignals = isToday양봉
    ? signals.map(s => ({
        ...s,
        // 양봉일 때 danger/warning 점수 30% 감소 (갭하락 제외)
        score: (s.level === 'danger' || s.level === 'warning') && s.message.indexOf('갭하락') === -1
          ? Math.round(s.score * 0.7)
          : s.score,
      }))
    : signals;

  // 최고 위험 수준 판정
  const maxLevel = adjustedSignals.reduce<SignalLevel>((max, s) => {
    return LEVEL_PRIORITY[s.level] > LEVEL_PRIORITY[max] ? s.level : max;
  }, 'safe');

  // 활성 시그널 수 (caution 이상)
  const activeCount = adjustedSignals.filter(s =>
    LEVEL_PRIORITY[s.level] >= LEVEL_PRIORITY['caution']
  ).length;

  // 합산 점수
  const totalScore = adjustedSignals.reduce((sum, s) => sum + s.score, 0);

  return {
    positionId: position.id,
    signals: adjustedSignals,
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
  calcEMA,
  calcMACD,
  calcATR,
  calcReturn,
};
