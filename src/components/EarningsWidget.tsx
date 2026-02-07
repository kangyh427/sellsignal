'use client';
// ============================================
// 실적/기업정보 위젯 컴포넌트
// ============================================
import React from 'react';
import type { Position } from '../types';
import { EARNINGS_DATA, STOCK_LIST } from '../constants';
import { useResponsive } from '../hooks/useResponsive';
import { calculateDDay } from '../utils';

interface EarningsWidgetProps {
  position: Position;
  isPremium: boolean;
  onShowAINews: () => void;
  onShowAIReport: () => void;
}

const EarningsWidget: React.FC<EarningsWidgetProps> = ({ position, isPremium, onShowAINews, onShowAIReport }) => {
  const { isMobile } = useResponsive();
  const earnings = EARNINGS_DATA[position.code];
  const stockInfo = STOCK_LIST.find(s => s.code === position.code);
  if (!earnings || !stockInfo) return null;
  
  const dDay = calculateDDay(earnings.nextEarningsDate);
  const naverNewsUrl = 'https://finance.naver.com/item/news.naver?code=' + position.code;

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: isMobile ? '8px' : '10px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: '6px', 
        marginBottom: '8px' 
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>실적발표</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', color: dDay.startsWith('D-') && parseInt(dDay.slice(2)) <= 14 ? '#f59e0b' : '#e2e8f0' }}>{dDay}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>서프라이즈</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '700', color: earnings.lastEarnings.surprise > 0 ? '#10b981' : '#ef4444' }}>
            {earnings.lastEarnings.surprise > 0 ? '+' : ''}{earnings.lastEarnings.surprise}%
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>PER</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: stockInfo.per < stockInfo.sectorPer ? '#10b981' : '#ef4444' }}>{stockInfo.per}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>PBR</div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', color: stockInfo.pbr < stockInfo.sectorPbr ? '#10b981' : '#ef4444' }}>{stockInfo.pbr}</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        <a 
          href={naverNewsUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={e => e.stopPropagation()} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '4px', 
            background: 'rgba(59,130,246,0.1)', 
            border: '1px solid rgba(59,130,246,0.3)', 
            borderRadius: '6px', 
            color: '#60a5fa', 
            fontSize: isMobile ? '11px' : '12px', 
            fontWeight: '600', 
            textDecoration: 'none', 
            padding: isMobile ? '10px 6px' : '8px',
            minHeight: '44px',
          }}
        >
          📰 뉴스
        </a>
        <button 
          onClick={e => { e.stopPropagation(); onShowAINews(); }} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2px', 
            background: isPremium ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)' : 'rgba(100,116,139,0.1)', 
            border: isPremium ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(100,116,139,0.3)', 
            borderRadius: '6px', 
            color: isPremium ? '#a78bfa' : '#64748b', 
            fontSize: isMobile ? '10px' : '11px', 
            fontWeight: '600', 
            padding: isMobile ? '10px 4px' : '8px', 
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          🤖 AI뉴스{!isPremium && <span style={{ fontSize: '9px' }}>👑</span>}
        </button>
        <button 
          onClick={e => { e.stopPropagation(); onShowAIReport(); }} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2px', 
            background: isPremium ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)' : 'rgba(100,116,139,0.1)', 
            border: isPremium ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(100,116,139,0.3)', 
            borderRadius: '6px', 
            color: isPremium ? '#34d399' : '#64748b', 
            fontSize: isMobile ? '10px' : '11px', 
            fontWeight: '600', 
            padding: isMobile ? '10px 4px' : '8px', 
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          📑 리포트{!isPremium && <span style={{ fontSize: '9px' }}>👑</span>}
        </button>
      </div>
    </div>
  );
};

export default EarningsWidget;
