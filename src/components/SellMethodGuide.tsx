'use client';

import React, { useState } from 'react';
import { PROFIT_STAGES, SELL_PRESETS } from '../constants';

interface SellMethodGuideProps {
  isMobile: boolean;
  activeTab: string;
}

export const SellMethodGuide: React.FC<SellMethodGuideProps> = ({ isMobile, activeTab }) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  if (isMobile && activeTab !== 'guide') return null;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '14px',
      padding: isMobile ? '12px' : '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '12px',
    }}>
      <h3 style={{
        fontSize: isMobile ? '13px' : '15px',
        fontWeight: '600',
        color: '#fff',
        margin: '0 0 12px 0',
      }}>📚 수익 단계별 매도법</h3>

      {Object.entries(PROFIT_STAGES).map(([key, stage]) => (
        <div key={key} style={{ marginBottom: '8px' }}>
          <div
            onClick={() => setExpandedStage(expandedStage === key ? null : key)}
            style={{
              padding: isMobile ? '10px' : '12px',
              background: stage.color + '10',
              borderRadius: expandedStage === key ? '10px 10px 0 0' : '10px',
              borderLeft: '4px solid ' + stage.color,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: stage.color }}>
                {stage.label}
              </div>
              <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8', marginTop: '2px' }}>
                수익률 {stage.range} · {stage.methods.length}개 매도법
              </div>
            </div>
            <span style={{
              color: '#64748b',
              fontSize: '12px',
              transform: expandedStage === key ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}>▼</span>
          </div>

          {expandedStage === key && (
            <div style={{
              padding: isMobile ? '10px' : '12px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '0 0 10px 10px',
              borderLeft: '4px solid ' + stage.color + '50',
            }}>
              {stage.methods.map((methodId) => {
                const method = SELL_PRESETS[methodId];
                if (!method) return null;
                return (
                  <div key={methodId} style={{
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>{method.icon}</span>
                      <span style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: '600', color: '#fff' }}>
                        {method.name}
                      </span>
                    </div>
                    <p style={{
                      fontSize: isMobile ? '10px' : '12px',
                      color: '#94a3b8',
                      margin: 0,
                      paddingLeft: '20px',
                    }}>{method.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {!expandedStage && (
        <div style={{
          marginTop: '12px',
          padding: '10px',
          background: 'rgba(59,130,246,0.1)',
          borderRadius: '8px',
          fontSize: isMobile ? '10px' : '12px',
          color: '#60a5fa',
        }}>💡 각 단계를 탭하면 상세 매도법을 확인할 수 있습니다</div>
      )}
    </div>
  );
};

export default SellMethodGuide;
