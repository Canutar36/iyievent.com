'use client'

import { useState, useTransition } from 'react'
import { hizmetFiyati, ekstraFiyati, tl } from '@/lib/fiyat'
import { KATEGORILER } from '@/lib/demo-katalog'
import { hizmetKaydet, hizmetSil, ekstraKaydet, ekstraSil } from './actions'

const FIYAT_TIPI = { kisi_basi: 'Kişi Başı', sabit: 'Sabit', kademeli: 'Kademeli' }
const BIRIM = { adet: 'Adet', kisi: 'Kişi Başı', sabit: 'Sabit' }
const kategoriLabel = (k) => KATEGORILER.find(x => x.key === k)?.label || k

const inputStyle = {
  width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)',
  background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.6rem 0.8rem',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle = { fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.35rem', display: 'block' }

function bosHizmet() {
  return { ad: '', kategori: 'bireysel', fiyatlandirma_tipi: 'kisi_basi', birim_fiyat: '', min_kisi: '', aciklama: '', aktif: true, kademeler: [] }
}
function bosEkstra() {
  return { ad: '', grup: 'Genel', birim: 'adet', birim_fiyat: '', aktif: true }
}

export default function KatalogClient({ hizmetler: ilkH, ekstralar: ilkE, demo }) {
  const [tab, setTab] = useState('hizmetler')
  const [hizmetler, setHizmetler] = useState(ilkH)
  const [ekstralar, setEkstralar] = useState(ilkE)
  const [form, setForm] = useState(null) // {tip:'hizmet'|'ekstra', data}
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)

  function bildir(tip, metin) { setMesaj({ tip, metin }); setTimeout(() => setMesaj(null), 3500) }

  // ---- Kaydet ----
  function kaydet() {
    const { tip, data } = form
    startTransition(async () => {
      if (tip === 'hizmet') {
        const r = await hizmetKaydet(data)
        if (!r.ok) return bildir('hata', r.error)
        const yeni = { ...data, id: data.id || r.id }
        setHizmetler(prev => data.id ? prev.map(x => x.id === data.id ? yeni : x) : [...prev, yeni])
      } else {
        const r = await ekstraKaydet(data)
        if (!r.ok) return bildir('hata', r.error)
        const yeni = { ...data, id: data.id || r.id }
        setEkstralar(prev => data.id ? prev.map(x => x.id === data.id ? yeni : x) : [...prev, yeni])
      }
      setForm(null)
      bildir('basari', demo ? 'Demo: kaydedildi.' : 'Kaydedildi.')
    })
  }

  function sil(tip, id) {
    if (!confirm('Silinsin mi?')) return
    startTransition(async () => {
      const r = tip === 'hizmet' ? await hizmetSil(id) : await ekstraSil(id)
      if (!r.ok) return bildir('hata', r.error)
      if (tip === 'hizmet') setHizmetler(prev => prev.filter(x => x.id !== id))
      else setEkstralar(prev => prev.filter(x => x.id !== id))
      bildir('basari', 'Silindi.')
    })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Satış Hattı</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Hizmet & Fiyat Kataloğu</h1>
        </div>
        <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }}
          onClick={() => setForm({ tip: tab === 'hizmetler' ? 'hizmet' : 'ekstra', data: tab === 'hizmetler' ? bosHizmet() : bosEkstra() })}>
          <i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> {tab === 'hizmetler' ? 'Hizmet Ekle' : 'Ekstra Ekle'}
        </button>
      </div>

      {mesaj && (
        <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
          background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`,
          color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>
      )}

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-cream-dark)', marginBottom: '1.5rem' }}>
        {[['hizmetler', `Hizmetler (${hizmetler.length})`], ['ekstralar', `Ekstralar (${ekstralar.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0.8rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '-1px',
            color: tab === k ? 'var(--color-orange)' : 'var(--color-slate-medium)',
            borderBottom: tab === k ? '2px solid var(--color-orange)' : '2px solid transparent',
          }}>{l}</button>
        ))}
      </div>

      {/* HİZMETLER */}
      {tab === 'hizmetler' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
          {hizmetler.map(h => (
            <div key={h.id} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.4rem', opacity: h.aktif === false ? 0.55 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', background: 'var(--color-cream)', padding: '0.2rem 0.5rem' }}>{kategoriLabel(h.kategori)}</span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0.5rem 0 0' }}>{h.ad}</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                  <button onClick={() => setForm({ tip: 'hizmet', data: { ...h, kademeler: h.kademeler || [] } })} title="Düzenle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-medium)', padding: '0.3rem' }}><i className="fas fa-pen" /></button>
                  <button onClick={() => sil('hizmet', h.id)} title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.3rem' }}><i className="fas fa-trash" /></button>
                </div>
              </div>
              {h.aciklama && <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)', margin: '0 0 0.9rem', lineHeight: 1.5 }}>{h.aciklama}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--color-cream)', paddingTop: '0.8rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-orange)' }}>{FIYAT_TIPI[h.fiyatlandirma_tipi]}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-slate)' }}>
                  {tl(h.birim_fiyat)}{h.fiyatlandirma_tipi !== 'sabit' ? <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-medium)' }}> /kişi</span> : ''}
                </span>
              </div>
            </div>
          ))}
          {hizmetler.length === 0 && <EmptyState metin="Henüz hizmet eklenmedi." />}
        </div>
      )}

      {/* EKSTRALAR */}
      {tab === 'ekstralar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {ekstralar.map(e => (
            <div key={e.id} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.2rem', opacity: e.aktif === false ? 0.55 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{e.grup}</span>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.98rem', fontWeight: 600, color: 'var(--color-slate)', margin: '0.2rem 0 0' }}>{e.ad}</h4>
                </div>
                <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                  <button onClick={() => setForm({ tip: 'ekstra', data: { ...e } })} title="Düzenle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-medium)', padding: '0.25rem', fontSize: '0.82rem' }}><i className="fas fa-pen" /></button>
                  <button onClick={() => sil('ekstra', e.id)} title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.25rem', fontSize: '0.82rem' }}><i className="fas fa-trash" /></button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.9rem' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--color-slate-medium)' }}>{BIRIM[e.birim]}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-slate)' }}>{tl(e.birim_fiyat)}</span>
              </div>
            </div>
          ))}
          {ekstralar.length === 0 && <EmptyState metin="Henüz ekstra eklenmedi." />}
        </div>
      )}

      {/* FORM DRAWER */}
      {form && (
        <FormDrawer
          form={form} setForm={setForm} pending={pending} onKaydet={kaydet}
        />
      )}
    </div>
  )
}

function EmptyState({ metin }) {
  return <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)', border: '2px dashed var(--color-cream-dark)' }}>{metin}</div>
}

function FormDrawer({ form, setForm, pending, onKaydet }) {
  const { tip, data } = form
  const set = (alan, deger) => setForm(f => ({ ...f, data: { ...f.data, [alan]: deger } }))

  // Kademe editörü
  const kademeEkle = () => set('kademeler', [...(data.kademeler || []), { min_kisi: '', max_kisi: '', birim_fiyat: '' }])
  const kademeSet = (i, alan, deger) => set('kademeler', data.kademeler.map((k, ki) => ki === i ? { ...k, [alan]: deger } : k))
  const kademeSil = (i) => set('kademeler', data.kademeler.filter((_, ki) => ki !== i))

  // Canlı fiyat önizleme (örnek kişi)
  const ornekKisi = data.min_kisi || 100
  const onizleme = tip === 'hizmet'
    ? hizmetFiyati(data, ornekKisi)
    : ekstraFiyati(data, ornekKisi, 1)

  const gecerli = data.ad && String(data.birim_fiyat) !== ''

  return (
    <>
      <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.35)', zIndex: 200 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '460px', maxWidth: '100%', background: '#fff', zIndex: 201, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>
            {data.id ? 'Düzenle' : (tip === 'hizmet' ? 'Yeni Hizmet' : 'Yeni Ekstra')}
          </h2>
          <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
        </div>

        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
          <div>
            <label style={labelStyle}>Ad</label>
            <input style={inputStyle} value={data.ad} onChange={e => set('ad', e.target.value)} placeholder={tip === 'hizmet' ? 'ör. Kır Düğünü' : 'ör. Dondurma Arabası'} />
          </div>

          {tip === 'hizmet' ? (
            <>
              <div>
                <label style={labelStyle}>Kategori</label>
                <select style={inputStyle} value={data.kategori} onChange={e => set('kategori', e.target.value)}>
                  {KATEGORILER.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fiyatlandırma Tipi</label>
                <select style={inputStyle} value={data.fiyatlandirma_tipi} onChange={e => set('fiyatlandirma_tipi', e.target.value)}>
                  <option value="kisi_basi">Kişi Başı</option>
                  <option value="sabit">Sabit Fiyat</option>
                  <option value="kademeli">Kademeli (kişi aralığına göre)</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>{data.fiyatlandirma_tipi === 'sabit' ? 'Fiyat (₺)' : 'Birim Fiyat (₺/kişi)'}</label>
                  <input type="number" style={inputStyle} value={data.birim_fiyat} onChange={e => set('birim_fiyat', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Min. Kişi</label>
                  <input type="number" style={inputStyle} value={data.min_kisi} onChange={e => set('min_kisi', e.target.value)} placeholder="0" />
                </div>
              </div>

              {data.fiyatlandirma_tipi === 'kademeli' && (
                <div style={{ border: '1px solid var(--color-cream-dark)', padding: '1rem', background: 'var(--color-cream-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Kademeler</label>
                    <button onClick={kademeEkle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-orange)', fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>+ Ekle</button>
                  </div>
                  {(data.kademeler || []).map((k, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.4rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <input type="number" placeholder="Min" style={{ ...inputStyle, padding: '0.4rem' }} value={k.min_kisi} onChange={e => kademeSet(i, 'min_kisi', e.target.value)} />
                      <input type="number" placeholder="Max" style={{ ...inputStyle, padding: '0.4rem' }} value={k.max_kisi ?? ''} onChange={e => kademeSet(i, 'max_kisi', e.target.value)} />
                      <input type="number" placeholder="₺/kişi" style={{ ...inputStyle, padding: '0.4rem' }} value={k.birim_fiyat} onChange={e => kademeSet(i, 'birim_fiyat', e.target.value)} />
                      <button onClick={() => kademeSil(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}><i className="fas fa-xmark" /></button>
                    </div>
                  ))}
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-slate-medium)', margin: '0.3rem 0 0' }}>Max boş = üst sınırsız.</p>
                </div>
              )}

              <div>
                <label style={labelStyle}>Açıklama</label>
                <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={data.aciklama || ''} onChange={e => set('aciklama', e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={labelStyle}>Grup</label>
                  <input style={inputStyle} value={data.grup} onChange={e => set('grup', e.target.value)} placeholder="İkram / Eğlence / Teknik" />
                </div>
                <div>
                  <label style={labelStyle}>Birim</label>
                  <select style={inputStyle} value={data.birim} onChange={e => set('birim', e.target.value)}>
                    <option value="adet">Adet</option>
                    <option value="kisi">Kişi Başı</option>
                    <option value="sabit">Sabit</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Birim Fiyat (₺)</label>
                <input type="number" style={inputStyle} value={data.birim_fiyat} onChange={e => set('birim_fiyat', e.target.value)} placeholder="0" />
              </div>
            </>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate)' }}>
            <input type="checkbox" checked={data.aktif !== false} onChange={e => set('aktif', e.target.checked)} />
            Aktif (teklif builder'da görünür)
          </label>

          {/* Canlı önizleme */}
          <div style={{ background: 'var(--color-slate-deep)', color: 'var(--color-cream)', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(246,243,234,0.6)' }}>
              {ornekKisi} kişi için örnek
            </span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-orange)' }}>{tl(onizleme)}</span>
          </div>
        </div>

        <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
          <button className="btn-primary" disabled={!gecerli || pending} onClick={onKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (!gecerli || pending) ? 0.55 : 1 }}>
            {pending ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </aside>
    </>
  )
}
