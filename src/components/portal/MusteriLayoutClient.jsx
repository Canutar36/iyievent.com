'use client'

import { useState } from 'react'
import MusteriSidebar from '@/components/portal/MusteriSidebar'
import ToasterProvider from '@/components/portal/ToasterProvider'

export default function MusteriLayoutClient({ profile, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--color-cream)',
    }}>
      <ToasterProvider />
      <MusteriSidebar profile={profile} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hamburger button - mobile only */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="hamburger-btn"
        style={{
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 90,
          width: '44px', height: '44px', borderRadius: '8px',
          background: 'var(--color-slate-deep)',
          border: '1px solid rgba(246,243,234,0.1)',
          color: 'var(--color-cream)',
          display: 'none', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '1.1rem',
        }}
      >
        <i className="fas fa-bars" />
      </button>

      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '2.5rem',
        minHeight: '100vh',
      }} className="portal-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .portal-main { margin-left: 0 !important; padding: 1.5rem !important; padding-top: 4rem !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
