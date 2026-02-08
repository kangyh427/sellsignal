'use client';
// ============================================
// 로그인/회원가입 페이지
// 경로: src/app/login/page.tsx
// 세션 19: 비밀번호 확인 필드 추가 + 붙여넣기 차단
// ============================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // 🆕 비밀번호 확인
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🆕 비밀번호 일치 여부 실시간 체크
  const passwordMismatch = mode === 'signup' && confirmPassword.length > 0 && password !== confirmPassword;
  const passwordMatch = mode === 'signup' && confirmPassword.length > 0 && password === confirmPassword;

  // 🆕 붙여넣기 차단 핸들러
  const blockPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  /** 로그인 처리 */
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

  /** 회원가입 처리 */
  const handleSignUp = async () => {
    setLoading(true);
    setError('');

    // 비밀번호 길이 체크
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    // 🆕 비밀번호 일치 체크
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

  // 🆕 회원가입 버튼 비활성화 조건 (비밀번호 확인까지 입력해야 활성화)
  const isSignUpDisabled = loading || !email || !password || !confirmPassword || password !== confirmPassword;
  const isLoginDisabled = loading || !email || !password;

  // 공통 input 스타일
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: '14px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#fff', outline: 'none',
    boxSizing: 'border-box',
  };

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
          <svg width={48} height={48} viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto 12px' }}>
            <rect width="40" height="40" rx="10" fill="#1e293b" />
            <path d="M10 28 L16 14 L20 22 L24 12 L30 28" stroke="#3b82f6" strokeWidth="2.5"
              fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="12" r="3" fill="#10b981" />
          </svg>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>CREST</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>매도의 기술</div>
        </div>

        {/* 탭 전환 */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px',
        }}>
          {(['login', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => {
              setMode(m);
              setError('');
              setSuccess('');
              setConfirmPassword(''); // 🆕 탭 전환 시 확인 비밀번호 초기화
            }}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
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

        {/* 폼 */}
        <div>
          {/* 이메일 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
              이메일
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: mode === 'signup' ? '16px' : '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPaste={mode === 'signup' ? blockPaste : undefined} // 🆕 회원가입 시 붙여넣기 차단
              placeholder={mode === 'signup' ? '최소 6자 이상 (직접 입력)' : '비밀번호 입력'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            {mode === 'signup' && password.length > 0 && password.length < 6 && (
              <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
                ⚠️ 비밀번호는 최소 6자 이상이어야 합니다
              </div>
            )}
          </div>

          {/* 🆕 비밀번호 확인 — 회원가입 모드에서만 표시 */}
          {mode === 'signup' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onPaste={blockPaste} // 🆕 붙여넣기 차단
                placeholder="비밀번호를 다시 입력해 주세요"
                autoComplete="new-password"
                style={{
                  ...inputStyle,
                  // 실시간 색상 피드백
                  borderColor: passwordMismatch
                    ? 'rgba(239,68,68,0.5)'
                    : passwordMatch
                      ? 'rgba(16,185,129,0.5)'
                      : 'rgba(255,255,255,0.1)',
                }}
                onFocus={(e) => {
                  if (!passwordMismatch && !passwordMatch) {
                    e.target.style.borderColor = 'rgba(59,130,246,0.5)';
                  }
                }}
                onBlur={(e) => {
                  if (!passwordMismatch && !passwordMatch) {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  }
                }}
              />
              {/* 실시간 일치/불일치 메시지 */}
              {passwordMismatch && (
                <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>
                  ❌ 비밀번호가 일치하지 않습니다
                </div>
              )}
              {passwordMatch && (
                <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>
                  ✅ 비밀번호가 일치합니다
                </div>
              )}
              {/* 붙여넣기 안내 */}
              <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>
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
            }}>
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </div>

        {/* 하단 안내 */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => router.push('/')} style={{
            background: 'none', border: 'none', color: '#64748b',
            fontSize: '12px', cursor: 'pointer', textDecoration: 'underline',
          }}>
            로그인 없이 둘러보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
