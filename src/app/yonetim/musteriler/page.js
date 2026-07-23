import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import Link from 'next/link'

export const metadata = { title: 'Müşteriler | Yönetim' }

const DEMO = [
  { id: '1', full_name: 'Melis Sabancı', email: 'melis@example.com', phone: '0532 111 22 33', created_at: '2026-06-01T10:00:00Z', etkinlik_sayisi: 1 },
  { id: '2', full_name: 'Selin Aksoy', email: 'selin@example.com', phone: '0535 888 99 00', created_at: '2026-05-12T10:00:00Z', etkinlik_sayisi: 2 },
  { id: '3', full_name: 'Zeynep Koç', email: 'zeynep.koc@example.com', phone: '0533 777 88 99', created_at: '2026-04-20T10:00:00Z', etkinlik_sayisi: 1 },
]

async function getMusteriler() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const { data: profiles } = await supabase
      .from('profiles').select('id, full_name, email, phone, created_at')
      .eq('role', 'musteri').order('created_at', { ascending: false })
    const { data: etkinlikler } = await supabase.from('etkinlikler').select('musteri_id')
    const sayac = {}
    for (const e of etkinlikler || []) sayac[e.musteri_id] = (sayac[e.musteri_id] || 0) + 1
    return (profiles || []).map(p => ({ ...p, etkinlik_sayisi: sayac[p.id] || 0 }))
  } catch {
    return []
  }
}

function tarih(s) {
  return s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
}

export default async function MusterilerPage() {
  const musteriler = await getMusteriler()

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '1.8rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>CRM</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Müşteriler</h1>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
              {['Müşteri', 'Telefon', 'Kayıt Tarihi', 'Etkinlik'].map((h, i) => (
                <th key={i} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '0.9rem 1.2rem', fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {musteriler.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)', fontSize: '0.9rem' }}>Henüz müşteri yok.</td></tr>
            )}
            {musteriler.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--color-cream)' }} className="musteri-satir">
                <td style={{ padding: '0.9rem 1.2rem' }}>
                  <Link href={`/yonetim/musteriler/${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700 }}>
                      {(m.full_name || '?').charAt(0).toLocaleUpperCase('tr')}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-slate)' }}>{m.full_name || 'İsimsiz'}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.76rem', color: 'var(--color-slate-medium)' }}>{m.email}</div>
                    </div>
                  </Link>
                </td>
                <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: 'var(--color-slate-medium)' }}>{m.phone || '—'}</td>
                <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate-medium)' }}>{tarih(m.created_at)}</td>
                <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>
                  <Link href={`/yonetim/musteriler/${m.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-slate)', background: 'var(--color-cream)', padding: '0.3rem 0.7rem' }}>{m.etkinlik_sayisi} etkinlik</span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '0.72rem', color: 'var(--color-orange)' }} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
