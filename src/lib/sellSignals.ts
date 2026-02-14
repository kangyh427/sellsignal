// ============================================
// sellSignals.ts v5.1 패치 적용 가이드
// 작성: 세션 53
// 대상 파일: src/lib/sellSignals.ts
//
// ★ 이 파일은 직접 사용하는 파일이 아니라,
//   GitHub의 sellSignals.ts에 적용하기 위한 "변경 섹션 모음"입니다.
//
// 적용 순서:
//   1) SECTION A: 파일 헤더 교체 (1~14줄)
//   2) SECTION B: import 수정 (16줄)
//   3) SECTION C: checkTwoThird 수정 (세션53 발견 이슈)
//   4) SECTION D: checkMASignal MACD 가중치 상향 (세션53)
//   5) SECTION E: checkFundamental v5.1 교체 (827~838줄)
//   6) SECTION F: checkCycle v5.1 교체 (841~859줄)
//   7) SECTION G: calculateAllSignals v5.1 교체 (865~939줄)
//   8) SECTION H: export 목록 교체 (941~957줄)
// ============================================


// ═══════════════════════════════════════════════
// SECTION A: 파일 헤더 (1~14줄 교체)
// ═══════════════════════════════════════════════

// ============================================
// CREST 매도 시그널 계산 엔진 v5.1
// 경로: src/lib/sellSignals.ts
// 세션 53: PPT 대조 검증 + v5.1 패치 통합
//
// [변경 이력]
// v3 (세션 41): 1~3번 매도법 강화
// v4 (세션 43): 4~6번 매도법 PPT 기반 강화
// v5 (세션 44): 7번 기업가치 + 8번 경기순환 본격 구현
// v5.1 (세션 44-2): 7번 PER/PBR 밴드 + 8번 단계점수 수정
// v5.1a (세션 53): PPT 대조 기반 3번 twoThird 수정, 4번 MACD 가중치 조정
// ============================================


// ═══════════════════════════════════════════════
// SECTION B: import 수정 (16줄 교체)
// ═══════════════════════════════════════════════

// import type {
//   Position, CandleData, SignalLevel, SignalResult, PositionSignals,
//   FundamentalData, CycleData, ValuationBandData  // ★ v5.1 추가
// } from '@/types';
//
// // ── 계산 입력 v5.1 ──
// interface SignalInput {
//   position: Position;
//   candles: CandleData[];
//   currentPrice: number;
//   fundamentalData?: FundamentalData;  // ★ v5 추가
//   cycleData?: CycleData;              // ★ v5 추가
// }


// ═══════════════════════════════════════════════
// SECTION C: checkTwoThird 수정 (세션 53 PPT 대조 이슈)
// ★ 변경 내용: 최소수익 5% 조건 완화
//   PPT: "5% 소액에서도 적용하되, 대응이 급할 수 있음"
//   기존: 5% 미만 → inactive (비활성화)
//   수정: 5% 미만 → caution + 경고 메시지
//
// ★ 적용 위치: checkTwoThird 함수 내부의 early return 부분
//   기존 코드에서 아래와 유사한 부분을 찾아 교체:
//   if (highestPrice < buyPrice * 1.05) return { ... inactive ... }
// ═══════════════════════════════════════════════

// [기존 코드 — 찾아서 교체]
// if (highestPrice < buyPrice * 1.05) {
//   return {
//     presetId: id, level: 'inactive', score: 0,
//     message: '최소 수익 미달',
//     detail: '최고점이 매수가의 5% 이상이어야 적용됩니다.',
//   };
// }

// [교체할 코드 ↓]
// ── 세션 53 수정: PPT에서는 소액 수익에서도 적용 가능 ──
// 다만 수익 자체가 없는 경우(최고가 ≤ 매수가)만 비활성화
function checkTwoThird_PATCH(
  buyPrice: number, highestPrice: number, currentPrice: number
): { shouldSkip: boolean; earlyReturn?: any } {
  const id = 'twoThird';
  const hp = highestPrice || currentPrice;

  // ★ 수정: 최고가가 매수가 이하면 적용 불가 (수익 자체가 없음)
  if (hp <= buyPrice) {
    return {
      shouldSkip: true,
      earlyReturn: {
        presetId: id, level: 'inactive' as const, score: 0,
        message: '수익 미발생 — 최고가 미갱신',
        detail: '매수가를 넘는 최고가가 기록되어야 적용됩니다.',
      }
    };
  }

  // ★ 수정: 5% 미만이어도 활성화하되, 소액 구간 경고 표시
  const profitPct = ((hp - buyPrice) / buyPrice) * 100;
  const targetPrice = Math.round(buyPrice + (hp - buyPrice) * 2 / 3);
  // 즉, 매도 목표가 = 최고점에서 1/3 하락한 지점
  const distancePct = ((currentPrice - targetPrice) / targetPrice) * 100;

  if (currentPrice <= targetPrice) {
    // 매도 목표가 도달 → danger
    return {
      shouldSkip: false,
      earlyReturn: {
        presetId: id,
        level: 'danger' as const,
        score: 80,
        message: `2/3 익절 매도 시점! 목표가 ${targetPrice.toLocaleString()}원 도달`,
        detail: `매수 ${buyPrice.toLocaleString()}원 → 최고 ${hp.toLocaleString()}원 → 1/3 하락 도달` +
          (profitPct < 5 ? ' (소액 수익 구간 — 신속 대응 필요)' : ''),
        triggeredAt: Date.now(),
      }
    };
  }

  if (distancePct <= 2) {
    // 매도 목표가 근접 (2% 이내) → warning
    return {
      shouldSkip: false,
      earlyReturn: {
        presetId: id,
        level: 'warning' as const,
        score: 45,
        message: `매도 목표가 근접 (${targetPrice.toLocaleString()}원)`,
        detail: `현재가와 목표가 차이 ${distancePct.toFixed(1)}%` +
          (profitPct < 5 ? ' — 소액 수익, 빠른 대응 권장' : ''),
      }
    };
  }

  // ★ 신규: 5% 미만 소액 수익 구간 caution
  if (profitPct < 5) {
    return {
      shouldSkip: false,
      earlyReturn: {
        presetId: id,
        level: 'caution' as const,
        score: 15,
        message: `소액 수익 구간 (${profitPct.toFixed(1)}%) — 매도 목표가 ${targetPrice.toLocaleString()}원`,
        detail: 'PPT: "작은 수익구간에서는 대응이 급하게 흘러갈 수 있음"',
      }
    };
  }

  // 안전 구간
  return {
    shouldSkip: false,
    earlyReturn: {
      presetId: id,
      level: 'safe' as const,
      score: 0,
      message: `매도 목표가 ${targetPrice.toLocaleString()}원 (여유 ${distancePct.toFixed(1)}%)`,
      detail: `매수 ${buyPrice.toLocaleString()}원 → 최고 ${hp.toLocaleString()}원`,
    }
  };
}


// ═══════════════════════════════════════════════
// SECTION D: checkMASignal MACD 가중치 수정 안내
// ★ 적용 위치: checkMASignal 함수 내부
//   기존: MACD 데드크로스 +10점 → +20점으로 변경
//   기존: 이평선 데드크로스 +15점 → +20점으로 변경
//
// PPT 근거: MACD 데드크로스를 별도 슬라이드로 강조,
//          "다른 매도법들과 병행해서 분석하라" 권고
// ═══════════════════════════════════════════════

// 찾아서 변경할 부분:
//   1) MACD 데드크로스 관련: score += 10 → score += 20
//   2) 이평선 데드크로스 관련: score += 15 → score += 20


// ═══════════════════════════════════════════════
// SECTION E: checkFundamental v5.1 (827~838줄 전체 교체)
// ═══════════════════════════════════════════════

// ============================================
// 7. 기업가치 반전 매도법 v5.1 (fundamental)
// PPT: "기업 가치에 변화가 나왔을 때 매도"
//      "실적 하락 발표 or 하락 전망 → 매도"
//      "악재(물적분할 등) → 매도"
//
// ★ v5.1: PER/PBR 밴드차트 비교
//   - 과거 5년간 PER 추이 대비 현재 위치 판단
//   - 밴드 상단 초과 시 추가 경고 (+20점)
//   - 업종 대비 + 자기 밴드 대비 = 이중 검증
// ============================================
/*
function checkFundamental(data?: FundamentalData): SignalResult {
  const id = 'fundamental';

  // 데이터 없으면 수동 판정 모드
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
      details.push(`PER ${data.per.toFixed(1)}x — 업종 평균(${data.sectorAvgPer.toFixed(1)}x)의 ${perRatio.toFixed(1)}배`);
    } else if (perRatio > 1.8) {
      totalScore += 8;
      details.push(`PER ${data.per.toFixed(1)}x — 다소 고평가`);
    } else if (perRatio > 1.3) {
      totalScore += 3;
    }
  }

  // ── ★ v5.1: PER 밴드차트 비교 (과거 5년 자기 자신 대비) ──
  if (data.perBand) {
    const band = data.perBand;
    const bandRange = band.high - band.low;
    const bandPosition = bandRange > 0
      ? (band.current - band.low) / bandRange
      : 0.5;

    if (band.current > band.high) {
      totalScore += 20;
      details.push(`PER 5년 밴드 상단 초과! (상단 ${band.high} → 현재 ${band.current})`);
    } else if (bandPosition > 0.8) {
      totalScore += 10;
      details.push(`PER 밴드 상위 ${(bandPosition * 100).toFixed(0)}% 구간`);
    } else if (bandPosition > 0.6) {
      totalScore += 3;
    }
  }

  // ── ★ v5.1: PBR 밴드차트 비교 ──
  if (data.pbrBand) {
    if (data.pbrBand.current > data.pbrBand.high) {
      totalScore += 12;
      details.push(`PBR 5년 밴드 상단 초과 (상단 ${data.pbrBand.high} → 현재 ${data.pbrBand.current})`);
    }
  } else if (data.pbr && data.sectorAvgPbr) {
    const pbrRatio = data.pbr / data.sectorAvgPbr;
    if (pbrRatio > 2.5) {
      totalScore += 10;
      details.push(`PBR ${data.pbr.toFixed(1)}x — 고평가`);
    } else if (pbrRatio > 1.8) {
      totalScore += 5;
    }
  }

  // ── 실적 성장 변화 ──
  if (data.earningsGrowth !== undefined) {
    if (data.earningsGrowth < -20) {
      totalScore += 20;
      details.push(`실적 성장 ${data.earningsGrowth.toFixed(1)}% — 급격한 둔화`);
    } else if (data.earningsGrowth < -5) {
      totalScore += 10;
      details.push(`실적 성장 ${data.earningsGrowth.toFixed(1)}% — 둔화 시작`);
    } else if (data.earningsGrowth < 0) {
      totalScore += 5;
    }
  }

  // ── 매출 성장 변화 ──
  if (data.revenueGrowth !== undefined && data.revenueGrowth < -10) {
    totalScore += 10;
    details.push(`매출 성장 ${data.revenueGrowth.toFixed(1)}% — 매출 감소`);
  }

  // ── 악재/호재 이벤트 ──
  if (data.newsEvent) {
    switch (data.newsEvent) {
      case 'spin_off':
        totalScore += 25;
        details.push('물적분할 발표 — 기업가치 훼손 우려');
        break;
      case 'rights_issue':
        totalScore += 20;
        details.push('유상증자 발표 — 주식 희석 우려');
        break;
      case 'earnings_miss':
        totalScore += 20;
        details.push('실적 컨센서스 미달 — 실적 쇼크');
        break;
      case 'downgrade':
        totalScore += 15;
        details.push('주요 증권사 투자의견 하향');
        break;
      case 'scandal':
        totalScore += 20;
        details.push('경영 리스크/스캔들 발생');
        break;
    }
  }

  // ── 판정 ──
  const level: SignalLevel = totalScore >= 45 ? 'danger'
    : totalScore >= 25 ? 'warning'
    : totalScore >= 10 ? 'caution'
    : 'safe';

  const message = totalScore >= 45 ? '기업가치 훼손! 매도 권장'
    : totalScore >= 25 ? '고평가 경고 (밴드 상단)'
    : totalScore >= 10 ? '밸류에이션 주의'
    : '기업가치 안정';

  return {
    presetId: id,
    level,
    score: Math.min(totalScore, 100),
    message,
    detail: details.join(' | '),
    triggeredAt: totalScore >= 25 ? Date.now() : undefined,
  };
}
*/


// ═══════════════════════════════════════════════
// SECTION F: checkCycle v5.1 (841~859줄 전체 교체)
// ═══════════════════════════════════════════════

// ============================================
// 8. 경기순환 매도법 v5.1 (cycle)
// PPT: "코스톨라니 달걀 — 금리 인상 시작 시점부터 매도 고려"
//      "장기 투자 관점, 금리와 경기 상황으로 판단"
//
// ★ v5.1: 단계별 점수 MarketCycleWidget 원본 기준
//   1=5, 2=10, 3=75★, 4=85★★, 5=30, 6=5
// ============================================
/*
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

  // ── ★ v5.1: 단계별 기본 점수 (MarketCycleWidget 기준) ──
  const stageScores: Record<number, number> = {
    1: 5,    // 조정국면/매수 — 금리인하 시작
    2: 10,   // 동행국면/관망 — 경기회복 동행
    3: 75,   // 과장국면/매도 — 과열 경고 ★
    4: 85,   // 조정국면/매도 — 금리인상 시작 ★★
    5: 30,   // 동행국면/관망 — 경기침체 동행
    6: 5,    // 과장국면/매수 — 바닥 형성
  };
  totalScore = stageScores[stage] || 5;

  const stageNames: Record<number, string> = {
    1: '조정국면 · 매수 (금리인하 시작)',
    2: '동행국면 · 관망 (경기회복 동행)',
    3: '과장국면 · 매도 (역금융장세 · 과열)',
    4: '조정국면 · 적극매도 (금리인상 · 유동성 축소)',
    5: '동행국면 · 관망 (경기침체 동행)',
    6: '과장국면 · 매수 (바닥 · 역실적장세)',
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
    presetId: id,
    level,
    score: Math.min(totalScore, 100),
    message: `경기순환 ${stage}단계 — ${actionMap[level]}`,
    detail: details.join(' | '),
    triggeredAt: totalScore >= 40 ? Date.now() : undefined,
  };
}
*/


// ═══════════════════════════════════════════════
// SECTION G: calculateAllSignals v5.1 (865~939줄 교체)
// ═══════════════════════════════════════════════

/*
export function calculateAllSignals(input: SignalInput): PositionSignals {
  const { position, candles, currentPrice, fundamentalData, cycleData } = input;
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
        result = checkFundamental(fundamentalData);
        break;
      case 'cycle':
        result = checkCycle(cycleData);
        break;
      default:
        result = { presetId, level: 'inactive', score: 0, message: '알 수 없는 프리셋', detail: '' };
    }
    signals.push(result);
  });

  // "모든 매도는 음봉에서" 보정 (기업가치/경기순환은 제외)
  const todayCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const isYangbong = todayCandle ? todayCandle.close >= todayCandle.open : false;

  const adjustedSignals = isYangbong
    ? signals.map(s => ({
        ...s,
        score: (s.level === 'danger' || s.level === 'warning')
          && s.presetId !== 'fundamental'
          && s.presetId !== 'cycle'
          && s.message.indexOf('갭하락') === -1
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
*/


// ═══════════════════════════════════════════════
// SECTION H: export 목록 (941~957줄 교체)
// ═══════════════════════════════════════════════

/*
export {
  checkCandle3,
  checkStopLoss,
  checkTwoThird,
  checkMASignal,
  checkVolumeZone,
  checkTrendline,
  checkFundamental,    // ★ v5.1: PER/PBR 밴드차트 비교 포함
  checkCycle,          // ★ v5.1: 단계점수 수정 (3=75, 4=85)
  calcMA,
  calcEMA,
  calcMACD,
  calcATR,
  calcReturn,
  findLocalPeaks,
};
*/
