'use client';
// @ts-nocheck
// ============================================
// CREST 매도의 기술 - 메인 앱 컴포넌트
// 세션 A 모듈화: 상수/유틸/훅/소형 컴포넌트 분리 완료
// ============================================

import React, { useState, useEffect } from 'react';

// ── 분리된 모듈 import ──
import { SELL_PRESETS, PROFIT_STAGES, STOCK_LIST, EARNINGS_DATA, MARKET_CYCLE } from '../constants';
import { generateMockPriceData, searchStocks, findExactStock, calculateSellPrices, calculateDDay, getResponsiveValue } from '../utils';
import { useResponsive } from '../hooks/useResponsive';
import CrestLogo from '../components/CrestLogo';
import AlertCard from '../components/AlertCard';
import EarningsWidget from '../components/EarningsWidget';
import SellMethodGuide from '../components/SellMethodGuide';
import ResponsiveHeader from '../components/ResponsiveHeader';
import ResponsiveSummaryCards from '../components/ResponsiveSummaryCards';
import MobileBottomNav from '../components/MobileBottomNav';
import type { MobileTab } from '../components/MobileBottomNav';
import PositionCard from '../components/PositionCard';


// ============================================

// [세션1] ResponsiveHeader → components/ResponsiveHeader.tsx 분리 완료
// [세션1] ResponsiveSummaryCards → components/ResponsiveSummaryCards.tsx 분리 완료
// [세션1] MobileBottomNav → components/MobileBottomNav.tsx 신규 생성

// [세션2] EnhancedCandleChart → components/EnhancedCandleChart.tsx 분리 완료
// [세션2] PositionCard → components/PositionCard.tsx 분리 완료


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
      background: 'linear-gradient(145deg, #2d3a4f 0%, #1a2332 100%)', 
      borderRadius: '14px', 
      padding: isMobile ? '14px' : '16px', 
      marginBottom: '14px', 
      border: '1px solid rgba(255,255,255,0.12)' 
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '12px' 
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '15px' : '16px', 
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
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>신뢰도 75%</span>
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
// EarningsWidget → ../components/EarningsWidget.tsx로 분리됨



// [세션2] PositionCard → components/PositionCard.tsx 분리 완료

// ============================================
// 알림 카드 - 완전 구현
// ============================================
// AlertCard → ../components/AlertCard.tsx로 분리됨



// SellMethodGuide → ../components/SellMethodGuide.tsx로 분리됨



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
            }}>📚 매도 조건 선택</label>
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
  
  // ── Auth 대신 로컬 상태 ──
  const [user, setUser] = useState(null);
  const isLoggedIn = false; // 데모 모드
  const isSaving = false;
  
  // ── 데모 포지션 데이터 ──
  const [positions, setPositions] = useState([
    { 
      id: 1, name: '삼성전자', code: '005930', 
      buyPrice: 71500, quantity: 100, 
      highestPrice: 78000,
      selectedPresets: ['candle3', 'stopLoss', 'maSignal'],
      presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } },
      stock: { name: '삼성전자', code: '005930', market: '코스피', sector: '반도체', per: 12.5, pbr: 1.2, sectorPer: 15.2, sectorPbr: 1.8 }
    },
    { 
      id: 2, name: '현대차', code: '005380', 
      buyPrice: 50000, quantity: 100, 
      highestPrice: 55000,
      selectedPresets: ['candle3', 'stopLoss', 'twoThird'],
      presetSettings: { stopLoss: { value: -5 } },
      stock: { name: '현대차', code: '005380', market: '코스피', sector: '자동차', per: 5.8, pbr: 0.6, sectorPer: 7.2, sectorPbr: 0.8 }
    },
    { 
      id: 3, name: '한화에어로스페이스', code: '012450', 
      buyPrice: 350000, quantity: 10, 
      highestPrice: 380000,
      selectedPresets: ['twoThird', 'maSignal', 'volumeZone'],
      presetSettings: { maSignal: { value: 20 } },
      stock: { name: '한화에어로스페이스', code: '012450', market: '코스피', sector: '방산', per: 35.2, pbr: 4.5, sectorPer: 22.0, sectorPbr: 2.8 }
    }
  ]);
  
  // ── 포지션 CRUD (로컬 상태) ──
  const addPosition = (stock) => {
    const newPos = { ...stock, id: Date.now() };
    setPositions(prev => [...prev, newPos]);
  };
  const updatePosition = (id, stock) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, ...stock } : p));
  };
  const deletePosition = (id) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  };
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
  const [activeTab, setActiveTab] = useState<MobileTab>('positions');
  

  // ── [세션2] AI 팝업 상태 (PositionCard에서 메인 앱으로 끌어올림) ──
  const [aiNewsPosition, setAiNewsPosition] = useState(null);
  const [aiReportPosition, setAiReportPosition] = useState(null);

  const isPremium = user?.membership === 'premium';

  // ⬇️ useEffect들
  
  // 가격 데이터 초기화
  useEffect(() => {
    if (positions.length === 0) return;
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

        {/* [세션1] 2×2 탭네비 제거 → MobileBottomNav로 통합 */}

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
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(249,115,22,0.15) 100%)',
                  border: '2px solid rgba(239,68,68,0.4)',
                  borderRadius: '12px', 
                  padding: '14px', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>🥚</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444' }}>4단계: 금리고점 (팔 때)</div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1' }}>매도 관망 권장 · 탭하여 상세보기</div>
                  </div>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '20px' }}>›</span>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '16px' 
            }}>
              <h2 style={{ 
                fontSize: isMobile ? '17px' : '19px', 
                fontWeight: '600', 
                color: '#fff', 
                margin: 0 
              }}>📊 모니터링 중인 종목</h2>
              <span style={{ 
                fontSize: isMobile ? '12px' : '14px', 
                color: '#94a3b8' 
              }}>실시간 조건 감시 중</span>
            </div>
            
            {/* 비로그인 안내 */}
            {!isLoggedIn && (
              <div style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <div>
                  <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600' }}>데모 모드</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>로그인하면 내 종목을 저장하고 관리할 수 있습니다</div>
                </div>
              </div>
            )}
            
            {positions.map(pos => (
              <PositionCard 
                key={pos.id} 
                position={pos} 
                priceData={priceDataMap[pos.id]} 
                onEdit={setEditingPosition} 
                onDelete={(id) => { 
                  deletePosition(id);
                  setPriceDataMap(prev => { const u = { ...prev }; delete u[id]; return u; }); 
                }} 
                isPremium={isPremium}
                onUpgrade={() => setShowUpgradePopup(true)}
                onShowAINews={(pos) => setAiNewsPosition(pos)}
                onShowAIReport={(pos) => setAiReportPosition(pos)}
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


      {/* [세션1] 모바일 하단 네비게이션 - 분리된 컴포넌트 사용 */}
      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCount={alerts.length}
        />
      )}

      {/* Footer - 데스크톱에서만 표시 */}
      {!isMobile && (
        <footer style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '48px 24px 32px',
          marginTop: '40px',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            {/* 상단: 로고 + 링크 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '40px',
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              {/* 로고 & 설명 */}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '18px' 
                  }}>📈</div>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#fff',
                    letterSpacing: '2px'
                  }}>CREST</span>
                </div>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#64748b', 
                  margin: 0,
                  lineHeight: '1.6',
                  maxWidth: '300px'
                }}>
                  Ride the Peak — 수익의 정점을 포착하는 스마트 매도 알림 도구
                </p>
              </div>

              {/* 서비스 링크 */}
              <div>
                <h4 style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#94a3b8', 
                  margin: '0 0 12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>서비스</h4>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {[
                    { label: '이용약관', href: '/terms' },
                    { label: '개인정보처리방침', href: '/privacy' },
                    { label: '프리미엄 안내', href: '/premium' }
                  ].map((item, i) => (
                    <li key={i}>
                      <a href={item.href} style={{ 
                        fontSize: '13px', 
                        color: '#64748b', 
                        textDecoration: 'none',
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = '#64748b'}
                      >{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 고객지원 링크 */}
              <div>
                <h4 style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#94a3b8', 
                  margin: '0 0 12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>고객지원</h4>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {[
                    { label: '자주 묻는 질문', href: '/faq' },
                    { label: '문의하기', href: '/contact' }
                  ].map((item, i) => (
                    <li key={i}>
                      <a href={item.href} style={{ 
                        fontSize: '13px', 
                        color: '#64748b', 
                        textDecoration: 'none',
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = '#64748b'}
                      >{item.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 사업자 정보 */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
            }}>
              <h4 style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#64748b', 
                margin: '0 0 12px',
              }}>사업자 정보</h4>
              <div style={{ 
                fontSize: '12px', 
                color: '#475569', 
                lineHeight: '1.8',
              }}>
                <p style={{ margin: '0 0 4px' }}>
                  <span style={{ color: '#64748b' }}>상호:</span> 나온 | 
                  <span style={{ color: '#64748b', marginLeft: '8px' }}>대표:</span> 강윤혁 | 
                  <span style={{ color: '#64748b', marginLeft: '8px' }}>사업자등록번호:</span> 392-23-02153
                </p>
                <p style={{ margin: '0 0 4px' }}>
                  <span style={{ color: '#64748b' }}>통신판매업신고:</span> 제2025-세종-0000호 | 
                  <span style={{ color: '#64748b', marginLeft: '8px' }}>이메일:</span> support@sellsignal.kr
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ color: '#64748b' }}>주소:</span> 세종특별자치시 마음안1로 155, 301호(고운동, 성진프라자)
                </p>
              </div>
            </div>

            {/* 면책조항 */}
            <div style={{
              padding: '16px',
              background: 'rgba(234,179,8,0.05)',
              border: '1px solid rgba(234,179,8,0.15)',
              borderRadius: '8px',
              marginBottom: '24px',
            }}>
              <p style={{ 
                fontSize: '11px', 
                color: '#a3a3a3', 
                margin: 0,
                lineHeight: '1.7',
              }}>
                ⚠️ <strong style={{ color: '#eab308' }}>투자 유의사항:</strong> 본 서비스는 사용자가 설정한 조건을 모니터링하는 유틸리티 도구로, 투자자문업 또는 투자권유에 해당하지 않습니다. 
                제공되는 정보는 참고용이며, 모든 투자 판단과 그에 따른 결과의 책임은 투자자 본인에게 있습니다. 
                주식 투자는 원금 손실의 위험이 있으므로 신중하게 결정하시기 바랍니다.
              </p>
            </div>

            {/* 저작권 */}
            <div style={{
              textAlign: 'center',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#475569', 
                margin: 0,
              }}>
                © 2025 CREST (sellsignal.kr). All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* 모달들 */}
      {showAddModal && (
        <StockModal 
          onSave={(stock) => { 
            addPosition(stock);
            setShowAddModal(false); 
          }} 
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingPosition && (
        <StockModal 
          stock={editingPosition} 
          onSave={(stock) => { 
            updatePosition(stock.id, stock);
            setEditingPosition(null); 
          }} 
          onClose={() => setEditingPosition(null)}
        />
      )}

      {/* 업그레이드 팝업 - 완전 구현 */}

      {/* [세션2] AI 팝업 - 메인 앱에서 관리 */}
      {aiNewsPosition && (
        <AINewsPopup 
          position={aiNewsPosition} 
          onClose={() => setAiNewsPosition(null)} 
          isPremium={isPremium} 
          onUpgrade={() => setShowUpgradePopup(true)} 
        />
      )}
      {aiReportPosition && (
        <AIReportPopup 
          position={aiReportPosition} 
          onClose={() => setAiReportPosition(null)} 
          isPremium={isPremium} 
          onUpgrade={() => setShowUpgradePopup(true)} 
        />
      )}

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
