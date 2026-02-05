# 매도의 기술 앱 - 오류 수정 가이드

## 🚨 발견된 주요 오류

### 1. **TypeScript 타입 오류 (빌드 블로킹)**
```
Type error: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
```

**위치:** `calculateDDay` 함수 (Line 156)

**원인:** `new Date(dateStr) - new Date()`는 TypeScript에서 Date 객체 간 직접 연산을 허용하지 않음

**수정:**
```typescript
// ❌ 잘못된 코드
const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

// ✅ 올바른 코드  
const diff = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
```

---

### 2. **Props 타입 미정의 (빌드 블로킹)**

**문제:** 모든 컴포넌트의 props가 암묵적 `any` 타입

**수정 필요 컴포넌트:**
- ResponsiveHeader
- ResponsiveSummaryCards  
- EnhancedCandleChart
- MarketCycleWidget
- EarningsWidget
- PositionCard
- AlertCard
- SellMethodGuide
- StockModal
- AINewsPopup
- AIReportPopup

**수정 예시:**
```typescript
// ❌ 잘못된 코드
const ResponsiveHeader = ({ alerts, isPremium, onShowUpgrade, onShowAddModal }) => {

// ✅ 올바른 코드
interface ResponsiveHeaderProps {
  alerts: Alert[];
  isPremium: boolean;
  onShowUpgrade: () => void;
  onShowAddModal: () => void;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ 
  alerts, 
  isPremium, 
  onShowUpgrade, 
  onShowAddModal 
}) => {
```

---

### 3. **Next.js Hydration Mismatch (런타임 오류)**

**문제:** `useResponsive` 훅이 SSR과 클라이언트에서 다른 값 반환

**원인:**
```typescript
const [windowSize, setWindowSize] = useState({
  width: typeof window !== 'undefined' ? window.innerWidth : 1200, // 서버: 1200, 클라이언트: 실제값
});
```

**수정:**
```typescript
const useResponsive = (): ResponsiveState => {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SSR 중에는 기본값 반환
  if (!mounted) {
    return {
      width: 1200,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWide: false,
    };
  }

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < BREAKPOINTS.tablet,
    isTablet: windowSize.width >= BREAKPOINTS.tablet && windowSize.width < BREAKPOINTS.desktop,
    isDesktop: windowSize.width >= BREAKPOINTS.desktop,
    isWide: windowSize.width >= BREAKPOINTS.wide,
  };
};
```

---

### 4. **제어/비제어 컴포넌트 경고**

**문제:** `StockModal`의 input이 undefined에서 값으로 변경됨

**수정:**
```typescript
// ❌ 잘못된 코드
value={form.presetSettings?.[preset.id]?.value ?? preset.inputDefault}

// ✅ 올바른 코드
value={form.presetSettings?.[preset.id]?.value ?? preset.inputDefault ?? ''}
```

---

### 5. **useEffect 의존성 배열 문제**

**문제:** `positions`가 변경될 때마다 가격 데이터가 재생성됨

**수정:**
```typescript
// ❌ 잘못된 코드
useEffect(() => {
  const newData = {};
  positions.forEach(pos => { 
    if (!priceDataMap[pos.id]) {
      newData[pos.id] = generateMockPriceData(pos.buyPrice, 60); 
    }
  });
  // ...
}, [positions]); // positions 전체를 의존성으로

// ✅ 올바른 코드
useEffect(() => {
  const newData: Record<number, PriceData[]> = {};
  const existingIds = Object.keys(priceDataMap).map(Number);
  
  positions.forEach(pos => { 
    if (!existingIds.includes(pos.id)) {
      newData[pos.id] = generateMockPriceData(pos.buyPrice, 60); 
    }
  });
  
  if (Object.keys(newData).length > 0) {
    setPriceDataMap(prev => ({ ...prev, ...newData }));
  }
}, [positions.map(p => p.id).join(',')]); // ID 목록만 의존성으로
```

---

## 📝 빠른 수정 체크리스트

### 즉시 수정 필요 (빌드 블로킹)

- [ ] Line 156: `calculateDDay` 함수에 `.getTime()` 추가
- [ ] 모든 컴포넌트에 Props 인터페이스 정의 추가
- [ ] `useResponsive` 훅에 `mounted` 상태 추가

### 권장 수정 (런타임 개선)

- [ ] input value에 기본값 보장
- [ ] useEffect 의존성 배열 최적화
- [ ] TypeScript strict mode 활성화

### 향후 개선 (코드 품질)

- [ ] 인라인 스타일을 CSS Module/Tailwind로 전환
- [ ] 컴포넌트를 별도 파일로 분리
- [ ] 상태 관리 라이브러리 도입 (Zustand/Jotai)

---

## 🛠️ 수정 적용 방법

### Option 1: 자동 수정 스크립트 (권장)

다음 세션에서 전체 파일을 자동으로 수정하겠습니다.

### Option 2: 수동 수정

1. `SellSignalApp.tsx` 파일 열기
2. 위의 각 수정사항을 해당 줄에 적용
3. TypeScript 오류가 사라질 때까지 반복

---

## 📊 진행 상황

✅ **Phase 1A 완료** (현재)
- 오류 분석 완료
- 타입 정의 파일 생성
- 수정 가이드 작성

⏳ **Phase 1B 대기 중** (다음 대화)
- 전체 파일 타입 안전 버전 생성
- 빌드 테스트
- Vercel 배포 준비

---

## 🔗 다음 단계

다음 대화에서 계속하려면:

1. 이 대화의 링크를 저장
2. 새 대화 시작
3. "Phase 1B 계속: 전체 파일 수정 및 빌드"라고 요청

또는 즉시 수정된 파일을 원하시면 말씀해주세요.
