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
    <section ref={ref} style={{ background: 'var(--color-slate)', padding: '5rem 0' }}>
      <div className="container">
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

const Testimonials = ({ t, lang }) => {
  const [sectionRef, inView] = useInView(0.1);
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const { items } = t.testimonials;

  const go = (dir) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(c => (c + dir + items.length) % items.length);
      setTransitioning(false);
    }, 350);
  };

  return (
    <section id="testimonials" ref={sectionRef} className="snap-section" style={{ background: 'var(--color-cream)' }}>
      <Metrics lang={lang} />
      <div className="container" style={{ marginTop: '8rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem',
            opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease',
          }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--color-orange)' }} />
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)',
            }}>{t.testimonials.subtitle}</span>
            <div style={{ width: '32px', height: '1px', background: 'var(--color-orange)' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: 'var(--color-slate)',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.15s',
          }}>
            {t.testimonials.title}
          </h2>
        </div>

        {/* Testimonial Card */}
        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          {/* Quote Icon */}
          <div style={{
            fontSize: '5rem', lineHeight: 1, color: 'var(--color-orange)',
            opacity: 0.25, fontFamily: 'Georgia, serif', marginBottom: '1.5rem',
          }}>"</div>
          <blockquote style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.2rem, 2vw, 1.55rem)',
            fontWeight: 300, fontStyle: 'italic', lineHeight: 1.7,
            color: 'var(--color-slate)', marginBottom: '2.5rem',
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
            transition: 'all 0.35s ease',
          }}>
            {items[current].quote}
          </blockquote>
          {/* Author */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
            opacity: transitioning ? 0 : 1, transition: 'opacity 0.35s ease',
          }}>
            <div style={{ width: '40px', height: '1px', background: 'var(--color-orange)', marginBottom: '0.8rem' }} />
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700,
              letterSpacing: '0.05em', color: 'var(--color-slate)',
            }}>{items[current].name}</div>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.82rem',
              color: 'var(--color-slate-medium)',
            }}>{items[current].role}</div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}>
            <button onClick={() => go(-1)} style={{
              background: 'none', border: '1px solid var(--color-cream-dark)',
              width: '44px', height: '44px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-slate-medium)', transition: 'all 0.25s ease',
              fontSize: '0.85rem',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-orange)'; e.currentTarget.style.color = 'var(--color-orange)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-cream-dark)'; e.currentTarget.style.color = 'var(--color-slate-medium)'; }}
            ><i className="fas fa-arrow-left" /></button>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {items.map((_, i) => (
                <button key={i} onClick={() => { if (!transitioning) { setTransitioning(true); setTimeout(() => { setCurrent(i); setTransitioning(false); }, 350); } }}
                  style={{
                    width: i === current ? '24px' : '8px', height: '8px',
                    background: i === current ? 'var(--color-orange)' : 'var(--color-cream-dark)',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0,
                    transition: 'all 0.3s ease',
                  }} />
              ))}
            </div>
            <button onClick={() => go(1)} style={{
              background: 'none', border: '1px solid var(--color-cream-dark)',
              width: '44px', height: '44px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-slate-medium)', transition: 'all 0.25s ease',
              fontSize: '0.85rem',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-orange)'; e.currentTarget.style.color = 'var(--color-orange)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-cream-dark)'; e.currentTarget.style.color = 'var(--color-slate-medium)'; }}
            ><i className="fas fa-arrow-right" /></button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
