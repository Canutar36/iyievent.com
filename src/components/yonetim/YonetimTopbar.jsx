'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Dev/demo veriler — gerçek backend bağlanınca sunucudan gelecek
const DEMO_TODO = [
  { id: 't1', baslik: 'Çırağan Gala — sahne kurulumu teyidi', etkinlik: 'Bosphorus Ethereal Gala', son: 'Bugün' },
  { id: 't2', baslik: 'Olive Grove — catering menü onayı', etkinlik: 'Olive Grove Wedding', son: 'Bugün' },
  { id: 't3', baslik: 'Dondurma arabası tedariki', etkinlik: 'Midnight Aegean Soiree', son: 'Yarın' },
]
const DEMO_RANDEVU = [
  { id: 'r1', baslik: 'Melis Sabancı — yüz yüze görüşme', saat: '14:00', yer: 'Nişantaşı Ofis' },
  { id: 'r2', baslik: 'Arda Holding — teklif sunumu', saat: '16:30', yer: 'Online' },
]
const DEMO_BILDIRIM = [
  { id: 'b1', baslik: 'Yeni talep: Deniz Yılmaz', tur: 'bilgi' },
  { id: 'b2', baslik: 'Ödeme alındı: Midnight Aegean 300.000₺', tur: 'odeme' },
]

function Popover({ acik, onKapat, children, genislik = 320 }) {
  if (!acik) return null
  return (
    <>
      <div onClick={onKapat} style={{ position: 'fixed', inset: 0, zIndex: 190 }} />
      <div style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: genislik, maxWidth: '90vw',
        background: '#fff', border: '1px solid var(--color-cream-dark)',
        boxShadow: '0 12px 40px rgba(20,26,27,0.15)', zIndex: 191, overflow: 'hidden',
      }}>
        {children}
      </div>
    </>
  )
}

function IkonButon({ ikon, aktif, onClick, rozet, baslik }) {
  return (
    <button onClick={onClick} title={baslik} style={{
      position: 'relative', width: '40px', height: '40px', borderRadius: '10px',
      background: aktif ? 'var(--color-orange-light)' : 'transparent',
      border: '1px solid', borderColor: aktif ? 'rgba(240,90,40,0.25)' : 'var(--color-cream-dark)',
      color: aktif ? 'var(--color-orange)' : 'var(--color-slate-medium)',
      cursor: 'pointer', fontSize: '0.95rem', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
    }}>
      <i className={ikon} />
      {rozet > 0 && (
        <span style={{
          position: 'absolute', top: '-4px', right: '-4px', minWidth: '17px', height: '17px',
          background: 'var(--color-orange)', color: '#fff', borderRadius: '9px',
          fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
        }}>{rozet}</span>
      )}
    </button>
  )
}

function PopBaslik({ children, link, linkLabel }) {
  return (
    <div style={{ padding: '0.9rem 1.1rem', borderBottom: '1px solid var(--color-cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-slate)' }}>{children}</span>
      {link && <Link href={link} style={{ fontFamily: 'var(--font-display)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-orange)', textDecoration: 'none' }}>{linkLabel} →</Link>}
    </div>
  )
}

export default function YonetimTopbar({ profile }) {
  const [acik, setAcik] = useState(null) // 'todo' | 'takvim' | 'bildirim' | null
  const router = useRouter()
  const [arama, setArama] = useState('')

  const rolEtiket = {
    yonetici: 'Yönetici', satis: 'Satış', operasyon: 'Operasyon', muhasebe: 'Muhasebe', admin: 'Yönetici',
  }[profile?.role] || 'Personel'

  function toggle(k) { setAcik(a => a === k ? null : k) }

  function aramaSubmit(e) {
    e.preventDefault()
    // İleride global arama sayfasına yönlenecek; şimdilik talepler filtresi
    if (arama.trim()) router.push(`/yonetim/talepler`)
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 90,
      height: '64px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-cream-dark)',
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.6rem',
    }}>
      {/* Global arama */}
      <form onSubmit={aramaSubmit} style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
        <i className="fas fa-magnifying-glass" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-medium)', fontSize: '0.8rem' }} />
        <input
          value={arama} onChange={e => setArama(e.target.value)}
          placeholder="Müşteri, teklif, etkinlik ara…"
          style={{
            width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.86rem',
            padding: '0.6rem 0.9rem 0.6rem 2.3rem', color: 'var(--color-slate)',
            background: 'var(--color-cream-light)', border: '1px solid var(--color-cream-dark)',
            borderRadius: '10px', outline: 'none',
          }}
        />
      </form>

      <div style={{ flex: 1 }} />

      {/* Yeni Teklif */}
      <Link href="/yonetim/teklif/yeni" className="btn-primary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.72rem', borderRadius: '10px' }}>
        <i className="fas fa-plus" style={{ fontSize: '0.7rem' }} /> Yeni Teklif
      </Link>

      {/* To-Do */}
      <div style={{ position: 'relative' }}>
        <IkonButon ikon="fas fa-list-check" baslik="Yapılacaklar" aktif={acik === 'todo'} rozet={DEMO_TODO.length} onClick={() => toggle('todo')} />
        <Popover acik={acik === 'todo'} onKapat={() => setAcik(null)}>
          <PopBaslik link="/yonetim/todo" linkLabel="Tümü">Bugünün Görevleri</PopBaslik>
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {DEMO_TODO.map(t => (
              <div key={t.id} style={{ padding: '0.8rem 1.1rem', borderBottom: '1px solid var(--color-cream)', display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
                <i className="far fa-square" style={{ color: 'var(--color-orange)', marginTop: '0.2rem', fontSize: '0.9rem' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate)', fontWeight: 500 }}>{t.baslik}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--color-slate-medium)' }}>{t.etkinlik} · {t.son}</div>
                </div>
              </div>
            ))}
          </div>
        </Popover>
      </div>

      {/* Takvim */}
      <div style={{ position: 'relative' }}>
        <IkonButon ikon="fas fa-calendar-day" baslik="Takvim / Randevular" aktif={acik === 'takvim'} rozet={DEMO_RANDEVU.length} onClick={() => toggle('takvim')} />
        <Popover acik={acik === 'takvim'} onKapat={() => setAcik(null)}>
          <PopBaslik link="/yonetim/takvim" linkLabel="Takvim">Bugünün Randevuları</PopBaslik>
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {DEMO_RANDEVU.map(r => (
              <div key={r.id} style={{ padding: '0.8rem 1.1rem', borderBottom: '1px solid var(--color-cream)', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-orange)', flexShrink: 0 }}>{r.saat}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', color: 'var(--color-slate)', fontWeight: 500 }}>{r.baslik}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--color-slate-medium)' }}>{r.yer}</div>
                </div>
              </div>
            ))}
          </div>
        </Popover>
      </div>

      {/* Bildirimler */}
      <div style={{ position: 'relative' }}>
        <IkonButon ikon="fas fa-bell" baslik="Bildirimler" aktif={acik === 'bildirim'} rozet={DEMO_BILDIRIM.length} onClick={() => toggle('bildirim')} />
        <Popover acik={acik === 'bildirim'} onKapat={() => setAcik(null)}>
          <PopBaslik>Bildirimler</PopBaslik>
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {DEMO_BILDIRIM.map(b => (
              <div key={b.id} style={{ padding: '0.8rem 1.1rem', borderBottom: '1px solid var(--color-cream)', display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  <i className={b.tur === 'odeme' ? 'fas fa-wallet' : 'fas fa-circle-info'} />
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--color-slate)' }}>{b.baslik}</div>
              </div>
            ))}
          </div>
        </Popover>
      </div>

      {/* Rol etiketi */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.6rem', borderLeft: '1px solid var(--color-cream-dark)' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-slate)', color: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700 }}>
          {(profile?.full_name || 'Y').charAt(0).toLocaleUpperCase('tr')}
        </div>
        <div style={{ lineHeight: 1.2 }} className="topbar-rol">
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-slate)' }}>{profile?.full_name || 'Yönetici'}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-orange)' }}>{rolEtiket}</div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .topbar-rol { display: none; }
        }
      `}</style>
    </header>
  )
}
