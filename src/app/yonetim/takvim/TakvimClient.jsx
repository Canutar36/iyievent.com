'use client'

import { useState, useMemo, useTransition } from 'react'
import { randevuOlustur, randevuDurumGuncelle, randevuSil } from './actions'

const TUR = {
  gorusme: { renk: '#F05A28', label: 'Görüşme' },
  etkinlik: { renk: '#059669', label: 'Etkinlik' },
  hatirlatma: { renk: '#1D4ED8', label: 'Hatırlatma' },
  is: { renk: '#3A474B', label: 'İş' },
}
const DURUM = {
  planlandi: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Planlandı' },
  tamamlandi: { bg: '#D1FAE5', text: '#059669', label: 'Tamamlandı' },
  iptal: { bg: '#FEE2E2', text: '#DC2626', label: 'İptal' },
}
const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.6rem 0.8rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.3rem', display: 'block' }

function bosRandevu(tarih) {
  return { baslik: '', tur: 'gorusme', musteri_ad: '', musteri_email: '', tarih: tarih || '', baslangic_saat: '', konum: '', notlar: '', mail_gonder: true }
}

export default function TakvimClient({ randevular: ilk, demo }) {
  const bugun = new Date()
  const [randevular, setRandevular] = useState(ilk)
  const [ay, setAy] = useState(new Date(bugun.getFullYear(), bugun.getMonth(), 1))
  const [form, setForm] = useState(null)
  const [secili, setSecili] = useState(null)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)

  function bildir(tip, metin) { setMesaj({ tip, metin }); setTimeout(() => setMesaj(null), 4000) }

  // Ay grid'i
  const haftalar = useMemo(() => {
    const ilkGun = new Date(ay.getFullYear(), ay.getMonth(), 1)
    const offset = (ilkGun.getDay() + 6) % 7 // Pazartesi = 0
    const baslangic = new Date(ilkGun); baslangic.setDate(1 - offset)
    const gunler = []
    for (let i = 0; i < 42; i++) { const d = new Date(baslangic); d.setDate(baslangic.getDate() + i); gunler.push(d) }
    const w = []
    for (let i = 0; i < 6; i++) w.push(gunler.slice(i * 7, i * 7 + 7))
    return w
  }, [ay])

  const guneGore = useMemo(() => {
    const m = {}
    for (const r of randevular) { (m[r.tarih] = m[r.tarih] || []).push(r) }
    return m
  }, [randevular])

  const yaklasan = useMemo(() => {
    const b = iso(bugun)
    return randevular.filter(r => r.tarih >= b && r.durum !== 'iptal').sort((a, c) => (a.tarih + (a.baslangic_saat || '')).localeCompare(c.tarih + (c.baslangic_saat || ''))).slice(0, 6)
  }, [randevular])

  function kaydet() {
    startTransition(async () => {
      const r = await randevuOlustur(form)
      if (!r.ok) return bildir('hata', r.error)
      const yeni = r.randevu || { ...form, id: r.id, mail_gonderildi: r.mailGonderildi, durum: 'planlandi' }
      setRandevular(prev => [...prev, yeni])
      setForm(null)
      if (r.mailUyari) bildir('hata', r.mailUyari)
      else if (r.mailGonderildi || (demo && form.mail_gonder && form.musteri_email)) bildir('basari', demo ? 'Demo: randevu oluşturuldu, müşteriye mail gönderildi.' : 'Randevu oluşturuldu ve müşteriye mail gönderildi.')
      else bildir('basari', 'Randevu oluşturuldu.')
    })
  }
  function durumDegistir(r, durum) {
    setRandevular(prev => prev.map(x => x.id === r.id ? { ...x, durum } : x))
    if (secili?.id === r.id) setSecili({ ...secili, durum })
    startTransition(async () => { const res = await randevuDurumGuncelle(r.id, durum); if (!res.ok) bildir('hata', res.error) })
  }
  function sil(id) {
    if (!confirm('Randevu silinsin mi?')) return
    startTransition(async () => { const r = await randevuSil(id); if (!r.ok) return bildir('hata', r.error); setRandevular(prev => prev.filter(x => x.id !== id)); setSecili(null) })
  }

  const buAy = ay.getMonth(), buYil = ay.getFullYear()

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Operasyon</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Takvim & Randevular</h1>
        </div>
        <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }} onClick={() => setForm(bosRandevu(iso(bugun)))}>
          <i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> Yeni Randevu
        </button>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }} className="takvim-grid">
        {/* Takvim */}
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--color-cream-dark)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>{AYLAR[buAy]} {buYil}</h2>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => setAy(new Date(buYil, buAy - 1, 1))} style={okBtn}><i className="fas fa-chevron-left" /></button>
              <button onClick={() => setAy(new Date(bugun.getFullYear(), bugun.getMonth(), 1))} style={{ ...okBtn, width: 'auto', padding: '0 0.8rem', fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Bugün</button>
              <button onClick={() => setAy(new Date(buYil, buAy + 1, 1))} style={okBtn}><i className="fas fa-chevron-right" /></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {GUNLER.map(g => <div key={g} style={{ padding: '0.6rem', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', borderBottom: '1px solid var(--color-cream)' }}>{g}</div>)}
            {haftalar.flat().map((d, i) => {
              const key = iso(d)
              const buAyMi = d.getMonth() === buAy
              const bugunMu = key === iso(bugun)
              const gunRandevu = guneGore[key] || []
              return (
                <div key={i} onClick={() => setForm(bosRandevu(key))} style={{
                  minHeight: '92px', padding: '0.4rem', borderBottom: '1px solid var(--color-cream)', borderRight: '1px solid var(--color-cream)',
                  background: bugunMu ? 'var(--color-orange-light)' : (buAyMi ? '#fff' : 'var(--color-cream-light)'), cursor: 'pointer', overflow: 'hidden',
                }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: bugunMu ? 700 : 500, color: buAyMi ? (bugunMu ? 'var(--color-orange)' : 'var(--color-slate)') : 'var(--color-cream-dark)', marginBottom: '0.2rem' }}>{d.getDate()}</div>
                  {gunRandevu.slice(0, 3).map(r => {
                    const t = TUR[r.tur] || TUR.gorusme
                    return (
                      <div key={r.id} onClick={e => { e.stopPropagation(); setSecili(r) }} title={r.baslik} style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.15rem', padding: '0.1rem 0.25rem',
                        background: t.renk + '18', borderLeft: `2px solid ${t.renk}`, cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', fontSize: '0.66rem', color: 'var(--color-slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        textDecoration: r.durum === 'iptal' ? 'line-through' : 'none', opacity: r.durum === 'iptal' ? 0.5 : 1,
                      }}>
                        {r.baslangic_saat && <b>{r.baslangic_saat.slice(0, 5)}</b>} {r.baslik}
                      </div>
                    )
                  })}
                  {gunRandevu.length > 3 && <div style={{ fontSize: '0.62rem', color: 'var(--color-slate-medium)' }}>+{gunRandevu.length - 3} daha</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Yaklaşan */}
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
          <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--color-cream-dark)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate)', margin: 0 }}>Yaklaşan</h3>
          </div>
          <div>
            {yaklasan.length === 0 && <p style={{ padding: '1.4rem', fontSize: '0.85rem', color: 'var(--color-slate-medium)' }}>Yaklaşan randevu yok.</p>}
            {yaklasan.map(r => {
              const t = TUR[r.tur] || TUR.gorusme
              return (
                <div key={r.id} onClick={() => setSecili(r)} style={{ padding: '0.9rem 1.4rem', borderBottom: '1px solid var(--color-cream)', cursor: 'pointer', borderLeft: `3px solid ${t.renk}` }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate)' }}>{r.baslik}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: 'var(--color-slate-medium)' }}>
                    {new Date(r.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}{r.baslangic_saat ? ` · ${r.baslangic_saat.slice(0, 5)}` : ''}{r.konum ? ` · ${r.konum}` : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {form && <RandevuForm form={form} setForm={setForm} pending={pending} onKaydet={kaydet} />}
      {secili && <RandevuDetay r={secili} setR={setSecili} pending={pending} onDurum={durumDegistir} onSil={() => sil(secili.id)} />}

      <style>{`@media (max-width: 900px) { .takvim-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

const okBtn = { width: '34px', height: '34px', cursor: 'pointer', border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)', fontSize: '0.75rem' }

function RandevuForm({ form, setForm, pending, onKaydet }) {
  const set = (a, v) => setForm(f => ({ ...f, [a]: v }))
  const gecerli = form.baslik?.trim() && form.tarih
  return (
    <>
      <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>Yeni Randevu</h2>
          <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <div><label style={lbl}>Başlık</label><input style={inp} value={form.baslik} onChange={e => set('baslik', e.target.value)} placeholder="ör. Melis Hanım — görüşme" /></div>
          <div><label style={lbl}>Tür</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {Object.entries(TUR).map(([k, t]) => (
                <button key={k} onClick={() => set('tur', k)} style={{ padding: '0.5rem 0.8rem', cursor: 'pointer', border: '1px solid', borderColor: form.tur === k ? t.renk : 'var(--color-cream-dark)', background: form.tur === k ? t.renk + '18' : '#fff', color: form.tur === k ? t.renk : 'var(--color-slate-medium)', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700 }}>{t.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.8rem' }}>
            <div><label style={lbl}>Tarih</label><input type="date" style={inp} value={form.tarih} onChange={e => set('tarih', e.target.value)} /></div>
            <div><label style={lbl}>Saat</label><input type="time" style={inp} value={form.baslangic_saat} onChange={e => set('baslangic_saat', e.target.value)} /></div>
          </div>
          <div><label style={lbl}>Müşteri Adı</label><input style={inp} value={form.musteri_ad} onChange={e => set('musteri_ad', e.target.value)} /></div>
          <div><label style={lbl}>Müşteri E-posta</label><input style={inp} value={form.musteri_email} onChange={e => set('musteri_email', e.target.value)} placeholder="Randevu maili için" /></div>
          <div><label style={lbl}>Konum</label><input style={inp} value={form.konum} onChange={e => set('konum', e.target.value)} placeholder="Ofis / Online / adres" /></div>
          <div><label style={lbl}>Not</label><textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={form.notlar} onChange={e => set('notlar', e.target.value)} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--color-slate)', background: 'var(--color-cream-light)', padding: '0.7rem 0.9rem', border: '1px solid var(--color-cream-dark)' }}>
            <input type="checkbox" checked={form.mail_gonder} onChange={e => set('mail_gonder', e.target.checked)} />
            Müşteriye randevu maili gönder {!form.musteri_email && <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-medium)' }}>(e-posta gerekli)</span>}
          </label>
        </div>
        <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
          <button className="btn-primary" disabled={!gecerli || pending} onClick={onKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (!gecerli || pending) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Randevu Oluştur'}</button>
        </div>
      </aside>
    </>
  )
}

function RandevuDetay({ r, setR, pending, onDurum, onSil }) {
  const t = TUR[r.tur] || TUR.gorusme
  return (
    <>
      <div onClick={() => setR(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.35)', zIndex: 200 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100%', background: '#fff', zIndex: 201, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.renk }}>{t.label}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0.2rem 0 0' }}>{r.baslik}</h2>
          </div>
          <button onClick={() => setR(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: '1.6rem 1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <D ik="fas fa-calendar" v={new Date(r.tarih).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (r.baslangic_saat ? ` — ${r.baslangic_saat.slice(0, 5)}` : '')} />
          {r.musteri_ad && <D ik="fas fa-user" v={r.musteri_ad} />}
          {r.musteri_email && <D ik="fas fa-envelope" v={r.musteri_email} />}
          {r.konum && <D ik="fas fa-location-dot" v={r.konum} />}
          <D ik="fas fa-paper-plane" v={r.mail_gonderildi ? 'Randevu maili gönderildi' : 'Mail gönderilmedi'} />
          {r.notlar && <D ik="fas fa-note-sticky" v={r.notlar} />}
        </div>
        <div style={{ padding: '1.3rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
            {Object.entries(DURUM).map(([k, d]) => {
              const aktif = r.durum === k
              return <button key={k} disabled={pending} onClick={() => onDurum(r, k)} style={{ flex: 1, padding: '0.45rem', cursor: 'pointer', border: '1px solid', borderColor: aktif ? d.text : 'var(--color-cream-dark)', background: aktif ? d.bg : '#fff', color: aktif ? d.text : 'var(--color-slate-medium)', fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{d.label}</button>
            })}
          </div>
          <button onClick={onSil} style={{ width: '100%', padding: '0.5rem', cursor: 'pointer', border: '1px solid #FECACA', background: '#fff', color: '#DC2626', fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Randevuyu Sil</button>
        </div>
      </aside>
    </>
  )
}

function D({ ik, v }) {
  return (
    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
      <div style={{ width: '30px', height: '30px', flexShrink: 0, borderRadius: '8px', background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}><i className={ik} /></div>
      <div style={{ fontSize: '0.88rem', color: 'var(--color-slate)', lineHeight: 1.5, paddingTop: '0.3rem' }}>{v}</div>
    </div>
  )
}
