'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { sendSozlesmeEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

/**
 * Belge yükler: dosyayı Storage'a koyar, belgeler tablosuna kaydeder.
 * FormData: dosya (File), etkinlik_id, ad, tur, aciklama, bildir (email?)
 */
export async function belgeYukle(formData) {
  const g = await rolGuard(['operasyon', 'muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }

  const etkinlikId = formData.get('etkinlik_id')
  const ad = formData.get('ad')
  const tur = formData.get('tur') || 'sozlesme'
  const aciklama = formData.get('aciklama') || null
  const dosya = formData.get('dosya')
  if (!ad || !dosya || typeof dosya === 'string') return { ok: false, error: 'Dosya ve ad zorunlu.' }

  if (isDevPreview()) {
    return { ok: true, demo: true, belge: { id: 'demo-' + Date.now(), etkinlik_id: etkinlikId, ad, tur, aciklama, durum: 'yuklendi', dosya_boyutu: dosya.size, yukleyen_rol: 'admin', created_at: new Date().toISOString() } }
  }

  const supabase = createServiceClient()
  const uzanti = (dosya.name?.split('.').pop() || 'dat').toLowerCase()
  const yol = `${etkinlikId}/${tur}_${Date.now()}.${uzanti}`
  const buffer = Buffer.from(await dosya.arrayBuffer())

  const { error: upErr } = await supabase.storage.from('belgeler').upload(yol, buffer, { contentType: dosya.type || 'application/octet-stream' })
  if (upErr) return { ok: false, error: 'Yükleme hatası: ' + upErr.message }

  const { data, error } = await supabase.from('belgeler').insert({
    etkinlik_id: etkinlikId, ad, aciklama, tur, dosya_yolu: yol, dosya_boyutu: dosya.size, dosya_turu: dosya.type,
    durum: 'yuklendi', yukleyen_rol: 'admin',
  }).select('*').single()
  if (error) return { ok: false, error: error.message }

  revalidatePath(`/yonetim/musteriler`)
  return { ok: true, belge: data }
}

export async function belgeSil(id) {
  const g = await rolGuard(['operasyon', 'muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  await supabase.from('belgeler').delete().eq('id', id)
  return { ok: true }
}

/** Müşteriye "belge/sözleşme hazır" bilgi maili gönder. */
export async function belgeHazirBildir(email, etkinlikAd, belgeAd) {
  const g = await rolGuard(['operasyon', 'muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!email) return { ok: false, error: 'Müşteri e-postası yok.' }
  if (isDevPreview()) return { ok: true, demo: true }
  try {
    await sendSozlesmeEmail({ email, etkinlikAd, belgeAd })
  } catch (e) {
    return { ok: false, error: 'Mail gönderilemedi: ' + e.message }
  }
  return { ok: true }
}
