'use client';
// ============================================
// MarketMiniSummary - 시장 지표 미니 배너
// 경로: src/components/MarketMiniSummary.tsx
// ============================================

import React from 'react';

interface MarketMiniSummaryProps {
  onClick: () => void;
}

const MarketMiniSummary: React.FC<MarketMiniSummaryProps> = ({ onClick }) => (
  <button onClick={onClick} style={{
    width: "100%", padding: "10px 14px", marginBottom: "10px",
    background: "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))",
    border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "44px",
  }}>
    <div style={{ display: "flex", gap: "12px", fontSize: "11px" }}>
      <span style={{ color: "#64748b" }}>KOSPI <span style={{ color: "#ef4444" }}>2,680 ▼12</span></span>
      <span style={{ color: "#64748b" }}>원/달러 <span style={{ color: "#10b981" }}>1,355 ▲3.2</span></span>
    </div>
    <span style={{ fontSize: "11px", color: "#3b82f6" }}>시장분석 →</span>
  </button>
);

export default MarketMiniSummary;
