'use client';
// ============================================
// SellMethodGuide - 8가지 매도법 아코디언 가이드
// 경로: src/components/SellMethodGuide.tsx
// ============================================

import React, { useState } from 'react';
import { SELL_PRESETS } from '@/constants';

interface SellMethodGuideProps {
  isMobile: boolean;
}

/** 매도법별 간단 설명 */
const METHOD_DESCRIPTIONS: Record<string, string> = {
  candle3:     '3일 연속 음봉 발생 시 추세 전환 가능성을 감지하여 알림을 보냅니다.',
  stopLoss:    '설정한 손실 한도(-5% 등)에 도달하면 즉시 알림을 보냅니다.',
  twoThird:    '최고점 대비 1/3 하락 시 부분 매도, 2/3 하락 시 전량 매도를 안내합니다.',
  maSignal:    '주가가 이동평균선(20일/60일)을 하향 돌파하면 알림을 보냅니다.',
  volumeZone:  '주요 매물대(거래 집중 구간)에 진입하면 저항 가능성을 알립니다.',
  trendline:   '상승 추세선을 하향 이탈하면 추세 전환 가능성을 알립니다.',
  fundamental: '기업 실적 악화, PER 과열 등 기본적 분석 지표 변화를 감지합니다.',
  cycle:       '코스톨라니 달걀모형 기반 경기순환 단계 변화를 모니터링합니다.',
};

const SellMethodGuide: React.FC<SellMethodGuideProps> = ({ isMobile }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const methods = Object.values(SELL_PRESETS);

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        borderRadius: '14px',
        padding: isMobile ? '14px' : '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '12px',
      }}
    >
      <h3
        style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#fff',
          margin: '0 0 12px',
        }}
      >
        📚 8가지 매도법 가이드
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {methods.map((m) => (
          <div key={m.id}>
            {/* 아코디언 헤더 */}
            <button
              onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background:
                  expanded === m.id
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.02)',
                border: 'none',
                borderRadius: '8px',
                borderLeft: `3px solid ${m.color}`,
                color: '#e2e8f0',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '44px',
              }}
            >
              <span>
                {m.icon} {m.name}
              </span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>
                {expanded === m.id ? '▲' : '▼'}
              </span>
            </button>

            {/* 아코디언 바디 */}
            {expanded === m.id && (
              <div
                style={{
                  padding: '10px 12px 10px 18px',
                  fontSize: '12px',
                  color: '#94a3b8',
                  lineHeight: '1.6',
                }}
              >
                {METHOD_DESCRIPTIONS[m.id] ||
                  `${m.icon} ${m.name}: 설정한 조건에 도달하면 알림을 보내드립니다.`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellMethodGuide;
