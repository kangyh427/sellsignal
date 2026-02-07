'use client'

// ============================================
// MarketCycleWidget — 코스톨라니 달걀 위젯
// 위치: src/components/MarketCycleWidget.tsx
//
// 세션 4: 모바일 컴팩트 모드 최적화
// - 모바일: SVG 150px + 가로배치 + 지표 2×2 축소
// - 태블릿: SVG 180px + 가로배치
// - 데스크탑: SVG 240px (기존)
// ============================================

import { useState } from 'react'
import { useResponsive } from '../hooks/useResponsive';

interface MarketCycleWidgetProps {
  isPremium?: boolean
}

export default function MarketCycleWidget({ isPremium = false }: MarketCycleWidgetProps) {
  const { isMobile, isTablet } = useResponsive()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // ── 현재 경기 사이클 단계 (1~6) ──
  const currentPhase = 4
  const currentPhaseRange = [70, 110]
  
  // ── 6단계 정의 ──
  const phases = [
    { id: 1, name: 'D', label: '금리저점', subLabel: '살 때', action: '주식매수', color: '#10b981', angle: 270 },
    { id: 2, name: 'C', label: 'B3', subLabel: '부동산투자', action: '채권매도', color: '#22c55e', angle: 315 },
    { id: 3, name: 'B', label: 'B1-B2', subLabel: '예금인출', action: '채권투자', color: '#eab308', angle: 0 },
    { id: 4, name: 'A', label: '금리고점', subLabel: '팔 때', action: '주식매도', color: '#ef4444', angle: 90 },
    { id: 5, name: 'F', label: 'A3', subLabel: '예금입금', action: '주식매도', color: '#f97316', angle: 135 },
    { id: 6, name: 'E', label: 'A1-A2', subLabel: '주식투자', action: '부동산매도', color: '#3b82f6', angle: 225 },
  ]
  
  const currentPhaseData = phases.find(p => p.id === currentPhase) || phases[3]
  
  // ── 추천 행동 ──
  const getRecommendation = (phase: number) => {
    if (phase <= 2) return { text: '매수 적기', color: '#10b981', bg: 'rgba(16,185,129,0.15)' }
    if (phase === 3) return { text: '기다릴 때', color: '#eab308', bg: 'rgba(234,179,8,0.15)' }
    if (phase >= 4) return { text: '매도 관망', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' }
    return { text: '관망', color: '#64748b', bg: 'rgba(100,116,139,0.15)' }
  }
  
  const recommendation = getRecommendation(currentPhase)
  
  // ── 반응형 SVG 크기 ──
  const svgSize = isMobile ? 150 : isTablet ? 180 : 240
  const centerX = svgSize / 2
  const centerY = svgSize / 2
  const radiusX = isMobile ? 52 : isTablet ? 65 : 85
  const radiusY = isMobile ? 62 : isTablet ? 78 : 100

  // ── 지표 데이터 ──
  const indicators = [
    { label: '한은금리', value: '3.5%', icon: '🏦', trend: '▲' },
    { label: 'KOSPI PER', value: '11.8', icon: '📊', trend: '▼' },
    { label: '국채3Y', value: '3.52%', icon: '📈', trend: '▲' },
    { label: 'Fed금리', value: '4.5%', icon: '🇺🇸', trend: '∼' },
  ]

  return (
    <div style={{ 
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
      borderRadius: '14px', 
      padding: isMobile ? '12px' : '20px', 
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '12px',
    }}>
      {/* ── 헤더 ── */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: isMobile ? '10px' : '16px',
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '14px' : '17px', 
          fontWeight: '700', 
          color: '#fff', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          🥚 코스톨라니 달걀
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>신뢰도 75%</span>
          {isPremium && (
            <button 
              onClick={() => {
                setIsAnalyzing(true)
                setTimeout(() => setIsAnalyzing(false), 1500)
              }}
              disabled={isAnalyzing}
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '6px 10px', 
                color: '#fff', 
                fontSize: '11px', 
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                opacity: isAnalyzing ? 0.6 : 1,
                minHeight: '32px', // 터치 타겟
              }}
            >
              {isAnalyzing ? '분석중...' : '🤖 AI 분석'}
            </button>
          )}
        </div>
      </div>
      
      {/* ── 달걀 SVG + 현재 상태 (가로 배치) ── */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        // 모바일에서도 가로 배치 (컴팩트)
        flexDirection: 'row',
        gap: isMobile ? '10px' : '20px',
        marginBottom: isMobile ? '10px' : '16px',
      }}>
        {/* ── 달걀 SVG ── */}
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ flexShrink: 0 }}
        >
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(251,191,36,0.15)" />
              <stop offset="50%" stopColor="rgba(251,191,36,0.05)" />
              <stop offset="50%" stopColor="rgba(147,197,253,0.05)" />
              <stop offset="100%" stopColor="rgba(147,197,253,0.15)" />
            </linearGradient>
            <radialGradient id="eggGradient" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#fcd9b6" />
              <stop offset="100%" stopColor="#f5c89a" />
            </radialGradient>
          </defs>
          
          {/* 배경 */}
          <rect x="0" y="0" width={svgSize} height={svgSize} fill="url(#bgGradient)" rx="10" />
          
          {/* 호황기/불황기 라벨 */}
          <text x="10" y={isMobile ? '14' : '22'} fill="#fbbf24" fontSize={isMobile ? '8' : '10'} fontWeight="600">호황기</text>
          <text x={svgSize - (isMobile ? 32 : 45)} y={isMobile ? '14' : '22'} fill="#93c5fd" fontSize={isMobile ? '8' : '10'} fontWeight="600">불황기</text>
          
          {/* 중앙선 */}
          <line 
            x1="10" y1={centerY} 
            x2={svgSize - 10} y2={centerY} 
            stroke="rgba(255,255,255,0.12)" 
            strokeDasharray="3,3" 
          />
          {!isMobile && (
            <>
              <text x="12" y={centerY - 8} fill="#64748b" fontSize="9">경기성숙</text>
              <text x={svgSize - 48} y={centerY - 8} fill="#64748b" fontSize="9">경기침체</text>
            </>
          )}
          
          {/* 달걀 모양 */}
          <ellipse 
            cx={centerX} 
            cy={centerY} 
            rx={radiusX} 
            ry={radiusY} 
            fill="url(#eggGradient)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1.5"
          />
          
          {/* 달걀 내부 구분선 */}
          <line 
            x1={centerX - radiusX + 15} y1={centerY - radiusY * 0.35}
            x2={centerX + radiusX - 15} y2={centerY - radiusY * 0.35}
            stroke="rgba(0,0,0,0.12)"
            strokeDasharray="3,2"
          />
          <line 
            x1={centerX - radiusX + 12} y1={centerY + radiusY * 0.35}
            x2={centerX + radiusX - 12} y2={centerY + radiusY * 0.35}
            stroke="rgba(0,0,0,0.12)"
            strokeDasharray="3,2"
          />
          
          {/* 달걀 내부 텍스트 */}
          <text x={centerX} y={centerY - radiusY * 0.55} textAnchor="middle" fill="#c0392b" fontSize={isMobile ? '10' : '14'} fontWeight="700">팔 때</text>
          <text x={centerX} y={centerY + 4} textAnchor="middle" fill="#7f8c8d" fontSize={isMobile ? '9' : '13'} fontWeight="600">기다릴 때</text>
          <text x={centerX} y={centerY + radiusY * 0.58} textAnchor="middle" fill="#27ae60" fontSize={isMobile ? '10' : '14'} fontWeight="700">살 때</text>
          
          {/* 금리고점/저점 */}
          <text x={centerX} y={centerY - radiusY - (isMobile ? 8 : 15)} textAnchor="middle" fill="#ef4444" fontSize={isMobile ? '9' : '11'} fontWeight="700">금리고점</text>
          <text x={centerX} y={centerY + radiusY + (isMobile ? 14 : 22)} textAnchor="middle" fill="#10b981" fontSize={isMobile ? '9' : '11'} fontWeight="700">금리저점</text>
          
          {/* 금리상승 화살표 (좌측) */}
          <line 
            x1={centerX - radiusX - 8} 
            y1={centerY + 30} 
            x2={centerX - radiusX - 8} 
            y2={centerY - 30}
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          <polygon 
            points={`${centerX - radiusX - 8},${centerY - 34} ${centerX - radiusX - 13},${centerY - 26} ${centerX - radiusX - 3},${centerY - 26}`}
            fill="#ef4444"
          />
          
          {/* 금리하락 화살표 (우측) */}
          <line 
            x1={centerX + radiusX + 8} 
            y1={centerY - 30} 
            x2={centerX + radiusX + 8} 
            y2={centerY + 30}
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
          <polygon 
            points={`${centerX + radiusX + 8},${centerY + 34} ${centerX + radiusX + 3},${centerY + 26} ${centerX + radiusX + 13},${centerY + 26}`}
            fill="#3b82f6"
          />
          
          {/* 현재 위치 표시 (부채꼴) */}
          {(() => {
            const startAngle = (currentPhaseRange[0] - 90) * Math.PI / 180
            const endAngle = (currentPhaseRange[1] - 90) * Math.PI / 180
            
            const x1 = centerX + (radiusX - 6) * Math.cos(startAngle)
            const y1 = centerY + (radiusY - 6) * Math.sin(startAngle)
            const x2 = centerX + (radiusX - 6) * Math.cos(endAngle)
            const y2 = centerY + (radiusY - 6) * Math.sin(endAngle)
            
            return (
              <g>
                <path 
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radiusX - 6} ${radiusY - 6} 0 0 1 ${x2} ${y2} Z`}
                  fill="rgba(239,68,68,0.3)"
                  stroke="rgba(239,68,68,0.7)"
                  strokeWidth="1.5"
                />
                {/* 현재 위치 점 (펄스 애니메이션) */}
                {(() => {
                  const midAngle = ((currentPhaseRange[0] + currentPhaseRange[1]) / 2 - 90) * Math.PI / 180
                  const dotRadius = isMobile ? radiusX - 20 : radiusX - 28
                  const dotX = centerX + dotRadius * Math.cos(midAngle)
                  const dotY = centerY + (isMobile ? radiusY - 24 : radiusY - 28) * Math.sin(midAngle)
                  const pointSize = isMobile ? 5 : 7
                  return (
                    <>
                      <circle cx={dotX} cy={dotY} r={pointSize} fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                      <circle cx={dotX} cy={dotY} r={pointSize} fill="none" stroke="#ef4444" strokeWidth="1.5">
                        <animate attributeName="r" values={`${pointSize};${pointSize + 6};${pointSize}`} dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )
                })()}
              </g>
            )
          })()}
        </svg>
        
        {/* ── 현재 상태 정보 (우측) ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 현재 단계 뱃지 */}
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '10px',
            background: recommendation.bg, 
            border: `1px solid ${recommendation.color}40`, 
            borderRadius: '10px', 
            padding: isMobile ? '8px 10px' : '10px 14px',
            marginBottom: isMobile ? '8px' : '12px',
          }}>
            <span style={{ 
              width: isMobile ? '24px' : '28px', 
              height: isMobile ? '24px' : '28px', 
              borderRadius: '50%', 
              background: currentPhaseData.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '700',
              flexShrink: 0,
            }}>{currentPhase}</span>
            <div>
              <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '700', color: currentPhaseData.color }}>
                {currentPhaseData.label} 단계
              </div>
              <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8' }}>
                {currentPhaseData.action}
              </div>
            </div>
          </div>
          
          {/* 추천 행동 */}
          <div style={{ 
            fontSize: isMobile ? '13px' : '15px', 
            fontWeight: '700', 
            color: recommendation.color,
            marginBottom: isMobile ? '6px' : '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {recommendation.color === '#ef4444' ? '🔴' : recommendation.color === '#10b981' ? '🟢' : '🟡'}
            권장: {recommendation.text}
          </div>
          
          {/* 설명 (모바일에서 2줄 제한) */}
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px', 
            color: '#94a3b8', 
            lineHeight: '1.5',
            ...(isMobile ? {
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            } : {}),
          }}>
            금리 고점 근처로 주식시장 과열 조정이 예상됩니다. 
            신규 매수는 자제하고 보유 종목 익절을 고려하세요.
          </div>
        </div>
      </div>
      
      {/* ── 지표 그리드 ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)', 
        gap: isMobile ? '6px' : '8px',
      }}>
        {indicators.map((item, i) => (
          <div key={i} style={{ 
            background: 'rgba(0,0,0,0.25)', 
            borderRadius: isMobile ? '8px' : '10px', 
            padding: isMobile ? '8px 4px' : '12px 8px', 
            textAlign: 'center',
          }}>
            <div style={{ fontSize: isMobile ? '14px' : '18px', marginBottom: '2px' }}>{item.icon}</div>
            <div style={{ fontSize: isMobile ? '9px' : '10px', color: '#64748b' }}>{item.label}</div>
            <div style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              fontWeight: '700', 
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
            }}>
              {item.value}
              <span style={{ 
                fontSize: isMobile ? '9px' : '10px', 
                color: item.trend === '▲' ? '#ef4444' : item.trend === '▼' ? '#10b981' : '#64748b',
              }}>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
