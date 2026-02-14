// ============================================
// CREST 앱 루트 레이아웃
// 경로: src/app/layout.tsx
// ============================================

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0f',
};

export const metadata: Metadata = {
  title: 'CREST - 주식 매도 타이밍 분석 플랫폼',
  description: '8가지 매도 기법으로 최적의 매도 시점을 분석합니다.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CREST',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
