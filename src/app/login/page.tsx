'use client';
// ============================================
// 로그인/회원가입 페이지
// 경로: src/app/login/page.tsx
// 세션 20: 카카오/구글 소셜 로그인 + 비밀번호 재설정
// 세션 36: 한글 인코딩 복구 (UTF-8)
// ============================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// ─── SVG 아이콘 컴포넌트들 ───
const KakaoLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.45 4.08 3.63 5.18-.16.56-.58 2.03-.66 2.34-.1.39.14.38.3.28.12-.08 1.94-1.32 2.73-1.86.64.09 1.3.14 1.98.14 4.42 0 8-2.79 8-6.21C17 3.72 13.42 1 9 1z"
      fill="#3C1E1E"
    />
  </svg>
);

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A8.99 8.99 0 009 18z" fill="#34A853"/>
    <path d="M3.97 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.29-1.71V4.96H.96A8.99 8.99 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.33z" fill="#FBBC05"/>
    <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.99 8.99 0 00.96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // ─── 상태 관리 ───
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 비밀번호 일치 여부 실시간 체크
  const passwordMismatch = mode === 'signup' && confirmPassword.length > 0 && password !== confirmPassword;
  const passwordMatch = mode === 'signup' && confirmPassword.length > 0 && password === confirmPassword;

  // 붙여넣기 차단 핸들러
  const blockPaste = (e: React.ClipboardEvent) => e.preventDefault();

  // 버튼 비활성화 조건
  const isSignUpDisabled = loading || !email || !password || !confirmPassword || password !== confirmPassword;
  const isLoginDisabled = loading || !email || !password;
  const isResetDisabled = loading || !email;

  // ─── 소셜 로그인 핸들러 ───

  /** 카카오 로그인 */
  const handleKakaoLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError('카카오 로그인에 실패했습니다. 다시 시도해 주세요.');
      setLoading(false);
    }
    // 성공 시 카카오 페이지로 리다이렉트되므로 loading 유지
  };

  /** 구글 로그인 */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      setError('구글 로그인에 실패했습니다. 다시 시도해 주세요.');
      setLoading(false);
    }
  };

  // ─── 이메일 로그인/회원가입 핸들러 ───

  /** 이메일 로그인 */
  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : error.message,
      );
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  /** 이메일 회원가입 */
  const handleSignUp = async () => {
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(
        error.message === 'User already registered'
          ? '이미 가입된 이메일입니다. 로그인해 주세요.'
          : error.message,
      );
      setLoading(false);
      return;
    }

    setSuccess('회원가입이 완료되었습니다! 이메일을 확인해 주세요.');
    setLoading(false);
  };

  /** 비밀번호 재설정 */
  const handlePasswordReset = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/login`,
    });

    if (error) {
      setError('이메일 전송에 실패했습니다. 이메일 주소를 확인해 주세요.');
      setLoading(false);
      return;
    }

    setSuccess('비밀번호 재설정 이메일을 발송했습니다. 메일함을 확인해 주세요.');
    setLoading(false);
  };

  // ─── 공통 스타일 ───
  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px 13px 40px',
    fontSize: '14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const socialBtnBase: React.CSSProperties = {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    opacity: loading ? 0.6 : 1,
  };

  // ─── 비밀번호 재설정 화면 ───
  if (mode === 'reset') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
      }}>
        <div style={{
          width: '100%', maxWidth: '400px',
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          borderRadius: '16px', padding: '32px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {/* 뒤로가기 */}
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', color: '#64748b',
              fontSize: '13px', cursor: 'pointer', marginBottom: '24px', padding: 0,
            }}
          >
            ← 로그인으로 돌아가기
          </button>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
              비밀번호 재설정
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
              가입하신 이메일 주소를 입력하시면, 비밀번호 재설정 링크를 보내드립니다.
            </div>
          </div>

          {/* 에러/성공 */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
              fontSize: '13px', color: '#f87171',
            }}>⚠️ {error}</div>
          )}
          {success && (
            <div style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
              fontSize: '13px', color: '#34d399',
            }}>✅ {success}</div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
              이메일
            </label>
            <div style={inputContainerStyle}>
              <div style={inputIconStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          </div>

          <button
            onClick={handlePasswordReset}
            disabled={isResetDisabled}
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
              background: isResetDisabled ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: isResetDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '전송 중...' : '재설정 링크 발송'}
          </button>
        </div>
      </div>
    );
  }

  // ─── 메인 로그인/회원가입 화면 ───
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        borderRadius: '16px', padding: '32px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <svg width={48} height={48} viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
            <rect width="40" height="40" rx="10" fill="#1e293b" />
            <path d="M10 28 L16 14 L20 22 L24 12 L30 28" stroke="#3b82f6" strokeWidth="2.5"
              fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="12" r="3" fill="#10b981" />
          </svg>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>CREST</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>매도의 기술</div>
        </div>

        {/* ========== 소셜 로그인 버튼 ========== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          <button onClick={handleKakaoLogin} disabled={loading} style={{ ...socialBtnBase, background: '#FEE500', color: '#3C1E1E' }}>
            <KakaoLogo /> 카카오로 시작하기
          </button>
          <button onClick={handleGoogleLogin} disabled={loading}
            style={{ ...socialBtnBase, background: '#fff', color: '#333', border: '1px solid rgba(0,0,0,0.1)' }}>
            <GoogleLogo /> Google로 시작하기
          </button>
        </div>

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>또는 이메일로 계속</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* 탭 전환 */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px',
        }}>
          {(['login', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => {
              setMode(m); setError(''); setSuccess(''); setConfirmPassword('');
            }}
              style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                background: mode === m ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: mode === m ? '#60a5fa' : '#64748b',
              }}>
              {m === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        {/* 에러/성공 메시지 */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13px', color: '#f87171',
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13px', color: '#34d399',
          }}>✅ {success}</div>
        )}

        {/* 이메일 폼 */}
        <div>
          {/* 이메일 */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
              이메일
            </label>
            <div style={inputContainerStyle}>
              <div style={inputIconStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: mode === 'signup' ? '14px' : '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
              비밀번호
            </label>
            <div style={inputContainerStyle}>
              <div style={inputIconStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPaste={mode === 'signup' ? blockPaste : undefined}
                placeholder={mode === 'signup' ? '최소 6자 이상' : '비밀번호 입력'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            {mode === 'signup' && password.length > 0 && password.length < 6 && (
              <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px', paddingLeft: '2px' }}>
                ⚠️ 비밀번호는 최소 6자 이상이어야 합니다
              </div>
            )}
          </div>

          {/* 비밀번호 찾기 (로그인 모드) */}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
                style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}

          {/* 비밀번호 확인 (회원가입 모드) */}
          {mode === 'signup' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
                비밀번호 확인
              </label>
              <div style={inputContainerStyle}>
                <div style={inputIconStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onPaste={blockPaste}
                  placeholder="비밀번호를 다시 입력해 주세요"
                  autoComplete="new-password"
                  style={{
                    ...inputStyle,
                    borderColor: passwordMismatch ? 'rgba(239,68,68,0.5)'
                      : passwordMatch ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => {
                    if (!passwordMismatch && !passwordMatch) e.target.style.borderColor = 'rgba(59,130,246,0.5)';
                  }}
                  onBlur={(e) => {
                    if (!passwordMismatch && !passwordMatch) e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                />
              </div>
              {passwordMismatch && (
                <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px', paddingLeft: '2px' }}>
                  ❌ 비밀번호가 일치하지 않습니다
                </div>
              )}
              {passwordMatch && (
                <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px', paddingLeft: '2px' }}>
                  ✅ 비밀번호가 일치합니다
                </div>
              )}
              <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px', paddingLeft: '2px' }}>
                ※ 보안을 위해 비밀번호 붙여넣기가 제한됩니다
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            onClick={mode === 'login' ? handleLogin : handleSignUp}
            disabled={mode === 'login' ? isLoginDisabled : isSignUpDisabled}
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
              background: (mode === 'login' ? isLoginDisabled : isSignUpDisabled)
                ? 'rgba(59,130,246,0.3)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: (mode === 'login' ? isLoginDisabled : isSignUpDisabled) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </div>

        {/* 하단 안내 */}
        <div style={{
          textAlign: 'center', marginTop: '20px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <button onClick={() => router.push('/')} style={{
            background: 'none', border: 'none', color: '#64748b',
            fontSize: '12px', cursor: 'pointer',
          }}>
            로그인 없이 둘러보기 →
          </button>
          <div style={{ fontSize: '10px', color: '#475569', lineHeight: '1.5' }}>
            로그인 시{' '}
            <span style={{ color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>이용약관</span>
            {' '}및{' '}
            <span style={{ color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>개인정보처리방침</span>
            에 동의합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
