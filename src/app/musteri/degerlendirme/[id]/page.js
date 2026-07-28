'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DegerlendirmePage() {
  const params = useParams()
  const router = useRouter()
  const [etkinlik, setEtkinlik] = useState(null)
  const [mevcutDegerlendirme, setMevcutDegerlendirme] = useState(null)
  const [puan, setPuan] = useState(0)
  const [hoverPuan, setHoverPuan] = useState(0)
  const [yorum, setYorum] = useState('')
  const [yayinla, setYayinla] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: etkinlikData } = await supabase
      .from('etkinlikler')
      .select('*')
      .eq('id', params.id)
      .eq('musteri_id', user.id)
      .single()

    if (etkinlikData) setEtkinlik(etkinlikData)

    const { data: degerlendirmeData } = await supabase
      .from('degerlendirmeler')
      .select('*')
      .eq('etkinlik_id', params.id)
      .eq('musteri_id', user.id)
      .single()

    if (degerlendirmeData) {
      setMevcutDegerlendirme(degerlendirmeData)
      setPuan(degerlendirmeData.puan || 0)
      setYorum(degerlendirmeData.yorum || '')
      setYayinla(degerlendirmeData.yayinla || false)
    }

    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()

    if (puan === 0) {
      toast.error('Lütfen bir puan seçin')
      return
    }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (mevcutDegerlendirme) {
      const { error } = await supabase
        .from('degerlendirmeler')
        .update({ puan, yorum, yayinla })
        .eq('id', mevcutDegerlendirme.id)

      if (error) {
        toast.error('Değerlendirme güncellenirken hata oluştu')
      } else {
        toast.success('Değerlendirme güncellendi')
        router.push('/musteri/etkinlikler')
      }
    } else {
      const { error } = await supabase
        .from('degerlendirmeler')
        .insert({
          etkinlik_id: params.id,
          musteri_id: user.id,
          puan,
          yorum,
          yayinla,
        })

      if (error) {
        toast.error('Değerlendirme kaydedilirken hata oluştu')
      } else {
        toast.success('Değerlendirmeniz kaydedildi')
        router.push('/musteri/etkinlikler')
      }
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '12px' }} />
        <style>{`
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
            border-radius: 4px;
          }
          @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    )
  }

  if (!etkinlik) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'rgba(0,0,0,0.5)' }}>Etkinlik bulunamadı</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => router.back()}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
          color: 'rgba(0,0,0,0.4)', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}
      >
        <i className="fas fa-arrow-left" /> Geri Dön
      </button>

      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.8rem',
        color: 'var(--color-slate-deep)', marginBottom: '0.5rem',
      }}>
        Değerlendirme
      </h1>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
        color: 'rgba(0,0,0,0.5)', marginBottom: '2rem',
      }}>
        {etkinlik.ad} — {etkinlik.tur}
      </p>

      <div style={{
        background: 'white', borderRadius: '12px', padding: '2rem',
        border: '1px solid rgba(0,0,0,0.05)',
      }}>
        <form onSubmit={handleSave}>
          {/* Star Rating */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <label style={{
              display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.85rem',
              fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
              color: 'var(--color-slate)', marginBottom: '1rem',
            }}>
              Puanınız
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPuan(star)}
                  onMouseEnter={() => setHoverPuan(star)}
                  onMouseLeave={() => setHoverPuan(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '2rem', padding: '0.2rem',
                    color: star <= (hoverPuan || puan) ? '#FBBF24' : '#E5E7EB',
                    transition: 'color 0.15s',
                  }}
                >
                  <i className={star <= (hoverPuan || puan) ? 'fas fa-star' : 'far fa-star'} />
                </button>
              ))}
            </div>
            {puan > 0 && (
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                color: 'rgba(0,0,0,0.4)', marginTop: '0.5rem', display: 'block',
              }}>
                {puan === 1 && 'Kötü'}
                {puan === 2 && 'Ortanın Altı'}
                {puan === 3 && 'Orta'}
                {puan === 4 && 'İyi'}
                {puan === 5 && 'Mükemmel'}
              </span>
            )}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.85rem',
              fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
              color: 'var(--color-slate)', marginBottom: '0.5rem',
            }}>
              Yorumunuz (Opsiyonel)
            </label>
            <textarea
              value={yorum}
              onChange={e => setYorum(e.target.value)}
              rows={4}
              placeholder="Deneyiminizi paylaşın..."
              style={{
                width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)', resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Publish toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            marginBottom: '2rem', padding: '1rem',
            background: '#F9FAFB', borderRadius: '8px',
          }}>
            <button
              type="button"
              onClick={() => setYayinla(!yayinla)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: yayinla ? 'var(--color-orange)' : '#D1D5DB',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: '2px',
                left: yayinla ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
              }} />
            </button>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 500,
                color: 'var(--color-slate-deep)',
              }}>
                Değerlendirmemi herkese açık olarak yayınla
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                color: 'rgba(0,0,0,0.4)',
              }}>
                Yayınlanan değerlendirmeler其他 müşteriler tarafından görülebilir
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '0.8rem', borderRadius: '8px',
            background: 'var(--color-slate-deep)', color: 'var(--color-cream)',
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Kaydediliyor...' : mevcutDegerlendirme ? 'Güncelle' : 'Gönder'}
          </button>
        </form>
      </div>
    </div>
  )
}
