'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/Logo'

function LoginForm() {
  const [mod, setMod] = useState('giris') // 'giris' | 'sifre_sifirla'
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [loading, setLoading] = useState(false)
  const [hata, setHata] = useState('')
  const [basari, setBasari] = useState('')

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/yonetim'

  const handleGiris = async (e) => {
    e.preventDefault()
    setLoading(true)
    setHata('')

    const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
    if (error) {
      setHata(error.message === 'Invalid login credentials'
        ? 'E-posta veya şifre hatalı.'
        : error.message)
    } else {
      router.push(redirect)
      router.refresh()
    }
    setLoading(false)
  }

  const handleSifreSifirla = async (e) => {
    e.preventDefault()
    setLoading(true)
    setHata('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/yonetim`,
    })

    if (error) {
      setHata(error.message)
    } else {
      setBasari('Şifre sıfırlama linki e-posta adresinize gönderildi.')
    }
    setLoading(false)
  }

  const inputStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: 'var(--color-slate)',
    background: 'var(--color-cream-light)',
    border: '1px solid var(--color-cream-dark)',
    padding: '0.9rem 1.1rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.25s ease',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ width: '100%', maxWidth: '440px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <a href="/" style={{ display: 'inline-block' }}>
          <Logo height={44} />
        </a>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff',
        padding: '3rem',
        border: '1px solid var(--color-cream-dark)',
        boxShadow: '0 8px 40px rgba(42,53,56,0.06)',
      }}>
        {/* Başlık */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)',
            marginBottom: '0.5rem',
          }}>
            {mod === 'giris' ? 'Yönetim Girişi' : 'Şifre Sıfırlama'}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400,
            color: 'var(--color-slate)', margin: 0,
          }}>
            {mod === 'giris' ? 'Hesabınıza Giriş Yapın' : 'Şifrenizi Sıfırlayın'}
          </h1>
        </div>

        {/* Hata / Başarı mesajları */}
        {hata && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            color: '#DC2626', padding: '0.8rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.88rem', fontFamily: 'var(--font-sans)',
          }}>{hata}</div>
        )}
        {basari && (
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            color: '#16A34A', padding: '0.8rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.88rem', fontFamily: 'var(--font-sans)',
          }}>{basari}</div>
        )}

        {/* Giriş Formu */}
        {mod === 'giris' && (
          <form onSubmit={handleGiris} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="email" required placeholder="E-posta adresi"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
            />
            <input
              type="password" required placeholder="Şifre"
              value={sifre} onChange={e => setSifre(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{
              width: '100%', justifyContent: 'center', marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              {!loading && <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }} />}
            </button>
            <button type="button" onClick={() => { setMod('sifre_sifirla'); setHata(''); setBasari('') }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: '0.75rem',
              color: 'var(--color-slate-medium)', textAlign: 'center',
              letterSpacing: '0.05em', padding: '0.3rem',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--color-orange)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-slate-medium)'}
            >
              Şifremi unuttum
            </button>
          </form>
        )}

        {/* Şifre Sıfırla */}
        {mod === 'sifre_sifirla' && (
          <form onSubmit={handleSifreSifirla} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
              color: 'var(--color-slate-medium)', lineHeight: 1.6, marginBottom: '0.5rem',
            }}>
              E-posta adresinizi girin. Şifre sıfırlama bağlantısı göndereceğiz.
            </p>
            <input type="email" required placeholder="E-posta adresi"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{
              width: '100%', justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Gönderiliyor...' : 'Link Gönder'}
            </button>
            <button type="button" onClick={() => { setMod('giris'); setHata(''); setBasari('') }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: '0.75rem',
              color: 'var(--color-slate-medium)', textAlign: 'center',
              letterSpacing: '0.05em', padding: '0.3rem',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--color-orange)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-slate-medium)'}
            >
              ← Giriş ekranına dön
            </button>
          </form>
        )}
      </div>

      {/* Back to site */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a href="/" style={{
          fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-slate-medium)', textDecoration: 'none',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.target.style.color = 'var(--color-orange)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-slate-medium)'}
        >
          ← Ana sayfaya dön
        </a>
      </div>
    </div>
  )
}

export default function GirisPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <Suspense fallback={
        <div style={{ color: 'var(--color-slate-medium)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Yükleniyor...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
