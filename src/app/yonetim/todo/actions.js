'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { revalidatePath } from 'next/cache'

export async function gorevToggle(id, durum) {
  const gecerli = ['bekliyor', 'yapiliyor', 'tamam']
  if (!gecerli.includes(durum)) return { ok: false, error: 'Geçersiz durum.' }
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('gorevler').update({ durum }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/todo')
  return { ok: true }
}

export async function gorevEkle(etkinlikId, baslik, grup = 'Genel') {
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!baslik?.trim()) return { ok: false, error: 'Başlık boş olamaz.' }
  if (isDevPreview()) return { ok: true, demo: true, id: 'demo-' + Date.now() }
  const supabase = createServiceClient()
  const { count } = await supabase.from('gorevler').select('*', { count: 'exact', head: true }).eq('etkinlik_id', etkinlikId)
  const { data, error } = await supabase.from('gorevler')
    .insert({ etkinlik_id: etkinlikId, baslik, grup, kaynak: 'manuel', siralama: count || 0 }).select('*').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/todo')
  return { ok: true, gorev: data }
}

export async function gorevSil(id) {
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('gorevler').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/todo')
  return { ok: true }
}

/**
 * Bir etkinliğe görev şablonundan checklist yükler.
 * Temel kalemler (ekstra_id yok) her zaman eklenir; ekstra'ya bağlı kalemler
 * yalnızca o ekstra etkinlikte seçildiyse eklenir. "Hiçbir şey gözden kaçmaz."
 */
export async function gorevleriYukle(etkinlikId, hizmetId, secilenEkstraIds = []) {
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const { data: sablon } = await supabase.from('todo_sablonlari').select('id').eq('hizmet_id', hizmetId).eq('aktif', true).limit(1).single()
  if (!sablon) return { ok: false, error: 'Bu etkinlik türü için görev şablonu tanımlı değil.' }

  const { data: kalemler } = await supabase.from('todo_sablon_kalemleri').select('*').eq('sablon_id', sablon.id).order('siralama')
  const eklenecek = (kalemler || [])
    .filter(k => !k.ekstra_id || secilenEkstraIds.includes(k.ekstra_id))
    .map((k, i) => ({
      etkinlik_id: etkinlikId, baslik: k.baslik, grup: k.grup,
      kaynak: k.ekstra_id ? 'ekstra' : 'sablon', ekstra_id: k.ekstra_id, siralama: i,
    }))
  if (eklenecek.length === 0) return { ok: false, error: 'Şablonda kalem yok.' }

  const { error } = await supabase.from('gorevler').insert(eklenecek)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/todo')
  return { ok: true, adet: eklenecek.length }
}

export async function todoSablonKaydet(sablon) {
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true, id: sablon.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  let sablonId = sablon.id
  const kayit = { ad: sablon.ad, hizmet_id: sablon.hizmet_id || null, aktif: sablon.aktif !== false }
  if (sablonId) {
    await supabase.from('todo_sablonlari').update(kayit).eq('id', sablonId)
  } else {
    const { data, error } = await supabase.from('todo_sablonlari').insert(kayit).select('id').single()
    if (error) return { ok: false, error: error.message }
    sablonId = data.id
  }
  // Kalemleri yenile
  await supabase.from('todo_sablon_kalemleri').delete().eq('sablon_id', sablonId)
  const kalemler = (sablon.kalemler || []).map((k, i) => ({
    sablon_id: sablonId, baslik: k.baslik, grup: k.grup || 'Genel', ekstra_id: k.ekstra_id || null, siralama: i,
  }))
  if (kalemler.length) await supabase.from('todo_sablon_kalemleri').insert(kalemler)

  revalidatePath('/yonetim/todo')
  return { ok: true, id: sablonId }
}
