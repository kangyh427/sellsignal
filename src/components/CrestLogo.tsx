'use client';
// ============================================
// CREST 로고 SVG 컴포넌트
// ============================================
import React from 'react';

interface CrestLogoProps {
  size?: number;
}

const CrestLogo: React.FC<CrestLogoProps> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="100" height="100" rx="16" fill="#0f172a"/>
    <polyline 
      points="15,70 35,55 50,75 70,30 85,45" 
      fill="none" 
      stroke="url(#logoGradient)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      filter="url(#glow)"
    />
    <circle cx="70" cy="30" r="6" fill="#22c55e" />
  </svg>
);

export default CrestLogo;
