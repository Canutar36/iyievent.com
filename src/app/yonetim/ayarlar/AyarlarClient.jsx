'use client'

import { useState, useTransition } from 'react'
import { isSuperAdmin } from '@/lib/roles'
import { rolGuncelle, personelEkle, personelSil } from './actions'

const ROLLER = [
  { key: 'yonetici', l: 'Yönetici', renk: '#F05A28', aciklama: 'Tam yetki — tüm modüller' },
  { key: 'satis', l: 'Satış', renk: '#1D4ED8', aciklama: 'Teklif, lead, telemarketing, katalog' },
  { key: 'operasyon', l: 'Operasyon', renk: '#7C3AED', aciklama: 'Etkinlik, to-do, kaynak, müşteri' },
  { key: 'muhasebe', l: 'Muhasebe', renk: '#059669', aciklama: 'Cari, kasa, fatura, tahsilat, rapor' },
]
const rolBilgi = (k) => ROLLER.find(r => r.key === k) || { l: k, renk: '#6B7280' }

const EYLEM = {
  teklif_olusturuldu: { ik: 'fas fa-file-invoice', renk: '#1D4ED8' },
  fatura_kesildi: { ik: 'fas fa-file-invoice-dollar', renk: '#059669' },
  sozlesme_durum: { ik: 'fas fa-file-signature', renk: '#7C3AED' },
  lead_eklendi: { ik: 'fas fa-bullseye', renk: '#F05A28' },
  randevu_olusturuldu: { ik: 'fas fa-calendar-day', renk: '#D97706' },
  rol_degistirildi: { ik: 'fas fa-user-shield', renk: '#DC2626' },
  personel_eklendi: { ik: 'fas fa-user-plus', renk: '#059669' },
  personel_silindi: { ik: 'fas fa-user-minus', renk: '#DC2626' },
  kampanya_gonderildi: { ik: 'fas fa-paper-plane', renk: '#1D4ED8' },
}
const zaman = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.6rem 0.8rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.35rem', display: 'block' }

export default function AyarlarClient({ ekip: ilk, aktivite, demo }) {
  const [tab, setTab] = useState('ekip')
  const [ekip, setEkip] = useState(ilk)
  const [form, setForm] = useState(null) // personel ekle
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3500) }

  function rolDegistir(u, yeniRol) {
    if (u.role === yeniRol) return
    setEkip(p => p.map(x => x.id === u.id ? { ...x, role: yeniRol } : x))
    startTransition(async () => { const r = await rolGuncelle(u.id, yeniRol); if (!r.ok) { bildir('hata', r.error); setEkip(p => p.map(x => x.id === u.id ? { ...x, role: u.role } : x)) } else bildir('basari', demo ? 'Demo: rol güncellendi.' : 'Rol güncellendi.') })
  }
  function personelKaydet() {
    startTransition(async () => {
      const r = await personelEkle(form)
      if (!r.ok) return bildir('hata', r.error)
      setEkip(p => [...p, r.personel])
      setForm(null); bildir('basari', demo ? 'Demo: personel eklendi.' : `${r.personel.full_name} eklendi.`)
    })
  }
  function sil(u) {
    if (!confirm(`${u.full_name || u.email} silinsin mi? Bu kullanıcının erişimi tamamen kaldırılır.`)) return
    startTransition(async () => {
      const r = await personelSil(u.id)
      if (!r.ok) return bildir('hata', r.error)
      setEkip(p => p.filter(x => x.id !== u.id)); bildir('basari', 'Silindi.')
    })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Sistem · Sistem Sahibi</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Ayarlar</h1>
        </div>
        {tab === 'ekip' && <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }} onClick={() => setForm({ ad: '', email: '', sifre: '', rol: 'satis' })}><i className="fas fa-user-plus" style={{ fontSize: '0.72rem' }} /> Personel Ekle</button>}
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
          <div style={{ background: 'rgba(240,90,40,0.06)', border: '1px solid rgba(240,90,40,0.2)', padding: '0.8rem 1.2rem', marginBottom: '1.3rem', fontSize: '0.85rem', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fas fa-shield-halved" style={{ color: 'var(--color-orange)' }} />
            Bu sayfa yalnızca <strong>sistem sahibine</strong> açıktır. Personel ekleme, silme ve rol atama sadece sen yapabilirsin; diğer yöneticiler bu ayarları göremez.
          </div>

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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
                {['Personel', 'E-posta', 'Rol', ''].map((h, i) => <th key={i} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {ekip.map(u => {
                  const b = rolBilgi(u.role)
                  const sahip = isSuperAdmin(u.email)
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--color-cream)' }}>
                      <td style={{ padding: '0.9rem 1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: sahip ? 'var(--color-slate)' : b.renk + '22', color: sahip ? 'var(--color-cream)' : b.renk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700 }}>{(u.full_name || '?').charAt(0).toLocaleUpperCase('tr')}</div>
                          <div>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate)' }}>{u.full_name || 'İsimsiz'}</span>
                            {sahip && <span style={{ marginLeft: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-orange)', background: 'var(--color-orange-light)', padding: '0.15rem 0.4rem' }}><i className="fas fa-crown" style={{ fontSize: '0.55rem' }} /> Sistem Sahibi</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.84rem', color: 'var(--color-slate-medium)' }}>{u.email}</td>
                      <td style={{ padding: '0.9rem 1.2rem' }}>
                        {sahip ? (
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-orange)' }}>Yönetici (kilitli)</span>
                        ) : (
                          <select value={u.role} disabled={pending} onChange={e => rolDegistir(u, e.target.value)} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', padding: '0.4rem 0.7rem', border: '1px solid var(--color-cream-dark)', background: '#fff', color: b.renk, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                            {ROLLER.map(r => <option key={r.key} value={r.key} style={{ color: 'var(--color-slate)' }}>{r.l}</option>)}
                          </select>
                        )}
                      </td>
                      <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>
                        {!sahip && <button onClick={() => sil(u)} disabled={pending} title="Personeli sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '0.85rem', padding: '0.3rem' }}><i className="fas fa-trash" /></button>}
                      </td>
                    </tr>
                  )
                })}
                {ekip.length === 0 && <tr><td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Henüz personel yok. "Personel Ekle" ile başla.</td></tr>}
              </tbody>
            </table>
          </div>
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

      {/* PERSONEL EKLE FORMU */}
      {form && (
        <>
          <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
          <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>Yeni Personel</h2>
              <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
            </div>
            <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div><label style={lbl}>Ad Soyad</label><input style={inp} value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} /></div>
              <div><label style={lbl}>E-posta</label><input type="email" style={inp} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="personel@iyievent.com" /></div>
              <div><label style={lbl}>Şifre (min. 8 karakter)</label><input type="text" style={inp} value={form.sifre} onChange={e => setForm(f => ({ ...f, sifre: e.target.value }))} placeholder="Bu şifreyi personele ilet" /></div>
              <div>
                <label style={lbl}>Rol</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {ROLLER.map(r => (
                    <button key={r.key} onClick={() => setForm(f => ({ ...f, rol: r.key }))} style={{ textAlign: 'left', padding: '0.6rem 0.8rem', cursor: 'pointer', border: '1px solid', borderColor: form.rol === r.key ? r.renk : 'var(--color-cream-dark)', background: form.rol === r.key ? r.renk + '12' : '#fff' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: form.rol === r.key ? r.renk : 'var(--color-slate)' }}>{r.l}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'var(--color-slate-medium)', marginTop: '0.1rem' }}>{r.aciklama}</div>
                    </button>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-medium)', lineHeight: 1.5, margin: 0 }}><i className="fas fa-circle-info" style={{ color: 'var(--color-orange)', marginRight: '0.3rem' }} />Personel bu e-posta + şifre ile giriş yapar. Doğrudan onaylı oluşturulur (e-posta doğrulaması gerekmez).</p>
            </div>
            <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
              <button className="btn-primary" disabled={pending || !form.ad?.trim() || !form.email?.trim() || form.sifre?.length < 8} onClick={personelKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (pending || !form.ad?.trim() || !form.email?.trim() || form.sifre?.length < 8) ? 0.55 : 1 }}>{pending ? 'Ekleniyor…' : 'Personeli Oluştur'}</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
