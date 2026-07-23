import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

const durumRengi = {
  talep: { bg: '#FEF3C7', text: '#D97706', label: 'Talep Alındı' },
  planlama: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Planlamada' },
  onaylandi: { bg: '#D1FAE5', text: '#059669', label: 'Onaylandı' },
  tamamlandi: { bg: '#F3F4F6', text: '#6B7280', label: 'Tamamlandı' },
  iptal: { bg: '#FEE2E2', text: '#DC2626', label: 'İptal' },
}

export default async function EtkinliklerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: etkinlikler } = await supabase
    .from('etkinlikler')
    .select('*')
    .eq('musteri_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--color-orange)', marginBottom: '0.4rem',
        }}>Hoş Geldiniz</p>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400,
          color: 'var(--color-slate)', margin: 0,
        }}>Etkinliklerim</h1>
      </div>

      {/* Boş durum */}
      {(!etkinlikler || etkinlikler.length === 0) && (
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          border: '2px dashed var(--color-cream-dark)',
          background: 'var(--color-cream-light)',
        }}>
          <i className="fas fa-calendar-star" style={{
            fontSize: '2.5rem', color: 'var(--color-orange)', opacity: 0.4, marginBottom: '1.5rem', display: 'block',
          }} />
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400,
            color: 'var(--color-slate)', marginBottom: '0.8rem',
          }}>Henüz etkinliğiniz yok</h3>
          <p style={{ color: 'var(--color-slate-medium)', marginBottom: '2rem' }}>
            iyi event ekibi sizin için bir etkinlik oluşturacak.
          </p>
          <a href="/#contact" className="btn-primary" style={{ display: 'inline-flex' }}>
            Etkinlik Talep Et
            <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }} />
          </a>
        </div>
      )}

      {/* Etkinlik Kartları */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem',
      }}>
        {etkinlikler?.map(etkinlik => {
          const durum = durumRengi[etkinlik.durum] || durumRengi.talep
          const odemeYuzdesi = etkinlik.toplam_tutar
            ? Math.round((etkinlik.odenen_tutar / etkinlik.toplam_tutar) * 100)
            : 0

          return (
            <Link key={etkinlik.id} href={`/musteri/etkinlik/${etkinlik.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                border: '1px solid var(--color-cream-dark)',
                padding: '2rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-orange)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(240,90,40,0.08)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-cream-dark)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Durum badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                  <span style={{
                    display: 'inline-block',
                    background: durum.bg, color: durum.text,
                    padding: '0.3rem 0.8rem',
                    fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>{durum.label}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '0.65rem',
                    color: 'var(--color-slate-medium)',
                    background: 'var(--color-cream)',
                    padding: '0.3rem 0.7rem',
                  }}>{etkinlik.tur}</span>
                </div>

                {/* Etkinlik adı */}
                <h2 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 500,
                  color: 'var(--color-slate)', marginBottom: '0.5rem',
                }}>{etkinlik.ad}</h2>

                {/* Tarih & Mekan */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {etkinlik.tarih && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <i className="fas fa-calendar" style={{ color: 'var(--color-orange)', fontSize: '0.8rem', width: '14px' }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate-medium)' }}>
                        {new Date(etkinlik.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {etkinlik.saat && ` — ${etkinlik.saat.slice(0, 5)}`}
                      </span>
                    </div>
                  )}
                  {etkinlik.mekan_adi && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <i className="fas fa-map-marker-alt" style={{ color: 'var(--color-orange)', fontSize: '0.8rem', width: '14px' }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate-medium)' }}>
                        {etkinlik.mekan_adi}
                      </span>
                    </div>
                  )}
                  {etkinlik.tahmini_misafir_sayisi && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <i className="fas fa-users" style={{ color: 'var(--color-orange)', fontSize: '0.8rem', width: '14px' }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--color-slate-medium)' }}>
                        {etkinlik.tahmini_misafir_sayisi} misafir
                      </span>
                    </div>
                  )}
                </div>

                {/* Ödeme progress */}
                {etkinlik.toplam_tutar > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-slate-medium)' }}>
                        Ödeme Durumu
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, color: odemeYuzdesi === 100 ? '#059669' : 'var(--color-orange)' }}>
                        %{odemeYuzdesi}
                      </span>
                    </div>
                    <div style={{ background: 'var(--color-cream)', height: '4px', width: '100%' }}>
                      <div style={{
                        height: '100%', width: `${odemeYuzdesi}%`,
                        background: odemeYuzdesi === 100 ? '#059669' : 'var(--color-orange)',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--color-slate-medium)' }}>
                        {(etkinlik.odenen_tutar || 0).toLocaleString('tr-TR')} ₺ ödendi
                      </span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--color-slate-medium)' }}>
                        {etkinlik.toplam_tutar.toLocaleString('tr-TR')} ₺ toplam
                      </span>
                    </div>
                  </div>
                )}

                {/* Arrow */}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem',
                  color: 'var(--color-orange)', fontSize: '0.85rem',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  gap: '0.5rem', alignItems: 'center',
                }}>
                  Detaylar <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
