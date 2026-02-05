'use client'

import { useResponsive } from '@/hooks'

interface UpgradeModalProps {
  onUpgrade: () => void
  onClose: () => void
}

export default function UpgradeModal({ onUpgrade, onClose }: UpgradeModalProps) {
  const { isMobile } = useResponsive()

  const features = [
    { icon: '🚫', text: '광고 완전 제거', free: '❌', premium: '✅' },
    { icon: '📊', text: '모니터링 종목 수', free: '5개', premium: '20개' },
    { icon: '🤖', text: 'AI 뉴스 분석', free: '❌', premium: '✅' },
    { icon: '📑', text: 'AI 리포트 분석', free: '❌', premium: '✅' },
    { icon: '💬', text: '카카오톡 알림', free: '❌', premium: '✅' },
    { icon: '📧', text: '이메일 리포트', free: '❌', premium: '✅' },
  ]

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.9)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000,
        padding: isMobile ? '16px' : '40px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: '20px', 
        padding: isMobile ? '24px' : '32px', 
        maxWidth: '420px', 
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(139,92,246,0.3)',
        boxShadow: '0 0 60px rgba(139,92,246,0.2)'
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>👑</div>
          <h2 style={{ 
            fontSize: isMobile ? '24px' : '28px', 
            fontWeight: '700', 
            color: '#fff', 
            margin: '0 0 8px' 
          }}>프리미엄 멤버십</h2>
          <p style={{ 
            fontSize: '14px', 
            color: '#94a3b8', 
            margin: 0
          }}>더 강력한 매도 시그널 도구를 경험하세요</p>
        </div>
        
        {/* 가격 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '24px',
          border: '1px solid rgba(139,92,246,0.3)'
        }}>
          <div style={{ fontSize: '14px', color: '#a78bfa', marginBottom: '4px' }}>월 구독료</div>
          <div style={{ 
            fontSize: isMobile ? '36px' : '40px', 
            fontWeight: '800', 
            color: '#fff'
          }}>
            ₩5,900
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>/월</span>
          </div>
          <div style={{ fontSize: '13px', color: '#10b981', marginTop: '8px' }}>
            🎁 첫 7일 무료 체험
          </div>
        </div>
        
        {/* 기능 비교 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '14px' }}>
            ✨ 프리미엄 혜택
          </div>
          {features.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{item.text}</span>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', minWidth: '36px', textAlign: 'center' }}>{item.free}</span>
                <span style={{ fontSize: '13px', color: '#10b981', minWidth: '36px', textAlign: 'center' }}>{item.premium}</span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '8px', paddingRight: '14px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>무료</span>
            <span style={{ fontSize: '11px', color: '#10b981' }}>프리미엄</span>
          </div>
        </div>
        
        {/* 버튼 */}
        <button 
          onClick={onUpgrade}
          style={{ 
            width: '100%', 
            padding: isMobile ? '18px' : '20px', 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
            border: 'none', 
            borderRadius: '12px', 
            color: '#fff', 
            fontSize: '17px', 
            fontWeight: '700', 
            cursor: 'pointer', 
            marginBottom: '12px',
            boxShadow: '0 4px 20px rgba(139,92,246,0.4)'
          }}
        >
          🎉 7일 무료로 시작하기
        </button>
        <button 
          onClick={onClose}
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: 'transparent', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '10px',
            color: '#64748b', 
            fontSize: '14px', 
            cursor: 'pointer' 
          }}
        >
          나중에 할게요
        </button>
        
        {/* 하단 안내 */}
        <p style={{ 
          fontSize: '11px', 
          color: '#64748b', 
          textAlign: 'center', 
          margin: '20px 0 0',
          lineHeight: '1.5'
        }}>
          언제든지 해지 가능 · 자동 결제 · 부가세 포함
        </p>
      </div>
    </div>
  )
}
