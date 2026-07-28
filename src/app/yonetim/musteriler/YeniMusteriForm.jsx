'use client'

import { useState } from 'react'
import { musteriEkle } from './actions'

export default function YeniMusteriForm({ onClose }) {
  const [ad, setAd] = useState('')
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [loading, setLoading] = useState(false)
  const [hata, setHata] = useState('')
  const [basari, setBasari] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setHata('')

    const result = await musteriEkle({ ad, email, sifre })
    if (result.ok) {
      setBasari(`${ad} başarıyla oluşturuldu. Müşteri e-posta adresine bilgilendirme gönderildi.`)
      setAd(''); setEmail(''); setSifre('')
      setTimeout(() => { onClose?.() }, 2000)
    } else {
      setHata(result.error)
    }
    setLoading(false)
  }

  const inputStyle = {
    fontFamily: 'var(--font-sans)', fontSize: '0.92rem',
    color: 'var(--color-slate)', background: 'var(--color-cream-light)',
    border: '1px solid var(--color-cream-dark)',
    padding: '0.85rem 1rem', width: '100%', outline: 'none',
    transition: 'border-color 0.25s ease', boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(42,53,56,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', padding: '2.5rem', width: '100%', maxWidth: '440px',
        border: '1px solid var(--color-cream-dark)',
        boxShadow: '0 20px 60px rgba(42,53,56,0.15)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)',
            marginBottom: '0.4rem',
          }}>Yeni Müşteri</div>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400,
            color: 'var(--color-slate)', margin: 0,
          }}>Müşteri Hesabı Oluştur</h2>
        </div>

        {hata && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            color: '#DC2626', padding: '0.75rem 1rem', marginBottom: '1.2rem',
            fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
          }}>{hata}</div>
        )}
        {basari && (
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            color: '#16A34A', padding: '0.75rem 1rem', marginBottom: '1.2rem',
            fontSize: '0.85rem', fontFamily: 'var(--font-sans)',
          }}>{basari}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" required placeholder="Ad Soyad" value={ad}
            onChange={e => setAd(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
          />
          <input type="email" required placeholder="E-posta adresi" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
          />
          <input type="password" required placeholder="Şifre (en az 6 karakter)" value={sifre}
            onChange={e => setSifre(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--color-orange)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-cream-dark)'}
          />
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '0.8rem', background: 'var(--color-cream)',
              border: '1px solid var(--color-cream-dark)', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate-medium)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-slate)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-cream-dark)'}
            >İptal</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{
              flex: 1, justifyContent: 'center', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
