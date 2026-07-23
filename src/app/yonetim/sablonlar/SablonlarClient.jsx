'use client'

import { useState, useTransition } from 'react'
import { sablonKaydet } from './actions'

const TUR = { email: { ik: 'fas fa-envelope', l: 'E-posta' }, todo: { ik: 'fas fa-list-check', l: 'To-Do' }, sozlesme: { ik: 'fas fa-file-contract', l: 'Sözleşme' } }
const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.6rem 0.8rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.35rem', display: 'block' }

export default function SablonlarClient({ sablonlar: ilk, demo }) {
  const [sablonlar, setSablonlar] = useState(ilk)
  const [duzenle, setDuzenle] = useState(null)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)

  function bildir(tip, metin) { setMesaj({ tip, metin }); setTimeout(() => setMesaj(null), 3500) }

  function kaydet() {
    const data = duzenle
    startTransition(async () => {
      const r = await sablonKaydet(data)
      if (!r.ok) return bildir('hata', r.error)
      setSablonlar(prev => prev.map(x => x.id === data.id ? { ...data, id: r.id || data.id } : x))
      setDuzenle(null)
      bildir('basari', demo ? 'Demo: şablon kaydedildi.' : 'Şablon kaydedildi.')
    })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Sistem</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Şablon Merkezi</h1>
        <p style={{ color: 'var(--color-slate-medium)', fontSize: '0.9rem', marginTop: '0.4rem' }}>E-posta ve mesaj şablonları. <code style={{ background: 'var(--color-cream)', padding: '0.1rem 0.3rem', fontSize: '0.82rem' }}>{'{{ad}}'}</code> gibi yer tutucular gönderimde otomatik doldurulur.</p>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
        {sablonlar.map(s => {
          const t = TUR[s.tur] || TUR.email
          return (
            <div key={s.id} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.4rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}><i className={t.ik} /></div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-slate)' }}>{s.ad}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{t.l}</div>
                  </div>
                </div>
                <button onClick={() => setDuzenle({ ...s })} title="Düzenle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-orange)', padding: '0.3rem' }}><i className="fas fa-pen" /></button>
              </div>
              {s.konu && <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.4rem' }}>{s.konu}</div>}
              <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.icerik}</p>
            </div>
          )
        })}
      </div>

      {duzenle && (
        <>
          <div onClick={() => setDuzenle(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
          <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>Şablonu Düzenle</h2>
              <button onClick={() => setDuzenle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
            </div>
            <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
              <div><label style={lbl}>Şablon Adı</label><input style={inp} value={duzenle.ad} onChange={e => setDuzenle(d => ({ ...d, ad: e.target.value }))} /></div>
              {duzenle.tur === 'email' && <div><label style={lbl}>E-posta Konusu</label><input style={inp} value={duzenle.konu || ''} onChange={e => setDuzenle(d => ({ ...d, konu: e.target.value }))} /></div>}
              <div><label style={lbl}>İçerik</label><textarea style={{ ...inp, minHeight: '220px', resize: 'vertical', lineHeight: 1.6 }} value={duzenle.icerik || ''} onChange={e => setDuzenle(d => ({ ...d, icerik: e.target.value }))} /></div>
              <div style={{ background: 'var(--color-cream-light)', padding: '0.8rem 1rem', border: '1px solid var(--color-cream-dark)', fontSize: '0.78rem', color: 'var(--color-slate-medium)', lineHeight: 1.6 }}>
                <strong>Yer tutucular:</strong> <code>{'{{ad}}'}</code>, <code>{'{{tarih}}'}</code>, <code>{'{{saat}}'}</code>, <code>{'{{konum}}'}</code>, <code>{'{{etkinlik}}'}</code>
              </div>
            </div>
            <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
              <button className="btn-primary" disabled={pending || !duzenle.ad?.trim()} onClick={kaydet} style={{ width: '100%', justifyContent: 'center', opacity: (pending || !duzenle.ad?.trim()) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
