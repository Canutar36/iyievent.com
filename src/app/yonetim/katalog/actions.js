'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { revalidatePath } from 'next/cache'

// ---------- HİZMETLER ----------

export async function hizmetKaydet(hizmet) {
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true, id: hizmet.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = {
    ad: hizmet.ad,
    kategori: hizmet.kategori,
    aciklama: hizmet.aciklama || null,
    fiyatlandirma_tipi: hizmet.fiyatlandirma_tipi,
    birim_fiyat: Number(hizmet.birim_fiyat) || 0,
    min_kisi: Number(hizmet.min_kisi) || 0,
    aktif: hizmet.aktif !== false,
    siralama: Number(hizmet.siralama) || 0,
    updated_at: new Date().toISOString(),
  }

  let hizmetId = hizmet.id
  if (hizmetId) {
    const { error } = await supabase.from('hizmetler').update(kayit).eq('id', hizmetId)
    if (error) return { ok: false, error: error.message }
  } else {
    const { data, error } = await supabase.from('hizmetler').insert(kayit).select('id').single()
    if (error) return { ok: false, error: error.message }
    hizmetId = data.id
  }

  // Kademeler (kademeli fiyatlandırma)
  if (hizmet.fiyatlandirma_tipi === 'kademeli') {
    await supabase.from('hizmet_kademeleri').delete().eq('hizmet_id', hizmetId)
    const kademeler = (hizmet.kademeler || []).map((k, i) => ({
      hizmet_id: hizmetId,
      min_kisi: Number(k.min_kisi) || 0,
      max_kisi: k.max_kisi === '' || k.max_kisi == null ? null : Number(k.max_kisi),
      birim_fiyat: Number(k.birim_fiyat) || 0,
      siralama: i,
    }))
    if (kademeler.length) await supabase.from('hizmet_kademeleri').insert(kademeler)
  }

  revalidatePath('/yonetim/katalog')
  return { ok: true, id: hizmetId }
}

export async function hizmetSil(id) {
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const { error } = await supabase.from('hizmetler').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/katalog')
  return { ok: true }
}

// ---------- EKSTRALAR ----------

export async function ekstraKaydet(ekstra) {
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true, id: ekstra.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = {
    ad: ekstra.ad,
    grup: ekstra.grup || 'Genel',
    aciklama: ekstra.aciklama || null,
    birim: ekstra.birim,
    birim_fiyat: Number(ekstra.birim_fiyat) || 0,
    aktif: ekstra.aktif !== false,
    siralama: Number(ekstra.siralama) || 0,
  }

  if (ekstra.id) {
    const { error } = await supabase.from('ekstralar').update(kayit).eq('id', ekstra.id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await supabase.from('ekstralar').insert(kayit)
    if (error) return { ok: false, error: error.message }
  }

  revalidatePath('/yonetim/katalog')
  return { ok: true }
}

export async function ekstraSil(id) {
  const g = await rolGuard(['operasyon'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }

  const supabase = createServiceClient()
  const { error } = await supabase.from('ekstralar').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/katalog')
  return { ok: true }
}
