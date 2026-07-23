import { createClient } from '@/lib/supabase-server'
import { isDevPreview, DEMO_ADMIN } from '@/lib/config'
import { isPersonel } from '@/lib/roles'
import { redirect } from 'next/navigation'
import YonetimSidebar from '@/components/yonetim/YonetimSidebar'
import YonetimTopbar from '@/components/yonetim/YonetimTopbar'

export const metadata = {
  title: 'Yönetim Paneli | iyi event',
}

export default async function YonetimLayout({ children }) {
  let profile = DEMO_ADMIN

  if (!isDevPreview()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/giris?redirect=/yonetim')

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!data || !isPersonel(data.role)) redirect('/musteri/etkinlikler')
    profile = data
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-cream)' }}>
      <YonetimSidebar profile={profile} />
      <div style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="yonetim-main">
        <YonetimTopbar profile={profile} />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .yonetim-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
