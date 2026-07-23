import React, { useState, useEffect } from 'react';

const slides = [
  {
    image: '/assets/wedding.jpg',
    category: 'tr:Düğün & Tören | en:Wedding & Ceremony',
    catKey: 'wedding',
  },
  {
    image: '/assets/gala.jpg',
    category: 'tr:Kurumsal Gala | en:Corporate Gala',
    catKey: 'gala',
  },
  {
    image: '/assets/soiree.jpg',
    category: 'tr:Özel Davet | en:Private Soiree',
    catKey: 'soiree',
  },
];

const slideCategories = {
  wedding: { tr: 'Düğün & Tören', en: 'Wedding & Ceremony' },
  gala: { tr: 'Kurumsal Gala', en: 'Corporate Gala' },
  soiree: { tr: 'Özel Davet', en: 'Private Soiree' },
};

const Hero = ({ t, lang }) => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [current]);

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c + 1) % slides.length);
      setAnimating(false);
    }, 600);
  };

  const handleDot = (idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 600);
  };

  const scrollDown = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const slide = slides[current];
  const catLabel = slideCategories[slide.catKey][lang];

  return (
    <section id="hero" style={{ position: 'relative', height: '100vh', minHeight: '700px', overflow: 'hidden', padding: 0 }}>
      {/* Background Images */}
      {slides.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${s.image})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'opacity 0.8s ease, transform 8s ease',
          opacity: i === current ? 1 : 0,
          transform: i === current ? 'scale(1.04)' : 'scale(1)',
          zIndex: 0,
        }} />
      ))}

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to right, rgba(20,26,27,0.82) 40%, rgba(20,26,27,0.3) 100%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, height: '200px',
        background: 'linear-gradient(to top, rgba(20,26,27,0.6), transparent)',
      }} />

      {/* Content */}
      <div className="container" style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingTop: '100px',
      }}>
        {/* Category Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '2rem', opacity: animating ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}>
          <div style={{ width: '32px', height: '1px', background: 'var(--color-orange)' }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)',
          }}>{catLabel}</span>
        </div>

        {/* Title */}
        <div style={{ overflow: 'hidden', marginBottom: '0.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300,
            fontSize: 'clamp(3rem, 6vw, 6.5rem)', lineHeight: 1.1,
            color: 'var(--color-cream)', margin: 0,
            transform: animating ? 'translateY(30px)' : 'translateY(0)',
            opacity: animating ? 0 : 1,
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {t.hero.title1}
          </h1>
        </div>
        <div style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 500, fontStyle: 'italic',
            fontSize: 'clamp(3rem, 6vw, 6.5rem)', lineHeight: 1.1,
            color: 'var(--color-cream)', margin: 0,
            transform: animating ? 'translateY(30px)' : 'translateY(0)',
            opacity: animating ? 0 : 1,
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}>
            {t.hero.title2}
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '1.1rem',
          color: 'rgba(246,243,234,0.8)', maxWidth: '520px', lineHeight: 1.7, marginBottom: '3rem',
          opacity: animating ? 0 : 1, transition: 'opacity 0.7s ease 0.2s',
        }}>
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
          <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary" style={{ color: 'var(--color-white)' }}>
            {t.hero.cta}
            <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }} />
          </button>
          <button onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              color: 'rgba(246,243,234,0.85)', background: 'transparent',
              border: '1px solid rgba(246,243,234,0.4)',
              padding: '1.1rem 2.2rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-orange)'; e.currentTarget.style.borderColor = 'var(--color-orange)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(246,243,234,0.85)'; e.currentTarget.style.borderColor = 'rgba(246,243,234,0.4)'; }}
          >
            <i className="far fa-images" style={{ fontSize: '0.85rem' }} />
            Portfolyo
          </button>
        </div>
      </div>

      {/* Slider Dots */}
      <div style={{
        position: 'absolute', bottom: '3.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 3, display: 'flex', gap: '0.6rem',
      }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => handleDot(i)} style={{
            width: i === current ? '28px' : '8px', height: '8px',
            background: i === current ? 'var(--color-orange)' : 'rgba(246,243,234,0.4)',
            border: 'none', cursor: 'pointer', padding: 0,
            borderRadius: '4px', transition: 'all 0.4s ease',
          }} />
        ))}
      </div>

      {/* Scroll Indicator */}
      <button onClick={scrollDown} style={{
        position: 'absolute', bottom: '3rem', right: '4rem',
        zIndex: 3, background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        color: 'rgba(246,243,234,0.6)', fontSize: '0.7rem',
        fontFamily: 'var(--font-display)', letterSpacing: '0.15em', textTransform: 'uppercase',
      }}>
        <span>{t.hero.scrollDown}</span>
        <div style={{ animation: 'scrollBounce 1.5s ease infinite' }}>
          <i className="fas fa-chevron-down" />
        </div>
        <style>{`
          @keyframes scrollBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
        `}</style>
      </button>
    </section>
  );
};

export default Hero;
