import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '매도의 기술 - 주식 매도 시그널 알림',
  description: '8가지 매도법 기반 실시간 조건 알림 서비스',
  keywords: ['주식', '매도', '투자', '알림', '시그널'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
