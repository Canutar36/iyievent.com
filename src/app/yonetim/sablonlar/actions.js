'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { revalidatePath } from 'next/cache'

export async function sablonKaydet(sablon) {
  const g = await rolGuard() // sadece yönetici (rolGuard boş → yonetici)
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true, id: sablon.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = {
    tur: sablon.tur || 'email',
    anahtar: sablon.anahtar || null,
    ad: sablon.ad,
    konu: sablon.konu || null,
    icerik: sablon.icerik || null,
    aktif: sablon.aktif !== false,
    updated_at: new Date().toISOString(),
  }
  if (sablon.id && !String(sablon.id).startsWith('seed-')) {
    const { error } = await supabase.from('sablonlar').update(kayit).eq('id', sablon.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/yonetim/sablonlar')
    return { ok: true, id: sablon.id }
  }
  const { data, error } = await supabase.from('sablonlar').upsert(kayit, { onConflict: 'anahtar' }).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/sablonlar')
  return { ok: true, id: data.id }
}
