'use client'

import { Toaster } from 'react-hot-toast'

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-slate-deep)',
          color: 'var(--color-cream)',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.85rem',
          borderRadius: '8px',
          border: '1px solid rgba(246,243,234,0.1)',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: 'var(--color-slate-deep)' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: 'var(--color-slate-deep)' },
        },
      }}
    />
  )
}
