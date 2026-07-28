'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

const DURUMLAR = [
  { key: 'talep', label: 'Talep', color: '#f59e0b', bg: '#fef3c7' },
  { key: 'planlama', label: 'Planlama', color: '#3b82f6', bg: '#dbeafe' },
  { key: 'onaylandi', label: 'Onaylandı', color: '#10b981', bg: '#d1fae5' },
  { key: 'tamamlandi', label: 'Tamamlandı', color: '#6b7280', bg: '#f3f4f6' },
  { key: 'iptal', label: 'İptal', color: '#ef4444', bg: '#fee2e2' },
]

export default function EtkinliklerClient({ etkinlikler: initial, demo }) {
  const [etkinlikler, setEtkinlikler] = useState(initial)
  const [filtre, setFiltre] = useState('tumu')
  const [degistiriliyor, setDegistiriliyor] = useState(null)
  const supabase = createClient()

  const filtreli = filtre === 'tumu' ? etkinlikler : etkinlikler.filter(e => e.durum === filtre)

  async function durumDegistir(id, yeniDurum) {
    setDegistiriliyor(id)
    if (demo) {
      setEtkinlikler(prev => prev.map(e => e.id === id ? { ...e, durum: yeniDurum } : e))
      toast.success('Durum güncellendi (demo)')
      setDegistiriliyor(null)
      return
    }
    const { error } = await supabase.from('etkinlikler').update({ durum: yeniDurum }).eq('id', id)
    if (error) {
      toast.error('Güncelleme başarısız')
    } else {
      setEtkinlikler(prev => prev.map(e => e.id === id ? { ...e, durum: yeniDurum } : e))
      toast.success('Durum güncellendi')
    }
    setDegistiriliyor(null)
  }

  function tarihGoster(s) {
    if (!s) return '—'
    return new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function durumBul(key) {
    return DURUMLAR.find(d => d.key === key) || DURUMLAR[0]
  }

  return (
    <div style={{ padding: '2.5rem' }}>
      {/* Başlık */}
      <div style={{ marginBottom: '1.8rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Organizasyon</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Etkinlik Talepleri</h1>
      </div>

      {/* Durum Filtreleri */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFiltre('tumu')} style={{
          padding: '0.45rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
          background: filtre === 'tumu' ? 'var(--color-slate-deep)' : '#F3F4F6',
          color: filtre === 'tumu' ? 'white' : 'var(--color-slate)',
          fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.15s',
        }}>
          Tümü ({etkinlikler.length})
        </button>
        {DURUMLAR.map(d => {
          const sayi = etkinlikler.filter(e => e.durum === d.key).length
          return (
            <button key={d.key} onClick={() => setFiltre(d.key)} style={{
              padding: '0.45rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: filtre === d.key ? d.color : '#F3F4F6',
              color: filtre === d.key ? 'white' : 'var(--color-slate)',
              fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.15s',
            }}>
              {d.label} ({sayi})
            </button>
          )
        })}
      </div>

      {/* Tablo */}
      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
              {['Etkinlik', 'Müşteri', 'Tarih', 'Misafir', 'Durum', 'İşlem'].map((h, i) => (
                <th key={i} style={{
                  textAlign: i >= 4 ? 'center' : 'left',
                  padding: '0.9rem 1.2rem',
                  fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtreli.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)', fontSize: '0.9rem' }}>
                {filtre === 'tumu' ? 'Henüz etkinlik talebi yok.' : 'Bu durumda etkinlik yok.'}
              </td></tr>
            )}
            {filtreli.map(e => {
              const d = durumBul(e.durum)
              return (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--color-cream)' }}>
                  {/* Etkinlik */}
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate-deep)' }}>
                      {e.ad || '—'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--color-slate-medium)', marginTop: '0.15rem' }}>
                      {e.tur || '—'}
                    </div>
                  </td>
                  {/* Müşteri */}
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700 }}>
                        {(e.musteri?.full_name || '?').charAt(0).toLocaleUpperCase('tr')}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', fontWeight: 500, color: 'var(--color-slate)' }}>{e.musteri?.full_name || '—'}</div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--color-slate-medium)' }}>{e.musteri?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  {/* Tarih */}
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate)' }}>
                    <div>{tarihGoster(e.tarih)}</div>
                    {e.saat && <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-medium)' }}>{e.saat}</div>}
                  </td>
                  {/* Misafir */}
                  <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate)', textAlign: 'center' }}>
                    {e.tahmini_misafir_sayisi || '—'}
                  </td>
                  {/* Durum Badge */}
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: '12px',
                      background: d.bg, color: d.color,
                      fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600,
                    }}>
                      {d.label}
                    </span>
                  </td>
                  {/* İşlem — Durum Değiştir */}
                  <td style={{ padding: '0.9rem 1.2rem', textAlign: 'center' }}>
                    <select
                      value={e.durum}
                      onChange={ev => durumDegistir(e.id, ev.target.value)}
                      disabled={degistiriliyor === e.id}
                      style={{
                        padding: '0.35rem 0.5rem', borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
                        cursor: 'pointer', background: 'white',
                        opacity: degistiriliyor === e.id ? 0.5 : 1,
                      }}
                    >
                      {DURUMLAR.map(d => (
                        <option key={d.key} value={d.key}>{d.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
