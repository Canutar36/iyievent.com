'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'

const navItems = [
  { href: '/musteri/etkinlikler', icon: 'fas fa-calendar-alt', label: 'Etkinliklerim' },
  { href: '/musteri/gorseller', icon: 'fas fa-images', label: 'Görsellerim' },
  { href: '/musteri/teklifler', icon: 'fas fa-file-invoice-dollar', label: 'Teklifler' },
  { href: '/musteri/sozlesmeler', icon: 'fas fa-file-contract', label: 'Sözleşmeler' },
  { href: '/musteri/faturalar', icon: 'fas fa-receipt', label: 'Faturalar' },
  { href: '/musteri/bildirimler', icon: 'fas fa-bell', label: 'Bildirimler' },
  { href: '/musteri/profil', icon: 'fas fa-user-circle', label: 'Profilim' },
]

export default function MusteriSidebar({ profile, isOpen, onClose }) {
  const pathname = usePathname()
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
        padding: '2rem 0',
        overflowY: 'auto',
        transform: isOpen ? 'translateX(0)' : undefined,
      }} className="sidebar-panel">
        {/* Logo */}
        <div style={{ padding: '0 1.5rem 2rem', borderBottom: '1px solid rgba(246,243,234,0.06)' }}>
          <a href="https://iyievent.com">
            <Logo height={32} />
          </a>
        </div>

        {/* Profile */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(246,243,234,0.06)' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: profile?.avatar_url ? 'transparent' : 'var(--color-orange-light)',
            border: '2px solid rgba(240,90,40,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-orange)', fontSize: '1rem',
            marginBottom: '0.8rem', overflow: 'hidden',
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="fas fa-user" />
            )}
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600,
            color: 'var(--color-cream)', marginBottom: '0.2rem',
          }}>
            {profile?.full_name || 'Müşteri'}
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
            color: 'rgba(246,243,234,0.4)',
          }}>
            {profile?.email}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1.5rem 0' }}>
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.8rem 1.5rem',
                fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
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

        {/* Bottom actions */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(246,243,234,0.06)' }}>
          <a href="https://iyievent.com" style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.6rem 0', marginBottom: '0.5rem',
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(246,243,234,0.35)', textDecoration: 'none',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(246,243,234,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(246,243,234,0.35)'}
          >
            <i className="fas fa-home" style={{ width: '16px', textAlign: 'center', fontSize: '0.8rem' }} />
            Ana Sayfa
          </a>
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.6rem 0', width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(246,243,234,0.35)',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(246,243,234,0.35)'}
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
