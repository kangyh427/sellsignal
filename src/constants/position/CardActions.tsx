'use client';
// ============================================
// CardActions - 모바일 하단 액션 바
// 경로: src/components/position/CardActions.tsx
// 세션 33: PositionCard에서 분리
// 역할: 수정/뉴스/AI 버튼 (모바일 전용)
// ============================================

import React from 'react';

interface CardActionsProps {
  isMobile: boolean;
  isPremium: boolean;
  naverNewsUrl: string;
  aiNewsUsedCount: number;
  maxFreeAINews: number;
  onEditClick: () => void;
  onToggleAI: () => void;
}

const CardActions = ({
  isMobile, isPremium, naverNewsUrl,
  aiNewsUsedCount, maxFreeAINews, onEditClick, onToggleAI,
}: CardActionsProps) => {
  if (!isMobile) return null;

  return (
    <div style={{
      display: 'flex', gap: '6px', marginTop: '10px',
      paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* 수정 버튼 */}
      <button onClick={onEditClick} style={{
        flex: 1, padding: '10px', minHeight: '44px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
        color: '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
      }}>✏️ 수정</button>

      {/* 뉴스 버튼 */}
      <button onClick={() => window.open(naverNewsUrl, '_blank')} style={{
        flex: 1, padding: '10px', minHeight: '44px',
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px',
        color: '#10b981', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
      }}>📰 뉴스</button>

      {/* AI 분석 버튼 */}
      <button onClick={onToggleAI} style={{
        flex: 1, padding: '10px', minHeight: '44px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.12))',
        border: '1px solid rgba(139,92,246,0.25)', borderRadius: '8px',
        color: '#a78bfa', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
      }}>
        🤖 AI{!isPremium && ` ${maxFreeAINews - aiNewsUsedCount}`}
      </button>
    </div>
  );
};

export default CardActions;
