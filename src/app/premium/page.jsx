'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PremiumPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = {
    monthly: { price: 5900, period: '월', discount: null },
    yearly: { price: 4900, period: '월', discount: '17% 할인', total: 58800 },
  };

  const currentPlan = plans[billingCycle];

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
          maxWidth: '1000px',
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

      {/* 히어로 섹션 */}
      <section style={{
        textAlign: 'center',
        padding: '64px 24px 48px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '16px',
        }}>👑</div>
        <h1 style={{
          fontSize: '40px',
          fontWeight: '800',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>CREST Premium</h1>
        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          lineHeight: '1.6',
        }}>
          더 스마트한 매도 타이밍을 위한<br />
          프리미엄 기능을 만나보세요
        </p>
      </section>

      {/* 요금제 토글 */}
      <section style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px',
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '4px',
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '12px 24px',
              background: billingCycle === 'monthly' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: billingCycle === 'monthly' ? '#fff' : '#64748b',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >월간 구독</button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '12px 24px',
              background: billingCycle === 'yearly' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: billingCycle === 'yearly' ? '#fff' : '#64748b',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            연간 구독
            {billingCycle !== 'yearly' && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#10b981',
                color: '#fff',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: '700',
              }}>SAVE</span>
            )}
          </button>
        </div>
      </section>

      {/* 요금 카드 */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '64px',
      }}>
        {/* 무료 플랜 */}
        <div style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>무료</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>시작하기에 충분합니다</p>
          
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '40px', fontWeight: '800' }}>₩0</span>
            <span style={{ fontSize: '16px', color: '#64748b' }}>/월</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
            {[
              { text: '최대 5개 종목 모니터링', included: true },
              { text: '기본 매도 조건 알림', included: true },
              { text: '코스톨라니 달걀 분석', included: true },
              { text: '광고 표시', included: true },
              { text: 'AI 뉴스 분석', included: false },
              { text: 'AI 리포트 분석', included: false },
              { text: '카카오톡 알림', included: false },
              { text: '이메일 리포트', included: false },
            ].map((item, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 0',
                borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                color: item.included ? '#e2e8f0' : '#475569',
              }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: item.included ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: item.included ? '#10b981' : '#64748b',
                }}>
                  {item.included ? '✓' : '—'}
                </span>
                {item.text}
              </li>
            ))}
          </ul>

          <button style={{
            width: '100%',
            padding: '14px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: '#94a3b8',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'default',
          }}>
            현재 사용 중
          </button>
        </div>

        {/* 프리미엄 플랜 */}
        <div style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '20px',
          padding: '32px',
          border: '2px solid rgba(139,92,246,0.5)',
          position: 'relative',
          boxShadow: '0 0 40px rgba(139,92,246,0.2)',
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
          }}>
            👑 추천
          </div>

          <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', marginTop: '8px' }}>프리미엄</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>전문 투자자를 위한 선택</p>
          
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '40px', fontWeight: '800' }}>₩{currentPlan.price.toLocaleString()}</span>
            <span style={{ fontSize: '16px', color: '#64748b' }}>/{currentPlan.period}</span>
          </div>
          {currentPlan.discount && (
            <div style={{ marginBottom: '24px' }}>
              <span style={{
                background: 'rgba(16,185,129,0.2)',
                color: '#10b981',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                {currentPlan.discount} (연 ₩{currentPlan.total.toLocaleString()})
              </span>
            </div>
          )}
          {!currentPlan.discount && <div style={{ marginBottom: '24px' }} />}

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
            {[
              { text: '최대 20개 종목 모니터링', included: true, highlight: true },
              { text: '모든 매도 조건 알림', included: true },
              { text: '코스톨라니 달걀 AI 분석', included: true, highlight: true },
              { text: '광고 완전 제거', included: true, highlight: true },
              { text: 'AI 뉴스 분석', included: true, highlight: true },
              { text: 'AI 리포트 분석', included: true, highlight: true },
              { text: '카카오톡 알림', included: true, highlight: true },
              { text: '이메일 리포트', included: true, highlight: true },
            ].map((item, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 0',
                borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                color: item.included ? '#e2e8f0' : '#475569',
              }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: item.highlight ? 'rgba(139,92,246,0.3)' : 'rgba(16,185,129,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: item.highlight ? '#a78bfa' : '#10b981',
                }}>
                  ✓
                </span>
                <span style={{ fontWeight: item.highlight ? '600' : '400' }}>{item.text}</span>
              </li>
            ))}
          </ul>

          <button style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
          }}>
            🎉 7일 무료 체험 시작
          </button>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center',
            marginTop: '12px',
          }}>
            언제든지 해지 가능 · 자동 결제 · 부가세 포함
          </p>
        </div>
      </section>

      {/* 기능 상세 */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 24px 64px',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '48px',
        }}>프리미엄 상세 기능</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {[
            {
              icon: '📊',
              title: '확장된 모니터링',
              description: '최대 20개 종목을 동시에 모니터링하고, 각 종목별 맞춤 매도 조건을 설정하세요.',
            },
            {
              icon: '🤖',
              title: 'AI 뉴스 분석',
              description: '보유 종목 관련 뉴스를 AI가 실시간 분석하여 호재/악재를 판별해드립니다.',
            },
            {
              icon: '📑',
              title: 'AI 리포트 분석',
              description: '증권사 리포트를 AI가 요약 분석하여 핵심 투자 포인트를 전달합니다.',
            },
            {
              icon: '💬',
              title: '카카오톡 알림',
              description: '설정한 매도 조건 도달 시 카카오톡으로 즉시 알림을 받으세요.',
            },
            {
              icon: '📧',
              title: '이메일 리포트',
              description: '매주 보유 종목 현황과 매도 조건 접근 상황을 이메일로 받아보세요.',
            },
            {
              icon: '🚫',
              title: '광고 제거',
              description: '방해되는 광고 없이 깔끔한 화면에서 투자에 집중하세요.',
            },
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 24px 64px',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '32px',
        }}>자주 묻는 질문</h2>

        {[
          {
            q: '무료 체험 기간이 끝나면 자동으로 결제되나요?',
            a: '네, 7일 무료 체험 후 자동으로 첫 결제가 진행됩니다. 체험 기간 중 언제든 해지하시면 결제되지 않습니다.',
          },
          {
            q: '구독 해지는 어떻게 하나요?',
            a: '서비스 내 설정에서 언제든 해지할 수 있습니다. 해지하더라도 결제 기간이 끝날 때까지 프리미엄 기능을 이용하실 수 있습니다.',
          },
          {
            q: '환불 정책은 어떻게 되나요?',
            a: '결제일로부터 7일 이내 미사용 시 전액 환불이 가능합니다. 이후에는 남은 기간에 대한 부분 환불은 지원하지 않습니다.',
          },
          {
            q: '연간 구독 중간에 해지하면 어떻게 되나요?',
            a: '연간 구독 해지 시에도 결제된 기간 끝까지 프리미엄 기능을 이용하실 수 있습니다. 중간 환불은 지원하지 않습니다.',
          },
        ].map((faq, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>
              Q. {faq.q}
            </h4>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
              A. {faq.a}
            </p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: 'linear-gradient(180deg, rgba(139,92,246,0.1) 0%, transparent 100%)',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          지금 바로 시작하세요
        </h2>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '24px' }}>
          7일 무료 체험으로 프리미엄의 모든 기능을 경험해보세요
        </p>
        <button style={{
          padding: '16px 48px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
        }}>
          🎉 무료 체험 시작하기
        </button>
      </section>

      {/* 푸터 */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '12px' }}>
          <Link href="/terms" style={{ color: '#64748b', fontSize: '13px', marginRight: '24px', textDecoration: 'none' }}>
            이용약관
          </Link>
          <Link href="/privacy" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
            개인정보처리방침
          </Link>
        </div>
        <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
          © 2025 CREST (sellsignal.kr). All rights reserved.
        </p>
      </footer>
    </div>
  );
}
