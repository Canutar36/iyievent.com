import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MusteriSidebar from '@/components/portal/MusteriSidebar'

export const metadata = {
  title: 'Müşteri Paneli | iyi event',
}

export default async function MusteriLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--color-cream)',
    }}>
      <MusteriSidebar profile={profile} />
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
          .portal-main { margin-left: 0 !important; padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  )
}
