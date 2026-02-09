'use client';
// ============================================
// PositionCard - 보유 종목 카드 (완전판)
// 경로: src/components/PositionCard.tsx
// 세션 21 Part B: 실시간 주가(stockPrice) prop 추가
// 세션 22B: generateMockPriceData import 제거 + 한글 인코딩 복원
// 세션 25: 시그널 연동 (SignalSection + SignalBadgeCompact) + 한글 재복원
// 세션 26B: 스와이프 삭제 통합 (useSwipeToDelete) + 시그널 border
// 변경사항(26B):
//   - useSwipeToDelete 훅 통합 (모바일 좌측 스와이프 → 삭제 버튼)
//   - 접힌/펼친 카드 모두 스와이프 래퍼 적용
//   - 시그널 레벨에 따른 카드 border 색상
//   - 펼친 카드 하단 스와이프 힌트 텍스트
// ============================================

import React, { useState, useMemo } from 'react';
import { SELL_PRESETS, CHART_LINE_PRESETS, PROFIT_STAGES, formatCompact } from '@/constants';
import EnhancedMiniChart from './EnhancedMiniChart';
import PositionEditModal from './PositionEditModal';
import AINewsSummary from './AINewsSummary';
import SignalSection, { SignalBadgeCompact } from './SignalSection';
import useSwipeToDelete from '@/hooks/useSwipeToDelete';
import type { Position, Alert, StockPrice, PositionSignals } from '@/types';

interface PositionCardProps {
  position: Position;
  priceData: any[] | undefined;
  isMobile: boolean;
  isTablet: boolean;
  isPremium: boolean;
  onUpdate: (updated: Position) => void;
  onDelete: (id: number) => void;
  stockPrice?: StockPrice | null;
  signals?: PositionSignals | null;
  aiNewsUsedCount?: number;
  maxFreeAINews?: number;
  onUseAINews?: () => void;
  onShowUpgrade?: () => void;
}

const PositionCard = ({
  position,
  priceData,
  isMobile,
  isTablet,
  onUpdate,
  onDelete,
  isPremium,
  stockPrice,
  signals,
  aiNewsUsedCount = 0,
  maxFreeAINews = 3,
  onUseAINews,
  onShowUpgrade,
}: PositionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [showChart, setShowChart] = useState(!isMobile);
  const [showPresets, setShowPresets] = useState(!isMobile);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ★ 세션 26B: 스와이프 삭제 훅
  const swipe = useSwipeToDelete();

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

  // ★ 세션 26B: 카드 토글 (스와이프 열린 상태면 리셋)
  const handleCardToggle = () => {
    if (swipe.showDeleteBtn) {
      swipe.resetSwipe();
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const [visibleLines, setVisibleLines] = useState(() => {
    const lines: Record<string, boolean> = {};
    CHART_LINE_PRESETS.forEach((p) => { lines[p] = true; });
    return lines;
  });

  // ★ 세션 21: 현재가 — 실시간 가격 우선, 차트 종가 fallback, 최종 매수가
  const cur = stockPrice?.price
    || priceData?.[priceData.length - 1]?.close
    || position.buyPrice;

  const profitRate = ((cur - position.buyPrice) / position.buyPrice) * 100;
  const profitAmount = (cur - position.buyPrice) * position.quantity;
  const totalValue = cur * position.quantity;
  const isProfit = profitRate >= 0;

  // ★ 세션 21: 전일 대비 변동 (Yahoo Finance 데이터)
  const dayChange = stockPrice?.change ?? null;
  const dayChangeAmt = stockPrice?.changeAmount ?? null;
  const hasRealPrice = stockPrice?.price != null;

  // ★ 장 상태 라벨
  const getMarketStateLabel = (): { text: string; color: string } | null => {
    if (!stockPrice?.marketState) return null;
    switch (stockPrice.marketState) {
      case 'REGULAR': return { text: '장중', color: '#10b981' };
      case 'PRE': return { text: '장전', color: '#f59e0b' };
      case 'POST': return { text: '장후', color: '#8b5cf6' };
      case 'CLOSED': return { text: '마감', color: '#64748b' };
      default: return null;
    }
  };
  const marketLabel = getMarketStateLabel();

  const getStage = () => {
    if (profitRate < 0) return { label: "손실 구간", color: "#ef4444" };
    if (profitRate < 5) return PROFIT_STAGES.initial;
    if (profitRate < 10) return PROFIT_STAGES.profit5;
    return PROFIT_STAGES.profit10;
  };
  const stage = getStage();

  // ★ 세션 26B: 시그널 레벨에 따른 border 색상
  const getSignalBorder = () => {
    if (!signals) return "1px solid rgba(255,255,255,0.08)";
    switch (signals.maxLevel) {
      case 'danger': return "1px solid rgba(239,68,68,0.25)";
      case 'warning': return "1px solid rgba(245,158,11,0.2)";
      default: return "1px solid rgba(255,255,255,0.08)";
    }
  };
  const signalBorder = getSignalBorder();

  // 매도가 계산
  const sellPrices: Record<string, number> = {};
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
        if (priceData?.length) {
          const mp = setting || 20;
          const rd = priceData.slice(-mp);
          sellPrices.maSignal = Math.round(rd.reduce((s: number, d: any) => s + d.close, 0) / rd.length);
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

  // ★ 세션 21: 전일 대비 변동 표시 컴포넌트 (재사용)
  const DayChangeIndicator = ({ compact = false }: { compact?: boolean }) => {
    if (dayChange == null || !hasRealPrice) return null;
    const isUp = dayChange >= 0;
    const arrow = isUp ? '\u25B2' : '\u25BC';
    const color = isUp ? '#10b981' : '#ef4444';

    if (compact) {
      return (
        <span style={{ fontSize: '10px', color, fontWeight: '600' }}>
          {arrow} {isUp ? '+' : ''}{dayChange.toFixed(1)}%
        </span>
      );
    }

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '11px', color,
      }}>
        <span>{arrow}</span>
        <span style={{ fontWeight: '600' }}>
          {isUp ? '+' : ''}{dayChangeAmt != null ? `\u20A9${Math.abs(dayChangeAmt).toLocaleString()}` : ''}
        </span>
        <span style={{ opacity: 0.8 }}>
          ({isUp ? '+' : ''}{dayChange.toFixed(2)}%)
        </span>
        {marketLabel && (
          <span style={{
            fontSize: '9px', padding: '1px 4px', borderRadius: '3px',
            background: marketLabel.color + '20', color: marketLabel.color,
            fontWeight: '600',
          }}>
            {marketLabel.text}
          </span>
        )}
      </div>
    );
  };

  // ★ 세션 26B: 스와이프 삭제 배경 (모바일 전용, 재사용)
  const SwipeDeleteBackground = () => (
    <div style={{
      position: 'absolute',
      top: 0, right: 0, bottom: 0, width: '80px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '0 14px 14px 0',
      zIndex: 0,
    }}>
      <button
        onClick={() => { swipe.resetSwipe(); onDelete(position.id); }}
        style={{
          background: 'transparent', border: 'none', color: '#fff',
          fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        }}
      >
        <span style={{ fontSize: '20px' }}>🗑️</span>삭제
      </button>
    </div>
  );

  // ── 접힌 상태 (모바일) ──
  if (isMobile && !isExpanded) {
    return (
      <>
        {/* ★ 세션 26B: 스와이프 삭제 래퍼 */}
        <div style={{
          position: 'relative', marginBottom: '8px',
          overflow: 'hidden', borderRadius: '14px',
        }}>
          {/* 삭제 버튼 배경 (스와이프 시에만 표시) */}
          {swipe.swipeOffset < 0 && <SwipeDeleteBackground />}

          {/* 카드 본체 (스와이프 대상) */}
          <div
            onTouchStart={swipe.handleTouchStart}
            onTouchMove={swipe.handleTouchMove}
            onTouchEnd={swipe.handleTouchEnd}
            style={{
              position: 'relative', zIndex: 1,
              transform: `translateX(${swipe.swipeOffset}px)`,
              transition: (swipe.swipeOffset === 0 || swipe.swipeOffset === -80)
                ? 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
            }}
          >
            <button onClick={handleCardToggle} style={{
              width: "100%", textAlign: "left", cursor: "pointer",
              background: "linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
              borderRadius: "14px", padding: "12px 14px",
              border: signalBorder,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>{position.name}</span>
                    <span style={{ background: stage.color + "22", color: stage.color, padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "600" }}>{stage.label}</span>
                    {/* ★ 세션 25: 접힌 카드 시그널 배지 */}
                    <SignalBadgeCompact signals={signals} />
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginTop: "4px", alignItems: "center" }}>
                    {presetDots.map((d: any, i: number) => (
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
                  {isProfit ? "+" : ""}{'\u20A9'}{formatCompact(Math.round(profitAmount))}
                </div>
                {/* ★ 접힌 상태에서도 전일 대비 표시 */}
                <DayChangeIndicator compact />
              </div>
            </button>
          </div>
        </div>

        {/* 수정 모달 (접힌 상태) */}
        {showEditModal && (
          <PositionEditModal position={position} onSave={onUpdate} onClose={() => setShowEditModal(false)} onDelete={() => setShowDeleteConfirm(true)} isMobile={isMobile} />
        )}
        {showDeleteConfirm && (
          <div onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setShowDeleteConfirm(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
          }}>
            <div style={{
              background: "linear-gradient(145deg, #1e293b, #0f172a)",
              borderRadius: "16px", padding: "24px", maxWidth: "340px", width: "90%",
              border: "1px solid rgba(239,68,68,0.3)", textAlign: "center",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{'\u26A0\uFE0F'}</div>
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
                }}>{'\uD83D\uDDD1\uFE0F'} 삭제</button>
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
      {/* ★ 세션 26B: 스와이프 삭제 래퍼 (모바일 전용) */}
      <div style={{
        position: isMobile ? 'relative' : 'static',
        marginBottom: '10px',
        overflow: isMobile ? 'hidden' : 'visible',
        borderRadius: '16px',
      }}>
        {/* 삭제 버튼 배경 (모바일, 스와이프 시에만 표시) */}
        {isMobile && swipe.swipeOffset < 0 && <SwipeDeleteBackground />}

        {/* 카드 본체 */}
        <div
          onTouchStart={isMobile ? swipe.handleTouchStart : undefined}
          onTouchMove={isMobile ? swipe.handleTouchMove : undefined}
          onTouchEnd={isMobile ? swipe.handleTouchEnd : undefined}
          style={{
            position: 'relative', zIndex: 1,
            transform: isMobile ? `translateX(${swipe.swipeOffset}px)` : 'none',
            transition: isMobile && (swipe.swipeOffset === 0 || swipe.swipeOffset === -80)
              ? 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
            background: "linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
            borderRadius: "16px", padding: isMobile ? "14px" : "16px 18px",
            border: signalBorder,
          }}
        >
        {/* 헤더: 종목명 + 수익률 + 액션 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: isMobile ? "17px" : "18px", fontWeight: "700", color: "#fff" }}>{position.name}</span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>{position.code}</span>
              <span style={{ background: stage.color + "20", color: stage.color, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600" }}>{stage.label}</span>
              {/* ★ 장 상태 뱃지 */}
              {marketLabel && (
                <span style={{
                  padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '700',
                  background: marketLabel.color + '20', color: marketLabel.color,
                  border: `1px solid ${marketLabel.color}30`,
                }}>
                  {marketLabel.text}
                </span>
              )}
            </div>
            <div style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: "800", color: isProfit ? "#10b981" : "#ef4444", marginTop: "2px" }}>
              {isProfit ? "+" : ""}{profitRate.toFixed(2)}%
            </div>
            {/* ★ 전일 대비 변동 표시 */}
            <DayChangeIndicator />
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {!isMobile && (
              <>
                <button onClick={() => setShowEditModal(true)} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>{'\u270F\uFE0F'} 수정</button>
                <button onClick={() => window.open(naverNewsUrl, "_blank")} style={{ padding: "6px 12px", background: "rgba(16,185,129,0.08)", border: "none", borderRadius: "8px", color: "#10b981", fontSize: "12px", cursor: "pointer" }}>{'\uD83D\uDCF0'} 뉴스</button>
                <button onClick={handleToggleAI} style={{ padding: "6px 12px", background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.12))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "8px", color: "#a78bfa", fontSize: "12px", cursor: "pointer" }}>{'\uD83E\uDD16'} AI요약{!isPremium && ` (${maxFreeAINews - aiNewsUsedCount}회)`}</button>
              </>
            )}
            {isMobile && (
              <button onClick={() => { swipe.resetSwipe(); setIsExpanded(false); }} style={{
                background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px",
                width: "36px", height: "36px", minHeight: "44px", minWidth: "44px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#94a3b8", fontSize: "14px", cursor: "pointer",
              }}>{'\u25B2'}</button>
            )}
          </div>
        </div>

        {/* 가격 2x2 그리드 */}
        <div style={{ display: isMobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: isMobile ? undefined : isTablet ? "1fr 250px" : "1fr 280px", gap: "12px" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px", marginBottom: "10px" }}>
              {[
                { label: "매수가", value: '\u20A9' + position.buyPrice.toLocaleString() },
                {
                  label: hasRealPrice ? "현재가 (실시간)" : "현재가",
                  value: '\u20A9' + Math.round(cur).toLocaleString(),
                  color: isProfit ? "#10b981" : "#ef4444",
                  badge: hasRealPrice ? '\u25C9' : undefined,
                  badgeColor: '#10b981',
                },
                { label: "수량", value: position.quantity + "주" },
                { label: "평가금액", value: '\u20A9' + formatCompact(Math.round(totalValue)) },
              ].map((item, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.35)", borderRadius: "8px", padding: isMobile ? "8px 10px" : "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "2px", display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.label}
                    {(item as any).badge && (
                      <span style={{ color: (item as any).badgeColor, fontSize: '6px' }}>{(item as any).badge}</span>
                    )}
                  </div>
                  <div style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700", color: (item as any).color || "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.value}</div>
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
                  {isProfit ? "+" : ""}{'\u20A9'}{formatCompact(Math.round(profitAmount))}
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

            {/* ★ 세션 25: 매도 시그널 섹션 (매도 조건 위에 배치) */}
            <SignalSection signals={signals} isMobile={isMobile} />

            {/* 매도 조건 아코디언 */}
            <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: "10px", marginBottom: "10px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <button onClick={() => setShowPresets(!showPresets)} style={{
                width: "100%", padding: "10px 12px", background: "transparent", border: "none",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", minHeight: "44px",
              }}>
                <span style={{ fontSize: isMobile ? "13px" : "15px", color: "#fff", fontWeight: "600" }}>
                  {'\uD83D\uDCCA'} 매도 조건 ({(position.selectedPresets || []).length}개)
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {!showPresets && (
                    <div style={{ display: "flex", gap: "3px" }}>
                      {presetDots.slice(0, 3).map((d: any, i: number) => (
                        <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color }} />
                      ))}
                    </div>
                  )}
                  <span style={{ color: "#64748b", fontSize: "12px", transition: "transform 0.2s", transform: showPresets ? "rotate(180deg)" : "rotate(0)" }}>{'\u25BC'}</span>
                </div>
              </button>
              {showPresets && (
                <div style={{ padding: "0 12px 12px" }}>
                  <div style={{ fontSize: "10px", color: "#f59e0b", marginBottom: "8px", background: "rgba(245,158,11,0.08)", padding: "5px 8px", borderRadius: "4px" }}>
                    {'\u26A0\uFE0F'} 수치는 예시입니다. 본인의 투자 원칙에 따라 수정하세요.
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "6px" }}>
                    <button onClick={() => setShowEditModal(true)} style={{
                      background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
                      borderRadius: "4px", padding: isMobile ? "6px 10px" : "4px 10px",
                      color: "#60a5fa", fontSize: isMobile ? "11px" : "12px", cursor: "pointer", minHeight: "32px",
                    }}>{'\u270F\uFE0F'} 수정</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {(position.selectedPresets || []).map((pid) => {
                      const preset = SELL_PRESETS[pid];
                      if (!preset) return null;
                      const hasChartLine = CHART_LINE_PRESETS.includes(pid);
                      // 매도 기준가격 텍스트
                      let priceText = "모니터링 중";
                      let priceColor = "#94a3b8";
                      if (pid === "stopLoss" && sellPrices.stopLoss) { priceText = "\u20A9" + sellPrices.stopLoss.toLocaleString(); priceColor = cur <= sellPrices.stopLoss ? "#ef4444" : "#94a3b8"; }
                      else if (pid === "twoThird" && sellPrices.twoThird) { priceText = "\u20A9" + sellPrices.twoThird.toLocaleString(); priceColor = cur <= sellPrices.twoThird ? "#f59e0b" : "#94a3b8"; }
                      else if (pid === "maSignal" && sellPrices.maSignal) { priceText = "\u20A9" + sellPrices.maSignal.toLocaleString(); priceColor = cur < sellPrices.maSignal ? "#f59e0b" : "#94a3b8"; }
                      else if (pid === "volumeZone" && sellPrices.volumeZone) { priceText = "\u20A9" + sellPrices.volumeZone.toLocaleString(); }
                      else if (pid === "trendline" && sellPrices.trendline) { priceText = "\u20A9" + sellPrices.trendline.toLocaleString(); }

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
              }}>{'\uD83D\uDCCA'} 차트 {showChart ? '접기 \u25B2' : '보기 \u25BC'}</button>
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
                <span>{'\uD83D\uDCC8'}</span>
                <span style={{ textDecoration: "underline", color: "#60a5fa" }}>네이버 증권 차트 보기</span>
                <span style={{ fontSize: "10px" }}>{'\u2192'}</span>
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
            }}>{'\u270F\uFE0F'} 수정</button>
            <button onClick={() => window.open(naverNewsUrl, "_blank")} style={{
              flex: 1, padding: "10px", minHeight: "44px", background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px",
              color: "#10b981", fontSize: "12px", fontWeight: "600", cursor: "pointer",
            }}>{'\uD83D\uDCF0'} 뉴스</button>
            <button onClick={handleToggleAI} style={{
              flex: 1, padding: "10px", minHeight: "44px",
              background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.12))",
              border: "1px solid rgba(139,92,246,0.25)", borderRadius: "8px",
              color: "#a78bfa", fontSize: "12px", fontWeight: "600", cursor: "pointer",
            }}>{'\uD83E\uDD16'} AI{!isPremium && ` ${maxFreeAINews - aiNewsUsedCount}`}</button>
          </div>
        )}

        {/* ★ 세션 26B: 스와이프 삭제 힌트 (모바일, 펼친 상태) */}
        {isMobile && (
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: '#475569' }}>
            ← 좌측으로 스와이프하여 삭제
          </div>
        )}
        </div>{/* 카드 본체 div 닫기 */}
      </div>{/* 스와이프 래퍼 div 닫기 */}

      {/* 수정 모달 */}
      {showEditModal && (
        <PositionEditModal position={position} onSave={onUpdate} onClose={() => setShowEditModal(false)} onDelete={() => { setShowEditModal(false); setShowDeleteConfirm(true); }} isMobile={isMobile} />
      )}

      {/* 삭제 확인 팝업 */}
      {showDeleteConfirm && (
        <div onClick={(e: React.MouseEvent) => e.target === e.currentTarget && setShowDeleteConfirm(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
        }}>
          <div style={{
            background: "linear-gradient(145deg, #1e293b, #0f172a)",
            borderRadius: "16px", padding: "24px", maxWidth: "340px", width: "90%",
            border: "1px solid rgba(239,68,68,0.3)", textAlign: "center",
          }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>{'\u26A0\uFE0F'}</div>
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
              }}>{'\uD83D\uDDD1\uFE0F'} 삭제</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PositionCard;
