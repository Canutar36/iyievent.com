'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function DavetiyelerPage({ params }) {
  const { id: etkinlikId } = use(params)
  const [misafirler, setMisafirler] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [gonderimKanali, setGonderimKanali] = useState('email') // 'email' | 'sms' | 'her_ikisi'
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [gonderimMesaj, setGonderimMesaj] = useState('')

  // Ekleme formu state
  const [adSoyad, setAdSoyad] = useState('')
  const [email, setEmail] = useState('')
  const [telefon, setTelefon] = useState('')
  const [grup, setGrup] = useState('Genel')
  const [eklemeLoading, setEklemeLoading] = useState(false)

  const supabase = createClient()

  const fetchMisafirler = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('misafirler')
      .select('*')
      .eq('etkinlik_id', etkinlikId)
      .order('created_at', { ascending: false })
    
    setMisafirler(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMisafirler()
  }, [etkinlikId])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(misafirler.map(m => m.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id))
    }
  }

  const handleAddGuest = async (e) => {
    e.preventDefault()
    if (!adSoyad) return

    setEklemeLoading(true)
    const { error } = await supabase
      .from('misafirler')
      .insert({
        etkinlik_id: etkinlikId,
        ad_soyad: adSoyad,
        email: email || null,
        telefon: telefon || null,
        grup: grup,
      })

    if (!error) {
      setAdSoyad('')
      setEmail('')
      setTelefon('')
      setGrup('Genel')
      fetchMisafirler()
    } else {
      alert('Hata: ' + error.message)
    }
    setEklemeLoading(false)
  }

  const handleSendInvitations = async () => {
    if (selectedIds.length === 0) return

    setGonderiliyor(true)
    setGonderimMesaj('')

    try {
      const response = await fetch('/api/davetiye', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etkinlikId: etkinlikId,
          misafirIds: selectedIds,
          kanal: gonderimKanali,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setGonderimMesaj(data.mesaj)
        setSelectedIds([])
        fetchMisafirler()
      } else {
        setGonderimMesaj(`Hata: ${data.error}`)
      }
    } catch (err) {
      setGonderimMesaj(`Gönderim hatası: ${err.message}`)
    }
    setGonderiliyor(false)
  }

  // RSVP İstatistikleri
  const total = misafirler.length
  const katilacak = misafirler.filter(m => m.yanit === 'katilacak').length
  const katilmayacak = misafirler.filter(m => m.yanit === 'katilmayacak').length
  const bekliyor = misafirler.filter(m => m.yanit === 'bekliyor').length

  const inputStyle = {
    fontFamily: 'var(--font-sans)', fontSize: '0.88rem',
    padding: '0.6rem 0.8rem', border: '1px solid var(--color-cream-dark)',
    background: 'var(--color-cream-light)', outline: 'none',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="davetiye-grid">
      {/* Sol Sütun: Misafir Listesi */}
      <div>
        {/* İstatistik Çubuğu */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem',
          background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.5rem',
        }} className="rsvp-stats">
          {[
            { label: 'Toplam Davetli', val: total, color: 'var(--color-slate)' },
            { label: 'Katılacak', val: katilacak, color: '#059669' },
            { label: 'Katılamayacak', val: katilmayacak, color: '#DC2626' },
            { label: 'Yanıt Bekleyen', val: bekliyor, color: 'var(--color-orange)' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-medium)', display: 'block', marginBottom: '0.3rem' }}>{stat.label}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 500, color: stat.color }}>{stat.val}</span>
            </div>
          ))}
        </div>

        {/* Gönderim Kontrolleri */}
        {selectedIds.length > 0 && (
          <div style={{
            background: 'var(--color-orange-light)', border: '1px solid rgba(240,90,40,0.2)',
            padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)' }}>
              {selectedIds.length} misafir seçildi.
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select
                value={gonderimKanali} onChange={e => setGonderimKanali(e.target.value)}
                style={{ ...inputStyle, background: '#fff' }}
              >
                <option value="email">E-posta ile Gönder</option>
                <option value="sms">SMS ile Gönder</option>
                <option value="her_ikisi">Hem E-posta Hem SMS</option>
              </select>
              <button onClick={handleSendInvitations} disabled={gonderiliyor} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                {gonderiliyor ? 'Gönderiliyor...' : 'Davetiye Gönder'}
              </button>
            </div>
          </div>
        )}

        {gonderimMesaj && (
          <div style={{
            background: 'var(--color-cream-light)', border: '1px solid var(--color-cream-dark)',
            padding: '1rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--color-slate)',
          }}>{gonderimMesaj}</div>
        )}

        {/* Liste Tablosu */}
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>Misafir listesi yükleniyor...</div>
          ) : misafirler.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)' }}>
              Henüz misafir eklenmedi. Sağdaki formu kullanarak misafir ekleyebilirsiniz.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--color-cream)', borderBottom: '1px solid var(--color-cream-dark)' }}>
                  <th style={{ padding: '1rem', width: '40px' }}>
                    <input type="checkbox" checked={selectedIds.length === misafirler.length} onChange={handleSelectAll} />
                  </th>
                  <th style={{ padding: '1rem', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>Ad Soyad</th>
                  <th style={{ padding: '1rem', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>İletişim</th>
                  <th style={{ padding: '1rem', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>Grup</th>
                  <th style={{ padding: '1rem', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>Davetiye</th>
                  <th style={{ padding: '1rem', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>L.C.P. / Yanıt</th>
                </tr>
              </thead>
              <tbody>
                {misafirler.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
                    <td style={{ padding: '1rem' }}>
                      <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={e => handleSelectOne(m.id, e.target.checked)} />
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate)' }}>{m.ad_soyad}</td>
                    <td style={{ padding: '1rem', fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>
                      {m.email && <div><i className="far fa-envelope" style={{ marginRight: '0.4rem' }} />{m.email}</div>}
                      {m.telefon && <div style={{ marginTop: '0.2rem' }}><i className="fas fa-phone-alt" style={{ marginRight: '0.4rem' }} />{m.telefon}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', background: 'var(--color-cream)', padding: '0.2rem 0.5rem', color: 'var(--color-slate)' }}>{m.grup}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {m.davetiye_gonderildi ? (
                        <span style={{ fontSize: '0.82rem', color: '#059669' }}>
                          <i className="fas fa-check-circle" style={{ marginRight: '0.3rem' }} />
                          Gönderildi
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>Gönderilmedi</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
                        color: m.yanit === 'katilacak' ? '#059669' : m.yanit === 'katilmayacak' ? '#DC2626' : 'var(--color-orange)',
                      }}>{m.yanit === 'bekliyor' ? 'Yanıt Yok' : m.yanit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Sağ Sütun: Misafir Ekleme Formu */}
      <div>
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 500, color: 'var(--color-slate)', marginBottom: '1.5rem' }}>Yeni Davetli Ekle</h3>
          <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-medium)' }}>Ad Soyad</label>
              <input type="text" required value={adSoyad} onChange={e => setAdSoyad(e.target.value)} style={inputStyle} placeholder="Davetli Adı" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-medium)' }}>E-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="E-posta adresi" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-medium)' }}>Telefon</label>
              <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} style={inputStyle} placeholder="5XXXXXXXXX" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-medium)' }}>Grup / Kategori</label>
              <select value={grup} onChange={e => setGrup(e.target.value)} style={inputStyle}>
                <option value="Genel">Genel</option>
                <option value="Aile">Aile</option>
                <option value="Arkadaş">Arkadaş</option>
                <option value="İş">İş / Kurumsal</option>
              </select>
            </div>
            <button type="submit" disabled={eklemeLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {eklemeLoading ? 'Ekleniyor...' : 'Davetli Ekle'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .davetiye-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
