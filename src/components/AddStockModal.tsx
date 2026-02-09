'use client';
// ============================================
// AddStockModal - 종목 추가 모달 (풀기능)
// 경로: src/components/AddStockModal.tsx
// 세션 19: 종목 검색 → 선택 → 매수정보 입력 → 추가
// 세션 28: 모바일 바텀시트 최적화
//   - 드래그로 닫기 (아래로 스와이프)
//   - iOS safe-area 하단 패딩
//   - 터치 타겟 44px 보장
//   - 키보드 대응 (visualViewport)
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

// 검색 결과 타입
interface StockResult {
  id: number;
  code: string;
  name: string;
  name_en: string | null;
  market: string;
  country: string;
}

interface AddStockModalProps {
  isMobile: boolean;
  maxFreePositions: number;
  currentPositionCount: number;
  isPremium: boolean;
  onClose: () => void;
  onAdd: (stock: {
    name: string;
    code: string;
    buyPrice: number;
    quantity: number;
    market: string;
    country: string;
  }) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({
  isMobile, maxFreePositions, currentPositionCount, isPremium, onClose, onAdd,
}) => {
  // ── 상태 ──
  const [step, setStep] = useState<'search' | 'detail'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockResult | null>(null);
  const [countryFilter, setCountryFilter] = useState<'ALL' | 'KR' | 'US'>('ALL');

  // 매수 정보 입력
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ★ 세션 28: 드래그로 닫기 상태
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // 모달 열릴 때 검색 입력에 포커스
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  // ── 검색 (디바운스 300ms) ──
  const doSearch = useCallback(async (query: string) => {
    if (query.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const country = countryFilter === 'ALL' ? '' : `&country=${countryFilter}`;
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}${country}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [countryFilter]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, doSearch]);

  // ── 종목 선택 ──
  const handleSelectStock = (stock: StockResult) => {
    setSelectedStock(stock);
    setStep('detail');
    setError('');
  };

  // ── 종목 추가 ──
  const handleAdd = () => {
    const price = Number(buyPrice.replace(/,/g, ''));
    const qty = Number(quantity.replace(/,/g, ''));

    if (!price || price <= 0) {
      setError('매수가를 올바르게 입력해 주세요');
      return;
    }
    if (!qty || qty <= 0 || !Number.isInteger(qty)) {
      setError('수량을 올바르게 입력해 주세요 (정수)');
      return;
    }
    if (!selectedStock) return;

    onAdd({
      name: selectedStock.name,
      code: selectedStock.code,
      buyPrice: price,
      quantity: qty,
      market: selectedStock.market,
      country: selectedStock.country,
    });
    onClose();
  };

  // ── 숫자 포맷 (콤마) ──
  const formatNumber = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString() : '';
  };

  // ── 남은 종목 수 ──
  const remaining = maxFreePositions - currentPositionCount;
  const canAdd = isPremium || remaining > 0;

  // ★ 세션 28: 드래그로 닫기 핸들러 (모바일 전용)
  const handleDragStart = (e: React.TouchEvent) => {
    // 스크롤 영역 내부에서는 드래그 금지
    const target = e.target as HTMLElement;
    if (target.closest('[data-scroll-area]')) return;
    dragStartY.current = e.touches[0].clientY;
  };

  const handleDragMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    // 아래로만 드래그 허용
    if (dy > 0) setDragY(dy);
  };

  const handleDragEnd = () => {
    if (dragY > 100) {
      // 충분히 아래로 드래그 → 닫기
      onClose();
    } else {
      // 부족 → 원위치
      setDragY(0);
    }
    dragStartY.current = null;
  };

  // ── 공통 스타일 ──
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: isMobile ? '14px 16px' : '12px 14px',
    fontSize: isMobile ? '16px' : '15px', // ★ iOS zoom 방지: 16px 이상
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      onClick={(e) => (e.target as HTMLElement) === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: `rgba(0,0,0,${Math.max(0.7 - dragY * 0.003, 0)})`,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: dragY === 0 ? 'background 0.3s' : 'none',
      }}
    >
      <div
        ref={sheetRef}
        onTouchStart={isMobile ? handleDragStart : undefined}
        onTouchMove={isMobile ? handleDragMove : undefined}
        onTouchEnd={isMobile ? handleDragEnd : undefined}
        style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          borderRadius: isMobile ? '20px 20px 0 0' : '20px',
          padding: isMobile ? '16px 20px' : '24px',
          // ★ iOS safe-area 대응
          paddingBottom: isMobile ? 'max(20px, env(safe-area-inset-bottom, 16px))' : '24px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '480px',
          maxHeight: isMobile ? '90vh' : '80vh',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column' as const,
          overflow: 'hidden',
          // ★ 드래그 transform
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
        }}
      >
        {/* ★ 모바일 드래그 바 (시각적 + 터치 영역 확대) */}
        {isMobile && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            padding: '4px 0 12px', cursor: 'grab',
          }}>
            <div style={{
              width: '40px', height: '5px',
              background: 'rgba(255,255,255,0.25)',
              borderRadius: '3px',
            }} />
          </div>
        )}

        {/* 헤더 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step === 'detail' && (
              <button onClick={() => { setStep('search'); setError(''); }} style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px',
                // ★ 터치 타겟 44px 보장
                width: '40px', height: '40px', minWidth: '44px', minHeight: '44px',
                color: '#94a3b8', fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>←</button>
            )}
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
              {step === 'search' ? '종목 추가' : '매수 정보 입력'}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px',
            // ★ 터치 타겟 44px 보장
            width: '40px', height: '40px', minWidth: '44px', minHeight: '44px',
            color: '#94a3b8', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* ═══ Step 1: 종목 검색 ═══ */}
        {step === 'search' && (
          <>
            {/* 국가 필터 탭 */}
            <div style={{
              display: 'flex', gap: '4px', marginBottom: '12px',
              background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px',
            }}>
              {([
                { key: 'ALL', label: '전체' },
                { key: 'KR', label: '🇰🇷 한국' },
                { key: 'US', label: '🇺🇸 미국' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCountryFilter(key)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    // ★ 터치 타겟 44px 보장
                    minHeight: '44px',
                    borderRadius: '8px',
                    border: 'none',
                    background: countryFilter === key
                      ? 'rgba(59,130,246,0.2)' : 'transparent',
                    color: countryFilter === key ? '#60a5fa' : '#64748b',
                    fontSize: '13px',
                    fontWeight: countryFilter === key ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >{label}</button>
              ))}
            </div>

            {/* 검색 입력 */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="종목명 또는 코드 검색"
                style={{
                  ...inputStyle,
                  paddingLeft: '42px',
                  paddingRight: loading ? '80px' : '14px',
                }}
              />
              <span style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', fontSize: '16px', color: '#64748b',
              }}>🔍</span>
              {loading && (
                <span style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', fontSize: '12px', color: '#64748b',
                }}>검색 중...</span>
              )}
            </div>

            {/* 검색 결과 */}
            <div data-scroll-area style={{
              flex: 1, overflowY: 'auto',
              minHeight: '200px', maxHeight: '400px',
              // ★ 스크롤 관성 (iOS)
              WebkitOverflowScrolling: 'touch' as any,
            }}>
              {searchQuery.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>
                    종목명 또는 코드를 입력하세요
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {isPremium ? 'PRO: 무제한 종목 추가' : `무료: ${remaining}종목 추가 가능 (${currentPositionCount}/${maxFreePositions})`}
                  </div>
                </div>
              )}

              {searchQuery.length > 0 && results.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔎</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    '{searchQuery}'에 대한 검색 결과가 없습니다
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                    종목명 또는 종목코드를 다시 확인해 주세요
                  </div>
                </div>
              )}

              {results.map((stock) => (
                <button
                  key={`${stock.country}-${stock.code}`}
                  onClick={() => canAdd ? handleSelectStock(stock) : undefined}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px 16px' : '12px 14px',
                    // ★ 터치 타겟 44px 보장
                    minHeight: '52px',
                    marginBottom: '4px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s',
                    opacity: canAdd ? 1 : 0.5,
                    textAlign: 'left' as const,
                  }}
                  onMouseEnter={(e) => canAdd && (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                        {stock.name}
                      </span>
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        background: stock.country === 'KR' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                        color: stock.country === 'KR' ? '#60a5fa' : '#34d399',
                        fontWeight: '600',
                      }}>{stock.market}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {stock.code} {stock.name_en && stock.name_en !== stock.name ? `· ${stock.name_en}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '18px', color: '#475569' }}>›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ═══ Step 2: 매수 정보 입력 ═══ */}
        {step === 'detail' && selectedStock && (
          <div>
            {/* 선택된 종목 정보 */}
            <div style={{
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: '12px', padding: '14px', marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  background: selectedStock.country === 'KR' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                  color: selectedStock.country === 'KR' ? '#60a5fa' : '#34d399',
                  fontWeight: '600',
                }}>{selectedStock.market}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{selectedStock.code}</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
                {selectedStock.name}
              </div>
              {selectedStock.name_en && selectedStock.name_en !== selectedStock.name && (
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {selectedStock.name_en}
                </div>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
                fontSize: '13px', color: '#f87171',
              }}>⚠️ {error}</div>
            )}

            {/* 매수가 입력 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
                매수가 {selectedStock.country === 'KR' ? '(원)' : '(USD)'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={buyPrice}
                onChange={(e) => setBuyPrice(formatNumber(e.target.value))}
                placeholder={selectedStock.country === 'KR' ? '예: 71,500' : '예: 180.50'}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* 수량 입력 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
                수량 (주)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(formatNumber(e.target.value))}
                placeholder="예: 100"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* 투자금액 미리보기 */}
            {buyPrice && quantity && (
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                padding: '12px', marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>총 투자금액</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa' }}>
                    {selectedStock.country === 'KR' ? '₩' : '$'}
                    {(Number(buyPrice.replace(/,/g, '')) * Number(quantity.replace(/,/g, ''))).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* 추가 버튼 */}
            <button
              onClick={handleAdd}
              disabled={!buyPrice || !quantity}
              style={{
                width: '100%',
                padding: isMobile ? '16px' : '14px',
                // ★ 터치 타겟 48px 보장
                minHeight: '48px',
                border: 'none',
                borderRadius: '12px',
                background: !buyPrice || !quantity
                  ? 'rgba(59,130,246,0.3)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '700',
                cursor: !buyPrice || !quantity ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              포지션 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStockModal;
