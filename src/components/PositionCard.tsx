# PositionCard.tsx 스와이프 삭제 통합 패치
# 경로: src/components/PositionCard.tsx
# 세션 26B: useSwipeToDelete 통합

## 패치 1: import 추가 (파일 상단, 기존 import 뒤)

```typescript
// 기존 import들 아래에 추가:
import useSwipeToDelete from '@/hooks/useSwipeToDelete';
```

## 패치 2: 컴포넌트 내부 - swipe 훅 호출 (isExpanded 선언 근처)

```typescript
// 기존 코드:
const [isExpanded, setIsExpanded] = useState(!isMobile);

// 아래에 추가:
const swipe = useSwipeToDelete();
```

## 패치 3: 카드 토글 핸들러 수정

기존에 setIsExpanded를 직접 호출하는 부분을:

```typescript
// 기존: onClick={() => setIsExpanded(!isExpanded)}
// 변경:
const handleCardToggle = () => {
  if (swipe.showDeleteBtn) {
    swipe.resetSwipe();
    return;
  }
  setIsExpanded(!isExpanded);
};
```

## 패치 4: 카드 최외곽 div 래핑 (return 부분)

기존 카드 최외곽 `<div>` 를 스와이프 래퍼로 감쌈:

```tsx
// 기존: <div style={{ background: 'linear-gradient(145deg, ...)', borderRadius: '14px', ... }}>
// 변경: 아래 구조로 래핑

{/* 스와이프 삭제 래퍼 */}
<div style={{
  position: 'relative',
  marginBottom: isMobile ? '10px' : '12px',
  overflow: 'hidden',
  borderRadius: '14px',
}}>
  {/* 삭제 버튼 배경 (모바일 전용) */}
  {isMobile && (
    <div style={{
      position: 'absolute',
      top: 0, right: 0, bottom: 0, width: '80px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '0 14px 14px 0',
      zIndex: 0,
    }}>
      <button
        onClick={() => { swipe.resetSwipe(); onDelete(position.id); }}
        style={{
          background: 'transparent', border: 'none', color: '#fff',
          fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        }}
      >
        <span style={{ fontSize: '20px' }}>🗑️</span>삭제
      </button>
    </div>
  )}

  {/* 기존 카드 콘텐츠 */}
  <div
    onTouchStart={isMobile ? swipe.handleTouchStart : undefined}
    onTouchMove={isMobile ? swipe.handleTouchMove : undefined}
    onTouchEnd={isMobile ? swipe.handleTouchEnd : undefined}
    style={{
      position: 'relative',
      zIndex: 1,
      transform: isMobile ? `translateX(${swipe.swipeOffset}px)` : 'none',
      transition: (swipe.swipeOffset === 0 || swipe.showDeleteBtn)
        ? 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
      /* 기존 카드 스타일은 그대로 유지 */
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      borderRadius: '14px',
      border: /* 시그널 레벨에 따른 기존 border 로직 유지 */
    }}
  >
    {/* 기존 카드 내용 전체 */}
    ...
    
    {/* 펼친 카드 하단에 스와이프 힌트 추가 */}
    {isMobile && isExpanded && (
      <div style={{
        textAlign: 'center', marginTop: '10px',
        fontSize: '10px', color: '#475569',
      }}>
        ← 좌측으로 스와이프하여 삭제
      </div>
    )}
  </div>
</div>
```

## 요약: 변경 범위
| 항목 | 변경 내용 |
|------|-----------|
| import | `useSwipeToDelete` 추가 (1줄) |
| 훅 호출 | `const swipe = useSwipeToDelete()` (1줄) |
| 핸들러 | `handleCardToggle` 래퍼 함수 (5줄) |
| JSX | 최외곽 div → 스와이프 래퍼로 감싸기 (~20줄 추가) |
| 힌트 텍스트 | 펼친 카드 하단에 스와이프 안내 (3줄) |
