'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function EtkinlikTablar({ etkinlikId }) {
  const pathname = usePathname()

  const tabs = [
    { href: `/musteri/etkinlik/${etkinlikId}`, label: 'Genel Bakış', exact: true },
    { href: `/musteri/etkinlik/${etkinlikId}/davetiyeler`, label: 'Davetiye & Misafirler' },
    { href: `/musteri/etkinlik/${etkinlikId}/belgeler`, label: 'Belgeler & Sözleşme' },
    { href: `/musteri/etkinlik/${etkinlikId}/odeme`, label: 'Ödemeler & Finans' },
    { href: `/musteri/etkinlik/${etkinlikId}/galeri`, label: 'Anı Galerisi' },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      borderBottom: '1px solid var(--color-cream-dark)',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
    }}>
      {tabs.map(tab => {
        const isActive = tab.exact 
          ? pathname === tab.href 
          : pathname.startsWith(tab.href) && pathname !== `/musteri/etkinlik/${etkinlikId}/`

        return (
          <Link key={tab.href} href={tab.href} style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '1rem 1.5rem',
            textDecoration: 'none',
            color: isActive ? 'var(--color-orange)' : 'var(--color-slate-medium)',
            borderBottom: isActive ? '2px solid var(--color-orange)' : '2px solid transparent',
            marginBottom: '-1px',
            transition: 'all 0.25s ease',
          }}>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
