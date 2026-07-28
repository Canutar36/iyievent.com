import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { isDevPreview } from '@/lib/config'
import { isPersonel, isSuperAdmin, yetki, yoldanModul } from '@/lib/roles'

/**
 * Next.js 16 Proxy (eski adıyla Middleware).
 *
 * İki görevi var:
 *  1) Alt alan adı yönlendirmesi — tek kod tabanı, 3 kitle:
 *       iyievent.com          → tanıtım sitesi (kök /)
 *       hesap.iyievent.com    → müşteri portalı (/musteri)
 *       yonetim.iyievent.com  → yönetim paneli (/yonetim)
 *  2) Auth koruması — portal ve yönetim alanlarına yetkisiz erişimi engeller.
 *
 * Yerel geliştirmede (localhost, alt alan adı yok) her şey path ile çalışır:
 *   localhost:3000/            → tanıtım
 *   localhost:3000/musteri     → portal
 *   localhost:3000/yonetim     → yönetim
 * İstenirse *.localhost da desteklenir: hesap.localhost:3000, yonetim.localhost:3000
 */

// Alt alan adı → uygulama içi kök path eşlemesi
const SUBDOMAIN_BASE = {
  hesap: '/musteri',
  yonetim: '/yonetim',
}

/** Host header'ından alt alan adını çıkarır ('hesap' | 'yonetim' | null). */
function getSubdomain(host) {
  if (!host) return null
  const hostname = host.split(':')[0].toLowerCase()

  // localhost / IP → alt alan adı yok (ya da *.localhost)
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return null

  const parts = hostname.split('.')
  // hesap.localhost → ['hesap','localhost']
  // yonetim.iyievent.com → ['yonetim','iyievent','com']
  const sub = parts[0]
  if (sub === 'www') return null
  if (sub in SUBDOMAIN_BASE) return sub
  // iyievent.com / iyievent.localhost → ana site
  return null
}

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Session'ı yenile (önemli — bu satırı kaldırma)
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const host = request.headers.get('host')
  const subdomain = getSubdomain(host)

  // ---------------------------------------------------------------
  // 1) ALT ALAN ADI YÖNLENDİRMESİ
  // ---------------------------------------------------------------
  if (subdomain) {
    const base = SUBDOMAIN_BASE[subdomain]

    // Alt alan adının kökü → ilgili panelin girişine yönlendir
    if (path === '/') {
      const dest = request.nextUrl.clone()
      dest.pathname = subdomain === 'yonetim' ? '/yonetim' : '/musteri/etkinlikler'
      return NextResponse.redirect(dest)
    }

    // Bu alt alan adında olmaması gereken bölümler ana siteye ait —
    // yanlış alan adından erişilen tanıtım rotalarını kök alan adına bırakma,
    // sadece kendi namespace'i + paylaşılan rotalara izin ver.
    const paylasilan = path.startsWith('/giris') || path.startsWith('/kayit') || path.startsWith('/davet') || path.startsWith('/api') || path === '/robots.txt' || path === '/sitemap.xml'
    const kendiNamespace = path.startsWith('/musteri') || path.startsWith('/yonetim')
    if (!paylasilan && !kendiNamespace) {
      // Diğer panelin ya da tanıtımın rotasına bu alt alan adından girilmiş →
      // kendi köküne geri al.
      const dest = request.nextUrl.clone()
      dest.pathname = subdomain === 'yonetim' ? '/yonetim' : '/musteri/etkinlikler'
      return NextResponse.redirect(dest)
    }
  } else {
    // Ana domain (iyievent.com) → yonetim rotalarına erişimi engelle
    if (path.startsWith('/yonetim')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    // musteri rotalarına izin ver (iyievent.com/musteri)
  }

  // ---------------------------------------------------------------
  // 2) AUTH KORUMASI
  // ---------------------------------------------------------------

  // Dev önizleme: backend bağlı değilken panelleri girişsiz gezmeye izin ver.
  // (Production'da her zaman false — bkz. lib/config.js)
  if (isDevPreview()) {
    return supabaseResponse
  }

  // Müşteri portalı — giriş yapılmamışsa /giris'e
  if (path.startsWith('/musteri') && !user) {
    const dest = request.nextUrl.clone()
    dest.pathname = '/giris'
    dest.searchParams.set('redirect', path)
    return NextResponse.redirect(dest)
  }

  // Yönetim paneli — giriş yapılmamışsa /giris'e
  if (path.startsWith('/yonetim') && !user) {
    const dest = request.nextUrl.clone()
    dest.pathname = '/giris'
    dest.searchParams.set('redirect', path)
    return NextResponse.redirect(dest)
  }

  // Yönetim yetkisi — personel rolleri + rol bazlı sayfa erişimi
  if (path.startsWith('/yonetim') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Personel değilse yönetime giremez
    if (!profile || !isPersonel(profile.role)) {
      const dest = request.nextUrl.clone()
      if (subdomain === 'yonetim') {
        const hostname = host.split(':')[0]
        const baseDomain = hostname.split('.').slice(-2).join('.')
        return NextResponse.redirect(`${request.nextUrl.protocol}//hesap.${baseDomain}/musteri/etkinlikler`)
      }
      dest.pathname = '/musteri/etkinlikler'
      return NextResponse.redirect(dest)
    }

    // Rol bazlı sayfa erişimi (Ayarlar yalnızca sistem sahibine)
    const modul = yoldanModul(path)
    const izin = modul === 'ayarlar' ? isSuperAdmin(user.email) : yetki(profile.role, modul)
    if (!izin) {
      const dest = request.nextUrl.clone()
      dest.pathname = '/yonetim' // yetkisiz modül → kokpite geri al
      return NextResponse.redirect(dest)
    }
  }

  // Giriş yapmış kullanıcıyı /giris'ten uygun panele yönlendir
  if (path === '/giris' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isPersonelRole = isPersonel(profile?.role)
    const dest = request.nextUrl.clone()

    if (subdomain === 'hesap' || subdomain === null) {
      dest.pathname = isPersonelRole ? '/yonetim' : '/musteri/etkinlikler'
      if (subdomain === 'hesap' && isPersonelRole) {
        const hostname = host.split(':')[0]
        const baseDomain = hostname.split('.').slice(-2).join('.')
        return NextResponse.redirect(`${request.nextUrl.protocol}//yonetim.${baseDomain}/yonetim`)
      }
    } else if (subdomain === 'yonetim') {
      if (!isPersonelRole) {
        const hostname = host.split(':')[0]
        const baseDomain = hostname.split('.').slice(-2).join('.')
        return NextResponse.redirect(`${request.nextUrl.protocol}//hesap.${baseDomain}/musteri/etkinlikler`)
      }
      dest.pathname = '/yonetim'
    }

    return NextResponse.redirect(dest)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
}
