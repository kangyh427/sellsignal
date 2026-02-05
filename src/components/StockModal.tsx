'use client'

import { useState } from 'react'
import { useResponsive } from '@/hooks'
import { SELL_PRESETS, searchStocks, findExactStock } from '@/lib/constants'
import type { Position } from '@/types'

interface StockModalProps {
  stock?: Position | null
  onSave: (stock: Position) => void
  onClose: () => void
}

export default function StockModal({ stock, onSave, onClose }: StockModalProps) {
  const { isMobile } = useResponsive()
  
  const [form, setForm] = useState<Partial<Position>>(stock || { 
    name: '', 
    code: '', 
    buyPrice: undefined, 
    quantity: undefined, 
    selectedPresets: ['candle3', 'stopLoss'], 
    presetSettings: { stopLoss: { value: -5 }, maSignal: { value: 20 } } 
  })
  const [stockQuery, setStockQuery] = useState(stock ? stock.name : '')
  const [searchResults, setSearchResults] = useState<Array<{name: string, code: string, market: string}>>([])
  const [showResults, setShowResults] = useState(false)
  const [stockFound, setStockFound] = useState(!!stock)

  const handleStockSearch = (query: string) => {
    setStockQuery(query)
    if (query.trim().length > 0) {
      const results = searchStocks(query)
      setSearchResults(results)
      setShowResults(results.length > 0)
      const exact = findExactStock(query)
      if (exact) { 
        setForm({ ...form, name: exact.name, code: exact.code })
        setStockFound(true)
      } else {
        setStockFound(false)
      }
    } else { 
      setSearchResults([])
      setShowResults(false)
      setStockFound(false)
    }
  }

  const selectStock = (stockItem: {name: string, code: string}) => { 
    setForm({ ...form, name: stockItem.name, code: stockItem.code })
    setStockQuery(stockItem.name)
    setStockFound(true)
    setShowResults(false)
  }
  
  const togglePreset = (id: string) => { 
    const current = form.selectedPresets || []
    setForm({ 
      ...form, 
      selectedPresets: current.includes(id) ? current.filter(p => p !== id) : [...current, id] 
    })
  }

  const handleSave = () => {
    if (!form.name || !form.code || !form.buyPrice || !form.quantity) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }
    onSave({ 
      id: stock?.id || Date.now(),
      name: form.name,
      code: form.code,
      buyPrice: Number(form.buyPrice), 
      quantity: Number(form.quantity), 
      highestPrice: Number(form.buyPrice),
      selectedPresets: form.selectedPresets || [],
      presetSettings: form.presetSettings || {}
    })
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.85)', 
        display: 'flex', 
        alignItems: isMobile ? 'flex-end' : 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: isMobile ? '0' : '20px' 
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ 
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', 
        borderRadius: isMobile ? '20px 20px 0 0' : '20px', 
        width: '100%',
        maxWidth: isMobile ? '100%' : '600px', 
        maxHeight: isMobile ? '95vh' : '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ 
          padding: isMobile ? '16px 20px' : '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: '700', 
            color: '#fff', 
            margin: 0 
          }}>
            {stock ? '🔍 종목 수정' : '➕ 새 종목 추가'}
          </h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '8px 16px', 
              color: '#fff', 
              fontSize: '14px',
              cursor: 'pointer',
              minHeight: '40px'
            }}
          >닫기</button>
        </div>
        
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: isMobile ? '16px 20px' : '20px 24px' 
        }}>
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: '#94a3b8', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>종목명 또는 종목코드 *</label>
            <input 
              type="text" 
              value={stockQuery} 
              onChange={e => handleStockSearch(e.target.value)} 
              onFocus={() => searchResults.length > 0 && setShowResults(true)} 
              placeholder="예: 삼성전자 또는 005930" 
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                background: 'rgba(255,255,255,0.05)', 
                border: stockFound ? '2px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.15)', 
                borderRadius: showResults ? '12px 12px 0 0' : '12px', 
                color: '#fff', 
                fontSize: '16px', 
                outline: 'none', 
                boxSizing: 'border-box' 
              }} 
            />
            {showResults && searchResults.length > 0 && (
              <div style={{ 
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
                zIndex: 100 
              }}>
                {searchResults.map((result, idx) => (
                  <div 
                    key={result.code} 
                    onClick={() => selectStock(result)} 
                    style={{ 
                      padding: '14px 16px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer', 
                      borderBottom: idx < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>{result.name}</span>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>{result.code} · {result.market}</span>
                  </div>
                ))}
              </div>
            )}
            {stockFound && form.name && (
              <div style={{ 
                marginTop: '8px', 
                fontSize: '13px', 
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✓ {form.name} ({form.code}) 선택됨
              </div>
            )}
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: '12px', 
            marginBottom: '20px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                color: '#94a3b8', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>매수가 (원) *</label>
              <input 
                type="number" 
                value={form.buyPrice || ''} 
                onChange={e => setForm({ ...form, buyPrice: e.target.value ? Number(e.target.value) : undefined })} 
                placeholder="72000" 
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.15)', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '16px', 
                  outline: 'none', 
                  boxSizing: 'border-box' 
                }} 
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                color: '#94a3b8', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>수량 (주) *</label>
              <input 
                type="number" 
                value={form.quantity || ''} 
                onChange={e => setForm({ ...form, quantity: e.target.value ? Number(e.target.value) : undefined })} 
                placeholder="100" 
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.15)', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '16px', 
                  outline: 'none', 
                  boxSizing: 'border-box' 
                }} 
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              color: '#fff', 
              display: 'block', 
              marginBottom: '12px' 
            }}>📚 매도의 기술 조건 선택</label>
            <div style={{ 
              fontSize: '12px', 
              color: '#f59e0b', 
              marginBottom: '12px', 
              background: 'rgba(245,158,11,0.1)', 
              padding: '10px 12px', 
              borderRadius: '8px',
              lineHeight: '1.5'
            }}>
              ⚠️ 아래 기본값은 예시일 뿐입니다. 반드시 본인의 투자 원칙에 따라 수정하십시오.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.values(SELL_PRESETS).map(preset => {
                const isSelected = (form.selectedPresets || []).includes(preset.id)
                return (
                  <div 
                    key={preset.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: isMobile ? '14px' : '14px 16px', 
                      background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', 
                      border: isSelected ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                    }} 
                    onClick={() => togglePreset(preset.id)}
                  >
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '6px', 
                      background: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '14px', 
                      color: '#fff',
                      flexShrink: 0
                    }}>
                      {isSelected && '✓'}
                    </div>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{preset.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{preset.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{preset.description}</div>
                    </div>
                    {preset.hasInput && isSelected && (
                      <input 
                        type="number" 
                        value={form.presetSettings?.[preset.id]?.value ?? preset.inputDefault} 
                        onChange={e => { 
                          e.stopPropagation()
                          setForm({ 
                            ...form, 
                            presetSettings: { ...form.presetSettings, [preset.id]: { value: Number(e.target.value) } } 
                          })
                        }} 
                        onClick={e => e.stopPropagation()} 
                        style={{ 
                          width: '70px', 
                          padding: '8px 10px', 
                          background: 'rgba(255,255,255,0.1)', 
                          border: '1px solid rgba(255,255,255,0.2)', 
                          borderRadius: '8px', 
                          color: '#fff', 
                          fontSize: '14px', 
                          outline: 'none', 
                          textAlign: 'center',
                          flexShrink: 0
                        }} 
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        <div style={{ 
          padding: isMobile ? '16px 20px' : '16px 24px',
          paddingBottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{ 
            padding: '10px 12px', 
            background: 'rgba(234,179,8,0.1)', 
            borderRadius: '8px', 
            marginBottom: '12px' 
          }}>
            <p style={{ fontSize: '11px', color: '#eab308', margin: 0, lineHeight: '1.5' }}>
              ⚠️ 본 알람은 사용자가 직접 선택한 기술적 조건에 따른 단순 정보 제공이며, 투자자문이나 투자권유가 아닙니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onClose} 
              style={{ 
                flex: 1, 
                padding: '16px', 
                background: 'rgba(255,255,255,0.1)', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff', 
                fontSize: '16px', 
                cursor: 'pointer',
                minHeight: '52px'
              }}
            >취소</button>
            <button 
              onClick={handleSave}
              disabled={!form.name || !form.code || !form.buyPrice || !form.quantity}
              style={{ 
                flex: 1, 
                padding: '16px', 
                background: (form.name && form.code && form.buyPrice && form.quantity) 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                  : 'rgba(100,116,139,0.3)', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#fff', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: (form.name && form.code && form.buyPrice && form.quantity) ? 'pointer' : 'not-allowed',
                minHeight: '52px',
                opacity: (form.name && form.code && form.buyPrice && form.quantity) ? 1 : 0.6
              }}
            >
              {stock ? '수정 완료' : '알람 설정 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
