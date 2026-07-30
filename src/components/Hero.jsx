import React, { useState, useEffect, useRef } from 'react';

const Hero = ({ t, lang }) => {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const scrollDown = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" style={{
      position: 'relative', height: '100vh', minHeight: '600px',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
        }}
      >
        {/* Şimdilik placeholder — gerçek video eklenecek */}
        <source src="/assets/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Fallback: Video yoksa koyu arka plan */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }} />

      {/* Dark Overlay — okunabilirlik için */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'rgba(20,26,27,0.55)',
      }} />

      {/* Gradient: alt kısım */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, height: '180px',
        background: 'linear-gradient(to top, rgba(20,26,27,0.7), transparent)',
      }} />

      {/* Content — Ortada Logo + Dekoratif Öğeler */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '0 2rem',
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Büyük Logo */}
        <img
          src="/assets/iyievent-logo.png"
          alt="iyi event"
          style={{
            height: 'clamp(50px, 8vw, 90px)',
            width: 'auto',
            marginBottom: '2.5rem',
            filter: 'brightness(0) invert(1)',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1s ease 0.3s',
          }}
        />

        {/* Dekoratif çizgi */}
        <div style={{
          width: '60px', height: '1px',
          background: 'var(--color-orange)',
          marginBottom: '2rem',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'all 0.8s ease 0.6s',
        }} />

        {/* Slogan */}
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
          fontWeight: 300, fontStyle: 'italic',
          color: 'rgba(246,243,234,0.85)',
          letterSpacing: '0.02em',
          lineHeight: 1.6,
          maxWidth: '600px',
          margin: 0,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s ease 0.8s',
        }}>
          {lang === 'tr'
            ? 'Anlarınızı Sanata Dönüştürüyoruz'
            : 'Transforming Your Moments into Art'}
        </p>

        {/* Alt bilgi */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem', fontWeight: 600,
          letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'rgba(246,243,234,0.45)',
          marginTop: '2.5rem',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s ease 1s',
        }}>
          {lang === 'tr' ? 'İstanbul · 2010\'dan Beri' : 'Istanbul · Since 2010'}
        </p>
      </div>

      {/* Scroll Indicator — Ortada alt */}
      <button onClick={scrollDown} style={{
        position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 3, background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
        color: 'rgba(246,243,234,0.5)',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s ease 1.2s',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 600,
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          {lang === 'tr' ? 'Keşfet' : 'Discover'}
        </span>
        <div style={{ animation: 'scrollBounce 1.8s ease infinite' }}>
          <i className="fas fa-chevron-down" style={{ fontSize: '0.8rem' }} />
        </div>
        <style>{`
          @keyframes scrollBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
        `}</style>
      </button>

      {/* Sol alt köşe — İletişim bilgisi */}
      <div style={{
        position: 'absolute', bottom: '2.5rem', left: '3rem',
        zIndex: 3, display: 'flex', flexDirection: 'column', gap: '0.3rem',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s ease 1.3s',
      }} className="hero-side-info">
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'rgba(246,243,234,0.4)',
        }}>
          {lang === 'tr' ? 'İletişim' : 'Contact'}
        </span>
        <a href="tel:+902129939939" style={{
          fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
          color: 'rgba(246,243,234,0.7)', textDecoration: 'none',
          transition: 'color 0.3s',
        }}
          onMouseEnter={e => e.target.style.color = 'var(--color-orange)'}
          onMouseLeave={e => e.target.style.color = 'rgba(246,243,234,0.7)'}
        >
          0212 993 99 39
        </a>
      </div>

      {/* Sağ alt köşe — Sosyal medya */}
      <div style={{
        position: 'absolute', bottom: '2.5rem', right: '3rem',
        zIndex: 3, display: 'flex', gap: '1.2rem',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s ease 1.3s',
      }} className="hero-side-info">
        {[
          { icon: 'fab fa-instagram', href: 'https://instagram.com/iyievent' },
          { icon: 'fab fa-linkedin-in', href: 'https://linkedin.com/company/iyievent' },
          { icon: 'fab fa-pinterest-p', href: 'https://pinterest.com/iyievent' },
        ].map((s, i) => (
          <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
            style={{
              color: 'rgba(246,243,234,0.5)', fontSize: '0.95rem',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--color-orange)'}
            onMouseLeave={e => e.target.style.color = 'rgba(246,243,234,0.5)'}
          >
            <i className={s.icon} />
          </a>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-side-info { display: none !important; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
