import React, { useState, useEffect } from 'react';
import { Monogram } from './Logo';

const Preloader = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 2200);
    const timer2 = setTimeout(() => {
      setVisible(false);
      onFinish && onFinish();
    }, 2800);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--color-slate-deep)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '1.5rem',
      transition: 'opacity 0.6s ease',
      opacity: fadeOut ? 0 : 1,
      pointerEvents: fadeOut ? 'none' : 'all',
    }}>
      <div className="glow-logo" style={{ animation: 'preloaderPulse 1.5s ease-in-out infinite alternate' }}>
        <Monogram height={90} />
      </div>
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.1rem',
        fontWeight: 300,
        color: 'var(--color-cream-dark)',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        animation: 'fadeIn 1s ease 0.5s both',
      }}>
        iyi event
      </div>
      <div style={{
        width: '60px', height: '1px',
        background: 'linear-gradient(to right, transparent, var(--color-orange), transparent)',
        animation: 'expandLine 1.5s ease-out 0.8s both',
      }} />
      <style>{`
        @keyframes preloaderPulse {
          0% { filter: drop-shadow(0 0 4px rgba(240,90,40,0.2)); transform: scale(0.97); }
          100% { filter: drop-shadow(0 0 22px rgba(240,90,40,0.7)); transform: scale(1.02); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandLine {
          from { width: 0px; opacity: 0; }
          to { width: 60px; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
