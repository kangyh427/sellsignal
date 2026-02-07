// ============================================
// StockModal 컴포넌트 (모바일 Bottom Sheet 최적화)
// 위치: src/components/StockModal.tsx
// ============================================
// 세션3 개선사항:
// - 모바일: Bottom Sheet 스타일 (하단에서 슬라이드 업)
// - 터치 타겟 44px 이상 보장
// - 입력 필드 포커스 시 스크롤 개선
// - 타입: types/index.ts에서 import (내부 타입 제거)

'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { StockModalProps, Stock, Position, FormState } from '../types';
import { SELL_PRESETS, STOCK_LIST } from '../constants';

const StockModal: React.FC<StockModalProps> = ({ stock, onSave, onClose, isMobile }) => {
  // ── Form 상태 ──
  const [form, setForm] = useState<FormState>({
    stockCode: stock?.stock?.code || stock?.code || '',
    buyPrice: stock?.buyPrice?.toString() || '',
    quantity: stock?.quantity?.toString() || '',
    buyDate: stock?.buyDate || new Date().toISOString().split('T')[0],
    selectedPresets: stock?.selectedPresets || [],
    presetSettings: stock?.presetSettings || {},
    memo: stock?.memo || '',
  });

  // ── 자동완성 상태 ──
  const stockName = stock?.stock?.name || stock?.name || '';
  const stockCode = stock?.stock?.code || stock?.code || '';
  const [stockInput, setStockInput] = useState(
    stock ? `${stockName} (${stockCode})` : '',
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>(STOCK_LIST);

  // ── Bottom Sheet 애니메이션 ──
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 마운트 시 애니메이션 트리거
    requestAnimationFrame(() => setIsAnimating(true));
    // 모바일에서 body 스크롤 잠금
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile]);

  // ── 종목 입력 핸들러 ──
  const handleStockInput = (value: string) => {
    setStockInput(value);
    setShowSuggestions(true);
    if (value.trim() === '') {
      setFilteredStocks(STOCK_LIST);
      setForm({ ...form, stockCode: '' });
    } else {
      const filtered = STOCK_LIST.filter(
        (s: Stock) =>
          s.name.toLowerCase().includes(value.toLowerCase()) || s.code.includes(value),
      );
      setFilteredStocks(filtered);
    }
  };

  // ── 종목 선택 핸들러 ──
  const handleSelectStock = (selectedStock: Stock) => {
    setStockInput(`${selectedStock.name} (${selectedStock.code})`);
    setForm((prev) => ({ ...prev, stockCode: selectedStock.code }));
    setShowSuggestions(false);
  };

  // ── 저장 핸들러 ──
  const handleSave = () => {
    let selectedStock = STOCK_LIST.find((s: Stock) => s.code === form.stockCode);

    // 리스트에 없는 종목이면 직접 입력된 것으로 처리
    if (!selectedStock && stockInput.trim() !== '') {
      const codeMatch = stockInput.match(/\(([^)]+)\)/);
      const extractedCode = codeMatch ? codeMatch[1] : '';
      if (extractedCode) {
        selectedStock = STOCK_LIST.find((s: Stock) => s.code === extractedCode);
      }
      if (!selectedStock) {
        const name = stockInput.replace(/\s*\([^)]*\)\s*/, '').trim() || stockInput;
        selectedStock = {
          name,
          code: extractedCode || `CUSTOM_${Date.now()}`,
          market: '직접입력',
          sector: '기타',
          per: 0,
          pbr: 0,
          sectorPer: 0,
          sectorPbr: 0,
        };
      }
    }

    if (!selectedStock) {
      alert('종목을 입력해주세요');
      return;
    }

    const buyPrice = parseFloat(form.buyPrice);
    const quantity = parseInt(form.quantity);
    if (isNaN(buyPrice) || isNaN(quantity) || buyPrice <= 0 || quantity <= 0) {
      alert('올바른 금액과 수량을 입력해주세요');
      return;
    }

    const newPosition: Position = {
      id: stock?.id || Date.now().toString(),
      stock: selectedStock,
      name: selectedStock.name,
      code: selectedStock.code,
      buyPrice,
      quantity,
      currentPrice: buyPrice * (1 + (Math.random() * 0.2 - 0.05)),
      buyDate: form.buyDate,
      selectedPresets: form.selectedPresets,
      presetSettings: form.presetSettings,
      memo: form.memo,
      alerts: [],
      priceHistory: [],
    };

    onSave(newPosition);
  };

  // ── 프리셋 토글 ──
  const togglePreset = (presetId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedPresets: prev.selectedPresets.includes(presetId)
        ? prev.selectedPresets.filter((id: string) => id !== presetId)
        : [...prev.selectedPresets, presetId],
      presetSettings: {
        ...prev.presetSettings,
        [presetId]: prev.presetSettings[presetId] || {
          value: SELL_PRESETS[presetId]?.inputDefault || 0,
        },
      },
    }));
  };

  // ── 닫기 핸들러 (애니메이션 후 닫기) ──
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200); // 애니메이션 완료 후
  };

  // ── 공통 입력 스타일 ──
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: isMobile ? '12px 14px' : '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: isMobile ? '16px' : '14px', // 모바일: 16px으로 iOS 줌 방지
    boxSizing: 'border-box' as const,
    minHeight: isMobile ? '48px' : 'auto', // 터치 타겟
  };

  // ============================================
  // 렌더링
  // ============================================
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        // 모바일: 하단 정렬 (Bottom Sheet), 데스크탑: 중앙 정렬
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '0' : '20px',
        transition: 'opacity 0.2s ease',
        opacity: isAnimating ? 1 : 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={contentRef}
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          // 모바일: 하단에서 올라오는 시트
          borderRadius: isMobile ? '20px 20px 0 0' : '16px',
          padding: isMobile ? '20px 20px 32px' : '28px',
          maxWidth: isMobile ? '100%' : '500px',
          width: '100%',
          maxHeight: isMobile ? '90vh' : '90vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
          // Bottom Sheet 슬라이드 애니메이션
          transform: isMobile
            ? `translateY(${isAnimating ? '0' : '100%'})`
            : `scale(${isAnimating ? 1 : 0.95})`,
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          // iOS 안전 영역 대응
          paddingBottom: isMobile ? 'max(32px, env(safe-area-inset-bottom))' : '28px',
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 모바일 드래그 핸들 ── */}
        {isMobile && (
          <div
            style={{
              width: '40px',
              height: '4px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              margin: '0 auto 16px',
            }}
          />
        )}

        {/* ── 타이틀 ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '700',
              color: '#fff',
              margin: 0,
            }}
          >
            {stock ? '종목 정보 수정' : '종목 추가'}
          </h2>
          {/* 모바일 닫기 버튼 */}
          {isMobile && (
            <button
              onClick={handleClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: '#94a3b8',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* ── 종목 선택 ── */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#94a3b8',
              marginBottom: '6px',
            }}
          >
            종목 선택 (직접 입력 가능)
          </label>
          <input
            type="text"
            value={stockInput}
            onChange={(e) => handleStockInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="종목명 또는 종목코드 입력"
            style={inputStyle}
          />

          {/* 자동완성 드롭다운 */}
          {showSuggestions && filteredStocks.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: isMobile ? '160px' : '200px',
                overflowY: 'auto',
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                marginTop: '4px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {filteredStocks.map((s: Stock) => (
                <div
                  key={s.code}
                  onClick={() => handleSelectStock(s)}
                  style={{
                    padding: isMobile ? '14px 12px' : '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '14px',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {s.name} ({s.code})
                </div>
              ))}
            </div>
          )}

          {/* 도움말 */}
          {stockInput && !form.stockCode && (
            <div
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                marginTop: '4px',
                fontStyle: 'italic',
              }}
            >
              💡 리스트에 없는 종목도 직접 입력 가능합니다
            </div>
          )}
        </div>

        {/* ── 매수 정보 (2열 그리드) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#94a3b8',
                marginBottom: '6px',
              }}
            >
              매수가
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={form.buyPrice}
              onChange={(e) => setForm((prev) => ({ ...prev, buyPrice: e.target.value }))}
              placeholder="50000"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#94a3b8',
                marginBottom: '6px',
              }}
            >
              수량
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={form.quantity}
              onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="10"
              style={inputStyle}
            />
          </div>
        </div>

        {/* ── 매수일 ── */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#94a3b8',
              marginBottom: '6px',
            }}
          >
            매수일
          </label>
          <input
            type="date"
            value={form.buyDate}
            onChange={(e) => setForm((prev) => ({ ...prev, buyDate: e.target.value }))}
            style={inputStyle}
          />
        </div>

        {/* ── 매도 전략 선택 ── */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#94a3b8',
              marginBottom: '8px',
            }}
          >
            매도 전략 선택
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '8px',
            }}
          >
            {Object.values(SELL_PRESETS).map((preset: any) => (
              <button
                key={preset.id}
                onClick={() => togglePreset(preset.id)}
                style={{
                  padding: isMobile ? '14px 12px' : '10px',
                  background: form.selectedPresets.includes(preset.id)
                    ? 'rgba(139,92,246,0.2)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    form.selectedPresets.includes(preset.id)
                      ? '#8b5cf6'
                      : 'rgba(255,255,255,0.1)'
                  }`,
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: isMobile ? '13px' : '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: isMobile ? '48px' : 'auto',
                }}
              >
                <div>
                  {preset.icon} {preset.name}
                </div>
                {preset.hasInput && form.selectedPresets.includes(preset.id) && (
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.presetSettings[preset.id]?.value ?? preset.inputDefault ?? 0}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        presetSettings: {
                          ...prev.presetSettings,
                          [preset.id]: { value: parseFloat(e.target.value) || 0 },
                        },
                      }))
                    }
                    onClick={(e) => e.stopPropagation()}
                    placeholder={preset.inputLabel}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: isMobile ? '8px' : '4px 8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: isMobile ? '14px' : '11px',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── 메모 ── */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: '#94a3b8',
              marginBottom: '6px',
            }}
          >
            메모
          </label>
          <textarea
            value={form.memo}
            onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))}
            placeholder="투자 근거나 메모를 입력하세요"
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: isMobile ? '80px' : 'auto',
            }}
          />
        </div>

        {/* ── 버튼 ── */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: isMobile ? '16px' : '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: isMobile ? '16px' : '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
              minHeight: '48px',
            }}
          >
            {stock ? '수정 완료' : '종목 추가'}
          </button>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: isMobile ? '16px' : '14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#94a3b8',
              fontSize: isMobile ? '16px' : '15px',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '48px',
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockModal;
