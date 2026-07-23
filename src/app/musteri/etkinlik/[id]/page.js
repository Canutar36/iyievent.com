import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function EtkinlikDetayPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  // Etkinlik bilgilerini al
  const { data: etkinlik } = await supabase
    .from('etkinlikler')
    .select('*')
    .eq('id', id)
    .single()

  // Davetli sayıları
  const { count: toplamMisafir } = await supabase
    .from('misafirler')
    .select('*', { count: 'exact', head: true })
    .eq('etkinlik_id', id)

  const { count: katilacaklar } = await supabase
    .from('misafirler')
    .select('*', { count: 'exact', head: true })
    .eq('etkinlik_id', id)
    .eq('yanit', 'katilacak')

  // Belgeler
  const { data: belgeler } = await supabase
    .from('belgeler')
    .select('*')
    .eq('etkinlik_id', id)
    .limit(3)

  // Ödemeler
  const { data: odemeler } = await supabase
    .from('odemeler')
    .select('*')
    .eq('etkinlik_id', id)
    .order('created_at', { ascending: true })

  // Temel planlama adımları
  const adimlar = [
    { title: 'Talep ve Konsept Belirleme', desc: 'İletişim formundan aldığımız detaylara göre konsepti belirledik.', done: true },
    { title: 'Sözleşme ve Kapora', desc: 'Hizmet sözleşmesinin onaylanması ve kaporanın yatırılması.', done: etkinlik.durum !== 'talep' },
    { title: 'Detaylı Planlama', desc: 'Mekan tasarımı, catering, müzik ve davetiye detaylarının netleşmesi.', done: etkinlik.durum === 'onaylandi' || etkinlik.durum === 'tamamlandi' },
    { title: 'Kusursuz Organizasyon', desc: 'Büyük gün! Ekibimizin tüm süreci yerinde yönetmesi.', done: etkinlik.durum === 'tamamlandi' },
  ]

  const summaryCardStyle = {
    background: '#fff',
    border: '1px solid var(--color-cream-dark)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '180px',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="details-grid">
      {/* Sol Sütun: Durum ve Planlama */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Hızlı Bilgiler */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
        }} className="summary-cards">
          {/* Davetliler */}
          <div style={summaryCardStyle}>
            <div>
              <div style={{ color: 'var(--color-orange)', fontSize: '1.2rem', marginBottom: '0.8rem' }}><i className="fas fa-envelope-open-text" /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.4rem' }}>Davetli Durumu</h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>
                {katilacaklar} / {toplamMisafir || 0}
              </p>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>Katılacağını bildirenler</span>
            </div>
            <Link href={`/musteri/etkinlik/${id}/davetiyeler`} style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-orange)', textDecoration: 'none', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Yönet <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }} />
            </Link>
          </div>

          {/* Bütçe / Ödeme */}
          <div style={summaryCardStyle}>
            <div>
              <div style={{ color: 'var(--color-orange)', fontSize: '1.2rem', marginBottom: '0.8rem' }}><i className="fas fa-wallet" /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.4rem' }}>Ödemeler</h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>
                {etkinlik.odenen_tutar?.toLocaleString('tr-TR') || 0} ₺
              </p>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>
                {etkinlik.toplam_tutar ? `${(etkinlik.toplam_tutar - (etkinlik.odenen_tutar || 0)).toLocaleString('tr-TR')} ₺ kalan` : 'Planlama aşamasında'}
              </span>
            </div>
            <Link href={`/musteri/etkinlik/${id}/odeme`} style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-orange)', textDecoration: 'none', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Finansal Durum <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }} />
            </Link>
          </div>

          {/* Sözleşmeler */}
          <div style={summaryCardStyle}>
            <div>
              <div style={{ color: 'var(--color-orange)', fontSize: '1.2rem', marginBottom: '0.8rem' }}><i className="fas fa-file-contract" /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate-medium)', marginBottom: '0.4rem' }}>Belgeler</h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>
                {belgeler?.length || 0} Belge
              </p>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-medium)' }}>Sözleşme ve imza belgeleri</span>
            </div>
            <Link href={`/musteri/etkinlik/${id}/belgeler`} style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-orange)', textDecoration: 'none', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Tüm Belgeler <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }} />
            </Link>
          </div>
        </div>

        {/* Planlama Çizelgesi */}
        <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-slate)', marginBottom: '2rem' }}>Organizasyon Yol Haritası</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            {adimlar.map((adim, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                {/* Sol çizgi ve nokta */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: adim.done ? 'var(--color-orange)' : 'var(--color-cream-dark)',
                    border: `4px solid ${adim.done ? 'var(--color-orange-light)' : 'var(--color-cream)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.7rem', zIndex: 2,
                  }}>
                    {adim.done && <i className="fas fa-check" />}
                  </div>
                  {i < adimlar.length - 1 && (
                    <div style={{
                      width: '2px', flex: 1, minHeight: '30px',
                      background: adimlar[i + 1].done ? 'var(--color-orange)' : 'var(--color-cream-dark)',
                      zIndex: 1, margin: '0.3rem 0',
                    }} />
                  )}
                </div>
                {/* Metin */}
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 500,
                    color: adim.done ? 'var(--color-slate)' : 'var(--color-slate-medium)',
                    margin: '0 0 0.4rem',
                  }}>{adim.title}</h3>
                  <p style={{
                    fontSize: '0.9rem', color: 'var(--color-slate-medium)', lineHeight: 1.5,
                    margin: 0,
                  }}>{adim.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ Sütun: Organizatör ve Notlar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Concierge İletişim */}
        <div style={{ background: 'var(--color-slate-deep)', border: '1px solid rgba(246,243,234,0.06)', padding: '2rem', color: 'var(--color-cream)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.5rem', display: 'block' }}>Kişisel Danışmanınız</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--color-cream)', marginBottom: '1.5rem' }}>Deniz Yılmaz</h3>
          <p style={{ fontSize: '0.88rem', color: 'rgba(246,243,234,0.6)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Etkinliğinizin tüm tasarım ve koordinasyon aşamalarında size rehberlik etmek için yanınızdayım.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <a href="tel:02129939939" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--color-cream)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseEnter={e => e.target.style.color = 'var(--color-orange)'} onMouseLeave={e => e.target.style.color = 'var(--color-cream)'}>
              <i className="fas fa-phone" style={{ color: 'var(--color-orange)' }} />
              0212 993 99 39
            </a>
            <a href="mailto:bilgi@iyievent.com" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--color-cream)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseEnter={e => e.target.style.color = 'var(--color-orange)'} onMouseLeave={e => e.target.style.color = 'var(--color-cream)'}>
              <i className="fas fa-envelope" style={{ color: 'var(--color-orange)' }} />
              deniz@iyievent.com
            </a>
          </div>
        </div>

        {/* Notlar */}
        {etkinlik.notlar && (
          <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 500, color: 'var(--color-slate)', marginBottom: '1rem' }}>Operasyon Notları</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-medium)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
              {etkinlik.notlar}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .details-grid { grid-template-columns: 1fr !important; }
          .summary-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
