// ============================================
// types/index.ts v5.1 패치
// 경로: src/types/index.ts
// 세션 44-2: FundamentalData에 PER/PBR 밴드 타입 추가
//
// [적용 방법]
// 기존 types/index.ts 파일의 마지막 줄(146줄) 뒤에 아래 내용을 추가
// ※ v5 패치에서 이미 추가했다면, FundamentalData를 아래 버전으로 교체
// ============================================


// ============================================
// 세션 44-2 추가/수정: 7번/8번 매도법용 타입
// v5.1: PER/PBR 밴드차트 데이터 타입 추가
// ============================================

/** PER/PBR 밴드차트 데이터 (과거 5년 기준) */
export interface ValuationBandData {
  /** 5년 최고값 */
  high: number;
  /** 5년 평균값 */
  avg: number;
  /** 5년 최저값 */
  low: number;
  /** 현재값 */
  current: number;
  /** 분기별 히스토리 (최대 20개 분기) */
  history?: number[];
}

/** 7번 기업가치 매도법 — 기업 데이터 */
export interface FundamentalData {
  /** 주가수익비율 (Price-to-Earnings Ratio) */
  per?: number;
  /** 업종 평균 PER */
  sectorAvgPer?: number;
  /** 주가순자산비율 (Price-to-Book Ratio) */
  pbr?: number;
  /** 업종 평균 PBR */
  sectorAvgPbr?: number;
  /** 영업이익 성장률 (%, 전년 동기 대비) */
  earningsGrowth?: number;
  /** 매출 성장률 (%, 전년 동기 대비) */
  revenueGrowth?: number;
  /** 악재/호재 이벤트 유형 */
  newsEvent?: 
    | 'spin_off'       // 물적분할
    | 'rights_issue'   // 유상증자
    | 'earnings_miss'  // 실적 컨센서스 미달
    | 'downgrade'      // 투자의견 하향
    | 'scandal'        // 경영 리스크
    | 'none';          // 특이사항 없음
  /** 뉴스 이벤트 상세 설명 */
  newsDetail?: string;
  /** ★ v5.1: PER 밴드차트 데이터 (과거 5년) */
  perBand?: ValuationBandData;
  /** ★ v5.1: PBR 밴드차트 데이터 (과거 5년) */
  pbrBand?: ValuationBandData;
}

/** 8번 경기순환 매도법 — 경기 데이터 */
export interface CycleData {
  /** 코스톨라니 6단계 (1~6)
   * 1=조정국면/매수  2=동행국면/관망  3=과장국면/매도
   * 4=조정국면/매도  5=동행국면/관망  6=과장국면/매수
   */
  stage: number;
  /** 금리 방향 */
  interestDirection?: 
    | 'up_start'      // 인상 시작
    | 'up_continued'  // 인상 지속
    | 'stable'        // 동결
    | 'down_start'    // 인하 시작
    | 'down_continued'; // 인하 지속
  /** 현재 기준금리 (%) */
  interestRate?: number;
  /** 인플레이션율 (%) */
  inflation?: number;
  /** GDP 성장률 (%) */
  gdpGrowth?: number;
  /** 시장 심리 */
  marketSentiment?: 
    | 'euphoria'    // 탐욕/과열
    | 'optimism'    // 낙관
    | 'anxiety'     // 불안
    | 'fear';       // 공포
}
