'use client'

import { useState, useMemo, useTransition } from 'react'
import { tl } from '@/lib/fiyat'
import { tahsilatEkle, tahsilatSil } from './actions'

const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.55rem 0.7rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.3rem', display: 'block' }
const tarih = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const YONTEM = { nakit: { l: 'Nakit', ik: 'fas fa-money-bill' }, havale: { l: 'Havale/EFT', ik: 'fas fa-building-columns' }, kredi_karti: { l: 'Kredi Kartı', ik: 'fas fa-credit-card' }, paytr: { l: 'PayTR', ik: 'fas fa-globe' }, cek: { l: 'Çek', ik: 'fas fa-money-check' } }

export default function OdemelerClient({ tahsilatlar: ilk, cariler, kasalar, demo }) {
  const [tahsilatlar, setTahsilatlar] = useState(ilk)
  const [form, setForm] = useState(null)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3000) }

  const toplam = useMemo(() => tahsilatlar.reduce((a, t) => a + (Number(t.tutar) || 0), 0), [tahsilatlar])
  const buAy = useMemo(() => {
    const now = new Date(), y = now.getFullYear(), m = now.getMonth()
    return tahsilatlar.filter(t => { const d = new Date(t.tarih); return d.getFullYear() === y && d.getMonth() === m }).reduce((a, t) => a + (Number(t.tutar) || 0), 0)
  }, [tahsilatlar])

  function yeni() { setForm({ cari_id: cariler[0]?.id || '', tutar: '', yontem: 'havale', kasa_id: kasalar[0]?.id || '', tarih: new Date().toISOString().slice(0, 10), aciklama: '', etkinlik_ad: '' }) }

  function kaydet() {
    startTransition(async () => {
      const r = await tahsilatEkle(form)
      if (!r.ok) return bildir('hata', r.error)
      const cari = cariler.find(c => c.id === form.cari_id), kasa = kasalar.find(k => k.id === form.kasa_id)
      const yeni = r.tahsilat || { ...form, id: 'x' + Date.now(), cari_unvan: cari?.unvan, kasa_ad: kasa?.ad }
      setTahsilatlar(p => [{ ...yeni, cari_unvan: cari?.unvan, kasa_ad: kasa?.ad, etkinlik_ad: form.etkinlik_ad }, ...p])
      setForm(null); bildir('basari', demo ? 'Demo: tahsilat kaydedildi (kasaya işlendi).' : 'Tahsilat kaydedildi.')
    })
  }
  function sil(id) {
    if (!confirm('Tahsilat silinsin mi?')) return
    startTransition(async () => { const r = await tahsilatSil(id); if (!r.ok) return bildir('hata', r.error); setTahsilatlar(p => p.filter(x => x.id !== id)); bildir('basari', 'Silindi.') })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Finans</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Tahsilatlar</h1>
        </div>
        <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }} onClick={yeni}><i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> Tahsilat Ekle</button>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--color-slate-deep)', border: '1px solid var(--color-cream-dark)', padding: '1.3rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(246,243,234,0.6)', marginBottom: '0.5rem' }}>Toplam Tahsilat</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-orange)' }}>{tl(toplam)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.3rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.5rem' }}>Bu Ay</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: '#059669' }}>{tl(buAy)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.3rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.5rem' }}>Kayıt Sayısı</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-slate)' }}>{tahsilatlar.length}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
            {['Tarih', 'Cari', 'Etkinlik', 'Yöntem', 'Kasa', 'Tutar', ''].map((h, i) => <th key={i} style={{ textAlign: i === 5 ? 'right' : 'left', padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {tahsilatlar.length === 0 && <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Tahsilat yok.</td></tr>}
            {tahsilatlar.map(t => {
              const y = YONTEM[t.yontem] || YONTEM.havale
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--color-cream)' }}>
                  <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{tarih(t.tarih)}</td>
                  <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>{t.cari_unvan || '—'}</td>
                  <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{t.etkinlik_ad || '—'}</td>
                  <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}><i className={y.ik} style={{ color: 'var(--color-orange)', marginRight: '0.4rem' }} />{y.l}</td>
                  <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{t.kasa_ad || '—'}</td>
                  <td style={{ padding: '0.8rem 1.2rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>+{tl(t.tutar)}</td>
                  <td style={{ padding: '0.8rem 1.2rem', textAlign: 'right' }}><button onClick={() => sil(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.25rem', fontSize: '0.8rem' }}><i className="fas fa-trash" /></button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {form && (
        <>
          <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
          <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>Yeni Tahsilat</h2>
              <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
            </div>
            <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div><label style={lbl}>Cari (Müşteri)</label><select style={inp} value={form.cari_id} onChange={e => setForm({ ...form, cari_id: e.target.value })}><option value="">Seçin…</option>{cariler.filter(c => c.tip === 'musteri').map(c => <option key={c.id} value={c.id}>{c.unvan}</option>)}</select></div>
              <div><label style={lbl}>Etkinlik (ops.)</label><input style={inp} value={form.etkinlik_ad} onChange={e => setForm({ ...form, etkinlik_ad: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div><label style={lbl}>Tutar (₺)</label><input type="number" style={inp} value={form.tutar} onChange={e => setForm({ ...form, tutar: e.target.value })} /></div>
                <div><label style={lbl}>Tarih</label><input type="date" style={inp} value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div><label style={lbl}>Yöntem</label><select style={inp} value={form.yontem} onChange={e => setForm({ ...form, yontem: e.target.value })}>{Object.entries(YONTEM).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}</select></div>
                <div><label style={lbl}>Kasa</label><select style={inp} value={form.kasa_id} onChange={e => setForm({ ...form, kasa_id: e.target.value })}><option value="">Seçin…</option>{kasalar.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}</select></div>
              </div>
              <div><label style={lbl}>Açıklama</label><input style={inp} value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} /></div>
            </div>
            <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
              <button className="btn-primary" disabled={pending || !form.tutar || !form.cari_id} onClick={kaydet} style={{ width: '100%', justifyContent: 'center', opacity: (pending || !form.tutar || !form.cari_id) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Tahsilatı Kaydet'}</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
