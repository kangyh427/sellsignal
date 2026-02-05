'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ============================================
// TypeScript 인터페이스 정의
// ============================================

// 매도 프리셋 타입
interface SellPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  stages: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  color: string;
  hasInput?: boolean;
  inputLabel?: string;
  inputDefault?: number;
}

// 프리셋 설정 타입
interface PresetSettings {
  [key: string]: {
    value: number;
  };
}

// 주식 종목 타입
interface Stock {
  name: string;
  code: string;
  market: string;
  sector: string;
  per: number;
  pbr: number;
  sectorPer: number;
  sectorPbr: number;
}

// 포지션 타입
interface Position {
  id: string;
  stock: Stock;
  buyPrice: number;
  quantity: number;
  currentPrice: number;
  buyDate: string;
  selectedPresets: string[];
  presetSettings?: PresetSettings;
  memo?: string;
  alerts?: Alert[];
  priceHistory?: PricePoint[];
}

// 가격 데이터 타입
interface PricePoint {
  date: string;
  price: number;
  volume?: number;
}

// 차트 데이터 타입 (내부용)
interface ChartDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 알림 타입
interface Alert {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 반응형 훅 반환 타입
interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

// 사용자 타입
interface User {
  name: string;
  email: string;
  membership: 'free' | 'premium';
}

// Form 상태 타입
interface FormState {
  stockCode: string;
  buyPrice: string;
  quantity: string;
  buyDate: string;
  selectedPresets: string[];
  presetSettings: PresetSettings;
  memo: string;
}

// 헤더 Props 타입
interface ResponsiveHeaderProps {
  alerts: Alert[];
  isPremium: boolean;
  isMobile: boolean;
  onUpgrade: () => void;
}

// 모달 Props 타입
interface StockModalProps {
  stock?: Position;
  onSave: (position: Position) => void;
  onClose: () => void;
}

// ============================================
// 반응형 설정 및 훅
// ============================================
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1400
};

// 반응형 훅 - Hydration 문제 완전 해결
const useResponsive = (): ResponsiveState => {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SSR 단계에서는 데스크톱 기본값 반환
  if (!mounted) {
    return {
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWide: false,
    };
  }

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < BREAKPOINTS.tablet,
    isTablet: windowSize.width >= BREAKPOINTS.tablet && windowSize.width < BREAKPOINTS.desktop,
    isDesktop: windowSize.width >= BREAKPOINTS.desktop,
    isWide: windowSize.width >= BREAKPOINTS.wide,
  };
};

// 반응형 스타일 헬퍼
const getResponsiveValue = <T,>(isMobile: boolean, isTablet: boolean, mobileVal: T, tabletVal: T, desktopVal: T): T => {
  if (isMobile) return mobileVal;
  if (isTablet) return tabletVal;
  return desktopVal;
};

// ============================================
// 매도의 기술 프리셋 정의
// ============================================
const SELL_PRESETS: Record<string, SellPreset> = {
  candle3: { id: 'candle3', name: '봉 3개 매도법', icon: '📊', description: '음봉이 직전 양봉의 50% 이상 덮을 때', stages: ['initial', 'profit5'], severity: 'high', color: '#f59e0b' },
  stopLoss: { id: 'stopLoss', name: '손실제한 매도법', icon: '🛑', description: '매수가 대비 설정% 도달 시', stages: ['initial', 'profit5'], hasInput: true, inputLabel: '손절 기준 (%)', inputDefault: -5, severity: 'critical', color: '#ef4444' },
  twoThird: { id: 'twoThird', name: '2/3 익절 매도법', icon: '📈', description: '최고 수익 대비 1/3 하락 시', stages: ['profit5', 'profit10'], severity: 'medium', color: '#8b5cf6' },
  maSignal: { id: 'maSignal', name: '이동평균선 매도법', icon: '📉', description: '이동평균선 하향 돌파 시', stages: ['profit5', 'profit10'], hasInput: true, inputLabel: '이동평균 기간 (일)', inputDefault: 20, severity: 'high', color: '#06b6d4' },
  volumeZone: { id: 'volumeZone', name: '매물대 매도법', icon: '🏔️', description: '저항대 도달 후 하락 시', stages: ['profit5', 'profit10'], severity: 'medium', color: '#84cc16' },
  trendline: { id: 'trendline', name: '추세선 매도법', icon: '📍', description: '지지선/저항선 이탈 시', stages: ['profit10'], severity: 'medium', color: '#ec4899' },
  fundamental: { id: 'fundamental', name: '기업가치 반전', icon: '📰', description: '실적 발표/뉴스 모니터링', stages: ['profit10'], severity: 'high', color: '#f97316' },
  cycle: { id: 'cycle', name: '경기순환 매도법', icon: '🔄', description: '금리/경기 사이클 기반', stages: ['profit10'], severity: 'low', color: '#64748b' },
};

const PROFIT_STAGES = {
  initial: { label: '초기 단계', color: '#6b7280', range: '0~5%', methods: ['candle3', 'stopLoss'] },
  profit5: { label: '5% 수익 구간', color: '#eab308', range: '5~10%', methods: ['candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone'] },
  profit10: { label: '10%+ 수익 구간', color: '#10b981', range: '10% 이상', methods: ['twoThird', 'maSignal', 'volumeZone', 'fundamental', 'trendline', 'cycle'] },
};

const STOCK_LIST: Stock[] = [
  { name: '삼성전자', code: '005930', market: '코스피', sector: '반도체', per: 12.5, pbr: 1.2, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '삼성전자우', code: '005935', market: '코스피', sector: '반도체', per: 11.8, pbr: 1.1, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '삼성SDI', code: '006400', market: '코스피', sector: '2차전지', per: 25.3, pbr: 2.1, sectorPer: 28.5, sectorPbr: 3.2 },
  { name: '현대차', code: '005380', market: '코스피', sector: '자동차', per: 5.8, pbr: 0.6, sectorPer: 7.2, sectorPbr: 0.8 },
  { name: '한화에어로스페이스', code: '012450', market: '코스피', sector: '방산', per: 35.2, pbr: 4.5, sectorPer: 22.0, sectorPbr: 2.8 },
  { name: 'SK하이닉스', code: '000660', market: '코스피', sector: '반도체', per: 8.5, pbr: 1.8, sectorPer: 15.2, sectorPbr: 1.8 },
  { name: '네이버', code: '035420', market: '코스피', sector: 'IT서비스', per: 22.1, pbr: 1.5, sectorPer: 25.0, sectorPbr: 2.5 },
  { name: '카카오', code: '035720', market: '코스피', sector: 'IT서비스', per: 45.2, pbr: 1.8, sectorPer: 25.0, sectorPbr: 2.5 },
  { name: 'LG화학', code: '051910', market: '코스피', sector: '화학', per: 18.5, pbr: 1.2, sectorPer: 12.0, sectorPbr: 0.9 },
  { name: 'POSCO홀딩스', code: '005490', market: '코스피', sector: '철강', per: 8.2, pbr: 0.5, sectorPer: 6.5, sectorPbr: 0.4 },
  { name: '셀트리온', code: '068270', market: '코스피', sector: '바이오', per: 32.5, pbr: 3.8, sectorPer: 45.0, sectorPbr: 5.2 },
  { name: '기아', code: '000270', market: '코스피', sector: '자동차', per: 4.5, pbr: 0.7, sectorPer: 7.2, sectorPbr: 0.8 },
  { name: 'KB금융', code: '105560', market: '코스피', sector: '금융', per: 5.2, pbr: 0.5, sectorPer: 5.8, sectorPbr: 0.45 },
];

const EARNINGS_DATA: Record<string, { name: string; nextEarningsDate: string; lastEarnings: { surprise: number } }> = {
  '005930': { name: '삼성전자', nextEarningsDate: '2026-04-25', lastEarnings: { surprise: 5.2 } },
  '005380': { name: '현대차', nextEarningsDate: '2026-04-22', lastEarnings: { surprise: 8.3 } },
  '012450': { name: '한화에어로스페이스', nextEarningsDate: '2026-05-10', lastEarnings: { surprise: 15.8 } },
  '000660': { name: 'SK하이닉스', nextEarningsDate: '2026-04-23', lastEarnings: { surprise: 12.5 } },
  '035420': { name: '네이버', nextEarningsDate: '2026-04-28', lastEarnings: { surprise: -2.5 } },
};

const MARKET_CYCLE = { 
  currentPhase: 4, 
  phaseName: '금리인상 논의',
  description: '금리 고점 근처, 과열 조정 국면',
  recommendation: '매도 관망',
  interestRate: 3.5, 
  confidence: 75, 
  details: { kospiPer: 11.8, bondYield: 3.52, fedRate: 4.5 } 
};

// ============================================
// 유틸리티 함수들
// ============================================
const generateMockPriceData = (basePrice: number, days: number = 60): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let price = basePrice;
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.47) * basePrice * 0.025;
    price = Math.max(price + change, basePrice * 0.7);
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    data.push({ 
      date: new Date(Date.now() - (days - i) * 86400000), 
      open, 
      high, 
      low, 
      close, 
      volume: Math.floor(Math.random() * 1000000 + 500000) 
    });
  }
  return data;
};

const formatKoreanNumber = (num: number): string => {
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
  if (num >= 10000) return `${(num / 10000).toFixed(0)}만`;
  return num.toLocaleString();
};

const formatPercent = (num: number): string => {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

// ============================================
// 서브 컴포넌트들 (타입 적용 완료)
// ============================================

// 헤더 컴포넌트
const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ alerts, isPremium, isMobile, onUpgrade }) => {
  const unreadCount = alerts.filter((a: Alert) => !a.read).length;
  
  return (
    <header style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      padding: isMobile ? '12px 16px' : '16px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        <div style={{ 
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}>
          매도의 기술
        </div>
        {!isMobile && (
          <span style={{
            fontSize: '11px',
            background: 'rgba(139,92,246,0.2)',
            color: '#a78bfa',
            padding: '3px 8px',
            borderRadius: '4px',
            fontWeight: '600',
          }}>
            v1.0
          </span>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        {!isPremium && (
          <button
            onClick={onUpgrade}
            style={{
              padding: isMobile ? '6px 10px' : '8px 14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
            }}
          >
            {isMobile ? '👑 프리미엄' : '👑 프리미엄 업그레이드'}
          </button>
        )}
        
        <div style={{ position: 'relative' }}>
          <button style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: isMobile ? '6px 8px' : '8px 10px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '18px',
          }}>
            🔔
          </button>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 5px',
              borderRadius: '10px',
              minWidth: '18px',
              textAlign: 'center',
            }}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

// 메인 앱 컴포넌트
export default function SellSignalApp() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // 상태 관리 (타입 명시)
  const [user, setUser] = useState<User>({ name: '투자자', email: 'user@example.com', membership: 'free' });
  const [positions, setPositions] = useState<Position[]>([]);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'warning', message: '삼성전자가 손절 라인에 근접했습니다', timestamp: '5분 전', read: false, severity: 'high' },
    { id: '2', type: 'info', message: 'SK하이닉스 실적 발표일이 3일 남았습니다', timestamp: '1시간 전', read: false, severity: 'medium' },
  ]);

  const isPremium = user.membership === 'premium';

  // 차트 데이터 최적화 - useMemo로 불필요한 재생성 방지
  useEffect(() => {
    if (positions.length > 0) {
      const updatedPositions = positions.map((pos: Position) => {
        // 이미 priceHistory가 있으면 재생성하지 않음
        if (pos.priceHistory && pos.priceHistory.length > 0) {
          return pos;
        }
        
        const history = generateMockPriceData(pos.buyPrice, 60);
        return {
          ...pos,
          priceHistory: history.map((d: ChartDataPoint) => ({
            date: d.date.toISOString(),
            price: d.close,
            volume: d.volume
          }))
        };
      });
      
      // 실제로 변경된 경우만 업데이트
      const hasChanges = updatedPositions.some((pos: Position, idx: number) => 
        !positions[idx].priceHistory || positions[idx].priceHistory!.length === 0
      );
      
      if (hasChanges) {
        setPositions(updatedPositions);
      }
    }
  }, [positions.length]); // positions 객체가 아닌 length만 의존

  // 포지션별 수익률 계산 (메모이제이션)
  const positionsWithProfitRate = useMemo(() => {
    return positions.map((pos: Position) => {
      const profitRate = ((pos.currentPrice - pos.buyPrice) / pos.buyPrice) * 100;
      const profitAmount = (pos.currentPrice - pos.buyPrice) * pos.quantity;
      const totalValue = pos.currentPrice * pos.quantity;
      
      return {
        ...pos,
        profitRate,
        profitAmount,
        totalValue,
      };
    });
  }, [positions]);

  // 포트폴리오 통계
  const portfolioStats = useMemo(() => {
    const totalInvestment = positions.reduce((sum: number, p: Position) => sum + (p.buyPrice * p.quantity), 0);
    const totalValue = positions.reduce((sum: number, p: Position) => sum + (p.currentPrice * p.quantity), 0);
    const totalProfit = totalValue - totalInvestment;
    const profitRate = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    return { totalInvestment, totalValue, totalProfit, profitRate };
  }, [positions]);

  // 주식 추가/편집 모달
  const StockModal: React.FC<StockModalProps> = ({ stock, onSave, onClose }) => {
    // Form 초기값 안정화 - 모든 필드에 기본값 설정
    const [form, setForm] = useState<FormState>({
      stockCode: stock?.stock.code || '',
      buyPrice: stock?.buyPrice.toString() || '',
      quantity: stock?.quantity.toString() || '',
      buyDate: stock?.buyDate || new Date().toISOString().split('T')[0],
      selectedPresets: stock?.selectedPresets || [],
      presetSettings: stock?.presetSettings || {},
      memo: stock?.memo || '',
    });

    // 자동완성 관련 상태
    const [stockInput, setStockInput] = useState(stock ? `${stock.stock.name} (${stock.stock.code})` : '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredStocks, setFilteredStocks] = useState<Stock[]>(STOCK_LIST);

    // 종목 입력 핸들러
    const handleStockInput = (value: string) => {
      setStockInput(value);
      setShowSuggestions(true);
      
      if (value.trim() === '') {
        setFilteredStocks(STOCK_LIST);
        setForm({ ...form, stockCode: '' });
      } else {
        const filtered = STOCK_LIST.filter((s: Stock) => 
          s.name.toLowerCase().includes(value.toLowerCase()) ||
          s.code.includes(value)
        );
        setFilteredStocks(filtered);
      }
    };

    // 종목 선택 핸들러
    const handleSelectStock = (selectedStock: Stock) => {
      setStockInput(`${selectedStock.name} (${selectedStock.code})`);
      setForm(prevForm => ({ 
        ...prevForm, 
        stockCode: selectedStock.code 
      }));
      setShowSuggestions(false);
    };

    const handleSave = () => {
      // 디버깅용 로그
      console.log('Form State:', form);
      console.log('Stock Input:', stockInput);
      
      let selectedStock = STOCK_LIST.find((s: Stock) => s.code === form.stockCode);
      
      // 리스트에 없는 종목이면 직접 입력된 것으로 처리
      if (!selectedStock && stockInput.trim() !== '') {
        // 종목명에서 코드 추출 시도 (예: "테슬라 (TSLA)" -> TSLA)
        const codeMatch = stockInput.match(/\(([^)]+)\)/);
        const extractedCode = codeMatch ? codeMatch[1] : '';
        
        // 추출된 코드로 다시 한번 STOCK_LIST에서 찾기
        if (extractedCode) {
          selectedStock = STOCK_LIST.find((s: Stock) => s.code === extractedCode);
        }
        
        // 그래도 없으면 직접 입력 종목으로 처리
        if (!selectedStock) {
          const stockName = stockInput.replace(/\s*\([^)]*\)\s*/, '').trim() || stockInput;
          selectedStock = {
            name: stockName,
            code: extractedCode || `CUSTOM_${Date.now()}`,
            market: '직접입력',
            sector: '기타',
            per: 0,
            pbr: 0,
            sectorPer: 0,
            sectorPbr: 0,
          };
        }
      }
      
      if (!selectedStock) {
        alert('종목을 입력해주세요');
        return;
      }

      const buyPrice = parseFloat(form.buyPrice);
      const quantity = parseInt(form.quantity);
      
      if (isNaN(buyPrice) || isNaN(quantity) || buyPrice <= 0 || quantity <= 0) {
        alert('올바른 금액과 수량을 입력해주세요');
        return;
      }

      const newPosition: Position = {
        id: stock?.id || Date.now().toString(),
        stock: selectedStock,
        buyPrice,
        quantity,
        currentPrice: buyPrice * (1 + (Math.random() * 0.2 - 0.05)),
        buyDate: form.buyDate,
        selectedPresets: form.selectedPresets,
        presetSettings: form.presetSettings,
        memo: form.memo,
        alerts: [],
        priceHistory: [],
      };

      console.log('Saving Position:', newPosition);
      onSave(newPosition);
    };

    const togglePreset = (presetId: string) => {
      setForm(prev => ({
        ...prev,
        selectedPresets: prev.selectedPresets.includes(presetId)
          ? prev.selectedPresets.filter((id: string) => id !== presetId)
          : [...prev.selectedPresets, presetId],
        // 프리셋 설정 초기화 (undefined 방지)
        presetSettings: {
          ...prev.presetSettings,
          [presetId]: prev.presetSettings[presetId] || { value: SELL_PRESETS[presetId].inputDefault || 0 }
        }
      }));
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '16px' : '20px',
      }}
      onClick={() => setShowSuggestions(false)}
      >
        <div style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: isMobile ? '20px' : '28px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: '700', 
            color: '#fff', 
            marginBottom: '20px' 
          }}>
            {stock ? '종목 정보 수정' : '종목 추가'}
          </h2>

          {/* 종목 선택 */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              종목 선택 (직접 입력 가능)
            </label>
            <input
              type="text"
              value={stockInput}
              onChange={(e) => handleStockInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="종목명 또는 종목코드 입력"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
              }}
            />
            
            {/* 자동완성 드롭다운 */}
            {showSuggestions && filteredStocks.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                marginTop: '4px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                {filteredStocks.map((s: Stock) => (
                  <div
                    key={s.code}
                    onClick={() => handleSelectStock(s)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139,92,246,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {s.name} ({s.code})
                  </div>
                ))}
              </div>
            )}
            
            {/* 도움말 */}
            {stockInput && !form.stockCode && (
              <div style={{ 
                fontSize: '11px', 
                color: '#94a3b8', 
                marginTop: '4px',
                fontStyle: 'italic',
              }}>
                💡 리스트에 없는 종목도 직접 입력 가능합니다
              </div>
            )}
          </div>

          {/* 매수 정보 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                매수가
              </label>
              <input
                type="number"
                value={form.buyPrice}
                onChange={(e) => setForm(prev => ({ ...prev, buyPrice: e.target.value }))}
                placeholder="50000"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                수량
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="10"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              매수일
            </label>
            <input
              type="date"
              value={form.buyDate}
              onChange={(e) => setForm(prev => ({ ...prev, buyDate: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 매도 전략 선택 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
              매도 전략 선택
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.values(SELL_PRESETS).map((preset: SellPreset) => (
                <button
                  key={preset.id}
                  onClick={() => togglePreset(preset.id)}
                  style={{
                    padding: '10px',
                    background: form.selectedPresets.includes(preset.id)
                      ? 'rgba(139,92,246,0.2)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.selectedPresets.includes(preset.id) ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>{preset.icon} {preset.name}</div>
                  {preset.hasInput && form.selectedPresets.includes(preset.id) && (
                    <input
                      type="number"
                      value={form.presetSettings[preset.id]?.value ?? preset.inputDefault ?? 0}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        presetSettings: {
                          ...prev.presetSettings,
                          [preset.id]: { value: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={preset.inputLabel}
                      style={{
                        width: '100%',
                        marginTop: '6px',
                        padding: '4px 8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              메모
            </label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm(prev => ({ ...prev, memo: e.target.value }))}
              placeholder="투자 근거나 메모를 입력하세요"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              저장
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* 헤더 */}
      <ResponsiveHeader 
        alerts={alerts} 
        isPremium={isPremium} 
        isMobile={isMobile}
        onUpgrade={() => setShowUpgradePopup(true)}
      />

      {/* 메인 컨텐츠 */}
      <main style={{ 
        padding: isMobile ? '16px' : '24px',
        paddingBottom: isMobile ? '80px' : '24px',
      }}>
        {activeTab === 'home' && (
          <>
            {/* 포트폴리오 요약 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.1) 100%)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '24px',
              marginBottom: '20px',
              border: '1px solid rgba(139,92,246,0.2)',
            }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                총 평가금액
              </div>
              <div style={{ 
                fontSize: isMobile ? '28px' : '32px', 
                fontWeight: '800', 
                color: '#fff',
                marginBottom: '8px',
              }}>
                {formatKoreanNumber(portfolioStats.totalValue)}원
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                fontSize: '13px',
                color: portfolioStats.profitRate >= 0 ? '#10b981' : '#ef4444',
              }}>
                <span>{formatPercent(portfolioStats.profitRate)}</span>
                <span>{formatKoreanNumber(portfolioStats.totalProfit)}원</span>
              </div>
            </div>

            {/* 포지션 리스트 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                  보유 종목 ({positions.length})
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '8px 14px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  + 추가
                </button>
              </div>

              {positions.length === 0 ? (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                  <div style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '16px' }}>
                    아직 등록된 종목이 없습니다
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    첫 종목 추가하기
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {positionsWithProfitRate.map((pos: any) => (
                    <div
                      key={pos.id}
                      onClick={() => setEditingPosition(pos)}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        padding: isMobile ? '16px' : '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                            {pos.stock.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {pos.quantity}주 · 매수가 {formatKoreanNumber(pos.buyPrice)}원
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: '700',
                            color: pos.profitRate >= 0 ? '#10b981' : '#ef4444',
                          }}>
                            {formatPercent(pos.profitRate)}
                          </div>
                          <div style={{ 
                            fontSize: '13px',
                            color: pos.profitRate >= 0 ? '#10b981' : '#ef4444',
                          }}>
                            {formatKoreanNumber(pos.profitAmount)}원
                          </div>
                        </div>
                      </div>
                      
                      {pos.selectedPresets.length > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          gap: '6px', 
                          flexWrap: 'wrap',
                          marginTop: '10px',
                        }}>
                          {pos.selectedPresets.map((presetId: string) => (
                            <span
                              key={presetId}
                              style={{
                                fontSize: '11px',
                                padding: '4px 8px',
                                background: 'rgba(139,92,246,0.2)',
                                color: '#a78bfa',
                                borderRadius: '4px',
                              }}
                            >
                              {SELL_PRESETS[presetId].icon} {SELL_PRESETS[presetId].name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'analysis' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px', 
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>
              상세 분석 기능 준비 중입니다
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px', 
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚙️</div>
            <div style={{ fontSize: '15px', color: '#94a3b8' }}>
              설정 기능 준비 중입니다
            </div>
          </div>
        )}
      </main>

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
          zIndex: 100,
        }}>
          {[
            { id: 'home', icon: '🏠', label: '홈', badge: 0 },
            { id: 'analysis', icon: '📊', label: '분석', badge: 0 },
            { id: 'alerts', icon: '🔔', label: '알림', badge: alerts.filter(a => !a.read).length },
            { id: 'settings', icon: '⚙️', label: '설정', badge: 0 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ 
                fontSize: '10px', 
                color: activeTab === item.id ? '#60a5fa' : '#64748b',
                fontWeight: activeTab === item.id ? '600' : '400',
              }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '6px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '1px 5px',
                  borderRadius: '6px',
                  minWidth: '16px',
                  textAlign: 'center',
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      )}

      {/* 모달들 */}
      {showAddModal && (
        <StockModal 
          onSave={(stock: Position) => { 
            setPositions(prev => [...prev, { ...stock, id: Date.now().toString() }]); 
            setShowAddModal(false); 
          }} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      {editingPosition && (
        <StockModal 
          stock={editingPosition} 
          onSave={(stock: Position) => { 
            setPositions(prev => prev.map(p => p.id === stock.id ? stock : p)); 
            setEditingPosition(null); 
          }} 
          onClose={() => setEditingPosition(null)} 
        />
      )}

      {/* 업그레이드 팝업 */}
      {showUpgradePopup && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.9)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: isMobile ? '16px' : '40px',
        }}>
          <div style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '20px', 
            padding: isMobile ? '20px' : '32px', 
            maxWidth: '420px', 
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 60px rgba(139,92,246,0.2)'
          }}>
            {/* 헤더 */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>👑</div>
              <h2 style={{ 
                fontSize: isMobile ? '22px' : '26px', 
                fontWeight: '700', 
                color: '#fff', 
                margin: '0 0 8px' 
              }}>프리미엄 멤버십</h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#94a3b8', 
                margin: 0
              }}>더 강력한 매도 시그널 도구를 경험하세요</p>
            </div>
            
            {/* 가격 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(139,92,246,0.3)'
            }}>
              <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>월 구독료</div>
              <div style={{ 
                fontSize: isMobile ? '32px' : '36px', 
                fontWeight: '800', 
                color: '#fff'
              }}>
                ₩5,900
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>/월</span>
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                🎁 첫 7일 무료 체험
              </div>
            </div>
            
            {/* 기능 비교 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>
                ✨ 프리미엄 혜택
              </div>
              {[
                { icon: '🚫', text: '광고 완전 제거', free: '❌', premium: '✅' },
                { icon: '📊', text: '모니터링 종목 수', free: '5개', premium: '20개' },
                { icon: '🤖', text: 'AI 뉴스 분석', free: '❌', premium: '✅' },
                { icon: '📑', text: 'AI 리포트 분석', free: '❌', premium: '✅' },
                { icon: '💬', text: '카카오톡 알림', free: '❌', premium: '✅' },
                { icon: '📧', text: '이메일 리포트', free: '❌', premium: '✅' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  marginBottom: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{item.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', minWidth: '32px', textAlign: 'center' }}>{item.free}</span>
                    <span style={{ fontSize: '12px', color: '#10b981', minWidth: '32px', textAlign: 'center' }}>{item.premium}</span>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '4px', paddingRight: '12px' }}>
                <span style={{ fontSize: '10px', color: '#64748b' }}>무료</span>
                <span style={{ fontSize: '10px', color: '#10b981' }}>프리미엄</span>
              </div>
            </div>
            
            {/* 버튼 */}
            <button 
              onClick={() => { setUser({ ...user, membership: 'premium' }); setShowUpgradePopup(false); }} 
              style={{ 
                width: '100%', 
                padding: isMobile ? '16px' : '18px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff', 
                fontSize: '16px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                marginBottom: '10px',
                boxShadow: '0 4px 20px rgba(139,92,246,0.4)'
              }}
            >
              🎉 7일 무료로 시작하기
            </button>
            <button 
              onClick={() => setShowUpgradePopup(false)} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: 'transparent', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '10px',
                color: '#64748b', 
                fontSize: '14px', 
                cursor: 'pointer' 
              }}
            >
              나중에 할게요
            </button>
            
            {/* 하단 안내 */}
            <p style={{ 
              fontSize: '11px', 
              color: '#64748b', 
              textAlign: 'center', 
              margin: '16px 0 0',
              lineHeight: '1.5'
            }}>
              언제든지 해지 가능 · 자동 결제 · 부가세 포함
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
