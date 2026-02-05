// ============================================
// 타입 정의
// ============================================

export interface Position {
  id: number
  name: string
  code: string
  buyPrice: number
  quantity: number
  highestPrice?: number
  selectedPresets: string[]
  presetSettings?: Record<string, { value: number }>
}

export interface AlertItem {
  id: number
  stockName: string
  code: string
  preset: PresetType
  message: string
  currentPrice?: number
  targetPrice?: number
  timestamp: number
}

export interface PriceData {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Stock {
  name: string
  code: string
  market: string
  sector?: string
  per?: number
  pbr?: number
  sectorPer?: number
  sectorPbr?: number
}

export interface PresetType {
  id: string
  name: string
  icon: string
  description: string
  stages: string[]
  severity: string
  color: string
  hasInput?: boolean
  inputLabel?: string
  inputDefault?: number
}

export interface ProfitStage {
  label: string
  color: string
  range: string
  methods: string[]
}

export interface EarningsData {
  name: string
  nextEarningsDate: string
  lastEarnings: {
    surprise: number
  }
}

export interface User {
  membership: 'free' | 'premium'
  email: string
}
