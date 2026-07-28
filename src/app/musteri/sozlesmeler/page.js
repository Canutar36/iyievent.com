'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

const durumRenkleri = {
  taslak: { bg: '#F3F4F6', color: '#6B7280', label: 'Taslak', icon: 'fas fa-file' },
  gonderildi: { bg: '#EFF6FF', color: '#2563EB', label: 'Gönderildi', icon: 'fas fa-paper-plane' },
  imzalandi: { bg: '#F0FDF4', color: '#16A34A', label: 'İmzalandı', icon: 'fas fa-signature' },
  iptal: { bg: '#FEF2F2', color: '#DC2626', label: 'İptal', icon: 'fas fa-times' },
}

export default function SozlesmelerPage() {
  const [sozlesmeler, setSozlesmeler] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadSozlesmeler()
  }, [])

  async function loadSozlesmeler() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('sozlesmeler')
      .select(`
        *,
        etkinlikler!sozlesmeler_etkinlik_id_fkey (ad, tur, tarih)
      `)
      .eq('musteri_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setSozlesmeler(data)
    setLoading(false)
  }

  async function handleDownload(sozlesme) {
    if (!sozlesme.dosya_yolu) return

    const { data } = await supabase.storage
      .from('belgeler')
      .createSignedUrl(sozlesme.dosya_yolu, 3600)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.8rem',
        color: 'var(--color-slate-deep)', marginBottom: '2rem',
      }}>
        Sözleşmelerim
      </h1>

      {sozlesmeler.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '3rem',
          border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center',
        }}>
          <i className="fas fa-file-contract" style={{ fontSize: '2.5rem', color: 'rgba(0,0,0,0.15)', marginBottom: '1rem' }} />
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
            color: 'rgba(0,0,0,0.4)',
          }}>
            Henüz sözleşmeniz bulunmuyor
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sozlesmeler.map(sozlesme => {
            const durum = durumRenkleri[sozlesme.durum] || durumRenkleri.taslak
            return (
              <div key={sozlesme.id} style={{
                background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: durum.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <i className={durum.icon} style={{ color: durum.color, fontSize: '1rem' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600,
                        color: 'var(--color-slate-deep)',
                      }}>
                        {sozlesme.ad || 'Sözleşme'}
                      </span>
                      <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: '10px',
                        background: durum.bg, color: durum.color,
                        fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 600,
                      }}>
                        {durum.label}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                      color: 'rgba(0,0,0,0.4)',
                    }}>
                      {sozlesme.etkinlikler?.ad || 'Etkinlik'} — {sozlesme.etkinlikler?.tur || ''}
                      {sozlesme.imza_tarihi && (
                        <span> — İmza: {new Date(sozlesme.imza_tarihi).toLocaleDateString('tr-TR')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {sozlesme.dosya_yolu && (
                    <button
                      onClick={() => handleDownload(sozlesme)}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '8px',
                        background: 'var(--color-slate-deep)', color: 'var(--color-cream)',
                        border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                      }}
                    >
                      <i className="fas fa-download" style={{ fontSize: '0.7rem' }} />
                      İndir
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
