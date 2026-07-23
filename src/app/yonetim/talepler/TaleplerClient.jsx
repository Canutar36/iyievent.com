'use client'

import { useState, useMemo, useTransition } from 'react'
import { talepDurumGuncelle, talebiEtkinligeDonustur } from './actions'

const DURUMLAR = {
  yeni: { bg: '#FEF3C7', text: '#D97706', label: 'Yeni' },
  inceleniyor: { bg: '#DBEAFE', text: '#1D4ED8', label: 'İnceleniyor' },
  etkinlige_donustu: { bg: '#D1FAE5', text: '#059669', label: 'Dönüştü' },
  reddedildi: { bg: '#FEE2E2', text: '#DC2626', label: 'Reddedildi' },
}

const FILTRELER = [
  { key: 'hepsi', label: 'Tümü' },
  { key: 'yeni', label: 'Yeni' },
  { key: 'inceleniyor', label: 'İnceleniyor' },
  { key: 'etkinlige_donustu', label: 'Dönüştü' },
  { key: 'reddedildi', label: 'Reddedildi' },
]

function tarih(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TaleplerClient({ talepler: ilk, demo }) {
  const [talepler, setTalepler] = useState(ilk)
  const [filtre, setFiltre] = useState('hepsi')
  const [arama, setArama] = useState('')
  const [secili, setSecili] = useState(null)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)

  const gorunen = useMemo(() => {
    return talepler.filter(t => {
      if (filtre !== 'hepsi' && t.durum !== filtre) return false
      if (arama) {
        const q = arama.toLocaleLowerCase('tr')
        const hay = `${t.ad_soyad} ${t.email} ${t.telefon} ${t.etkinlik_turu || ''}`.toLocaleLowerCase('tr')
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [talepler, filtre, arama])

  const sayilar = useMemo(() => {
    const c = { hepsi: talepler.length }
    for (const t of talepler) c[t.durum] = (c[t.durum] || 0) + 1
    return c
  }, [talepler])

  function durumDegistir(t, durum) {
    setMesaj(null)
    // Optimistik güncelle
    setTalepler(prev => prev.map(x => x.id === t.id ? { ...x, durum } : x))
    if (secili?.id === t.id) setSecili({ ...secili, durum })
    startTransition(async () => {
      const r = await talepDurumGuncelle(t.id, durum)
      if (!r.ok) {
        setMesaj({ tip: 'hata', metin: r.error || 'Güncellenemedi.' })
        setTalepler(prev => prev.map(x => x.id === t.id ? { ...x, durum: t.durum } : x))
      }
    })
  }

  function donustur(t) {
    setMesaj(null)
    startTransition(async () => {
      const r = await talebiEtkinligeDonustur(t.id)
      if (r.ok) {
        setTalepler(prev => prev.map(x => x.id === t.id ? { ...x, durum: 'etkinlige_donustu' } : x))
        if (secili?.id === t.id) setSecili({ ...secili, durum: 'etkinlige_donustu' })
        setMesaj({ tip: 'basari', metin: demo ? 'Demo: talep etkinliğe dönüştürüldü.' : 'Talep etkinliğe dönüştürüldü.' })
      } else {
        setMesaj({ tip: 'hata', metin: r.error || 'Dönüştürülemedi.' })
      }
    })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.8rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>CRM</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Talepler</h1>
        </div>
        <input
          value={arama} onChange={e => setArama(e.target.value)}
          placeholder="İsim, e-posta, tür ara…"
          style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)',
            background: '#fff', border: '1px solid var(--color-cream-dark)',
            padding: '0.7rem 1rem', width: '280px', maxWidth: '100%', outline: 'none',
          }}
        />
      </div>

      {mesaj && (
        <div style={{
          padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
          background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`,
          color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A',
        }}>{mesaj.metin}</div>
      )}

      {/* Filtre sekmeleri */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {FILTRELER.map(f => {
          const aktif = filtre === f.key
          return (
            <button key={f.key} onClick={() => setFiltre(f.key)} style={{
              fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
              padding: '0.5rem 0.9rem', border: '1px solid',
              borderColor: aktif ? 'var(--color-orange)' : 'var(--color-cream-dark)',
              background: aktif ? 'var(--color-orange)' : '#fff',
              color: aktif ? '#fff' : 'var(--color-slate-medium)',
              transition: 'all 0.15s',
            }}>
              {f.label} {sayilar[f.key] ? `(${sayilar[f.key]})` : ''}
            </button>
          )
        })}
      </div>

      {/* Tablo */}
      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
              {['Ad Soyad', 'Etkinlik Türü', 'Bütçe', 'Tarih', 'Durum', ''].map((h, i) => (
                <th key={i} style={{
                  textAlign: i === 5 ? 'right' : 'left', padding: '0.9rem 1.2rem',
                  fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gorunen.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)', fontSize: '0.9rem' }}>Kayıt bulunamadı.</td></tr>
            )}
            {gorunen.map(t => {
              const d = DURUMLAR[t.durum] || DURUMLAR.yeni
              return (
                <tr key={t.id}
                  onClick={() => setSecili(t)}
                  style={{ borderBottom: '1px solid var(--color-cream)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-cream-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate)' }}>{t.ad_soyad}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.76rem', color: 'var(--color-slate-medium)' }}>{t.email}</div>
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: 'var(--color-slate-medium)' }}>{t.etkinlik_turu || '—'}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: 'var(--color-slate)' }}>{t.butce || '—'}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{tarih(t.created_at)}</td>
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <span style={{ background: d.bg, color: d.text, padding: '0.25rem 0.7rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{d.label}</span>
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', color: 'var(--color-slate-medium)' }}>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.72rem' }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detay paneli (drawer) */}
      {secili && (
        <>
          <div onClick={() => setSecili(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.35)', zIndex: 200 }} />
          <aside style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', maxWidth: '100%',
            background: '#fff', zIndex: 201, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)',
            display: 'flex', flexDirection: 'column', overflowY: 'auto',
          }}>
            <div style={{ padding: '1.6rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>{secili.ad_soyad}</h2>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate-medium)', marginTop: '0.2rem' }}>{tarih(secili.created_at)} tarihli talep</div>
              </div>
              <button onClick={() => setSecili(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}>
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.3rem', flex: 1 }}>
              <Detay ikon="fas fa-envelope" etiket="E-posta" deger={<a href={`mailto:${secili.email}`} style={{ color: 'var(--color-orange)', textDecoration: 'none' }}>{secili.email}</a>} />
              <Detay ikon="fas fa-phone" etiket="Telefon" deger={<a href={`tel:${secili.telefon}`} style={{ color: 'var(--color-orange)', textDecoration: 'none' }}>{secili.telefon}</a>} />
              <Detay ikon="fas fa-star" etiket="Etkinlik Türü" deger={secili.etkinlik_turu || '—'} />
              <Detay ikon="fas fa-users" etiket="Tahmini Misafir" deger={secili.tahmini_misafir || '—'} />
              <Detay ikon="fas fa-wallet" etiket="Bütçe" deger={secili.butce || '—'} />
              {secili.mesaj && <Detay ikon="fas fa-message" etiket="Mesaj" deger={secili.mesaj} />}
            </div>

            {/* Aksiyonlar */}
            <div style={{ padding: '1.4rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.7rem' }}>Durum</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {Object.entries(DURUMLAR).map(([key, d]) => {
                  const aktif = secili.durum === key
                  return (
                    <button key={key} disabled={pending} onClick={() => durumDegistir(secili, key)} style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.66rem', fontWeight: 700,
                      letterSpacing: '0.05em', textTransform: 'uppercase', cursor: pending ? 'wait' : 'pointer',
                      padding: '0.4rem 0.7rem', border: '1px solid',
                      borderColor: aktif ? d.text : 'var(--color-cream-dark)',
                      background: aktif ? d.bg : '#fff', color: aktif ? d.text : 'var(--color-slate-medium)',
                    }}>{d.label}</button>
                  )
                })}
              </div>
              <button
                disabled={pending || secili.durum === 'etkinlige_donustu'}
                onClick={() => donustur(secili)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: (pending || secili.durum === 'etkinlige_donustu') ? 0.55 : 1 }}
              >
                {secili.durum === 'etkinlige_donustu' ? 'Etkinliğe Dönüştürüldü' : 'Etkinliğe Dönüştür'}
                {secili.durum !== 'etkinlige_donustu' && <i className="fas fa-arrow-right" style={{ fontSize: '0.72rem' }} />}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

function Detay({ ikon, etiket, deger }) {
  return (
    <div style={{ display: 'flex', gap: '0.9rem' }}>
      <div style={{ width: '34px', height: '34px', flexShrink: 0, borderRadius: '8px', background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
        <i className={ikon} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.2rem' }}>{etiket}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)', lineHeight: 1.5, wordBreak: 'break-word' }}>{deger}</div>
      </div>
    </div>
  )
}
