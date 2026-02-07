// ============================================
// CREST 앱 유틸리티 함수
// ============================================
import type { Position, CandleData, SellPrices } from '../types';
import { STOCK_LIST } from '../constants';

/** 모의 가격 데이터 생성 (차트용) */
export const generateMockPriceData = (basePrice: number, days = 60): CandleData[] => {
  const data: CandleData[] = [];
  let price = basePrice;
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.47) * basePrice * 0.025;
    price = Math.max(price + change, basePrice * 0.7);
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    data.push({ date: new Date(Date.now() - (days - i) * 86400000), open, high, low, close, volume: Math.floor(Math.random() * 1000000 + 500000) });
  }
  return data;
};

/** 종목 검색 (이름 또는 코드로) */
export const searchStocks = (query: string) => {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  return STOCK_LIST.filter(stock => stock.name.toLowerCase().includes(q) || stock.code.includes(q)).slice(0, 10);
};

/** 정확한 종목 찾기 */
export const findExactStock = (query: string) => {
  if (!query) return null;
  return STOCK_LIST.find(stock => stock.name === query || stock.code === query || stock.name.toLowerCase() === query.toLowerCase());
};

/** 매도 기준가격 계산 */
export const calculateSellPrices = (position: Position, priceData: CandleData[], presetSettings: Record<string, { value: number }>): SellPrices => {
  const prices: SellPrices = {};
  prices.stopLoss = Math.round(position.buyPrice * (1 + (presetSettings?.stopLoss?.value || -5) / 100));
  if (position.highestPrice) {
    prices.twoThird = Math.round(position.highestPrice - (position.highestPrice - position.buyPrice) / 3);
  }
  const maPeriod = presetSettings?.maSignal?.value || 20;
  if (priceData && priceData.length >= maPeriod) {
    prices.maSignal = Math.round(priceData.slice(-maPeriod).reduce((sum, d) => sum + d.close, 0) / maPeriod);
  }
  if (priceData && priceData.length >= 2) {
    const prevCandle = priceData[priceData.length - 2];
    if (prevCandle.close > prevCandle.open) {
      prices.candle3_50 = Math.round(prevCandle.close - (prevCandle.close - prevCandle.open) * 0.5);
    }
  }
  
  // 매물대 매도법 - 최근 고점 저항대 (최근 20일 중 최고가의 98% 지점)
  if (priceData && priceData.length >= 20) {
    const recentHighs = priceData.slice(-20).map(d => d.high);
    const resistanceHigh = Math.max(...recentHighs);
    prices.volumeZone = Math.round(resistanceHigh * 0.98);
  }
  
  // 추세선 매도법 - 단순 지지선 (최근 20일 최저가 기준)
  if (priceData && priceData.length >= 20) {
    const recentLows = priceData.slice(-20).map(d => d.low);
    const supportLow = Math.min(...recentLows);
    prices.trendline = Math.round(supportLow * 1.02);
  }
  
  return prices;
};

/** 실적 발표일까지 D-Day 계산 */
export const calculateDDay = (dateStr: string): string => {
  const diff = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-Day';
  if (diff > 0) return 'D-' + diff;
  return 'D+' + Math.abs(diff);
};

/** 반응형 스타일 헬퍼 */
export const getResponsiveValue = <T,>(isMobile: boolean, isTablet: boolean, mobileVal: T, tabletVal: T, desktopVal: T): T => {
  if (isMobile) return mobileVal;
  if (isTablet) return tabletVal;
  return desktopVal;
};
