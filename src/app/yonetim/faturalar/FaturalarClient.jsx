'use client'

import { useState, useMemo, useTransition } from 'react'
import { tl } from '@/lib/fiyat'
import { faturaKaydet, faturaKes, faturaSil, faturaDurumSorgula } from './actions'

const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.55rem 0.7rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.3rem', display: 'block' }
const tarih = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const DURUM = { taslak: { bg: '#F3F4F6', text: '#6B7280', l: 'Taslak' }, kesildi: { bg: '#D1FAE5', text: '#059669', l: 'Kesildi' }, iptal: { bg: '#FEE2E2', text: '#DC2626', l: 'İptal' } }
const NDURUM = { onaylandi: { c: '#059669', l: 'Onaylandı' }, gonderildi: { c: '#1D4ED8', l: 'Gönderildi' }, reddedildi: { c: '#DC2626', l: 'Reddedildi' }, hata: { c: '#DC2626', l: 'Hata' } }

function hesapla(kalemler) {
  let haric = 0, kdv = 0
  for (const k of kalemler) { const t = (Number(k.adet) || 1) * (Number(k.birim_fiyat) || 0); haric += t; kdv += t * ((Number(k.kdv_orani) || 20) / 100) }
  return { kdv_haric: haric, kdv, toplam: haric + kdv }
}

export default function FaturalarClient({ faturalar: ilk, cariler, demo }) {
  const [faturalar, setFaturalar] = useState(ilk)
  const [form, setForm] = useState(null)
  const [secili, setSecili] = useState(null)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3500) }

  function yeniFatura() {
    setForm({ cari_id: cariler[0]?.id || '', etkinlik_ad: '', fatura_tipi: 'e_arsiv', tur: 'satis', tarih: new Date().toISOString().slice(0, 10), aciklama: '', kalemler: [{ ad: '', adet: 1, birim: 'adet', birim_fiyat: '', kdv_orani: 20 }] })
  }

  function kaydet() {
    startTransition(async () => {
      const r = await faturaKaydet(form)
      if (!r.ok) return bildir('hata', r.error)
      const cari = cariler.find(c => c.id === form.cari_id)
      const yeni = { ...form, id: form.id || r.id, cari_unvan: cari?.unvan, kdv_haric: r.kdv_haric, kdv: r.kdv, toplam: r.toplam, durum: 'taslak', nilvera_durum: null, fatura_no: form.fatura_no || null }
      setFaturalar(p => form.id ? p.map(x => x.id === form.id ? yeni : x) : [yeni, ...p])
      setForm(null); bildir('basari', demo ? 'Demo: taslak fatura kaydedildi.' : 'Taslak kaydedildi.')
    })
  }

  function kes(fatura) {
    startTransition(async () => {
      const r = await faturaKes(fatura.id)
      if (!r.ok) return bildir('hata', r.error)
      const yeni = { ...fatura, fatura_no: r.fatura_no, nilvera_uuid: r.nilvera_uuid, nilvera_durum: r.nilvera_durum, durum: 'kesildi' }
      setFaturalar(p => p.map(x => x.id === fatura.id ? yeni : x))
      if (secili?.id === fatura.id) setSecili(yeni)
      bildir('basari', demo ? `Demo: e-Fatura kesildi (${r.fatura_no}).` : `e-Fatura kesildi: ${r.fatura_no}`)
    })
  }

  function sil(id) {
    if (!confirm('Fatura silinsin mi?')) return
    startTransition(async () => { const r = await faturaSil(id); if (!r.ok) return bildir('hata', r.error); setFaturalar(p => p.filter(x => x.id !== id)); setSecili(null); bildir('basari', 'Silindi.') })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Finans</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Faturalar</h1>
        </div>
        <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }} onClick={yeniFatura}><i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> Fatura Oluştur</button>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
            {['Fatura No', 'Cari', 'Tarih', 'Tutar', 'Tip', 'Durum', ''].map((h, i) => <th key={i} style={{ textAlign: i === 3 ? 'right' : (i === 6 ? 'right' : 'left'), padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {faturalar.length === 0 && <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Fatura yok.</td></tr>}
            {faturalar.map(f => {
              const d = DURUM[f.durum] || DURUM.taslak
              return (
                <tr key={f.id} onClick={() => setSecili(f)} style={{ borderBottom: '1px solid var(--color-cream)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-cream-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, color: f.fatura_no ? 'var(--color-slate)' : 'var(--color-slate-medium)' }}>{f.fatura_no || '— Taslak —'}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.88rem', color: 'var(--color-slate)' }}>{f.cari_unvan || '—'}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{tarih(f.tarih)}</td>
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate)' }}>{tl(f.toplam)}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.72rem', color: 'var(--color-slate-medium)', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{f.fatura_tipi === 'e_fatura' ? 'e-Fatura' : 'e-Arşiv'}</td>
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <span style={{ background: d.bg, color: d.text, padding: '0.25rem 0.6rem', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>{d.l}</span>
                    {f.nilvera_durum && NDURUM[f.nilvera_durum] && <span style={{ marginLeft: '0.4rem', color: NDURUM[f.nilvera_durum].c, fontSize: '0.68rem' }}><i className="fas fa-circle" style={{ fontSize: '0.4rem', verticalAlign: 'middle' }} /> {NDURUM[f.nilvera_durum].l}</span>}
                  </td>
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', color: 'var(--color-slate-medium)' }}><i className="fas fa-chevron-right" style={{ fontSize: '0.72rem' }} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {form && <FaturaForm form={form} setForm={setForm} cariler={cariler} pending={pending} onKaydet={kaydet} />}
      {secili && <FaturaDetay f={secili} setF={setSecili} pending={pending} onKes={() => kes(secili)} onSil={() => sil(secili.id)}
        onSorgu={() => startTransition(async () => { const r = await faturaDurumSorgula(secili.nilvera_uuid); if (r.ok) { const y = { ...secili, nilvera_durum: r.durum }; setSecili(y); setFaturalar(p => p.map(x => x.id === secili.id ? y : x)); bildir('basari', 'Durum: ' + (NDURUM[r.durum]?.l || r.durum)) } else bildir('hata', r.error) })} />}
    </div>
  )
}

function FaturaForm({ form, setForm, cariler, pending, onKaydet }) {
  const set = (a, v) => setForm(f => ({ ...f, [a]: v }))
  const setK = (i, a, v) => setForm(f => ({ ...f, kalemler: f.kalemler.map((k, ki) => ki === i ? { ...k, [a]: v } : k) }))
  const kalemEkle = () => setForm(f => ({ ...f, kalemler: [...f.kalemler, { ad: '', adet: 1, birim: 'adet', birim_fiyat: '', kdv_orani: 20 }] }))
  const kalemSil = (i) => setForm(f => ({ ...f, kalemler: f.kalemler.filter((_, ki) => ki !== i) }))
  const t = hesapla(form.kalemler)
  const gecerli = form.cari_id && form.kalemler.some(k => k.ad && k.birim_fiyat)

  return (
    <>
      <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '540px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>Fatura Oluştur</h2>
          <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div><label style={lbl}>Cari</label><select style={inp} value={form.cari_id} onChange={e => set('cari_id', e.target.value)}><option value="">Seçin…</option>{cariler.map(c => <option key={c.id} value={c.id}>{c.unvan}</option>)}</select></div>
            <div><label style={lbl}>Fatura Tipi</label><select style={inp} value={form.fatura_tipi} onChange={e => set('fatura_tipi', e.target.value)}><option value="e_arsiv">e-Arşiv</option><option value="e_fatura">e-Fatura</option></select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div><label style={lbl}>Tarih</label><input type="date" style={inp} value={form.tarih} onChange={e => set('tarih', e.target.value)} /></div>
            <div><label style={lbl}>Etkinlik (ops.)</label><input style={inp} value={form.etkinlik_ad || ''} onChange={e => set('etkinlik_ad', e.target.value)} /></div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-cream-dark)', paddingTop: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Kalemler</label>
              <button onClick={kalemEkle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-orange)', fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>+ Kalem</button>
            </div>
            {form.kalemler.map((k, i) => (
              <div key={i} style={{ border: '1px solid var(--color-cream-dark)', padding: '0.7rem', marginBottom: '0.5rem', background: 'var(--color-cream-light)' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input placeholder="Açıklama" style={{ ...inp, flex: 1 }} value={k.ad} onChange={e => setK(i, 'ad', e.target.value)} />
                  {form.kalemler.length > 1 && <button onClick={() => kalemSil(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}><i className="fas fa-xmark" /></button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '0.4rem' }}>
                  <div><span style={{ fontSize: '0.62rem', color: 'var(--color-slate-medium)' }}>Adet</span><input type="number" style={{ ...inp, padding: '0.4rem' }} value={k.adet} onChange={e => setK(i, 'adet', e.target.value)} /></div>
                  <div><span style={{ fontSize: '0.62rem', color: 'var(--color-slate-medium)' }}>Birim Fiyat</span><input type="number" style={{ ...inp, padding: '0.4rem' }} value={k.birim_fiyat} onChange={e => setK(i, 'birim_fiyat', e.target.value)} /></div>
                  <div><span style={{ fontSize: '0.62rem', color: 'var(--color-slate-medium)' }}>KDV %</span><input type="number" style={{ ...inp, padding: '0.4rem' }} value={k.kdv_orani} onChange={e => setK(i, 'kdv_orani', e.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--color-slate-deep)', color: 'var(--color-cream)', padding: '1rem 1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem', color: 'rgba(246,243,234,0.7)' }}><span>KDV Hariç</span><span>{tl(t.kdv_haric)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.5rem', color: 'rgba(246,243,234,0.7)' }}><span>KDV</span><span>{tl(t.kdv)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(246,243,234,0.15)', paddingTop: '0.5rem' }}><span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Toplam</span><span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-orange)' }}>{tl(t.toplam)}</span></div>
          </div>
        </div>
        <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
          <button className="btn-primary" disabled={!gecerli || pending} onClick={onKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (!gecerli || pending) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Taslak Kaydet'}</button>
        </div>
      </aside>
    </>
  )
}

function FaturaDetay({ f, setF, pending, onKes, onSil, onSorgu }) {
  const d = DURUM[f.durum] || DURUM.taslak
  return (
    <>
      <div onClick={() => setF(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.35)', zIndex: 200 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '460px', maxWidth: '100%', background: '#fff', zIndex: 201, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-orange)' }}>{f.fatura_no || 'Taslak Fatura'}</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0.2rem 0 0' }}>{f.cari_unvan}</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{f.etkinlik_ad ? f.etkinlik_ad + ' · ' : ''}{tarih(f.tarih)} · {f.fatura_tipi === 'e_fatura' ? 'e-Fatura' : 'e-Arşiv'}</div>
          </div>
          <button onClick={() => setF(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: '1.6rem 1.8rem', flex: 1 }}>
          <span style={{ background: d.bg, color: d.text, padding: '0.25rem 0.7rem', fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase' }}>{d.l}</span>
          {f.nilvera_uuid && <div style={{ marginTop: '0.7rem', fontSize: '0.76rem', color: 'var(--color-slate-medium)' }}>Nilvera UUID: <code style={{ fontSize: '0.72rem' }}>{f.nilvera_uuid}</code>{f.nilvera_durum && <> · Durum: <strong style={{ color: (NDURUM[f.nilvera_durum]?.c) }}>{NDURUM[f.nilvera_durum]?.l || f.nilvera_durum}</strong></>}</div>}

          <div style={{ border: '1px solid var(--color-cream-dark)', marginTop: '1.2rem' }}>
            {(f.kalemler || []).map((k, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 1rem', borderBottom: '1px solid var(--color-cream)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-slate)' }}>{k.ad}{k.adet > 1 ? ` ×${k.adet}` : ''} <span style={{ color: 'var(--color-slate-medium)', fontSize: '0.72rem' }}>(%{k.kdv_orani} KDV)</span></span>
                <span style={{ color: 'var(--color-slate)', whiteSpace: 'nowrap' }}>{tl((Number(k.adet) || 1) * (Number(k.birim_fiyat) || 0))}</span>
              </div>
            ))}
            <div style={{ padding: '0.8rem 1rem', background: 'var(--color-cream-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}><span>KDV Hariç</span><span>{tl(f.kdv_haric)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}><span>KDV</span><span>{tl(f.kdv)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--color-cream-dark)', paddingTop: '0.4rem', marginTop: '0.3rem' }}><span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-slate)' }}>Toplam</span><span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-orange)' }}>{tl(f.toplam)}</span></div>
            </div>
          </div>
        </div>
        <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)', display: 'flex', gap: '0.6rem' }}>
          {f.durum === 'taslak'
            ? <button className="btn-primary" disabled={pending} onClick={onKes} style={{ flex: 1, justifyContent: 'center' }}><i className="fas fa-file-circle-check" style={{ fontSize: '0.8rem' }} /> {pending ? 'Kesiliyor…' : 'e-Fatura Kes'}</button>
            : <button disabled={pending} onClick={onSorgu} style={{ flex: 1, padding: '0.7rem', cursor: 'pointer', border: '1px solid var(--color-slate)', background: '#fff', color: 'var(--color-slate)', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Durum Sorgula</button>}
          <button onClick={onSil} style={{ padding: '0.7rem 1rem', cursor: 'pointer', border: '1px solid #FECACA', background: '#fff', color: '#DC2626', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}><i className="fas fa-trash" /></button>
        </div>
      </aside>
    </>
  )
}
