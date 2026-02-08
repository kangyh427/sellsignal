'use client';
// ============================================
// MarketCycleWidget v6 - 코스톨라니 달걀 + 시장 지표
// 경로: src/components/MarketCycleWidget.tsx
// 세션 18A: 17C 정밀 6단계 SVG 달걀
// ============================================

import React from 'react';
import { CYCLE_STAGES } from '@/constants';

interface MarketCycleWidgetProps {
  isMobile: boolean;
  isTablet: boolean;
  isPremium: boolean;
}

const MarketCycleWidget = ({ isMobile, isTablet, isPremium }) => {
  const currentStage = 4;
  const stage = CYCLE_STAGES[currentStage - 1];

  const indicators = [
    { icon: '🏛', label: '한은금리', value: '3.5%', change: '▲' },
    { icon: '📊', label: 'KOSPI PER', value: '11.8', change: '▼' },
    { icon: '📈', label: '국채3Y', value: '3.52%', change: '▲' },
    { label: 'Fed금리', value: '4.5%', change: '→', textIcon: '$' },
  ];

  const vw = 320, vh = 320;
  const ecx = 160, ecy = 160, erx = 70, ery = 76;
  const markerOffset = 42;
  const stageAngles = [130, 180, 230, 310, 0, 50];

  const getPos = (angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: ecx + (erx + markerOffset) * Math.cos(rad),
      y: ecy + (ery + markerOffset) * Math.sin(rad),
    };
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      borderRadius: '14px', padding: isMobile ? '16px' : '20px',
      border: '1px solid rgba(255,255,255,0.06)', marginBottom: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          코스톨라니 달걀
          {!isPremium && <span style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(139,92,246,0.15)', padding: '2px 6px', borderRadius: '4px' }}>PRO</span>}
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>신뢰도 75%</span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        {/* ── 달걀 영역 (항상 세로 배치 — 사이드바 440px 대응) ── */}
        <div style={{
          width: '100%',
          maxWidth: '340px', flexShrink: 0,
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2px', padding: '4px 0' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444' }}>
              금리인상 시작 · 금리저점
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '2px', padding: '0 2px', minWidth: '16px',
            }}>
              {'경기상승'.split('').map((ch, i) => (
                <span key={i} style={{
                  fontSize: '11px', fontWeight: '700', color: '#10b981',
                  lineHeight: '1.2',
                }}>{ch}</span>
              ))}
              <span style={{ fontSize: '14px', color: '#10b981', marginTop: '2px' }}>▲</span>
            </div>

            <svg width="100%" viewBox={`0 0 ${vw} ${vh}`} style={{ display: 'block', flex: 1 }}>
              <ellipse cx={ecx} cy={ecy} rx={erx} ry={ery}
                fill="rgba(15,23,42,0.9)"
                stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              <line x1={ecx - erx + 15} y1={ecy} x2={ecx + erx - 15} y2={ecy}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />
              <text x={ecx} y={ecy - 30} textAnchor="middle"
                fill="#ef4444" fontSize="17" fontWeight="800" letterSpacing="4">매도</text>
              <text x={ecx} y={ecy + 6} textAnchor="middle"
                fill="#475569" fontSize="12" fontWeight="600">관망</text>
              <text x={ecx} y={ecy + 42} textAnchor="middle"
                fill="#10b981" fontSize="17" fontWeight="800" letterSpacing="4">매수</text>

              <path
                d={`M ${ecx - erx - 14} ${ecy + 40}
                    C ${ecx - erx - 24} ${ecy + 12},
                      ${ecx - erx - 24} ${ecy - 12},
                      ${ecx - erx - 14} ${ecy - 40}`}
                stroke="#10b981" fill="none" strokeWidth="2"
                markerEnd="url(#au6)" />
              <path
                d={`M ${ecx + erx + 14} ${ecy - 40}
                    C ${ecx + erx + 24} ${ecy - 12},
                      ${ecx + erx + 24} ${ecy + 12},
                      ${ecx + erx + 14} ${ecy + 40}`}
                stroke="#ef4444" fill="none" strokeWidth="2"
                markerEnd="url(#ad6)" />

              {CYCLE_STAGES.map((s, idx) => {
                const pos = getPos(stageAngles[idx]);
                const isCurrent = s.num === currentStage;
                const mr = isCurrent ? 18 : 14;
                const rad = (stageAngles[idx] * Math.PI) / 180;
                const ex = ecx + erx * Math.cos(rad);
                const ey = ecy + ery * Math.sin(rad);
                return (
                  <g key={s.num}>
                    <line x1={ex} y1={ey} x2={pos.x} y2={pos.y}
                      stroke={s.color} strokeWidth="0.7" opacity="0.15" strokeDasharray="2,2" />
                    <circle cx={pos.x} cy={pos.y} r={mr}
                      fill={isCurrent ? s.color : 'rgba(15,23,42,0.95)'}
                      stroke={s.color} strokeWidth={isCurrent ? 2.5 : 1.5}
                      fillOpacity={isCurrent ? 0.25 : 1} />
                    <text x={pos.x} y={pos.y + (isCurrent ? 6 : 5)} textAnchor="middle"
                      fill={isCurrent ? '#fff' : s.color}
                      fontSize={isCurrent ? 15 : 12} fontWeight="700">
                      {s.num}
                    </text>
                    {isCurrent && (
                      <circle cx={pos.x} cy={pos.y} r={mr}
                        fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.5">
                        <animate attributeName="r" from={mr} to={mr + 14} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}

              <defs>
                <marker id="au6" markerWidth="10" markerHeight="8" refX="5" refY="4" orient="auto">
                  <polygon points="0 8, 5 0, 10 8" fill="#10b981" />
                </marker>
                <marker id="ad6" markerWidth="10" markerHeight="8" refX="5" refY="4" orient="auto">
                  <polygon points="0 0, 5 8, 10 0" fill="#ef4444" />
                </marker>
              </defs>
            </svg>

            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '2px', padding: '0 2px', minWidth: '16px',
            }}>
              <span style={{ fontSize: '14px', color: '#ef4444', marginBottom: '2px' }}>▼</span>
              {'경기침체'.split('').map((ch, i) => (
                <span key={i} style={{
                  fontSize: '11px', fontWeight: '700', color: '#ef4444',
                  lineHeight: '1.2',
                }}>{ch}</span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2px', padding: '4px 0' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>
              금리인하 시작 · 금리고점
            </div>
          </div>
        </div>

        {/* ── 현재 단계 설명 ── */}
        <div style={{ flex: 1, width: '100%' }}>
          <div style={{
            background: stage.bgColor, border: `1px solid ${stage.borderColor}`,
            borderRadius: '12px', padding: '14px', marginBottom: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                width: '34px', height: '34px', background: stage.color,
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '15px', fontWeight: '700',
                color: '#fff', flexShrink: 0,
              }}>{stage.num}</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: stage.color }}>
                  {stage.name} — {stage.action}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{stage.detail}</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>{stage.recommendation}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.5' }}>{stage.desc}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            {CYCLE_STAGES.map((s) => (
              <div key={s.num} style={{
                padding: '7px 8px', borderRadius: '6px',
                background: s.num === currentStage ? s.color + '15' : 'rgba(255,255,255,0.02)',
                borderLeft: `3px solid ${s.color}`,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{
                  fontSize: '12px', fontWeight: '700',
                  color: s.num === currentStage ? '#fff' : '#64748b',
                  width: '18px', height: '18px',
                  background: s.num === currentStage ? s.color : 'transparent',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>{s.num}</span>
                <span style={{
                  fontSize: '11px',
                  color: s.num === currentStage ? '#e2e8f0' : '#64748b',
                  fontWeight: s.num === currentStage ? '600' : '400',
                }}>{s.name} · {s.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 시장 지표 */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '8px', marginTop: '14px',
      }}>
        {indicators.map((ind, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
            padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '16px', marginBottom: '2px' }}>
              {ind.icon || (
                <span style={{
                  display: 'inline-flex', width: '20px', height: '20px',
                  background: 'rgba(59,130,246,0.2)', borderRadius: '4px',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700', color: '#60a5fa',
                }}>{ind.textIcon}</span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{ind.label}</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0' }}>
              {ind.value}{' '}
              <span style={{
                fontSize: '11px',
                color: ind.change === '▲' ? '#ef4444' : ind.change === '▼' ? '#10b981' : '#64748b',
              }}>{ind.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default MarketCycleWidget;
