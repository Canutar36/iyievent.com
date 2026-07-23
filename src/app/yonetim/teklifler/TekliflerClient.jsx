'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { tl } from '@/lib/fiyat'
import { teklifDurumGuncelle } from './actions'

const DURUM = {
  taslak: { bg: '#F3F4F6', text: '#6B7280', label: 'Taslak' },
  gonderildi: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Gönderildi' },
  goruldu: { bg: '#EDE9FE', text: '#7C3AED', label: 'Görüldü' },
  kabul: { bg: '#D1FAE5', text: '#059669', label: 'Kabul' },
  red: { bg: '#FEE2E2', text: '#DC2626', label: 'Red' },
  etkinlige_donustu: { bg: '#D1FAE5', text: '#047857', label: 'Etkinliğe Döndü' },
}
const FILTRELER = [['hepsi', 'Tümü'], ['taslak', 'Taslak'], ['gonderildi', 'Gönderildi'], ['goruldu', 'Görüldü'], ['kabul', 'Kabul'], ['red', 'Red']]
const tarih = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function TekliflerClient({ teklifler: ilk, demo }) {
  const [teklifler, setTeklifler] = useState(ilk)
  const [filtre, setFiltre] = useState('hepsi')
  const [secili, setSecili] = useState(null)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)

  const gorunen = useMemo(() => filtre === 'hepsi' ? teklifler : teklifler.filter(t => t.durum === filtre), [teklifler, filtre])
  const sayilar = useMemo(() => {
    const c = { hepsi: teklifler.length }
    for (const t of teklifler) c[t.durum] = (c[t.durum] || 0) + 1
    return c
  }, [teklifler])

  function durumDegistir(t, durum) {
    setMesaj(null)
    setTeklifler(prev => prev.map(x => x.id === t.id ? { ...x, durum } : x))
    if (secili?.id === t.id) setSecili({ ...secili, durum })
    startTransition(async () => {
      const r = await teklifDurumGuncelle(t.id, durum)
      if (!r.ok) { setMesaj({ tip: 'hata', metin: r.error }); setTeklifler(prev => prev.map(x => x.id === t.id ? { ...x, durum: t.durum } : x)) }
    })
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Satış Hattı</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Teklifler</h1>
        </div>
        <Link href="/yonetim/teklif/yeni" className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }}>
          <i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> Yeni Teklif
        </Link>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.85rem' }}>{mesaj.metin}</div>}

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        {FILTRELER.map(([k, l]) => {
          const aktif = filtre === k
          return (
            <button key={k} onClick={() => setFiltre(k)} style={{
              fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '0.5rem 0.9rem', cursor: 'pointer', border: '1px solid',
              borderColor: aktif ? 'var(--color-orange)' : 'var(--color-cream-dark)',
              background: aktif ? 'var(--color-orange)' : '#fff', color: aktif ? '#fff' : 'var(--color-slate-medium)',
            }}>{l} {sayilar[k] ? `(${sayilar[k]})` : ''}</button>
          )
        })}
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
              {['Teklif No', 'Müşteri', 'Hizmet', 'Tutar', 'Tarih', 'Durum', ''].map((h, i) => (
                <th key={i} style={{ textAlign: i === 6 ? 'right' : 'left', padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gorunen.length === 0 && <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Teklif bulunamadı.</td></tr>}
            {gorunen.map(t => {
              const d = DURUM[t.durum] || DURUM.taslak
              return (
                <tr key={t.id} onClick={() => setSecili(t)} style={{ borderBottom: '1px solid var(--color-cream)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-cream-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate)' }}>{t.teklif_no}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate)' }}>{t.musteri_ad || '—'}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate-medium)' }}>{t.hizmet_ad}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>{tl(t.toplam)}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{tarih(t.created_at)}</td>
                  <td style={{ padding: '0.9rem 1.2rem' }}><span style={{ background: d.bg, color: d.text, padding: '0.25rem 0.7rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{d.label}</span></td>
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right', color: 'var(--color-slate-medium)' }}><i className="fas fa-chevron-right" style={{ fontSize: '0.72rem' }} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detay drawer */}
      {secili && (
        <>
          <div onClick={() => setSecili(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.35)', zIndex: 200 }} />
          <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '460px', maxWidth: '100%', background: '#fff', zIndex: 201, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-orange)', letterSpacing: '0.08em' }}>{secili.teklif_no}</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0.2rem 0 0' }}>{secili.musteri_ad || 'İsimsiz'}</h2>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{secili.hizmet_ad} · {tarih(secili.created_at)}</div>
              </div>
              <button onClick={() => setSecili(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
            </div>

            <div style={{ padding: '1.8rem', flex: 1 }}>
              {/* İletişim */}
              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {secili.musteri_telefon && <a href={`tel:${secili.musteri_telefon}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-orange)', textDecoration: 'none' }}><i className="fas fa-phone" /> {secili.musteri_telefon}</a>}
                {secili.musteri_email && <a href={`mailto:${secili.musteri_email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-orange)', textDecoration: 'none' }}><i className="fas fa-envelope" /> {secili.musteri_email}</a>}
              </div>

              {/* Kalemler */}
              <div style={{ border: '1px solid var(--color-cream-dark)' }}>
                {(secili.kalemler || []).map((k, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 1rem', borderBottom: '1px solid var(--color-cream)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}>
                    <span style={{ color: k.tur === 'hizmet' ? 'var(--color-slate)' : 'var(--color-slate-medium)', fontWeight: k.tur === 'hizmet' ? 600 : 400 }}>{k.ad}{k.adet > 1 ? ` ×${k.adet}` : ''}</span>
                    <span style={{ color: 'var(--color-slate)', whiteSpace: 'nowrap' }}>{tl(k.tutar)}</span>
                  </div>
                ))}
                <div style={{ padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', background: 'var(--color-cream-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}><span>Ara toplam</span><span>{tl(secili.ara_toplam)}</span></div>
                  {secili.ekstra_toplam > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}><span>Ekstralar</span><span>{tl(secili.ekstra_toplam)}</span></div>}
                  {secili.indirim > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#DC2626' }}><span>İndirim</span><span>−{tl(secili.indirim)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--color-cream-dark)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>Toplam</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-orange)' }}>{tl(secili.toplam)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Durum aksiyonları */}
            <div style={{ padding: '1.3rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.6rem' }}>Durum</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {Object.entries(DURUM).filter(([k]) => k !== 'etkinlige_donustu').map(([key, d]) => {
                  const aktif = secili.durum === key
                  return (
                    <button key={key} disabled={pending} onClick={() => durumDegistir(secili, key)} style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                      padding: '0.4rem 0.7rem', cursor: pending ? 'wait' : 'pointer', border: '1px solid',
                      borderColor: aktif ? d.text : 'var(--color-cream-dark)', background: aktif ? d.bg : '#fff', color: aktif ? d.text : 'var(--color-slate-medium)',
                    }}>{d.label}</button>
                  )
                })}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
