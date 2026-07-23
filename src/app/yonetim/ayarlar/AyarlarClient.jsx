'use client'

import { useState, useTransition } from 'react'
import { rolGuncelle } from './actions'

const ROLLER = [
  { key: 'yonetici', l: 'Yönetici', renk: '#F05A28', aciklama: 'Tam yetki — tüm modüller' },
  { key: 'satis', l: 'Satış', renk: '#1D4ED8', aciklama: 'Teklif, lead, katalog, takvim' },
  { key: 'operasyon', l: 'Operasyon', renk: '#7C3AED', aciklama: 'Etkinlik, to-do, kaynak, müşteri' },
  { key: 'muhasebe', l: 'Muhasebe', renk: '#059669', aciklama: 'Cari, kasa, fatura, tahsilat' },
]
const rolBilgi = (k) => ROLLER.find(r => r.key === k) || { l: k, renk: '#6B7280' }

const EYLEM = {
  teklif_olusturuldu: { ik: 'fas fa-file-invoice', renk: '#1D4ED8' },
  fatura_kesildi: { ik: 'fas fa-file-invoice-dollar', renk: '#059669' },
  sozlesme_durum: { ik: 'fas fa-file-signature', renk: '#7C3AED' },
  lead_eklendi: { ik: 'fas fa-bullseye', renk: '#F05A28' },
  randevu_olusturuldu: { ik: 'fas fa-calendar-day', renk: '#D97706' },
  rol_degistirildi: { ik: 'fas fa-user-shield', renk: '#DC2626' },
}
const zaman = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

export default function AyarlarClient({ ekip: ilk, aktivite, demo }) {
  const [tab, setTab] = useState('ekip')
  const [ekip, setEkip] = useState(ilk)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3000) }

  function rolDegistir(u, yeniRol) {
    if (u.role === yeniRol) return
    setEkip(p => p.map(x => x.id === u.id ? { ...x, role: yeniRol } : x))
    startTransition(async () => { const r = await rolGuncelle(u.id, yeniRol); if (!r.ok) { bildir('hata', r.error); setEkip(p => p.map(x => x.id === u.id ? { ...x, role: u.role } : x)) } else bildir('basari', demo ? 'Demo: rol güncellendi.' : 'Rol güncellendi.') })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Sistem</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Ayarlar</h1>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-cream-dark)', marginBottom: '1.5rem' }}>
        {[['ekip', 'Ekip & Roller'], ['aktivite', `Aktivite Akışı (${aktivite.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.8rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '-1px', color: tab === k ? 'var(--color-orange)' : 'var(--color-slate-medium)', borderBottom: tab === k ? '2px solid var(--color-orange)' : '2px solid transparent' }}>{l}</button>
        ))}
      </div>

      {/* EKİP & ROLLER */}
      {tab === 'ekip' && (
        <div>
          {/* Rol açıklamaları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {ROLLER.map(r => (
              <div key={r.key} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', borderLeft: `3px solid ${r.renk}`, padding: '0.9rem 1.1rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: r.renk }}>{r.l}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--color-slate-medium)', marginTop: '0.2rem' }}>{r.aciklama}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
                {['Personel', 'E-posta', 'Rol'].map((h, i) => <th key={i} style={{ textAlign: 'left', padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {ekip.map(u => {
                  const b = rolBilgi(u.role)
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--color-cream)' }}>
                      <td style={{ padding: '0.9rem 1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: b.renk + '22', color: b.renk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700 }}>{(u.full_name || '?').charAt(0).toLocaleUpperCase('tr')}</div>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate)' }}>{u.full_name || 'İsimsiz'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.84rem', color: 'var(--color-slate-medium)' }}>{u.email}</td>
                      <td style={{ padding: '0.9rem 1.2rem' }}>
                        <select value={u.role} disabled={pending} onChange={e => rolDegistir(u, e.target.value)} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', padding: '0.4rem 0.7rem', border: '1px solid var(--color-cream-dark)', background: '#fff', color: b.renk, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                          {ROLLER.map(r => <option key={r.key} value={r.key} style={{ color: 'var(--color-slate)' }}>{r.l}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-medium)', marginTop: '0.8rem' }}><i className="fas fa-circle-info" style={{ color: 'var(--color-orange)', marginRight: '0.4rem' }} />Rol değişikliği yalnızca yöneticiler tarafından yapılabilir ve anında etkili olur.</p>
        </div>
      )}

      {/* AKTİVİTE AKIŞI */}
      {tab === 'aktivite' && (
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
          {aktivite.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Henüz aktivite yok.</div>}
          {aktivite.map(a => {
            const e = EYLEM[a.eylem] || { ik: 'fas fa-circle-dot', renk: 'var(--color-slate-medium)' }
            return (
              <div key={a.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.4rem', borderBottom: '1px solid var(--color-cream)' }}>
                <div style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '10px', background: e.renk + '18', color: e.renk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}><i className={e.ik} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate)' }}>{a.ozet}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-slate-medium)' }}>{a.personel_ad || 'Sistem'} · {zaman(a.created_at)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
