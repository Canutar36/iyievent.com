import React, { useEffect, useRef, useState } from 'react';

const values = [
  { icon: 'fas fa-paint-brush', key: 'creativity' },
  { icon: 'fas fa-crosshairs', key: 'precision' },
  { icon: 'fas fa-gem', key: 'exclusivity' },
];

const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const About = ({ t }) => {
  const [sectionRef, inView] = useInView(0.15);

  return (
    <section id="about" ref={sectionRef} className="snap-section" style={{ background: 'var(--color-cream)' }}>
      <div className="container">
        {/* Section Label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem',
          opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)',
          transition: 'all 0.8s ease',
        }}>
          <div style={{ width: '40px', height: '1px', background: 'var(--color-orange)' }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)',
          }}>{t.about.subtitle}</span>
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center',
        }} className="about-grid">
          {/* Left: Title */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', lineHeight: 1.2,
              color: 'var(--color-slate)', marginBottom: '2rem',
              opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
              transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s',
            }}>
              {t.about.title}
            </h2>
            {/* Decorative line */}
            <div style={{
              width: inView ? '80px' : '0px', height: '2px',
              background: 'var(--color-orange)', marginBottom: '2rem',
              transition: 'width 1.2s ease 0.4s',
            }} />
          </div>

          {/* Right: Description */}
          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.3s',
          }}>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.8 }}>{t.about.desc1}</p>
            <p style={{ lineHeight: 1.8 }}>{t.about.desc2}</p>
          </div>
        </div>

        {/* Values Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2.5rem', marginTop: '5rem',
        }} className="values-grid">
          {values.map((v, i) => (
            <div key={v.key} style={{
              padding: '2.5rem',
              background: 'var(--color-cream-light)',
              border: '1px solid var(--color-cream-dark)',
              transition: 'all 0.4s ease',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(40px)',
              transitionDelay: `${0.2 + i * 0.15}s`,
              cursor: 'default',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-orange)';
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(240,90,40,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-cream-dark)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon */}
              <div style={{
                width: '52px', height: '52px',
                background: 'var(--color-orange-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
              }}>
                <i className={v.icon} style={{ color: 'var(--color-orange)', fontSize: '1.2rem' }} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.55rem', fontWeight: 500,
                color: 'var(--color-slate)', marginBottom: '0.8rem',
              }}>{t.about.values[v.key].title}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>{t.about.values[v.key].desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .values-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default About;
