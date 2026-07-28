'use client'

import { useState, Suspense, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'

function KayitForm() {
  const [ad, setAd] = useState('')
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [sifreTekrar, setSifreTekrar] = useState('')
  const [loading, setLoading] = useState(false)
  const [hata, setHata] = useState('')
  const [basari, setBasari] = useState('')

  const supabase = createClient()
  const router = useRouter()

  const handleKayit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setHata('')

    if (sifre !== sifreTekrar) {
      setHata('Şifreler eşleşmiyor.')
      setLoading(false)
      return
    }
    if (sifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalı.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: sifre,
      options: {
        data: { full_name: ad.trim() },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/musteri/etkinlikler`,
      },
    })

    if (error) {
      if (error.message.includes('already')) {
        setHata('Bu e-posta adresi zaten kayıtlı.')
      } else {
        setHata(error.message)
      }
    } else {
      setBasari('Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.')
    }
    setLoading(false)
  }

  const handleGoogleGiris = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/musteri/etkinlikler`,
      },
    })
    if (error) setHata(error.message)
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
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <a href="/" style={{ display: 'inline-block' }}>
          <Logo height={44} />
        </a>
      </div>

      <div style={{
        background: '#fff',
        padding: '3rem',
        border: '1px solid var(--color-cream-dark)',
        boxShadow: '0 8px 40px rgba(42,53,56,0.06)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)',
            marginBottom: '0.5rem',
          }}>
            Müşteri Kaydı
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400,
            color: 'var(--color-slate)', margin: 0,
          }}>
            Hesap Oluşturun
          </h1>
        </div>

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

        {!basari && (
          <>
            <button onClick={handleGoogleGiris} type="button" style={{
              width: '100%', padding: '0.85rem', marginBottom: '1rem',
              background: '#fff', border: '1px solid var(--color-cream-dark)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem',
              fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-orange)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-cream-dark)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google ile Kayıt Ol
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-cream-dark)' }} />
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)',
              }}>veya</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-cream-dark)' }} />
            </div>

            <form onSubmit={handleKayit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text" required placeholder="Ad Soyad"
                value={ad} onChange={e => setAd(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
              />
              <input
                type="email" required placeholder="E-posta adresi"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
              />
              <input
                type="password" required placeholder="Şifre (en az 6 karakter)"
                value={sifre} onChange={e => setSifre(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
              />
              <input
                type="password" required placeholder="Şifre tekrar"
                value={sifreTekrar} onChange={e => setSifreTekrar(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
              />
              <button type="submit" className="btn-primary" disabled={loading} style={{
                width: '100%', justifyContent: 'center', marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                {!loading && <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }} />}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate-medium)',
          }}>
            Zaten hesabınız var mı?{' '}
          </span>
          <a href="/giris" style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600,
            color: 'var(--color-orange)', textDecoration: 'none',
          }}>
            Giriş Yapın
          </a>
        </div>
      </div>

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

export default function KayitPage() {
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
        <KayitForm />
      </Suspense>
    </div>
  )
}
