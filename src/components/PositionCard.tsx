'use client';
// ============================================
// PositionCard - 보유 종목 카드 (완전판)
// 경로: src/components/PositionCard.tsx
// 세션 18A: 캔들차트 + 매도전략 + AI뉴스 + 수정/삭제
// ============================================

import React, { useState, useMemo } from 'react';
import { SELL_PRESETS, CHART_LINE_PRESETS, PROFIT_STAGES, formatCompact, generateMockPriceData } from '@/constants';
import EnhancedMiniChart from './EnhancedMiniChart';
import PositionEditModal from './PositionEditModal';
import AINewsSummary from './AINewsSummary';
import type { Position, Alert } from '@/types';

interface PositionCardProps {
  position: Position;
  isMobile: boolean;
  isTablet: boolean;
  isPremium: boolean;
  onUpdate: (updated: Position) => void;
  onDelete: (id: number) => void;
  onAlert: (alert: Alert) => void;
}

const PositionCard = ({ position, priceData, isMobile, isTablet, onUpdate, onDelete, isPremium, aiNewsUsedCount = 0, maxFreeAINews = 3, onUseAINews, onShowUpgrade }) => {
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [showChart, setShowChart] = useState(!isMobile);
  const [showPresets, setShowPresets] = useState(!isMobile);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // AI 뉴스 열기 핸들러 (무료 유저 횟수 체크)
  const handleToggleAI = () => {
    if (showAI) { setShowAI(false); return; }
    if (!isPremium && aiNewsUsedCount >= maxFreeAINews) {
      onShowUpgrade && onShowUpgrade();
      return;
    }
    if (!isPremium && onUseAINews) onUseAINews();
    setShowAI(true);
  };
  const [visibleLines, setVisibleLines] = useState(() => {
    const lines = {};
    CHART_LINE_PRESETS.forEach((p) => { lines[p] = true; });
    return lines;
  });

  const cur = priceData?.[priceData.length - 1]?.close || position.buyPrice;
  const profitRate = ((cur - position.buyPrice) / position.buyPrice) * 100;
  const profitAmount = (cur - position.buyPrice) * position.quantity;
  const totalValue = cur * position.quantity;
  const isProfit = profitRate >= 0;

  const getStage = () => {
    if (profitRate < 0) return { label: "손실 구간", color: "#ef4444" };
    if (profitRate < 5) return PROFIT_STAGES.initial;
    if (profitRate < 10) return PROFIT_STAGES.profit5;
    return PROFIT_STAGES.profit10;
  };
  const stage = getStage();

  // 매도가 계산
  const sellPrices = {};
  (position.selectedPresets || []).forEach((pid) => {
    const setting = position.presetSettings?.[pid]?.value;
    switch (pid) {
      case "stopLoss": sellPrices.stopLoss = Math.round(position.buyPrice * (1 + (setting || -5) / 100)); break;
      case "twoThird": {
        const hp = position.highestPrice || cur;
        sellPrices.twoThird = Math.round(hp - (hp - position.buyPrice) / 3);
        break;
      }
      case "maSignal": {
        if (priceData?.length > 0) {
          const mp = setting || 20;
          const rd = priceData.slice(-mp);
          sellPrices.maSignal = Math.round(rd.reduce((s, d) => s + d.close, 0) / rd.length);
        }
        break;
      }
      case "volumeZone": sellPrices.volumeZone = Math.round(position.buyPrice * 1.10); break;
      case "trendline": sellPrices.trendline = Math.round(position.buyPrice * 0.95); break;
    }
  });

  // 외부 링크
  const naverChartUrl = isMobile
    ? `https://m.stock.naver.com/domestic/stock/${position.code}/chart`
    : `https://finance.naver.com/item/fchart.naver?code=${position.code}`;
  const naverNewsUrl = `https://finance.naver.com/item/news.naver?code=${position.code}`;

  const chartW = isMobile ? Math.min(400, (typeof window !== "undefined" ? window.innerWidth : 380) - 56) : 280;
  const presetDots = (position.selectedPresets || []).map((pid) => {
    const p = SELL_PRESETS[pid];
    return p ? { color: p.color, name: p.name.replace(" 매도법", "") } : null;
  }).filter(Boolean);

  // ── 접힌 상태 (모바일) ──
  if (isMobile && !isExpanded) {
    return (
      <>
        <button onClick={() => setIsExpanded(true)} style={{
          width: "100%", textAlign: "left", cursor: "pointer",
          background: "linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
          borderRadius: "14px", padding: "12px 14px", marginBottom: "8px",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>{position.name}</span>
                <span style={{ background: stage.color + "22", color: stage.color, padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "600" }}>{stage.label}</span>
              </div>
              <div style={{ display: "flex", gap: "4px", marginTop: "4px", alignItems: "center" }}>
                {presetDots.map((d, i) => (
                  <span key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }} />
                ))}
                <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "2px" }}>{presetDots.length}개 모니터링</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "8px" }}>
            <div style={{ fontSize: "16px", fontWeight: "800", color: isProfit ? "#10b981" : "#ef4444" }}>
              {isProfit ? "+" : ""}{profitRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: "11px", color: isProfit ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.7)" }}>
              {isProfit ? "+" : ""}₩{formatCompact(Math.round(profitAmount))}
            </div>
          </div>
        </button>
        {showEditModal && (
          <PositionEditModal position={position} onSave={onUpdate} onClose={() => setShowEditModal(false)} onDelete={() => setShowDeleteConfirm(true)} isMobile={isMobile} />
        )}
        {showDeleteConfirm && (
          <div onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
          }}>
            <div style={{
              background: "linear-gradient(145deg, #1e293b, #0f172a)",
              borderRadius: "16px", padding: "24px", maxWidth: "340px", width: "90%",
              border: "1px solid rgba(239,68,68,0.3)", textAlign: "center",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                종목을 삭제합니다
              </div>
              <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px", lineHeight: "1.5" }}>
                <strong style={{ color: "#fff" }}>{position.name}</strong>을(를) 삭제하시겠습니까?<br/>이 작업은 되돌릴 수 없습니다.
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={{
                  flex: 1, padding: "12px", minHeight: "44px",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px", color: "#94a3b8", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                }}>취소</button>
                <button onClick={() => { onDelete(position.id); setShowDeleteConfirm(false); }} style={{
                  flex: 1, padding: "12px", minHeight: "44px",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "none", borderRadius: "10px", color: "#fff",
                  fontSize: "14px", fontWeight: "700", cursor: "pointer",
                }}>🗑️ 삭제</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── 펼친 상태 ──
  return (
    <>
      <div style={{
        background: "linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
        borderRadius: "16px", padding: isMobile ? "14px" : "16px 18px",
        marginBottom: "10px", border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* 헤더: 종목명 + 수익률 + 액션 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: isMobile ? "17px" : "18px", fontWeight: "700", color: "#fff" }}>{position.name}</span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>{position.code}</span>
              <span style={{ background: stage.color + "20", color: stage.color, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600" }}>{stage.label}</span>
            </div>
            <div style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: "800", color: isProfit ? "#10b981" : "#ef4444", marginTop: "2px" }}>
              {isProfit ? "+" : ""}{profitRate.toFixed(2)}%
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {!isMobile && (
              <>
                <button onClick={() => setShowEditModal(true)} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>✏️ 수정</button>
                <button onClick={() => window.open(naverNewsUrl, "_blank")} style={{ padding: "6px 12px", background: "rgba(16,185,129,0.08)", border: "none", borderRadius: "8px", color: "#10b981", fontSize: "12px", cursor: "pointer" }}>📰 뉴스</button>
                <button onClick={handleToggleAI} style={{ padding: "6px 12px", background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.12))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "8px", color: "#a78bfa", fontSize: "12px", cursor: "pointer" }}>🤖 AI요약{!isPremium && ` (${maxFreeAINews - aiNewsUsedCount}회)`}</button>
              </>
            )}
            {isMobile && (
              <button onClick={() => setIsExpanded(false)} style={{
                background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px",
                width: "36px", height: "36px", minHeight: "44px", minWidth: "44px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#94a3b8", fontSize: "14px", cursor: "pointer",
              }}>▲</button>
            )}
          </div>
        </div>

        {/* 가격 2x2 그리드 */}
        <div style={{ display: isMobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: isMobile ? undefined : isTablet ? "1fr 250px" : "1fr 280px", gap: "12px" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px", marginBottom: "10px" }}>
              {[
                { label: "매수가", value: "₩" + position.buyPrice.toLocaleString() },
                { label: "현재가", value: "₩" + Math.round(cur).toLocaleString(), color: isProfit ? "#10b981" : "#ef4444" },
                { label: "수량", value: position.quantity + "주" },
                { label: "평가금액", value: "₩" + formatCompact(Math.round(totalValue)) },
              ].map((item, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.35)", borderRadius: "8px", padding: isMobile ? "8px 10px" : "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "2px" }}>{item.label}</div>
                  <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: item.color || "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* 평가손익 */}
            <div style={{
              background: isProfit ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
              borderRadius: "10px", padding: isMobile ? "10px 12px" : "12px",
              borderLeft: `4px solid ${isProfit ? "#10b981" : "#ef4444"}`,
              marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "2px" }}>평가손익</div>
                <div style={{ fontSize: isMobile ? "17px" : "22px", fontWeight: "700", color: isProfit ? "#10b981" : "#ef4444" }}>
                  {isProfit ? "+" : ""}₩{formatCompact(Math.round(profitAmount))}
                </div>
              </div>
              <div style={{
                fontSize: isMobile ? "20px" : "26px", fontWeight: "800",
                color: isProfit ? "#10b981" : "#ef4444",
                background: isProfit ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                padding: isMobile ? "6px 10px" : "8px 14px", borderRadius: "10px",
              }}>
                {isProfit ? "+" : ""}{profitRate.toFixed(2)}%
              </div>
            </div>

            {/* 매도 조건 아코디언 */}
            <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: "10px", marginBottom: "10px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <button onClick={() => setShowPresets(!showPresets)} style={{
                width: "100%", padding: "10px 12px", background: "transparent", border: "none",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", minHeight: "44px",
              }}>
                <span style={{ fontSize: isMobile ? "13px" : "15px", color: "#fff", fontWeight: "600" }}>
                  📊 매도 조건 ({(position.selectedPresets || []).length}개)
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {!showPresets && (
                    <div style={{ display: "flex", gap: "3px" }}>
                      {presetDots.slice(0, 3).map((d, i) => (
                        <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }} />
                      ))}
                    </div>
                  )}
                  <span style={{ color: "#64748b", fontSize: "12px", transition: "transform 0.2s", transform: showPresets ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                </div>
              </button>
              {showPresets && (
                <div style={{ padding: "0 12px 12px" }}>
                  <div style={{ fontSize: "10px", color: "#f59e0b", marginBottom: "8px", background: "rgba(245,158,11,0.08)", padding: "5px 8px", borderRadius: "4px" }}>
                    ⚠️ 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "6px" }}>
                    <button onClick={() => setShowEditModal(true)} style={{
                      background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
                      borderRadius: "4px", padding: isMobile ? "6px 10px" : "4px 10px",
                      color: "#60a5fa", fontSize: isMobile ? "11px" : "12px", cursor: "pointer", minHeight: "32px",
                    }}>✏️ 수정</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {(position.selectedPresets || []).map((pid) => {
                      const preset = SELL_PRESETS[pid];
                      if (!preset) return null;
                      const hasChartLine = CHART_LINE_PRESETS.includes(pid);
                      // 매도 기준가격 텍스트
                      let priceText = "모니터링 중";
                      let priceColor = "#94a3b8";
                      if (pid === "stopLoss" && sellPrices.stopLoss) { priceText = "₩" + sellPrices.stopLoss.toLocaleString(); priceColor = cur <= sellPrices.stopLoss ? "#ef4444" : "#94a3b8"; }
                      else if (pid === "twoThird" && sellPrices.twoThird) { priceText = "₩" + sellPrices.twoThird.toLocaleString(); priceColor = cur <= sellPrices.twoThird ? "#f59e0b" : "#94a3b8"; }
                      else if (pid === "maSignal" && sellPrices.maSignal) { priceText = "₩" + sellPrices.maSignal.toLocaleString(); priceColor = cur < sellPrices.maSignal ? "#f59e0b" : "#94a3b8"; }
                      else if (pid === "volumeZone" && sellPrices.volumeZone) { priceText = "₩" + sellPrices.volumeZone.toLocaleString(); }
                      else if (pid === "trendline" && sellPrices.trendline) { priceText = "₩" + sellPrices.trendline.toLocaleString(); }

                      return (
                        <div key={pid} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: isMobile ? "8px 10px" : "8px 12px",
                          background: "rgba(255,255,255,0.02)", borderRadius: "6px", borderLeft: `3px solid ${preset.color}`,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {hasChartLine && !isMobile && (
                              <input type="checkbox" checked={visibleLines[pid] !== false}
                                onChange={() => setVisibleLines((prev) => ({ ...prev, [pid]: !prev[pid] }))}
                                style={{ width: "14px", height: "14px", accentColor: preset.color, cursor: "pointer" }}
                              />
                            )}
                            <span style={{ fontSize: isMobile ? "12px" : "13px", color: "#cbd5e1" }}>
                              {preset.icon} {isMobile ? preset.name.replace(" 매도법", "") : preset.name}
                            </span>
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: "600", color: priceColor }}>{priceText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 차트 토글 (모바일) */}
            {isMobile && (
              <button onClick={() => setShowChart(!showChart)} style={{
                width: "100%", padding: "10px", minHeight: "44px",
                background: showChart ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px",
                color: "#60a5fa", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                marginBottom: showChart ? "8px" : "0",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>📊 차트 {showChart ? "접기 ▲" : "보기 ▼"}</button>
            )}
          </div>

          {/* 차트 영역 */}
          {(showChart || !isMobile) && (
            <div onClick={() => window.open(naverChartUrl, "_blank")} style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <EnhancedMiniChart
                  data={priceData?.slice(isMobile ? -30 : -40) || null}
                  buyPrice={position.buyPrice} width={chartW} height={isMobile ? 200 : 260}
                  sellPrices={sellPrices} visibleLines={visibleLines}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "6px 0 2px", fontSize: "11px", color: "#64748b" }}>
                <span>📈</span>
                <span style={{ textDecoration: "underline", color: "#60a5fa" }}>네이버 증권 차트 보기</span>
                <span style={{ fontSize: "10px" }}>→</span>
              </div>
            </div>
          )}
        </div>

        {/* AI 뉴스 요약 */}
        {showAI && <AINewsSummary position={position} onClose={() => setShowAI(false)} />}

        {/* 모바일 하단 액션 바 */}
        {isMobile && (
          <div style={{ display: "flex", gap: "6px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setShowEditModal(true)} style={{
              flex: 1, padding: "10px", minHeight: "44px", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
              color: "#94a3b8", fontSize: "12px", fontWeight: "600", cursor: "pointer",
            }}>✏️ 수정</button>
            <button onClick={() => window.open(naverNewsUrl, "_blank")} style={{
              flex: 1, padding: "10px", minHeight: "44px", background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px",
              color: "#10b981", fontSize: "12px", fontWeight: "600", cursor: "pointer",
            }}>📰 뉴스</button>
            <button onClick={handleToggleAI} style={{
              flex: 1, padding: "10px", minHeight: "44px",
              background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.12))",
              border: "1px solid rgba(139,92,246,0.25)", borderRadius: "8px",
              color: "#a78bfa", fontSize: "12px", fontWeight: "600", cursor: "pointer",
            }}>🤖 AI{!isPremium && ` ${maxFreeAINews - aiNewsUsedCount}`}</button>
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {showEditModal && (
        <PositionEditModal position={position} onSave={onUpdate} onClose={() => setShowEditModal(false)} onDelete={() => { setShowEditModal(false); setShowDeleteConfirm(true); }} isMobile={isMobile} />
      )}

      {/* 삭제 확인 팝업 */}
      {showDeleteConfirm && (
        <div onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
        }}>
          <div style={{
            background: "linear-gradient(145deg, #1e293b, #0f172a)",
            borderRadius: "16px", padding: "24px", maxWidth: "340px", width: "90%",
            border: "1px solid rgba(239,68,68,0.3)", textAlign: "center",
          }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
              종목을 삭제합니다
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px", lineHeight: "1.5" }}>
              <strong style={{ color: "#fff" }}>{position.name}</strong>을(를) 삭제하시겠습니까?<br/>이 작업은 되돌릴 수 없습니다.
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: "12px", minHeight: "44px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: "#94a3b8", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              }}>취소</button>
              <button onClick={() => { onDelete(position.id); setShowDeleteConfirm(false); }} style={{
                flex: 1, padding: "12px", minHeight: "44px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none", borderRadius: "10px", color: "#fff",
                fontSize: "14px", fontWeight: "700", cursor: "pointer",
              }}>🗑️ 삭제</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================

export default PositionCard;
