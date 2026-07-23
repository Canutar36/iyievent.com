import { createClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { isPersonel, normalizeRol } from '@/lib/roles'

/**
 * Server action / route handler için rol koruması.
 * @param {string[]} [roller] - İzin verilen roller. Boşsa herhangi bir personel yeter.
 * @returns {Promise<{ok:boolean, rol?:string, error?:string}>}
 *
 * Dev önizlemede (backend bağlı değil) yonetici olarak geçer.
 */
export async function rolGuard(roller = []) {
  if (isDevPreview()) return { ok: true, rol: 'yonetici' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const rol = normalizeRol(profile?.role)

  if (!isPersonel(rol)) return { ok: false, error: 'Yetkisiz.' }
  if (roller.length > 0 && rol !== 'yonetici' && !roller.includes(rol)) {
    return { ok: false, error: 'Bu işlem için yetkiniz yok.' }
  }
  return { ok: true, rol }
}
