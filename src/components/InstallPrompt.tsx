'use client';
// ============================================
// InstallPrompt - 홈화면 바로가기 설치 안내
// 경로: src/components/InstallPrompt.tsx
// 세션 22B: PWA 설치 프롬프트
// ============================================
//
// 동작 방식:
//   - Android Chrome: beforeinstallprompt → 네이티브 설치 프롬프트
//   - iOS Safari: 자동 설치 불가 → "공유 → 홈 화면에 추가" 안내 가이드
//   - 이미 standalone으로 실행 중 → 아무것도 표시하지 않음
//   - 사용자가 닫으면 localStorage에 기록 → 7일간 재표시 안함
// ============================================

import React, { useState, useEffect, useCallback } from 'react';

// 숨김 기간 (7일)
const DISMISS_KEY = 'crest-install-dismissed';
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt({ isMobile }: { isMobile: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // standalone 모드이면 이미 설치됨 → 표시 안함
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // 사용자가 이전에 닫았는지 확인
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysPassed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysPassed < DISMISS_DAYS) return;
    }

    // iOS 감지
    const ua = navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);

    if (iosDevice) {
      // iOS: Safari에서만 표시 (Chrome 등은 설치 불가)
      const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
      if (isSafari) {
        setShowBanner(true);
      }
    } else {
      // Android/Desktop: beforeinstallprompt 이벤트 대기
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowBanner(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  // Android: 네이티브 설치 프롬프트 실행
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  // 배너 닫기
  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }, []);

  // 표시할 것이 없으면 렌더링 안함
  if (!showBanner) return null;

  return (
    <>
      {/* 설치 안내 배너 */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0px))' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobile ? 'calc(100% - 32px)' : '400px',
        maxWidth: '400px',
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '14px',
        padding: '14px 16px',
        zIndex: 900,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 아이콘 */}
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width={22} height={22} viewBox="0 0 40 40" fill="none">
              <path d="M10 28 L16 14 L20 22 L24 12 L30 28" stroke="#fff" strokeWidth="2.5"
                fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="24" cy="12" r="3" fill="#10b981" />
            </svg>
          </div>

          {/* 텍스트 */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>
              CREST를 홈 화면에 추가
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
              앱처럼 빠르게 접속할 수 있어요
            </div>
          </div>

          {/* 닫기 버튼 */}
          <button onClick={handleDismiss} style={{
            background: 'none', border: 'none', color: '#64748b',
            fontSize: '18px', cursor: 'pointer', padding: '4px',
            flexShrink: 0,
          }}>✕</button>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button onClick={handleDismiss} style={{
            flex: 1, padding: '10px', minHeight: '40px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: '#94a3b8',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>나중에</button>

          {isIOS ? (
            <button onClick={() => setShowIOSGuide(true)} style={{
              flex: 2, padding: '10px', minHeight: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none', borderRadius: '10px', color: '#fff',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            }}>📲 추가 방법 보기</button>
          ) : (
            <button onClick={handleInstall} style={{
              flex: 2, padding: '10px', minHeight: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none', borderRadius: '10px', color: '#fff',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            }}>📲 홈 화면에 추가</button>
          )}
        </div>
      </div>

      {/* iOS 가이드 모달 */}
      {showIOSGuide && (
        <div onClick={(e: React.MouseEvent) => {
          if (e.target === e.currentTarget) handleDismiss();
        }} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 1200,
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: '20px 20px 0 0',
            padding: '24px 20px',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            width: '100%', maxWidth: '500px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📲</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                홈 화면에 추가하기
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Safari에서 아래 단계를 따라주세요
              </div>
            </div>

            {/* 단계별 안내 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', flexShrink: 0,
                }}>1</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    하단의 공유 버튼 탭
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Safari 하단 중앙의 <span style={{ fontSize: '16px' }}>⬆</span> 아이콘을 탭하세요
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', flexShrink: 0,
                }}>2</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    "홈 화면에 추가" 선택
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    메뉴에서 <span style={{ fontSize: '14px' }}>➕</span> 홈 화면에 추가를 찾아 탭하세요
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(16,185,129,0.15)', color: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', flexShrink: 0,
                }}>✓</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    "추가" 버튼 탭
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    오른쪽 상단 "추가"를 탭하면 홈 화면에 앱 아이콘이 생겨요!
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleDismiss} style={{
              width: '100%', padding: '14px', marginTop: '16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', color: '#94a3b8',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              minHeight: '48px',
            }}>확인</button>
          </div>
        </div>
      )}
    </>
  );
}
