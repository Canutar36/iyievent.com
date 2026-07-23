'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { revalidatePath } from 'next/cache'

/** Tahsilat ekle → kasa girişi + cari bakiye düşür. */
export async function tahsilatEkle(t) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!t.tutar || !t.cari_id) return { ok: false, error: 'Cari ve tutar zorunlu.' }
  if (isDevPreview()) return { ok: true, demo: true, id: 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const tutar = Number(t.tutar) || 0
  const { data, error } = await supabase.from('tahsilatlar').insert({
    cari_id: t.cari_id, fatura_id: t.fatura_id || null, etkinlik_id: t.etkinlik_id || null,
    tutar, tarih: t.tarih || new Date().toISOString().slice(0, 10), yontem: t.yontem || 'havale',
    kasa_id: t.kasa_id || null, aciklama: t.aciklama || null,
  }).select('*').single()
  if (error) return { ok: false, error: error.message }

  // Kasa girişi
  if (t.kasa_id) {
    await supabase.from('kasa_hareketleri').insert({ kasa_id: t.kasa_id, tur: 'giris', tutar, tarih: data.tarih, kategori: 'Tahsilat', aciklama: t.aciklama || 'Tahsilat', ref_tur: 'tahsilat', ref_id: data.id })
    const { data: kasa } = await supabase.from('kasa_hesaplari').select('bakiye').eq('id', t.kasa_id).single()
    await supabase.from('kasa_hesaplari').update({ bakiye: (Number(kasa?.bakiye) || 0) + tutar }).eq('id', t.kasa_id)
  }
  // Cari bakiye düşür (alacak azalır)
  const { data: cari } = await supabase.from('cariler').select('bakiye').eq('id', t.cari_id).single()
  await supabase.from('cariler').update({ bakiye: (Number(cari?.bakiye) || 0) - tutar }).eq('id', t.cari_id)

  revalidatePath('/yonetim/odemeler')
  return { ok: true, tahsilat: data }
}

export async function tahsilatSil(id) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('tahsilatlar').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/odemeler')
  return { ok: true }
}
