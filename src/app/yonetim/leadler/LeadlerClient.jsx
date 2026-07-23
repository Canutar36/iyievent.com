'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { leadKaydet, leadSil, durumNotuGuncelle, etkilesimEkle, tanitimMailiGonder } from './actions'

const DURUM = {
  yeni: { bg: '#FEF3C7', text: '#D97706', label: 'Yeni' },
  iletisimde: { bg: '#DBEAFE', text: '#1D4ED8', label: 'İletişimde' },
  teklif: { bg: '#EDE9FE', text: '#7C3AED', label: 'Teklif' },
  kazanildi: { bg: '#D1FAE5', text: '#059669', label: 'Kazanıldı' },
  kaybedildi: { bg: '#FEE2E2', text: '#DC2626', label: 'Kaybedildi' },
}
const ETK_TUR = { telefon: { ik: 'fas fa-phone', l: 'Telefon' }, mail: { ik: 'fas fa-envelope', l: 'E-posta' }, toplanti: { ik: 'fas fa-handshake', l: 'Toplantı' }, whatsapp: { ik: 'fab fa-whatsapp', l: 'WhatsApp' }, not: { ik: 'fas fa-note-sticky', l: 'Not' } }
const tarihSaat = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
const tarih = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.6rem 0.8rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.35rem', display: 'block' }
const selMini = { fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.5rem 0.6rem', outline: 'none' }

function bosLead() {
  return { tip: 'b2c', ad_unvan: '', yetkili_kisi: '', telefon: '', email: '', il: 'İstanbul', ilce: '', sektor: '', adres: '', vergi_no: '', vergi_dairesi: '', ilgilenilen_etkinlik: '', kaynak: 'manuel', durum: 'yeni' }
}

export default function LeadlerClient({ leadler, toplam, etkilesimler: ilkE, sayfa, sayfaBoyutu, filtre, ilceler, sektorler, demo }) {
  const router = useRouter()
  const [etkilesimler, setEtkilesimler] = useState(ilkE || {})
  const [secili, setSecili] = useState(null)
  const [form, setForm] = useState(null)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  const [aramaInput, setAramaInput] = useState(filtre.ara || '')
  const ilkRender = useRef(true)

  function bildir(tip, metin) { setMesaj({ tip, metin }); setTimeout(() => setMesaj(null), 3500) }

  // Filtreleri URL'e yaz (sunucu yeniden sorgular) — arama debounce'lu
  function git(patch, sayfaSifirla = true) {
    const y = { ...filtre, ...patch }
    if (sayfaSifirla) y.sayfa = 1
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(y)) { if (v && !(k === 'sayfa' && v === 1)) params.set(k, v) }
    const qs = params.toString()
    router.push(qs ? `/yonetim/leadler?${qs}` : '/yonetim/leadler')
  }

  useEffect(() => {
    if (ilkRender.current) { ilkRender.current = false; return }
    const t = setTimeout(() => { if (aramaInput !== (filtre.ara || '')) git({ ara: aramaInput }) }, 450)
    return () => clearTimeout(t)
  }, [aramaInput]) // eslint-disable-line

  const sonSayfa = Math.max(1, Math.ceil(toplam / sayfaBoyutu))
  const baslangic = toplam === 0 ? 0 : (sayfa - 1) * sayfaBoyutu + 1
  const bitis = Math.min(sayfa * sayfaBoyutu, toplam)

  function leadKaydetHandler() {
    const data = form
    startTransition(async () => {
      const r = await leadKaydet(data)
      if (!r.ok) return bildir('hata', r.error)
      setForm(null); bildir('basari', demo ? 'Demo: kaydedildi.' : 'Kaydedildi.')
      router.refresh()
    })
  }
  function sil(id) {
    if (!confirm('Lead silinsin mi?')) return
    startTransition(async () => {
      const r = await leadSil(id)
      if (!r.ok) return bildir('hata', r.error)
      setSecili(null); bildir('basari', 'Silindi.'); router.refresh()
    })
  }

  const aktifFiltreSayisi = ['tip', 'ilce', 'sektor', 'durum', 'arama'].filter(k => filtre[k]).length

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>E-Marketing</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Lead Havuzu</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/yonetim/telemarketing" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}><i className="fas fa-headset" style={{ color: 'var(--color-orange)' }} /> Telemarketing</Link>
          <Link href="/yonetim/leadler/ice-aktar" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)', textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}><i className="fas fa-file-import" style={{ color: 'var(--color-orange)' }} /> İçe Aktar</Link>
          <button className="btn-primary" style={{ padding: '0.7rem 1.1rem', fontSize: '0.72rem' }} onClick={() => setForm(bosLead())}><i className="fas fa-plus" style={{ fontSize: '0.7rem' }} /> Lead Ekle</button>
        </div>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      {/* Filtre çubuğu */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <i className="fas fa-magnifying-glass" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-medium)', fontSize: '0.8rem' }} />
          <input value={aramaInput} onChange={e => setAramaInput(e.target.value)} placeholder="Ünvan, e-posta, telefon ara…" style={{ ...inp, paddingLeft: '2.2rem' }} />
        </div>
        <select value={filtre.tip} onChange={e => git({ tip: e.target.value })} style={selMini}><option value="">Tüm Tipler</option><option value="b2b">B2B</option><option value="b2c">B2C</option></select>
        <select value={filtre.ilce} onChange={e => git({ ilce: e.target.value })} style={selMini}><option value="">Tüm İlçeler</option>{ilceler.map(i => <option key={i} value={i}>{i}</option>)}</select>
        <select value={filtre.sektor} onChange={e => git({ sektor: e.target.value })} style={selMini}><option value="">Tüm Sektörler</option>{sektorler.map(s => <option key={s} value={s}>{s}</option>)}</select>
        <select value={filtre.durum} onChange={e => git({ durum: e.target.value })} style={selMini}><option value="">Tüm Durumlar</option>{Object.entries(DURUM).map(([k, d]) => <option key={k} value={k}>{d.label}</option>)}</select>
        {aktifFiltreSayisi > 0 && <button onClick={() => { setAramaInput(''); router.push('/yonetim/leadler') }} style={{ padding: '0.5rem 0.8rem', cursor: 'pointer', border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate-medium)', fontFamily: 'var(--font-sans)', fontSize: '0.78rem' }}><i className="fas fa-xmark" style={{ marginRight: '0.3rem' }} />Temizle</button>}
      </div>

      {/* Sonuç sayısı */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>
        <span><strong style={{ color: 'var(--color-slate)' }}>{toplam.toLocaleString('tr-TR')}</strong> lead{aktifFiltreSayisi > 0 || filtre.ara ? ' (filtrelenmiş)' : ''}</span>
        {pending && <span><i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--color-orange)' }} /> yükleniyor…</span>}
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
              {['Ad / Ünvan', 'İlçe', 'Sektör', 'İletişim', 'Tanıtım', 'Durum', ''].map((h, i) => (
                <th key={i} style={{ textAlign: i === 6 ? 'right' : 'left', padding: '0.85rem 1.1rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leadler.length === 0 && <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Lead bulunamadı.</td></tr>}
            {leadler.map(l => {
              const d = DURUM[l.durum] || DURUM.yeni
              return (
                <tr key={l.id} onClick={() => setSecili(l)} style={{ borderBottom: '1px solid var(--color-cream)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-cream-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.8rem 1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, padding: '0.15rem 0.4rem', background: l.tip === 'b2b' ? 'var(--color-slate)' : 'var(--color-orange)', color: '#fff' }}>{l.tip.toUpperCase()}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>{l.ad_unvan}</div>
                        {l.yetkili_kisi && <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--color-slate-medium)' }}>{l.yetkili_kisi}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem 1.1rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{l.ilce || '—'}</td>
                  <td style={{ padding: '0.8rem 1.1rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{l.sektor || '—'}</td>
                  <td style={{ padding: '0.8rem 1.1rem', fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}>{l.telefon || l.email || '—'}</td>
                  <td style={{ padding: '0.8rem 1.1rem' }}>{l.tanitim_maili_gonderildi ? <span title="Gönderildi" style={{ color: '#059669' }}><i className="fas fa-circle-check" /></span> : <span title="Gönderilmedi" style={{ color: 'var(--color-cream-dark)' }}><i className="far fa-circle" /></span>}</td>
                  <td style={{ padding: '0.8rem 1.1rem' }}><span style={{ background: d.bg, color: d.text, padding: '0.25rem 0.6rem', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{d.label}</span></td>
                  <td style={{ padding: '0.8rem 1.1rem', textAlign: 'right', color: 'var(--color-slate-medium)' }}><i className="fas fa-chevron-right" style={{ fontSize: '0.7rem' }} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {toplam > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{baslangic.toLocaleString('tr-TR')}–{bitis.toLocaleString('tr-TR')} / {toplam.toLocaleString('tr-TR')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <SayfaBtn disabled={sayfa <= 1} onClick={() => git({ sayfa: 1 }, false)}><i className="fas fa-angles-left" /></SayfaBtn>
            <SayfaBtn disabled={sayfa <= 1} onClick={() => git({ sayfa: sayfa - 1 }, false)}><i className="fas fa-angle-left" /></SayfaBtn>
            <span style={{ padding: '0 0.8rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate)' }}>{sayfa} / {sonSayfa}</span>
            <SayfaBtn disabled={sayfa >= sonSayfa} onClick={() => git({ sayfa: sayfa + 1 }, false)}><i className="fas fa-angle-right" /></SayfaBtn>
            <SayfaBtn disabled={sayfa >= sonSayfa} onClick={() => git({ sayfa: sonSayfa }, false)}><i className="fas fa-angles-right" /></SayfaBtn>
          </div>
        </div>
      )}

      {secili && (
        <DetayDrawer lead={secili} setLead={setSecili} etkilesimler={etkilesimler[secili.id] || []} setEtkilesimler={setEtkilesimler}
          pending={pending} startTransition={startTransition} bildir={bildir} demo={demo} router={router}
          onDuzenle={() => setForm(secili)} onSil={() => sil(secili.id)} />
      )}
      {form && <FormDrawer form={form} setForm={setForm} pending={pending} onKaydet={leadKaydetHandler} ilceler={ilceler} sektorler={sektorler} />}
    </div>
  )
}

function SayfaBtn({ disabled, onClick, children }) {
  return <button disabled={disabled} onClick={onClick} style={{ width: '34px', height: '34px', cursor: disabled ? 'not-allowed' : 'pointer', border: '1px solid var(--color-cream-dark)', background: disabled ? 'var(--color-cream-light)' : '#fff', color: disabled ? 'var(--color-cream-dark)' : 'var(--color-slate)', fontSize: '0.75rem' }}>{children}</button>
}

function DetayDrawer({ lead, setLead, etkilesimler, setEtkilesimler, pending, startTransition, bildir, demo, router, onDuzenle, onSil }) {
  const [not, setNot] = useState(lead.durum_notu || '')
  const [durum, setDurum] = useState(lead.durum)
  const [yeniTur, setYeniTur] = useState('telefon')
  const [yeniOzet, setYeniOzet] = useState('')

  function notKaydet() {
    startTransition(async () => {
      const r = await durumNotuGuncelle(lead.id, not, durum)
      if (!r.ok) return bildir('hata', r.error)
      setLead({ ...lead, durum_notu: not, durum }); bildir('basari', 'Kaydedildi.'); router.refresh()
    })
  }
  function mailGonder() {
    startTransition(async () => {
      const r = await tanitimMailiGonder(lead.id, lead.email, lead.ad_unvan)
      if (!r.ok) return bildir('hata', r.error)
      setLead({ ...lead, tanitim_maili_gonderildi: true, tanitim_maili_tarihi: new Date().toISOString() })
      setEtkilesimler(prev => ({ ...prev, [lead.id]: [{ id: 'x' + Date.now(), tur: 'mail', ozet: 'Tanıtım e-postası gönderildi.', created_at: new Date().toISOString() }, ...(prev[lead.id] || [])] }))
      bildir('basari', demo ? 'Demo: tanıtım maili gönderildi.' : 'Tanıtım maili gönderildi.'); router.refresh()
    })
  }
  function etkilesimKaydet() {
    if (!yeniOzet.trim()) return
    startTransition(async () => {
      const r = await etkilesimEkle(lead.id, yeniTur, yeniOzet)
      if (!r.ok) return bildir('hata', r.error)
      const yeni = r.etkilesim || { id: 'x' + Date.now(), tur: yeniTur, ozet: yeniOzet, created_at: new Date().toISOString() }
      setEtkilesimler(prev => ({ ...prev, [lead.id]: [yeni, ...(prev[lead.id] || [])] }))
      setYeniOzet(''); bildir('basari', 'Etkileşim eklendi.')
    })
  }

  return (
    <>
      <div onClick={() => setLead(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.35)', zIndex: 200 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', maxWidth: '100%', background: '#fff', zIndex: 201, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, padding: '0.15rem 0.4rem', background: lead.tip === 'b2b' ? 'var(--color-slate)' : 'var(--color-orange)', color: '#fff' }}>{lead.tip.toUpperCase()}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0.4rem 0 0' }}>{lead.ad_unvan}</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{[lead.yetkili_kisi, lead.sektor, lead.ilce].filter(Boolean).join(' · ')}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button onClick={onDuzenle} title="Düzenle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-medium)', padding: '0.3rem' }}><i className="fas fa-pen" /></button>
            <button onClick={onSil} title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.3rem' }}><i className="fas fa-trash" /></button>
            <button onClick={() => setLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)', padding: '0.3rem' }}><i className="fas fa-xmark" /></button>
          </div>
        </div>

        <div style={{ padding: '1.6rem 1.8rem', display: 'flex', flexDirection: 'column', gap: '1.3rem', flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {lead.telefon && <a href={`tel:${lead.telefon}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--color-orange)', textDecoration: 'none' }}><i className="fas fa-phone" /> {lead.telefon}</a>}
            {lead.email && <a href={`mailto:${lead.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--color-orange)', textDecoration: 'none' }}><i className="fas fa-envelope" /> {lead.email}</a>}
          </div>
          <button disabled={pending || !lead.email} onClick={mailGonder} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '0.7rem', cursor: pending ? 'wait' : 'pointer', border: '1px solid', borderColor: lead.tanitim_maili_gonderildi ? '#059669' : 'var(--color-orange)', background: lead.tanitim_maili_gonderildi ? '#F0FDF4' : 'var(--color-orange-light)', color: lead.tanitim_maili_gonderildi ? '#059669' : 'var(--color-orange)', fontFamily: 'var(--font-display)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: !lead.email ? 0.5 : 1 }}>
            <i className={lead.tanitim_maili_gonderildi ? 'fas fa-circle-check' : 'fas fa-paper-plane'} />
            {lead.tanitim_maili_gonderildi ? 'Tanıtım Maili Gönderildi' : 'Tanıtım Maili Gönder'}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <Bilgi e="İl / İlçe" v={[lead.il, lead.ilce].filter(Boolean).join(' / ')} />
            <Bilgi e="Sektör" v={lead.sektor} />
            <Bilgi e="Kaynak" v={lead.kaynak} />
            <Bilgi e="İlgilenilen" v={lead.ilgilenilen_etkinlik} />
            {lead.vergi_no && <Bilgi e="Vergi No" v={lead.vergi_no} />}
            {lead.adres && <Bilgi e="Adres" v={lead.adres} tam />}
          </div>

          <div>
            <label style={lbl}>Durum & Görüşme Notu</label>
            <select value={durum} onChange={e => setDurum(e.target.value)} style={{ ...inp, marginBottom: '0.5rem' }}>{Object.entries(DURUM).map(([k, d]) => <option key={k} value={k}>{d.label}</option>)}</select>
            <textarea value={not} onChange={e => setNot(e.target.value)} placeholder="ör. 16’sında saat 4’te arayın…" style={{ ...inp, minHeight: '80px', resize: 'vertical' }} />
            <button disabled={pending} onClick={notKaydet} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid var(--color-slate)', background: 'var(--color-slate)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Kaydet</button>
          </div>

          <div>
            <label style={lbl}>Görüşme Geçmişi (CRM)</label>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <select value={yeniTur} onChange={e => setYeniTur(e.target.value)} style={{ ...inp, width: '130px' }}>{Object.entries(ETK_TUR).map(([k, t]) => <option key={k} value={k}>{t.l}</option>)}</select>
              <input value={yeniOzet} onChange={e => setYeniOzet(e.target.value)} placeholder="Görüşme özeti…" style={inp} onKeyDown={e => e.key === 'Enter' && etkilesimKaydet()} />
              <button disabled={pending} onClick={etkilesimKaydet} className="btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.7rem' }}>Ekle</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {etkilesimler.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>Henüz görüşme kaydı yok.</p>}
              {etkilesimler.map(it => {
                const t = ETK_TUR[it.tur] || ETK_TUR.not
                return (
                  <div key={it.id} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '30px', height: '30px', flexShrink: 0, borderRadius: '8px', background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}><i className={t.ik} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-slate)' }}>{it.ozet}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-slate-medium)' }}>{t.l} · {tarihSaat(it.created_at)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function Bilgi({ e, v, tam }) {
  if (!v) return null
  return (
    <div style={{ gridColumn: tam ? '1 / -1' : 'auto' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.15rem' }}>{e}</div>
      <div style={{ fontSize: '0.88rem', color: 'var(--color-slate)' }}>{v}</div>
    </div>
  )
}

function FormDrawer({ form, setForm, pending, onKaydet, ilceler, sektorler }) {
  const set = (a, v) => setForm(f => ({ ...f, [a]: v }))
  const gecerli = form.ad_unvan?.trim()
  return (
    <>
      <div onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>{form.id ? 'Lead Düzenle' : 'Yeni Lead'}</h2>
          <button onClick={() => setForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <div>
            <label style={lbl}>Tip</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>{['b2c', 'b2b'].map(t => <button key={t} onClick={() => set('tip', t)} style={{ flex: 1, padding: '0.6rem', cursor: 'pointer', border: '1px solid', borderColor: form.tip === t ? 'var(--color-orange)' : 'var(--color-cream-dark)', background: form.tip === t ? 'var(--color-orange)' : '#fff', color: form.tip === t ? '#fff' : 'var(--color-slate-medium)', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>{t.toUpperCase()}</button>)}</div>
          </div>
          <div><label style={lbl}>{form.tip === 'b2b' ? 'Firma Ünvanı' : 'Ad Soyad'}</label><input style={inp} value={form.ad_unvan} onChange={e => set('ad_unvan', e.target.value)} /></div>
          {form.tip === 'b2b' && <div><label style={lbl}>Yetkili Kişi</label><input style={inp} value={form.yetkili_kisi || ''} onChange={e => set('yetkili_kisi', e.target.value)} /></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div><label style={lbl}>Telefon</label><input style={inp} value={form.telefon || ''} onChange={e => set('telefon', e.target.value)} /></div>
            <div><label style={lbl}>E-posta</label><input style={inp} value={form.email || ''} onChange={e => set('email', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div><label style={lbl}>İlçe</label><input list="ilce-list" style={inp} value={form.ilce || ''} onChange={e => set('ilce', e.target.value)} /><datalist id="ilce-list">{ilceler.map(i => <option key={i} value={i} />)}</datalist></div>
            <div><label style={lbl}>Sektör</label><input list="sektor-list" style={inp} value={form.sektor || ''} onChange={e => set('sektor', e.target.value)} /><datalist id="sektor-list">{sektorler.map(s => <option key={s} value={s} />)}</datalist></div>
          </div>
          <div><label style={lbl}>Adres</label><input style={inp} value={form.adres || ''} onChange={e => set('adres', e.target.value)} /></div>
          {form.tip === 'b2b' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div><label style={lbl}>Vergi No</label><input style={inp} value={form.vergi_no || ''} onChange={e => set('vergi_no', e.target.value)} /></div>
            <div><label style={lbl}>Vergi Dairesi</label><input style={inp} value={form.vergi_dairesi || ''} onChange={e => set('vergi_dairesi', e.target.value)} /></div>
          </div>}
        </div>
        <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
          <button className="btn-primary" disabled={!gecerli || pending} onClick={onKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (!gecerli || pending) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</button>
        </div>
      </aside>
    </>
  )
}
