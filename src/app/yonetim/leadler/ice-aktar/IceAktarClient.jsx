'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { leadleriIceAktar } from '../actions'

const ALANLAR = [
  { key: 'ad_unvan', l: 'Ad / Ünvan', zorunlu: true, ipucu: ['unvan', 'ünvan', 'firma', 'ad soyad', 'isim', 'name', 'şirket', 'sirket', 'ticaret'] },
  { key: 'yetkili_kisi', l: 'Yetkili Kişi', ipucu: ['yetkili', 'ilgili', 'kişi', 'kisi'] },
  { key: 'telefon', l: 'Telefon', ipucu: ['telefon', 'tel', 'gsm', 'cep', 'phone'] },
  { key: 'email', l: 'E-posta', ipucu: ['mail', 'e-posta', 'eposta', 'email', 'e_posta'] },
  { key: 'il', l: 'İl', ipucu: ['şehir', 'sehir', 'il '] },
  { key: 'ilce', l: 'İlçe', ipucu: ['ilçe', 'ilce', 'semt'] },
  { key: 'sektor', l: 'Sektör', ipucu: ['sektör', 'sektor', 'faaliyet', 'nace', 'meslek', 'branş', 'brans'] },
  { key: 'vergi_no', l: 'Vergi No', ipucu: ['vergi no', 'vkn', 'vergi numara'] },
  { key: 'vergi_dairesi', l: 'Vergi Dairesi', ipucu: ['vergi daire'] },
  { key: 'adres', l: 'Adres', ipucu: ['adres', 'address'] },
]
const CHUNK = 1000

const kutu = { background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2rem' }

export default function IceAktarClient({ demo }) {
  const [adim, setAdim] = useState(1) // 1 seç, 2 eşle, 3 içe aktar, 4 bitti
  const [dosyaAd, setDosyaAd] = useState('')
  const [basliklar, setBasliklar] = useState([])
  const [satirlar, setSatirlar] = useState([]) // dizi dizileri (veri)
  const [esleme, setEsleme] = useState({}) // alanKey -> sutunIndex
  const [tip, setTip] = useState('b2b')
  const [ilerleme, setIlerleme] = useState({ islenen: 0, eklenen: 0, toplam: 0 })
  const [hata, setHata] = useState(null)
  const fileRef = useRef(null)

  async function dosyaSec(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setHata(null); setDosyaAd(file.name)
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const matris = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' })
      if (matris.length < 2) { setHata('Dosyada veri satırı bulunamadı.'); return }
      const hdr = matris[0].map(h => String(h || '').trim())
      const veri = matris.slice(1).filter(r => r.some(c => String(c || '').trim() !== ''))
      setBasliklar(hdr); setSatirlar(veri)
      // Otomatik eşleme
      const oto = {}
      ALANLAR.forEach(alan => {
        const idx = hdr.findIndex(h => { const hl = h.toLocaleLowerCase('tr'); return alan.ipucu.some(ip => hl.includes(ip)) })
        if (idx >= 0 && !Object.values(oto).includes(idx)) oto[alan.key] = idx
      })
      setEsleme(oto); setAdim(2)
    } catch (err) {
      setHata('Dosya okunamadı: ' + err.message)
    }
  }

  const satirNesne = (satir) => {
    const o = { tip }
    for (const [alanKey, idx] of Object.entries(esleme)) { if (idx !== '' && idx != null) o[alanKey] = String(satir[idx] ?? '').trim() }
    return o
  }

  async function iceAktar() {
    setHata(null); setAdim(3)
    const toplam = satirlar.length
    setIlerleme({ islenen: 0, eklenen: 0, toplam })
    let islenen = 0, eklenen = 0
    for (let i = 0; i < toplam; i += CHUNK) {
      const parca = satirlar.slice(i, i + CHUNK).map(satirNesne)
      const r = await leadleriIceAktar(parca)
      if (!r.ok) { setHata(`Hata (satır ${i + 1}): ${r.error}`); return }
      islenen += parca.length; eklenen += (r.eklenen || 0)
      setIlerleme({ islenen, eklenen, toplam })
    }
    setAdim(4)
  }

  const adUnvanEsli = esleme.ad_unvan != null && esleme.ad_unvan !== ''
  const yuzde = ilerleme.toplam ? Math.round((ilerleme.islenen / ilerleme.toplam) * 100) : 0

  return (
    <div style={{ padding: '2.5rem', maxWidth: '900px' }}>
      <Link href="/yonetim/leadler" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', textDecoration: 'none', marginBottom: '1.2rem' }}><i className="fas fa-arrow-left" style={{ fontSize: '0.65rem' }} /> Lead Havuzu</Link>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>E-Marketing</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Toplu İçe Aktarma</h1>
        <p style={{ color: 'var(--color-slate-medium)', fontSize: '0.9rem', marginTop: '0.4rem' }}>Excel (.xlsx) veya CSV yükleyin. Binlerce satır 1000’erlik parçalarla, tarayıcı donmadan aktarılır. Aynı telefonlu mükerrer kayıtlar otomatik atlanır.</p>
      </div>

      {hata && <div style={{ padding: '0.8rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>{hata}</div>}

      {/* Adım göstergesi */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[[1, 'Dosya Seç'], [2, 'Sütun Eşle'], [3, 'İçe Aktar'], [4, 'Bitti']].map(([n, l]) => (
          <div key={n} style={{ flex: 1, textAlign: 'center', padding: '0.6rem', borderBottom: `2px solid ${adim >= n ? 'var(--color-orange)' : 'var(--color-cream-dark)'}`, fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: adim >= n ? 'var(--color-orange)' : 'var(--color-slate-medium)' }}>{n}. {l}</div>
        ))}
      </div>

      {/* ADIM 1 */}
      {adim === 1 && (
        <div style={kutu}>
          <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--color-cream-dark)', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', background: 'var(--color-cream-light)' }}>
            <i className="fas fa-file-arrow-up" style={{ fontSize: '2.5rem', color: 'var(--color-orange)', opacity: 0.6, marginBottom: '1rem', display: 'block' }} />
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '0.3rem' }}>Dosya seçmek için tıklayın</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>Excel (.xlsx, .xls) veya CSV — İSO firma datası</div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={dosyaSec} style={{ display: 'none' }} />
          </div>
        </div>
      )}

      {/* ADIM 2 — Eşleme */}
      {adim === 2 && (
        <div style={kutu}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate)' }}><i className="fas fa-file-excel" style={{ color: '#059669', marginRight: '0.4rem' }} /><strong>{dosyaAd}</strong> — {satirlar.length.toLocaleString('tr-TR')} satır bulundu</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}>Kayıt tipi:</span>
              {['b2b', 'b2c'].map(t => <button key={t} onClick={() => setTip(t)} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', border: '1px solid', borderColor: tip === t ? 'var(--color-orange)' : 'var(--color-cream-dark)', background: tip === t ? 'var(--color-orange)' : '#fff', color: tip === t ? '#fff' : 'var(--color-slate-medium)', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700 }}>{t.toUpperCase()}</button>)}
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-medium)', marginBottom: '1rem' }}>Dosyadaki sütunları eşleştirin (otomatik tahmin edildi, gerekirse düzeltin):</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {ALANLAR.map(alan => (
              <div key={alan.key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <label style={{ flex: '0 0 130px', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate)', fontWeight: alan.zorunlu ? 700 : 500 }}>{alan.l}{alan.zorunlu && <span style={{ color: 'var(--color-orange)' }}> *</span>}</label>
                <select value={esleme[alan.key] ?? ''} onChange={e => setEsleme(m => ({ ...m, [alan.key]: e.target.value === '' ? '' : Number(e.target.value) }))} style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: '0.82rem', padding: '0.45rem 0.6rem', border: '1px solid', borderColor: (alan.zorunlu && (esleme[alan.key] == null || esleme[alan.key] === '')) ? '#FCA5A5' : 'var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)', outline: 'none' }}>
                  <option value="">— (yok) —</option>
                  {basliklar.map((h, i) => <option key={i} value={i}>{h || `Sütun ${i + 1}`}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Önizleme */}
          {adUnvanEsli && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.5rem' }}>Önizleme (ilk 3 satır)</div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--color-cream-dark)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead><tr style={{ background: 'var(--color-cream-light)' }}>{ALANLAR.filter(a => esleme[a.key] != null && esleme[a.key] !== '').map(a => <th key={a.key} style={{ padding: '0.5rem 0.7rem', textAlign: 'left', color: 'var(--color-slate-medium)', fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{a.l}</th>)}</tr></thead>
                  <tbody>{satirlar.slice(0, 3).map((s, ri) => { const o = satirNesne(s); return <tr key={ri} style={{ borderTop: '1px solid var(--color-cream)' }}>{ALANLAR.filter(a => esleme[a.key] != null && esleme[a.key] !== '').map(a => <td key={a.key} style={{ padding: '0.5rem 0.7rem', color: 'var(--color-slate)' }}>{o[a.key] || '—'}</td>)}</tr> })}</tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={() => { setAdim(1); setSatirlar([]); setBasliklar([]); setEsleme({}) }} style={{ padding: '0.7rem 1.2rem', cursor: 'pointer', border: '1px solid var(--color-cream-dark)', background: '#fff', color: 'var(--color-slate)', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Geri</button>
            <button disabled={!adUnvanEsli} onClick={iceAktar} className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: adUnvanEsli ? 1 : 0.5 }}><i className="fas fa-cloud-arrow-up" style={{ fontSize: '0.8rem' }} /> {satirlar.length.toLocaleString('tr-TR')} Kaydı İçe Aktar</button>
          </div>
        </div>
      )}

      {/* ADIM 3 — İlerleme */}
      {adim === 3 && (
        <div style={kutu}>
          <div style={{ textAlign: 'center', padding: '1rem 0 2rem' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-orange)' }}>%{yuzde}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate-medium)' }}>{ilerleme.islenen.toLocaleString('tr-TR')} / {ilerleme.toplam.toLocaleString('tr-TR')} işlendi · {ilerleme.eklenen.toLocaleString('tr-TR')} eklendi</div>
          </div>
          <div style={{ height: '10px', background: 'var(--color-cream)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${yuzde}%`, background: 'var(--color-orange)', borderRadius: '5px', transition: 'width 0.2s' }} />
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--color-slate-medium)', marginTop: '1.5rem' }}><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '0.4rem', color: 'var(--color-orange)' }} />Aktarılıyor, lütfen sayfayı kapatmayın…</p>
        </div>
      )}

      {/* ADIM 4 — Bitti */}
      {adim === 4 && (
        <div style={{ ...kutu, textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1.2rem' }}><i className="fas fa-check" /></div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400, color: 'var(--color-slate)', marginBottom: '0.5rem' }}>İçe Aktarma Tamamlandı</h2>
          <p style={{ color: 'var(--color-slate-medium)', marginBottom: '2rem' }}><strong style={{ color: 'var(--color-slate)' }}>{ilerleme.eklenen.toLocaleString('tr-TR')}</strong> yeni lead eklendi ({ilerleme.toplam.toLocaleString('tr-TR')} satır işlendi{demo ? ' — demo modunda kayıt yazılmadı' : ''}).</p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            <Link href="/yonetim/leadler" className="btn-primary" style={{ padding: '0.8rem 1.4rem', fontSize: '0.78rem', textDecoration: 'none' }}>Lead Havuzuna Git</Link>
            <button onClick={() => { setAdim(1); setSatirlar([]); setBasliklar([]); setEsleme({}); setDosyaAd(''); setIlerleme({ islenen: 0, eklenen: 0, toplam: 0 }) }} className="btn-secondary" style={{ padding: '0.8rem 1.4rem', fontSize: '0.78rem' }}>Yeni Dosya</button>
          </div>
        </div>
      )}
    </div>
  )
}
