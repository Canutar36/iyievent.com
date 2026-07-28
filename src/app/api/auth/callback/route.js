import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const isPersonel = ['satis', 'operasyon', 'muhasebe', 'yonetici'].includes(profile?.role)

        if (isPersonel) {
          const host = request.headers.get('host') || ''
          const baseDomain = host.split('.').slice(-2).join('.')
          return NextResponse.redirect(`${origin.replace(host, `yonetim.${baseDomain}`)}/yonetim`)
        } else {
          const host = request.headers.get('host') || ''
          const baseDomain = host.split('.').slice(-2).join('.')
          return NextResponse.redirect(`${origin.replace(host, `hesap.${baseDomain}`)}/musteri/etkinlikler`)
        }
      }

      return NextResponse.redirect(`${origin}/giris?error=callback_hatasi`)
    }
    console.error('Auth callback hatası:', error.message)
  }

  return NextResponse.redirect(`${origin}/giris?error=callback_hatasi`)
}
