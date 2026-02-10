'use client';
// ============================================
// 경로: src/components/CRESTMobileApp.tsx
// CREST v7.4 — 반응형 모바일 전체 앱 (standalone)
// Next.js 14 Client Component
// ============================================

import { useState, useMemo, useEffect, useCallback, useRef } from "react";

// ============================================
// CREST v7.4 — 반응형 모바일 전체 앱
// 세션 50: 과업 E-4
//
// v7.3 → v7.4 변경사항:
//   1. 스와이프 삭제: PositionCard 좌→우 스와이프 제스처로 삭제 (터치 이벤트)
//   2. 모바일 UX 개선: 터치 피드백, 스크롤 최적화, 카드 간격 조정
//   3. 코스톨라니 달걀: 데모 스테이지 전환 UI + 각 단계 설명 강화
//   4. 매물대 기간 동적화: 변동성 기반 의미있는 기간 자동 선정
//   5. Pull-to-refresh 시뮬레이션
//   6. 포지션 카드 접힌 상태에서 미니 시그널 바 표시
// ============================================

const THEME = {
  bg: '#0a0f1e',
  bgGrad: 'linear-gradient(180deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
  card: 'rgba(15,23,42,0.9)',
  cardBorder: 'rgba(255,255,255,0.06)',
  text: '#e2e8f0',
  textDim: '#94a3b8',
  textMuted: '#64748b',
  textDark: '#475569',
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  green: '#10b981',
  red: '#ef4444',
  orange: '#f59e0b',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const LEVEL_STYLES = {
  danger:   { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#ef4444', bar: '#ef4444', emoji: '🚨' },
  warning:  { bg: 'rgba(245,158,11,0.10)', border: '#f59e0b', text: '#f59e0b', bar: '#f59e0b', emoji: '⚠️' },
  caution:  { bg: 'rgba(34,197,94,0.08)',  border: '#22c55e', text: '#22c55e', bar: '#22c55e', emoji: '👀' },
  safe:     { bg: 'rgba(148,163,184,0.05)', border: '#475569', text: '#94a3b8', bar: '#64748b', emoji: '✅' },
  inactive: { bg: 'rgba(148,163,184,0.03)', border: '#334155', text: '#64748b', bar: '#475569', emoji: '⏸️' },
};

const SELL_PRESETS = [
  { id: 'candle3', num: 1, name: '봉 3개', icon: '🕯️', color: '#f59e0b' },
  { id: 'stopLoss', num: 2, name: '손실제한', icon: '🛑', color: '#ef4444' },
  { id: 'twoThird', num: 3, name: '2/3 익절', icon: '💰', color: '#8b5cf6' },
  { id: 'maSignal', num: 4, name: '이동평균선', icon: '📉', color: '#06b6d4' },
  { id: 'volumeZone', num: 5, name: '매물대', icon: '🔍', color: '#84cc16' },
  { id: 'trendline', num: 6, name: '추세선', icon: '📐', color: '#ec4899' },
  { id: 'fundamental', num: 7, name: '기업가치', icon: '🏢', color: '#f97316' },
  { id: 'cycle', num: 8, name: '경기순환', icon: '🥚', color: '#64748b' },
];

// ── 데모 종목 데이터 ──
const DEMO_STOCKS = [
  { id: 1, name: '삼성전자', code: '005930', buyPrice: 71500, quantity: 10, buyDate: '2024-11-15', scenario: 'ma_deadcross' },
  { id: 2, name: 'SK하이닉스', code: '000660', buyPrice: 185000, quantity: 5, buyDate: '2024-12-03', scenario: 'fund_overvalue' },
  { id: 3, name: '카카오', code: '035720', buyPrice: 52300, quantity: 20, buyDate: '2025-01-10', scenario: 'stoploss_hit' },
];

// ── 2,672 종목 데이터 (CSV → 컴팩트 포맷) ──
const STOCKS_RAW = "095570,AJ네트웍스,K|006840,AK홀딩스,K|282330,BGF리테일,K|027410,BGF,K|138930,BNK금융지주,K|001460,BYC,K|001040,CJ,K|011150,CJ씨푸드,K|000590,CS홀딩스,K|012030,DB,K|005830,DB손해보험,K|016610,DB증권,K|000990,DB하이텍,K|001530,DI동일,K|000210,DL,K|375500,DL이앤씨,K|155660,DSR,K|069730,DSR제강,K|017860,DS단석,K|017940,E1,K|365550,ESR켄달스퀘어리츠,K|383220,F&F,K|007700,F&F홀딩스,K|006360,GS건설,K|078930,GS,K|012630,HDC,K|294870,HDC현대산업개발,K|097230,HJ중공업,K|014790,HL D&I,K|204320,HL만도,K|060980,HL홀딩스,K|035000,HS애드,K|015360,INVENI,K|175330,JB금융지주,K|234080,JW생명과학,K|001060,JW중외제약,K|096760,JW홀딩스,K|105560,KB금융,K|432320,KB스타리츠,K|009070,KCTC,K|003620,KG모빌리티,K|016380,KG스틸,K|001390,KG케미칼,K|001940,KISCO홀딩스,K|025000,KPX케미칼,K|092230,KPX홀딩스,K|000040,KR모터스,K|093050,LF,K|034220,LG디스플레이,K|003550,LG,K|051900,LG생활건강,K|373220,LG에너지솔루션,K|032640,LG유플러스,K|011070,LG이노텍,K|066570,LG전자,K|051910,LG화학,K|079550,LIG넥스원,K|010120,LS ELECTRIC,K|000680,LS네트웍스,K|006260,LS,K|229640,LS에코에너지,K|108320,LX세미콘,K|001120,LX인터내셔널,K|023150,MH에탄올,K|035420,NAVER,K|181710,NHN,K|338100,NH프라임리츠,K|034310,NICE,K|008260,NI스틸,K|004250,NPC,K|456040,OCI,K|010950,S-Oil,K|005090,SGC에너지,K|001380,SG글로벌,K|001770,SHD,K|002360,SH에너지화학,K|009160,SIMPAC,K|123700,SJM,K|025530,SJM홀딩스,K|011790,SKC,K|018670,SK가스,K|001740,SK네트웍스,K|210980,SK디앤디,K|395400,SK리츠,K|034730,SK,K|402340,SK스퀘어,K|361610,SK아이이테크놀로지,K|100090,SK오션플랜트,K|096770,SK이노베이션,K|001510,SK증권,K|285130,SK케미칼,K|017670,SK텔레콤,K|003570,SNT다이내믹스,K|064960,SNT모티브,K|100840,SNT에너지,K|036530,SNT홀딩스,K|005610,SPC삼립,K|465770,STX그린로지스,K|011810,STX,K|077970,STX엔진,K|084870,TBH글로벌,K|002710,TCC스틸,K|024070,WISCOM,K|000500,가온전선,K|000860,강남제비스코,K|035250,강원랜드,K|011420,갤럭시아에스엠,K|002100,경농,K|009450,경동나비엔,K|267290,경동도시가스,K|012320,경동인베스트,K|000050,경방,K|214390,경보제약,K|012610,경인양행,K|009140,경인전자,K|013580,계룡건설,K|012200,계양전기,K|002140,고려산업,K|010130,고려아연,K|002240,고려제강,K|009290,광동제약,K|017040,광명전기,K|017900,광전자,K|037710,광주신세계,K|030610,교보증권,K|339770,교촌에프앤비,K|007690,국도화학,K|002720,국제약품,K|114090,GKL,K|083420,그린케미칼,K|014530,극동유화,K|014280,금강공업,K|008870,금비,K|001570,금양,K|002990,금호건설,K|011780,금호석유화학,K|214330,금호에이치티,K|001210,금호전기,K|073240,금호타이어,K|092440,기신정기,K|000270,기아,K|005930,삼성전자,K|000660,SK하이닉스,K|035720,카카오,K";

let _parsedStocks = null;
function getAllStocks() {
  if (_parsedStocks) return _parsedStocks;
  _parsedStocks = STOCKS_RAW.split('|').map(s => {
    const [code, name, m] = s.split(',');
    return { code, name, market: m === 'K' ? 'KOSPI' : 'KOSDAQ' };
  });
  return _parsedStocks;
}

// 초성 추출
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function getChosung(str) {
  return [...str].map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    return code >= 0 && code <= 11171 ? CHO[Math.floor(code / 588)] : ch;
  }).join('');
}
function isChosung(str) { return [...str].every(ch => CHO.includes(ch)); }

function searchStocks(query, marketFilter) {
  if (!query || query.length < 1) return [];
  const stocks = getAllStocks();
  const q = query.toLowerCase().trim();
  const isChosungQuery = isChosung(q);
  const filtered = marketFilter === 'all' ? stocks : stocks.filter(s => s.market === marketFilter);
  const results = filtered.filter(s => {
    if (s.code.includes(q)) return true;
    if (s.name.toLowerCase().includes(q)) return true;
    if (isChosungQuery && getChosung(s.name).includes(q)) return true;
    return false;
  });
  return results.slice(0, 30);
}


// ============================================
// 1. 시그널 엔진 (v5.1 → v7.4)
// ============================================
function calcMA(closes, period) {
  return closes.map((_, i) => i < period - 1 ? null : closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
}
function calcEMA(values, period) {
  const ema = []; const k = 2 / (period + 1);
  values.forEach((v, i) => { ema.push(i === 0 ? v : v * k + ema[i - 1] * (1 - k)); }); return ema;
}
function calcMACD(closes) {
  const e12 = calcEMA(closes, 12), e26 = calcEMA(closes, 26);
  const macd = e12.map((v, i) => v - e26[i]); const sig = calcEMA(macd, 9);
  return { macdLine: macd, signalLine: sig, histogram: macd.map((v, i) => v - sig[i]) };
}
function calcLinReg(values) {
  const n = values.length; let sx=0,sy=0,sxy=0,sx2=0;
  for(let i=0;i<n;i++){sx+=i;sy+=values[i];sxy+=i*values[i];sx2+=i*i;}
  const slope=(n*sxy-sx*sy)/(n*sx2-sx*sx); const intercept=(sy-slope*sx)/n;
  return { slope, intercept, getY: (i) => slope * i + intercept };
}
function findLocalPeaks(values, window = 5) {
  const peaks = [];
  for(let i=window;i<values.length-window;i++){let isPeak=true;
    for(let j=1;j<=window;j++){if(values[i]<=values[i-j]||values[i]<=values[i+j]){isPeak=false;break;}}
    if(isPeak)peaks.push(i);} return peaks;
}

// 캔들 데이터 생성
function generateCandles(basePrice, days = 65, scenario = 'default') {
  const candles = []; let p = basePrice;
  for (let i = 0; i < days; i++) {
    const noise = () => (Math.random() - 0.5) * basePrice * 0.025;
    switch (scenario) {
      case 'ma_deadcross': if(i<35)p+=basePrice*0.008+noise();else p-=basePrice*0.012+noise()*0.5; break;
      case 'fund_overvalue': if(i<40)p+=basePrice*0.006+noise()*0.5;else if(i<48)p+=noise()*0.3;else p-=basePrice*0.015+noise()*0.3; break;
      case 'stoploss_hit': if(i<20)p+=basePrice*0.003+noise();else p-=basePrice*0.006+noise()*0.3; break;
      default: p += noise();
    }
    p = Math.max(p, basePrice * 0.5);
    const open = p; const close = open + noise();
    const high = Math.max(open, close) + Math.abs(noise()) * 0.5;
    const low = Math.min(open, close) - Math.abs(noise()) * 0.5;
    const vol = Math.round(50000 + Math.random() * 150000);
    candles.push({ open, close, high, low, volume: vol }); p = close;
  }
  return candles;
}

// ── 매도법 1: 봉 3개 ──
function checkCandle3(candles) {
  const id = 'candle3'; if(candles.length<3)return{id,level:'inactive',score:0,message:'데이터 부족',detail:'',extras:[]};
  const last3 = candles.slice(-3); const negCount = last3.filter(c=>c.close<c.open).length;
  if(negCount>=3)return{id,level:'danger',score:80,message:'연속 음봉 3개! 매도 신호',detail:'하락 모멘텀 강화',extras:[{tag:'연속 3음봉',color:'#ef4444',score:15}]};
  if(negCount>=2)return{id,level:'warning',score:45,message:'음봉 2개 연속',detail:'추가 하락 주의',extras:[]};
  return{id,level:'safe',score:5,message:'양봉 혼재 · 안정',detail:'',extras:[]};
}

// ── 매도법 2: 손실제한 ──
function checkStopLoss(candles, currentPrice, buyPrice) {
  const id = 'stopLoss'; const ret = ((currentPrice-buyPrice)/buyPrice)*100;
  if(ret<=-5)return{id,level:'danger',score:85,message:`손절 기준 도달 (${ret.toFixed(1)}%)`,detail:`매수가 ₩${Math.round(buyPrice).toLocaleString()}`,extras:[{tag:`수익률 ${ret.toFixed(1)}%`,color:'#ef4444',score:15}]};
  if(ret<=-3.5)return{id,level:'warning',score:50,message:`손절선 근접 (${ret.toFixed(1)}%)`,detail:'',extras:[]};
  return{id,level:'safe',score:5,message:`손절선 여유 (${ret.toFixed(1)}%)`,detail:'',extras:[]};
}

// ── 매도법 3: 2/3 익절 (v7.3 로직 유지) ──
function checkTwoThird(candles, currentPrice, buyPrice) {
  const id = 'twoThird';
  const hp = Math.max(...candles.map(c => c.high));
  const gain = hp - buyPrice;
  const gainRate = (gain / buyPrice) * 100;
  if (gainRate < 5) {
    return {
      id, level: 'inactive', score: 0,
      message: `최고점 수익 ${gainRate.toFixed(1)}% (5% 미만 · 미적용)`,
      detail: `최고가 ₩${Math.round(hp).toLocaleString()} | 매수가 ₩${Math.round(buyPrice).toLocaleString()}`,
      extras: [], chartData: { highPoint: hp, sellPrice: null, buyPrice }
    };
  }
  const sellPrice = buyPrice + gain * (2 / 3);
  const currentGainRate = ((currentPrice - buyPrice) / buyPrice) * 100;
  if (currentPrice <= sellPrice) {
    return {
      id, level: 'danger', score: 75,
      message: `2/3 매도선 이탈! 목표가 ₩${Math.round(sellPrice).toLocaleString()}`,
      detail: `최고 ₩${Math.round(hp).toLocaleString()} → 수익의 2/3 = ₩${Math.round(gain * 2/3).toLocaleString()} | 매도가 ₩${Math.round(sellPrice).toLocaleString()}`,
      extras: [
        { tag: `최고점 ₩${(hp/1000).toFixed(0)}K`, color: '#a855f7', score: 0 },
        { tag: `매도가 ₩${(sellPrice/1000).toFixed(0)}K`, color: '#ef4444', score: 15 },
        { tag: `현재 수익률 ${currentGainRate.toFixed(1)}%`, color: currentGainRate >= 0 ? '#10b981' : '#ef4444', score: 0 },
      ],
      chartData: { highPoint: hp, sellPrice, buyPrice }
    };
  }
  const distToSell = ((currentPrice - sellPrice) / sellPrice) * 100;
  if (distToSell < 3) {
    return {
      id, level: 'warning', score: 45,
      message: `매도선 근접 (₩${Math.round(sellPrice).toLocaleString()})`,
      detail: `수익의 2/3 = ₩${Math.round(gain * 2/3).toLocaleString()} 확보 목표`,
      extras: [{ tag: `매도가까지 ${distToSell.toFixed(1)}%`, color: '#f59e0b', score: 0 }],
      chartData: { highPoint: hp, sellPrice, buyPrice }
    };
  }
  return {
    id, level: 'safe', score: 5,
    message: `수익 유지 (목표가 ₩${Math.round(sellPrice).toLocaleString()})`,
    detail: `최고점 수익률 ${gainRate.toFixed(1)}% | 현재 ${currentGainRate.toFixed(1)}%`,
    extras: [], chartData: { highPoint: hp, sellPrice, buyPrice }
  };
}

// ── 매도법 4: 이동평균선 ──
function checkMASignal(candles, currentPrice) {
  const id='maSignal'; if(candles.length<20)return{id,level:'inactive',score:0,message:'데이터 부족',detail:'',extras:[],maData:null};
  const closes=candles.map(c=>c.close); const ma5=calcMA(closes,5),ma20=calcMA(closes,20);
  const ma60=candles.length>=60?calcMA(closes,60):null; const extras=[]; let ts=0;
  const{histogram}=calcMACD(closes); const lH=histogram[histogram.length-1],pH=histogram[histogram.length-2];
  if(lH<0&&pH>0){extras.push({tag:'MACD 데드크로스',color:'#ef4444',score:20});ts+=20;}else if(lH<0){extras.push({tag:'MACD 음전환',color:'#f59e0b',score:10});ts+=10;}
  const l5=ma5[ma5.length-1],l20=ma20[ma20.length-1],l60=ma60?ma60[ma60.length-1]:null;
  if(l5<l20){extras.push({tag:'5일<20일',color:'#f59e0b',score:10});ts+=10;}
  if(l60&&l20<l60){extras.push({tag:'20일<60일',color:'#ef4444',score:15});ts+=15;}
  const peaks=findLocalPeaks(closes);
  if(peaks.length>=3){const pV=peaks.slice(-3).map(i=>closes[i]);if(pV[2]<pV[0]*1.02&&pV[2]<pV[1]*1.02){extras.push({tag:'삼산 패턴',color:'#ef4444',score:15});ts+=15;}}
  if(ma60&&l5<l20&&l20<l60){extras.push({tag:'역배열(5<20<60)',color:'#ef4444',score:20});ts+=20;}
  const lv=ts>=40?'danger':ts>=25?'warning':ts>=10?'caution':'safe';
  return{id,level:lv,score:Math.min(ts,100),message:ts>=40?'강력 매도 시그널!':ts>=25?'하락 전환 경고':ts>=10?'일부 약세 신호':'이동평균선 안정',detail:'',extras,
    maData: { ma5, ma20, ma60, lastMA5: l5, lastMA20: l20, lastMA60: l60 }
  };
}

// ── 매도법 5: 매물대 (v7.4: 동적 기간 결정) ──
// v7.4 개선: 전체 캔들 고정 대신 변동성·거래량 기반으로 의미있는 기간 자동 선정
function determineMeaningfulPeriod(candles) {
  if (candles.length <= 20) return 0; // 전체 사용
  
  // 최근 20일 평균 거래량 계산
  const recentVols = candles.slice(-20).map(c => c.volume);
  const avgRecentVol = recentVols.reduce((a,b) => a+b, 0) / recentVols.length;
  
  // 뒤에서부터 탐색: 거래량이 평균의 50% 이하로 떨어지는 구간 = 영향력 약화
  let startIdx = 0;
  for (let i = candles.length - 1; i >= 0; i--) {
    // 최근 거래량 대비 30% 미만인 캔들이 3개 연속이면 그 이전은 무시
    if (i < candles.length - 20) {
      const windowVols = candles.slice(i, i + 3).map(c => c.volume);
      const avgWindowVol = windowVols.reduce((a,b) => a+b, 0) / windowVols.length;
      if (avgWindowVol < avgRecentVol * 0.3) {
        startIdx = i + 3;
        break;
      }
    }
  }
  
  // 최소 20일, 최대 전체 기간
  return Math.max(startIdx, Math.max(0, candles.length - 60));
}

function checkVolumeZone(candles, currentPrice) {
  const id='volumeZone'; if(candles.length<20)return{id,level:'inactive',score:0,message:'데이터 부족',detail:'',extras:[],profile:[],periodInfo:null};
  
  // v7.4: 동적 기간 결정
  const startIdx = determineMeaningfulPeriod(candles);
  const relevantCandles = candles.slice(startIdx);
  const periodDays = relevantCandles.length;
  
  const extras=[];const minP=Math.min(...relevantCandles.map(c=>c.low)),maxP=Math.max(...relevantCandles.map(c=>c.high)),range=maxP-minP;
  const profile=[];for(let b=0;b<12;b++){const lo=minP+(range/12)*b,hi=lo+range/12,mid=(lo+hi)/2;let str=0;
    relevantCandles.forEach(c=>{if(c.high>=lo&&c.low<=hi)str+=c.volume/100000;});
    profile.push({price:mid,lo,hi,strength:Math.min(str/relevantCandles.length,1),isCurrent:currentPrice>=lo&&currentPrice<=hi,isSupport:mid<currentPrice,isResistance:mid>currentPrice});}
  const supBk=profile.filter(z=>z.isSupport&&z.strength>0.3);
  
  // v7.4: 기간 정보 추가
  const periodInfo = { days: periodDays, totalDays: candles.length, startIdx };
  
  if(supBk.length===0&&currentPrice<minP+range*0.2){extras.push({tag:'하단 지지 없음',color:'#ef4444',score:20});return{id,level:'danger',score:75,message:'매물대 하단 이탈!',detail:`분석 기간: 최근 ${periodDays}일`,extras,profile,periodInfo};}
  const resBk=profile.filter(z=>z.isResistance&&z.strength>0.3);
  if(resBk.length>=3){extras.push({tag:`상단 저항 ${resBk.length}개`,color:'#f59e0b',score:10});return{id,level:'warning',score:55,message:'상단 매물대 저항',detail:`분석 기간: 최근 ${periodDays}일`,extras,profile,periodInfo};}
  return{id,level:'safe',score:5,message:'매물대 안정',detail:`분석 기간: 최근 ${periodDays}일`,extras:[],profile,periodInfo};
}

// ── 매도법 6: 추세선 ──
function checkTrendline(candles, currentPrice) {
  const id='trendline'; if(candles.length<20)return{id,level:'inactive',score:0,message:'데이터 부족',detail:'',extras:[],trendData:null};
  const extras=[];const lows=candles.map(c=>c.low),n=lows.length;
  const fT=calcLinReg(lows);
  const fTV=fT.getY(n-1);
  const halfStart = Math.floor(n/2);
  const rH=lows.slice(halfStart);
  const rT=calcLinReg(rH);
  const rTV=rT.getY(rH.length-1);
  const s1B=currentPrice<rTV, s2B=currentPrice<fTV;
  if(n>=40){const f1=calcLinReg(lows.slice(0,Math.floor(n/2))),f2=calcLinReg(lows.slice(Math.floor(n/2)));
    if(f1.slope>0&&f2.slope<=0)extras.push({tag:'기울기 전환',color:'#ef4444',score:10});}
  const trendData = {
    primary: { startY: fT.getY(0), endY: fT.getY(n-1), startIdx: 0, endIdx: n-1 },
    secondary: { startY: rT.getY(0), endY: rT.getY(rH.length-1), startIdx: halfStart, endIdx: n-1 },
    currentPrice, primaryValue: fTV, secondaryValue: rTV,
  };
  if(s1B&&s2B){extras.push({tag:'1차+2차 지지 이탈',color:'#ef4444',score:20});return{id,level:'danger',score:85,message:'다중 지지선 이탈!',detail:`1차 지지 ₩${Math.round(fTV).toLocaleString()} | 2차 지지 ₩${Math.round(rTV).toLocaleString()}`,extras,trendData};}
  if(s1B){extras.push({tag:'1차 지지 이탈',color:'#f59e0b',score:15});return{id,level:'warning',score:60,message:'최근 지지선 이탈',detail:`2차 지지선 ₩${Math.round(rTV).toLocaleString()}`,extras,trendData};}
  return{id,level:'safe',score:5,message:'추세선 위 안정',detail:'',extras,trendData};
}

// ── 매도법 7: 기업가치 v5.1 ──
function checkFundamental(candles, currentPrice, scenario) {
  const id = 'fundamental'; const extras = [];
  const fundData = {
    fund_overvalue: {
      per: 42.5, sectorAvgPer: 15.2, pbr: 4.8, sectorAvgPbr: 1.5,
      earningsGrowth: -12.3, revenueGrowth: -5.8, newsEvent: null,
      perBand: { high: 35.0, avg: 18.5, low: 8.2, current: 42.5,
        history: [12,14,16,18,15,13,11,9,10,14,18,22,25,20,17,19,24,30,35,42.5] },
      pbrBand: { high: 3.5, avg: 1.8, low: 0.9, current: 4.8 },
    },
  };
  const data = fundData[scenario] || {
    per: 14.5, sectorAvgPer: 15.2, pbr: 1.3, sectorAvgPbr: 1.5,
    earningsGrowth: 8.5, revenueGrowth: 12.0, newsEvent: null,
    perBand: { high: 22, avg: 14, low: 7, current: 14.5,
      history: [12,13,14,15,14,13,12,11,12,14,15,16,15,14,13,14,15,14,14,14.5] },
    pbrBand: { high: 2.0, avg: 1.2, low: 0.7, current: 1.3 },
  };
  let totalScore = 0;
  if (data.per > data.sectorAvgPer * 2) { extras.push({ tag: `PER ${data.per}x (업종 ${data.sectorAvgPer}x)`, color: '#ef4444', score: 20 }); totalScore += 20; }
  else if (data.per > data.sectorAvgPer * 1.5) { extras.push({ tag: `PER ${data.per}x`, color: '#f59e0b', score: 10 }); totalScore += 10; }
  if (data.pbr > data.sectorAvgPbr * 2) { extras.push({ tag: `PBR ${data.pbr}x (업종 ${data.sectorAvgPbr}x)`, color: '#ef4444', score: 15 }); totalScore += 15; }
  if (data.earningsGrowth < -10) { extras.push({ tag: `이익성장 ${data.earningsGrowth}%`, color: '#ef4444', score: 15 }); totalScore += 15; }
  else if (data.earningsGrowth < 0) { extras.push({ tag: `이익 감소`, color: '#f59e0b', score: 8 }); totalScore += 8; }
  if (data.perBand && data.per > data.perBand.high) { extras.push({ tag: 'PER 밴드 상단 초과', color: '#ef4444', score: 20 }); totalScore += 20; }
  const level = totalScore >= 45 ? 'danger' : totalScore >= 25 ? 'warning' : totalScore >= 10 ? 'caution' : 'safe';
  return { id, level, score: Math.min(totalScore, 100),
    message: totalScore >= 45 ? '고평가 위험!' : totalScore >= 25 ? '밸류에이션 경고' : totalScore >= 10 ? '일부 지표 주의' : '기업가치 안정',
    detail: '', extras, perBand: data.perBand, pbrBand: data.pbrBand };
}

// ── 매도법 8: 경기순환 (v7.4: 동적 스테이지 지원) ──
function checkCycle(scenario, overrideStage = null) {
  const id = 'cycle'; const extras = [];
  const cycleData = {
    cycle_stage3: { stage: 3, stageName: '과장국면', action: '매도 시작', detail: '역금융장세 · 과열', interestRate: 3.5, interestDirection: 'peaking', marketSentiment: 'euphoria', inflation: 3.8 },
    cycle_stage4: { stage: 4, stageName: '조정국면', action: '적극 매도', detail: '금리인상 · 유동성 축소', interestRate: 4.5, interestDirection: 'up_start', marketSentiment: 'anxiety', inflation: 4.5 },
  };
  let data = cycleData[scenario] || { stage: 2, stageName: '동행국면', action: '관망', detail: '실적장세 · 경기회복', interestRate: 2.5, interestDirection: 'stable', marketSentiment: 'optimism', inflation: 2.5 };
  
  // v7.4: 시장 탭에서 스테이지 동적 변경 지원
  if (overrideStage !== null) {
    const stageMap = {
      1: { stage: 1, stageName: '조정국면', action: '매수', detail: '금융장세 · 금리인하', interestRate: 1.5, interestDirection: 'down', marketSentiment: 'fear', inflation: 1.5 },
      2: { stage: 2, stageName: '동행국면', action: '관망', detail: '실적장세 · 경기회복', interestRate: 2.5, interestDirection: 'stable', marketSentiment: 'optimism', inflation: 2.5 },
      3: { stage: 3, stageName: '과장국면', action: '매도 시작', detail: '역금융장세 · 과열', interestRate: 3.5, interestDirection: 'peaking', marketSentiment: 'euphoria', inflation: 3.8 },
      4: { stage: 4, stageName: '조정국면', action: '적극 매도', detail: '금리인상 · 유동성 축소', interestRate: 4.5, interestDirection: 'up_start', marketSentiment: 'anxiety', inflation: 4.5 },
      5: { stage: 5, stageName: '동행국면', action: '관망', detail: '역실적장세 · 침체', interestRate: 3.0, interestDirection: 'peaking', marketSentiment: 'pessimism', inflation: 3.0 },
      6: { stage: 6, stageName: '과장국면', action: '매수', detail: '바닥 · 금리인하 기대', interestRate: 1.0, interestDirection: 'down', marketSentiment: 'capitulation', inflation: 1.0 },
    };
    data = stageMap[overrideStage] || data;
  }
  
  const stageScores = { 1: 5, 2: 10, 3: 75, 4: 85, 5: 30, 6: 5 };
  let totalScore = stageScores[data.stage] || 5;
  if (data.interestDirection === 'up_start') extras.push({ tag: '금리 인상 시작', color: '#ef4444', score: 10 });
  else if (data.interestDirection === 'peaking') extras.push({ tag: '금리 정점 부근', color: '#f59e0b', score: 5 });
  if (data.marketSentiment === 'euphoria') extras.push({ tag: '시장 과열', color: '#ef4444', score: 10 });
  else if (data.marketSentiment === 'anxiety') extras.push({ tag: '불안 확산', color: '#f59e0b', score: 5 });
  const stageColor = [3, 4].includes(data.stage) ? '#ef4444' : [2, 5].includes(data.stage) ? '#f59e0b' : '#10b981';
  extras.push({ tag: `${data.stage}단계: ${data.stageName}`, color: stageColor, score: 0 });
  const level = totalScore >= 60 ? 'danger' : totalScore >= 40 ? 'warning' : totalScore >= 15 ? 'caution' : 'safe';
  return { id, level, score: Math.min(totalScore, 100),
    message: `${data.stage}단계 ${data.stageName} — ${data.action}`, detail: data.detail, extras,
    cycleStage: data.stage, interestRate: data.interestRate, interestDirection: data.interestDirection };
}

// 전체 시그널 계산
function calculateAllSignals(candles, currentPrice, buyPrice, scenario, cycleStage = null) {
  return [
    checkCandle3(candles), checkStopLoss(candles, currentPrice, buyPrice),
    checkTwoThird(candles, currentPrice, buyPrice), checkMASignal(candles, currentPrice),
    checkVolumeZone(candles, currentPrice), checkTrendline(candles, currentPrice),
    checkFundamental(candles, currentPrice, scenario), checkCycle(scenario, cycleStage),
  ];
}


// ============================================
// 2. UI 서브 컴포넌트
// ============================================

function CrestLogo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1e293b" />
      <path d="M10 28 L16 14 L20 22 L24 12 L30 28" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="12" r="3" fill="#10b981" />
    </svg>
  );
}

function AppHeader({ alertCount, onShowAdd }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 1px 12px rgba(0,0,0,0.4)',
      padding: '8px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CrestLogo size={32} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', lineHeight: 1.2 }}>CREST</div>
            <div style={{ fontSize: '10px', color: THEME.textMuted, letterSpacing: '0.5px' }}>매도의 기술 v7.4</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={onShowAdd} style={{
            padding: '8px 14px', minHeight: '36px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: 'none', borderRadius: '8px', color: '#fff',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
          }}>+ 종목추가</button>
          <div style={{
            padding: '5px 10px', borderRadius: '6px',
            background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
            fontSize: '10px', fontWeight: '700', color: '#eab308',
          }}>FREE</div>
        </div>
      </div>
    </header>
  );
}

function SummaryCards({ positions, priceDataMap }) {
  const totalCost = positions.reduce((s, p) => s + p.buyPrice * p.quantity, 0);
  const totalValue = positions.reduce((s, p) => {
    const d = priceDataMap[p.id];
    const pr = d && d.length > 0 ? d[d.length - 1].close : p.buyPrice;
    return s + pr * p.quantity;
  }, 0);
  const profit = totalValue - totalCost;
  const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const dailyChange = useMemo(() => (Math.random() - 0.45) * 2.5, []);
  const fmt = (v) => v >= 1e8 ? (v / 1e8).toFixed(1) + '억' : v >= 1e4 ? (v / 1e4).toFixed(0) + '만' : Math.round(v).toLocaleString();

  return (
    <div style={{ padding: '10px 16px 6px', display: 'flex', gap: '8px' }}>
      <div style={{ flex: 1, padding: '12px 14px', borderRadius: '12px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '10px', color: THEME.textMuted, marginBottom: '4px' }}>총 평가금액</div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>₩{fmt(totalValue)}</div>
        <div style={{ fontSize: '10px', color: THEME.textMuted, marginTop: '3px' }}>투자원금 ₩{fmt(totalCost)}</div>
      </div>
      <div style={{ flex: 1, padding: '12px 14px', borderRadius: '12px', background: profit >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${profit >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
        <div style={{ fontSize: '10px', color: THEME.textMuted, marginBottom: '4px' }}>총 수익률</div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: profit >= 0 ? THEME.green : THEME.red }}>
          {profit >= 0 ? '▲' : '▼'} {Math.abs(profitRate).toFixed(1)}%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
          <span style={{ fontSize: '10px', color: profit >= 0 ? THEME.green : THEME.red, opacity: 0.8 }}>
            {profit >= 0 ? '+' : ''}₩{fmt(Math.abs(profit))}
          </span>
          <span style={{ fontSize: '10px', fontWeight: '600', color: dailyChange >= 0 ? '#10b981' : '#ef4444', padding: '1px 4px', borderRadius: '3px', background: dailyChange >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
            오늘 {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 미니 캔들 차트 (v7.3 오버레이 시스템 유지) ──
function MiniChart({ candles, currentPrice, buyPrice, activeOverlay, signals }) {
  if (!candles || candles.length === 0) return null;
  const W = 320, H = activeOverlay ? 150 : 115;
  const pad = { top: 8, right: 42, bottom: 12, left: 4 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const allP = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...allP) * 0.998, maxP = Math.max(...allP) * 1.002, range = maxP - minP || 1;
  const barW = Math.max(1.5, (cW / candles.length) - 0.8);
  const y = (p) => pad.top + cH - ((p - minP) / range) * cH;
  const x = (i) => pad.left + (i / candles.length) * cW;

  const closes = candles.map(c => c.close);
  const ma5 = calcMA(closes, 5);
  const ma20 = calcMA(closes, 20);
  const maPath = (maValues, color, width = 0.8, opacity = 0.6) => {
    const pts = maValues.map((v, i) => v !== null ? `${x(i)+barW/2},${y(v)}` : null).filter(Boolean);
    return pts.length > 1 ? <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={width} opacity={opacity} /> : null;
  };

  const getSignalById = (id) => signals?.find(s => s.id === id);

  // 2/3 익절 오버레이
  const renderTwoThirdOverlay = () => {
    const sig = getSignalById('twoThird');
    if (!sig?.chartData) return null;
    const { highPoint, sellPrice } = sig.chartData;
    return (
      <g>
        <line x1={pad.left} y1={y(highPoint)} x2={W-pad.right} y2={y(highPoint)} stroke="#a855f7" strokeWidth={0.8} strokeDasharray="4,2" opacity={0.7} />
        <rect x={W-pad.right+1} y={y(highPoint)-7} width={38} height={13} rx={3} fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth={0.5} />
        <text x={W-pad.right+4} y={y(highPoint)+3} fill="#a855f7" fontSize={7} fontWeight={700}>고점 {(highPoint/1000).toFixed(0)}K</text>
        {sellPrice && (
          <>
            <line x1={pad.left} y1={y(sellPrice)} x2={W-pad.right} y2={y(sellPrice)} stroke="#ef4444" strokeWidth={1.2} strokeDasharray="6,3" opacity={0.9} />
            <rect x={W-pad.right+1} y={y(sellPrice)-7} width={38} height={13} rx={3} fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth={0.5} />
            <text x={W-pad.right+4} y={y(sellPrice)+3} fill="#ef4444" fontSize={7} fontWeight={800}>2/3 {(sellPrice/1000).toFixed(0)}K</text>
            <rect x={pad.left} y={y(highPoint)} width={cW} height={Math.max(0, y(sellPrice) - y(highPoint))} fill="rgba(168,85,247,0.06)" />
            <rect x={pad.left} y={y(sellPrice)} width={cW} height={Math.max(0, y(buyPrice) - y(sellPrice))} fill="rgba(239,68,68,0.04)" />
          </>
        )}
      </g>
    );
  };

  // 이동평균선 오버레이
  const renderMAOverlay = () => {
    const sig = getSignalById('maSignal');
    if (!sig?.maData) return null;
    const { ma60, lastMA5, lastMA20, lastMA60 } = sig.maData;
    return (
      <g>
        {ma60 && maPath(ma60, '#a855f7', 1.0, 0.7)}
        {lastMA5 && <text x={W-pad.right+3} y={y(lastMA5)+3} fill="#f59e0b" fontSize={6.5} fontWeight={700}>5일 {(lastMA5/1000).toFixed(0)}K</text>}
        {lastMA20 && <text x={W-pad.right+3} y={y(lastMA20)+3} fill="#06b6d4" fontSize={6.5} fontWeight={700}>20일 {(lastMA20/1000).toFixed(0)}K</text>}
        {lastMA60 && <text x={W-pad.right+3} y={y(lastMA60)+3} fill="#a855f7" fontSize={6.5} fontWeight={700}>60일 {(lastMA60/1000).toFixed(0)}K</text>}
      </g>
    );
  };

  // 매물대 오버레이
  const renderVolumeZoneOverlay = () => {
    const sig = getSignalById('volumeZone');
    if (!sig?.profile || sig.profile.length === 0) return null;
    const maxStr = Math.max(...sig.profile.map(z => z.strength), 0.01);
    return (
      <g>
        {sig.profile.map((zone, i) => {
          const barH = Math.max(0.5, ((zone.hi - zone.lo) / range) * cH - 1);
          const barWidth = (zone.strength / maxStr) * cW * 0.25;
          const yPos = y(zone.hi);
          const color = zone.isCurrent ? '#3b82f6' : zone.isSupport ? '#10b981' : '#ef4444';
          return (
            <g key={i}>
              <rect x={W - pad.right - barWidth - 2} y={yPos} width={barWidth} height={barH} fill={color} opacity={zone.isCurrent ? 0.35 : 0.18} rx={1} />
              {zone.strength > 0.4 && (
                <line x1={pad.left} y1={y(zone.price)} x2={W-pad.right} y2={y(zone.price)} stroke={color} strokeWidth={0.5} strokeDasharray="2,3" opacity={0.3} />
              )}
            </g>
          );
        })}
        {/* 범례 + 기간 표시 */}
        <rect x={pad.left+2} y={H-10} width={6} height={4} fill="#10b981" opacity={0.5} rx={1} />
        <text x={pad.left+10} y={H-7} fill="#10b981" fontSize={6} opacity={0.8}>지지</text>
        <rect x={pad.left+30} y={H-10} width={6} height={4} fill="#ef4444" opacity={0.5} rx={1} />
        <text x={pad.left+38} y={H-7} fill="#ef4444" fontSize={6} opacity={0.8}>저항</text>
        <rect x={pad.left+58} y={H-10} width={6} height={4} fill="#3b82f6" opacity={0.5} rx={1} />
        <text x={pad.left+66} y={H-7} fill="#3b82f6" fontSize={6} opacity={0.8}>현재</text>
        {sig.periodInfo && (
          <text x={W-pad.right-5} y={H-7} fill="#475569" fontSize={6} textAnchor="end">{sig.periodInfo.days}일 분석</text>
        )}
      </g>
    );
  };

  // 추세선 오버레이
  const renderTrendlineOverlay = () => {
    const sig = getSignalById('trendline');
    if (!sig?.trendData) return null;
    const { primary, secondary } = sig.trendData;
    return (
      <g>
        <line x1={x(primary.startIdx)+barW/2} y1={y(primary.startY)} x2={x(primary.endIdx)+barW/2} y2={y(primary.endY)} stroke="#3b82f6" strokeWidth={1.0} strokeDasharray="6,3" opacity={0.6} />
        <text x={x(primary.startIdx)+5} y={y(primary.startY)-4} fill="#3b82f6" fontSize={6} fontWeight={600} opacity={0.8}>1차 추세선</text>
        <line x1={x(secondary.startIdx)+barW/2} y1={y(secondary.startY)} x2={x(secondary.endIdx)+barW/2} y2={y(secondary.endY)} stroke="#ec4899" strokeWidth={1.2} opacity={0.8} />
        <text x={x(secondary.startIdx)+5} y={y(secondary.startY)-4} fill="#ec4899" fontSize={6} fontWeight={600} opacity={0.8}>2차 추세선</text>
        {currentPrice < sig.trendData.secondaryValue && (
          <text x={W/2-20} y={pad.top+10} fill="#ef4444" fontSize={7} fontWeight={700}>⚠ 지지선 이탈</text>
        )}
      </g>
    );
  };

  const isMAActive = activeOverlay === 'maSignal';

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {[0,1,2,3,4].map(i => {
        const p = minP + (range * i) / 4;
        return <g key={i}><line x1={pad.left} y1={y(p)} x2={W-pad.right} y2={y(p)} stroke="rgba(255,255,255,0.04)" /><text x={W-pad.right+3} y={y(p)+3} fill="#64748b" fontSize={6.5}>{(p/1000).toFixed(0)}K</text></g>;
      })}
      <line x1={pad.left} y1={y(buyPrice)} x2={W-pad.right} y2={y(buyPrice)} stroke="rgba(59,130,246,0.35)" strokeWidth={0.8} strokeDasharray="3,3" />
      <text x={W-pad.right+3} y={y(buyPrice)+3} fill="#3b82f6" fontSize={6} fontWeight={600}>매수</text>
      {activeOverlay === 'volumeZone' && renderVolumeZoneOverlay()}
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const col = up ? "#10b981" : "#ef4444";
        return (
          <g key={i}>
            <line x1={x(i)+barW/2} y1={y(c.high)} x2={x(i)+barW/2} y2={y(c.low)} stroke={col} strokeWidth={0.4} />
            <rect x={x(i)} y={y(Math.max(c.open, c.close))} width={barW} height={Math.max(0.8, Math.abs(y(c.open)-y(c.close)))} fill={col} rx={0.3} />
          </g>
        );
      })}
      {maPath(ma5, '#f59e0b', isMAActive ? 1.2 : 0.8, isMAActive ? 0.9 : 0.5)}
      {maPath(ma20, '#06b6d4', isMAActive ? 1.2 : 0.8, isMAActive ? 0.9 : 0.5)}
      {isMAActive && renderMAOverlay()}
      {activeOverlay === 'trendline' && renderTrendlineOverlay()}
      {activeOverlay === 'twoThird' && renderTwoThirdOverlay()}
      <circle cx={x(candles.length-1)+barW/2} cy={y(currentPrice)} r={3.5} fill="#3b82f6" stroke="#fff" strokeWidth={0.8} />
      {!isMAActive && (
        <>
          <text x={pad.left+2} y={H-1} fill="#f59e0b" fontSize={6} opacity={0.7}>MA5</text>
          <text x={pad.left+26} y={H-1} fill="#06b6d4" fontSize={6} opacity={0.7}>MA20</text>
        </>
      )}
      {activeOverlay && (
        <rect x={W-pad.right-60} y={2} width={60} height={12} rx={3} fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth={0.5} />
      )}
      {activeOverlay && (
        <text x={W-pad.right-57} y={10} fill="#60a5fa" fontSize={6.5} fontWeight={600}>
          {activeOverlay === 'twoThird' ? '📊 2/3 익절' : activeOverlay === 'maSignal' ? '📉 이동평균선' : activeOverlay === 'volumeZone' ? '🔍 매물대' : activeOverlay === 'trendline' ? '📐 추세선' : ''}
        </text>
      )}
    </svg>
  );
}

// ── 코스톨라니 달걀 미니 위젯 ──
function KostolanyEggMini({ stage, interestRate, interestDirection }) {
  const vw = 240, vh = 200;
  const cx = 120, cy = 100, rx = 52, ry = 57;
  const markerOffset = 32;
  const stageAngles = [130, 180, 230, 310, 0, 50];
  const stageInfo = [
    { num: 1, name: '조정', action: '매수', color: '#10b981' },
    { num: 2, name: '동행', action: '관망', color: '#f59e0b' },
    { num: 3, name: '과장', action: '매도', color: '#ef4444' },
    { num: 4, name: '조정', action: '매도', color: '#ef4444' },
    { num: 5, name: '동행', action: '관망', color: '#f59e0b' },
    { num: 6, name: '과장', action: '매수', color: '#10b981' },
  ];
  const getPos = (angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + (rx + markerOffset) * Math.cos(rad), y: cy + (ry + markerOffset) * Math.sin(rad) };
  };
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>금리 정점</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 14 }}>
          {'경기상승'.split('').map((ch, i) => <span key={i} style={{ fontSize: 8, fontWeight: 700, color: '#10b981', lineHeight: 1.2 }}>{ch}</span>)}
          <span style={{ fontSize: 10, color: '#10b981', marginTop: 1 }}>▲</span>
        </div>
        <svg width="100%" viewBox={`0 0 ${vw} ${vh}`} style={{ display: 'block', flex: 1, maxWidth: 200 }}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.12)" strokeWidth={1.2} />
          <line x1={cx-rx+10} y1={cy} x2={cx+rx-10} y2={cy} stroke="rgba(255,255,255,0.06)" strokeWidth={0.8} strokeDasharray="2,2" />
          <text x={cx} y={cy-22} textAnchor="middle" fill="#ef4444" fontSize={12} fontWeight={800} letterSpacing={3}>매도</text>
          <text x={cx} y={cy+4} textAnchor="middle" fill="#475569" fontSize={10} fontWeight={600}>관망</text>
          <text x={cx} y={cy+28} textAnchor="middle" fill="#10b981" fontSize={12} fontWeight={800} letterSpacing={3}>매수</text>
          <path d={`M ${cx-rx-10} ${cy+30} C ${cx-rx-18} ${cy+8}, ${cx-rx-18} ${cy-8}, ${cx-rx-10} ${cy-30}`} stroke="#10b981" fill="none" strokeWidth={1.5} markerEnd="url(#eggUp)" />
          <path d={`M ${cx+rx+10} ${cy-30} C ${cx+rx+18} ${cy-8}, ${cx+rx+18} ${cy+8}, ${cx+rx+10} ${cy+30}`} stroke="#ef4444" fill="none" strokeWidth={1.5} markerEnd="url(#eggDn)" />
          {stageInfo.map((s, idx) => {
            const pos = getPos(stageAngles[idx]);
            const isCurrent = s.num === stage;
            const mr = isCurrent ? 13 : 9;
            const rad = (stageAngles[idx] * Math.PI) / 180;
            const ex = cx + rx * Math.cos(rad), ey = cy + ry * Math.sin(rad);
            return (
              <g key={s.num}>
                <line x1={ex} y1={ey} x2={pos.x} y2={pos.y} stroke={s.color} strokeWidth={0.5} opacity={0.15} strokeDasharray="2,2" />
                <circle cx={pos.x} cy={pos.y} r={mr} fill={isCurrent ? s.color : 'rgba(15,23,42,0.95)'} stroke={s.color} strokeWidth={isCurrent ? 2 : 1} fillOpacity={isCurrent ? 0.25 : 1} />
                <text x={pos.x} y={pos.y + (isCurrent ? 4 : 3)} textAnchor="middle" fill={isCurrent ? '#fff' : s.color} fontSize={isCurrent ? 12 : 10} fontWeight={700}>{s.num}</text>
                {isCurrent && <circle cx={pos.x} cy={pos.y} r={mr} fill="none" stroke={s.color} strokeWidth={1.2} opacity={0.5}><animate attributeName="r" from={mr} to={mr+10} dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" /></circle>}
              </g>
            );
          })}
          <defs>
            <marker id="eggUp" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto"><polygon points="0 6, 4 0, 8 6" fill="#10b981" /></marker>
            <marker id="eggDn" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto"><polygon points="0 0, 4 6, 8 0" fill="#ef4444" /></marker>
          </defs>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 14 }}>
          <span style={{ fontSize: 10, color: '#ef4444', marginBottom: 1 }}>▼</span>
          {'경기침체'.split('').map((ch, i) => <span key={i} style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', lineHeight: 1.2 }}>{ch}</span>)}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>금리 저점</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px 0', fontSize: 10, color: '#64748b' }}>
        <span>기준금리 {interestRate}%</span>
        <span>{interestDirection === 'up_start' ? '금리 인상 중 🔺' : interestDirection === 'peaking' ? '금리 정점 ⚡' : interestDirection === 'down' ? '금리 인하 중 🔻' : '금리 안정'}</span>
      </div>
    </div>
  );
}

// ── PER 밴드차트 ──
function PERBandChart({ perBand, pbrBand }) {
  if (!perBand || !perBand.history) return null;
  const W = 280, H = 80;
  const pad = { top: 12, right: 38, bottom: 10, left: 6 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const allVals = [...perBand.history, perBand.high, perBand.low];
  const minV = Math.min(...allVals) * 0.85, maxV = Math.max(...allVals) * 1.1, range = maxV - minV || 1;
  const y = (v) => pad.top + cH - ((v - minV) / range) * cH;
  const x = (i) => pad.left + (i / (perBand.history.length - 1)) * cW;
  const linePts = perBand.history.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const isOverBand = perBand.current > perBand.high;
  return (
    <div style={{ marginTop: 6, padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>📊 PER 밴드 (5년)</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
          background: isOverBand ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)',
          color: isOverBand ? '#ef4444' : '#f59e0b',
        }}>{isOverBand ? '⚠️ 밴드 초과' : '밴드 내'}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <rect x={pad.left} y={y(perBand.high)} width={cW} height={Math.max(1, y(perBand.low) - y(perBand.high))} fill="rgba(59,130,246,0.08)" rx={2} />
        <line x1={pad.left} y1={y(perBand.high)} x2={pad.left+cW} y2={y(perBand.high)} stroke="rgba(239,68,68,0.35)" strokeWidth={0.8} strokeDasharray="3,2" />
        <line x1={pad.left} y1={y(perBand.avg)} x2={pad.left+cW} y2={y(perBand.avg)} stroke="rgba(148,163,184,0.3)" strokeWidth={0.8} strokeDasharray="3,2" />
        <line x1={pad.left} y1={y(perBand.low)} x2={pad.left+cW} y2={y(perBand.low)} stroke="rgba(16,185,129,0.35)" strokeWidth={0.8} strokeDasharray="3,2" />
        <text x={W-pad.right+4} y={y(perBand.high)+3} fill="#ef4444" fontSize={7} fontWeight={600}>고 {perBand.high}</text>
        <text x={W-pad.right+4} y={y(perBand.avg)+3} fill="#94a3b8" fontSize={7}>평 {perBand.avg}</text>
        <text x={W-pad.right+4} y={y(perBand.low)+3} fill="#10b981" fontSize={7}>저 {perBand.low}</text>
        <polyline points={linePts} fill="none" stroke="#3b82f6" strokeWidth={1.3} />
        <circle cx={x(perBand.history.length-1)} cy={y(perBand.current)} r={4} fill={isOverBand ? '#ef4444' : '#22c55e'} stroke="#fff" strokeWidth={1} />
        <text x={x(perBand.history.length-1)-14} y={y(perBand.current)-6} fill={isOverBand ? '#ef4444' : '#f59e0b'} fontSize={8} fontWeight={800}>{perBand.current}x</text>
      </svg>
      {pbrBand && (
        <div style={{ fontSize: 10, color: '#64748b', marginTop: 3, display: 'flex', gap: 8 }}>
          <span>PBR: <b style={{ color: pbrBand.current > pbrBand.high ? '#ef4444' : '#94a3b8' }}>{pbrBand.current}x</b></span>
          <span style={{ color: '#475569' }}>밴드 {pbrBand.low}~{pbrBand.high}</span>
          {pbrBand.current > pbrBand.high && <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠️초과</span>}
        </div>
      )}
    </div>
  );
}

// ── 시그널 미니카드 ──
function SignalMiniCard({ signal, methodInfo, isOverlayActive, onToggleOverlay }) {
  const sty = LEVEL_STYLES[signal.level];
  const [expanded, setExpanded] = useState(false);
  const scorePercent = Math.min(signal.score, 100);
  const overlayCapable = ['twoThird', 'maSignal', 'volumeZone', 'trendline'];
  const hasOverlay = overlayCapable.includes(signal.id);
  const handleClick = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (hasOverlay && onToggleOverlay) {
      onToggleOverlay(newExpanded ? signal.id : null);
    }
  };

  return (
    <div style={{ borderRadius: 8, marginBottom: 4, overflow: 'hidden', background: sty.bg, border: `1px solid ${isOverlayActive ? sty.border + '60' : sty.border + '30'}` }}>
      <div onClick={handleClick} style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14 }}>{methodInfo.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
              {methodInfo.num}. {methodInfo.name}
              {hasOverlay && isOverlayActive && <span style={{ fontSize: 8, padding: '1px 4px', borderRadius: 3, background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>차트</span>}
            </div>
            <div style={{ fontSize: 10, color: sty.text, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sty.emoji} {signal.message}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 48, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ width: `${scorePercent}%`, height: '100%', borderRadius: 2, background: sty.bar, transition: 'width 0.3s' }} />
          </div>
          <span style={{ padding: '2px 7px', borderRadius: 6, fontSize: 12, fontWeight: 800, background: sty.bar, color: '#fff', minWidth: 30, textAlign: 'center' }}>{signal.score}</span>
          <span style={{ fontSize: 10, color: '#475569' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 10px 8px' }}>
          {signal.detail && <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.6, marginBottom: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.15)' }}>{signal.detail}</div>}
          {signal.cycleStage && <KostolanyEggMini stage={signal.cycleStage} interestRate={signal.interestRate} interestDirection={signal.interestDirection} />}
          {signal.perBand && <PERBandChart perBand={signal.perBand} pbrBand={signal.pbrBand} />}
          {signal.extras && signal.extras.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
              {signal.extras.map((e, i) => (
                <span key={i} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${e.color}22`, color: e.color, border: `1px solid ${e.color}44` }}>
                  {e.tag} {e.score > 0 ? `+${e.score}` : ''}
                </span>
              ))}
            </div>
          )}
          {hasOverlay && (
            <div style={{ marginTop: 4, fontSize: 9, color: '#475569', textAlign: 'center' }}>
              💡 위 차트에서 {methodInfo.name} 오버레이가 표시됩니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── v7.4 신규: 접힌 카드의 미니 시그널 바 (8개 매도법 위험도 한눈에) ──
function MiniSignalBar({ signals }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
      {SELL_PRESETS.map(preset => {
        const sig = signals.find(s => s.id === preset.id);
        const sty = LEVEL_STYLES[sig?.level || 'inactive'];
        return (
          <div key={preset.id} title={`${preset.name}: ${sig?.score || 0}점`} style={{
            flex: 1, height: 3, borderRadius: 1.5,
            background: sty.bar, opacity: sig?.score >= 25 ? 0.9 : 0.2,
          }} />
        );
      })}
    </div>
  );
}

// ── v7.4 신규: 스와이프 삭제 래퍼 ──
function SwipeToDelete({ onDelete, children }) {
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [swipeX, setSwipeX] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const isSwipingRef = useRef(false);
  const THRESHOLD = 100; // 삭제 트리거 거리

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    
    // 수직 스크롤 중이면 스와이프 무시
    if (!isSwipingRef.current && Math.abs(dy) > Math.abs(dx)) return;
    
    // 좌측(음수)으로만 스와이프 허용
    if (dx < -10) {
      isSwipingRef.current = true;
      e.preventDefault();
      setSwipeX(Math.max(dx, -160));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -THRESHOLD) {
      setShowConfirm(true);
      setSwipeX(-120);
    } else {
      setSwipeX(0);
      setShowConfirm(false);
    }
    isSwipingRef.current = false;
  };

  const handleConfirmDelete = () => {
    setSwipeX(-400); // 화면 밖으로
    setTimeout(() => onDelete(), 200);
  };

  const handleCancel = () => {
    setSwipeX(0);
    setShowConfirm(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden', borderRadius: '14px', marginBottom: '12px' }}>
      {/* 삭제 배경 */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 130,
        background: 'linear-gradient(90deg, rgba(239,68,68,0.0), rgba(239,68,68,0.25))',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16,
        opacity: swipeX < 0 ? 1 : 0, transition: 'opacity 0.15s',
      }}>
        {showConfirm ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCancel} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>취소</button>
            <button onClick={handleConfirmDelete} style={{ padding: '8px 12px', borderRadius: 8, background: '#ef4444', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>삭제</button>
          </div>
        ) : (
          <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>← 삭제</span>
        )}
      </div>
      {/* 카드 콘텐츠 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwipingRef.current ? 'none' : 'transform 0.25s ease-out',
          position: 'relative', zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}


// ── 포지션 카드 (v7.4: 스와이프 삭제 연동 + 미니 시그널 바) ──
function PositionCard({ stock, candles, currentPrice, onDelete, onEdit, cycleStage }) {
  const [expanded, setExpanded] = useState(false);
  const [showSignals, setShowSignals] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const profitRate = ((currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
  const profitAmount = (currentPrice - stock.buyPrice) * stock.quantity;
  const isProfit = profitRate >= 0;

  const allSignals = useMemo(() =>
    calculateAllSignals(candles, currentPrice, stock.buyPrice, stock.scenario, cycleStage),
    [candles, currentPrice, stock.buyPrice, stock.scenario, cycleStage]
  );

  const totalScore = allSignals.reduce((s, sig) => s + sig.score, 0);
  const activeCount = allSignals.filter(s => s.score >= 25).length;
  const maxLevel = allSignals.reduce((max, s) => {
    const pri = { danger: 4, warning: 3, caution: 2, safe: 1, inactive: 0 };
    return (pri[s.level] || 0) > (pri[max] || 0) ? s.level : max;
  }, 'safe');
  const maxSty = LEVEL_STYLES[maxLevel];
  const levelLabel = { danger: '위험', warning: '경고', caution: '주의', safe: '안정', inactive: '대기' };

  const cardContent = (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.92))',
      border: `1px solid ${maxSty.border}30`,
      boxShadow: `0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
    }}>
      {/* 카드 헤더 */}
      <div onClick={() => setExpanded(!expanded)} style={{
        padding: '14px 16px', cursor: 'pointer', minHeight: '72px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{stock.name}</span>
            <span style={{ fontSize: '10px', color: THEME.textMuted, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{stock.code}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>₩{Math.round(currentPrice).toLocaleString()}</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: isProfit ? THEME.green : THEME.red }}>
              {isProfit ? '+' : ''}{profitRate.toFixed(1)}%
            </span>
          </div>
          {/* v7.4: 접힌 상태에서 미니 시그널 바 표시 */}
          {!expanded && <MiniSignalBar signals={allSignals} />}
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${maxSty.bar}22, ${maxSty.bar}08)`,
            border: `2px solid ${maxSty.border}60`,
            boxShadow: `0 0 12px ${maxSty.bar}15`,
          }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: maxSty.text, lineHeight: 1 }}>{totalScore}</span>
            <span style={{ fontSize: '8px', fontWeight: '600', color: maxSty.text, opacity: 0.8, marginTop: '1px' }}>{levelLabel[maxLevel]}</span>
          </div>
          <div style={{ fontSize: '10px', color: THEME.textMuted, marginTop: '3px' }}>{activeCount}개 활성</div>
        </div>
      </div>

      {/* 확장 영역 */}
      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '10px' }}>
            <MiniChart candles={candles} currentPrice={currentPrice} buyPrice={stock.buyPrice} activeOverlay={activeOverlay} signals={allSignals} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            {[
              { label: '매수가', value: `₩${stock.buyPrice.toLocaleString()}` },
              { label: '수량', value: `${stock.quantity}주` },
              { label: '투자금', value: `₩${(stock.buyPrice * stock.quantity).toLocaleString()}` },
              { label: '평가손익', value: `${isProfit ? '+' : ''}₩${Math.round(profitAmount).toLocaleString()}`, color: isProfit ? THEME.green : THEME.red },
            ].map((item, i) => (
              <div key={i} style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ fontSize: '10px', color: THEME.textMuted }}>{item.label}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: item.color || '#fff', marginTop: '3px' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { setShowSignals(!showSignals); if (showSignals) setActiveOverlay(null); }} style={{
            width: '100%', padding: '10px', minHeight: '44px', marginBottom: showSignals ? '8px' : '0',
            background: `linear-gradient(135deg, ${maxSty.bar}12, ${maxSty.bar}04)`,
            border: `1px solid ${maxSty.border}25`, borderRadius: '10px',
            color: maxSty.text, fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            {maxSty.emoji} 8가지 매도 시그널 분석 ({totalScore}점)
            <span style={{ fontSize: '10px' }}>{showSignals ? '▲' : '▼'}</span>
          </button>
          {showSignals && (
            <div>
              {SELL_PRESETS.map(m => {
                const sig = allSignals.find(s => s.id === m.id);
                return sig ? (
                  <SignalMiniCard key={m.id} signal={sig} methodInfo={m} isOverlayActive={activeOverlay === m.id} onToggleOverlay={setActiveOverlay} />
                ) : null;
              })}
            </div>
          )}
          <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
            <button onClick={() => onEdit && onEdit()} style={{
              width: '100%', padding: '9px', minHeight: '36px', borderRadius: '8px', marginBottom: '6px',
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
              color: '#60a5fa', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>✏️ 매수가·수량 수정</button>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} style={{
                width: '100%', padding: '8px', minHeight: '36px', borderRadius: '8px',
                background: 'transparent', border: '1px solid rgba(239,68,68,0.15)',
                color: '#ef4444', fontSize: '11px', fontWeight: '500', cursor: 'pointer', opacity: 0.6,
              }}>종목 삭제</button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '8px', minHeight: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
                <button onClick={() => onDelete && onDelete(stock.id)} style={{ flex: 1, padding: '8px', minHeight: '36px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>삭제 확인</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return cardContent;
}


// ── 시장 탭: 코스톨라니 경기순환 (v7.4: 스테이지 전환 UI) ──
function MarketCycleSection({ currentStage, onStageChange }) {
  const stageInfo = [
    { num: 1, name: '조정국면', action: '매수', color: '#10b981', desc: '금융장세 · 금리인하 · 경기 바닥 지남', detail: '금리 인하로 유동성이 늘면서 주가가 서서히 반등하기 시작합니다. 아직 경제 뉴스는 부정적이지만, 선행적으로 주식시장은 저점을 찍고 올라갑니다.' },
    { num: 2, name: '동행국면', action: '관망', color: '#f59e0b', desc: '실적장세 · 경기회복', detail: '기업 실적이 개선되며 주가가 본격적으로 상승합니다. 경제지표가 호전되고 투자 심리가 개선되지만, 아직 과열 단계는 아닙니다.' },
    { num: 3, name: '과장국면', action: '매도', color: '#ef4444', desc: '역금융장세 · 과열 경고', detail: '모든 뉴스가 긍정적이고, 주변 모두가 주식 이야기를 합니다. 금리가 인상되기 시작하며, "이번엔 다르다"는 낙관론이 팽배합니다. 가장 위험한 구간입니다.' },
    { num: 4, name: '조정국면', action: '매도', color: '#ef4444', desc: '금리인상 · 유동성 축소', detail: '금리 인상이 본격화되면서 유동성이 줄어들고, 주가가 하락하기 시작합니다. 기업 실적은 아직 좋지만, 시장은 이미 선반영하여 하락합니다.' },
    { num: 5, name: '동행국면', action: '관망', color: '#f59e0b', desc: '역실적장세 · 침체', detail: '경기 침체가 본격화되고, 기업 실적이 악화됩니다. 비관론이 확산되지만, 시장은 이미 많이 하락하여 낙폭이 제한됩니다.' },
    { num: 6, name: '과장국면', action: '매수', color: '#10b981', desc: '바닥 · 금리인하 기대', detail: '경제가 극도로 비관적이고, 모두가 주식을 포기할 때입니다. 하지만 이때가 바로 매수 기회입니다. 금리 인하 기대감이 형성됩니다.' },
  ];
  const current = stageInfo[currentStage - 1];
  const [expandedDetail, setExpandedDetail] = useState(null);

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.92))', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>🥚</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>코스톨라니 경기순환</div>
            <div style={{ fontSize: '11px', color: THEME.textMuted }}>현재: {current.num}단계 {current.name}</div>
          </div>
          <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', background: `${current.color}15`, color: current.color, border: `1px solid ${current.color}30` }}>{current.action}</span>
        </div>
        <KostolanyEggMini stage={currentStage} interestRate={current.num <= 2 ? 1.5 + current.num * 0.5 : current.num === 3 ? 3.5 : current.num === 4 ? 4.5 : current.num === 5 ? 3.0 : 1.0} interestDirection={[1,6].includes(current.num) ? 'down' : [3,5].includes(current.num) ? 'peaking' : current.num === 4 ? 'up_start' : 'stable'} />
        
        {/* v7.4: 스테이지 전환 UI (데모용) */}
        <div style={{ margin: '10px 0', padding: '8px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#60a5fa', marginBottom: '6px', fontWeight: 600 }}>📡 경기 단계 설정 (데모)</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1,2,3,4,5,6].map(s => (
              <button key={s} onClick={() => onStageChange(s)} style={{
                flex: 1, padding: '6px 0', borderRadius: '6px', border: 'none', cursor: 'pointer', minHeight: '32px',
                background: currentStage === s ? stageInfo[s-1].color : 'rgba(255,255,255,0.04)',
                color: currentStage === s ? '#fff' : '#64748b',
                fontSize: '11px', fontWeight: currentStage === s ? '700' : '500',
                transition: 'all 0.15s',
              }}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: '9px', color: '#475569', marginTop: '4px', textAlign: 'center' }}>실시간 API 연동 시 자동 결정됩니다</div>
        </div>

        <div style={{ marginTop: '10px' }}>
          {stageInfo.map(s => (
            <div key={s.num} style={{ marginBottom: '3px' }}>
              <div onClick={() => setExpandedDetail(expandedDetail === s.num ? null : s.num)} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px',
                borderRadius: '8px', cursor: 'pointer', minHeight: '40px',
                background: s.num === currentStage ? `${s.color}10` : 'transparent',
                border: s.num === currentStage ? `1px solid ${s.color}25` : '1px solid transparent',
              }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.num === currentStage ? s.color : 'rgba(255,255,255,0.04)', fontSize: '11px', fontWeight: '700', color: s.num === currentStage ? '#fff' : s.color }}>{s.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: s.num === currentStage ? '700' : '500', color: s.num === currentStage ? '#fff' : '#94a3b8' }}>{s.name} · {s.action}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{s.desc}</div>
                </div>
                <span style={{ fontSize: '10px', color: '#475569' }}>{expandedDetail === s.num ? '▲' : '▼'}</span>
              </div>
              {/* v7.4: 각 단계 상세 설명 */}
              {expandedDetail === s.num && (
                <div style={{ padding: '6px 10px 8px 42px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.7, background: 'rgba(0,0,0,0.1)', borderRadius: '0 0 8px 8px', marginTop: '-2px' }}>
                  {s.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuffettIndicatorSection() {
  const ratio = 178.5;
  const getLevel = (r) => r >= 180 ? { text: '극도 과열', color: '#ef4444' } : r >= 140 ? { text: '과열', color: '#f59e0b' } : r >= 100 ? { text: '적정~고평가', color: '#eab308' } : { text: '저평가', color: '#10b981' };
  const level = getLevel(ratio);
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.92))', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <div><div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>버핏 지표</div><div style={{ fontSize: '11px', color: THEME.textMuted }}>시가총액 / GDP 비율</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '30px', fontWeight: '800', color: level.color }}>{ratio}%</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: level.color, padding: '3px 10px', borderRadius: '6px', background: `${level.color}15` }}>{level.text}</span>
        </div>
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(ratio / 2, 100)}%`, borderRadius: '4px', background: `linear-gradient(90deg, #10b981, #eab308, #ef4444)` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '10px', color: THEME.textMuted }}>
          <span>0%</span><span>100%</span><span>140%</span><span>200%</span>
        </div>
      </div>
    </div>
  );
}

function AlertSection() {
  const alerts = [
    { id: 1, stock: '삼성전자', message: '손절 기준가(-5%) 근접! 현재 -4.2%', time: '5분 전', level: 'danger' },
    { id: 2, stock: 'SK하이닉스', message: 'PER 밴드 상단 초과', time: '32분 전', level: 'warning' },
  ];
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.92))', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px' }}>🔔</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>조건 도달 알림</span>
          <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>{alerts.length}</span>
        </div>
        {alerts.map(a => {
          const sty = LEVEL_STYLES[a.level];
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '6px', borderRadius: '10px', background: sty.bg, border: `1px solid ${sty.border}30`, minHeight: '44px' }}>
              <span style={{ fontSize: '16px' }}>{sty.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{a.stock}</div>
                <div style={{ fontSize: '10px', color: sty.text, marginTop: '2px' }}>{a.message}</div>
              </div>
              <span style={{ fontSize: '10px', color: THEME.textMuted, flexShrink: 0 }}>{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SellGuideSection() {
  const [openIdx, setOpenIdx] = useState(-1);
  const guides = [
    { icon: '🕯️', name: '봉 3개 매도법', desc: '3일 연속 하락봉(음봉)이 나타나면 추가 하락 가능성이 높아 매도 신호로 봅니다.' },
    { icon: '🛑', name: '손실제한 매도법', desc: '사전에 설정한 손절률(예: -5%)에 도달하면 기계적으로 매도합니다.' },
    { icon: '💰', name: '2/3 익절 매도법', desc: '매수가 대비 최고점 수익이 5% 이상일 때, 수익의 2/3를 확보하는 가격에서 매도합니다. 예: 매수 1만원 → 최고 2만원 → 매도가 16,667원 (수익 1만원의 2/3 = 6,667원 확보)' },
    { icon: '📉', name: '이동평균선 매도법', desc: '5일선이 20일선 아래로 내려가는 데드크로스, MACD 음전환, 삼산 패턴 등을 종합 판단합니다.' },
    { icon: '🔍', name: '매물대 매도법', desc: '거래가 집중된 가격대(매물대)의 지지선이 무너지면 추가 하락 가능성이 커집니다.' },
    { icon: '📐', name: '추세선 매도법', desc: '상승 추세의 저점을 연결한 지지선이 이탈되면 추세 전환 신호입니다.' },
    { icon: '🏢', name: '기업가치 매도법', desc: 'PER/PBR이 업종 평균 대비 고평가이거나, 5년 밴드 상단을 초과하면 매도 신호입니다.' },
    { icon: '🥚', name: '경기순환 매도법', desc: '코스톨라니 달걀모형의 3~4단계에서 매도합니다.' },
  ];
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(30,41,59,0.85), rgba(15,23,42,0.92))', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px' }}>📚</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>매도의 기술 — 8가지 매도법</span>
        </div>
        {guides.map((g, idx) => (
          <div key={idx} style={{ marginBottom: '4px' }}>
            <div onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', minHeight: '44px', background: openIdx === idx ? 'rgba(59,130,246,0.06)' : 'transparent' }}>
              <span style={{ fontSize: '16px' }}>{g.icon}</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{g.name}</span>
              <span style={{ fontSize: '10px', color: '#475569' }}>{openIdx === idx ? '▲' : '▼'}</span>
            </div>
            {openIdx === idx && <div style={{ padding: '0 12px 8px 36px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.7 }}>{g.desc}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}


// ── 하단 네비게이션 ──
function BottomNav({ activeTab, onTabChange, alertCount }) {
  const tabs = [
    { id: 'positions', label: '포지션', icon: '📊', badge: 0 },
    { id: 'market', label: '시장', icon: '🥚', badge: 0 },
    { id: 'alerts', label: '알림', icon: '🔔', badge: alertCount },
    { id: 'guide', label: '가이드', icon: '📚', badge: 0 },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px', zIndex: 200,
      background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 -2px 16px rgba(0,0,0,0.4)',
      padding: '4px 4px max(8px, env(safe-area-inset-bottom, 0px))',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            padding: '6px 4px 4px', minHeight: '50px',
            background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
            border: 'none', cursor: 'pointer', position: 'relative',
            borderRadius: '10px', margin: '0 2px', transition: 'background 0.15s',
          }}>
            <span style={{ fontSize: '20px', opacity: isActive ? 1 : 0.45, transition: 'opacity 0.15s' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '400', color: isActive ? '#60a5fa' : '#64748b' }}>{tab.label}</span>
            {tab.badge > 0 && <span style={{ position: 'absolute', top: 2, right: '50%', transform: 'translateX(16px)', background: '#ef4444', color: '#fff', fontSize: '8px', fontWeight: '700', padding: '1px 4px', borderRadius: '6px', minWidth: '14px', textAlign: 'center' }}>{tab.badge}</span>}
            {isActive && <div style={{ position: 'absolute', bottom: 1, width: '20px', height: '2.5px', borderRadius: '2px', background: '#60a5fa' }} />}
          </button>
        );
      })}
    </nav>
  );
}

// ── 포지션 편집 모달 ──
function PositionEditModal({ stock, onClose, onSave }) {
  const [buyPrice, setBuyPrice] = useState(String(stock.buyPrice));
  const [quantity, setQuantity] = useState(String(stock.quantity));
  const inputStyle = { width: '100%', padding: '12px 14px', fontSize: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 430, borderRadius: '20px 20px 0 0', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', padding: '20px 16px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: '0 0 6px' }}>포지션 수정</h3>
        <div style={{ fontSize: '12px', color: THEME.textMuted, marginBottom: '18px' }}>{stock.name} ({stock.code})</div>
        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>매수 단가 (원)</label>
        <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} style={{ ...inputStyle, marginBottom: '14px' }} />
        <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>보유 수량 (주)</label>
        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ ...inputStyle, marginBottom: '18px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', minHeight: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>취소</button>
          <button onClick={() => { if (buyPrice && quantity) { onSave(stock.id, { buyPrice: Number(buyPrice), quantity: Number(quantity) }); onClose(); } }} style={{ flex: 2, padding: '12px', minHeight: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>저장</button>
        </div>
      </div>
    </div>
  );
}

// ── 종목 추가 모달 ──
function AddStockModal({ onClose, onAdd }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [marketFilter, setMarketFilter] = useState('all');
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t); }, [search]);
  const results = useMemo(() => searchStocks(debouncedSearch, marketFilter === 'all' ? 'all' : marketFilter), [debouncedSearch, marketFilter]);
  const marketTabs = [{ key: 'all', label: '전체' }, { key: 'KOSPI', label: 'KOSPI' }, { key: 'KOSDAQ', label: 'KOSDAQ' }];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 430, maxHeight: '85vh', borderRadius: '20px 20px 0 0', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', padding: '20px 16px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', margin: '0 0 16px' }}>
          {step === 1 ? '종목 검색' : '매수 정보 입력'}
        </h3>
        {step === 1 ? (
          <>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="종목명, 코드, 초성(ㅅㅅㅈㅈ) 검색" style={{ width: '100%', padding: '12px 36px 12px 14px', fontSize: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>✕</button>}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              {marketTabs.map(t => (
                <button key={t.key} onClick={() => setMarketFilter(t.key)} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: marketFilter === t.key ? '700' : '500', background: marketFilter === t.key ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', border: marketFilter === t.key ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)', color: marketFilter === t.key ? '#60a5fa' : '#94a3b8', cursor: 'pointer' }}>{t.label}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: 'auto', maxHeight: '50vh' }}>
              {!search ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: THEME.textMuted }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>종목을 검색하세요</div>
                  <div style={{ fontSize: '11px', marginTop: '6px', lineHeight: 1.6 }}>종목명: 삼성전자<br/>코드: 005930<br/>초성: ㅅㅅㅈㅈ</div>
                </div>
              ) : results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: THEME.textMuted, fontSize: '12px' }}>검색 결과가 없습니다</div>
              ) : (
                <>
                  <div style={{ fontSize: '10px', color: THEME.textMuted, marginBottom: '6px' }}>검색결과 {results.length}건</div>
                  {results.map(s => (
                    <div key={s.code} onClick={() => { setSelected(s); setStep(2); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '3px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', minHeight: '44px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{s.name}</div>
                        <div style={{ fontSize: '10px', color: THEME.textMuted, marginTop: '2px' }}>{s.code}</div>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: s.market === 'KOSPI' ? 'rgba(59,130,246,0.12)' : 'rgba(168,85,247,0.12)', color: s.market === 'KOSPI' ? '#60a5fa' : '#a78bfa' }}>{s.market}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{selected.name}</span>
                <span style={{ fontSize: '9px', fontWeight: '600', padding: '1px 5px', borderRadius: '3px', background: selected.market === 'KOSPI' ? 'rgba(59,130,246,0.12)' : 'rgba(168,85,247,0.12)', color: selected.market === 'KOSPI' ? '#60a5fa' : '#a78bfa' }}>{selected.market}</span>
              </div>
              <div style={{ fontSize: '11px', color: THEME.textMuted, marginTop: '3px' }}>{selected.code}</div>
            </div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>매수 단가 (원)</label>
            <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="예: 72000" style={{ width: '100%', padding: '12px 14px', fontSize: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' }} />
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>수량 (주)</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="10" style={{ width: '100%', padding: '12px 14px', fontSize: '15px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', marginBottom: '18px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', minHeight: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>뒤로</button>
              <button onClick={() => { if (buyPrice && quantity) { onAdd({ name: selected.name, code: selected.code, buyPrice: Number(buyPrice), quantity: Number(quantity || 10) }); onClose(); } }} style={{ flex: 2, padding: '12px', minHeight: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>추가하기</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ============================================
// 3. 메인 앱
// ============================================
export default function CRESTMobileApp() {
  const [activeTab, setActiveTab] = useState('positions');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stocks, setStocks] = useState(DEMO_STOCKS);
  const [cycleStage, setCycleStage] = useState(3); // v7.4: 공유 경기순환 단계

  const [candleMap, setCandleMap] = useState(() => {
    const m = {};
    DEMO_STOCKS.forEach(s => { m[s.id] = generateCandles(s.buyPrice, 65, s.scenario); });
    return m;
  });

  const [priceDataMap, setPriceDataMap] = useState(() => {
    const m = {};
    Object.entries(candleMap).forEach(([id, candles]) => { m[id] = candles; });
    return m;
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setPriceDataMap(prev => {
        const u = { ...prev };
        Object.keys(u).forEach(id => {
          const data = [...u[id]];
          if (!data.length) return;
          const last = data[data.length - 1];
          const change = (Math.random() - 0.48) * last.close * 0.006;
          const nc = Math.max(last.close + change, last.close * 0.97);
          data[data.length - 1] = { ...last, close: nc, high: Math.max(last.high, nc), low: Math.min(last.low, nc) };
          u[id] = data;
        });
        return u;
      });
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const handleAddStock = (stock) => {
    const id = Date.now();
    const newStock = { ...stock, id, buyDate: new Date().toISOString().split('T')[0], scenario: 'default' };
    setStocks(prev => [...prev, newStock]);
    const newCandles = generateCandles(stock.buyPrice, 65, 'default');
    setCandleMap(prev => ({ ...prev, [id]: newCandles }));
    setPriceDataMap(prev => ({ ...prev, [id]: newCandles }));
  };

  const handleDeleteStock = (stockId) => {
    setStocks(prev => prev.filter(s => s.id !== stockId));
    setCandleMap(prev => { const u = { ...prev }; delete u[stockId]; return u; });
    setPriceDataMap(prev => { const u = { ...prev }; delete u[stockId]; return u; });
  };

  const handleEditStock = (stockId, updates) => {
    setStocks(prev => prev.map(s => s.id === stockId ? { ...s, ...updates } : s));
  };

  // v7.4: 시장 탭 요약 텍스트를 동적 스테이지에 맞게 생성
  const stageNames = { 1: '조정국면', 2: '동행국면', 3: '과장국면', 4: '조정국면', 5: '동행국면', 6: '과장국면' };
  const stageActions = { 1: '매수', 2: '관망', 3: '매도 시작', 4: '적극 매도', 5: '관망', 6: '매수' };

  return (
    <div style={{
      minHeight: '100vh', minHeight: '100dvh',
      background: THEME.bgGrad, color: THEME.text, fontFamily: THEME.font,
      fontSize: '14px', maxWidth: '430px', margin: '0 auto',
      paddingBottom: 'calc(68px + env(safe-area-inset-bottom, 0px))',
      position: 'relative',
      WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale',
      overscrollBehavior: 'none',
    }}>
      <AppHeader alertCount={2} onShowAdd={() => setShowAddModal(true)} />

      {activeTab === 'positions' && (
        <div>
          <SummaryCards positions={stocks} priceDataMap={priceDataMap} />
          <div onClick={() => setActiveTab('market')} style={{
            margin: '0 16px 12px', padding: '12px 14px', borderRadius: '12px', cursor: 'pointer', minHeight: '48px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.05))',
            border: '1px solid rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>🥚</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#60a5fa' }}>시장: {cycleStage}단계 {stageNames[cycleStage]} · {stageActions[cycleStage]}</div>
              <div style={{ fontSize: '10px', color: THEME.textMuted, marginTop: '2px' }}>코스톨라니 경기순환 · 버핏지표 178%</div>
            </div>
            <span style={{ fontSize: '16px', color: '#475569' }}>›</span>
          </div>

          <div style={{ padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>보유 종목 ({stocks.length})</h2>
              <button onClick={() => setShowAddModal(true)} style={{ padding: '7px 14px', minHeight: '34px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ 추가 ({stocks.length}/3)</button>
            </div>
            {stocks.map(stock => {
              const candles = priceDataMap[stock.id] || [];
              const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : stock.buyPrice;
              return (
                <SwipeToDelete key={stock.id} onDelete={() => handleDeleteStock(stock.id)}>
                  <PositionCard stock={stock} candles={candles} currentPrice={currentPrice} onDelete={handleDeleteStock} onEdit={() => setEditingStock(stock)} cycleStage={cycleStage} />
                </SwipeToDelete>
              );
            })}
            {stocks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: THEME.textMuted }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>보유 종목이 없습니다</div>
                <div style={{ fontSize: '12px', lineHeight: 1.6 }}>상단의 '종목추가' 버튼을 눌러<br/>관심 종목을 등록해보세요</div>
              </div>
            )}
          </div>
          <div style={{ padding: '16px 16px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#334155', lineHeight: 1.6 }}>
              ⚠️ CREST는 투자 판단의 보조 도구이며, 투자 자문 또는 투자 권유가 아닙니다.
              <br />모든 투자 결정과 그에 따른 손익은 이용자 본인의 책임입니다.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div style={{ padding: '12px 16px' }}>
          <button onClick={() => setActiveTab('positions')} style={{ width: '100%', padding: '10px 14px', marginBottom: '12px', minHeight: '44px', background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(59,130,246,0.02))', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#60a5fa' }}>
            <span style={{ fontSize: '14px' }}>←</span>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>보유 종목으로 돌아가기</span>
          </button>
          <MarketCycleSection currentStage={cycleStage} onStageChange={setCycleStage} />
          <BuffettIndicatorSection />
        </div>
      )}

      {activeTab === 'alerts' && <div style={{ padding: '12px 16px' }}><AlertSection /></div>}
      {activeTab === 'guide' && <div style={{ padding: '12px 16px' }}><SellGuideSection /></div>}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} alertCount={2} />
      {showAddModal && <AddStockModal onClose={() => setShowAddModal(false)} onAdd={handleAddStock} />}
      {editingStock && <PositionEditModal stock={editingStock} onClose={() => setEditingStock(null)} onSave={handleEditStock} />}
    </div>
  );
}
