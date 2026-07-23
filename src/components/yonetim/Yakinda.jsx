import Link from 'next/link'

export default function Yakinda({ baslik, aciklama, icon = 'fas fa-screwdriver-wrench', ozellikler = [] }) {
  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '0.3rem' }}>Yönetim</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--color-slate)', margin: 0 }}>{baslik}</h1>
      </div>

      <div style={{
        border: '2px dashed var(--color-cream-dark)', background: 'var(--color-cream-light)',
        padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '640px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 1.4rem',
          background: 'var(--color-orange-light)', color: 'var(--color-orange)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
        }}>
          <i className={icon} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.6rem' }}>Bu modül geliştiriliyor</h2>
        <p style={{ color: 'var(--color-slate-medium)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.7 }}>{aciklama}</p>

        {ozellikler.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto', maxWidth: '380px', textAlign: 'left', display: 'grid', gap: '0.6rem' }}>
            {ozellikler.map((o, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-slate-medium)' }}>
                <i className="fas fa-circle-check" style={{ color: 'var(--color-orange)', fontSize: '0.85rem' }} />
                {o}
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/yonetim" style={{
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-orange)', textDecoration: 'none',
          }}>← Kokpite dön</Link>
        </div>
      </div>
    </div>
  )
}
