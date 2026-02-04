'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      category: '프리미엄 서비스',
      icon: '👑',
      questions: [
        {
          q: '프리미엄 서비스는 어떻게 가입하나요?',
          a: '메인 화면 상단의 "업그레이드" 버튼을 클릭하거나, 프리미엄 안내 페이지에서 "7일 무료 체험 시작" 버튼을 누르시면 됩니다. 결제 정보 등록 후 7일간 무료로 모든 프리미엄 기능을 이용하실 수 있습니다.'
        },
        {
          q: '프리미엄 구독은 어떻게 해지하나요?',
          a: '로그인 후 설정 메뉴에서 "구독 관리"를 선택하시면 해지할 수 있습니다. 해지하더라도 현재 결제 기간이 끝날 때까지 프리미엄 기능을 계속 이용하실 수 있습니다. 무료 체험 기간 중 해지하시면 결제되지 않습니다.'
        },
        {
          q: '프리미엄과 무료 버전의 차이점은 무엇인가요?',
          a: '무료 버전은 최대 3개 종목 모니터링, 기본 알림 기능을 제공합니다. 프리미엄은 최대 20개 종목, AI 뉴스/리포트 분석, 카카오톡 알림, 이메일 리포트, 광고 제거 등 모든 기능을 이용하실 수 있습니다.'
        },
        {
          q: '결제 수단은 무엇이 있나요?',
          a: '신용카드, 체크카드로 결제 가능합니다. 결제는 안전한 PG사를 통해 처리되며, 카드 정보는 저희 서버에 저장되지 않습니다.'
        },
        {
          q: '환불 정책은 어떻게 되나요?',
          a: '결제일로부터 7일 이내 서비스를 이용하지 않은 경우 전액 환불이 가능합니다. 이후에는 남은 기간에 대한 부분 환불은 지원하지 않습니다. 환불 요청은 문의하기를 통해 접수해주세요.'
        },
      ]
    },
    {
      category: '매도 알림 설정',
      icon: '🔔',
      questions: [
        {
          q: '매도 조건은 어떻게 설정하나요?',
          a: '종목 추가 시 또는 기존 종목의 "조건 변경" 버튼을 클릭하면 다양한 매도 조건을 선택할 수 있습니다. 봉 3개 매도법, 손실제한, 2/3 익절, 이동평균선 등 원하는 조건을 체크하고 세부 값을 설정하세요.'
        },
        {
          q: '알림은 어떻게 받나요?',
          a: '무료 회원은 앱 내 알림으로만 확인 가능합니다. 프리미엄 회원은 카카오톡 알림과 이메일 리포트를 추가로 받으실 수 있습니다.'
        },
        {
          q: '손절 기준은 어떻게 설정하는 게 좋나요?',
          a: '일반적으로 -3% ~ -5% 사이를 권장합니다. 너무 좁게 설정하면 일일 변동성에 의해 불필요한 알림이 올 수 있고, 너무 넓게 설정하면 손실이 커질 수 있습니다. 본인의 투자 성향에 맞게 조절하세요.'
        },
        {
          q: '여러 조건을 동시에 설정할 수 있나요?',
          a: '네, 가능합니다. 여러 매도 조건을 동시에 선택하면 각 조건별로 기준가격이 계산되어 표시됩니다. 어느 조건이든 먼저 도달하면 알림을 받게 됩니다.'
        },
      ]
    },
    {
      category: '계정 관리',
      icon: '👤',
      questions: [
        {
          q: '회원가입은 어떻게 하나요?',
          a: '메인 화면에서 로그인 버튼(👤)을 클릭하면 회원가입/로그인 화면이 나타납니다. 이메일과 비밀번호를 입력하여 간편하게 가입할 수 있습니다.'
        },
        {
          q: '비밀번호를 잊어버렸어요.',
          a: '로그인 화면에서 "비밀번호 찾기"를 클릭하시면 가입하신 이메일로 비밀번호 재설정 링크가 발송됩니다.'
        },
        {
          q: '계정을 탈퇴하고 싶어요.',
          a: '문의하기를 통해 탈퇴 요청을 해주시면 처리해드립니다. 탈퇴 시 모든 데이터는 즉시 삭제되며 복구가 불가능합니다. 프리미엄 구독 중인 경우 먼저 구독을 해지해주세요.'
        },
        {
          q: '다른 기기에서도 사용할 수 있나요?',
          a: '네, 동일한 계정으로 로그인하시면 PC, 태블릿, 스마트폰 등 어떤 기기에서든 사용 가능합니다. 데이터는 클라우드에 저장되어 자동 동기화됩니다.'
        },
      ]
    },
    {
      category: '서비스 이용',
      icon: '📊',
      questions: [
        {
          q: '무료 회원은 몇 개의 종목을 관리할 수 있나요?',
          a: '무료 회원은 최대 3개의 종목을 관리할 수 있습니다. 3개 이상의 종목을 모니터링하고 싶으시다면 프리미엄 회원(최대 20종목)으로 업그레이드하시면 됩니다.'
        },
        {
          q: '주가 데이터는 실시간인가요?',
          a: '현재는 데모 데이터를 사용하고 있습니다. 추후 실시간 시세 연동을 지원할 예정입니다. 매도 조건 알림은 설정하신 기준가격을 기반으로 작동합니다.'
        },
        {
          q: '코스톨라니 달걀이 뭔가요?',
          a: '코스톨라니 달걀은 금리와 경기 사이클에 따른 투자 전략을 시각화한 것입니다. 현재 경기 국면을 파악하여 매수/매도 타이밍을 판단하는 데 참고할 수 있습니다.'
        },
        {
          q: 'CREST가 투자자문을 해주나요?',
          a: '아니요, CREST는 투자자문업에 해당하지 않습니다. 본 서비스는 사용자가 직접 설정한 조건을 모니터링하는 도구일 뿐이며, 모든 투자 판단과 책임은 사용자 본인에게 있습니다.'
        },
        {
          q: '해외 주식도 지원하나요?',
          a: '현재는 국내 주식(코스피, 코스닥)만 지원합니다. 해외 주식 지원은 추후 업데이트 예정입니다.'
        },
      ]
    },
  ];

  const toggleQuestion = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenIndex(openIndex === key ? null : key);
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
          maxWidth: '800px',
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
        maxWidth: '800px',
        margin: '0 auto',
        padding: '48px 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '12px',
          }}>자주 묻는 질문</h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
          }}>
            궁금한 점을 찾아보세요. 원하는 답변이 없다면{' '}
            <Link href="/contact" style={{ color: '#60a5fa', textDecoration: 'none' }}>
              문의하기
            </Link>
            를 이용해주세요.
          </p>
        </div>

        {/* FAQ 카테고리 */}
        {faqCategories.map((category, categoryIdx) => (
          <div key={categoryIdx} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>{category.icon}</span>
              {category.category}
            </h2>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}>
              {category.questions.map((item, questionIdx) => {
                const isOpen = openIndex === `${categoryIdx}-${questionIdx}`;
                return (
                  <div key={questionIdx} style={{
                    borderBottom: questionIdx < category.questions.length - 1 
                      ? '1px solid rgba(255,255,255,0.05)' 
                      : 'none',
                  }}>
                    <button
                      onClick={() => toggleQuestion(categoryIdx, questionIdx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: isOpen ? '#60a5fa' : '#e2e8f0',
                      }}>
                        {item.q}
                      </span>
                      <span style={{
                        fontSize: '18px',
                        color: '#64748b',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}>
                        ▼
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 20px 16px',
                        fontSize: '14px',
                        color: '#94a3b8',
                        lineHeight: '1.7',
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* 추가 도움 */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(59,130,246,0.2)',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            원하는 답변을 찾지 못하셨나요?
          </h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
            문의하기를 통해 질문해주시면 빠르게 답변드리겠습니다.
          </p>
          <Link href="/contact" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}>
            📧 문의하기
          </Link>
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
