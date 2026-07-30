import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

const Header = ({ t, lang, setLang }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: t.nav.about, id: 'about' },
    { label: t.nav.services, id: 'services' },
    { label: t.nav.portfolio, id: 'portfolio' },
    { label: t.nav.contact, id: 'contact' },
  ];

  // Scroll durumuna göre renkler
  const textColor = scrolled ? 'var(--color-slate)' : 'rgba(246,243,234,0.9)';
  const textColorHover = 'var(--color-orange)';
  const borderColor = scrolled ? 'rgba(42,53,56,0.3)' : 'rgba(246,243,234,0.35)';
  const borderColorHover = 'var(--color-orange)';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      transition: 'all 0.5s ease',
      background: scrolled ? 'rgba(246,243,234,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(42,53,56,0.06)' : '1px solid transparent',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: scrolled ? '70px' : '84px',
        transition: 'height 0.5s ease',
      }}>
        {/* Sol: Hamburger (mobilde) / Logo (masaüstünde) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Hamburger — her zaman görünür, mobilde menüyü açar */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hero-hamburger"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px',
              zIndex: 10,
            }}
          >
            <span style={{
              width: 22, height: 1.5,
              background: menuOpen ? 'var(--color-orange)' : textColor,
              display: 'block', transition: 'all 0.3s',
              transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
            }} />
            <span style={{
              width: 22, height: 1.5,
              background: menuOpen ? 'var(--color-orange)' : textColor,
              display: 'block', transition: 'all 0.3s',
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              width: 22, height: 1.5,
              background: menuOpen ? 'var(--color-orange)' : textColor,
              display: 'block', transition: 'all 0.3s',
              transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
            }} />
          </button>

          {/* Masaüstü nav — sadece geniş ekranda */}
          <nav className="desktop-nav-hero" style={{
            display: 'flex', alignItems: 'center', gap: '2.2rem',
          }}>
            {navLinks.map(link => (
              <button key={link.id} onClick={() => scrollTo(link.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: textColor,
                padding: '0.4rem 0',
                transition: 'color 0.3s ease',
              }}
                onMouseEnter={e => e.target.style.color = textColorHover}
                onMouseLeave={e => e.target.style.color = textColor}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Merkez: Logo */}
        <button onClick={() => scrollTo('hero')} style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <Logo height={scrolled ? 34 : 42} style={{
            filter: scrolled ? 'none' : 'brightness(0) invert(1)',
            transition: 'filter 0.5s ease',
          }} />
        </button>

        {/* Sağ: Dil + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {/* Dil Değiştirici */}
          <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: textColor, background: 'none',
            border: `1px solid ${borderColor}`,
            padding: '0.35rem 0.7rem', cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.target.style.color = textColorHover; e.target.style.borderColor = borderColorHover; }}
            onMouseLeave={e => { e.target.style.color = textColor; e.target.style.borderColor = borderColor; }}
          >
            {t.nav.langSelect}
          </button>

          {/* CTA — Masaüstü */}
          <button onClick={() => scrollTo('contact')} className="btn-primary desktop-nav-hero" style={{
            padding: '0.65rem 1.5rem', fontSize: '0.72rem',
            background: scrolled ? undefined : 'transparent',
            border: scrolled ? undefined : '1px solid rgba(246,243,234,0.4)',
            color: scrolled ? undefined : 'rgba(246,243,234,0.9)',
          }}>
            {t.nav.cta}
            <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, top: 0,
          background: 'rgba(20,26,27,0.97)', backdropFilter: 'blur(20px)',
          zIndex: 999,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '2rem',
        }}>
          {/* Kapat butonu */}
          <button onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', top: '1.5rem', right: '2rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(246,243,234,0.7)', fontSize: '1.5rem',
          }}>
            <i className="fas fa-xmark" />
          </button>

          {/* Logo */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Logo height={50} style={{ filter: 'brightness(0) invert(1)' }} />
          </div>

          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: '1.3rem',
              fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(246,243,234,0.85)', textAlign: 'center',
              padding: '0.5rem 0',
              transition: 'color 0.3s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--color-orange)'}
              onMouseLeave={e => e.target.style.color = 'rgba(246,243,234,0.85)'}
            >
              {link.label}
            </button>
          ))}

          <a href="https://hesap.iyievent.com" style={{
            fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-orange)', textDecoration: 'none',
            marginTop: '1rem',
          }}>
            Müşteri Girişi
          </a>

          <button onClick={() => scrollTo('contact')} className="btn-primary" style={{
            marginTop: '1rem', background: 'var(--color-orange)',
            color: 'white', padding: '0.9rem 2.5rem',
          }}>
            {t.nav.cta}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav-hero { display: none !important; }
        }
        @media (min-width: 901px) {
          .hero-hamburger { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
