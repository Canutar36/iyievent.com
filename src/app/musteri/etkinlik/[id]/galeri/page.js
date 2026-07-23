'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function GaleriPage({ params }) {
  const { id: etkinlikId } = use(params)
  const [gorseller, setGorseller] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('admin') // 'admin' | 'misafir'
  const [lightbox, setLightbox] = useState(null)
  
  // Müşterinin kendisinin yükleme yapması için state
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const fetchGorseller = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('etkinlik_gorselleri')
      .select('*')
      .eq('etkinlik_id', etkinlikId)
      .order('created_at', { ascending: false })
    
    setGorseller(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchGorseller()
  }, [etkinlikId])

  const handleMusteriUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${etkinlikId}/admin_${Date.now()}.${fileExt}`
      
      // Müşteri de 'admin/iyi event seçimi' kategorisine yüklesin
      const { data: storageData, error: storageError } = await supabase.storage
        .from('galeri')
        .upload(fileName, file)

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('etkinlik_gorselleri')
        .insert({
          etkinlik_id: etkinlikId,
          dosya_yolu: storageData.path,
          dosya_adi: file.name,
          yukleyen_tip: 'admin',
          yukleyen_ad: 'Müşteri (Ev Sahibi)',
        })

      if (dbError) throw dbError

      fetchGorseller()
    } catch (err) {
      alert('Yükleme hatası: ' + err.message)
    }
    setUploading(false)
  }

  const filtered = gorseller.filter(g => g.yukleyen_tip === activeTab)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/davet/foto/${etkinlikId}`
  // QR Code CDN URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}`

  // Storage'dan public URL al (galeri public bucket olmalı)
  const getImageUrl = (path) => {
    const { data } = supabase.storage.from('galeri').getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '2rem' }} className="galeri-grid">
      {/* Sol Sütun: Görsel Galerisi */}
      <div>
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2.5rem' }}>
          {/* İç Tablar */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-cream-dark)', marginBottom: '2rem' }}>
            <button onClick={() => setActiveTab('admin')} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.8rem 1rem',
              fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: activeTab === 'admin' ? 'var(--color-orange)' : 'var(--color-slate-medium)',
              borderBottom: activeTab === 'admin' ? '2px solid var(--color-orange)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.25s',
            }}>
              Bizim Seçtiklerimiz
            </button>
            <button onClick={() => setActiveTab('misafir')} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.8rem 1rem',
              fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: activeTab === 'misafir' ? 'var(--color-orange)' : 'var(--color-slate-medium)',
              borderBottom: activeTab === 'misafir' ? '2px solid var(--color-orange)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.25s',
            }}>
              Davetlilerin Anıları ({gorseller.filter(g => g.yukleyen_tip === 'misafir').length})
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate-medium)' }}>Fotoğraflar yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-slate-medium)', border: '1px dashed var(--color-cream-dark)' }}>
              {activeTab === 'admin' 
                ? 'Henüz fotoğraf yüklenmedi. Ekibimiz en seçkin anları yakında buraya ekleyecektir.'
                : 'Davetlileriniz henüz fotoğraf yüklemedi. Sağdaki QR kodu paylaşarak anıları toplamaya başlayabilirsiniz!'}
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem',
            }}>
              {filtered.map(img => {
                const url = getImageUrl(img.dosya_yolu)
                return (
                  <div key={img.id} onClick={() => setLightbox(url)} style={{
                    position: 'relative', height: '180px', overflow: 'hidden', cursor: 'pointer',
                    border: '1px solid var(--color-cream-dark)',
                  }}>
                    <img src={url} alt={img.dosya_adi} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    {activeTab === 'misafir' && (
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.4rem 0.8rem',
                        background: 'rgba(20,26,27,0.7)', color: '#fff', fontSize: '0.75rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        <i className="far fa-user" style={{ marginRight: '0.3rem' }} />
                        {img.yukleyen_ad}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Sütun: QR Kod Paylaşım Kartı & Fotoğraf Yükleme */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* QR Kod */}
        <div style={{ background: 'var(--color-slate-deep)', border: '1px solid rgba(246,243,234,0.06)', padding: '2.5rem', color: 'var(--color-cream)', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '1rem', display: 'block' }}>Davetlileriniz Yüklesin</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--color-cream)', marginBottom: '1.5rem' }}>Anı Toplama Köşesi</h3>
          
          {/* QR Img */}
          <div style={{ background: '#fff', padding: '1rem', display: 'inline-block', marginBottom: '1.5rem', border: '1px solid rgba(246,243,234,0.1)' }}>
            <img src={qrCodeUrl} alt="Fotoğraf Paylaş QR Kod" style={{ width: '160px', height: '160px', display: 'block' }} />
          </div>

          <p style={{ fontSize: '0.82rem', color: 'rgba(246,243,234,0.5)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Bu QR kodu masalara yerleştirerek veya davetlilere linki göndererek herkesin çektiği fotoğrafları anında bu albüme yüklemesini sağlayabilirsiniz.
          </p>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{
            fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-orange)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'var(--color-orange)'}
          >
            Yükleme Linkini Aç <i className="fas fa-external-link-alt" style={{ fontSize: '0.7rem' }} />
          </a>
        </div>

        {/* Fotoğraf Yükle */}
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.8rem' }}>Fotoğraf Yükle</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-medium)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Kendi çektiğiniz seçkin anları da bu albüme ekleyebilirsiniz.
          </p>
          <div style={{
            border: '2px dashed var(--color-cream-dark)',
            padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer',
            background: 'var(--color-cream-light)', position: 'relative',
          }}>
            <input type="file" accept="image/*" onChange={handleMusteriUpload} disabled={uploading} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            <i className="fas fa-camera" style={{ fontSize: '1.5rem', color: 'var(--color-orange)', opacity: 0.6, marginBottom: '0.5rem', display: 'block' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-slate)', display: 'block' }}>
              {uploading ? 'Yükleniyor...' : 'Fotoğraf Seçin'}
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 6000,
          background: 'rgba(20,26,27,0.92)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', animation: 'fadeIn 0.25s ease',
        }} onClick={() => setLightbox(null)}>
          <button style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none',
            color: '#fff', fontSize: '1.8rem', cursor: 'pointer',
          }} onClick={() => setLightbox(null)}>
            <i className="fas fa-times" />
          </button>
          <img src={lightbox} alt="Büyük Görsel" style={{ maxWidth: '90%', maxHeight: '85vh', objectFit: 'contain', border: '1px solid rgba(246,243,234,0.1)' }} />
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @media (max-width: 900px) {
              .galeri-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
