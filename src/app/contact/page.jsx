'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const categories = [
    { value: '', label: '문의 유형을 선택해주세요' },
    { value: 'account', label: '계정 관련' },
    { value: 'premium', label: '프리미엄/결제 관련' },
    { value: 'feature', label: '기능 문의' },
    { value: 'bug', label: '오류 신고' },
    { value: 'suggestion', label: '제안/건의' },
    { value: 'other', label: '기타' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // 이메일 전송 (mailto 방식 또는 API 연동)
      // 현재는 mailto 링크로 처리
      const mailtoLink = `mailto:support@sellsignal.kr?subject=[${categories.find(c => c.value === formData.category)?.label || '문의'}] ${formData.subject}&body=${encodeURIComponent(
`문의자 정보
━━━━━━━━━━━━━━━━
이름: ${formData.name}
이메일: ${formData.email}
문의 유형: ${categories.find(c => c.value === formData.category)?.label || '-'}

문의 내용
━━━━━━━━━━━━━━━━
${formData.message}
`
      )}`;
      
      window.location.href = mailtoLink;
      
      // 폼 초기화
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: '',
        });
        setSubmitStatus('success');
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '8px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* 헤더 */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>📈</div>
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#fff',
              letterSpacing: '2px'
            }}>CREST</span>
          </Link>
          <Link href="/" style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '14px',
          }}>
            ← 돌아가기
          </Link>
        </div>
      </header>

      {/* 본문 */}
      <main style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '48px 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '12px',
          }}>문의하기</h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            lineHeight: '1.6',
          }}>
            궁금한 점이나 불편한 사항이 있으시면<br />
            아래 양식을 통해 문의해주세요.
          </p>
        </div>

        {/* 빠른 링크 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '32px',
        }}>
          <Link href="/faq" style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            textDecoration: 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>❓</div>
            <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>자주 묻는 질문</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>FAQ 확인하기</div>
          </Link>
          <a href="mailto:support@sellsignal.kr" style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            textDecoration: 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✉️</div>
            <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>이메일 직접 발송</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>support@sellsignal.kr</div>
          </a>
        </div>

        {/* 문의 폼 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '24px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>문의 양식</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>이름 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="홍길동"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={labelStyle}>이메일 *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>문의 유형 *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} style={{ background: '#1e293b' }}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>제목 *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="문의 제목을 입력해주세요"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>문의 내용 *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="문의하실 내용을 자세히 적어주세요."
                rows={6}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '150px',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {submitStatus === 'success' && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#10b981',
              }}>
                ✓ 이메일 앱이 열렸습니다. 전송을 완료해주세요!
              </div>
            )}

            {submitStatus === 'error' && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#ef4444',
              }}>
                ✗ 오류가 발생했습니다. 직접 이메일을 보내주세요.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '16px',
                background: isSubmitting 
                  ? 'rgba(100,116,139,0.3)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              {isSubmitting ? '처리 중...' : '📤 문의 보내기'}
            </button>
          </form>
        </div>

        {/* 안내 */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(234,179,8,0.05)',
          border: '1px solid rgba(234,179,8,0.15)',
          borderRadius: '8px',
        }}>
          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            margin: 0,
            lineHeight: '1.6',
          }}>
            💡 <strong style={{ color: '#eab308' }}>안내:</strong> 문의 접수 후 영업일 기준 1-2일 내에 
            입력하신 이메일로 답변드립니다. 긴급한 문의는 이메일(support@sellsignal.kr)로 직접 연락주세요.
          </p>
        </div>
      </main>

      {/* 푸터 */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
          © 2025 CREST (sellsignal.kr). All rights reserved.
        </p>
      </footer>
    </div>
  );
}
