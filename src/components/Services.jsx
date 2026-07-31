import React, { useEffect, useRef, useState } from 'react';

const serviceImages = [
  { key: 'wedding', bg: '/assets/wedding.webp', icon: 'fas fa-ring' },
  { key: 'gala',    bg: '/assets/gala.webp',    icon: 'fas fa-trophy' },
  { key: 'soiree',  bg: '/assets/soiree.webp',  icon: 'fas fa-glass-cheers' },
  { key: 'destination', bg: '/assets/wedding.webp', icon: 'fas fa-map-marked-alt' },
];

const useInView = (threshold = 0.15) => {
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

const Services = ({ t }) => {
  const [sectionRef, inView] = useInView(0.1);
  const [hovered, setHovered] = useState(null);

  return (
    <section id="services" ref={sectionRef} className="snap-section" style={{ background: 'var(--color-slate-dark)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem',
            opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease',
          }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--color-orange)' }} />
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)',
            }}>{t.services.subtitle}</span>
            <div style={{ width: '32px', height: '1px', background: 'var(--color-orange)' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: 'var(--color-cream)',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.2s',
          }}>
            {t.services.title}
          </h2>
        </div>

        {/* Services Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '2px',
        }} className="services-grid">
          {serviceImages.map((svc, i) => {
            const item = t.services.items[i];
            const isHovered = hovered === i;
            return (
              <div key={svc.key}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  height: '420px', cursor: 'default',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateY(40px)',
                  transition: `all 0.8s ease ${0.1 + i * 0.12}s`,
                }}
              >
                {/* Background */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${svc.bg})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.7s cubic-bezier(0.25,1,0.5,1)',
                }} />
                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isHovered
                    ? 'linear-gradient(to top, rgba(20,26,27,0.95) 40%, rgba(20,26,27,0.5) 100%)'
                    : 'linear-gradient(to top, rgba(20,26,27,0.88) 20%, rgba(20,26,27,0.4) 100%)',
                  transition: 'background 0.5s ease',
                }} />
                {/* Content */}
                <div style={{
                  position: 'absolute', inset: 0, padding: '2.5rem',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                  {/* Number */}
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '0.72rem',
                    fontWeight: 700, letterSpacing: '0.2em', color: 'var(--color-orange)',
                    marginBottom: '0.8rem',
                    opacity: isHovered ? 1 : 0.7,
                    transition: 'opacity 0.3s ease',
                  }}>0{i + 1}</div>
                  {/* Icon */}
                  <div style={{
                    width: '44px', height: '44px', marginBottom: '1.2rem',
                    background: 'var(--color-orange-light)',
                    border: '1px solid rgba(240,90,40,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                  }}>
                    <i className={svc.icon} style={{ color: 'var(--color-orange)', fontSize: '1rem' }} />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 500,
                    color: 'var(--color-cream)', marginBottom: '0.8rem',
                  }}>{item.title}</h3>
                  <p style={{
                    fontSize: '0.92rem', color: 'rgba(246,243,234,0.75)', lineHeight: 1.7,
                    maxHeight: isHovered ? '100px' : '0px', overflow: 'hidden',
                    opacity: isHovered ? 1 : 0,
                    transition: 'all 0.5s cubic-bezier(0.25,1,0.5,1)',
                    marginBottom: isHovered ? '1.5rem' : '0',
                  }}>{item.desc}</p>
                  <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                      fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: 'var(--color-orange)',
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                      transition: 'all 0.4s ease',
                    }}>
                    {t.services.cta}
                    <i className="fas fa-long-arrow-alt-right" style={{ fontSize: '0.9rem' }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default Services;
