import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MusteriLayoutClient from '@/components/portal/MusteriLayoutClient'

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
    <MusteriLayoutClient profile={profile}>
      {children}
    </MusteriLayoutClient>
  )
}
