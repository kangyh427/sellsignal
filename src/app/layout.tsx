// ============================================
// 경로: src/app/layout.tsx
// CREST v7.4 — 루트 레이아웃
// ============================================

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'CREST — 매도의 기술',
  description: '8가지 매도 방법론으로 최적의 매도 타이밍을 알려주는 주식 매도 시그널 앱',
  keywords: '주식, 매도, 매도신호, 매도타이밍, CREST, 코스톨라니',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CREST" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#0a0a0f',
        color: '#e2e8f0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        overscrollBehavior: 'none',
        minHeight: '100vh',
      }}>
        {children}
      </body>
    </html>
  );
}
