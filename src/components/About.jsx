import React, { useRef, useState, useEffect } from 'react';

const About = ({ t }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={ref} className="snap-section" style={{
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Arka Plan Görseli */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(/assets/about-bg.webp)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* Karartma Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'rgba(20,26,27,0.6)',
      }} />

      {/* İçerik — Ortada */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '0 2rem',
        maxWidth: '900px',
      }}>
        {/* Alt başlık */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem',
          opacity: inView ? 1 : 0,
          transform: inView ? 'none' : 'translateY(20px)',
          transition: 'all 0.8s ease',
        }}>
          <div style={{ width: '40px', height: '1px', background: 'var(--color-orange)' }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'var(--color-orange)',
          }}>{t.about.subtitle}</span>
          <div style={{ width: '40px', height: '1px', background: 'var(--color-orange)' }} />
        </div>

        {/* Ana Başlık — Büyük Serif */}
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(1.8rem, 3.8vw, 3.2rem)', lineHeight: 1.45,
          color: 'var(--color-cream)', letterSpacing: '0.01em',
          opacity: inView ? 1 : 0,
          transform: inView ? 'none' : 'translateY(30px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
          margin: 0,
        }}>
          {t.about.heroTitle}
        </h2>

        {/* Dekoratif çizgi — alt kısım */}
        <div style={{
          width: inView ? '60px' : '0px', height: '1px',
          background: 'var(--color-orange)',
          margin: '2.5rem auto 0',
          transition: 'width 1s ease 0.5s',
        }} />
      </div>
    </section>
  );
};

export default About;
