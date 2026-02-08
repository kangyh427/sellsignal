'use client';
// ============================================
// AINewsSummary - AI 뉴스 분석 요약
// 경로: src/components/AINewsSummary.tsx
// 세션 18A: 로딩 상태 + 결과 표시
// ============================================

import React, { useState, useEffect } from 'react';

interface AINewsSummaryProps {
  stockName: string;
  stockCode: string;
  onClose: () => void;
}

const AINewsSummary = ({ position, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  // 모의 AI 분석 (실배포 시 Anthropic API 호출)
  useEffect(() => {
    const timer1 = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 95));
    }, 300);

    const timer2 = setTimeout(() => {
      clearInterval(timer1);
      setProgress(100);
      setResult({
        summary: `📌 ${position.name} 최근 동향 분석\n\n` +
          `1. 실적 전망: 최근 분기 영업이익이 전년 대비 12% 증가하며 시장 기대치를 상회했습니다.\n\n` +
          `2. 기관/외인 수급: 외국인 매수세가 3일 연속 이어지고 있으며, 기관은 소폭 매도 중입니다.\n\n` +
          `3. 산업 동향: 관련 업종 전반의 강세가 이어지고 있으나, 글로벌 금리 인상 우려가 상존합니다.\n\n` +
          `⚠️ 종합 의견: 단기적으로는 상승 모멘텀이 있으나, 설정된 매도 조건에 유의하시기 바랍니다.`,
        timestamp: new Date().toLocaleString("ko-KR"),
      });
      setLoading(false);
    }, 2500);

    return () => { clearInterval(timer1); clearTimeout(timer2); };
  }, [position.name]);

  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))",
      border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px",
      padding: "14px", marginTop: "10px",
    }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px" }}>🤖</span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#a78bfa" }}>AI 뉴스 분석</span>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "6px",
          padding: "4px 8px", color: "#64748b", fontSize: "12px", cursor: "pointer",
          minHeight: "32px",
        }}>✕ 닫기</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          {/* 로딩 바 */}
          <div style={{
            width: "100%", height: "6px", background: "rgba(255,255,255,0.06)",
            borderRadius: "3px", overflow: "hidden", marginBottom: "12px",
          }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
              borderRadius: "3px", transition: "width 0.3s ease",
            }} />
          </div>
          <div style={{ fontSize: "12px", color: "#a78bfa", marginBottom: "4px" }}>
            🔍 {position.name} 관련 뉴스를 분석하고 있습니다...
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            웹 검색 + AI 요약 진행 중 ({Math.round(progress)}%)
          </div>
        </div>
      ) : (
        <div>
          {/* 결과 표시 */}
          <div style={{
            fontSize: "13px", color: "#e2e8f0", lineHeight: "1.8",
            whiteSpace: "pre-wrap", marginBottom: "10px",
          }}>
            {result?.summary}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", color: "#64748b" }}>{result?.timestamp}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => { setLoading(true); setProgress(0); setResult(null); }} style={{
                padding: "6px 10px", background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)", borderRadius: "6px",
                color: "#a78bfa", fontSize: "11px", cursor: "pointer", minHeight: "32px",
              }}>🔄 다시 분석</button>
              <button onClick={() => window.open(`https://finance.naver.com/item/news.naver?code=${position.code}`, "_blank")} style={{
                padding: "6px 10px", background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)", borderRadius: "6px",
                color: "#10b981", fontSize: "11px", cursor: "pointer", minHeight: "32px",
              }}>📰 네이버 뉴스</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================

export default AINewsSummary;
