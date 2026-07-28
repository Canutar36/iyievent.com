'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

const durumRenkleri = {
  taslak: { bg: '#F3F4F6', color: '#6B7280', label: 'Taslak' },
  gonderildi: { bg: '#EFF6FF', color: '#2563EB', label: 'Gönderildi' },
  odendi: { bg: '#F0FDF4', color: '#16A34A', label: 'Ödendi' },
  gecikti: { bg: '#FEF2F2', color: '#DC2626', label: 'Gecikti' },
  iptal: { bg: '#F3F4F6', color: '#6B7280', label: 'İptal' },
}

export default function FaturalarPage() {
  const [faturalar, setFaturalar] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [faturaKalemler, setFaturaKalemler] = useState([])
  const [loadingKalemler, setLoadingKalemler] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadFaturalar()
  }, [])

  async function loadFaturalar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('faturalar')
      .select(`
        *,
        etkinlikler!faturalar_etkinlik_id_fkey (ad, tur)
      `)
      .eq('musteri_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setFaturalar(data)
    setLoading(false)
  }

  async function loadFaturaKalemler(faturaId) {
    if (expandedId === faturaId) {
      setExpandedId(null)
      return
    }

    setExpandedId(faturaId)
    setLoadingKalemler(true)

    const { data } = await supabase
      .from('fatura_kalemleri')
      .select('*')
      .eq('fatura_id', faturaId)

    setFaturaKalemler(data || [])
    setLoadingKalemler(false)
  }

  async function handleDownload(fatura) {
    if (!fatura.dosya_yolu) return

    const { data } = await supabase.storage
      .from('belgeler')
      .createSignedUrl(fatura.dosya_yolu, 3600)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  const toplamTutar = faturalar.reduce((sum, f) => sum + (f.toplam_tutar || 0), 0)
  const odenenTutar = faturalar.filter(f => f.durum === 'odendi').reduce((sum, f) => sum + (f.toplam_tutar || 0), 0)
  const bekleyenTutar = toplamTutar - odenenTutar

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
        Faturalarım
      </h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Toplam Tutar', value: `₺${toplamTutar.toLocaleString('tr-TR')}`, color: 'var(--color-slate-deep)' },
          { label: 'Ödenen', value: `₺${odenenTutar.toLocaleString('tr-TR')}`, color: '#16A34A' },
          { label: 'Bekleyen', value: `₺${bekleyenTutar.toLocaleString('tr-TR')}`, color: '#D97706' },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '12px', padding: '1.2rem',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
              color: 'rgba(0,0,0,0.4)', marginBottom: '0.5rem',
            }}>
              {item.label}
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: '1.2rem', fontWeight: 700,
              color: item.color,
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Invoices List */}
      {faturalar.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '3rem',
          border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center',
        }}>
          <i className="fas fa-receipt" style={{ fontSize: '2.5rem', color: 'rgba(0,0,0,0.15)', marginBottom: '1rem' }} />
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
            color: 'rgba(0,0,0,0.4)',
          }}>
            Henüz faturanız bulunmuyor
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faturalar.map(fatura => {
            const durum = durumRenkleri[fatura.durum] || durumRenkleri.taslak
            const isExpanded = expandedId === fatura.id
            return (
              <div key={fatura.id} style={{
                background: 'white', borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden',
              }}>
                <div
                  onClick={() => loadFaturaKalemler(fatura.id)}
                  style={{
                    padding: '1.2rem 1.5rem', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600,
                          color: 'var(--color-slate-deep)',
                        }}>
                          {fatura.fatura_no || `Fatura #${fatura.id.slice(0, 8)}`}
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
                        {fatura.etkinlikler?.ad || 'Etkinlik'} — {new Date(fatura.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 700,
                      color: 'var(--color-slate-deep)',
                    }}>
                      ₺{(fatura.toplam_tutar || 0).toLocaleString('tr-TR')}
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
                    {loadingKalemler ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(0,0,0,0.4)' }}>
                        Yükleniyor...
                      </div>
                    ) : (
                      <>
                        {faturaKalemler.length > 0 && (
                          <table style={{
                            width: '100%', borderCollapse: 'collapse', marginTop: '1rem',
                          }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <th style={{ textAlign: 'left', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Açıklama</th>
                                <th style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Miktar</th>
                                <th style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Tutar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {faturaKalemler.map(kalem => (
                                <tr key={kalem.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                  <td style={{ padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>{kalem.aciklama}</td>
                                  <td style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>{kalem.miktar}</td>
                                  <td style={{ textAlign: 'right', padding: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600 }}>₺{(kalem.tutar || 0).toLocaleString('tr-TR')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                          <div style={{
                            padding: '0.8rem 1.2rem', borderRadius: '8px',
                            background: '#F9FAFB',
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                              color: 'rgba(0,0,0,0.5)',
                            }}>
                              Toplam: {' '}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 700,
                              color: 'var(--color-slate-deep)',
                            }}>
                              ₺{(fatura.toplam_tutar || 0).toLocaleString('tr-TR')}
                            </span>
                          </div>
                        </div>

                        {fatura.dosya_yolu && (
                          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDownload(fatura)}
                              style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                background: 'var(--color-slate-deep)', color: 'var(--color-cream)',
                                border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                              }}
                            >
                              <i className="fas fa-download" style={{ fontSize: '0.7rem' }} />
                              Fatura İndir
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
