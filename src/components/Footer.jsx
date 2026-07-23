import React, { useState } from 'react';
import { Logo } from './Logo';

const Footer = ({ t, lang }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickLinks = [
    { label: t.nav.about, id: 'about' },
    { label: t.nav.services, id: 'services' },
    { label: t.nav.portfolio, id: 'portfolio' },
    { label: t.nav.contact, id: 'contact' },
  ];

  const socials = [
    { icon: 'fab fa-instagram', href: '#' },
    { icon: 'fab fa-linkedin-in', href: '#' },
    { icon: 'fab fa-pinterest-p', href: '#' },
  ];

  return (
    <footer style={{ background: 'var(--color-slate-deep)', padding: '6rem 0 0' }}>
      <div className="container">
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '5rem',
          paddingBottom: '4rem',
        }} className="footer-grid">
          {/* Brand Column */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <Logo height={38} />
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontStyle: 'italic',
              fontWeight: 300, color: 'rgba(246,243,234,0.55)', lineHeight: 1.8,
              maxWidth: '320px', marginBottom: '2rem',
            }}>
              {t.footer.slogan}
            </p>
            {/* Socials */}
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              {socials.map(s => (
                <a key={s.icon} href={s.href} style={{
                  width: '40px', height: '40px',
                  border: '1px solid rgba(246,243,234,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(246,243,234,0.45)', fontSize: '0.9rem',
                  textDecoration: 'none', transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-orange)'; e.currentTarget.style.color = 'var(--color-orange)'; e.currentTarget.style.background = 'var(--color-orange-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(246,243,234,0.1)'; e.currentTarget.style.color = 'rgba(246,243,234,0.45)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--color-orange)', marginBottom: '1.5rem',
            }}>{t.footer.links}</div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {quickLinks.map(link => (
                <button key={link.id} onClick={() => scrollTo(link.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 300,
                  color: 'rgba(246,243,234,0.45)', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'color 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-cream)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(246,243,234,0.45)'; }}
                >
                  <i className="fas fa-arrow-right" style={{ fontSize: '0.6rem', color: 'var(--color-orange)', opacity: 0.6 }} />
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--color-orange)', marginBottom: '1.5rem',
            }}>{t.footer.newsletter}</div>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 300,
              color: 'rgba(246,243,234,0.5)', lineHeight: 1.7, marginBottom: '1.5rem',
            }}>{t.footer.newsletterDesc}</p>
            {subscribed ? (
              <div style={{
                color: 'var(--color-orange)', fontFamily: 'var(--font-display)',
                fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <i className="fas fa-check" />
                {lang === 'tr' ? 'Kaydedildi, teşekkürler.' : 'Subscribed, thank you.'}
              </div>
            ) : (
              <div style={{ display: 'flex' }}>
                <input
                  type="email" placeholder={t.footer.placeholderEmail}
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1, fontFamily: 'var(--font-sans)', fontSize: '0.88rem',
                    padding: '0.9rem 1rem',
                    background: 'rgba(246,243,234,0.05)',
                    border: '1px solid rgba(246,243,234,0.1)', borderRight: 'none',
                    color: 'var(--color-cream)', outline: 'none',
                    transition: 'border-color 0.25s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(240,90,40,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(246,243,234,0.1)'}
                />
                <button onClick={() => email && setSubscribed(true)} style={{
                  background: 'var(--color-orange)', border: '1px solid var(--color-orange)',
                  color: 'white', padding: '0.9rem 1.2rem', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  transition: 'background 0.25s',
                  whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-orange-dark)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-orange)'}
                >
                  {t.footer.subscribe}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(246,243,234,0.06)',
          padding: '1.8rem 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
            color: 'rgba(246,243,234,0.25)',
          }}>
            &copy; {new Date().getFullYear()} iyi event. {t.footer.rights}
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
            color: 'rgba(246,243,234,0.2)',
          }}>
            bilgi@iyievent.com &nbsp;|&nbsp; 0212 993 99 39
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
