'use client'

import { useState, useMemo, useTransition } from 'react'
import { kampanyaKaydet, kampanyaSil, icerikKaydet, icerikSil } from './actions'

const ORANGE = '#F05A28', GREEN = '#059669', INK = 'var(--color-slate)', MUTED = 'var(--color-slate-medium)'
const inp = { width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: INK, background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.55rem 0.7rem', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: '0.3rem', display: 'block' }
const tarih = s => s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const SEGMENT = { tumu: 'Tüm Lead\'ler', b2b: 'B2B (Kurumsal)', b2c: 'B2C (Bireysel)' }
const K_DURUM = { taslak: { bg: '#F3F4F6', text: '#6B7280', l: 'Taslak' }, planlandi: { bg: '#FEF3C7', text: '#D97706', l: 'Planlandı' }, gonderildi: { bg: '#D1FAE5', text: '#059669', l: 'Gönderildi' } }
const PLATFORM = { instagram: { ik: 'fab fa-instagram', l: 'Instagram', renk: '#E1306C' }, facebook: { ik: 'fab fa-facebook', l: 'Facebook', renk: '#1877F2' }, linkedin: { ik: 'fab fa-linkedin', l: 'LinkedIn', renk: '#0A66C2' }, tiktok: { ik: 'fab fa-tiktok', l: 'TikTok', renk: '#000' }, youtube: { ik: 'fab fa-youtube', l: 'YouTube', renk: '#FF0000' } }
const ICERIK_TIP = { gonderi: 'Gönderi', reel: 'Reel', hikaye: 'Hikâye', etkinlik_duyuru: 'Etkinlik Duyurusu' }
const I_DURUM = [['fikir', 'Fikir'], ['tasarim', 'Tasarım'], ['onay', 'Onay'], ['yayinlandi', 'Yayınlandı']]

export default function PazarlamaClient({ data, demo }) {
  const [tab, setTab] = useState('kampanyalar')
  const [kampanyalar, setKampanyalar] = useState(data.kampanyalar)
  const [icerikler, setIcerikler] = useState(data.icerikler)
  const [pending, startTransition] = useTransition()
  const [mesaj, setMesaj] = useState(null)
  const [kForm, setKForm] = useState(null)
  const [iForm, setIForm] = useState(null)
  const [gonderim, setGonderim] = useState(null) // { ad, gonderilen, toplam }
  function bildir(t, m) { setMesaj({ tip: t, metin: m }); setTimeout(() => setMesaj(null), 3500) }

  // Chunked gönderim: /api/kampanya/gonder'i offset artırarak tekrar çağırır (ilerleme)
  async function kampanyaGonderChunked(k) {
    const toplam = data.segmentSayilari[k.hedef_segment] || 0
    if (toplam === 0) return bildir('hata', 'Bu segmentte alıcı yok.')
    if (!confirm(`${toplam.toLocaleString('tr-TR')} alıcıya ${k.kanal === 'sms' ? 'SMS' : 'e-posta'} gönderilecek. Onaylıyor musunuz?`)) return
    setGonderim({ ad: k.ad, gonderilen: 0, toplam })
    let offset = 0
    try {
      while (true) {
        const res = await fetch('/api/kampanya/gonder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kampanyaId: k.id, offset, toplam }) })
        const r = await res.json()
        if (!r.ok) { setGonderim(null); return bildir('hata', r.error) }
        offset = r.toplamGonderilen
        setGonderim({ ad: k.ad, gonderilen: offset, toplam })
        if (r.bitti) break
      }
    } catch (e) {
      setGonderim(null); return bildir('hata', 'Gönderim hatası: ' + e.message)
    }
    // Kampanyayı güncelle + demo metrik
    const acilma = Math.round(toplam * 0.68), tiklama = Math.round(toplam * 0.22), donusum = Math.round(toplam * 0.08)
    setKampanyalar(p => p.map(x => x.id === k.id ? { ...x, durum: 'gonderildi', alici_sayisi: toplam, acilma_sayisi: demo ? acilma : x.acilma_sayisi, tiklama_sayisi: demo ? tiklama : x.tiklama_sayisi, donusum_sayisi: demo ? donusum : x.donusum_sayisi, gonderim_tarihi: new Date().toISOString() } : x))
    setGonderim(null)
    bildir('basari', demo ? `Demo: ${toplam.toLocaleString('tr-TR')} alıcıya gönderildi.` : `${toplam.toLocaleString('tr-TR')} alıcıya gönderildi.`)
  }

  const TABS = [['kampanyalar', `Kampanyalar (${kampanyalar.length})`], ['icerik', `İçerik Takvimi (${icerikler.length})`], ['performans', 'Performans & ROI']]

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ORANGE, marginBottom: '0.3rem' }}>Pazarlama</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: INK, margin: 0 }}>Dijital Pazarlama</h1>
        </div>
        {tab === 'kampanyalar' && <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }} onClick={() => setKForm({ ad: '', kanal: 'email', hedef_segment: 'tumu', konu: '', icerik: '', durum: 'taslak' })}><i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> Kampanya Oluştur</button>}
        {tab === 'icerik' && <button className="btn-primary" style={{ padding: '0.7rem 1.3rem', fontSize: '0.75rem' }} onClick={() => setIForm({ baslik: '', platform: 'instagram', tip: 'gonderi', tarih: new Date().toISOString().slice(0, 10), durum: 'fikir', notlar: '' })}><i className="fas fa-plus" style={{ fontSize: '0.72rem' }} /> İçerik Ekle</button>}
      </div>

      {mesaj && <div style={{ padding: '0.7rem 1.1rem', marginBottom: '1.2rem', fontSize: '0.85rem', background: mesaj.tip === 'hata' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${mesaj.tip === 'hata' ? '#FECACA' : '#BBF7D0'}`, color: mesaj.tip === 'hata' ? '#DC2626' : '#16A34A' }}>{mesaj.metin}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-cream-dark)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ fontFamily: 'var(--font-display)', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.8rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '-1px', color: tab === k ? ORANGE : MUTED, borderBottom: tab === k ? `2px solid ${ORANGE}` : '2px solid transparent' }}>{l}</button>
        ))}
      </div>

      {/* KAMPANYALAR */}
      {tab === 'kampanyalar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
          {kampanyalar.length === 0 && <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: MUTED, border: '2px dashed var(--color-cream-dark)' }}>Kampanya yok.</div>}
          {kampanyalar.map(k => {
            const d = K_DURUM[k.durum] || K_DURUM.taslak
            const acilmaOran = k.alici_sayisi ? Math.round((k.acilma_sayisi / k.alici_sayisi) * 100) : 0
            return (
              <div key={k.id} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.3rem 1.4rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.7rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--color-orange-light)', color: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}><i className={k.kanal === 'sms' ? 'fas fa-comment-sms' : 'fas fa-envelope'} /></div>
                      <span style={{ background: d.bg, color: d.text, padding: '0.2rem 0.6rem', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>{d.l}</span>
                    </div>
                    <button onClick={() => confirm('Kampanya silinsin mi?') && startTransition(async () => { const r = await kampanyaSil(k.id); if (r.ok) setKampanyalar(p => p.filter(x => x.id !== k.id)) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '0.8rem', padding: '0.2rem' }}><i className="fas fa-trash" /></button>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, color: INK, margin: '0 0 0.4rem' }}>{k.ad}</h3>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: MUTED, marginBottom: '0.9rem' }}>
                    <i className={k.kanal === 'sms' ? 'fas fa-comment-sms' : 'fas fa-envelope'} style={{ marginRight: '0.3rem' }} />{k.kanal === 'sms' ? 'SMS' : 'E-posta'} · {SEGMENT[k.hedef_segment]}
                  </div>
                  {k.durum === 'gonderildi' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--color-cream)', paddingTop: '0.9rem' }}>
                      <Metrik deger={k.alici_sayisi} etiket="Alıcı" />
                      <Metrik deger={`%${acilmaOran}`} etiket="Açılma" renk={GREEN} />
                      <Metrik deger={k.tiklama_sayisi} etiket="Tıklama" />
                      <Metrik deger={k.donusum_sayisi} etiket="Dönüşüm" renk={ORANGE} />
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: MUTED, lineHeight: 1.5, margin: 0, borderTop: '1px solid var(--color-cream)', paddingTop: '0.9rem' }}>{(k.icerik || '').slice(0, 90)}{(k.icerik || '').length > 90 ? '…' : ''}</p>
                  )}
                </div>
                {k.durum !== 'gonderildi' && (
                  <div style={{ padding: '0.9rem 1.4rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setKForm({ ...k })} style={{ flex: 1, padding: '0.5rem', cursor: 'pointer', border: '1px solid var(--color-cream-dark)', background: '#fff', color: INK, fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Düzenle</button>
                    <button disabled={pending || !!gonderim} onClick={() => kampanyaGonderChunked(k)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.7rem' }}><i className="fas fa-paper-plane" style={{ fontSize: '0.68rem' }} /> Gönder</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* İÇERİK TAKVİMİ */}
      {tab === 'icerik' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="icerik-board">
          {I_DURUM.map(([durumKey, durumLabel]) => {
            const liste = icerikler.filter(i => i.durum === durumKey).sort((a, b) => a.tarih.localeCompare(b.tarih))
            return (
              <div key={durumKey} style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-cream-dark)', minHeight: '200px' }}>
                <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: INK }}>{durumLabel}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: MUTED }}>{liste.length}</span>
                </div>
                <div style={{ padding: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {liste.map(i => {
                    const p = PLATFORM[i.platform] || PLATFORM.instagram
                    return (
                      <div key={i.id} onClick={() => setIForm({ ...i })} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '0.8rem', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <i className={p.ik} style={{ color: p.renk, fontSize: '0.9rem' }} />
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: MUTED }}>{ICERIK_TIP[i.tip]}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: INK, lineHeight: 1.35, marginBottom: '0.4rem' }}>{i.baslik}</div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: MUTED }}><i className="fas fa-calendar" style={{ marginRight: '0.3rem' }} />{tarih(i.tarih)}</div>
                      </div>
                    )
                  })}
                  {liste.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: MUTED }}>—</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PERFORMANS */}
      {tab === 'performans' && <Performans data={data} kampanyalar={kampanyalar} />}

      {kForm && <KampanyaForm form={kForm} setForm={setKForm} segmentSayilari={data.segmentSayilari} pending={pending} onKaydet={() => startTransition(async () => {
        const r = await kampanyaKaydet(kForm); if (!r.ok) return bildir('hata', r.error)
        const yeni = { ...kForm, id: kForm.id || r.id, alici_sayisi: kForm.alici_sayisi || 0, acilma_sayisi: 0, tiklama_sayisi: 0, donusum_sayisi: 0 }
        setKampanyalar(p => kForm.id ? p.map(x => x.id === kForm.id ? { ...x, ...yeni } : x) : [yeni, ...p]); setKForm(null); bildir('basari', demo ? 'Demo: kampanya kaydedildi.' : 'Kaydedildi.')
      })} />}

      {iForm && <IcerikForm form={iForm} setForm={setIForm} pending={pending}
        onKaydet={() => startTransition(async () => {
          const r = await icerikKaydet(iForm); if (!r.ok) return bildir('hata', r.error)
          const yeni = { ...iForm, id: iForm.id || r.id }
          setIcerikler(p => iForm.id ? p.map(x => x.id === iForm.id ? yeni : x) : [...p, yeni]); setIForm(null); bildir('basari', demo ? 'Demo: içerik kaydedildi.' : 'Kaydedildi.')
        })}
        onSil={iForm.id ? () => startTransition(async () => { const r = await icerikSil(iForm.id); if (r.ok) { setIcerikler(p => p.filter(x => x.id !== iForm.id)); setIForm(null); bildir('basari', 'Silindi.') } }) : null} />}

      {/* Gönderim ilerleme overlay */}
      {gonderim && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2.5rem', width: '420px', maxWidth: '90vw', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ORANGE, marginBottom: '0.5rem' }}>Gönderiliyor</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 500, color: INK, margin: '0 0 1.5rem' }}>{gonderim.ad}</h3>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 600, color: ORANGE, marginBottom: '0.3rem' }}>%{gonderim.toplam ? Math.round((gonderim.gonderilen / gonderim.toplam) * 100) : 0}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: MUTED, marginBottom: '1.2rem' }}>{gonderim.gonderilen.toLocaleString('tr-TR')} / {gonderim.toplam.toLocaleString('tr-TR')} alıcı</div>
            <div style={{ height: '10px', background: 'var(--color-cream)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${gonderim.toplam ? (gonderim.gonderilen / gonderim.toplam) * 100 : 0}%`, background: ORANGE, borderRadius: '5px', transition: 'width 0.2s' }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: MUTED, marginTop: '1.2rem' }}><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '0.4rem', color: ORANGE }} />Parça parça gönderiliyor, lütfen bekleyin…</p>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 1000px) { .icerik-board { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  )
}

function Metrik({ deger, etiket, renk }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600, color: renk || INK }}>{deger}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: MUTED }}>{etiket}</div>
    </div>
  )
}

function Performans({ data, kampanyalar }) {
  const gonderilmis = kampanyalar.filter(k => k.durum === 'gonderildi')
  const toplamAlici = gonderilmis.reduce((a, k) => a + (k.alici_sayisi || 0), 0)
  const toplamAcilma = gonderilmis.reduce((a, k) => a + (k.acilma_sayisi || 0), 0)
  const toplamDonusum = gonderilmis.reduce((a, k) => a + (k.donusum_sayisi || 0), 0)
  const ortAcilma = toplamAlici ? Math.round((toplamAcilma / toplamAlici) * 100) : 0
  const maxKaynak = Math.max(...data.kaynakDagilim.map(k => k.sayi), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        <PTile etiket="Gönderilen Kampanya" deger={gonderilmis.length} />
        <PTile etiket="Toplam Erişim" deger={toplamAlici} />
        <PTile etiket="Ort. Açılma Oranı" deger={`%${ortAcilma}`} renk={GREEN} />
        <PTile etiket="Toplam Dönüşüm" deger={toplamDonusum} renk={ORANGE} vurgu />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.3rem' }} className="perf-grid">
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, color: INK, margin: '0 0 1.2rem' }}>Lead Kaynak Dağılımı</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {data.kaynakDagilim.map(k => (
              <div key={k.kaynak} title={`${k.kaynak}: ${k.sayi}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, color: INK }}>{k.kaynak}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: MUTED }}>{k.sayi}</span>
                </div>
                <div style={{ height: '20px', background: 'var(--color-cream)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max((k.sayi / maxKaynak) * 100, 3)}%`, background: ORANGE, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, color: INK, margin: '0 0 1.2rem' }}>Kampanya Performansı</h2>
          {gonderilmis.length === 0 ? <p style={{ fontSize: '0.85rem', color: MUTED }}>Henüz gönderilmiş kampanya yok.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {gonderilmis.map(k => {
                const acilma = k.alici_sayisi ? Math.round((k.acilma_sayisi / k.alici_sayisi) * 100) : 0
                const tiklama = k.alici_sayisi ? Math.round((k.tiklama_sayisi / k.alici_sayisi) * 100) : 0
                return (
                  <div key={k.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.83rem', fontWeight: 600, color: INK }}>{k.ad}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.76rem', color: MUTED }}>{k.alici_sayisi} alıcı</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <MiniBar etiket="Açılma" oran={acilma} renk={GREEN} />
                      <MiniBar etiket="Tıklama" oran={tiklama} renk={ORANGE} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .perf-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function PTile({ etiket, deger, renk, vurgu }) {
  return (
    <div style={{ background: vurgu ? 'var(--color-slate-deep)' : '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.3rem' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: vurgu ? 'rgba(246,243,234,0.6)' : MUTED, marginBottom: '0.5rem' }}>{etiket}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: vurgu ? ORANGE : (renk || INK) }}>{deger}</div>
    </div>
  )
}

function MiniBar({ etiket, oran, renk }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: MUTED, marginBottom: '0.15rem' }}><span>{etiket}</span><span>%{oran}</span></div>
      <div style={{ height: '8px', background: 'var(--color-cream)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${oran}%`, background: renk, borderRadius: '4px' }} /></div>
    </div>
  )
}

function Drawer({ baslik, onKapat, children, footer }) {
  return (
    <>
      <div onClick={onKapat} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,27,0.4)', zIndex: 210 }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', maxWidth: '100%', background: '#fff', zIndex: 211, boxShadow: '-10px 0 40px rgba(20,26,27,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 500, color: INK, margin: 0 }}>{baslik}</h2>
          <button onClick={onKapat} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: MUTED }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>{children}</div>
        <div style={{ padding: '1.2rem 1.8rem', borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>{footer}</div>
      </aside>
    </>
  )
}

function KampanyaForm({ form, setForm, segmentSayilari, pending, onKaydet }) {
  const set = (a, v) => setForm(f => ({ ...f, [a]: v }))
  const alici = segmentSayilari[form.hedef_segment] || 0
  return (
    <Drawer baslik={form.id ? 'Kampanya Düzenle' : 'Yeni Kampanya'} onKapat={() => setForm(null)}
      footer={<button className="btn-primary" disabled={pending || !form.ad?.trim()} onClick={onKaydet} style={{ width: '100%', justifyContent: 'center', opacity: (pending || !form.ad?.trim()) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Taslak Kaydet'}</button>}>
      <div><label style={lbl}>Kampanya Adı</label><input style={inp} value={form.ad} onChange={e => set('ad', e.target.value)} /></div>
      <div><label style={lbl}>Kanal</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[['email', 'E-posta', 'fas fa-envelope'], ['sms', 'SMS', 'fas fa-comment-sms']].map(([k, l, ik]) => (
            <button key={k} onClick={() => set('kanal', k)} style={{ flex: 1, padding: '0.6rem', cursor: 'pointer', border: '1px solid', borderColor: form.kanal === k ? ORANGE : 'var(--color-cream-dark)', background: form.kanal === k ? 'var(--color-orange-light)' : '#fff', color: form.kanal === k ? ORANGE : MUTED, fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}><i className={ik} style={{ marginRight: '0.3rem' }} />{l}</button>
          ))}
        </div>
      </div>
      <div><label style={lbl}>Hedef Segment</label>
        <select style={inp} value={form.hedef_segment} onChange={e => set('hedef_segment', e.target.value)}>
          {Object.entries(SEGMENT).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: ORANGE, fontWeight: 600 }}><i className="fas fa-users" style={{ marginRight: '0.4rem' }} />{alici} alıcıya ulaşacak</div>
      </div>
      {form.kanal === 'email' && <div><label style={lbl}>E-posta Konusu</label><input style={inp} value={form.konu || ''} onChange={e => set('konu', e.target.value)} /></div>}
      <div><label style={lbl}>{form.kanal === 'sms' ? 'SMS Metni' : 'İçerik'}</label><textarea style={{ ...inp, minHeight: '120px', resize: 'vertical' }} value={form.icerik || ''} onChange={e => set('icerik', e.target.value)} placeholder={form.kanal === 'sms' ? 'Kısa mesaj (160 karakter önerilir)' : 'Kampanya mesajınız…'} /></div>
    </Drawer>
  )
}

function IcerikForm({ form, setForm, pending, onKaydet, onSil }) {
  const set = (a, v) => setForm(f => ({ ...f, [a]: v }))
  return (
    <Drawer baslik={form.id ? 'İçerik Düzenle' : 'Yeni İçerik'} onKapat={() => setForm(null)}
      footer={<div style={{ display: 'flex', gap: '0.6rem' }}>
        <button className="btn-primary" disabled={pending || !form.baslik?.trim()} onClick={onKaydet} style={{ flex: 1, justifyContent: 'center', opacity: (pending || !form.baslik?.trim()) ? 0.55 : 1 }}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</button>
        {onSil && <button onClick={onSil} style={{ padding: '0.7rem 1rem', cursor: 'pointer', border: '1px solid #FECACA', background: '#fff', color: '#DC2626', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}><i className="fas fa-trash" /></button>}
      </div>}>
      <div><label style={lbl}>Başlık</label><input style={inp} value={form.baslik} onChange={e => set('baslik', e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div><label style={lbl}>Platform</label><select style={inp} value={form.platform} onChange={e => set('platform', e.target.value)}>{Object.entries(PLATFORM).map(([k, p]) => <option key={k} value={k}>{p.l}</option>)}</select></div>
        <div><label style={lbl}>Tip</label><select style={inp} value={form.tip} onChange={e => set('tip', e.target.value)}>{Object.entries(ICERIK_TIP).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div><label style={lbl}>Tarih</label><input type="date" style={inp} value={form.tarih} onChange={e => set('tarih', e.target.value)} /></div>
        <div><label style={lbl}>Durum</label><select style={inp} value={form.durum} onChange={e => set('durum', e.target.value)}>{I_DURUM.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      </div>
      <div><label style={lbl}>Notlar</label><textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={form.notlar || ''} onChange={e => set('notlar', e.target.value)} /></div>
    </Drawer>
  )
}
