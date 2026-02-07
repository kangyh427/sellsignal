'use client';
// ============================================
// 매도법 가이드 - 아코디언 스타일
// ============================================
import React, { useState } from 'react';
import { SELL_PRESETS, PROFIT_STAGES } from '../constants';

interface SellMethodGuideProps {
  isMobile: boolean;
  activeTab: string;
}

/** 매도법 상세 설명 */
const METHOD_DESCRIPTIONS: Record<string, string> = {
  candle3: '최근 양봉의 50% 이상을 덮는 음봉 발생 시 절반 매도, 100% 덮으면 전량 매도',
  stopLoss: '매수가 대비 설정한 손실률(-3~-5%)에 도달하면 기계적으로 손절',
  twoThird: '최고 수익 대비 1/3이 빠지면 남은 2/3 수익이라도 확보하여 익절',
  maSignal: '이동평균선을 하향 돌파하거나, 이평선이 저항선으로 작용할 때 매도',
  volumeZone: '상단 매물대(저항대)에서 주가가 하락 반전할 때 매도',
  trendline: '지지선을 깨고 하락하거나, 저항선 돌파 실패 시 매도',
  fundamental: '실적 악화, 업황 반전 등 기업 펀더멘털에 변화가 생길 때',
  cycle: '금리 고점 근처(4-5단계)에서 시장 전체 매도 관점 유지',
};

const SellMethodGuide: React.FC<SellMethodGuideProps> = ({ isMobile, activeTab }) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [showAllMethods, setShowAllMethods] = useState(false);
  
  const toggleStage = (key: string) => {
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
                      {METHOD_DESCRIPTIONS[methodId] || method.description}
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

export default SellMethodGuide;
