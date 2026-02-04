'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
          } else {
            setError(error.message);
          }
        } else {
          onClose();
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('이미 등록된 이메일입니다.');
          } else {
            setError(error.message);
          }
        } else {
          setMessage('인증 이메일을 발송했습니다. 이메일을 확인해주세요.');
        }
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    }

    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 8px' }}>
            {isLogin ? '로그인' : '회원가입'}
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            매도의 기술로 스마트한 투자를 시작하세요
          </p>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', marginBottom: '24px', gap: '8px' }}>
          <button
            onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: isLogin ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              border: isLogin ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: isLogin ? '#60a5fa' : '#94a3b8',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            로그인
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: !isLogin ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
              border: !isLogin ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: !isLogin ? '#60a5fa' : '#94a3b8',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            회원가입
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력"
              style={inputStyle}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력"
                style={inputStyle}
              />
            </div>
          )}

          {/* 에러/성공 메시지 */}
          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              marginBottom: '16px',
            }}>
              <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {message && (
            <div style={{
              padding: '12px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '8px',
              marginBottom: '16px',
            }}>
              <p style={{ fontSize: '13px', color: '#10b981', margin: 0 }}>✅ {message}</p>
            </div>
          )}

          {/* 버튼 */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '12px',
            }}
          >
            {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </form>

        {/* 하단 안내 */}
        <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', margin: '16px 0 0', lineHeight: '1.5' }}>
          회원가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
