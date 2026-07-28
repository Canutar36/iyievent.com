'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { superAdminGuard } from '@/lib/guard'
import { logAktivite } from '@/lib/aktivite'
import { revalidatePath } from 'next/cache'

/** Yeni müşteri hesabı oluşturur. YALNIZCA süper-admin veya yonetici. */
export async function musteriEkle({ ad, email, sifre }) {
  const g = await superAdminGuard()
  if (!g.ok) return { ok: false, error: g.error }
  if (!ad?.trim() || !email?.trim() || !sifre) return { ok: false, error: 'Ad, e-posta ve şifre zorunlu.' }
  if (sifre.length < 6) return { ok: false, error: 'Şifre en az 6 karakter olmalı.' }
  if (isDevPreview()) return { ok: true, demo: true, musteri: { id: 'demo-' + Date.now(), full_name: ad, email, role: 'musteri' } }

  const supabase = createServiceClient()
  const { data, error } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password: sifre,
    email_confirm: true,
    user_metadata: { full_name: ad },
  })
  if (error) return { ok: false, error: error.message.includes('already') ? 'Bu e-posta zaten kayıtlı.' : error.message }

  await supabase.from('profiles').update({ role: 'musteri', full_name: ad }).eq('id', data.user.id)
  await logAktivite({ eylem: 'musteri_eklendi', ozet: `${ad} — ${email}`, hedefTur: 'profil', hedefId: data.user.id })
  revalidatePath('/yonetim/musteriler')
  return { ok: true, musteri: { id: data.user.id, full_name: ad, email: email.trim(), role: 'musteri' } }
}
