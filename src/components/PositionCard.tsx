// ============================================
// PositionCard 메인 컴포넌트 (리팩터링)
// 위치: src/components/PositionCard.tsx
// ============================================
// 원본: 681줄 → 리팩터링 후: ~150줄 (78% 절감)
// 내부 타입 제거 → types/index.ts 사용
// 서브 렌더링 함수 → 독립 서브컴포넌트로 추출
// calculateSellPrices → utils/ 로 이동

'use client';

import React, { useState, useCallback } from 'react';
import type { Position, PriceData, VisibleLines, PositionCardProps } from '../types';
import { useResponsive } from '../hooks/useResponsive';
import { PROFIT_STAGES } from '../constants';
import { calculateSellPrices } from '../utils/calculateSellPrices';
import EarningsWidget from './EarningsWidget';
import AINewsPopup from './AINewsPopup';
import AIReportPopup from './AIReportPopup';

// 서브컴포넌트
import {
  PositionCardHeader,
  PositionCardPriceInfo,
  PositionCardStrategy,
  PositionCardChart,
} from './position';

// ============================================
// PositionCard 컴포넌트
// ============================================
const PositionCard: React.FC<PositionCardProps> = ({
  position,
  priceData,
  onEdit,
  onDelete,
  isPremium,
  onUpgrade,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // ── 상태 ──
  const [visibleLines, setVisibleLines] = useState<VisibleLines>({
    stopLoss: true,
    twoThird: true,
    maSignal: true,
    candle3_50: true,
  });
  const [showAINews, setShowAINews] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);

  // ── 파생 데이터 계산 ──
  const currentPrice = priceData?.[priceData.length - 1]?.close || position.buyPrice;
  const profitRate = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
  const profitAmount = (currentPrice - position.buyPrice) * position.quantity;
  const totalValue = currentPrice * position.quantity;
  const isProfit = profitRate >= 0;
  const sellPrices = calculateSellPrices(position, priceData, position.presetSettings);

  // 수익 단계 판별
  const getStage = () => {
    if (profitRate < 0) return { ...PROFIT_STAGES.initial, label: '손실 구간', color: '#ef4444' };
    if (profitRate < 5) return PROFIT_STAGES.initial;
    if (profitRate < 10) return PROFIT_STAGES.profit5;
    return PROFIT_STAGES.profit10;
  };
  const stage = getStage();

  // 종목코드 추출 (중첩/평탄 구조 모두 지원)
  const stockCode = position.stock?.code || position.code || '';

  // 외부 링크
  const naverStockUrl = `https://finance.naver.com/item/main.naver?code=${stockCode}`;
  const naverChartUrl = `https://finance.naver.com/item/fchart.naver?code=${stockCode}`;

  // 차트 라인 토글 핸들러
  const handleToggleLine = useCallback((lineKey: string) => {
    setVisibleLines((prev) => ({
      ...prev,
      [lineKey]: !prev[lineKey as keyof VisibleLines],
    }));
  }, []);

  // ============================================
  // 렌더링
  // ============================================
  return (
    <>
      <div
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: isMobile ? '12px' : '14px',
          padding: isMobile ? '12px' : '16px',
          marginBottom: isMobile ? '12px' : '14px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* 1. 헤더: 종목명 + 코드 + 단계 + 버튼 */}
        <PositionCardHeader
          position={position}
          stage={stage}
          naverStockUrl={naverStockUrl}
          isMobile={isMobile}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {/* 2. 메인 콘텐츠 (모바일: 세로 스택 / 데스크탑: 2컬럼) */}
        <div
          style={{
            display: isMobile ? 'flex' : 'grid',
            flexDirection: isMobile ? 'column' : undefined,
            gridTemplateColumns: isMobile
              ? undefined
              : isTablet
                ? '1fr 250px'
                : '1fr 280px',
            gap: '12px',
            alignItems: 'stretch',
          }}
        >
          {/* 좌측: 가격 정보 + 평가손익 + 매도 조건 + 실적 위젯 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <PositionCardPriceInfo
              buyPrice={position.buyPrice}
              currentPrice={currentPrice}
              quantity={position.quantity}
              totalValue={totalValue}
              profitRate={profitRate}
              profitAmount={profitAmount}
              isProfit={isProfit}
              isMobile={isMobile}
            />
            <PositionCardStrategy
              position={position}
              currentPrice={currentPrice}
              sellPrices={sellPrices}
              visibleLines={visibleLines}
              onToggleLine={handleToggleLine}
              onEdit={onEdit}
              isMobile={isMobile}
            />
            <EarningsWidget
              position={position}
              isPremium={isPremium}
              onShowAINews={() => setShowAINews(true)}
              onShowAIReport={() => setShowAIReport(true)}
            />
          </div>

          {/* 우측: 차트 */}
          <PositionCardChart
            priceData={priceData}
            buyPrice={position.buyPrice}
            sellPrices={sellPrices}
            visibleLines={visibleLines}
            naverChartUrl={naverChartUrl}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </div>
      </div>

      {/* AI 팝업 모달 */}
      {showAINews && (
        <AINewsPopup
          position={position}
          onClose={() => setShowAINews(false)}
          isPremium={isPremium}
          onUpgrade={onUpgrade}
        />
      )}
      {showAIReport && (
        <AIReportPopup
          position={position}
          onClose={() => setShowAIReport(false)}
          isPremium={isPremium}
          onUpgrade={onUpgrade}
        />
      )}
    </>
  );
};

export default PositionCard;
