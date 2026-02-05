'use client'

import { useState, useEffect } from 'react'
import { useResponsive } from '@/hooks'
import type { Position } from '@/types'

interface AIPopupProps {
  position: Position
  isPremium: boolean
  onClose: () => void
  onUpgrade: () => void
}

// AI 뉴스 팝업
export function AINewsPopup({ position, isPremium, onClose, onUpgrade }: AIPopupProps) {
  const { isMobile } = useResponsive()
  const [isLoading, setIsLoading] = useState(true)
  const [newsData, setNewsData] = useState<{
    sentiment: string
    sentimentScore: number
    keyInsight: string
    positiveNews: Array<{ title: string; summary: string }>
    negativeNews: Array<{ title: string; summary: string }>
  } | null>(null)

  useEffect(() => {
    if (isPremium) {
      const timer = setTimeout(() => {
        setNewsData({
          sentiment: 'positive',
          sentimentScore: 72,
          keyInsight: `${position.name}은(는) 최근 업황 개선과 실적 기대감으로 긍정적인 전망이 우세합니다.`,
          positiveNews: [
            { title: '업황 개선 기대', summary: '관련 산업의 수요 증가로 실적 개선 전망' },
            { title: '신규 투자 확대', summary: '신성장 사업 투자로 중장기 성장 기대' }
          ],
          negativeNews: [
            { title: '원자재 가격 상승', summary: '비용 증가 우려로 마진 압박 가능성' }
          ]
        })
        setIsLoading(false)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [isPremium, position.name])

  const getSentimentColor = (s: string) => s === 'positive' ? '#10b981' : s === 'negative' ? '#ef4444' : '#eab308'

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
        padding: isMobile ? '0' : '20px' 
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ 
        width: '100%', 
        maxWidth: isMobile ? '100%' : '600px', 
        maxHeight: isMobile ? '90vh' : '85vh', 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: isMobile ? '20px 20px 0 0' : '20px', 
        border: '1px solid rgba(255,255,255,0.1)', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ 
          padding: isMobile ? '16px 20px' : '20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#fff', margin: 0 }}>AI 뉴스 분석</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{position.name} ({position.code})</p>
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
              minHeight: '40px'
            }}
          >닫기</button>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '16px 20px' : '20px' }}>
          {!isPremium ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 12px' }}>프리미엄 전용 기능</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 24px', lineHeight: '1.6' }}>
                AI 뉴스 분석은 프리미엄 회원만 이용 가능합니다.
              </p>
              <button 
                onClick={() => { onClose(); onUpgrade(); }}
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '16px 32px', 
                  color: '#fff', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                프리미엄 업그레이드
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>AI가 뉴스를 분석하고 있습니다...</p>
            </div>
          ) : newsData ? (
            <>
              <div style={{ 
                background: getSentimentColor(newsData.sentiment) + '15', 
                border: '1px solid ' + getSentimentColor(newsData.sentiment) + '40', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>종합 분석</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: getSentimentColor(newsData.sentiment) }}>{newsData.sentimentScore}점</span>
                </div>
                <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, lineHeight: '1.6' }}>{newsData.keyInsight}</p>
              </div>
              
              {newsData.positiveNews.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#10b981', margin: '0 0 12px' }}>
                    🟢 호재 ({newsData.positiveNews.length}건)
                  </h4>
                  {newsData.positiveNews.map((n, i) => (
                    <div key={i} style={{ 
                      background: 'rgba(16,185,129,0.1)', 
                      borderRadius: '10px', 
                      padding: '12px', 
                      marginBottom: '8px', 
                      borderLeft: '3px solid #10b981' 
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{n.title}</div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{n.summary}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {newsData.negativeNews.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444', margin: '0 0 12px' }}>
                    🔴 악재 ({newsData.negativeNews.length}건)
                  </h4>
                  {newsData.negativeNews.map((n, i) => (
                    <div key={i} style={{ 
                      background: 'rgba(239,68,68,0.1)', 
                      borderRadius: '10px', 
                      padding: '12px', 
                      marginBottom: '8px', 
                      borderLeft: '3px solid #ef4444' 
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{n.title}</div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{n.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
        
        <div style={{ 
          padding: isMobile ? '12px 20px' : '16px 20px', 
          paddingBottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : '16px',
          background: 'rgba(0,0,0,0.2)', 
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>
            ⚠️ AI 분석은 참고용이며, 투자자문이나 투자권유가 아닙니다.
          </p>
        </div>
      </div>
    </div>
  )
}

// AI 리포트 팝업
export function AIReportPopup({ position, isPremium, onClose, onUpgrade }: AIPopupProps) {
  const { isMobile } = useResponsive()
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<{
    targetPriceConsensus: { average: number; high: number; low: number; upside: number }
    investmentOpinion: { buy: number; hold: number; sell: number }
    keyHighlights: string[]
    analystInsight: string
  } | null>(null)

  useEffect(() => {
    if (isPremium) {
      const timer = setTimeout(() => {
        setReportData({
          targetPriceConsensus: { 
            average: Math.round(position.buyPrice * 1.18), 
            high: Math.round(position.buyPrice * 1.35), 
            low: Math.round(position.buyPrice * 0.95), 
            upside: 18.5 
          },
          investmentOpinion: { buy: 15, hold: 5, sell: 2 },
          keyHighlights: [
            '업황 개선에 따른 실적 턴어라운드 기대',
            '신사업 투자로 중장기 성장 동력 확보',
            '주주환원 정책 강화로 배당 매력 증가'
          ],
          analystInsight: `대부분의 증권사가 ${position.name}에 대해 긍정적인 전망을 유지하고 있습니다.`
        })
        setIsLoading(false)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [isPremium, position])

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
        padding: isMobile ? '0' : '20px' 
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ 
        width: '100%', 
        maxWidth: isMobile ? '100%' : '650px', 
        maxHeight: isMobile ? '90vh' : '85vh', 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: isMobile ? '20px 20px 0 0' : '20px', 
        border: '1px solid rgba(255,255,255,0.1)', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ 
          padding: isMobile ? '16px 20px' : '20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>📑</span>
            <div>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#fff', margin: 0 }}>AI 리포트 분석</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{position.name} ({position.code})</p>
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
              minHeight: '40px'
            }}
          >닫기</button>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '16px 20px' : '20px' }}>
          {!isPremium ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👑</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 12px' }}>프리미엄 전용 기능</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 24px', lineHeight: '1.6' }}>
                AI 리포트 분석은 프리미엄 회원만 이용 가능합니다.
              </p>
              <button 
                onClick={() => { onClose(); onUpgrade(); }}
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '16px 32px', 
                  color: '#fff', 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                프리미엄 업그레이드
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📑</div>
              <p style={{ fontSize: '16px', color: '#94a3b8' }}>AI가 리포트를 분석하고 있습니다...</p>
            </div>
          ) : reportData ? (
            <>
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)', 
                border: '1px solid rgba(59,130,246,0.3)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 16px' }}>📊 목표가 컨센서스</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
                  gap: '12px' 
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>평균</div>
                    <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#3b82f6' }}>
                      ₩{reportData.targetPriceConsensus.average.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>최고</div>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', color: '#10b981' }}>
                      ₩{reportData.targetPriceConsensus.high.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>최저</div>
                    <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', color: '#ef4444' }}>
                      ₩{reportData.targetPriceConsensus.low.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>상승여력</div>
                    <div style={{ 
                      fontSize: isMobile ? '16px' : '18px', 
                      fontWeight: '700', 
                      color: reportData.targetPriceConsensus.upside > 0 ? '#10b981' : '#ef4444' 
                    }}>
                      +{reportData.targetPriceConsensus.upside}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>📋 투자의견 분포</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, background: 'rgba(16,185,129,0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{reportData.investmentOpinion.buy}</div>
                    <div style={{ fontSize: '12px', color: '#10b981' }}>매수</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(234,179,8,0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#eab308' }}>{reportData.investmentOpinion.hold}</div>
                    <div style={{ fontSize: '12px', color: '#eab308' }}>보유</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(239,68,68,0.15)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{reportData.investmentOpinion.sell}</div>
                    <div style={{ fontSize: '12px', color: '#ef4444' }}>매도</div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>💡 핵심 포인트</h4>
                {reportData.keyHighlights.map((point, i) => (
                  <div key={i} style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    marginBottom: '8px', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '10px' 
                  }}>
                    <span style={{ color: '#3b82f6', fontWeight: '700' }}>{i + 1}.</span>
                    <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{point}</span>
                  </div>
                ))}
              </div>
              
              <div style={{ 
                background: 'rgba(139,92,246,0.1)', 
                border: '1px solid rgba(139,92,246,0.3)', 
                borderRadius: '12px', 
                padding: '16px' 
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa', margin: '0 0 8px' }}>🤖 AI 종합 인사이트</h4>
                <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0, lineHeight: '1.6' }}>{reportData.analystInsight}</p>
              </div>
            </>
          ) : null}
        </div>
        
        <div style={{ 
          padding: isMobile ? '12px 20px' : '16px 20px', 
          paddingBottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : '16px',
          background: 'rgba(0,0,0,0.2)', 
          borderTop: '1px solid rgba(255,255,255,0.05)' 
        }}>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'center' }}>
            ⚠️ AI 분석은 참고용이며, 투자자문이나 투자권유가 아닙니다.
          </p>
        </div>
      </div>
    </div>
  )
}
