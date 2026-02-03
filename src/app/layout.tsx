import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '매도의 기술 | SellSignal',
  description: '주식 투자자를 위한 매도 타이밍 알림 서비스. AI 기반 매도 시그널로 수익을 극대화하세요.',
  keywords: ['주식', '매도', '시그널', '투자', '알림', '코스톨라니', '매도의기술'],
  authors: [{ name: 'SellSignal' }],
  openGraph: {
    title: '매도의 기술 | SellSignal',
    description: '주식 투자자를 위한 매도 타이밍 알림 서비스',
    url: 'https://sellsignal.kr',
    siteName: 'SellSignal',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '매도의 기술 | SellSignal',
    description: '주식 투자자를 위한 매도 타이밍 알림 서비스',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
