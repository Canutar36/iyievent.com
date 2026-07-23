'use client'

import { useState, useTransition } from 'react'
import { gorevToggle, gorevEkle, gorevSil } from './actions'

const KAYNAK = {
  sablon: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Şablon' },
  ekstra: { bg: 'rgba(240,90,40,0.12)', text: '#D44315', label: 'Ekstra' },
  manuel: { bg: '#F3F4F6', text: '#6B7280', label: 'Manuel' },
}

function grupla(gorevler) {
  const g = {}
  for (const t of gorevler) { (g[t.grup || 'Genel'] = g[t.grup || 'Genel'] || []).push(t) }
  return g
}

export default function TodoClient({ etkinlikler: ilk, sablonlar, demo }) {
  const [tab, setTab] = useState('gorevler')
  const [etkinlikler, setEtkinlikler] = useState(ilk)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  const [yeniGorev, setYeniGorev] = useState({}) // etkinlikId -> metin

  function bildir(tip, metin) { setMesaj({ tip, metin }); setTimeout(() => setMesaj(null), 3000) }

  function toggle(etkId, gorev) {
    const yeniDurum = gorev.durum === 'tamam' ? 'bekliyor' : 'tamam'
    setEtkinlikler(prev => prev.map(e => e.id === etkId ? { ...e, gorevler: e.gorevler.map(g => g.id === gorev.id ? { ...g, durum: yeniDurum } : g) } : e))
    startTransition(async () => { const r = await gorevToggle(gorev.id, yeniDurum); if (!r.ok) bildir('hata', r.error) })
  }

  function ekle(etkId) {
    const metin = (yeniGorev[etkId] || '').trim()
    if (!metin) return
    startTransition(async () => {
      const r = await gorevEkle(etkId, metin)
      if (!r.ok) return bildir('hata', r.error)
      const g = r.gorev || { id: 'x' + Date.now(), baslik: metin, grup: 'Genel', durum: 'bekliyor', kaynak: 'manuel' }
      setEtkinlikler(prev => prev.map(e => e.id === etkId ? { ...e, gorevler: [...e.gorevler, g] } : e))
      setYeniGorev(y => ({ ...y, [etkId]: '' }))
    })
  }

  function sil(etkId, gorevId) {
    setEtkinlikler(prev => prev.map(e => e.id === etkId ? { ...e, gorevler: e.gorevler.filter(g => g.id !== gorevId) } : e))
    startTransition(async () => { await gorevSil(gorevId) })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Operasyon</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Yapılacaklar</h1>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-cream-dark)', marginBottom: '1.5rem' }}>
        {[['gorevler', 'Görevler'], ['sablonlar', `Görev Şablonları (${sablonlar.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.8rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '-1px', color: tab === k ? 'var(--color-orange)' : 'var(--color-slate-medium)', borderBottom: tab === k ? '2px solid var(--color-orange)' : '2px solid transparent' }}>{l}</button>
        ))}
      </div>

      {/* GÖREVLER */}
      {tab === 'gorevler' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.3rem' }}>
          {etkinlikler.length === 0 && <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)', border: '2px dashed var(--color-cream-dark)' }}>Aktif etkinlik yok.</div>}
          {etkinlikler.map(e => {
            const toplam = e.gorevler.length
            const biten = e.gorevler.filter(g => g.durum === 'tamam').length
            const yuzde = toplam ? Math.round((biten / toplam) * 100) : 0
            const gruplar = grupla(e.gorevler)
            return (
              <div key={e.id} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.2rem 1.4rem', borderBottom: '1px solid var(--color-cream-dark)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>{e.ad}</h2>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--color-slate-medium)' }}>{e.tur} · {e.tarih ? new Date(e.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : '—'}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 600, color: yuzde === 100 ? '#059669' : 'var(--color-orange)' }}>%{yuzde}</span>
                  </div>
                  <div style={{ background: 'var(--color-cream)', height: '4px', width: '100%' }}>
                    <div style={{ height: '100%', width: `${yuzde}%`, background: yuzde === 100 ? '#059669' : 'var(--color-orange)', transition: 'width 0.3s' }} />
                  </div>
                </div>

                <div style={{ padding: '1rem 1.4rem', flex: 1 }}>
                  {Object.entries(gruplar).map(([grup, liste]) => (
                    <div key={grup} style={{ marginBottom: '1rem' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.4rem' }}>{grup}</div>
                      {liste.map(g => {
                        const bitti = g.durum === 'tamam'
                        const k = KAYNAK[g.kaynak] || KAYNAK.manuel
                        return (
                          <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0' }} className="gorev-satir">
                            <button onClick={() => toggle(e.id, g)} style={{
                              width: '20px', height: '20px', flexShrink: 0, borderRadius: '5px', cursor: 'pointer',
                              border: '2px solid', borderColor: bitti ? '#059669' : (g.durum === 'yapiliyor' ? 'var(--color-orange)' : 'var(--color-cream-dark)'),
                              background: bitti ? '#059669' : (g.durum === 'yapiliyor' ? 'var(--color-orange-light)' : '#fff'),
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem',
                            }}>{bitti && <i className="fas fa-check" />}{!bitti && g.durum === 'yapiliyor' && <i className="fas fa-minus" style={{ color: 'var(--color-orange)' }} />}</button>
                            <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: bitti ? 'var(--color-slate-medium)' : 'var(--color-slate)', textDecoration: bitti ? 'line-through' : 'none' }}>{g.baslik}</span>
                            <span style={{ background: k.bg, color: k.text, padding: '0.1rem 0.4rem', fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{k.label}</span>
                            {g.kaynak === 'manuel' && <button onClick={() => sil(e.id, g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-cream-dark)', fontSize: '0.75rem' }}><i className="fas fa-xmark" /></button>}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                  {toplam === 0 && <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-medium)', textAlign: 'center', padding: '1rem 0' }}>Görev yok. Şablondan yükleyin veya manuel ekleyin.</p>}
                </div>

                <div style={{ padding: '0.9rem 1.4rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)', display: 'flex', gap: '0.5rem' }}>
                  <input value={yeniGorev[e.id] || ''} onChange={ev => setYeniGorev(y => ({ ...y, [e.id]: ev.target.value }))} onKeyDown={ev => ev.key === 'Enter' && ekle(e.id)} placeholder="Görev ekle…" style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: '0.85rem', padding: '0.5rem 0.7rem', border: '1px solid var(--color-cream-dark)', outline: 'none', background: '#fff' }} />
                  <button onClick={() => ekle(e.id)} disabled={pending} className="btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.7rem' }}>Ekle</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ŞABLONLAR */}
      {tab === 'sablonlar' && (
        <div>
          <div style={{ background: 'rgba(240,90,40,0.06)', border: '1px solid rgba(240,90,40,0.2)', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fas fa-lightbulb" style={{ color: 'var(--color-orange)' }} />
            Bir etkinlik onaylandığında bu şablonlar otomatik yüklenir. <strong style={{ color: 'var(--color-orange)' }}>Ekstra</strong> etiketli kalemler yalnızca müşteri o ekstrayı seçtiyse eklenir — hiçbir şey gözden kaçmaz.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.3rem' }}>
            {sablonlar.map(s => {
              const gruplar = grupla(s.kalemler)
              return (
                <div key={s.id} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.4rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>{s.ad}</h2>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-orange)' }}>{s.hizmet_ad || 'Genel'}</div>
                  </div>
                  {Object.entries(gruplar).map(([grup, liste]) => (
                    <div key={grup} style={{ marginBottom: '0.8rem' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.3rem' }}>{grup}</div>
                      {liste.map(k => (
                        <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', fontSize: '0.85rem', color: 'var(--color-slate)' }}>
                          <i className="far fa-square" style={{ color: 'var(--color-cream-dark)', fontSize: '0.8rem' }} />
                          <span style={{ flex: 1 }}>{k.baslik}</span>
                          {k.ekstra_ad && <span style={{ background: 'rgba(240,90,40,0.12)', color: '#D44315', padding: '0.1rem 0.4rem', fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{k.ekstra_ad}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`.gorev-satir:hover { background: var(--color-cream-light); }`}</style>
    </div>
  )
}
