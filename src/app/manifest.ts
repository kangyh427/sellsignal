// ============================================
// PWA Web App Manifest
// 경로: src/app/manifest.ts
// 세션 22B: 홈화면 바로가기 지원
// ============================================
//
// Next.js 14 App Router의 manifest.ts 규칙:
//   - src/app/manifest.ts → 자동으로 /manifest.webmanifest 생성
//   - MetadataRoute.Manifest 타입으로 정적 export
// ============================================

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CREST - 매도의 기술',
    short_name: 'CREST',
    description: '한국·미국 주식 매도 타이밍을 잡아주는 스마트 투자 도우미',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
