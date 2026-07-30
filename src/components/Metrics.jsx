import React, { useEffect, useRef, useState } from 'react';

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

const metrics = [
  { value: '250+', label: { tr: 'Tamamlanan Etkinlik', en: 'Events Completed' }, icon: 'fas fa-calendar-check' },
  { value: '15+', label: { tr: 'Yıllık Deneyim', en: 'Years of Experience' }, icon: 'fas fa-award' },
  { value: '18',  label: { tr: 'Ülkede Hizmet', en: 'Countries Served' }, icon: 'fas fa-globe-europe' },
  { value: '98%', label: { tr: 'Memnuniyet Oranı', en: 'Satisfaction Rate' }, icon: 'fas fa-star' },
];

const Metrics = ({ lang }) => {
  const [ref, inView] = useInView(0.15);
  return (
    <section id="metrics" ref={ref} className="snap-section" style={{
      background: 'var(--color-slate)',
      display: 'flex', alignItems: 'center',
    }}>
      <div className="container" style={{ width: '100%' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem',
          textAlign: 'center',
        }} className="metrics-grid">
          {metrics.map((m, i) => (
            <div key={i} style={{
              padding: '2rem 1rem',
              borderRight: i < metrics.length - 1 ? '1px solid rgba(246,243,234,0.08)' : 'none',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(30px)',
              transition: `all 0.7s ease ${0.1 + i * 0.12}s`,
            }}>
              <i className={m.icon} style={{
                color: 'var(--color-orange)', fontSize: '1.3rem', marginBottom: '1.2rem', display: 'block',
              }} />
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                fontWeight: 400, color: 'var(--color-cream)', lineHeight: 1, marginBottom: '0.6rem',
              }}>{m.value}</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 600,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(246,243,234,0.5)',
              }}>{m.label[lang]}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .metrics-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </section>
  );
};

export default Metrics;
