'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function OdemePage({ params }) {
  const { id: etkinlikId } = use(params)
  const [odemeler, setOdemeler] = useState([])
  const [loading, setLoading] = useState(true)
  const [iframeUrl, setIframeUrl] = useState('')
  const [odemeBaslatiliyor, setOdemeBaslatiliyor] = useState(false)
  const supabase = createClient()

  const fetchOdemeler = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('odemeler')
      .select('*')
      .eq('etkinlik_id', etkinlikId)
      .order('created_at', { ascending: true })

    setOdemeler(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOdemeler()
  }, [etkinlikId])

  const handlePayTRInit = async (odemeId, tutar) => {
    setOdemeBaslatiliyor(true)
    setIframeUrl('')

    try {
      const response = await fetch('/api/odeme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etkinlikId: etkinlikId,
          odemeId: odemeId,
          tutar: tutar,
        }),
      })

      const data = await response.json()
      if (data.success && data.iframeUrl) {
        setIframeUrl(data.iframeUrl)
      } else {
        alert('PayTR başlatma hatası: ' + (data.error || 'Bilinmeyen hata'))
      }
    } catch (err) {
      alert('Sistem hatası: ' + err.message)
    }
    setOdemeBaslatiliyor(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="odemeler-grid">
      {/* Sol Sütun: Ödeme Planı / Geçmişi */}
      <div>
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-slate)', marginBottom: '1.5rem' }}>
            Ödeme Takvimi & Planı
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-medium)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Etkinliğinize ait ödeme taksitlerini ve geçmiş ödeme makbuzlarınızı bu sayfadan takip edebilirsiniz. Ödemelerinizi PayTR güvencesiyle 3D Secure kullanarak kredi kartınızla gerçekleştirebilirsiniz.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-slate-medium)' }}>Yükleniyor...</div>
          ) : odemeler.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-slate-medium)', border: '1px dashed var(--color-cream-dark)' }}>
              Henüz bir ödeme planı tanımlanmadı. Danışmanınız en kısa sürede ekleyecektir.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {odemeler.map(pay => (
                <div key={pay.id} style={{
                  padding: '1.5rem', border: '1px solid var(--color-cream-dark)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--color-cream-light)',
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 600, color: 'var(--color-slate)' }}>
                      {pay.aciklama || 'Hizmet Ödemesi'}
                    </h4>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-slate)' }}>
                      {pay.tutar.toLocaleString('tr-TR')} ₺
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-medium)', marginLeft: '1rem' }}>
                      Oluşturulma: {new Date(pay.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700,
                      letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.3rem 0.6rem',
                      background: pay.durum === 'tamamlandi' ? '#D1FAE5' : pay.durum === 'basarisiz' ? '#FEE2E2' : '#FEF3C7',
                      color: pay.durum === 'tamamlandi' ? '#059669' : pay.durum === 'basarisiz' ? '#DC2626' : '#D97706',
                    }}>{pay.durum}</span>

                    {pay.durum !== 'tamamlandi' && (
                      <button
                        onClick={() => handlePayTRInit(pay.id, pay.tutar)}
                        disabled={odemeBaslatiliyor}
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.78rem' }}
                      >
                        Öde
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Sütun: PayTR Iframe */}
      <div>
        <div style={{
          background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2rem',
          minHeight: '450px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
        }}>
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              style={{ width: '100%', height: '550px', border: 'none' }}
              scrolling="no"
            />
          ) : (
            <div>
              <i className="fas fa-shield-alt" style={{ fontSize: '2.5rem', color: 'var(--color-orange)', opacity: 0.6, marginBottom: '1.5rem' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.8rem' }}>
                Güvenli Ödeme Ekranı
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto 1.5rem' }}>
                Ödeme planından bir taksit seçip "Öde" butonuna bastığınızda, SSL korumalı PayTR iframe ekranı burada yüklenecektir.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', opacity: 0.4 }}>
                <i className="fab fa-cc-visa" style={{ fontSize: '1.8rem' }} />
                <i className="fab fa-cc-mastercard" style={{ fontSize: '1.8rem' }} />
                <i className="fas fa-lock" style={{ fontSize: '1.5rem', marginTop: '0.15rem' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .odemeler-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
