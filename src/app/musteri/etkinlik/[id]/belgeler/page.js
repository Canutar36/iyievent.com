'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function BelgelerPage({ params }) {
  const { id: etkinlikId } = use(params)
  const [belgeler, setBelgeler] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const fetchBelgeler = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('belgeler')
      .select('*')
      .eq('etkinlik_id', etkinlikId)
      .order('created_at', { ascending: false })
    
    setBelgeler(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchBelgeler()
  }, [etkinlikId])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // 1. Dosyayı Supabase Storage'a yükle (belgeler bucket'ına)
      const fileExt = file.name.split('.').pop()
      const fileName = `${etkinlikId}/islak_imza_${Date.now()}.${fileExt}`
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('belgeler')
        .upload(fileName, file)

      if (storageError) throw storageError

      // 2. Belge kaydını veritabanına ekle
      const { error: dbError } = await supabase
        .from('belgeler')
        .insert({
          etkinlik_id: etkinlikId,
          ad: 'İmzalı Sözleşme / Islak İmza',
          aciklama: 'Müşteri tarafından imzalanıp yüklenen sözleşme nüshası.',
          tur: 'islak_imza',
          dosya_yolu: storageData.path,
          dosya_boyutu: file.size,
          dosya_turu: file.type,
          durum: 'yuklendi',
          yukleyen_rol: 'musteri',
        })

      if (dbError) throw dbError

      fetchBelgeler()
    } catch (err) {
      alert('Yükleme hatası: ' + err.message)
    }
    setUploading(false)
  }

  const handleDownload = async (path, name) => {
    const { data, error } = await supabase.storage
      .from('belgeler')
      .download(path)

    if (error) {
      alert('Dosya indirilemedi: ' + error.message)
      return
    }

    const url = window.URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="belgeler-grid">
      {/* Sol Sütun: Belgeler Listesi */}
      <div>
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-slate)', marginBottom: '1.5rem' }}>
            Hizmet Sözleşmeleri & Belgeler
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-medium)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Organizasyonunuza ait tüm kanuni sözleşmeler, şartnameler ve faturalar bu alanda yer alır. İmzalamanız gereken sözleşmeleri indirip imzaladıktan sonra sağ taraftaki alandan sisteme geri yükleyebilirsiniz.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-slate-medium)' }}>Belgeler yükleniyor...</div>
          ) : belgeler.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-slate-medium)', border: '1px dashed var(--color-cream-dark)' }}>
              Henüz bir belge yüklenmedi.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {belgeler.map(doc => (
                <div key={doc.id} style={{
                  padding: '1.5rem', border: '1px solid var(--color-cream-dark)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--color-cream-light)',
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                      width: '40px', height: '40px', background: 'var(--color-orange-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-orange)', fontSize: '1.1rem',
                    }}>
                      <i className={doc.tur === 'sozlesme' ? 'fas fa-file-signature' : 'fas fa-file-alt'} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-slate)' }}>{doc.ad}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}>
                        {doc.aciklama || 'Açıklama belirtilmedi.'}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--color-slate-medium)' }}>
                        <span>Boyut: {(doc.dosya_boyutu / 1024 / 1024).toFixed(2)} MB</span>
                        <span>Yükleme: {new Date(doc.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      fontSize: '0.7rem', fontFamily: 'var(--font-display)', fontWeight: 700,
                      letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.3rem 0.6rem',
                      background: doc.durum === 'onaylandi' ? '#D1FAE5' : doc.durum === 'yuklendi' ? '#DBEAFE' : '#FEF3C7',
                      color: doc.durum === 'onaylandi' ? '#059669' : doc.durum === 'yuklendi' ? '#1D4ED8' : '#D97706',
                    }}>{doc.durum}</span>
                    <button onClick={() => handleDownload(doc.dosya_yolu, doc.ad)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-orange)', fontSize: '1rem', padding: '0.5rem',
                    }}>
                      <i className="fas fa-download" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Sütun: Belge Yükleme */}
      <div>
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-slate)', marginBottom: '1rem' }}>
            Islak İmza Yükle
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Bilgisayarınıza indirdiğiniz sözleşmeyi imzaladıktan sonra taratarak veya net bir fotoğrafını çekerek buradan PDF, JPG veya PNG formatında yükleyebilirsiniz.
          </p>
          <div style={{
            border: '2px dashed var(--color-cream-dark)',
            padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer',
            background: 'var(--color-cream-light)',
            position: 'relative',
          }}>
            <input
              type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} disabled={uploading}
              style={{
                position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer',
              }}
            />
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: 'var(--color-orange)', opacity: 0.6, marginBottom: '1rem', display: 'block' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)', display: 'block', marginBottom: '0.3rem' }}>
              {uploading ? 'Yükleniyor...' : 'Dosya Seçin veya Sürükleyin'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-medium)' }}>
              PDF, PNG, JPG (Maks 10MB)
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .belgeler-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
