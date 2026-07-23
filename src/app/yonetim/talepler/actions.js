'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { revalidatePath } from 'next/cache'

/** Bir talebin durumunu günceller. */
export async function talepDurumGuncelle(id, durum) {
  const gecerli = ['yeni', 'inceleniyor', 'etkinlige_donustu', 'reddedildi']
  if (!gecerli.includes(durum)) return { ok: false, error: 'Geçersiz durum.' }
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const { error } = await supabase.from('talepler').update({ durum }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/yonetim/talepler')
  revalidatePath('/yonetim')
  return { ok: true }
}

/**
 * Talebi bir etkinliğe dönüştürür.
 * Not: Etkinlik bir müşteri profiline (musteri_id) bağlıdır. Talep sahibinin
 * henüz hesabı olmayabilir; bu ilk sürümde etkinlik oluşturmak için müşteri
 * hesabının mevcut olması beklenir. Yoksa admin önce müşteriyi davet eder.
 */
export async function talebiEtkinligeDonustur(id) {
  const g = await rolGuard(['satis'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()

  const { data: talep, error: talepErr } = await supabase.from('talepler').select('*').eq('id', id).single()
  if (talepErr || !talep) return { ok: false, error: 'Talep bulunamadı.' }

  // Talep sahibinin profilini e-posta ile eşle
  const { data: profil } = await supabase.from('profiles').select('id').eq('email', talep.email).single()
  if (!profil) {
    return { ok: false, error: 'Bu talep için henüz müşteri hesabı yok. Önce müşteriyi davet edin.' }
  }

  const { data: etkinlik, error: etkErr } = await supabase.from('etkinlikler').insert({
    musteri_id: profil.id,
    ad: `${talep.ad_soyad} — ${talep.etkinlik_turu || 'Etkinlik'}`,
    tur: talep.etkinlik_turu || 'Ozel Davet',
    durum: 'planlama',
    notlar: talep.mesaj || null,
  }).select().single()
  if (etkErr) return { ok: false, error: etkErr.message }

  await supabase.from('talepler').update({ durum: 'etkinlige_donustu', etkinlik_id: etkinlik.id }).eq('id', id)

  revalidatePath('/yonetim/talepler')
  revalidatePath('/yonetim')
  return { ok: true, etkinlikId: etkinlik.id }
}
