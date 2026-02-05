'use client'

import { useResponsive } from '@/hooks'
import { SELL_PRESETS } from '@/lib/constants'

// Alert 타입 - id를 number로 통일
export interface Alert {
  id: number
  stockName: string
  code: string
  preset: {
    id: string
    name: string
    icon: string
    severity: 'critical' | 'high' | 'medium' | 'low'
  }
  message: string
  currentPrice?: number
  targetPrice?: number
  timestamp: number
}

interface AlertCardProps {
  alert: Alert
  onDismiss: (id: number) => void
}

export default function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const { isMobile } = useResponsive()
  
  const severityColors: Record<string, { bg: string; label: string }> = { 
    critical: { bg: '#ef4444', label: '긴급' }, 
    high: { bg: '#f97316', label: '높음' }, 
    medium: { bg: '#eab308', label: '보통' }, 
    low: { bg: '#3b82f6', label: '참고' } 
  }
  const severity = severityColors[alert?.preset?.severity] || { bg: '#64748b', label: '알림' }
  
  const formatTime = (timestamp: number) => {
    if (!timestamp) return '방금 전'
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    return '1일 이상'
  }
  
  return (
    <div style={{ 
      background: `linear-gradient(135deg, ${severity.bg}15 0%, ${severity.bg}08 100%)`, 
      border: `1px solid ${severity.bg}30`, 
      borderRadius: isMobile ? '12px' : '14px', 
      padding: isMobile ? '14px' : '16px', 
      marginBottom: '10px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 좌측 강조선 */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: severity.bg,
        borderRadius: '4px 0 0 4px'
      }} />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        paddingLeft: '8px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 헤더: 아이콘 + 매도법 이름 + 심각도 배지 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: isMobile ? '18px' : '20px' }}>{alert?.preset?.icon || '🔔'}</span>
            <span style={{ 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: '700', 
              color: severity.bg 
            }}>{alert?.preset?.name || '알림'}</span>
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              color: '#fff',
              background: severity.bg,
              padding: '2px 8px',
              borderRadius: '4px'
            }}>{severity.label}</span>
          </div>
          
          {/* 종목명 */}
          <div style={{ 
            fontSize: isMobile ? '15px' : '16px', 
            fontWeight: '600', 
            color: '#fff', 
            marginBottom: '6px' 
          }}>{alert?.stockName || '종목'}</div>
          
          {/* 메시지 */}
          <div style={{ 
            fontSize: isMobile ? '13px' : '14px', 
            color: '#e2e8f0',
            lineHeight: '1.4',
            marginBottom: '8px'
          }}>
            {alert?.message || '설정한 조건에 도달했습니다'}
          </div>
          
          {/* 가격 정보 (있는 경우) */}
          {alert?.currentPrice && (
            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              <span>현재가: <strong style={{ color: '#fff' }}>₩{alert.currentPrice.toLocaleString()}</strong></span>
              {alert?.targetPrice && (
                <span>기준가: <strong style={{ color: severity.bg }}>₩{alert.targetPrice.toLocaleString()}</strong></span>
              )}
            </div>
          )}
          
          {/* 시간 */}
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b',
            marginTop: '8px'
          }}>
            {formatTime(alert?.timestamp)}
          </div>
        </div>
        
        {/* 확인 버튼 */}
        <button 
          onClick={() => onDismiss(alert?.id)} 
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            borderRadius: '8px', 
            padding: isMobile ? '10px 16px' : '8px 14px', 
            color: '#fff', 
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            minHeight: isMobile ? '44px' : '36px',
            transition: 'background 0.15s'
          }}
        >
          확인
        </button>
      </div>
    </div>
  )
}
