'use client'

import { useState, useMemo, useTransition } from 'react'
import { tl } from '@/lib/fiyat'
import { cariKaydet, cariSil, kasaHareketEkle, giderKaydet, giderSil } from './actions'

const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate)', background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.55rem 0.75rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.3rem', display: 'block' }
const tarih = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const YONTEM = { nakit: 'Nakit', havale: 'Havale/EFT', kredi_karti: 'Kredi Kartı', paytr: 'PayTR', cek: 'Çek' }

export default function MuhasebeClient({ data, demo }) {
  const [tab, setTab] = useState('genel')
  const [cariler, setCariler] = useState(data.cariler)
  const [kasalar, setKasalar] = useState(data.kasalar)
  const [hareketler, setHareketler] = useState(data.hareketler)
  const [giderler, setGiderler] = useState(data.giderler)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  const [cariForm, setCariForm] = useState(null)
  const [giderForm, setGiderForm] = useState(null)

  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3000) }

  const toplamNakit = kasalar.reduce((a, k) => a + (Number(k.bakiye) || 0), 0)
  const toplamTahsilat = data.tahsilatlar.reduce((a, t) => a + (Number(t.tutar) || 0), 0)
  const toplamGider = giderler.reduce((a, g) => a + (Number(g.tutar) || 0), 0)
  const alacak = cariler.filter(c => c.tip === 'musteri').reduce((a, c) => a + Math.max(0, Number(c.bakiye) || 0), 0)
  const borc = cariler.filter(c => c.tip === 'tedarikci').reduce((a, c) => a + Math.abs(Math.min(0, Number(c.bakiye) || 0)), 0)

  const TABS = [['genel', 'Genel Bakış'], ['cari', `Cari Hesaplar (${cariler.length})`], ['kasa', 'Kasa & Banka'], ['gider', `Giderler (${giderler.length})`]]

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Finans</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Ön Muhasebe</h1>
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-cream-dark)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ fontFamily: 'var(--font-display)', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.8rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '-1px', color: tab === k ? 'var(--color-orange)' : 'var(--color-slate-medium)', borderBottom: tab === k ? '2px solid var(--color-orange)' : '2px solid transparent' }}>{l}</button>
        ))}
      </div>

      {/* GENEL BAKIŞ */}
      {tab === 'genel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Stat etiket="Toplam Nakit Varlık" deger={tl(toplamNakit)} ikon="fas fa-vault" vurgu />
            <Stat etiket="Toplam Tahsilat" deger={tl(toplamTahsilat)} ikon="fas fa-arrow-down" renk="#059669" />
            <Stat etiket="Toplam Gider" deger={tl(toplamGider)} ikon="fas fa-arrow-up" renk="#DC2626" />
            <Stat etiket="Net" deger={tl(toplamTahsilat - toplamGider)} ikon="fas fa-scale-balanced" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Stat etiket="Alacaklarımız (Müşteri)" deger={tl(alacak)} ikon="fas fa-hand-holding-dollar" renk="#059669" />
            <Stat etiket="Borçlarımız (Tedarikçi)" deger={tl(borc)} ikon="fas fa-file-invoice-dollar" renk="#DC2626" />
          </div>

          {/* Kasa özet */}
          <div>
            <h3 style={sectionBaslik}>Kasa & Banka</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {kasalar.map(k => <KasaKart key={k.id} k={k} />)}
            </div>
          </div>

          {/* Etkinlik P&L */}
          <div>
            <h3 style={sectionBaslik}>Etkinlik Kâr-Zarar Analizi</h3>
            <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
                  {['Etkinlik', 'Gelir', 'Gider', 'Kâr', 'Marj'].map((h, i) => <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '0.8rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {data.pnl.map((p, i) => {
                    const marj = p.gelir ? Math.round((p.kar / p.gelir) * 100) : 0
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-cream)' }}>
                        <td style={{ padding: '0.8rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>{p.etkinlik}</td>
                        <td style={{ padding: '0.8rem 1.2rem', textAlign: 'right', fontSize: '0.85rem', color: '#059669' }}>{tl(p.gelir)}</td>
                        <td style={{ padding: '0.8rem 1.2rem', textAlign: 'right', fontSize: '0.85rem', color: '#DC2626' }}>{tl(p.gider)}</td>
                        <td style={{ padding: '0.8rem 1.2rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate)' }}>{tl(p.kar)}</td>
                        <td style={{ padding: '0.8rem 1.2rem', textAlign: 'right' }}><span style={{ background: marj >= 50 ? '#D1FAE5' : '#FEF3C7', color: marj >= 50 ? '#059669' : '#D97706', padding: '0.2rem 0.5rem', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700 }}>%{marj}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CARİ */}
      {tab === 'cari' && (
        <CariSekme cariler={cariler} setCariForm={setCariForm} onSil={(id) => {
          startTransition(async () => { const r = await cariSil(id); if (!r.ok) return bildir('hata', r.error); setCariler(p => p.filter(x => x.id !== id)); bildir('basari', 'Silindi.') })
        }} />
      )}

      {/* KASA */}
      {tab === 'kasa' && (
        <KasaSekme kasalar={kasalar} hareketler={hareketler} pending={pending} demo={demo} bildir={bildir}
          onHareket={(h) => startTransition(async () => {
            const r = await kasaHareketEkle(h)
            if (!r.ok) return bildir('hata', r.error)
            const yeni = r.hareket || { id: 'x' + Date.now(), ...h, ref_tur: 'manuel' }
            setHareketler(p => [yeni, ...p])
            setKasalar(p => p.map(k => k.id === h.kasa_id ? { ...k, bakiye: (Number(k.bakiye) || 0) + (h.tur === 'giris' ? Number(h.tutar) : -Number(h.tutar)) } : k))
            bildir('basari', demo ? 'Demo: hareket eklendi.' : 'Kasa hareketi eklendi.')
          })}
        />
      )}

      {/* GİDER */}
      {tab === 'gider' && (
        <GiderSekme giderler={giderler} setGiderForm={setGiderForm} onSil={(id) => {
          startTransition(async () => { const r = await giderSil(id); if (!r.ok) return bildir('hata', r.error); setGiderler(p => p.filter(x => x.id !== id)); bildir('basari', 'Silindi.') })
        }} />
      )}

      {cariForm && <CariForm form={cariForm} setForm={setCariForm} pending={pending} onKaydet={() => startTransition(async () => {
        const r = await cariKaydet(cariForm); if (!r.ok) return bildir('hata', r.error)
        const yeni = { ...cariForm, id: cariForm.id || r.id, bakiye: cariForm.bakiye || 0 }
        setCariler(p => cariForm.id ? p.map(x => x.id === cariForm.id ? yeni : x) : [...p, yeni]); setCariForm(null); bildir('basari', demo ? 'Demo: kaydedildi.' : 'Kaydedildi.')
      })} />}

      {giderForm && <GiderForm form={giderForm} setForm={setGiderForm} kasalar={kasalar} pending={pending} onKaydet={() => startTransition(async () => {
        const r = await giderKaydet(giderForm); if (!r.ok) return bildir('hata', r.error)
        const yeni = { ...giderForm, id: giderForm.id || r.id }
        setGiderler(p => giderForm.id ? p.map(x => x.id === giderForm.id ? yeni : x) : [yeni, ...p]); setGiderForm(null); bildir('basari', demo ? 'Demo: gider eklendi.' : 'Gider kaydedildi.')
      })} />}
    </div>
  )
}

const sectionBaslik = { fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate)', marginBottom: '0.9rem' }

function Stat({ etiket, deger, ikon, renk, vurgu }) {
  return (
    <div style={{ background: vurgu ? 'var(--color-slate-deep)' : '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: vurgu ? 'rgba(246,243,234,0.6)' : 'var(--color-slate-medium)' }}>{etiket}</span>
        <i className={ikon} style={{ color: renk || 'var(--color-orange)', fontSize: '0.85rem' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, color: vurgu ? 'var(--color-orange)' : (renk || 'var(--color-slate)') }}>{deger}</div>
    </div>
  )
}

function KasaKart({ k }) {
  const ikon = { kasa: 'fas fa-money-bill-wave', banka: 'fas fa-building-columns', pos: 'fas fa-credit-card' }[k.tip]
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}><i className={ikon} /></div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate)' }}>{k.ad}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-slate)' }}>{tl(k.bakiye)}</div>
    </div>
  )
}

function CariSekme({ cariler, setCariForm, onSil }) {
  const [f, setF] = useState('hepsi')
  const gorunen = f === 'hepsi' ? cariler : cariler.filter(c => c.tip === f)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[['hepsi', 'Tümü'], ['musteri', 'Müşteri'], ['tedarikci', 'Tedarikçi']].map(([k, l]) => (
            <button key={k} onClick={() => setF(k)} style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.45rem 0.8rem', cursor: 'pointer', border: '1px solid', borderColor: f === k ? 'var(--color-orange)' : 'var(--color-cream-dark)', background: f === k ? 'var(--color-orange)' : '#fff', color: f === k ? '#fff' : 'var(--color-slate-medium)' }}>{l}</button>
          ))}
        </div>
        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }} onClick={() => setCariForm({ unvan: '', tip: 'musteri', vergi_no: '', vergi_dairesi: '', telefon: '', email: '', adres: '' })}><i className="fas fa-plus" style={{ fontSize: '0.7rem' }} /> Cari Ekle</button>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
            {['Ünvan', 'Tip', 'Vergi No', 'İletişim', 'Bakiye', ''].map((h, i) => <th key={i} style={{ textAlign: i >= 4 ? 'right' : 'left', padding: '0.8rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {gorunen.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--color-cream)' }}>
                <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>{c.unvan}</td>
                <td style={{ padding: '0.8rem 1.2rem' }}><span style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.4rem', background: c.tip === 'musteri' ? 'var(--color-orange)' : 'var(--color-slate)', color: '#fff', textTransform: 'uppercase' }}>{c.tip === 'musteri' ? 'Müşteri' : 'Tedarikçi'}</span></td>
                <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{c.vergi_no || '—'}</td>
                <td style={{ padding: '0.8rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{c.telefon || c.email || '—'}</td>
                <td style={{ padding: '0.8rem 1.2rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: c.bakiye > 0 ? '#059669' : (c.bakiye < 0 ? '#DC2626' : 'var(--color-slate-medium)') }}>{tl(c.bakiye)}</td>
                <td style={{ padding: '0.8rem 1.2rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => setCariForm({ ...c })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-medium)', padding: '0.25rem', fontSize: '0.8rem' }}><i className="fas fa-pen" /></button>
                  <button onClick={() => confirm('Silinsin mi?') && onSil(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.25rem', fontSize: '0.8rem' }}><i className="fas fa-trash" /></button>
                </td>
              </tr>
            ))}
            {gorunen.length === 0 && <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Cari yok.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KasaSekme({ kasalar, hareketler, pending, bildir, onHareket }) {
  const [h, setH] = useState({ kasa_id: kasalar[0]?.id || '', tur: 'giris', tutar: '', kategori: '', aciklama: '', tarih: new Date().toISOString().slice(0, 10) })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {kasalar.map(k => <KasaKart key={k.id} k={k} />)}
      </div>

      {/* Manuel hareket */}
      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.3rem' }}>
        <h3 style={{ ...sectionBaslik, marginBottom: '0.9rem' }}>Manuel Hareket Ekle</h3>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 150px' }}><label style={lbl}>Kasa</label><select style={inp} value={h.kasa_id} onChange={e => setH({ ...h, kasa_id: e.target.value })}>{kasalar.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}</select></div>
          <div style={{ flex: '0 0 120px' }}><label style={lbl}>Tür</label><select style={inp} value={h.tur} onChange={e => setH({ ...h, tur: e.target.value })}><option value="giris">Giriş (+)</option><option value="cikis">Çıkış (−)</option></select></div>
          <div style={{ flex: '0 0 130px' }}><label style={lbl}>Tutar (₺)</label><input type="number" style={inp} value={h.tutar} onChange={e => setH({ ...h, tutar: e.target.value })} /></div>
          <div style={{ flex: '1 1 160px' }}><label style={lbl}>Açıklama</label><input style={inp} value={h.aciklama} onChange={e => setH({ ...h, aciklama: e.target.value })} /></div>
          <button className="btn-primary" disabled={pending || !h.tutar} style={{ padding: '0.55rem 1.1rem', fontSize: '0.72rem' }} onClick={() => { onHareket(h); setH({ ...h, tutar: '', aciklama: '' }) }}>Ekle</button>
        </div>
      </div>

      {/* Hareketler */}
      <div>
        <h3 style={sectionBaslik}>Son Hareketler</h3>
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
              {['Tarih', 'Kasa', 'Açıklama', 'Kategori', 'Tutar'].map((th, i) => <th key={i} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '0.8rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{th}</th>)}
            </tr></thead>
            <tbody>
              {hareketler.map(x => {
                const kasa = kasalar.find(k => k.id === x.kasa_id)
                return (
                  <tr key={x.id} style={{ borderBottom: '1px solid var(--color-cream)' }}>
                    <td style={{ padding: '0.75rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{tarih(x.tarih)}</td>
                    <td style={{ padding: '0.75rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate)' }}>{kasa?.ad || '—'}</td>
                    <td style={{ padding: '0.75rem 1.2rem', fontSize: '0.84rem', color: 'var(--color-slate)' }}>{x.aciklama || '—'}</td>
                    <td style={{ padding: '0.75rem 1.2rem', fontSize: '0.78rem', color: 'var(--color-slate-medium)' }}>{x.kategori}</td>
                    <td style={{ padding: '0.75rem 1.2rem', textAlign: 'right', fontSize: '0.88rem', fontWeight: 600, color: x.tur === 'giris' ? '#059669' : '#DC2626' }}>{x.tur === 'giris' ? '+' : '−'}{tl(x.tutar)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function GiderSekme({ giderler, setGiderForm, onSil }) {
  const DURUM = { odendi: { bg: '#D1FAE5', text: '#059669', l: 'Ödendi' }, bekliyor: { bg: '#FEF3C7', text: '#D97706', l: 'Bekliyor' } }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.72rem' }} onClick={() => setGiderForm({ etkinlik_id: '', tedarikci_id: '', kategori: 'Genel', aciklama: '', tutar: '', tarih: new Date().toISOString().slice(0, 10), kasa_id: '', durum: 'bekliyor' })}><i className="fas fa-plus" style={{ fontSize: '0.7rem' }} /> Gider Ekle</button>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
            {['Tarih', 'Açıklama', 'Etkinlik', 'Tedarikçi', 'Tutar', 'Durum', ''].map((h, i) => <th key={i} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '0.8rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {giderler.map(g => {
              const d = DURUM[g.durum] || DURUM.bekliyor
              return (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--color-cream)' }}>
                  <td style={{ padding: '0.75rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{tarih(g.tarih)}</td>
                  <td style={{ padding: '0.75rem 1.2rem', fontSize: '0.85rem', color: 'var(--color-slate)' }}>{g.aciklama || g.kategori}</td>
                  <td style={{ padding: '0.75rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{g.etkinlik_ad || '—'}</td>
                  <td style={{ padding: '0.75rem 1.2rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>{g.tedarikci_ad || '—'}</td>
                  <td style={{ padding: '0.75rem 1.2rem', textAlign: 'right', fontSize: '0.88rem', fontWeight: 600, color: '#DC2626' }}>{tl(g.tutar)}</td>
                  <td style={{ padding: '0.75rem 1.2rem' }}><span style={{ background: d.bg, color: d.text, padding: '0.2rem 0.55rem', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>{d.l}</span></td>
                  <td style={{ padding: '0.75rem 1.2rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => setGiderForm({ ...g })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate-medium)', padding: '0.25rem', fontSize: '0.8rem' }}><i className="fas fa-pen" /></button>
                    <button onClick={() => confirm('Silinsin mi?') && onSil(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '0.25rem', fontSize: '0.8rem' }}><i className="fas fa-trash" /></button>
                  </td>
                </tr>
              )
            })}
            {giderler.length === 0 && <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Gider yok.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Drawer({ baslik, onKapat, children, footer }) {
  return (
    <>
      <div onClick={onKapat} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>{baslik}</h2>
          <button onClick={onKapat} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-slate-medium)' }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>{children}</div>
        <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>{footer}</div>
      </aside>
    </>
  )
}

function CariForm({ form, setForm, pending, onKaydet }) {
  const set = (a, v) => setForm(f => ({ ...f, [a]: v }))
  return (
    <Drawer baslik={form.id ? 'Cari Düzenle' : 'Yeni Cari'} onKapat={() => setForm(null)}
      footer={<button className="btn-primary" disabled={pending || !form.unvan?.trim()} onClick={onKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (pending || !form.unvan?.trim()) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</button>}>
      <div><label style={lbl}>Ünvan</label><input style={inp} value={form.unvan} onChange={e => set('unvan', e.target.value)} /></div>
      <div><label style={lbl}>Tip</label><select style={inp} value={form.tip} onChange={e => set('tip', e.target.value)}><option value="musteri">Müşteri</option><option value="tedarikci">Tedarikçi</option></select></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div><label style={lbl}>Vergi No</label><input style={inp} value={form.vergi_no || ''} onChange={e => set('vergi_no', e.target.value)} /></div>
        <div><label style={lbl}>Vergi Dairesi</label><input style={inp} value={form.vergi_dairesi || ''} onChange={e => set('vergi_dairesi', e.target.value)} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div><label style={lbl}>Telefon</label><input style={inp} value={form.telefon || ''} onChange={e => set('telefon', e.target.value)} /></div>
        <div><label style={lbl}>E-posta</label><input style={inp} value={form.email || ''} onChange={e => set('email', e.target.value)} /></div>
      </div>
      <div><label style={lbl}>Adres</label><textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} value={form.adres || ''} onChange={e => set('adres', e.target.value)} /></div>
    </Drawer>
  )
}

function GiderForm({ form, setForm, kasalar, pending, onKaydet }) {
  const set = (a, v) => setForm(f => ({ ...f, [a]: v }))
  return (
    <Drawer baslik={form.id ? 'Gider Düzenle' : 'Yeni Gider'} onKapat={() => setForm(null)}
      footer={<button className="btn-primary" disabled={pending || !form.tutar} onClick={onKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (pending || !form.tutar) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</button>}>
      <div><label style={lbl}>Açıklama</label><input style={inp} value={form.aciklama || ''} onChange={e => set('aciklama', e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div><label style={lbl}>Kategori</label><input style={inp} value={form.kategori || ''} onChange={e => set('kategori', e.target.value)} /></div>
        <div><label style={lbl}>Tutar (₺)</label><input type="number" style={inp} value={form.tutar} onChange={e => set('tutar', e.target.value)} /></div>
      </div>
      <div><label style={lbl}>Etkinlik (opsiyonel)</label><input style={inp} value={form.etkinlik_ad || ''} onChange={e => set('etkinlik_ad', e.target.value)} placeholder="Etkinlik adı" /></div>
      <div><label style={lbl}>Tedarikçi (opsiyonel)</label><input style={inp} value={form.tedarikci_ad || ''} onChange={e => set('tedarikci_ad', e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div><label style={lbl}>Tarih</label><input type="date" style={inp} value={form.tarih} onChange={e => set('tarih', e.target.value)} /></div>
        <div><label style={lbl}>Durum</label><select style={inp} value={form.durum} onChange={e => set('durum', e.target.value)}><option value="bekliyor">Bekliyor</option><option value="odendi">Ödendi</option></select></div>
      </div>
      {form.durum === 'odendi' && <div><label style={lbl}>Ödendiği Kasa</label><select style={inp} value={form.kasa_id || ''} onChange={e => set('kasa_id', e.target.value)}><option value="">Seçin…</option>{kasalar.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}</select></div>}
    </Drawer>
  )
}
