import type { Position, ChartDataPoint, PresetSettings, SellPrices } from '../types';

// ============================================
// 계산 유틸리티 함수들
// ============================================

// 매도 가격 계산
export const calculateSellPrices = (
  position: Position, 
  priceData?: ChartDataPoint[], 
  presetSettings?: PresetSettings
): SellPrices => {
  const prices: SellPrices = {};
  
  // 손절가
  if (presetSettings?.stopLoss) {
    prices.stopLoss = Math.round(position.buyPrice * (1 + (presetSettings.stopLoss.value || -5) / 100));
  }
  
  // 2/3 익절가 - 보유 중 최고가 기준으로 계산
  if (position.currentPrice > position.buyPrice) {
    // highestPriceRecorded가 있으면 사용, 없으면 currentPrice 사용 (호환성)
    const highestPrice = position.highestPriceRecorded || position.currentPrice;
    prices.twoThird = Math.round(highestPrice - (highestPrice - position.buyPrice) / 3);
  }
  
  // 이동평균선
  if (priceData && priceData.length > 0) {
    const maPeriod = presetSettings?.maSignal?.value || 20;
    if (priceData.length >= maPeriod) {
      const recentPrices = priceData.slice(-maPeriod);
      const sum = recentPrices.reduce((acc, d) => acc + d.close, 0);
      prices.maSignal = Math.round(sum / maPeriod);
    }
  }
  
  // 3봉 매도법
  if (priceData && priceData.length >= 2) {
    const prevCandle = priceData[priceData.length - 2];
    if (prevCandle.close > prevCandle.open) {
      prices.candle3_50 = Math.round(prevCandle.close - (prevCandle.close - prevCandle.open) * 0.5);
    }
  }
  
  return prices;
};

// D-Day 계산
export const calculateDDay = (dateStr: string): string => {
  const targetDate = new Date(dateStr);
  const today = new Date();
  const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
};

// 모의 가격 데이터 생성
export const generateMockPriceData = (basePrice: number, days: number = 60): ChartDataPoint[] => {
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

// 한국식 숫자 포맷 (억, 만)
export const formatKoreanNumber = (num: number): string => {
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
  if (num >= 10000) return `${(num / 10000).toFixed(0)}만`;
  return num.toLocaleString();
};

// 퍼센트 포맷 (+/- 기호 포함)
export const formatPercent = (num: number): string => {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};
