'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import { belgeYukle, belgeSil, belgeHazirBildir } from './actions'

const TUR = {
  sozlesme: { ik: 'fas fa-file-signature', l: 'Sözleşme' },
  fatura: { ik: 'fas fa-file-invoice-dollar', l: 'Fatura' },
  islak_imza: { ik: 'fas fa-file-pen', l: 'Islak İmza' },
  diger: { ik: 'fas fa-file', l: 'Diğer' },
}
const DURUM = {
  bekliyor: { bg: '#FEF3C7', text: '#D97706', label: 'Bekliyor' },
  yuklendi: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Yüklendi' },
  onaylandi: { bg: '#D1FAE5', text: '#059669', label: 'Onaylandı' },
}
const boyut = b => b ? (b / 1024 / 1024).toFixed(2) + ' MB' : '—'
const tarih = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.5rem 0.7rem', outline: 'none', boxSizing: 'border-box' }

export default function MusteriDetayClient({ musteri, etkinlikler: ilk, demo }) {
  const [etkinlikler, setEtkinlikler] = useState(ilk)
  const [mesaj, setMesaj] = useState(null)
  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3500) }

  return (
    <div style={{ padding: '2.5rem' }}>
      <Link href="/yonetim/musteriler" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', textDecoration: 'none', marginBottom: '1.2rem' }}>
        <i className="fas fa-arrow-left" style={{ fontSize: '0.65rem' }} /> Müşteriler
      </Link>

      {/* Müşteri başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.8rem' }}>
        <div style={{ width: '58px', height: '58px', borderRadius: '50%', flexShrink: 0, background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
          {(musteri.full_name || '?').charAt(0).toLocaleUpperCase('tr')}
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>{musteri.full_name || 'İsimsiz'}</h1>
          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-slate-medium)' }}>
            {musteri.email && <span><i className="fas fa-envelope" style={{ color: 'var(--color-orange)', marginRight: '0.3rem' }} />{musteri.email}</span>}
            {musteri.phone && <span><i className="fas fa-phone" style={{ color: 'var(--color-orange)', marginRight: '0.3rem' }} />{musteri.phone}</span>}
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(240,90,40,0.06)', border: '1px solid rgba(240,90,40,0.2)', padding: '0.8rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <i className="fas fa-circle-info" style={{ color: 'var(--color-orange)' }} />
        Buradan yüklediğiniz her belge, fatura ve fotoğraf müşterinin <strong>portal hesabında</strong> otomatik görünür.
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      {etkinlikler.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)', border: '2px dashed var(--color-cream-dark)' }}>Bu müşterinin etkinliği yok.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {etkinlikler.map(e => (
          <EtkinlikDosya key={e.id} etkinlik={e} musteri={musteri} demo={demo} bildir={bildir}
            onBelgeEkle={(b) => setEtkinlikler(prev => prev.map(x => x.id === e.id ? { ...x, belgeler: [b, ...x.belgeler] } : x))}
            onBelgeSil={(bid) => setEtkinlikler(prev => prev.map(x => x.id === e.id ? { ...x, belgeler: x.belgeler.filter(b => b.id !== bid) } : x))}
          />
        ))}
      </div>
    </div>
  )
}

function EtkinlikDosya({ etkinlik: e, musteri, demo, bildir, onBelgeEkle, onBelgeSil }) {
  const [ad, setAd] = useState('')
  const [tur, setTur] = useState('sozlesme')
  const [dosya, setDosya] = useState(null)
  const [pending, startTransition] = useTransition()
  const fileRef = useRef(null)

  function yukle() {
    if (!ad.trim() || !dosya) { bildir('hata', 'Ad ve dosya seçin.'); return }
    const fd = new FormData()
    fd.append('etkinlik_id', e.id); fd.append('ad', ad); fd.append('tur', tur); fd.append('dosya', dosya)
    startTransition(async () => {
      const r = await belgeYukle(fd)
      if (!r.ok) return bildir('hata', r.error)
      onBelgeEkle(r.belge)
      setAd(''); setDosya(null); if (fileRef.current) fileRef.current.value = ''
      bildir('basari', demo ? 'Demo: belge yüklendi (portal’da görünür).' : 'Belge yüklendi.')
    })
  }
  function sil(bid) {
    if (!confirm('Belge silinsin mi?')) return
    startTransition(async () => { const r = await belgeSil(bid); if (r.ok) onBelgeSil(bid); else bildir('hata', r.error) })
  }
  function musteriBildir() {
    startTransition(async () => {
      const r = await belgeHazirBildir(musteri.email, e.ad, 'Belgeleriniz')
      bildir(r.ok ? 'basari' : 'hata', r.ok ? (demo ? 'Demo: müşteriye bilgi maili gönderildi.' : 'Müşteriye bilgi maili gönderildi.') : r.error)
    })
  }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
      <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>{e.ad}</h2>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}>{e.tur} · {tarih(e.tarih)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-images" style={{ color: 'var(--color-orange)', marginRight: '0.3rem' }} />{e.gorsel_sayisi} fotoğraf</span>
          {musteri.email && <button onClick={musteriBildir} disabled={pending} style={{ padding: '0.45rem 0.8rem', cursor: 'pointer', border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)', fontFamily: 'var(--font-display)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}><i className="fas fa-paper-plane" style={{ marginRight: '0.3rem', color: 'var(--color-orange)' }} />Müşteriye Bildir</button>}
        </div>
      </div>

      <div style={{ padding: '1.2rem 1.5rem' }}>
        {/* Belge listesi */}
        {e.belgeler.length === 0
          ? <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-medium)', marginBottom: '1rem' }}>Henüz belge yüklenmedi.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
              {e.belgeler.map(b => {
                const t = TUR[b.tur] || TUR.diger, d = DURUM[b.durum] || DURUM.bekliyor
                return (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.7rem 0.9rem', border: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
                    <div style={{ width: '36px', height: '36px', flexShrink: 0, background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className={t.ik} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>{b.ad}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: 'var(--color-slate-medium)' }}>{t.l} · {boyut(b.dosya_boyutu)} · {b.yukleyen_rol === 'musteri' ? 'Müşteri yükledi' : 'Biz yükledik'} · {tarih(b.created_at)}</div>
                    </div>
                    <span style={{ background: d.bg, color: d.text, padding: '0.2rem 0.6rem', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{d.label}</span>
                    <button onClick={() => sil(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '0.82rem', padding: '0.25rem' }}><i className="fas fa-trash" /></button>
                  </div>
                )
              })}
            </div>}

        {/* Yükleme */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--color-cream)', paddingTop: '1rem' }}>
          <input value={ad} onChange={ev => setAd(ev.target.value)} placeholder="Belge adı" style={{ ...inp, flex: '1 1 160px' }} />
          <select value={tur} onChange={ev => setTur(ev.target.value)} style={{ ...inp, width: '130px', flex: '0 0 auto' }}>
            {Object.entries(TUR).map(([k, t]) => <option key={k} value={k}>{t.l}</option>)}
          </select>
          <label style={{ ...inp, width: 'auto', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: dosya ? 'var(--color-slate)' : 'var(--color-slate-medium)' }}>
            <i className="fas fa-paperclip" style={{ color: 'var(--color-orange)' }} />
            {dosya ? dosya.name.slice(0, 24) : 'Dosya seç'}
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx" onChange={ev => setDosya(ev.target.files?.[0] || null)} style={{ display: 'none' }} />
          </label>
          <button onClick={yukle} disabled={pending} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }}>
            <i className="fas fa-cloud-arrow-up" style={{ fontSize: '0.72rem' }} /> {pending ? 'Yükleniyor…' : 'Yükle'}
          </button>
        </div>
      </div>
    </div>
  )
}
