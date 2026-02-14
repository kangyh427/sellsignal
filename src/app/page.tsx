'use client';

import dynamic from 'next/dynamic';

const CRESTApp = dynamic(() => import('@/components/CRESTApp'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      fontSize: '14px',
    }}>
      로딩 중...
    </div>
  ),
});

export default function Home() {
  return <CRESTApp />;
}
