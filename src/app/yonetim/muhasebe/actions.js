'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'
import { rolGuard } from '@/lib/guard'
import { revalidatePath } from 'next/cache'

// ---------- CARİ ----------
export async function cariKaydet(cari) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!cari.unvan?.trim()) return { ok: false, error: 'Ünvan zorunlu.' }
  if (isDevPreview()) return { ok: true, demo: true, id: cari.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = {
    unvan: cari.unvan, tip: cari.tip || 'musteri',
    vergi_no: cari.vergi_no || null, vergi_dairesi: cari.vergi_dairesi || null,
    telefon: cari.telefon || null, email: cari.email || null, adres: cari.adres || null,
  }
  if (cari.id) {
    const { error } = await supabase.from('cariler').update(kayit).eq('id', cari.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/yonetim/muhasebe'); return { ok: true, id: cari.id }
  }
  const { data, error } = await supabase.from('cariler').insert(kayit).select('id').single()
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/muhasebe'); return { ok: true, id: data.id }
}

export async function cariSil(id) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('cariler').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/muhasebe'); return { ok: true }
}

// ---------- KASA HAREKETİ ----------
export async function kasaHareketEkle(h) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!h.kasa_id || !h.tutar) return { ok: false, error: 'Kasa ve tutar zorunlu.' }
  if (isDevPreview()) return { ok: true, demo: true, id: 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const tutar = Number(h.tutar) || 0
  const { data, error } = await supabase.from('kasa_hareketleri').insert({
    kasa_id: h.kasa_id, tur: h.tur, tutar, tarih: h.tarih || new Date().toISOString().slice(0, 10),
    kategori: h.kategori || 'Manuel', aciklama: h.aciklama || null, ref_tur: 'manuel',
  }).select('*').single()
  if (error) return { ok: false, error: error.message }

  // Kasa bakiyesini güncelle
  const { data: kasa } = await supabase.from('kasa_hesaplari').select('bakiye').eq('id', h.kasa_id).single()
  const yeni = (Number(kasa?.bakiye) || 0) + (h.tur === 'giris' ? tutar : -tutar)
  await supabase.from('kasa_hesaplari').update({ bakiye: yeni }).eq('id', h.kasa_id)

  revalidatePath('/yonetim/muhasebe'); return { ok: true, hareket: data }
}

// ---------- GİDER ----------
export async function giderKaydet(gider) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (!gider.tutar) return { ok: false, error: 'Tutar zorunlu.' }
  if (isDevPreview()) return { ok: true, demo: true, id: gider.id || 'demo-' + Date.now() }

  const supabase = createServiceClient()
  const kayit = {
    etkinlik_id: gider.etkinlik_id || null, tedarikci_id: gider.tedarikci_id || null,
    kategori: gider.kategori || 'Genel', aciklama: gider.aciklama || null,
    tutar: Number(gider.tutar) || 0, tarih: gider.tarih || new Date().toISOString().slice(0, 10),
    kasa_id: gider.kasa_id || null, durum: gider.durum || 'bekliyor',
  }
  let giderId = gider.id
  if (giderId) {
    await supabase.from('giderler').update(kayit).eq('id', giderId)
  } else {
    const { data, error } = await supabase.from('giderler').insert(kayit).select('id').single()
    if (error) return { ok: false, error: error.message }
    giderId = data.id
  }
  // Ödendi + kasa seçiliyse kasa çıkışı
  if (kayit.durum === 'odendi' && kayit.kasa_id) {
    await supabase.from('kasa_hareketleri').insert({ kasa_id: kayit.kasa_id, tur: 'cikis', tutar: kayit.tutar, tarih: kayit.tarih, kategori: 'Gider', aciklama: kayit.aciklama, ref_tur: 'gider', ref_id: giderId })
    const { data: kasa } = await supabase.from('kasa_hesaplari').select('bakiye').eq('id', kayit.kasa_id).single()
    await supabase.from('kasa_hesaplari').update({ bakiye: (Number(kasa?.bakiye) || 0) - kayit.tutar }).eq('id', kayit.kasa_id)
  }
  revalidatePath('/yonetim/muhasebe'); return { ok: true, id: giderId }
}

export async function giderSil(id) {
  const g = await rolGuard(['muhasebe'])
  if (!g.ok) return { ok: false, error: g.error }
  if (isDevPreview()) return { ok: true, demo: true }
  const supabase = createServiceClient()
  const { error } = await supabase.from('giderler').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/yonetim/muhasebe'); return { ok: true }
}
