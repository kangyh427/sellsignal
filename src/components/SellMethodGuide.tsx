'use client';
// ============================================
// SellMethodGuide v2 - 수익 단계별 매도법 가이드
// 경로: src/components/SellMethodGuide.tsx
// 세션 29: 모바일 최적화 — 탭 44px, 아코디언 52px, 폰트 확대
// ============================================

import React, { useState } from 'react';
import { SELL_PRESETS } from '@/constants';

interface SellMethodGuideProps {
  isMobile: boolean;
  activeTab?: string;
  isPremium?: boolean;
}

const GUIDE_STAGES = {
  initial: {
    label: "초기 단계", range: "매수 직후 ~ 5% 수익", color: "#6b7280", emoji: "🔰",
    desc: "매수 직후에는 손실 방어가 핵심입니다. 감정적 판단을 배제하고 기계적으로 대응하세요.",
    methods: ["candle3", "stopLoss"],
  },
  profit5: {
    label: "5% 수익 구간", range: "5% ~ 10% 수익", color: "#eab308", emoji: "📈",
    desc: "수익이 발생하기 시작한 구간입니다. 수익 보호와 추가 상승 포착을 동시에 관리하세요.",
    methods: ["candle3", "stopLoss", "twoThird", "maSignal", "volumeZone"],
  },
  profit10: {
    label: "10%+ 수익 구간", range: "10% 이상 수익", color: "#10b981", emoji: "🚀",
    desc: "큰 수익 구간에서는 추세 이탈과 펀더멘털 변화에 주의하며, 분할 매도를 고려하세요.",
    methods: ["twoThird", "maSignal", "volumeZone", "trendline", "fundamental", "cycle"],
  },
};

const METHOD_DETAILS: Record<string, { fullDesc: string; when: string; tip: string }> = {
  candle3: {
    fullDesc: "직전 양봉의 50% 이상을 음봉이 덮으면 절반 매도, 100% 덮으면 전량 매도합니다. 3일 연속 하락봉은 추세 전환의 강한 신호입니다.",
    when: "매수 직후 ~ 5% 수익 구간",
    tip: "단기 트레이딩에 유효하며, 장기 투자 시에는 다른 지표와 함께 사용하세요.",
  },
  stopLoss: {
    fullDesc: "매수가 대비 설정한 손실률(-3~-5%)에 도달하면 감정을 배제하고 기계적으로 손절합니다. 큰 손실을 방지하는 가장 기본적인 방법입니다.",
    when: "매수 직후부터 상시 적용",
    tip: "손절 기준은 매수 전에 반드시 정해두세요. 물타기보다 손절이 자산을 지킵니다.",
  },
  twoThird: {
    fullDesc: "최고 수익 대비 1/3이 빠지면 남은 2/3 수익을 확보하여 익절합니다. 고점을 정확히 맞출 수 없기에, 수익을 지키는 현실적 전략입니다.",
    when: "5% 이상 수익 발생 시",
    tip: "고점 추적을 자동화하면 감정적 판단을 줄일 수 있습니다.",
  },
  maSignal: {
    fullDesc: "이동평균선을 하향 돌파하거나, 이평선이 저항선으로 작용할 때 매도합니다. 그랜빌의 법칙 기반으로 4가지 매도 신호를 활용합니다.",
    when: "5% 이상 수익 구간에서 추세 확인용",
    tip: "20일선(단기), 60일선(중기), 120일선(장기) 중 종목 특성에 맞는 것을 선택하세요.",
  },
  volumeZone: {
    fullDesc: "상단 매물대(저항대)에서 주가가 하락 반전할 때 매도합니다. 많은 거래가 집중된 가격대는 심리적 저항선으로 작용합니다.",
    when: "저항대 접근 시",
    tip: "거래량과 함께 분석하면 정확도가 높아집니다. 돌파 후 지지 확인되면 재진입도 가능합니다.",
  },
  trendline: {
    fullDesc: "상승 추세의 지지선을 깨고 하락하거나, 저항선 돌파에 실패할 때 매도합니다. 추세는 유지되는 동안만 유효합니다.",
    when: "10% 이상 수익 구간의 추세 관리",
    tip: "추세선은 최소 3개 이상의 저점(고점)을 연결해야 신뢰도가 높습니다.",
  },
  fundamental: {
    fullDesc: "실적 악화, 업황 반전, PER/PBR 과대평가 등 기업 펀더멘털에 부정적 변화가 생길 때 매도합니다.",
    when: "실적 발표 시즌, 업황 변화 시",
    tip: "분기 실적, 컨센서스 대비 어닝 서프라이즈/쇼크를 모니터링하세요.",
  },
  cycle: {
    fullDesc: "코스톨라니 달걀 모형의 4~5단계(금리 고점 근처)에서 시장 전체에 대한 매도 관점을 유지합니다. 거시 경제 흐름에 기반한 전략입니다.",
    when: "금리 인상 후반, 경기 과열기",
    tip: "개별 종목보다 시장 전체 방향성 판단에 활용하세요. 위 코스톨라니 달걀 위젯을 참고하세요.",
  },
};

const SellMethodGuide = ({ isMobile, activeTab }: SellMethodGuideProps) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("stages");

  return (
    <div style={{
      display: isMobile && activeTab !== "guide" ? "none" : "block",
      background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
      borderRadius: "14px", padding: isMobile ? "14px" : "16px",
      border: "1px solid rgba(255,255,255,0.08)", marginBottom: "12px",
    }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ fontSize: isMobile ? "15px" : "15px", fontWeight: "700", color: "#fff", margin: 0 }}>
          📚 매도의 기술 가이드
        </h3>
      </div>

      {/* ★ 세션29: 탭 전환 — minHeight 44px 터치타겟 */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "3px" }}>
        {[
          { id: "stages", label: "수익 단계별" },
          { id: "methods", label: "8가지 매도법" },
          { id: "flow", label: "투자 흐름도" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setViewMode(tab.id)} style={{
            flex: 1,
            padding: isMobile ? "10px 4px" : "8px 12px",
            minHeight: isMobile ? '44px' : 'auto',
            borderRadius: "8px",
            background: viewMode === tab.id ? "rgba(59,130,246,0.2)" : "transparent",
            border: viewMode === tab.id ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
            color: viewMode === tab.id ? "#60a5fa" : "#64748b",
            fontSize: isMobile ? "12px" : "12px", fontWeight: "600", cursor: "pointer",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* === 수익 단계별 뷰 === */}
      {viewMode === "stages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(GUIDE_STAGES).map(([key, stage]) => (
            <div key={key}>
              {/* ★ 세션29: minHeight 52px 터치타겟 */}
              <button onClick={() => setExpandedStage(expandedStage === key ? null : key)} style={{
                width: "100%",
                padding: isMobile ? "14px 12px" : "14px",
                minHeight: isMobile ? '52px' : 'auto',
                background: expandedStage === key ? `${stage.color}15` : "rgba(255,255,255,0.03)",
                borderRadius: expandedStage === key ? "10px 10px 0 0" : "10px",
                borderLeft: `4px solid ${stage.color}`,
                border: expandedStage === key ? `1px solid ${stage.color}40` : "1px solid rgba(255,255,255,0.04)",
                borderLeftWidth: "4px", borderLeftColor: stage.color,
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                textAlign: "left",
              }}>
                <div>
                  <div style={{ fontSize: isMobile ? "14px" : "14px", fontWeight: "700", color: stage.color, display: "flex", alignItems: "center", gap: "6px" }}>
                    {stage.emoji} {stage.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                    {stage.range} · {stage.methods.length}개 매도법 적용
                  </div>
                </div>
                <span style={{
                  color: "#64748b", fontSize: "12px",
                  transform: expandedStage === key ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  padding: '8px',
                }}>▼</span>
              </button>

              {expandedStage === key && (
                <div style={{
                  padding: isMobile ? "12px" : "14px",
                  background: "rgba(0,0,0,0.25)", borderRadius: "0 0 10px 10px",
                  borderLeft: `4px solid ${stage.color}50`,
                  border: `1px solid ${stage.color}20`, borderTop: "none",
                }}>
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px", lineHeight: "1.6" }}>
                    {stage.desc}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {stage.methods.map((mid) => {
                      const preset = SELL_PRESETS[mid];
                      if (!preset) return null;
                      const detail = METHOD_DETAILS[mid];
                      return (
                        <div key={mid} style={{
                          padding: isMobile ? "12px" : "10px 12px", borderRadius: "8px",
                          background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${preset.color}`,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "14px" }}>{preset.icon}</span>
                            <span style={{ fontSize: isMobile ? "13px" : "13px", fontWeight: "600", color: "#e2e8f0" }}>{preset.name}</span>
                          </div>
                          <div style={{ fontSize: isMobile ? "12px" : "11px", color: "#94a3b8", lineHeight: "1.6", paddingLeft: "22px" }}>
                            {detail?.fullDesc || preset.desc}
                          </div>
                          {detail?.tip && (
                            <div style={{ fontSize: isMobile ? "11px" : "10px", color: "#60a5fa", marginTop: "6px", paddingLeft: "22px", fontStyle: "italic" }}>
                              💡 {detail.tip}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* === 8가지 매도법 전체 뷰 === */}
      {viewMode === "methods" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {Object.entries(SELL_PRESETS).map(([id, preset]) => {
            const detail = METHOD_DETAILS[id];
            const isOpen = expandedMethod === id;
            return (
              <div key={id}>
                <button onClick={() => setExpandedMethod(isOpen ? null : id)} style={{
                  width: "100%",
                  padding: isMobile ? "12px" : "10px 12px",
                  minHeight: isMobile ? '52px' : 'auto',
                  background: isOpen ? `${preset.color}15` : "rgba(255,255,255,0.03)",
                  borderRadius: isOpen ? "10px 10px 0 0" : "10px",
                  border: isOpen ? `1px solid ${preset.color}30` : "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                  textAlign: "left",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>{preset.icon}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: isOpen ? preset.color : "#e2e8f0" }}>{preset.name}</div>
                      <div style={{ fontSize: isMobile ? "11px" : "10px", color: "#64748b", marginTop: "1px" }}>{preset.desc}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: "12px", color: "#64748b",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    padding: '8px',
                  }}>▼</span>
                </button>
                {isOpen && detail && (
                  <div style={{
                    padding: "12px", background: "rgba(0,0,0,0.25)",
                    borderRadius: "0 0 10px 10px",
                    border: `1px solid ${preset.color}20`, borderTop: "none",
                  }}>
                    <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "0 0 8px", lineHeight: "1.6" }}>
                      {detail.fullDesc}
                    </p>
                    <div style={{ display: "flex", gap: isMobile ? "6px" : "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.04)", padding: "6px 10px", borderRadius: "6px" }}>
                        ⏰ 적용 시점: {detail.when}
                      </div>
                    </div>
                    <div style={{ fontSize: "11px", color: "#60a5fa", fontStyle: "italic" }}>
                      💡 {detail.tip}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* === 투자 흐름도 뷰 === */}
      {viewMode === "flow" && (
        <div style={{ padding: "4px 0" }}>
          {[
            { step: "1", title: "종목 검색과 분석", emoji: "🔍", desc: "기본적 분석(PER/PBR)과 기술적 분석(차트)으로 종목 선정", color: "#94a3b8" },
            { step: "2", title: "주식 매수", emoji: "💰", desc: "매수가 기록, 손절선·목표가 사전 설정", color: "#3b82f6" },
            { step: "3", title: "매수 후 초기단계", emoji: "🔰", desc: "봉 3개 매도법 + 손실제한 매도법으로 방어", color: "#6b7280", methods: "봉3개, 손실제한" },
            { step: "4", title: "5% 수익 달성", emoji: "📈", desc: "5개 매도법으로 수익 보호 + 추가 상승 추적", color: "#eab308", methods: "+2/3익절, 이동평균선, 매물대" },
            { step: "5", title: "10%+ 수익 달성", emoji: "🚀", desc: "추세선·기업가치·경기순환까지 종합 판단", color: "#10b981", methods: "+추세선, 기업가치, 경기순환" },
            { step: "6", title: "매도 실행", emoji: "🎯", desc: "사전 설정한 조건 도달 시 기계적 매도", color: "#ef4444" },
          ].map((item, i, arr) => (
            <div key={i} style={{ display: "flex", gap: "12px", marginBottom: i < arr.length - 1 ? "4px" : "0" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "28px", flexShrink: 0 }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: `${item.color}20`, border: `2px solid ${item.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "800", color: item.color,
                }}>{item.step}</div>
                {i < arr.length - 1 && (
                  <div style={{ width: "2px", flex: 1, minHeight: "20px", background: `linear-gradient(${item.color}50, ${arr[i+1].color}50)` }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: i < arr.length - 1 ? "12px" : "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "14px" }}>{item.emoji}</span>
                  <span style={{ fontSize: isMobile ? "13px" : "13px", fontWeight: "700", color: item.color }}>{item.title}</span>
                </div>
                <div style={{ fontSize: isMobile ? "12px" : "11px", color: "#94a3b8", lineHeight: "1.5", paddingLeft: "22px" }}>{item.desc}</div>
                {item.methods && (
                  <div style={{ marginTop: "4px", paddingLeft: "22px" }}>
                    <span style={{ fontSize: isMobile ? "11px" : "10px", color: "#60a5fa", background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                      적용 매도법: {item.methods}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div style={{
            marginTop: "14px", padding: "12px",
            background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))",
            borderRadius: "10px", border: "1px solid rgba(59,130,246,0.15)",
          }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#60a5fa", marginBottom: "6px" }}>
              🎯 핵심 원칙
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.7" }}>
              • 매수 전에 매도 기준을 반드시 정하세요<br/>
              • 감정이 아닌 시스템으로 매도하세요<br/>
              • 수익 구간이 커질수록 더 많은 매도법을 병행하세요<br/>
              • 한 가지 매도법에 의존하지 마세요
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellMethodGuide;
