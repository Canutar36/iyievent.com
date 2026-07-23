/**
 * Ortam yapılandırma yardımcıları.
 */

/** Supabase gerçek bir projeyle yapılandırılmış mı? (dummy değilse) */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(url) && !url.includes('dummy')
}

/**
 * Geliştirme önizleme modu: backend henüz bağlı değilken (dummy Supabase)
 * ve production DIŞINDA panelleri gerçek giriş olmadan görüntülemeye izin verir.
 * Production'da NODE_ENV her zaman 'production' olduğundan bu KESİNLİKLE false döner.
 */
export function isDevPreview() {
  return process.env.NODE_ENV !== 'production' && !isSupabaseConfigured()
}

/** Dev önizlemede kullanılan sahte yönetici profili (süper-admin). */
export const DEMO_ADMIN = {
  id: 'demo-admin',
  email: 'bilgi@iyievent.com',
  full_name: 'Demo Yönetici',
  role: 'yonetici',
}
