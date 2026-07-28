'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

const turRenkleri = {
  bilgi: { bg: '#EFF6FF', color: '#2563EB', icon: 'fas fa-info-circle' },
  uyari: { bg: '#FEF3C7', color: '#D97706', icon: 'fas fa-exclamation-triangle' },
  basari: { bg: '#F0FDF4', color: '#16A34A', icon: 'fas fa-check-circle' },
  odeme: { bg: '#F5F3FF', color: '#7C3AED', icon: 'fas fa-credit-card' },
  belge: { bg: '#FFF7ED', color: '#EA580C', icon: 'fas fa-file-alt' },
}

export default function BildirimlerPage() {
  const [bildirimler, setBildirimler] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tumu')

  const supabase = createClient()

  useEffect(() => {
    loadBildirimler()
  }, [])

  async function loadBildirimler() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('bildirimler')
      .select('*')
      .eq('kullanici_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setBildirimler(data)
    setLoading(false)
  }

  async function handleMarkAsRead(id) {
    await supabase
      .from('bildirimler')
      .update({ okundu: true })
      .eq('id', id)

    setBildirimler(prev =>
      prev.map(b => b.id === id ? { ...b, okundu: true } : b)
    )
  }

  async function handleMarkAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('bildirimler')
      .update({ okundu: true })
      .eq('kullanici_id', user.id)
      .eq('okundu', false)

    setBildirimler(prev =>
      prev.map(b => ({ ...b, okundu: true }))
    )
  }

  const filteredBildirimler = filter === 'tumu'
    ? bildirimler
    : filter === 'okunmamis'
      ? bildirimler.filter(b => !b.okundu)
      : bildirimler.filter(b => b.tur === filter)

  const okunmamisSayisi = bildirimler.filter(b => !b.okundu).length

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.8rem',
            color: 'var(--color-slate-deep)', marginBottom: '0.3rem',
          }}>
            Bildirimler
          </h1>
          {okunmamisSayisi > 0 && (
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              color: 'var(--color-orange)',
            }}>
              {okunmamisSayisi} okunmamış bildirim
            </span>
          )}
        </div>
        {okunmamisSayisi > 0 && (
          <button onClick={handleMarkAllAsRead} style={{
            padding: '0.5rem 1rem', borderRadius: '8px',
            background: 'transparent', border: '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
            color: 'var(--color-slate)',
          }}>
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'tumu', label: 'Tümü' },
          { key: 'okunmamis', label: 'Okunmamış' },
          { key: 'bilgi', label: 'Bilgi' },
          { key: 'uyari', label: 'Uyarı' },
          { key: 'basari', label: 'Başarı' },
          { key: 'odeme', label: 'Ödeme' },
          { key: 'belge', label: 'Belge' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '0.4rem 0.8rem', borderRadius: '20px',
              background: filter === f.key ? 'var(--color-slate-deep)' : 'transparent',
              color: filter === f.key ? 'var(--color-cream)' : 'var(--color-slate)',
              border: filter === f.key ? 'none' : '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredBildirimler.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '3rem',
          border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center',
        }}>
          <i className="fas fa-bell-slash" style={{ fontSize: '2.5rem', color: 'rgba(0,0,0,0.15)', marginBottom: '1rem' }} />
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.9rem',
            color: 'rgba(0,0,0,0.4)',
          }}>
            {filter === 'tumu' ? 'Henüz bildirim yok' : 'Bu kategoride bildirim yok'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredBildirimler.map(bildirim => {
            const renk = turRenkleri[bildirim.tur] || turRenkleri.bilgi
            return (
              <div
                key={bildirim.id}
                onClick={() => !bildirim.okundu && handleMarkAsRead(bildirim.id)}
                style={{
                  background: bildirim.okundu ? 'white' : 'rgba(240,90,40,0.03)',
                  borderRadius: '12px', padding: '1rem 1.2rem',
                  border: bildirim.okundu ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(240,90,40,0.15)',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  cursor: bildirim.okundu ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: renk.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className={renk.icon} style={{ color: renk.color, fontSize: '0.9rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600,
                      color: 'var(--color-slate-deep)',
                    }}>
                      {bildirim.baslik}
                    </span>
                    {!bildirim.okundu && (
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: 'var(--color-orange)', flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                    color: 'rgba(0,0,0,0.5)', margin: 0, lineHeight: 1.5,
                  }}>
                    {bildirim.mesaj}
                  </p>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: '0.7rem',
                    color: 'rgba(0,0,0,0.3)', marginTop: '0.5rem', display: 'block',
                  }}>
                    {new Date(bildirim.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {bildirim.link && (
                  <Link href={bildirim.link} style={{
                    color: 'var(--color-orange)', fontSize: '0.8rem',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}>
                    Görüntüle →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
