import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import EtkinlikTablar from '@/components/portal/EtkinlikTablar'

export default async function EtkinlikLayout({ children, params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/giris')

  const { data: etkinlik, error } = await supabase
    .from('etkinlikler')
    .select('*')
    .eq('id', id)
    .eq('musteri_id', user.id)
    .single()

  if (error || !etkinlik) notFound()

  return (
    <div>
      {/* Etkinlik Başlık */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--color-orange)', marginBottom: '0.4rem',
        }}>{etkinlik.tur}</p>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400,
          color: 'var(--color-slate)', margin: 0,
        }}>{etkinlik.ad}</h1>
        {etkinlik.tarih && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.88rem',
            color: 'var(--color-slate-medium)', marginTop: '0.4rem',
          }}>
            <i className="fas fa-calendar" style={{ marginRight: '0.4rem', color: 'var(--color-orange)' }} />
            {new Date(etkinlik.tarih).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {etkinlik.saat && ` — ${etkinlik.saat.slice(0, 5)}`}
            {etkinlik.mekan_adi && (
              <> &nbsp;·&nbsp; <i className="fas fa-map-marker-alt" style={{ marginRight: '0.3rem' }} />{etkinlik.mekan_adi}</>
            )}
          </p>
        )}
      </div>

      {/* Sekmeler */}
      <EtkinlikTablar etkinlikId={id} />

      {/* İçerik */}
      <div style={{ marginTop: '2rem' }}>
        {children}
      </div>
    </div>
  )
}
