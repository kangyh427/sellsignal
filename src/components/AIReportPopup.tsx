// ============================================
// AIReportPopup.tsx - AI 리포트 분석 팝업
// 위치: src/components/AIReportPopup.tsx
// 참조 원본: sell-signal-app-responsive.jsx 라인 2650~2886
// ============================================
// 역할: 증권사 리포트 AI 요약 (목표가 컨센서스, 투자의견 분포, 핵심 포인트)
// 반응형: 모바일=바텀시트, 데스크탑=센터 모달
// 프리미엄: 비회원은 업그레이드 안내, 회원은 AI 분석 표시
// ============================================

import React, { useState, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { Position } from '../types';

// --- 내부 타입 ---
interface TargetPriceConsensus {
  average: number;
  high: number;
  low: number;
  upside: number;
}

interface InvestmentOpinion {
  buy: number;
  hold: number;
  sell: number;
}

interface ReportAnalysis {
  targetPriceConsensus: TargetPriceConsensus;
  investmentOpinion: InvestmentOpinion;
  keyHighlights: string[];
  analystInsight: string;
}

interface AIReportPopupProps {
  position: Position;
  onClose: () => void;
  isPremium: boolean;
  onUpgrade?: () => void;
}

// ============================================
// 메인 컴포넌트
// ============================================
const AIReportPopup: React.FC<AIReportPopupProps> = ({
  position,
  onClose,
  isPremium,
  onUpgrade,
}) => {
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportAnalysis | null>(null);

  // 종목명 안전하게 추출
  const stockName = position.name || position.stock?.name || '종목';
  const stockCode = position.code || position.stock?.code || '';

  // --- 데이터 로딩 (데모: setTimeout, 실제: 백엔드 API 호출) ---
  useEffect(() => {
    if (isPremium) {
      const timer = setTimeout(() => {
        setReportData({
          targetPriceConsensus: {
            average: Math.round(position.buyPrice * 1.18),
            high: Math.round(position.buyPrice * 1.35),
            low: Math.round(position.buyPrice * 0.95),
            upside: 18.5,
          },
          investmentOpinion: { buy: 15, hold: 5, sell: 2 },
          keyHighlights: [
            '업황 개선에 따른 실적 턴어라운드 기대',
            '신사업 투자로 중장기 성장 동력 확보',
            '주주환원 정책 강화로 배당 매력 증가',
          ],
          analystInsight: `대부분의 증권사가 ${stockName}에 대해 긍정적인 전망을 유지하고 있습니다. 업황 개선과 신사업 확대가 주요 성장 동력으로 분석됩니다.`,
        });
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isPremium, position.buyPrice, stockName]);

  // --- 오버레이 배경 클릭 시 닫기 ---
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ============================================
  // 렌더: 프리미엄 미가입 안내
  // ============================================
  const renderUpgradePrompt = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 12px' }}>
        프리미엄 전용 기능
      </h3>
      <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 24px', lineHeight: '1.6' }}>
        AI 리포트 분석은 프리미엄 회원만 이용 가능합니다.<br />
        증권사 리포트를 AI가 요약하여 핵심 인사이트를 제공합니다.
      </p>
      <button
        onClick={() => { onClose(); onUpgrade?.(); }}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          border: 'none', borderRadius: '12px', padding: '16px 32px',
          color: '#fff', fontSize: '16px', fontWeight: '600',
          cursor: 'pointer', minHeight: '48px',
        }}
      >
        프리미엄 업그레이드 (월 5,900원)
      </button>
    </div>
  );

  // ============================================
  // 렌더: 로딩 스피너
  // ============================================
  const renderLoading = () => (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
      <p style={{ fontSize: '16px', color: '#94a3b8' }}>AI가 리포트를 분석하고 있습니다...</p>
      <div style={{
        width: '200px', height: '4px',
        background: 'rgba(255,255,255,0.1)', borderRadius: '2px',
        margin: '20px auto', overflow: 'hidden',
      }}>
        <div style={{
          width: '50%', height: '100%',
          background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
          borderRadius: '2px',
          animation: 'aiReportLoadingBar 1.2s ease-in-out infinite alternate',
        }} />
      </div>
      <style>{`
        @keyframes aiReportLoadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );

  // ============================================
  // 렌더: 목표가 컨센서스 섹션
  // ============================================
  const renderTargetPrice = () => {
    if (!reportData) return null;
    const { average, high, low, upside } = reportData.targetPriceConsensus;
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '12px', padding: '16px', marginBottom: '20px',
      }}>
        <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 16px' }}>
          📊 목표가 컨센서스
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px',
        }}>
          {/* 평균 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>평균</div>
            <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#3b82f6' }}>
              ₩{average.toLocaleString()}
            </div>
          </div>
          {/* 최고 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>최고</div>
            <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', color: '#10b981' }}>
              ₩{high.toLocaleString()}
            </div>
          </div>
          {/* 최저 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>최저</div>
            <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', color: '#ef4444' }}>
              ₩{low.toLocaleString()}
            </div>
          </div>
          {/* 상승여력 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>상승여력</div>
            <div style={{
              fontSize: isMobile ? '16px' : '18px', fontWeight: '700',
              color: upside > 0 ? '#10b981' : '#ef4444',
            }}>
              {upside > 0 ? '+' : ''}{upside}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // 렌더: 투자의견 분포
  // ============================================
  const renderOpinionDistribution = () => {
    if (!reportData) return null;
    const { buy, hold, sell } = reportData.investmentOpinion;
    const opinionItems = [
      { label: '매수', count: buy, color: '#10b981' },
      { label: '보유', count: hold, color: '#eab308' },
      { label: '매도', count: sell, color: '#ef4444' },
    ];
    return (
      <div style={{
        background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
        padding: '16px', marginBottom: '20px',
      }}>
        <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>
          📋 투자의견 분포
        </h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          {opinionItems.map((item) => (
            <div key={item.label} style={{
              flex: 1,
              background: `${item.color}20`,
              borderRadius: '8px', padding: '12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: item.color }}>
                {item.count}
              </div>
              <div style={{ fontSize: '12px', color: item.color }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================
  // 렌더: 핵심 포인트
  // ============================================
  const renderKeyHighlights = () => {
    if (!reportData) return null;
    return (
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>
          💡 핵심 포인트
        </h4>
        {reportData.keyHighlights.map((point, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
            padding: '12px', marginBottom: '8px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}>
            <span style={{ color: '#3b82f6', fontWeight: '700' }}>{i + 1}.</span>
            <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{point}</span>
          </div>
        ))}
      </div>
    );
  };

  // ============================================
  // 렌더: AI 종합 인사이트
  // ============================================
  const renderInsight = () => {
    if (!reportData) return null;
    return (
      <div style={{
        background: 'rgba(139,92,246,0.1)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: '12px', padding: '16px',
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa', margin: '0 0 8px' }}>
          🤖 AI 종합 인사이트
        </h4>
        <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, lineHeight: '1.6' }}>
          {reportData.analystInsight}
        </p>
      </div>
    );
  };

  // ============================================
  // 메인 JSX
  // ============================================
  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '0' : '20px',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '650px',
        maxHeight: isMobile ? '90vh' : '85vh',
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: isMobile ? '20px 20px 0 0' : '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column' as const,
      }}>
        {/* 헤더 */}
        <div style={{
          padding: isMobile ? '16px 20px' : '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>📋</span>
            <div>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#fff', margin: 0 }}>
                AI 리포트 분석
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                {stockName} ({stockCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '10px', padding: '10px 16px',
              color: '#fff', fontSize: '14px', cursor: 'pointer',
              minHeight: '44px',
            }}
          >닫기</button>
        </div>

        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '16px 20px' : '20px' }}>
          {!isPremium ? renderUpgradePrompt()
            : isLoading ? renderLoading()
            : reportData ? (
              <>
                {renderTargetPrice()}
                {renderOpinionDistribution()}
                {renderKeyHighlights()}
                {renderInsight()}
              </>
            ) : null}
        </div>

        {/* 면책조항 */}
        <div style={{
          padding: isMobile ? '12px 20px' : '16px 20px',
          paddingBottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : '16px',
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>
            ⚠️ AI 분석은 참고용이며, 투자자문이나 투자권유가 아닙니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIReportPopup;
