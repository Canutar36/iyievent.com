import React, { useState, useRef, useEffect } from 'react';

const projectImages = {
  1: '/assets/event-1a.webp',
  2: '/assets/event-1b.webp',
  3: '/assets/event-2a.webp',
  4: '/assets/event-2b.webp',
  5: '/assets/event-3a.webp',
  6: '/assets/event-3b.webp',
};

const useInView = (threshold = 0.1) => {
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

const Portfolio = ({ t }) => {
  const [sectionRef, inView] = useInView(0.05);
  const [filter, setFilter] = useState('all');
  const [hovered, setHovered] = useState(null);
  const [modal, setModal] = useState(null);

  const filters = [
    { key: 'all', label: t.portfolio.filterAll },
    { key: 'wedding', label: t.portfolio.filterWeddings },
    { key: 'corporate', label: t.portfolio.filterCorporate },
    { key: 'private', label: t.portfolio.filterPrivate },
  ];

  const projects = t.portfolio.projects;
  const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  return (
    <section id="portfolio" ref={sectionRef} className="snap-section" style={{ background: 'var(--color-cream-light)' }}>
      <div className="container">
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
            }}>{t.portfolio.subtitle}</span>
            <div style={{ width: '32px', height: '1px', background: 'var(--color-orange)' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: 'var(--color-slate)',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.15s',
          }}>
            {t.portfolio.title}
          </h2>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '0.5rem',
          marginBottom: '4rem', flexWrap: 'wrap',
          opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease 0.25s',
        }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '0.7rem 1.6rem', border: 'none', cursor: 'pointer',
              background: filter === f.key ? 'var(--color-slate)' : 'transparent',
              color: filter === f.key ? 'var(--color-cream)' : 'var(--color-slate-medium)',
              borderBottom: filter === f.key ? '2px solid var(--color-orange)' : '2px solid transparent',
              transition: 'all 0.3s ease',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem',
        }} className="portfolio-grid">
          {filtered.map((project, i) => (
            <div key={project.id}
              onMouseEnter={() => setHovered(project.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setModal(project)}
              style={{
                position: 'relative', overflow: 'hidden',
                height: '380px', cursor: 'pointer',
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(30px)',
                transition: `all 0.7s ease ${0.1 + i * 0.1}s`,
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${projectImages[project.id]})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                transform: hovered === project.id ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.7s cubic-bezier(0.25,1,0.5,1)',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: hovered === project.id
                  ? 'linear-gradient(to top, rgba(20,26,27,0.92) 50%, rgba(20,26,27,0.4) 100%)'
                  : 'linear-gradient(to top, rgba(20,26,27,0.75) 30%, transparent 100%)',
                transition: 'background 0.5s ease',
              }} />
              <div style={{
                position: 'absolute', inset: 0, padding: '2rem',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--color-orange)', marginBottom: '0.5rem',
                }}>{project.venue}</div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 500,
                  color: 'var(--color-cream)', marginBottom: '0.3rem',
                }}>{project.title}</h3>
                <p style={{
                  fontSize: '0.85rem', color: 'rgba(246,243,234,0.7)',
                  marginBottom: '1.2rem', fontStyle: 'italic',
                }}>{project.subtitle}</p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--color-orange)',
                  opacity: hovered === project.id ? 1 : 0,
                  transform: hovered === project.id ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.35s ease',
                }}>
                  <i className="fas fa-expand-alt" style={{ fontSize: '0.75rem' }} />
                  {t.portfolio.viewProject}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 5000,
          background: 'rgba(20,26,27,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
          animation: 'fadeInOverlay 0.3s ease',
        }}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div style={{
            background: 'var(--color-cream-light)', maxWidth: '860px', width: '100%',
            overflow: 'hidden', position: 'relative',
            animation: 'slideUpModal 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* Close */}
            <button onClick={() => setModal(null)} style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10,
              background: 'rgba(20,26,27,0.8)', border: 'none', cursor: 'pointer',
              width: '36px', height: '36px', color: 'var(--color-cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', transition: 'background 0.25s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-orange)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,26,27,0.8)'}
            >
              <i className="fas fa-times" />
            </button>

            {/* Image */}
            <div style={{
              height: '320px',
              backgroundImage: `url(${projectImages[modal.id]})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
            {/* Content */}
            <div style={{ padding: '2.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--color-orange)', marginBottom: '0.6rem',
              }}>{modal.subtitle}</div>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 500,
                color: 'var(--color-slate)', marginBottom: '1.5rem',
              }}>{modal.title}</h2>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem',
                marginBottom: '1.5rem',
              }} className="modal-details-grid">
                {[
                  { label: t.portfolio.modal.location, value: modal.location, icon: 'fas fa-map-marker-alt' },
                  { label: t.portfolio.modal.venue, value: modal.venue, icon: 'fas fa-building' },
                  { label: t.portfolio.modal.guests, value: modal.guests, icon: 'fas fa-users' },
                  { label: t.portfolio.modal.design, value: modal.design, icon: 'fas fa-palette' },
                ].map(detail => (
                  <div key={detail.label} style={{
                    padding: '1rem', background: 'var(--color-cream)',
                    border: '1px solid var(--color-cream-dark)',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'var(--color-orange)', marginBottom: '0.4rem',
                    }}>
                      <i className={detail.icon} style={{ fontSize: '0.65rem' }} />
                      {detail.label}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
                      fontWeight: 500, color: 'var(--color-slate)',
                    }}>{detail.value}</div>
                  </div>
                ))}
              </div>
              <p style={{ lineHeight: 1.8 }}>{modal.desc}</p>
            </div>
          </div>
          <style>{`
            @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUpModal { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
            @media (max-width: 768px) {
              .portfolio-grid { grid-template-columns: 1fr !important; }
              .modal-details-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
