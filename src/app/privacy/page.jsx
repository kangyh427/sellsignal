'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
        }}>개인정보처리방침</h1>
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
            <p>
              나온(이하 "회사")은 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 
              개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 
              두고 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              1. 수집하는 개인정보 항목
            </h2>
            <p style={{ marginBottom: '16px' }}>회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
            
            <div style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <h4 style={{ color: '#60a5fa', margin: '0 0 12px', fontSize: '14px' }}>필수 수집 항목</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>이메일 주소</li>
                <li>비밀번호 (암호화 저장)</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <h4 style={{ color: '#a78bfa', margin: '0 0 12px', fontSize: '14px' }}>자동 수집 항목</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>서비스 이용 기록</li>
                <li>접속 로그</li>
                <li>기기 정보 (브라우저 종류, OS 등)</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <h4 style={{ color: '#34d399', margin: '0 0 12px', fontSize: '14px' }}>결제 시 추가 수집 (프리미엄)</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>결제 정보 (결제 수단, 결제 일시)</li>
                <li>결제 정보는 PG사를 통해 안전하게 처리되며 회사는 카드번호 등을 직접 저장하지 않습니다.</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              2. 개인정보의 수집 및 이용 목적
            </h2>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>회원 가입 및 관리: 회원제 서비스 이용, 본인 확인, 부정 이용 방지</li>
              <li style={{ marginBottom: '8px' }}>서비스 제공: 포지션 관리, 알림 서비스, 맞춤형 콘텐츠 제공</li>
              <li style={{ marginBottom: '8px' }}>결제 처리: 프리미엄 서비스 결제 및 환불 처리</li>
              <li style={{ marginBottom: '8px' }}>고객 지원: 문의 응대, 공지사항 전달</li>
              <li style={{ marginBottom: '8px' }}>서비스 개선: 이용 통계 분석, 서비스 품질 향상</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p style={{ marginBottom: '16px' }}>
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시 
              동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><strong>회원 정보:</strong> 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</li>
              <li style={{ marginBottom: '8px' }}><strong>결제 정보:</strong> 전자상거래법에 따라 5년간 보관</li>
              <li style={{ marginBottom: '8px' }}><strong>서비스 이용 기록:</strong> 3개월간 보관 후 파기</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul style={{ paddingLeft: '20px', margin: '16px 0 0' }}>
              <li style={{ marginBottom: '8px' }}>이용자가 사전에 동의한 경우</li>
              <li style={{ marginBottom: '8px' }}>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              5. 개인정보 처리 위탁
            </h2>
            <p style={{ marginBottom: '16px' }}>
              회사는 서비스 향상을 위해 아래와 같이 개인정보를 위탁하고 있습니다.
            </p>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '16px',
            }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>수탁업체</th>
                  <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>Supabase</td>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>데이터베이스 호스팅</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>Vercel</td>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>웹 호스팅</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>NHN KCP / KG이니시스</td>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>결제 처리</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              6. 이용자의 권리와 행사 방법
            </h2>
            <p style={{ marginBottom: '12px' }}>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>개인정보 열람 요구</li>
              <li style={{ marginBottom: '8px' }}>오류 등이 있을 경우 정정 요구</li>
              <li style={{ marginBottom: '8px' }}>삭제 요구</li>
              <li style={{ marginBottom: '8px' }}>처리 정지 요구</li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              위 권리 행사는 서비스 내 설정 또는 고객센터(support@sellsignal.kr)를 통해 
              하실 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              7. 개인정보의 안전성 확보 조치
            </h2>
            <p style={{ marginBottom: '12px' }}>회사는 개인정보의 안전성 확보를 위해 다음의 조치를 취하고 있습니다.</p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>비밀번호의 암호화 저장 및 관리</li>
              <li style={{ marginBottom: '8px' }}>SSL/TLS를 통한 데이터 전송 암호화</li>
              <li style={{ marginBottom: '8px' }}>해킹 등에 대비한 보안 시스템 구축</li>
              <li style={{ marginBottom: '8px' }}>개인정보 취급 직원의 최소화 및 교육</li>
            </ul>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              8. 쿠키(Cookie)의 사용
            </h2>
            <p>
              회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다. 
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 
              이 경우 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              9. 개인정보 보호책임자
            </h2>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '20px',
            }}>
              <p style={{ margin: '0 0 8px' }}><strong>개인정보 보호책임자:</strong> 강윤혁 (대표)</p>
              <p style={{ margin: '0 0 8px' }}><strong>이메일:</strong> support@sellsignal.kr</p>
              <p style={{ margin: 0 }}><strong>주소:</strong> 세종특별자치시 마음안1로 155, 301호(고운동, 성진프라자)</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>
              10. 개인정보처리방침 변경
            </h2>
            <p>
              본 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 추가, 삭제 및 
              수정될 수 있으며, 변경 시 최소 7일 전부터 공지사항을 통해 고지할 것입니다.
            </p>
            <p style={{ marginTop: '16px' }}>
              <strong>시행일자:</strong> 2025년 2월 4일
            </p>
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
