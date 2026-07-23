import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import Link from 'next/link'

// Backend bağlı değilken kokpiti dolu göstermek için demo veriler
const DEMO = {
  yeniTalep: 4,
  aktifEtkinlik: 7,
  ayCiro: 685000,
  bekleyenOdeme: 240000,
  sonTalepler: [
    { id: '1', ad_soyad: 'Melis Sabancı', etkinlik_turu: 'Bespoke Düğün', butce: '750.000₺+', created_at: '2026-07-21T10:00:00Z', durum: 'yeni' },
    { id: '2', ad_soyad: 'Arda Holding', etkinlik_turu: 'Kurumsal Gala', butce: '1.000.000₺+', created_at: '2026-07-20T14:30:00Z', durum: 'yeni' },
    { id: '3', ad_soyad: 'Zeynep Koç', etkinlik_turu: 'Özel Davet', butce: '300.000₺', created_at: '2026-07-19T09:15:00Z', durum: 'inceleniyor' },
    { id: '4', ad_soyad: 'Deniz Yılmaz', etkinlik_turu: 'Destinasyon', butce: '500.000₺', created_at: '2026-07-18T16:00:00Z', durum: 'yeni' },
  ],
  yaklasanEtkinlikler: [
    { id: '1', ad: 'Bosphorus Ethereal Gala', tur: 'Kurumsal Gala', tarih: '2026-08-05', durum: 'onaylandi' },
    { id: '2', ad: 'Olive Grove Wedding', tur: 'Düğün', tarih: '2026-08-14', durum: 'planlama' },
    { id: '3', ad: 'Midnight Aegean Soiree', tur: 'Özel Davet', tarih: '2026-08-22', durum: 'onaylandi' },
  ],
}

const durumRozet = {
  yeni: { bg: '#FEF3C7', text: '#D97706', label: 'Yeni' },
  inceleniyor: { bg: '#DBEAFE', text: '#1D4ED8', label: 'İnceleniyor' },
  etkinlige_donustu: { bg: '#D1FAE5', text: '#059669', label: 'Dönüştü' },
  reddedildi: { bg: '#FEE2E2', text: '#DC2626', label: 'Reddedildi' },
  talep: { bg: '#FEF3C7', text: '#D97706', label: 'Talep' },
  planlama: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Planlama' },
  onaylandi: { bg: '#D1FAE5', text: '#059669', label: 'Onaylandı' },
  tamamlandi: { bg: '#F3F4F6', text: '#6B7280', label: 'Tamamlandı' },
  iptal: { bg: '#FEE2E2', text: '#DC2626', label: 'İptal' },
}

async function getDashboardData() {
  if (isDevPreview()) return DEMO

  try {
    const supabase = createServiceClient()
    const [talepler, etkinlikler, sonTalepler] = await Promise.all([
      supabase.from('talepler').select('id, durum'),
      supabase.from('etkinlikler').select('id, ad, tur, tarih, durum, toplam_tutar, odenen_tutar'),
      supabase.from('talepler').select('*').order('created_at', { ascending: false }).limit(5),
    ])

    const tList = talepler.data || []
    const eList = etkinlikler.data || []

    const bugun = new Date().toISOString().slice(0, 10)
    const yaklasan = eList
      .filter(e => e.tarih && e.tarih >= bugun && e.durum !== 'iptal' && e.durum !== 'tamamlandi')
      .sort((a, b) => a.tarih.localeCompare(b.tarih))
      .slice(0, 5)

    return {
      yeniTalep: tList.filter(t => t.durum === 'yeni').length,
      aktifEtkinlik: eList.filter(e => ['planlama', 'onaylandi'].includes(e.durum)).length,
      ayCiro: eList.reduce((s, e) => s + Number(e.odenen_tutar || 0), 0),
      bekleyenOdeme: eList.reduce((s, e) => s + Math.max(0, Number(e.toplam_tutar || 0) - Number(e.odenen_tutar || 0)), 0),
      sonTalepler: sonTalepler.data || [],
      yaklasanEtkinlikler: yaklasan,
    }
  } catch {
    return { yeniTalep: 0, aktifEtkinlik: 0, ayCiro: 0, bekleyenOdeme: 0, sonTalepler: [], yaklasanEtkinlikler: [] }
  }
}

function tl(n) {
  return Number(n || 0).toLocaleString('tr-TR') + ' ₺'
}

function StatCard({ icon, label, value, accent, href, alt }) {
  const inner = (
    <div style={{
      background: '#fff', border: '1px solid var(--color-cream-dark)',
      padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '0.9rem',
      height: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: accent + '18', color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.05rem',
        }}>
          <i className={icon} />
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-slate)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginTop: '0.5rem' }}>{label}</div>
        {alt && <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-slate-medium)', marginTop: '0.2rem' }}>{alt}</div>}
      </div>
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

export default async function YonetimKokpit() {
  const d = await getDashboardData()

  return (
    <div style={{ padding: '2.5rem' }}>
      {isDevPreview() && (
        <div style={{
          background: 'rgba(240,90,40,0.08)', border: '1px solid rgba(240,90,40,0.25)',
          color: 'var(--color-orange-dark)', padding: '0.7rem 1.1rem', marginBottom: '1.8rem',
          fontFamily: 'var(--font-sans)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <i className="fas fa-flask" />
          Geliştirme önizlemesi — Supabase bağlı değil, örnek verilerle gösteriliyor.
        </div>
      )}

      {/* Başlık */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Kontrol Merkezi</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>Kokpit</h1>
      </div>

      {/* İstatistik kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
        <StatCard icon="fas fa-inbox" label="Yeni Talep" value={d.yeniTalep} accent="#D97706" href="/yonetim/talepler" alt="Bekleyen görüşme" />
        <StatCard icon="fas fa-calendar-check" label="Aktif Etkinlik" value={d.aktifEtkinlik} accent="#1D4ED8" href="/yonetim/etkinlikler" alt="Planlama & onaylı" />
        <StatCard icon="fas fa-sack-dollar" label="Tahsil Edilen" value={tl(d.ayCiro)} accent="#059669" alt="Toplam ödenen" />
        <StatCard icon="fas fa-hourglass-half" label="Bekleyen Ödeme" value={tl(d.bekleyenOdeme)} accent="#F05A28" alt="Tahsil edilecek" />
      </div>

      {/* İki sütun: son talepler + yaklaşan etkinlikler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Son talepler */}
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>Son Talepler</h2>
            <Link href="/yonetim/talepler" style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-orange)', textDecoration: 'none' }}>Tümü →</Link>
          </div>
          <div>
            {d.sonTalepler.length === 0 && (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--color-slate-medium)', fontSize: '0.88rem' }}>Henüz talep yok.</div>
            )}
            {d.sonTalepler.map(t => {
              const r = durumRozet[t.durum] || durumRozet.yeni
              return (
                <div key={t.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-slate)' }}>{t.ad_soyad}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--color-slate-medium)' }}>{t.etkinlik_turu || '—'}{t.butce ? ` · ${t.butce}` : ''}</div>
                  </div>
                  <span style={{ flexShrink: 0, background: r.bg, color: r.text, padding: '0.25rem 0.7rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Yaklaşan etkinlikler */}
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
          <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--color-slate)', margin: 0 }}>Yaklaşan Etkinlikler</h2>
            <Link href="/yonetim/etkinlikler" style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-orange)', textDecoration: 'none' }}>Tümü →</Link>
          </div>
          <div>
            {d.yaklasanEtkinlikler.length === 0 && (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--color-slate-medium)', fontSize: '0.88rem' }}>Yaklaşan etkinlik yok.</div>
            )}
            {d.yaklasanEtkinlikler.map(e => {
              const r = durumRozet[e.durum] || durumRozet.planlama
              return (
                <div key={e.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-slate)' }}>{e.ad}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--color-slate-medium)' }}>
                      {e.tur} · {e.tarih ? new Date(e.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : '—'}
                    </div>
                  </div>
                  <span style={{ flexShrink: 0, background: r.bg, color: r.text, padding: '0.25rem 0.7rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
