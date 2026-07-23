import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * GET /api/auth/callback
 * Supabase e-posta doğrulama, şifre sıfırlama ve OAuth callback'lerini işler.
 * Gelen `code`'u session'a çevirir (cookie'leri SSR client set eder), sonra yönlendirir.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/musteri/etkinlikler'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Auth callback hatası:', error.message)
  }

  return NextResponse.redirect(`${origin}/giris?error=callback_hatasi`)
}
