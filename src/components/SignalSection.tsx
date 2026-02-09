'use client';
// ============================================
// SignalSection - 매도 시그널 표시 컴포넌트
// 경로: src/components/SignalSection.tsx
// 세션 24: PositionCard 내부에 삽입되는 시그널 UI
// ============================================
//
// 사용법:
//   <SignalSection signals={signalsMap[pos.id]} isMobile={isMobile} />
//
// 두 가지 모드:
//   1. compact={true} → 접힌 카드용 배지 (1줄)
//   2. compact={false} → 펼친 카드용 상세 섹션
// ============================================

import React, { useState } from 'react';
import { SELL_PRESETS } from '@/constants';
import type { PositionSignals, SignalResult, SignalLevel } from '@/types';

// ── 레벨별 스타일 ──
const LEVEL_STYLES: Record<SignalLevel, {
  bg: string; border: string; text: string; badge: string; badgeText: string;
}> = {
  danger:   { bg: 'rgba(239,68,68,0.08)', border: 'rgba(252,165,165,0.3)', text: '#ef4444', badge: '#ef4444', badgeText: '#fff' },
  warning:  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(252,211,77,0.3)',  text: '#f59e0b', badge: '#f59e0b', badgeText: '#fff' },
  caution:  { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(134,239,172,0.3)', text: '#22c55e', badge: '#22c55e', badgeText: '#fff' },
  safe:     { bg: 'rgba(148,163,184,0.05)', border: 'rgba(226,232,240,0.15)', text: '#94a3b8', badge: '#64748b', badgeText: '#fff' },
  inactive: { bg: 'rgba(148,163,184,0.03)', border: 'rgba(226,232,240,0.1)',  text: '#64748b', badge: '#475569', badgeText: '#94a3b8' },
};

const LEVEL_PRIORITY: Record<SignalLevel, number> = {
  danger: 4, warning: 3, caution: 2, safe: 1, inactive: 0,
};

// ── Compact 배지 (접힌 카드용) ──
export function SignalBadgeCompact({ signals }: { signals: PositionSignals | null | undefined }) {
  if (!signals || signals.activeCount === 0) return null;

  const dangerCount = signals.signals.filter(s => s.level === 'danger').length;
  const warningCount = signals.signals.filter(s => s.level === 'warning').length;

  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {dangerCount > 0 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '2px',
          padding: '1px 5px', borderRadius: '6px',
          background: '#ef4444', color: '#fff',
          fontSize: '9px', fontWeight: '700', lineHeight: '14px',
        }}>
          🚨{dangerCount}
        </span>
      )}
      {warningCount > 0 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '2px',
          padding: '1px 5px', borderRadius: '6px',
          background: '#f59e0b', color: '#fff',
          fontSize: '9px', fontWeight: '700', lineHeight: '14px',
        }}>
          ⚠️{warningCount}
        </span>
      )}
    </div>
  );
}

// ── 개별 시그널 행 ──
function SignalRow({ signal, expanded, onToggle }: {
  signal: SignalResult; expanded: boolean; onToggle: () => void;
}) {
  const style = LEVEL_STYLES[signal.level];
  const preset = SELL_PRESETS[signal.presetId];

  return (
    <div
      onClick={onToggle}
      style={{
        background: style.bg, borderRadius: '8px',
        padding: '8px 10px', cursor: 'pointer',
        borderLeft: `3px solid ${style.border.replace('0.3', '0.8')}`,
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '14px', flexShrink: 0 }}>{preset?.icon || '📋'}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '12px', fontWeight: '600', color: style.text,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {signal.message}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '6px' }}>
          <span style={{
            background: style.badge, color: style.badgeText,
            padding: '1px 6px', borderRadius: '6px',
            fontSize: '10px', fontWeight: '700',
          }}>
            {signal.score}
          </span>
          <span style={{
            fontSize: '10px', color: '#64748b',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: '0.15s',
          }}>▼</span>
        </div>
      </div>
      {expanded && (
        <div style={{
          marginTop: '6px', paddingTop: '6px',
          borderTop: '1px dashed rgba(255,255,255,0.06)',
          fontSize: '11px', color: '#94a3b8', lineHeight: '1.5',
        }}>
          {signal.detail}
        </div>
      )}
    </div>
  );
}

// ── 종합 게이지 (가로 바) ──
function ScoreBar({ totalScore, maxScore, maxLevel }: {
  totalScore: number; maxScore: number; maxLevel: SignalLevel;
}) {
  const pct = maxScore > 0 ? Math.min((totalScore / maxScore) * 100, 100) : 0;
  const style = LEVEL_STYLES[maxLevel];

  const getGradient = () => {
    if (pct > 60) return 'linear-gradient(90deg, #f59e0b, #ef4444)';
    if (pct > 30) return 'linear-gradient(90deg, #22c55e, #f59e0b)';
    return 'linear-gradient(90deg, #64748b, #22c55e)';
  };

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', color: '#64748b' }}>매도 위험도</span>
        <span style={{ fontSize: '12px', fontWeight: '800', color: style.text }}>{totalScore}점</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: '3px',
          background: getGradient(),
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

// ============================================
// 메인 컴포넌트: SignalSection (펼친 카드용)
// ============================================
export default function SignalSection({ signals, isMobile }: {
  signals: PositionSignals | null | undefined;
  isMobile: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  if (!signals || signals.signals.length === 0) return null;

  const { activeCount, totalScore, maxLevel } = signals;
  const maxScore = signals.signals.length * 100;

  // 위험한 것부터 정렬
  const sorted = [...signals.signals].sort((a, b) =>
    LEVEL_PRIORITY[b.level] - LEVEL_PRIORITY[a.level]
  );

  const dangerCount = sorted.filter(s => s.level === 'danger').length;
  const warningCount = sorted.filter(s => s.level === 'warning').length;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const style = LEVEL_STYLES[maxLevel];

  return (
    <div style={{
      background: 'rgba(0,0,0,0.35)', borderRadius: '10px',
      marginBottom: '10px', overflow: 'hidden',
      border: activeCount > 0
        ? `1px solid ${style.border}`
        : '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* 토글 헤더 */}
      <button onClick={() => setIsOpen(!isOpen)} style={{
        width: '100%', padding: '10px 12px', background: 'transparent',
        border: 'none', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', cursor: 'pointer', minHeight: '44px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: isMobile ? '13px' : '15px', color: '#fff', fontWeight: '600' }}>
            📡 매도 시그널
          </span>
          {dangerCount > 0 && (
            <span style={{
              background: '#ef4444', color: '#fff', padding: '1px 6px',
              borderRadius: '6px', fontSize: '10px', fontWeight: '700',
            }}>🚨 {dangerCount}</span>
          )}
          {warningCount > 0 && (
            <span style={{
              background: '#f59e0b', color: '#fff', padding: '1px 6px',
              borderRadius: '6px', fontSize: '10px', fontWeight: '700',
            }}>⚠️ {warningCount}</span>
          )}
          {activeCount === 0 && (
            <span style={{
              background: 'rgba(148,163,184,0.15)', color: '#94a3b8', padding: '1px 6px',
              borderRadius: '6px', fontSize: '10px', fontWeight: '600',
            }}>✅ 안전</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: style.text, fontWeight: '700' }}>
            {totalScore}점
          </span>
          <span style={{
            color: '#64748b', fontSize: '12px',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}>▼</span>
        </div>
      </button>

      {/* 펼침 내용 */}
      {isOpen && (
        <div style={{ padding: '0 12px 12px' }}>
          <ScoreBar totalScore={totalScore} maxScore={maxScore} maxLevel={maxLevel} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sorted.map(signal => (
              <SignalRow
                key={signal.presetId}
                signal={signal}
                expanded={!!expandedRows[signal.presetId]}
                onToggle={() => toggleRow(signal.presetId)}
              />
            ))}
          </div>

          {/* 위험 시 액션 안내 */}
          {maxLevel === 'danger' && (
            <div style={{
              marginTop: '8px', padding: '8px 10px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              fontSize: '11px', color: '#fca5a5', textAlign: 'center', fontWeight: '600',
            }}>
              🚨 {dangerCount}개 매도 시그널 발동 — 매도 검토를 권장합니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
