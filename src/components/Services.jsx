import React, { useState, useRef, useEffect } from 'react';

const slides = [
  {
    left: { img: '/assets/event-1a.webp', title: 'Film Galası', year: '2024' },
    right: { img: '/assets/event-1b.webp', title: 'Kurumsal Gala', year: '2024' },
  },
  {
    left: { img: '/assets/event-2a.webp', title: 'Düğün Daveti', year: '2023' },
    right: { img: '/assets/event-2b.webp', title: 'Lansman Partisi', year: '2023' },
  },
  {
    left: { img: '/assets/event-3a.webp', title: 'Özel Kutlama', year: '2024' },
    right: { img: '/assets/event-3b.webp', title: 'Tematik Gece', year: '2023' },
  },
];

const Services = ({ t }) => {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState('next');

  const goTo = (dir) => {
    if (transitioning) return;
    setTransitioning(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrent(c => (c + dir + slides.length) % slides.length);
      setTransitioning(false);
    }, 500);
  };

  const goToSlide = (i) => {
    if (transitioning || i === current) return;
    setTransitioning(true);
    setDirection(i > current ? 'next' : 'prev');
    setTimeout(() => {
      setCurrent(i);
      setTransitioning(false);
    }, 500);
  };

  // Klavye okları
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goTo(-1);
      if (e.key === 'ArrowRight') goTo(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [transitioning]);

  const slide = slides[current];

  return (
    <section id="services" className="snap-section" style={{
      position: 'relative', overflow: 'hidden', background: '#111',
    }}>
      {/* Başlık — Üstte ortada */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        textAlign: 'center', padding: '3rem 2rem 0',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'var(--color-orange)',
        }}>{t.services.subtitle}</span>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: 'var(--color-cream)',
          marginTop: '0.8rem',
        }}>{t.services.splitTitle}</h2>
      </div>

      {/* Split Container */}
      <div style={{
        display: 'flex', height: '100%',
        transform: transitioning
          ? direction === 'next' ? 'translateX(-2%)' : 'translateX(2%)'
          : 'translateX(0)',
        opacity: transitioning ? 0.9 : 1,
        transition: 'all 0.5s cubic-bezier(0.25,1,0.5,1)',
      }}>
        {/* Sol Yarı */}
        <div style={{
          flex: 1, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.left.img})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            transition: 'background-image 0.5s ease',
          }} />
          {/* Karartma */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)',
          }} />
          {/* Yazı — Sol alt */}
          <div style={{
            position: 'absolute', bottom: '5rem', left: '3rem', zIndex: 2,
          }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
              fontWeight: 400, color: 'var(--color-cream)', marginBottom: '0.3rem',
            }}>{slide.left.title}</h3>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.15em', color: 'var(--color-orange)',
            }}>{slide.left.year}</span>
          </div>
        </div>

        {/* Orta Çizgi */}
        <div style={{
          width: '1px', background: 'rgba(246,243,234,0.15)',
          position: 'relative', zIndex: 5, flexShrink: 0,
        }} />

        {/* Sağ Yarı */}
        <div style={{
          flex: 1, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.right.img})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            transition: 'background-image 0.5s ease',
          }} />
          {/* Karartma */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)',
          }} />
          {/* Yazı — Sağ alt */}
          <div style={{
            position: 'absolute', bottom: '5rem', right: '3rem', zIndex: 2,
            textAlign: 'right',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
              fontWeight: 400, color: 'var(--color-cream)', marginBottom: '0.3rem',
            }}>{slide.right.title}</h3>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.15em', color: 'var(--color-orange)',
            }}>{slide.right.year}</span>
          </div>
        </div>
      </div>

      {/* Sol Ok */}
      <button onClick={() => goTo(-1)} style={{
        position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)',
        zIndex: 10, background: 'none',
        border: '1px solid rgba(246,243,234,0.3)',
        width: '48px', height: '48px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-cream)', fontSize: '1rem',
        transition: 'all 0.3s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-orange)'; e.currentTarget.style.color = 'var(--color-orange)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(246,243,234,0.3)'; e.currentTarget.style.color = 'var(--color-cream)'; }}
      >
        <i className="fas fa-arrow-left" />
      </button>

      {/* Sağ Ok */}
      <button onClick={() => goTo(1)} style={{
        position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)',
        zIndex: 10, background: 'none',
        border: '1px solid rgba(246,243,234,0.3)',
        width: '48px', height: '48px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-cream)', fontSize: '1rem',
        transition: 'all 0.3s ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-orange)'; e.currentTarget.style.color = 'var(--color-orange)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(246,243,234,0.3)'; e.currentTarget.style.color = 'var(--color-cream)'; }}
      >
        <i className="fas fa-arrow-right" />
      </button>

      {/* Noktalar — Alt orta */}
      <div style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', gap: '0.6rem',
      }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goToSlide(i)} style={{
            width: i === current ? '28px' : '8px', height: '8px',
            background: i === current ? 'var(--color-orange)' : 'rgba(246,243,234,0.3)',
            border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0,
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </section>
  );
};

export default Services;
