// ============================================
// CREST Service Worker
// 경로: public/sw.js
// 세션 26C: PWA 오프라인 지원
// ============================================
// 전략:
//   - API 요청 → NetworkFirst (실시간 데이터 우선, 실패 시 캐시)
//   - 정적 자원 → CacheFirst (캐시 우선, 없으면 네트워크)
//   - 네비게이션 → NetworkFirst (항상 최신 HTML, 실패 시 오프라인 페이지)
// ============================================

const CACHE_NAME = 'crest-v1';
const STATIC_CACHE = 'crest-static-v1';
const API_CACHE = 'crest-api-v1';

// 정적 자원 프리캐시 목록
const PRECACHE_URLS = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
];

// ── 설치: 정적 자원 프리캐시 ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] 프리캐시 일부 실패 (아이콘 미존재 시 정상):', err);
      });
    })
  );
  // 대기 건너뛰고 즉시 활성화
  self.skipWaiting();
});

// ── 활성화: 이전 캐시 정리 ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // 즉시 제어권 획득
  self.clients.claim();
});

// ── Fetch 핸들러 ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // POST 등 비-GET 요청은 통과
  if (request.method !== 'GET') return;

  // chrome-extension, 외부 도메인 등은 통과
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // API 요청 → NetworkFirst
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // 네비게이션 요청 → NetworkFirst
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, CACHE_NAME).catch(() =>
        caches.match('/offline.html')
      )
    );
    return;
  }

  // 정적 자원 (JS, CSS, 이미지, 폰트) → CacheFirst
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|ico)$/) ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 기타 → NetworkFirst
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ── 전략: NetworkFirst ──
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// ── 전략: CacheFirst ──
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // 오프라인이고 캐시 없음
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}
