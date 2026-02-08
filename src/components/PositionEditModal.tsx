'use client';
// ============================================
// PositionEditModal - 포지션 수정/삭제 모달
// 경로: src/components/PositionEditModal.tsx
// 세션 18A: 바텀시트(모바일) / 센터모달(데스크톱)
// ============================================

import React, { useState } from 'react';
import { SELL_PRESETS } from '@/constants';
import type { Position } from '@/types';

interface PositionEditModalProps {
  position: Position;
  isMobile: boolean;
  onClose: () => void;
  onSave: (updated: Position) => void;
  onDelete: (id: number) => void;
}

const PositionEditModal = ({ position, onSave, onClose, onDelete, isMobile }) => {
  const [editQuantity, setEditQuantity] = useState(String(position.quantity));
  const [editBuyPrice, setEditBuyPrice] = useState(String(position.buyPrice));
  const [editPresets, setEditPresets] = useState([...(position.selectedPresets || [])]);
  const [editSettings, setEditSettings] = useState({ ...position.presetSettings });

  const togglePreset = (presetId) => {
    setEditPresets((prev) =>
      prev.includes(presetId) ? prev.filter((p) => p !== presetId) : [...prev, presetId]
    );
  };

  const handleSave = () => {
    onSave({
      ...position,
      quantity: Number(editQuantity) || position.quantity,
      buyPrice: Number(editBuyPrice) || position.buyPrice,
      selectedPresets: editPresets,
      presetSettings: editSettings,
    });
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", fontSize: "15px", fontWeight: "600",
    background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", color: "#fff", outline: "none",
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: isMobile ? "flex-end" : "center",
      justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "linear-gradient(145deg, #1e293b, #0f172a)",
        borderRadius: isMobile ? "20px 20px 0 0" : "20px",
        padding: isMobile ? "20px 16px calc(20px + env(safe-area-inset-bottom, 0px))" : "24px",
        width: "100%", maxWidth: isMobile ? "100%" : "480px",
        maxHeight: isMobile ? "85vh" : "80vh", overflowY: "auto",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {/* 드래그 핸들 */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <div style={{ width: "36px", height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "2px" }} />
          </div>
        )}

        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#fff", margin: 0 }}>
            ✏️ {position.name} 수정
          </h2>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px",
            width: "36px", height: "36px", minHeight: "44px", minWidth: "44px",
            color: "#94a3b8", fontSize: "18px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* 수량 & 매수가 편집 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>보유 수량</label>
            <input type="number" inputMode="numeric" value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>매수 단가 (₩)</label>
            <input type="number" inputMode="numeric" value={editBuyPrice}
              onChange={(e) => setEditBuyPrice(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* 매도법 ON/OFF 토글 */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>
            📊 매도 조건 선택 ({editPresets.length}개)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {Object.values(SELL_PRESETS).map((preset) => {
              const isActive = editPresets.includes(preset.id);
              return (
                <button key={preset.id} onClick={() => togglePreset(preset.id)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", minHeight: "44px",
                  background: isActive ? `${preset.color}12` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? preset.color + "40" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: "8px", cursor: "pointer", width: "100%", textAlign: "left",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>{preset.icon}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: isActive ? preset.color : "#94a3b8" }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>{preset.desc}</div>
                    </div>
                  </div>
                  <div style={{
                    width: "40px", height: "22px", borderRadius: "11px",
                    background: isActive ? preset.color : "rgba(255,255,255,0.1)",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      background: "#fff", position: "absolute", top: "2px",
                      left: isActive ? "20px" : "2px", transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 저장 & 삭제 버튼 */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleSave} style={{
            flex: 1, padding: "14px", minHeight: "48px",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            border: "none", borderRadius: "12px", color: "#fff",
            fontSize: "15px", fontWeight: "700", cursor: "pointer",
          }}>💾 저장</button>
          <button onClick={() => { onDelete(position.id); onClose(); }} style={{
            padding: "14px 20px", minHeight: "48px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px", color: "#ef4444",
            fontSize: "15px", fontWeight: "700", cursor: "pointer",
          }}>🗑️ 종목삭제</button>
        </div>
      </div>
    </div>
  );
};

// ============================================

export default PositionEditModal;
