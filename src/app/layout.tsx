// ============================================
// CREST 앱 루트 레이아웃
// 경로: src/app/layout.tsx
// ============================================
// 세션5 변경사항:
//   [B5] viewport-fit=cover (iOS 노치 대응)
//   [B5] apple-mobile-web-app 메타 태그
//   [B5] theme-color 설정
// ============================================

import type { Metadata, Viewport } from 'next';
import './globals.css';

// ── viewport 설정 (Next.js 14+ 권장 방식) ──
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,          // 입력 시 자동 확대 방지
  userScalable: false,       // 핀치 줌 비활성화 (금융 앱 특성)
  viewportFit: 'cover',      // [B5] iOS 노치 영역까지 렌더링
  themeColor: '#0a0a0f',     // 상태바 색상
};

// ── 메타데이터 ──
export const metadata: Metadata = {
  title: 'CREST - 주식 매도 타이밍 분석 플랫폼',
  description: '8가지 매도 기법으로 최적의 매도 시점을 분석합니다. 실시간 조건 모니터링, AI 분석, 경기순환 지표를 활용한 스마트 매도 도우미.',
  // Apple 웹앱 설정
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CREST',
  },
  // 기본 아이콘 (향후 PWA에서 확장)
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  // Open Graph (SNS 공유)
  openGraph: {
    title: 'CREST - 매도의 기술',
    description: '주식 매도 타이밍을 놓치지 마세요. 8가지 매도법 실시간 모니터링.',
    siteName: 'CREST',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* [B5] iOS 추가 메타 태그 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
