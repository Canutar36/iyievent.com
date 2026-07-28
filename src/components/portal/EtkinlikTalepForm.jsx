'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { DEMO_HIZMETLER, DEMO_EKSTRALAR, KATEGORILER } from '@/lib/demo-katalog'
import toast from 'react-hot-toast'

const ETKINLIK_TURLERI = [
  'Düğün', 'Nikah', 'Nişan', 'Kına Gecesi', 'Gala', 'Kurumsal Etkinlik',
  'Doğum Günü', 'Parti', 'Özel Davet', 'Destination', 'Diğer',
]

export default function EtkinlikTalepForm({ isOpen, onClose }) {
  const [hizmetler, setHizmetler] = useState(DEMO_HIZMETLER)
  const [ekstralar, setEkstralar] = useState(DEMO_EKSTRALAR)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    etkinlik_turu: '',
    hizmet_id: '',
    ekstralar: [],
    tarih: '',
    tahmini_misafir: '',
    notlar: '',
  })

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) loadKatalog()
  }, [isOpen])

  async function loadKatalog() {
    const [hizmetRes, ekstraRes] = await Promise.all([
      supabase.from('hizmetler').select('*').eq('aktif', true).order('siralama'),
      supabase.from('ekstralar').select('*').eq('aktif', true).order('siralama'),
    ])
    if (hizmetRes.data?.length) setHizmetler(hizmetRes.data)
    if (ekstraRes.data?.length) setEkstralar(ekstraRes.data)
    setLoading(false)
  }

  function toggleEkstra(ekstraId) {
    setForm(prev => ({
      ...prev,
      ekstralar: prev.ekstralar.includes(ekstraId)
        ? prev.ekstralar.filter(id => id !== ekstraId)
        : [...prev.ekstralar, ekstraId],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.etkinlik_turu) {
      toast.error('Etkinlik türünü seçin')
      return
    }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Oturum bulunamadı')
      setSubmitting(false)
      return
    }

    const secilenHizmet = hizmetler.find(h => h.id === form.hizmet_id)
    const secilenEkstraDetaylar = ekstralar.filter(e => form.ekstralar.includes(e.id))

    const notlarParts = []
    if (secilenHizmet) notlarParts.push(`Hizmet: ${secilenHizmet.ad}`)
    if (secilenEkstraDetaylar.length) {
      notlarParts.push(`Ekstralar: ${secilenEkstraDetaylar.map(e => e.ad).join(', ')}`)
    }
    if (form.notlar) notlarParts.push(form.notlar)

    const { error: etkinlikError } = await supabase
      .from('etkinlikler')
      .insert({
        musteri_id: user.id,
        ad: `${form.etkinlik_turu} — ${new Date().toLocaleDateString('tr-TR')}`,
        tur: form.etkinlik_turu,
        tarih: form.tarih || null,
        tahmini_misafir_sayisi: form.tahmini_misafir ? Number(form.tahmini_misafir) : null,
        durum: 'talep',
        notlar: notlarParts.join('\n') || null,
        hizmet_id: form.hizmet_id || null,
      })

    if (etkinlikError) {
      toast.error('Talep oluşturulurken hata oluştu')
      setSubmitting(false)
      return
    }

    toast.success('Etkinlik talebiniz alındı!')
    setForm({ etkinlik_turu: '', hizmet_id: '', ekstralar: [], tarih: '', tahmini_misafir: '', notlar: '' })
    onClose()
    setSubmitting(false)

    window.location.href = '/musteri/etkinlikler'
  }

  if (!isOpen) return null

  const selectedHizmet = hizmetler.find(h => h.id === form.hizmet_id)
  const groupedEkstralar = ekstralar.reduce((acc, e) => {
    const grup = e.grup || 'Genel'
    if (!acc[grup]) acc[grup] = []
    acc[grup].push(e)
    return acc
  }, {})

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: '16px', width: '100%', maxWidth: '640px',
        maxHeight: '90vh', overflow: 'auto', padding: '2rem',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-slate-deep)', margin: 0 }}>
              Etkinlik Talep Et
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(0,0,0,0.4)', margin: '0.3rem 0 0' }}>
              İstediğiniz etkinliği seçin, ekibimiz sizinle iletişime geçsin.
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.2rem', color: 'rgba(0,0,0,0.3)', padding: '0.5rem',
          }}>
            <i className="fas fa-times" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Etkinlik Türü */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Etkinlik Türü *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {ETKINLIK_TURLERI.map(tur => (
                <button key={tur} type="button" onClick={() => setForm({ ...form, etkinlik_turu: tur })} style={{
                  padding: '0.5rem', borderRadius: '8px', fontSize: '0.78rem',
                  fontFamily: 'var(--font-sans)', cursor: 'pointer',
                  background: form.etkinlik_turu === tur ? 'var(--color-orange)' : '#F9FAFB',
                  color: form.etkinlik_turu === tur ? 'white' : 'var(--color-slate)',
                  border: form.etkinlik_turu === tur ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  fontWeight: form.etkinlik_turu === tur ? 600 : 400,
                  transition: 'all 0.15s',
                }}>
                  {tur}
                </button>
              ))}
            </div>
          </div>

          {/* Hizmet Seçimi */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Hizmet Seçin</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {hizmetler.map(hizmet => (
                <button key={hizmet.id} type="button" onClick={() => setForm({ ...form, hizmet_id: hizmet.id })} style={{
                  padding: '0.7rem 1rem', borderRadius: '8px', textAlign: 'left',
                  background: form.hizmet_id === hizmet.id ? 'rgba(240,90,40,0.06)' : '#F9FAFB',
                  border: form.hizmet_id === hizmet.id ? '1px solid var(--color-orange)' : '1px solid rgba(0,0,0,0.06)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-deep)' }}>
                        {hizmet.ad}
                      </span>
                      <span style={{
                        marginLeft: '0.5rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                        background: 'rgba(0,0,0,0.04)', fontFamily: 'var(--font-sans)',
                        fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)',
                      }}>
                        {KATEGORILER.find(k => k.key === hizmet.kategori)?.label || hizmet.kategori}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-orange)', fontWeight: 600 }}>
                      {hizmet.fiyatlandirma_tipi === 'sabit' ? `${Number(hizmet.birim_fiyat).toLocaleString('tr-TR')} ₺` :
                       hizmet.fiyatlandirma_tipi === 'kisi_basi' ? `Kişi başı ${Number(hizmet.birim_fiyat).toLocaleString('tr-TR')} ₺` :
                       'Kademeli fiyat'}
                    </span>
                  </div>
                  {hizmet.aciklama && (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', margin: '0.3rem 0 0' }}>
                      {hizmet.aciklama}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ekstralar */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Ekstra Hizmetler</label>
            {Object.entries(groupedEkstralar).map(([grup, grupEkstralari]) => (
              <div key={grup} style={{ marginBottom: '0.8rem' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.35)', marginBottom: '0.4rem',
                }}>
                  {grup}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                  {grupEkstralari.map(ekstra => (
                    <button key={ekstra.id} type="button" onClick={() => toggleEkstra(ekstra.id)} style={{
                      padding: '0.5rem 0.7rem', borderRadius: '8px', textAlign: 'left',
                      background: form.ekstralar.includes(ekstra.id) ? 'rgba(240,90,40,0.06)' : '#F9FAFB',
                      border: form.ekstralar.includes(ekstra.id) ? '1px solid var(--color-orange)' : '1px solid rgba(0,0,0,0.06)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-slate)' }}>
                        {ekstra.ad}
                      </span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-orange)', fontWeight: 500 }}>
                        {Number(ekstra.birim_fiyat).toLocaleString('tr-TR')} ₺
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tarih & Misafir */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Tahmini Tarih</label>
              <input type="date" value={form.tarih} onChange={e => setForm({ ...form, tarih: e.target.value })}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tahmini Misafir Sayısı</label>
              <input type="number" value={form.tahmini_misafir} onChange={e => setForm({ ...form, tahmini_misafir: e.target.value })}
                placeholder="Örn: 100" min="0" style={inputStyle} />
            </div>
          </div>

          {/* Notlar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Ek Notlar</label>
            <textarea value={form.notlar} onChange={e => setForm({ ...form, notlar: e.target.value })}
              rows={3} placeholder="Özel istekler, konsept detayları..."
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '0.85rem', borderRadius: '8px',
            background: 'var(--color-orange)', color: 'white', border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            opacity: submitting ? 0.6 : 1,
          }}>
            {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
          </button>
        </form>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--color-slate-medium)', marginBottom: '0.4rem',
}

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.85rem',
  fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
}
