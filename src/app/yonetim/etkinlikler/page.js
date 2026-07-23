import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'

export const metadata = { title: 'Etkinlikler | Yönetim' }

const DEMO = [
  { id: '1', ad: 'Bosphorus Ethereal Gala', tur: 'Kurumsal Gala', tarih: '2026-08-05', durum: 'onaylandi', mekan_adi: 'Çırağan Palace', toplam_tutar: 850000, odenen_tutar: 600000, musteri: 'Arda Holding' },
  { id: '2', ad: 'Olive Grove Wedding', tur: 'Düğün', tarih: '2026-08-14', durum: 'planlama', mekan_adi: 'Toskana Bağ Evi', toplam_tutar: 750000, odenen_tutar: 250000, musteri: 'Melis Sabancı' },
  { id: '3', ad: 'Midnight Aegean Soiree', tur: 'Özel Davet', tarih: '2026-08-22', durum: 'onaylandi', mekan_adi: 'Mega Yat', toplam_tutar: 300000, odenen_tutar: 300000, musteri: 'Zeynep Koç' },
  { id: '4', ad: 'Luxury Brand Launch', tur: 'Kurumsal Lansman', tarih: '2026-09-10', durum: 'planlama', mekan_adi: 'Tersane İstanbul', toplam_tutar: 600000, odenen_tutar: 0, musteri: 'Selin Aksoy' },
  { id: '5', ad: 'Centennial Corporate Gala', tur: 'Kurumsal Gala', tarih: '2026-05-18', durum: 'tamamlandi', mekan_adi: 'Feriye Palace', toplam_tutar: 900000, odenen_tutar: 900000, musteri: 'Arda Holding' },
]

const durumRozet = {
  talep: { bg: '#FEF3C7', text: '#D97706', label: 'Talep' },
  planlama: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Planlama' },
  onaylandi: { bg: '#D1FAE5', text: '#059669', label: 'Onaylandı' },
  tamamlandi: { bg: '#F3F4F6', text: '#6B7280', label: 'Tamamlandı' },
  iptal: { bg: '#FEE2E2', text: '#DC2626', label: 'İptal' },
}

async function getEtkinlikler() {
  if (isDevPreview()) return DEMO
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('etkinlikler')
      .select('id, ad, tur, tarih, durum, mekan_adi, toplam_tutar, odenen_tutar, profiles(full_name)')
      .order('tarih', { ascending: false })
    return (data || []).map(e => ({ ...e, musteri: e.profiles?.full_name || '—' }))
  } catch {
    return []
  }
}

function tarih(s) {
  return s ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
}
function tl(n) {
  return Number(n || 0).toLocaleString('tr-TR') + ' ₺'
}

export default async function EtkinliklerPage() {
  const etkinlikler = await getEtkinlikler()

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '1.8rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Operasyon</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Etkinlikler</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.3rem' }}>
        {etkinlikler.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-slate-medium)', border: '2px dashed var(--color-cream-dark)', gridColumn: '1 / -1' }}>Henüz etkinlik yok.</div>
        )}
        {etkinlikler.map(e => {
          const r = durumRozet[e.durum] || durumRozet.planlama
          const yuzde = e.toplam_tutar ? Math.round((Number(e.odenen_tutar || 0) / Number(e.toplam_tutar)) * 100) : 0
          return (
            <div key={e.id} style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.8rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 500, color: 'var(--color-slate)', margin: '0 0 0.2rem' }}>{e.ad}</h2>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}>{e.musteri} · {e.tur}</div>
                </div>
                <span style={{ flexShrink: 0, background: r.bg, color: r.text, padding: '0.25rem 0.7rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.label}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate-medium)' }}>
                  <i className="fas fa-calendar" style={{ color: 'var(--color-orange)', fontSize: '0.78rem', width: '14px' }} /> {tarih(e.tarih)}
                </div>
                {e.mekan_adi && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate-medium)' }}>
                    <i className="fas fa-location-dot" style={{ color: 'var(--color-orange)', fontSize: '0.78rem', width: '14px' }} /> {e.mekan_adi}
                  </div>
                )}
              </div>

              {e.toplam_tutar > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--color-slate-medium)' }}>Tahsilat</span>
                    <span style={{ color: yuzde === 100 ? '#059669' : 'var(--color-orange)' }}>%{yuzde}</span>
                  </div>
                  <div style={{ background: 'var(--color-cream)', height: '4px', width: '100%' }}>
                    <div style={{ height: '100%', width: `${yuzde}%`, background: yuzde === 100 ? '#059669' : 'var(--color-orange)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontFamily: 'var(--font-sans)', fontSize: '0.76rem', color: 'var(--color-slate-medium)' }}>
                    <span>{tl(e.odenen_tutar)}</span>
                    <span>{tl(e.toplam_tutar)}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
