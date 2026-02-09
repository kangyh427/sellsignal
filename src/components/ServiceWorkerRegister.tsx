'use client';
// ============================================
// ServiceWorkerRegister - SW 등록 컴포넌트
// 경로: src/components/ServiceWorkerRegister.tsx
// 세션 26C: PWA Service Worker 등록
// ============================================
// 사용법: layout.tsx의 <body> 안에 <ServiceWorkerRegister /> 추가
// ============================================

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // 프로덕션에서만 SW 등록
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // 업데이트 감지
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              // 새 버전 감지 → 사용자에게 새로고침 안내 (선택)
              console.log('[CREST] 새 버전이 설치되었습니다.');
            }
          });
        });

        console.log('[CREST] Service Worker 등록 완료:', registration.scope);
      } catch (error) {
        console.warn('[CREST] Service Worker 등록 실패:', error);
      }
    };

    // 페이지 로드 후 등록 (성능 영향 최소화)
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW, { once: true });
    }
  }, []);

  return null; // UI 없음
}
