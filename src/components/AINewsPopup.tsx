// ============================================
// AINewsPopup.tsx - AI 뉴스 분석 팝업
// 위치: src/components/AINewsPopup.tsx
// 참조 원본: sell-signal-app-responsive.jsx 라인 2436~2645
// ============================================
// 역할: 종목별 AI 뉴스 감성 분석 (호재/악재 분류, 종합점수)
// 반응형: 모바일=바텀시트, 데스크탑=센터 모달
// 프리미엄: 비회원은 업그레이드 안내, 회원은 AI 분석 표시
// ============================================

import React, { useState, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { Position } from '../types';

// --- 내부 타입 ---
interface NewsItem {
  title: string;
  summary: string;
}

interface NewsAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  keyInsight: string;
  positiveNews: NewsItem[];
  negativeNews: NewsItem[];
}

interface AINewsPopupProps {
  position: Position;
  onClose: () => void;
  isPremium: boolean;
  onUpgrade?: () => void;
}

// --- 감성 색상 유틸 ---
const getSentimentColor = (sentiment: string): string => {
  if (sentiment === 'positive') return '#10b981';
  if (sentiment === 'negative') return '#ef4444';
  return '#eab308';
};

// ============================================
// 메인 컴포넌트
// ============================================
const AINewsPopup: React.FC<AINewsPopupProps> = ({
  position,
  onClose,
  isPremium,
  onUpgrade,
}) => {
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState<NewsAnalysis | null>(null);

  // 종목명 안전하게 추출
  const stockName = position.name || position.stock?.name || '종목';
  const stockCode = position.code || position.stock?.code || '';

  // --- 데이터 로딩 (데모: setTimeout, 실제: 백엔드 API 호출) ---
  useEffect(() => {
    if (isPremium) {
      const timer = setTimeout(() => {
        setNewsData({
          sentiment: 'positive',
          sentimentScore: 72,
          keyInsight: `${stockName}은(는) 최근 업황 개선과 실적 기대감으로 긍정적인 전망이 우세합니다.`,
          positiveNews: [
            { title: '업황 개선 기대', summary: '관련 산업의 수요 증가로 실적 개선 전망' },
            { title: '신규 투자 확대', summary: '신성장 사업 투자로 중장기 성장 기대' },
          ],
          negativeNews: [
            { title: '원자재 가격 상승', summary: '비용 증가 우려로 마진 압박 가능성' },
          ],
        });
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isPremium, stockName]);

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
        AI 뉴스 분석은 프리미엄 회원만 이용 가능합니다.<br />
        최신 뉴스를 AI가 분석하여 투자 인사이트를 제공합니다.
      </p>
      <button
        onClick={() => { onClose(); onUpgrade?.(); }}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 32px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          minHeight: '48px',
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
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
      <p style={{ fontSize: '16px', color: '#94a3b8' }}>AI가 뉴스를 분석하고 있습니다...</p>
      <div style={{
        width: '200px', height: '4px',
        background: 'rgba(255,255,255,0.1)', borderRadius: '2px',
        margin: '20px auto', overflow: 'hidden',
      }}>
        <div style={{
          width: '50%', height: '100%',
          background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
          borderRadius: '2px',
          animation: 'aiLoadingBar 1.2s ease-in-out infinite alternate',
        }} />
      </div>
      {/* 인라인 애니메이션 키프레임 */}
      <style>{`
        @keyframes aiLoadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );

  // ============================================
  // 렌더: 뉴스 카드 (호재/악재 공통)
  // ============================================
  const renderNewsCards = (items: NewsItem[], color: string) =>
    items.map((n, i) => (
      <div key={i} style={{
        background: `${color}15`,
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '8px',
        borderLeft: `3px solid ${color}`,
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
          {n.title}
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{n.summary}</p>
      </div>
    ));

  // ============================================
  // 렌더: 분석 결과 (종합 + 호재 + 악재)
  // ============================================
  const renderAnalysis = () => {
    if (!newsData) return null;
    const sentimentColor = getSentimentColor(newsData.sentiment);
    return (
      <>
        {/* 종합 분석 */}
        <div style={{
          background: `${sentimentColor}15`,
          border: `1px solid ${sentimentColor}40`,
          borderRadius: '12px', padding: '16px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>종합 분석</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: sentimentColor }}>
              {newsData.sentimentScore}점
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, lineHeight: '1.6' }}>
            {newsData.keyInsight}
          </p>
        </div>

        {/* 호재 */}
        {newsData.positiveNews.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#10b981', margin: '0 0 12px' }}>
              🟢 호재 ({newsData.positiveNews.length}건)
            </h4>
            {renderNewsCards(newsData.positiveNews, '#10b981')}
          </div>
        )}

        {/* 악재 */}
        {newsData.negativeNews.length > 0 && (
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444', margin: '0 0 12px' }}>
              🔴 악재 ({newsData.negativeNews.length}건)
            </h4>
            {renderNewsCards(newsData.negativeNews, '#ef4444')}
          </div>
        )}
      </>
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
        maxWidth: isMobile ? '100%' : '600px',
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
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#fff', margin: 0 }}>
                AI 뉴스 분석
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
          {!isPremium
            ? renderUpgradePrompt()
            : isLoading
              ? renderLoading()
              : renderAnalysis()}
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

export default AINewsPopup;
