'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Monogram } from '@/components/Logo'
import { yetki, isSuperAdmin, yoldanModul } from '@/lib/roles'

// Modül grupları — şirketin uçtan uca operasyonu tek panelde.
// hazir=false olanlar "yakında" placeholder sayfa gösterir.
const navGroups = [
  {
    baslik: null,
    items: [
      { href: '/yonetim', icon: 'fas fa-gauge-high', label: 'Kokpit', exact: true, hazir: true },
    ],
  },
  {
    baslik: 'Satış Hattı',
    items: [
      { href: '/yonetim/teklif/yeni', icon: 'fas fa-wand-magic-sparkles', label: 'Teklif Oluştur', hazir: true },
      { href: '/yonetim/teklifler', icon: 'fas fa-file-invoice', label: 'Teklifler', hazir: true },
      { href: '/yonetim/sozlesmeler', icon: 'fas fa-file-signature', label: 'Sözleşmeler', hazir: true },
      { href: '/yonetim/katalog', icon: 'fas fa-book-open', label: 'Hizmet Kataloğu', hazir: true },
    ],
  },
  {
    baslik: 'CRM',
    items: [
      { href: '/yonetim/leadler', icon: 'fas fa-bullseye', label: 'Lead Havuzu', hazir: true },
      { href: '/yonetim/telemarketing', icon: 'fas fa-headset', label: 'Telemarketing', hazir: true },
      { href: '/yonetim/talepler', icon: 'fas fa-inbox', label: 'Talepler', hazir: true },
      { href: '/yonetim/musteriler', icon: 'fas fa-user-group', label: 'Müşteriler', hazir: true },
    ],
  },
  {
    baslik: 'Operasyon',
    items: [
      { href: '/yonetim/etkinlikler', icon: 'fas fa-calendar-check', label: 'Etkinlikler', hazir: true },
      { href: '/yonetim/todo', icon: 'fas fa-list-check', label: 'Yapılacaklar', hazir: true },
      { href: '/yonetim/takvim', icon: 'fas fa-calendar-days', label: 'Takvim', hazir: true },
      { href: '/yonetim/kaynaklar', icon: 'fas fa-boxes-stacked', label: 'Kaynaklar', hazir: true },
    ],
  },
  {
    baslik: 'Finans',
    items: [
      { href: '/yonetim/muhasebe', icon: 'fas fa-scale-balanced', label: 'Ön Muhasebe', hazir: true },
      { href: '/yonetim/faturalar', icon: 'fas fa-file-invoice-dollar', label: 'Faturalar', hazir: true },
      { href: '/yonetim/odemeler', icon: 'fas fa-credit-card', label: 'Tahsilatlar', hazir: true },
      { href: '/yonetim/raporlar', icon: 'fas fa-chart-line', label: 'Raporlar', hazir: true },
    ],
  },
  {
    baslik: 'Pazarlama',
    items: [
      { href: '/yonetim/pazarlama', icon: 'fas fa-bullhorn', label: 'Dijital Pazarlama', hazir: true },
    ],
  },
  {
    baslik: 'Sistem',
    items: [
      { href: '/yonetim/sablonlar', icon: 'fas fa-swatchbook', label: 'Şablonlar', hazir: true },
      { href: '/yonetim/ayarlar', icon: 'fas fa-gear', label: 'Ayarlar', hazir: true },
    ],
  },
]

export default function YonetimSidebar({ profile }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  // Rol bazlı modül filtresi + Ayarlar yalnızca sistem sahibine
  const rol = profile?.role
  const superAdmin = isSuperAdmin(profile?.email)
  const gruplar = navGroups
    .map(g => ({
      ...g,
      items: g.items.filter(item => {
        if (item.href === '/yonetim/ayarlar') return superAdmin
        return yetki(rol, yoldanModul(item.href))
      }),
    }))
    .filter(g => g.items.length > 0)

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: '260px', zIndex: 100,
      background: 'var(--color-slate-deep)',
      borderRight: '1px solid rgba(246,243,234,0.06)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Logo + panel etiketi */}
      <div style={{ padding: '1.6rem 1.5rem 1.3rem', borderBottom: '1px solid rgba(246,243,234,0.06)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <Link href="/yonetim" style={{ display: 'flex', alignItems: 'center' }}>
          <Monogram height={38} />
        </Link>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-cream)' }}>Yönetim</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-orange)' }}>Kontrol Merkezi</div>
        </div>
      </div>

      {/* Profil */}
      <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid rgba(246,243,234,0.06)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--color-orange-light)', border: '2px solid rgba(240,90,40,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-orange)', fontSize: '0.85rem',
        }}>
          <i className="fas fa-user-shield" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.full_name || 'Yönetici'}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'rgba(246,243,234,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.email}
          </div>
        </div>
      </div>

      {/* Navigasyon */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {gruplar.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '0.8rem' }}>
            {group.baslik && (
              <div style={{
                padding: '0.5rem 1.5rem 0.4rem',
                fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(246,243,234,0.25)',
              }}>{group.baslik}</div>
            )}
            {group.items.map(item => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.62rem 1.5rem',
                  fontFamily: 'var(--font-display)', fontSize: '0.76rem', fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: isActive ? 'var(--color-orange)' : 'rgba(246,243,234,0.55)',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(240,90,40,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--color-orange)' : '2px solid transparent',
                  transition: 'all 0.18s ease',
                }}>
                  <i className={item.icon} style={{ width: '16px', textAlign: 'center', fontSize: '0.82rem' }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {!item.hazir && (
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: '0.55rem', fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'rgba(246,243,234,0.3)', border: '1px solid rgba(246,243,234,0.15)',
                      padding: '0.1rem 0.35rem', borderRadius: '3px',
                    }}>yakında</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Alt aksiyonlar */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(246,243,234,0.06)' }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', marginBottom: '0.3rem',
          fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600,
          letterSpacing: '0.06em', color: 'rgba(246,243,234,0.35)', textDecoration: 'none',
        }}>
          <i className="fas fa-globe" style={{ width: '16px', textAlign: 'center', fontSize: '0.78rem' }} />
          Tanıtım Sitesi
        </Link>
        <button onClick={signOut} style={{
          display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600,
          letterSpacing: '0.06em', color: 'rgba(246,243,234,0.35)',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(246,243,234,0.35)'}
        >
          <i className="fas fa-arrow-right-from-bracket" style={{ width: '16px', textAlign: 'center', fontSize: '0.78rem' }} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
