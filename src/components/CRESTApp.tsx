// ============================================
// CRESTApp.tsx 수정 패치 (세션 43)
// 경로: src/components/CRESTApp.tsx
// 
// 수정 위치: 70~81줄 (모의 데이터 생성 useEffect)
// 수정 내용: generateMockPriceData 호출 시 currentPrice 추가
// ============================================

// ─────────────────────────────────────────────
// [변경 전] 70~81줄
// ─────────────────────────────────────────────
/*
    if (positions.length === 0) return;
    const d: Record<number, any[]> = {};
    positions.forEach((p) => {
      // 이미 데이터가 있으면 재생성하지 않음
      if (!priceDataMap[p.id]) {
        d[p.id] = generateMockPriceData(p.buyPrice, 60);    // ← 수정 대상
      } else {
        d[p.id] = priceDataMap[p.id];
      }
    });
    setPriceDataMap(d);
  }, [positions]);
*/

// ─────────────────────────────────────────────
// [변경 후] 70~81줄 → 아래로 교체
// ─────────────────────────────────────────────

    if (positions.length === 0) return;
    const d: Record<number, any[]> = {};
    positions.forEach((p) => {
      // 이미 데이터가 있으면 재생성하지 않음
      if (!priceDataMap[p.id]) {
        // ★ 세션 43 수정: currentPrice 앵커링 추가
        // stockPrices에서 실시간 가격을 가져오되, 없으면 매수가 사용
        const curPrice = stockPrices?.[p.code]?.price || p.buyPrice;
        d[p.id] = generateMockPriceData(p.buyPrice, curPrice, 60);
      } else {
        d[p.id] = priceDataMap[p.id];
      }
    });
    setPriceDataMap(d);
  }, [positions]);

// ─────────────────────────────────────────────
// ★ 주의: useEffect 의존성 배열에 stockPrices 추가 여부
// ─────────────────────────────────────────────
// stockPrices를 의존성에 넣으면 가격이 바뀔 때마다 mock 데이터가 
// 재생성되므로, 현재 구조에서는 넣지 않는 것이 좋습니다.
// 실제 API 연동 후에는 generateMockPriceData 자체가 필요 없어집니다.
