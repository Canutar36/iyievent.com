'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

const durumRenkleri = {
  taslak: { bg: '#F3F4F6', color: '#6B7280', label: 'Taslak' },
  gonderildi: { bg: '#EFF6FF', color: '#2563EB', label: 'Gönderildi' },
  inceleniyor: { bg: '#FEF3C7', color: '#D97706', label: 'İnceleniyor' },
  onaylandi: { bg: '#F0FDF4', color: '#16A34A', label: 'Onaylandı' },
  reddedildi: { bg: '#FEF2F2', color: '#DC2626', label: 'Reddedildi' },
  sure_doldu: { bg: '#F3F4F6', color: '#6B7280', label: 'Süre Doldu' },
}

export default function TekliflerPage() {
  const [teklifler, setTeklifler] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [teklifDetay, setTeklifDetay] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadTeklifler()
  }, [])

  async function loadTeklifler() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('teklifler')
      .select(`
        *,
        etkinlikler!teklifler_etkinlik_id_fkey (ad, tur, tarih)
      `)
      .eq('musteri_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setTeklifler(data)
    setLoading(false)
  }

  async function loadTeklifDetay(teklifId) {
    if (expandedId === teklifId) {
      setExpandedId(null)
      return
    }

    setExpandedId(teklifId)
    setLoadingDetail(true)

    const { data } = await supabase
      .from('teklif_kalemleri')
      .select('*')
      .eq('teklif_id', teklifId)

    setTeklifDetay(data || [])
    setLoadingDetail(false)
  }

  async function handleTeklifDurum(teklifId, durum) {
    const { error } = await supabase
      .from('teklifler')
      .update({ durum })
      .eq('id', teklifId)

    if (!error) {
      setTeklifler(prev =>
        prev.map(t => t.id === teklifId ? { ...t, durum } : t)
      )
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
        Tekliflerim
      </h1>

      {teklifler.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '3rem',
          border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center',
        }}>
          <i className="fas fa-file-invoice-dollar" style={{ fontSize: '2.5rem', color: 'rgba(0,0,0,0.15)', marginBottom: '1rem' }} />
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
            color: 'rgba(0,0,0,0.4)', marginBottom: '1rem',
          }}>
            Henüz teklifiniz bulunmuyor
          </p>
          <Link href="/iletisim" style={{
            display: 'inline-block', padding: '0.6rem 1.5rem',
            background: 'var(--color-orange)', color: 'white',
            borderRadius: '8px', textDecoration: 'none',
            fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600,
          }}>
            Teklif İste
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {teklifler.map(teklif => {
            const durum = durumRenkleri[teklif.durum] || durumRenkleri.taslak
            const isExpanded = expandedId === teklif.id
            return (
              <div key={teklif.id} style={{
                background: 'white', borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden',
              }}>
                <div
                  onClick={() => loadTeklifDetay(teklif.id)}
                  style={{
                    padding: '1.2rem 1.5rem', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600,
                        color: 'var(--color-slate-deep)',
                      }}>
                        {teklif.etkinlikler?.ad || 'Etkinlik'}
                      </span>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '12px',
                        background: durum.bg, color: durum.color,
                        fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600,
                      }}>
                        {durum.label}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                      color: 'rgba(0,0,0,0.4)',
                    }}>
                      {new Date(teklif.created_at).toLocaleDateString('tr-TR')} — {teklif.etkinlikler?.tur || ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 700,
                      color: 'var(--color-slate-deep)',
                    }}>
                      {teklif.toplam_tutar ? `₺${teklif.toplam_tutar.toLocaleString('tr-TR')}` : '-'}
                    </span>
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{
                      color: 'rgba(0,0,0,0.3)', fontSize: '0.8rem',
                    }} />
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    padding: '0 1.5rem 1.5rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                  }}>
                    {loadingDetail ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(0,0,0,0.4)' }}>
                        Yükleniyor...
                      </div>
                    ) : (
                      <>
                        {teklifDetay.length > 0 && (
                          <table style={{
                            width: '100%', borderCollapse: 'collapse', marginTop: '1rem',
                          }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <th style={{ textAlign: 'left', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Hizmet</th>
                                <th style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Miktar</th>
                                <th style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Birim Fiyat</th>
                                <th style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Toplam</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teklifDetay.map(kalem => (
                                <tr key={kalem.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                  <td style={{ padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>{kalem.hizmet_adi}</td>
                                  <td style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>{kalem.miktar}</td>
                                  <td style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>₺{kalem.birim_fiyat?.toLocaleString('tr-TR')}</td>
                                  <td style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600 }}>₺{kalem.toplam?.toLocaleString('tr-TR')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {teklif.notlar && (
                          <div style={{
                            marginTop: '1rem', padding: '0.8rem',
                            background: '#F9FAFB', borderRadius: '8px',
                            fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                            color: 'rgba(0,0,0,0.6)',
                          }}>
                            <strong>Notlar:</strong> {teklif.notlar}
                          </div>
                        )}

                        {teklif.durum === 'gonderildi' && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTeklifDurum(teklif.id, 'onaylandi') }}
                              style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                background: '#16A34A', color: 'white', border: 'none',
                                cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                              }}
                            >
                              Onayla
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTeklifDurum(teklif.id, 'reddedildi') }}
                              style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                background: '#DC2626', color: 'white', border: 'none',
                                cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                              }}
                            >
                              Reddet
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
