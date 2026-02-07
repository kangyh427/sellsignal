'use client';
// ============================================
// AINewsPopup - AI 뉴스 분석 팝업
// 경로: src/components/AINewsPopup.tsx
// 세션4(아키텍처 정리)에서 SellSignalApp.tsx L64-273 분리
// ============================================
// 모바일 최적화:
//   - 모바일에서 바텀시트 스타일 (하단 슬라이드업)
//   - 닫기 버튼 터치타겟 40px 보장
//   - safe-area-inset 대응
// ============================================

import React, { useState, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import type { Position } from '../types';

// ── Props 타입 정의 ──
interface AINewsPopupProps {
  position: Position;
  onClose: () => void;
  isPremium: boolean;
  onUpgrade?: () => void;
}

// ── 뉴스 데이터 타입 ──
interface NewsItem {
  title: string;
  summary: string;
}

interface NewsData {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  keyInsight: string;
  positiveNews: NewsItem[];
  negativeNews: NewsItem[];
}

// ── 감성 색상 유틸 ──
const getSentimentColor = (s: string): string => {
  if (s === 'positive') return '#10b981';
  if (s === 'negative') return '#ef4444';
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
  const [newsData, setNewsData] = useState<NewsData | null>(null);

  // ── 뉴스 데이터 로딩 (실제 구현시 백엔드 API 호출) ──
  useEffect(() => {
    if (isPremium) {
      const timer = setTimeout(() => {
        setNewsData({
          sentiment: 'positive',
          sentimentScore: 72,
          keyInsight: `${position.name}은(는) 최근 업황 개선과 실적 기대감으로 긍정적인 전망이 우세합니다.`,
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
  }, [isPremium, position.name]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '0' : '20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '600px',
          maxHeight: isMobile ? '90vh' : '85vh',
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: isMobile ? '20px 20px 0 0' : '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column' as const,
        }}
      >
        {/* ── 헤더 ── */}
        <div
          style={{
            padding: isMobile ? '16px 20px' : '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#fff', margin: 0 }}>
                AI 뉴스 분석
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                {position.name} ({position.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              minHeight: '40px',
            }}
          >
            닫기
          </button>
        </div>

        {/* ── 콘텐츠 ── */}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '16px 20px' : '20px' }}>
          {/* 비프리미엄: 업그레이드 유도 */}
          {!isPremium ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 12px' }}>
                프리미엄 전용 기능
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 24px', lineHeight: '1.6' }}>
                AI 뉴스 분석은 프리미엄 회원만 이용 가능합니다.
                <br />
                최신 뉴스를 AI가 분석하여 투자 인사이트를 제공합니다.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onUpgrade && onUpgrade();
                }}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                프리미엄 업그레이드 (월 5,900원)
              </button>
            </div>
          ) : isLoading ? (
            /* 로딩 상태 */
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>AI가 뉴스를 분석하고 있습니다...</p>
              <div
                style={{
                  width: '200px',
                  height: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  margin: '20px auto',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                    borderRadius: '2px',
                    animation: 'loading 1s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          ) : newsData ? (
            <>
              {/* 종합 분석 */}
              <div
                style={{
                  background: getSentimentColor(newsData.sentiment) + '15',
                  border: '1px solid ' + getSentimentColor(newsData.sentiment) + '40',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>종합 분석</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: getSentimentColor(newsData.sentiment) }}>
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
                  {newsData.positiveNews.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        borderRadius: '10px',
                        padding: '12px',
                        marginBottom: '8px',
                        borderLeft: '3px solid #10b981',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{n.title}</div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{n.summary}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 악재 */}
              {newsData.negativeNews.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444', margin: '0 0 12px' }}>
                    🔴 악재 ({newsData.negativeNews.length}건)
                  </h4>
                  {newsData.negativeNews.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        borderRadius: '10px',
                        padding: '12px',
                        marginBottom: '8px',
                        borderLeft: '3px solid #ef4444',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{n.title}</div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{n.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ── 면책조항 ── */}
        <div
          style={{
            padding: isMobile ? '12px 20px' : '16px 20px',
            paddingBottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : '16px',
            background: 'rgba(0,0,0,0.2)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>
            ⚠️ AI 분석은 참고용이며, 투자자문이나 투자권유가 아닙니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AINewsPopup;
