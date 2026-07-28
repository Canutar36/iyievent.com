import React from 'react';

const LOGO_SRC = '/assets/iyievent-logo.png';

const boyut = (v) => (typeof v === 'number' ? `${v}px` : v);

/**
 * Tam "iyi event" logosu (gerçek marka PNG'si, saydam arka plan).
 * height ile ölçeklenir; genişlik oranı korunur.
 */
export const Logo = ({ className = '', height = 45, width = 'auto', style = {} }) => {
  return (
    <img
      src={LOGO_SRC}
      alt="iyi event"
      className={`logo-img ${className}`}
      style={{ height: boyut(height), width: width === 'auto' ? 'auto' : boyut(width), display: 'block', objectFit: 'contain', ...style }}
    />
  );
};

/**
 * Kompakt kullanım (sidebar vb.). Aynı marka logosu; dar alanlarda daha küçük height ver.
 */
export const Monogram = ({ className = '', height = 40, width = 'auto', style = {} }) => {
  return (
    <img
      src={LOGO_SRC}
      alt="iyi event"
      className={`monogram-img ${className}`}
      style={{ height: boyut(height), width: width === 'auto' ? 'auto' : boyut(width), display: 'block', objectFit: 'contain', ...style }}
    />
  );
};
