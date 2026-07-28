'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

const VIDEO_EXT = ['mp4', 'mov', 'avi', 'webm', 'mkv']

function isVideo(dosyaAdi) {
  if (!dosyaAdi) return false
  const ext = dosyaAdi.split('.').pop().toLowerCase()
  return VIDEO_EXT.includes(ext)
}

export default function GorsellerPage() {
  const [etkinlikler, setEtkinlikler] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [gorseller, setGorseller] = useState({})
  const [loadingGorsel, setLoadingGorsel] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const supabase = createClient()

  useEffect(() => {
    loadEtkinlikler()
  }, [])

  async function loadEtkinlikler() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('etkinlikler')
      .select('id, ad, tur, tarih')
      .eq('musteri_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setEtkinlikler(data)
    setLoading(false)
  }

  async function loadGorseller(etkinlikId) {
    if (expandedId === etkinlikId) {
      setExpandedId(null)
      return
    }

    setExpandedId(etkinlikId)

    if (gorseller[etkinlikId]) return

    setLoadingGorsel(true)
    const { data } = await supabase
      .from('etkinlik_gorselleri')
      .select('*')
      .eq('etkinlik_id', etkinlikId)
      .eq('yukleyen_tip', 'admin')
      .order('created_at', { ascending: false })

    if (data) setGorseller(prev => ({ ...prev, [etkinlikId]: data }))
    setLoadingGorsel(false)
  }

  function getPublicUrl(path) {
    const { data } = supabase.storage.from('galeri').getPublicUrl(path)
    return data.publicUrl
  }

  function handleDownload(url, ad) {
    const a = document.createElement('a')
    a.href = url
    a.download = ad || 'gorsel'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function toplamGorselSayisi() {
    return Object.values(gorseller).reduce((sum, arr) => sum + arr.length, 0)
  }

  if (loading) {
    return (
      <div>
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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--color-orange)', marginBottom: '0.4rem',
        }}>Görselleriniz</p>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400,
          color: 'var(--color-slate)', margin: 0,
        }}>Fotoğraf & Video Galerisi</h1>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '0.88rem',
          color: 'var(--color-slate-medium)', marginTop: '0.5rem',
        }}>
          Etkinliklerinize ait fotoğraf ve videolarınızı buradan görüntüleyebilir ve indirebilirsiniz.
        </p>
      </div>

      {/* Empty State */}
      {etkinlikler.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '4rem 2rem',
          border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center',
        }}>
          <i className="fas fa-images" style={{ fontSize: '3rem', color: 'rgba(0,0,0,0.1)', marginBottom: '1rem' }} />
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'rgba(0,0,0,0.4)' }}>
            Henüz etkinliğiniz bulunmuyor
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {etkinlikler.map(etkinlik => {
            const isExpanded = expandedId === etkinlik.id
            const etkinlikGorselleri = gorseller[etkinlik.id] || []
            const fotograflar = etkinlikGorselleri.filter(g => !isVideo(g.dosya_adi))
            const videolar = etkinlikGorselleri.filter(g => isVideo(g.dosya_adi))

            return (
              <div key={etkinlik.id} style={{
                background: 'white', borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden',
              }}>
                {/* Etkinlik Başlık */}
                <div
                  onClick={() => loadGorseller(etkinlik.id)}
                  style={{
                    padding: '1.2rem 1.5rem', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: 'var(--color-orange-light)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="fas fa-images" style={{ color: 'var(--color-orange)', fontSize: '1rem' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-slate-deep)' }}>
                        {etkinlik.ad}
                      </div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)' }}>
                        {etkinlik.tur}
                        {etkinlik.tarih && ` — ${new Date(etkinlik.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {isExpanded && loadingGorsel && (
                      <i className="fas fa-spinner fa-spin" style={{ color: 'var(--color-orange)' }} />
                    )}
                    {isExpanded && !loadingGorsel && (
                      <span style={{
                        fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)',
                      }}>
                        {etkinlikGorselleri.length} medya
                      </span>
                    )}
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{
                      color: 'rgba(0,0,0,0.3)', fontSize: '0.8rem',
                    }} />
                  </div>
                </div>

                {/* Medya İçeriği */}
                {isExpanded && (
                  <div style={{
                    padding: '0 1.5rem 1.5rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                  }}>
                    {loadingGorsel ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(0,0,0,0.4)' }}>
                        Medyalar yükleniyor...
                      </div>
                    ) : etkinlikGorselleri.length === 0 ? (
                      <div style={{
                        padding: '3rem 2rem', textAlign: 'center', color: 'rgba(0,0,0,0.3)',
                        border: '1px dashed rgba(0,0,0,0.1)', marginTop: '1rem',
                      }}>
                        <i className="fas fa-camera" style={{ fontSize: '2rem', marginBottom: '0.8rem', display: 'block' }} />
                        Bu etkinlik için henüz medya yüklenmemiş
                      </div>
                    ) : (
                      <>
                        {/* Fotoğraflar */}
                        {fotograflar.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{
                              fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
                              letterSpacing: '0.1em', textTransform: 'uppercase',
                              color: 'rgba(0,0,0,0.4)', marginBottom: '0.8rem',
                            }}>
                              Fotoğraflar ({fotograflar.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.8rem' }}>
                              {fotograflar.map(gorsel => {
                                const url = getPublicUrl(gorsel.dosya_yolu)
                                return (
                                  <div key={gorsel.id} style={{
                                    position: 'relative', height: '150px', borderRadius: '8px',
                                    overflow: 'hidden', cursor: 'pointer',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                  }}>
                                    <img
                                      src={url}
                                      alt={gorsel.dosya_adi}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onClick={() => setLightbox(url)}
                                    />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDownload(url, gorsel.dosya_adi) }}
                                      style={{
                                        position: 'absolute', bottom: '0.4rem', right: '0.4rem',
                                        width: '28px', height: '28px', borderRadius: '6px',
                                        background: 'rgba(0,0,0,0.6)', color: 'white',
                                        border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', opacity: 0, transition: 'opacity 0.2s',
                                      }}
                                      className="download-btn"
                                    >
                                      <i className="fas fa-download" />
                                    </button>
                                    <style>{`
                                      div:hover > .download-btn { opacity: 1 !important; }
                                    `}</style>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Videolar */}
                        {videolar.length > 0 && (
                          <div>
                            <h3 style={{
                              fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
                              letterSpacing: '0.1em', textTransform: 'uppercase',
                              color: 'rgba(0,0,0,0.4)', marginBottom: '0.8rem',
                            }}>
                              Videolar ({videolar.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.8rem' }}>
                              {videolar.map(gorsel => {
                                const url = getPublicUrl(gorsel.dosya_yolu)
                                return (
                                  <div key={gorsel.id} style={{
                                    position: 'relative', borderRadius: '8px',
                                    overflow: 'hidden', background: '#000',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                  }}>
                                    <video
                                      src={url}
                                      controls
                                      style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                      padding: '0.5rem 0.8rem', display: 'flex',
                                      justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                      <span style={{
                                        fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                                        color: 'rgba(0,0,0,0.5)', overflow: 'hidden',
                                        textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px',
                                      }}>
                                        {gorsel.dosya_adi}
                                      </span>
                                      <button
                                        onClick={() => handleDownload(url, gorsel.dosya_adi)}
                                        style={{
                                          background: 'none', border: 'none', cursor: 'pointer',
                                          color: 'var(--color-orange)', fontSize: '0.8rem',
                                        }}
                                      >
                                        <i className="fas fa-download" />
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
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

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 6000,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', cursor: 'pointer',
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              background: 'none', border: 'none', color: 'white',
              fontSize: '1.5rem', cursor: 'pointer',
            }}
          >
            <i className="fas fa-times" />
          </button>
          <img
            src={lightbox}
            alt="Büyük Görsel"
            style={{ maxWidth: '90%', maxHeight: '85vh', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  )
}
