'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { superAdminGuard } from '@/lib/guard'
import { PERSONEL_ROLLER, isSuperAdmin } from '@/lib/roles'
import { logAktivite } from '@/lib/aktivite'
import { revalidatePath } from 'next/cache'

/** Bir personelin rolünü değiştirir. YALNIZCA sistem sahibi (süper-admin). */
export async function rolGuncelle(profileId, yeniRol) {
  const izinli = [...PERSONEL_ROLLER, 'musteri']
  if (!izinli.includes(yeniRol)) return { ok: false, error: 'Geçersiz rol.' }
  const g = await superAdminGuard()
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  // Sistem sahibinin rolü değiştirilemez
  const { data: hedef } = await supabase.from('profiles').select('email').eq('id', profileId).single()
  if (hedef && isSuperAdmin(hedef.email)) return { ok: false, error: 'Sistem sahibinin rolü değiştirilemez.' }

  const { error } = await supabase.from('profiles').update({ role: yeniRol, updated_at: new Date().toISOString() }).eq('id', profileId)
  if (error) return { ok: false, error: error.message }
  await logAktivite({ eylem: 'rol_degistirildi', ozet: `Personel rolü → ${yeniRol}`, hedefTur: 'profil', hedefId: profileId })
  revalidatePath('/yonetim/ayarlar')
  return { ok: true }
}

/** Yeni personel (yönetim kullanıcısı) oluşturur. YALNIZCA süper-admin. */
export async function personelEkle({ ad, email, sifre, rol }) {
  const g = await superAdminGuard()
  if (!g.ok) return { ok: false, error: g.error }
  if (!ad?.trim() || !email?.trim() || !sifre || !rol) return { ok: false, error: 'Ad, e-posta, şifre ve rol zorunlu.' }
  if (sifre.length < 8) return { ok: false, error: 'Şifre en az 8 karakter olmalı.' }
  if (!PERSONEL_ROLLER.includes(rol)) return { ok: false, error: 'Geçersiz rol.' }
  if (isDevPreview()) return { ok: true, demo: true, personel: { id: 'demo-' + Date.now(), full_name: ad, email, role: rol } }

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password: sifre,
    email_confirm: true, // yönetici oluşturduğu için doğrudan onaylı
    user_metadata: { full_name: ad },
  })
  if (error) return { ok: false, error: error.message.includes('already') ? 'Bu e-posta zaten kayıtlı.' : error.message }

  // Trigger 'musteri' profili oluşturur → rolü ata
  await supabase.from('profiles').update({ role: rol, full_name: ad }).eq('id', data.user.id)
  await logAktivite({ eylem: 'personel_eklendi', ozet: `${ad} (${rol}) — ${email}`, hedefTur: 'profil', hedefId: data.user.id })
  revalidatePath('/yonetim/ayarlar')
  return { ok: true, personel: { id: data.user.id, full_name: ad, email: email.trim(), role: rol } }
}

/** Bir personeli siler. YALNIZCA süper-admin. Sistem sahibi silinemez. */
export async function personelSil(profileId) {
  const g = await superAdminGuard()
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const { data: hedef } = await supabase.from('profiles').select('email').eq('id', profileId).single()
  if (hedef && isSuperAdmin(hedef.email)) return { ok: false, error: 'Sistem sahibi silinemez.' }

  const { error } = await supabase.auth.admin.deleteUser(profileId) // profiles cascade siler
  if (error) return { ok: false, error: error.message }
  await logAktivite({ eylem: 'personel_silindi', ozet: `Personel silindi: ${hedef?.email || profileId}`, hedefTur: 'profil', hedefId: profileId })
  revalidatePath('/yonetim/ayarlar')
  return { ok: true }
}
