'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { teklifHesapla, tl } from '@/lib/fiyat'
import { KATEGORILER } from '@/lib/demo-katalog'
import { teklifKaydet } from '../../teklifler/actions'

const BIRIM_ETIKET = { adet: 'adet', kisi: 'kişi', sabit: '' }

export default function TeklifBuilderClient({ hizmetler, ekstralar, demo }) {
  const router = useRouter()
  const [kategori, setKategori] = useState(KATEGORILER[0].key)
  const [hizmetId, setHizmetId] = useState(null)
  const [kisi, setKisi] = useState(100)
  const [secili, setSecili] = useState({}) // ekstraId -> adet
  const [indirim, setIndirim] = useState(0)
  const [musteri, setMusteri] = useState({ ad: '', telefon: '', email: '' })
  const [notlar, setNotlar] = useState('')
  const [pending, startTransition] = useTransition()
  const [sonuc, setSonuc] = useState(null)

  const hizmet = hizmetler.find(h => h.id === hizmetId) || null
  const kategoriHizmetler = hizmetler.filter(h => h.kategori === kategori)

  // Ekstraları gruplayarak
  const ekstraGruplari = useMemo(() => {
    const g = {}
    for (const e of ekstralar) { (g[e.grup] = g[e.grup] || []).push(e) }
    return g
  }, [ekstralar])

  const secilenEkstralar = useMemo(() =>
    Object.entries(secili).map(([id, adet]) => ({ ekstra: ekstralar.find(e => e.id === id), adet })).filter(x => x.ekstra),
    [secili, ekstralar])

  const hesap = useMemo(() =>
    teklifHesapla({ hizmet, kisiSayisi: kisi, secilenEkstralar, indirim }),
    [hizmet, kisi, secilenEkstralar, indirim])

  function ekstraToggle(e) {
    setSecili(prev => {
      const y = { ...prev }
      if (y[e.id] != null) delete y[e.id]
      else y[e.id] = 1
      return y
    })
  }
  function ekstraAdet(id, adet) {
    setSecili(prev => ({ ...prev, [id]: Math.max(1, adet) }))
  }

  function kaydet() {
    if (!hizmet) return
    startTransition(async () => {
      const r = await teklifKaydet({
        musteri_ad: musteri.ad, musteri_telefon: musteri.telefon, musteri_email: musteri.email,
        hizmet_id: hizmet.id, hizmet_ad: hizmet.ad, kategori: hizmet.kategori,
        kisi_sayisi: kisi, ara_toplam: hesap.araToplam, ekstra_toplam: hesap.ekstraToplam,
        indirim: hesap.indirim, toplam: hesap.toplam, notlar, kalemler: hesap.kalemler,
      })
      if (r.ok) setSonuc({ ok: true, no: r.teklif_no })
      else setSonuc({ ok: false, error: r.error })
    })
  }

  // Başarı ekranı
  if (sonuc?.ok) {
    return (
      <div style={{ padding: '4rem 2.5rem', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1.5rem' }}>
          <i className="fas fa-check" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--color-slate)', marginBottom: '0.5rem' }}>Teklif Oluşturuldu</h1>
        <p style={{ color: 'var(--color-slate-medium)', marginBottom: '0.5rem' }}>Teklif No: <strong style={{ color: 'var(--color-slate)' }}>{sonuc.no}</strong></p>
        <p style={{ color: 'var(--color-slate-medium)', marginBottom: '2rem' }}>Toplam: <strong style={{ color: 'var(--color-orange)' }}>{tl(hesap.toplam)}</strong></p>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => router.push('/yonetim/teklifler')} style={{ padding: '0.8rem 1.4rem', fontSize: '0.78rem' }}>Tekliflere Git</button>
          <button className="btn-secondary" onClick={() => { setSonuc(null); setHizmetId(null); setSecili({}); setIndirim(0); setMusteri({ ad: '', telefon: '', email: '' }); setNotlar('') }} style={{ padding: '0.8rem 1.4rem', fontSize: '0.78rem' }}>Yeni Teklif</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Satış Hattı</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Canlı Teklif Oluştur</h1>
      </div>

      {sonuc?.ok === false && (
        <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.85rem' }}>{sonuc.error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }} className="builder-grid">
        {/* SOL: Seçim */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Kategori */}
          <Bolum no="1" baslik="Etkinlik Kategorisi">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {KATEGORILER.map(k => {
                const aktif = kategori === k.key
                return (
                  <button key={k.key} onClick={() => { setKategori(k.key); setHizmetId(null) }} style={{
                    fontFamily: 'var(--font-display)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.04em',
                    padding: '0.6rem 1rem', cursor: 'pointer', border: '1px solid',
                    borderColor: aktif ? 'var(--color-orange)' : 'var(--color-cream-dark)',
                    background: aktif ? 'var(--color-orange)' : '#fff', color: aktif ? '#fff' : 'var(--color-slate-medium)',
                  }}>{k.label}</button>
                )
              })}
            </div>
          </Bolum>

          {/* 2. Hizmet */}
          <Bolum no="2" baslik="Hizmet Seçimi">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
              {kategoriHizmetler.map(h => {
                const aktif = hizmetId === h.id
                return (
                  <button key={h.id} onClick={() => setHizmetId(h.id)} style={{
                    textAlign: 'left', cursor: 'pointer', padding: '1rem', border: '2px solid',
                    borderColor: aktif ? 'var(--color-orange)' : 'var(--color-cream-dark)',
                    background: aktif ? 'var(--color-orange-light)' : '#fff',
                  }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.3rem' }}>{h.ad}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-orange)' }}>
                      {tl(h.birim_fiyat)}{h.fiyatlandirma_tipi !== 'sabit' ? ' /kişi' : ''}
                    </div>
                  </button>
                )
              })}
              {kategoriHizmetler.length === 0 && <p style={{ color: 'var(--color-slate-medium)', fontSize: '0.88rem' }}>Bu kategoride aktif hizmet yok.</p>}
            </div>
          </Bolum>

          {/* 3. Kişi sayısı */}
          {hizmet && hizmet.fiyatlandirma_tipi !== 'sabit' && (
            <Bolum no="3" baslik="Kişi Sayısı">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => setKisi(k => Math.max(0, k - 10))} style={stepBtn}>−</button>
                <input type="number" value={kisi} onChange={e => setKisi(Math.max(0, Number(e.target.value) || 0))} style={{
                  width: '120px', textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 600,
                  color: 'var(--color-slate)', border: '1px solid var(--color-cream-dark)', padding: '0.4rem', outline: 'none',
                }} />
                <button onClick={() => setKisi(k => k + 10)} style={stepBtn}>+</button>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-slate-medium)' }}>kişi</span>
              </div>
            </Bolum>
          )}

          {/* 4. Ekstralar */}
          {hizmet && (
            <Bolum no="4" baslik="Ekstra Seçenekler">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {Object.entries(ekstraGruplari).map(([grup, liste]) => (
                  <div key={grup}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.6rem' }}>{grup}</div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {liste.map(e => {
                        const secildi = secili[e.id] != null
                        return (
                          <div key={e.id} style={{
                            display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem 0.9rem',
                            border: '1px solid', borderColor: secildi ? 'var(--color-orange)' : 'var(--color-cream-dark)',
                            background: secildi ? 'var(--color-orange-light)' : '#fff', cursor: 'pointer',
                          }} onClick={() => ekstraToggle(e)}>
                            <div style={{
                              width: '22px', height: '22px', flexShrink: 0, borderRadius: '5px',
                              border: '2px solid', borderColor: secildi ? 'var(--color-orange)' : 'var(--color-cream-dark)',
                              background: secildi ? 'var(--color-orange)' : '#fff', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
                            }}>{secildi && <i className="fas fa-check" />}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate)' }}>{e.ad}</div>
                              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.76rem', color: 'var(--color-slate-medium)' }}>
                                {tl(e.birim_fiyat)}{BIRIM_ETIKET[e.birim] ? ` / ${BIRIM_ETIKET[e.birim]}` : ''}
                              </div>
                            </div>
                            {secildi && e.birim === 'adet' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={ev => ev.stopPropagation()}>
                                <button onClick={() => ekstraAdet(e.id, secili[e.id] - 1)} style={miniStep}>−</button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{secili[e.id]}</span>
                                <button onClick={() => ekstraAdet(e.id, secili[e.id] + 1)} style={miniStep}>+</button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Bolum>
          )}
        </div>

        {/* SAĞ: Özet (sticky) */}
        <div style={{ position: 'sticky', top: '80px', background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
          <div style={{ padding: '1.3rem 1.5rem', background: 'var(--color-slate-deep)', color: 'var(--color-cream)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Teklif Özeti</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600 }}>{tl(hesap.toplam)}</div>
          </div>

          <div style={{ padding: '1.3rem 1.5rem' }}>
            {!hizmet ? (
              <p style={{ color: 'var(--color-slate-medium)', fontSize: '0.88rem', textAlign: 'center', padding: '1rem 0' }}>Bir hizmet seçin.</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {hesap.kalemler.map((k, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontFamily: 'var(--font-sans)', fontSize: '0.84rem' }}>
                      <span style={{ color: k.tur === 'hizmet' ? 'var(--color-slate)' : 'var(--color-slate-medium)', fontWeight: k.tur === 'hizmet' ? 600 : 400 }}>
                        {k.ad}{k.birim === 'kisi' || k.tur === 'hizmet' && k.birim === 'kisi' ? ` ×${k.adet}` : (k.birim === 'adet' && k.adet > 1 ? ` ×${k.adet}` : '')}
                      </span>
                      <span style={{ color: 'var(--color-slate)', whiteSpace: 'nowrap' }}>{tl(k.tutar)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--color-cream-dark)', paddingTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <Satir etiket="Ara toplam" deger={tl(hesap.araToplam)} />
                  {hesap.ekstraToplam > 0 && <Satir etiket="Ekstralar" deger={tl(hesap.ekstraToplam)} />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--color-slate-medium)' }}>İndirim (₺)</span>
                    <input type="number" value={indirim} onChange={e => setIndirim(Math.max(0, Number(e.target.value) || 0))} style={{ width: '110px', textAlign: 'right', border: '1px solid var(--color-cream-dark)', padding: '0.3rem 0.5rem', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ borderTop: '2px solid var(--color-slate)', marginTop: '0.8rem', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>Toplam</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-orange)' }}>{tl(hesap.toplam)}</span>
                </div>

                {/* Müşteri bilgileri */}
                <div style={{ borderTop: '1px solid var(--color-cream-dark)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input placeholder="Müşteri adı" value={musteri.ad} onChange={e => setMusteri(m => ({ ...m, ad: e.target.value }))} style={ozetInput} />
                  <input placeholder="Telefon" value={musteri.telefon} onChange={e => setMusteri(m => ({ ...m, telefon: e.target.value }))} style={ozetInput} />
                  <input placeholder="E-posta" value={musteri.email} onChange={e => setMusteri(m => ({ ...m, email: e.target.value }))} style={ozetInput} />
                </div>

                <button className="btn-primary" disabled={pending} onClick={kaydet} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', opacity: pending ? 0.6 : 1 }}>
                  {pending ? 'Kaydediliyor…' : 'Teklifi Kaydet'}
                  {!pending && <i className="fas fa-arrow-right" style={{ fontSize: '0.72rem' }} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .builder-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const stepBtn = {
  width: '48px', height: '48px', fontSize: '1.4rem', cursor: 'pointer',
  border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)',
}
const miniStep = {
  width: '26px', height: '26px', fontSize: '1rem', cursor: 'pointer', lineHeight: 1,
  border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)',
}
const ozetInput = {
  width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: 'var(--color-slate)',
  background: 'var(--color-cream-light)', border: '1px solid var(--color-cream-dark)', padding: '0.55rem 0.7rem', outline: 'none', boxSizing: 'border-box',
}

function Bolum({ no, baslik, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-orange)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700 }}>{no}</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate)', margin: 0 }}>{baslik}</h2>
      </div>
      {children}
    </div>
  )
}

function Satir({ etiket, deger }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate-medium)' }}>
      <span>{etiket}</span><span style={{ color: 'var(--color-slate)' }}>{deger}</span>
    </div>
  )
}
