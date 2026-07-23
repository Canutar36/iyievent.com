'use client'

import { useState, useTransition } from 'react'
import { tl } from '@/lib/fiyat'
import { sozlesmeKaydet, sozlesmeDurumGuncelle, sozlesmeSil } from './actions'

const AKIS = ['taslak', 'gonderildi', 'imzalandi']
const DURUM = {
  taslak: { bg: '#F3F4F6', text: '#6B7280', l: 'Taslak', ik: 'fas fa-pen-ruler' },
  gonderildi: { bg: '#DBEAFE', text: '#1D4ED8', l: 'Gönderildi', ik: 'fas fa-paper-plane' },
  imzalandi: { bg: '#D1FAE5', text: '#059669', l: 'İmzalandı', ik: 'fas fa-file-signature' },
  iptal: { bg: '#FEE2E2', text: '#DC2626', l: 'İptal', ik: 'fas fa-ban' },
}
const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.55rem 0.7rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.3rem', display: 'block' }
const tarih = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function SozlesmelerClient({ sozlesmeler: ilk, demo }) {
  const [sozlesmeler, setSozlesmeler] = useState(ilk)
  const [form, setForm] = useState(null)
  const [secili, setSecili] = useState(null)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3500) }

  function kaydet() {
    startTransition(async () => {
      const r = await sozlesmeKaydet(form)
      if (!r.ok) return bildir('hata', r.error)
      const yeni = { ...form, id: form.id || r.id, sozlesme_no: r.sozlesme_no, durum: form.durum || 'taslak', created_at: form.created_at || new Date().toISOString() }
      setSozlesmeler(p => form.id ? p.map(x => x.id === form.id ? yeni : x) : [yeni, ...p])
      setForm(null); bildir('basari', demo ? 'Demo: sözleşme kaydedildi.' : 'Kaydedildi.')
    })
  }
  function durum(s, d) {
    setSozlesmeler(p => p.map(x => x.id === s.id ? { ...x, durum: d } : x))
    if (secili?.id === s.id) setSecili({ ...secili, durum: d })
    startTransition(async () => {
      const r = await sozlesmeDurumGuncelle(s.id, d, { email: s.musteri_email, baslik: s.baslik, etkinlikAd: s.etkinlik_ad })
      if (!r.ok) bildir('hata', r.error)
      else if (d === 'gonderildi') bildir('basari', demo ? 'Demo: sözleşme gönderildi (müşteriye mail).' : 'Sözleşme gönderildi, müşteriye mail iletildi.')
    })
  }
  function sil(id) {
    if (!confirm('Sözleşme silinsin mi?')) return
    startTransition(async () => { const r = await sozlesmeSil(id); if (!r.ok) return bildir('hata', r.error); setSozlesmeler(p => p.filter(x => x.id !== id)); setSecili(null); bildir('basari', 'Silindi.') })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Satış Hattı</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Sözleşmeler</h1>
        </div>
        <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }} onClick={() => setForm({ baslik: '', musteri_ad: '', musteri_email: '', etkinlik_ad: '', tutar: '', durum: 'taslak', notlar: '' })}><i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> Sözleşme Oluştur</button>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
            {['Sözleşme No', 'Başlık / Müşteri', 'Tutar', 'Tarih', 'Durum', ''].map((h, i) => <th key={i} style={{ textAlign: i === 2 ? 'right' : (i === 5 ? 'right' : 'left'), padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {sozlesmeler.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Sözleşme yok.</td></tr>}
            {sozlesmeler.map(s => {
              const d = DURUM[s.durum] || DURUM.taslak
              return (
                <tr key={s.id} onClick={() => setSecili(s)} style={{ borderBottom: '1px solid var(--color-cream)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-cream-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate)' }}>{s.sozlesme_no}</td>
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>{s.baslik}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.76rem', color: 'var(--color-slate-medium)' }}>{s.musteri_ad}{s.etkinlik_ad ? ` · ${s.etkinlik_ad}` : ''}</div>
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>{tl(s.tutar)}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{tarih(s.created_at)}</td>
                  <td style={{ padding: '0.9rem 1.2rem' }}><span style={{ background: d.bg, color: d.text, padding: '0.25rem 0.6rem', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}><i className={d.ik} style={{ marginRight: '0.3rem' }} />{d.l}</span></td>
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', color: 'var(--color-slate-medium)' }}><i className="fas fa-chevron-right" style={{ fontSize: '0.72rem' }} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detay */}
      {secili && (
        <>
          <div onClick={() => setSecili(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.35)', zIndex: 200 }} />
          <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', maxWidth: '100%', background: '#fff', zIndex: 201, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-orange)' }}>{secili.sozlesme_no}</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0.2rem 0 0' }}>{secili.baslik}</h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{secili.musteri_ad} · {tl(secili.tutar)}</div>
              </div>
              <button onClick={() => setSecili(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
            </div>
            <div style={{ padding: '1.6rem 1.8rem', flex: 1 }}>
              {/* Yaşam döngüsü adımları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {AKIS.map((asama, i) => {
                  const d = DURUM[asama]
                  const aktifIdx = AKIS.indexOf(secili.durum)
                  const done = i <= aktifIdx && secili.durum !== 'iptal'
                  const tarihStr = asama === 'gonderildi' ? secili.gonderim_tarihi : (asama === 'imzalandi' ? secili.imza_tarihi : secili.created_at)
                  return (
                    <div key={asama} style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: done ? d.text : 'var(--color-cream)', color: done ? '#fff' : 'var(--color-slate-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}><i className={d.ik} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: done ? 'var(--color-slate)' : 'var(--color-slate-medium)' }}>{d.l}</div>
                        {done && tarihStr && <div style={{ fontSize: '0.74rem', color: 'var(--color-slate-medium)' }}>{tarih(tarihStr)}</div>}
                      </div>
                      {done && <i className="fas fa-check" style={{ color: d.text, fontSize: '0.8rem' }} />}
                    </div>
                  )
                })}
              </div>
              {secili.musteri_email && <div style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-envelope" style={{ color: 'var(--color-orange)', marginRight: '0.4rem' }} />{secili.musteri_email}</div>}
            </div>
            <div style={{ padding: '1.3rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {secili.durum === 'taslak' && <button className="btn-primary" disabled={pending} onClick={() => durum(secili, 'gonderildi')} style={{ flex: 1, justifyContent: 'center' }}><i className="fas fa-paper-plane" style={{ fontSize: '0.75rem' }} /> Müşteriye Gönder</button>}
              {secili.durum === 'gonderildi' && <button className="btn-primary" disabled={pending} onClick={() => durum(secili, 'imzalandi')} style={{ flex: 1, justifyContent: 'center' }}><i className="fas fa-file-signature" style={{ fontSize: '0.75rem' }} /> İmzalandı Olarak İşaretle</button>}
              {secili.durum === 'imzalandi' && <div style={{ flex: 1, textAlign: 'center', padding: '0.7rem', color: '#059669', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}><i className="fas fa-circle-check" /> Sözleşme İmzalandı</div>}
              <button onClick={() => sil(secili.id)} style={{ padding: '0.7rem 1rem', cursor: 'pointer', border: '1px solid #FECACA', background: '#fff', color: '#DC2626', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}><i className="fas fa-trash" /></button>
            </div>
          </aside>
        </>
      )}

      {/* Oluştur formu */}
      {form && (
        <>
          <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
          <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>Sözleşme Oluştur</h2>
              <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
            </div>
            <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div><label style={lbl}>Başlık</label><input style={inp} value={form.baslik} onChange={e => setForm({ ...form, baslik: e.target.value })} placeholder="ör. Düğün Organizasyon Sözleşmesi" /></div>
              <div><label style={lbl}>Müşteri</label><input style={inp} value={form.musteri_ad} onChange={e => setForm({ ...form, musteri_ad: e.target.value })} /></div>
              <div><label style={lbl}>Müşteri E-posta</label><input style={inp} value={form.musteri_email} onChange={e => setForm({ ...form, musteri_email: e.target.value })} /></div>
              <div><label style={lbl}>Etkinlik (ops.)</label><input style={inp} value={form.etkinlik_ad} onChange={e => setForm({ ...form, etkinlik_ad: e.target.value })} /></div>
              <div><label style={lbl}>Tutar (₺)</label><input type="number" style={inp} value={form.tutar} onChange={e => setForm({ ...form, tutar: e.target.value })} /></div>
              <div><label style={lbl}>Notlar</label><textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={form.notlar} onChange={e => setForm({ ...form, notlar: e.target.value })} /></div>
            </div>
            <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
              <button className="btn-primary" disabled={pending || !form.baslik?.trim()} onClick={kaydet} style={{ width: '100%', justifyContent: 'center', opacity: (pending || !form.baslik?.trim()) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Taslak Oluştur'}</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
