'use client';
// ============================================
// MarketCycleWidget - 코스톨라니 달걀 위젯
// 경로: src/components/MarketCycleWidget.tsx
// 세션3에서 SellSignalApp.tsx L38-422 분리
// ============================================
// 모바일 최적화:
//   - 달걀 SVG 크기 자동 조절 (200/220/240px)
//   - 모바일에서 달걀+상태정보 세로 배치
//   - 지표 그리드 모바일 2×2 / 데스크톱 4열
//   - AI 버튼 터치 타겟 확보
// ============================================

import React, { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';

// ── Props 타입 정의 ──
interface MarketCycleWidgetProps {
  isPremium: boolean;
}

// ── 경기 사이클 단계 타입 ──
interface PhaseInfo {
  id: number;
  name: string;
  label: string;
  subLabel: string;
  action: string;
  color: string;
  angle: number;
}

// ── 추천 행동 타입 ──
interface Recommendation {
  text: string;
  color: string;
  bg: string;
}

// ── 지표 카드 타입 ──
interface IndicatorItem {
  label: string;
  value: string;
  icon: string;
  trend: '▲' | '▼' | '−';
}

// ============================================
// 6단계 경기 사이클 정의
// ============================================
const PHASES: PhaseInfo[] = [
  { id: 1, name: 'D', label: '금리저점', subLabel: '살 때', action: '주식매수', color: '#10b981', angle: 270 },
  { id: 2, name: 'C', label: 'B3', subLabel: '부동산투자', action: '채권매도', color: '#22c55e', angle: 315 },
  { id: 3, name: 'B', label: 'B1-B2', subLabel: '예금인출', action: '채권투자', color: '#eab308', angle: 0 },
  { id: 4, name: 'A', label: '금리고점', subLabel: '팔 때', action: '주식매도', color: '#ef4444', angle: 90 },
  { id: 5, name: 'F', label: 'A3', subLabel: '예금입금', action: '주식매도', color: '#f97316', angle: 135 },
  { id: 6, name: 'E', label: 'A1-A2', subLabel: '주식투자', action: '부동산매도', color: '#3b82f6', angle: 225 },
];

// ── 지표 데이터 ──
const INDICATORS: IndicatorItem[] = [
  { label: '한은금리', value: '3.5%', icon: '🏦', trend: '▲' },
  { label: 'KOSPI PER', value: '11.8', icon: '📊', trend: '▼' },
  { label: '국채3Y', value: '3.52%', icon: '📈', trend: '▲' },
  { label: 'Fed금리', value: '4.5%', icon: '🇺🇸', trend: '−' },
];

// ── 추천 행동 결정 ──
const getRecommendation = (phase: number): Recommendation => {
  if (phase <= 2) return { text: '매수 적기', color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
  if (phase === 3) return { text: '기다릴 때', color: '#eab308', bg: 'rgba(234,179,8,0.15)' };
  if (phase >= 4) return { text: '매도 관망', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  return { text: '관망', color: '#64748b', bg: 'rgba(100,116,139,0.15)' };
};

// ── 트렌드 화살표 색상 ──
const getTrendColor = (trend: string): string => {
  if (trend === '▲') return '#ef4444';
  if (trend === '▼') return '#10b981';
  return '#64748b';
};

// ============================================
// 코스톨라니 달걀 SVG 컴포넌트
// ============================================
const EggSVG: React.FC<{
  svgSize: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  currentPhaseRange: [number, number];
  isMobile: boolean;
}> = ({ svgSize, centerX, centerY, radiusX, radiusY, currentPhaseRange, isMobile }) => {
  // 현재 위치 부채꼴 계산
  const startAngle = (currentPhaseRange[0] - 90) * Math.PI / 180;
  const endAngle = (currentPhaseRange[1] - 90) * Math.PI / 180;
  const x1 = centerX + (radiusX - 5) * Math.cos(startAngle);
  const y1 = centerY + (radiusY - 5) * Math.sin(startAngle);
  const x2 = centerX + (radiusX - 5) * Math.cos(endAngle);
  const y2 = centerY + (radiusY - 5) * Math.sin(endAngle);

  // 현재 위치 점 (중앙)
  const midAngle = ((currentPhaseRange[0] + currentPhaseRange[1]) / 2 - 90) * Math.PI / 180;
  const dotX = centerX + (radiusX - 25) * Math.cos(midAngle);
  const dotY = centerY + (radiusY - 25) * Math.sin(midAngle);

  return (
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
        {/* 순환 화살표 마커 */}
        <marker id="circleArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="rgba(255,255,255,0.5)" />
        </marker>
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
        stroke="rgba(0,0,0,0.15)" strokeDasharray="4,2"
      />
      <line
        x1={centerX - radiusX + 10} y1={centerY + radiusY * 0.35}
        x2={centerX + radiusX - 10} y2={centerY + radiusY * 0.35}
        stroke="rgba(0,0,0,0.15)" strokeDasharray="4,2"
      />

      {/* 달걀 내부 텍스트 */}
      <text x={centerX} y={centerY - radiusY * 0.55} textAnchor="middle" fill="#c0392b" fontSize={isMobile ? '11' : '13'} fontWeight="700">팔 때</text>
      <text x={centerX} y={centerY + 4} textAnchor="middle" fill="#7f8c8d" fontSize={isMobile ? '10' : '12'} fontWeight="600">기다릴 때</text>
      <text x={centerX} y={centerY + radiusY * 0.6} textAnchor="middle" fill="#27ae60" fontSize={isMobile ? '11' : '13'} fontWeight="700">살 때</text>

      {/* 금리고점 (상단) / 금리저점 (하단) */}
      <text x={centerX} y={centerY - radiusY - 12} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">금리고점</text>
      <text x={centerX} y={centerY + radiusY + 18} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">금리저점</text>

      {/* 금리상승기 화살표 (좌측) */}
      <line
        x1={centerX - radiusX - 10} y1={centerY + 35}
        x2={centerX - radiusX - 10} y2={centerY - 35}
        stroke="#ef4444" strokeWidth="2"
      />
      <polygon
        points={`${centerX - radiusX - 10},${centerY - 40} ${centerX - radiusX - 15},${centerY - 30} ${centerX - radiusX - 5},${centerY - 30}`}
        fill="#ef4444"
      />
      <text
        x={centerX - radiusX - 20} y={centerY}
        textAnchor="middle" fill="#ef4444" fontSize="8"
        transform={`rotate(-90, ${centerX - radiusX - 20}, ${centerY})`}
      >금리↑</text>

      {/* 금리하락기 화살표 (우측) */}
      <line
        x1={centerX + radiusX + 10} y1={centerY - 35}
        x2={centerX + radiusX + 10} y2={centerY + 35}
        stroke="#3b82f6" strokeWidth="2"
      />
      <polygon
        points={`${centerX + radiusX + 10},${centerY + 40} ${centerX + radiusX + 5},${centerY + 30} ${centerX + radiusX + 15},${centerY + 30}`}
        fill="#3b82f6"
      />
      <text
        x={centerX + radiusX + 20} y={centerY}
        textAnchor="middle" fill="#3b82f6" fontSize="8"
        transform={`rotate(90, ${centerX + radiusX + 20}, ${centerY})`}
      >금리↓</text>

      {/* 현재 위치 부채꼴 영역 */}
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

      {/* 현재 위치 표시 점 */}
      <circle cx={dotX} cy={dotY} r="6" fill="#ef4444" stroke="#fff" strokeWidth="2" />
      <circle cx={dotX} cy={dotY} r="6" fill="none" stroke="#ef4444" strokeWidth="2">
        <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* 순환 화살표 */}
      <path
        d={`M ${centerX + 20} ${centerY - radiusY + 25} Q ${centerX + radiusX - 10} ${centerY - radiusY + 15}, ${centerX + radiusX - 5} ${centerY - 20}`}
        stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"
        markerEnd="url(#circleArrow)"
      />
    </svg>
  );
};

// ============================================
// 메인 컴포넌트
// ============================================
const MarketCycleWidget: React.FC<MarketCycleWidgetProps> = ({ isPremium }) => {
  const { isMobile, isTablet } = useResponsive();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 현재 경기 사이클 단계 (1~6)
  const currentPhase = 4; // 금리고점 근처, 주식매도 시기
  const currentPhaseRange: [number, number] = [70, 110]; // 각도 범위

  const currentPhaseData = PHASES.find(p => p.id === currentPhase) || PHASES[3];
  const recommendation = getRecommendation(currentPhase);

  // SVG 크기 계산 (반응형)
  const svgSize = isMobile ? 200 : isTablet ? 220 : 240;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radiusX = isMobile ? 70 : 85;
  const radiusY = isMobile ? 85 : 100;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #2d3a4f 0%, #1a2332 100%)',
      borderRadius: '14px',
      padding: isMobile ? '14px' : '16px',
      marginBottom: '14px',
      border: '1px solid rgba(255,255,255,0.12)'
    }}>
      {/* ── 헤더 ── */}
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
                opacity: isAnalyzing ? 0.6 : 1,
                minHeight: '28px', // 터치 타겟 확보
              }}
            >
              {isAnalyzing ? '분석중...' : '🤖 AI'}
            </button>
          )}
        </div>
      </div>

      {/* ── 달걀 SVG + 현재 상태 ── */}
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'center' : 'flex-start',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        marginBottom: '12px'
      }}>
        {/* 달걀 SVG */}
        <EggSVG
          svgSize={svgSize}
          centerX={centerX}
          centerY={centerY}
          radiusX={radiusX}
          radiusY={radiusY}
          currentPhaseRange={currentPhaseRange}
          isMobile={isMobile}
        />

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

      {/* ── 지표 그리드 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: '6px'
      }}>
        {INDICATORS.map((item, i) => (
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
              <span style={{ fontSize: '9px', color: getTrendColor(item.trend) }}>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketCycleWidget;
