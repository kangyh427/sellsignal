// ============================================
// 중앙 집중식 타입 정의
// 모든 컴포넌트에서 이 파일의 타입을 import하여 사용
// ============================================

// Position 타입 - 포지션(보유 종목) 정보
export interface Position {
  id: number
  name: string
  code: string
  buyPrice: number
  quantity: number
  highestPrice?: number
  selectedPresets: string[]
  presetSettings: Record<string, { value: number }>
}

// Alert 타입 - 알림 정보
export interface Alert {
  id: number
  stockName: string
  code: string
  preset: {
    id: string
    name: string
    icon: string
    severity: 'critical' | 'high' | 'medium' | 'low'
  }
  message: string
  currentPrice?: number
  targetPrice?: number
  timestamp: number
}

// User 타입 - 사용자 정보
export interface User {
  membership: 'free' | 'premium'
  email: string
}

// PriceData 타입 - 캔들 차트 데이터
export interface PriceData {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Stock 타입 - 종목 정보
export interface Stock {
  name: string
  code: string
  market: string
  sector: string
  per: number
  pbr: number
  sectorPer: number
  sectorPbr: number
}

// SellPreset 타입 - 매도 조건 프리셋
export interface SellPreset {
  id: string
  name: string
  icon: string
  description: string
  stages: string[]
  severity: 'critical' | 'high' | 'medium' | 'low'
  color: string
  hasInput?: boolean
  inputLabel?: string
  inputDefault?: number
}

// ProfitStage 타입 - 수익 단계
export interface ProfitStage {
  label: string
  color: string
  range: string
  methods: string[]
}
