'use client'

import { useState, useTransition } from 'react'
import { tl } from '@/lib/fiyat'
import { kaynakKaydet, kaynakSil } from './actions'

const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.6rem 0.8rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.35rem', display: 'block' }

const TABS = [
  { key: 'tedarikci', dataKey: 'tedarikciler', label: 'Tedarikçiler', ikon: 'fas fa-truck-field' },
  { key: 'envanter', dataKey: 'envanter', label: 'Envanter & Ekipman', ikon: 'fas fa-boxes-stacked' },
  { key: 'personel', dataKey: 'personel', label: 'Personel & Host', ikon: 'fas fa-people-group' },
]

const BOS = {
  tedarikci: { ad: '', kategori: 'Catering', yetkili: '', telefon: '', email: '', notlar: '', aktif: true },
  envanter: { ad: '', kategori: 'Genel', adet_toplam: '', birim: 'adet', gunluk_kira: '', notlar: '', aktif: true },
  personel: { ad: '', rol_gorev: 'Host', telefon: '', email: '', gunluk_ucret: '', aktif: true },
}

export default function KaynaklarClient({ data: ilk, demo }) {
  const [tab, setTab] = useState('tedarikci')
  const [data, setData] = useState(ilk)
  const [form, setForm] = useState(null) // { tip, veri }
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)

  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3000) }
  const aktifTab = TABS.find(t => t.key === tab)
  const liste = data[aktifTab.dataKey] || []

  function kaydet() {
    const { tip, veri } = form
    const dk = TABS.find(t => t.key === tip).dataKey
    startTransition(async () => {
      const r = await kaynakKaydet(tip, veri)
      if (!r.ok) return bildir('hata', r.error)
      const yeni = { ...veri, id: veri.id || r.id }
      setData(prev => ({ ...prev, [dk]: veri.id ? prev[dk].map(x => x.id === veri.id ? yeni : x) : [...prev[dk], yeni] }))
      setForm(null)
      bildir('basari', demo ? 'Demo: kaydedildi.' : 'Kaydedildi.')
    })
  }
  function sil(tip, id) {
    if (!confirm('Silinsin mi?')) return
    const dk = TABS.find(t => t.key === tip).dataKey
    startTransition(async () => {
      const r = await kaynakSil(tip, id)
      if (!r.ok) return bildir('hata', r.error)
      setData(prev => ({ ...prev, [dk]: prev[dk].filter(x => x.id !== id) }))
      bildir('basari', 'Silindi.')
    })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Operasyon</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Kaynak Yönetimi</h1>
        </div>
        <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }} onClick={() => setForm({ tip: tab, veri: { ...BOS[tab] } })}>
          <i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> {aktifTab.label.split(' ')[0]} Ekle
        </button>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-cream-dark)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.8rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '-1px', color: tab === t.key ? 'var(--color-orange)' : 'var(--color-slate-medium)', borderBottom: tab === t.key ? '2px solid var(--color-orange)' : '2px solid transparent' }}>
            <i className={t.ikon} /> {t.label} ({(data[t.dataKey] || []).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {liste.length === 0 && <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)', border: '2px dashed var(--color-cream-dark)' }}>Kayıt yok.</div>}
        {liste.map(item => (
          <div key={item.id} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.3rem', opacity: item.aktif === false ? 0.55 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', background: 'var(--color-cream)', padding: '0.2rem 0.5rem' }}>{item.kategori || item.rol_gorev}</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0.5rem 0 0' }}>{item.ad}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                <button onClick={() => setForm({ tip: tab, veri: { ...item } })} title="Düzenle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-medium)', padding: '0.25rem', fontSize: '0.82rem' }}><i className="fas fa-pen" /></button>
                <button onClick={() => sil(tab, item.id)} title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.25rem', fontSize: '0.82rem' }}><i className="fas fa-trash" /></button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.7rem', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>
              {item.yetkili && <span><i className="fas fa-user" style={{ width: '16px', color: 'var(--color-orange)' }} /> {item.yetkili}</span>}
              {item.telefon && <span><i className="fas fa-phone" style={{ width: '16px', color: 'var(--color-orange)' }} /> {item.telefon}</span>}
              {item.email && <span><i className="fas fa-envelope" style={{ width: '16px', color: 'var(--color-orange)' }} /> {item.email}</span>}
              {tab === 'envanter' && <span><i className="fas fa-cubes" style={{ width: '16px', color: 'var(--color-orange)' }} /> {item.adet_toplam} {item.birim} · {tl(item.gunluk_kira)}/gün</span>}
              {tab === 'personel' && item.gunluk_ucret > 0 && <span><i className="fas fa-wallet" style={{ width: '16px', color: 'var(--color-orange)' }} /> {tl(item.gunluk_ucret)}/gün</span>}
            </div>
          </div>
        ))}
      </div>

      {form && <FormDrawer form={form} setForm={setForm} pending={pending} onKaydet={kaydet} />}
    </div>
  )
}

function FormDrawer({ form, setForm, pending, onKaydet }) {
  const { tip, veri } = form
  const set = (a, v) => setForm(f => ({ ...f, veri: { ...f.veri, [a]: v } }))
  const gecerli = veri.ad?.trim()
  const baslik = veri.id ? 'Düzenle' : { tedarikci: 'Yeni Tedarikçi', envanter: 'Yeni Ekipman', personel: 'Yeni Personel' }[tip]

  return (
    <>
      <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>{baslik}</h2>
          <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <div><label style={lbl}>Ad</label><input style={inp} value={veri.ad} onChange={e => set('ad', e.target.value)} /></div>

          {tip === 'tedarikci' && <>
            <div><label style={lbl}>Kategori</label><input style={inp} value={veri.kategori || ''} onChange={e => set('kategori', e.target.value)} placeholder="Catering / Ses-Işık / Çadır…" /></div>
            <div><label style={lbl}>Yetkili</label><input style={inp} value={veri.yetkili || ''} onChange={e => set('yetkili', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div><label style={lbl}>Telefon</label><input style={inp} value={veri.telefon || ''} onChange={e => set('telefon', e.target.value)} /></div>
              <div><label style={lbl}>E-posta</label><input style={inp} value={veri.email || ''} onChange={e => set('email', e.target.value)} /></div>
            </div>
            <div><label style={lbl}>Not</label><textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={veri.notlar || ''} onChange={e => set('notlar', e.target.value)} /></div>
          </>}

          {tip === 'envanter' && <>
            <div><label style={lbl}>Kategori</label><input style={inp} value={veri.kategori || ''} onChange={e => set('kategori', e.target.value)} placeholder="Masa / Sandalye / Teknik…" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div><label style={lbl}>Toplam Adet</label><input type="number" style={inp} value={veri.adet_toplam} onChange={e => set('adet_toplam', e.target.value)} /></div>
              <div><label style={lbl}>Birim</label><input style={inp} value={veri.birim || ''} onChange={e => set('birim', e.target.value)} placeholder="adet" /></div>
            </div>
            <div><label style={lbl}>Günlük Kira (₺)</label><input type="number" style={inp} value={veri.gunluk_kira} onChange={e => set('gunluk_kira', e.target.value)} /></div>
            <div><label style={lbl}>Not</label><textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={veri.notlar || ''} onChange={e => set('notlar', e.target.value)} /></div>
          </>}

          {tip === 'personel' && <>
            <div><label style={lbl}>Rol / Görev</label><input style={inp} value={veri.rol_gorev || ''} onChange={e => set('rol_gorev', e.target.value)} placeholder="Host / Şef / DJ / Koordinatör…" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div><label style={lbl}>Telefon</label><input style={inp} value={veri.telefon || ''} onChange={e => set('telefon', e.target.value)} /></div>
              <div><label style={lbl}>E-posta</label><input style={inp} value={veri.email || ''} onChange={e => set('email', e.target.value)} /></div>
            </div>
            <div><label style={lbl}>Günlük Ücret (₺)</label><input type="number" style={inp} value={veri.gunluk_ucret} onChange={e => set('gunluk_ucret', e.target.value)} /></div>
          </>}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--color-slate)' }}>
            <input type="checkbox" checked={veri.aktif !== false} onChange={e => set('aktif', e.target.checked)} /> Aktif
          </label>
        </div>
        <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
          <button className="btn-primary" disabled={!gecerli || pending} onClick={onKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (!gecerli || pending) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</button>
        </div>
      </aside>
    </>
  )
}
