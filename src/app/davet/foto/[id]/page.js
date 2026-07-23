'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Logo } from '@/components/Logo'

export default function GuestPhotoUploadPage({ params }) {
  const { id: etkinlikId } = use(params)
  const [etkinlik, setEtkinlik] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adSoyad, setAdSoyad] = useState('')
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchEtkinlik = async () => {
      // UUID ile etkinlik detayını çek (halka açık)
      const { data } = await supabase
        .from('etkinlikler')
        .select('ad, tur, tarih')
        .eq('id', etkinlikId)
        .single()
      
      setEtkinlik(data)
      setLoading(false)
    }
    fetchEtkinlik()
  }, [etkinlikId])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      let completed = 0

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${etkinlikId}/guest_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        
        // 1. Storage'a yükle (galeri isimli bucket'a)
        const { data: storageData, error: storageError } = await supabase.storage
          .from('galeri')
          .upload(fileName, file)

        if (storageError) throw storageError

        // 2. DB'ye kaydet
        const { error: dbError } = await supabase
          .from('etkinlik_gorselleri')
          .insert({
            etkinlik_id: etkinlikId,
            dosya_yolu: storageData.path,
            dosya_adi: file.name,
            yukleyen_tip: 'misafir',
            yukleyen_ad: adSoyad || 'Anonim Davetli',
          })

        if (dbError) throw dbError

        completed++
        setProgress(Math.round((completed / files.length) * 100))
      }

      setSuccess(true)
    } catch (err) {
      alert('Yükleme hatası: ' + err.message)
    }
    setUploading(false)
  }

  const inputStyle = {
    fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
    color: 'var(--color-slate)',
    background: 'var(--color-cream-light)',
    border: '1px solid var(--color-cream-dark)',
    padding: '0.9rem 1.1rem',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>
          Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-cream)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Logo height={38} />
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', padding: '3rem',
          border: '1px solid var(--color-cream-dark)',
          boxShadow: '0 8px 40px rgba(42,53,56,0.06)',
        }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{
                width: '64px', height: '64px', background: 'var(--color-orange-light)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-orange)', fontSize: '1.5rem', margin: '0 auto 1.5rem',
              }}>
                <i className="fas fa-check" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--color-slate)', marginBottom: '0.8rem' }}>Teşekkür Ederiz!</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-medium)', lineHeight: 1.6 }}>
                Fotoğraflarınız başarıyla yüklendi ve albüme eklendi.
              </p>
              <button onClick={() => { setSuccess(false); setFiles([]); setProgress(0) }} className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                Daha Fazla Yükle
              </button>
            </div>
          ) : (
            <>
              {/* Event Info */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-orange)' }}>
                  {etkinlik?.tur || 'Etkinlik Anıları'}
                </span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400, color: 'var(--color-slate)', margin: '0.3rem 0 0.5rem' }}>
                  {etkinlik?.ad || 'iyi event Davetlisi'}
                </h2>
                {etkinlik?.tarih && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)', margin: 0 }}>
                    {new Date(etkinlik.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-medium)' }}>Adınız Soyadınız (Opsiyonel)</label>
                  <input
                    type="text" value={adSoyad} onChange={e => setAdSoyad(e.target.value)}
                    placeholder="Misafir Adı" style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-medium)' }}>Fotoğrafları Seçin</label>
                  <div style={{
                    border: '2px dashed var(--color-cream-dark)',
                    padding: '2.5rem 1rem', textAlign: 'center', cursor: 'pointer',
                    background: 'var(--color-cream-light)', position: 'relative',
                  }}>
                    <input
                      type="file" multiple accept="image/*" disabled={uploading}
                      onChange={e => setFiles(Array.from(e.target.files || []))}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                    <i className="fas fa-images" style={{ fontSize: '2.2rem', color: 'var(--color-orange)', opacity: 0.6, marginBottom: '0.8rem', display: 'block' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate)', display: 'block' }}>
                      {files.length > 0 ? `${files.length} fotoğraf seçildi` : 'Dosyaları Seçin'}
                    </span>
                  </div>
                </div>

                {uploading && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-slate-medium)', marginBottom: '0.3rem' }}>
                      <span>Yükleniyor...</span>
                      <span>%{progress}</span>
                    </div>
                    <div style={{ background: 'var(--color-cream)', height: '4px', width: '100%' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-orange)', transition: 'width 0.2s' }} />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={files.length === 0 || uploading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                  {uploading ? 'Yükleniyor...' : 'Anıları Paylaş'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
