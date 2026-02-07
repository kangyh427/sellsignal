'use client';
// ============================================
// StockModal - 종목 추가/수정 모달 (바텀시트 개선)
// 경로: src/components/StockModal.tsx
// ============================================
// 세션5 모바일 터치 UX 개선:
//   [B2] 바텀시트 슬라이드업 애니메이션 + 드래그 핸들
//   [B5] safe-area-inset 하단 여백
//   [B6] inputMode="numeric" 숫자 키패드 적용
//   [B1] 모든 인터랙티브 요소 44px 터치 타겟
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SELL_PRESETS } from '../constants';
import { useResponsive } from '../hooks/useResponsive';
import type { Position, StockInfo } from '../types';
import { searchStocks, findExactStock } from '../utils';

// ── Props 타입 정의 ──
interface StockModalProps {
  stock?: Position | null;
  onSave: (stock: any) => void;
  onClose: () => void;
}

// ── 폼 상태 타입 ──
interface FormState {
  name: string;
  code: string;
  buyPrice: string | number;
  quantity: string | number;
  selectedPresets: string[];
  presetSettings: Record<string, { value: number }>;
  id?: number;
  stock?: StockInfo;
  [key: string]: any;
}

// ============================================
// 메인 컴포넌트
// ============================================
const StockModal: React.FC<StockModalProps> = ({ stock, onSave, onClose }) => {
  const { isMobile, isTablet } = useResponsive();

  // ── 닫기 애니메이션 상태 ──
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── 드래그 상태 (모바일 바텀시트) ──
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragDeltaY, setDragDeltaY] = useState(0);

  // ── 폼 초기값 ──
  const [form, setForm] = useState<FormState>(
    stock
      ? { ...stock, buyPrice: String(stock.buyPrice), quantity: String(stock.quantity) }
      : {
          name: '',
          code: '',
          buyPrice: '',
          quantity: '',
          selectedPresets: ['candle3', 'stopLoss'],
          presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } },
        }
  );
  const [stockQuery, setStockQuery] = useState(stock ? stock.name : '');
  const [searchResults, setSearchResults] = useState<StockInfo[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [stockFound, setStockFound] = useState(!!stock);

  // ── 배경 스크롤 방지 ──
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // iOS에서 position: fixed 처리
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      const top = document.body.style.top;
      document.body.style.top = '';
      window.scrollTo(0, parseInt(top || '0') * -1);
    };
  }, []);

  // ── 애니메이션 닫기 ──
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // 애니메이션 완료 후 실제 닫기
    setTimeout(() => {
      onClose();
    }, isMobile ? 250 : 200);
  }, [onClose, isMobile]);

  // ── 드래그 핸들러 (모바일 바텀시트 드래그 닫기) ──
  const handleDragStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleDragMove = (e: React.TouchEvent) => {
    if (dragStartY === null) return;
    const deltaY = e.touches[0].clientY - dragStartY;
    // 아래로만 드래그 허용
    if (deltaY > 0) {
      setDragDeltaY(deltaY);
    }
  };

  const handleDragEnd = () => {
    if (dragDeltaY > 120) {
      // 120px 이상 드래그하면 닫기
      handleClose();
    }
    setDragStartY(null);
    setDragDeltaY(0);
  };

  // ── 종목 검색 ──
  const handleStockSearch = (query: string) => {
    setStockQuery(query);
    if (query.trim().length > 0) {
      const results = searchStocks(query);
      setSearchResults(results);
      setShowResults(results.length > 0);
      const exact = findExactStock(query);
      if (exact) {
        setForm({ ...form, name: exact.name, code: exact.code });
        setStockFound(true);
      } else {
        setStockFound(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
      setStockFound(false);
    }
  };

  // ── 종목 선택 ──
  const selectStock = (stockItem: StockInfo) => {
    setForm({ ...form, name: stockItem.name, code: stockItem.code, stock: stockItem });
    setStockQuery(stockItem.name);
    setStockFound(true);
    setShowResults(false);
  };

  // ── 프리셋 토글 ──
  const togglePreset = (id: string) => {
    const current = form.selectedPresets || [];
    setForm({
      ...form,
      selectedPresets: current.includes(id) ? current.filter((p: string) => p !== id) : [...current, id],
    });
  };

  // ── 저장 처리 ──
  const handleSave = () => {
    if (!form.name || !form.code || !form.buyPrice || !form.quantity) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    onSave({
      ...form,
      id: stock?.id || Date.now(),
      buyPrice: Number(form.buyPrice),
      quantity: Number(form.quantity),
      highestPrice: Number(form.buyPrice),
    });
  };

  // ── 필수값 검증 ──
  const isFormValid = !!(form.name && form.code && form.buyPrice && form.quantity);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '0' : '20px',
        // 애니메이션
        animation: isClosing
          ? 'fadeOut 0.2s ease-in forwards'
          : 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        ref={contentRef}
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: isMobile ? '20px 20px 0 0' : '20px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '600px',
          maxHeight: isMobile ? '95vh' : '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255,255,255,0.1)',
          // 바텀시트 애니메이션 + 드래그
          animation: isMobile
            ? isClosing
              ? 'slideDown 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards'
              : 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
            : isClosing
              ? 'fadeOut 0.2s ease-in forwards'
              : 'fadeIn 0.25s ease-out',
          transform: dragDeltaY > 0 ? `translateY(${dragDeltaY}px)` : undefined,
          transition: dragDeltaY > 0 ? 'none' : undefined,
        }}
      >
        {/* ── [B2] 드래그 핸들 (모바일 전용) ── */}
        {isMobile && (
          <div
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{
              padding: '8px 0 4px',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                margin: '0 auto',
              }}
            />
          </div>
        )}

        {/* ── 헤더 ── */}
        <div
          style={{
            padding: isMobile ? '12px 20px 16px' : '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: '#fff',
              margin: 0,
            }}
          >
            {stock ? '📝 종목 수정' : '➕ 새 종목 추가'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              // [B1] 터치 타겟 44px 보장
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            닫기
          </button>
        </div>

        {/* ── 스크롤 영역 ── */}
        <div
          className="scroll-container"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: isMobile ? '16px 20px' : '20px 24px',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {/* ── 종목 검색 ── */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#94a3b8',
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              종목명 또는 종목코드 *
            </label>
            <input
              type="text"
              value={stockQuery}
              onChange={(e) => handleStockSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="예: 삼성전자 또는 005930"
              // [B6] enterKeyHint로 모바일 키보드 '검색' 버튼 표시
              enterKeyHint="search"
              autoComplete="off"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: stockFound
                  ? '2px solid rgba(16,185,129,0.5)'
                  : '1px solid rgba(255,255,255,0.15)',
                borderRadius: showResults ? '12px 12px 0 0' : '12px',
                color: '#fff',
                // [B6] iOS 줌 방지: 반드시 16px 이상
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                // [B1] 터치 타겟 44px 보장
                minHeight: '48px',
              }}
            />
            {/* 검색 결과 드롭다운 */}
            {showResults && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 100,
                }}
              >
                {searchResults.map((result, idx) => (
                  <div
                    key={result.code}
                    onClick={() => selectStock(result)}
                    style={{
                      // [B1] 검색결과 항목도 44px 터치 타겟
                      padding: '14px 16px',
                      minHeight: '48px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderBottom:
                        idx < searchResults.length - 1
                          ? '1px solid rgba(255,255,255,0.05)'
                          : 'none',
                      // 터치 피드백
                      transition: 'background 0.15s',
                    }}
                    // 모바일에서는 hover 대신 active 사용
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background =
                        'rgba(255,255,255,0.05)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background = 'transparent')
                    }
                  >
                    <span style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>
                      {result.name}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>
                      {result.code} · {result.market}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {/* 선택 완료 표시 */}
            {stockFound && form.name && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ✓ {form.name} ({form.code}) 선택됨
              </div>
            )}
          </div>

          {/* ── 매수가, 수량 ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {/* 매수가 */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: '#94a3b8',
                  marginBottom: '8px',
                  fontWeight: '500',
                }}
              >
                매수가 (원) *
              </label>
              <input
                // [B6] inputMode="numeric"으로 모바일 숫자 키패드 표시
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.buyPrice}
                onChange={(e) => {
                  // 숫자만 허용
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setForm({ ...form, buyPrice: val });
                }}
                placeholder="72000"
                enterKeyHint="next"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '48px',
                }}
              />
            </div>
            {/* 수량 */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: '#94a3b8',
                  marginBottom: '8px',
                  fontWeight: '500',
                }}
              >
                수량 (주) *
              </label>
              <input
                // [B6] 수량도 숫자 키패드
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.quantity}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setForm({ ...form, quantity: val });
                }}
                placeholder="100"
                enterKeyHint="done"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '48px',
                }}
              />
            </div>
          </div>

          {/* ── 매도 조건 선택 ── */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#fff',
                display: 'block',
                marginBottom: '12px',
              }}
            >
              📚 매도 조건 선택
            </label>
            <div
              style={{
                fontSize: '12px',
                color: '#f59e0b',
                marginBottom: '12px',
                background: 'rgba(245,158,11,0.1)',
                padding: '10px 12px',
                borderRadius: '8px',
                lineHeight: '1.5',
              }}
            >
              ⚠️ 아래 기본값은 예시일 뿐입니다. 반드시 본인의 투자 원칙에 따라 수정하십시오.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.values(SELL_PRESETS).map((preset: any) => {
                const isSelected = (form.selectedPresets || []).includes(preset.id);
                return (
                  <div
                    key={preset.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: isMobile ? '14px' : '14px 16px',
                      background: isSelected
                        ? 'rgba(59,130,246,0.1)'
                        : 'rgba(255,255,255,0.02)',
                      border: isSelected
                        ? '1px solid rgba(59,130,246,0.3)'
                        : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      // [B1] 터치 타겟 44px 보장
                      minHeight: '52px',
                    }}
                    onClick={() => togglePreset(preset.id)}
                  >
                    {/* 체크박스 */}
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && '✓'}
                    </div>
                    {/* 아이콘 */}
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{preset.icon}</span>
                    {/* 이름 & 설명 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {preset.description}
                      </div>
                    </div>
                    {/* 커스텀 입력 (hasInput이 있고 선택된 경우) */}
                    {preset.hasInput && isSelected && (
                      <input
                        // [B6] 프리셋 값도 숫자 키패드
                        type="text"
                        inputMode="numeric"
                        pattern="-?[0-9]*"
                        value={form.presetSettings?.[preset.id]?.value ?? preset.inputDefault}
                        onChange={(e) => {
                          e.stopPropagation();
                          // 음수 허용 (손절 기준)
                          const val = e.target.value.replace(/[^0-9\-]/g, '');
                          setForm({
                            ...form,
                            presetSettings: {
                              ...form.presetSettings,
                              [preset.id]: { value: Number(val) || 0 },
                            },
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '70px',
                          padding: '8px 10px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '16px',
                          outline: 'none',
                          textAlign: 'center',
                          flexShrink: 0,
                          // [B1] 터치 타겟
                          minHeight: '44px',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 하단 고정 버튼 영역 ── */}
        <div
          style={{
            padding: isMobile ? '16px 20px' : '16px 24px',
            // [B5] safe-area 하단 여백
            paddingBottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : '16px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          {/* 면책조항 */}
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(234,179,8,0.1)',
              borderRadius: '8px',
              marginBottom: '12px',
            }}
          >
            <p style={{ fontSize: '11px', color: '#eab308', margin: 0, lineHeight: '1.5' }}>
              ⚠️ 본 알람은 사용자가 직접 선택한 기술적 조건에 따른 단순 정보 제공이며, 투자자문이나
              투자권유가 아닙니다.
            </p>
          </div>
          {/* 버튼 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                // [B1] 터치 타겟 52px
                minHeight: '52px',
              }}
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              style={{
                flex: 1,
                padding: '16px',
                background: isFormValid
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : 'rgba(100,116,139,0.3)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                minHeight: '52px',
                opacity: isFormValid ? 1 : 0.6,
              }}
            >
              {stock ? '수정 완료' : '알람 설정 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockModal;
