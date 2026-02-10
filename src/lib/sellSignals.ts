// ============================================
// sellSignals v4 → v5.1 패치
// 경로: src/lib/sellSignals.ts
// 세션 44-2: 
//   7번: PER/PBR 밴드차트 비교 로직 추가
//   8번: 코스톨라니 단계 점수 MarketCycleWidget 기준으로 수정
//
// [적용 방법]
// 1. 헤더 주석: v4 → v5.1 로 변경
// 2. import 라인에 FundamentalData, CycleData, ValuationBandData 추가
// 3. 827~838줄 (7번 placeholder) → 아래 STEP 3 코드로 교체
// 4. 841~859줄 (8번 기본) → 아래 STEP 4 코드로 교체
// 5. 865~939줄 (calculateAllSignals) → 아래 STEP 5 코드로 교체
// 6. export 목록 업데이트
// ============================================

// ─────────────────────────────────────────────
// STEP 1: 파일 헤더 (1~14줄) 교체
// ─────────────────────────────────────────────

// ============================================
// CREST 매도 시그널 계산 엔진 v5.1
// 경로: src/lib/sellSignals.ts
// 세션 44-2: 7번(기업가치) PER밴드 + 8번(경기순환) 단계점수 수정
//
// [변경 이력]
// v3 (세션 41): 1~3번 매도법 강화
// v4 (세션 43): 4~6번 매도법 PPT 기반 강화
// v5 (세션 44): 7번 기업가치 + 8번 경기순환 본격 구현
// v5.1 (세션 44-2):
//   7번: PER/PBR 밴드차트 비교 (과거 5년 대비 위치 판단)
//   8번: 코스톨라니 단계 점수 수정 (1=5,2=10,3=75,4=85,5=30,6=5)
//        MarketCycleWidget.tsx 원본과 완벽 일치
// ============================================

// ─────────────────────────────────────────────
// STEP 2: import 수정 (16줄)
// ─────────────────────────────────────────────

import type {
  Position, CandleData, SignalLevel, SignalResult, PositionSignals,
  FundamentalData, CycleData, ValuationBandData  // ★ v5.1 추가
} from '@/types';

// ── 계산 입력 v5.1 ──
interface SignalInput {
  position: Position;
  candles: CandleData[];
  currentPrice: number;
  fundamentalData?: FundamentalData;  // ★ v5 추가
  cycleData?: CycleData;              // ★ v5 추가
}


// ─────────────────────────────────────────────
// STEP 3: 7번 기업가치 매도법 v5.1 (827~838줄 교체)
// ★ PER/PBR 밴드차트 비교 로직 추가
// ─────────────────────────────────────────────

// ============================================
// 7. 기업가치 반전 매도법 v5.1 (fundamental)
// PPT: "기업 가치에 변화가 나왔을 때 매도"
// "실적 하락 발표 or 하락 전망 → 매도"
// "악재(물적분할 등) → 매도"
//
// ★ v5.1 추가: PER/PBR 밴드차트 비교
//   - 종목의 과거 5년간 PER 추이 대비 현재 위치 판단
//   - 밴드 상단 초과 시 추가 경고 (+20점)
//   - 밴드 상위 80% 이상 시 주의 (+10점)
//   - 업종 대비 + 자기 밴드 대비 = 이중 검증
// ============================================
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

  // ── ★ v5.1: PER 밴드차트 비교 (과거 자기 자신 대비) ──
  if (data.perBand) {
    const band = data.perBand;
    const bandRange = band.high - band.low;
    const bandPosition = bandRange > 0 ? (band.current - band.low) / bandRange : 0.5;

    if (band.current > band.high) {
      // 5년 밴드 상단 초과 — 매우 위험
      totalScore += 20;
      details.push(`PER 5년 밴드 상단 초과! (상단 ${band.high} → 현재 ${band.current})`);
    } else if (bandPosition > 0.8) {
      // 밴드 상위 80% — 주의
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
    // 밴드 데이터 없으면 업종 대비로 판단
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


// ─────────────────────────────────────────────
// STEP 4: 8번 경기순환 매도법 v5.1 (841~859줄 교체)
// ★ 단계별 점수 MarketCycleWidget/CYCLE_STAGES 기준으로 수정
// ─────────────────────────────────────────────

// ============================================
// 8. 경기순환 매도법 v5.1 (cycle)
// PPT: "코스톨라니 달걀 — 금리 인상 시작 시점부터 매도 고려"
// "장기 투자 관점, 금리와 경기 상황으로 판단"
//
// ★ v5.1 수정: 단계별 점수 MarketCycleWidget 원본 기준
//   1=조정국면/매수(5)    2=동행국면/관망(10)   3=과장국면/매도(75) ★
//   4=조정국면/매도(85) ★  5=동행국면/관망(30)   6=과장국면/매수(5)
//
// ★ 코스톨라니 달걀 배치 (MarketCycleWidget.tsx):
//   stageAngles = [130°, 180°, 230°, 310°, 0°, 50°]
//   ①130°=좌하/매수  ②180°=좌중/관망  ③230°=좌상/매도
//   ④310°=우상/매도  ⑤0°=우중/관망    ⑥50°=우하/매수
//   상단=금리정점  하단=금리저점
//   좌측=경기상승▲  우측=경기침체▼
// ============================================
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

  // ── ★ v5.1 수정: 단계별 기본 점수 (MarketCycleWidget 기준) ──
  // 3,4단계가 매도 핵심 구간 (금리 정점 부근)
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


// ─────────────────────────────────────────────
// STEP 5: calculateAllSignals 교체 (865~939줄)
// v5 → v5.1 변경사항: 동일 (이미 fundamental/cycle 봉 보정 제외)
// ─────────────────────────────────────────────

// ============================================
// 🔥 통합 계산 함수 v5.1
// ============================================
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
      // ★ v5: 7번 기업가치 — fundamentalData 전달
      case 'fundamental':
        result = checkFundamental(fundamentalData);
        break;
      // ★ v5: 8번 경기순환 — cycleData 전달
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
          && s.presetId !== 'fundamental'   // ★ v5: 기업가치는 봉 보정 제외
          && s.presetId !== 'cycle'          // ★ v5: 경기순환도 봉 보정 제외
          && s.message.indexOf('객하락') === -1
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


// ─────────────────────────────────────────────
// STEP 6: export 목록 업데이트 (941~957줄 교체)
// ─────────────────────────────────────────────

// ── 개별 함수 export ──
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
