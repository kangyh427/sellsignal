'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
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
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
        }}>이용약관</h1>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '40px',
        }}>최종 수정일: 2025년 2월 4일</p>

        <div style={{
          fontSize: '15px',
          lineHeight: '1.8',
          color: '#cbd5e1',
        }}>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제1조 (목적)
            </h2>
            <p>
              본 약관은 나온(이하 "회사")이 운영하는 CREST 서비스(이하 "서비스")의 이용과 관련하여 
              회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제2조 (정의)
            </h2>
            <p style={{ marginBottom: '12px' }}>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>"서비스"란 회사가 제공하는 CREST 웹/앱 서비스 및 관련 제반 서비스를 의미합니다.</li>
              <li style={{ marginBottom: '8px' }}>"이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li style={{ marginBottom: '8px' }}>"회원"이란 서비스에 가입하여 이용자 아이디(ID)를 부여받은 자를 말합니다.</li>
              <li style={{ marginBottom: '8px' }}>"프리미엄 회원"이란 유료 구독을 통해 추가 기능을 이용하는 회원을 말합니다.</li>
            </ol>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제3조 (서비스의 내용)
            </h2>
            <p style={{ marginBottom: '12px' }}>회사가 제공하는 서비스는 다음과 같습니다.</p>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>주식 포지션 관리 및 모니터링 도구</li>
              <li style={{ marginBottom: '8px' }}>사용자 설정 조건에 따른 알림 서비스</li>
              <li style={{ marginBottom: '8px' }}>시장 분석 정보 제공</li>
              <li style={{ marginBottom: '8px' }}>기타 회사가 정하는 서비스</li>
            </ol>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제4조 (서비스 이용의 제한)
            </h2>
            <p>
              본 서비스는 투자 참고용 도구로만 제공되며, 투자자문업 또는 투자권유에 해당하지 않습니다. 
              회사는 서비스를 통해 제공되는 정보의 정확성, 완전성, 적시성을 보장하지 않으며, 
              이용자의 투자 결정에 따른 손실에 대해 어떠한 책임도 지지 않습니다.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제5조 (회원가입)
            </h2>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>이용자는 회사가 정한 절차에 따라 회원가입을 신청합니다.</li>
              <li style={{ marginBottom: '8px' }}>회사는 전항의 신청에 대해 승낙함으로써 회원가입이 완료됩니다.</li>
              <li style={{ marginBottom: '8px' }}>회원은 가입 시 제공한 정보에 변경이 있는 경우 즉시 수정해야 합니다.</li>
            </ol>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제6조 (유료 서비스)
            </h2>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>프리미엄 서비스는 월 정기 구독 방식으로 제공됩니다.</li>
              <li style={{ marginBottom: '8px' }}>구독 요금은 부가세 포함 금액이며, 변경 시 사전 공지합니다.</li>
              <li style={{ marginBottom: '8px' }}>구독 해지는 언제든 가능하며, 해지 시 다음 결제일부터 적용됩니다.</li>
              <li style={{ marginBottom: '8px' }}>환불은 관련 법령 및 회사 정책에 따릅니다.</li>
            </ol>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제7조 (면책조항)
            </h2>
            <div style={{
              padding: '16px',
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.3)',
              borderRadius: '8px',
              marginBottom: '16px',
            }}>
              <p style={{ margin: 0, color: '#fbbf24' }}>
                ⚠️ 본 서비스는 투자 참고 정보를 제공하는 도구일 뿐이며, 투자자문업에 해당하지 않습니다. 
                모든 투자 판단과 그에 따른 결과의 책임은 전적으로 이용자에게 있습니다.
              </p>
            </div>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>회사는 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
              <li style={{ marginBottom: '8px' }}>회사는 이용자가 서비스를 통해 얻은 정보로 인한 손해에 대해 책임지지 않습니다.</li>
              <li style={{ marginBottom: '8px' }}>회사는 이용자 간 또는 이용자와 제3자 간 분쟁에 대해 개입하지 않습니다.</li>
            </ol>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제8조 (저작권)
            </h2>
            <p>
              서비스 내 모든 콘텐츠의 저작권은 회사에 귀속되며, 이용자는 회사의 사전 동의 없이 
              이를 복제, 배포, 방송, 기타 방법으로 이용할 수 없습니다.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              제9조 (분쟁 해결)
            </h2>
            <p>
              본 약관에 관한 분쟁은 대한민국 법을 적용하며, 분쟁 발생 시 회사 소재지 관할 법원을 
              전속 관할 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              부칙
            </h2>
            <p>본 약관은 2025년 2월 4일부터 시행합니다.</p>
          </section>
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
