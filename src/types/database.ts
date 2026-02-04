// 멤버십 타입
export type MembershipType = 'free' | 'premium'

// 알림 심각도
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

// 알림 타입 (매도법 ID)
export type AlertType = 'candle3' | 'stopLoss' | 'twoThird' | 'maSignal' | 'volumeZone' | 'trendline' | 'fundamental' | 'cycle'

// 프로필 테이블
export interface Profile {
  id: string
  email: string
  display_name: string | null
  membership: MembershipType
  created_at: string
  updated_at: string
}

// 포지션 테이블
export interface Position {
  id: string
  user_id: string
  stock_name: string
  stock_code: string
  market: string | null
  sector: string | null
  buy_price: number
  quantity: number
  buy_date: string
  highest_price: number | null
  selected_presets: string[]
  preset_settings: Record<string, any> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// 캔들 데이터 테이블
export interface Candle {
  id: string
  stock_code: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  created_at: string
}

// 알림 테이블
export interface Alert {
  id: string
  user_id: string
  position_id: string
  alert_type: AlertType
  severity: AlertSeverity
  message: string
  current_price: number | null
  target_price: number | null
  is_read: boolean
  created_at: string
}

// 구독 테이블
export interface Subscription {
  id: string
  user_id: string
  plan: MembershipType
  status: 'active' | 'cancelled' | 'expired'
  started_at: string
  expires_at: string | null
  payment_provider: string | null
  created_at: string
}

// 경제 지표 테이블
export interface EconomicIndicator {
  id: string
  indicator_name: string
  value: number
  previous_value: number | null
  date: string
  source: string | null
  created_at: string
}

// 매도법 프리셋
export interface SellPreset {
  id: string
  name: string
  icon: string
  description: string
  stages: string[]
  severity: AlertSeverity
  color: string
  hasInput?: boolean
  inputLabel?: string
  inputDefault?: number
}

// 수익 단계
export interface ProfitStage {
  label: string
  color: string
  range: string
  methods: string[]
}

// 종목 정보
export interface StockInfo {
  name: string
  code: string
  market: string
  sector: string
  per: number
  pbr: number
  sectorPer: number
  sectorPbr: number
}

// 실적 데이터
export interface EarningsData {
  name: string
  nextEarningsDate: string
  lastEarnings: {
    surprise: number
  }
}

// 경기 사이클
export interface MarketCycle {
  currentPhase: number
  phaseName: string
  description: string
  recommendation: string
  interestRate: number
  confidence: number
  details: {
    kospiPer: number
    bondYield: number
    fedRate: number
  }
}
