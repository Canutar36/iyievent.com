import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

const Header = ({ t, lang, setLang }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
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

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(246,243,234,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(42,53,56,0.08)' : '1px solid transparent',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: scrolled ? '72px' : '88px',
        transition: 'height 0.4s ease',
      }}>
        {/* Logo */}
        <button onClick={() => scrollTo('hero')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Logo height={scrolled ? 36 : 44} />
        </button>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-slate)',
              padding: '0.4rem 0',
              position: 'relative',
              transition: 'color 0.25s ease',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--color-orange)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-slate)'}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Language Switcher */}
          <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-slate)', background: 'none',
            border: '1px solid rgba(42,53,56,0.3)',
            padding: '0.4rem 0.8rem', cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { e.target.style.color = 'var(--color-orange)'; e.target.style.borderColor = 'var(--color-orange)'; }}
            onMouseLeave={e => { e.target.style.color = 'var(--color-slate)'; e.target.style.borderColor = 'rgba(42,53,56,0.3)'; }}
          >
            {t.nav.langSelect}
          </button>
          {/* Müşteri Girişi */}
          <a href="https://hesap.iyievent.com" className="desktop-nav" style={{
            fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-slate)', background: 'none',
            border: '1px solid rgba(42,53,56,0.3)',
            padding: '0.4rem 0.8rem', cursor: 'pointer',
            textDecoration: 'none', transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { e.target.style.color = 'var(--color-orange)'; e.target.style.borderColor = 'var(--color-orange)'; }}
            onMouseLeave={e => { e.target.style.color = 'var(--color-slate)'; e.target.style.borderColor = 'rgba(42,53,56,0.3)'; }}
          >
            Müşteri Girişi
          </a>
          {/* CTA Button */}
          <button onClick={() => scrollTo('contact')} className="btn-primary desktop-nav" style={{ padding: '0.7rem 1.6rem', fontSize: '0.78rem' }}>
            {t.nav.cta}
            <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem' }} />
          </button>
          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'none', flexDirection: 'column', gap: '5px', padding: '4px',
            }}
          >
            <span style={{ width: 24, height: 2, background: menuOpen ? 'var(--color-orange)' : 'var(--color-slate)', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ width: 24, height: 2, background: menuOpen ? 'var(--color-orange)' : 'var(--color-slate)', display: 'block', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ width: 24, height: 2, background: menuOpen ? 'var(--color-orange)' : 'var(--color-slate)', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(246,243,234,0.97)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(42,53,56,0.08)',
          padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
        }}>
          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: '1.1rem',
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-slate)', textAlign: 'left', padding: '0.5rem 0',
              borderBottom: '1px solid rgba(42,53,56,0.08)',
            }}>
              {link.label}
            </button>
          ))}
          <a href="https://hesap.iyievent.com" style={{
            display: 'block', fontFamily: 'var(--font-display)', fontSize: '1.1rem',
            fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--color-orange)', textAlign: 'left', padding: '0.5rem 0',
            borderBottom: '1px solid rgba(42,53,56,0.08)',
            textDecoration: 'none',
          }}>
            Müşteri Girişi
          </a>
          <button onClick={() => scrollTo('contact')} className="btn-primary" style={{ marginTop: '0.5rem', textAlign: 'center', justifyContent: 'center' }}>
            {t.nav.cta}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
