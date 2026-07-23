'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { PERSONEL_ROLLER } from '@/lib/roles'
import { logAktivite } from '@/lib/aktivite'
import { revalidatePath } from 'next/cache'

/** Bir personelin rolünü değiştirir. Yalnızca yönetici. */
export async function rolGuncelle(profileId, yeniRol) {
  const izinli = [...PERSONEL_ROLLER, 'musteri']
  if (!izinli.includes(yeniRol)) return { ok: false, error: 'Geçersiz rol.' }
  const g = await rolGuard() // boş → yalnızca yonetici
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const { error } = await supabase.from('profiles').update({ role: yeniRol, updated_at: new Date().toISOString() }).eq('id', profileId)
  if (error) return { ok: false, error: error.message }
  await logAktivite({ eylem: 'rol_degistirildi', ozet: `Personel rolü → ${yeniRol}`, hedefTur: 'profil', hedefId: profileId })
  revalidatePath('/yonetim/ayarlar')
  return { ok: true }
}
