import { createClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { isPersonel, normalizeRol, isSuperAdmin } from '@/lib/roles'

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

/**
 * Yalnızca SİSTEM SAHİBİNE (süper-admin — bilgi@iyievent.com) açık işlemler
 * için koruma. Kullanıcı/rol yönetimi bunu kullanır.
 * Dev önizlemede süper-admin olarak geçer.
 */
export async function superAdminGuard() {
  if (isDevPreview()) return { ok: true, superAdmin: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı.' }
  if (!isSuperAdmin(user.email)) {
    return { ok: false, error: 'Bu işlem yalnızca sistem sahibine açıktır.' }
  }
  return { ok: true, superAdmin: true, email: user.email }
}
