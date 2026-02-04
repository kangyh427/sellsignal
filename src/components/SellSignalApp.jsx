'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';

// ============================================
// 반응형 설정 및 훅
// ============================================
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1400
};

// 반응형 훅 - 화면 크기 감지
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
const getResponsiveValue = (isMobile, isTablet, mobileVal, tabletVal, desktopVal) => {
  if (isMobile) return mobileVal;
  if (isTablet) return tabletVal;
  return desktopVal;
};

// ============================================
// 매도의 기술 프리셋 정의
// ============================================
const SELL_PRESETS = {
  candle3: { id: 'candle3', name: '봉 3개 매도법', icon: '📊', description: '음봉이 직전 양봉의 50% 이상 덮을 때', stages: ['initial', 'profit5'], severity: 'high', color: '#f59e0b' },
  stopLoss: { id: 'stopLoss', name: '손실제한 매도법', icon: '🛑', description: '매수가 대비 설정% 도달 시', stages: ['initial', 'profit5'], hasInput: true, inputLabel: '손절 기준 (%)', inputDefault: -5, severity: 'critical', color: '#ef4444' },
  twoThird: { id: 'twoThird', name: '2/3 익절 매도법', icon: '📈', description: '최고 수익 대비 1/3 하락 시', stages: ['profit5', 'profit10'], severity: 'medium', color: '#8b5cf6' },
  maSignal: { id: 'maSignal', name: '이동평균선 매도법', icon: '📉', description: '이동평균선 하향 돌파 시', stages: ['profit5', 'profit10'], hasInput: true, inputLabel: '이동평균 기간 (일)', inputDefault: 20, severity: 'high', color: '#06b6d4' },
  volumeZone: { id: 'volumeZone', name: '매물대 매도법', icon: '🏔️', description: '저항대 도달 후 하락 시', stages: ['profit5', 'profit10'], severity: 'medium', color: '#84cc16' },
  trendline: { id: 'trendline', name: '추세선 매도법', icon: '📐', description: '지지선/저항선 이탈 시', stages: ['profit10'], severity: 'medium', color: '#ec4899' },
  fundamental: { id: 'fundamental', name: '기업가치 반전', icon: '📰', description: '실적 발표/뉴스 모니터링', stages: ['profit10'], severity: 'high', color: '#f97316' },
  cycle: { id: 'cycle', name: '경기순환 매도법', icon: '🔄', description: '금리/경기 사이클 기반', stages: ['profit10'], severity: 'low', color: '#64748b' },
};

const PROFIT_STAGES = {
  initial: { label: '초기 단계', color: '#6b7280', range: '0~5%', methods: ['candle3', 'stopLoss'] },
  profit5: { label: '5% 수익 구간', color: '#eab308', range: '5~10%', methods: ['candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone'] },
  profit10: { label: '10%+ 수익 구간', color: '#10b981', range: '10% 이상', methods: ['twoThird', 'maSignal', 'volumeZone', 'fundamental', 'trendline', 'cycle'] },
};

const STOCK_LIST = [
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

const EARNINGS_DATA = {
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
const generateMockPriceData = (basePrice, days = 60) => {
  const data = [];
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

const searchStocks = (query) => {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  return STOCK_LIST.filter(stock => stock.name.toLowerCase().includes(q) || stock.code.includes(q)).slice(0, 10);
};

const findExactStock = (query) => {
  if (!query) return null;
  return STOCK_LIST.find(stock => stock.name === query || stock.code === query || stock.name.toLowerCase() === query.toLowerCase());
};

const calculateSellPrices = (position, priceData, presetSettings) => {
  const prices = {};
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

const calculateDDay = (dateStr) => {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-Day';
  if (diff > 0) return 'D-' + diff;
  return 'D+' + Math.abs(diff);
};

// ============================================
// 반응형 헤더 컴포넌트
// ============================================
const ResponsiveHeader = ({ alerts, isPremium, onShowUpgrade, onShowAddModal, user, onShowAuthModal, onSignOut }) => {
  const { isMobile, isTablet } = useResponsive();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 모바일 헤더
  if (isMobile) {
    return (
      <header style={{ 
        background: 'rgba(15, 23, 42, 0.98)', 
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ 
          padding: '12px 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {/* 로고 영역 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '20px' 
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'}
              </p>
            </div>
          </div>

          {/* 우측 버튼들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 알림 배지 */}
            {alerts.length > 0 && (
              <div style={{ 
                position: 'relative',
                width: '36px',
                height: '36px',
                background: 'rgba(239,68,68,0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '18px' }}>🔔</span>
                <span style={{ 
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}>{alerts.length}</span>
              </div>
            )}

            {/* 종목 추가 버튼 */}
            <button 
              onClick={onShowAddModal}
              style={{ 
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#fff', 
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >+</button>
     {/* 로그인/로그아웃 버튼 */}
            {!user ? (
              <button 
                onClick={onShowAuthModal}
                style={{ 
                  width: '36px',
                  height: '36px',
                  background: 'rgba(16,185,129,0.15)', 
                  border: '1px solid rgba(16,185,129,0.3)', 
                  borderRadius: '10px', 
                  color: '#10b981', 
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >👤</button>
            ) : (
              <button 
                onClick={onSignOut}
                style={{ 
                  width: '36px',
                  height: '36px',
                  background: 'rgba(239,68,68,0.15)', 
                  border: '1px solid rgba(239,68,68,0.3)', 
                  borderRadius: '10px', 
                  color: '#ef4444', 
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >🚪</button>
            )}
            {/* 햄버거 메뉴 */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{ 
                width: '36px',
                height: '36px',
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#fff', 
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >☰</button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {showMobileMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backdropFilter: 'blur(10px)',
          }}>
            {!isPremium && (
              <button 
                onClick={() => { onShowUpgrade(); setShowMobileMenu(false); }}
                style={{ 
                  padding: '12px 16px', 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: '#fff', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >👑 프리미엄 업그레이드</button>
            )}
            <button 
              onClick={() => { onShowAddModal(); setShowMobileMenu(false); }}
              style={{ 
                padding: '12px 16px', 
                background: 'rgba(59, 130, 246, 0.15)', 
                border: '1px solid rgba(59, 130, 246, 0.3)', 
                borderRadius: '10px', 
                color: '#60a5fa', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >+ 종목 추가</button>
          </div>
        )}
      </header>
    );
  }

  // 태블릿 헤더
  if (isTablet) {
    return (
      <header style={{ 
        background: 'rgba(15, 23, 42, 0.95)', 
        borderBottom: '1px solid rgba(255,255,255,0.05)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '14px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          {/* 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '24px' 
            }}>📈</div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
              </p>
            </div>
          </div>

          {/* 알림 + 버튼들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {alerts.length > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 14px', 
                background: 'rgba(239,68,68,0.2)', 
                borderRadius: '10px', 
                animation: 'pulse 2s infinite' 
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
              </div>
            )}
            {!isPremium && (
              <button 
                onClick={onShowUpgrade} 
                style={{ 
                  padding: '10px 14px', 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: '#fff', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >👑 업그레이드</button>
            )}
            <button 
              onClick={onShowAddModal} 
              style={{ 
                padding: '10px 16px', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#fff', 
                fontSize: '13px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >+ 종목 추가</button>
          </div>
        </div>
      </header>
    );
  }

  // 데스크톱 헤더 (원본과 동일)
  return (
    <header style={{ 
      background: 'rgba(15, 23, 42, 0.95)', 
      borderBottom: '1px solid rgba(255,255,255,0.05)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto', 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ minWidth: '200px' }}>
          {alerts.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 16px', 
              background: 'rgba(239,68,68,0.2)', 
              borderRadius: '10px', 
              animation: 'pulse 2s infinite' 
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{alerts.length}개 알림</span>
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        }}>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '28px' 
          }}>📈</div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>매도의 기술</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isPremium ? '👑 프리미엄' : '무료회원'} · 조건 알람 도구
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          minWidth: '200px', 
          justifyContent: 'flex-end' 
        }}>
          {!isPremium && (
            <button 
              onClick={onShowUpgrade} 
              style={{ 
                padding: '12px 18px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#fff', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >👑 업그레이드</button>
          )}
          <button 
            onClick={onShowAddModal} 
            style={{ 
              padding: '12px 20px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
              border: 'none', 
              borderRadius: '10px', 
              color: '#fff', 
              fontSize: '14px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >+ 종목 추가</button>
        </div>
      </div>
    </header>
  );
};

// ============================================
// 반응형 요약 카드 컴포넌트
// ============================================
const ResponsiveSummaryCards = ({ totalCost, totalValue, totalProfit, totalProfitRate }) => {
  const { isMobile, isTablet } = useResponsive();

  const cards = [
    { label: '총 매수금액', value: '₩' + Math.round(totalCost).toLocaleString(), icon: '💵' },
    { label: '총 평가금액', value: '₩' + Math.round(totalValue).toLocaleString(), icon: '💰' },
    { label: '총 평가손익', value: (totalProfit >= 0 ? '+' : '') + '₩' + Math.round(totalProfit).toLocaleString(), color: totalProfit >= 0 ? '#10b981' : '#ef4444', icon: '📈' },
    { label: '총 수익률', value: (totalProfitRate >= 0 ? '+' : '') + totalProfitRate.toFixed(2) + '%', color: totalProfitRate >= 0 ? '#10b981' : '#ef4444', icon: '🎯' },
  ];

  // 모바일: 2x2 그리드 또는 스크롤 가능한 가로 배열
  if (isMobile) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '10px', 
        marginBottom: '16px',
        padding: '0 16px',
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '10px', 
            padding: '12px', 
            border: '1px solid rgba(255,255,255,0.08)' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              marginBottom: '4px' 
            }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{card.label}</span>
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: card.color || '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{card.value}</div>
          </div>
        ))}
      </div>
    );
  }

  // 태블릿: 4열 그리드 (작은 패딩)
  if (isTablet) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '12px', 
        marginBottom: '18px',
        padding: '0 20px',
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{ 
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '10px', 
            padding: '14px', 
            border: '1px solid rgba(255,255,255,0.08)' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              marginBottom: '5px' 
            }}>
              <span style={{ fontSize: '14px' }}>{card.icon}</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{card.label}</span>
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: card.color || '#fff' 
            }}>{card.value}</div>
          </div>
        ))}
      </div>
    );
  }

  // 데스크톱: 원본 스타일
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '14px', 
      marginBottom: '20px' 
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{ 
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
          borderRadius: '12px', 
          padding: '16px', 
          border: '1px solid rgba(255,255,255,0.08)' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            marginBottom: '6px' 
          }}>
            <span style={{ fontSize: '16px' }}>{card.icon}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{card.label}</span>
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: '700', 
            color: card.color || '#fff' 
          }}>{card.value}</div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// 반응형 캔들 차트 컴포넌트
// ============================================
// 캔들 차트 컴포넌트 - X축 날짜 & Y축 가격 개선
// ============================================
const EnhancedCandleChart = ({ data, width = 270, height = 280, buyPrice, sellPrices, visibleLines }) => {
  if (!data || data.length === 0) return null;
  
  // 차트 크기에 따른 폰트 크기 결정
  const isSmallChart = width < 280;
  const fontSize = {
    xAxis: isSmallChart ? 10 : 11,
    yAxis: isSmallChart ? 9 : 10,
    label: isSmallChart ? 8 : 9
  };
  
  const padding = { top: 10, right: 70, bottom: 34, left: 6 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  
  const allPrices = data.flatMap(d => [d.high, d.low]).concat([buyPrice]).concat(Object.values(sellPrices || {}).filter(Boolean));
  const minP = Math.min(...allPrices) * 0.98;
  const maxP = Math.max(...allPrices) * 1.02;
  const range = maxP - minP || 1;
  const candleW = Math.max(3, (chartW / data.length) - 1.5);
  
  const scaleY = (p) => padding.top + chartH - ((p - minP) / range) * chartH;
  const scaleX = (i) => padding.left + (i / data.length) * chartW;
  const currentPrice = data[data.length - 1]?.close || buyPrice;

  // 날짜 포맷 - 월/일 형식
  const formatDate = (date) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}/${day}`;
  };

  // X축 날짜 표시 위치 계산 - 항상 5개 이상 표시
  const getXAxisIndices = () => {
    const dataLen = data.length;
    // 기본적으로 5~6개 표시 (차트 크기와 무관하게)
    if (dataLen <= 10) {
      // 데이터가 적으면 전체 표시
      return Array.from({ length: dataLen }, (_, i) => i).filter((_, i) => i % 2 === 0);
    } else if (dataLen <= 20) {
      // 5개 표시
      return [
        0, 
        Math.floor(dataLen * 0.25), 
        Math.floor(dataLen * 0.5), 
        Math.floor(dataLen * 0.75), 
        dataLen - 1
      ];
    } else {
      // 6개 표시
      return [
        0, 
        Math.floor(dataLen * 0.2), 
        Math.floor(dataLen * 0.4), 
        Math.floor(dataLen * 0.6), 
        Math.floor(dataLen * 0.8), 
        dataLen - 1
      ];
    }
  };
  
  const xAxisIndices = getXAxisIndices();
  
  // 가격 포맷 - 실제 가격 (콤마 포함)
  const formatPrice = (price) => {
    return Math.round(price).toLocaleString();
  };

  return (
    <svg width={width} height={height} style={{ display: 'block', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
      {/* Y축 그리드 및 가격 라벨 - 5단계 */}
      {[0,1,2,3,4].map(i => {
        const price = minP + (range * i / 4);
        const y = scaleY(price);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.12)" strokeDasharray="3,3" />
            <text 
              x={width - padding.right + 4} 
              y={y + 4} 
              fill="#d4d4d8" 
              fontSize={fontSize.yAxis}
              fontWeight="600"
            >
              {formatPrice(price)}
            </text>
          </g>
        );
      })}
      
      {/* X축 기준선 */}
      <line 
        x1={padding.left} 
        y1={height - padding.bottom} 
        x2={width - padding.right} 
        y2={height - padding.bottom} 
        stroke="rgba(255,255,255,0.2)" 
      />
      
      {/* X축 날짜 라벨 - 5~6개 */}
      {xAxisIndices.map((idx, i) => {
        if (idx >= data.length || !data[idx]?.date) return null;
        const x = scaleX(idx) + candleW / 2;
        return (
          <g key={`x-${i}`}>
            {/* 눈금선 */}
            <line 
              x1={x} 
              y1={height - padding.bottom} 
              x2={x} 
              y2={height - padding.bottom + 4} 
              stroke="rgba(255,255,255,0.4)" 
            />
            {/* 날짜 텍스트 */}
            <text 
              x={x} 
              y={height - padding.bottom + 18} 
              fill="#d4d4d8" 
              fontSize={fontSize.xAxis} 
              textAnchor="middle"
              fontWeight="600"
            >
              {formatDate(data[idx].date)}
            </text>
          </g>
        );
      })}
      
      {/* 캔들 */}
      {data.map((c, i) => {
        const x = scaleX(i);
        const isUp = c.close >= c.open;
        const color = isUp ? '#10b981' : '#ef4444';
        return (
          <g key={i}>
            <line x1={x + candleW/2} y1={scaleY(c.high)} x2={x + candleW/2} y2={scaleY(c.low)} stroke={color} strokeWidth={1} />
            <rect x={x} y={scaleY(Math.max(c.open, c.close))} width={candleW} height={Math.max(1, Math.abs(scaleY(c.open) - scaleY(c.close)))} fill={color} />
          </g>
        );
      })}
      
      {/* 매수가 라인 */}
      <line x1={padding.left} y1={scaleY(buyPrice)} x2={width - padding.right} y2={scaleY(buyPrice)} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4,2"/>
      <rect x={width - padding.right} y={scaleY(buyPrice) - 8} width={66} height={16} fill="#3b82f6" rx={2} />
      <text x={width - padding.right + 3} y={scaleY(buyPrice) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">매수 {buyPrice.toLocaleString()}</text>
      
      {/* 손절가 라인 */}
      {visibleLines?.stopLoss && sellPrices?.stopLoss && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.stopLoss)} x2={width - padding.right} y2={scaleY(sellPrices.stopLoss)} stroke="#ef4444" strokeWidth={1.5}/>
          <rect x={width - padding.right} y={scaleY(sellPrices.stopLoss) - 8} width={66} height={16} fill="#ef4444" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.stopLoss) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">손절 {sellPrices.stopLoss.toLocaleString()}</text>
        </g>
      )}
      
      {/* 2/3 익절가 라인 */}
      {visibleLines?.twoThird && sellPrices?.twoThird && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.twoThird)} x2={width - padding.right} y2={scaleY(sellPrices.twoThird)} stroke="#8b5cf6" strokeWidth={1.5}/>
          <rect x={width - padding.right} y={scaleY(sellPrices.twoThird) - 8} width={66} height={16} fill="#8b5cf6" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.twoThird) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">2/3익 {sellPrices.twoThird.toLocaleString()}</text>
        </g>
      )}
      
      {/* 이동평균선 라인 */}
      {visibleLines?.maSignal && sellPrices?.maSignal && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.maSignal)} x2={width - padding.right} y2={scaleY(sellPrices.maSignal)} stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4,2"/>
          <rect x={width - padding.right} y={scaleY(sellPrices.maSignal) - 8} width={66} height={16} fill="#06b6d4" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.maSignal) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">이평 {sellPrices.maSignal.toLocaleString()}</text>
        </g>
      )}
      
      {/* 매물대 라인 (저항대) */}
      {visibleLines?.volumeZone && sellPrices?.volumeZone && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.volumeZone)} x2={width - padding.right} y2={scaleY(sellPrices.volumeZone)} stroke="#84cc16" strokeWidth={1.5} strokeDasharray="6,3"/>
          <rect x={width - padding.right} y={scaleY(sellPrices.volumeZone) - 8} width={66} height={16} fill="#84cc16" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.volumeZone) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">저항 {sellPrices.volumeZone.toLocaleString()}</text>
        </g>
      )}
      
      {/* 추세선 라인 (지지선) */}
      {visibleLines?.trendline && sellPrices?.trendline && (
        <g>
          <line x1={padding.left} y1={scaleY(sellPrices.trendline)} x2={width - padding.right} y2={scaleY(sellPrices.trendline)} stroke="#ec4899" strokeWidth={1.5} strokeDasharray="8,4"/>
          <rect x={width - padding.right} y={scaleY(sellPrices.trendline) - 8} width={66} height={16} fill="#ec4899" rx={2} />
          <text x={width - padding.right + 3} y={scaleY(sellPrices.trendline) + 4} fill="#fff" fontSize={fontSize.label} fontWeight="600">지지 {sellPrices.trendline.toLocaleString()}</text>
        </g>
      )}
      
      {/* 현재가 표시 */}
      <circle cx={scaleX(data.length - 1) + candleW/2} cy={scaleY(currentPrice)} r={4} fill={currentPrice >= buyPrice ? '#10b981' : '#ef4444'} stroke="#fff" strokeWidth={1} />
    </svg>
  );
};

// ============================================
// 코스톨라니 달걀 위젯 - 완전 SVG 구현
// ============================================
const MarketCycleWidget = ({ isPremium }) => {
  const { isMobile, isTablet } = useResponsive();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 현재 경기 사이클 단계 (1~6)
  const currentPhase = 4; // 금리고점 근처, 주식매도 시기
  const currentPhaseRange = [70, 110]; // 현재 위치 범위 (각도, 90도가 금리고점)
  
  // 6단계 정의 (시계방향: D→C→B→A→F→E→D)
  const phases = [
    { id: 1, name: 'D', label: '금리저점', subLabel: '살 때', action: '주식매수', color: '#10b981', angle: 270 },
    { id: 2, name: 'C', label: 'B3', subLabel: '부동산투자', action: '채권매도', color: '#22c55e', angle: 315 },
    { id: 3, name: 'B', label: 'B1-B2', subLabel: '예금인출', action: '채권투자', color: '#eab308', angle: 0 },
    { id: 4, name: 'A', label: '금리고점', subLabel: '팔 때', action: '주식매도', color: '#ef4444', angle: 90 },
    { id: 5, name: 'F', label: 'A3', subLabel: '예금입금', action: '주식매도', color: '#f97316', angle: 135 },
    { id: 6, name: 'E', label: 'A1-A2', subLabel: '주식투자', action: '부동산매도', color: '#3b82f6', angle: 225 },
  ];
  
  const currentPhaseData = phases.find(p => p.id === currentPhase) || phases[3];
  
  // 추천 행동
  const getRecommendation = (phase) => {
    if (phase <= 2) return { text: '매수 적기', color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
    if (phase === 3) return { text: '기다릴 때', color: '#eab308', bg: 'rgba(234,179,8,0.15)' };
    if (phase >= 4) return { text: '매도 관망', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
    return { text: '관망', color: '#64748b', bg: 'rgba(100,116,139,0.15)' };
  };
  
  const recommendation = getRecommendation(currentPhase);
  
  // SVG 크기 계산
  const svgSize = isMobile ? 200 : isTablet ? 220 : 240;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radiusX = isMobile ? 70 : 85; // 달걀 가로 반지름
  const radiusY = isMobile ? 85 : 100; // 달걀 세로 반지름 (세로가 더 김)

  // 달걀 위의 점 위치 계산 (각도 기반)
  const getPointOnEgg = (angleDeg) => {
    const angleRad = (angleDeg - 90) * Math.PI / 180;
    // 달걀 모양을 위해 상단을 약간 좁게
    const topFactor = angleDeg > 45 && angleDeg < 135 ? 0.85 : 1;
    const x = centerX + radiusX * Math.cos(angleRad) * topFactor;
    const y = centerY + radiusY * Math.sin(angleRad);
    return { x, y };
  };

  return (
    <div style={{ 
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
      borderRadius: '14px', 
      padding: isMobile ? '12px' : '16px', 
      marginBottom: '12px', 
      border: '1px solid rgba(255,255,255,0.08)' 
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '12px' 
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '14px' : '15px', 
          fontWeight: '600', 
          color: '#fff', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🥚 코스톨라니 달걀
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>신뢰도 75%</span>
          {isPremium && (
            <button 
              onClick={() => {
                setIsAnalyzing(true);
                setTimeout(() => setIsAnalyzing(false), 1500);
              }}
              disabled={isAnalyzing}
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '4px 10px', 
                color: '#fff', 
                fontSize: '10px', 
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                opacity: isAnalyzing ? 0.6 : 1
              }}
            >
              {isAnalyzing ? '분석중...' : '🤖 AI'}
            </button>
          )}
        </div>
      </div>
      
      {/* 달걀 SVG + 현재 상태 */}
      <div style={{ 
        display: 'flex', 
        alignItems: isMobile ? 'center' : 'flex-start',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        marginBottom: '12px'
      }}>
        {/* 달걀 SVG */}
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ flexShrink: 0 }}
        >
          <defs>
            {/* 배경 그라디언트 - 호황기/불황기 */}
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(251,191,36,0.15)" />
              <stop offset="50%" stopColor="rgba(251,191,36,0.05)" />
              <stop offset="50%" stopColor="rgba(147,197,253,0.05)" />
              <stop offset="100%" stopColor="rgba(147,197,253,0.15)" />
            </linearGradient>
            {/* 달걀 그라디언트 */}
            <radialGradient id="eggGradient" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#fcd9b6" />
              <stop offset="100%" stopColor="#f5c89a" />
            </radialGradient>
            {/* 매수 영역 그라디언트 */}
            <linearGradient id="buyZone" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
              <stop offset="100%" stopColor="rgba(16,185,129,0.05)" />
            </linearGradient>
            {/* 매도 영역 그라디언트 */}
            <linearGradient id="sellZone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(239,68,68,0.3)" />
              <stop offset="100%" stopColor="rgba(239,68,68,0.05)" />
            </linearGradient>
          </defs>
          
          {/* 배경 */}
          <rect x="0" y="0" width={svgSize} height={svgSize} fill="url(#bgGradient)" rx="8" />
          
          {/* 호황기/불황기 라벨 */}
          <text x="15" y="18" fill="#fbbf24" fontSize="9" fontWeight="600">호황기</text>
          <text x={svgSize - 40} y="18" fill="#93c5fd" fontSize="9" fontWeight="600">불황기</text>
          
          {/* 경기성숙/경기침체 중앙선 */}
          <line 
            x1="10" y1={centerY} 
            x2={svgSize - 10} y2={centerY} 
            stroke="rgba(255,255,255,0.15)" 
            strokeDasharray="3,3" 
          />
          <text x="12" y={centerY - 5} fill="#64748b" fontSize="8">경기성숙</text>
          <text x={svgSize - 45} y={centerY - 5} fill="#64748b" fontSize="8">경기침체</text>
          
          {/* 달걀 모양 (타원) */}
          <ellipse 
            cx={centerX} 
            cy={centerY} 
            rx={radiusX} 
            ry={radiusY} 
            fill="url(#eggGradient)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="2"
          />
          
          {/* 달걀 내부 영역 구분선 */}
          <line 
            x1={centerX - radiusX + 15} y1={centerY - radiusY * 0.35}
            x2={centerX + radiusX - 15} y2={centerY - radiusY * 0.35}
            stroke="rgba(0,0,0,0.15)"
            strokeDasharray="4,2"
          />
          <line 
            x1={centerX - radiusX + 10} y1={centerY + radiusY * 0.35}
            x2={centerX + radiusX - 10} y2={centerY + radiusY * 0.35}
            stroke="rgba(0,0,0,0.15)"
            strokeDasharray="4,2"
          />
          
          {/* 달걀 내부 텍스트 */}
          <text x={centerX} y={centerY - radiusY * 0.55} textAnchor="middle" fill="#c0392b" fontSize={isMobile ? '11' : '13'} fontWeight="700">팔 때</text>
          <text x={centerX} y={centerY + 4} textAnchor="middle" fill="#7f8c8d" fontSize={isMobile ? '10' : '12'} fontWeight="600">기다릴 때</text>
          <text x={centerX} y={centerY + radiusY * 0.6} textAnchor="middle" fill="#27ae60" fontSize={isMobile ? '11' : '13'} fontWeight="700">살 때</text>
          
          {/* 금리고점 (상단) */}
          <text x={centerX} y={centerY - radiusY - 12} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">금리고점</text>
          
          {/* 금리저점 (하단) */}
          <text x={centerX} y={centerY + radiusY + 18} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">금리저점</text>
          
          {/* 금리상승기 화살표 (좌측) - 깔끔한 직선 */}
          <line 
            x1={centerX - radiusX - 10} 
            y1={centerY + 35} 
            x2={centerX - radiusX - 10} 
            y2={centerY - 35}
            stroke="#ef4444"
            strokeWidth="2"
          />
          {/* 화살표 머리 */}
          <polygon 
            points={`${centerX - radiusX - 10},${centerY - 40} ${centerX - radiusX - 15},${centerY - 30} ${centerX - radiusX - 5},${centerY - 30}`}
            fill="#ef4444"
          />
          <text x={centerX - radiusX - 20} y={centerY} textAnchor="middle" fill="#ef4444" fontSize="8" transform={`rotate(-90, ${centerX - radiusX - 20}, ${centerY})`}>금리↑</text>
          
          {/* 금리하락기 화살표 (우측) - 깔끔한 직선 */}
          <line 
            x1={centerX + radiusX + 10} 
            y1={centerY - 35} 
            x2={centerX + radiusX + 10} 
            y2={centerY + 35}
            stroke="#3b82f6"
            strokeWidth="2"
          />
          {/* 화살표 머리 */}
          <polygon 
            points={`${centerX + radiusX + 10},${centerY + 40} ${centerX + radiusX + 5},${centerY + 30} ${centerX + radiusX + 15},${centerY + 30}`}
            fill="#3b82f6"
          />
          <text x={centerX + radiusX + 20} y={centerY} textAnchor="middle" fill="#3b82f6" fontSize="8" transform={`rotate(90, ${centerX + radiusX + 20}, ${centerY})`}>금리↓</text>
          
          {/* 현재 위치를 달걀 내부에 부채꼴 영역으로 표현 */}
          {(() => {
            const startAngle = (currentPhaseRange[0] - 90) * Math.PI / 180;
            const endAngle = (currentPhaseRange[1] - 90) * Math.PI / 180;
            
            // 달걀 경계의 시작점과 끝점
            const x1 = centerX + (radiusX - 5) * Math.cos(startAngle);
            const y1 = centerY + (radiusY - 5) * Math.sin(startAngle);
            const x2 = centerX + (radiusX - 5) * Math.cos(endAngle);
            const y2 = centerY + (radiusY - 5) * Math.sin(endAngle);
            
            return (
              <g>
                {/* 부채꼴 영역 (중심에서 경계까지) */}
                <path 
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radiusX - 5} ${radiusY - 5} 0 0 1 ${x2} ${y2} Z`}
                  fill="rgba(239,68,68,0.35)"
                  stroke="rgba(239,68,68,0.8)"
                  strokeWidth="2"
                />
                {/* 펄스 애니메이션 */}
                <path 
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radiusX - 5} ${radiusY - 5} 0 0 1 ${x2} ${y2} Z`}
                  fill="rgba(239,68,68,0.2)"
                  stroke="none"
                >
                  <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                </path>
                {/* 현재 위치 표시 점 (중앙) */}
                {(() => {
                  const midAngle = ((currentPhaseRange[0] + currentPhaseRange[1]) / 2 - 90) * Math.PI / 180;
                  const dotX = centerX + (radiusX - 25) * Math.cos(midAngle);
                  const dotY = centerY + (radiusY - 25) * Math.sin(midAngle);
                  return (
                    <>
                      <circle cx={dotX} cy={dotY} r="6" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                      <circle cx={dotX} cy={dotY} r="6" fill="none" stroke="#ef4444" strokeWidth="2">
                        <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    </>
                  );
                })()}
              </g>
            );
          })()}
          
          {/* 순환 화살표 */}
          <path 
            d={`M ${centerX + 20} ${centerY - radiusY + 25} 
                Q ${centerX + radiusX - 10} ${centerY - radiusY + 15}, ${centerX + radiusX - 5} ${centerY - 20}`}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#circleArrow)"
          />
          <defs>
            <marker id="circleArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="rgba(255,255,255,0.5)" />
            </marker>
          </defs>
        </svg>
        
        {/* 현재 상태 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 현재 단계 */}
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: recommendation.bg, 
            border: `1px solid ${recommendation.color}40`, 
            borderRadius: '8px', 
            padding: '8px 12px',
            marginBottom: '10px'
          }}>
            <span style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: currentPhaseData.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700'
            }}>{currentPhase}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: currentPhaseData.color }}>
                {currentPhaseData.label} 단계
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                {currentPhaseData.action}
              </div>
            </div>
          </div>
          
          {/* 추천 */}
          <div style={{ 
            fontSize: isMobile ? '13px' : '14px', 
            fontWeight: '700', 
            color: recommendation.color,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {recommendation.color === '#ef4444' ? '🔴' : recommendation.color === '#10b981' ? '🟢' : '🟡'}
            권장: {recommendation.text}
          </div>
          
          {/* 설명 */}
          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
            금리 고점 근처로 주식시장 과열 조정이 예상됩니다. 
            신규 매수는 자제하고 보유 종목 익절을 고려하세요.
          </div>
        </div>
      </div>
      
      {/* 지표 그리드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: '6px'
      }}>
        {[
          { label: '한은금리', value: '3.5%', icon: '🏦', trend: '▲' },
          { label: 'KOSPI PER', value: '11.8', icon: '📊', trend: '▼' },
          { label: '국채3Y', value: '3.52%', icon: '📈', trend: '▲' },
          { label: 'Fed금리', value: '4.5%', icon: '🇺🇸', trend: '−' },
        ].map((item, i) => (
          <div key={i} style={{ 
            background: 'rgba(0,0,0,0.25)', 
            borderRadius: '8px', 
            padding: isMobile ? '10px 6px' : '8px 4px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: isMobile ? '14px' : '16px', marginBottom: '2px' }}>{item.icon}</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>{item.label}</div>
            <div style={{ 
              fontSize: isMobile ? '12px' : '13px', 
              fontWeight: '700', 
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px'
            }}>
              {item.value}
              <span style={{ 
                fontSize: '9px', 
                color: item.trend === '▲' ? '#ef4444' : item.trend === '▼' ? '#10b981' : '#64748b' 
              }}>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 실적/밸류에이션 위젯
// ============================================
const EarningsWidget = ({ position, isPremium, onShowAINews, onShowAIReport }) => {
  const { isMobile } = useResponsive();
  const earnings = EARNINGS_DATA[position.code];
  const stockInfo = STOCK_LIST.find(s => s.code === position.code);
  if (!earnings || !stockInfo) return null;
  
  const dDay = calculateDDay(earnings.nextEarningsDate);
  const naverNewsUrl = 'https://finance.naver.com/item/news.naver?code=' + position.code;

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: isMobile ? '8px' : '10px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: '6px', 
        marginBottom: '8px' 
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>실적발표</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', color: dDay.startsWith('D-') && parseInt(dDay.slice(2)) <= 14 ? '#f59e0b' : '#e2e8f0' }}>{dDay}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>서프라이즈</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', color: earnings.lastEarnings.surprise > 0 ? '#10b981' : '#ef4444' }}>
            {earnings.lastEarnings.surprise > 0 ? '+' : ''}{earnings.lastEarnings.surprise}%
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>PER</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: stockInfo.per < stockInfo.sectorPer ? '#10b981' : '#ef4444' }}>{stockInfo.per}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>PBR</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: stockInfo.pbr < stockInfo.sectorPbr ? '#10b981' : '#ef4444' }}>{stockInfo.pbr}</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        <a 
          href={naverNewsUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={e => e.stopPropagation()} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '4px', 
            background: 'rgba(59,130,246,0.1)', 
            border: '1px solid rgba(59,130,246,0.3)', 
            borderRadius: '6px', 
            color: '#60a5fa', 
            fontSize: isMobile ? '11px' : '12px', 
            fontWeight: '600', 
            textDecoration: 'none', 
            padding: isMobile ? '10px 6px' : '8px',
            minHeight: '44px',
          }}
        >
          📰 뉴스
        </a>
        <button 
          onClick={e => { e.stopPropagation(); onShowAINews(); }} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2px', 
            background: isPremium ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)' : 'rgba(100,116,139,0.1)', 
            border: isPremium ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(100,116,139,0.3)', 
            borderRadius: '6px', 
            color: isPremium ? '#a78bfa' : '#64748b', 
            fontSize: isMobile ? '10px' : '11px', 
            fontWeight: '600', 
            padding: isMobile ? '10px 4px' : '8px', 
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          🤖 AI뉴스{!isPremium && <span style={{ fontSize: '9px' }}>👑</span>}
        </button>
        <button 
          onClick={e => { e.stopPropagation(); onShowAIReport(); }} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2px', 
            background: isPremium ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)' : 'rgba(100,116,139,0.1)', 
            border: isPremium ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(100,116,139,0.3)', 
            borderRadius: '6px', 
            color: isPremium ? '#34d399' : '#64748b', 
            fontSize: isMobile ? '10px' : '11px', 
            fontWeight: '600', 
            padding: isMobile ? '10px 4px' : '8px', 
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          📑 리포트{!isPremium && <span style={{ fontSize: '9px' }}>👑</span>}
        </button>
      </div>
    </div>
  );
};

// ============================================
// 반응형 포지션 카드 컴포넌트
// ============================================
const PositionCard = ({ position, priceData, onEdit, onDelete, isPremium, onUpgrade }) => {
  const { isMobile, isTablet } = useResponsive();
  const [visibleLines, setVisibleLines] = useState({ candle3: true, stopLoss: true, twoThird: true, maSignal: true, volumeZone: true, trendline: true });
  const [showAINews, setShowAINews] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);
  const [showChart, setShowChart] = useState(!isMobile); // 모바일에서는 차트 토글
  
  const currentPrice = priceData?.[priceData.length - 1]?.close || position.buyPrice;
  const profitRate = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
  const profitAmount = (currentPrice - position.buyPrice) * position.quantity;
  const totalValue = currentPrice * position.quantity;
  const isProfit = profitRate >= 0;
  const sellPrices = calculateSellPrices(position, priceData, position.presetSettings);
  
  const getStage = () => {
    if (profitRate < 0) return { ...PROFIT_STAGES.initial, label: '손실 구간', color: '#ef4444' };
    if (profitRate < 5) return PROFIT_STAGES.initial;
    if (profitRate < 10) return PROFIT_STAGES.profit5;
    return PROFIT_STAGES.profit10;
  };
  
  const stage = getStage();
  const naverStockUrl = 'https://finance.naver.com/item/main.naver?code=' + position.code;
  const naverChartUrl = 'https://finance.naver.com/item/fchart.naver?code=' + position.code;

  // 차트 크기 계산
  const getChartSize = () => {
    if (isMobile) return { width: Math.min(320, window.innerWidth - 48), height: 200 };
    if (isTablet) return { width: 240, height: 240 };
    return { width: 270, height: 280 };
  };
  const chartSize = getChartSize();

  return (
    <>
      <div style={{ 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: isMobile ? '12px' : '14px', 
        padding: isMobile ? '12px' : '16px', 
        marginBottom: isMobile ? '12px' : '14px', 
        border: '1px solid rgba(255,255,255,0.08)' 
      }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          marginBottom: '12px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '8px' : '0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            flexWrap: 'wrap',
            flex: isMobile ? '1 1 100%' : 'initial'
          }}>
            <a href={naverStockUrl} target="_blank" rel="noopener noreferrer" style={{ 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: '700', 
              color: '#fff', 
              textDecoration: 'none' 
            }}>
              {position.name} ↗
            </a>
            <span style={{ 
              background: 'rgba(59,130,246,0.2)', 
              color: '#60a5fa', 
              padding: isMobile ? '3px 8px' : '4px 10px', 
              borderRadius: '5px', 
              fontSize: isMobile ? '11px' : '13px', 
              fontWeight: '600' 
            }}>
              {position.code}
            </span>
            <span style={{ 
              background: stage.color + '20', 
              color: stage.color, 
              padding: isMobile ? '3px 8px' : '4px 10px', 
              borderRadius: '5px', 
              fontSize: isMobile ? '11px' : '13px', 
              fontWeight: '600' 
            }}>
              {stage.label}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '6px',
            marginLeft: isMobile ? 'auto' : '0'
          }}>
            <button 
              onClick={() => onEdit(position)} 
              style={{ 
                background: 'rgba(255,255,255,0.08)', 
                border: 'none', 
                borderRadius: '6px', 
                padding: isMobile ? '8px 12px' : '8px 14px', 
                color: '#94a3b8', 
                fontSize: isMobile ? '12px' : '13px', 
                cursor: 'pointer',
                minHeight: '36px'
              }}
            >수정</button>
            <button 
              onClick={() => onDelete(position.id)} 
              style={{ 
                background: 'rgba(239,68,68,0.15)', 
                border: 'none', 
                borderRadius: '6px', 
                padding: isMobile ? '8px 12px' : '8px 14px', 
                color: '#ef4444', 
                fontSize: isMobile ? '12px' : '13px', 
                cursor: 'pointer',
                minHeight: '36px'
              }}
            >삭제</button>
          </div>
        </div>
        
        {/* 메인 콘텐츠 */}
        <div style={{ 
          display: isMobile ? 'flex' : 'grid', 
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : isTablet ? '1fr 250px' : '1fr 280px', 
          gap: '12px', 
          alignItems: 'stretch' 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 가격 정보 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
              gap: '6px', 
              marginBottom: '10px' 
            }}>
              {[
                { label: '매수가', value: '₩' + position.buyPrice.toLocaleString() },
                { label: '현재가', value: '₩' + Math.round(currentPrice).toLocaleString(), color: isProfit ? '#10b981' : '#ef4444' },
                { label: '수량', value: position.quantity + '주' },
                { label: '평가금액', value: '₩' + Math.round(totalValue).toLocaleString() }
              ].map((item, i) => (
                <div key={i} style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '6px', 
                  padding: isMobile ? '10px 8px' : '8px' 
                }}>
                  <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ 
                    fontSize: isMobile ? '14px' : '16px', 
                    fontWeight: '700', 
                    color: item.color || '#e2e8f0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{item.value}</div>
                </div>
              ))}
            </div>
            
            {/* 평가손익 */}
            <div style={{ 
              background: isProfit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
              borderRadius: '8px', 
              padding: isMobile ? '12px' : '10px', 
              borderLeft: '4px solid ' + (isProfit ? '#10b981' : '#ef4444'), 
              marginBottom: '10px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b', marginBottom: '2px' }}>평가손익</div>
                <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: isProfit ? '#10b981' : '#ef4444' }}>
                  {isProfit ? '+' : ''}₩{Math.round(profitAmount).toLocaleString()}
                </div>
              </div>
              <div style={{ 
                fontSize: isMobile ? '20px' : '24px', 
                fontWeight: '800', 
                color: isProfit ? '#10b981' : '#ef4444', 
                background: isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', 
                padding: isMobile ? '6px 10px' : '6px 12px', 
                borderRadius: '8px' 
              }}>
                {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
              </div>
            </div>
            
            {/* 매도 조건 */}
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '8px', 
              padding: isMobile ? '10px' : '10px', 
              marginBottom: '8px', 
              flex: 1 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '6px' 
              }}>
                <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#fff', fontWeight: '600' }}>📊 매도 조건별 기준가격</span>
                <button 
                  onClick={() => onEdit(position)} 
                  style={{ 
                    background: 'rgba(59,130,246,0.15)', 
                    border: '1px solid rgba(59,130,246,0.3)', 
                    borderRadius: '4px', 
                    padding: isMobile ? '6px 10px' : '4px 10px', 
                    color: '#60a5fa', 
                    fontSize: isMobile ? '11px' : '12px', 
                    cursor: 'pointer',
                    minHeight: '32px'
                  }}
                >✏️ 조건 변경</button>
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: '#f59e0b', 
                marginBottom: '6px', 
                background: 'rgba(245,158,11,0.1)', 
                padding: '5px 8px', 
                borderRadius: '4px' 
              }}>
                ⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(position.selectedPresets || []).slice(0, isMobile ? 3 : undefined).map(presetId => {
                  const preset = SELL_PRESETS[presetId];
                  if (!preset) return null;
                  
                  let priceText = '-', priceColor = '#94a3b8';
                  const hasChartLine = ['candle3', 'stopLoss', 'twoThird', 'maSignal', 'volumeZone', 'trendline'].includes(presetId);
                  
                  if (presetId === 'stopLoss' && sellPrices.stopLoss) { 
                    priceText = '₩' + sellPrices.stopLoss.toLocaleString(); 
                    priceColor = currentPrice <= sellPrices.stopLoss ? '#ef4444' : '#94a3b8'; 
                  }
                  else if (presetId === 'twoThird' && sellPrices.twoThird) { 
                    priceText = '₩' + sellPrices.twoThird.toLocaleString(); 
                    priceColor = currentPrice <= sellPrices.twoThird ? '#f59e0b' : '#94a3b8'; 
                  }
                  else if (presetId === 'maSignal' && sellPrices.maSignal) { 
                    priceText = '₩' + sellPrices.maSignal.toLocaleString(); 
                    priceColor = currentPrice < sellPrices.maSignal ? '#f59e0b' : '#94a3b8'; 
                  }
                  else if (presetId === 'candle3' && sellPrices.candle3_50) { 
                    priceText = '₩' + sellPrices.candle3_50.toLocaleString(); 
                  }
                  else if (presetId === 'volumeZone' && sellPrices.volumeZone) { 
                    priceText = '₩' + sellPrices.volumeZone.toLocaleString(); 
                    priceColor = currentPrice >= sellPrices.volumeZone ? '#f59e0b' : '#94a3b8'; 
                  }
                  else if (presetId === 'trendline' && sellPrices.trendline) { 
                    priceText = '₩' + sellPrices.trendline.toLocaleString(); 
                    priceColor = currentPrice <= sellPrices.trendline ? '#ef4444' : '#94a3b8'; 
                  }
                  
                  return (
                    <div key={presetId} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: isMobile ? '10px' : '8px 10px', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '6px', 
                      borderLeft: '3px solid ' + preset.color 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {hasChartLine && !isMobile ? (
                          <input 
                            type="checkbox" 
                            checked={visibleLines[presetId] || false} 
                            onChange={() => setVisibleLines(prev => ({ ...prev, [presetId]: !prev[presetId] }))} 
                            style={{ width: '16px', height: '16px', accentColor: preset.color, cursor: 'pointer' }} 
                          />
                        ) : (
                          <div style={{ width: isMobile ? '0' : '16px' }} />
                        )}
                        <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#e2e8f0' }}>{preset.icon} {isMobile ? preset.name.replace(' 매도법', '') : preset.name}</span>
                      </div>
                      <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: priceColor }}>{priceText}</span>
                    </div>
                  );
                })}
              </div>
              {!isMobile && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>체크박스 선택 시 차트에 가격선 표시</div>
              )}
            </div>
            
            {/* 실적 위젯 */}
            <EarningsWidget 
              position={position} 
              isPremium={isPremium} 
              onShowAINews={() => setShowAINews(true)} 
              onShowAIReport={() => setShowAIReport(true)} 
            />
          </div>
          
          {/* 차트 영역 */}
          {isMobile ? (
            <div>
              <button
                onClick={() => setShowChart(!showChart)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '8px',
                  color: '#60a5fa',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: showChart ? '10px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                📊 차트 {showChart ? '접기 ▲' : '보기 ▼'}
              </button>
              {showChart && (
                <div 
                  onClick={() => window.open(naverChartUrl, '_blank')} 
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '8px', 
                    padding: '4px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <EnhancedCandleChart 
                      data={priceData?.slice(-30)} 
                      width={chartSize.width} 
                      height={chartSize.height} 
                      buyPrice={position.buyPrice} 
                      sellPrices={sellPrices} 
                      visibleLines={visibleLines} 
                    />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>탭하여 네이버 차트 열기</div>
                </div>
              )}
            </div>
          ) : (
            <div 
              onClick={() => window.open(naverChartUrl, '_blank')} 
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', 
                borderRadius: '8px', 
                padding: '4px', 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <EnhancedCandleChart 
                  data={priceData?.slice(-40)} 
                  width={chartSize.width} 
                  height={chartSize.height} 
                  buyPrice={position.buyPrice} 
                  sellPrices={sellPrices} 
                  visibleLines={visibleLines} 
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>클릭 → 네이버 증권 차트</div>
            </div>
          )}
        </div>
      </div>
      
      {/* AI 팝업 */}
      {showAINews && <AINewsPopup position={position} onClose={() => setShowAINews(false)} isPremium={isPremium} onUpgrade={onUpgrade} />}
      {showAIReport && <AIReportPopup position={position} onClose={() => setShowAIReport(false)} isPremium={isPremium} onUpgrade={onUpgrade} />}
    </>
  );
};

// ============================================
// 알림 카드 - 완전 구현
// ============================================
const AlertCard = ({ alert, onDismiss }) => {
  const { isMobile } = useResponsive();
  const severityColors = { 
    critical: { bg: '#ef4444', label: '긴급' }, 
    high: { bg: '#f97316', label: '높음' }, 
    medium: { bg: '#eab308', label: '보통' }, 
    low: { bg: '#3b82f6', label: '참고' } 
  };
  const severity = severityColors[alert?.preset?.severity] || { bg: '#64748b', label: '알림' };
  
  // 알림 시간 표시
  const formatTime = (timestamp) => {
    if (!timestamp) return '방금 전';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return '1일 이상';
  };
  
  return (
    <div style={{ 
      background: `linear-gradient(135deg, ${severity.bg}15 0%, ${severity.bg}08 100%)`, 
      border: `1px solid ${severity.bg}30`, 
      borderRadius: isMobile ? '12px' : '14px', 
      padding: isMobile ? '14px' : '16px', 
      marginBottom: '10px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 좌측 강조선 */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: severity.bg,
        borderRadius: '4px 0 0 4px'
      }} />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        paddingLeft: '8px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 헤더: 아이콘 + 매도법 이름 + 심각도 배지 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: isMobile ? '18px' : '20px' }}>{alert?.preset?.icon || '🔔'}</span>
            <span style={{ 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: '700', 
              color: severity.bg 
            }}>{alert?.preset?.name || '알림'}</span>
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              color: '#fff',
              background: severity.bg,
              padding: '2px 8px',
              borderRadius: '4px'
            }}>{severity.label}</span>
          </div>
          
          {/* 종목명 */}
          <div style={{ 
            fontSize: isMobile ? '15px' : '16px', 
            fontWeight: '600', 
            color: '#fff', 
            marginBottom: '6px' 
          }}>{alert?.stockName || '종목'}</div>
          
          {/* 메시지 */}
          <div style={{ 
            fontSize: isMobile ? '13px' : '14px', 
            color: '#e2e8f0',
            lineHeight: '1.4',
            marginBottom: '8px'
          }}>
            {alert?.message || '설정한 조건에 도달했습니다'}
          </div>
          
          {/* 가격 정보 (있는 경우) */}
          {alert?.currentPrice && (
            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              <span>현재가: <strong style={{ color: '#fff' }}>₩{alert.currentPrice.toLocaleString()}</strong></span>
              {alert?.targetPrice && (
                <span>기준가: <strong style={{ color: severity.bg }}>₩{alert.targetPrice.toLocaleString()}</strong></span>
              )}
            </div>
          )}
          
          {/* 시간 */}
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b',
            marginTop: '8px'
          }}>
            {formatTime(alert?.timestamp)}
          </div>
        </div>
        
        {/* 확인 버튼 */}
        <button 
          onClick={() => onDismiss(alert?.id)} 
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            borderRadius: '8px', 
            padding: isMobile ? '10px 16px' : '8px 14px', 
            color: '#fff', 
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            minHeight: isMobile ? '44px' : '36px',
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          확인
        </button>
      </div>
    </div>
  );
};

// ============================================
// 매도법 가이드 - 아코디언 스타일
// ============================================
const SellMethodGuide = ({ isMobile, activeTab }) => {
  const [expandedStage, setExpandedStage] = useState(null);
  const [showAllMethods, setShowAllMethods] = useState(false);
  
  // 매도법 상세 설명
  const methodDescriptions = {
    candle3: '최근 양봉의 50% 이상을 덮는 음봉 발생 시 절반 매도, 100% 덮으면 전량 매도',
    stopLoss: '매수가 대비 설정한 손실률(-3~-5%)에 도달하면 기계적으로 손절',
    twoThird: '최고 수익 대비 1/3이 빠지면 남은 2/3 수익이라도 확보하여 익절',
    maSignal: '이동평균선을 하향 돌파하거나, 이평선이 저항선으로 작용할 때 매도',
    volumeZone: '상단 매물대(저항대)에서 주가가 하락 반전할 때 매도',
    trendline: '지지선을 깨고 하락하거나, 저항선 돌파 실패 시 매도',
    fundamental: '실적 악화, 업황 반전 등 기업 펀더멘털에 변화가 생길 때',
    cycle: '금리 고점 근처(4-5단계)에서 시장 전체 매도 관점 유지'
  };
  
  const toggleStage = (key) => {
    setExpandedStage(expandedStage === key ? null : key);
  };
  
  return (
    <div style={{ 
      display: isMobile && activeTab !== 'guide' ? 'none' : 'block',
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
      borderRadius: '14px', 
      padding: isMobile ? '14px' : '16px', 
      border: '1px solid rgba(255,255,255,0.08)', 
      marginBottom: '12px' 
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px' 
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '14px' : '15px', 
          fontWeight: '600', 
          color: '#fff', 
          margin: 0 
        }}>📚 수익 단계별 매도법</h3>
        <button 
          onClick={() => setShowAllMethods(!showAllMethods)}
          style={{
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            color: '#60a5fa',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          {showAllMethods ? '간략히' : '전체보기'}
        </button>
      </div>
      
      {/* 수익 단계별 아코디언 */}
      {Object.entries(PROFIT_STAGES).map(([key, stage]) => (
        <div key={key} style={{ marginBottom: '8px' }}>
          {/* 단계 헤더 (클릭 가능) */}
          <div 
            onClick={() => toggleStage(key)}
            style={{ 
              padding: isMobile ? '12px' : '14px', 
              background: stage.color + '10', 
              borderRadius: expandedStage === key ? '10px 10px 0 0' : '10px', 
              borderLeft: '4px solid ' + stage.color,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.15s'
            }}
          >
            <div>
              <div style={{ 
                fontSize: isMobile ? '13px' : '14px', 
                fontWeight: '600', 
                color: stage.color
              }}>{stage.label}</div>
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: '#94a3b8',
                marginTop: '2px'
              }}>수익률 {stage.range} · {stage.methods.length}개 매도법</div>
            </div>
            <span style={{ 
              color: '#64748b', 
              fontSize: '14px',
              transition: 'transform 0.2s',
              transform: expandedStage === key ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>▼</span>
          </div>
          
          {/* 확장된 내용 */}
          {(expandedStage === key || showAllMethods) && (
            <div style={{ 
              padding: isMobile ? '12px' : '14px', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '0 0 10px 10px',
              borderLeft: '4px solid ' + stage.color + '50'
            }}>
              {stage.methods.map(methodId => { 
                const method = SELL_PRESETS[methodId]; 
                if (!method) return null;
                return (
                  <div key={methodId} style={{ 
                    marginBottom: '10px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '16px' }}>{method.icon}</span>
                      <span style={{ 
                        fontSize: isMobile ? '12px' : '13px', 
                        fontWeight: '600',
                        color: '#fff'
                      }}>{method.name}</span>
                    </div>
                    <p style={{ 
                      fontSize: isMobile ? '11px' : '12px', 
                      color: '#94a3b8',
                      margin: 0,
                      lineHeight: '1.5',
                      paddingLeft: '24px'
                    }}>
                      {methodDescriptions[methodId] || method.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
      
      {/* 빠른 참조 */}
      {!showAllMethods && !expandedStage && (
        <div style={{ 
          marginTop: '12px',
          padding: '10px',
          background: 'rgba(59,130,246,0.1)',
          borderRadius: '8px',
          fontSize: isMobile ? '11px' : '12px',
          color: '#60a5fa'
        }}>
          💡 각 단계를 탭하면 상세 매도법을 확인할 수 있습니다
        </div>
      )}
    </div>
  );
};

// ============================================
// 종목 추가/수정 모달 - 완전 구현
// ============================================
const StockModal = ({ stock, onSave, onClose }) => {
  const { isMobile, isTablet } = useResponsive();
  
  const [form, setForm] = useState(stock || { 
    name: '', 
    code: '', 
    buyPrice: '', 
    quantity: '', 
    selectedPresets: ['candle3', 'stopLoss'], 
    presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } } 
  });
  const [stockQuery, setStockQuery] = useState(stock ? stock.name : '');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [stockFound, setStockFound] = useState(!!stock);

  // 종목 검색
  const handleStockSearch = (query) => {
    setStockQuery(query);
    if (query.trim().length > 0) {
      const results = searchStocks(query);
      setSearchResults(results);
      setShowResults(results.length > 0);
      const exact = findExactStock(query);
      if (exact) { 
        setForm({ ...form, name: exact.name, code: exact.code }); 
        setStockFound(true); 
      } else {
        setStockFound(false);
      }
    } else { 
      setSearchResults([]); 
      setShowResults(false); 
      setStockFound(false); 
    }
  };

  const selectStock = (stockItem) => { 
    setForm({ ...form, name: stockItem.name, code: stockItem.code }); 
    setStockQuery(stockItem.name); 
    setStockFound(true); 
    setShowResults(false); 
  };
  
  const togglePreset = (id) => { 
    const current = form.selectedPresets || []; 
    setForm({ 
      ...form, 
      selectedPresets: current.includes(id) ? current.filter(p => p !== id) : [...current, id] 
    }); 
  };

  const handleSave = () => {
    if (!form.name || !form.code || !form.buyPrice || !form.quantity) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    onSave({ 
      ...form, 
      id: stock?.id || Date.now(),
      buyPrice: Number(form.buyPrice), 
      quantity: Number(form.quantity), 
      highestPrice: Number(form.buyPrice) 
    });
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.85)', 
        display: 'flex', 
        alignItems: isMobile ? 'flex-end' : 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: isMobile ? '0' : '20px' 
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: isMobile ? '20px 20px 0 0' : '20px', 
        width: '100%',
        maxWidth: isMobile ? '100%' : '600px', 
        maxHeight: isMobile ? '95vh' : '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* 헤더 */}
        <div style={{ 
          padding: isMobile ? '16px 20px' : '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: '700', 
            color: '#fff', 
            margin: 0 
          }}>
            {stock ? '📝 종목 수정' : '➕ 새 종목 추가'}
          </h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '8px 16px', 
              color: '#fff', 
              fontSize: '14px',
              cursor: 'pointer',
              minHeight: '40px'
            }}
          >닫기</button>
        </div>
        
        {/* 스크롤 영역 */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: isMobile ? '16px 20px' : '20px 24px' 
        }}>
          {/* 종목 검색 */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: '#94a3b8', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>종목명 또는 종목코드 *</label>
            <input 
              type="text" 
              value={stockQuery} 
              onChange={e => handleStockSearch(e.target.value)} 
              onFocus={() => searchResults.length > 0 && setShowResults(true)} 
              placeholder="예: 삼성전자 또는 005930" 
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                background: 'rgba(255,255,255,0.05)', 
                border: stockFound ? '2px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.15)', 
                borderRadius: showResults ? '12px 12px 0 0' : '12px', 
                color: '#fff', 
                fontSize: '16px', 
                outline: 'none', 
                boxSizing: 'border-box' 
              }} 
            />
            {showResults && searchResults.length > 0 && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                background: '#1e293b', 
                border: '1px solid rgba(255,255,255,0.15)', 
                borderTop: 'none', 
                borderRadius: '0 0 12px 12px', 
                maxHeight: '200px', 
                overflowY: 'auto', 
                zIndex: 100 
              }}>
                {searchResults.map((result, idx) => (
                  <div 
                    key={result.code} 
                    onClick={() => selectStock(result)} 
                    style={{ 
                      padding: '14px 16px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer', 
                      borderBottom: idx < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>{result.name}</span>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>{result.code} · {result.market}</span>
                  </div>
                ))}
              </div>
            )}
            {stockFound && form.name && (
              <div style={{ 
                marginTop: '8px', 
                fontSize: '13px', 
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✓ {form.name} ({form.code}) 선택됨
              </div>
            )}
          </div>
          
          {/* 매수가, 수량 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: '12px', 
            marginBottom: '20px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                color: '#94a3b8', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>매수가 (원) *</label>
              <input 
                type="number" 
                value={form.buyPrice} 
                onChange={e => setForm({ ...form, buyPrice: e.target.value })} 
                placeholder="72000" 
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.15)', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '16px', 
                  outline: 'none', 
                  boxSizing: 'border-box' 
                }} 
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                color: '#94a3b8', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>수량 (주) *</label>
              <input 
                type="number" 
                value={form.quantity} 
                onChange={e => setForm({ ...form, quantity: e.target.value })} 
                placeholder="100" 
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.15)', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '16px', 
                  outline: 'none', 
                  boxSizing: 'border-box' 
                }} 
              />
            </div>
          </div>
          
          {/* 매도 조건 선택 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              color: '#fff', 
              display: 'block', 
              marginBottom: '12px' 
            }}>📚 매도의 기술 조건 선택</label>
            <div style={{ 
              fontSize: '12px', 
              color: '#f59e0b', 
              marginBottom: '12px', 
              background: 'rgba(245,158,11,0.1)', 
              padding: '10px 12px', 
              borderRadius: '8px',
              lineHeight: '1.5'
            }}>
              ⚠️ 아래 기본값은 예시일 뿐입니다. 반드시 본인의 투자 원칙에 따라 수정하십시오.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.values(SELL_PRESETS).map(preset => {
                const isSelected = (form.selectedPresets || []).includes(preset.id);
                return (
                  <div 
                    key={preset.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: isMobile ? '14px' : '14px 16px', 
                      background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', 
                      border: isSelected ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }} 
                    onClick={() => togglePreset(preset.id)}
                  >
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '6px', 
                      background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '14px', 
                      color: '#fff',
                      flexShrink: 0
                    }}>
                      {isSelected && '✓'}
                    </div>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{preset.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{preset.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{preset.description}</div>
                    </div>
                    {preset.hasInput && isSelected && (
                      <input 
                        type="number" 
                        value={form.presetSettings?.[preset.id]?.value ?? preset.inputDefault} 
                        onChange={e => { 
                          e.stopPropagation(); 
                          setForm({ 
                            ...form, 
                            presetSettings: { ...form.presetSettings, [preset.id]: { value: Number(e.target.value) } } 
                          }); 
                        }} 
                        onClick={e => e.stopPropagation()} 
                        style={{ 
                          width: '70px', 
                          padding: '8px 10px', 
                          background: 'rgba(255,255,255,0.1)', 
                          border: '1px solid rgba(255,255,255,0.2)', 
                          borderRadius: '8px', 
                          color: '#fff', 
                          fontSize: '14px', 
                          outline: 'none', 
                          textAlign: 'center',
                          flexShrink: 0
                        }} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* 하단 버튼 */}
        <div style={{ 
          padding: isMobile ? '16px 20px' : '16px 24px',
          paddingBottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{ 
            padding: '10px 12px', 
            background: 'rgba(234,179,8,0.1)', 
            borderRadius: '8px', 
            marginBottom: '12px' 
          }}>
            <p style={{ fontSize: '11px', color: '#eab308', margin: 0, lineHeight: '1.5' }}>
              ⚠️ 본 알람은 사용자가 직접 선택한 기술적 조건에 따른 단순 정보 제공이며, 투자자문이나 투자권유가 아닙니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onClose} 
              style={{ 
                flex: 1, 
                padding: '16px', 
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff', 
                fontSize: '16px', 
                cursor: 'pointer',
                minHeight: '52px'
              }}
            >취소</button>
            <button 
              onClick={handleSave}
              disabled={!form.name || !form.code || !form.buyPrice || !form.quantity}
              style={{ 
                flex: 1, 
                padding: '16px', 
                background: (form.name && form.code && form.buyPrice && form.quantity) 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                  : 'rgba(100,116,139,0.3)', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: (form.name && form.code && form.buyPrice && form.quantity) ? 'pointer' : 'not-allowed',
                minHeight: '52px',
                opacity: (form.name && form.code && form.buyPrice && form.quantity) ? 1 : 0.6
              }}
            >
              {stock ? '수정 완료' : '알람 설정 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// AI 뉴스 팝업 - 완전 구현
// ============================================
const AINewsPopup = ({ position, onClose, isPremium, onUpgrade }) => {
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState(null);

  useEffect(() => {
    if (isPremium) {
      // 실제 구현시 백엔드 API를 통해 호출
      const timer = setTimeout(() => {
        setNewsData({
          sentiment: 'positive',
          sentimentScore: 72,
          keyInsight: `${position.name}은(는) 최근 업황 개선과 실적 기대감으로 긍정적인 전망이 우세합니다.`,
          positiveNews: [
            { title: '업황 개선 기대', summary: '관련 산업의 수요 증가로 실적 개선 전망' },
            { title: '신규 투자 확대', summary: '신성장 사업 투자로 중장기 성장 기대' }
          ],
          negativeNews: [
            { title: '원자재 가격 상승', summary: '비용 증가 우려로 마진 압박 가능성' }
          ]
        });
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isPremium, position.name]);

  const getSentimentColor = (s) => s === 'positive' ? '#10b981' : s === 'negative' ? '#ef4444' : '#eab308';

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.9)', 
        display: 'flex', 
        alignItems: isMobile ? 'flex-end' : 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: isMobile ? '0' : '20px' 
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ 
        width: '100%', 
        maxWidth: isMobile ? '100%' : '600px', 
        maxHeight: isMobile ? '90vh' : '85vh', 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: isMobile ? '20px 20px 0 0' : '20px', 
        border: '1px solid rgba(255,255,255,0.1)', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* 헤더 */}
        <div style={{ 
          padding: isMobile ? '16px 20px' : '20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#fff', margin: 0 }}>AI 뉴스 분석</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{position.name} ({position.code})</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '10px 16px', 
              color: '#fff', 
              fontSize: '14px', 
              cursor: 'pointer',
              minHeight: '40px'
            }}
          >닫기</button>
        </div>
        
        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '16px 20px' : '20px' }}>
          {!isPremium ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 12px' }}>프리미엄 전용 기능</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 24px', lineHeight: '1.6' }}>
                AI 뉴스 분석은 프리미엄 회원만 이용 가능합니다.<br/>
                최신 뉴스를 AI가 분석하여 투자 인사이트를 제공합니다.
              </p>
              <button 
                onClick={() => { onClose(); onUpgrade && onUpgrade(); }}
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '16px 32px', 
                  color: '#fff', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                프리미엄 업그레이드 (월 5,900원)
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>AI가 뉴스를 분석하고 있습니다...</p>
              <div style={{ 
                width: '200px', 
                height: '4px', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '2px', 
                margin: '20px auto',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '50%', 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                  borderRadius: '2px',
                  animation: 'loading 1s ease-in-out infinite'
                }} />
              </div>
            </div>
          ) : newsData ? (
            <>
              {/* 종합 분석 */}
              <div style={{ 
                background: getSentimentColor(newsData.sentiment) + '15', 
                border: '1px solid ' + getSentimentColor(newsData.sentiment) + '40', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>종합 분석</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: getSentimentColor(newsData.sentiment) }}>{newsData.sentimentScore}점</span>
                </div>
                <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, lineHeight: '1.6' }}>{newsData.keyInsight}</p>
              </div>
              
              {/* 호재 */}
              {newsData.positiveNews.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#10b981', margin: '0 0 12px' }}>
                    🟢 호재 ({newsData.positiveNews.length}건)
                  </h4>
                  {newsData.positiveNews.map((n, i) => (
                    <div key={i} style={{ 
                      background: 'rgba(16,185,129,0.1)', 
                      borderRadius: '10px', 
                      padding: '12px', 
                      marginBottom: '8px', 
                      borderLeft: '3px solid #10b981' 
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{n.title}</div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{n.summary}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 악재 */}
              {newsData.negativeNews.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444', margin: '0 0 12px' }}>
                    🔴 악재 ({newsData.negativeNews.length}건)
                  </h4>
                  {newsData.negativeNews.map((n, i) => (
                    <div key={i} style={{ 
                      background: 'rgba(239,68,68,0.1)', 
                      borderRadius: '10px', 
                      padding: '12px', 
                      marginBottom: '8px', 
                      borderLeft: '3px solid #ef4444' 
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{n.title}</div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{n.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
        
        {/* 면책조항 */}
        <div style={{ 
          padding: isMobile ? '12px 20px' : '16px 20px', 
          paddingBottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : '16px',
          background: 'rgba(0,0,0,0.2)', 
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>
            ⚠️ AI 분석은 참고용이며, 투자자문이나 투자권유가 아닙니다.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// AI 리포트 팝업 - 완전 구현
// ============================================
const AIReportPopup = ({ position, onClose, isPremium, onUpgrade }) => {
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (isPremium) {
      // 실제 구현시 백엔드 API를 통해 호출
      const timer = setTimeout(() => {
        setReportData({
          targetPriceConsensus: { 
            average: Math.round(position.buyPrice * 1.18), 
            high: Math.round(position.buyPrice * 1.35), 
            low: Math.round(position.buyPrice * 0.95), 
            upside: 18.5 
          },
          investmentOpinion: { buy: 15, hold: 5, sell: 2 },
          keyHighlights: [
            '업황 개선에 따른 실적 턴어라운드 기대',
            '신사업 투자로 중장기 성장 동력 확보',
            '주주환원 정책 강화로 배당 매력 증가'
          ],
          analystInsight: `대부분의 증권사가 ${position.name}에 대해 긍정적인 전망을 유지하고 있습니다. 업황 개선과 신사업 확대가 주요 성장 동력으로 분석됩니다.`
        });
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isPremium, position]);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.9)', 
        display: 'flex', 
        alignItems: isMobile ? 'flex-end' : 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: isMobile ? '0' : '20px' 
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ 
        width: '100%', 
        maxWidth: isMobile ? '100%' : '650px', 
        maxHeight: isMobile ? '90vh' : '85vh', 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: isMobile ? '20px 20px 0 0' : '20px', 
        border: '1px solid rgba(255,255,255,0.1)', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* 헤더 */}
        <div style={{ 
          padding: isMobile ? '16px 20px' : '20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>📑</span>
            <div>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#fff', margin: 0 }}>AI 리포트 분석</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{position.name} ({position.code})</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '10px 16px', 
              color: '#fff', 
              fontSize: '14px', 
              cursor: 'pointer',
              minHeight: '40px'
            }}
          >닫기</button>
        </div>
        
        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '16px 20px' : '20px' }}>
          {!isPremium ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 12px' }}>프리미엄 전용 기능</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 24px', lineHeight: '1.6' }}>
                AI 리포트 분석은 프리미엄 회원만 이용 가능합니다.<br/>
                증권사 리포트를 AI가 요약하여 핵심 인사이트를 제공합니다.
              </p>
              <button 
                onClick={() => { onClose(); onUpgrade && onUpgrade(); }}
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '16px 32px', 
                  color: '#fff', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                프리미엄 업그레이드 (월 5,900원)
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📑</div>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>AI가 리포트를 분석하고 있습니다...</p>
            </div>
          ) : reportData ? (
            <>
              {/* 목표가 컨센서스 */}
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)', 
                border: '1px solid rgba(59,130,246,0.3)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 16px' }}>📊 목표가 컨센서스</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
                  gap: '12px' 
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>평균</div>
                    <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#3b82f6' }}>
                      ₩{reportData.targetPriceConsensus.average.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>최고</div>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', color: '#10b981' }}>
                      ₩{reportData.targetPriceConsensus.high.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>최저</div>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', color: '#ef4444' }}>
                      ₩{reportData.targetPriceConsensus.low.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>상승여력</div>
                    <div style={{ 
                      fontSize: isMobile ? '16px' : '18px', 
                      fontWeight: '700', 
                      color: reportData.targetPriceConsensus.upside > 0 ? '#10b981' : '#ef4444' 
                    }}>
                      {reportData.targetPriceConsensus.upside > 0 ? '+' : ''}{reportData.targetPriceConsensus.upside}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 투자의견 분포 */}
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>📋 투자의견 분포</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, background: 'rgba(16,185,129,0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{reportData.investmentOpinion.buy}</div>
                    <div style={{ fontSize: '12px', color: '#10b981' }}>매수</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(234,179,8,0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#eab308' }}>{reportData.investmentOpinion.hold}</div>
                    <div style={{ fontSize: '12px', color: '#eab308' }}>보유</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(239,68,68,0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{reportData.investmentOpinion.sell}</div>
                    <div style={{ fontSize: '12px', color: '#ef4444' }}>매도</div>
                  </div>
                </div>
              </div>
              
              {/* 핵심 포인트 */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>💡 핵심 포인트</h4>
                {reportData.keyHighlights.map((point, i) => (
                  <div key={i} style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    marginBottom: '8px', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '10px' 
                  }}>
                    <span style={{ color: '#3b82f6', fontWeight: '700' }}>{i + 1}.</span>
                    <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{point}</span>
                  </div>
                ))}
              </div>
              
              {/* AI 종합 인사이트 */}
              <div style={{ 
                background: 'rgba(139,92,246,0.1)', 
                border: '1px solid rgba(139,92,246,0.3)', 
                borderRadius: '12px', 
                padding: '16px' 
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa', margin: '0 0 8px' }}>🤖 AI 종합 인사이트</h4>
                <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, lineHeight: '1.6' }}>{reportData.analystInsight}</p>
              </div>
            </>
          ) : null}
        </div>
        
        {/* 면책조항 */}
        <div style={{ 
          padding: isMobile ? '12px 20px' : '16px 20px', 
          paddingBottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : '16px',
          background: 'rgba(0,0,0,0.2)', 
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>
            ⚠️ AI 분석은 참고용이며, 투자자문이나 투자권유가 아닙니다.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 메인 앱 (반응형 적용)
// ============================================
export default function SellSignalAppV5() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [positions, setPositions] = useState([
    { id: 1, name: '삼성전자', code: '005930', buyPrice: 71500, quantity: 100, highestPrice: 78200, selectedPresets: ['candle3', 'stopLoss', 'twoThird', 'maSignal'], presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } } },
    { id: 2, name: '현대차', code: '005380', buyPrice: 215000, quantity: 20, highestPrice: 228000, selectedPresets: ['candle3', 'stopLoss', 'maSignal'], presetSettings: { stopLoss: { value: -3 }, maSignal: { value: 20 } } },
    { id: 3, name: '한화에어로스페이스', code: '012450', buyPrice: 285000, quantity: 15, highestPrice: 412000, selectedPresets: ['twoThird', 'maSignal', 'volumeZone', 'fundamental'], presetSettings: { maSignal: { value: 60 } } },
  ]);
  const [priceDataMap, setPriceDataMap] = useState({});
  const [alerts, setAlerts] = useState([
    // 데모용 샘플 알림
    {
      id: 1,
      stockName: '삼성전자',
      code: '005930',
      preset: SELL_PRESETS.stopLoss,
      message: '손절 기준가(-5%) 근접! 현재 -4.2%',
      currentPrice: 68500,
      targetPrice: 67925,
      timestamp: Date.now() - 300000 // 5분 전
    },
    {
      id: 2,
      stockName: '한화에어로스페이스',
      code: '012450',
      preset: SELL_PRESETS.twoThird,
      message: '최고점 대비 1/3 하락 근접',
      currentPrice: 365000,
      targetPrice: 369600,
      timestamp: Date.now() - 1800000 // 30분 전
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [activeTab, setActiveTab] = useState('positions'); // 모바일 탭 상태
  
  const isPremium = user?.membership === 'premium';

  // 가격 데이터 초기화
  useEffect(() => {
    const newData = {};
    positions.forEach(pos => { 
      if (!priceDataMap[pos.id]) {
        newData[pos.id] = generateMockPriceData(pos.buyPrice, 60); 
      }
    });
    if (Object.keys(newData).length > 0) {
      setPriceDataMap(prev => ({ ...prev, ...newData }));
    }
  }, [positions]);

  // 실시간 가격 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceDataMap(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          const data = [...updated[id]];
          const last = data[data.length - 1];
          const change = (Math.random() - 0.48) * last.close * 0.008;
          const newClose = Math.max(last.close + change, last.close * 0.95);
          data[data.length - 1] = { 
            ...last, 
            close: newClose, 
            high: Math.max(last.high, newClose), 
            low: Math.min(last.low, newClose) 
          };
          updated[id] = data;
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 총계 계산
  const totalCost = positions.reduce((sum, p) => sum + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((sum, p) => { 
    const price = priceDataMap[p.id]?.[priceDataMap[p.id]?.length - 1]?.close || p.buyPrice; 
    return sum + price * p.quantity; 
  }, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // 메인 레이아웃 스타일 계산
  const getMainLayoutStyle = () => {
    if (isMobile) {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '0',
      };
    }
    if (isTablet) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '16px',
        padding: '0 20px',
      };
    }
    // 데스크톱
    return {
      display: 'grid',
      gridTemplateColumns: isPremium ? '1fr 380px' : '140px 1fr 380px',
      gap: '20px',
    };
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)', 
      color: '#fff', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      fontSize: '14px',
      paddingBottom: isMobile ? '70px' : '0', // 모바일 하단 네비게이션 공간
    }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        
        /* 스크롤바 스타일 */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        
        /* 터치 하이라이트 제거 */
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* 반응형 헤더 */}
      <ResponsiveHeader 
        alerts={alerts}
        isPremium={isPremium}
        onShowUpgrade={() => setShowUpgradePopup(true)}
        onShowAddModal={() => setShowAddModal(true)}
        user={user}
        onShowAuthModal={() => setShowAuthModal(true)}
        onSignOut={signOut}
      />

      {/* 메인 */}
      <main style={{ 
        maxWidth: isMobile ? '100%' : isTablet ? '1200px' : '1600px', 
        margin: '0 auto', 
        padding: isMobile ? '16px 0' : '24px' 
      }}>
        {/* 반응형 요약 카드 */}
        <ResponsiveSummaryCards 
          totalCost={totalCost}
          totalValue={totalValue}
          totalProfit={totalProfit}
          totalProfitRate={totalProfitRate}
        />

        {/* 모바일 탭 네비게이션 */}
        {isMobile && (
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            padding: '0 16px', 
            marginBottom: '16px',
            overflowX: 'auto',
          }}>
            {[
              { id: 'positions', label: '📊 포지션', count: positions.length },
              { id: 'alerts', label: '🔔 알림', count: alerts.length },
              { id: 'market', label: '🥚 시장분석' },
              { id: 'guide', label: '📚 가이드' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  background: activeTab === tab.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                  border: activeTab === tab.id ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    background: activeTab === tab.id ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 메인 레이아웃 */}
        <div style={getMainLayoutStyle()}>
          {/* 광고 영역 (데스크톱, 무료회원) */}
          {!isMobile && !isTablet && !isPremium && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ 
                  background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  textAlign: 'center', 
                  flex: 1, 
                  minHeight: '180px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px' }}>광고</div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
                  <div style={{ fontSize: '11px', color: '#374151' }}>Google AdMob</div>
                </div>
              ))}
              <div 
                onClick={() => setShowUpgradePopup(true)} 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  border: '1px solid rgba(139,92,246,0.3)', 
                  textAlign: 'center', 
                  cursor: 'pointer' 
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>👑</div>
                <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>광고 제거</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>프리미엄</div>
              </div>
            </div>
          )}

          {/* 포지션 목록 */}
          <div style={{ 
            display: isMobile && activeTab !== 'positions' ? 'none' : 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            {/* 모바일: 포지션 탭에서도 시장 분석 미니 요약 표시 */}
            {isMobile && activeTab === 'positions' && (
              <div 
                onClick={() => setActiveTab('market')}
                style={{ 
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.1) 100%)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px', 
                  padding: '12px', 
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🥚</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>4단계: 금리고점 (팔 때)</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>매도 관망 권장 · 탭하여 상세보기</div>
                  </div>
                </div>
                <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '16px' 
            }}>
              <h2 style={{ 
                fontSize: isMobile ? '16px' : '18px', 
                fontWeight: '600', 
                color: '#fff', 
                margin: 0 
              }}>📊 모니터링 중인 종목</h2>
              <span style={{ 
                fontSize: isMobile ? '11px' : '13px', 
                color: '#64748b' 
              }}>실시간 조건 감시 중</span>
            </div>
            {positions.map(pos => (
              <PositionCard 
                key={pos.id} 
                position={pos} 
                priceData={priceDataMap[pos.id]} 
                onEdit={setEditingPosition} 
                onDelete={(id) => { 
                  setPositions(prev => prev.filter(p => p.id !== id)); 
                  setPriceDataMap(prev => { const u = { ...prev }; delete u[id]; return u; }); 
                }} 
                isPremium={isPremium}
                onUpgrade={() => setShowUpgradePopup(true)}
              />
            ))}
          </div>

          {/* 우측 사이드바 / 모바일에서는 탭으로 표시 */}
          {(!isMobile || activeTab === 'market' || activeTab === 'alerts' || activeTab === 'guide') && (
          <div style={{ 
            display: 'block',
            padding: isMobile ? '0 16px' : '0',
          }}>
            {/* 시장 분석 (모바일에서는 탭으로) */}
            <div style={{ display: isMobile && activeTab !== 'market' ? 'none' : 'block' }}>
              <MarketCycleWidget isPremium={isPremium} />
            </div>
            
            {/* 알림 영역 */}
            <div style={{ 
              display: isMobile && activeTab !== 'alerts' ? 'none' : 'block',
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
              borderRadius: '14px', 
              padding: isMobile ? '14px' : '16px', 
              border: '1px solid rgba(255,255,255,0.08)', 
              marginBottom: '12px', 
              maxHeight: isMobile ? 'none' : '300px', 
              overflow: 'auto' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '12px' 
              }}>
                <h2 style={{ 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: '600', 
                  color: '#fff', 
                  margin: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  🔔 조건 도달 알림
                  {alerts.length > 0 && (
                    <span style={{ 
                      background: '#ef4444', 
                      color: '#fff', 
                      padding: '2px 10px', 
                      borderRadius: '10px', 
                      fontSize: '12px', 
                      fontWeight: '700' 
                    }}>{alerts.length}</span>
                  )}
                </h2>
                {alerts.length > 0 && (
                  <button 
                    onClick={() => setAlerts([])} 
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      border: 'none', 
                      borderRadius: '6px', 
                      padding: '6px 10px', 
                      color: '#94a3b8', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >모두 지우기</button>
                )}
              </div>
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px' : '30px 16px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>✨</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>현재 도달한 조건이 없습니다</div>
                </div>
              ) : (
                alerts.slice(0, 5).map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} 
                  />
                ))
              )}
            </div>
            
            {/* 매도법 가이드 - 아코디언 스타일 */}
            <SellMethodGuide isMobile={isMobile} activeTab={activeTab} />
            
            {/* 면책조항 */}
            {(!isMobile || activeTab === 'guide') && (
              <div style={{ 
                padding: isMobile ? '12px' : '14px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px', 
                borderLeft: '4px solid #64748b' 
              }}>
                <p style={{ 
                  fontSize: isMobile ? '11px' : '12px', 
                  color: '#64748b', 
                  margin: 0, 
                  lineHeight: '1.6' 
                }}>
                  ⚠️ 본 앱은 사용자가 선택한 조건을 모니터링하는 유틸리티 도구입니다. 제공되는 알람은 투자자문이나 투자권유가 아니며, 모든 투자 판단의 책임은 사용자에게 있습니다.
                </p>
              </div>
            )}
          </div>
          )}
        </div>
      </main>

      {/* 모바일 하단 네비게이션 바 */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(15, 23, 42, 0.98)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '8px 16px',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          display: 'flex',
          justifyContent: 'space-around',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
        }}>
          {[
            { id: 'positions', icon: '📊', label: '포지션' },
            { id: 'alerts', icon: '🔔', label: '알림', badge: alerts.length },
            { id: 'market', icon: '🥚', label: '시장' },
            { id: 'guide', icon: '📚', label: '가이드' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 12px',
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
          onSave={(stock) => { 
            setPositions(prev => [...prev, { ...stock, id: Date.now() }]); 
            setShowAddModal(false); 
          }} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      {editingPosition && (
        <StockModal 
          stock={editingPosition} 
          onSave={(stock) => { 
            setPositions(prev => prev.map(p => p.id === stock.id ? stock : p)); 
            setEditingPosition(null); 
          }} 
          onClose={() => setEditingPosition(null)} 
        />
      )}

      {/* 업그레이드 팝업 - 완전 구현 */}
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

      {/* 로그인 모달 */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
         </div>
    );
  }
