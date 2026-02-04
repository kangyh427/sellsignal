import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata = {
  title: '매도의 기술 - SellSignal',
  description: '스마트한 주식 매도 타이밍 알림 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
