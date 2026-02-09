'use client';
// ============================================
// BuffettIndicatorWidget v9 - 한미 이중 반원 게이지 (실데이터)
// 경로: src/components/BuffettIndicatorWidget.tsx
// 세션 40: 실데이터 연동
// 세션 40B: 무료/PRO 분리 안내 + 데스크탑 레이아웃 수정
//   - PRO 뱃지 → 무료 뱃지 (무료버전일 때)
//   - 하단 안내 문구 무료/PRO 분리
//   - 에러 메시지 + 범례 + 안내 데스크탑 줄바꿈 수정
//   - GDP 기준연도 명확 표시
// ============================================

import React from 'react';
import useBuffettIndicator, { type BuffettCountryData } from '@/hooks/useBuffettIndicator';

interface BuffettIndicatorWidgetProps {
  isMobile: boolean;
  isPremium: boolean;
}

// ── 색상 판정 ──
const getColor = (r: number) => {
  if (r < 70) return '#10b981';
  if (r < 100) return '#eab308';
  if (r < 150) return '#f97316';
  return '#ef4444';
};

// ── 시각 포맷 ──
const formatTime = (isoString: string | null): string => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yy}.${mm}.${dd} ${hh}:${mi}`;
  } catch {
    return '-';
  }
};

// ── 게이지 차트 컴포넌트 ──
const GaugeChart = ({
  data, name, isMobile,
}: {
  data: BuffettCountryData;
  name: string;
  isMobile: boolean;
}) => {
  const maxR = 250;
  const pct = Math.min(data.ratio / maxR, 1);
  const col = getColor(data.ratio);

  const sw = isMobile ? 150 : 160;
  const sh = isMobile ? 100 : 105;
  const gcx = sw / 2;
  const gcy = sh - 20;
  const r = isMobile ? 50 : 56;

  const endAngle = Math.PI + pct * Math.PI;
  const fX = gcx + r * Math.cos(endAngle);
  const fY = gcy + r * Math.sin(endAngle);

  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: isMobile ? '130px' : '140px', maxWidth: '175px' }}>
      {/* 국가 라벨 */}
      <div style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
        background: col + '15', border: `1px solid ${col}30`, marginBottom: '6px',
      }}>
        <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '700', color: col }}>
          {name} 버핏지수
        </span>
      </div>

      {/* SVG 반원 게이지 */}
      <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`}
        style={{ display: 'block', margin: '0 auto' }}>
        <path
          d={`M ${gcx - r} ${gcy} A ${r} ${r} 0 0 1 ${gcx + r} ${gcy}`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
        <path
          d={`M ${gcx - r} ${gcy} A ${r} ${r} 0 0 1 ${fX} ${fY}`}
          fill="none" stroke={col} strokeWidth="12" strokeLinecap="round" />
        <text x={gcx} y={gcy - 20} textAnchor="middle"
          fill="#fff" fontSize={isMobile ? '22' : '26'} fontWeight="800">{data.ratio}%</text>
        <text x={gcx} y={gcy - 2} textAnchor="middle"
          fill={col} fontSize="11" fontWeight="600">{data.label}</text>
        <text x={gcx - r} y={gcy + 16} textAnchor="middle"
          fill="#64748b" fontSize="9">0%</text>
        <text x={gcx + r} y={gcy + 16} textAnchor="middle"
          fill="#64748b" fontSize="9">250%</text>
      </svg>

      {/* 세부 수치 (실데이터일 때만) */}
      {data.indexLevel && (
        <div style={{ fontSize: '9px', color: '#475569', marginTop: '2px', lineHeight: '1.4' }}>
          {name === '한국'
            ? `KOSPI ${data.indexLevel.toLocaleString()} · 시총 ${data.marketCap.toLocaleString()}조`
            : `S&P ${data.indexLevel.toLocaleString()} · $${(data.marketCap / 1000).toFixed(1)}T`}
        </div>
      )}
    </div>
  );
};

// ── 로딩 스켈레톤 ──
const LoadingSkeleton = ({ isMobile }: { isMobile: boolean }) => (
  <div style={{
    display: 'flex', justifyContent: 'center', gap: isMobile ? '8px' : '40px',
    marginBottom: '14px', alignItems: 'flex-start',
  }}>
    {[0, 1].map((i) => (
      <div key={i} style={{
        textAlign: 'center', flex: 1, minWidth: isMobile ? '130px' : '140px', maxWidth: '175px',
      }}>
        <div style={{
          width: '80px', height: '20px', borderRadius: '6px',
          background: 'rgba(255,255,255,0.06)', margin: '0 auto 6px',
        }} />
        <div style={{
          width: isMobile ? '150px' : '160px', height: isMobile ? '100px' : '105px',
          borderRadius: '8px', background: 'rgba(255,255,255,0.04)', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: '#475569', fontSize: '12px' }}>로딩 중...</div>
        </div>
      </div>
    ))}
  </div>
);

// ── 범례 아이템 ──
const LEGEND_ITEMS = [
  { label: '저평가', range: '<70%', color: '#10b981' },
  { label: '적정', range: '70-100%', color: '#eab308' },
  { label: '고평가', range: '100-150%', color: '#f97316' },
  { label: '극단적', range: '>150%', color: '#ef4444' },
];

// ── 메인 위젯 ──
const BuffettIndicatorWidget = ({ isMobile, isPremium }: BuffettIndicatorWidgetProps) => {
  const { korea, usa, isLoading, error, updatedAt, gdpNote, refresh } = useBuffettIndicator();

  // GDP 기준연도 (표시용)
  const gdpYear = korea.gdpYear ?? 2024;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      borderRadius: '14px', padding: isMobile ? '14px' : '20px',
      border: '1px solid rgba(255,255,255,0.06)', marginBottom: '14px',
    }}>
      {/* ── 헤더 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px', gap: '8px',
      }}>
        <h3 style={{
          fontSize: isMobile ? '15px' : '16px', fontWeight: '700', color: '#fff',
          margin: 0, display: 'flex', alignItems: 'center', gap: '8px',
          whiteSpace: 'nowrap',
        }}>
          버핏지수 (시가총액/GDP)
          {/* ★ 무료/PRO 뱃지 분리 */}
          {isPremium ? (
            <span style={{
              fontSize: '10px', color: '#a78bfa',
              background: 'rgba(139,92,246,0.15)',
              padding: '2px 6px', borderRadius: '4px',
              fontWeight: '600',
            }}>PRO</span>
          ) : (
            <span style={{
              fontSize: '10px', color: '#64748b',
              background: 'rgba(255,255,255,0.06)',
              padding: '2px 6px', borderRadius: '4px',
              fontWeight: '600',
            }}>무료</span>
          )}
        </h3>
        {/* 새로고침 버튼 */}
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', padding: '4px 8px', cursor: 'pointer',
            color: '#64748b', fontSize: '11px', display: 'flex',
            alignItems: 'center', gap: '4px', flexShrink: 0,
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <span style={{
            display: 'inline-block',
            animation: isLoading ? 'buffett-spin 1s linear infinite' : 'none',
          }}>🔄</span>
          {!isMobile && '갱신'}
        </button>
      </div>

      {/* ── 게이지 영역 ── */}
      {isLoading && !updatedAt ? (
        <LoadingSkeleton isMobile={isMobile} />
      ) : (
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: isMobile ? '8px' : '40px',
          marginBottom: '14px', alignItems: 'flex-start',
        }}>
          <GaugeChart data={korea} name="한국" isMobile={isMobile} />
          <GaugeChart data={usa} name="미국" isMobile={isMobile} />
        </div>
      )}

      {/* ── 에러 메시지 ── */}
      {error && (
        <div style={{
          padding: '10px 14px', marginBottom: '10px', borderRadius: '8px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
          textAlign: 'center', lineHeight: '1.6',
          maxWidth: '100%',
        }}>
          <div style={{ fontSize: '11px', color: '#f87171', fontWeight: '600' }}>
            ⚠️ 버핏지수 데이터를 불러올 수 없습니다
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
            이전 데이터를 표시합니다
          </div>
        </div>
      )}

      {/* ── 범례 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? '6px' : '10px',
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
      }}>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: isMobile ? '10px' : '11px', color: '#94a3b8',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '2px',
              background: item.color, flexShrink: 0,
            }} />
            <span style={{ fontWeight: '600' }}>{item.label}</span>
            <span style={{ color: '#475569' }}>{item.range}</span>
          </div>
        ))}
      </div>

      {/* ── 하단 안내 — 무료/PRO 분리 ── */}
      <div style={{
        marginTop: '10px', textAlign: 'center',
        padding: '10px 14px',
        borderRadius: '8px',
        background: isPremium ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.03)',
        border: isPremium ? '1px solid rgba(139,92,246,0.12)' : '1px solid rgba(255,255,255,0.06)',
        lineHeight: '1.6',
      }}>
        {isPremium ? (
          /* ★ PRO 사용자: 실시간 갱신 시각 표시 */
          <>
            <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600' }}>
              📡 실시간 데이터 · 마지막 갱신 {formatTime(updatedAt)}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
              Yahoo Finance 지수 기반 실시간 계산 · GDP {gdpYear}년 기준
            </div>
          </>
        ) : (
          /* ★ 무료 사용자: 기준연도 + PRO 유도 */
          <>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              📊 {gdpYear}년 GDP 기준 데이터입니다
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              PRO 구독 시 실시간 업데이트 + 역사적 추이 비교 제공
            </div>
          </>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes buffett-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BuffettIndicatorWidget;
