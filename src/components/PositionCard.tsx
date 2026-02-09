// ============================================
// PositionCard.tsx 수정 패치 (세션 43)
// 경로: src/components/PositionCard.tsx
// 
// 수정 위치: 95~123줄 (sellPrices 계산 블록)
// 수정 내용: maSignal, trendline case 삭제
// 이유: 
//   - maSignal: 수평 매도선 → 차트 위 MA 곡선 오버레이로 대체 (Y축 왜곡 방지)
//   - trendline: 고정 수평선(buyPrice*0.95) → 저점 선형회귀 대각선으로 대체
// ============================================

// ─────────────────────────────────────────────
// [변경 전] 95~123줄 전체
// ─────────────────────────────────────────────
/*
  // ── 매도가 계산 ──
  const sellPrices: Record<string, number> = {};
  (position.selectedPresets || []).forEach((pid) => {
    const setting = position.presetSettings?.[pid]?.value;
    switch (pid) {
      case 'stopLoss':
        sellPrices.stopLoss = Math.round(position.buyPrice * (1 + (setting || -5) / 100));
        break;
      case 'twoThird': {
        const hp = position.highestPrice || cur;
        sellPrices.twoThird = Math.round(hp - (hp - position.buyPrice) / 3);
        break;
      }
      case 'maSignal': {                          // ← 삭제 대상
        if (priceData?.length) {                   // ← 삭제 대상
          const mp = setting || 20;                // ← 삭제 대상
          const rd = priceData.slice(-mp);         // ← 삭제 대상
          sellPrices.maSignal = Math.round(...);   // ← 삭제 대상
        }                                          // ← 삭제 대상
        break;                                     // ← 삭제 대상
      }                                            // ← 삭제 대상
      case 'volumeZone':
        sellPrices.volumeZone = Math.round(position.buyPrice * 1.10);
        break;
      case 'trendline':                            // ← 삭제 대상
        sellPrices.trendline = Math.round(position.buyPrice * 0.95);  // ← 삭제 대상
        break;                                     // ← 삭제 대상
    }
  });
*/

// ─────────────────────────────────────────────
// [변경 후] 95~123줄 → 아래로 교체
// ─────────────────────────────────────────────

  // ── 매도가 계산 (세션 43 수정) ──
  // ★ maSignal: 수평 매도선 제거 → 차트에 MA 곡선 오버레이로 표시
  // ★ trendline: 수평선 제거 → 차트에 저점 선형회귀 대각선으로 표시
  // 이 두 값이 sellPrices에 포함되면 Y축 범위가 왜곡됨
  const sellPrices: Record<string, number> = {};
  (position.selectedPresets || []).forEach((pid) => {
    const setting = position.presetSettings?.[pid]?.value;
    switch (pid) {
      case 'stopLoss':
        sellPrices.stopLoss = Math.round(position.buyPrice * (1 + (setting || -5) / 100));
        break;
      case 'twoThird': {
        const hp = position.highestPrice || cur;
        sellPrices.twoThird = Math.round(hp - (hp - position.buyPrice) / 3);
        break;
      }
      // ★ maSignal case 삭제됨 (차트에서 곡선 오버레이로 표시)
      case 'volumeZone':
        sellPrices.volumeZone = Math.round(position.buyPrice * 1.10);
        break;
      // ★ trendline case 삭제됨 (차트에서 대각선으로 표시)
    }
  });
