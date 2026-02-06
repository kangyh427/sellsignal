'use client';

import React, { useState } from 'react';
import type { StockModalProps, Stock, Position, FormState } from '../types';
import { SELL_PRESETS, STOCK_LIST } from '../constants';

// ============================================
// StockModal 컴포넌트
// ============================================
const StockModal: React.FC<StockModalProps> = ({ stock, onSave, onClose, isMobile }) => {
  // Form 초기값 안정화 - 모든 필드에 기본값 설정
  const [form, setForm] = useState<FormState>({
    stockCode: stock?.stock.code || '',
    buyPrice: stock?.buyPrice.toString() || '',
    quantity: stock?.quantity.toString() || '',
    buyDate: stock?.buyDate || new Date().toISOString().split('T')[0],
    selectedPresets: stock?.selectedPresets || [],
    presetSettings: stock?.presetSettings || {},
    memo: stock?.memo || '',
  });

  // 자동완성 관련 상태
  const [stockInput, setStockInput] = useState(stock ? `${stock.stock.name} (${stock.stock.code})` : '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>(STOCK_LIST);

  // 종목 입력 핸들러
  const handleStockInput = (value: string) => {
    setStockInput(value);
    setShowSuggestions(true);
    
    if (value.trim() === '') {
      setFilteredStocks(STOCK_LIST);
      setForm({ ...form, stockCode: '' });
    } else {
      const filtered = STOCK_LIST.filter((s: Stock) => 
        s.name.toLowerCase().includes(value.toLowerCase()) ||
        s.code.includes(value)
      );
      setFilteredStocks(filtered);
    }
  };

  // 종목 선택 핸들러
  const handleSelectStock = (selectedStock: Stock) => {
    setStockInput(`${selectedStock.name} (${selectedStock.code})`);
    setForm(prevForm => ({ 
      ...prevForm, 
      stockCode: selectedStock.code 
    }));
    setShowSuggestions(false);
  };

  const handleSave = () => {
    console.log('Form State:', form);
    console.log('Stock Input:', stockInput);
    
    let selectedStock = STOCK_LIST.find((s: Stock) => s.code === form.stockCode);
    
    // 리스트에 없는 종목이면 직접 입력된 것으로 처리
    if (!selectedStock && stockInput.trim() !== '') {
      const codeMatch = stockInput.match(/\(([^)]+)\)/);
      const extractedCode = codeMatch ? codeMatch[1] : '';
      
      if (extractedCode) {
        selectedStock = STOCK_LIST.find((s: Stock) => s.code === extractedCode);
      }
      
      if (!selectedStock) {
        const stockName = stockInput.replace(/\s*\([^)]*\)\s*/, '').trim() || stockInput;
        selectedStock = {
          name: stockName,
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

    console.log('Saving Position:', newPosition);
    onSave(newPosition);
  };

  const togglePreset = (presetId: string) => {
    setForm(prev => ({
      ...prev,
      selectedPresets: prev.selectedPresets.includes(presetId)
        ? prev.selectedPresets.filter((id: string) => id !== presetId)
        : [...prev.selectedPresets, presetId],
      presetSettings: {
        ...prev.presetSettings,
        [presetId]: prev.presetSettings[presetId] || { value: SELL_PRESETS[presetId].inputDefault || 0 }
      }
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '16px' : '20px',
    }}
    onClick={() => setShowSuggestions(false)}
    >
      <div style={{
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '28px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ 
          fontSize: isMobile ? '20px' : '24px', 
          fontWeight: '700', 
          color: '#fff', 
          marginBottom: '20px' 
        }}>
          {stock ? '종목 정보 수정' : '종목 추가'}
        </h2>

        {/* 종목 선택 */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
            종목 선택 (직접 입력 가능)
          </label>
          <input
            type="text"
            value={stockInput}
            onChange={(e) => handleStockInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="종목명 또는 종목코드 입력"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          
          {/* 자동완성 드롭다운 */}
          {showSuggestions && filteredStocks.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: '200px',
              overflowY: 'auto',
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              marginTop: '4px',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {filteredStocks.map((s: Stock) => (
                <div
                  key={s.code}
                  onClick={() => handleSelectStock(s)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139,92,246,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {s.name} ({s.code})
                </div>
              ))}
            </div>
          )}
          
          {/* 도움말 */}
          {stockInput && !form.stockCode && (
            <div style={{ 
              fontSize: '11px', 
              color: '#94a3b8', 
              marginTop: '4px',
              fontStyle: 'italic',
            }}>
              💡 리스트에 없는 종목도 직접 입력 가능합니다
            </div>
          )}
        </div>

        {/* 매수 정보 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              매수가
            </label>
            <input
              type="number"
              value={form.buyPrice}
              onChange={(e) => setForm(prev => ({ ...prev, buyPrice: e.target.value }))}
              placeholder="50000"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              수량
            </label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="10"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
            매수일
          </label>
          <input
            type="date"
            value={form.buyDate}
            onChange={(e) => setForm(prev => ({ ...prev, buyDate: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 매도 전략 선택 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
            매도 전략 선택
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.values(SELL_PRESETS).map((preset: any) => (
              <button
                key={preset.id}
                onClick={() => togglePreset(preset.id)}
                style={{
                  padding: '10px',
                  background: form.selectedPresets.includes(preset.id)
                    ? 'rgba(139,92,246,0.2)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${form.selectedPresets.includes(preset.id) ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>{preset.icon} {preset.name}</div>
                {preset.hasInput && form.selectedPresets.includes(preset.id) && (
                  <input
                    type="number"
                    value={form.presetSettings[preset.id]?.value ?? preset.inputDefault ?? 0}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      presetSettings: {
                        ...prev.presetSettings,
                        [preset.id]: { value: parseFloat(e.target.value) || 0 }
                      }
                    }))}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={preset.inputLabel}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '4px 8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
            메모
          </label>
          <textarea
            value={form.memo}
            onChange={(e) => setForm(prev => ({ ...prev, memo: e.target.value }))}
            placeholder="투자 근거나 메모를 입력하세요"
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
            }}
          >
            {stock ? '수정 완료' : '종목 추가'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#94a3b8',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
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
