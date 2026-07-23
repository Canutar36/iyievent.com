import React from 'react';

export const Logo = ({ className = '', height = 45, width = 'auto' }) => {
  return (
    <svg 
      viewBox="0 0 400 150" 
      height={height} 
      width={width}
      className={`logo-svg ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* MONOGRAM: iyi */}
      {/* Sol 'i' Harfi */}
      <rect x="20" y="30" width="14" height="18" fill="var(--color-slate)" rx="2" />
      <path d="M27,52 V105 A 13 13 0 0 1 14,118" fill="none" stroke="var(--color-orange)" strokeWidth="14" strokeLinecap="round"/>
      
      {/* Orta 'y' Harfi */}
      <path d="M52,52 v38 A 15 15 0 0 0 67,105 A 15 15 0 0 0 82,90 V52 M82,90 v23 A 10 10 0 0 1 72,123" fill="none" stroke="var(--color-orange)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Sağ 'i' Harfi */}
      <rect x="100" y="30" width="14" height="18" fill="var(--color-slate)" rx="2" />
      <rect x="100" y="52" width="14" height="71" fill="var(--color-orange)" rx="2" />

      {/* TEXT: event */}
      {/* e harfi (birinci) */}
      <path d="M180,88 H148 c0,-20 30,-20 30,0 c0,20 -30,20 -30,20 h30" fill="none" stroke="var(--color-slate)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* v harfi */}
      <path d="M198,52 v48 A 15 15 0 0 0 213,115 A 15 15 0 0 0 228,100 V52" fill="none" stroke="var(--color-slate)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* e harfi (ikinci) */}
      <path d="M276,88 H244 c0,-20 30,-20 30,0 c0,20 -30,20 -30,20 h30" fill="none" stroke="var(--color-slate)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* n harfi */}
      <path d="M294,123 V72 A 15 15 0 0 1 309,57 A 15 15 0 0 1 324,72 V123" fill="none" stroke="var(--color-slate)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* t harfi */}
      <path d="M342,52 h20 M352,52 V123" fill="none" stroke="var(--color-slate)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const Monogram = ({ className = '', height = 80, width = 'auto' }) => {
  return (
    <svg 
      viewBox="0 0 135 150" 
      height={height} 
      width={width}
      className={`monogram-svg ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sol 'i' Harfi */}
      <rect x="20" y="30" width="14" height="18" fill="var(--color-slate)" rx="2" />
      <path d="M27,52 V105 A 13 13 0 0 1 14,118" fill="none" stroke="var(--color-orange)" strokeWidth="14" strokeLinecap="round"/>
      
      {/* Orta 'y' Harfi */}
      <path d="M52,52 v38 A 15 15 0 0 0 67,105 A 15 15 0 0 0 82,90 V52 M82,90 v23 A 10 10 0 0 1 72,123" fill="none" stroke="var(--color-orange)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Sağ 'i' Harfi */}
      <rect x="100" y="30" width="14" height="18" fill="var(--color-slate)" rx="2" />
      <rect x="100" y="52" width="14" height="71" fill="var(--color-orange)" rx="2" />
    </svg>
  );
};
