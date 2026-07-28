'use client'

import { useState } from 'react'
import YeniMusteriForm from './YeniMusteriForm'

export default function YeniMusteriButonu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.78rem' }}>
        <i className="fas fa-plus" style={{ fontSize: '0.7rem' }} />
        Yeni Müşteri
      </button>
      {open && <YeniMusteriForm onClose={() => setOpen(false)} />}
    </>
  )
}
