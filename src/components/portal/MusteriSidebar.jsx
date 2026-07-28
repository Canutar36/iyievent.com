'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'

const navItems = [
  { href: '/musteri/etkinlikler', icon: 'fas fa-calendar-alt', label: 'Etkinliklerim' },
  { href: '/musteri/gorseller', icon: 'fas fa-images', label: 'Görsellerim' },
  { href: '/musteri/teklifler', icon: 'fas fa-file-invoice-dollar', label: 'Teklifler' },
  { href: '/musteri/sozlesmeler', icon: 'fas fa-file-contract', label: 'Sözleşmeler' },
  { href: '/musteri/faturalar', icon: 'fas fa-receipt', label: 'Faturalar' },
  { href: '/musteri/bildirimler', icon: 'fas fa-bell', label: 'Bildirimler' },
]

export default function MusteriSidebar({ profile, isOpen, onClose }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.5)',
          }}
          className="sidebar-overlay"
        />
      )}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: '260px', zIndex: 100,
        background: 'var(--color-slate-deep)',
        borderRight: '1px solid rgba(246,243,234,0.06)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }} className="sidebar-panel">

        {/* Logo Section */}
        <div style={{
          padding: '1.5rem 1.5rem 1.2rem',
          borderBottom: '1px solid rgba(246,243,234,0.08)',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            background: 'rgba(246,243,234,0.06)',
            borderRadius: '12px',
            padding: '0.8rem 1.5rem',
            border: '1px solid rgba(246,243,234,0.08)',
          }}>
            <Logo height={36} style={{ filter: 'brightness(1.2)' }} />
          </div>
        </div>

        {/* Profile - Clickable */}
        <div
          onClick={() => { router.push('/musteri/profil'); onClose?.() }}
          style={{
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid rgba(246,243,234,0.08)',
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(246,243,234,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: profile?.avatar_url ? 'transparent' : 'var(--color-orange-light)',
            border: '2px solid rgba(240,90,40,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-orange)', fontSize: '0.9rem',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="fas fa-user" />
            )}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--color-cream)', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {profile?.full_name || 'Müşteri'}
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.7rem',
              color: 'rgba(246,243,234,0.4)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {profile?.email}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.8rem 0' }}>
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.75rem 1.5rem',
                fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: isActive ? 'var(--color-orange)' : 'rgba(246,243,234,0.5)',
                textDecoration: 'none',
                background: isActive ? 'rgba(240,90,40,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--color-orange)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}>
                <i className={item.icon} style={{ width: '16px', textAlign: 'center' }} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section - Always at bottom */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(246,243,234,0.08)',
          display: 'flex', flexDirection: 'column', gap: '0.3rem',
        }}>
          <Link href="https://iyievent.com" style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.65rem 0.5rem', borderRadius: '6px',
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(246,243,234,0.45)', textDecoration: 'none',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(246,243,234,0.8)'; e.currentTarget.style.background = 'rgba(246,243,234,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(246,243,234,0.45)'; e.currentTarget.style.background = 'transparent' }}
          >
            <i className="fas fa-home" style={{ width: '16px', textAlign: 'center', fontSize: '0.8rem' }} />
            Ana Sayfa
          </Link>
          <Link href="/musteri/profil" onClick={onClose} style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.65rem 0.5rem', borderRadius: '6px',
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: pathname === '/musteri/profil' ? 'var(--color-orange)' : 'rgba(246,243,234,0.45)',
            textDecoration: 'none',
            background: pathname === '/musteri/profil' ? 'rgba(240,90,40,0.08)' : 'transparent',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { if (pathname !== '/musteri/profil') { e.currentTarget.style.color = 'rgba(246,243,234,0.8)'; e.currentTarget.style.background = 'rgba(246,243,234,0.04)' } }}
            onMouseLeave={e => { if (pathname !== '/musteri/profil') { e.currentTarget.style.color = 'rgba(246,243,234,0.45)'; e.currentTarget.style.background = 'transparent' } }}
          >
            <i className="fas fa-user-circle" style={{ width: '16px', textAlign: 'center', fontSize: '0.8rem' }} />
            Profilim
          </Link>
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.65rem 0.5rem', width: '100%', borderRadius: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(246,243,234,0.45)',
            transition: 'all 0.15s', textAlign: 'left',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = 'rgba(220,38,38,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(246,243,234,0.45)'; e.currentTarget.style.background = 'transparent' }}
          >
            <i className="fas fa-sign-out-alt" style={{ width: '16px', textAlign: 'center', fontSize: '0.8rem' }} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-panel {
            transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            transition: transform 0.3s ease;
          }
          .sidebar-overlay {
            display: ${isOpen ? 'block' : 'none'} !important;
          }
        }
      `}</style>
    </>
  )
}
