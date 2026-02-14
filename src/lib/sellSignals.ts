// ============================================
// CREST 매도 시그널 계산 엔진 v6.0
// 경로: src/lib/sellSignals.ts
// 세션 61: PPT 「매도의 기술」 완전 재구현
//
// [변경 이력]
// v3 (세션 41): 1~3번 매도법 강화
// v4 (세션 43): 4~6번 매도법 PPT 기반 강화
// v5 (세션 44): 7번 기업가치 + 8번 경기순환 본격 구현
// v5.1 (세션 53): PPT 대조 기반 수정
// v6.0 (세션 61): 전면 재작성 — PPT 로직 100% 반영
//
// [PPT 매도의 기술 — 수익 단계별 매도법 적용]
// ● 초기 단계(0~5%): 봉3개, 손실제한
// ● 5% 수익구간: 봉3개, 손실제한, 2/3익절, 이동평균선, 매물대
// ● 10% 이상: 2/3익절, 이동평균선, 매물대, 기업가치, 추세선, 경기순환
// ● 핵심 원칙: "모든 매도는 음봉에서"
// ============================================

import type {
  Position, CandleData, SignalLevel, SignalResult, PositionSignals,
  FundamentalData, CycleData
} from '@/types';

// ══════════════════════════════════════════════
// 공통 유틸리티 함수
// ══════════════════════════════════════════════

/** 시그널 레벨 우선순위 (높을수록 위험) */
const LEVEL_PRIORITY: Record<SignalLevel, number> = {
  inactive: 0,
  safe: 1,
  caution: 2,
  warning: 3,
  danger: 4,
};

/** 수익률 계산 (%) */
function calcReturn(buyPrice: number, currentPrice: number): number {
  if (buyPrice <= 0) return 0;
  return ((currentPrice - buyPrice) / buyPrice) * 100;
}

/** 단순이동평균 (SMA) 계산 */
function calcMA(candles: CandleData[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += candles[j].close;
      }
      result.push(sum / period);
    }
  }
  return result;
}

/** 지수이동평균 (EMA) 계산 */
function calcEMA(candles: CandleData[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);
  let prev = NaN;

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      // 첫 EMA = 기간 내 SMA
      let sum = 0;
      for (let j = 0; j < period; j++) sum += candles[j].close;
      prev = sum / period;
      result.push(prev);
    } else {
      prev = candles[i].close * k + prev * (1 - k);
      result.push(prev);
    }
  }
  return result;
}

/** MACD 계산 (12, 26, 9) */
function calcMACD(candles: CandleData[]): {
  macd: number[];
  signal: number[];
  histogram: number[];
} {
  const ema12 = calcEMA(candles, 12);
  const ema26 = calcEMA(candles, 26);

  // MACD 라인 = EMA12 - EMA26
  const macdLine: number[] = ema12.map((v, i) =>
    isNaN(v) || isNaN(ema26[i]) ? NaN : v - ema26[i]
  );

  // Signal 라인 = MACD의 EMA9
  const validMacd = macdLine.filter(v => !isNaN(v));
  const signalK = 2 / 10;
  const signalLine: number[] = [];
  let prevSignal = NaN;

  let validCount = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i])) {
      signalLine.push(NaN);
    } else {
      validCount++;
      if (validCount < 9) {
        signalLine.push(NaN);
      } else if (validCount === 9) {
        // 첫 Signal = 첫 9개 MACD의 평균
        const firstNine = macdLine.filter(v => !isNaN(v)).slice(0, 9);
        prevSignal = firstNine.reduce((s, v) => s + v, 0) / 9;
        signalLine.push(prevSignal);
      } else {
        prevSignal = macdLine[i] * signalK + prevSignal * (1 - signalK);
        signalLine.push(prevSignal);
      }
    }
  }

  // Histogram = MACD - Signal
  const histogram = macdLine.map((v, i) =>
    isNaN(v) || isNaN(signalLine[i]) ? NaN : v - signalLine[i]
  );

  return { macd: macdLine, signal: signalLine, histogram };
}

/** ATR (Average True Range) 계산 */
function calcATR(candles: CandleData[], period: number = 14): number {
  if (candles.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    trs.push(tr);
  }
  const slice = trs.slice(-period);
  return slice.reduce((s, v) => s + v, 0) / slice.length;
}

/** 로컬 고점 찾기 (추세선용) */
function findLocalPeaks(candles: CandleData[], windowSize: number = 5): number[] {
  const peaks: number[] = [];
  for (let i = windowSize; i < candles.length - windowSize; i++) {
    let isPeak = true;
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && candles[j].high >= candles[i].high) {
        isPeak = false;
        break;
      }
    }
    if (isPeak) peaks.push(i);
  }
  return peaks;
}

// ══════════════════════════════════════════════
// 시그널 계산 입력 인터페이스
// ══════════════════════════════════════════════

export interface SignalInput {
  position: Position;
  candles: CandleData[];
  currentPrice: number;
  fundamentalData?: FundamentalData;
  cycleData?: CycleData;
}


// ══════════════════════════════════════════════
// 1번 매도법: 봉 3개 매도법 (candle3)
// ══════════════════════════════════════════════
// PPT 원리:
//   ① 최근 양봉의 50% 이상 덮는 음봉 → 절반 매도
//   ② 최근 양봉을 100% 덮는 음봉 → 전량 매도
//   ③ 갭하락 발생 시 → 전량 매도 (음봉·양봉 무관)
//   ④ 연속 양봉은 합쳐서 하나의 양봉으로 가정
// 적용: 초기 ~ 5% 수익구간 (10% 이상에서는 불필요)
// ══════════════════════════════════════════════

function checkCandle3(candles: CandleData[], returnPct: number): SignalResult {
  const id = 'candle3';

  if (!candles || candles.length < 3) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: '데이터 부족 (최소 3일 필요)',
      detail: '봉 3개 매도법 판정을 위해 최소 3일 캔들 데이터가 필요합니다.',
    };
  }

  const len = candles.length;
  const today = candles[len - 1];
  const yesterday = candles[len - 2];

  // ── ③ 갭하락 감지 (최우선) ──
  // 오늘 시가가 전일 종가보다 낮게 시작 (갭다운)
  const gapDown = today.open < yesterday.close;
  const gapSize = gapDown
    ? ((yesterday.close - today.open) / yesterday.close) * 100
    : 0;

  if (gapDown && gapSize >= 1.5) {
    // PPT: "첫 갭하락 발생시 전량 매도 — 음봉·양봉 상관없음"
    return {
      presetId: id, level: 'danger', score: 90,
      message: `갭하락 ${gapSize.toFixed(1)}% — 전량 매도 권장`,
      detail: `전일 종가 ${yesterday.close.toLocaleString()}원 → 오늘 시가 ${today.open.toLocaleString()}원 (갭 -${gapSize.toFixed(1)}%)`,
      triggeredAt: Date.now(),
    };
  }

  // ── 오늘이 음봉인지 확인 ──
  const todayIsUmbong = today.close < today.open;
  if (!todayIsUmbong) {
    // 양봉이면 봉3개 매도법 해당 없음 → safe
    return {
      presetId: id, level: 'safe', score: 0,
      message: '양봉 진행 중 — 매도 신호 없음',
      detail: '봉3개 매도법: 음봉 발생 시 판정합니다.',
    };
  }

  // ── ④ 연속 양봉 합산 (최근 양봉 구간 찾기) ──
  // 오늘 이전의 캔들에서 연속 양봉을 합쳐서 하나로 봄
  let mergedOpen = 0;  // 합산 양봉의 시가 (가장 처음 양봉의 open)
  let mergedClose = 0; // 합산 양봉의 종가 (가장 마지막 양봉의 close)
  let yangbongCount = 0;

  for (let i = len - 2; i >= Math.max(0, len - 6); i--) {
    const c = candles[i];
    if (c.close >= c.open) {
      // 양봉
      mergedClose = mergedClose || c.close; // 마지막 양봉의 종가
      mergedOpen = c.open; // 갱신: 더 이전 양봉의 시가
      yangbongCount++;
    } else {
      break; // 음봉 만나면 중단
    }
  }

  if (yangbongCount === 0) {
    // 이전에 양봉이 없으면 판정 불가
    return {
      presetId: id, level: 'safe', score: 5,
      message: '음봉 발생 (기준 양봉 없음)',
      detail: '연속 양봉 기준이 없어 봉3개 판정 불가. 다른 매도법 참고.',
    };
  }

  // ── 합산 양봉 대비 오늘 음봉의 침투율 계산 ──
  const yangbongBody = mergedClose - mergedOpen; // 합산 양봉 몸통 크기
  if (yangbongBody <= 0) {
    return {
      presetId: id, level: 'safe', score: 0,
      message: '양봉 몸통 없음',
      detail: '합산 양봉의 몸통이 0 이하입니다.',
    };
  }

  // 음봉이 양봉 몸통을 얼마나 침투했는지
  // 음봉의 시가(위)에서 종가(아래)까지가 양봉 영역을 얼마나 덮는지
  const umbongTop = today.open;  // 음봉 시가 (위)
  const umbongBottom = today.close; // 음봉 종가 (아래)

  // 양봉 영역 내에서 겹치는 부분 계산
  const overlapTop = Math.min(umbongTop, mergedClose);
  const overlapBottom = Math.max(umbongBottom, mergedOpen);
  const overlapSize = Math.max(0, overlapTop - overlapBottom);
  const coveragePct = (overlapSize / yangbongBody) * 100;

  // ── ② 100% 이상 커버 → 전량 매도 ──
  if (coveragePct >= 100) {
    return {
      presetId: id, level: 'danger', score: 85,
      message: `양봉 완전 잠식 (${coveragePct.toFixed(0)}%) — 전량 매도 권장`,
      detail: `연속 양봉 ${yangbongCount}개 합산 몸통을 음봉이 100% 이상 덮음`,
      triggeredAt: Date.now(),
    };
  }

  // ── ① 50% 이상 커버 → 절반 매도 ──
  if (coveragePct >= 50) {
    return {
      presetId: id, level: 'warning', score: 60,
      message: `양봉 ${coveragePct.toFixed(0)}% 잠식 — 절반 매도 고려`,
      detail: `연속 양봉 ${yangbongCount}개 합산 대비 ${coveragePct.toFixed(0)}% 하락 침투`,
      triggeredAt: Date.now(),
    };
  }

  // ── 50% 미만 → 주의 관찰 ──
  if (coveragePct >= 30) {
    return {
      presetId: id, level: 'caution', score: 25,
      message: `음봉 침투 ${coveragePct.toFixed(0)}% — 관찰 필요`,
      detail: `50% 미만이지만 하락 압력 존재. 내일 추가 음봉 시 매도 고려.`,
    };
  }

  return {
    presetId: id, level: 'safe', score: 5,
    message: `소폭 음봉 (침투 ${coveragePct.toFixed(0)}%)`,
    detail: '양봉 몸통 대비 음봉 침투율 낮음. 정상 조정 범위.',
  };
}


// ══════════════════════════════════════════════
// 2번 매도법: 손실제한 매도법 (stopLoss)
// ══════════════════════════════════════════════
// PPT 원리:
//   매수가 대비 -3% ~ -5% 에서 기계적 손절
//   종목의 1일 등락폭 고려:
//     - 변동성 작은 종목: -3%
//     - 변동성 큰 종목: -5%
//   ★ 핵심: "주가의 앞날은 모른다 → 기계적으로 손실 제한"
// 적용: 초기 ~ 5% 수익구간
// ══════════════════════════════════════════════

function checkStopLoss(
  buyPrice: number,
  currentPrice: number,
  candles: CandleData[],
  threshold?: number // 사용자 설정 손절% (음수, 예: -5)
): SignalResult {
  const id = 'stopLoss';

  // 사용자 설정 손절% 또는 기본 -5%
  const stopPct = threshold || -5;
  const stopPrice = Math.round(buyPrice * (1 + stopPct / 100));
  const currentReturn = calcReturn(buyPrice, currentPrice);

  // ── ATR 기반 변동성 참고 (보조 지표) ──
  let volatilityNote = '';
  if (candles.length >= 15) {
    const atr = calcATR(candles, 14);
    const atrPct = (atr / currentPrice) * 100;
    if (atrPct > 3) {
      volatilityNote = ` (고변동 종목: ATR ${atrPct.toFixed(1)}%)`;
    }
  }

  // ── 손절가 도달 판정 ──
  if (currentPrice <= stopPrice) {
    return {
      presetId: id, level: 'danger', score: 95,
      message: `손절가 도달! ${currentReturn.toFixed(1)}% 손실`,
      detail: `매수가 ${buyPrice.toLocaleString()}원 → 손절가 ${stopPrice.toLocaleString()}원 (${stopPct}%) 이하${volatilityNote}`,
      triggeredAt: Date.now(),
    };
  }

  // ── 손절가 근접 (1% 이내) ──
  const distancePct = ((currentPrice - stopPrice) / stopPrice) * 100;
  if (distancePct <= 1) {
    return {
      presetId: id, level: 'warning', score: 65,
      message: `손절가 근접 (${distancePct.toFixed(1)}% 남음)`,
      detail: `현재가 ${currentPrice.toLocaleString()}원 / 손절가 ${stopPrice.toLocaleString()}원`,
    };
  }

  // ── 마이너스 구간이지만 여유 있음 ──
  if (currentReturn < 0) {
    return {
      presetId: id, level: 'caution', score: 20,
      message: `손실 ${currentReturn.toFixed(1)}% (손절가까지 ${distancePct.toFixed(1)}%)`,
      detail: `손절가 ${stopPrice.toLocaleString()}원 (${stopPct}%)${volatilityNote}`,
    };
  }

  // ── 수익 구간 → 안전 ──
  return {
    presetId: id, level: 'safe', score: 0,
    message: `수익 ${currentReturn.toFixed(1)}% — 손절가 ${stopPrice.toLocaleString()}원`,
    detail: `손절 기준 ${stopPct}%${volatilityNote}`,
  };
}


// ══════════════════════════════════════════════
// 3번 매도법: 2/3 익절 매도법 (twoThird)
// ══════════════════════════════════════════════
// PPT 원리:
//   매수가와 최고가 사이를 3등분
//   최고점에서 1/3 하락한 지점에서 매도
//   ★ "최대 수익에서 1/3 하락 → 하락추세 전환 가능성"
//   ★ "손실 이전에 작은 수익이라도 누적하는 습관"
//   ★ "수익이 클수록 적용하기 쉬움"
// 적용: 5% 수익구간 ~ 10% 이상
// ══════════════════════════════════════════════

function checkTwoThird(
  buyPrice: number,
  highestPrice: number | undefined,
  currentPrice: number
): SignalResult {
  const id = 'twoThird';

  // highestPrice 자동 갱신: 현재가와 비교하여 더 높은 값 사용
  const hp = Math.max(highestPrice || 0, currentPrice);

  // ★ 수익 자체가 없으면 적용 불가
  if (hp <= buyPrice) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: '수익 미발생 — 최고가 미갱신',
      detail: '매수가를 넘는 최고가가 기록되어야 적용됩니다.',
    };
  }

  const profitPct = ((hp - buyPrice) / buyPrice) * 100;
  // 매도 목표가 = 최고점에서 1/3 하락한 지점
  // = 매수가 + (최고가 - 매수가) × 2/3
  const targetPrice = Math.round(buyPrice + (hp - buyPrice) * 2 / 3);
  const distancePct = ((currentPrice - targetPrice) / targetPrice) * 100;

  // ── 매도 목표가 도달 ──
  if (currentPrice <= targetPrice) {
    const smallProfitNote = profitPct < 5
      ? ' (소액 수익 구간 — 신속 대응 필요)'
      : '';
    return {
      presetId: id, level: 'danger', score: 80,
      message: `2/3 익절 매도 시점! 목표가 ₩${targetPrice.toLocaleString()} 도달`,
      detail: `매수 ₩${buyPrice.toLocaleString()} → 최고 ₩${hp.toLocaleString()} → 1/3 하락 도달${smallProfitNote}`,
      triggeredAt: Date.now(),
    };
  }

  // ── 매도 목표가 근접 (2% 이내) ──
  if (distancePct <= 2) {
    return {
      presetId: id, level: 'warning', score: 45,
      message: `매도 목표가 근접 (₩${targetPrice.toLocaleString()})`,
      detail: `현재가와 목표가 차이 ${distancePct.toFixed(1)}%${profitPct < 5 ? ' — 소액 수익, 빠른 대응 권장' : ''}`,
    };
  }

  // ── 5% 미만 소액 수익 구간 ──
  if (profitPct < 5) {
    return {
      presetId: id, level: 'caution', score: 15,
      message: `소액 수익 ${profitPct.toFixed(1)}% — 목표가 ₩${targetPrice.toLocaleString()}`,
      detail: 'PPT: "작은 수익구간에서는 대응이 급하게 흘러갈 수 있음"',
    };
  }

  // ── 안전 구간 ──
  return {
    presetId: id, level: 'safe', score: 0,
    message: `매도 목표가 ₩${targetPrice.toLocaleString()} (여유 ${distancePct.toFixed(1)}%)`,
    detail: `매수 ₩${buyPrice.toLocaleString()} → 최고 ₩${hp.toLocaleString()}`,
  };
}


// ══════════════════════════════════════════════
// 4번 매도법: 이동평균선 매도법 (maSignal)
// ══════════════════════════════════════════════
// PPT 원리 — 그랜빌의 법칙 매도 신호 4가지:
//   ① 이평선 하락 전환 + 주가 하향 돌파 → 강력 매도
//   ② 이평선 하락 추세 + 일시적 상향 돌파 → 기술적 반등, 매도 관점
//   ③ 이평선 하락 + 주가가 이평선 돌파 못하고 재하락 → 매도
//   ④ 상승 이평선 위에서 과도 상승 후 주춤 → 단기 매도
// + MACD 데드크로스 → 추가 가중치
// 적용: 5% 수익구간 ~ 10% 이상
// ══════════════════════════════════════════════

function checkMASignal(
  candles: CandleData[],
  currentPrice: number,
  period: number = 20
): SignalResult {
  const id = 'maSignal';

  if (candles.length < period + 5) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: `데이터 부족 (${period}일 이평선 계산 불가)`,
      detail: `최소 ${period + 5}일의 캔들 데이터가 필요합니다.`,
    };
  }

  // ── 이동평균선 계산 ──
  const maValues = calcMA(candles, period);
  const len = candles.length;
  const todayMA = maValues[len - 1];
  const yesterdayMA = maValues[len - 2];
  const twoDaysAgoMA = maValues[len - 3];

  if (isNaN(todayMA) || isNaN(yesterdayMA)) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: '이동평균선 계산 불가',
      detail: '충분한 데이터가 없습니다.',
    };
  }

  let score = 0;
  const details: string[] = [];

  // ── 이평선 방향 판단 ──
  const maSlope = todayMA - yesterdayMA;
  const maTrend = maSlope > 0 ? 'up' : maSlope < -0.001 ? 'down' : 'flat';

  // ── 현재가와 이평선 위치 관계 ──
  const priceAboveMA = currentPrice > todayMA;
  const priceBelowMA = currentPrice < todayMA;
  const prevAboveMA = candles[len - 2].close > yesterdayMA;

  // ── 그랜빌 매도신호 판정 ──

  // ① 이평선 하락전환 + 주가 하향돌파 (강력 매도)
  if ((maTrend === 'down' || maTrend === 'flat') && priceBelowMA && prevAboveMA) {
    score += 35;
    details.push(`매도신호1: ${period}일선 하향 돌파 (강력 매도)`);
  }

  // ② 이평선 하락 추세 + 일시적 반등 후 재하락
  if (maTrend === 'down' && priceBelowMA) {
    // 최근 3일 내 이평선 위를 터치했는지 확인
    let touchedAbove = false;
    for (let i = len - 4; i < len - 1; i++) {
      if (i >= 0 && candles[i].close > maValues[i]) {
        touchedAbove = true;
        break;
      }
    }
    if (touchedAbove) {
      score += 25;
      details.push(`매도신호2: 이평선 반등 실패 후 재하락`);
    } else {
      score += 15;
      details.push(`이평선 하락 추세 + 주가 하회`);
    }
  }

  // ③ 이평선 하락 + 주가가 이평선 저항에서 꺾임
  if (maTrend === 'down' && !priceBelowMA) {
    const distToMA = ((currentPrice - todayMA) / todayMA) * 100;
    if (distToMA < 1) {
      score += 20;
      details.push(`매도신호3: 이평선 저항 접근 (${distToMA.toFixed(1)}%)`);
    }
  }

  // ④ 상승 이평선 + 과도 이격 후 주춤 (단기 매도)
  if (maTrend === 'up' && priceAboveMA) {
    const deviation = ((currentPrice - todayMA) / todayMA) * 100;
    if (deviation > 15) {
      score += 20;
      details.push(`매도신호4: 이평선 과이격 ${deviation.toFixed(1)}% (과열 주의)`);
    } else if (deviation > 10) {
      score += 10;
      details.push(`이평선 이격 ${deviation.toFixed(1)}% (경계)`);
    }
  }

  // ── MACD 데드크로스 가중치 ──
  if (candles.length >= 35) {
    const macdData = calcMACD(candles);
    const lastHist = macdData.histogram[len - 1];
    const prevHist = macdData.histogram[len - 2];

    if (!isNaN(lastHist) && !isNaN(prevHist)) {
      // 데드크로스: histogram이 양→음으로 전환
      if (prevHist > 0 && lastHist <= 0) {
        score += 20; // v5.1a: 10→20 상향
        details.push('MACD 데드크로스 발생');
      } else if (lastHist < 0 && prevHist < lastHist) {
        // 히스토그램 음수 + 감소 → 하락 가속
        score += 10;
        details.push('MACD 하락 가속');
      }
    }
  }

  // ── 판정 ──
  const level: SignalLevel = score >= 50 ? 'danger'
    : score >= 30 ? 'warning'
    : score >= 15 ? 'caution'
    : 'safe';

  const message = score >= 50
    ? `이평선 매도 신호! (${period}일선)`
    : score >= 30
    ? `이평선 경고 (${period}일선)`
    : score >= 15
    ? `이평선 주의 (${period}일선)`
    : `이평선 안정 (${period}일선)`;

  return {
    presetId: id, level, score: Math.min(score, 100),
    message,
    detail: details.join(' | ') || `${period}일 이평선 대비 정상 범위`,
    triggeredAt: score >= 30 ? Date.now() : undefined,
  };
}


// ══════════════════════════════════════════════
// 5번 매도법: 매물대 매도법 (volumeZone)
// ══════════════════════════════════════════════
// PPT 원리:
//   거래량이 집중된 가격대 = 매물대
//   현재가가 상단 매물대에 진입 시 매도 압력 증가
//   거래량 프로파일 기반 지지/저항 판단
// 적용: 5% 수익구간 ~ 10% 이상
// ══════════════════════════════════════════════

function checkVolumeZone(
  candles: CandleData[],
  currentPrice: number
): SignalResult {
  const id = 'volumeZone';

  if (!candles || candles.length < 20) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: '데이터 부족 (최소 20일 필요)',
      detail: '매물대 분석을 위해 거래량 데이터가 필요합니다.',
    };
  }

  // ── 가격대별 거래량 프로파일 구축 ──
  const priceRange = candles.reduce((acc, c) => ({
    min: Math.min(acc.min, c.low),
    max: Math.max(acc.max, c.high),
  }), { min: Infinity, max: -Infinity });

  const bucketCount = 20;
  const bucketSize = (priceRange.max - priceRange.min) / bucketCount;
  const buckets: number[] = new Array(bucketCount).fill(0);

  candles.forEach(c => {
    const vol = c.volume || 1;
    const midPrice = (c.high + c.low) / 2;
    const bucketIdx = Math.min(
      Math.floor((midPrice - priceRange.min) / bucketSize),
      bucketCount - 1
    );
    buckets[bucketIdx] += vol;
  });

  // 현재가가 위치한 버킷
  const currentBucket = Math.min(
    Math.floor((currentPrice - priceRange.min) / bucketSize),
    bucketCount - 1
  );

  // 상위 매물대 찾기 (현재가 위쪽의 거래량 집중 구간)
  const maxVol = Math.max(...buckets);
  let score = 0;
  const details: string[] = [];

  // 현재 버킷의 거래량 비중
  const currentVolRatio = maxVol > 0 ? buckets[currentBucket] / maxVol : 0;

  // 현재가 위에 높은 매물대가 있는지
  let resistanceAbove = false;
  for (let i = currentBucket + 1; i < bucketCount; i++) {
    if (buckets[i] / maxVol > 0.7) {
      resistanceAbove = true;
      const resistPrice = Math.round(priceRange.min + (i + 0.5) * bucketSize);
      details.push(`상단 매물대 ₩${resistPrice.toLocaleString()} 부근`);
      break;
    }
  }

  // 현재 위치가 고거래량 구간에 있으면 매도 압력
  if (currentVolRatio > 0.8) {
    score += 25;
    details.push('현재가가 최대 매물대 구간에 위치');
  } else if (currentVolRatio > 0.5) {
    score += 10;
    details.push('현재가가 중급 매물대 구간');
  }

  // 현재가 아래에 지지 매물대가 있는지
  let supportBelow = false;
  for (let i = currentBucket - 1; i >= 0; i--) {
    if (buckets[i] / maxVol > 0.6) {
      supportBelow = true;
      break;
    }
  }

  if (!supportBelow && currentBucket > bucketCount * 0.6) {
    score += 15;
    details.push('하단 지지 매물대 약함 — 하락 시 급락 우려');
  }

  if (resistanceAbove) {
    score += 10;
    details.push('상단 저항 매물대 존재');
  }

  // ── 판정 ──
  const level: SignalLevel = score >= 40 ? 'danger'
    : score >= 25 ? 'warning'
    : score >= 10 ? 'caution'
    : 'safe';

  return {
    presetId: id, level,
    score: Math.min(score, 100),
    message: score >= 25 ? '매물대 저항/이탈 경고' : '매물대 안정',
    detail: details.join(' | ') || '매물대 분석 정상 범위',
    triggeredAt: score >= 25 ? Date.now() : undefined,
  };
}


// ══════════════════════════════════════════════
// 6번 매도법: 추세선 매도법 (trendline)
// ══════════════════════════════════════════════
// PPT 원리:
//   수평추세선(지지선/저항선) 기반 매도
//   ★ "최근 지지선을 2번 깨면 매도"
//   ★ "지지선 이탈 + 2/3 익절 시점 겹치면 확실한 매도"
// 적용: 10% 이상 수익구간
// ══════════════════════════════════════════════

function checkTrendline(
  candles: CandleData[],
  currentPrice: number
): SignalResult {
  const id = 'trendline';

  if (!candles || candles.length < 20) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: '데이터 부족 (최소 20일 필요)',
      detail: '추세선 분석을 위해 충분한 캔들 데이터가 필요합니다.',
    };
  }

  let score = 0;
  const details: string[] = [];
  const len = candles.length;

  // ── 최근 저점(지지선) 찾기 ──
  const recentLows: number[] = [];
  for (let i = len - 15; i < len - 1; i++) {
    if (i <= 0) continue;
    // 로컬 저점: 양옆보다 낮은 지점
    if (candles[i].low <= candles[i - 1].low && candles[i].low <= candles[i + 1]?.low) {
      recentLows.push(candles[i].low);
    }
  }

  // ── 최근 고점(저항선) 찾기 ──
  const recentHighs: number[] = [];
  for (let i = len - 15; i < len - 1; i++) {
    if (i <= 0) continue;
    if (candles[i].high >= candles[i - 1].high && candles[i].high >= candles[i + 1]?.high) {
      recentHighs.push(candles[i].high);
    }
  }

  // ── 지지선 이탈 판단 ──
  if (recentLows.length >= 2) {
    // 가장 최근 지지선 (최근 2개 저점의 평균)
    const sortedLows = recentLows.sort((a, b) => b - a); // 높은 순
    const support1 = sortedLows[0]; // 첫 번째 지지선
    const support2 = sortedLows.length > 1 ? sortedLows[1] : support1 * 0.98;

    if (currentPrice < support2) {
      // PPT: "최근 지지선 두 번 깨면 매도"
      score += 40;
      details.push(`지지선 2차 이탈 (₩${Math.round(support2).toLocaleString()} 하회)`);
    } else if (currentPrice < support1) {
      score += 20;
      details.push(`지지선 1차 이탈 (₩${Math.round(support1).toLocaleString()} 하회)`);
    } else {
      const distToSupport = ((currentPrice - support1) / support1) * 100;
      if (distToSupport < 2) {
        score += 10;
        details.push(`지지선 근접 (₩${Math.round(support1).toLocaleString()}, ${distToSupport.toFixed(1)}%)`);
      }
    }
  }

  // ── 하락 추세 감지 ──
  // 최근 10일간 고점과 저점이 모두 하향하는지
  if (len >= 10) {
    const first5 = candles.slice(len - 10, len - 5);
    const last5 = candles.slice(len - 5);
    const firstHigh = Math.max(...first5.map(c => c.high));
    const lastHigh = Math.max(...last5.map(c => c.high));
    const firstLow = Math.min(...first5.map(c => c.low));
    const lastLow = Math.min(...last5.map(c => c.low));

    if (lastHigh < firstHigh && lastLow < firstLow) {
      score += 15;
      details.push('고점·저점 하향 추세 (하락 채널)');
    }
  }

  // ── 판정 ──
  const level: SignalLevel = score >= 45 ? 'danger'
    : score >= 25 ? 'warning'
    : score >= 10 ? 'caution'
    : 'safe';

  return {
    presetId: id, level,
    score: Math.min(score, 100),
    message: score >= 25 ? '추세선 이탈 경고' : '추세 안정',
    detail: details.join(' | ') || '추세선 정상 범위',
    triggeredAt: score >= 25 ? Date.now() : undefined,
  };
}


// ══════════════════════════════════════════════
// 7번 매도법: 기업가치 반전 매도법 (fundamental)
// ══════════════════════════════════════════════
// PPT 원리:
//   "기업 가치에 변화가 나왔을 때 매도"
//   "실적 하락 발표 or 하락 전망 → 매도"
//   "악재(물적분할 등) → 매도"
// v5.1: PER/PBR 밴드차트 비교 추가
// 적용: 10% 이상 수익구간
// ══════════════════════════════════════════════

function checkFundamental(data?: FundamentalData): SignalResult {
  const id = 'fundamental';

  if (!data) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: '기업 데이터 미입력',
      detail: 'PER/PBR 등 기업가치 데이터를 입력하면 자동 판정됩니다.',
    };
  }

  let totalScore = 0;
  const details: string[] = [];

  // ── PER 업종 대비 고평가 판단 ──
  if (data.per && data.sectorAvgPer) {
    const perRatio = data.per / data.sectorAvgPer;
    if (perRatio > 2.5) {
      totalScore += 15;
      details.push(`PER ${data.per.toFixed(1)}x — 업종 평균의 ${perRatio.toFixed(1)}배`);
    } else if (perRatio > 1.8) {
      totalScore += 8;
      details.push(`PER ${data.per.toFixed(1)}x — 다소 고평가`);
    } else if (perRatio > 1.3) {
      totalScore += 3;
    }
  }

  // ── PER 밴드차트 비교 (v5.1) ──
  if (data.perBand) {
    const band = data.perBand;
    const bandRange = band.high - band.low;
    const bandPosition = bandRange > 0
      ? (band.current - band.low) / bandRange : 0.5;

    if (band.current > band.high) {
      totalScore += 20;
      details.push(`PER 5년 밴드 상단 초과 (${band.high} → ${band.current})`);
    } else if (bandPosition > 0.8) {
      totalScore += 10;
      details.push(`PER 밴드 상위 ${(bandPosition * 100).toFixed(0)}%`);
    }
  }

  // ── PBR 밴드차트 비교 (v5.1) ──
  if (data.pbrBand) {
    if (data.pbrBand.current > data.pbrBand.high) {
      totalScore += 12;
      details.push(`PBR 밴드 상단 초과`);
    }
  } else if (data.pbr && data.sectorAvgPbr) {
    const pbrRatio = data.pbr / data.sectorAvgPbr;
    if (pbrRatio > 2.5) {
      totalScore += 10;
      details.push(`PBR ${data.pbr.toFixed(1)}x — 고평가`);
    }
  }

  // ── 실적 성장 변화 ──
  if (data.earningsGrowth !== undefined) {
    if (data.earningsGrowth < -20) {
      totalScore += 20;
      details.push(`실적 ${data.earningsGrowth.toFixed(1)}% — 급격한 둔화`);
    } else if (data.earningsGrowth < -5) {
      totalScore += 10;
      details.push(`실적 ${data.earningsGrowth.toFixed(1)}% — 둔화`);
    }
  }

  // ── 매출 성장 변화 ──
  if (data.revenueGrowth !== undefined && data.revenueGrowth < -10) {
    totalScore += 10;
    details.push(`매출 ${data.revenueGrowth.toFixed(1)}% — 감소`);
  }

  // ── 악재 이벤트 ──
  if (data.newsEvent && data.newsEvent !== 'none') {
    const eventScores: Record<string, { score: number; label: string }> = {
      spin_off: { score: 25, label: '물적분할 발표' },
      rights_issue: { score: 20, label: '유상증자 발표' },
      earnings_miss: { score: 20, label: '실적 컨센서스 미달' },
      downgrade: { score: 15, label: '투자의견 하향' },
      scandal: { score: 20, label: '경영 리스크' },
    };
    const event = eventScores[data.newsEvent];
    if (event) {
      totalScore += event.score;
      details.push(event.label);
    }
  }

  // ── 판정 ──
  const level: SignalLevel = totalScore >= 45 ? 'danger'
    : totalScore >= 25 ? 'warning'
    : totalScore >= 10 ? 'caution'
    : 'safe';

  return {
    presetId: id, level,
    score: Math.min(totalScore, 100),
    message: totalScore >= 45 ? '기업가치 훼손! 매도 권장'
      : totalScore >= 25 ? '고평가 경고'
      : totalScore >= 10 ? '밸류에이션 주의'
      : '기업가치 안정',
    detail: details.join(' | '),
    triggeredAt: totalScore >= 25 ? Date.now() : undefined,
  };
}


// ══════════════════════════════════════════════
// 8번 매도법: 경기순환 매도법 (cycle)
// ══════════════════════════════════════════════
// PPT 원리:
//   코스톨라니 달걀 이론
//   "금리 인상 시작 시점부터 매도 고려"
//   "장기 투자 관점, 금리와 경기 상황으로 판단"
// v5.1: 단계별 점수 1=5, 2=10, 3=75, 4=85, 5=30, 6=5
// 적용: 10% 이상 수익구간 (장기 투자)
// ══════════════════════════════════════════════

function checkCycle(data?: CycleData): SignalResult {
  const id = 'cycle';

  if (!data || data.stage === undefined) {
    return {
      presetId: id, level: 'inactive', score: 0,
      message: '사이클 단계 미설정',
      detail: '코스톨라니 달걀 위젯에서 현재 경기 단계를 설정하세요.',
    };
  }

  const { stage, interestDirection, inflation, gdpGrowth, marketSentiment } = data;
  let totalScore = 0;
  const details: string[] = [];

  // ── 단계별 기본 점수 ──
  const stageScores: Record<number, number> = {
    1: 5,   // 조정국면/매수 (금리인하 시작)
    2: 10,  // 동행국면/관망 (경기회복 동행)
    3: 75,  // 과장국면/매도 (역금융장세·과열) ★
    4: 85,  // 조정국면/적극매도 (금리인상·유동성 축소) ★★
    5: 30,  // 동행국면/관망 (경기침체 동행)
    6: 5,   // 과장국면/매수 (바닥·역실적장세)
  };
  totalScore = stageScores[stage] || 5;

  const stageNames: Record<number, string> = {
    1: '조정국면·매수 (금리인하 시작)',
    2: '동행국면·관망 (경기회복)',
    3: '과장국면·매도 (과열 경고)',
    4: '조정국면·적극매도 (금리인상)',
    5: '동행국면·관망 (경기침체)',
    6: '과장국면·매수 (바닥 형성)',
  };
  details.push(`${stage}단계: ${stageNames[stage] || '알 수 없음'}`);

  // ── 금리 방향 보정 ──
  if (interestDirection === 'up_start') {
    totalScore += 10;
    details.push('금리 인상 시작');
  } else if (interestDirection === 'up_continued') {
    totalScore += 15;
    details.push('금리 인상 지속');
  } else if (interestDirection === 'down_start') {
    totalScore = Math.max(totalScore - 15, 0);
    details.push('금리 인하 시작 (매수 구간)');
  }

  // ── 인플레이션 경고 ──
  if (inflation !== undefined && inflation > 4 && stage >= 3) {
    totalScore += 5;
    details.push(`인플레이션 ${inflation.toFixed(1)}%`);
  }

  // ── GDP 둔화 ──
  if (gdpGrowth !== undefined && gdpGrowth < 2 && stage >= 3) {
    totalScore += 10;
    details.push(`GDP 성장 ${gdpGrowth.toFixed(1)}%`);
  }

  // ── 시장 심리 ──
  if (marketSentiment === 'euphoria' && stage >= 3) {
    totalScore += 10;
    details.push('시장 과열 (탐욕 심리)');
  } else if (marketSentiment === 'fear' && stage <= 2) {
    totalScore = Math.max(totalScore - 10, 0);
  }

  // ── 판정 ──
  const level: SignalLevel = totalScore >= 60 ? 'danger'
    : totalScore >= 40 ? 'warning'
    : totalScore >= 15 ? 'caution'
    : 'safe';

  const actionMap: Record<string, string> = {
    danger: '포지션 축소 강력 권장',
    warning: '매도 준비 · 포지션 점검',
    caution: '관찰 · 시장 동향 주시',
    safe: '보유 유지',
  };

  return {
    presetId: id, level,
    score: Math.min(totalScore, 100),
    message: `경기순환 ${stage}단계 — ${actionMap[level]}`,
    detail: details.join(' | '),
    triggeredAt: totalScore >= 40 ? Date.now() : undefined,
  };
}


// ══════════════════════════════════════════════
// 통합 시그널 계산 (메인 엔트리)
// ══════════════════════════════════════════════

function calculateAllSignals(input: SignalInput): PositionSignals {
  const { position, candles, currentPrice, fundamentalData, cycleData } = input;
  const selectedPresets = position.selectedPresets || [];
  const presetSettings = position.presetSettings || {};
  const signals: SignalResult[] = [];
  const returnPct = calcReturn(position.buyPrice, currentPrice);

  // ── 각 매도법별 시그널 계산 ──
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
        result = checkFundamental(fundamentalData);
        break;
      case 'cycle':
        result = checkCycle(cycleData);
        break;
      default:
        result = {
          presetId, level: 'inactive', score: 0,
          message: '알 수 없는 프리셋',
          detail: '',
        };
    }
    signals.push(result);
  });

  // ══════════════════════════════════════════════
  // PPT 핵심 원칙: "모든 매도는 음봉에서"
  // ══════════════════════════════════════════════
  // 양봉일 때 기술적 매도 시그널(1~6번) 점수를 30% 감소
  // 단, 기업가치(7번)와 경기순환(8번)은 캔들과 무관
  // 단, 갭하락은 양봉·음봉 무관하므로 감소 제외
  const todayCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const isYangbong = todayCandle ? todayCandle.close >= todayCandle.open : false;

  const adjustedSignals = isYangbong
    ? signals.map(s => {
        const isTechnical = s.presetId !== 'fundamental' && s.presetId !== 'cycle';
        const isHighLevel = s.level === 'danger' || s.level === 'warning';
        const isNotGap = s.message.indexOf('갭하락') === -1;

        if (isTechnical && isHighLevel && isNotGap) {
          return { ...s, score: Math.round(s.score * 0.7) };
        }
        return s;
      })
    : signals;

  // ── 통합 판정 ──
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


// ══════════════════════════════════════════════
// Export
// ══════════════════════════════════════════════

export {
  // 메인 엔트리
  calculateAllSignals,
  // 개별 매도법 함수
  checkCandle3,
  checkStopLoss,
  checkTwoThird,
  checkMASignal,
  checkVolumeZone,
  checkTrendline,
  checkFundamental,
  checkCycle,
  // 유틸리티
  calcMA,
  calcEMA,
  calcMACD,
  calcATR,
  calcReturn,
  findLocalPeaks,
  // 상수
  LEVEL_PRIORITY,
};
