import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';

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

const TOTAL_STEPS = 4;

const ContactForm = ({ t, lang }) => {
  const [sectionRef, inView] = useInView(0.05);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [formData, setFormData] = useState({
    eventType: '', scale: '', budget: '',
    name: '', email: '', phone: '', message: '',
  });

  const ts = t.contact;
  const formTs = ts.form;

  const stepOptions = [
    {
      key: 'eventType',
      title: formTs.steps.type.title,
      icon: 'fas fa-calendar-star',
      options: [formTs.steps.type.option1, formTs.steps.type.option2, formTs.steps.type.option3, formTs.steps.type.option4],
    },
    {
      key: 'scale',
      title: formTs.steps.scale.title,
      icon: 'fas fa-users',
      options: [formTs.steps.scale.option1, formTs.steps.scale.option2, formTs.steps.scale.option3, formTs.steps.scale.option4],
    },
    {
      key: 'budget',
      title: formTs.steps.budget.title,
      icon: 'fas fa-gem',
      options: [formTs.steps.budget.option1, formTs.steps.budget.option2, formTs.steps.budget.option3],
    },
  ];

  const handleOptionSelect = (key, value) => {
    setFormData(d => ({ ...d, [key]: value }));
    setTimeout(() => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)), 350);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const inputStyle = {
    fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
    color: 'var(--color-cream)',
    background: 'rgba(246,243,234,0.06)',
    border: '1px solid rgba(246,243,234,0.15)',
    padding: '1rem 1.2rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.25s ease',
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
    <section id="contact" ref={sectionRef} className="snap-section" style={{
      background: 'var(--color-slate-deep)',
      justifyContent: 'flex-start',
    }}>
      {/* Contact Form Area */}
      <div className="container" style={{ paddingTop: '7rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '6rem', alignItems: 'start' }} className="contact-grid">
          {/* Left: Info */}
          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
            transition: 'all 0.8s ease',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem',
            }}>
              <div style={{ width: '32px', height: '1px', background: 'var(--color-orange)' }} />
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)',
              }}>{ts.subtitle}</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', color: 'var(--color-cream)',
              marginBottom: '3rem', lineHeight: 1.25,
            }}>{ts.title}</h2>

            {[
              { icon: 'fas fa-phone', label: ts.phone, value: '0212 993 99 39', href: 'tel:02129939939' },
              { icon: 'fas fa-envelope', label: ts.email, value: 'bilgi@iyievent.com', href: 'mailto:bilgi@iyievent.com' },
              { icon: 'fas fa-map-marker-alt', label: ts.address, value: ts.addressVal, href: null },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', gap: '1.2rem', alignItems: 'flex-start',
                marginBottom: '2rem', paddingBottom: '2rem',
                borderBottom: '1px solid rgba(246,243,234,0.06)',
              }}>
                <div style={{
                  width: '44px', height: '44px', flexShrink: 0,
                  background: 'var(--color-orange-light)',
                  border: '1px solid rgba(240,90,40,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-orange)', fontSize: '0.9rem',
                }}>
                  <i className={item.icon} />
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'rgba(246,243,234,0.4)', marginBottom: '0.3rem',
                  }}>{item.label}</div>
                  {item.href
                    ? <a href={item.href} style={{
                        fontFamily: 'var(--font-sans)', fontSize: '1rem',
                        color: 'var(--color-cream)', textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                        onMouseEnter={e => e.target.style.color = 'var(--color-orange)'}
                        onMouseLeave={e => e.target.style.color = 'var(--color-cream)'}
                      >{item.value}</a>
                    : <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'var(--color-cream)', lineHeight: 1.5, display: 'block' }}>{item.value}</span>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Right: Form */}
          <div style={{
            background: 'rgba(246,243,234,0.03)',
            border: '1px solid rgba(246,243,234,0.08)',
            padding: '3rem',
            opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(30px)',
            transition: 'all 0.8s ease 0.2s',
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{
                  width: '72px', height: '72px', background: 'var(--color-orange-light)',
                  border: '1px solid rgba(240,90,40,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 2rem', fontSize: '1.5rem', color: 'var(--color-orange)',
                }}>
                  <i className="fas fa-check" />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400,
                  color: 'var(--color-cream)', marginBottom: '1rem',
                }}>{formTs.successTitle}</h3>
                <p style={{ color: 'rgba(246,243,234,0.65)', lineHeight: 1.8 }}>{formTs.successMsg}</p>
              </div>
            ) : (
              <>
                {/* Step Indicator */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2.5rem' }}>
                  {[...Array(TOTAL_STEPS)].map((_, i) => (
                    <div key={i} style={{
                      height: '3px', flex: 1,
                      background: i <= step ? 'var(--color-orange)' : 'rgba(246,243,234,0.1)',
                      transition: 'background 0.4s ease',
                    }} />
                  ))}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'rgba(246,243,234,0.35)', marginBottom: '2rem',
                }}>
                  {formTs.step} {step + 1} / {TOTAL_STEPS}
                </div>

                {/* Step 0-2: Options */}
                {step < 3 && (() => {
                  const s = stepOptions[step];
                  return (
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 400,
                        color: 'var(--color-cream)', marginBottom: '2rem',
                      }}>{s.title}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {s.options.map(opt => (
                          <button key={opt} onClick={() => handleOptionSelect(s.key, opt)} style={{
                            background: formData[s.key] === opt ? 'var(--color-orange)' : 'rgba(246,243,234,0.04)',
                            border: `1px solid ${formData[s.key] === opt ? 'var(--color-orange)' : 'rgba(246,243,234,0.12)'}`,
                            color: formData[s.key] === opt ? 'var(--color-white)' : 'var(--color-cream)',
                            padding: '1.1rem 1.5rem', cursor: 'pointer', textAlign: 'left',
                            fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 400,
                            transition: 'all 0.25s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                            onMouseEnter={e => { if (formData[s.key] !== opt) { e.currentTarget.style.borderColor = 'rgba(240,90,40,0.5)'; e.currentTarget.style.color = 'var(--color-orange)'; } }}
                            onMouseLeave={e => { if (formData[s.key] !== opt) { e.currentTarget.style.borderColor = 'rgba(246,243,234,0.12)'; e.currentTarget.style.color = 'var(--color-cream)'; } }}
                          >
                            {opt}
                            {formData[s.key] === opt && <i className="fas fa-check" style={{ fontSize: '0.85rem' }} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Step 3: Details */}
                {step === 3 && (
                  <form onSubmit={handleSubmit}>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 400,
                      color: 'var(--color-cream)', marginBottom: '2rem',
                    }}>{formTs.steps.details.title}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <input type="text" required placeholder={formTs.steps.details.placeholderName}
                        value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(240,90,40,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(246,243,234,0.15)'}
                      />
                      <input type="tel" required placeholder={formTs.steps.details.placeholderPhone}
                        value={formData.phone} onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(240,90,40,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(246,243,234,0.15)'}
                      />
                    </div>
                    <input type="email" required placeholder={formTs.steps.details.placeholderEmail}
                      value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: '1rem' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(240,90,40,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(246,243,234,0.15)'}
                    />
                    <textarea rows={4} placeholder={formTs.steps.details.placeholderMsg}
                      value={formData.message} onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: '2rem', resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(240,90,40,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(246,243,234,0.15)'}
                    />
                    <button type="submit" className="btn-primary" disabled={isSubmitting} style={{
                      width: '100%', justifyContent: 'center', fontSize: '0.85rem',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}>
                      {isSubmitting ? formTs.submitting : formTs.submit}
                      {!isSubmitting && <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }} />}
                    </button>
                  </form>
                )}

                {/* Back Button */}
                {step > 0 && !submitted && (
                  <button onClick={() => setStep(s => s - 1)} style={{
                    marginTop: '1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'rgba(246,243,234,0.35)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'color 0.25s ease',
                    padding: 0,
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(246,243,234,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(246,243,234,0.35)'}
                  >
                    <i className="fas fa-arrow-left" style={{ fontSize: '0.7rem' }} />
                    {formTs.prev}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(246,243,234,0.06)',
        padding: '4rem 0 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '5rem',
            paddingBottom: '3rem',
          }} className="footer-grid">
            {/* Brand */}
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
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 3.5rem !important; }
          .footer-grid { gridTemplate-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </section>
  );
};

export default ContactForm;
