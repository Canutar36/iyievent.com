'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { telemarketingSonuc } from './actions'

const SONUCLAR = [
  { key: 'ulasildi', l: 'Ulaşıldı — İlgilendi', ik: 'fas fa-thumbs-up', renk: '#059669' },
  { key: 'randevu', l: 'Randevu Aldı', ik: 'fas fa-calendar-check', renk: '#F05A28' },
  { key: 'geri_ara', l: 'Geri Aranacak', ik: 'fas fa-clock-rotate-left', renk: '#1D4ED8' },
  { key: 'mesgul', l: 'Meşgul', ik: 'fas fa-phone-slash', renk: '#6B7280' },
  { key: 'ulasilamadi', l: 'Ulaşılamadı', ik: 'fas fa-phone-volume', renk: '#6B7280' },
  { key: 'ilgilenmiyor', l: 'İlgilenmiyor', ik: 'fas fa-xmark', renk: '#DC2626' },
]
const selMini = { fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.5rem 0.6rem', outline: 'none' }

export default function TelemarketingClient({ kuyruk: ilk, sayac, filtre, ilceler, sektorler, demo }) {
  const router = useRouter()
  const [kuyruk, setKuyruk] = useState(ilk)
  const [aktifId, setAktifId] = useState(ilk[0]?.id || null)
  const [not, setNot] = useState('')
  const [geriTarih, setGeriTarih] = useState('')
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  const [sayilar, setSayilar] = useState(sayac)

  const aktif = kuyruk.find(l => l.id === aktifId) || null
  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 2500) }

  function git(patch) {
    const y = { ...filtre, ...patch }
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(y)) if (v) p.set(k, v)
    const qs = p.toString()
    router.push(qs ? `/yonetim/telemarketing?${qs}` : '/yonetim/telemarketing')
  }

  function sonucKaydet(sonucKey) {
    if (!aktif) return
    if (sonucKey === 'geri_ara' && !geriTarih) { bildir('hata', 'Geri arama tarihi seçin.'); return }
    const lead = aktif
    startTransition(async () => {
      const r = await telemarketingSonuc(lead.id, sonucKey, { not, geriTarih })
      if (!r.ok) return bildir('hata', r.error)
      // Kuyruktan çıkar, sıradakine geç
      const kalan = kuyruk.filter(l => l.id !== lead.id)
      setKuyruk(kalan)
      const idx = kuyruk.findIndex(l => l.id === lead.id)
      setAktifId(kalan[idx]?.id || kalan[0]?.id || null)
      setNot(''); setGeriTarih('')
      // Sayaç güncelle
      setSayilar(s => {
        const y = { ...s }
        if (lead.arama_durumu === 'aranmadi' && y.aranmadi > 0) y.aranmadi--
        if (sonucKey === 'ulasildi') y.ulasildi++
        if (sonucKey === 'randevu') y.randevu++
        return y
      })
      bildir('basari', demo ? 'Demo: sonuç kaydedildi.' : 'Sonuç kaydedildi.')
    })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>E-Marketing</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Telemarketing</h1>
        </div>
        <Link href="/yonetim/leadler" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}><i className="fas fa-arrow-left" style={{ fontSize: '0.65rem' }} /> Lead Havuzu</Link>
      </div>

      {/* Sayaçlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
        <Sayac etiket="Aranmadı" deger={sayilar.aranmadi} ikon="fas fa-phone" renk="#D97706" />
        <Sayac etiket="Geri Aranacak" deger={sayilar.geri_ara} ikon="fas fa-clock-rotate-left" renk="#1D4ED8" />
        <Sayac etiket="Ulaşıldı" deger={sayilar.ulasildi} ikon="fas fa-thumbs-up" renk="#059669" />
        <Sayac etiket="Randevu" deger={sayilar.randevu} ikon="fas fa-calendar-check" renk="#F05A28" />
      </div>

      {/* Filtreler */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <select value={filtre.tip} onChange={e => git({ tip: e.target.value })} style={selMini}><option value="">Tüm Tipler</option><option value="b2b">B2B</option><option value="b2c">B2C</option></select>
        <select value={filtre.ilce} onChange={e => git({ ilce: e.target.value })} style={selMini}><option value="">Tüm İlçeler</option>{ilceler.map(i => <option key={i} value={i}>{i}</option>)}</select>
        <select value={filtre.sektor} onChange={e => git({ sektor: e.target.value })} style={selMini}><option value="">Tüm Sektörler</option>{sektorler.map(s => <option key={s} value={s}>{s}</option>)}</select>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      {kuyruk.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '4rem', textAlign: 'center' }}>
          <i className="fas fa-mug-hot" style={{ fontSize: '2.5rem', color: 'var(--color-orange)', opacity: 0.5, marginBottom: '1rem', display: 'block' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>Kuyruk boş</h2>
          <p style={{ color: 'var(--color-slate-medium)' }}>Bu filtrede aranacak lead kalmadı. Filtreyi değiştirin veya yeni lead içe aktarın.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.3rem', alignItems: 'start' }} className="tele-grid">
          {/* Kuyruk */}
          <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ padding: '0.8rem 1.1rem', borderBottom: '1px solid var(--color-cream-dark)', fontFamily: 'var(--font-display)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', position: 'sticky', top: 0, background: '#fff' }}>Arama Kuyruğu ({kuyruk.length})</div>
            {kuyruk.map(l => {
              const secili = l.id === aktifId
              return (
                <div key={l.id} onClick={() => { setAktifId(l.id); setNot(''); setGeriTarih('') }} style={{ padding: '0.8rem 1.1rem', borderBottom: '1px solid var(--color-cream)', cursor: 'pointer', borderLeft: `3px solid ${secili ? 'var(--color-orange)' : 'transparent'}`, background: secili ? 'var(--color-orange-light)' : 'transparent' }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.15rem' }}>{l.ad_unvan}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: 'var(--color-slate-medium)' }}>{[l.sektor, l.ilce].filter(Boolean).join(' · ')}</div>
                  {l.arama_durumu === 'geri_ara' && <span style={{ fontSize: '0.62rem', color: '#1D4ED8', fontWeight: 700 }}><i className="fas fa-clock-rotate-left" /> Geri arama</span>}
                </div>
              )
            })}
          </div>

          {/* Aktif kart */}
          {aktif && (
            <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <div style={{ padding: '2rem', borderBottom: '1px solid var(--color-cream-dark)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, padding: '0.15rem 0.4rem', background: aktif.tip === 'b2b' ? 'var(--color-slate)' : 'var(--color-orange)', color: '#fff' }}>{aktif.tip.toUpperCase()}</span>
                  {aktif.sektor && <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{aktif.sektor}</span>}
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0 0 0.3rem' }}>{aktif.ad_unvan}</h2>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-slate-medium)' }}>{[aktif.yetkili_kisi, [aktif.il, aktif.ilce].filter(Boolean).join('/')].filter(Boolean).join(' · ')}</div>

                {/* Büyük ara butonu */}
                {aktif.telefon && (
                  <a href={`tel:${aktif.telefon}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', marginTop: '1.3rem', padding: '1rem', background: 'var(--color-slate-deep)', color: 'var(--color-cream)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                    <i className="fas fa-phone" style={{ color: 'var(--color-orange)' }} /> {aktif.telefon}
                  </a>
                )}
                {aktif.email && <a href={`mailto:${aktif.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.8rem', fontSize: '0.82rem', color: 'var(--color-orange)', textDecoration: 'none' }}><i className="fas fa-envelope" /> {aktif.email}</a>}
                {aktif.adres && <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-location-dot" style={{ marginRight: '0.4rem', color: 'var(--color-orange)' }} />{aktif.adres}</div>}
              </div>

              <div style={{ padding: '1.5rem 2rem' }}>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.4rem', display: 'block' }}>Görüşme Notu</label>
                <textarea value={not} onChange={e => setNot(e.target.value)} placeholder="Görüşmeden aldığınız notlar…" style={{ width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate)', border: '1px solid var(--color-cream-dark)', padding: '0.7rem', outline: 'none', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '1rem' }} />

                <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.6rem', display: 'block' }}>Görüşme Sonucu</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem' }}>
                  {SONUCLAR.map(s => (
                    <button key={s.key} disabled={pending} onClick={() => sonucKaydet(s.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 0.9rem', cursor: pending ? 'wait' : 'pointer', border: `1px solid ${s.renk}`, background: '#fff', color: s.renk, fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em', textAlign: 'left' }}
                      onMouseEnter={e => { e.currentTarget.style.background = s.renk; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = s.renk }}>
                      <i className={s.ik} /> {s.l}
                    </button>
                  ))}
                </div>

                {/* Geri arama tarihi */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-clock-rotate-left" style={{ color: '#1D4ED8', marginRight: '0.3rem' }} />Geri arama için tarih:</span>
                  <input type="date" value={geriTarih} onChange={e => setGeriTarih(e.target.value)} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', padding: '0.4rem 0.6rem', border: '1px solid var(--color-cream-dark)', outline: 'none' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@media (max-width: 860px) { .tele-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function Sayac({ etiket, deger, ikon, renk }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.1rem 1.3rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: renk + '18', color: renk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}><i className={ikon} /></div>
      <div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-slate)', lineHeight: 1 }}>{Number(deger).toLocaleString('tr-TR')}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginTop: '0.2rem' }}>{etiket}</div>
      </div>
    </div>
  )
}
